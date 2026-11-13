"""/api/user/* — login and admin user management."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_session
from app.users import service
from app.users.schemas import LoginRequest

router = APIRouter(prefix="/api/user")


@router.post("/login")
def login(body: LoginRequest, session: Session = Depends(get_session)) -> dict[str, str]:
    jwt = service.authenticate(session, body.employeeId, body.password)
    return {"accessToken": "Bearer " + jwt, "tokenType": "Bearer "}
