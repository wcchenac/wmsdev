"""Runtime settings, read from environment variables.

They mirror wmstool's application.properties:
  WMS_DATABASE_URL   <- spring.datasource.*        (SQLAlchemy URL, mysql+pymysql://...)
  JWT_SECRET         <- jwt.jwtSecret              (base64, same value as the Java service)
  JWT_EXPIRATION_MS  <- jwt.jwtExpirationInMs
  EXCEL_DIR          <- file.filePathForExcels     (report folders and templates)
"""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    wms_database_url: str
    jwt_secret: str
    jwt_expiration_ms: int = 43_200_000
    excel_dir: str = ""
    picture_dir: str = ""  # file.filePathForPictures: product photos <productNo>.jpg
    erp_database_url: str  # spring.second-datasource.*: mssql+pymssql://user:pass@host:1433/DB (read-only)


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # values come from the environment
