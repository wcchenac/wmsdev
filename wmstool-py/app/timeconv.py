"""Time semantics of the Java service, which the database and the client depend on.

The JVM runs in Asia/Taipei and the JDBC URL says serverTimezone=UTC, so:
- writes: LocalDateTime.now() (Taipei) is stored as naive UTC, millisecond precision (Java 8 clock);
- query parameters: the client sends UTC text, Java adds 8 h and JDBC converts back to UTC,
  so the text compares directly against the stored UTC values;
- reads: stored UTC becomes Taipei time in JSON and in day grouping;
- string dates (firstInStockAt, eliminateDate, shrinkAt) are Taipei yyyy-MM-dd.
"""

import datetime as dt
from zoneinfo import ZoneInfo

from app.javacompat import parse_client_datetime

TAIPEI = ZoneInfo("Asia/Taipei")
UTC = dt.timezone.utc


def java_now_utc() -> dt.datetime:
    now = dt.datetime.now(UTC).replace(tzinfo=None)
    return now.replace(microsecond=now.microsecond // 1000 * 1000)


def taipei_today() -> dt.date:
    return dt.datetime.now(TAIPEI).date()


def taipei_today_iso() -> str:
    return taipei_today().isoformat()


def db_to_taipei(value: dt.datetime | None) -> dt.datetime | None:
    if value is None:
        return None
    return value.replace(tzinfo=UTC).astimezone(TAIPEI).replace(tzinfo=None)


def taipei_to_db(value: dt.datetime) -> dt.datetime:
    return value.replace(tzinfo=TAIPEI).astimezone(UTC).replace(tzinfo=None)


def client_param_to_db(text: str) -> dt.datetime:
    """A client date parameter as the UTC value Java ends up comparing against."""
    return parse_client_datetime(text)


def jackson_local_datetime(value: dt.datetime | None) -> list[int] | None:
    """Jackson jsr310 LocalDateTime array: seconds only if non-zero time remains, nanos if non-zero."""
    if value is None:
        return None
    out = [value.year, value.month, value.day, value.hour, value.minute]
    nanos = value.microsecond * 1000
    if value.second or nanos:
        out.append(value.second)
        if nanos:
            out.append(nanos)
    return out
