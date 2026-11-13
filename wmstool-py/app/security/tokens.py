"""JWTs interchangeable with the ones wmstool (jjwt 0.9.1) issues.

jjwt base64-decodes a String signing key, so the HMAC key is
base64decode(JWT_SECRET), not the string itself. The Java service calls
setClaims() after setSubject(), which drops `sub`: the claims are exactly
id (as a string), employeeId, fullName, role {authority}, iat and exp.
"""

import base64
import datetime as dt

import jwt

from app.config import get_settings

ALGORITHM = "HS512"


def _key() -> bytes:
    return base64.b64decode(get_settings().jwt_secret)


def create_access_token(
    user_id: int,
    employee_id: str,
    full_name: str,
    role: str,
    *,
    now: dt.datetime | None = None,
) -> str:
    issued = now or dt.datetime.now(dt.timezone.utc)
    lifetime = dt.timedelta(milliseconds=get_settings().jwt_expiration_ms)
    claims = {
        "id": str(user_id),
        "employeeId": employee_id,
        "fullName": full_name,
        "role": {"authority": role},
        "iat": int(issued.timestamp()),
        "exp": int((issued + lifetime).timestamp()),
    }
    return jwt.encode(claims, _key(), algorithm=ALGORITHM)


def read_user_id(token: str) -> int | None:
    """The user id of a valid, unexpired token; None for anything else."""
    try:
        claims = jwt.decode(token, _key(), algorithms=[ALGORITHM])
        return int(claims["id"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        return None
