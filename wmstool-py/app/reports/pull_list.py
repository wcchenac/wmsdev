"""Pull list (拉貨單, OutStockList): port of OutStockRequestExcelHelper.

The file name carries the Taipei time to the second, so every update makes a new file.
"""

import datetime as dt
from collections.abc import Sequence
from pathlib import Path

from app.reports.workbook import append_rows, dated_report_path, recreate_from_template
from app.stock.models import OutStockRequest

FOLDER, TEMPLATE, PREFIX = "OutStockList", "OutStockListTemplate", "OutStockList-"


def create(now_taipei: dt.datetime) -> tuple[Path, str]:
    """createNewFile: write the template to OutStockList-yyyyMMddHHmmss.xlsx. Like Java,
    an existing file of the same second is overwritten (its rows are lost)."""
    path, name = dated_report_path(FOLDER, PREFIX, f"{now_taipei:%Y%m%d%H%M%S}", now_taipei.date())
    recreate_from_template(FOLDER, TEMPLATE, path)
    return path, name


def append(path: Path, requests: Sequence[OutStockRequest]) -> None:
    """modifyExisting: one row per handled request; colour is written as a number."""
    append_rows(path, [
        {0: r.productNo, 1: r.lotNo, 2: r.color, 3: r.defect, 4: r.quantity, 6: r.reason, 8: r.requestFrom}
        for r in requests
    ])
