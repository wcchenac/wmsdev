"""Read-side ports of QueryStockFunction."""

import datetime as dt
from typing import Any

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app import erp
from app.erp import erp_text
from app.javacompat import java_hashmap_order, java_parse_int, java_period_days
from app.stock.lookup import one
from app.stock.models import InStockOrderRecord, OutStockRequest, Product, StockIdentifier, StockInfo
from app.stock.orders import empty_product_information, null_value
from app.stock.serializers import out_stock_request_json, product_json, stock_info_json
from app.timeconv import client_param_to_db, db_to_taipei, taipei_to_db, taipei_today

ADD_TYPES = {0: "無", 1: "可追加", 2: "不可追加", 3: "暫缺貨", 4: "無貨"}


def _info_for(session: Session, identifier_id: int) -> StockInfo:
    """findByStockIdentifierId: missing is an error, and so is a second row."""
    return one(session, select(StockInfo).where(StockInfo.stockIdentifier_id == identifier_id))


def _product_information(product_no: str, basic: bool) -> dict[str, Any]:
    rows = erp.basic_product_info(product_no) if basic else erp.product_info(product_no)
    info = empty_product_information()
    if not rows:
        return info
    c = rows[0]

    def s(i: int) -> str:
        return null_value(erp_text(c[i]))

    add_type = ADD_TYPES.get(java_parse_int(erp_text(c[5 if basic else 9])), "")
    if basic:  # [CODE, CNAME, SPEC, DESCRIP, PACKDESC, ADDTYPE, PICTURE, CCCCODE, ENAME, ESPEC]
        info.update(productNo=s(0), cName=s(1), spec=s(2), descrip=s(3), packDesc=s(4), addType=add_type,
                    picture=s(6), cCCCODE=s(7), eNAME=s(8), eSPEC=s(9))
    else:  # [..., SUPP, SUPPNAME, PRODDESC, USERFIELD1, PACKDESC, ADDTYPE, PICTURE, CCOST, CLAS, CCCCODE, ENAME, ESPEC]
        info.update(productNo=s(0), cName=s(1), spec=s(2), descrip=s(3), supp=s(4), suppName=s(5), prodDesc=s(6),
                    userField1=s(7), packDesc=s(8), addType=add_type, picture=s(10), cCost=s(11), cCCCODE=s(13),
                    eNAME=s(14), eSPEC=s(15))
    return info


def _near_by(session: Session, product_no: str) -> tuple[str | None, str | None]:
    """nearByProductNo, including Java's quirk: an unknown productNo (index -1) gets the first product as next."""
    products = [r[0] for r in session.execute(text("Select Distinct productNo From product Order By productNo;"))]
    target = products.index(product_no) if product_no in products else -1
    prev = None if target - 1 < 0 else products[target - 1]
    nxt = None if target + 1 > len(products) - 1 else products[target + 1]
    return prev, nxt


def product_information(product_no: str, basic: bool) -> dict[str, Any]:
    """ERP product card. Called after the MySQL session for the query is closed."""
    return _product_information(product_no, basic)


def product_overview_db(session: Session, product_no: str) -> dict[str, Any]:
    """The MySQL half of a product query. ERP product information is added afterwards,
    so the connection is not held while SQL Server answers."""
    identifiers = session.scalars(select(StockIdentifier).where(
        StockIdentifier.productNo == product_no, StockIdentifier.isExist == True)  # noqa: E712
        .order_by(StockIdentifier.id)).all()
    result = [stock_info_json(_info_for(session, si.id)) for si in identifiers]
    product_list = [product_json(p) for p in session.scalars(
        select(Product).where(Product.productNo == product_no).order_by(Product.id))]
    prev, nxt = _near_by(session, product_no)
    return {"nextProduct": nxt, "prevProduct": prev, "result": result, "productList": product_list}


def product_overview(session: Session, product_no: str, basic: bool) -> dict[str, Any]:
    """QueryProductNoResponse for queryStock/query/{1|2}/{productNo} (productNo already upper-cased)."""
    payload = product_overview_db(session, product_no)
    payload["information"] = _product_information(product_no, basic)
    return payload


def wait_to_shrink_list(session: Session) -> list[dict[str, Any]]:
    """getWaitToShrinkList: rolls marked waitToShrink that still exist."""
    identifiers = session.scalars(select(StockIdentifier).where(
        StockIdentifier.waitToShrink == True, StockIdentifier.isExist == True)  # noqa: E712
        .order_by(StockIdentifier.id)).all()
    return [stock_info_json(_info_for(session, si.id)) for si in identifiers]


