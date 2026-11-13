"""ORM mapping of the `role` and `user` tables Hibernate created."""

from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# RoleName enum in the Java service: name -> display label (RoleName.canme()).
ROLE_LABELS: dict[str, str] = {
    "ROLE_Normal": "一般人員/門市",
    "ROLE_Sales": "業務",
    "ROLE_Operator": "庫存相關人員",
    "ROLE_Admin": "管理員",
}


class Base(DeclarativeBase):
    pass


class Role(Base):
    __tablename__ = "role"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    role: Mapped[str | None] = mapped_column(String(255))


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    employeeId: Mapped[str | None] = mapped_column(String(255), unique=True)
    fullName: Mapped[str | None] = mapped_column(String(255))
    password: Mapped[str | None] = mapped_column(String(255))
    role_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("role.id"))

    role: Mapped[Role | None] = relationship(lazy="joined")
