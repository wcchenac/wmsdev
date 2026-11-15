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


def test_append_without_rows_leaves_the_file_alone(tmp_path):
    """openpyxl drops a bare <row> on save; Java writes nothing when there is nothing to
    append, so an empty append must not load and save the file."""
    import io
    import zipfile

    import openpyxl

    from app.reports.workbook import append_rows
    from app.xlsx import poi_last_row

    buf = io.BytesIO()
    book = openpyxl.Workbook()
    book.worksheets[0]["A1"] = "header"
    book.save(buf)
    src, out = zipfile.ZipFile(io.BytesIO(buf.getvalue())), io.BytesIO()
    with zipfile.ZipFile(out, "w") as dst:
        for item in src.infolist():
            content = src.read(item.filename)
            if item.filename == "xl/worksheets/sheet1.xml":
                content = content.replace(b"</sheetData>", b'<row r="5"/></sheetData>')
            dst.writestr(item, content)
    path = tmp_path / "report.xlsx"
    path.write_bytes(out.getvalue())
    append_rows(path, [])
    assert path.read_bytes() == out.getvalue()
    assert poi_last_row(path) == 4


@pytest.mark.parametrize("content", [b"", b"this is not a workbook", b"\xd0\xcf\x11\xe0 an .xls renamed"])
@pytest.mark.parametrize("helper", ["ensure_from_template", "recreate_from_template"])
def test_broken_template_fails_before_the_report_is_touched(excel_dir, content, helper):
    """WorkbookFactory.create(template) parses the template first: a template that is not
    a workbook raises, and today's report keeps its content."""
    from app.reports import workbook

    (excel_dir / "STKALLT").mkdir()
    (excel_dir / "STKALLT" / "StockAllocateRecordTemplate.xlsx").write_bytes(content)
    report = excel_dir / "STKALLT" / "2026" / "11" / "StockAllocateRecord-20261113.xlsx"
    report.parent.mkdir(parents=True)
    report.write_bytes(b"today's report")
    with pytest.raises(Exception):  # noqa: B017 - any parse error, as Java's IOException/POI errors
        getattr(workbook, helper)("STKALLT", "StockAllocateRecordTemplate", report)
    assert report.read_bytes() == b"today's report"


def _styled_refs(path):  # noqa: ANN001
    """Cell refs whose saved style is a thin four-sided border and center alignment."""
    import zipfile
    from xml.etree import ElementTree

    ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    with zipfile.ZipFile(path) as book:
        styles = ElementTree.fromstring(book.read("xl/styles.xml"))
        sheet = ElementTree.fromstring(book.read("xl/worksheets/sheet1.xml"))
    borders = styles.findall("m:borders/m:border", ns)
    xfs = styles.findall("m:cellXfs/m:xf", ns)
    good = set()
    for index, xf in enumerate(xfs):
        border = borders[int(xf.get("borderId", "0"))]
        if not all(border.find(f"m:{side}", ns).get("style") == "thin" for side in ("left", "right", "top", "bottom")):
            continue
        align = xf.find("m:alignment", ns)
        if align is None or align.get("horizontal") != "center" or align.get("vertical") != "center":
            continue
        if align.get("wrapText") not in (None, "0"):
            continue
        good.add(str(index))
    return {cell.get("r") for cell in sheet.findall("m:sheetData/m:row/m:c", ns) if cell.get("s") in good}


def _thin_and_centered(cell, *, wrap: bool) -> None:  # noqa: ANN001
    assert cell.alignment.horizontal == "center"
    assert cell.alignment.vertical == "center"
    assert bool(cell.alignment.wrap_text) is wrap
    for side in (cell.border.left, cell.border.right, cell.border.top, cell.border.bottom):
        assert side.style == "thin"


