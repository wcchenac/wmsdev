"""Allocation (調撥, STKALLT) and adjustment (調整, STKADST) reports.

Ports of StockAllocateRecordExcelHelper / StockAdjustRecordExcelHelper. Each row
carries a sequence number = (0-based row index) - 1, written as a number.
"""

import datetime as dt
from collections.abc import Sequence
from pathlib import Path

from app.reports.workbook import (
    Row,
    append_rows,
    dated_report_path,
    ensure_from_template,
    first_data_row,
    recreate_from_template,
)
from app.stock.models import StockAdjustmentRecord, StockAllocationRecord

ALLOCATION = ("STKALLT", "StockAllocateRecordTemplate", "StockAllocateRecord-")
ADJUSTMENT = ("STKADST", "StockAdjustRecordTemplate", "StockAdjustRecord-")


def _allocation_row(r: StockAllocationRecord, seq: int) -> Row:
    return {1: r.INGWN, 2: r.productNo, 6: seq, 8: r.quantity, 9: "02", 10: r.realQuantity, 15: r.OUTGWN}


def _adjustment_row(r: StockAdjustmentRecord, seq: int) -> Row:
    return {1: r.productNo, 4: seq, 6: r.quantity, 7: "02", 10: r.realQuantity, 13: r.GWN}


def _append(path: Path, records: Sequence, row) -> None:  # noqa: ANN001
    start = first_data_row(path)
    append_rows(path, [row(r, start + i - 1) for i, r in enumerate(records)])


def _write(kind: tuple[str, str, str], records: Sequence, row, day: dt.date, fresh: bool) -> str:  # noqa: ANN001
    folder, template, prefix = kind
    path, name = dated_report_path(folder, prefix, f"{day:%Y%m%d}", day)
    (recreate_from_template if fresh else ensure_from_template)(folder, template, path)
    _append(path, records, row)
    return name


def write_allocations(records: Sequence[StockAllocationRecord], day: dt.date) -> str:
    return _write(ALLOCATION, records, _allocation_row, day, fresh=False)


def write_adjustments(records: Sequence[StockAdjustmentRecord], day: dt.date) -> str:
    return _write(ADJUSTMENT, records, _adjustment_row, day, fresh=False)


def rewrite_allocations(records: Sequence[StockAllocationRecord], day: dt.date) -> str:
    return _write(ALLOCATION, records, _allocation_row, day, fresh=True)


def rewrite_adjustments(records: Sequence[StockAdjustmentRecord], day: dt.date) -> str:
    return _write(ADJUSTMENT, records, _adjustment_row, day, fresh=True)
