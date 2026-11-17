"""python -m app.history_check: find history.childrenIdentifierId values that cannot be
read back (e.g. cut to 255 bytes by TINYBLOB outside strict mode) and what is left of them.

The database part needs the contract-test MySQL (port 13306), like test_migrations.
"""

import datetime as dt
import os
import pathlib

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text

from app.history_check import decode_children, main
from app.javacompat import serialize_long_array

ROOT = pathlib.Path(__file__).resolve().parent.parent
ADMIN_URL = os.environ.get("TEST_ADMIN_DATABASE_URL", "mysql+pymysql://root:root@127.0.0.1:13306")
TEST_DB = "wms_history_check_test"
# One shrink: the SKO and every piece's SKI share this second. A later shrink does not.
SHRINK_AT = dt.datetime(2026, 11, 1, 8, 0, 0)


def _truncated(ids: list[int]) -> bytes:
    """What a non-strict TINYBLOB kept of a longer value."""
    return serialize_long_array(ids)[:255]


@pytest.mark.parametrize(("blob", "declared", "ids", "complete"), [
    (None, 0, [], True),
    (serialize_long_array([]), 0, [], True),
    (serialize_long_array([7, 8, 9]), 3, [7, 8, 9], True),
    (_truncated(list(range(2, 13))), 11, list(range(2, 12)), False),   # 11 children cut at 255
    (_truncated(list(range(2, 16))), 14, list(range(2, 12)), False),   # 14 children cut at 255
])
def test_decode_children(blob, declared, ids, complete):
    children = decode_children(blob)
    assert (children.declared, children.ids, children.complete) == (declared, ids, complete)


def test_decode_children_that_is_not_a_long_array():
    children = decode_children(b"not a serialized array")
    assert (children.declared, children.ids, children.complete) == (None, [], False)
    assert children.error


