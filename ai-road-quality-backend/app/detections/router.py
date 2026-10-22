from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_or_default
from app.detections.schemas import DetectionResponse
from app.detections.service import (
    run_detection,
    save_uploaded_file,
)
from app.users.models import User


router = APIRouter(
    prefix="/detections",
    tags=["AI Detection"],
)


@router.post(
    "/",
    response_model=DetectionResponse,
)
async def detect_road_damage(
    image: UploadFile = File(...),
    latitude: float = Form(..., ge=-90, le=90),
    longitude: float = Form(..., ge=-180, le=180),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_or_default),
):

    if not image.content_type:
        raise HTTPException(
            status_code=400,
            detail="Invalid image",
        )

    if not image.content_type.startswith(
        "image/"
    ):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed",
        )

    content = await image.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty",
        )

    image_path = save_uploaded_file(
        content,
        image.filename or "road.jpg",
    )

    return await run_detection(
        session=db,
        image_path=image_path,
        latitude=latitude,
        longitude=longitude,
        user_id=current_user.id,
    )