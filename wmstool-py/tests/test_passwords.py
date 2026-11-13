import re

from app.security.passwords import hash_password, verify_password

# Produced on 2026-11-13 by the Java service (POST .../user/register, password "java-secret-1").
JAVA_HASH = "$2a$10$xcS2PhQTwM8pMlq3iw/IC.Bw.6rADMpoK3RYxE3JR/3ey1E8D5EGa"


def test_verifies_hash_made_by_java():
    assert verify_password("java-secret-1", JAVA_HASH) is True
    assert verify_password("java-secret-2", JAVA_HASH) is False


def test_new_hash_uses_spring_format():
    # Spring's BCryptPasswordEncoder must accept hashes written by the Python service.
    hashed = hash_password("x")
    assert re.fullmatch(r"\$2a\$10\$[./0-9A-Za-z]{53}", hashed)
    assert verify_password("x", hashed) is True


def test_garbage_hash_is_false():
    assert verify_password("x", "not-a-hash") is False
