"""Report files on disk, following wmstool's FileController / FileService rules.

Reports live under EXCEL_DIR/<folder>/<year>/<month, no zero padding>/<prefix><yyyyMMdd>.xls,
except CategoryDetail, which is flat.
"""

import datetime as dt
import os
from dataclasses import dataclass
from pathlib import Path

from app.config import get_settings
from app.javacompat import java_period_days, parse_client_datetime

EXTENSION = ".xls"
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


def _dated_name(kind: ReportKind, day: dt.date) -> tuple[Path, str]:
    name = f"{kind.prefix}{day:%Y%m%d}{EXTENSION}"
    return excel_root() / kind.folder / str(day.year) / str(day.month) / name, name


def find_today(category: str, today: dt.date) -> str:
    path, name = _dated_name(REPORTS[category], today)
    return name if path.exists() else NOT_FOUND


def find_period(category: str, start: str, end: str) -> list[str]:
    """Raises ValueError for dates the Java parser rejects."""
    start_dt = parse_client_datetime(start) + dt.timedelta(hours=8)
    end_dt = parse_client_datetime(end) + dt.timedelta(hours=8)
    kind = REPORTS[category]
    found = []
    for i in range(java_period_days(start_dt.date(), end_dt.date()) + 1):
        path, name = _dated_name(kind, start_dt.date() + dt.timedelta(days=i))
        if path.exists():
            found.append(name)
    return found or [NOT_FOUND]


def resolve_download(category: str, file_name: str) -> Path | None:
    """The report file to send, or None (-> 400) for anything Java would reject.

    Names containing a path separator are refused outright: Tomcat answers 400
    for encoded slashes and backslashes before Spring sees them, while Starlette
    decodes them into the path parameter.
    """
    kind = REPORTS.get(category)
    # ':' too: on Windows "C:x" is drive-relative and would escape the folder.
    if kind is None or any(sep in file_name for sep in ("/", "\\", ":")):
        return None
    folder = excel_root() / kind.folder
    if category == "categoryDetail":
        path = folder / f"{file_name}{EXTENSION}"
    else:
        i = file_name.find("-")
        try:
            year = file_name[i + 1 : i + 5]
            month = str(int(file_name[i + 5 : i + 7]))
        except ValueError:
            return None
        path = folder / year / month / f"{file_name}{EXTENSION}"
    return path if path.is_file() else None


def list_categories() -> list[dict[str, str]]:
    """Raises (-> 500, as in Java) when the folder is missing or a name has no '.xls'."""
    folder = excel_root() / REPORTS["categoryDetail"].folder
    result = []
    for name in os.listdir(folder):  # directory order, unsorted, like File.list()
        category = name[name.find("-") + 1 : name.index(EXTENSION)]
        result.append({"label": category, "value": category})
    return result or [{"label": NOT_FOUND, "value": NOT_FOUND}]
