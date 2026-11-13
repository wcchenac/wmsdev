"""FastAPI application factory."""

from fastapi import FastAPI

from app.errors import install_error_handlers
from app.security.auth import AuthMiddleware
from app.users.router import router as user_router


def create_app() -> FastAPI:
    app = FastAPI(title="wmstool", docs_url=None, redoc_url=None, openapi_url=None)
    install_error_handlers(app)
    app.add_middleware(AuthMiddleware)
    app.include_router(user_router)
    return app


app = create_app()
