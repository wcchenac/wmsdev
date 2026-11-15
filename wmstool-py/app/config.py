"""Runtime settings, read from environment variables.

They mirror wmstool's application.properties:
  WMS_DATABASE_URL   <- spring.datasource.*        (SQLAlchemy URL, mysql+pymysql://...)
  JWT_SECRET         <- jwt.jwtSecret              (base64, same value as the Java service)
  JWT_EXPIRATION_MS  <- jwt.jwtExpirationInMs
  EXCEL_DIR          <- file.filePathForExcels     (report folders and templates)
  DB_POOL_SIZE, DB_POOL_MAX_OVERFLOW, DB_POOL_RECYCLE
      QueuePool for both the WMS (MySQL) and ERP (SQL Server) engines.
      pool_pre_ping is always on. pool_recycle should stay below the server's
      wait_timeout so a pooled connection is not used after the server closed it.
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
    db_pool_size: int = 5
    db_pool_max_overflow: int = 10
    db_pool_recycle: int = 3600  # seconds


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # values come from the environment
