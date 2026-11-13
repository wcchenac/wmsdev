"""/api/stock/* read endpoints.

queryOrder/{orderType}/{orderNo}, queryStock/query/1|2/{productNo},
queryStock/inStockRollback, queryStock/shrinkList, queryStock/shrinkRollback/{productNo},
outStock/waitHandleList/basic|interval, queryStock/history/{productNo}
"""

import datetime as dt

import pytest

from conftest import client_range, today
from scenarios import seed_baseline, shrink_request

ORDERS = [
    ("inStock", "IN2026110001"),
    ("inStock", "IN2026110002"),
    ("assemble", "AS2026110001"),
    ("customerReturn", "CR2026110001"),
    ("storeReturn", "SR2026110001"),
    ("outStockToStore", "OS2026110001"),
]


# GET /api/stock/queryOrder/{orderType}/{orderNo} -------------------------------


def test_query_order_before_any_stock(store, golden):
    for order_type, order_no in ORDERS:
        golden.response(f"{order_type}/{order_no}", store.get(f"/api/stock/queryOrder/{order_type}/{order_no}"))
    golden.response("unknown_order", store.get("/api/stock/queryOrder/inStock/NOPE"))
    golden.response("unknown_type", store.get("/api/stock/queryOrder/bogus/IN2026110001"))


def test_query_order_after_in_stock(operator, golden):
    seed_baseline(operator)
    for order_type, order_no in ORDERS[:2]:
        golden.response(f"{order_type}/{order_no}", operator.get(f"/api/stock/queryOrder/{order_type}/{order_no}"))


# GET /api/stock/queryStock/query/{1|2}/{productNo} -----------------------------


@pytest.mark.parametrize("mode", ["1", "2"])
def test_query_product(mode, admin, golden):
    seed_baseline(admin)
    for product_no in ["CF1001", "cf1002", "CF1003"]:
        golden.response(product_no, admin.get(f"/api/stock/queryStock/query/{mode}/{product_no}"))


def test_query_product_unknown(admin, golden):
    seed_baseline(admin)
    golden.response("in_erp_not_in_wms", admin.get("/api/stock/queryStock/query/2/CF9999"))
    golden.response("nowhere", admin.get("/api/stock/queryStock/query/2/ZZ0000"))


def test_query_product_role_split(sales, store, golden):
    """Mode 1 (detail, with supplier/cost) is not open to ROLE_Normal."""
    golden.response("sales_detail", sales.get("/api/stock/queryStock/query/1/CF1001"))
    golden.response("store_detail", store.get("/api/stock/queryStock/query/1/CF1001"))
    golden.response("store_basic", store.get("/api/stock/queryStock/query/2/CF1001"))


# GET /api/stock/queryStock/inStockRollback ------------------------------------


def test_in_stock_rollback_list(admin, golden):
    seed_baseline(admin)
    for order_type in ["normal", "進貨單", "inStock"]:
        golden.response(order_type, admin.get("/api/stock/queryStock/inStockRollback",
                                              params={"orderType": order_type, "orderNo": "IN2026110001"}))
    golden.response("missing_params", admin.get("/api/stock/queryStock/inStockRollback"))


# GET /api/stock/queryStock/shrinkList -----------------------------------------


def test_shrink_list(operator, golden):
    seed_baseline(operator)
    golden.response("empty", operator.get("/api/stock/queryStock/shrinkList"))
    operator.patch("/api/stock/waitToShrink/3")
    operator.patch("/api/stock/waitToShrink/5")
    golden.response("two_waiting", operator.get("/api/stock/queryStock/shrinkList"))


# GET /api/stock/queryStock/shrinkRollback/{productNo} --------------------------


def test_shrink_rollback_list(operator, golden):
    seed_baseline(operator)
    golden.response("before", operator.get("/api/stock/queryStock/shrinkRollback/CF1001"))
    resp = operator.post("/api/stock/shrinkStock", json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5))
    assert resp.status_code == 200, resp.text
    golden.response("after", operator.get("/api/stock/queryStock/shrinkRollback/cf1001"))
    golden.response("other_product", operator.get("/api/stock/queryStock/shrinkRollback/CF1002"))


# GET /api/stock/outStock/waitHandleList/{basic|interval} -----------------------


def _make_out_stock_requests(operator):
    seed_baseline(operator)
    operator.patch("/api/stock/shipStock", json={"stockIdentifierId": 2, "reason": "出貨"})
    operator.patch("/api/stock/waitToShrink/3")
    operator.post("/api/stock/outStock", json={
        "productNo": "CF1002", "lotNo": "L07", "type": "整支", "quantity": "10", "unit": "碼",
        "color": 0, "defect": "", "reason": "門市拉貨"})


def test_wait_handle_list_basic(operator, golden):
    golden.response("empty", operator.get("/api/stock/outStock/waitHandleList/basic"))
    _make_out_stock_requests(operator)
    golden.response("three_requests", operator.get("/api/stock/outStock/waitHandleList/basic"))


def test_wait_handle_list_interval(operator, golden):
    _make_out_stock_requests(operator)
    d = today()
    golden.response("today", operator.get("/api/stock/outStock/waitHandleList/interval",
                                          params=client_range(d, d)))
    golden.response("last_3_days", operator.get("/api/stock/outStock/waitHandleList/interval",
                                                params=client_range(d - dt.timedelta(days=2), d)))
    golden.response("yesterday_only", operator.get("/api/stock/outStock/waitHandleList/interval",
                                                   params=client_range(d - dt.timedelta(days=1),
                                                                       d - dt.timedelta(days=1))))
    golden.response("bad_date", operator.get("/api/stock/outStock/waitHandleList/interval",
                                             params={"startDate": "2026-11-13", "endDate": "x"}))


# GET /api/stock/queryStock/history/{productNo} ---------------------------------


@pytest.mark.java_bug(
    "GET /queryStock/history/{productNo} and /queryStock/history/{id} are the same route; "
    "Spring raises 'Ambiguous handler methods' and answers 500 for every request"
)
def test_history_tree(admin, golden):
    seed_baseline(admin)
    resp = admin.post("/api/stock/shrinkStock", json=shrink_request(1, ["30", "19"], allocation=0.5, adjustment=0.5))
    assert resp.status_code == 200, resp.text
    admin.patch("/api/stock/shipStock", json={"stockIdentifierId": 6, "reason": "出貨"})
    d = today()
    golden.response("CF1001", admin.get("/api/stock/queryStock/history/CF1001", params=client_range(d, d)))
    golden.response("CF1003", admin.get("/api/stock/queryStock/history/cf1003", params=client_range(d, d)))
    golden.response("yesterday", admin.get("/api/stock/queryStock/history/CF1001",
                                           params=client_range(d - dt.timedelta(days=1), d - dt.timedelta(days=1))))
