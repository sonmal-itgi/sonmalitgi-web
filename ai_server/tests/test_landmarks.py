from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from ai_server.landmarks import decode_landmarks
from ai_server.main import app


def frame(timestamp=1):
    point = {"x": .5, "y": .4, "z": -.1}
    return dict(type="landmarks", schema="mediapipe-holistic-v1", timestamp_ms=timestamp,
                pose=[point] * 33, face=[], left_hand=[point] * 21, right_hand=[])


def test_landmark_stream_reaches_model_and_final():
    received = []
    from ai_server.model import Prediction
    class Stub:
        mode = "test"
        def predict_landmarks(self, frames):
            received.append(frames)
            return Prediction(None, 0, True)
    with TestClient(app) as client:
        app.state.model = Stub()
        with client.websocket_connect("/ws/v1/evaluate", headers={"origin": "http://localhost:5173"}) as ws:
            ws.send_json(dict(type="start", input_mode="landmarks", target_id="A", attempt_id=str(uuid4())))
            assert ws.receive_json()["input_mode"] == "landmarks"
            for i in range(1, 18):
                ws.send_json(frame(i * 125))
                msg = ws.receive_json()
                if i == 16:
                    assert msg["type"] == "prediction"
                    msg = ws.receive_json()
                assert msg["type"] == "ack"
            ws.send_json({"type": "stop"})
            assert ws.receive_json()["type"] == "final"
    assert len(received) == 2
    assert len(received[0]) == 16
    assert received[0][0]["timestamp_ms"] == 125
    assert received[1][-1]["timestamp_ms"] == 2125


@pytest.mark.parametrize("change", [
    {"left_hand": [{"x": 0, "y": 0, "z": 0}]},
    {"pose": [{"x": float("nan"), "y": 0, "z": 0}] * 33},
    {"timestamp_ms": True}, {"schema": "unknown"}, {"face": None},
])
def test_reject_bad_landmarks(change):
    with pytest.raises(ValueError):
        decode_landmarks(frame() | change)


def test_reject_repeated_timestamp():
    with pytest.raises(ValueError):
        decode_landmarks(frame(125), previous_timestamp=125)


def test_missing_detections_are_explicit_empty_lists():
    empty = frame() | dict(pose=[], face=[], left_hand=[], right_hand=[])
    assert decode_landmarks(empty)["left_hand"] == []


def test_rgb_only_adapter_rejected_before_ready():
    class RGBOnly:
        mode = "rgb"
        def predict(self, frames):
            raise AssertionError("RGB model must not receive landmarks")
    with TestClient(app) as client:
        app.state.model = RGBOnly()
        with client.websocket_connect("/ws/v1/evaluate", headers={"origin": "http://localhost:5173"}) as ws:
            ws.send_json(dict(type="start", input_mode="landmarks", target_id="A", attempt_id=str(uuid4())))
            assert ws.receive_json()["type"] == "error"
