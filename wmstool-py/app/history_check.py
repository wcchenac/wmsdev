"""Cutover check: history.childrenIdentifierId values that cannot be read back.

The column holds a Java-serialized Long[] of the pieces a roll was shrunk into. Before
migration 0002 it was a TINYBLOB (255 bytes = 10 children); outside MySQL strict mode
an 11th child did not fail the shrink but cut the value to 255 bytes, which neither
Java nor the rewrite can deserialize. Run it read-only on the production database
before migrating:

    python -m app.history_check mysql+pymysql://user:password@host/wms

For each bad row it prints what is still readable — the declared number of children
and the complete leading ids (the first 10 of a cut value) — and every candidate for
the missing ones: pieces of the same tree (their own history row has the roll's
rootIdentifierId), cut in a shrink (SKI) of the same product and lot (NULL lots
included) within two seconds after that shrink's SKO, after the last readable
child, that no readable history row already lists.

It prints the UPDATE that would restore the list only when the candidates are exactly
as many as the missing children and no other reported row proposes any of them; with
more candidates, or shared ones, it says so and leaves the decision to a person.
A piece is a candidate only when its SKI createdAt falls within two seconds after
the one SKO whose time lines up with the readable children's SKI times (Java writes
the SKO, then the pieces, in the same request). If that SKO cannot be picked, the
tool warns and prints no UPDATE. Pieces that pass every other test but whose SKI
falls outside that window are listed separately with their time from the SKO (a slow
shrink can take longer); they are never put into the UPDATE. When such a piece is another reported row's
candidate, the listing says "candidate of history N". The UPDATE needs
migration 0002 (BLOB) applied.
Nothing is written. Exit code 1 when any row is reported.
"""

import argparse
import datetime as dt
import os
import sys
from dataclasses import dataclass, field

from sqlalchemy import bindparam, create_engine, text
from sqlalchemy.engine import Connection

from app.javacompat import deserialize_long_array, read_long_array_prefix, serialize_long_array

# Java saves the SKO, then each piece's SKI, with LocalDateTime.now(). MySQL DATETIME
# here has second precision, so a shrink that crosses one second boundary still matches.
SKI_AFTER_SKO = dt.timedelta(seconds=2)
TIME_NOTE = ("SKO/SKI createdAt does not confirm one shrink of this roll: "
             "decide by hand; no UPDATE suggested")


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
    shared_with: list[int]  # other reported history ids proposing one of these candidates
    note: str | None = None  # set when the SKO/SKI time check cannot confirm a shrink
    # Pieces that match except for the time: (id, SKI time minus the SKO or None if
    # unknown, the other reported history ids that have it as an in-window candidate)
    outside: list[tuple[int, dt.timedelta | None, list[int]]] = field(default_factory=list)


def _shrink_sko(conn: Connection, roll_id: int, readable: list[int]) -> dt.datetime | None:
    """The SKO of this shrink: the only one whose createdAt is at most two seconds
    before a readable child's SKI. None when there is not exactly one such time."""
    skos = [row.createdAt for row in conn.execute(text(
        "SELECT createdAt FROM transactionrecord "
        "WHERE stockIdentifierId = :id AND transactionType = 'SKO' AND createdAt IS NOT NULL"),
        {"id": roll_id})]
    if not skos:
        return None
    kids = conn.execute(text(
        "SELECT createdAt FROM transactionrecord WHERE transactionType = 'SKI' "
        "AND createdAt IS NOT NULL AND stockIdentifierId IN :ids"
    ).bindparams(bindparam("ids", expanding=True)), {"ids": readable}).all()
    child_times = [row.createdAt for row in kids]
    if not child_times:
        return None
    matched = {sko for sko in skos if any(sko <= ski <= sko + SKI_AFTER_SKO for ski in child_times)}
    if len(matched) != 1:
        return None
    return next(iter(matched))


Outside = list[tuple[int, dt.timedelta | None]]


