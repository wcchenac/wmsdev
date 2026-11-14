"""python -m app.history_check: find history.childrenIdentifierId values that cannot be
read back (e.g. cut to 255 bytes by TINYBLOB outside strict mode) and what is left of them.

The database part needs the contract-test MySQL (port 13306), like test_migrations.
"""

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


def _identifier(conn, identifier_id: int, lot_no: str = "L01") -> None:  # noqa: ANN001
    conn.execute(text(
        "INSERT INTO stockidentifier (id, isExist, isOutStock, lotNo, productNo, quantity, serialNo, type, unit, "
        "waitToShrink) VALUES (:id, 1, 0, :lot, 'CF1001', '4', :id, '整支', '碼', 0)"), {"id": identifier_id, "lot": lot_no})


def _ski(conn, identifier_id: int, lot_no: str = "L01") -> None:  # noqa: ANN001
    conn.execute(text(
        "INSERT INTO transactionrecord (lotNo, productNo, stockIdentifierId, transactionType) "
        "VALUES (:lot, 'CF1001', :id, 'SKI')"), {"id": identifier_id, "lot": lot_no})


def _history(conn, history_id: int, current: int, children: bytes | None) -> None:  # noqa: ANN001
    conn.execute(text(
        "INSERT INTO history (id, childrenIdentifierId, currentIdentifierId, rootIdentifierId) "
        "VALUES (:id, :c, :cur, :cur)"), {"id": history_id, "c": children, "cur": current})


def test_main_reports_a_truncated_row_with_its_missing_children(database_url, capsys):
    engine = create_engine(database_url)
    with engine.begin() as conn:
        for identifier_id in range(1, 13):  # roll 1 shrunk into 2..12
            _identifier(conn, identifier_id)
        for child in range(2, 13):
            _ski(conn, child)
        _identifier(conn, 20, lot_no="OTHER")  # another lot's piece: never a candidate
        _ski(conn, 20, lot_no="OTHER")
        _history(conn, 1, 1, _truncated(list(range(2, 13))))
        _history(conn, 2, 2, serialize_long_array([]))  # a healthy row is not reported
    engine.dispose()

    assert main([database_url]) == 1
    out = capsys.readouterr().out
    assert "history 1 (identifier 1)" in out
    assert "declares 11 children, 10 readable: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11" in out
    assert "candidates for the 1 missing: 12" in out
    repaired = serialize_long_array(list(range(2, 13))).hex()
    assert f"UPDATE history SET childrenIdentifierId = 0x{repaired} WHERE id = 1;" in out
    assert "history 2" not in out


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
    assert "UPDATE" not in out
