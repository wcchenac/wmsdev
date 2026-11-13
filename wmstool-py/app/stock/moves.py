"""Stock state changes: ports of ModifyStockFunction, DeleteStockFunction (in-stock
rollback), OutStockRequestFunction (create/delete) and HistoryService.updateById.

Lookups that Java does with `repo.findById(..).get()` or a Spring Data
Optional finder raise here when the row is missing (or, for single-result
finders, duplicated); the router lets that become a 500 with a rollback.
"""

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.javacompat import java_parse_long, serialize_long_array
from app.stock import products
from app.stock.models import (
    History,
    InStockOrderRecord,
    OutStockRequest,
    StockIdentifier,
    StockInfo,
    TransactionRecord,
)
from app.timeconv import java_now_utc, taipei_today_iso


class NotFound(Exception):
    """Java: NoSuchElementException from Optional.get()."""


def _one(session: Session, stmt):  # noqa: ANN001, ANN202
    """Spring Data single-result finder: none -> NotFound, more than one -> error."""
    rows = session.scalars(stmt).all()
    if not rows:
        raise NotFound(str(stmt))
    if len(rows) > 1:
        raise LookupError(f"query did not return a unique result: {len(rows)}")
    return rows[0]


def _identifier(session: Session, identifier_id: int) -> StockIdentifier:
    return _one(session, select(StockIdentifier).where(StockIdentifier.id == identifier_id))


def identifier(session: Session, identifier_id: int) -> StockIdentifier:
    """stockIdentifierRepo.findById(id).get()."""
    return _identifier(session, identifier_id)


def _info_of(session: Session, identifier_id: int) -> StockInfo:
    return _one(session, select(StockInfo).where(StockInfo.stockIdentifier_id == identifier_id))


def _touch(row, editor: str) -> None:  # noqa: ANN001
    row.updatedBy = editor
    row.updatedAt = java_now_utc()


def ship_identifier(session: Session, identifier_id: int, reason: str | None, editor: str) -> None:
    """letStockIdentifierisShiped. Java does not check isExist: shipping twice ships twice."""
    si = _identifier(session, identifier_id)
    info = _info_of(session, si.id)
    session.add(OutStockRequest(
        productNo=si.productNo, lotNo=si.lotNo, type=si.type, quantity=si.quantity, unit=si.unit,
        stockIdentifierId=si.id, color=info.color, defect=info.defect, reason=reason, outStockType=0,
        isHandled=False, isDeleted=False, createdAt=java_now_utc(), createdBy=editor,
    ))
    session.flush()
    si.isExist = False
    si.eliminateType = "0"
    si.eliminateReason = reason
    si.eliminateDate = taipei_today_iso()
    si.isOutStock = True
    si.outStockAt = java_now_utc()
    _touch(si, editor)
    session.add(TransactionRecord(
        productNo=si.productNo, lotNo=si.lotNo, type=si.type, quantity=si.quantity, unit=si.unit,
        operator="-1", stockIdentifierId=si.id, transactionType="SPO", createdAt=java_now_utc(), createdBy=editor,
    ))
    session.flush()
    products.update_product_quantity(session, si.productNo, si.type, "-" + si.quantity, si.unit)


def rollback_in_stock(session: Session, identifier_ids: list[int]) -> bool:
    """DeleteStockFunction.rollbackInStock, including its defect: a missing id stops the
    loop, earlier ids stay deleted and product totals are not reduced (Java catches
    its own exception and the transaction commits)."""
    totals: products.Totals = {}
    for identifier_id in identifier_ids:
        info = session.scalars(select(StockInfo).where(StockInfo.stockIdentifier_id == identifier_id)).first()
        trans = session.scalars(select(TransactionRecord).where(
            TransactionRecord.stockIdentifierId == identifier_id, TransactionRecord.operator == "1")).first()
        order = session.scalars(select(InStockOrderRecord).where(
            InStockOrderRecord.stockIdentifierId == identifier_id)).first()
        si = session.get(StockIdentifier, identifier_id)
        history = session.scalars(select(History).where(History.currentIdentifierId == identifier_id)).first()
        if None in (info, trans, order, si, history):
            return False
        assert si is not None
        session.execute(delete(StockInfo).where(StockInfo.stockIdentifier_id == identifier_id))
        session.execute(delete(TransactionRecord).where(
            TransactionRecord.stockIdentifierId == identifier_id, TransactionRecord.operator == "1"))
        session.execute(delete(InStockOrderRecord).where(InStockOrderRecord.stockIdentifierId == identifier_id))
        session.execute(delete(StockIdentifier).where(StockIdentifier.id == identifier_id))
        session.execute(delete(History).where(History.currentIdentifierId == identifier_id))
        products.collect(totals, si.productNo, si.type, "-" + si.quantity, si.unit)
    products.apply_totals(session, totals)
    return True


