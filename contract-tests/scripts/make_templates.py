"""Create minimal .xls templates the backend copies when it writes reports.

Production keeps the real templates in file.filePathForExcels (D:/OutputFiles);
they are not in the repo. The Java code only needs sheet 0 to exist and appends
rows after the last one, so a one-row header per template is enough.

Usage: python scripts/make_templates.py <excel-dir>
"""

import pathlib
import sys

import xlwt

TEMPLATES = {
    # template file -> (sub folder it is stored under, header row)
    "OutStockListTemplate": ("OutStockList", ["貨號", "批號", "型態", "數量", "單位", "", "色號", "", "原因"]),
    "StockAdjustRecordTemplate": ("STKADST", ["", "貨號", "", "", "數量", "", "單位", "實際數量", "", "", "倉別", "", "", "來源"]),
    "StockAllocateRecordTemplate": ("STKALLT", ["", "貨號", "數量", "", "", "", "單位", "", "實際數量", "轉出倉", "轉入倉"]),
    "StockComparisonResultTemplate": ("StockComparisonResult", ["貨號", "型態", "ERP數量", "WMS數量", "單位", "結果", "差異"]),
}


def main(excel_dir: str) -> None:
    root = pathlib.Path(excel_dir)
    for name, (sub, header) in TEMPLATES.items():
        folder = root / sub
        folder.mkdir(parents=True, exist_ok=True)
        book = xlwt.Workbook(encoding="utf-8")
        sheet = book.add_sheet("Sheet1")
        for col, title in enumerate(header):
            sheet.write(0, col, title)
        book.save(str(folder / f"{name}.xls"))


if __name__ == "__main__":
    main(sys.argv[1])
