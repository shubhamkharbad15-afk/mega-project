import uuid

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionItem(BaseModel):
    label: str
    confidence: float = Field(
        ge=0,
        le=1,
    )
    bbox: list[float]


class DetectionResponse(BaseModel):
    detection_id: uuid.UUID
    detected: bool
    defect_type: str | None
    confidence: float
    severity: str
    risk_score: float
    model_version: str

    location: dict[str, float]

    detections: list[DetectionItem]

    image_url: str | None = None