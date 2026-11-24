"""Java behaviors that leak into wmstool's data and responses.

The contract tests compare against the Java service byte for byte, so these
reproduce Java 8 exactly where it differs from the obvious Python call.
"""

import datetime as dt
import re
import struct
from collections.abc import Iterable, Sequence
from decimal import ROUND_HALF_UP, Decimal
from typing import Any

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

    Simulates Java 8's HashMap (see _JavaHashMap), colliding bins included; checked
    against a real JDK 8 in tests (fixtures/java_hashmap).
    """
    m = _JavaHashMap(_java_string_hash, _java_string_compare)
    for key in keys:
        m.put(key)
    return m.keys()


def java_hashmap_order_long(keys: Iterable[int]) -> list[int]:
    """keySet() order of a `new HashMap<Long, ?>()` (see java_hashmap_order)."""
    m = _JavaHashMap(_java_long_hash, lambda a, b: (a > b) - (a < b))
    for key in keys:
        m.put(key)
    return m.keys()


def _java_string_compare(a: str, b: str) -> int:
    """Sign of String.compareTo: UTF-16 code units, then length."""
    ua, ub = a.encode("utf-16-be"), b.encode("utf-16-be")
    return (ua > ub) - (ua < ub)


class _Node:
    __slots__ = ("hash", "key", "next", "tree", "prev", "parent", "left", "right", "red")
    hash: int
    key: Any
    next: "_Node | None"
    tree: bool
    prev: "_Node | None"
    parent: "_Node | None"
    left: "_Node | None"
    right: "_Node | None"
    red: bool

    def __init__(self, h: int, key: Any, tree: bool = False) -> None:
        self.hash, self.key, self.next, self.tree = h, key, None, tree
        self.prev = self.parent = self.left = self.right = None
        self.red = False


class _JavaHashMap:
    """java.util.HashMap (JDK 8) put() and keySet() order, for distinct keys.

    A bin is a linked list in insertion order. A list getting its 9th node is
    treeified (TreeNode red-black tree keyed by hash, then compareTo) if the table
    has 64 buckets or more, else the table is resized instead. Tree bins keep a
    `next` list too: a new node goes right after its tree parent, and the root is
    moved to the front after every change. Resizing splits lists keeping their order;
    a split tree half of 6 nodes or fewer becomes a list again, a larger one is
    re-treeified when the other half is not empty. Iteration walks buckets in index
    order and each bin's `next` list. Removal is not modelled.
    """

    TREEIFY_THRESHOLD, UNTREEIFY_THRESHOLD, MIN_TREEIFY_CAPACITY = 8, 6, 64

    def __init__(self, hash_fn, compare) -> None:  # noqa: ANN001
        self.hash_fn, self.compare = hash_fn, compare
        self.table: list[_Node | None] = []
        self.size = self.threshold = 0
        self.present: set = set()

    @staticmethod
    def _spread(code: int) -> int:
        h = (code ^ (code >> 16)) & 0xFFFFFFFF
        return h - (1 << 32) if h >= 1 << 31 else h  # a Java int: TreeNodes compare hashes signed

    def put(self, key) -> None:  # noqa: ANN001
        if key in self.present:  # an existing key only gets its value replaced: no structural change
            return
        self.present.add(key)
        h = self._spread(self.hash_fn(key))
        if not self.table:
            self._resize()
        i = (len(self.table) - 1) & h
        p = self.table[i]
        if p is None:
            self.table[i] = _Node(h, key)
        elif p.tree:
            self._put_tree_val(p, h, key)
        else:
            bin_count = 0
            while True:
                if p.next is None:
                    p.next = _Node(h, key)
                    if bin_count >= self.TREEIFY_THRESHOLD - 1:
                        self._treeify_bin(h)
                    break
                p = p.next
                bin_count += 1
        self.size += 1
        if self.size > self.threshold:
            self._resize()

    def keys(self) -> list:
        out = []
        for head in self.table:
            p = head
            while p is not None:
                out.append(p.key)
                p = p.next
        return out

    # -- table ---------------------------------------------------------------

    def _resize(self) -> None:
        old = self.table
        old_cap = len(old)
        if old_cap:
            new_cap, self.threshold = old_cap * 2, self.threshold * 2
        else:
            new_cap, self.threshold = 16, 12
        new: list[_Node | None] = [None] * new_cap
        self.table = new
        for j, e in enumerate(old):
            if e is None:
                continue
            if e.next is None:
                new[e.hash & (new_cap - 1)] = e
            elif e.tree:
                self._split(e, j, old_cap)
            else:
                lo, hi = [], []
                p = e
                while p is not None:
                    (hi if p.hash & old_cap else lo).append(p)
                    p = p.next
                for nodes, index in ((lo, j), (hi, j + old_cap)):
                    if nodes:
                        for a, b in zip(nodes, [*nodes[1:], None], strict=True):
                            a.next = b
                        new[index] = nodes[0]

    def _treeify_bin(self, h: int) -> None:
        n = len(self.table)
        if n < self.MIN_TREEIFY_CAPACITY:
            self._resize()
            return
        index = (n - 1) & h
        e = self.table[index]
        nodes = []
        while e is not None:
            nodes.append(_Node(e.hash, e.key, tree=True))
            e = e.next
        self._link(nodes)
        self.table[index] = nodes[0]
        self._treeify(nodes[0])

    def _split(self, head: _Node, index: int, bit: int) -> None:
        lo, hi = [], []
        e = head
        while e is not None:
            nxt = e.next
            e.next = None
            (hi if e.hash & bit else lo).append(e)
            e = nxt
        for nodes, at, other in ((lo, index, hi), (hi, index + bit, lo)):
            if not nodes:
                continue
            if len(nodes) <= self.UNTREEIFY_THRESHOLD:
                plain = [_Node(n.hash, n.key) for n in nodes]
                for a, b in zip(plain, [*plain[1:], None], strict=True):
                    a.next = b
                self.table[at] = plain[0]
            else:
                self._link(nodes)
                self.table[at] = nodes[0]
                if other:  # the whole tree moved together: Java keeps it as it is
                    self._treeify(nodes[0])

    @staticmethod
    def _link(nodes: list[_Node]) -> None:
        for i, node in enumerate(nodes):
            node.prev = nodes[i - 1] if i else None
            node.next = nodes[i + 1] if i + 1 < len(nodes) else None

    # -- TreeNode ------------------------------------------------------------

    def _dir(self, h: int, key, p: _Node) -> int:  # noqa: ANN001
        if p.hash > h:
            return -1
        if p.hash < h:
            return 1
        # distinct keys of one Comparable class never compare equal, so Java's
        # tieBreakOrder (identityHashCode) is never reached
        return self.compare(key, p.key)

    def _treeify(self, head: _Node) -> None:
        root = None
        x = head
        while x is not None:
            nxt = x.next
            x.left = x.right = None
            if root is None:
                x.parent, x.red, root = None, False, x
            else:
                p = root
                while True:
                    d = self._dir(x.hash, x.key, p)
                    xp, p = p, (p.left if d <= 0 else p.right)
                    if p is None:
                        x.parent = xp
                        if d <= 0:
                            xp.left = x
                        else:
                            xp.right = x
                        root = self._balance_insertion(root, x)
                        break
            x = nxt
        assert root is not None  # treeify is only called on a bin with nodes
        self._move_root_to_front(root)

    def _put_tree_val(self, root: _Node, h: int, key) -> None:  # noqa: ANN001
        p = root
        while True:
            d = self._dir(h, key, p)
            xp, p = p, (p.left if d <= 0 else p.right)
            if p is None:
                xpn = xp.next
                x = _Node(h, key, tree=True)
                x.next = xpn
                if d <= 0:
                    xp.left = x
                else:
                    xp.right = x
                xp.next = x
                x.parent = x.prev = xp
                if xpn is not None:
                    xpn.prev = x
                self._move_root_to_front(self._balance_insertion(root, x))
                return

    def _move_root_to_front(self, root: _Node) -> None:
        index = (len(self.table) - 1) & root.hash
        first = self.table[index]
        if root is not first:
            rn, rp = root.next, root.prev
            if rn is not None:
                rn.prev = rp
            if rp is not None:
                rp.next = rn
            if first is not None:
                first.prev = root
            root.next, root.prev = first, None
            self.table[index] = root

    @staticmethod
    def _rotate_left(root: _Node, p: _Node) -> _Node:
        r = p.right
        if r is not None:
            rl = p.right = r.left
            if rl is not None:
                rl.parent = p
            pp = r.parent = p.parent
            if pp is None:
                root = r
                r.red = False
            elif pp.left is p:
                pp.left = r
            else:
                pp.right = r
            r.left, p.parent = p, r
        return root

    @staticmethod
    def _rotate_right(root: _Node, p: _Node) -> _Node:
        lft = p.left
        if lft is not None:
            lr = p.left = lft.right
            if lr is not None:
                lr.parent = p
            pp = lft.parent = p.parent
            if pp is None:
                root = lft
                lft.red = False
            elif pp.right is p:
                pp.right = lft
            else:
                pp.left = lft
            lft.right, p.parent = p, lft
        return root

    def _balance_insertion(self, root: _Node, x: _Node) -> _Node:
        x.red = True
        while True:
            xp = x.parent
            if xp is None:
                x.red = False
                return x
            xpp = xp.parent
            if not xp.red or xpp is None:
                return root
            xppl = xpp.left
            if xp is xppl:
                xppr = xpp.right
                if xppr is not None and xppr.red:
                    xppr.red = xp.red = False
                    xpp.red = True
                    x = xpp
                else:
                    if x is xp.right:
                        x = xp
                        root = self._rotate_left(root, x)
                        xp = x.parent
                        xpp = xp.parent if xp is not None else None
                    if xp is not None:
                        xp.red = False
                        if xpp is not None:
                            xpp.red = True
                            root = self._rotate_right(root, xpp)
            else:
                if xppl is not None and xppl.red:
                    xppl.red = xp.red = False
                    xpp.red = True
                    x = xpp
                else:
                    if x is xp.left:
                        x = xp
                        root = self._rotate_right(root, x)
                        xp = x.parent
                        xpp = xp.parent if xp is not None else None
                    if xp is not None:
                        xp.red = False
                        if xpp is not None:
                            xpp.red = True
                            root = self._rotate_left(root, xpp)


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
