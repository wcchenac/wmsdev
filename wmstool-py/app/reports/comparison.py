"""Daily stock comparison (StockComparisonResult): port of FullStockComparisonExcelHelper.

Only failing rows are written, as strings, in a red font.
"""

import datetime as dt

from openpyxl.styles import Font

from app.reports.workbook import append_rows, dated_report_path, recreate_from_template

FOLDER, TEMPLATE, PREFIX = "StockComparisonResult", "StockComparisonResultTemplate", "StockComparisonResult-"
FAIL_FONT = Font(color="FFFF0000")


def write(rows: list[list[str]], day: dt.date) -> str:
    path, name = dated_report_path(FOLDER, PREFIX, f"{day:%Y%m%d}", day)
    recreate_from_template(FOLDER, TEMPLATE, path)  # createNewFile deletes an existing file
    failed = [dict(enumerate(r)) for r in rows if r[5] != "Pass"]
    append_rows(path, failed, font=FAIL_FONT)  # type: ignore[arg-type]
    return name
