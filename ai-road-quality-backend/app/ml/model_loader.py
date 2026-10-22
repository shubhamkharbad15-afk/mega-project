import logging
from pathlib import Path

from app.core.config import settings
from app.ml.detector import RoadDamageDetector
from app.ml.mock_detector import MockDetector
from app.ml.yolo_detector import YOLODetector

logger = logging.getLogger(__name__)


def get_detector() -> RoadDamageDetector:

    provider = settings.ml_provider.lower()

    if provider == "yolo":
        model_file = Path(settings.model_path)
        if not model_file.is_absolute():
            backend_root = Path(__file__).resolve().parents[2]
            model_file = backend_root / settings.model_path

        if model_file.exists():
            try:
                import ultralytics  # noqa: F401
                return YOLODetector(str(model_file))
            except ImportError:
                logger.warning(
                    "ultralytics is not installed. Falling back to OpenCV detector."
                )
        else:
            logger.warning(
                "YOLO model file %s does not exist. Falling back to OpenCV detector.",
                model_file,
            )

    return MockDetector()