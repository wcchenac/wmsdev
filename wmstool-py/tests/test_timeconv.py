import datetime as dt

import pytest

from app.timeconv import (
    client_param_to_db,
    db_to_taipei,
    jackson_local_datetime,
    java_now_utc,
    taipei_to_db,
)


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (dt.datetime(2026, 3, 2, 0, 0, 0), [2026, 3, 2, 0, 0]),
        (dt.datetime(2026, 3, 2, 0, 0, 5), [2026, 3, 2, 0, 0, 5]),
        (dt.datetime(2026, 3, 2, 0, 0, 0, 123000), [2026, 3, 2, 0, 0, 0, 123000000]),
        (None, None),
    ],
)
def test_jackson_local_datetime(value, expected):
    assert jackson_local_datetime(value) == expected


def test_db_and_taipei_conversion():
    assert db_to_taipei(dt.datetime(2026, 3, 1, 16, 0)) == dt.datetime(2026, 3, 2, 0, 0)
    assert taipei_to_db(dt.datetime(2026, 3, 2, 0, 0)) == dt.datetime(2026, 3, 1, 16, 0)
    assert db_to_taipei(None) is None


def test_java_now_utc_is_millisecond_utc():
    now = java_now_utc()
    assert now.tzinfo is None and now.microsecond % 1000 == 0
    real = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)
    assert abs((real - now).total_seconds()) < 2


def test_client_param_to_db():
    assert client_param_to_db("2026-03-01T16:00:00") == dt.datetime(2026, 3, 1, 16, 0)
    with pytest.raises(ValueError):
        client_param_to_db("2026-03-01")
