Supabase 설정 가이드

1) 패키지 설치
- npm 사용
  npm install @supabase/supabase-js

2) 환경변수 설정
- 프로젝트 루트의 .env.local 파일에 아래 값을 채워 넣으세요.
  VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
  VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

3) 개발 서버 재시작
- 서버가 켜져 있다면 종료 후 다시 실행하세요.
  npm run dev

4) 동작 확인
- 로그인/회원가입 페이지로 이동해 테스트합니다.
- 문제가 있으면 브라우저 콘솔과 네트워크 탭에서 에러 메시지를 확인하세요.
