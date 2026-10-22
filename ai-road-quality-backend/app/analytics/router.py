from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.service import get_summary
from app.core.database import get_db
from app.core.dependencies import get_current_user_optional
from app.users.models import User


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/summary")
async def summary(
    only_mine: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    citizen_id = current_user.id if (only_mine and current_user) else None
    return await get_summary(
        db,
        citizen_id,
    )