def test_report_cells_match_the_java_styles(excel_dir, monkeypatch):
    """Contract tests compare cell values only. The Java helpers also set a thin
    border and center alignment on every written cell, wrapText on the pull list,
    and the same border on the blank cells of a category-detail merge."""
    import datetime as dt

    import openpyxl

    from app.reports import category, comparison, pull_list
    from app.reports.comparison import FAIL_FONT
    from app.stock.models import OutStockRequest

    pictures = excel_dir / "pictures"
    pictures.mkdir()
    monkeypatch.setenv("PICTURE_DIR", str(pictures))
    get_settings.cache_clear()

    book = openpyxl.Workbook()
    book.worksheets[0]["A1"] = "header"
    (excel_dir / "OutStockList").mkdir()
    book.save(excel_dir / "OutStockList" / "OutStockListTemplate.xlsx")
    (excel_dir / "StockComparisonResult").mkdir()
    book.save(excel_dir / "StockComparisonResult" / "StockComparisonResultTemplate.xlsx")

    day = dt.datetime(2026, 11, 15, 8, 0, 0)
    path, _ = pull_list.create(day)
    pull_list.append(path, [OutStockRequest(
        productNo="CF1001", lotNo="L01", color=3, defect="", quantity="10", reason="門市", requestFrom="A")])
    sheet = openpyxl.load_workbook(path).worksheets[0]
    written = sheet.cell(row=2, column=1)
    assert written.value == "CF1001"
    _thin_and_centered(written, wrap=True)
    assert sheet.cell(row=2, column=6).value is None  # column Java does not create
    assert sheet.cell(row=2, column=6).border.left.style is None

    compare_path = comparison.create(day.date())
    comparison.append(compare_path, [
        ["CF1001", "整支", "1", "1", "碼", "Pass", "0"],
        ["CF1002", "整支", "2", None, "碼", "Fail", None],
    ])
    sheet = openpyxl.load_workbook(compare_path).worksheets[0]
    fail = sheet.cell(row=2, column=1)
    assert fail.value == "CF1002"
    _thin_and_centered(fail, wrap=False)
    assert fail.font.color is not None and fail.font.color.rgb == FAIL_FONT.color.rgb
    assert sheet.cell(row=2, column=4).value is None  # NULL quantity stays blank
    _thin_and_centered(sheet.cell(row=2, column=4), wrap=False)
    assert sheet.cell(row=3, column=1).value is None  # Pass rows are not written

    row = ("CF1001", "L01", "整支", "50", "碼", 3, None, "", "", "進貨單", "2026-11-01", "棉布")
    info = {"CF1001": ["S1", "廠商", "10", "品名", "說明"]}
    name = category.write("棉布", [row], info, {})
    book_path = excel_dir / "CategoryDetail" / name
    # openpyxl's reader strips styles off merged cells that are not the anchor, so
    # the blank cells of a merge are checked in the file itself.
    styled = _styled_refs(book_path)
    # Product-info block: 0-based row 4 is Excel row 5. I5 is the anchor (品名's
    # value sits in the next column); J5/K5 and N5 are the blank merged cells.
    assert {"I5", "J5", "K5", "M5", "N5"} <= styled
    sheet = openpyxl.load_workbook(book_path).worksheets[0]
    data = next(c for row_ in sheet.iter_rows() for c in row_ if c.value == "CF1001")
    _thin_and_centered(data, wrap=False)
    # A null stock cell (瑕疵) is still created and styled.
    blank_stock = sheet.cell(row=data.row, column=7)
    assert blank_stock.value is None
    _thin_and_centered(blank_stock, wrap=False)


def test_recreate_all_leaves_every_report_when_one_template_is_missing(excel_dir):
    """Both templates are parsed before any report is replaced (generateNewFile in the
    patched Java checks both templates first)."""
    import openpyxl

    from app.reports import workbook

    (excel_dir / "STKALLT").mkdir()
    openpyxl.Workbook().save(excel_dir / "STKALLT" / "StockAllocateRecordTemplate.xlsx")
    reports = [
        ("STKALLT", "StockAllocateRecordTemplate", excel_dir / "STKALLT" / "a.xlsx"),
        ("STKADST", "StockAdjustRecordTemplate", excel_dir / "STKADST" / "b.xlsx"),  # no template
    ]
    reports[0][2].write_bytes(b"today's allocation report")
    with pytest.raises(FileNotFoundError):
        workbook.recreate_all_from_templates(reports)
    assert reports[0][2].read_bytes() == b"today's allocation report"
    assert not reports[1][2].exists()
