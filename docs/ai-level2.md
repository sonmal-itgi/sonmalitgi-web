# 한국수어 Level 2: WebSocket 준실시간 평가

React에서 촬영하는 도중 JPEG 프레임을 전송하고 FastAPI가 슬라이딩 윈도우를 반복 분석하는 실행 예제입니다. Level 1 녹화 파일 업로드 방식은 포함하지 않습니다.

## 실행

프로젝트 루트에서 Python 3.11 이상 환경을 사용하세요. PyTorch를 연결할 때는 해당 PyTorch 배포판이 지원하는 Python 버전을 선택하세요.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ai_server/requirements.txt
uvicorn ai_server.main:app --host 127.0.0.1 --port 8000 --ws-max-size 200000
```

다른 터미널에서:

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 http://localhost:5173 을 열고 목표 ID를 입력한 뒤 평가를 시작합니다. 카메라 권한을 허용하세요. 웹캠은 localhost 또는 HTTPS 환경에서 사용해야 합니다. 다른 호스트에 배포할 때는 `frontend/.env.example`을 참고해 `VITE_AI_WS_URL=wss://.../ws/v1/evaluate`를 설정하고 빌드하세요. 서버에는 `ALLOWED_ORIGINS=https://프런트엔드주소`를 설정합니다. WebSocket 프록시도 업그레이드 및 연결 유지 시간을 지원해야 합니다.

## 동작

- 최대 약 8fps로 640×480 이하 JPEG를 전송합니다. 미리보기만 좌우 반전하고 서버 입력은 원본 방향입니다.
- 최근 16프레임을 유지하고 4프레임마다 추론합니다. 빠른 추론 기준 약 2초 구간 / 0.5초 간격이지만 처리 시간에 따라 더 느려집니다.
- 한 번에 한 프레임만 전송하고 서버 ACK 이후 다음 프레임을 보냅니다. 모델 추론은 스레드에서 수행하며 모델 접근은 서버 프로세스 내에서 직렬화합니다.
- 검증된 모델 결과가 임시 임계값 0.9 이상으로 같은 클래스를 3회 연속 반환하면 PASS 또는 FAIL로 판정합니다. 임계값과 안정화 횟수는 검증 데이터로 조정해야 합니다. 겹치는 윈도우 3회는 독립된 성공 3회를 의미하지 않습니다.
- PASS는 자동 종료합니다. FAIL은 진행 중 결과이며, 종료 버튼 또는 약 30초 제한에서 최종화합니다. 자동 동작 종료 검출은 포함하지 않습니다.
- 종료 시 새 프레임이 남아 있으면 마지막 전체 윈도우를 추가 분석합니다. 윈도우가 채워지지 않으면 CAPTURE_ERROR입니다.
- 저신뢰/미검증 결과는 RETRY, 모델이 촬영 불량을 반환하면 CAPTURE_ERROR입니다. JPEG 파손 등 프로토콜 오류는 error로 종료하고 오답으로 처리하지 않습니다.
- 입력 프레임은 메모리에서만 처리하며 영상 파일이나 학습 기록을 저장하지 않습니다.

## 실제 AI 모델 연결

기본 `DemoModel`은 **연결 점검 전용**이며 수어를 인식하지 않습니다. 항상 RETRY를 반환합니다. 실제 PASS/FAIL에는 학습된 모델과 검증된 기준이 필요합니다.

`ai_server/model.py`의 Model 계약에 맞춰 `mode`와 `predict(frames)`를 구현하고 factory를 설정하세요.

```bash
MODEL_ADAPTER=ai_server.my_model:create_model uvicorn ai_server.main:app --port 8000 --ws-max-size 200000
```

입력은 시간순 PIL RGB 이미지 목록입니다. 반환은 `Prediction(predicted_id, confidence, capture_ok, calibrated, diagnostic)`입니다. 모델에는 목표 ID를 주지 않으므로 정답을 그대로 반환하는 경로가 없습니다. 관절 검출 실패, 화면 이탈 등 품질 검사는 어댑터에서 구현하고 `capture_ok=False`로 반환하세요. 모델 소프트맥스 점수는 동작 정확도나 정답 확률로 보장되지 않습니다.

