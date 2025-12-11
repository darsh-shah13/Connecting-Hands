"""Main FastAPI application entry point."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, hand_detection, hands
from app.config import settings
from app.db.session import init_db
from app.routers import hand_detection, hands, health
from app.routers.hand_models import router as hand_models_router
from app.routers.sessions import router as sessions_router
from app.routers.storage import router as storage_router
from app.routers.users import router as users_router
from app.storage import ensure_storage_dirs
from app.routers import health, hand_detection, hand_scan

app = FastAPI(
    title=settings.app_name,
    description="Hand gesture recognition and detection API",
    version=settings.app_version,
)


@app.on_event("startup")
async def on_startup() -> None:
    """Initialize persistence + storage."""

    ensure_storage_dirs()

    if settings.database_url.startswith("sqlite:///"):
        db_path = Path(settings.database_url.removeprefix("sqlite:///"))
        db_path.parent.mkdir(parents=True, exist_ok=True)

    init_db()


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Include routers
app.include_router(health.router, prefix=settings.api_prefix, tags=["health"])
app.include_router(hand_detection.router, prefix=settings.api_prefix, tags=["hand-detection"])
app.include_router(hands.router, prefix=settings.api_prefix, tags=["hands"])

app.include_router(users_router, prefix=settings.api_prefix, tags=["users"])
app.include_router(sessions_router, prefix=settings.api_prefix, tags=["sessions"])
app.include_router(hand_models_router, prefix=settings.api_prefix, tags=["hand-models"])
app.include_router(storage_router, prefix=settings.api_prefix, tags=["storage"])
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(hand_detection.router, prefix="/api", tags=["hand-detection"])
app.include_router(hands.router, prefix="/api", tags=["hands"])
app.include_router(hand_scan.router, prefix="/api", tags=["hand-scan"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""

    return {"message": "Welcome to Connecting Hands API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
