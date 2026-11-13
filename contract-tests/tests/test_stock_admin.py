"""/api/stock/* admin endpoints: ERP comparison, category sync and reports,
and the raw history structure.

stockManagement/daily/stockCompare, stockManagement/weekly/syncProductCategory,
queryStock/categoryList, queryStock/category/{category},
queryStock/history/{id} (GET), queryStock/updateHistory (PATCH)
"""

import pytest

from conftest import db_state, exec_sql, generated_reports, rows
from scenarios import in_stock, seed_baseline, shrink_request

# GET /api/stock/stockManagement/daily/stockCompare -------------------------------


def test_daily_stock_compare(admin, golden):
    seed_baseline(admin)
    admin.post("/api/stock/inStocks", json=[in_stock("CF1002", "40", type_="板卷", lot_no="L08")])
    golden.response("compare", admin.get("/api/stock/stockManagement/daily/stockCompare"))
    golden.add("reports", generated_reports())


def test_daily_stock_compare_failure_resets_todays_report(admin, db, golden):
    """Java recreates today's report from the template *before* comparing. A failure in
    the comparison (CF1001 整支 has a NULL quantity: NullPointerException) answers 400
    and leaves today's earlier report replaced by the empty template."""
    seed_baseline(admin)
    golden.response("first", admin.get("/api/stock/stockManagement/daily/stockCompare"))
    exec_sql(db, "UPDATE product SET quantity = NULL WHERE productNo = 'CF1001' AND type = '整支'")
    golden.response("second", admin.get("/api/stock/stockManagement/daily/stockCompare"))
    golden.add("reports", generated_reports())


def test_daily_stock_compare_null_quantity_without_erp_match(admin, db, golden):
    """ZZ0001 is not in the ERP and has a NULL quantity: Java only parses the quantity on
    the matched branch, so it writes a Fail row with blank WMS/diff cells (200)."""
    admin.post("/api/stock/inStocks", json=[in_stock("ZZ0001", "5", lot_no="X")])
    exec_sql(db, "UPDATE product SET quantity = NULL WHERE productNo = 'ZZ0001'")
    golden.response("compare", admin.get("/api/stock/stockManagement/daily/stockCompare"))
    golden.add("reports", generated_reports())


def test_daily_stock_compare_twice_same_day(admin, golden):
    seed_baseline(admin)
    golden.response("first", admin.get("/api/stock/stockManagement/daily/stockCompare"))
    golden.response("second", admin.get("/api/stock/stockManagement/daily/stockCompare"))
    golden.add("reports", generated_reports())


# GET /api/stock/stockManagement/weekly/syncProductCategory -------------------------


def test_sync_product_category(admin, db, golden):
    seed_baseline(admin)
    admin.post("/api/stock/inStocks", json=[in_stock("ZZ0001", "1", lot_no="X")])  # not in ERP -> 未分類
    golden.add("before", db_state(db, ["product"]))
    golden.response("sync", admin.get("/api/stock/stockManagement/weekly/syncProductCategory"))
    golden.add("after", db_state(db, ["product"]))


# GET /api/stock/queryStock/categoryList -----------------------------------------


def test_category_list(admin, golden):
    golden.response("no_products", admin.get("/api/stock/queryStock/categoryList"))
    seed_baseline(admin)
    golden.response("before_sync", admin.get("/api/stock/queryStock/categoryList"))
    admin.get("/api/stock/stockManagement/weekly/syncProductCategory")
    golden.response("after_sync", admin.get("/api/stock/queryStock/categoryList"))


# GET /api/stock/queryStock/category/{category} -----------------------------------


def _seed_category_tables(db):
    for row in [
        ("CF1001", "L01", "整支", "50", "碼", 3, "", "A區", "", "進貨單", "2026-11-01", "棉布"),
        ("CF1001", "L02", "板卷", "12", "碼", 0, "", "", "邊破", "進貨單", "2026-11-02", "棉布"),
        ("CF1003", "L11", "板卷", "25", "公斤", 0, "", "", "", "調撥單", "2026-10-20", "針織"),
    ]:
        exec_sql(db, "INSERT INTO categorydetail VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", *row)
    for row in [
        ("CF1001", "出貨", "10.5", "碼", "棉布"),
        ("CF1001", "出貨", "4", "碼", "棉布"),
        ("CF1001", "樣品", "1", "碼", "棉布"),
    ]:
        exec_sql(db, "INSERT INTO salerecords VALUES (%s,%s,%s,%s,%s)", *row)


def test_category_detail_report(admin, db, golden):
    _seed_category_tables(db)
    golden.response("棉布", admin.get("/api/stock/queryStock/category/棉布"))
    golden.response("empty_category", admin.get("/api/stock/queryStock/category/不存在"))
    golden.add("reports", _category_reports())


# A 4x4 JPEG (generated with Pillow) standing in for a product photo.
TINY_JPEG = (
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgy"
    "PC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAEAAQD"
    "ASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKB"
    "kaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZ"
    "mqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQF"
    "BgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5"
    "OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX"
    "2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDkKKKK8U/TD//Z"
)


def test_category_detail_report_with_picture(admin, db, golden):
    """A product photo (pictures/<productNo>.jpg) pushes that product's table 16 rows down instead of 10."""
    import base64

    from conftest import FILES_DIR

    _seed_category_tables(db)
    pictures = FILES_DIR / "pictures"
    pictures.mkdir(parents=True, exist_ok=True)
    picture = pictures / "CF1001.jpg"
    picture.write_bytes(base64.b64decode(TINY_JPEG))
    try:
        golden.response("棉布", admin.get("/api/stock/queryStock/category/棉布"))
        golden.add("reports", _category_reports())
    finally:
        picture.unlink()


def _category_reports():
    from conftest import EXCEL_DIR, read_workbook

    folder = EXCEL_DIR / "CategoryDetail"
    paths = sorted(p for p in folder.iterdir() if p.suffix in (".xls", ".xlsx")) if folder.exists() else []
    return {path.name: read_workbook(path) for path in paths}


# GET /api/stock/queryStock/history/{id} + PATCH /api/stock/queryStock/updateHistory ---


@pytest.mark.java_bug("same route as /queryStock/history/{productNo}: always 500 (ambiguous handler)")
def test_history_structure(admin, golden):
    seed_baseline(admin)
    admin.post("/api/stock/shrinkStock", json=shrink_request(1, ["30", "19"], allocation=0, adjustment=0))
    golden.response("by_root_id", admin.get("/api/stock/queryStock/history/1", params={"id": 1}))


def test_update_history(admin, db, golden):
    seed_baseline(admin)
    golden.response("set_children", admin.patch("/api/stock/queryStock/updateHistory",
                                                params={"id": 2, "childs": "3,4"}))
    golden.response("unknown_id", admin.patch("/api/stock/queryStock/updateHistory",
                                              params={"id": 99, "childs": "1"}))
    golden.response("bad_childs", admin.patch("/api/stock/queryStock/updateHistory",
                                              params={"id": 2, "childs": "a,b"}))
    golden.add("history", rows(db, "SELECT * FROM history ORDER BY id"))
