from app.core.config import settings
from app.ml.detector import RoadDamageDetector
from app.ml.mock_detector import MockDetector
from app.ml.yolo_detector import YOLODetector


def get_detector() -> RoadDamageDetector:

    provider = settings.ml_provider.lower()

    if provider == "yolo":
        return YOLODetector(
            settings.model_path
        )

    return MockDetector()