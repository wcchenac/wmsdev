"""Time semantics of the Java service (JVM Asia/Taipei, JDBC serverTimezone=UTC).

The DB holds UTC; responses and day grouping use Taipei time. Golden files mask
`createdAt` values elsewhere, so these tests pin the actual values.
"""

import datetime as dt
from zoneinfo import ZoneInfo

from conftest import client_range, exec_sql

TAIPEI = ZoneInfo("Asia/Taipei")
OUT_STOCK = {"productNo": "CF1002", "lotNo": "L07", "type": "整支", "quantity": "10", "unit": "碼",
             "color": 0, "defect": "", "reason": "門市拉貨"}


def _from_jackson(parts):
    y, mo, d, h, mi, *rest = parts
    sec = rest[0] if rest else 0
    nano = rest[1] if len(rest) > 1 else 0
    return dt.datetime(y, mo, d, h, mi, sec, nano // 1000)


def test_created_at_is_taipei_in_responses(operator, golden):
    resp = operator.post("/api/stock/outStock", json=OUT_STOCK)
    assert resp.status_code == 200, resp.text
    created = _from_jackson(resp.json()["createdAt"])
    now_taipei = dt.datetime.now(TAIPEI).replace(tzinfo=None)
    golden.add("offset_minutes_from_taipei_now", round((created - now_taipei).total_seconds() / 60))


def test_day_grouping_across_midnight(operator, db, golden):
    for utc in ("2026-03-01 15:59:59", "2026-03-01 16:00:00"):
        exec_sql(
            db,
            "INSERT INTO outstockrequest (productNo, lotNo, type, quantity, unit, color, defect, reason, "
            "outStockType, stockIdentifierId, isHandled, isDeleted, createdAt, createdBy) "
            "VALUES ('CF1001', 'L01', '整支', '50', '碼', 0, '', %s, 2, 0, 0, 0, %s, '倉管乙')",
            f"utc {utc}", utc,
        )
    resp = operator.get("/api/stock/outStock/waitHandleList/interval",
                        params=client_range(dt.date(2026, 3, 2), dt.date(2026, 3, 2)))
    golden.response("taipei_2026_03_02", resp)
    if resp.status_code == 200:
        rows = [r for day in resp.json()["queryResult"].values() for r in day]
        golden.add("createdAt_values", [r["createdAt"] for r in rows])