def _candidates(conn: Connection, current_identifier_id: int | None, root_identifier_id: int | None,
                children: Children, claimed: set[int]) -> tuple[list[int], Outside, str | None]:
    """Every piece that can be one of the roll's missing children, without a limit.

    A piece of the same tree (its own history row has the roll's rootIdentifierId; Java
    writes it before updating the parent's list), cut in a shrink (SKI) of the same
    product and lot (NULL-safe), after the last readable child, not already listed as a
    child by a readable history row, and whose SKI createdAt is within two seconds after
    the roll's SKO for this shrink. The second item lists the pieces that pass every
    test except the time window, with their SKI time minus the SKO. The third is a
    warning when that SKO cannot be chosen; both lists are then empty and no UPDATE
    should be printed.
    """
    if current_identifier_id is None or root_identifier_id is None or children.declared is None or not children.ids:
        return [], [], None
    if children.declared - len(children.ids) <= 0:
        return [], [], None
    roll = conn.execute(text("SELECT productNo, lotNo FROM stockidentifier WHERE id = :id"),
                        {"id": current_identifier_id}).first()
    if roll is None:
        return [], [], None
    sko = _shrink_sko(conn, current_identifier_id, children.ids)
    if sko is None:
        return [], [], TIME_NOTE
    rows = conn.execute(text(
        "SELECT DISTINCT h.currentIdentifierId AS id, t.createdAt AS at FROM history h "
        "JOIN transactionrecord t ON t.stockIdentifierId = h.currentIdentifierId "
        "WHERE t.transactionType = 'SKI' AND t.productNo = :product AND t.lotNo <=> :lot "
        "AND h.rootIdentifierId = :root AND h.currentIdentifierId > :after "
        "ORDER BY h.currentIdentifierId, t.createdAt"),
        {"product": roll.productNo, "lot": roll.lotNo, "root": root_identifier_id,
         "after": max(children.ids)})
    times: dict[int, list[dt.datetime | None]] = {}
    for row in rows:
        if row.id not in claimed and row.id != current_identifier_id:
            times.setdefault(row.id, []).append(row.at)
    candidates: list[int] = []
    outside: Outside = []
    for piece, ats in times.items():
        if any(at is not None and sko <= at <= sko + SKI_AFTER_SKO for at in ats):
            candidates.append(piece)
        else:
            known = [at - sko for at in ats if at is not None]
            outside.append((piece, min(known, key=abs) if known else None))
    return candidates, outside, None


def scan(conn: Connection) -> list[Problem]:
    rows = conn.execute(text(
        "SELECT id, currentIdentifierId, rootIdentifierId, childrenIdentifierId FROM history ORDER BY id")).all()
    decoded = [(row, decode_children(row.childrenIdentifierId)) for row in rows]
    # ids some row already lists as its child (complete lists, and the readable part of cut ones)
    claimed = {child for _, children in decoded for child in children.ids}
    found = []
    for row, children in decoded:
        if children.complete:
            continue
        candidates, outside, note = _candidates(
            conn, row.currentIdentifierId, row.rootIdentifierId, children, claimed)
        found.append((row, children, candidates, outside, note))
    proposers: dict[int, set[int]] = {}
    for row, _, candidates, _, _ in found:
        for candidate in candidates:
            proposers.setdefault(candidate, set()).add(row.id)
    return [
        Problem(row.id, row.currentIdentifierId, len(row.childrenIdentifierId), children, candidates,
                sorted({other for c in candidates for other in proposers[c]} - {row.id}), note,
                [(piece, delta, sorted(proposers.get(piece, set()) - {row.id})) for piece, delta in outside])
        for row, children, candidates, outside, note in found
    ]


def _offset(delta: dt.timedelta | None) -> str:
    if delta is None:
        return "SKI time unknown"
    seconds = int(delta.total_seconds())
    return f"SKI {seconds:+d}s"


def _candidate_of(history_ids: list[int]) -> str:
    return f", candidate of history {', '.join(map(str, history_ids))}" if history_ids else ""


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
    if p.outside:
        listed = ", ".join(f"{piece} ({_offset(delta)}{_candidate_of(others)})" for piece, delta, others in p.outside)
        lines.append(f"  outside the {SKI_AFTER_SKO.seconds}-second window after the SKO (not candidates): {listed}")
    if p.note:
        lines.append(f"  {p.note}")
        return lines
    if len(p.candidates) > missing:
        lines.append("  more candidates than missing children: decide by hand from the shrink's "
                     "transaction records; no UPDATE suggested")
    elif p.shared_with:
        others = ", ".join(map(str, p.shared_with))
        lines.append(f"  candidates shared with history {others}: decide by hand; no UPDATE suggested")
    elif missing > 0 and len(p.candidates) == missing:
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