@pytest.fixture
def database_url():
    admin = create_engine(ADMIN_URL)
    with admin.begin() as conn:
        conn.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB}"))
        conn.execute(text(f"CREATE DATABASE {TEST_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
    url = f"{ADMIN_URL}/{TEST_DB}?charset=utf8mb4"
    cfg = Config(str(ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(ROOT / "migrations"))
    cfg.set_main_option("sqlalchemy.url", url)
    command.upgrade(cfg, "head")
    yield url
    with admin.begin() as conn:
        conn.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB}"))
    admin.dispose()


def _identifier(conn, identifier_id: int, lot_no: str | None = "L01") -> None:  # noqa: ANN001
    conn.execute(text(
        "INSERT INTO stockidentifier (id, isExist, isOutStock, lotNo, productNo, quantity, serialNo, type, unit, "
        "waitToShrink) VALUES (:id, 1, 0, :lot, 'CF1001', '4', :id, '整支', '碼', 0)"), {"id": identifier_id, "lot": lot_no})


def _ski(conn, identifier_id: int, lot_no: str | None = "L01", at: dt.datetime = SHRINK_AT) -> None:  # noqa: ANN001
    conn.execute(text(
        "INSERT INTO transactionrecord (lotNo, productNo, stockIdentifierId, transactionType, createdAt) "
        "VALUES (:lot, 'CF1001', :id, 'SKI', :at)"), {"id": identifier_id, "lot": lot_no, "at": at})


def _sko(conn, identifier_id: int, lot_no: str | None = "L01", at: dt.datetime = SHRINK_AT) -> None:  # noqa: ANN001
    conn.execute(text(
        "INSERT INTO transactionrecord (lotNo, productNo, stockIdentifierId, transactionType, createdAt) "
        "VALUES (:lot, 'CF1001', :id, 'SKO', :at)"), {"id": identifier_id, "lot": lot_no, "at": at})


def _history(conn, history_id: int, current: int, children: bytes | None, root: int | None = None) -> None:  # noqa: ANN001
    conn.execute(text(
        "INSERT INTO history (id, childrenIdentifierId, currentIdentifierId, rootIdentifierId) "
        "VALUES (:id, :c, :cur, :root)"),
        {"id": history_id, "c": children, "cur": current, "root": current if root is None else root})


def _piece(conn, identifier_id: int, root: int, lot_no: str | None = "L01",
          at: dt.datetime = SHRINK_AT) -> None:  # noqa: ANN001
    """A piece cut in a shrink, as Java stores it: the identifier, its SKI record, and its
    own history row under the tree's root (written before the parent's list is updated)."""
    _identifier(conn, identifier_id, lot_no=lot_no)
    _ski(conn, identifier_id, lot_no=lot_no, at=at)
    _history(conn, identifier_id, identifier_id, serialize_long_array([]), root=root)


def _shrunk_roll(conn, lot_no: str | None = "L01", at: dt.datetime = SHRINK_AT) -> None:  # noqa: ANN001
    """Roll 1 shrunk into 2..12 (11 pieces); its children list was cut at 255 bytes.
    The SKO and every piece's SKI share `at` (Java writes them in one request)."""
    _identifier(conn, 1, lot_no=lot_no)
    _history(conn, 1, 1, _truncated(list(range(2, 13))))
    _sko(conn, 1, lot_no=lot_no, at=at)
    for child in range(2, 13):
        _piece(conn, child, root=1, lot_no=lot_no, at=at)


def test_main_reports_a_truncated_row_with_its_missing_children(database_url, capsys):
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _shrunk_roll(conn)
        _identifier(conn, 20, lot_no="OTHER")  # another lot's piece: never a candidate
        _ski(conn, 20, lot_no="OTHER")
    engine.dispose()

    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "history 1 (identifier 1)" in out
    assert "declares 11 children, 10 readable: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11" in out
    assert "candidates for the 1 missing: 12" in out
    repaired = serialize_long_array(list(range(2, 13))).hex()
    assert f"UPDATE history SET childrenIdentifierId = 0x{repaired} WHERE id = 1;" in out
    assert "history 2 " not in out  # the pieces' own (healthy) rows are not reported


def test_more_candidates_than_missing_children_are_reported_and_no_update(database_url, capsys):
    """Another shrink in the same tree later cut pieces 30 and 31 of the same product and
    lot: three candidates for one missing child. The tool must say so, not pick one."""
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _shrunk_roll(conn)
        _piece(conn, 30, root=1)
        _piece(conn, 31, root=1)
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "candidates for the 1 missing: 12, 30, 31" in out
    assert "more candidates than missing children" in out
    assert "UPDATE history" not in out


def test_a_roll_without_lot_number_finds_its_pieces(database_url, capsys):
    """lotNo may be NULL: `lotNo = NULL` matches nothing, `lotNo <=> NULL` does."""
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _shrunk_roll(conn, lot_no=None)
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "candidates for the 1 missing: 12" in out
    assert "UPDATE history SET childrenIdentifierId" in out


def test_pieces_of_another_tree_are_not_candidates(database_url, capsys):
    """Roll 1's 11th piece is 13; piece 12, of the same product and lot, was cut from
    roll 39 (another tree) in between. Only 13 is roll 1's."""
    ours = [*range(2, 12), 13]
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _identifier(conn, 1)
        _history(conn, 1, 1, _truncated(ours))
        _sko(conn, 1)
        for child in ours:
            _piece(conn, child, root=1)
        _identifier(conn, 39)
        _history(conn, 39, 39, serialize_long_array([12]))
        _piece(conn, 12, root=39)
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "candidates for the 1 missing: 13" in out
    repaired = serialize_long_array(ours).hex()
    assert f"UPDATE history SET childrenIdentifierId = 0x{repaired} WHERE id = 1;" in out


def test_pieces_already_listed_by_another_roll_are_not_candidates(database_url, capsys):
    """Piece 12 was cut from piece 2 (a later shrink in the same tree) and is listed as
    2's child: it is not one of roll 1's missing children."""
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _identifier(conn, 1)
        _history(conn, 1, 1, _truncated(list(range(2, 13))))
        _sko(conn, 1)
        for child in range(2, 12):
            _piece(conn, child, root=1)
        conn.execute(text("UPDATE history SET childrenIdentifierId = :c WHERE id = 2"),
                     {"c": serialize_long_array([12])})
        _piece(conn, 12, root=1)
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "candidates for the 1 missing: (none found)" in out
    assert "UPDATE history" not in out


def test_main_without_problems(database_url, capsys):
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _identifier(conn, 1)
        _history(conn, 1, 1, serialize_long_array([5, 6]))
    engine.dispose()
    assert main([database_url]) == 0
    assert "every history row reads back" in capsys.readouterr().out


def test_main_does_not_suggest_an_update_without_enough_candidates(database_url, capsys):
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _identifier(conn, 1)
        _history(conn, 1, 1, _truncated(list(range(2, 13))))  # no SKI records to recover from
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "candidates for the 1 missing: (none found)" in out
    assert "UPDATE history" not in out


def test_a_later_shrink_in_the_same_tree_is_not_a_candidate(database_url, capsys):
    """Pieces 30 and 31 share the tree, product and lot, but their SKI is minutes after
    roll 1's SKO: they are another shrink, not the missing child."""
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _shrunk_roll(conn)
        later = SHRINK_AT + dt.timedelta(minutes=5)
        _piece(conn, 30, root=1, at=later)
        _piece(conn, 31, root=1, at=later)
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "candidates for the 1 missing: 12" in out
    repaired = serialize_long_array(list(range(2, 13))).hex()
    assert f"UPDATE history SET childrenIdentifierId = 0x{repaired} WHERE id = 1;" in out


def test_ski_within_two_seconds_of_the_sko_is_kept(database_url, capsys):
    """The readable pieces anchor the SKO. A missing piece two seconds later still
    belongs to that shrink; one three seconds later does not."""
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _shrunk_roll(conn)
        conn.execute(text("UPDATE transactionrecord SET createdAt = :at WHERE stockIdentifierId = 12"),
                     {"at": SHRINK_AT + dt.timedelta(seconds=2)})
        _piece(conn, 30, root=1, at=SHRINK_AT + dt.timedelta(seconds=3))
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "candidates for the 1 missing: 12" in out
    assert "UPDATE history SET childrenIdentifierId" in out


def test_no_update_when_the_sko_time_cannot_be_confirmed(database_url, capsys):
    """Two SKO rows both line up with the readable pieces: the tool will not pick one."""
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _shrunk_roll(conn)
        _sko(conn, 1, at=SHRINK_AT - dt.timedelta(seconds=1))
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "candidates for the 1 missing: (none found)" in out
    assert "SKO/SKI createdAt does not confirm one shrink" in out
    assert "UPDATE history" not in out


def test_candidates_shared_by_two_cut_rows_get_no_update(database_url, capsys):
    """Roll 1 (cut, readable 2..11) and its piece 2, shrunk again into 13..23 (cut,
    readable 13..22): piece 23 is a candidate of both rows, so neither gets an UPDATE."""
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _shrunk_roll(conn)
        conn.execute(text("UPDATE history SET childrenIdentifierId = :c WHERE id = 2"),
                     {"c": _truncated(list(range(13, 24)))})
        # The second shrink is recorded in the same second, so the times do not
        # separate piece 23 from roll 1's missing child.
        _sko(conn, 2)
        for child in range(13, 24):
            _piece(conn, child, root=1)
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    row2 = out.split("history 2 (identifier 2)")[1]
    assert "candidates for the 1 missing: 23" in row2
    assert "candidates shared with history 1" in row2
    assert "UPDATE history" not in out


def test_a_slow_shrink_lists_the_piece_outside_the_window(database_url, capsys):
    """The 11th piece's SKI came 5 seconds after the SKO (a slow database). It is not a
    candidate, but the report must show it and how far it is from the SKO, instead of a
    bare "(none found)"."""
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _shrunk_roll(conn)
        conn.execute(text("UPDATE transactionrecord SET createdAt = :at WHERE stockIdentifierId = 12"),
                     {"at": SHRINK_AT + dt.timedelta(seconds=5)})
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "candidates for the 1 missing: (none found)" in out
    assert "outside the 2-second window after the SKO (not candidates): 12 (SKI +5s)" in out
    assert "UPDATE history" not in out


def test_pieces_outside_the_window_do_not_block_the_update(database_url, capsys):
    """A later shrink's pieces (minutes after, and one before the SKO) are listed with
    their time difference, and the confirmed candidate still gets its UPDATE."""
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _shrunk_roll(conn)
        _piece(conn, 30, root=1, at=SHRINK_AT + dt.timedelta(minutes=5))
        _piece(conn, 31, root=1, at=SHRINK_AT - dt.timedelta(seconds=1))
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "candidates for the 1 missing: 12" in out
    assert "outside the 2-second window after the SKO (not candidates): 30 (SKI +300s), 31 (SKI -1s)" in out
    repaired = serialize_long_array(list(range(2, 13))).hex()
    assert f"UPDATE history SET childrenIdentifierId = 0x{repaired} WHERE id = 1;" in out


def test_a_piece_outside_the_window_says_which_row_it_is_a_candidate_of(database_url, capsys):
    """Roll 50 of the same tree was shrunk ten minutes later into 51..61 and its list
    was cut too. Piece 61 is roll 50's candidate, and outside roll 1's window: roll 1's
    report must say so, so nobody gives the same piece to both rows."""
    later = SHRINK_AT + dt.timedelta(minutes=10)
    engine = create_engine(database_url)
    with engine.begin() as conn:
        _shrunk_roll(conn)
        _identifier(conn, 50)
        _history(conn, 50, 50, _truncated(list(range(51, 62))), root=1)
        _sko(conn, 50, at=later)
        for child in range(51, 62):
            _piece(conn, child, root=1, at=later)
    engine.dispose()
    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert ("outside the 2-second window after the SKO (not candidates): "
            "61 (SKI +600s, candidate of history 50)") in out
    assert "candidates for the 1 missing: 61" in out  # roll 50's own report
