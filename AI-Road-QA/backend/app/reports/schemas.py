import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ReportStatus(str, Enum):
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
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

    evidence: list = Field(
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

    detection_id: uuid.UUID | None = None
    evidence: list = Field(default_factory=list)

    assigned_contractor: str | None = None
    budget_allocated: int | None = None
    resolution_note: str | None = None
    updated_at: datetime | None = None
    created_at: datetime | None

class ReportWorkflowUpdate(BaseModel):
    status: ReportStatus
    assigned_contractor: str | None = Field(default=None, max_length=150)
    budget_allocated: int | None = Field(default=None, ge=0, le=100_000_000)
    resolution_note: str | None = Field(default=None, max_length=2000)
