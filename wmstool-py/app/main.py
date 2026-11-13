"""FastAPI application factory."""

from fastapi import FastAPI

from app.errors import install_error_handlers
from app.files.router import router as file_router
from app.security.auth import AuthMiddleware
from app.security.cors import JavaCorsMiddleware
from app.users.router import router as user_router


def create_app() -> FastAPI:
    app = FastAPI(title="wmstool", docs_url=None, redoc_url=None, openapi_url=None)
    install_error_handlers(app)
    app.add_middleware(AuthMiddleware)
    app.add_middleware(JavaCorsMiddleware)  # added last = outermost: preflights skip auth
    app.include_router(user_router)
    app.include_router(file_router)
    return app


app = create_app()
