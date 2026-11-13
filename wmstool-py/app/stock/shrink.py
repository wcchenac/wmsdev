"""Shrink (減肥: cut a roll into pieces): port of ModifyStockFunction.shrinkStock."""

import datetime as dt
import logging
import struct
from dataclasses import dataclass

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app import erp
from app.erp import erp_text
from app.javacompat import deserialize_long_array, java_format_2f, serialize_long_array
from app.reports.shrink import rewrite_adjustments, rewrite_allocations, write_adjustments, write_allocations
from app.stock import moves, products
from app.stock.intake import InStockItem, create_stock_infoes
from app.stock.models import (
    History,
    StockAdjustmentRecord,
    StockAllocationRecord,
    StockIdentifier,
    StockInfo,
    TransactionRecord,
)
from app.stock.orders import unit_name
from app.timeconv import java_now_utc, taipei_to_db, taipei_today, taipei_today_iso

logger = logging.getLogger(__name__)


def java_float(x: float) -> float:
    """The value a Java `Float` holds (32-bit), widened back to double."""
    return struct.unpack("f", struct.pack("f", x))[0]


@dataclass
class ShrinkRequest:
    old_identifier_id: int
    pieces: list[InStockItem]
    allocation: float | None
    adjustment: float | None
    shrink_type: str | None


def allocation_record(product_no: str, unit: str, shrink_type: str | None) -> StockAllocationRecord:
    """new StockAllocationRecord(productNo, unit, shrinkType): only RB / BR set the warehouses."""
    if shrink_type is None:
        raise TypeError("shrinkType is null (Java: NullPointerException)")
    warehouses = {"RB": ("AB", "AD"), "BR": ("AD", "AB")}.get(shrink_type, (None, None))
    return StockAllocationRecord(productNo=product_no, unit=unit, INGWN=warehouses[0], OUTGWN=warehouses[1])


def adjustment_record(product_no: str, unit: str, shrink_type: str | None) -> StockAdjustmentRecord:
    """new StockAdjustmentRecord(productNo, unit, shrinkType)."""
    if shrink_type is None:
        raise TypeError("shrinkType is null (Java: switch on null)")
    gwn = {"RR": "AD", "BR": "AD", "BB": "AB", "RB": "AB", "HH": "AP"}.get(shrink_type)
    return StockAdjustmentRecord(productNo=product_no, unit=unit, GWN=gwn)


def _real_quantity(product_no: str, unit: str, amount: float, formatted: str) -> str:
    """Same as the formatted amount when the roll is in the ERP base unit, else amount x 3."""
    rows = erp.product_unit(product_no)
    base = unit_name(erp_text(rows[0][0]))  # Java: getResultList().get(0) — no row is an error
    return formatted if base == unit else java_format_2f(amount * 3.0)


def rollback_shrink(session: Session, old_id: int, editor: str) -> bool:
    """DeleteStockFunction.rollbackShrink. Java catches every exception itself and returns
    false while the transaction still commits whatever was done before the failure."""
    try:
        _rollback_shrink(session, old_id, editor)
        return True
    except Exception:
        logger.exception("shrink rollback of %s failed", old_id)
        return False


def _rollback_shrink(session: Session, old_id: int, editor: str) -> None:
    totals: products.Totals = {}
    old_history = _single(session, select(History).where(History.currentIdentifierId == old_id))
    children = deserialize_long_array(old_history.childrenIdentifierId) if old_history.childrenIdentifierId else []
    old_history.childrenIdentifierId = serialize_long_array([])
    session.flush()
    for child in children:
        session.execute(delete(History).where(History.currentIdentifierId == child))
    shrink_out = _single(session, select(TransactionRecord).where(
        TransactionRecord.stockIdentifierId == old_id, TransactionRecord.transactionType == "SKO"))
    session.execute(delete(TransactionRecord).where(TransactionRecord.id == shrink_out.id))
    session.execute(delete(StockAllocationRecord).where(StockAllocationRecord.issuedByTransactionRecord == shrink_out.id))
    session.execute(delete(StockAdjustmentRecord).where(StockAdjustmentRecord.issuedByTransactionRecord == shrink_out.id))
    for child in children:
        session.execute(delete(TransactionRecord).where(
            TransactionRecord.stockIdentifierId == child, TransactionRecord.transactionType == "SKI"))
    for child in children:
        session.execute(delete(StockInfo).where(StockInfo.stockIdentifier_id == child))
    for child in children:
        piece = moves.identifier(session, child)
        products.collect(totals, piece.productNo, piece.type, "-" + piece.quantity, piece.unit)
        session.execute(delete(StockIdentifier).where(StockIdentifier.id == child))
    old = moves.identifier(session, old_id)
    old.isExist = True
    old.eliminateDate = old.eliminateReason = old.eliminateType = old.adjustment = None
    old.updatedBy = editor
    old.updatedAt = java_now_utc()
    products.collect(totals, old.productNo, old.type, old.quantity, old.unit)
    products.apply_totals(session, totals)
    _regenerate_today_reports(session)


