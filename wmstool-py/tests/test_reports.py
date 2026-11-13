import pytest

from app.config import get_settings
from app.files.reports import resolve_download


@pytest.fixture
def excel_dir(tmp_path, monkeypatch):
    monkeypatch.setenv("WMS_DATABASE_URL", "mysql+pymysql://unused/unused")
    monkeypatch.setenv("JWT_SECRET", "QUJD")
    monkeypatch.setenv("ERP_DATABASE_URL", "mssql+pymssql://unused/unused")
    monkeypatch.setenv("EXCEL_DIR", str(tmp_path))
    get_settings.cache_clear()
    (tmp_path / "CategoryDetail").mkdir()
    (tmp_path / "CategoryDetail" / "CategoryDetail-棉布.xlsx").write_bytes(b"x")
    yield tmp_path
    get_settings.cache_clear()


def test_resolves_category_report(excel_dir):
    expected = excel_dir / "CategoryDetail" / "CategoryDetail-棉布.xlsx"
    assert resolve_download("categoryDetail", "CategoryDetail-棉布") == expected
    # FileCenter.tsx builds category-detail names with ".xls"
    assert resolve_download("categoryDetail", "CategoryDetail-棉布.xls") == expected
    assert resolve_download("categoryDetail", "CategoryDetail-棉布.xlsx") == expected


@pytest.mark.parametrize("name", ["../secret", "..\\secret", "C:secret", "C:/secret", "/etc/passwd"])
def test_rejects_names_that_could_leave_the_folder(excel_dir, name):
    assert resolve_download("categoryDetail", name) is None


def test_new_xlsx_wins_over_legacy_xls(excel_dir):
    from app.files.reports import list_categories

    (excel_dir / "CategoryDetail" / "CategoryDetail-棉布.xls").write_bytes(b"legacy")
    (excel_dir / "CategoryDetail" / "CategoryDetail-針織.xls").write_bytes(b"legacy")
    assert resolve_download("categoryDetail", "CategoryDetail-棉布").suffix == ".xlsx"
    assert resolve_download("categoryDetail", "CategoryDetail-針織").suffix == ".xls"
    labels = sorted(c["label"] for c in list_categories())
    assert labels == ["棉布", "針織"]  # 棉布 has both formats but is listed once


def test_rejects_drive_letters_even_where_they_are_plain_names(excel_dir):
    # On Windows (production), Path(folder) / "C:x" is drive-relative and escapes
    # the folder. Refuse ':' everywhere so the check does not depend on the OS.
    (excel_dir / "CategoryDetail" / "C:secret.xlsx").write_bytes(b"x")
    assert resolve_download("categoryDetail", "C:secret") is None


def test_category_report_embeds_photo_bytes_undecoded(excel_dir, monkeypatch):
    """Java's addPicture(bytes, PICTURE_TYPE_JPEG) does not decode the photo: a broken
    file is embedded byte for byte as a JPEG."""
    import zipfile

    from app.reports import category

    pictures = excel_dir / "pictures"
    pictures.mkdir()
    (pictures / "CF1001.jpg").write_bytes(b"this is not a jpeg")
    monkeypatch.setenv("PICTURE_DIR", str(pictures))
    get_settings.cache_clear()
    row = ("CF1001", "L01", "整支", "50", "碼", 3, "", "", "", "進貨單", "2026-11-01", "棉布")
    info = {"CF1001": ["S1", "廠商", "10", "品名", "說明"]}
    name = category.write("棉布", [row], info, {})
    with zipfile.ZipFile(excel_dir / "CategoryDetail" / name) as book:
        media = [n for n in book.namelist() if n.startswith("xl/media/")]
        assert media == ["xl/media/image1.jpeg"]
        assert book.read(media[0]) == b"this is not a jpeg"


def test_rows_with_only_formatting_count_as_last_row(tmp_path):
    """POI counts a row that only has a custom height; it must still count after
    openpyxl saves and reloads the report (a second append on the same day)."""
    import openpyxl

    from app.reports.workbook import append_rows, first_data_row
    from app.xlsx import poi_last_row

    path = tmp_path / "template.xlsx"
    book = openpyxl.Workbook()
    sheet = book.worksheets[0]
    sheet["A1"] = "header"
    sheet.row_dimensions[4].height = 30  # 0-based row 3, no cells
    book.save(path)
    assert first_data_row(path) == 4
    append_rows(path, [{0: "first"}])
    append_rows(path, [{0: "second"}])
    sheet = openpyxl.load_workbook(path).worksheets[0]
    assert [sheet.cell(row=r, column=1).value for r in (5, 6)] == ["first", "second"]
    assert poi_last_row(path) == 5
