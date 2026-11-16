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

from pydantic import ValidationError, ValidationInfo, field_validator
from pydantic_settings import BaseSettings

_DIR_ENV = {"excel_dir": "EXCEL_DIR", "picture_dir": "PICTURE_DIR"}


class Settings(BaseSettings):
    wms_database_url: str
    jwt_secret: str
    jwt_expiration_ms: int = 43_200_000
    # file.filePathForExcels / file.filePathForPictures. No default: an empty path
    # would make reports and photos fail later with a confusing "not found".
    excel_dir: str
    picture_dir: str
    erp_database_url: str  # spring.second-datasource.*: mssql+pymssql://user:pass@host:1433/DB (read-only)
    db_pool_size: int = 5
    db_pool_max_overflow: int = 10
    db_pool_recycle: int = 3600  # seconds

    @field_validator("excel_dir", "picture_dir")
    @classmethod
    def _directory_is_set(cls, value: str, info: ValidationInfo) -> str:
        if not value.strip():
            raise ValueError(f"{_DIR_ENV[info.field_name]} must be set to a directory")
        return value


@lru_cache
def get_settings() -> Settings:
    """Load settings. EXCEL_DIR and PICTURE_DIR must be set; create_app() calls this
    at startup so a missing directory fails before the server accepts traffic."""
    try:
        return Settings()  # type: ignore[call-arg]  # values come from the environment
    except ValidationError as exc:
        missing_dirs = []
        other = False
        for err in exc.errors():
            field = str(err["loc"][0]) if err["loc"] else ""
            if field in _DIR_ENV:
                missing_dirs.append(_DIR_ENV[field])
            else:
                other = True
        if missing_dirs and not other:
            names = ", ".join(dict.fromkeys(missing_dirs))
            raise RuntimeError(
                f"{names} must be set to a directory. "
                "Report and picture paths no longer default to an empty string."
            ) from exc
        raise
