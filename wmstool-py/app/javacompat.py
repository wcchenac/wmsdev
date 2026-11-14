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


def _java_long_hash(v: int) -> int:
    """Long.hashCode(): (int) (value ^ (value >>> 32))."""
    u = v & 0xFFFFFFFFFFFFFFFF
    return (u ^ (u >> 32)) & 0xFFFFFFFF


def java_hashmap_order(keys: Iterable[str]) -> list[str]:
    """keySet() order of a `new HashMap<String, ?>()` after put()-ing `keys` in order.

    Java 8 HashMap: bucket = (h ^ (h >>> 16)) & (capacity - 1); capacity starts
    at 16 and doubles when size exceeds 0.75 * capacity. Resizing keeps the
    relative order inside a bucket, so the final order is: by bucket under the
    final capacity, then by first insertion.
    """
    return _hashmap_order(keys, _java_string_hash)


def java_hashmap_order_long(keys: Iterable[int]) -> list[int]:
    """keySet() order of a `new HashMap<Long, ?>()` (see java_hashmap_order)."""
    return _hashmap_order(keys, _java_long_hash)


def _hashmap_order(keys, hash_fn):  # noqa: ANN001, ANN202
    unique = list(dict.fromkeys(keys))
    capacity = 16
    while len(unique) > capacity * 3 // 4:
        capacity *= 2
    buckets: dict[int, list] = {}
    for key in unique:
        h = hash_fn(key)
        buckets.setdefault((h ^ (h >> 16)) & (capacity - 1), []).append(key)
    # Java converts a bin when it gets its 9th node (treeify, or a resize while the
    # table is under 64): only then does this model's order stop being exact.
    if any(len(b) > 8 for b in buckets.values()):
        raise NotImplementedError("bucket would be treeified; iteration order not modelled")
    return [key for index in sorted(buckets) for key in buckets[index]]


# ------------------------------------------------------------------- strings

_JAVA_TRIM = "".join(chr(c) for c in range(0x21))


def java_trim(text: str) -> str:
    """String.trim(): strips only characters <= U+0020 (not U+3000, not U+00A0)."""
    return text.strip(_JAVA_TRIM)


def java_is_blank(value: object) -> bool:
    """Bean Validation @NotBlank: null, or empty after String.trim()."""
    return value is None or (isinstance(value, str) and java_trim(value) == "")


# ------------------------------------------------------------------- numbers


_JAVA_DOUBLE = re.compile(
    r"[+-]?(?:NaN|Infinity|(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?[fFdD]?)"
)
_JAVA_INT = re.compile(r"[+-]?\d+")  # \d: any Unicode decimal digit, as Character.digit accepts


def java_parse_double(text: str) -> float:
    """Double.parseDouble: String.trim()s, ASCII digits only, optional f/d suffix.

    Python's float() is looser (full-width digits, '1_0', 'nan'); a value Java
    cannot parse must not be accepted here, or the Java service would later fail
    reading what Python stored. (Hex floats are rejected; Java would accept them.)
    """
    trimmed = text.strip("".join(chr(c) for c in range(0x21)))
    if not _JAVA_DOUBLE.fullmatch(trimmed):
        raise ValueError(f'For input string: "{text}"')
    return float(trimmed.rstrip("fFdD").replace("Infinity", "inf"))


def java_parse_int(text: str) -> int:
    """Integer.parseInt: sign + decimal digits (Unicode digits allowed), no trimming."""
    if not _JAVA_INT.fullmatch(text):
        raise ValueError(f'For input string: "{text}"')
    value = int(text)
    if not -(2**31) <= value < 2**31:
        raise ValueError(f'For input string: "{text}"')
    return value


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


def read_long_array_prefix(blob: bytes) -> tuple[int | None, list[int]]:
    """What can still be read from a possibly cut serialized `Long[]`: the declared
    length (None when the blob is too short to hold it) and the elements that are
    complete. Raises ValueError when the blob does not start like a `Long[]` at all."""
    if not blob.startswith(_ARRAY_HEAD):
        raise ValueError("not a serialized java.lang.Long[]")
    pos = len(_ARRAY_HEAD)
    if len(blob) < pos + 4:
        return None, []
    (count,) = struct.unpack_from(">i", blob, pos)
    pos += 4
    values: list[int] = []
    for i in range(count):
        prefix = _FIRST_LONG if i == 0 else _NEXT_LONG
        if blob[pos : pos + len(prefix)] != prefix or len(blob) < pos + len(prefix) + 8:
            break
        pos += len(prefix)
        values.append(struct.unpack_from(">q", blob, pos)[0])
        pos += 8
    return count, values


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


def java_parse_long(text: str) -> int:
    """Long.parseLong / Long.valueOf: like java_parse_int, 64-bit range."""
    if not _JAVA_INT.fullmatch(text):
        raise ValueError(f'For input string: "{text}"')
    value = int(text)
    if not -(2**63) <= value < 2**63:
        raise ValueError(f'For input string: "{text}"')
    return value


# Character.isWhitespace: Unicode space separators except the no-break ones, plus these controls
_JAVA_WHITESPACE_CONTROLS = frozenset("\t\n\u000b\f\r\u001c\u001d\u001e\u001f")
_NO_BREAK_SPACES = frozenset("   ")
_HEX_DIGITS = re.compile(r"[0-9a-fA-F\d]+")  # Character.digit(c, 16), Unicode decimal digits included


def _java_is_whitespace(c: str) -> bool:
    import unicodedata

    if c in _JAVA_WHITESPACE_CONTROLS:
        return True
    return unicodedata.category(c) in ("Zs", "Zl", "Zp") and c not in _NO_BREAK_SPACES


def spring_parse_long(text: str) -> int:
    """How Spring 5.2 binds a `long` request parameter (NumberUtils.parseNumber):
    every whitespace character is removed (trimAllWhitespace, inside the text too);
    "0x"/"0X"/"#" after an optional "-" is hexadecimal (Long.decode), anything else is
    Long.valueOf. An empty value is missing. Raises ValueError where Spring answers 400."""
    trimmed = "".join(c for c in text if not _java_is_whitespace(c))
    sign, body = (-1, trimmed[1:]) if trimmed.startswith("-") else (1, trimmed)
    for prefix in ("0x", "0X", "#"):
        if body.startswith(prefix):
            digits = body[len(prefix):]
            if not _HEX_DIGITS.fullmatch(digits):
                raise ValueError(f'For input string: "{text}"')
            value = sign * int(digits, 16)
            if not -(2**63) <= value < 2**63:
                raise ValueError(f'For input string: "{text}"')
            return value
    return java_parse_long(trimmed)
