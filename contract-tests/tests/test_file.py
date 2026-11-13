"""/api/file/* — report lookup, download and in-stock Excel import (5 endpoints).

query/{fileCategory}/today, query/{fileCategory}/interval, query/categoryList,
download/{fileCategory}/{fileName}, import/inStockFile
"""

import datetime as dt
import io

import openpyxl
import pytest
from conftest import client_range, db_state, read_workbook, rows, today, write_report

CATEGORIES = ["allocation", "adjustment", "dailyComparison", "outStockList", "categoryDetail", "bogus"]


def _ymd(d: dt.date) -> str:
    return d.strftime("%Y%m%d")


def _seed_reports(days_back: int = 3) -> None:
    d = today()
    for i in range(days_back):
        day = d - dt.timedelta(days=i)
        sub = f"{day.year}/{day.month}"
        write_report(f"STKALLT/{sub}/StockAllocateRecord-{_ymd(day)}.xls")
        write_report(f"STKADST/{sub}/StockAdjustRecord-{_ymd(day)}.xls")
        write_report(f"StockComparisonResult/{sub}/StockComparisonResult-{_ymd(day)}.xls")
    write_report("CategoryDetail/CategoryDetail-棉布.xls")
    write_report("CategoryDetail/CategoryDetail-針織.xls")


# GET /api/file/query/{fileCategory}/today ----------------------------------------


def test_query_today(operator, golden):
    for category in CATEGORIES:
        golden.response(f"none/{category}", operator.get(f"/api/file/query/{category}/today"))
    _seed_reports()
    for category in CATEGORIES:
        golden.response(f"seeded/{category}", operator.get(f"/api/file/query/{category}/today"))


# GET /api/file/query/{fileCategory}/interval -------------------------------------


def test_query_interval(operator, golden):
    _seed_reports()
    d = today()
    for category in CATEGORIES:
        golden.response(f"3_days/{category}", operator.get(
            f"/api/file/query/{category}/interval", params=client_range(d - dt.timedelta(days=2), d)))
    golden.response("10_days/allocation", operator.get(
        "/api/file/query/allocation/interval", params=client_range(d - dt.timedelta(days=9), d)))
    golden.response("missing_params", operator.get("/api/file/query/allocation/interval"))


def test_query_interval_longer_than_a_month(operator, golden):
    """Java walks Period.between(start, end).getDays() days: only the days component."""
    for name in ["2026/1/StockAllocateRecord-20260101", "2026/1/StockAllocateRecord-20260105",
                 "2026/1/StockAllocateRecord-20260120", "2026/2/StockAllocateRecord-20260205"]:
        write_report(f"STKALLT/{name}.xls")
    golden.response("jan1_to_feb10", operator.get("/api/file/query/allocation/interval", params={
        "startDate": "2025-12-31T16:00:00", "endDate": "2026-02-10T15:59:59"}))


# GET /api/file/query/categoryList ------------------------------------------------


def test_query_category_list(operator, golden):
    golden.response("no_folder", operator.get("/api/file/query/categoryList"))
    _seed_reports()
    golden.response("two_reports", operator.get("/api/file/query/categoryList"))


# GET /api/file/download/{fileCategory}/{fileName} --------------------------------


def _download_record(resp):
    # Error responses: only the status is contract (their content type is the
    # servlet container's error page, not the API's).
    record = {"status": resp.status_code,
              "content-disposition": resp.headers.get("content-disposition")}
    if resp.status_code == 200:
        record["content-type"] = resp.headers.get("content-type")
        record["cells"] = read_workbook(resp.content)["cells"]
    return record


