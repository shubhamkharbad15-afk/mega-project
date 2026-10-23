import uuid

from geoalchemy2.elements import WKTElement
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.reports.models import RoadReport
from app.reports.schemas import (
    ReportCreate,
    ReportResponse,
    ReportStatus,
)


async def create_report(
    session: AsyncSession,
    data: ReportCreate,
    citizen_id: uuid.UUID,
) -> ReportResponse:

    report = RoadReport(

        title=data.title,

        description=data.description,

        status=ReportStatus.CONFIRMED.value,

        severity=data.severity,

        latitude=data.latitude,

        longitude=data.longitude,

        location=WKTElement(
            f"POINT({data.longitude} {data.latitude})",
            srid=4326,
        ),

        evidence=data.evidence,

        detection_id=data.detection_id,

        citizen_id=citizen_id,
    )

    session.add(report)

    await session.commit()
    await session.refresh(report)

    return to_response(report)


def to_response(
    report: RoadReport,
) -> ReportResponse:

    return ReportResponse(
        id=report.id,
        title=report.title,
        description=report.description,
        status=ReportStatus(report.status),
        severity=report.severity,
        latitude=report.latitude,
        longitude=report.longitude,
        detection_id=report.detection_id,
        evidence=report.evidence or [],
        assigned_contractor=report.assigned_contractor,
        budget_allocated=report.budget_allocated,
        resolution_note=report.resolution_note,
        updated_at=report.updated_at,
        created_at=report.created_at,
    )


async def get_report(
    session: AsyncSession,
    report_id: uuid.UUID,
    citizen_id: uuid.UUID,
) -> ReportResponse | None:

    result = await session.execute(

        select(RoadReport)

        .where(
            RoadReport.id == report_id,

            RoadReport.citizen_id
            == citizen_id,
        )
    )

    report = result.scalar_one_or_none()

    if not report:
        return None

    return to_response(report)


async def list_reports(
    session: AsyncSession,
    citizen_id: uuid.UUID | None = None,
) -> list[ReportResponse]:

    query = select(RoadReport)
    if citizen_id is not None:
        query = query.where(RoadReport.citizen_id == citizen_id)
    query = query.order_by(RoadReport.created_at.desc())

    result = await session.execute(query)
    reports = result.scalars().all()

    return [
        to_response(report)
        for report in reports
    ]

async def update_report_workflow(
    session: AsyncSession,
    report_id: uuid.UUID,
    data,
) -> ReportResponse | None:
    result = await session.execute(
        select(RoadReport).where(RoadReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if report is None:
        return None

    # Enforce a small, explicit state machine; prevent reopening a resolved case silently.
    allowed = {
        ReportStatus.CONFIRMED.value: {ReportStatus.REVIEWED.value, ReportStatus.IN_PROGRESS.value},
        ReportStatus.REVIEWED.value: {ReportStatus.IN_PROGRESS.value, ReportStatus.RESOLVED.value},
        ReportStatus.IN_PROGRESS.value: {ReportStatus.RESOLVED.value, ReportStatus.REVIEWED.value},
        ReportStatus.RESOLVED.value: set(),
    }
    if data.status.value != report.status and data.status.value not in allowed.get(report.status, set()):
        from fastapi import HTTPException
        raise HTTPException(status_code=409, detail=f"Invalid workflow transition: {report.status} → {data.status.value}")

    report.status = data.status.value
    if data.assigned_contractor is not None:
        report.assigned_contractor = data.assigned_contractor.strip() or None
    if data.budget_allocated is not None:
        report.budget_allocated = data.budget_allocated
    if data.resolution_note is not None:
        report.resolution_note = data.resolution_note.strip() or None
    await session.commit()
    await session.refresh(report)
    return to_response(report)
