import uuid
from pathlib import Path

from geoalchemy2.elements import WKTElement
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.detections.models import Detection
from app.detections.schemas import (
    DetectionItem,
    DetectionResponse,
)
from app.ml.model_loader import get_detector


def calculate_severity(
    confidence: float,
) -> str:

    if confidence >= 0.85:
        return "high"

    if confidence >= 0.65:
        return "medium"

    return "low"


def calculate_risk_score(
    confidence: float,
    severity: str,
) -> float:

    multiplier = {
        "high": 1.0,
        "medium": 0.7,
        "low": 0.4,
    }

    score = confidence * multiplier.get(
        severity,
        0.4,
    )

    return round(
        min(score, 1.0),
        2,
    )


async def run_detection(
    session: AsyncSession,
    image_path: str,
    latitude: float,
    longitude: float,
    user_id: uuid.UUID,
) -> DetectionResponse:

    detector = get_detector()

    predictions = detector.predict(
        image_path
    )

    detected = len(predictions) > 0

    if detected:

        highest_prediction = max(
            predictions,
            key=lambda item: item.confidence,
        )

        defect_type = (
            highest_prediction.label
        )

        confidence = (
            highest_prediction.confidence
        )

    else:

        defect_type = None
        confidence = 0.0

    severity = calculate_severity(
        confidence
    )

    risk_score = calculate_risk_score(
        confidence,
        severity,
    )

    detection_records = [
        {
            "label": prediction.label,
            "confidence": prediction.confidence,
            "bbox": prediction.bbox,
        }
        for prediction in predictions
    ]

    detection = Detection(
        id=uuid.uuid4(),
        image_path=image_path,
        model_version=detector.model_version,
        confidence=confidence,
        severity=severity,
        risk_score=risk_score,
        latitude=latitude,
        longitude=longitude,
        location=WKTElement(
            f"POINT({longitude} {latitude})",
            srid=4326,
        ),
        detections_json=detection_records,
        created_by=user_id,
    )

    session.add(detection)

    await session.commit()
    await session.refresh(detection)

    return DetectionResponse(
        detection_id=detection.id,
        detected=detected,
        defect_type=defect_type,
        confidence=confidence,
        severity=severity,
        risk_score=risk_score,
        model_version=detector.model_version,
        location={
            "latitude": latitude,
            "longitude": longitude,
        },
        detections=[
            DetectionItem(**item)
            for item in detection_records
        ],
        image_url=None,
    )


def save_uploaded_file(
    content: bytes,
    original_filename: str,
) -> str:

    upload_directory = Path(
        settings.upload_dir
    )

    upload_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    extension = Path(
        original_filename
    ).suffix.lower()

    filename = (
        f"{uuid.uuid4()}{extension}"
    )

    destination = (
        upload_directory / filename
    )

    destination.write_bytes(content)

    return str(destination)