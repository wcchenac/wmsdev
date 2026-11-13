"""/api/stock/* write endpoints. Each test records the HTTP answers, every row of
the stock tables afterwards, and the content of any report the call wrote.

inStocks, inStocks/rollback, updateStock, shrinkStock, shrinkStock/rollback/{id},
shipStock, shipStocks, shipStock/rollback/{id}, waitToShrink/{id},
waitToShrink/rollback/{id}, outStock, outStock/rollback/{id}, outStock/update
"""

import pytest

from conftest import db_state, generated_reports
from scenarios import BASELINE, in_stock, seed_baseline, shrink_request

# POST /api/stock/inStocks -----------------------------------------------------


def test_in_stock_baseline(operator, db, golden):
    golden.response("in_stock", operator.post("/api/stock/inStocks", json=BASELINE))
    golden.add("db", db_state(db))


def test_in_stock_same_lot_twice_increments_serial(operator, db, golden):
    golden.response("first", operator.post("/api/stock/inStocks", json=[in_stock("CF1001", "50")]))
    golden.response("second", operator.post("/api/stock/inStocks", json=[in_stock("CF1001", "50")]))
    golden.add("db", db_state(db, ["stockidentifierbacklog", "stockidentifier", "product"]))


def test_in_stock_unit_conversion(operator, db, golden):
    golden.response("in_stock", operator.post("/api/stock/inStocks", json=[
        in_stock("CF1001", "150", unit="尺"),  # -> 50.00 碼
        in_stock("CF1001", "100", unit="尺", lot_no="L03"),  # -> 33.33 碼
        in_stock("CF1003", "2", type_="雜項", unit="打", lot_no="L12"),  # -> 24 個
    ]))
    golden.add("db", db_state(db, ["stockidentifier", "stockinfo", "product"]))


def test_in_stock_types(operator, db, golden):
    golden.response("in_stock", operator.post("/api/stock/inStocks", json=[
        in_stock("CF1002", "38", order_no="AS2026110001", in_stock_type="assemble"),
        in_stock("CF1001", "8", type_="板卷", order_no="CR2026110001", in_stock_type="customerReturn"),
        in_stock("CF1003", "3.25", type_="板卷", unit="公斤", order_no="SR2026110001", in_stock_type="storeReturn"),
    ]))
    golden.add("db", db_state(db))


def test_in_stock_direct_ship(operator, db, golden):
    golden.response("in_stock", operator.post("/api/stock/inStocks", json=[
        in_stock("CF1001", "50", direct_ship=True, out_stock_reason="直出"),
        in_stock("CF1001", "40"),
    ]))
    golden.add("db", db_state(db))


def test_in_stock_validation(operator, db, golden):
    golden.response("blank_product_no", operator.post("/api/stock/inStocks", json=[in_stock("", "50")]))
    golden.response("blank_quantity", operator.post("/api/stock/inStocks", json=[in_stock("CF1001", "")]))
    golden.response("not_a_list", operator.post("/api/stock/inStocks", json=in_stock("CF1001", "5")))
    golden.response("sales_forbidden", operator.http.post(
        "/api/stock/inStocks", json=[in_stock("CF1001", "5")],
        headers={"Authorization": _token(operator, "sales")}))
    golden.add("db", db_state(db, ["stockidentifier", "stockinfo"]))


def _token(api, employee_id):
    from conftest import login

    return login(api.http, employee_id)


# PATCH /api/stock/inStocks/rollback ---------------------------------------------


def test_in_stock_rollback(admin, db, golden):
    seed_baseline(admin)
    golden.response("rollback_4_5", admin.patch("/api/stock/inStocks/rollback", json=[4, 5]))
    golden.response("rollback_missing", admin.patch("/api/stock/inStocks/rollback", json=[99]))
    golden.add("db", db_state(db))


@pytest.mark.java_bug("rollback stops at the first missing id: earlier ids are deleted but product totals are not reduced")
def test_in_stock_rollback_partial_failure(admin, db, golden):
    seed_baseline(admin)
    golden.response("rollback_4_99", admin.patch("/api/stock/inStocks/rollback", json=[4, 99]))
    golden.add("db", db_state(db))


# PATCH /api/stock/updateStock --------------------------------------------------


