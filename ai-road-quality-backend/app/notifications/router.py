from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_optional
from app.notifications.schemas import NotificationResponse
from app.notifications.service import list_notifications
from app.users.models import User


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "/",
    response_model=list[NotificationResponse],
)
async def notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    if not current_user:
        return []

    return await list_notifications(
        db,
        current_user.id,
    )