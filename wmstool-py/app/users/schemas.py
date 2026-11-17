"""Request bodies for /api/user/*."""

from typing import Annotated

from pydantic import AfterValidator, BaseModel

from app.javacompat import java_is_blank


def _not_blank(value: str) -> str:
    # Bean Validation @NotBlank uses Java String.trim(): a full-width space is not blank.
    if java_is_blank(value):
        raise ValueError("must not be blank")
    return value


NotBlank = Annotated[str, AfterValidator(_not_blank)]


class LoginRequest(BaseModel):
    # Both optional: a missing field is a failed login (401), not a 400.
    employeeId: str | None = None
    password: str | None = None


class RegisterRequest(BaseModel):
    employeeId: NotBlank
    fullName: NotBlank
    password: NotBlank
    confirmPassword: str | None = None  # accepted, never compared (as in Java)
    role: NotBlank


class UpdateUserRequest(BaseModel):
    employeeId: str | None = None
    newPassword: str | None = None
    fullName: str | None = None
    role: str | None = None
