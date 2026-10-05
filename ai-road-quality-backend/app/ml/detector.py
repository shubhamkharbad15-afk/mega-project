from dataclasses import dataclass
from typing import Protocol


@dataclass
class Prediction:
    label: str
    confidence: float
    bbox: list[float]


class RoadDamageDetector(Protocol):

    model_version: str

    def predict(
        self,
        image_path: str,
    ) -> list[Prediction]:
        ...