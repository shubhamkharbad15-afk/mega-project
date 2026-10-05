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

        status=ReportStatus(
            report.status
        ),

        severity=report.severity,

        latitude=report.latitude,

        longitude=report.longitude,

        detection_id=report.detection_id,

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
    citizen_id: uuid.UUID,
) -> list[ReportResponse]:

    result = await session.execute(

        select(RoadReport)

        .where(
            RoadReport.citizen_id
            == citizen_id
        )

        .order_by(
            RoadReport.created_at.desc()
        )
    )

    reports = result.scalars().all()

    return [
        to_response(report)
        for report in reports
    ]