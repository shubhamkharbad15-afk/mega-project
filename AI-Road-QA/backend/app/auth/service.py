from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import RegisterRequest
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.users.models import User, UserRole
from app.users.service import get_user_by_email


async def register_user(
    session: AsyncSession,
    data: RegisterRequest,
) -> User:

    existing_user = await get_user_by_email(
        session,
        data.email,
    )

    if existing_user:
        raise ValueError(
            "An account with this email already exists"
        )

    user = User(
        name=data.name,
        email=data.email.lower(),
        password_hash=hash_password(
            data.password
        ),
        phone=data.phone,
        role=UserRole.USER.value,
    )

    session.add(user)

    try:
        await session.commit()
        await session.refresh(user)

    except IntegrityError as exc:
        await session.rollback()

        raise ValueError(
            "Unable to create account"
        ) from exc

    return user


async def authenticate_user(
    session: AsyncSession,
    email: str,
    password: str,
) -> User | None:

    user = await get_user_by_email(
        session,
        email,
    )

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user


def issue_token(user: User) -> str:
    return create_access_token(
        str(user.id)
    )