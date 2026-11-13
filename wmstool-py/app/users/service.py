"""User business logic, ported from wmstool's UserService / UserController."""

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.errors import Unauthorized
from app.security.passwords import hash_password, verify_password
from app.security.tokens import create_access_token
from app.users.models import ROLE_LABELS, Role, User

DUPLICATE_BODY = {"success": False, "message": "EmployeeId is already exists!"}


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


def _role(session: Session, name: str | None) -> Role | None:
    if name not in ROLE_LABELS:
        return None
    return session.scalar(select(Role).where(Role.role == name))


def register_user(session: Session, employee_id: str, full_name: str, password: str, role: str) -> tuple[int, object]:
    """(HTTP status, body). An unknown role name raises, like Java's RoleName.valueOf (-> 500)."""
    if session.scalar(select(User.id).where(User.employeeId == employee_id)) is not None:
        return 400, DUPLICATE_BODY
    if role not in ROLE_LABELS:
        raise ValueError(f"No enum constant RoleName.{role}")
    role_row = _role(session, role)
    if role_row is None:
        return 400, {"success": False, "message": "Role setting error"}
    session.add(User(employeeId=employee_id, fullName=full_name, password=hash_password(password), role=role_row))
    return 201, "Success"


def list_users(session: Session) -> list[dict[str, str]]:
    users = session.scalars(select(User).order_by(User.id))
    return [
        {
            "employeeId": u.employeeId or "",
            "fullName": u.fullName or "",
            "role": ROLE_LABELS.get(u.role.role if u.role and u.role.role else "", "ERROR"),
        }
        for u in users
    ]


def update_user(session: Session, employee_id: str | None, new_password: str | None,
                full_name: str | None, role: str | None) -> bool:
    """False (-> 400) for an unknown user or role; nothing is changed in that case.

    newPassword None keeps the password; any string, "" included, replaces it.
    """
    user = session.scalar(select(User).where(User.employeeId == employee_id))
    role_row = _role(session, role)
    if user is None or role_row is None:
        return False
    if new_password is not None:
        user.password = hash_password(new_password)
    user.fullName = full_name
    user.role = role_row
    return True


def delete_user(session: Session, employee_id: str) -> bool:
    session.execute(delete(User).where(User.employeeId == employee_id))
    return True
