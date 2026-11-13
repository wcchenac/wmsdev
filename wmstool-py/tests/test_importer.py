"""The in-stock import reader: which rows count as blank, and how cells read as text.

Expected values measured on 2026-11-13 with POI 4.1.0 XSSF, running the isBlankRow of
contract-tests/java-patches/09-import-skip-blank-rows.patch (for (Cell c : row)
c.toString().trim().isEmpty()) on workbooks built exactly as below.
"""

import datetime as dt
import io

import openpyxl
import pytest
from openpyxl.styles import Font

from app.files.importer import _poi_rows, poi_cell_text
from app.xlsx import poi_last_row


def _text(cell, value: str) -> None:
    cell.value = value
    cell.data_type = "s"  # text, even when it starts with '='


# case -> (how row 2 is filled, POI isBlankRow)
CASES = {
    "numeric_zero": (lambda s: s.cell(2, 6, 0), False),
    "formula_ref": (lambda s: s.cell(2, 1, "=A1"), False),
    "formula_empty_string": (lambda s: s.cell(2, 1, '=""'), False),
    "date": (lambda s: s.cell(2, 1, dt.datetime(2026, 1, 2)), False),
    "boolean_false": (lambda s: s.cell(2, 1, False), False),
    "error_na": (lambda s: s.cell(2, 1, "#N/A"), False),
    "text_beyond_import_columns": (lambda s: s.cell(2, 15, "x"), False),
    "ideographic_space": (lambda s: _text(s.cell(2, 1), "　"), False),  # String.trim() keeps U+3000
    "text_equals": (lambda s: _text(s.cell(2, 1), "="), False),
    "text_equals_spaces": (lambda s: _text(s.cell(2, 1), "=  "), False),
    "spaces_and_tab": (lambda s: _text(s.cell(2, 1), " \t "), True),
    "styled_empty": (lambda s: setattr(s.cell(2, 1), "font", Font(bold=True)), True),
}


def _rows(fill) -> list:  # noqa: ANN001
    book = openpyxl.Workbook()
    sheet = book.worksheets[0]
    sheet["A1"] = "貨號"
    fill(sheet)
    buf = io.BytesIO()
    book.save(buf)
    data = buf.getvalue()
    return _poi_rows(openpyxl.load_workbook(io.BytesIO(data)).worksheets[0], poi_last_row(data))


@pytest.mark.parametrize("case", sorted(CASES))
def test_blank_row_as_poi_judges_it(case):
    fill, blank = CASES[case]
    assert len(_rows(fill)) == (0 if blank else 1)


def test_a_missing_row_between_data_is_skipped():
    def fill(sheet):  # noqa: ANN001, ANN202
        sheet["A2"], sheet["A4"] = "CF1001", "CF1002"

    assert [row[0] for row in _rows(fill)] == ["CF1001", "CF1002"]


def _cell(fill):  # noqa: ANN001, ANN202
    book = openpyxl.Workbook()
    fill(book.worksheets[0]["A1"])
    buf = io.BytesIO()
    book.save(buf)
    return openpyxl.load_workbook(io.BytesIO(buf.getvalue())).worksheets[0]["A1"]


@pytest.mark.parametrize(("fill", "expected"), [
    (lambda c: _text(c, "=A區"), "=A區"),  # text: Cell.toString() keeps the '='
    (lambda c: setattr(c, "value", '="記錄"'), '"記錄"'),  # formula: toString() is the formula
    (lambda c: setattr(c, "value", 50), "50.0"),
    (lambda c: setattr(c, "value", 25.5), "25.5"),
    (lambda c: setattr(c, "value", True), "TRUE"),
])
def test_cell_text_as_poi_prints_it(fill, expected):  # noqa: ANN001
    assert poi_cell_text(_cell(fill)) == expected
