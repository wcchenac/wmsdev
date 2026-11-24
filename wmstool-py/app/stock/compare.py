"""Daily WMS-vs-ERP stock comparison: port of CompareStockFunction.stockFullyComparison."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import erp
from app.erp import erp_text
from app.javacompat import java_format_2f, java_hashmap_order, java_parse_double, java_parse_int
from app.reports import comparison
from app.stock.models import Product
from app.stock.orders import type_name, unit_name
from app.timeconv import taipei_today

# {productNo: {type: {"quantity": str, "unit": str}}}, plus first-insertion key order
Erp = dict[str, dict[str, dict[str, str]]]


def _erp_totals() -> Erp:
    totals: Erp = {}
    for row in erp.product_cqty_unit():  # [PROD, GWN, CQTY, UNIT]
        type_ = type_name(erp_text(row[1]))
        if type_ == "":
            continue
        product_no, quantity, unit = erp_text(row[0]), erp_text(row[2]), java_parse_int(erp_text(row[3]))
        if unit == 3:  # 尺 -> 碼
            quantity, unit = java_format_2f(java_parse_double(quantity) / 3.0), 2
        elif unit == 7:  # 打 -> 個
            quantity, unit = java_format_2f(java_parse_double(quantity) * 12.0), 6
        by_type = totals.setdefault(product_no, {})
        if type_ not in by_type:
            by_type[type_] = {"quantity": quantity, "unit": unit_name(str(unit))}
        else:
            entry = by_type[type_]
            entry["quantity"] = java_format_2f(java_parse_double(entry["quantity"]) + java_parse_double(quantity))
    return totals


def wms_products(session: Session) -> list[tuple[str, str, str | None, str]]:
    """Product rows for the comparison, copied out so the session can close first."""
    return [(p.productNo or "", p.type or "", p.quantity, p.unit or "")
            for p in session.scalars(select(Product).order_by(Product.id))]


def comparison_rows_from(products: list[tuple[str, str, str | None, str]]) -> list[list[str | None]]:
    erp_totals = _erp_totals()
    # HashMaps never shrink: the leftover iteration order is the order over every key ever
    # inserted, minus the removed ones. Exact for list bins; a treeified bin (9+ colliding
    # product codes, practically never) can reorder on remove (moveRootToFront), which is
    # not modelled: those few leftover rows could then come out in another order.
    outer_order = java_hashmap_order(erp_totals)
    inner_order = {p: java_hashmap_order(types) for p, types in erp_totals.items()}
    remaining = {p: dict(types) for p, types in erp_totals.items()}
    rows: list[list[str | None]] = []
    for product_no, type_, wms_qty, unit in products:
        erp_entry = remaining.get(product_no, {}).get(type_)
        if erp_entry is not None:
            erp_qty = erp_entry["quantity"]
            row = [product_no, type_, erp_qty, wms_qty, unit]
            if wms_qty is None:
                # Nothing to compare: a Fail row with blank WMS quantity and difference
                # (defect 7 fixed, as in contract-tests/java-patches/07-stock-compare-null-
                # quantity.patch); Java's Double.parseDouble(null) failed the whole comparison.
                row += ["Fail", None]
            else:
                diff = java_parse_double(wms_qty) - java_parse_double(erp_qty)
                row += ["Pass"] if java_format_2f(abs(diff)) == "0.00" else ["Fail", java_format_2f(diff)]
            del remaining[product_no][type_]
            if not remaining[product_no]:
                del remaining[product_no]
        else:  # a NULL quantity is written as a blank cell, as Java does
            row = [product_no, type_, "", wms_qty, unit, "Fail", wms_qty]
        rows.append(row)
    for product_no in outer_order:
        for type_ in inner_order[product_no]:
            entry = remaining.get(product_no, {}).get(type_)
            if entry is None or type_ == "雜項":
                continue
            quantity = java_parse_double(entry["quantity"])
            if quantity != 0:
                rows.append([product_no, type_, entry["quantity"], "", entry["unit"], "Fail",
                             java_format_2f(quantity * -1)])
    return rows


def comparison_rows(session: Session) -> list[list[str | None]]:
    return comparison_rows_from(wms_products(session))


def write_stock_comparison(products: list[tuple[str, str, str | None, str]]) -> None:
    """ERP totals and the workbook. The caller has already closed the MySQL session."""
    rows = comparison_rows_from(products)
    path = comparison.create(taipei_today())
    comparison.append(path, rows)


def stock_full_comparison(session: Session) -> None:
    """Compare first, then replace today's report with the result (defect 6 fixed, as in
    contract-tests/java-patches/06-stock-compare-write-after-compare.patch): a failing
    comparison keeps today's earlier report, and a failure while writing reaches the
    caller (400). Java reset the report before comparing and swallowed write failures.
    A write that fails midway can still leave a partly written report."""
    rows = comparison_rows(session)
    path = comparison.create(taipei_today())
    comparison.append(path, rows)
