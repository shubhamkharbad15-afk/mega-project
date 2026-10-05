import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.reports.schemas import (
    ReportCreate,
    ReportResponse,
)
from app.reports.service import (
    create_report,
    get_report,
    list_reports,
)
from app.users.models import User


router = APIRouter(
    prefix="/reports",
    tags=["Road Reports"],
)


@router.post(
    "/",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_road_report(

    data: ReportCreate,

    db: AsyncSession = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    return await create_report(
        db,
        data,
        current_user.id,
    )


@router.get(
    "/",
    response_model=list[ReportResponse],
)
async def get_my_reports(

    db: AsyncSession = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    return await list_reports(
        db,
        current_user.id,
    )


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
)
async def get_my_report(

    report_id: uuid.UUID,

    db: AsyncSession = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    report = await get_report(
        db,
        report_id,
        current_user.id,
    )

    if not report:

        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    return report