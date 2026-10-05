from fastapi import APIRouter, Depends, Query

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.locations.service import get_nearby_reports
from app.users.models import User


router = APIRouter(
    prefix="/locations",
    tags=["GIS / Locations"],
)


@router.get("/nearby")
async def nearby_reports(

    latitude: float = Query(
        ...,
        ge=-90,
        le=90,
    ),

    longitude: float = Query(
        ...,
        ge=-180,
        le=180,
    ),

    radius: int = Query(
        default=2000,
        ge=100,
        le=50000,
    ),

    db: AsyncSession = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    return await get_nearby_reports(
        session=db,
        latitude=latitude,
        longitude=longitude,
        radius=radius,
        citizen_id=current_user.id,
    )