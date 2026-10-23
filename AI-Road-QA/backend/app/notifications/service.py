import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.notifications.models import Notification


async def create_notification(
    session: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    message: str,
) -> Notification:

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
    )

    session.add(notification)

    await session.commit()

    await session.refresh(
        notification
    )

    return notification


async def list_notifications(
    session: AsyncSession,
    user_id: uuid.UUID,
):

    result = await session.execute(

        select(Notification)

        .where(
            Notification.user_id
            == user_id
        )

        .order_by(
            Notification.created_at.desc()
        )
    )

    return result.scalars().all()