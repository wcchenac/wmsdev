"""POI's getLastRowNum() for .xlsx (XSSF): every <row> element counts, cells or not."""

import io
import zipfile

import openpyxl
import pytest
from openpyxl.styles import Font

from app.xlsx import poi_last_row


def _save(book: openpyxl.Workbook) -> bytes:
    buf = io.BytesIO()
    book.save(buf)
    return buf.getvalue()


def _book(*rows: list) -> openpyxl.Workbook:
    book = openpyxl.Workbook()
    for row in rows:
        book.worksheets[0].append(row)
    return book


def _rewrite_sheet(data: bytes, old: bytes, new: bytes, sheet: str = "xl/worksheets/sheet1.xml") -> bytes:
    src, out = zipfile.ZipFile(io.BytesIO(data)), io.BytesIO()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as dst:
        for item in src.infolist():
            content = src.read(item.filename)
            if item.filename == sheet:
                assert old in content
                content = content.replace(old, new)
            dst.writestr(item, content)
    return out.getvalue()


def test_empty_sheet_is_zero():
    assert poi_last_row(_save(openpyxl.Workbook())) == 0


def test_header_only_is_zero():
    assert poi_last_row(_save(_book(["貨號"]))) == 0


def test_cells_decide_the_last_row():
    assert poi_last_row(_save(_book(["貨號"], ["CF1001"], ["CF1002"]))) == 2


@pytest.mark.parametrize("shape", ["height", "style"])
def test_row_without_cells_counts(shape):
    book = _book(["貨號"], ["CF1001"])
    if shape == "height":
        book.worksheets[0].row_dimensions[5].height = 30
    else:
        book.worksheets[0].row_dimensions[5].font = Font(bold=True)
    assert poi_last_row(_save(book)) == 4


def test_bare_row_element_counts():
    """<row r="5"/> carries nothing openpyxl keeps, but XSSF still creates the row."""
    data = _rewrite_sheet(_save(_book(["貨號"], ["CF1001"])), b"</sheetData>", b'<row r="5"/></sheetData>')
    assert openpyxl.load_workbook(io.BytesIO(data)).worksheets[0].max_row == 2  # openpyxl cannot see it
    assert poi_last_row(data) == 4


def test_rows_without_r_follow_the_previous_row():
    """XSSF numbers a <row> without r as the previous row + 1."""
    data = _rewrite_sheet(_save(_book(["貨號"])), b"</sheetData>", b"<row/><row/></sheetData>")
    assert poi_last_row(data) == 2


def test_out_of_order_rows_take_the_highest():
    data = _rewrite_sheet(_save(_book(["貨號"])), b"</sheetData>", b'<row r="9"/><row r="4"/></sheetData>')
    assert poi_last_row(data) == 8


def test_only_the_first_sheet_counts():
    book = _book(["貨號"])
    book.create_sheet("second").append(["x"])
    book["second"].row_dimensions[9].height = 30
    assert poi_last_row(_save(book)) == 0


def test_accepts_a_path(tmp_path):
    path = tmp_path / "report.xlsx"
    path.write_bytes(_save(_book(["貨號"], ["CF1001"])))
    assert poi_last_row(path) == 1
