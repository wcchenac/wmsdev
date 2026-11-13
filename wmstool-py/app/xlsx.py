"""POI's Sheet.getLastRowNum() for an .xlsx file, read from the first sheet's XML.

The one rule for "the last row" (Java appends report rows at getLastRowNum() + 1, and
the in-stock import reads rows 1..getLastRowNum()). XSSF creates a row for every <row>
element, whatever it carries: cells, a height, a row style, or nothing at all. openpyxl
drops a bare <row> and leaves the other cell-less ones out of max_row, so the sheet XML
is read directly. Only the standard library is used, so the cutover template check can
import it without the service's dependencies.
"""

import io
import posixpath
import zipfile
from pathlib import Path
from xml.etree import ElementTree

_MAIN = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
_REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
_PKG_REL = "{http://schemas.openxmlformats.org/package/2006/relationships}"


def _first_sheet(book: zipfile.ZipFile) -> str:
    """Zip path of the first <sheet> in workbook.xml (POI's getSheetAt(0))."""
    workbook = ElementTree.fromstring(book.read("xl/workbook.xml"))
    first = workbook.find(f"{_MAIN}sheets/{_MAIN}sheet")
    if first is None:
        raise ValueError("the workbook has no sheet")
    rel_id = first.get(f"{_REL}id")
    rels = ElementTree.fromstring(book.read("xl/_rels/workbook.xml.rels"))
    for rel in rels.iter(f"{_PKG_REL}Relationship"):
        if rel.get("Id") == rel_id:
            target = rel.get("Target", "")
            return target.lstrip("/") if target.startswith("/") else posixpath.normpath(f"xl/{target}")
    raise ValueError(f"no relationship {rel_id} for the first sheet")


def poi_last_row(source: Path | bytes) -> int:
    """0-based index of the highest <row> on the first sheet; 0 for a sheet without rows."""
    with zipfile.ZipFile(io.BytesIO(source) if isinstance(source, bytes) else source) as book:
        last = -1
        with book.open(_first_sheet(book)) as sheet:
            for _, element in ElementTree.iterparse(sheet):
                if element.tag == f"{_MAIN}row":
                    r = element.get("r")
                    # XSSFRow: a <row> without r becomes getLastRowNum() + 1 of the rows so far
                    last = max(last, int(r) - 1 if r is not None else last + 1)
                    element.clear()
        return max(last, 0)
