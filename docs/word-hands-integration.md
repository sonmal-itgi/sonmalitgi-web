# 중급 손 전용 모델 연결

프론트의 Hand Landmarker, 양손 좌표, 화면 오버레이를 그대로 사용합니다.
중급(유닛 3·4)만 `VITE_WORD_AI_WS_URL`로 연결합니다. 기본값은
`ws://localhost:8000/ws/v1/word/evaluate`입니다. 배포 시 HTTPS에 맞춰 wss 주소를 설정합니다.
다른 레벨과 /practice는 기존 `VITE_AI_WS_URL`을 사용합니다.

## 현재 상태

별도 손 전용 모델을 지정하지 않은 기본 중급 서버는 MODEL_NOT_READY를 반환하며
평가 통과/오답을 생성하지 않습니다. 서버 /health의 word_model_mode,
word_supported_ids로 연결 상태를 확인합니다.

참고한 원본: https://github.com/sonmal-itgi/sonmalitgi-AI-Level-2/tree/main/ai_server
원본 모델은 양손 42점 + 상체 12점의 (x, y, confidence)를 입력으로 사용하고,
목 원점·어깨너비 정규화를 수행합니다. 현재 손 좌표의 z는 깊이입니다.
원본 best.pt에 손 좌표만 넣거나 상체를 0으로 채우는 방식은 사용하지 않습니다.
원본 모델/학습 전처리 코드는 복사하지 않았습니다. 손 전용 학습과 해당 전처리가 필요합니다.

## 모델 제공자가 구현할 계약

`WORD_MODEL_ADAPTER=your_package.adapter:create_model`로 factory를 지정합니다.
기존 MODEL_ADAPTER와 별개이므로 지문자/숫자 모델을 교체하지 않습니다.
factory가 반환할 객체:

```python
class HandsWordModel:
    mode = "hands-word-v1"  # demo 이외의 모델 식별자
    input_schema = "mediapipe-hands-v1"
    supported_ids = ["WORD1290", "WORD1191"]  # 실제 학습한 클래스만

    def predict_landmarks(self, frames):
        # 학습 때의 점 순서, 누락 손 처리, 정규화, 시간 재샘플링을 적용해 추론.
        # 목표 단어는 모델에 전달되지 않음.
        # ai_server.model.Prediction을 반환.
        ...
```

frames는 시간순 최근 16프레임입니다. 약 8fps로 수신하며 4프레임마다 분석합니다.
각 프레임은 schema, timestamp_ms, left_hand, right_hand를 포함합니다.
각 손은 사람 기준 좌/우, 미검출이면 [], 검출되면 MediaPipe 순서의 21개
{x, y, z}입니다. 좌표는 반전 전 영상의 정규화 좌표이며 z는 상대 깊이입니다.
따라서 이 윈도우 길이/촬영 속도에 맞는 모델 또는 어댑터가 필요합니다.

반환형은 `Prediction(predicted_id, confidence, capture_ok, calibrated=False, diagnostic="")`입니다.
predicted_id는 WORD ID, confidence는 0~1의 유한한 점수입니다.
calibrated는 별도 검증을 완료한 경우에만 True로 설정합니다.
현재 평가기는 검증 표시가 있고 점수가 0.9 이상인 같은 클래스가 3회 연속 나와야
PASS/FAIL을 생성합니다. 검증 전 모델도 예측 ID와 점수는 표시되지만 RETRY를 유지합니다.

## 통신

기존 /ws/v1/evaluate와 동일한 start → ready → landmarks → ack → stop → final 계약입니다.
start에는 input_mode: "landmarks", attempt_id(UUID), target_id(WORD ID)를 보냅니다.
중급 경로는 손 전용 스키마만 허용하며 모델 미연결이나 미지원 목표는 프레임 수신 전에 거부합니다.
진도 저장 정책과 기존 최종 결과 구조는 변경하지 않았습니다.

실행 예시(저장소 루트):

```sh
WORD_MODEL_ADAPTER=your_package.adapter:create_model uvicorn ai_server.main:app --port 8000
```

모델 패키지 및 추론 라이브러리는 제공될 모델에 맞춰 별도로 설치합니다.


## 손 전용 시험 모델 배포

포크 https://github.com/YugyeongChoi/sonmalitgi-AI-Level-2/tree/hands-only 에
손 전용 학습/추론과 Railway Dockerfile을 준비했습니다. 중급 11단어를 대상으로 하며
시험 모델은 calibrated=False를 유지하되 중급 경로에서만 명시적인 연습 판정 규칙을 사용합니다.
목표 단어가 1위이고 점수가 0.5 이상이면 PASS, 다른 단어가 1위이고 0.5 이상이면 FAIL입니다.
0.5 미만은 RETRY, 손 검출 실패는 CAPTURE_ERROR입니다. PASS는 기존 진도 저장 흐름에 반영합니다.
Railway ai-server는 포크의 hands-only 브랜치를 사용하고,
프론트 VITE_WORD_AI_WS_URL을 같은 서버의 /ws/v1/word/evaluate에 연결합니다.
가중치는 빌드 중 공개 학습 데이터에서 생성합니다.
실제 영상의 image_width/image_height를 프레임에 전달해 종횡비를 맞춥니다.
이 연습 판정 기준은 실제 웹캠 정확도가 검증되었다는 의미가 아닙니다.
