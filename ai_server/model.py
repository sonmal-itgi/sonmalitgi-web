"""Replace with a trained model adapter via MODEL_ADAPTER=package.module:factory."""
from dataclasses import dataclass
import importlib
import os
from typing import Protocol
from PIL import Image

@dataclass(frozen=True)
class Prediction:
    predicted_id: str | None
    confidence: float
    capture_ok: bool
    # Must be set only after validation on held-out data, including wrong signs.
    calibrated: bool = False
    diagnostic: str = ""

class Model(Protocol):
    mode: str
    def predict(self, frames: list[Image.Image]) -> Prediction: ...

class DemoModel:
    mode = "demo"
    def predict(self, frames):
        return Prediction(None, 0.0, True, False,
                          "통신 테스트 모드입니다. 학습된 모델을 연결해 주세요.")

def load_model() -> Model:
    adapter = os.getenv("MODEL_ADAPTER")
    if not adapter:
        return DemoModel()
    module, factory = adapter.split(":", 1)
    return getattr(importlib.import_module(module), factory)()
