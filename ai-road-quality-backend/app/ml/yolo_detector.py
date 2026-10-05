from pathlib import Path

from app.core.config import settings
from app.ml.detector import Prediction


class YOLODetector:
    """
    Adapter for the future trained YOLO model.

    YOLO is imported lazily so that the backend architecture
    can be showcased without loading a large model.
    """

    model_version = "yolov11"

    def __init__(
        self,
        model_path: str | None = None,
    ):
        self.model_path = (
            model_path
            or settings.model_path
        )

        self._model = None

    def _load_model(self):
        if self._model is not None:
            return self._model

        from ultralytics import YOLO

        model_file = Path(
            self.model_path
        )

        if not model_file.exists():
            raise FileNotFoundError(
                f"YOLO model not found: {model_file}"
            )

        self._model = YOLO(
            str(model_file)
        )

        return self._model

    def predict(
        self,
        image_path: str,
    ) -> list[Prediction]:

        model = self._load_model()

        results = model.predict(
            source=image_path,
            conf=settings.confidence_threshold,
            verbose=False,
        )

        predictions: list[Prediction] = []

        for result in results:

            if result.boxes is None:
                continue

            names = result.names

            for box in result.boxes:

                cls_id = int(
                    box.cls.item()
                )

                confidence = float(
                    box.conf.item()
                )

                x1, y1, x2, y2 = (
                    box.xyxy[0].tolist()
                )

                predictions.append(
                    Prediction(
                        label=str(
                            names.get(
                                cls_id,
                                cls_id,
                            )
                        ),
                        confidence=confidence,
                        bbox=[
                            x1,
                            y1,
                            x2,
                            y2,
                        ],
                    )
                )

        return predictions