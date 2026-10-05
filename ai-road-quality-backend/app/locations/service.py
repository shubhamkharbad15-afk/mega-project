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
    citizen_id,
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

    query = (
        select(
            RoadReport.id,
            RoadReport.title,
            RoadReport.severity,
            RoadReport.latitude,
            RoadReport.longitude,
            distance_expression.label(
                "distance"
            ),
        )
        .where(
            RoadReport.citizen_id
            == citizen_id
        )
        .where(
            func.ST_DWithin(
                report_geography,
                query_geography,
                radius,
            )
        )
        .order_by(
            distance_expression
        )
    )

    result = await session.execute(query)

    return [
        {
            "id": row.id,
            "title": row.title,
            "severity": row.severity,
            "latitude": row.latitude,
            "longitude": row.longitude,
            "distance": row.distance,
        }
        for row in result.all()
    ]