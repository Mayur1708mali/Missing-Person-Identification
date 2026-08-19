from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # PostgreSQL
    postgres_user: str = "mpid_user"
    postgres_password: str = "mpid_password"
    postgres_db: str = "missing_person_db"
    database_url: str = "postgresql+asyncpg://mpid_user:mpid_password@localhost:5432/missing_person_db"

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""

    # JWT
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60

    # URLs
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"

    # Media
    media_dir: str = "media"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
