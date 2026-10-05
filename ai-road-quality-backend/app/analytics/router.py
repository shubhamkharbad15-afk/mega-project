from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.service import get_summary
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.users.models import User


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/summary")
async def summary(

    db: AsyncSession = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    return await get_summary(
        db,
        current_user.id,
    )