def test_download(operator, golden):
    _seed_reports()
    name = f"StockAllocateRecord-{_ymd(today())}"
    golden.add("allocation", _download_record(operator.get(f"/api/file/download/allocation/{name}")))
    golden.add("adjustment", _download_record(
        operator.get(f"/api/file/download/adjustment/StockAdjustRecord-{_ymd(today())}")))
    golden.add("categoryDetail", _download_record(
        operator.get("/api/file/download/categoryDetail/CategoryDetail-棉布")))
    golden.add("missing_file", _download_record(
        operator.get("/api/file/download/allocation/StockAllocateRecord-19990101")))
    golden.add("bad_category", _download_record(operator.get(f"/api/file/download/bogus/{name}")))
    golden.add("sales_forbidden", {"status": operator.http.get(
        f"/api/file/download/allocation/{name}",
        headers={"Authorization": _login(operator, "sales")}).status_code})


def test_download_path_traversal(operator, golden):
    write_report("CategoryDetail/CategoryDetail-棉布.xls")
    base = "/api/file/download"
    golden.add("encoded_slash", _download_record(
        operator.get(f"{base}/categoryDetail/..%2F..%2Fconfig%2Fapplication")))
    golden.add("encoded_backslash", _download_record(
        operator.get(f"{base}/categoryDetail/..%5C..%5Cconfig%5Capplication")))
    golden.add("dotdot_name", _download_record(operator.get(f"{base}/categoryDetail/..")))
    golden.add("short_dated_name", _download_record(operator.get(f"{base}/allocation/X")))


def test_legacy_xls_reports_remain_usable(operator, golden):
    """At cutover production still holds the Java service's .xls reports; the rewrite
    (which writes .xlsx) must still list, find and download them."""
    from conftest import write_legacy_report

    d = today()
    sub = f"{d.year}/{d.month}"
    write_legacy_report(f"STKALLT/{sub}/StockAllocateRecord-{_ymd(d)}")
    write_legacy_report(f"STKADST/{sub}/StockAdjustRecord-{_ymd(d)}")
    write_legacy_report(f"StockComparisonResult/{sub}/StockComparisonResult-{_ymd(d)}")
    write_legacy_report("CategoryDetail/CategoryDetail-棉布")
    for category in ("allocation", "adjustment", "dailyComparison"):
        golden.response(f"today/{category}", operator.get(f"/api/file/query/{category}/today"))
    golden.response("interval/allocation", operator.get("/api/file/query/allocation/interval",
                                                        params=client_range(d, d)))
    golden.response("categoryList", operator.get("/api/file/query/categoryList"))
    golden.add("download/allocation", _download_record(
        operator.get(f"/api/file/download/allocation/StockAllocateRecord-{_ymd(d)}")))
    golden.add("download/categoryDetail", _download_record(
        operator.get("/api/file/download/categoryDetail/CategoryDetail-棉布")))


def _login(api, employee_id):
    from conftest import login

    return login(api.http, employee_id)


# POST /api/file/import/inStockFile -----------------------------------------------

IMPORT_HEADER = ["貨號", "批號", "型態", "數量", "單位", "色號", "瑕疵", "備註", "記錄", "進貨方式", "單號"]


def _xlsx(rows) -> bytes:
    book = openpyxl.Workbook()
    sheet = book.active
    assert sheet is not None
    sheet.append(IMPORT_HEADER)
    for row in rows:
        sheet.append(row)
    buf = io.BytesIO()
    book.save(buf)
    return buf.getvalue()


XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def test_import_in_stock_file(operator, db, golden):
    good = _xlsx([
        ["CF1001", "L01", "整支", "50", "碼", 3, None, "A區", None, "fileImport", None],
        ["CF1003", None, "板卷", 25.5, "公斤", 0, "污", None, "邊破", "fileImport", "IMP-1"],
    ])
    golden.response("import", operator.post("/api/file/import/inStockFile",
                                            files=[("files", ("stock.xlsx", good, XLSX))]))
    golden.add("db", db_state(db))


