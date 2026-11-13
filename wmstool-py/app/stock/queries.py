"""Read-side ports of QueryStockFunction."""

from typing import Any

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app import erp
from app.erp import erp_text
from app.javacompat import java_parse_int
from app.stock.models import Product, StockIdentifier, StockInfo
from app.stock.orders import empty_product_information, null_value
from app.stock.serializers import product_json, stock_info_json

ADD_TYPES = {0: "無", 1: "可追加", 2: "不可追加", 3: "暫缺貨", 4: "無貨"}


def _info_for(session: Session, identifier_id: int) -> StockInfo:
    info = session.scalars(select(StockInfo).where(StockInfo.stockIdentifier_id == identifier_id)).first()
    if info is None:
        raise LookupError(f"no stockinfo for identifier {identifier_id} (Java: Optional.get())")
    return info


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


def product_overview(session: Session, product_no: str, basic: bool) -> dict[str, Any]:
    """QueryProductNoResponse for queryStock/query/{1|2}/{productNo} (productNo already upper-cased)."""
    identifiers = session.scalars(select(StockIdentifier).where(
        StockIdentifier.productNo == product_no, StockIdentifier.isExist == True)  # noqa: E712
        .order_by(StockIdentifier.id)).all()
    result = [stock_info_json(_info_for(session, si.id)) for si in identifiers]
    information = _product_information(product_no, basic)
    product_list = [product_json(p) for p in session.scalars(
        select(Product).where(Product.productNo == product_no).order_by(Product.id))]
    prev, nxt = _near_by(session, product_no)
    return {"nextProduct": nxt, "prevProduct": prev, "result": result, "information": information,
            "productList": product_list}
