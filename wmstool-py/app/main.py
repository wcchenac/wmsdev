"""FastAPI application factory."""

from fastapi import FastAPI

from app.config import check_directories, get_settings
from app.errors import CatchAllMiddleware, install_error_handlers
from app.files.router import router as file_router
from app.security.auth import AuthMiddleware
from app.security.cors import JavaCorsMiddleware
from app.stock.router import router as stock_router
from app.users.router import router as user_router


def create_app() -> FastAPI:
    # Fail here, before serving, when EXCEL_DIR or PICTURE_DIR is unset or unusable.
    check_directories(get_settings())
    app = FastAPI(title="wmstool", docs_url=None, redoc_url=None, openapi_url=None)
    install_error_handlers(app)
    app.add_middleware(CatchAllMiddleware)  # added first = innermost
    app.add_middleware(AuthMiddleware)
    app.add_middleware(JavaCorsMiddleware)  # added last = outermost: preflights skip auth
    app.include_router(user_router)
    app.include_router(file_router)
    app.include_router(stock_router)
    return app


app = create_app()