def test_import_failure_inside_intake(operator, db, golden):
    """File B parses but fails inside stock intake ('打' needs an integer quantity)."""
    a = _xlsx([["CF1001", "L01", "整支", "50", "碼", 0, None, None, None, "fileImport", None]])
    b = _xlsx([["CF1003", None, "雜項", 2.5, "打", 0, None, None, None, "fileImport", None]])
    c = _xlsx([["CF1002", "L07", "整支", "40", "碼", 0, None, None, None, "fileImport", None]])
    golden.response("import_a_b_c", operator.post("/api/file/import/inStockFile", files=[
        ("files", ("a.xlsx", a, XLSX)), ("files", ("b.xlsx", b, XLSX)), ("files", ("c.xlsx", c, XLSX))]))
    golden.add("db", db_state(db))


def test_import_created_at_is_utc(operator, db, golden):
    row = _xlsx([["CF1001", "L01", "整支", "50", "碼", 0, None, None, None, "fileImport", None]])
    operator.post("/api/file/import/inStockFile", files=[("files", ("a.xlsx", row, XLSX))])
    (r,) = rows(db, "SELECT TIMESTAMPDIFF(MINUTE, UTC_TIMESTAMP(), createdAt) AS m FROM stockidentifier")
    golden.add("offset_hours", round(r["m"] / 60))


def _post(operator, name, data):
    return operator.post("/api/file/import/inStockFile", files=[("files", (name, data, XLSX))])


def test_import_reuses_backlog_values(operator, db, golden):
    """MySQL matches 'cf1001' to the stored 'CF1001' backlog; Java copies the stored values."""
    row = ["CF1001", "L01", "整支", "50", "碼", 0, None, None, None, "fileImport", None]
    golden.response("first", _post(operator, "a.xlsx", _xlsx([row])))
    golden.response("lower_case", _post(operator, "b.xlsx", _xlsx([["cf1001", "l01"] + row[2:]])))
    golden.response("both_in_one_file", _post(operator, "c.xlsx", _xlsx([row, ["cf1001", "l01"] + row[2:]])))
    golden.add("db", db_state(db))


@pytest.mark.java_bug("a trailing row without cells (here: only a height) makes Java read getCell(0) of it: "
                      "the whole file is skipped (patched Java skips the blank row)")
def test_import_cell_existence(operator, db, golden):
    """POI distinguishes a styled empty cell (text "") from a missing one, and counts empty <row>s."""
    from openpyxl.styles import Font

    book = openpyxl.Workbook()
    sheet = book.active
    assert sheet is not None
    sheet.append(IMPORT_HEADER)
    sheet.append(["CF1001", "L01", None, "50", "碼", 0, None, None, None, "fileImport", None])
    sheet["C2"].font = Font(bold=True)  # 型態: formatted but empty
    buf = io.BytesIO()
    book.save(buf)
    golden.response("styled_blank_type", _post(operator, "styled.xlsx", buf.getvalue()))

    book = openpyxl.Workbook()
    sheet = book.active
    assert sheet is not None
    sheet.append(IMPORT_HEADER)
    sheet.append(["CF1002", "L07", "整支", "40", "碼", 0, None, None, None, "fileImport", None])
    sheet.row_dimensions[5].height = 30  # an empty row 5 that only has a height
    buf = io.BytesIO()
    book.save(buf)
    golden.response("trailing_sized_row", _post(operator, "rows.xlsx", buf.getvalue()))
    golden.add("db", db_state(db))


def _with_trailing_row(data: bytes, row_xml: str) -> bytes:
    """Append a raw <row> element to sheet1's sheetData (openpyxl cannot write every shape)."""
    import zipfile

    src, out = zipfile.ZipFile(io.BytesIO(data)), io.BytesIO()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as dst:
        for item in src.infolist():
            content = src.read(item.filename)
            if item.filename == "xl/worksheets/sheet1.xml":
                content = content.replace(b"</sheetData>", row_xml.encode() + b"</sheetData>")
            dst.writestr(item, content)
    return out.getvalue()


