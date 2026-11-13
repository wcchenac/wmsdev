"""Expected values measured on Temurin 1.8.0_492 (2026-11-13)."""

import datetime as dt

import pytest

from app.javacompat import (
    deserialize_long_array,
    java_double_to_string,
    java_format_2f,
    java_hashmap_order,
    java_parse_double,
    java_parse_int,
    java_period_days,
    parse_client_datetime,
    serialize_long_array,
)


@pytest.mark.parametrize(
    ("keys", "expected"),
    [
        (["CF1001", "CF1002", "CF1003"], ["CF1002", "CF1003", "CF1001"]),
        (["CF1003", "CF1001"], ["CF1003", "CF1001"]),
        (["整支", "板卷", "雜項"], ["板卷", "整支", "雜項"]),
        (["ZZ0001", "CF1001", "CF1002", "CF1003", "AB12", "X", "CF9999"],
         ["CF1002", "CF1003", "CF1001", "X", "CF9999", "AB12", "ZZ0001"]),
        ([f"P{1000 + i * 37}" for i in range(20)],  # forces a resize 16 -> 32
         ["P1629", "P1407", "P1518", "P1703", "P1148", "P1555", "P1259", "P1666", "P1333", "P1037",
          "P1444", "P1111", "P1222", "P1296", "P1000", "P1074", "P1481", "P1185", "P1592", "P1370"]),
    ],
)
def test_hashmap_order(keys, expected):
    assert java_hashmap_order(keys) == expected


def test_hashmap_order_with_eight_keys_in_one_bucket():
    # Java treeifies only on a bucket's 9th node; 8 in one bucket is an ordinary list.
    keys = ["K1", "K0", "K70", "K81", "K92", "K2", "K101", "K112", "K123", "K134", "K3"]
    assert java_hashmap_order(keys) == ["K0", "K70", "K81", "K92", "K101", "K112", "K123", "K134", "K1", "K2", "K3"]


@pytest.mark.parametrize(
    ("text", "expected"),
    [("12", 12.0), (" 12 ", 12.0), ("12d", 12.0), ("2\n", 2.0), ("1e2", 100.0), (".5", 0.5), ("5.", 5.0),
     ("+3", 3.0), ("1f", 1.0), ("Infinity", float("inf"))],
)
def test_parse_double_accepts_java_grammar(text, expected):
    assert java_parse_double(text) == expected


@pytest.mark.parametrize("text", ["１２", "1_0", "nan", "0x10", "", "abc"])
def test_parse_double_rejects_what_java_rejects(text):
    with pytest.raises(ValueError):
        java_parse_double(text)


def test_parse_double_nan():
    assert java_parse_double("NaN") != java_parse_double("NaN")


@pytest.mark.parametrize(("text", "expected"), [("12", 12), ("１２", 12), ("+3", 3)])
def test_parse_int_accepts_java_grammar(text, expected):
    assert java_parse_int(text) == expected


@pytest.mark.parametrize("text", [" 12 ", "2\n", "12d", "1_0", "1e2", "5.", ""])
def test_parse_int_rejects_what_java_rejects(text):
    with pytest.raises(ValueError):
        java_parse_int(text)


def test_hashmap_order_ignores_repeated_keys():
    assert java_hashmap_order(["CF1003", "CF1001", "CF1003"]) == ["CF1003", "CF1001"]


@pytest.mark.parametrize(
    ("value", "expected"),
    [(0.125, "0.13"), (1.005, "1.01"), (2.675, "2.68"), (100 / 3, "33.33"), (-0.005, "-0.01"),
     (50.0, "50.00"), (0.1 + 0.2, "0.30")],
)
def test_format_2f(value, expected):
    assert java_format_2f(value) == expected


@pytest.mark.parametrize(
    ("value", "expected"),
    [(50.0, "50.0"), (25.5, "25.5"), (3.0, "3.0"), (0.001, "0.001"), (0.0001, "1.0E-4"), (1e7, "1.0E7"),
     (9999999.0, "9999999.0"), (12345678.9, "1.23456789E7"), (1e-5, "1.0E-5"), (100 / 3, "33.333333333333336")],
)
def test_double_to_string(value, expected):
    assert java_double_to_string(value) == expected


EMPTY = "aced0005757200115b4c6a6176612e6c616e672e4c6f6e673b7de10ab2bbbc632b020000787000000000"
SIX_SEVEN = "aced0005757200115b4c6a6176612e6c616e672e4c6f6e673b7de10ab2bbbc632b0200007870000000027372000e6a6176612e6c616e672e4c6f6e673b8be490cc8f23df0200014a000576616c7565787200106a6176612e6c616e672e4e756d62657286ac951d0b94e08b020000787000000000000000067371007e00020000000000000007"  # noqa: E501
BIG = "aced0005757200115b4c6a6176612e6c616e672e4c6f6e673b7de10ab2bbbc632b0200007870000000017372000e6a6176612e6c616e672e4c6f6e673b8be490cc8f23df0200014a000576616c7565787200106a6176612e6c616e672e4e756d62657286ac951d0b94e08b020000787000000045d964b800"  # noqa: E501


def test_long_array_roundtrip():
    assert serialize_long_array([]).hex() == EMPTY
    assert serialize_long_array([6, 7]).hex() == SIX_SEVEN
    assert serialize_long_array([300000000000]).hex() == BIG
    assert len(serialize_long_array([])) == 42 and len(serialize_long_array([6, 7])) == 134
    assert deserialize_long_array(bytes.fromhex(EMPTY)) == []
    assert deserialize_long_array(bytes.fromhex(SIX_SEVEN)) == [6, 7]
    assert deserialize_long_array(bytes.fromhex(BIG)) == [300000000000]


@pytest.mark.parametrize("text", ["2026-11-12T16:00:00", "2026-11-12T16:00", "2026-11-12T16:00:00.123"])
def test_parse_client_datetime_accepts(text):
    assert parse_client_datetime(text).replace(microsecond=0) == dt.datetime(2026, 11, 12, 16, 0, 0)


@pytest.mark.parametrize("text", ["2026-11-13", "2026-11-12T16:00:00Z", "x"])
def test_parse_client_datetime_rejects(text):
    with pytest.raises(ValueError):
        parse_client_datetime(text)


@pytest.mark.parametrize(
    ("start", "end", "days"),
    [(dt.date(2026, 1, 1), dt.date(2026, 2, 10), 9),
     (dt.date(2026, 1, 31), dt.date(2026, 3, 1), 1),
     (dt.date(2026, 11, 11), dt.date(2026, 11, 13), 2),
     (dt.date(2026, 11, 13), dt.date(2026, 11, 11), -2)],
)
def test_period_days(start, end, days):
    assert java_period_days(start, end) == days


def test_parse_long_range():
    from app.javacompat import java_parse_long

    assert java_parse_long("9223372036854775807") == 2**63 - 1
    for bad in ("9223372036854775808", "", " 3", "3,"):
        with pytest.raises(ValueError):
            java_parse_long(bad)
