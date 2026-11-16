"""EXCEL_DIR and PICTURE_DIR have no default and are read at startup."""

import pytest

from app.config import get_settings


def _base(monkeypatch) -> None:  # noqa: ANN001
    monkeypatch.setenv("WMS_DATABASE_URL", "mysql+pymysql://unused/unused")
    monkeypatch.setenv("JWT_SECRET", "QUJD")
    monkeypatch.setenv("ERP_DATABASE_URL", "mssql+pymssql://unused/unused")
    get_settings.cache_clear()


def test_unset_directories_fail_with_the_env_names(monkeypatch):
    _base(monkeypatch)
    monkeypatch.delenv("EXCEL_DIR", raising=False)
    monkeypatch.delenv("PICTURE_DIR", raising=False)
    with pytest.raises(RuntimeError, match="EXCEL_DIR") as exc:
        get_settings()
    assert "PICTURE_DIR" in str(exc.value)
    assert "empty string" in str(exc.value)


def test_a_blank_directory_is_rejected(monkeypatch):
    _base(monkeypatch)
    monkeypatch.setenv("EXCEL_DIR", "  ")
    monkeypatch.setenv("PICTURE_DIR", "/tmp/pictures")
    with pytest.raises(RuntimeError, match="EXCEL_DIR must be set"):
        get_settings()


def test_create_app_fails_when_picture_dir_is_unset(monkeypatch):
    _base(monkeypatch)
    monkeypatch.setenv("EXCEL_DIR", "/tmp/excel")
    monkeypatch.setenv("PICTURE_DIR", "/tmp/pictures")
    from app.main import create_app

    create_app()
    monkeypatch.delenv("PICTURE_DIR")
    get_settings.cache_clear()
    with pytest.raises(RuntimeError, match="PICTURE_DIR"):
        create_app()
