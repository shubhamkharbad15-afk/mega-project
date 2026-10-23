from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# Package root: ai-road-quality-backend/app (where .env lives)
BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    app_name: str = "AI Road Quality Management System"
    app_version: str = "0.1.0"
    debug: bool = True

    database_url: str = (
        "postgresql+asyncpg://roaduser:roadpassword@localhost:5433/road_quality"
    )

    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    upload_dir: str = "uploads"

    cors_origins: str = "*"

    ml_provider: str = "mock"
    model_path: str = "models/best.pt"
    confidence_threshold: float = 0.40

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]

        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


settings = Settings()