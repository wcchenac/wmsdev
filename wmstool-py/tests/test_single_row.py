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
from app.stock.lookup import NotFound, at_most_one, one
from app.stock.moves import rollback_in_stock
from app.stock.products import update_product_quantity
from app.stock.queries import _info_for


class _Rows:
    def __init__(self, rows: list[object]) -> None:
        self._rows = rows

    def all(self) -> list[object]:
        return self._rows


class _Session:
    """Answers every query with `rows`, or per model with `by_model` when given."""

    def __init__(self, rows: list[object], by_model: dict[type, list[object]] | None = None) -> None:
        self.rows = rows
        self.by_model = by_model
        self.executed = False

    def scalars(self, stmt):  # noqa: ANN001
        if self.by_model is not None:
            return _Rows(self.by_model[stmt.column_descriptions[0]["entity"]])
        return _Rows(self.rows)

    def execute(self, stmt):  # noqa: ANN001
        self.executed = True

    def get(self, model, key):  # noqa: ANN001
        return self.rows[0] if self.rows else None


def test_one_and_at_most_one_reject_a_second_row():
    session = _Session([object(), object()])
    with pytest.raises(LookupError, match="unique result: 2"):
        one(session, select(StockInfo))  # type: ignore[arg-type]
    with pytest.raises(LookupError, match="unique result: 2"):
        at_most_one(session, select(Product))  # type: ignore[arg-type]


def test_one_without_a_row_is_not_found_and_at_most_one_is_none():
    session = _Session([])
    with pytest.raises(NotFound):
        one(session, select(StockInfo))  # type: ignore[arg-type]
    assert at_most_one(session, select(Product)) is None  # type: ignore[arg-type]


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


_ROLLBACK_MODELS = (StockInfo, TransactionRecord, InStockOrderRecord, StockIdentifier, History)


@pytest.mark.parametrize("duplicated", _ROLLBACK_MODELS, ids=lambda model: model.__name__)
def test_each_rollback_lookup_rejects_a_second_row(duplicated):
    """Java loads each of the five rows with a single-result finder. Whichever of them
    has a second row, the rollback fails before anything is deleted."""
    by_model: dict[type, list[object]] = {model: [model()] for model in _ROLLBACK_MODELS}
    by_model[duplicated] = [duplicated(), duplicated()]
    session = _Session([], by_model)
    with pytest.raises(LookupError, match="unique result: 2"):
        rollback_in_stock(session, [1])  # type: ignore[arg-type]
    assert session.executed is False
