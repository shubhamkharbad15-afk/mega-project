from app.ml.detector import Prediction


class MockDetector:
    """
    Deterministic detector for development/demo purposes.
    """

    model_version = "mock-v1"

    def predict(
        self,
        image_path: str,
    ) -> list[Prediction]:

        return [
            Prediction(
                label="pothole",
                confidence=0.91,
                bbox=[
                    0.18,
                    0.24,
                    0.74,
                    0.78,
                ],
            )
        ]