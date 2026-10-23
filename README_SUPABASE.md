# 손말잇기 회원 인증

## 로컬 실행

```sh
cd frontend
npm ci
npm run dev
```

`frontend/.env.local`에 프로젝트 URL과 **publishable** 키를 설정합니다.
`.env.example`을 참고하세요. 관리자/secret/service_role 키를 VITE_ 환경변수에 넣지 마세요.

## 가입 및 로그인

- 회원가입: 이름(1~50자), 아이디(영문·숫자·밑줄 4~20자), 비밀번호(8~128자), 비밀번호 확인.
- 아이디는 앞뒤 공백을 제거하고 소문자로 저장하며 대소문자를 구분하지 않습니다.
- 가입 요청은 Supabase Edge Function `username-signup`으로 보냅니다.
- 서버는 입력값 검증과 DB 기반 요청 횟수 제한 후 Supabase Auth 관리자 API로 계정을 생성합니다.
- Auth 내부 식별자는 `아이디@accounts.sonmalitgi.invalid`입니다. 실제 이메일이 아니며 발송하지 않습니다.
- 내부 식별자 계정만 서버에서 확인 처리하며, 프로젝트 전체의 **Confirm email 설정은 유지**합니다.
- 비밀번호는 Supabase Auth가 해시로 관리합니다. `member_profiles`에는 이름, 아이디, 회원 UUID, 생성일만 저장합니다.
- Auth 사용자 생성 트리거가 같은 트랜잭션에서 프로필을 저장합니다. 저장 실패 시 가입도 실패합니다.
- 프로필은 RLS로 본인만 조회할 수 있고 클라이언트 직접 생성·수정은 허용하지 않습니다.
- 이름/아이디 메타데이터는 표시용이며 권한 판단은 Auth UUID로만 합니다.
- 로그인 유지와 토큰 갱신은 공식 Supabase 클라이언트가 관리합니다. 로그아웃은 현재 브라우저 세션에 적용합니다.
- 로그인 후 단계 선택, 학습, 레슨에 접근할 수 있습니다.
- 이메일을 수집하지 않으므로 이메일로 비밀번호를 복구할 수 없습니다. 비밀번호 복구 기능은 별도 구현이 필요합니다.

## 서버 코드와 데이터베이스

`supabase/schema.sql`은 적용된 스키마의 재현용 SQL입니다. 새 프로젝트에서 한 번 적용합니다.
기존 프로젝트에 재실행하거나 기존 테이블을 삭제해서 적용하지 마세요.
`supabase/functions/username-signup/index.ts`는 배포된 가입 함수 소스입니다.
`supabase/config.toml`에서 게이트웨이 JWT 검증 대신 함수 내부에서 프로젝트 공개 키를 확인하도록 설정합니다.
회원가입은 로그인 이전에 호출되므로 사용자 세션은 요구하지 않으며, 입력 검증과 요청 횟수 제한을 적용합니다.
런타임 관리자 키는 Supabase Edge Function의 서버 환경변수에서만 읽습니다.
기본 요청 제한은 시간당 프로젝트 전체 100회, 주소별 20회, 아이디별 5회입니다.

빈 Spring Boot 백엔드 골격은 그대로 두었으며 현재 회원 인증 요청은 Supabase로 처리합니다.

## 검증

```sh
cd frontend
npm test
npm run lint
npm run build
```

실제 서버 통합 검증은 `node --env-file=.env.local tests/live-auth.mjs`로 실행합니다.
실행하면 임시 계정이 생성되고 정리할 UUID가 출력됩니다. 관리자 권한으로 해당 테스트 계정만 정리하세요.
프로필 조회 권한, 비밀번호 오류, 중복 아이디, 로그아웃, 내부 식별자 직접 가입 차단까지 확인합니다.
