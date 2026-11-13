"""Pull list (拉貨單, OutStockList): port of OutStockRequestExcelHelper.

The file name carries the Taipei time to the second: updates in different seconds make
different files, updates in the same second share one.
"""

import datetime as dt
from collections.abc import Sequence
from pathlib import Path

from app.reports.workbook import append_rows, dated_report_path, ensure_from_template
from app.stock.models import OutStockRequest

FOLDER, TEMPLATE, PREFIX = "OutStockList", "OutStockListTemplate", "OutStockList-"


def create(now_taipei: dt.datetime) -> tuple[Path, str]:
    """createNewFile: copy the template to OutStockList-yyyyMMddHHmmss.xlsx. A file of
    the same second already there is kept, and the new rows go after its rows (defect 5
    fixed, as in contract-tests/java-patches/05-pull-list-append-same-second.patch);
    Java rewrote it from the template and lost the first update's rows."""
    path, name = dated_report_path(FOLDER, PREFIX, f"{now_taipei:%Y%m%d%H%M%S}", now_taipei.date())
    ensure_from_template(FOLDER, TEMPLATE, path)
    return path, name


def append(path: Path, requests: Sequence[OutStockRequest]) -> None:
    """modifyExisting: one row per handled request; colour is written as a number."""
    append_rows(path, [
        {0: r.productNo, 1: r.lotNo, 2: r.color, 3: r.defect, 4: r.quantity, 6: r.reason, 8: r.requestFrom}
        for r in requests
    ])
