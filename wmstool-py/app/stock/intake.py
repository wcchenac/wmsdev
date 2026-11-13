"""Stock intake: a port of wmstool's CreateStockFunction.createStockInfoes.

Covers every in-stock type except `shrink` (and `directShip`), which belong to
the /api/stock port. Insert order and values follow the Java code, because
row ids and the `product` table are part of the contract:
  per item: backlog (if new) -> identifier -> history -> in-stock order -> transaction
  then: product totals (in Java HashMap order), then all stockinfo rows.
"""

import datetime as dt
from dataclasses import dataclass
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.javacompat import (
    java_format_2f,
    java_hashmap_order,
    java_parse_double,
    java_parse_int,
    serialize_long_array,
)
from app.stock.models import (
    History,
    InStockOrderRecord,
    Product,
    StockIdentifier,
    StockIdentifierBacklog,
    StockInfo,
    TransactionRecord,
)

TAIPEI = ZoneInfo("Asia/Taipei")
UNCATEGORISED = "未分類"

# inStockType -> (StockIdentifier.inStockType label, TransactionRecord.transactionType)
IN_STOCK_TYPES: dict[str, tuple[str, str]] = {
    "normal": ("進貨單", "NI"),
    "assemble": ("組裝單", "AI"),
    "customerReturn": ("退貨單", "CRI"),
    "storeReturn": ("調撥單", "SRI"),
    "fileImport": ("檔案匯入", "FI"),
}


@dataclass
class InStockItem:
    productNo: str
    lotNo: str | None
    type: str
    quantity: str
    unit: str
    color: int
    defect: str | None
    record: str | None
    remark: str | None
    inStockType: str
    orderNo: str | None


def utc_now() -> dt.datetime:
    """What Java stores for LocalDateTime.now(): the JDBC URL has serverTimezone=UTC."""
    return dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)


def taipei_today() -> str:
    return dt.datetime.now(TAIPEI).date().isoformat()


def _convert_units(item: InStockItem) -> tuple[str, str]:
    """quantityConvertor: 尺 -> 碼 (/3, %.2f), 打 -> 個 (x12, integer only)."""
    if item.unit == "尺":
        return java_format_2f(java_parse_double(item.quantity) / 3.0), "碼"
    if item.unit == "打":
        return str(java_parse_int(item.quantity) * 12), "個"
    return item.quantity, item.unit


def _backlog(session: Session, item: InStockItem, quantity: str, unit: str) -> StockIdentifierBacklog:
    found = None
    if item.lotNo is not None:  # Spring Data's `lotNo = ?` never matches NULL
        found = session.scalar(select(StockIdentifierBacklog).where(
            StockIdentifierBacklog.productNo == item.productNo,
            StockIdentifierBacklog.lotNo == item.lotNo,
            StockIdentifierBacklog.type == item.type,
            StockIdentifierBacklog.quantity == quantity,
            StockIdentifierBacklog.unit == unit,
        ))
    if found is None:
        found = StockIdentifierBacklog(productNo=item.productNo, lotNo=item.lotNo, type=item.type,
                                       quantity=quantity, unit=unit, serialNo=1)
        session.add(found)
        session.flush()
    return found


def _collect(totals: dict[str, dict[str, dict[str, str]]], identifier: StockIdentifier) -> None:
    """StockServiceUtilities.contentCollector."""
    if identifier.type == "":
        return
    by_type = totals.setdefault(identifier.productNo, {})
    if identifier.type not in by_type:
        by_type[identifier.type] = {"quantity": identifier.quantity, "unit": identifier.unit}
    else:
        entry = by_type[identifier.type]
        entry["quantity"] = java_format_2f(java_parse_double(entry["quantity"]) + java_parse_double(identifier.quantity))


def _apply_totals(session: Session, totals: dict[str, dict[str, dict[str, str]]], now: dt.datetime) -> None:
    """updateProductQuantityWithList, iterating the nested HashMaps in Java order."""
    for product_no in java_hashmap_order(totals):
        for type_ in java_hashmap_order(totals[product_no]):
            entry = totals[product_no][type_]
            existing = session.scalar(select(Product).where(Product.productNo == product_no, Product.type == type_))
            if existing is not None:
                existing.quantity = java_format_2f(java_parse_double(entry["quantity"]) + java_parse_double(existing.quantity or "0"))
                existing.updatedAt = now
            else:
                session.add(Product(productNo=product_no, type=type_, quantity=entry["quantity"], unit=entry["unit"],
                                    category=UNCATEGORISED, isBypass=False, isAlert=False, createdAt=now))
            session.flush()


def create_stock_infoes(session: Session, items: list[InStockItem], editor: str) -> None:
    now = utc_now()
    today = taipei_today()
    infos: list[StockInfo] = []
    totals: dict[str, dict[str, dict[str, str]]] = {}

    for item in items:
        if item.inStockType == "shrink":
            raise NotImplementedError("shrink in-stock belongs to the /api/stock port")
        quantity, unit = _convert_units(item)
        backlog = _backlog(session, item, quantity, unit)
        label, transaction_type = IN_STOCK_TYPES.get(item.inStockType, (None, None))

        # new StockIdentifier(backlog, editor): the values come from the stored
        # backlog row, which MySQL may have matched case-insensitively.
        identifier = StockIdentifier(
            productNo=backlog.productNo, lotNo=backlog.lotNo, type=backlog.type, quantity=backlog.quantity,
            unit=backlog.unit,
            serialNo=backlog.serialNo, isExist=True, waitToShrink=False, isOutStock=False,
            inStockType=label, firstInStockAt=today if label else None, createdAt=now, createdBy=editor,
        )
        backlog.serialNo += 1
        session.add(identifier)
        session.flush()

        session.add(History(currentIdentifierId=identifier.id, rootIdentifierId=identifier.id if label else None,
                            childrenIdentifierId=serialize_long_array([])))
        session.flush()
        session.add(InStockOrderRecord(
            inStockType=item.inStockType, inStockOrderNo=item.orderNo, productNo=identifier.productNo,
            lotNo=identifier.lotNo, quantity=identifier.quantity, unit=identifier.unit, type=identifier.type,
            color=item.color, defect=item.defect, stockIdentifierId=identifier.id, createdAt=now, createdBy=editor,
        ))
        session.flush()
        session.add(TransactionRecord(
            productNo=identifier.productNo, lotNo=identifier.lotNo, type=identifier.type,
            quantity=identifier.quantity, unit=identifier.unit, operator="1", stockIdentifierId=identifier.id,
            transactionType=transaction_type, createdAt=now, createdBy=editor,
        ))
        session.flush()

        infos.append(StockInfo(stockIdentifier_id=identifier.id, color=item.color, defect=item.defect,
                               record=item.record, remark=item.remark, createdAt=now, createdBy=editor))
        _collect(totals, identifier)

    _apply_totals(session, totals, now)
    for info in infos:
        session.add(info)
        session.flush()
