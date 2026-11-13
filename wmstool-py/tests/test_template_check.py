"""python -m app.template_check: does each converted .xlsx template put the first data
row where Java (POI HSSF on the .xls) does?"""

from pathlib import Path

import openpyxl
import xlwt

from app.template_check import check, main, xls_last_row

HEADER = ["貨號", "數量"]


def _xls(path: Path, *, styled_blank_rows: int = 0, sized_row: int | None = None) -> None:
    """Header on row 0, bordered empty cells on the next rows, optionally a height-only row."""
    border = xlwt.easyxf("borders: left thin, right thin, top thin, bottom thin")
    book = xlwt.Workbook(encoding="utf-8")
    sheet = book.add_sheet("Sheet1")
    for col, title in enumerate(HEADER):
        sheet.write(0, col, title, border)
    for r in range(1, styled_blank_rows + 1):
        for col in range(len(HEADER)):
            sheet.write(r, col, None, border)
    if sized_row is not None:
        sheet.row(sized_row).height_mismatch = True
        sheet.row(sized_row).height = 600
    path.parent.mkdir(parents=True, exist_ok=True)
    book.save(str(path))


def _xlsx(path: Path, *, last_formatted_row: int | None = None) -> None:
    """Header on row 1 (1-based); optionally a height-only row as a converter keeps it."""
    book = openpyxl.Workbook()
    sheet = book.worksheets[0]
    sheet.append(HEADER)
    if last_formatted_row is not None:
        sheet.row_dimensions[last_formatted_row + 1].height = 30
    path.parent.mkdir(parents=True, exist_ok=True)
    book.save(path)


def test_xls_last_row_counts_rows_without_values(tmp_path):
    """HSSF counts every ROW record: styled blank cells and a height-only row."""
    _xls(tmp_path / "a.xls")
    _xls(tmp_path / "b.xls", styled_blank_rows=2, sized_row=3)
    assert xls_last_row(tmp_path / "a.xls") == 0
    assert xls_last_row(tmp_path / "b.xls") == 3


def test_matching_conversion_is_ok(tmp_path):
    _xls(tmp_path / "STKALLT" / "StockAllocateRecordTemplate.xls", styled_blank_rows=2, sized_row=3)
    _xlsx(tmp_path / "STKALLT" / "StockAllocateRecordTemplate.xlsx", last_formatted_row=3)
    (result,) = check(tmp_path)
    assert (result.xls_last, result.xlsx_last, result.ok) == (3, 3, True)


def test_conversion_that_drops_a_formatted_row_is_reported(tmp_path):
    _xls(tmp_path / "STKADST" / "StockAdjustRecordTemplate.xls", sized_row=3)
    _xlsx(tmp_path / "STKADST" / "StockAdjustRecordTemplate.xlsx")  # the height-only row is gone
    (result,) = check(tmp_path)
    assert (result.xls_last, result.xlsx_last, result.ok) == (3, 0, False)


def test_missing_xlsx_is_reported(tmp_path):
    _xls(tmp_path / "OutStockList" / "OutStockListTemplate.xls")
    (result,) = check(tmp_path)
    assert (result.xlsx_last, result.ok) == (None, False)


def test_only_templates_are_checked(tmp_path):
    _xls(tmp_path / "STKALLT" / "StockAllocateRecordTemplate.xls")
    _xlsx(tmp_path / "STKALLT" / "StockAllocateRecordTemplate.xlsx")
    _xls(tmp_path / "STKALLT" / "2026" / "11" / "StockAllocateRecord-20261113.xls")  # a report
    assert [r.template for r in check(tmp_path)] == [Path("STKALLT/StockAllocateRecordTemplate.xls")]


def test_main_exit_code_and_report(tmp_path, capsys):
    _xls(tmp_path / "A" / "ATemplate.xls")
    _xlsx(tmp_path / "A" / "ATemplate.xlsx")
    assert main([str(tmp_path)]) == 0
    _xls(tmp_path / "B" / "BTemplate.xls", sized_row=2)
    _xlsx(tmp_path / "B" / "BTemplate.xlsx")
    assert main([str(tmp_path)]) == 1
    out = capsys.readouterr().out
    assert "A/ATemplate.xls" in out and "B/BTemplate.xls" in out and "MISMATCH" in out


def test_main_without_templates_fails(tmp_path, capsys):
    assert main([str(tmp_path)]) == 1
    assert "no *Template.xls" in capsys.readouterr().out
