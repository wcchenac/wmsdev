"""Cutover check: history.childrenIdentifierId values that cannot be read back.

The column holds a Java-serialized Long[] of the pieces a roll was shrunk into. Before
migration 0002 it was a TINYBLOB (255 bytes = 10 children); outside MySQL strict mode
an 11th child did not fail the shrink but cut the value to 255 bytes, which neither
Java nor the rewrite can deserialize. Run it read-only on the production database
before migrating:

    python -m app.history_check mysql+pymysql://user:password@host/wms

For each bad row it prints what is still readable — the declared number of children
and the complete leading ids (the first 10 of a cut value) — and candidates for the
missing ones: the following pieces of the same product and lot, from their SKI
(shrink in-stock) transaction records, in id order. When there are exactly as many
candidates as missing children it prints the UPDATE that would restore the list.
Verify the candidates first (they must be pieces of that shrink, e.g. by their SKI
createdAt next to the roll's SKO); the UPDATE needs migration 0002 (BLOB) applied.
Nothing is written. Exit code 1 when any row is reported.
"""

import argparse
import os
import sys
from dataclasses import dataclass

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Connection

from app.javacompat import deserialize_long_array, read_long_array_prefix, serialize_long_array


@dataclass(frozen=True)
class Children:
    declared: int | None  # None: not even the length is readable
    ids: list[int]  # the complete ids that could be read
    complete: bool
    error: str | None = None


def decode_children(blob: bytes | None) -> Children:
    if blob is None:
        return Children(0, [], True)
    try:
        ids = deserialize_long_array(blob)
        return Children(len(ids), ids, True)
    except Exception as exc:  # noqa: BLE001 - any failure means the value cannot be read back
        error = str(exc) or type(exc).__name__
    try:
        declared, ids = read_long_array_prefix(blob)
    except ValueError as exc:
        return Children(None, [], False, str(exc))
    return Children(declared, ids, False, error)


@dataclass(frozen=True)
class Problem:
    history_id: int
    current_identifier_id: int | None
    length: int
    children: Children
    candidates: list[int]


def _candidates(conn: Connection, current_identifier_id: int | None, children: Children) -> list[int]:
    if current_identifier_id is None or children.declared is None or not children.ids:
        return []
    missing = children.declared - len(children.ids)
    roll = conn.execute(text("SELECT productNo, lotNo FROM stockidentifier WHERE id = :id"),
                        {"id": current_identifier_id}).first()
    if roll is None or missing <= 0:
        return []
    rows = conn.execute(text(
        "SELECT stockIdentifierId FROM transactionrecord WHERE transactionType = 'SKI' "
        "AND productNo = :product AND lotNo = :lot AND stockIdentifierId > :after "
        "ORDER BY stockIdentifierId LIMIT :missing"),
        {"product": roll.productNo, "lot": roll.lotNo, "after": max(children.ids), "missing": missing})
    return [row.stockIdentifierId for row in rows]


def scan(conn: Connection) -> list[Problem]:
    problems = []
    rows = conn.execute(text("SELECT id, currentIdentifierId, childrenIdentifierId FROM history ORDER BY id"))
    for row in rows.all():
        children = decode_children(row.childrenIdentifierId)
        if children.complete:
            continue
        problems.append(Problem(row.id, row.currentIdentifierId, len(row.childrenIdentifierId),
                                children, _candidates(conn, row.currentIdentifierId, children)))
    return problems


def _report(p: Problem) -> list[str]:
    c = p.children
    lines = [f"history {p.history_id} (identifier {p.current_identifier_id}): {p.length} bytes, cannot be read back"]
    if c.declared is None:
        lines.append(f"  not a readable Long[] ({c.error})")
        return lines
    readable = ", ".join(map(str, c.ids)) or "-"
    lines.append(f"  declares {c.declared} children, {len(c.ids)} readable: {readable}")
    missing = c.declared - len(c.ids)
    found = ", ".join(map(str, p.candidates)) or "(none found)"
    lines.append(f"  candidates for the {missing} missing: {found}")
    if missing > 0 and len(p.candidates) == missing:
        repaired = serialize_long_array([*c.ids, *p.candidates]).hex()
        lines.append("  after verifying the candidates (needs migration 0002):")
        lines.append(f"  UPDATE history SET childrenIdentifierId = 0x{repaired} WHERE id = {p.history_id};")
    return lines


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m app.history_check",
        description="Report history.childrenIdentifierId values that cannot be read back (read-only).")
    parser.add_argument("database_url", nargs="?", default=os.environ.get("WMS_DATABASE_URL"),
                        help="SQLAlchemy URL of the wms database (default: $WMS_DATABASE_URL)")
    args = parser.parse_args(argv)
    if not args.database_url:
        parser.error("give the database URL or set WMS_DATABASE_URL")
    engine = create_engine(args.database_url)
    try:
        with engine.connect() as conn:
            problems = scan(conn)
    finally:
        engine.dispose()
    if not problems:
        print("every history row reads back")
        return 0
    for p in problems:
        print("\n".join(_report(p)))
    return 1


if __name__ == "__main__":
    sys.exit(main())
