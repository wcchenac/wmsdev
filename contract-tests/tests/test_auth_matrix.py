"""Authorization matrix for all 38 endpoints.

For every endpoint: no token -> 401 (with the login-failure body), and every
role outside its @PreAuthorize list -> 403.

Each probe sends a well-formed request. Spring resolves and validates
arguments *before* @PreAuthorize runs, so a malformed probe would answer 400
and test validation instead of authorization. Rejected requests never reach
the handler, so nothing is written.
"""

import io

import pytest
import xlwt

from conftest import Api

ALL = {"admin", "operator", "sales", "store"}
ADMIN = {"admin"}
OPS = {"admin", "operator"}

IN_STOCK = {"productNo": "CF1001", "lotNo": "L", "type": "整支", "quantity": "1", "unit": "碼", "color": 0,
            "defect": "", "record": "", "remark": "", "inStockType": "normal", "orderNo": "",
            "directShip": False, "outStockReason": "", "parentId": 0}
RANGE = {"startDate": "2026-11-12T16:00:00", "endDate": "2026-11-13T15:59:59"}


def _xls() -> bytes:
    book = xlwt.Workbook()
    book.add_sheet("s").write(0, 0, "x")
    buf = io.BytesIO()
    book.save(buf)
    return buf.getvalue()


# (method, path, roles allowed, request kwargs)
ENDPOINTS = [
    # /api/user
    ("POST", "/api/user/adminManagement/user/register", ADMIN,
     {"json": {"employeeId": "probe", "fullName": "probe", "password": "probe1", "role": "ROLE_Normal"}}),
    ("GET", "/api/user/adminManagement/user/userList", ADMIN, {}),
    ("PATCH", "/api/user/adminManagement/user/update", ADMIN,
     {"json": {"employeeId": "store", "newPassword": "", "fullName": "x", "role": "ROLE_Normal"}}),
    ("DELETE", "/api/user/adminManagement/user/delete", ADMIN, {"params": {"employeeId": "store"}}),
    # /api/stock
    ("GET", "/api/stock/queryOrder/inStock/X", {"admin", "operator", "store"}, {}),
    ("POST", "/api/stock/inStocks", OPS, {"json": [IN_STOCK]}),
    ("GET", "/api/stock/queryStock/inStockRollback", ADMIN, {"params": {"orderType": "normal", "orderNo": "X"}}),
    ("PATCH", "/api/stock/inStocks/rollback", ADMIN, {"json": [1]}),
    ("PATCH", "/api/stock/updateStock", OPS,
     {"json": {"id": 1, "color": 0, "defect": "", "record": "", "remark": ""}}),
    ("GET", "/api/stock/queryStock/query/2/X", ALL, {}),
    ("GET", "/api/stock/queryStock/query/1/X", {"admin", "operator", "sales"}, {}),
    ("POST", "/api/stock/shrinkStock", OPS,
     {"json": {"oldStockIdentifierId": 1, "inStockRequests": [], "allocation": 0, "adjustment": 0,
               "shrinkType": "整支"}}),
    ("PATCH", "/api/stock/shrinkStock/rollback/1", ADMIN, {}),
    ("GET", "/api/stock/queryStock/shrinkRollback/X", OPS, {}),
    ("PATCH", "/api/stock/shipStock", OPS, {"json": {"stockIdentifierId": 1, "reason": "x"}}),
    ("PATCH", "/api/stock/shipStocks", OPS, {"json": [{"stockIdentifierId": 1, "reason": "x"}]}),
    ("PATCH", "/api/stock/shipStock/rollback/1", OPS, {}),
    ("GET", "/api/stock/queryStock/shrinkList", OPS, {}),
    ("PATCH", "/api/stock/waitToShrink/1", OPS, {}),
    ("PATCH", "/api/stock/waitToShrink/rollback/1", OPS, {}),
    ("GET", "/api/stock/outStock/waitHandleList/basic", OPS, {}),
    ("GET", "/api/stock/outStock/waitHandleList/interval", OPS, {"params": RANGE}),
    ("POST", "/api/stock/outStock", OPS, {"json": {"productNo": "CF1001", "reason": "x"}}),
    ("PATCH", "/api/stock/outStock/rollback/1", OPS, {}),
    ("PATCH", "/api/stock/outStock/update", OPS, {"json": {"outStockUpdate": {"1": "x"}}}),
    ("GET", "/api/stock/queryStock/history/X", {"admin", "operator", "sales"}, {"params": RANGE}),
    ("GET", "/api/stock/stockManagement/daily/stockCompare", ADMIN, {}),
    ("GET", "/api/stock/stockManagement/weekly/syncProductCategory", ADMIN, {}),
    ("GET", "/api/stock/queryStock/categoryList", ADMIN, {}),
    ("GET", "/api/stock/queryStock/category/X", ADMIN, {}),
    ("GET", "/api/stock/queryStock/history/1", ADMIN, {"params": {"id": 1}}),
    ("PATCH", "/api/stock/queryStock/updateHistory", ADMIN, {"params": {"id": 1, "childs": "2"}}),
    # /api/file (class-level @PreAuthorize: operator, admin)
    # not a date: the probe never reaches the handler, and a date would rename the golden daily
    ("GET", "/api/file/download/allocation/StockAllocateRecord-X", OPS, {}),
    ("GET", "/api/file/query/allocation/today", OPS, {}),
    ("GET", "/api/file/query/allocation/interval", OPS, {"params": RANGE}),
    ("GET", "/api/file/query/categoryList", OPS, {}),
    ("POST", "/api/file/import/inStockFile", OPS, {"files": [("files", ("x.xls", _xls(), "application/vnd.ms-excel"))]}),
]
# /api/user/login is public and covered in test_user.py: 37 + 1 = 38 endpoints.

assert len(ENDPOINTS) == 37


def _id(endpoint):
    method, path, _, _ = endpoint
    return f"{method} {path}"


@pytest.mark.parametrize("endpoint", ENDPOINTS, ids=[_id(e) for e in ENDPOINTS])
def test_rejections(endpoint, http, golden, request):
    method, path, allowed, kwargs = endpoint
    if "/queryStock/history/" in path:
        request.applymarker(pytest.mark.java_bug("ambiguous history route answers 500 before authorization"))
    golden.response("no_token", Api(http, None).request(method, path, **kwargs))
    for role in sorted(ALL - allowed):
        golden.response(f"as_{role}", Api(http, role).request(method, path, **kwargs))


# A body missing the required field must still be rejected by authorization first:
# @PreAuthorize runs before the method body, where the missing field is checked
# (and named in the 400, defect 12).
MISSING_FIELD = [
    ("POST", "/api/stock/shrinkStock", OPS, {"json": {}}),
    ("PATCH", "/api/stock/outStock/update", OPS, {"json": {}}),
]


@pytest.mark.parametrize("endpoint", MISSING_FIELD, ids=[_id(e) for e in MISSING_FIELD])
def test_rejections_before_missing_field(endpoint, http, golden):
    method, path, allowed, kwargs = endpoint
    golden.response("no_token", Api(http, None).request(method, path, **kwargs))
    for role in sorted(ALL - allowed):
        golden.response(f"as_{role}", Api(http, role).request(method, path, **kwargs))
