from pathlib import Path

from app.core.config import settings
from app.ml.detector import Prediction


# RDD2022 class codes -> stable labels that are easier for both clients to display.
RDD_LABELS = {
    "D00": "longitudinal crack",
    "D10": "transverse crack",
    "D20": "alligator crack",
    "D40": "pothole",
    "d00": "longitudinal crack",
    "d10": "transverse crack",
    "d20": "alligator crack",
    "d40": "pothole",
    "longitudinal_crack": "longitudinal crack",
    "transverse_crack": "transverse crack",
    "alligator_crack": "alligator crack",
}


class YOLODetector:
    """YOLO11 road-defect adapter for the existing FastAPI detection service.

    Bounding boxes are normalized to 0..1 so the response shape remains
    compatible with the project's existing detector and API schema.
    """

    def __init__(self, model_path: str | None = None):
        path = Path(model_path or settings.model_path)
        if not path.is_absolute():
            backend_root = Path(__file__).resolve().parents[2]
            path = backend_root / path
        self.model_path = path
        self.model_version = f"yolo11:{self.model_path.stem}"
        self._model = None

    def _load_model(self):
        if self._model is None:
            if not self.model_path.is_file():
                raise FileNotFoundError(
                    f"YOLO road-damage weights not found: {self.model_path}. "
                    "Train the model with train_road_model.py or set MODEL_PATH."
                )
            try:
                from ultralytics import YOLO
            except ImportError as exc:
                raise RuntimeError(
                    "YOLO inference requires ultralytics. Install with "
                    "'pip install -r requirements-models.txt'."
                ) from exc
            self._model = YOLO(str(self.model_path))
        return self._model

    def predict(self, image_path: str) -> list[Prediction]:
        results = self._load_model().predict(
            source=image_path,
            conf=settings.confidence_threshold,
            verbose=False,
        )
        predictions: list[Prediction] = []

        for result in results:
            if result.boxes is None:
                continue
            height, width = result.orig_shape
            if width <= 0 or height <= 0:
                continue

            names = result.names
            for box in result.boxes:
                class_id = int(box.cls.item())
                confidence = float(box.conf.item())
                x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
                raw_label = (
                    names.get(class_id, str(class_id))
                    if isinstance(names, dict)
                    else names[class_id]
                )
                raw_label = str(raw_label).strip()
                label = RDD_LABELS.get(
                    raw_label,
                    RDD_LABELS.get(raw_label.lower(), raw_label.lower().replace("_", " ")),
                )
                bbox = [
                    round(max(0.0, min(1.0, x1 / width)), 4),
                    round(max(0.0, min(1.0, y1 / height)), 4),
                    round(max(0.0, min(1.0, x2 / width)), 4),
                    round(max(0.0, min(1.0, y2 / height)), 4),
                ]
                predictions.append(
                    Prediction(
                        label=label,
                        confidence=round(max(0.0, min(1.0, confidence)), 4),
                        bbox=bbox,
                    )
                )

        return predictions
