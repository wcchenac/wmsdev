"""Alembic environment. The URL is the one set on the Config (tests) or WMS_DATABASE_URL."""

from alembic import context
from sqlalchemy import create_engine

config = context.config


def _url() -> str:
    url = config.get_main_option("sqlalchemy.url")
    if url:
        return url
    from app.config import get_settings

    return get_settings().wms_database_url


def run_migrations_online() -> None:
    engine = create_engine(_url())
    with engine.connect() as connection:
        context.configure(connection=connection)
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()


run_migrations_online()
