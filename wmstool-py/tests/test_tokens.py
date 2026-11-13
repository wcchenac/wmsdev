import base64
import datetime as dt
import hashlib
import hmac
import json

import jwt
import pytest

from app.config import get_settings
from app.security.tokens import create_access_token, read_user_id

# Same test-only value as jwt.jwtSecret in contract-tests/config/application.properties.
SECRET = "Y29udHJhY3QtdGVzdC1vbmx5LWp3dC1zZWNyZXQtZm9yLXdtc3Rvb2wtaHM1MTItbmVlZHMtNjQtYnl0ZXMtLS0tLQ=="
T0 = dt.datetime(2026, 11, 13, 3, 0, 0, tzinfo=dt.timezone.utc)


@pytest.fixture(autouse=True)
def settings(monkeypatch):
    monkeypatch.setenv("WMS_DATABASE_URL", "mysql+pymysql://unused/unused")
    monkeypatch.setenv("JWT_SECRET", SECRET)
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def _b64json(segment: str) -> dict:
    return json.loads(base64.urlsafe_b64decode(segment + "=" * (-len(segment) % 4)))


def test_token_claims_match_java():
    token = create_access_token(1, "admin", "管理員甲", "ROLE_Admin", now=T0)
    header, payload, _ = token.split(".")
    t = int(T0.timestamp())
    assert _b64json(header)["alg"] == "HS512"
    assert _b64json(payload) == {
        "id": "1",
        "employeeId": "admin",
        "fullName": "管理員甲",
        "role": {"authority": "ROLE_Admin"},
        "iat": t,
        "exp": t + 43200,
    }


def test_token_signed_with_decoded_secret():
    token = create_access_token(1, "admin", "管理員甲", "ROLE_Admin", now=T0)
    signing_input, _, signature = token.rpartition(".")
    expected = hmac.new(base64.b64decode(SECRET), signing_input.encode(), hashlib.sha512).digest()
    assert signature == base64.urlsafe_b64encode(expected).rstrip(b"=").decode()


def test_read_user_id():
    now = dt.datetime.now(dt.timezone.utc)
    assert read_user_id(create_access_token(7, "a", "b", "ROLE_Admin", now=now)) == 7
    assert read_user_id(create_access_token(7, "a", "b", "ROLE_Admin", now=now - dt.timedelta(hours=13))) is None

    claims = {"id": "7", "exp": int((now + dt.timedelta(hours=1)).timestamp())}
    assert read_user_id(jwt.encode(claims, b"k" * 64, algorithm="HS512")) is None
    unsigned = jwt.encode(claims, None, algorithm="none")
    assert read_user_id(unsigned) is None
    assert read_user_id("garbage") is None
