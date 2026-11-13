"""Shared fixtures for the wmstool API contract tests.

The suite is implementation-agnostic: it talks HTTP to BASE_URL and inspects
the MySQL database and the report folder directly. The golden files under
snapshots/ were recorded from the Java service; any rewrite must reproduce them.

Run `pytest --update-golden` to (re)record golden files from the current backend.
"""

from __future__ import annotations

import datetime as dt
import json
import os
import pathlib
import re
from typing import Any
from zoneinfo import ZoneInfo

import bcrypt
import httpx
import pymysql
import pytest
import xlrd

ROOT = pathlib.Path(__file__).resolve().parent.parent
SNAPSHOTS = ROOT / "snapshots"
FILES_DIR = pathlib.Path(os.environ.get("CONTRACT_FILES_DIR", ROOT / "runtime" / "files"))
EXCEL_DIR = FILES_DIR / "excels"

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:18080")
DB: dict[str, Any] = dict(
    host=os.environ.get("DB_HOST", "127.0.0.1"),
    port=int(os.environ.get("DB_PORT", "13306")),
    user="wms",
    password="wms",
    database="wms",
    charset="utf8mb4",
    autocommit=True,
)

# The service runs in Asia/Taipei (production is a Taiwanese Windows host).
TZ = ZoneInfo("Asia/Taipei")

# Same test-only value as jwt.jwtSecret in config/application.properties.
JWT_SECRET = "Y29udHJhY3QtdGVzdC1vbmx5LWp3dC1zZWNyZXQtZm9yLXdtc3Rvb2wtaHM1MTItbmVlZHMtNjQtYnl0ZXMtLS0tLQ=="


def sign_jwt(claims: dict[str, Any], key: bytes | None, alg: str = "HS512") -> str:
    """Hand-made JWT for probing token validation (key=None -> unsigned, alg must be 'none')."""
    import base64
    import hashlib
    import hmac

    def seg(obj: dict[str, Any]) -> str:
        raw = json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode()
        return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

    signing_input = f"{seg({'alg': alg, 'typ': 'JWT'})}.{seg(claims)}"
    if key is None:
        return signing_input + "."
    sig = hmac.new(key, signing_input.encode(), hashlib.sha512).digest()
    return signing_input + "." + base64.urlsafe_b64encode(sig).rstrip(b"=").decode()


# Tables the backend writes. Truncated before every test so auto-increment ids
# restart at 1 and golden files stay deterministic.
WMS_TABLES = [
    "history",
    "instockorderrecord",
    "outstockrequest",
    "product",
    "stockadjustmentrecord",
    "stockallocationrecord",
    "stockidentifier",
    "stockidentifierbacklog",
    "stockinfo",
    "transactionrecord",
    "user",
    "role",
    "categorydetail",
    "salerecords",
]

ROLES = ["ROLE_Normal", "ROLE_Sales", "ROLE_Operator", "ROLE_Admin"]

# employeeId -> (fullName, password, role)
USERS = {
    "admin": ("管理員甲", "admin123", "ROLE_Admin"),
    "operator": ("倉管乙", "operator123", "ROLE_Operator"),
    "sales": ("業務丙", "sales123", "ROLE_Sales"),
    "store": ("門市丁", "store123", "ROLE_Normal"),
}

TEMPLATE_FILES = {
    "OutStockList/OutStockListTemplate.xls",
    "STKADST/StockAdjustRecordTemplate.xls",
    "STKALLT/StockAllocateRecordTemplate.xls",
    "StockComparisonResult/StockComparisonResultTemplate.xls",
}


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line(
        "markers",
        "java_bug(reason): golden file records a defect in the Java service; "
        "a rewrite may fix it and re-record that golden file on purpose",
    )


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--update-golden",
        action="store_true",
        help="record golden files from the running backend instead of comparing",
    )


# --------------------------------------------------------------------------
# Database
# --------------------------------------------------------------------------


def _bit_to_bool(raw: bytes) -> bool:
    return int.from_bytes(raw, "big") != 0


@pytest.fixture(scope="session")
def db():
    conv: dict[Any, Any] = dict(pymysql.converters.conversions)
    conv[pymysql.constants.FIELD_TYPE.BIT] = _bit_to_bool  # Hibernate maps boolean -> bit(1)
    conn = pymysql.connect(**DB, cursorclass=pymysql.cursors.DictCursor, conv=conv)
    yield conn
    conn.close()


_PASSWORD_HASHES: dict[str, str] = {}


def _hash(password: str) -> str:
    # bcrypt is slow on purpose; hash each seed password once per session.
    if password not in _PASSWORD_HASHES:
        _PASSWORD_HASHES[password] = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=4)).decode()
    return _PASSWORD_HASHES[password]


