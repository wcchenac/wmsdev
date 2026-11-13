"""/api/file/* — report lookup, download and in-stock Excel import (5 endpoints).

query/{fileCategory}/today, query/{fileCategory}/interval, query/categoryList,
download/{fileCategory}/{fileName}, import/inStockFile
"""

import datetime as dt
import io

import openpyxl
import xlrd

from conftest import client_range, db_state, today, write_report

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
        sheet = xlrd.open_workbook(file_contents=resp.content).sheet_by_index(0)
        record["cells"] = [[sheet.cell_value(r, c) for c in range(sheet.ncols)] for r in range(sheet.nrows)]
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


def test_import_in_stock_file_bad_input(operator, db, golden):
    golden.response("not_excel", operator.post("/api/file/import/inStockFile",
                                               files=[("files", ("x.xlsx", b"not a workbook", XLSX))]))
    bad_row = _xlsx([["CF1001", "L01", "整支", "50", "碼", "紅", None, None, None, "fileImport", None]])
    golden.response("bad_color", operator.post("/api/file/import/inStockFile",
                                               files=[("files", ("bad.xlsx", bad_row, XLSX))]))
    golden.response("no_files", operator.post("/api/file/import/inStockFile"))
    golden.add("db", db_state(db, ["stockidentifier", "stockinfo"]))
