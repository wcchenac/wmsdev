"""python -m app.template_check: does each converted .xlsx template put the first data
row where Java (POI HSSF on the .xls) does?"""

from pathlib import Path

import openpyxl
import pytest
import xlwt

from app.template_check import REQUIRED, check, main, xls_last_row

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


@pytest.mark.parametrize(("merge", "blank_row", "expected"), [
    ((0, 5, 0, 3), None, 0),  # A1:D6 merged, only row 0 has records
    ((0, 5, 0, 3), 2, 2),     # ... plus a bordered blank cell on row 2
    ((2, 7, 0, 3), None, 0),  # a merge entirely below the last row
])
def test_xls_last_row_ignores_merged_ranges(tmp_path, merge, blank_row, expected):
    """xlrd pads nrows to cover merged ranges; HSSF only counts ROW records and cell
    records. Expected values measured with POI 4.1.0 HSSF getLastRowNum() (2026-11-13).
    The MERGEDCELLS record is added directly: xlwt's merge() writes blank cells."""
    book = xlwt.Workbook(encoding="utf-8")
    sheet = book.add_sheet("Sheet1")
    sheet.write(0, 0, "貨號")
    if blank_row is not None:
        sheet.write(blank_row, 1, None, xlwt.easyxf("borders: left thin"))
    sheet._Worksheet__merged_ranges.append(merge)  # noqa: SLF001
    book.save(str(tmp_path / "t.xls"))
    assert xls_last_row(tmp_path / "t.xls") == expected


def _by_name(tmp_path: Path) -> dict[Path, object]:
    return {r.template: r for r in check(tmp_path)}


def _all_required(tmp_path: Path, *, mismatch: Path | None = None) -> None:
    for rel in REQUIRED:
        if rel == mismatch:
            _xls(tmp_path / rel, sized_row=2)
            _xlsx(tmp_path / rel.with_suffix(".xlsx"))
        else:
            _xls(tmp_path / rel)
            _xlsx(tmp_path / rel.with_suffix(".xlsx"))


def test_matching_conversion_is_ok(tmp_path):
    _xls(tmp_path / "STKALLT" / "StockAllocateRecordTemplate.xls", styled_blank_rows=2, sized_row=3)
    _xlsx(tmp_path / "STKALLT" / "StockAllocateRecordTemplate.xlsx", last_formatted_row=3)
    result = _by_name(tmp_path)[Path("STKALLT/StockAllocateRecordTemplate.xls")]
    assert (result.xls_last, result.xlsx_last, result.ok) == (3, 3, True)


def test_conversion_that_drops_a_formatted_row_is_reported(tmp_path):
    _xls(tmp_path / "STKADST" / "StockAdjustRecordTemplate.xls", sized_row=3)
    _xlsx(tmp_path / "STKADST" / "StockAdjustRecordTemplate.xlsx")  # the height-only row is gone
    result = _by_name(tmp_path)[Path("STKADST/StockAdjustRecordTemplate.xls")]
    assert (result.xls_last, result.xlsx_last, result.ok) == (3, 0, False)


def test_missing_xlsx_is_reported(tmp_path):
    _xls(tmp_path / "OutStockList" / "OutStockListTemplate.xls")
    result = _by_name(tmp_path)[Path("OutStockList/OutStockListTemplate.xls")]
    assert (result.xlsx_last, result.ok) == (None, False)


def test_only_templates_are_checked(tmp_path):
    _xls(tmp_path / "STKALLT" / "StockAllocateRecordTemplate.xls")
    _xlsx(tmp_path / "STKALLT" / "StockAllocateRecordTemplate.xlsx")
    _xls(tmp_path / "STKALLT" / "2026" / "11" / "StockAllocateRecord-20261113.xls")  # a report
    names = [r.template for r in check(tmp_path)]
    assert Path("STKALLT/StockAllocateRecordTemplate.xls") in names
    assert Path("STKALLT/2026/11/StockAllocateRecord-20261113.xls") not in names


def test_a_missing_required_template_fails(tmp_path, capsys):
    present = [rel for rel in REQUIRED if rel.name != "StockAdjustRecordTemplate.xls"]
    for rel in present:
        _xls(tmp_path / rel)
        _xlsx(tmp_path / rel.with_suffix(".xlsx"))
    assert main([str(tmp_path)]) == 1
    out = capsys.readouterr().out
    assert "STKADST/StockAdjustRecordTemplate.xls" in out and "MISSING .xls" in out


def test_main_exit_code_and_report(tmp_path, capsys):
    _all_required(tmp_path)
    assert main([str(tmp_path)]) == 0
    _all_required(tmp_path, mismatch=Path("STKADST/StockAdjustRecordTemplate.xls"))
    assert main([str(tmp_path)]) == 1
    out = capsys.readouterr().out
    assert "MISMATCH" in out and "STKADST/StockAdjustRecordTemplate.xls" in out


def test_main_without_templates_fails(tmp_path, capsys):
    assert main([str(tmp_path)]) == 1
    out = capsys.readouterr().out
    assert "MISSING .xls" in out
    for rel in REQUIRED:
        assert rel.as_posix() in out