def reset_database(db) -> None:
    with db.cursor() as cur:
        cur.execute("SET FOREIGN_KEY_CHECKS = 0")
        for table in WMS_TABLES:
            cur.execute(f"TRUNCATE TABLE {table}")
        cur.execute("SET FOREIGN_KEY_CHECKS = 1")
        for role in ROLES:
            cur.execute("INSERT INTO role (role) VALUES (%s)", (role,))
        for employee_id, (full_name, password, role) in USERS.items():
            cur.execute(
                "INSERT INTO user (employeeId, fullName, password, role_id) "
                "SELECT %s, %s, %s, id FROM role WHERE role = %s",
                (employee_id, full_name, _hash(password), role),
            )


def reset_files() -> None:
    """Remove generated reports; keep the templates."""
    if EXCEL_DIR.exists():
        for path in sorted(EXCEL_DIR.rglob("*"), reverse=True):
            rel = path.relative_to(EXCEL_DIR).as_posix()
            if path.is_file() and rel not in TEMPLATE_FILES:
                path.unlink()
            elif path.is_dir() and not any(path.iterdir()):
                path.rmdir()


@pytest.fixture(autouse=True)
def clean_state(db):
    reset_database(db)
    reset_files()
    yield


def rows(db, sql: str, *args: Any) -> list[dict[str, Any]]:
    with db.cursor() as cur:
        cur.execute(sql, args)
        return [dict(r) for r in cur.fetchall()]


def exec_sql(db, sql: str, *args: Any) -> None:
    with db.cursor() as cur:
        cur.execute(sql, args)


DB_STATE_TABLES = [
    "stockidentifierbacklog",
    "stockidentifier",
    "stockinfo",
    "history",
    "instockorderrecord",
    "transactionrecord",
    "product",
    "outstockrequest",
    "stockallocationrecord",
    "stockadjustmentrecord",
]


def db_state(db, tables: list[str] | None = None) -> dict[str, list[dict[str, Any]]]:
    """Every row of the stock tables, ordered by id, for golden comparison."""
    state = {}
    for table in tables or DB_STATE_TABLES:
        state[table] = rows(db, f"SELECT * FROM {table} ORDER BY id")
    return state


# --------------------------------------------------------------------------
# Java-serialized History.childrenIdentifierId
# --------------------------------------------------------------------------


def decode_java_long_array(blob: bytes | None) -> list[int] | None:
    """Decode a java.io.Serializable Long[] (what Hibernate stores for History).

    Supports exactly the shape Hibernate writes: an array of java.lang.Long,
    with the first element's class descriptor inline and later ones as handles.
    """
    if blob is None:
        return None
    data = memoryview(blob)
    pos = 0

    def take(n: int) -> bytes:
        nonlocal pos
        chunk = bytes(data[pos : pos + n])
        if len(chunk) != n:
            raise ValueError("truncated Java serialization stream")
        pos += n
        return chunk

    def u2() -> int:
        return int.from_bytes(take(2), "big")

    def u4() -> int:
        return int.from_bytes(take(4), "big", signed=True)

    def skip_class_desc() -> None:
        tag = take(1)[0]
        if tag == 0x71:  # TC_REFERENCE
            take(4)
            return
        if tag == 0x70:  # TC_NULL
            return
        if tag != 0x72:  # TC_CLASSDESC
            raise ValueError(f"unexpected class descriptor tag {tag:#x}")
        take(u2())  # class name
        take(8)  # serialVersionUID
        take(1)  # flags
        for _ in range(u2()):
            type_code = chr(take(1)[0])
            take(u2())  # field name
            if type_code in "L[":
                skip_object_string()
        if take(1)[0] != 0x78:  # TC_ENDBLOCKDATA
            raise ValueError("expected end of class annotations")
        skip_class_desc()  # superclass

    def skip_object_string() -> None:
        tag = take(1)[0]
        if tag == 0x74:  # TC_STRING
            take(u2())
        elif tag == 0x71:
            take(4)
        else:
            raise ValueError(f"unexpected field type string tag {tag:#x}")

    if take(2) != b"\xac\xed" or u2() != 5:
        raise ValueError("not a Java serialization stream")
    if take(1)[0] != 0x75:  # TC_ARRAY
        raise ValueError("expected an array")
    skip_class_desc()
    values: list[int] = []
    for _ in range(u4()):
        tag = take(1)[0]
        if tag != 0x73:  # TC_OBJECT
            raise ValueError(f"expected Long object, got {tag:#x}")
        skip_class_desc()
        values.append(int.from_bytes(take(8), "big", signed=True))
    return values


# --------------------------------------------------------------------------
# HTTP
# --------------------------------------------------------------------------


