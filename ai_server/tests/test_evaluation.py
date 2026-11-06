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


def test_word_practice_policy_without_claiming_calibration():
    judge = Evaluator('WORD1290', threshold=.5, stable=1, require_calibrated=False)
    assert judge.update(Prediction('WORD1290', .499, True, False))['result'] == 'RETRY'
    assert judge.update(Prediction('WORD1290', .5, True, False))['result'] == 'PASS'
    assert judge.update(Prediction('WORD1191', .8, True, False))['result'] == 'FAIL'
    assert judge.update(Prediction(None, 0., False, False))['result'] == 'CAPTURE_ERROR'


def test_other_models_still_require_calibration():
    judge = Evaluator('WORD1290')
    for _ in range(4):
        assert judge.update(Prediction('WORD1290', .99, True, False))['result'] == 'RETRY'
