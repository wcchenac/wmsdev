"""The ERP (SQL Server) queries wmstool runs, with Java's exact SQL.

Java reads `SELECT *` results by position, so each function returns plain
row tuples; the column order is documented next to each query and must match
the production ERP views. Read-only.
"""

from decimal import Decimal
from functools import lru_cache

from sqlalchemy import Engine, create_engine, text

from app.config import get_settings
from app.db import engine_kwargs


@lru_cache
def get_erp_engine() -> Engine:
    # pymssql is imported here, by the dialect, not at app import time.
    # Same pool settings as MySQL: pre-ping and recycle, so a connection the
    # server already closed is not handed out for the next ERP call.
    return create_engine(get_settings().erp_database_url, **engine_kwargs())


def _rows(sql: str, **params: object) -> list[tuple]:
    with get_erp_engine().connect() as conn:
        return [tuple(r) for r in conn.execute(text(sql), params)]


def erp_text(value: object) -> str:
    """Java `cell.toString()`: NULL is a NullPointerException."""
    if value is None:
        raise TypeError("ERP column is NULL (Java: NullPointerException)")
    if isinstance(value, Decimal):
        return str(value)  # BigDecimal.toString keeps the scale: 50.00
    return str(value)


def basic_product_info(code: str) -> list[tuple]:
    # [CODE, CNAME, SPEC, DESCRIP, PACKDESC, ADDTYPE, PICTURE, CCCCODE, ENAME, ESPEC]
    return _rows("SELECT * FROM dbo.BasicProductInfo WHERE CODE= :code", code=code)


def product_info(code: str) -> list[tuple]:
    # [CODE, CNAME, SPEC, DESCRIP, SUPP, SUPPNAME, PRODDESC, USERFIELD1, PACKDESC, ADDTYPE,
    #  PICTURE, CCOST, CLAS, CCCCODE, ENAME, ESPEC]
    return _rows("SELECT * FROM dbo.ProductInfo WHERE CODE= :code", code=code)


def in_stock_order(code: str) -> list[tuple]:
    # [PROD, QTY, UNIT, GWN, BANQTY, ...]
    return _rows("SELECT * FROM dbo.InstockOrder WHERE CODE= :code", code=code)


def assemble_order(code: str) -> list[tuple]:
    # [PROD, GWN, QTY, UNIT, ...]
    return _rows("SELECT * FROM dbo.AssembleOrder WHERE CODE = :code", code=code)


def customer_return_order(code: str) -> list[tuple]:
    # [PROD, QTY, UNIT, GWN, ...]
    return _rows("SELECT * FROM dbo.CustomerReturnOrder WHERE CODE= :code", code=code)


def store_return_order(code: str) -> list[tuple]:
    # [PROD, QTY, UNIT, GWN, ...]
    return _rows("SELECT * FROM dbo.StoreReturnOrder WHERE CODE= :code", code=code)


def out_stock_to_store_order(order_no: str) -> list[tuple]:
    # [PROD, CNAME, CCCCODE, SPEC, PACKDESC, ...]
    return _rows("SELECT * FROM dbo.OutStockToStoreOrder WHERE OrderNo = :no Order By SERIAL", no=order_no)


def product_unit(code: str) -> list[tuple]:
    # [UNIT]
    return _rows("SELECT UNIT FROM dbo.PRODUCT WHERE CODE= :code", code=code)


def product_info_for_class(clas: str) -> list[tuple]:
    # [CODE, SUPP, SUPPNAME, CCOST, CNAME, DESCRIP]
    return _rows("SELECT CODE, SUPP, SUPPNAME, CCOST, CNAME, DESCRIP FROM dbo.ProductInfo WHERE CLAS= :clas", clas=clas)


def product_cqty_unit() -> list[tuple]:
    # [PROD, GWN, CQTY, UNIT]
    return _rows("SELECT * FROM dbo.ProductCQTYUNIT")


def product_classes() -> list[tuple]:
    # [CODE, CLAS]
    return _rows("SELECT CODE, CLAS FROM dbo.PRODUCT")
