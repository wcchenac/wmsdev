"""stockFullyComparison's failure handling (defect 6 fixed, as in
contract-tests/java-patches/06-stock-compare-write-after-compare.patch): the
comparison runs first and today's report is only replaced afterwards; a comparison
failure leaves the report alone; a failure while writing the rows propagates (400)
instead of being swallowed. The write failure is not reachable through the API in a
contract test, hence these unit tests."""

import datetime as dt
from pathlib import Path

import pytest

from app.stock import compare


@pytest.fixture
def calls(monkeypatch):
    log: list[str] = []
    monkeypatch.setattr(compare, "taipei_today", lambda: dt.date(2026, 11, 13))
    monkeypatch.setattr(compare.comparison, "create", lambda day: log.append("create") or Path("/tmp/x.xlsx"))
    return log


def test_a_failing_comparison_never_touches_the_report(calls, monkeypatch):
    def failing_rows(session):
        calls.append("compare")
        raise TypeError("NULL product quantity")

    monkeypatch.setattr(compare, "comparison_rows", failing_rows)
    with pytest.raises(TypeError):
        compare.stock_full_comparison(None)  # type: ignore[arg-type]
    assert calls == ["compare"]


def test_the_report_is_replaced_after_comparing(calls, monkeypatch):
    def rows(session):
        calls.append("compare")
        return [["CF1", "整支", "", "1", "碼", "Fail", "1"]]

    monkeypatch.setattr(compare, "comparison_rows", rows)
    monkeypatch.setattr(compare.comparison, "append", lambda path, rows: calls.append("append"))
    compare.stock_full_comparison(None)  # type: ignore[arg-type]
    assert calls == ["compare", "create", "append"]


def test_a_row_write_failure_propagates(calls, monkeypatch):
    monkeypatch.setattr(compare, "comparison_rows", lambda session: [["CF1", "整支", "", "1", "碼", "Fail", "1"]])

    def failing_append(path, rows):
        raise OSError("report is open in Excel")

    monkeypatch.setattr(compare.comparison, "append", failing_append)
    with pytest.raises(OSError):
        compare.stock_full_comparison(None)  # type: ignore[arg-type]
    assert calls == ["create"]
