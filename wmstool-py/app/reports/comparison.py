"""Daily stock comparison (StockComparisonResult): port of FullStockComparisonExcelHelper.

`create` replaces today's report with the template (createNewFile); `append` writes
only the failing rows, as strings, in a red font (outputComparisonResult).
"""

import datetime as dt
from pathlib import Path

from openpyxl.styles import Font

from app.reports.workbook import append_rows, dated_report_path, recreate_from_template

FOLDER, TEMPLATE, PREFIX = "StockComparisonResult", "StockComparisonResultTemplate", "StockComparisonResult-"
FAIL_FONT = Font(color="FFFF0000")


def create(day: dt.date) -> Path:
    path, _ = dated_report_path(FOLDER, PREFIX, f"{day:%Y%m%d}", day)
    return recreate_from_template(FOLDER, TEMPLATE, path)  # an earlier same-day report is replaced


def append(path: Path, rows: list[list[str | None]]) -> None:
    # None cells (a NULL WMS quantity) stay blank, like Java's setCellValue(null)
    failed = [dict(enumerate(r)) for r in rows if r[5] != "Pass"]
    append_rows(path, failed, font=FAIL_FONT)  # type: ignore[arg-type]
