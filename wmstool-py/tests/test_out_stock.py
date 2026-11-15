"""POST /api/stock/outStock follows Jackson 2.10 and Spring Data save().

A non-numeric color is a 400 before the role check (argument resolution runs
before @PreAuthorize). `handled: "false"` is false. An existing id is merged,
and updatedBy from the body is kept.
"""

import datetime as dt
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.config import get_settings
from app.db import get_session
from app.security.auth import Principal
from app.stock.models import OutStockRequest
from app.stock.moves import create_out_stock_request
from app.stock.router import OutStockBody


@pytest.fixture(autouse=True)
def settings(monkeypatch):
    monkeypatch.setenv("WMS_DATABASE_URL", "mysql+pymysql://unused/unused")
    monkeypatch.setenv("JWT_SECRET", "QUJD")
    monkeypatch.setenv("ERP_DATABASE_URL", "mssql+pymssql://unused/unused")
    monkeypatch.setenv("EXCEL_DIR", "/tmp/excel")
    monkeypatch.setenv("PICTURE_DIR", "/tmp/pictures")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_string_false_is_false_and_color_is_an_int():
    body = OutStockBody.model_validate({"color": "3", "handled": "false", "deleted": "False"})
    assert (body.color, body.handled, body.deleted) == (3, False, False)


def test_non_numeric_color_is_rejected():
    with pytest.raises(ValidationError):
        OutStockBody.model_validate({"color": "red"})


def test_non_numeric_color_is_400_before_the_role_check(monkeypatch):
    """ROLE_Sales is 403 for a valid body. Jackson fails first, so this is 400."""
    monkeypatch.setattr(
        "app.security.auth._principal_from_header",
        lambda header: Principal(1, "sales", "業務甲", "ROLE_Sales"))
    from app.main import create_app

    app = create_app()

    def session():
        yield object()

    app.dependency_overrides[get_session] = session
    resp = TestClient(app).post("/api/stock/outStock", json={"color": "red", "handled": "false"},
                                headers={"Authorization": "Bearer x"})
    assert resp.status_code == 400
    assert resp.content == b""


def test_a_valid_body_from_the_wrong_role_is_forbidden(monkeypatch):
    monkeypatch.setattr(
        "app.security.auth._principal_from_header",
        lambda header: Principal(1, "sales", "業務甲", "ROLE_Sales"))
    from app.main import create_app

    app = create_app()

    def session():
        yield object()

    app.dependency_overrides[get_session] = session
    resp = TestClient(app).post(
        "/api/stock/outStock", json={"productNo": "CF1001", "color": 1},
        headers={"Authorization": "Bearer x"})
    assert resp.status_code == 403


class _Session:
    def __init__(self, existing: OutStockRequest | None = None) -> None:
        self.existing = existing
        self.added: OutStockRequest | None = None

    def get(self, model, key):  # noqa: ANN001
        if self.existing is not None and self.existing.id == key:
            return self.existing
        return None

    def add(self, row: OutStockRequest) -> None:
        self.added = row

    def flush(self) -> None:
        if self.added is not None and self.added.id is None:
            self.added.id = 1


def test_handled_false_is_stored_and_the_response_color_is_an_int(monkeypatch):
    monkeypatch.setattr(
        "app.security.auth._principal_from_header",
        lambda header: Principal(1, "op", "倉管乙", "ROLE_Operator"))
    saved: dict[str, OutStockRequest] = {}

    def create(session, body, editor):  # noqa: ANN001
        row = create_out_stock_request(_Session(), body, editor)
        saved["row"] = row
        return row

    monkeypatch.setattr("app.stock.moves.create_out_stock_request", create)
    from app.main import create_app

    app = create_app()

    def session():
        yield object()

    app.dependency_overrides[get_session] = session
    resp = TestClient(app).post(
        "/api/stock/outStock",
        json={"productNo": "CF1002", "color": "4", "handled": "false", "updatedBy": "某人"},
        headers={"Authorization": "Bearer x"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["color"] == 4 and isinstance(body["color"], int)
    assert body["handled"] is False
    assert body["updatedBy"] == "某人"
    assert body["outStockType"] == 2
    assert body["createdBy"] == "倉管乙"
    assert saved["row"].isHandled is False


def test_an_existing_id_is_merged_and_updated_by_is_kept():
    old_created = dt.datetime(2020, 1, 1, 0, 0, 0)
    existing = OutStockRequest(
        id=7, productNo="OLD", color=9, createdBy="old", updatedBy="old", createdAt=old_created,
        isHandled=True, outStockType=0, stockIdentifierId=3)
    session = _Session(existing)
    body = OutStockBody.model_validate({
        "id": 7, "productNo": "NEW", "color": 2, "handled": "false", "updatedBy": "編輯者",
    })
    row = create_out_stock_request(session, body, "倉管乙")  # type: ignore[arg-type]
    assert row is existing
    assert session.added is None
    assert existing.productNo == "NEW"
    assert existing.color == 2
    assert existing.isHandled is False
    assert existing.updatedBy == "編輯者"
    assert existing.createdBy == "倉管乙"
    assert existing.outStockType == 2
    assert existing.createdAt is None  # omitted on the body; @PrePersist does not run on merge
    assert existing.updatedAt is not None
    assert existing.stockIdentifierId == 0  # primitive default, not the old 3


def test_an_unknown_id_is_inserted_with_a_new_identity():
    session = _Session()
    body = OutStockBody.model_validate({"id": 99, "productNo": "CF1001", "updatedBy": "某人"})
    row = create_out_stock_request(session, body, "倉管乙")  # type: ignore[arg-type]
    assert session.added is row
    assert row.id == 1  # IDENTITY, not the client's 99
    assert row.updatedBy == "某人"
    assert row.createdAt is not None
    assert row.updatedAt is None
