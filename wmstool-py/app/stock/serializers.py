"""Entity -> JSON the way the Java service's Jackson writes it.

Jackson names properties after getters: `isExist()` -> "exist", `isOutStock()`
-> "outStock", `isBypass()` -> "bypass", `isDeleted()` -> "deleted". Fields
annotated @JsonIgnore in Java are left out. LocalDateTime values are Taipei
time as jsr310 arrays.
"""

import datetime as dt
from typing import Any

from app.javacompat import deserialize_long_array
from app.stock.models import History, OutStockRequest, Product, StockIdentifier, StockInfo
from app.timeconv import db_to_taipei, jackson_local_datetime


def stock_identifier_json(si: StockIdentifier) -> dict[str, Any]:
    return {
        "id": si.id, "productNo": si.productNo, "lotNo": si.lotNo, "type": si.type, "quantity": si.quantity,
        "unit": si.unit, "serialNo": si.serialNo, "exist": si.isExist, "waitToShrink": si.waitToShrink,
        "inStockType": si.inStockType, "eliminateType": si.eliminateType, "eliminateDate": si.eliminateDate,
        "eliminateReason": si.eliminateReason, "adjustment": si.adjustment, "outStock": si.isOutStock,
        "firstInStockAt": si.firstInStockAt,
    }


def stock_info_json(info: StockInfo) -> dict[str, Any]:
    return {
        "id": info.id, "stockIdentifier": stock_identifier_json(info.stockIdentifier), "color": info.color,
        "defect": info.defect, "record": info.record, "remark": info.remark, "shrinkAt": info.shrinkAt,
        "storedAt": info.storedAt,
    }


def product_json(p: Product) -> dict[str, Any]:
    return {
        "productNo": p.productNo, "type": p.type, "category": p.category, "quantity": p.quantity, "unit": p.unit,
        "safeQuantity": p.safeQuantity, "cName": p.cName, "whType": p.whType, "bypass": p.isBypass,
        "alert": p.isAlert,
    }


def _db_time(value: dt.datetime | None) -> list[int] | None:
    return jackson_local_datetime(db_to_taipei(value))


def out_stock_request_json(r: OutStockRequest) -> dict[str, Any]:
    return {
        "id": r.id, "productNo": r.productNo, "lotNo": r.lotNo, "type": r.type, "quantity": r.quantity,
        "unit": r.unit, "color": r.color, "defect": r.defect, "reason": r.reason, "outStockType": r.outStockType,
        "stockIdentifierId": r.stockIdentifierId, "fileName": r.fileName, "handled": r.isHandled,
        "deleted": r.isDeleted, "requestFrom": r.requestFrom, "createdAt": _db_time(r.createdAt),
        "updatedAt": _db_time(r.updatedAt), "createdBy": r.createdBy, "updatedBy": r.updatedBy,
    }


def history_json(h: History) -> dict[str, Any]:
    children = deserialize_long_array(h.childrenIdentifierId) if h.childrenIdentifierId is not None else None
    return {
        "id": h.id, "currentIdentifierId": h.currentIdentifierId, "childrenIdentifierId": children,
        "rootIdentifierId": h.rootIdentifierId,
    }
