from fastapi import APIRouter, Depends

from app.assistant.schemas import (
    RepairAdviceRequest,
    RepairAdviceResponse,
)

from app.assistant.service import (
    generate_repair_advice
)

from app.core.dependencies import (
    get_current_user
)

from app.users.models import User


router = APIRouter(
    prefix="/assistant",
    tags=["AI Repair Assistant"],
)


@router.post(
    "/repair-advice",
    response_model=RepairAdviceResponse,
)
async def repair_advice(

    data: RepairAdviceRequest,

    current_user: User = Depends(
        get_current_user
    ),

):

    return await generate_repair_advice(
        data
    )