"""Single-result finders raise when MySQL has more than one row.

Java's Optional finders throw IncorrectResultSizeDataAccessException. scalar()
and first() would keep an arbitrary row, and rollback_in_stock would then DELETE
every match.
"""

import pytest
from sqlalchemy import select

from app.stock.intake import _backlog
from app.stock.intake import InStockItem
from app.stock.models import History, InStockOrderRecord, Product, StockIdentifier, StockInfo, TransactionRecord
from app.stock.moves import _at_most_one, _one, rollback_in_stock
from app.stock.products import update_product_quantity
from app.stock.queries import _info_for


class _Rows:
    def __init__(self, rows: list[object]) -> None:
        self._rows = rows

    def all(self) -> list[object]:
        return self._rows


class _Session:
    def __init__(self, rows: list[object]) -> None:
        self.rows = rows
        self.executed = False

    def scalars(self, stmt):  # noqa: ANN001
        return _Rows(self.rows)

    def execute(self, stmt):  # noqa: ANN001
        self.executed = True

    def get(self, model, key):  # noqa: ANN001
        return self.rows[0] if self.rows else None


def test_one_and_at_most_one_reject_a_second_row():
    session = _Session([object(), object()])
    with pytest.raises(LookupError, match="unique result: 2"):
        _one(session, select(StockInfo))  # type: ignore[arg-type]
    with pytest.raises(LookupError, match="unique result: 2"):
        _at_most_one(session, select(Product))  # type: ignore[arg-type]


def test_product_quantity_does_not_update_one_of_several_rows():
    session = _Session([Product(productNo="CF1001", type="整支", quantity="1"), object()])
    with pytest.raises(LookupError):
        update_product_quantity(session, "CF1001", "整支", "1", "碼")  # type: ignore[arg-type]


def test_backlog_lookup_does_not_reuse_one_of_several_rows():
    session = _Session([object(), object()])
    item = InStockItem("CF1001", "L", "整支", "1", "碼", 0, "", "", "", "normal", "IN1")
    with pytest.raises(LookupError):
        _backlog(session, item, "1", "碼")  # type: ignore[arg-type]


def test_stockinfo_lookup_rejects_a_second_row():
    with pytest.raises(LookupError):
        _info_for(_Session([object(), object()]), 1)  # type: ignore[arg-type]


def test_rollback_in_stock_does_not_delete_when_a_finder_matches_two_rows():
    session = _Session([
        StockInfo(stockIdentifier_id=1),
        StockInfo(stockIdentifier_id=1),
    ])
    with pytest.raises(LookupError):
        rollback_in_stock(session, [1])  # type: ignore[arg-type]
    assert session.executed is False


def test_rollback_lookups_are_single_result_finders():
    """The five rows Java loads are each a single-result finder, not first()."""
    import inspect

    source = inspect.getsource(rollback_in_stock)
    assert ".first()" not in source
    assert ".scalar(" not in source
    for model in (StockInfo, TransactionRecord, InStockOrderRecord, StockIdentifier, History):
        assert model.__name__ in source
