"""Report workbooks (.xlsx): template copies and row placement with POI semantics.

The Java helpers append rows at `sheet.getLastRowNum() + 1`; on an HSSF sheet
getLastRowNum() is the 0-based index of the last row and 0 for an empty sheet.
Rows here are {0-based column: value}; None values are not written (Java's
setCellValue(null) leaves the cell blank).
"""

import datetime as dt
from pathlib import Path

import openpyxl
from openpyxl.worksheet.worksheet import Worksheet

from app.files.reports import EXTENSION, excel_root

Row = dict[int, str | int | float | None]


def dated_report_path(folder: str, prefix: str, stamp: str, day: dt.date) -> tuple[Path, str]:
    """EXCEL_DIR/<folder>/<year>/<month, no padding>/<prefix><stamp>.xlsx and the bare file name."""
    name = f"{prefix}{stamp}{EXTENSION}"
    return excel_root() / folder / str(day.year) / str(day.month) / name, name


def _template(folder: str, template: str) -> Path:
    return excel_root() / folder / f"{template}{EXTENSION}"


# Like Java's WorkbookFactory.create(template) at the top of every createNewFile, the
# template is read before the target is touched: a missing template raises
# FileNotFoundError even when today's report exists, and never deletes it.


def _write(target: Path, content: bytes) -> Path:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
    return target


def ensure_from_template(folder: str, template: str, target: Path) -> Path:
    """Copy the template to `target` unless it already exists (createNewFile)."""
    content = _template(folder, template).read_bytes()
    return target if target.exists() else _write(target, content)


def recreate_from_template(folder: str, template: str, target: Path) -> Path:
    """Replace `target` with a fresh copy of the template (deleteAndCreateNewFile)."""
    return _write(target, _template(folder, template).read_bytes())


def poi_last_row(sheet: Worksheet) -> int:
    """HSSF getLastRowNum(): 0-based index of the last row; 0 for an empty sheet.

    POI counts every row record, including a row that only carries formatting (a
    custom height) and no cells. openpyxl's max_row only sees cells, so rows kept in
    row_dimensions (a converted template's formatted rows) are counted as well.
    """
    last = max(sheet.max_row, max(sheet.row_dimensions, default=1))  # 1-based
    return max(last - 1, 0)


def write_row(sheet: Worksheet, index: int, cells: Row, font=None) -> None:  # noqa: ANN001
    for col, value in cells.items():
        if value is None:
            continue
        cell = sheet.cell(row=index + 1, column=col + 1, value=value)
        if font is not None:
            cell.font = font


def append_rows(path: Path, rows: list[Row], font=None) -> None:  # noqa: ANN001
    """Append rows after the last one (getLastRowNum() + 1) on the first sheet."""
    book = openpyxl.load_workbook(path)
    sheet = book.worksheets[0]
    start = poi_last_row(sheet) + 1
    for offset, cells in enumerate(rows):
        write_row(sheet, start + offset, cells, font)
    book.save(path)


def first_data_row(path: Path) -> int:
    """The 0-based row the next append_rows() call starts at."""
    return poi_last_row(openpyxl.load_workbook(path, read_only=False).worksheets[0]) + 1
