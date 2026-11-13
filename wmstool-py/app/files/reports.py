"""Report files on disk, following wmstool's FileController / FileService rules.

Reports live under EXCEL_DIR/<folder>/<year>/<month, no zero padding>/<prefix><yyyyMMdd>.xlsx,
except CategoryDetail, which is flat.
"""

import datetime as dt
import os
from dataclasses import dataclass
from pathlib import Path

from app.config import get_settings
from app.javacompat import java_period_days, parse_client_datetime

# The Java service wrote legacy .xls; the rewrite writes .xlsx (decided 2026-11-13).
# Lookups and downloads accept both so the reports kept from before the cutover stay
# usable (decided 2026-11-13); .xlsx wins when both exist.
EXTENSION = ".xlsx"
LEGACY_EXTENSION = ".xls"
READABLE_EXTENSIONS = (EXTENSION, LEGACY_EXTENSION)
MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
MIMES = {EXTENSION: MIME, LEGACY_EXTENSION: "application/vnd.ms-excel;charset=UTF-8"}
NOT_FOUND = "File Not Found"


@dataclass(frozen=True)
class ReportKind:
    folder: str
    prefix: str | None  # None: the category has no dated file names


REPORTS: dict[str, ReportKind] = {
    "allocation": ReportKind("STKALLT", "StockAllocateRecord-"),
    "adjustment": ReportKind("STKADST", "StockAdjustRecord-"),
    "dailyComparison": ReportKind("StockComparisonResult", "StockComparisonResult-"),
    "outStockList": ReportKind("OutStockList", None),
    "categoryDetail": ReportKind("CategoryDetail", None),
}
DATED_LOOKUP = ("allocation", "adjustment", "dailyComparison")  # the only ones today/interval accept


def excel_root() -> Path:
    return Path(get_settings().excel_dir)


def _existing(stem: Path) -> Path | None:
    """`stem` + .xlsx, else `stem` + .xls (legacy), else None."""
    for ext in READABLE_EXTENSIONS:
        candidate = stem.with_name(stem.name + ext)
        if candidate.is_file():
            return candidate
    return None


def _dated_report(kind: ReportKind, day: dt.date) -> Path | None:
    stem = excel_root() / kind.folder / str(day.year) / str(day.month) / f"{kind.prefix}{day:%Y%m%d}"
    return _existing(stem)


def find_today(category: str, today: dt.date) -> str:
    path = _dated_report(REPORTS[category], today)
    return path.name if path is not None else NOT_FOUND


def find_period(category: str, start: str, end: str) -> list[str]:
    """Raises ValueError for dates the Java parser rejects."""
    start_dt = parse_client_datetime(start) + dt.timedelta(hours=8)
    end_dt = parse_client_datetime(end) + dt.timedelta(hours=8)
    kind = REPORTS[category]
    found = []
    for i in range(java_period_days(start_dt.date(), end_dt.date()) + 1):
        path = _dated_report(kind, start_dt.date() + dt.timedelta(days=i))
        if path is not None:
            found.append(path.name)
    return found or [NOT_FOUND]


def resolve_download(category: str, file_name: str) -> Path | None:
    """The report file to send, or None (-> 400) for anything Java would reject.

    Names containing a path separator are refused outright: Tomcat answers 400
    for encoded slashes and backslashes before Spring sees them, while Starlette
    decodes them into the path parameter.
    """
    kind = REPORTS.get(category)
    # The client builds category-detail names with ".xls"; accept either extension.
    for suffix in READABLE_EXTENSIONS:
        if file_name.endswith(suffix):
            file_name = file_name[: -len(suffix)]
            break
    # ':' too: on Windows "C:x" is drive-relative and would escape the folder.
    if kind is None or any(sep in file_name for sep in ("/", "\\", ":")):
        return None
    folder = excel_root() / kind.folder
    if category == "categoryDetail":
        return _existing(folder / file_name)
    i = file_name.find("-")
    try:
        year = file_name[i + 1 : i + 5]
        month = str(int(file_name[i + 5 : i + 7]))
    except ValueError:
        return None
    return _existing(folder / year / month / file_name)


def list_categories() -> list[dict[str, str]]:
    """Raises (-> 500, as in Java) when the folder is missing or a name has no '.xls'
    (which also matches '.xlsx'). A category with both a legacy .xls and a new .xlsx
    report is listed once."""
    folder = excel_root() / REPORTS["categoryDetail"].folder
    result, seen = [], set()
    for name in os.listdir(folder):  # directory order, unsorted, like File.list()
        category = name[name.find("-") + 1 : name.index(LEGACY_EXTENSION)]
        if category not in seen:
            seen.add(category)
            result.append({"label": category, "value": category})
    return result or [{"label": NOT_FOUND, "value": NOT_FOUND}]
