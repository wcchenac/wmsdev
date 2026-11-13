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


@pytest.mark.java_bug("rollbackInStock swallows its own failure: an unknown id answers 200 "
                      "(patched Java rolls the request back and answers 400)")
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


@pytest.mark.java_bug("the shrink is committed but the report IOException answers 400, so users shrink "
                      "again; patched Java keeps 200 and only logs the report failure")
def test_shrink_stock_report_template_missing(operator, db, golden):
    """The adjustment template is missing: the report write fails with an IOException.
    Java's javax @Transactional commits on checked exceptions, so the shrink is kept,
    the allocation report is written, and the answer is 400."""
    from conftest import templates_missing

    with templates_missing("STKADST/StockAdjustRecordTemplate"):
        seed_baseline(operator)
        golden.response("shrink", operator.post("/api/stock/shrinkStock",
                                                json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5)))
        golden.add("db", db_state(db, ["stockidentifier", "transactionrecord", "stockallocationrecord",
                                       "stockadjustmentrecord"]))
        golden.add("reports", generated_reports())


@pytest.mark.java_bug("the shrink is committed but the report IOException answers 400, so users shrink "
                      "again; patched Java keeps 200 and only logs the report failure")
def test_shrink_stock_template_missing_with_todays_report(operator, db, golden):
    """Java's createNewFile reads the template even when today's report already exists:
    with the allocation template gone, a second shrink fails while writing (400, shrink
    kept) and today's allocation report keeps only the first shrink's row."""
    from conftest import templates_missing

    seed_baseline(operator)
    golden.response("first", operator.post("/api/stock/shrinkStock",
                                           json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5)))
    with templates_missing("STKALLT/StockAllocateRecordTemplate"):
        golden.response("second", operator.post("/api/stock/shrinkStock",
                                                json=shrink_request(2, ["20", "28"], allocation=0.5, adjustment=0)))
        golden.add("db", db_state(db, ["stockidentifier", "stockallocationrecord", "stockadjustmentrecord"]))
        golden.add("reports", generated_reports())


@pytest.mark.java_bug("rollbackShrink swallows the report IOException and commits the rollback (200); "
                      "patched Java rolls the whole rollback back and answers 400")
def test_shrink_rollback_template_missing_keeps_reports(admin, db, golden):
    """The rollback rewrites today's reports (deleteAndCreateNewFile), which reads the
    template before deleting: with the allocation template gone, today's reports stay."""
    from conftest import templates_missing

    seed_baseline(admin)
    admin.post("/api/stock/shrinkStock", json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5))
    with templates_missing("STKALLT/StockAllocateRecordTemplate"):
        golden.response("rollback", admin.patch("/api/stock/shrinkStock/rollback/1"))
        golden.add("db", db_state(db, ["stockidentifier", "stockallocationrecord", "stockadjustmentrecord"]))
        golden.add("reports", generated_reports())


@pytest.mark.java_bug("rollbackShrink swallows the report IOException and commits the rollback (200); "
                      "patched Java rolls the whole rollback back and answers 400")
def test_shrink_rollback_adjustment_template_missing(admin, db, golden):
    """generateNewFile recreates both reports from their templates before writing any
    row: with the adjustment template gone, the allocation report is already reset to
    the empty template when the adjustment one fails. Two rolls are shrunk so that
    today still has records (roll 2's) after rolling roll 1 back."""
    from conftest import templates_missing

    seed_baseline(admin)
    admin.post("/api/stock/shrinkStock", json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5))
    admin.post("/api/stock/shrinkStock", json=shrink_request(2, ["20", "28"], allocation=0.5, adjustment=0.5))
    with templates_missing("STKADST/StockAdjustRecordTemplate"):
        golden.response("rollback", admin.patch("/api/stock/shrinkStock/rollback/1"))
        golden.add("db", db_state(db, ["stockidentifier", "stockallocationrecord", "stockadjustmentrecord"]))
        golden.add("reports", generated_reports())


@pytest.mark.java_bug("a missing field answers an empty 400; patched Java names the field "
                      "({field: message}, like the validation errors)")
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


@pytest.mark.java_bug("rolling back a roll that was never shrunk fails inside rollbackShrink, which "
                      "swallows it (200); patched Java answers 400")
def test_shrink_stock_rollback(admin, db, golden):
    seed_baseline(admin)
    admin.post("/api/stock/shrinkStock", json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5))
    golden.response("rollback", admin.patch("/api/stock/shrinkStock/rollback/1"))
    golden.response("rollback_not_shrunk", admin.patch("/api/stock/shrinkStock/rollback/2"))
    golden.add("db", db_state(db))
    golden.add("reports", generated_reports())


# PATCH /api/stock/shipStock(s) + shipStock/rollback/{id} --------------------------


