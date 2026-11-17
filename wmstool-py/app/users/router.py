"""/api/user/* — login and admin user management.

Role checks run inside each handler, after FastAPI has validated the request,
so a malformed request answers 400 before authorization — the same order as
Spring (argument binding, then @PreAuthorize).
"""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, PlainTextResponse, Response
from sqlalchemy.orm import Session

from app.db import get_session
from app.security.auth import require_roles
from app.strict_json import StrictJsonRoute
from app.users import service
from app.users.schemas import LoginRequest, RegisterRequest, UpdateUserRequest

router = APIRouter(prefix="/api/user", route_class=StrictJsonRoute)
admin_only = require_roles("ROLE_Admin")


@router.post("/login")
def login(body: LoginRequest, session: Session = Depends(get_session)) -> dict[str, str]:
    jwt = service.authenticate(session, body.employeeId, body.password)
    return {"accessToken": "Bearer " + jwt, "tokenType": "Bearer "}


@router.post("/adminManagement/user/register")
def register(body: RegisterRequest, request: Request, session: Session = Depends(get_session)) -> Response:
    admin_only(request)
    status, payload = service.register_user(session, body.employeeId, body.fullName, body.password, body.role)
    if isinstance(payload, str):
        return PlainTextResponse(payload, status_code=status)
    return JSONResponse(payload, status_code=status)


@router.get("/adminManagement/user/userList")
def user_list(request: Request, session: Session = Depends(get_session)) -> list[dict[str, str]]:
    admin_only(request)
    return service.list_users(session)


@router.patch("/adminManagement/user/update")
def update(body: UpdateUserRequest, request: Request, session: Session = Depends(get_session)) -> Response:
    admin_only(request)
    ok = service.update_user(session, body.employeeId, body.newPassword, body.fullName, body.role)
    return Response(status_code=200 if ok else 400)


@router.delete("/adminManagement/user/delete")
def delete(employeeId: str, request: Request, session: Session = Depends(get_session)) -> Response:
    admin_only(request)
    service.delete_user(session, employeeId)
    return Response(status_code=200)