@pytest.fixture(scope="session")
def http(request):
    with httpx.Client(base_url=BASE_URL, timeout=30) as client:
        if request.config.getoption("--update-golden"):
            # Golden files are recorded from the Java service only.
            server = client.post("/api/user/login", json={}).headers.get("server", "")
            if "uvicorn" in server.lower():
                pytest.exit("--update-golden against the Python backend; start the Java stack first", 2)
        yield client


def login(http: httpx.Client, employee_id: str) -> str:
    _, password, _ = USERS[employee_id]
    resp = http.post("/api/user/login", json={"employeeId": employee_id, "password": password})
    resp.raise_for_status()
    return resp.json()["accessToken"]


class Api:
    """Thin wrapper that authenticates as one user and records exchanges."""

    def __init__(self, http: httpx.Client, employee_id: str | None):
        self.http = http
        self.employee_id = employee_id
        self._token: str | None = None

    @property
    def headers(self) -> dict[str, str]:
        if self.employee_id is None:
            return {}
        if self._token is None:
            self._token = login(self.http, self.employee_id)
        return {"Authorization": self._token}

    def request(self, method: str, url: str, **kwargs: Any) -> httpx.Response:
        headers = {**self.headers, **kwargs.pop("headers", {})}
        return self.http.request(method, url, headers=headers, **kwargs)

    def get(self, url: str, **kw: Any) -> httpx.Response:
        return self.request("GET", url, **kw)

    def post(self, url: str, **kw: Any) -> httpx.Response:
        return self.request("POST", url, **kw)

    def patch(self, url: str, **kw: Any) -> httpx.Response:
        return self.request("PATCH", url, **kw)

    def delete(self, url: str, **kw: Any) -> httpx.Response:
        return self.request("DELETE", url, **kw)


@pytest.fixture
def admin(http):
    return Api(http, "admin")


@pytest.fixture
def operator(http):
    return Api(http, "operator")


@pytest.fixture
def sales(http):
    return Api(http, "sales")


@pytest.fixture
def store(http):
    return Api(http, "store")


@pytest.fixture
def anonymous(http):
    return Api(http, None)


def response_record(resp: httpx.Response) -> dict[str, Any]:
    """Status plus parsed body, in a form fit for golden files."""
    record: dict[str, Any] = {"status": resp.status_code}
    content_type = resp.headers.get("content-type", "")
    if not resp.content:
        record["body"] = None
    elif "json" in content_type:
        body = resp.json()
        if isinstance(body, dict) and {"timestamp", "status", "error", "path"} <= body.keys():
            # Spring Boot's default error body. Contract: status, error, path.
            # `message` is kept for 4xx (it is user-facing) but not for 5xx,
            # where it is a Java exception text no rewrite can match.
            body = {**body, "timestamp": "<timestamp>"}
            body.pop("trace", None)
            if resp.status_code >= 500:
                body["message"] = "<server error>"
        record["body"] = body
    elif "text" in content_type:
        record["body"] = resp.text
    else:
        record["body"] = {"bytes": len(resp.content), "content-type": content_type}
    return record


# --------------------------------------------------------------------------
# Time helpers
# --------------------------------------------------------------------------


def today() -> dt.date:
    return dt.datetime.now(TZ).date()


def client_range(start: dt.date, end: dt.date) -> dict[str, str]:
    """Query params the React client sends: local midnight / end of day as UTC, no zone."""

    def utc(d: dt.datetime) -> str:
        return d.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

    start_local = dt.datetime.combine(start, dt.time.min, TZ)
    end_local = dt.datetime.combine(end, dt.time(23, 59, 59), TZ)
    return {"startDate": utc(start_local), "endDate": utc(end_local)}


# --------------------------------------------------------------------------
# Reports on disk
# --------------------------------------------------------------------------


def generated_reports() -> dict[str, list[list[Any]]]:
    """All generated .xls reports as {relative path: rows of cell values}."""
    reports: dict[str, list[list[Any]]] = {}
    if not EXCEL_DIR.exists():
        return reports
    for path in sorted(EXCEL_DIR.rglob("*.xls")):
        rel = path.relative_to(EXCEL_DIR).as_posix()
        if rel in TEMPLATE_FILES:
            continue
        book = xlrd.open_workbook(str(path))
        sheet = book.sheet_by_index(0)
        reports[rel] = [
            [sheet.cell_value(r, c) for c in range(sheet.ncols)] for r in range(sheet.nrows)
        ]
    return reports


def write_report(rel_path: str) -> pathlib.Path:
    """Place an (empty-sheet) .xls report where the backend looks for it."""
    import xlwt

    path = EXCEL_DIR / rel_path
    path.parent.mkdir(parents=True, exist_ok=True)
    book = xlwt.Workbook()
    book.add_sheet("Sheet1").write(0, 0, "seeded by contract test")
    book.save(str(path))
    return path


