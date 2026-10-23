import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models import User


async def get_user_by_id(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> User | None:

    result = await session.execute(
        select(User).where(
            User.id == user_id
        )
    )

    return result.scalar_one_or_none()


async def get_user_by_email(
    session: AsyncSession,
    email: str,
) -> User | None:

    result = await session.execute(
        select(User).where(
            User.email == email.lower()
        )
    )

    return result.scalar_one_or_none()