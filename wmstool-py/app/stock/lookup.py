"""Spring Data single-result finders.

Java loads these rows with an Optional finder (`findBy...`) or `findById(..).get()`.
None is NoSuchElementException when the caller calls get(); more than one row is
IncorrectResultSizeDataAccessException. Here scalar() or first() would quietly keep
an arbitrary row, so the stock modules use these instead. No model imports: any
module can import this one without a cycle.
"""

from sqlalchemy.orm import Session


class NotFound(Exception):
    """Java: NoSuchElementException from Optional.get()."""


def one(session: Session, stmt):  # noqa: ANN001, ANN201
    """Exactly one row: none raises NotFound, more than one raises LookupError."""
    rows = session.scalars(stmt).all()
    if not rows:
        raise NotFound(str(stmt))
    if len(rows) > 1:
        raise LookupError(f"query did not return a unique result: {len(rows)}")
    return rows[0]


def at_most_one(session: Session, stmt):  # noqa: ANN001, ANN201
    """Optional finder: none is None, more than one raises LookupError."""
    rows = session.scalars(stmt).all()
    if len(rows) > 1:
        raise LookupError(f"query did not return a unique result: {len(rows)}")
    return rows[0] if rows else None
