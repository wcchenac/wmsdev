"""JWTs interchangeable with the ones wmstool (jjwt 0.9.1) issues.

jjwt base64-decodes a String signing key, so the HMAC key is
base64decode(JWT_SECRET), not the string itself. The Java service calls
setClaims() after setSubject(), which drops `sub`: the claims are exactly
id (as a string), employeeId, fullName, role {authority}, iat and exp.
"""

import datetime as dt

import jwt

from app.config import get_settings

ALGORITHM = "HS512"


_B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
_DECODE = {ch: i for i, ch in enumerate(_B64)}
_PADDING = 127  # JAXB maps '=' to 127 and lets it take part in a group


def decode_secret(secret: str) -> bytes:
    """jjwt 0.9.1 decodes a String key with JAXB's DatatypeConverter.parseBase64Binary.

    It never fails: characters outside the alphabet are skipped, a trailing
    partial group is dropped, and '=' only suppresses the bytes it pads.
    The production secret may not be strict base64, so mirror it exactly.
    """
    out = bytearray()
    group: list[int] = []
    for ch in secret:
        value = _PADDING if ch == "=" else _DECODE.get(ch)
        if value is None:
            continue
        group.append(value)
        if len(group) == 4:
            q0, q1, q2, q3 = group
            out.append(((q0 << 2) | (q1 >> 4)) & 0xFF)
            if q2 != _PADDING:
                out.append(((q1 << 4) | (q2 >> 2)) & 0xFF)
            if q3 != _PADDING:
                out.append(((q2 << 6) | q3) & 0xFF)
            group = []
    return bytes(out)


def _key() -> bytes:
    return decode_secret(get_settings().jwt_secret)


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
        # jjwt 0.9.1 checks exp but never iat; a Java host whose clock runs
        # ahead would otherwise lock users out during the parallel run.
        claims = jwt.decode(token, _key(), algorithms=[ALGORITHM], options={"verify_iat": False})
        return int(claims["id"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        return None
