"""Report files on disk, following wmstool's FileController / FileService rules.

Reports live under EXCEL_DIR/<folder>/<year>/<month, no zero padding>/<prefix><yyyyMMdd>.xls,
except CategoryDetail, which is flat.
"""

import datetime as dt
import os
from dataclasses import dataclass
from pathlib import Path
from zoneinfo import ZoneInfo

from app.config import get_settings
from app.javacompat import java_period_days, parse_client_datetime

EXTENSION = ".xls"
NOT_FOUND = "File Not Found"
TAIPEI = ZoneInfo("Asia/Taipei")


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


def taipei_today() -> dt.date:
    return dt.datetime.now(TAIPEI).date()


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


def list_categories() -> list[dict[str, str]]:
    """Raises (-> 500, as in Java) when the folder is missing or a name has no '.xls'."""
    folder = excel_root() / REPORTS["categoryDetail"].folder
    result = []
    for name in os.listdir(folder):  # directory order, unsorted, like File.list()
        category = name[name.find("-") + 1 : name.index(EXTENSION)]
        result.append({"label": category, "value": category})
    return result or [{"label": NOT_FOUND, "value": NOT_FOUND}]
