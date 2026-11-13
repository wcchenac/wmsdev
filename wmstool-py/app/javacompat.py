"""Java behaviors that leak into wmstool's data and responses.

The contract tests compare against the Java service byte for byte, so these
reproduce Java 8 exactly where it differs from the obvious Python call.
"""

import datetime as dt
import re
import struct
from collections.abc import Iterable, Sequence
from decimal import ROUND_HALF_UP, Decimal

# ---------------------------------------------------------------- HashMap order


def _java_string_hash(s: str) -> int:
    h = 0
    for unit in struct.unpack(f"<{len(s.encode('utf-16-le')) // 2}H", s.encode("utf-16-le")):
        h = (31 * h + unit) & 0xFFFFFFFF
    return h


def java_hashmap_order(keys: Iterable[str]) -> list[str]:
    """keySet() order of a `new HashMap<>()` after put()-ing `keys` in order.

    Java 8 HashMap: bucket = (h ^ (h >>> 16)) & (capacity - 1); capacity starts
    at 16 and doubles when size exceeds 0.75 * capacity. Resizing keeps the
    relative order inside a bucket, so the final order is: by bucket under the
    final capacity, then by first insertion.
    """
    unique = list(dict.fromkeys(keys))
    capacity = 16
    while len(unique) > capacity * 3 // 4:
        capacity *= 2
    buckets: dict[int, list[str]] = {}
    for key in unique:
        h = _java_string_hash(key)
        buckets.setdefault((h ^ (h >> 16)) & (capacity - 1), []).append(key)
    if any(len(b) >= 8 for b in buckets.values()):
        raise NotImplementedError("bucket would be treeified; iteration order not modelled")
    return [key for index in sorted(buckets) for key in buckets[index]]


# ------------------------------------------------------------------- numbers


def java_format_2f(x: float) -> str:
    """String.format("%.2f", x): HALF_UP on the shortest decimal form of x."""
    return str(Decimal(repr(float(x))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def java_double_to_string(x: float) -> str:
    """Double.toString(x): plain in [1e-3, 1e7), else computerized scientific notation."""
    x = float(x)
    if x == 0 or 1e-3 <= abs(x) < 1e7:
        text = repr(x)
        if "e" in text:  # repr switches to exponent earlier than Java for some values
            text = format(Decimal(text), "f")
        return text if "." in text else text + ".0"
    # shortest round-trip digits, then put the point after the first digit
    _, digit_tuple, d_exp = Decimal(repr(abs(x))).normalize().as_tuple()
    digits = "".join(map(str, digit_tuple))
    exp = len(digits) - 1 + int(d_exp)
    fraction = digits[1:] or "0"
    return f"{'-' if x < 0 else ''}{digits[0]}.{fraction}E{exp}"


# --------------------------------------------------- Long[] via ObjectOutputStream

_ARRAY_HEAD = bytes.fromhex(
    "aced0005"  # stream magic + version
    "7572"  # TC_ARRAY, TC_CLASSDESC
    "0011" + "[Ljava.lang.Long;".encode().hex()
    + "7de10ab2bbbc632b"  # serialVersionUID of Long[]
    "02" "0000" "78" "70"  # SC_SERIALIZABLE, 0 fields, TC_ENDBLOCKDATA, no superclass
)
_FIRST_LONG = bytes.fromhex(
    "7372"  # TC_OBJECT, TC_CLASSDESC java.lang.Long
    "000e" + "java.lang.Long".encode().hex()
    + "3b8be490cc8f23df" "02" "0001" "4a" "0005" + "value".encode().hex()
    + "7872"  # TC_ENDBLOCKDATA, superclass TC_CLASSDESC java.lang.Number
    "0010" + "java.lang.Number".encode().hex()
    + "86ac951d0b94e08b" "02" "0000" "78" "70"
)
_NEXT_LONG = bytes.fromhex("7371007e0002")  # TC_OBJECT, TC_REFERENCE to the Long class desc


def serialize_long_array(values: Sequence[int]) -> bytes:
    """What Hibernate stores for a `Long[]` field (java.io.ObjectOutputStream)."""
    out = bytearray(_ARRAY_HEAD)
    out += struct.pack(">i", len(values))
    for i, value in enumerate(values):
        out += _FIRST_LONG if i == 0 else _NEXT_LONG
        out += struct.pack(">q", value)
    return bytes(out)


def deserialize_long_array(blob: bytes) -> list[int]:
    if not blob.startswith(_ARRAY_HEAD):
        raise ValueError("not a serialized java.lang.Long[]")
    pos = len(_ARRAY_HEAD)
    (count,) = struct.unpack_from(">i", blob, pos)
    pos += 4
    values = []
    for i in range(count):
        prefix = _FIRST_LONG if i == 0 else _NEXT_LONG
        if blob[pos : pos + len(prefix)] != prefix:
            raise ValueError(f"unexpected encoding for element {i}")
        pos += len(prefix)
        values.append(struct.unpack_from(">q", blob, pos)[0])
        pos += 8
    return values


# ---------------------------------------------------------------- date / time

_ISO_LOCAL_DATE_TIME = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?$")


def parse_client_datetime(s: str) -> dt.datetime:
    """LocalDateTime.parse(s, DateTimeFormatter.ISO_LOCAL_DATE_TIME)."""
    if not _ISO_LOCAL_DATE_TIME.match(s):
        raise ValueError(f"Text '{s}' could not be parsed")
    head, dot, fraction = s.partition(".")
    return dt.datetime.fromisoformat(head + (dot + fraction[:6] if dot else ""))


def _plus_months(d: dt.date, months: int) -> dt.date:
    total = d.year * 12 + (d.month - 1) + months
    year, month = divmod(total, 12)
    month += 1
    last_day = (dt.date(year + month // 12, month % 12 + 1, 1) - dt.timedelta(days=1)).day
    return dt.date(year, month, min(d.day, last_day))


def java_period_days(start: dt.date, end: dt.date) -> int:
    """Period.between(start, end).getDays() — only the days component."""
    total_months = (end.year * 12 + end.month) - (start.year * 12 + start.month)
    days = end.day - start.day
    if total_months > 0 and days < 0:
        total_months -= 1
        days = (end - _plus_months(start, total_months)).days
    elif total_months < 0 and days > 0:
        total_months += 1
        days -= (_plus_months(end.replace(day=1), 1) - dt.timedelta(days=1)).day
    return days
