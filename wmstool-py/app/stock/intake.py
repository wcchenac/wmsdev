"""Stock intake: a port of wmstool's CreateStockFunction.createStockInfoes.

Covers every in-stock type except `shrink` (part 2 of the /api/stock port).
Insert order and values follow the Java code, because row ids and the
`product` table are part of the contract:
  per item: backlog (if new) -> identifier -> history -> in-stock order -> transaction
  then: product totals (in Java HashMap order), then all stockinfo rows,
  then direct shipments in request order.
"""

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.javacompat import (
    deserialize_long_array,
    java_format_2f,
    java_parse_double,
    java_parse_int,
    serialize_long_array,
)
from app.stock import products
from app.stock.models import (
    History,
    InStockOrderRecord,
    StockIdentifier,
    StockIdentifierBacklog,
    StockInfo,
    TransactionRecord,
)
from app.timeconv import java_now_utc, taipei_today_iso

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
    unit: str | None
    color: int
    defect: str | None
    record: str | None
    remark: str | None
    inStockType: str | None
    orderNo: str | None
    directShip: bool = False
    outStockReason: str | None = None
    parentId: int = 0  # shrink in-stock: the roll it was cut from


def _convert_units(item: InStockItem) -> tuple[str, str]:
    """quantityConvertor: 尺 -> 碼 (/3, %.2f), 打 -> 個 (x12, integer only)."""
    if item.unit is None:
        raise ValueError("unit is null (Java: switch on null)")
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


def _one_history(session: Session, current_id: int) -> History:
    """historyRepository.findByCurrentIdentifierId(id).get()."""
    rows = session.scalars(select(History).where(History.currentIdentifierId == current_id)).all()
    if len(rows) != 1:
        raise LookupError(f"expected one history for identifier {current_id}, found {len(rows)}")
    return rows[0]


def create_stock_infoes(session: Session, items: list[InStockItem], editor: str) -> None:
    from app.stock.moves import ship_identifier  # moves never imports intake

    now = java_now_utc()
    today = taipei_today_iso()
    infos: list[StockInfo] = []
    totals: products.Totals = {}
    to_ship: list[tuple[int, str | None]] = []

    for item in items:
        if item.inStockType is None:
            raise ValueError("inStockType is null (Java: switch on null)")
        shrink = item.inStockType == "shrink"
        quantity, unit = _convert_units(item)
        backlog = _backlog(session, item, quantity, unit)
        parent: History | None = None
        if shrink:
            # The roll this piece was cut from; the root keeps the first in-stock date.
            parent = found = _one_history(session, item.parentId)
            root = session.get(StockIdentifier, found.rootIdentifierId)
            if root is None:
                raise LookupError(f"root identifier {found.rootIdentifierId} not found")
            label, transaction_type, first_in = "減肥", "SKI", root.firstInStockAt
        else:
            label, transaction_type = IN_STOCK_TYPES.get(item.inStockType, (None, None))
            first_in = today if label else None

        # new StockIdentifier(backlog, editor): the values come from the stored
        # backlog row, which MySQL may have matched case-insensitively.
        identifier = StockIdentifier(
            productNo=backlog.productNo, lotNo=backlog.lotNo, type=backlog.type, quantity=backlog.quantity,
            unit=backlog.unit, serialNo=backlog.serialNo, isExist=True, waitToShrink=False, isOutStock=False,
            inStockType=label, firstInStockAt=first_in, createdAt=now, createdBy=editor,
        )
        backlog.serialNo += 1
        session.add(identifier)
        session.flush()

        if parent is not None:
            children = deserialize_long_array(parent.childrenIdentifierId or serialize_long_array([]))
            parent.childrenIdentifierId = serialize_long_array([*children, identifier.id])
            session.flush()
            root_id = parent.rootIdentifierId
        else:
            root_id = identifier.id if label else None
        session.add(History(currentIdentifierId=identifier.id, rootIdentifierId=root_id,
                            childrenIdentifierId=serialize_long_array([])))
        session.flush()
        if not shrink:
            session.add(InStockOrderRecord(
                inStockType=item.inStockType, inStockOrderNo=item.orderNo, productNo=identifier.productNo,
                lotNo=identifier.lotNo, quantity=identifier.quantity, unit=identifier.unit, type=identifier.type,
                color=item.color, defect=item.defect, stockIdentifierId=identifier.id, createdAt=now,
                createdBy=editor,
            ))
            session.flush()
        session.add(TransactionRecord(
            productNo=identifier.productNo, lotNo=identifier.lotNo, type=identifier.type,
            quantity=identifier.quantity, unit=identifier.unit, operator="1", stockIdentifierId=identifier.id,
            transactionType=transaction_type, createdAt=now, createdBy=editor,
        ))
        session.flush()

        infos.append(StockInfo(stockIdentifier_id=identifier.id, color=item.color, defect=item.defect,
                               record=item.record, remark=item.remark, createdAt=now, createdBy=editor,
                               shrinkAt=today if shrink else None))
        products.collect(totals, identifier.productNo, identifier.type, identifier.quantity, identifier.unit)
        if item.directShip:
            to_ship.append((identifier.id, item.outStockReason))

    products.apply_totals(session, totals)
    for info in infos:
        session.add(info)
        session.flush()
    for identifier_id, reason in to_ship:
        ship_identifier(session, identifier_id, reason, editor)
