"""Cutover check: does each converted .xlsx report template keep the .xls template's last row?

Java (POI HSSF) appends report rows at getLastRowNum() + 1 of the .xls template; the
Python service does the same on the .xlsx (app.xlsx.poi_last_row). A conversion that
drops or adds a cell-less row (bordered blanks, a resized row) moves the first data row
and the 序號 by that much. Run it on the production template folder after converting:

    pip install "wmstool-py[tools]"
    python -m app.template_check D:/OutputFiles

Every *Template.xls under the folder needs a sibling *Template.xlsx with the same last
row; the exit code is 1 otherwise.
"""

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path

from app.xlsx import poi_last_row


def xls_last_row(path: Path) -> int:
    """HSSF getLastRowNum(): the highest row with a ROW record or a cell; 0 when empty."""
    import xlrd  # only needed here: pip install "wmstool-py[tools]"

    book = xlrd.open_workbook(str(path), formatting_info=True, on_demand=True)
    try:
        sheet = book.sheet_by_index(0)
        return max([sheet.nrows - 1, 0, *sheet.rowinfo_map])
    finally:
        book.release_resources()


@dataclass(frozen=True)
class Result:
    template: Path  # the .xls, relative to the checked folder
    xls_last: int
    xlsx_last: int | None  # None: no converted .xlsx next to it

    @property
    def ok(self) -> bool:
        return self.xls_last == self.xlsx_last


def check(excel_dir: Path) -> list[Result]:
    results = []
    for xls in sorted(excel_dir.rglob("*Template.xls")):
        xlsx = xls.with_suffix(".xlsx")
        results.append(Result(
            template=xls.relative_to(excel_dir),
            xls_last=xls_last_row(xls),
            xlsx_last=poi_last_row(xlsx) if xlsx.exists() else None,
        ))
    return results


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m app.template_check",
        description="Compare each *Template.xls with its converted .xlsx: same last row, same first data row.")
    parser.add_argument("excel_dir", type=Path, help="file.filePathForExcels, e.g. D:/OutputFiles")
    args = parser.parse_args(argv)
    results = check(args.excel_dir)
    if not results:
        print(f"no *Template.xls under {args.excel_dir}")
        return 1
    for r in results:
        if r.xlsx_last is None:
            verdict = "MISSING .xlsx"
        else:
            verdict = "OK" if r.ok else f"MISMATCH (first data row {r.xls_last + 1} vs {r.xlsx_last + 1})"
        xlsx = "-" if r.xlsx_last is None else r.xlsx_last
        print(f"{r.template.as_posix()}: .xls last row {r.xls_last}, .xlsx last row {xlsx} -> {verdict}")
    return 0 if all(r.ok for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
