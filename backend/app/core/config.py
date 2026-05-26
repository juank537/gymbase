from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    project_name: str = "GymBase API"
    database_url: str = "postgresql+asyncpg://gym_user:change_me@localhost:5432/gym_db"
    jwt_secret: str = "your-32-byte-random-secret-here"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

from functools import lru_cache
@lru_cache
def get_settings() -> Settings:
    return Settings()