def test_update_stock_info(operator, db, golden):
    seed_baseline(operator)
    golden.response("update", operator.patch("/api/stock/updateStock", json={
        "id": 2, "color": 5, "defect": "破", "record": "修補過", "remark": "B區"}))
    golden.response("unknown_id", operator.patch("/api/stock/updateStock", json={
        "id": 99, "color": 0, "defect": "", "record": "", "remark": ""}))
    golden.add("db", db_state(db, ["stockinfo"]))


# POST /api/stock/shrinkStock + PATCH /api/stock/shrinkStock/rollback/{id} -------


def test_shrink_stock(operator, db, golden):
    seed_baseline(operator)
    golden.response("shrink", operator.post("/api/stock/shrinkStock",
                                            json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5)))
    golden.add("db", db_state(db))
    golden.add("reports", generated_reports())


def test_shrink_stock_unit_differs_from_erp_base(operator, db, golden):
    """CF1003's ERP base unit is 公斤; a roll stocked in 碼 records realQuantity = allocation x 3."""
    operator.post("/api/stock/inStocks", json=[in_stock("CF1003", "30", type_="板卷", unit="碼")])
    golden.response("shrink", operator.post("/api/stock/shrinkStock", json=shrink_request(
        1, ["20", "9"], allocation=0.5, adjustment=0.5, product_no="CF1003", type_="板卷", unit="碼",
        lot_no="L01", shrink_type="RB")))
    golden.add("db", db_state(db, ["stockallocationrecord", "stockadjustmentrecord"]))
    golden.add("reports", generated_reports())


def test_shrink_stock_float_rounding(operator, db, golden):
    """allocation/adjustment are Java Floats: widened to double, then %.2f HALF_UP."""
    seed_baseline(operator)
    golden.response("shrink", operator.post("/api/stock/shrinkStock",
                                            json=shrink_request(1, ["30", "19"], allocation=0.1, adjustment=0.125)))
    golden.add("db", db_state(db, ["stockidentifier", "stockallocationrecord", "stockadjustmentrecord"]))
    golden.add("reports", generated_reports())


def test_shrink_stock_report_template_missing(operator, db, golden):
    """The adjustment template is missing: the report write fails with an IOException.
    Java's javax @Transactional commits on checked exceptions, so the shrink is kept,
    the allocation report is written, and the answer is 400."""
    from conftest import EXCEL_DIR

    templates = [EXCEL_DIR / "STKADST" / f"StockAdjustRecordTemplate{ext}" for ext in (".xls", ".xlsx")]
    moved = [(t, t.with_name(t.name + ".moved")) for t in templates if t.exists()]
    for src, dst in moved:
        src.rename(dst)
    try:
        seed_baseline(operator)
        golden.response("shrink", operator.post("/api/stock/shrinkStock",
                                                json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5)))
        golden.add("db", db_state(db, ["stockidentifier", "transactionrecord", "stockallocationrecord",
                                       "stockadjustmentrecord"]))
        golden.add("reports", generated_reports())
    finally:
        for src, dst in moved:
            dst.rename(src)


def test_shrink_stock_without_pieces_field(operator, db, golden):
    """No `inStockRequests` key: Java iterates a null list (NullPointerException) -> 400, rolled back."""
    seed_baseline(operator)
    body = shrink_request(1, ["30", "19"], allocation=0, adjustment=0)
    del body["inStockRequests"]
    golden.response("shrink", operator.post("/api/stock/shrinkStock", json=body))
    golden.add("db", db_state(db, ["stockidentifier", "transactionrecord", "product"]))


def test_shrink_stock_without_adjustment(operator, db, golden):
    seed_baseline(operator)
    golden.response("shrink", operator.post("/api/stock/shrinkStock",
                                            json=shrink_request(4, ["25", "15"], allocation=0, adjustment=0,
                                                                product_no="CF1002", lot_no="L07")))
    golden.add("db", db_state(db))
    golden.add("reports", generated_reports())


