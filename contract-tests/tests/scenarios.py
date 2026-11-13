"""Request builders and multi-step setups shared by the contract tests.

Stock is always created through POST /api/stock/inStocks (the real entry
point), so every implementation is exercised end to end.
"""

from __future__ import annotations

from typing import Any


def in_stock(
    product_no: str,
    quantity: str,
    *,
    type_: str = "整支",
    unit: str = "碼",
    lot_no: str = "L01",
    color: int = 0,
    defect: str = "",
    record: str = "",
    remark: str = "",
    in_stock_type: str = "normal",
    order_no: str = "",
    direct_ship: bool = False,
    out_stock_reason: str = "",
    parent_id: int = 0,
) -> dict[str, Any]:
    return {
        "productNo": product_no,
        "lotNo": lot_no,
        "type": type_,
        "quantity": quantity,
        "unit": unit,
        "color": color,
        "defect": defect,
        "record": record,
        "remark": remark,
        "inStockType": in_stock_type,
        "orderNo": order_no,
        "directShip": direct_ship,
        "outStockReason": out_stock_reason,
        "parentId": parent_id,
    }


# Baseline stock used by most query tests. Resulting stockIdentifier ids:
#   1 CF1001 整支 50 碼  L01
#   2 CF1001 整支 48.5 碼 L01   (different quantity -> new backlog row)
#   3 CF1001 板卷 12 碼  L02
#   4 CF1002 整支 40 碼  L07
#   5 CF1003 板卷 25 公斤 L11
BASELINE = [
    in_stock("CF1001", "50", order_no="IN2026110001", color=3, remark="A區"),
    in_stock("CF1001", "48.5", order_no="IN2026110001", color=3, defect="污", remark="A區"),
    in_stock("CF1001", "12", type_="板卷", lot_no="L02", order_no="IN2026110001", record="邊破"),
    in_stock("CF1002", "40", lot_no="L07", order_no="IN2026110001"),
    in_stock("CF1003", "25", type_="板卷", unit="公斤", lot_no="L11", order_no="IN2026110002"),
]


def seed_baseline(api) -> None:
    resp = api.post("/api/stock/inStocks", json=BASELINE)
    assert resp.status_code == 200, resp.text


def shrink_request(old_id: int, pieces: list[str], *, allocation: float, adjustment: float,
                   product_no: str = "CF1001", type_: str = "整支", unit: str = "碼",
                   lot_no: str = "L01", shrink_type: str = "整支") -> dict[str, Any]:
    return {
        "oldStockIdentifierId": old_id,
        "inStockRequests": [
            in_stock(product_no, q, type_=type_, unit=unit, lot_no=lot_no,
                     in_stock_type="shrink", parent_id=old_id)
            for q in pieces
        ],
        "allocation": allocation,
        "adjustment": adjustment,
        "shrinkType": shrink_type,
    }
