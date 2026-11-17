"""Stock state changes: ports of ModifyStockFunction, DeleteStockFunction (in-stock
rollback), OutStockRequestFunction (create/delete) and HistoryService.updateById.

Lookups that Java does with `repo.findById(..).get()` or a Spring Data
Optional finder go through app.stock.lookup and raise when the row is missing
(or duplicated); the router lets that become a 500 with a rollback. NotFound is
re-exported here for the router.
"""

import logging

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.javacompat import java_parse_long, serialize_long_array
from app.stock import products
from app.stock.lookup import NotFound, one  # noqa: F401 - NotFound is re-exported
from app.stock.models import (
    History,
    InStockOrderRecord,
    OutStockRequest,
    StockIdentifier,
    StockInfo,
    TransactionRecord,
)
from app.timeconv import db_to_taipei, java_now_utc, taipei_to_db, taipei_today_iso

logger = logging.getLogger(__name__)


def _identifier(session: Session, identifier_id: int) -> StockIdentifier:
    return one(session, select(StockIdentifier).where(StockIdentifier.id == identifier_id))


def identifier(session: Session, identifier_id: int) -> StockIdentifier:
    """stockIdentifierRepo.findById(id).get()."""
    return _identifier(session, identifier_id)


def _info_of(session: Session, identifier_id: int) -> StockInfo:
    return one(session, select(StockInfo).where(StockInfo.stockIdentifier_id == identifier_id))


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


def rollback_in_stock(session: Session, identifier_ids: list[int]) -> None:
    """DeleteStockFunction.rollbackInStock, all or nothing (defect 3 fixed, as in
    contract-tests/java-patches/03-instock-rollback-atomic.patch): a missing id raises
    and the caller rolls the whole request back. Java itself swallowed the failure and
    committed the ids already deleted without reducing the product totals."""
    totals: products.Totals = {}
    for identifier_id in identifier_ids:
        # Each finder is single-result. A second row raises before any DELETE, so a
        # duplicated child is not removed along with the one the caller named.
        info = one(session, select(StockInfo).where(StockInfo.stockIdentifier_id == identifier_id))
        trans = one(session, select(TransactionRecord).where(
            TransactionRecord.stockIdentifierId == identifier_id, TransactionRecord.operator == "1"))
        order = one(session, select(InStockOrderRecord).where(
            InStockOrderRecord.stockIdentifierId == identifier_id))
        si = one(session, select(StockIdentifier).where(StockIdentifier.id == identifier_id))
        history = one(session, select(History).where(History.currentIdentifierId == identifier_id))
        session.execute(delete(StockInfo).where(StockInfo.stockIdentifier_id == identifier_id))
        session.execute(delete(TransactionRecord).where(
            TransactionRecord.stockIdentifierId == identifier_id, TransactionRecord.operator == "1"))
        session.execute(delete(InStockOrderRecord).where(InStockOrderRecord.stockIdentifierId == identifier_id))
        session.execute(delete(StockIdentifier).where(StockIdentifier.id == identifier_id))
        session.execute(delete(History).where(History.currentIdentifierId == identifier_id))
        products.collect(totals, si.productNo, si.type, "-" + si.quantity, si.unit)
    products.apply_totals(session, totals)


def update_stock_info(session: Session, info_id: int, color: int, defect: str | None, record: str | None,
                      remark: str | None, editor: str) -> str:
    """updateStockInfo; returns the productNo. A NULL defect/remark in the DB is an NPE in Java."""
    info = one(session, select(StockInfo).where(StockInfo.id == info_id))
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
    history = one(session, select(History).where(History.id == history_id))
    parts = childs.split(",")
    if len(parts) > 1:  # Java: no separator -> [input]; else trailing empty strings are dropped
        while parts and parts[-1] == "":
            parts.pop()
    history.childrenIdentifierId = serialize_long_array([java_parse_long(p) for p in parts])
    session.flush()
    return history


def _live_out_request(session: Session, identifier_id: int) -> OutStockRequest:
    """findByStockIdentifierIdAndIsDeleted(id, false).get(): exactly one live request."""
    return one(session, select(OutStockRequest).where(
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
    shipped = one(session, select(TransactionRecord).where(
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


def create_out_stock_request(session: Session, body, editor: str) -> OutStockRequest:  # noqa: ANN001
    """OutStockRequestFunction.createOutStockRequest: a pull request not tied to a roll (type 2).

    `body` is the Jackson-parsed OutStockRequest (router.OutStockBody). Spring Data
    save() persists when id is null and merges otherwise: an id that is not in the
    table is inserted with a new identity (GenerationType.IDENTITY), and an existing
    id is overwritten with the detached state. createdBy and outStockType are set
    here; updatedBy is whatever the client sent. @PrePersist stamps createdAt only
    on insert; @PreUpdate stamps updatedAt only on merge.

    The client's createdAt/updatedAt are LocalDateTimes in the JVM zone (Asia/Taipei);
    the JDBC driver stores them in UTC, so they are converted before being written
    (and come back unchanged through db_to_taipei).
    """
    now = java_now_utc()
    client_created = taipei_to_db(body.createdAt) if body.createdAt is not None else None
    client_updated = taipei_to_db(body.updatedAt) if body.updatedAt is not None else None
    existing = session.get(OutStockRequest, body.id) if body.id is not None else None
    values = {
        "productNo": body.productNo, "lotNo": body.lotNo, "type": body.type, "quantity": body.quantity,
        "unit": body.unit, "color": body.color, "defect": body.defect, "reason": body.reason,
        "stockIdentifierId": body.stockIdentifierId, "fileName": body.fileName,
        "isHandled": body.handled, "isDeleted": body.deleted, "requestFrom": body.requestFrom,
        "outStockType": 2, "createdBy": editor, "updatedBy": body.updatedBy,
    }
    if existing is None:
        request = OutStockRequest(**values, createdAt=now, updatedAt=client_updated)
        session.add(request)
    else:
        for name, value in values.items():
            setattr(existing, name, value)
        existing.createdAt = client_created
        existing.updatedAt = now
        request = existing
    session.flush()
    return request


def handle_out_stock_requests(session: Session, request_from: dict[int, str | None], editor: str) -> None:
    """OutStockRequestFunction.updateOutStockRequest. A missing map is rejected by the
    router before this runs (defect 12 fixed).

    The pull-list workbook is created first; an unknown id then fails the whole
    request (the DB rolls back, the file stays — as in Java). Rows follow the JSON
    key order: Jackson fills a Map field with a LinkedHashMap (and pydantic keeps the
    order). A failure while writing rows is only logged.
    """
    from app.reports import pull_list  # reports import the models; keep the module graph acyclic

    now_taipei = db_to_taipei(java_now_utc())
    assert now_taipei is not None
    path, name = pull_list.create(now_taipei)
    handled = []
    for request_id in request_from:
        request = one(session, select(OutStockRequest).where(OutStockRequest.id == request_id))
        request.requestFrom = request_from[request_id]
        request.isHandled = True
        request.fileName = name
        _touch(request, editor)
        handled.append(request)
    session.flush()
    try:
        pull_list.append(path, handled)
    except Exception:
        logger.exception("writing pull list %s failed", name)


def delete_out_stock_request(session: Session, request_id: int, editor: str) -> None:
    request = one(session, select(OutStockRequest).where(OutStockRequest.id == request_id))
    request.isDeleted = True
    _touch(request, editor)
    session.flush()
