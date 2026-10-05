from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.analytics.router import (
    router as analytics_router
)

from app.assistant.router import (
    router as assistant_router
)

from app.auth.router import (
    router as auth_router
)

from app.core.config import settings

import app.models  # noqa: F401  # register ORM relationships

from app.detections.router import (
    router as detections_router
)

from app.locations.router import (
    router as locations_router
)

from app.notifications.router import (
    router as notifications_router
)

from app.reports.router import (
    router as reports_router
)

from app.users.router import (
    router as users_router
)


app = FastAPI(

    title=settings.app_name,

    description=(
        "Backend API for AI-powered road-defect "
        "detection, citizen reporting, geo-tagging, "
        "analytics and AI-assisted repair guidance."
    ),

    version=settings.app_version,
)


app.add_middleware(

    CORSMiddleware,

    allow_origins=settings.cors_origin_list,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


API_PREFIX = "/api/v1"


app.include_router(
    auth_router,
    prefix=API_PREFIX,
)

app.include_router(
    users_router,
    prefix=API_PREFIX,
)

app.include_router(
    detections_router,
    prefix=API_PREFIX,
)

app.include_router(
    reports_router,
    prefix=API_PREFIX,
)

app.include_router(
    locations_router,
    prefix=API_PREFIX,
)

app.include_router(
    analytics_router,
    prefix=API_PREFIX,
)

app.include_router(
    notifications_router,
    prefix=API_PREFIX,
)

app.include_router(
    assistant_router,
    prefix=API_PREFIX,
)


@app.get("/")
async def root():

    return {
        "message": settings.app_name,
        "status": "running",
        "version": settings.app_version,
    }


@app.get("/health")
async def health_check():

    return {
        "status": "healthy",
        "ml_provider": settings.ml_provider,
        "database_configured": bool(
            settings.database_url
        ),
    }