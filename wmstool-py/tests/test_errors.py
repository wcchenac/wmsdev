from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.errors import install_error_handlers


def test_server_error_does_not_echo_exception_text():
    app = FastAPI()
    install_error_handlers(app)

    @app.get("/boom")
    def boom():
        raise RuntimeError("[SQL: INSERT INTO user ...] [parameters: ('x', '$2a$10$secret-hash')]")

    resp = TestClient(app, raise_server_exceptions=False).get("/boom")

    assert resp.status_code == 500
    body = resp.json()
    assert {k: body[k] for k in ("status", "error", "path")} == {
        "status": 500, "error": "Internal Server Error", "path": "/boom"}
    assert "SQL" not in body["message"] and "$2a$" not in body["message"]
