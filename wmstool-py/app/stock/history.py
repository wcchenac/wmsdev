"""History trees: ports of HistoryService (HistoryTreeNode = {stockInfo, nodes})."""

import json
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.javacompat import deserialize_long_array
from app.stock.lookup import one
from app.stock.models import History, InStockOrderRecord, StockInfo, TransactionRecord
from app.stock.serializers import stock_info_json
from app.timeconv import client_param_to_db


def _children(history: History) -> list[int]:
    return deserialize_long_array(history.childrenIdentifierId) if history.childrenIdentifierId else []


def tree_by_identifier(session: Session, identifier_id: int) -> dict[str, Any]:
    """collectDataForTreeByIdentifierId: every node's stockinfo is loaded (missing -> error)."""
    history = one(session, select(History).where(History.currentIdentifierId == identifier_id))
    info = one(session, select(StockInfo).where(StockInfo.stockIdentifier_id == identifier_id))
    return {"stockInfo": stock_info_json(info),
            "nodes": [tree_by_identifier(session, child) for child in _children(history)]}


def tree_by_root(session: Session, root_id: int, info_by_id: dict[int, StockInfo]) -> dict[str, Any]:
    """collectDataForTreeByRootId: nodes come from the root's histories; stockInfo from
    `info_by_id`, null when the roll has no stockinfo row."""
    by_current = {h.currentIdentifierId: h for h in session.scalars(
        select(History).where(History.rootIdentifierId == root_id).order_by(History.id))}

    def node(identifier_id: int) -> dict[str, Any]:
        history = by_current[identifier_id]  # Java: NullPointerException when missing
        info = info_by_id.get(identifier_id)
        return {"stockInfo": stock_info_json(info) if info is not None else None,
                "nodes": [node(child) for child in _children(history)]}

    return node(root_id)


def period_trees(session: Session, product_no: str, start: str, end: str) -> list[dict[str, Any]]:
    """findPeriodStockIdentifierHistory: one tree per in-stock order record of the product in
    [start, end]. Every node shows its stockInfo, also a roll created before `start`
    (defect 11 fixed, as in contract-tests/java-patches/11-history-tree-stockinfo-all-
    nodes.patch); Java only loaded rolls created at or after `start` and left the others
    null.

    Only the stockinfo of the trees' nodes is loaded; the patch reads all stockinfo of the
    product instead. Both agree as long as every node has the root's productNo, which is
    what the client sends for a shrink. The backend does not enforce it, though: a piece
    stored under another productNo (only through a hand-made API call) gets its stockInfo
    here and null in the patched Java.

    A roll with more than one stockinfo row (no code path creates that) shows the one
    with the highest id: rows are read in id order and the last one wins."""
    start_db, end_db = client_param_to_db(start), client_param_to_db(end)
    orders = session.scalars(select(InStockOrderRecord).where(
        InStockOrderRecord.productNo == product_no, InStockOrderRecord.createdAt.between(start_db, end_db))
        .order_by(InStockOrderRecord.createdAt, InStockOrderRecord.id)).all()
    roots = [order.stockIdentifierId or 0 for order in orders]
    node_ids = set(session.scalars(select(History.currentIdentifierId).where(History.rootIdentifierId.in_(roots))))
    infos = session.scalars(select(StockInfo).where(StockInfo.stockIdentifier_id.in_(node_ids))
                            .order_by(StockInfo.id)) if node_ids else []
    info_by_id = {info.stockIdentifier_id: info for info in infos}
    return [tree_by_root(session, root, info_by_id) for root in roots]


def structure_gson(session: Session, root_id: int) -> str:
    """HistoryService.findByRootIdentifierId: the root's histories as Gson writes them
    (compact, declaration order, null fields omitted)."""
    out = []
    for h in session.scalars(select(History).where(History.rootIdentifierId == root_id).order_by(History.id)):
        fields = {"id": h.id, "currentIdentifierId": h.currentIdentifierId,
                  "childrenIdentifierId": _children(h) if h.childrenIdentifierId is not None else None,
                  "rootIdentifierId": h.rootIdentifierId}
        out.append({k: v for k, v in fields.items() if v is not None})
    return json.dumps(out, separators=(",", ":"))


def shrink_rollback_candidates(session: Session, product_no: str) -> list[dict[str, Any]]:
    """findByPeriodTransactionRecord: the 5 latest shrinks (SKO) of the product, as trees."""
    shrinks = session.scalars(select(TransactionRecord).where(
        TransactionRecord.productNo == product_no, TransactionRecord.transactionType == "SKO")
        .order_by(TransactionRecord.createdAt.desc(), TransactionRecord.id.desc()).limit(5))
    return [tree_by_identifier(session, t.stockIdentifierId or 0) for t in shrinks]
