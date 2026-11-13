"""The in-stock import workbook, read the way FileService.importStockRecord reads it.

Columns (row 1 is a header): 0 貨號, 1 批號, 2 型態, 3 數量, 4 單位, 5 色號,
6 瑕疵, 7 備註, 8 記錄, 9 進貨方式, 10 單號. Cell text follows POI's
Cell.toString(), e.g. a numeric 25.5 reads "25.5" and 50 reads "50.0".
"""

import io

import openpyxl

from app.javacompat import java_double_to_string
from app.stock.intake import InStockItem

REQUIRED = (0, 2, 3, 4, 5, 9)


class ImportParseError(Exception):
    """The file is skipped (Java logs the exception and carries on)."""


def poi_cell_text(value: object) -> str | None:
    """POI Cell.toString() for an openpyxl value; None for a missing cell."""
    if value is None:
        return None
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return java_double_to_string(float(value))
    text = str(value)
    return text[1:] if text.startswith("=") else text  # formula cells print without '='


def read_import_workbook(data: bytes) -> list[InStockItem]:
    try:
        sheet = openpyxl.load_workbook(io.BytesIO(data)).worksheets[0]
        items = []
        for row in sheet.iter_rows(min_row=2, values_only=True):
            cells = [poi_cell_text(v) for v in row] + [None] * max(0, 11 - len(row))
            if all(c is None for c in cells):
                raise ImportParseError("empty row (Java: null row)")
            required = [cells[i] for i in REQUIRED]
            if any(c is None for c in required):
                raise ImportParseError("a required cell is missing")
            product_no, type_, quantity, unit, color, in_stock_type = (str(c) for c in required)
            items.append(InStockItem(
                productNo=product_no, lotNo=cells[1] or "", type=type_, quantity=quantity, unit=unit,
                color=int(float(color)), defect=cells[6] or "", remark=cells[7] or "", record=cells[8] or "",
                inStockType=in_stock_type, orderNo=cells[10] or "",
            ))
        return items
    except ImportParseError:
        raise
    except Exception as exc:  # not an xlsx, bad colour, ... — Java swallows them all
        raise ImportParseError(str(exc)) from exc