# --------------------------------------------------------------------------
# Golden files
# --------------------------------------------------------------------------

_VOLATILE_KEYS = {"createdAt", "updatedAt", "outStockAt"}


def _date_tokens() -> list[tuple[str, str]]:
    d = today()
    tokens = []
    named = {0: "TODAY", -1: "YESTERDAY", 1: "TOMORROW"}
    for offset in range(-15, 2):
        name = named.get(offset, f"TODAY{offset:+d}")
        day = d + dt.timedelta(days=offset)
        tokens += [
            (day.strftime("%Y%m%d"), f"<{name}:yyyyMMdd>"),
            (day.isoformat(), f"<{name}:yyyy-MM-dd>"),
        ]
    tokens += [
        (f"/{d.year}/{d.month}/", "/<YEAR>/<MONTH>/"),
    ]
    return tokens


def _decode_jwt_claims(token: str) -> dict[str, Any]:
    import base64

    payload = token.split(".")[1]
    payload += "=" * (-len(payload) % 4)
    return json.loads(base64.urlsafe_b64decode(payload))


def normalize(value: Any, key: str | None = None) -> Any:
    """Mask values that legitimately differ between runs (time, tokens)."""
    if key in _VOLATILE_KEYS and value is not None:
        # Mask the value but keep its wire shape: Jackson (no JavaTimeModule
        # config) sends LocalDateTime as [y, M, d, h, m, s(, nanos)].
        if isinstance(value, list):
            return "<datetime:array>"
        return f"<datetime:{type(value).__name__}>"
    if isinstance(value, dict):
        return {normalize(k) if isinstance(k, str) else k: normalize(v, k) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        items = [normalize(v) for v in value]
        if key == "userList":  # built from a HashSet: order is not part of the contract
            items = sorted(items, key=lambda x: json.dumps(x, ensure_ascii=False))
        return items
    if isinstance(value, (bytes, bytearray)):
        if key == "childrenIdentifierId":
            return {"java.lang.Long[]": decode_java_long_array(bytes(value))}
        return {"bytes": len(value)}
    if isinstance(value, (dt.datetime, dt.date)):
        return "<datetime>"
    if key == "accessToken" and isinstance(value, str):
        scheme, _, token = value.partition(" ")
        claims = _decode_jwt_claims(token)
        lifetime = claims.pop("exp", 0) - claims.pop("iat", 0)
        return {"scheme": scheme, "claims": claims, "lifetime_seconds": lifetime}
    if isinstance(value, str):
        for raw, token in _date_tokens():
            value = value.replace(raw, token)
        # OutStockList-yyyyMMddHHmmss: the time part changes every run.
        value = re.sub(r"(<TODAY:yyyyMMdd>)\d{6}\b", r"\1<HHmmss>", value)
        value = re.sub(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?", "<datetime>", value)
        return value
    if isinstance(value, float) and value.is_integer():
        return value  # keep as-is; JSON keeps 12.0 vs 12 distinct
    return value


class Golden:
    def __init__(self, request: pytest.FixtureRequest):
        self.update = request.config.getoption("--update-golden")
        node = request.node
        module = pathlib.Path(node.fspath).stem
        name = re.sub(r"[^A-Za-z0-9_.-]+", "_", node.name)
        self.path = SNAPSHOTS / module / f"{name}.json"
        self.data: dict[str, Any] = {}

    def add(self, label: str, value: Any) -> None:
        if label in self.data:
            raise KeyError(f"duplicate golden label {label!r}")
        self.data[label] = normalize(value)

    def response(self, label: str, resp: httpx.Response) -> httpx.Response:
        self.add(label, response_record(resp))
        return resp

    def check(self) -> None:
        text = json.dumps(self.data, ensure_ascii=False, indent=2, sort_keys=True, default=str) + "\n"
        if self.update or not self.path.exists():
            if not self.update:
                pytest.fail(f"golden file missing: {self.path} (run with --update-golden)")
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(text, encoding="utf-8")
            return
        expected = json.loads(self.path.read_text(encoding="utf-8"))
        actual = json.loads(text)
        assert actual == expected, f"contract drift vs {self.path.relative_to(ROOT)}"


@pytest.fixture
def golden(request):
    return Golden(request)


@pytest.hookimpl(wrapper=True)
def pytest_pyfunc_call(pyfuncitem):
    # Compare against the golden file inside the call phase, so drift is a
    # test FAILURE rather than a teardown ERROR.
    result = yield
    g = pyfuncitem.funcargs.get("golden")
    if isinstance(g, Golden):
        g.check()
    return result
