"""bcrypt hashing compatible with Spring Security's BCryptPasswordEncoder.

Both services share the `user` table during the cutover, so hashes written here
use Spring's `$2a$` prefix and cost 10.
"""

import bcrypt


def hash_password(raw: str) -> str:
    return bcrypt.hashpw(raw.encode(), bcrypt.gensalt(rounds=10, prefix=b"2a")).decode()


def verify_password(raw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(raw.encode(), hashed.encode())
    except ValueError:  # not a bcrypt hash
        return False
