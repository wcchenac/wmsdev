"""Category detail report (CategoryDetail-<category>.xlsx): port of CategoryDetailExcelHelper.

Per product: a block with supplier/price info (and its photo if one exists),
a table header, one row per roll, then the product's sales summary. Row
positions follow HSSF's getLastRowNum(), which is 0 on an empty sheet; the
writer tracks it explicitly as `last`.
"""

from collections.abc import Sequence
from pathlib import Path

import openpyxl
from openpyxl.drawing.image import Image
from openpyxl.drawing.spreadsheet_drawing import AnchorMarker, TwoCellAnchor
from openpyxl.worksheet.worksheet import Worksheet

from app.config import get_settings
from app.files.reports import EXTENSION, excel_root
from app.reports.workbook import CENTER, THIN_BORDER

LEFT_LABELS = ("品名", "價格異動")
RIGHT_LABELS = ("廠商代碼", "廠商名稱", "成本")
TABLE_HEADER = ("貨號", "批號", "型態", "數量", "單位", "色號", "瑕疵", "備註", "記錄", "進貨方式", "母批進貨日期")

# product info per productNo: [SUPP, SUPPNAME, CCOST, CNAME, DESCRIP]
ProductInfo = dict[str, list[str]]
# sales per productNo: {reason: {"quantity": str, "unit": str}}
Sales = dict[str, dict[str, dict[str, str]]]


class _Sheet:
    def __init__(self, ws: Worksheet) -> None:
        self.ws = ws
        self.last = 0  # HSSF getLastRowNum() of an empty sheet

    def put(self, row: int, col: int, value: str | None) -> None:
        """Create the cell even when `value` is None. Java sets the border and
        alignment on blank cells inside a merge (columns 8..10 and 12..13)."""
        cell = self.ws.cell(row=row + 1, column=col + 1, value=value)
        cell.alignment = CENTER
        cell.border = THIN_BORDER
        self.last = max(self.last, row)

    def merge(self, row: int, first_col: int, last_col: int) -> None:
        self.ws.merge_cells(start_row=row + 1, start_column=first_col + 1, end_row=row + 1, end_column=last_col + 1)
        # openpyxl's merge replaces every cell but the first with a fresh MergedCell
        # and copies only the outer edge of the border. Java's setCellStyle runs on
        # the blanks too (cols 8..10 and 12..13), so put the full style back.
        for col in range(first_col, last_col + 1):
            cell = self.ws.cell(row=row + 1, column=col + 1)
            cell.alignment = CENTER
            cell.border = THIN_BORDER


class _RawJpeg(Image):
    """addPicture(bytes, PICTURE_TYPE_JPEG): the file's bytes are embedded as a JPEG
    without being decoded, so a broken photo is still inserted (openpyxl's Image would
    open it with Pillow and fail).

    Relies on openpyxl 3.1.x internals (pinned to 3.1.5 in pyproject.toml): the writer
    calls the private `_data()` for the media bytes and builds the media path from
    `format` and the class counter `_id`; the drawing reads `width`/`height` and
    `anchor`. Skipping `Image.__init__` is what avoids Pillow. When upgrading openpyxl,
    rerun tests/test_reports.py::test_category_report_embeds_photo_bytes_undecoded.
    """

    def __init__(self, data: bytes) -> None:  # no super().__init__: it decodes the image
        self.raw, self.format, self.width, self.height = data, "jpeg", 0, 0

    def _data(self) -> bytes:
        return self.raw


def _picture(product_no: str) -> Path:
    return Path(get_settings().picture_dir) / f"{product_no}.jpg"


def _first_part(s: _Sheet, product_no: str, info: ProductInfo) -> None:
    """Product info block, photo, table header."""
    last = s.last
    # A product the ERP has no row for gets blank information cells (defect 10 fixed, as
    # in contract-tests/java-patches/10-category-detail-missing-erp-product.patch); Java
    # failed the whole report with a NullPointerException.
    values: Sequence[str | None] = info.get(product_no) or [None] * 5
    for i, right in enumerate(RIGHT_LABELS):
        row = last + 4 + i
        if i < len(LEFT_LABELS):
            s.put(row, 7, LEFT_LABELS[i])
            s.put(row, 8, values[i + 3])
            s.put(row, 9, None)  # blank cells of the 8..10 merge, still bordered
            s.put(row, 10, None)
            s.merge(row, 8, 10)
        s.put(row, 11, right)
        s.put(row, 12, values[i])
        s.put(row, 13, None)  # blank cell of the 12..13 merge
        s.merge(row, 12, 13)
    photo = _picture(product_no)
    if photo.exists():
        image = _RawJpeg(photo.read_bytes())
        image.anchor = TwoCellAnchor(_from=AnchorMarker(col=0, row=last + 2), to=AnchorMarker(col=4, row=last + 16))
        s.ws.add_image(image)
        last += 16
    else:
        last += 10
    for col, title in enumerate(TABLE_HEADER):
        s.put(last, col, title)


def _second_part(s: _Sheet, stock_row: tuple) -> None:
    """One roll: the first 11 columns of the categorydetail row, as text."""
    row = s.last + 1
    for col, value in enumerate(stock_row[:-1]):
        s.put(row, col, None if value is None else str(value))


def _third_part(s: _Sheet, sales: dict[str, dict[str, str]] | None) -> None:
    """Sales summary: four (target, quantity) pairs per row, reasons sorted."""
    last = s.last + 2
    s.put(last, 0, "銷售紀錄")
    last += 1
    for k in range(4):
        s.put(last, 2 * k, "出貨對象")
        s.put(last, 2 * k + 1, "數量")
    if sales is None:
        return
    for i, reason in enumerate(sorted(sales)):
        j = i % 4
        if j == 0:
            last += 1
        s.put(last, 2 * j, reason)
        s.put(last, 2 * j + 1, sales[reason]["quantity"] + sales[reason]["unit"])


def write(category: str, stock_rows: list[tuple], info: ProductInfo, sales: Sales) -> str:
    """outputCategoryResult: replaces CategoryDetail/CategoryDetail-<category>.xlsx."""
    name = f"CategoryDetail-{category}{EXTENSION}"
    path = excel_root() / "CategoryDetail" / name
    if path.exists():
        path.unlink()
    path.parent.mkdir(parents=True, exist_ok=True)
    book = openpyxl.Workbook()
    ws = book.active
    assert ws is not None
    ws.title = category
    s = _Sheet(ws)
    starts_product = True
    for i, row in enumerate(stock_rows):
        product_no = str(row[0])
        if starts_product:
            _first_part(s, product_no, info)
        _second_part(s, row)
        is_last = i + 1 == len(stock_rows)
        next_differs = not is_last and str(stock_rows[i + 1][0]) != product_no
        if is_last or next_differs:
            _third_part(s, sales.get(product_no))
        starts_product = next_differs
    book.save(path)
    return name
