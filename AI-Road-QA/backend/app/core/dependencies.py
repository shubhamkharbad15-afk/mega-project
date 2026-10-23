import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.users.models import User
from app.users.service import get_user_by_id


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)

oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
)

DEFAULT_SYSTEM_USER_ID = uuid.UUID("352b8c46-4a15-424c-99e5-418b8421a857")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:

    user_id = decode_access_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    try:
        parsed_id = uuid.UUID(user_id)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        ) from exc

    user = await get_user_by_id(
        db,
        parsed_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )

    return user


async def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not token:
        return None

    user_id = decode_access_token(token)
    if not user_id:
        return None

    try:
        parsed_id = uuid.UUID(user_id)
    except ValueError:
        return None

    user = await get_user_by_id(
        db,
        parsed_id,
    )

    if not user or not user.is_active:
        return None

    return user


async def get_current_user_or_default(
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
) -> User:
    if current_user:
        return current_user

    user = await get_user_by_id(db, DEFAULT_SYSTEM_USER_ID)
    if user and user.is_active:
        return user

    from sqlalchemy import select
    result = await db.execute(
        select(User).where(User.is_active.is_(True)).limit(1)
    )
    fallback_user = result.scalar_one_or_none()
    if fallback_user:
        return fallback_user

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="No active user found for system attribution",
    )

async def require_staff_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require a verified staff role for municipal workflow mutations."""
    allowed_roles = {"municipal", "admin", "field_contractor"}
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A municipal, contractor, or admin account is required for this action",
        )
    return current_user
