"""Error responses shaped like the Java service's.

- 401 for any authentication failure: Spring's JwtAuthenticationEntryPoint
  always answers with the login-failure body, whatever went wrong.
- 403 / 500: Spring Boot's default error JSON.
- Request validation errors: 400 with an empty body (Spring's /error dispatch
  is itself secured, so the Java service sends no body for these).
"""

import logging
import time

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from starlette.types import ASGIApp, Message, Receive, Scope, Send

logger = logging.getLogger(__name__)

LOGIN_FAILURE_BODY = {"username": "無效的員工編號", "password": "無效的密碼"}


class Unauthorized(Exception):
    """Not authenticated (no, bad or stale credentials)."""


class Forbidden(Exception):
    """Authenticated, but the role is not allowed."""


def unauthorized_response() -> JSONResponse:
    return JSONResponse(LOGIN_FAILURE_BODY, status_code=401)


def spring_error(request: Request, status: int, error: str, message: str) -> JSONResponse:
    return JSONResponse(
        {
            "timestamp": int(time.time() * 1000),
            "status": status,
            "error": error,
            "message": message,
            "path": request.url.path,
        },
        status_code=status,
    )


class CatchAllMiddleware:
    """Answer unhandled exceptions with Spring's 500 body *without* re-raising.

    Starlette routes `Exception` handlers to ServerErrorMiddleware, which sends
    the response and then re-raises; uvicorn then drops the keep-alive
    connection, and a client reusing it fails. Java keeps the connection.
    Add this middleware first (innermost) so CORS still decorates the 500.
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        started = False

        async def tracking_send(message: Message) -> None:
            nonlocal started
            if message["type"] == "http.response.start":
                started = True
            await send(message)

        try:
            await self.app(scope, receive, tracking_send)
        except Exception:
            if started:
                raise
            request = Request(scope)
            logger.exception("unhandled error on %s %s", request.method, request.url.path)
            response = spring_error(request, 500, "Internal Server Error", "Internal Server Error")
            await response(scope, receive, send)


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def _validation(request: Request, exc: RequestValidationError) -> Response:
        return Response(status_code=400)

    @app.exception_handler(Unauthorized)
    async def _unauthorized(request: Request, exc: Unauthorized) -> Response:
        return unauthorized_response()

    @app.exception_handler(Forbidden)
    async def _forbidden(request: Request, exc: Forbidden) -> Response:
        return spring_error(request, 403, "Forbidden", "Forbidden")

    @app.exception_handler(Exception)
    async def _server_error(request: Request, exc: Exception) -> Response:
        # The exception text stays in the log: SQLAlchemy messages carry SQL and
        # bound parameters (password hashes included).
        logger.exception("unhandled error on %s %s", request.method, request.url.path)
        return spring_error(request, 500, "Internal Server Error", "Internal Server Error")
