"""Create .xls report templates shaped like hand-made production ones, for the
template-conversion contract test.

The production templates (file.filePathForExcels, D:/OutputFiles) are not in the repo.
A hand-made template is more than a header: rows below it are often pre-formatted
(bordered but empty cells) or only resized. POI's HSSF getLastRowNum() counts every
row record, so those rows decide where Java writes the first data row and the 序號.

Each template written here has:
  row 0     the header
  rows 1-2  bordered empty cells (BLANK records, no value)
  row 3     a custom height only (a ROW record without cells)

The .xlsx counterparts are produced the way the cutover converts production
templates (soffice --headless --convert-to xlsx); see scripts/convert_templates.sh.

Usage: python scripts/make_formatted_templates.py <out-dir>
"""

import pathlib
import sys

import xlwt

from make_templates import TEMPLATES

FORMATTED = ("OutStockListTemplate", "StockAdjustRecordTemplate", "StockAllocateRecordTemplate")


def main(out_dir: str) -> None:
    out = pathlib.Path(out_dir)
    border = xlwt.easyxf("borders: left thin, right thin, top thin, bottom thin")
    for name in FORMATTED:
        _, header = TEMPLATES[name]
        book = xlwt.Workbook(encoding="utf-8")
        sheet = book.add_sheet("Sheet1")
        for col, title in enumerate(header):
            sheet.write(0, col, title, border)
        for r in (1, 2):
            for col in range(len(header)):
                sheet.write(r, col, None, border)  # a styled BLANK cell
        sheet.row(3).height_mismatch = True
        sheet.row(3).height = 600
        out.mkdir(parents=True, exist_ok=True)
        book.save(str(out / f"{name}.xls"))


if __name__ == "__main__":
    main(sys.argv[1])
