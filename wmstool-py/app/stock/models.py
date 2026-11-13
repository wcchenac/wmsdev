"""ORM mapping of the stock tables Hibernate created (names and camelCase columns as-is)."""

import datetime as dt

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.dialects.mysql import BIT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator

from app.users.models import Base


class BitBool(TypeDecorator[bool]):
    """Hibernate maps Java boolean to MySQL bit(1)."""

    impl = BIT(1)
    cache_ok = True

    def process_bind_param(self, value: bool | None, dialect: object) -> int | None:
        return None if value is None else int(bool(value))

    def process_result_value(self, value: object, dialect: object) -> bool | None:
        if value is None:
            return None
        if isinstance(value, (bytes, bytearray)):
            return int.from_bytes(value, "big") != 0
        return bool(value)


class StockIdentifierBacklog(Base):
    __tablename__ = "stockidentifierbacklog"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    productNo: Mapped[str] = mapped_column(String(25))
    lotNo: Mapped[str | None] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(10))
    quantity: Mapped[str] = mapped_column(String(10))
    unit: Mapped[str] = mapped_column(String(10))
    serialNo: Mapped[int] = mapped_column(Integer)


class StockIdentifier(Base):
    __tablename__ = "stockidentifier"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    productNo: Mapped[str] = mapped_column(String(25))
    lotNo: Mapped[str | None] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(10))
    quantity: Mapped[str] = mapped_column(String(10))
    unit: Mapped[str] = mapped_column(String(10))
    serialNo: Mapped[int] = mapped_column(Integer)
    isExist: Mapped[bool] = mapped_column(BitBool, default=True)
    waitToShrink: Mapped[bool] = mapped_column(BitBool, default=False)
    inStockType: Mapped[str | None] = mapped_column(String(255))
    eliminateType: Mapped[str | None] = mapped_column(String(255))
    eliminateDate: Mapped[str | None] = mapped_column(String(255))
    eliminateReason: Mapped[str | None] = mapped_column(String(255))
    adjustment: Mapped[str | None] = mapped_column(String(255))
    isOutStock: Mapped[bool] = mapped_column(BitBool, default=False)
    firstInStockAt: Mapped[str | None] = mapped_column(String(255))
    outStockAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    createdAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    updatedAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    createdBy: Mapped[str | None] = mapped_column(String(255))
    updatedBy: Mapped[str | None] = mapped_column(String(255))


class StockInfo(Base):
    __tablename__ = "stockinfo"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    stockIdentifier_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("stockidentifier.id"))
    color: Mapped[int] = mapped_column(Integer)
    defect: Mapped[str | None] = mapped_column(String(10))
    record: Mapped[str | None] = mapped_column(String(255))
    remark: Mapped[str | None] = mapped_column(String(255))
    shrinkAt: Mapped[str | None] = mapped_column(String(255))
    storedAt: Mapped[str | None] = mapped_column(String(255))
    createdAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    updatedAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    createdBy: Mapped[str | None] = mapped_column(String(255))
    updatedBy: Mapped[str | None] = mapped_column(String(255))

    stockIdentifier: Mapped[StockIdentifier] = relationship(lazy="joined")


class History(Base):
    __tablename__ = "history"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    currentIdentifierId: Mapped[int | None] = mapped_column(BigInteger)
    childrenIdentifierId: Mapped[bytes | None] = mapped_column(LargeBinary)  # Java-serialized Long[]
    rootIdentifierId: Mapped[int | None] = mapped_column(BigInteger)


class InStockOrderRecord(Base):
    __tablename__ = "instockorderrecord"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    inStockType: Mapped[str | None] = mapped_column(String(255))
    inStockOrderNo: Mapped[str | None] = mapped_column(String(255))
    productNo: Mapped[str | None] = mapped_column(String(255))
    lotNo: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[str | None] = mapped_column(String(255))
    unit: Mapped[str | None] = mapped_column(String(255))
    type: Mapped[str | None] = mapped_column(String(255))
    color: Mapped[int] = mapped_column(Integer)
    defect: Mapped[str | None] = mapped_column(String(255))
    stockIdentifierId: Mapped[int | None] = mapped_column(BigInteger)
    createdAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    updatedAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    createdBy: Mapped[str | None] = mapped_column(String(255))
    updatedBy: Mapped[str | None] = mapped_column(String(255))


class TransactionRecord(Base):
    __tablename__ = "transactionrecord"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    productNo: Mapped[str | None] = mapped_column(String(255))
    lotNo: Mapped[str | None] = mapped_column(String(255))
    type: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[str | None] = mapped_column(String(255))
    unit: Mapped[str | None] = mapped_column(String(255))
    operator: Mapped[str | None] = mapped_column(String(255))  # "1" in, "-1" out
    stockIdentifierId: Mapped[int | None] = mapped_column(BigInteger)
    transactionType: Mapped[str | None] = mapped_column(String(255))
    createdAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    createdBy: Mapped[str | None] = mapped_column(String(255))


class Product(Base):
    __tablename__ = "product"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    productNo: Mapped[str | None] = mapped_column(String(255))
    type: Mapped[str | None] = mapped_column(String(255))
    category: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[str | None] = mapped_column(String(255))
    unit: Mapped[str | None] = mapped_column(String(255))
    safeQuantity: Mapped[str | None] = mapped_column(String(255))
    cName: Mapped[str | None] = mapped_column(String(255))
    whType: Mapped[str | None] = mapped_column(String(255))
    isBypass: Mapped[bool] = mapped_column(BitBool, default=False)
    isAlert: Mapped[bool] = mapped_column(BitBool, default=False)
    createdAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    updatedAt: Mapped[dt.datetime | None] = mapped_column(DateTime)


class OutStockRequest(Base):
    __tablename__ = "outstockrequest"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    productNo: Mapped[str | None] = mapped_column(String(255))
    lotNo: Mapped[str | None] = mapped_column(String(255))
    type: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[str | None] = mapped_column(String(255))
    unit: Mapped[str | None] = mapped_column(String(255))
    color: Mapped[int] = mapped_column(Integer, default=0)
    defect: Mapped[str | None] = mapped_column(String(255))
    reason: Mapped[str | None] = mapped_column(String(255))
    outStockType: Mapped[int] = mapped_column(Integer)  # 0 出貨, 1 減肥/分裝, 2 無指定拉貨
    stockIdentifierId: Mapped[int] = mapped_column(BigInteger, default=0)
    fileName: Mapped[str | None] = mapped_column(String(255))
    isHandled: Mapped[bool] = mapped_column(BitBool, default=False)
    isDeleted: Mapped[bool] = mapped_column(BitBool, default=False)
    requestFrom: Mapped[str | None] = mapped_column(String(255))
    createdAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    updatedAt: Mapped[dt.datetime | None] = mapped_column(DateTime)
    createdBy: Mapped[str | None] = mapped_column(String(255))
    updatedBy: Mapped[str | None] = mapped_column(String(255))
