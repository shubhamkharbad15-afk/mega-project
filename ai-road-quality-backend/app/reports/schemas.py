import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ReportStatus(str, Enum):
    CONFIRMED = "confirmed"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"


class ReportCreate(BaseModel):

    title: str = Field(
        min_length=3,
        max_length=150,
    )

    description: str | None = None

    detection_id: uuid.UUID | None = None

    latitude: float = Field(
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ge=-180,
        le=180,
    )

    severity: str = "medium"

    evidence: list[dict] = Field(
        default_factory=list
    )


class ReportResponse(BaseModel):

    id: uuid.UUID
    title: str
    description: str | None

    status: ReportStatus

    severity: str

    latitude: float
    longitude: float

    detection_id: uuid.UUID | None

    created_at: datetime | None