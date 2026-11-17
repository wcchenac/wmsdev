"""Cutover check: does each converted .xlsx report template keep the .xls template's last row?

Java (POI HSSF) appends report rows at getLastRowNum() + 1 of the .xls template; the
Python service does the same on the .xlsx (app.xlsx.poi_last_row). A conversion that
drops or adds a cell-less row (bordered blanks, a resized row) moves the first data row
and the 序號 by that much. Run it on the production template folder after converting:

    pip install "wmstool-py[tools]"
    python -m app.template_check D:/OutputFiles

Every *Template.xls under the folder needs a sibling *Template.xlsx with the same last
row. The four templates the service copies (OutStockList, STKADST, STKALLT,
StockComparisonResult) must be present even when the folder has other templates.
The exit code is 1 otherwise.
"""

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path

from app.xlsx import poi_last_row


def xls_last_row(path: Path) -> int:
    """HSSF getLastRowNum(): the highest row with a ROW record or a cell record; 0 when empty.

    xlrd's nrows is not that: it is padded with XL_CELL_EMPTY cells to cover merged
    ranges, which HSSF does not count. Real cells (BLANK included, with formatting_info)
    are never XL_CELL_EMPTY. Checked against POI 4.1.0 HSSF in tests/test_template_check.py.
    """
    import xlrd  # only needed here: pip install "wmstool-py[tools]"

    book = xlrd.open_workbook(str(path), formatting_info=True, on_demand=True)
    try:
        sheet = book.sheet_by_index(0)
        cell_rows = [r for r in range(sheet.nrows)
                     if any(cell.ctype != xlrd.XL_CELL_EMPTY for cell in sheet.row(r))]
        return max([0, *sheet.rowinfo_map, *cell_rows])
    finally:
        book.release_resources()


# The four workbooks the service copies from. A cutover folder that lacks one of
# them would start and then fail the first report that needs it.
REQUIRED = (
    Path("OutStockList/OutStockListTemplate.xls"),
    Path("STKADST/StockAdjustRecordTemplate.xls"),
    Path("STKALLT/StockAllocateRecordTemplate.xls"),
    Path("StockComparisonResult/StockComparisonResultTemplate.xls"),
)


@dataclass(frozen=True)
class Result:
    template: Path  # the .xls, relative to the checked folder
    xls_last: int | None  # None: that .xls is not in the folder
    xlsx_last: int | None  # None: no converted .xlsx next to it

    @property
    def ok(self) -> bool:
        return self.xls_last is not None and self.xls_last == self.xlsx_last


def check(excel_dir: Path) -> list[Result]:
    found: dict[Path, Result] = {}
    for xls in sorted(excel_dir.rglob("*Template.xls")):
        rel = xls.relative_to(excel_dir)
        xlsx = xls.with_suffix(".xlsx")
        found[rel] = Result(rel, xls_last_row(xls), poi_last_row(xlsx) if xlsx.exists() else None)
    for required in REQUIRED:
        if required not in found:
            xlsx = (excel_dir / required).with_suffix(".xlsx")
            found[required] = Result(required, None, poi_last_row(xlsx) if xlsx.exists() else None)
    return [found[key] for key in sorted(found, key=lambda path: path.as_posix())]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m app.template_check",
        description="Compare each *Template.xls with its converted .xlsx: same last row, same first data row.")
    parser.add_argument("excel_dir", type=Path, help="file.filePathForExcels, e.g. D:/OutputFiles")
    args = parser.parse_args(argv)
    results = check(args.excel_dir)
    for r in results:
        if r.xls_last is None:
            verdict, xls = "MISSING .xls", "-"
        elif r.xlsx_last is None:
            verdict, xls = "MISSING .xlsx", r.xls_last
        else:
            verdict = "OK" if r.ok else f"MISMATCH (first data row {r.xls_last + 1} vs {r.xlsx_last + 1})"
            xls = r.xls_last
        xlsx = "-" if r.xlsx_last is None else r.xlsx_last
        print(f"{r.template.as_posix()}: .xls last row {xls}, .xlsx last row {xlsx} -> {verdict}")
    return 0 if results and all(r.ok for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
