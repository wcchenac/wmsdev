"""History trees: ports of HistoryService (HistoryTreeNode = {stockInfo, nodes})."""

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.javacompat import deserialize_long_array
from app.stock.models import History, StockInfo, TransactionRecord
from app.stock.serializers import stock_info_json


def _children(history: History) -> list[int]:
    return deserialize_long_array(history.childrenIdentifierId) if history.childrenIdentifierId else []


def _one(session: Session, stmt):  # noqa: ANN001, ANN202
    rows = session.scalars(stmt).all()
    if len(rows) != 1:
        raise LookupError(f"expected exactly one row, found {len(rows)}")  # Java: Optional single-result finder
    return rows[0]


def tree_by_identifier(session: Session, identifier_id: int) -> dict[str, Any]:
    """collectDataForTreeByIdentifierId: every node's stockinfo is loaded (missing -> error)."""
    history = _one(session, select(History).where(History.currentIdentifierId == identifier_id))
    info = _one(session, select(StockInfo).where(StockInfo.stockIdentifier_id == identifier_id))
    return {"stockInfo": stock_info_json(info),
            "nodes": [tree_by_identifier(session, child) for child in _children(history)]}


def tree_by_root(session: Session, root_id: int, info_by_id: dict[int, StockInfo]) -> dict[str, Any]:
    """collectDataForTreeByRootId: nodes come from the root's histories; stockInfo from
    `info_by_id`, null when absent (rolls created before the query window)."""
    by_current = {h.currentIdentifierId: h for h in session.scalars(
        select(History).where(History.rootIdentifierId == root_id).order_by(History.id))}

    def node(identifier_id: int) -> dict[str, Any]:
        history = by_current[identifier_id]  # Java: NullPointerException when missing
        info = info_by_id.get(identifier_id)
        return {"stockInfo": stock_info_json(info) if info is not None else None,
                "nodes": [node(child) for child in _children(history)]}

    return node(root_id)


def shrink_rollback_candidates(session: Session, product_no: str) -> list[dict[str, Any]]:
    """findByPeriodTransactionRecord: the 5 latest shrinks (SKO) of the product, as trees."""
    shrinks = session.scalars(select(TransactionRecord).where(
        TransactionRecord.productNo == product_no, TransactionRecord.transactionType == "SKO")
        .order_by(TransactionRecord.createdAt.desc(), TransactionRecord.id.desc()).limit(5))
    return [tree_by_identifier(session, t.stockIdentifierId or 0) for t in shrinks]