def update_stock_info(session: Session, info_id: int, color: int, defect: str | None, record: str | None,
                      remark: str | None, editor: str) -> str:
    """updateStockInfo; returns the productNo. A NULL defect/remark in the DB is an NPE in Java."""
    info = _one(session, select(StockInfo).where(StockInfo.id == info_id))
    if info.defect is None or info.remark is None:
        raise TypeError("null defect/remark (Java: NullPointerException)")
    changed = False
    for field, value in (("color", color), ("defect", defect), ("record", record), ("remark", remark)):
        if getattr(info, field) != value:
            setattr(info, field, value)
            changed = True
    if changed or info.updatedBy != editor:
        _touch(info, editor)
    session.flush()
    return info.stockIdentifier.productNo


def update_history(session: Session, history_id: int, childs: str) -> History:
    """HistoryService.updateById: `childs` is a comma list of ids (Java String.split drops trailing empties)."""
    history = _one(session, select(History).where(History.id == history_id))
    parts = childs.split(",")
    if len(parts) > 1:  # Java: no separator -> [input]; else trailing empty strings are dropped
        while parts and parts[-1] == "":
            parts.pop()
    history.childrenIdentifierId = serialize_long_array([java_parse_long(p) for p in parts])
    session.flush()
    return history


def _live_out_request(session: Session, identifier_id: int) -> OutStockRequest:
    """findByStockIdentifierIdAndIsDeleted(id, false).get(): exactly one live request."""
    return _one(session, select(OutStockRequest).where(
        # `== False`, not .is_(False): MySQL rejects `bit IS 0`; this binds through BitBool.
        OutStockRequest.stockIdentifierId == identifier_id, OutStockRequest.isDeleted == False))  # noqa: E712


def unship_identifier(session: Session, identifier_id: int, editor: str) -> None:
    """letStockIdentifierisNotShiped."""
    si = _identifier(session, identifier_id)
    si.isExist = True
    si.eliminateType = si.eliminateReason = si.eliminateDate = None
    si.isOutStock = False
    si.outStockAt = None
    _touch(si, editor)
    request = _live_out_request(session, identifier_id)
    request.isDeleted = True
    _touch(request, editor)
    shipped = _one(session, select(TransactionRecord).where(
        TransactionRecord.stockIdentifierId == identifier_id, TransactionRecord.transactionType == "SPO"))
    session.delete(shipped)
    session.flush()
    products.update_product_quantity(session, si.productNo, si.type, si.quantity, si.unit)


def mark_wait_to_shrink(session: Session, identifier_id: int, editor: str) -> str:
    """letStockIdentifierWaitToShrinkIsTrue; returns the productNo."""
    si = _identifier(session, identifier_id)
    info = _info_of(session, si.id)
    request = OutStockRequest(
        productNo=si.productNo, lotNo=si.lotNo, type=si.type, quantity=si.quantity, unit=si.unit,
        stockIdentifierId=si.id, color=info.color, defect=info.defect,
        reason="分裝" if si.type == "雜項" else "減肥", outStockType=1,
        isHandled=False, isDeleted=False, createdAt=java_now_utc(), createdBy=editor,
    )
    si.waitToShrink = True
    si.isOutStock = True
    si.outStockAt = java_now_utc()
    _touch(si, editor)
    session.add(request)
    session.flush()
    return si.productNo


def unmark_wait_to_shrink(session: Session, identifier_id: int, editor: str) -> None:
    """letStockIdentifierWaitToShrinkIsFalse."""
    si = _identifier(session, identifier_id)
    request = _live_out_request(session, identifier_id)
    request.isDeleted = True
    _touch(request, editor)
    si.waitToShrink = False
    si.isOutStock = False
    si.outStockAt = None
    _touch(si, editor)
    session.flush()


OUT_REQUEST_FIELDS = ("productNo", "lotNo", "type", "quantity", "unit", "color", "defect", "reason",
                      "stockIdentifierId", "fileName", "requestFrom")


def create_out_stock_request(session: Session, fields: dict, editor: str) -> OutStockRequest:
    """OutStockRequestFunction.createOutStockRequest: a pull request not tied to a roll (type 2)."""
    request = OutStockRequest(
        **{k: fields[k] for k in OUT_REQUEST_FIELDS if k in fields},
        isHandled=bool(fields.get("handled", False)), isDeleted=bool(fields.get("deleted", False)),
        outStockType=2, createdBy=editor, createdAt=java_now_utc(),
    )
    request.color = request.color or 0
    request.stockIdentifierId = request.stockIdentifierId or 0
    session.add(request)
    session.flush()
    return request


def delete_out_stock_request(session: Session, request_id: int, editor: str) -> None:
    request = _one(session, select(OutStockRequest).where(OutStockRequest.id == request_id))
    request.isDeleted = True
    _touch(request, editor)
    session.flush()
