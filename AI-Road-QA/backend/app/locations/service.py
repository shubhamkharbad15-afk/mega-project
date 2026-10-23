from sqlalchemy import cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from geoalchemy2 import Geography
from geoalchemy2.elements import WKTElement

from app.reports.models import RoadReport


async def get_nearby_reports(
    session: AsyncSession,
    latitude: float,
    longitude: float,
    radius: int,
    citizen_id=None,
):

    point = WKTElement(
        f"POINT({longitude} {latitude})",
        srid=4326,
    )

    report_geography = cast(
        RoadReport.location,
        Geography(srid=4326),
    )
    query_geography = cast(
        point,
        Geography(srid=4326),
    )
    distance_expression = func.ST_Distance(
        report_geography,
        query_geography,
    )

    query = select(
        RoadReport.id,
        RoadReport.title,
        RoadReport.description,
        RoadReport.status,
        RoadReport.severity,
        RoadReport.latitude,
        RoadReport.longitude,
        RoadReport.evidence,
        RoadReport.assigned_contractor,
        RoadReport.budget_allocated,
        RoadReport.resolution_note,
        RoadReport.created_at,
        RoadReport.updated_at,
        distance_expression.label("distance"),
    )

    if citizen_id is not None:
        query = query.where(RoadReport.citizen_id == citizen_id)

    query = query.where(
        func.ST_DWithin(
            report_geography,
            query_geography,
            radius,
        )
    ).order_by(distance_expression)

    result = await session.execute(query)

    return [
        {
            "id": str(row.id),
            "title": row.title,
            "description": row.description or "Road defect logged.",
            "status": row.status or "confirmed",
            "severity": row.severity or "high",
            "latitude": row.latitude,
            "longitude": row.longitude,
            "evidence": row.evidence or [],
            "assigned_contractor": row.assigned_contractor,
            "contractor": row.assigned_contractor,
            "budget_allocated": row.budget_allocated,
            "resolution_note": row.resolution_note,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
            "distance": row.distance,
        }
        for row in result.all()
    ]