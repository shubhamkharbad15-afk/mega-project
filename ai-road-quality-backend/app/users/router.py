from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.users.models import User
from app.users.schemas import UserResponse


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/me",
    response_model=UserResponse,
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user