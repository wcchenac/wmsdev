"""Pool settings, and MySQL sessions that are not held across ERP work."""

import json
from contextlib import contextmanager
from types import SimpleNamespace

import pytest

from app.config import get_settings
from app.db import get_engine, get_sessionmaker
from app.erp import get_erp_engine
from app.security.auth import Principal
from app.stock.router import query_order


def _env(monkeypatch, **extra: str) -> None:  # noqa: ANN001
    monkeypatch.setenv("WMS_DATABASE_URL", "mysql+pymysql://u:p@127.0.0.1/none")
    monkeypatch.setenv("ERP_DATABASE_URL", "mssql+pymssql://u:p@127.0.0.1/none")
    monkeypatch.setenv("JWT_SECRET", "QUJD")
    monkeypatch.setenv("EXCEL_DIR", "/tmp/excel")
    monkeypatch.setenv("PICTURE_DIR", "/tmp/pictures")
    for key, value in extra.items():
        monkeypatch.setenv(key, value)
    get_settings.cache_clear()
    get_engine.cache_clear()
    get_sessionmaker.cache_clear()
    get_erp_engine.cache_clear()


def _engine_kwargs(monkeypatch, wms_create, erp_create) -> None:  # noqa: ANN001
    """Build both engines with create_engine replaced. The placeholder engines must not
    stay in the lru_caches, also when building one of them fails."""
    monkeypatch.setattr("app.db.create_engine", wms_create)
    monkeypatch.setattr("app.erp.create_engine", erp_create)
    try:
        get_engine()
        get_erp_engine()
    finally:
        get_engine.cache_clear()
        get_erp_engine.cache_clear()


def test_pool_pre_ping_recycle_and_size_are_configurable(monkeypatch):
    """Both engines get the pool settings from the environment. create_engine is
    captured rather than inspected afterwards: the pool's own attributes are private,
    and the ERP dialect (pymssql) need not load for this."""
    _env(monkeypatch, DB_POOL_SIZE="3", DB_POOL_MAX_OVERFLOW="4", DB_POOL_RECYCLE="120")
    calls: dict[str, dict[str, object]] = {}

    def capture(module: str):
        def create_engine(url: str, **kwargs: object) -> object:
            calls[module] = {"url": url, **kwargs}
            return object()
        return create_engine

    _engine_kwargs(monkeypatch, capture("wms"), capture("erp"))
    expected = {"pool_pre_ping": True, "pool_size": 3, "max_overflow": 4, "pool_recycle": 120}
    assert calls["wms"] == {"url": "mysql+pymysql://u:p@127.0.0.1/none", **expected}
    assert calls["erp"] == {"url": "mssql+pymssql://u:p@127.0.0.1/none", **expected}


def test_placeholder_engines_do_not_stay_cached_when_building_fails(monkeypatch):
    _env(monkeypatch)

    def fails(url: str, **kwargs: object) -> object:
        raise RuntimeError("ERP engine failed")

    with pytest.raises(RuntimeError, match="ERP engine failed"):
        _engine_kwargs(monkeypatch, lambda url, **kwargs: object(), fails)
    assert get_engine.cache_info().currsize == 0
    assert get_erp_engine.cache_info().currsize == 0


def _request(role: str = "ROLE_Normal"):
    return SimpleNamespace(state=SimpleNamespace(user=Principal(1, "e", "n", role)))


def test_out_stock_to_store_does_not_open_mysql(monkeypatch):
    monkeypatch.setattr("app.stock.orders.out_stock_to_store_order", lambda order_no: [{"productNo": order_no}])

    def opened():
        raise AssertionError("MySQL session opened")

    monkeypatch.setattr("app.stock.router.session_scope", opened)
    response = query_order("outStockToStore", "OS1", _request())
    assert response.status_code == 200
    assert json.loads(response.body) == [{"productNo": "OS1"}]


def test_other_orders_read_erp_before_opening_mysql(monkeypatch):
    seen: list[str] = []

    monkeypatch.setattr("app.stock.orders.erp_current_status", lambda *args: seen.append("erp") or {})
    monkeypatch.setattr(
        "app.stock.orders.query_order",
        lambda *args: seen.append("db") or {"currentStatus": {}, "waitHandleStatus": {}})

    @contextmanager
    def scope():
        seen.append("session")
        yield object()

    monkeypatch.setattr("app.stock.router.session_scope", scope)
    response = query_order("inStock", "IN1", _request())
    assert response.status_code == 200
    assert seen == ["erp", "session", "db"]
