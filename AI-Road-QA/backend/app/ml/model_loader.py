import logging
from pathlib import Path

from app.core.config import settings
from app.ml.detector import RoadDamageDetector
from app.ml.mock_detector import MockDetector
from app.ml.yolo_detector import YOLODetector

logger = logging.getLogger(__name__)


def get_detector() -> RoadDamageDetector:
    """Select YOLO11 when configured and available; otherwise use CV fallback."""
    provider = settings.ml_provider.strip().lower()

    if provider in {"yolo", "yolo11", "yolo11n"}:
        model_file = Path(settings.model_path)
        if not model_file.is_absolute():
            model_file = Path(__file__).resolve().parents[2] / model_file

        if not model_file.is_file():
            logger.warning(
                "YOLO checkpoint is missing at %s; using the existing OpenCV fallback.",
                model_file,
            )
            return MockDetector()

        try:
            import ultralytics  # noqa: F401
        except ImportError:
            logger.warning(
                "ultralytics is not installed; using the existing OpenCV fallback. "
                "Install requirements-models.txt to enable YOLO11."
            )
            return MockDetector()

        return YOLODetector(str(model_file))

    if provider not in {"mock", "opencv", "cv"}:
        logger.warning("Unknown ML_PROVIDER=%r; using the existing OpenCV fallback.", provider)

    return MockDetector()