@pytest.mark.java_bug(
    "History.childrenIdentifierId is a Java-serialized Long[] in a tinyblob (255 bytes): "
    "106 + 14n bytes, so an 11th child overflows and the whole shrink is rejected"
)
def test_shrink_stock_child_limit(operator, db, golden):
    seed_baseline(operator)
    golden.response("10_pieces", operator.post("/api/stock/shrinkStock",
                                               json=shrink_request(1, ["4"] * 10, allocation=0, adjustment=0)))
    golden.response("11_pieces", operator.post("/api/stock/shrinkStock",
                                               json=shrink_request(2, ["4"] * 11, allocation=0, adjustment=0)))
    golden.add("db", db_state(db, ["stockidentifier", "history"]))


def test_shrink_stock_rollback(admin, db, golden):
    seed_baseline(admin)
    admin.post("/api/stock/shrinkStock", json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5))
    golden.response("rollback", admin.patch("/api/stock/shrinkStock/rollback/1"))
    golden.response("rollback_not_shrunk", admin.patch("/api/stock/shrinkStock/rollback/2"))
    golden.add("db", db_state(db))
    golden.add("reports", generated_reports())


# PATCH /api/stock/shipStock(s) + shipStock/rollback/{id} --------------------------


def test_ship_stock(operator, db, golden):
    seed_baseline(operator)
    golden.response("ship_one", operator.patch("/api/stock/shipStock", json={"stockIdentifierId": 2, "reason": "出貨"}))
    golden.response("blank_reason", operator.patch("/api/stock/shipStock", json={"stockIdentifierId": 3, "reason": ""}))
    golden.add("db", db_state(db))


def test_ship_stocks(operator, db, golden):
    seed_baseline(operator)
    golden.response("ship_many", operator.patch("/api/stock/shipStocks", json=[
        {"stockIdentifierId": 3, "reason": "出貨"}, {"stockIdentifierId": 4, "reason": "樣品"}]))
    golden.add("db", db_state(db))


def test_ship_stock_blank_reason_rules(operator, db, golden):
    """@NotBlank uses Java String.trim(): only chars <= U+0020 count as blank.
    A full-width space (common with Chinese IMEs) is NOT blank; \\x01 is."""
    seed_baseline(operator)
    golden.response("fullwidth_space", operator.patch("/api/stock/shipStock",
                                                      json={"stockIdentifierId": 2, "reason": "　"}))
    golden.response("control_char", operator.patch("/api/stock/shipStock",
                                                   json={"stockIdentifierId": 3, "reason": "\x01"}))
    golden.response("list_control_char", operator.patch("/api/stock/shipStocks",
                                                        json=[{"stockIdentifierId": 4, "reason": "\x01"}]))
    golden.add("db", db_state(db, ["stockidentifier", "outstockrequest"]))


def test_ship_same_identifier_twice(operator, db, golden):
    """Java does not check isExist: a second ship creates another pull request and
    deducts the product again; the later rollback then finds two live requests."""
    seed_baseline(operator)
    ship = {"stockIdentifierId": 2, "reason": "出貨"}
    golden.response("first", operator.patch("/api/stock/shipStock", json=ship))
    golden.response("second", operator.patch("/api/stock/shipStock", json=ship))
    golden.response("rollback", operator.patch("/api/stock/shipStock/rollback/2"))
    golden.add("db", db_state(db, ["stockidentifier", "outstockrequest", "transactionrecord", "product"]))


def test_ship_stocks_partial_failure(operator, db, golden):
    seed_baseline(operator)
    golden.response("ship_3_and_99", operator.patch("/api/stock/shipStocks", json=[
        {"stockIdentifierId": 3, "reason": "出貨"}, {"stockIdentifierId": 99, "reason": "出貨"}]))
    golden.add("db", db_state(db))


def test_ship_stock_rollback(operator, db, golden):
    seed_baseline(operator)
    operator.patch("/api/stock/shipStock", json={"stockIdentifierId": 2, "reason": "出貨"})
    golden.response("rollback", operator.patch("/api/stock/shipStock/rollback/2"))
    golden.add("db", db_state(db))


# PATCH /api/stock/waitToShrink/{id} + waitToShrink/rollback/{id} -----------------


def test_wait_to_shrink(operator, db, golden):
    seed_baseline(operator)
    golden.response("mark", operator.patch("/api/stock/waitToShrink/3"))
    golden.add("db_marked", db_state(db, ["stockidentifier", "outstockrequest"]))
    golden.response("rollback", operator.patch("/api/stock/waitToShrink/rollback/3"))
    golden.add("db_rolled_back", db_state(db, ["stockidentifier", "outstockrequest"]))


