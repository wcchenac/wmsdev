"""history.childrenIdentifierId: TINYBLOB -> BLOB (defect 2).

The column holds a Java-serialized Long[] (106 + 14n bytes), shared with the Java
service. Hibernate's default TINYBLOB (255 bytes) ends at 10 children: an 11th made the
whole shrink fail (or, outside strict mode, was silently truncated). BLOB (65,535 bytes)
holds about 4,600. The serialization format is unchanged, so existing values stay valid
and the Java service keeps working on the widened column (as
contract-tests/java-patches/02-history-children-blob.patch maps it for new schemas).

Revision ID: 0002
Revises: 0001
"""

from alembic import op
from sqlalchemy import text
from sqlalchemy.engine import Connection

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE `history` MODIFY `childrenIdentifierId` BLOB")


def downgrade() -> None:
    bind = op.get_bind()
    too_long = bind.execute(
        text("SELECT COUNT(*) FROM `history` WHERE LENGTH(`childrenIdentifierId`) > 255")
    ).scalar()
    if too_long:
        raise RuntimeError(
            f"{too_long} history rows hold children lists longer than 255 bytes; "
            "TINYBLOB would cut them. Resolve those rows before downgrading."
        )
    _alter_to_tinyblob(bind)


def _alter_to_tinyblob(bind: Connection) -> None:
    """The ALTER itself refuses to cut a value: outside strict mode MySQL would silently
    truncate one written after the check above. The session's sql_mode is put back."""
    previous = bind.execute(text("SELECT @@SESSION.sql_mode")).scalar()
    bind.execute(text("SET SESSION sql_mode = CONCAT_WS(',', NULLIF(@@SESSION.sql_mode, ''), 'STRICT_ALL_TABLES')"))
    try:
        bind.execute(text("ALTER TABLE `history` MODIFY `childrenIdentifierId` TINYBLOB"))
    finally:
        bind.execute(text("SET SESSION sql_mode = :mode"), {"mode": previous})
