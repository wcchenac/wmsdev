"""Product totals: StockServiceUtilities.contentCollector / updateProductQuantity(WithList)."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.javacompat import java_format_2f, java_hashmap_order, java_parse_double
from app.stock.models import Product
from app.timeconv import java_now_utc

UNCATEGORISED = "未分類"

# {productNo: {type: {"quantity": str, "unit": str}}}
Totals = dict[str, dict[str, dict[str, str]]]


def collect(totals: Totals, product_no: str, type_: str, quantity: str, unit: str) -> None:
    """contentCollector: skips type "", sums repeats with %.2f, keeps a single value as given."""
    if type_ == "":
        return
    by_type = totals.setdefault(product_no, {})
    if type_ not in by_type:
        by_type[type_] = {"quantity": quantity, "unit": unit}
    else:
        entry = by_type[type_]
        entry["quantity"] = java_format_2f(java_parse_double(entry["quantity"]) + java_parse_double(quantity))


def update_product_quantity(session: Session, product_no: str, type_: str, quantity: str, unit: str) -> None:
    """updateProductQuantity: add to an existing (productNo, type) row, else insert it uncategorised.

    A stored total that is not a number fails the whole request, as in Java: NULL is
    a NullPointerException, "" a NumberFormatException (java_parse_double raises).
    Reading it as 0 would silently overwrite the total with this change alone."""
    existing = session.scalar(select(Product).where(Product.productNo == product_no, Product.type == type_))
    now = java_now_utc()
    if existing is not None:
        if existing.quantity is None:
            raise TypeError(f"product {product_no} {type_} has a NULL quantity (Java: NullPointerException)")
        existing.quantity = java_format_2f(java_parse_double(quantity) + java_parse_double(existing.quantity))
        existing.updatedAt = now
    else:
        session.add(Product(productNo=product_no, type=type_, quantity=quantity, unit=unit,
                            category=UNCATEGORISED, isBypass=False, isAlert=False, createdAt=now))
    session.flush()


def apply_totals(session: Session, totals: Totals) -> None:
    """updateProductQuantityWithList, walking the nested HashMaps in Java order."""
    for product_no in java_hashmap_order(totals):
        for type_ in java_hashmap_order(totals[product_no]):
            entry = totals[product_no][type_]
            update_product_quantity(session, product_no, type_, entry["quantity"], entry["unit"])
