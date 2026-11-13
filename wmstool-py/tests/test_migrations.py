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


def _upgrade(url: str) -> None:
    cfg = Config(str(ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(ROOT / "migrations"))
    cfg.set_main_option("sqlalchemy.url", url)
    command.upgrade(cfg, "head")


def test_baseline_creates_hibernate_schema(migrated_url):
    _upgrade(migrated_url)
    engine = create_engine(migrated_url)
    insp = inspect(engine)

    assert set(insp.get_table_names()) - {"alembic_version"} == EXPECTED_TABLES
    assert {c["name"] for c in insp.get_columns("user")} == {"id", "employeeId", "fullName", "password", "role_id"}
    unique_cols = [tuple(i["column_names"]) for i in insp.get_indexes("user") if i["unique"]]
    unique_cols += [tuple(u["column_names"]) for u in insp.get_unique_constraints("user")]
    assert ("employeeId",) in unique_cols
    children = next(c for c in insp.get_columns("history") if c["name"] == "childrenIdentifierId")
    assert str(children["type"]).upper() == "TINYBLOB"

    _upgrade(migrated_url)  # running the baseline again is harmless
    engine.dispose()
