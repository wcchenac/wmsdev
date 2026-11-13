"""Runtime settings, read from environment variables.

They mirror wmstool's application.properties:
  WMS_DATABASE_URL   <- spring.datasource.*        (SQLAlchemy URL, mysql+pymysql://...)
  JWT_SECRET         <- jwt.jwtSecret              (base64, same value as the Java service)
  JWT_EXPIRATION_MS  <- jwt.jwtExpirationInMs
"""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    wms_database_url: str
    jwt_secret: str
    jwt_expiration_ms: int = 43_200_000


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # values come from the environment
