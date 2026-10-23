from app.ml.mock_detector import MockDetector


def test_mock_detector():

    detector = MockDetector()

    predictions = detector.predict(
        "sample-road-image.jpg"
    )

    assert len(predictions) == 1

    prediction = predictions[0]

    assert prediction.label == "pothole"

    assert prediction.confidence == 0.91

    assert len(prediction.bbox) == 4