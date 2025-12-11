"""Application configuration."""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings

_SERVICE_ROOT = Path(__file__).resolve().parents[1]
_DEFAULT_DATA_DIR = _SERVICE_ROOT / "data"
_DEFAULT_STORAGE_DIR = _SERVICE_ROOT / "storage"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = "Connecting Hands API"
    app_version: str = "0.0.1"
    debug: bool = False
    api_prefix: str = "/api"

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS settings
    cors_origins: list[str] = ["*"]
    cors_allow_credentials: bool = True
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]

    # Storage settings
    # Storage settings (hand scan pipeline)
    jobs_dir: str = "./data/jobs"

    # Model settings
    model_path: str = "./models"
    max_image_size_mb: int = 10

    # Persistence / sharing
    database_url: str = f"sqlite:///{(_DEFAULT_DATA_DIR / 'hand_modeler.db').as_posix()}"

    # Object storage (local disk by default)
    storage_dir: str = str(_DEFAULT_STORAGE_DIR)
    storage_signing_secret: str = "insecure-development-secret"
    signed_url_ttl_seconds: int = 15 * 60
    max_model_size_mb: int = 50

    class Config:
        """Pydantic config."""

        env_file = ".env"
        case_sensitive = False


settings = Settings()
