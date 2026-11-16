"""Authentication (middleware) and role checks (dependencies).

Mirrors the Java filter chain: every /api/** request except the two public
user routes must carry `Authorization: Bearer <jwt>` for a user that still
exists, or it is answered 401 before routing (so even unknown /api paths get
401). Role checks run later, inside the route, like @PreAuthorize.
"""

from collections.abc import Callable
from dataclasses import dataclass

from fastapi import Request
from sqlalchemy import select
from starlette.concurrency import run_in_threadpool
from starlette.datastructures import Headers
from starlette.types import ASGIApp, Receive, Scope, Send

from app.db import get_sessionmaker
from app.errors import Forbidden, Unauthorized, unauthorized_response
from app.security.tokens import read_user_id
from app.users.models import User

TOKEN_PREFIX = "Bearer "
PUBLIC_PATHS = {"/api/user/login", "/api/user/adminManagement/user/register"}


@dataclass(frozen=True)
class Principal:
    """The authenticated user, detached from any DB session."""

    id: int
    employee_id: str
    full_name: str
    role: str


def _principal_from_header(header: str | None) -> Principal | None:
    """The lookup session is closed before the request continues, so authentication
    does not hold a MySQL connection across the handler's ERP or Excel work."""
    if not header or not header.startswith(TOKEN_PREFIX):
        return None
    user_id = read_user_id(header[len(TOKEN_PREFIX) :])
    if user_id is None:
        return None
    with get_sessionmaker()() as session:
        user = session.scalar(select(User).where(User.id == user_id))
        if user is None or user.role is None or user.role.role is None:
            return None
        return Principal(user.id, user.employeeId or "", user.fullName or "", user.role.role)


class AuthMiddleware:
    """Plain ASGI middleware. (Starlette's BaseHTTPMiddleware wraps handler
    exceptions in an ExceptionGroup, which keeps the 500 handler from sending
    its response — the client just sees the connection drop.)"""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http" and scope["path"].startswith("/api/"):
            headers = Headers(scope=scope)
            principal = await run_in_threadpool(_principal_from_header, headers.get("Authorization"))
            if principal is None and scope["path"] not in PUBLIC_PATHS:
                await unauthorized_response()(scope, receive, send)
                return
            scope.setdefault("state", {})["user"] = principal
        await self.app(scope, receive, send)


def current_user(request: Request) -> Principal:
    principal = getattr(request.state, "user", None)
    if principal is None:
        raise Unauthorized()
    return principal


def require_roles(*roles: str) -> Callable[[Request], Principal]:
    """Dependency: the caller must be logged in (else 401) with one of `roles` (else 403)."""

    def check(request: Request) -> Principal:
        principal = current_user(request)
        if principal.role not in roles:
            raise Forbidden()
        return principal

    return check