def test_shrink_stock_rollback_db_error(admin, db, golden):
    """A database error in the middle of the rollback (here: deleting stockinfo) — Java
    answers 400 and the whole rollback is undone."""
    from conftest import root_connection

    seed_baseline(admin)
    admin.post("/api/stock/shrinkStock", json=shrink_request(1, ["30", "19"], allocation=0, adjustment=0))
    golden.add("before", db_state(db, ["stockidentifier", "history", "transactionrecord", "stockinfo"]))
    root = root_connection()
    try:
        with root.cursor() as cur:
            cur.execute("DROP TRIGGER IF EXISTS contract_fail_stockinfo_delete")  # left by a killed run
            cur.execute("CREATE TRIGGER contract_fail_stockinfo_delete BEFORE DELETE ON stockinfo FOR EACH ROW "
                        "SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'contract test: stockinfo delete fails'")
        golden.response("rollback", admin.patch("/api/stock/shrinkStock/rollback/1"))
    finally:
        with root.cursor() as cur:
            cur.execute("DROP TRIGGER IF EXISTS contract_fail_stockinfo_delete")
        root.close()
    golden.add("after", db_state(db, ["stockidentifier", "history", "transactionrecord", "stockinfo"]))


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


@pytest.mark.java_bug("a missing field answers an empty 400 and leaves a template-only pull list behind; "
                      "patched Java checks first, names the field and writes no file")
def test_out_stock_update_without_map(operator, db, golden):
    """Body `{}`: Java creates the pull-list workbook, then NPEs on the null map -> 400,
    rolled back, the template-only workbook stays."""
    operator.post("/api/stock/outStock", json=OUT_STOCK)
    golden.response("update", operator.patch("/api/stock/outStock/update", json={}))
    golden.add("db", db_state(db, ["outstockrequest"]))
    golden.add("reports", generated_reports())


@pytest.mark.java_bug("a second update in the same second rewrites the pull list from the template and "
                      "drops the first update's rows; patched Java appends to the existing file")
def test_out_stock_update_twice_in_one_second(operator, db, golden):
    """The pull-list name has second precision. Java's createNewFile rewrites the template
    even when the file exists, so a second update in the same second replaces the first
    update's rows; both requests still point at that one file.

    The file name comes from the server's clock, the alignment from the client's, so on
    a slow machine the two updates can still straddle a second: start over (clean
    database and reports) up to three times before giving up."""
    import time

    from conftest import reset_database, reset_files, rows

    def attempt():
        reset_database(db)  # ids restart at 1 on every attempt (TRUNCATE)
        reset_files()
        operator.post("/api/stock/outStock", json=OUT_STOCK)
        operator.post("/api/stock/outStock", json=OUT_STOCK)
        time.sleep(1.05 - (time.time() % 1))  # start just after a second boundary
        first = operator.patch("/api/stock/outStock/update", json={"outStockUpdate": {"1": "門市A"}})
        second = operator.patch("/api/stock/outStock/update", json={"outStockUpdate": {"2": "門市B"}})
        names = {r["fileName"] for r in rows(db, "SELECT fileName FROM outstockrequest")}
        return first, second, names

    attempts = 3
    first, second, names = attempt()
    for _ in range(attempts - 1):
        if len(names) == 1:
            break
        first, second, names = attempt()
    if len(names) != 1:
        pytest.fail(f"the two updates crossed a second boundary on all {attempts} attempts ({names})")
    golden.response("first", first)
    golden.response("second", second)
    golden.add("reports", generated_reports())


FORMATTED_TEMPLATES = {"OutStockList": "OutStockListTemplate", "STKADST": "StockAdjustRecordTemplate",
                       "STKALLT": "StockAllocateRecordTemplate"}


def test_reports_from_formatted_templates(operator, golden):
    """Hand-made templates carry rows below the header: bordered empty cells (rows 1-2)
    and a row with only a custom height (row 3); fixtures/formatted-templates, the .xlsx
    converted with LibreOffice as at cutover. POI's getLastRowNum() counts every row
    record, so Java writes the first data row at row 4 and the 序號 starts at 3."""
    from conftest import ROOT, templates_swapped

    fixtures = ROOT / "fixtures" / "formatted-templates"
    with templates_swapped({f"{folder}/{name}{ext}": fixtures / f"{name}{ext}"
                            for folder, name in FORMATTED_TEMPLATES.items() for ext in (".xls", ".xlsx")}):
        seed_baseline(operator)
        golden.response("shrink", operator.post("/api/stock/shrinkStock",
                                                json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5)))
        operator.post("/api/stock/outStock", json=OUT_STOCK)
        golden.response("pull_list", operator.patch("/api/stock/outStock/update",
                                                    json={"outStockUpdate": {"1": "門市A"}}))
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
