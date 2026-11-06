from uuid import uuid4

from fastapi.testclient import TestClient

from ai_server.main import app
from ai_server.model import Prediction, load_word_model


class HandsStub:
    mode = "hands-test"
    input_schema = "mediapipe-hands-v1"
    supported_ids = ["WORD1290"]

    def predict_landmarks(self, frames):
        assert len(frames) == 16
        assert frames[-1]["left_hand"][0]["z"] == .3
        return Prediction("WORD1290", .5, True, False)


def start(ws, target="WORD1290"):
    ws.send_json(dict(type="start", input_mode="landmarks",
                      attempt_id=str(uuid4()), target_id=target))


def test_word_pending_does_not_fall_back_to_general_model(monkeypatch):
    monkeypatch.delenv("WORD_MODEL_ADAPTER", raising=False)
    with TestClient(app) as client:
        app.state.model = HandsStub()
        with client.websocket_connect("/ws/v1/word/evaluate", headers={"origin": "http://localhost:5173"}) as ws:
            start(ws)
            assert ws.receive_json()["code"] == "MODEL_NOT_READY"


def test_word_supported_target_stream_and_final():
    with TestClient(app) as client:
        app.state.word_model = HandsStub()
        with client.websocket_connect("/ws/v1/word/evaluate", headers={"origin": "http://localhost:5173"}) as ws:
            start(ws)
            assert ws.receive_json()["model_mode"] == "hands-test"
            for count in range(1, 17):
                ws.send_json(dict(type="landmarks", schema="mediapipe-hands-v1",
                                  timestamp_ms=count * 125, left_hand=[dict(x=.1, y=.2, z=.3)] * 21,
                                  right_hand=[]))
                message = ws.receive_json()
                if count == 16:
                    assert message["type"] == "prediction"
                    message = ws.receive_json()
                assert message["type"] == ("final" if count == 16 else "ack")
            assert message["result"] == "PASS"
            assert message["predicted_id"] == "WORD1290"


def test_word_unsupported_target():
    with TestClient(app) as client:
        app.state.word_model = HandsStub()
        with client.websocket_connect("/ws/v1/word/evaluate", headers={"origin": "http://localhost:5173"}) as ws:
            start(ws, "WORD1201")
            assert ws.receive_json()["code"] == "UNSUPPORTED_TARGET"


def test_word_adapter_rejects_body_model(monkeypatch):
    import pytest
    monkeypatch.setattr("ai_server.model.load_model", lambda name: object())
    with pytest.raises(ValueError, match="mediapipe-hands-v1"):
        load_word_model()
