"""Regenerate orders.json: key lists that make Java 8 HashMap bins collide, with the
keySet() order a real JDK 8 prints for them (HashMapOrder.java).

    cd wmstool-py/tests/fixtures/java_hashmap
    javac -d /tmp/hm HashMapOrder.java
    ../../../.venv/bin/python make_cases.py /tmp/hm      # needs `java` (JDK 8) on PATH

Recorded with Temurin 1.8.0_492 (the JVM the Java service runs on).
"""

import json
import pathlib
import random
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[2]))  # wmstool-py

from app.javacompat import _java_long_hash, _java_string_hash  # noqa: E402

rng = random.Random(20261115)


def spread(h: int) -> int:
    return (h ^ (h >> 16)) & 0xFFFFFFFF


def strings_where(count: int, mask: int, value: int, prefix: str = "K") -> list[str]:
    """`count` distinct strings whose spread hash & mask == value."""
    found: list[str] = []
    while len(found) < count:
        s = f"{prefix}{rng.randrange(10**9):09d}"
        if spread(_java_string_hash(s)) & mask == value and s not in found:
            found.append(s)
    return found


def longs_where(count: int, mask: int, value: int) -> list[int]:
    found: list[int] = []
    while len(found) < count:
        v = rng.randrange(-(2**62), 2**62)
        if spread(_java_long_hash(v)) & mask == value and v not in found:
            found.append(v)
    return found


def fillers(count: int, prefix: str = "F") -> list[str]:
    return [f"{prefix}{rng.randrange(10**9):09d}" for _ in range(count)]


def same_hash_strings(blocks: int) -> list[str]:
    """Strings with one identical hashCode ("Aa" and "BB" hash alike): the tree has to
    order them by compareTo."""
    out = [""]
    for _ in range(blocks):
        out = [s + b for s in out for b in ("Aa", "BB")]
    return out


CASES: dict[str, tuple[str, list]] = {}
# 9 keys in one bin of the initial table (16): Java resizes instead of treeifying.
CASES["resize_below_64_splits"] = ("string", strings_where(9, 15, 5))
# 12 keys sharing the low 6 bits: resized 16 -> 32 -> 64 by treeifyBin, then treeified.
CASES["resize_then_treeify"] = ("string", strings_where(12, 63, 9) + fillers(3))
# A table of 64 first, then a colliding group: treeify at once, later puts go into the tree.
CASES["treeify_at_64"] = ("string", fillers(40) + strings_where(14, 63, 17) + fillers(6))
# Trees split by resizes: low 8 bits equal (stays a tree), and two groups split 7/7 and 10/4.
CASES["tree_split_on_resize"] = ("string", (
    fillers(60) + strings_where(12, 255, 33) + strings_where(7, 255, 34) + strings_where(7, 255, 34 + 128)
    + strings_where(10, 255, 35) + strings_where(4, 255, 35 + 128) + fillers(200)))
# Identical hashCodes: ordered inside the tree by String.compareTo.
CASES["same_hash_codes"] = ("string", fillers(30) + same_hash_strings(4))
# Product codes, as the daily comparison sees them, with a colliding group in the middle.
codes = [f"CF{n:05d}" for n in rng.sample(range(100000), 3000)]
CASES["product_codes_with_cluster"] = ("string", codes[:1500] + strings_where(11, 4095, 77, "CF") + codes[1500:])
# Long keys (HashMap<Long, ?>), colliding.
CASES["long_keys"] = ("long", [rng.randrange(-(2**62), 2**62) for _ in range(50)] + longs_where(13, 127, 5))
# No collisions to speak of: the plain model must still agree.
CASES["plain_product_codes"] = ("string", [f"CF{n:05d}" for n in rng.sample(range(100000), 500)])


def main(classes_dir: str) -> None:
    out = {}
    for name, (kind, keys) in CASES.items():
        lines = "\n".join(map(str, keys)) + "\n"
        result = subprocess.run(["java", "-cp", classes_dir, "HashMapOrder", kind], input=lines,
                                capture_output=True, text=True, check=True)
        order = result.stdout.splitlines()
        out[name] = {"kind": kind, "keys": [str(k) for k in keys], "java_order": order}
        print(name, len(keys), "keys")
    (HERE / "orders.json").write_text(json.dumps(out, ensure_ascii=False, indent=0) + "\n")


if __name__ == "__main__":
    main(sys.argv[1])
