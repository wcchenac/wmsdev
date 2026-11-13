"""Request bodies for /api/user/*."""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    # Both optional: a missing field is a failed login (401), not a 400.
    employeeId: str | None = None
    password: str | None = None
