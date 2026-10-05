from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.reports.models import RoadReport


async def get_summary(
    session: AsyncSession,
    citizen_id,
):

    result = await session.execute(

        select(
            RoadReport.severity,
            func.count(RoadReport.id),
        )

        .where(
            RoadReport.citizen_id
            == citizen_id
        )

        .group_by(
            RoadReport.severity
        )
    )

    counts = {
        severity: count
        for severity, count
        in result.all()
    }

    total = sum(
        counts.values()
    )

    return {
        "total_reports": total,

        "high_severity": counts.get(
            "high",
            0,
        ),

        "medium_severity": counts.get(
            "medium",
            0,
        ),

        "low_severity": counts.get(
            "low",
            0,
        ),
    }