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

import os
import tempfile
from functools import lru_cache
from pathlib import Path

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


def _writable(directory: Path) -> bool:
    """Create and remove a file there. os.access only reads the permission bits, which
    a CIFS/SMB mount makes up on the client side."""
    try:
        with tempfile.TemporaryFile(dir=directory):
            return True
    except OSError:
        return False


def _report_folders(excel: Path, skip: Path) -> list[Path]:
    """EXCEL_DIR and every folder under it, except PICTURE_DIR when it lives there:
    photos are only read, so a read-only photo folder is fine."""
    skipped = skip.resolve()
    folders = [excel]
    for root, dirs, _ in os.walk(excel):
        dirs[:] = sorted(name for name in dirs if (Path(root) / name).resolve() != skipped)
        folders.extend(Path(root) / name for name in dirs)
    return folders


def check_directories(settings: Settings) -> None:
    """Fail at startup when the service user cannot use the report or photo folder.

    EXCEL_DIR holds the templates and every generated report, in subfolders
    (<folder>/<year>/<month>) that may have been copied from the Java host with
    their old owner: EXCEL_DIR and every folder already under it must take a new
    file (the image runs as uid 1000). PICTURE_DIR is only read; it may be missing,
    as in Java, which checks each photo file and leaves the cell empty without one.
    When PICTURE_DIR is inside EXCEL_DIR, it is not required to be writable.
    """
    excel = Path(settings.excel_dir)
    if not excel.is_dir():
        raise RuntimeError(f"EXCEL_DIR {excel} does not exist or is not a directory")
    pictures = Path(settings.picture_dir)
    for folder in _report_folders(excel, skip=pictures):
        if not _writable(folder):
            raise RuntimeError(f"EXCEL_DIR {folder} is not writable by uid {os.getuid()}")
    if pictures.is_dir() and not os.access(pictures, os.R_OK | os.X_OK):
        raise RuntimeError(f"PICTURE_DIR {pictures} is not readable by uid {os.getuid()}")


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
