from io import BytesIO
from uuid import uuid4
from fastapi.testclient import TestClient
from PIL import Image
from ai_server.main import app

def test_stream_and_final():
    image = BytesIO()
    Image.new('RGB', (64, 48)).save(image, 'JPEG')
    with TestClient(app) as client:
        with client.websocket_connect('/ws/v1/evaluate', headers={'origin': 'http://localhost:5173'}) as ws:
            ws.send_json({'type': 'start', 'target_id': 'A', 'attempt_id': str(uuid4())})
            assert ws.receive_json()['type'] == 'ready'
            for count in range(1, 21):
                ws.send_bytes(image.getvalue())
                msg = ws.receive_json()
                if count in (16, 20):
                    assert msg['type'] == 'prediction'
                    assert msg['result'] == 'RETRY'
                    msg = ws.receive_json()
                assert msg['type'] == 'ack'
            ws.send_json({'type': 'stop'})
            assert ws.receive_json()['type'] == 'final'

def test_invalid_frame():
    with TestClient(app) as client:
        with client.websocket_connect('/ws/v1/evaluate', headers={'origin': 'http://localhost:5173'}) as ws:
            ws.send_json({'type': 'start', 'target_id': 'A', 'attempt_id': str(uuid4())})
            ws.receive_json()
            ws.send_bytes(b'not an image')
            assert ws.receive_json()['type'] == 'error'

def test_stable_pass_finishes_without_ack():
    from ai_server.model import Prediction
    class TrainedStub:
        mode = 'test'
        def predict(self, frames):
            return Prediction('A', .99, True, True)
    image = BytesIO()
    Image.new('RGB', (64, 48)).save(image, 'JPEG')
    with TestClient(app) as client:
        app.state.model = TrainedStub()
        with client.websocket_connect('/ws/v1/evaluate', headers={'origin': 'http://localhost:5173'}) as ws:
            ws.send_json({'type': 'start', 'target_id': 'A', 'attempt_id': str(uuid4())})
            ws.receive_json()
            for count in range(1, 25):
                ws.send_bytes(image.getvalue())
                msg = ws.receive_json()
                if count in (16, 20, 24):
                    assert msg['type'] == 'prediction'
                    msg = ws.receive_json()
                if count == 24:
                    assert msg['type'] == 'final'
                    assert msg['result'] == 'PASS'
                else:
                    assert msg['type'] == 'ack'