def _regenerate_today_reports(session: Session) -> None:
    """generateNewFile: rebuild today's (Taipei) allocation and adjustment reports from the DB."""
    today = taipei_today()
    start = taipei_to_db(dt.datetime.combine(today, dt.time.min))
    end = taipei_to_db(dt.datetime.combine(today, dt.time.max))
    allocations = session.scalars(select(StockAllocationRecord).where(
        StockAllocationRecord.createdAt.between(start, end))
        .order_by(StockAllocationRecord.createdAt, StockAllocationRecord.id)).all()
    adjustments = session.scalars(select(StockAdjustmentRecord).where(
        StockAdjustmentRecord.createdAt.between(start, end))
        .order_by(StockAdjustmentRecord.createdAt, StockAdjustmentRecord.id)).all()
    rewrite_allocations(allocations, today)
    rewrite_adjustments(adjustments, today)


def _single(session: Session, stmt):  # noqa: ANN001, ANN202
    rows = session.scalars(stmt).all()
    if len(rows) != 1:
        raise LookupError(f"expected exactly one row, found {len(rows)}")
    return rows[0]


def shrink_stock(session: Session, req: ShrinkRequest, editor: str) -> None:
    if req.allocation is None or req.adjustment is None:
        raise TypeError("allocation/adjustment is null (Java: unboxing NullPointerException)")
    allocation, adjustment = java_float(req.allocation), java_float(req.adjustment)
    allocation_text, adjustment_text = java_format_2f(allocation), java_format_2f(adjustment)
    today = taipei_today()

    old = moves.identifier(session, req.old_identifier_id)
    old.isExist = False
    old.eliminateType = "1"
    old.eliminateDate = taipei_today_iso()
    old.eliminateReason = "減肥"
    old.adjustment = adjustment_text
    old.updatedBy = editor
    old.updatedAt = java_now_utc()
    shrink_out = TransactionRecord(
        productNo=old.productNo, lotNo=old.lotNo, type=old.type, quantity=old.quantity, unit=old.unit,
        operator="-1", stockIdentifierId=old.id, transactionType="SKO", createdAt=java_now_utc(), createdBy=editor,
    )
    session.add(shrink_out)
    session.flush()
    products.update_product_quantity(session, old.productNo, old.type, "-" + old.quantity, old.unit)

    create_stock_infoes(session, req.pieces, editor)

    if allocation != 0:
        rec = allocation_record(old.productNo, old.unit, req.shrink_type)
        rec.quantity = allocation_text
        rec.realQuantity = _real_quantity(old.productNo, old.unit, allocation, allocation_text)
        rec.issuedByStockIdentifier, rec.issuedByTransactionRecord = old.id, shrink_out.id
        rec.createdAt = java_now_utc()
        session.add(rec)
        session.flush()
        write_allocations([rec], today)
    if adjustment != 0:
        adj = adjustment_record(old.productNo, old.unit, req.shrink_type)
        adj.quantity = adjustment_text
        adj.realQuantity = _real_quantity(old.productNo, old.unit, adjustment, adjustment_text)
        adj.issuedByStockIdentifier, adj.issuedByTransactionRecord = old.id, shrink_out.id
        adj.createdAt = java_now_utc()
        session.add(adj)
        session.flush()
        write_adjustments([adj], today)
