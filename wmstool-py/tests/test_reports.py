import pytest

from app.config import get_settings
from app.files.reports import resolve_download


@pytest.fixture
def excel_dir(tmp_path, monkeypatch):
    monkeypatch.setenv("WMS_DATABASE_URL", "mysql+pymysql://unused/unused")
    monkeypatch.setenv("JWT_SECRET", "QUJD")
    monkeypatch.setenv("EXCEL_DIR", str(tmp_path))
    get_settings.cache_clear()
    (tmp_path / "CategoryDetail").mkdir()
    (tmp_path / "CategoryDetail" / "CategoryDetail-棉布.xls").write_bytes(b"x")
    yield tmp_path
    get_settings.cache_clear()


def test_resolves_category_report(excel_dir):
    assert resolve_download("categoryDetail", "CategoryDetail-棉布") == excel_dir / "CategoryDetail" / "CategoryDetail-棉布.xls"


@pytest.mark.parametrize("name", ["../secret", "..\\secret", "C:secret", "C:/secret", "/etc/passwd"])
def test_rejects_names_that_could_leave_the_folder(excel_dir, name):
    assert resolve_download("categoryDetail", name) is None


def test_rejects_drive_letters_even_where_they_are_plain_names(excel_dir):
    # On Windows (production), Path(folder) / "C:x" is drive-relative and escapes
    # the folder. Refuse ':' everywhere so the check does not depend on the OS.
    (excel_dir / "CategoryDetail" / "C:secret.xls").write_bytes(b"x")
    assert resolve_download("categoryDetail", "C:secret") is None
