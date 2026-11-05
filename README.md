# 손말잇기

- [WebSocket 기반 준실시간 AI 평가 실행 안내](docs/ai-level2.md)
- [중급 손 전용 모델 연결 계약과 설정](docs/word-hands-integration.md)
- [회원 인증 및 학습 진도 설정](README_SUPABASE.md)

AI 연습 화면은 `/practice`에 있습니다. 기본 서버는 통신 확인용 데모이며 실제 수어 인식 모델은 별도로 연결해야 합니다.

## MediaPipe Web 설정

`frontend/src/lib/mediapipe.js`에서 Hand Landmarker를 VIDEO 모드로 실행합니다. WASM은 JS와 동일한 1.2.2 버전을 사용합니다. `VITE_MEDIAPIPE_MODEL_URL`로 직접 호스팅하는 `.task` 파일을 지정할 수 있습니다. 추출과 화면 표시는 서버 ready 후 ACK 간격으로 실행됩니다. MediaPipe 추론은 현재 메인 스레드에서 실행하므로 저사양 기기는 표시가 끊길 수 있습니다.

`input_mode`를 생략한 기존 클라이언트는 JPEG 모드로 처리합니다. 랜드마크 모드에는 `predict_landmarks`를 구현한 어댑터가 필요하며 RGB 전용 모델은 명시적으로 거부합니다. 데모 모델은 랜드마크 수신만 점검하고 PASS를 반환하지 않습니다.

참고: [MediaPipe Hand Landmarker Web 공식 문서](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js).

양손 전용 모델(`numHands: 2`)을 사용하며 몸·얼굴 모델은 실행하지 않습니다. 좌표 JSON에는 `left_hand`와 `right_hand`만 포함합니다. 미러링하지 않은 영상의 손 분류 라벨을 반전해 사용자 기준 왼손/오른손으로 매핑합니다. 서버는 배포 전환 중 기존 `mediapipe-holistic-v1`도 수신할 수 있습니다.
