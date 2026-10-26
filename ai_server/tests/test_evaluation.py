from ai_server.evaluation import Evaluator
from ai_server.model import Prediction

def test_pass_requires_stability():
    evaluator = Evaluator('A')
    p = Prediction('A', .95, True, True)
    assert [evaluator.update(p)['result'] for _ in range(3)] == ['RETRY', 'RETRY', 'PASS']

def test_demo_cannot_pass():
    evaluator = Evaluator('A')
    for _ in range(5):
        assert evaluator.update(Prediction('A', .99, True))['result'] == 'RETRY'

def test_uncertainty_breaks_streak():
    evaluator = Evaluator('A')
    p = Prediction('A', .95, True, True)
    evaluator.update(p)
    evaluator.update(p)
    evaluator.update(Prediction('A', .5, True, True))
    assert evaluator.update(p)['result'] == 'RETRY'

def test_wrong_sign_and_capture_error():
    evaluator = Evaluator('A')
    for _ in range(3):
        result = evaluator.update(Prediction('B', .98, True, True))
    assert result['result'] == 'FAIL'
    assert evaluator.update(Prediction(None, 0, False))['result'] == 'CAPTURE_ERROR'
