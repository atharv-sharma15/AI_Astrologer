from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    APP_NAME: str = "VedViki"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"

    # AI Configuration (Gemini)
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash", description="Configurable Gemini Model name")

    # Database
    # Default to local SQLite for frictionless local development; supports PostgreSQL via DATABASE_URL
    DATABASE_URL: str = "sqlite+aiosqlite:///./vedviki.db"
    SYNC_DATABASE_URL: str = "sqlite:///./vedviki.db"

    # ChromaDB Vector Database & Storage
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    UPLOAD_DIR: str = "./uploads"
    KNOWLEDGE_BASE_DIR: str = "./data/knowledge_base"

    # File Upload Limits
    MAX_FILE_SIZE_MB: int = 10
    MAX_PDF_PAGES: int = 5
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp", "pdf"]

    # Security & CORS
    SECRET_KEY: str = "vedviki-insecure-dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Feature Flags
    RAG_ENABLED: bool = True
    EPHEMERIS_CALCULATION_ENABLED: bool = False
    DELETE_UPLOAD_AFTER_EXTRACTION: bool = False


settings = Settings()
