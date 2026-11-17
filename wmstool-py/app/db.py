"""WMS database engine and the per-request session dependency.

Trade-off: a request that only reads MySQL and then calls ERP or writes Excel
checks the connection back in before that slow work. The read is committed
(it changed nothing). A later failure still answers the same status, because
those handlers do not write MySQL after the ERP or Excel step, so there is
nothing to roll back. Handlers that write MySQL keep one transaction around
the writes. Shrink still calls the ERP unit lookup inside its transaction:
that value is part of the row being saved, and a failure must roll the shrink
back, which the caller's session_scope / get_session already does.
`queryOrder/outStockToStore` never opens a MySQL session.
"""

from collections.abc import Iterator
from contextlib import contextmanager
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings


def engine_kwargs() -> dict[str, int | bool]:
    """Shared QueuePool settings for the WMS and ERP engines."""
    settings = get_settings()
    return {
        "pool_pre_ping": True,
        "pool_size": settings.db_pool_size,
        "max_overflow": settings.db_pool_max_overflow,
        "pool_recycle": settings.db_pool_recycle,
    }


@lru_cache
def get_engine() -> Engine:
    return create_engine(get_settings().wms_database_url, **engine_kwargs())


@lru_cache
def get_sessionmaker() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), expire_on_commit=False)


@contextmanager
def session_scope() -> Iterator[Session]:
    """One transaction: commit on success, roll back on any exception, then close.

    Same rules as get_session, for MySQL work that should not span the whole request.
    """
    session = get_sessionmaker()()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_session() -> Iterator[Session]:
    """One session per request: commit on success, roll back on any exception."""
    with session_scope() as session:
        yield session
