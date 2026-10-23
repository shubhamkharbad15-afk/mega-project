import enum
import uuid
from datetime import datetime

from geoalchemy2 import Geometry

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    JSON,
    String,
    Text,
    Integer,
    func,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.core.database import Base


class ReportStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"


class RoadReport(Base):

    __tablename__ = "road_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default=ReportStatus.CONFIRMED.value,
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        default="low",
        nullable=False,
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    location = mapped_column(
        Geometry(
            geometry_type="POINT",
            srid=4326,
        ),
        nullable=True,
    )

    evidence: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    detection_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("detections.id"),
        nullable=True,
    )

    citizen_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    assigned_contractor: Mapped[str | None] = mapped_column(String(150), nullable=True)

    budget_allocated: Mapped[int | None] = mapped_column(Integer, nullable=True)

    resolution_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    citizen = relationship(
        "User",
        back_populates="reports",
    )