def test_wait_to_shrink_misc_type(operator, db, golden):
    """雜項 stock is 分裝 (repacked), not 減肥 (shrunk)."""
    operator.post("/api/stock/inStocks", json=[in_stock("CF1003", "5", type_="雜項", unit="公斤")])
    golden.response("mark", operator.patch("/api/stock/waitToShrink/1"))
    golden.add("db", db_state(db, ["outstockrequest"]))


# POST /api/stock/outStock + outStock/rollback/{id} + outStock/update -------------


OUT_STOCK = {"productNo": "CF1002", "lotNo": "L07", "type": "整支", "quantity": "10", "unit": "碼",
             "color": 0, "defect": "", "reason": "門市拉貨"}


def test_out_stock_request(operator, db, golden):
    golden.response("create", operator.post("/api/stock/outStock", json=OUT_STOCK))
    golden.response("rollback", operator.patch("/api/stock/outStock/rollback/1"))
    golden.add("db", db_state(db, ["outstockrequest"]))


def test_out_stock_update_follows_json_key_order(operator, db, golden):
    """Jackson fills Map<Long, String> with a LinkedHashMap: rows follow the JSON key
    order (2 then 17), not HashMap order (which would be 17 then 2)."""
    for _ in range(17):
        operator.post("/api/stock/outStock", json=OUT_STOCK)
    golden.response("update", operator.patch("/api/stock/outStock/update",
                                             json={"outStockUpdate": {"2": "門市A", "17": "門市B"}}))
    golden.add("reports", generated_reports())


@pytest.mark.java_bug(
    "rollbackShrink catches the NonUniqueResultException itself and commits: the children's history "
    "rows are deleted and the root's children list emptied, while the pieces and both SKO rows stay (200)"
)
def test_shrink_rollback_after_double_shrink(admin, db, golden):
    """A roll shrunk twice has two SKO records. Recorded on Java (2026-11-13): 200 with a
    half-done rollback — not the 400 a Spring-semantics reading predicted."""
    seed_baseline(admin)
    admin.post("/api/stock/shrinkStock", json=shrink_request(1, ["30", "19"], allocation=0, adjustment=0))
    admin.post("/api/stock/shrinkStock", json=shrink_request(1, ["10", "9"], allocation=0, adjustment=0))
    golden.add("before", db_state(db, ["stockidentifier", "history", "transactionrecord", "stockinfo"]))
    golden.response("rollback", admin.patch("/api/stock/shrinkStock/rollback/1"))
    golden.add("after", db_state(db, ["stockidentifier", "history", "transactionrecord", "stockinfo"]))


def test_out_stock_update_without_map(operator, db, golden):
    """Body `{}`: Java creates the pull-list workbook, then NPEs on the null map -> 400,
    rolled back, the template-only workbook stays."""
    operator.post("/api/stock/outStock", json=OUT_STOCK)
    golden.response("update", operator.patch("/api/stock/outStock/update", json={}))
    golden.add("db", db_state(db, ["outstockrequest"]))
    golden.add("reports", generated_reports())


def test_out_stock_update_unknown_id(operator, db, golden):
    """Java creates the pull-list workbook first, then fails on id 99: 400, DB rolled
    back, but the (template-only) workbook stays on disk."""
    operator.post("/api/stock/outStock", json=OUT_STOCK)
    golden.response("update", operator.patch("/api/stock/outStock/update",
                                             json={"outStockUpdate": {"1": "門市A", "99": "門市B"}}))
    golden.add("db", db_state(db, ["outstockrequest"]))
    golden.add("reports", generated_reports())


def test_out_stock_update_writes_pull_list(operator, db, golden):
    seed_baseline(operator)
    operator.patch("/api/stock/shipStock", json={"stockIdentifierId": 2, "reason": "出貨"})
    operator.post("/api/stock/outStock", json=OUT_STOCK)
    golden.response("update", operator.patch("/api/stock/outStock/update",
                                             json={"outStockUpdate": {"1": "門市A", "2": "門市B"}}))
    golden.add("db", db_state(db, ["outstockrequest"]))
    golden.add("reports", generated_reports())
