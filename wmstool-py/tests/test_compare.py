"""stockFullyComparison's failure handling, read from CompareStockFunction (not
reachable through the API in a contract test): the report is recreated from the
template first; a comparison failure propagates; a failure while writing the rows
is only logged (Java wraps outputComparisonResult in try/catch)."""

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


def test_report_is_recreated_before_comparing(calls, monkeypatch):
    def failing_rows(session):
        calls.append("compare")
        raise TypeError("NULL product quantity")

    monkeypatch.setattr(compare, "comparison_rows", failing_rows)
    with pytest.raises(TypeError):
        compare.stock_full_comparison(None)  # type: ignore[arg-type]
    assert calls == ["create", "compare"]


def test_row_write_failure_is_swallowed(calls, monkeypatch):
    monkeypatch.setattr(compare, "comparison_rows", lambda session: [["CF1", "整支", "", "1", "碼", "Fail", "1"]])

    def failing_append(path, rows):
        raise OSError("report is open in Excel")

    monkeypatch.setattr(compare.comparison, "append", failing_append)
    compare.stock_full_comparison(None)  # type: ignore[arg-type]  # must not raise
    assert calls == ["create"]