@pytest.mark.java_bug("trailing rows without cells make Java skip the whole file (patched Java skips the rows)")
def test_import_trailing_rows_without_cells(operator, db, golden):
    """XSSF's getLastRowNum() counts every <row> element. A trailing row with no cells,
    whether it only has a row style or no attributes at all, makes Java read getCell(0)
    of an empty row (NullPointerException): the whole file is skipped."""
    row = ["CF1002", "L07", "整支", "40", "碼", 0, None, None, None, "fileImport", None]
    plain = _xlsx([row])
    golden.response("styled_row", _post(operator, "styled.xlsx",
                                        _with_trailing_row(plain, '<row r="5" s="0" customFormat="1"/>')))
    golden.response("bare_row", _post(operator, "bare.xlsx", _with_trailing_row(plain, '<row r="5"/>')))
    golden.add("db", db_state(db, ["stockidentifier"]))


@pytest.mark.java_bug("a row without data (no cells, styled empty cells, whitespace) between data rows "
                      "makes Java read getCell(0) of it (NullPointerException): the whole file is skipped, "
                      "and the API still answers 200")
def test_import_blank_rows_between_data(operator, db, golden):
    """The patched Java skips rows that are missing or whose cells are all empty after trim()."""
    from openpyxl.styles import Font

    def book_with(middle):
        book = openpyxl.Workbook()
        sheet = book.active
        assert sheet is not None
        sheet.append(IMPORT_HEADER)
        sheet.append(["CF1001", "L01", "整支", "50", "碼", 0, None, None, None, "fileImport", None])
        middle(sheet)
        sheet["A4"], sheet["B4"], sheet["C4"], sheet["D4"] = "CF1002", "L07", "整支", "40"
        sheet["E4"], sheet["F4"], sheet["J4"] = "碼", 0, "fileImport"
        buf = io.BytesIO()
        book.save(buf)
        return buf.getvalue()

    def styled(sheet):
        sheet["A3"].font = Font(bold=True)

    def spaces(sheet):
        sheet["A3"], sheet["C3"] = "  ", " "

    golden.response("missing_row", _post(operator, "missing.xlsx", book_with(lambda sheet: None)))
    golden.response("styled_empty_row", _post(operator, "styled.xlsx", book_with(styled)))
    golden.response("whitespace_row", _post(operator, "spaces.xlsx", book_with(spaces)))
    golden.add("db", db_state(db, ["stockidentifier"]))


def test_import_java_number_grammar(operator, db, golden):
    """Full-width digits: Integer.parseInt accepts them, Double.parseDouble does not."""
    def row(quantity, unit, color: object = 0, product="CF1001"):
        return [product, "L01", "整支", quantity, unit, color, None, None, None, "fileImport", None]

    golden.response("fullwidth_feet", _post(operator, "a.xlsx", _xlsx([row("１２", "尺")])))
    golden.response("fullwidth_dozen", _post(operator, "b.xlsx", _xlsx([row("１２", "打", product="CF1003")])))
    golden.response("fullwidth_yards_new_product", _post(operator, "c.xlsx", _xlsx([row("１２", "碼", product="CF1002")])))
    golden.response("fullwidth_color", _post(operator, "d.xlsx", _xlsx([row("5", "碼", color="１")])))
    golden.add("db", db_state(db))


def test_import_in_stock_file_bad_input(operator, db, golden):
    golden.response("not_excel", operator.post("/api/file/import/inStockFile",
                                               files=[("files", ("x.xlsx", b"not a workbook", XLSX))]))
    bad_row = _xlsx([["CF1001", "L01", "整支", "50", "碼", "紅", None, None, None, "fileImport", None]])
    golden.response("bad_color", operator.post("/api/file/import/inStockFile",
                                               files=[("files", ("bad.xlsx", bad_row, XLSX))]))
    golden.response("no_files", operator.post("/api/file/import/inStockFile"))
    golden.add("db", db_state(db, ["stockidentifier", "stockinfo"]))
