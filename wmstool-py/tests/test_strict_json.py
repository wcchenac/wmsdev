"""NaN, Infinity and -Infinity in a request body are a 400, as in Jackson."""

import pytest
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient

from app.config import get_settings
from app.strict_json import StrictJsonRoute


@pytest.fixture
def app(monkeypatch, tmp_path):
    monkeypatch.setenv("WMS_DATABASE_URL", "mysql+pymysql://unused/unused")
    monkeypatch.setenv("JWT_SECRET", "QUJD")
    monkeypatch.setenv("ERP_DATABASE_URL", "mssql+pymssql://unused/unused")
    monkeypatch.setenv("EXCEL_DIR", str(tmp_path))
    monkeypatch.setenv("PICTURE_DIR", str(tmp_path / "pictures"))
    get_settings.cache_clear()
    from app.main import create_app

    yield create_app()
    get_settings.cache_clear()


def test_every_api_route_parses_json_strictly(app):
    routes = [route for route in app.routes if isinstance(route, APIRoute)]
    assert routes
    assert [route.path for route in routes if not isinstance(route, StrictJsonRoute)] == []


@pytest.mark.parametrize("constant", ["NaN", "Infinity", "-Infinity"])
def test_non_standard_numbers_are_a_400_with_an_empty_body(app, constant):
    """/api/user/login needs no token and reads its body before anything else."""
    body = '{"employeeId": "admin", "password": "x", "extra": ' + constant + "}"
    resp = TestClient(app).post("/api/user/login", content=body.encode(),
                                headers={"Content-Type": "application/json"})
    assert (resp.status_code, resp.content) == (400, b"")
