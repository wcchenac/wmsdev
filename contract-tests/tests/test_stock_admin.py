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


def _category_reports():
    import xlrd

    from conftest import EXCEL_DIR

    out = {}
    for path in sorted((EXCEL_DIR / "CategoryDetail").glob("*.xls")) if (EXCEL_DIR / "CategoryDetail").exists() else []:
        sheet = xlrd.open_workbook(str(path)).sheet_by_index(0)
        out[path.name] = {
            "sheet": sheet.name,
            "cells": [[sheet.cell_value(r, c) for c in range(sheet.ncols)] for r in range(sheet.nrows)],
            "merged": sorted(sheet.merged_cells),
        }
    return out


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