`ai_server/torch_adapter.py.example`에 TorchScript 연결 예제가 있습니다. 해당 예제의 RGB 입력 규격으로 학습한 모델에만 적용할 수 있습니다. OpenPose 학습 모델은 동일한 관절 순서·좌표계·정규화를 구현해야 합니다. MediaPipe 좌표를 그대로 넣으면 안 됩니다. 샘플링 간격 변화에 민감한 모델은 프레임 타임스탬프 기반 재샘플링이나 서버 고정 주기 추론 구조로 추가 개선해야 합니다.

## 메시지 계약

1. 클라이언트 JSON: `{"type":"start","attempt_id":"UUID","target_id":"FS0824"}`
2. 서버: `ready` (model_mode, fps, window)
3. 클라이언트: JPEG 바이너리 → 서버: 선택적 `prediction`, 이후 `ack`
4. 클라이언트 JSON: `{"type":"stop"}` → 서버: `final` 후 연결 종료
5. 자동 PASS 시에는 `prediction`, `final` 후 종료하므로 ACK가 없습니다.

prediction/final에는 attempt_id, target_id, predicted_id, confidence, result, feedback, model_mode가 들어갑니다. 결과는 PASS / RETRY / FAIL / CAPTURE_ERROR입니다. 연결이 끊기면 자동 재연결하지 않고 새 시도를 시작합니다.

## Spring Boot 연결과 서비스 배포 범위

현재 프로젝트에는 Spring Boot 앱·회원 인증·문제 DB가 없어 학습 기록 저장은 구현하지 않았습니다. 개발용 직접 연결이며 target_id도 사용자가 입력합니다. 실제 서비스에서는 Spring이 인증된 사용자와 문제에서 target_id를 확정하고 일회용 짧은 수명의 시도 티켓을 발급하고, FastAPI가 티켓을 검증하는 구조로 연결하세요. Origin 검사만으로 인증을 대체할 수 없습니다.

최종 결과는 AI 서버 → Spring 내부 API 콜백 또는 서버 서명 영수증 검증을 통해 저장하세요. 브라우저가 반환한 PASS JSON만 믿고 진도·해금을 처리하면 조작 가능합니다. attempt_id를 사용자/문제에 바인딩하고 유일 제약으로 중복 저장을 막으세요. 데모·CAPTURE_ERROR는 오답으로 저장하지 않고 RETRY 처리 정책을 별도로 정하세요.

운영 전에는 사용자별 요청 제한, 총 연결 수 제한, 추론 큐와 타임아웃, 모델 클래스 허용 목록 및 실제 모델 지연/메모리 측정이 필요합니다. 현재 ACK 방식은 단일 사용자 개발 예제에 맞춰져 있으며 동시 사용자 및 느린 추론에서 고정 8fps를 보장하지 않습니다. 추론 스레드는 강제로 취소되지 않으므로 모델 정지에 대한 격리가 필요하면 별도 추론 프로세스를 사용하세요.

## 확인

```bash
python -m pytest ai_server/tests -q
cd frontend
npm run build
```

테스트는 연속 판정, 불확실성에 따른 초기화, 데모 PASS 방지, 프레임 전송 및 최종 결과, 잘못된 입력을 확인합니다. 실제 웹캠·모델 정확도·배포 성능은 별도 실측이 필요합니다.

참고: [FastAPI WebSocket](https://fastapi.tiangolo.com/advanced/websockets/), [Canvas JPEG 변환](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob).

기존 웹사이트에서는 로그인 후 `/practice` 또는 학습 화면의 “AI 수어 연습” 버튼으로 접근합니다. 현재 목표 ID는 개발용 직접 입력이며 교육과정 표현과의 실제 클래스 매핑은 별도 연결이 필요합니다.
