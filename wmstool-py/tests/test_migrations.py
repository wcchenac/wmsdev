"""The Alembic baseline must recreate the schema Hibernate generated for wmstool.

Needs the contract-test MySQL (contract-tests/docker-compose.yml, port 13306).
"""

import os
import pathlib

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text

ROOT = pathlib.Path(__file__).resolve().parent.parent
ADMIN_URL = os.environ.get("TEST_ADMIN_DATABASE_URL", "mysql+pymysql://root:root@127.0.0.1:13306")
TEST_DB = "wms_migration_test"

EXPECTED_TABLES = {
    "categorydetail", "history", "instockorderrecord", "outstockrequest", "product", "role",
    "salerecords", "stockadjustmentrecord", "stockallocationrecord", "stockidentifier",
    "stockidentifierbacklog", "stockinfo", "transactionrecord", "user",
}


@pytest.fixture
def migrated_url():
    admin = create_engine(ADMIN_URL)
    with admin.begin() as conn:
        conn.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB}"))
        conn.execute(text(f"CREATE DATABASE {TEST_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
    url = f"{ADMIN_URL}/{TEST_DB}?charset=utf8mb4"
    yield url
    with admin.begin() as conn:
        conn.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB}"))
    admin.dispose()


def _config(url: str) -> Config:
    cfg = Config(str(ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(ROOT / "migrations"))
    cfg.set_main_option("sqlalchemy.url", url)
    return cfg


def _upgrade(url: str, revision: str = "head") -> None:
    command.upgrade(_config(url), revision)


def _children_type(url: str) -> str:
    engine = create_engine(url)
    try:
        column = next(c for c in inspect(engine).get_columns("history") if c["name"] == "childrenIdentifierId")
        return str(column["type"]).upper()
    finally:
        engine.dispose()


def test_baseline_creates_hibernate_schema(migrated_url):
    _upgrade(migrated_url, "0001")
    engine = create_engine(migrated_url)
    insp = inspect(engine)

    assert set(insp.get_table_names()) - {"alembic_version"} == EXPECTED_TABLES
    assert {c["name"] for c in insp.get_columns("user")} == {"id", "employeeId", "fullName", "password", "role_id"}
    unique_cols = [tuple(i["column_names"]) for i in insp.get_indexes("user") if i["unique"]]
    unique_cols += [tuple(u["column_names"]) for u in insp.get_unique_constraints("user")]
    assert ("employeeId",) in unique_cols
    children = next(c for c in insp.get_columns("history") if c["name"] == "childrenIdentifierId")
    assert str(children["type"]).upper() == "TINYBLOB"  # what Hibernate generates for a Long[]

    _upgrade(migrated_url, "0001")  # running the baseline again is harmless
    engine.dispose()


def _serialized(n: int) -> bytes:
    from app.javacompat import serialize_long_array

    return serialize_long_array(list(range(1, n + 1)))


def test_children_column_holds_more_than_ten_children(migrated_url):
    """Defect 2 fixed: a Java-serialized Long[] takes 106 + 14n bytes, so TINYBLOB (255)
    ends at 10 children. 0002 widens the column to BLOB; existing values are kept as is."""
    _upgrade(migrated_url, "0001")
    engine = create_engine(migrated_url)
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO history (id, childrenIdentifierId, currentIdentifierId, rootIdentifierId) "
                          "VALUES (1, :c, 1, 1)"), {"c": _serialized(10)})
    _upgrade(migrated_url)
    assert _children_type(migrated_url) == "BLOB"
    with engine.begin() as conn:
        assert conn.execute(text("SELECT childrenIdentifierId FROM history WHERE id = 1")).scalar() == _serialized(10)
        conn.execute(text("INSERT INTO history (id, childrenIdentifierId, currentIdentifierId, rootIdentifierId) "
                          "VALUES (2, :c, 2, 2)"), {"c": _serialized(11)})
        assert conn.execute(text("SELECT childrenIdentifierId FROM history WHERE id = 2")).scalar() == _serialized(11)
    engine.dispose()
    _upgrade(migrated_url)  # running it again is harmless


def test_children_column_downgrade_refuses_to_truncate(migrated_url):
    """Going back to TINYBLOB would cut values longer than 255 bytes: refuse while any exist."""
    _upgrade(migrated_url)
    engine = create_engine(migrated_url)
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO history (id, childrenIdentifierId, currentIdentifierId, rootIdentifierId) "
                          "VALUES (1, :c, 1, 1)"), {"c": _serialized(11)})
    with pytest.raises(RuntimeError, match="longer than 255 bytes"):
        command.downgrade(_config(migrated_url), "0001")
    assert _children_type(migrated_url) == "BLOB"
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM history"))
    engine.dispose()
    command.downgrade(_config(migrated_url), "0001")
    assert _children_type(migrated_url) == "TINYBLOB"