def in_stock_rollback_list(session: Session, order_type: str, order_no: str) -> dict[str, list[dict[str, Any]]]:
    """getInStockRollbackList: the order's in-stocked rolls grouped by productNo (Java HashMap order)."""
    grouped: dict[str, list[dict[str, Any]]] = {}
    for record in session.scalars(select(InStockOrderRecord).where(
            InStockOrderRecord.inStockType == order_type, InStockOrderRecord.inStockOrderNo == order_no)
            .order_by(InStockOrderRecord.id)):
        grouped.setdefault(record.productNo or "", []).append(
            stock_info_json(_info_for(session, record.stockIdentifierId or 0)))
    return {k: grouped[k] for k in java_hashmap_order(grouped)}


def category_detail_data(session: Session, category: str) -> tuple[list[tuple], dict[str, dict[str, dict[str, str]]]]:
    """MySQL rows for the category report. ERP supplier info is loaded after this."""
    from app.javacompat import java_format_2f, java_parse_double

    stock_rows = [tuple(r) for r in session.execute(
        text("SELECT * FROM wms.categorydetail WHERE category= :c"), {"c": category})]
    sales: dict[str, dict[str, dict[str, str]]] = {}
    for r in session.execute(text("SELECT * FROM wms.salerecords WHERE category = :c"), {"c": category}):
        product_no, reason, quantity, unit = str(r[0]), str(r[1]), str(r[2]), str(r[3])
        by_reason = sales.setdefault(product_no, {})
        if reason not in by_reason:
            by_reason[reason] = {"quantity": quantity, "unit": unit}
        else:
            entry = by_reason[reason]
            entry["quantity"] = java_format_2f(java_parse_double(entry["quantity"]) + java_parse_double(quantity))
    return stock_rows, sales


def write_category_detail(category: str, stock_rows: list[tuple],
                          sales: dict[str, dict[str, dict[str, str]]]) -> str:
    """ERP supplier info and the workbook. No MySQL."""
    from app.reports import category as category_report

    info = {erp_text(r[0]): [erp_text(v) for v in r[1:6]] for r in erp.product_info_for_class(category)}
    return category_report.write(category, stock_rows, info, sales)


def category_detail_report(session: Session, category: str) -> str:
    """findCategoryDetails: rolls of the category (MySQL), supplier info (ERP), sales summary."""
    stock_rows, sales = category_detail_data(session, category)
    return write_category_detail(category, stock_rows, sales)


def _label_value(value: str | None) -> dict[str, str | None]:
    return {k: value for k in java_hashmap_order(["label", "value"])}


def category_list(session: Session) -> list[dict[str, str | None]]:
    rows = session.execute(text("Select Distinct category From product Order By category"))
    return [_label_value(r[0]) for r in rows]


def _handle_list(requests: list[OutStockRequest], groups: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    users = java_hashmap_order(r.createdBy or "" for r in requests)  # a HashSet of createdBy
    return {"userList": users, "queryResult": {k: groups[k] for k in java_hashmap_order(groups)}}


def _live_requests(session: Session, *conditions: Any) -> list[OutStockRequest]:
    return list(session.scalars(select(OutStockRequest).where(
        OutStockRequest.isDeleted == False, *conditions)  # noqa: E712
        .order_by(OutStockRequest.productNo, OutStockRequest.type)))


def wait_handle_today(session: Session) -> dict[str, Any]:
    """getOutStockWaitHandleList: requests created after today's Taipei midnight."""
    today = taipei_today()
    midnight_utc = taipei_to_db(dt.datetime.combine(today, dt.time.min))
    requests = _live_requests(session, OutStockRequest.createdAt > midnight_utc)
    return _handle_list(requests, {today.isoformat(): [out_stock_request_json(r) for r in requests]})


def wait_handle_interval(session: Session, start: str, end: str) -> dict[str, Any]:
    """getOutStockWaitHandleListWithTimeInterval, including Period.getDays() for the day keys."""
    start_db, end_db = client_param_to_db(start), client_param_to_db(end)
    start_taipei, end_taipei = db_to_taipei(start_db), db_to_taipei(end_db)
    assert start_taipei is not None and end_taipei is not None
    start_day, end_day = start_taipei.date(), end_taipei.date()  # = Java's start + 8h
    requests = _live_requests(session, OutStockRequest.createdAt.between(start_db, end_db))
    groups: dict[str, list[dict[str, Any]]] = {}
    for i in range(java_period_days(start_day, end_day) + 1):
        day = start_day + dt.timedelta(days=i)
        groups[day.isoformat()] = [out_stock_request_json(r) for r in requests
                                   if (t := db_to_taipei(r.createdAt)) is not None and t.date() == day]
    return _handle_list(requests, groups)
