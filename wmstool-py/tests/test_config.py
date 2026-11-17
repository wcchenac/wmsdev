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


def test_create_app_fails_when_picture_dir_is_unset(monkeypatch, tmp_path):
    _base(monkeypatch)
    monkeypatch.setenv("EXCEL_DIR", str(tmp_path))
    monkeypatch.setenv("PICTURE_DIR", str(tmp_path))
    from app.main import create_app

    create_app()
    monkeypatch.delenv("PICTURE_DIR")
    get_settings.cache_clear()
    with pytest.raises(RuntimeError, match="PICTURE_DIR"):
        create_app()


# The directories themselves: the service writes every report under EXCEL_DIR and only
# reads product photos from PICTURE_DIR. A directory the service user (uid 1000 in the
# image) cannot use should stop the start, not the first report hours later.


def _dirs(monkeypatch, excel, pictures) -> None:  # noqa: ANN001
    _base(monkeypatch)
    monkeypatch.setenv("EXCEL_DIR", str(excel))
    monkeypatch.setenv("PICTURE_DIR", str(pictures))


def test_create_app_fails_when_excel_dir_does_not_exist(monkeypatch, tmp_path):
    from app.main import create_app

    _dirs(monkeypatch, tmp_path / "missing", tmp_path)
    with pytest.raises(RuntimeError, match=r"EXCEL_DIR .*missing.* does not exist"):
        create_app()


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can write anywhere")
def test_create_app_fails_when_excel_dir_is_not_writable(monkeypatch, tmp_path):
    from app.main import create_app

    excel = tmp_path / "excels"
    excel.mkdir()
    excel.chmod(0o555)
    try:
        _dirs(monkeypatch, excel, tmp_path)
        with pytest.raises(RuntimeError, match="EXCEL_DIR .* is not writable"):
            create_app()
    finally:
        excel.chmod(0o755)


def test_create_app_accepts_a_missing_picture_dir(monkeypatch, tmp_path):
    """Java only checks each photo file: without the folder, reports have no photos."""
    from app.main import create_app

    _dirs(monkeypatch, tmp_path, tmp_path / "no-pictures-yet")
    create_app()


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can read anywhere")
def test_create_app_fails_when_picture_dir_is_not_readable(monkeypatch, tmp_path):
    from app.main import create_app

    pictures = tmp_path / "pictures"
    pictures.mkdir()
    pictures.chmod(0o000)
    try:
        _dirs(monkeypatch, tmp_path, pictures)
        with pytest.raises(RuntimeError, match="PICTURE_DIR .* is not readable"):
            create_app()
    finally:
        pictures.chmod(0o755)


def test_create_app_accepts_a_read_only_picture_dir(monkeypatch, tmp_path):
    """Photos are only read: a read-only mount is fine."""
    from app.main import create_app

    pictures = tmp_path / "pictures"
    pictures.mkdir()
    pictures.chmod(0o555)
    try:
        _dirs(monkeypatch, tmp_path, pictures)
        create_app()
    finally:
        pictures.chmod(0o755)


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can write anywhere")
def test_create_app_fails_when_an_existing_report_subfolder_is_not_writable(monkeypatch, tmp_path):
    """Reports go to EXCEL_DIR/<folder>/<year>/<month>. Folders copied from the Java
    host keep their owner; one the service cannot write must stop the start."""
    from app.main import create_app

    month = tmp_path / "STKALLT" / "2026" / "11"
    month.mkdir(parents=True)
    month.chmod(0o555)
    try:
        _dirs(monkeypatch, tmp_path, tmp_path)
        with pytest.raises(RuntimeError, match=r"EXCEL_DIR .*STKALLT/2026/11 is not writable"):
            create_app()
    finally:
        month.chmod(0o755)


@pytest.mark.skipif(hasattr(__import__("os"), "geteuid") and __import__("os").geteuid() == 0,
                    reason="root can write anywhere")
def test_the_directory_check_writes_instead_of_trusting_access(monkeypatch, tmp_path):
    """On CIFS/SMB mounts the permission bits are made up on the client: os.access can
    say yes while the server refuses the write. The check writes a file instead."""
    import os

    from app.main import create_app

    excel = tmp_path / "excels"
    excel.mkdir()
    excel.chmod(0o555)
    monkeypatch.setattr(os, "access", lambda *args, **kwargs: True)
    try:
        _dirs(monkeypatch, excel, tmp_path)
        with pytest.raises(RuntimeError, match="EXCEL_DIR .* is not writable"):
            create_app()
    finally:
        excel.chmod(0o755)


def test_the_directory_check_leaves_no_file_behind(monkeypatch, tmp_path):
    from app.main import create_app

    (tmp_path / "STKALLT" / "2026" / "11").mkdir(parents=True)
    _dirs(monkeypatch, tmp_path, tmp_path)
    create_app()
    assert [p for p in tmp_path.rglob("*") if p.is_file()] == []
