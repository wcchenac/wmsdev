"""User business logic, ported from wmstool's UserService."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.errors import Unauthorized
from app.security.passwords import verify_password
from app.security.tokens import create_access_token
from app.users.models import User


def authenticate(session: Session, employee_id: str | None, password: str | None) -> str:
    """A JWT for valid credentials; Unauthorized otherwise."""
    if employee_id is None or password is None:
        raise Unauthorized()
    user = session.scalar(select(User).where(User.employeeId == employee_id))
    if user is None or user.password is None or not verify_password(password, user.password):
        raise Unauthorized()
    if user.role is None or user.role.role is None:
        raise Unauthorized()
    return create_access_token(user.id, user.employeeId or "", user.fullName or "", user.role.role)
