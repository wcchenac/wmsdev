"""ERP order lookups and category sync: ports of QueryOrderFunction and
CompareStockFunction.syncProductCategory."""

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import erp
from app.erp import erp_text
from app.javacompat import java_format_2f, java_hashmap_order, java_parse_double, java_parse_int
from app.stock.models import InStockOrderRecord, Product
from app.timeconv import java_now_utc

UNITS = ["台", "支", "碼", "尺", "公斤", "公尺", "個", "打", "包", "箱", "件", "對", "本", "張", "才",
         "幅", "盒", "瓶", "磅", "批", "條", "筆", "雙", "公克", "次", "疊", "組"]
TYPES = {"AB": "板卷", "AC": "整支", "AD": "整支", "AE": "整支", "AP": "雜項"}
# QueryController order type -> (ERP query, EInstockType of the WMS records)
ORDER_TYPES = {
    "inStock": "normal",
    "assemble": "assemble",
    "customerReturn": "customerReturn",
    "storeReturn": "storeReturn",
}

Status = dict[str, dict[str, dict[str, str]]]


def unit_name(code: str) -> str:
    """unitMappingHelper: unitList[Integer.parseInt(code)]."""
    return UNITS[java_parse_int(code)]


def type_name(gwn: str) -> str:
    """typeMappingHelper: unknown warehouse codes map to ""."""
    return TYPES.get(gwn, "")


def null_value(text: str) -> str:
    """nullValueHelper: an empty ERP string reads 無資料."""
    return "無資料" if text == "" else text


def _convert(quantity: str, unit: str) -> tuple[str, str]:
    """QueryOrderFunction.quantityConvertor."""
    if unit == "尺":
        return java_format_2f(java_parse_double(quantity) / 3.0), "碼"
    if unit == "打":
        return str(java_parse_int(quantity) * 12), "個"
    return quantity, unit


def _collect(records: list[tuple[str, str, str, str | None]]) -> Status:
    """orderContentCollector over (productNo, type, quantity, unit)."""
    out: Status = {}
    for product_no, type_, quantity, unit in records:
        if type_ == "":
            continue
        quantity, unit = _convert(quantity, unit or "")
        by_type = out.setdefault(product_no, {})
        if type_ not in by_type:
            by_type[type_] = {"quantity": quantity, "unit": unit}
        else:
            entry = by_type[type_]
            entry["quantity"] = java_format_2f(java_parse_double(entry["quantity"]) + java_parse_double(quantity))
    return out


def _java_ordered(status: Status) -> Status:
    return {p: {t: status[p][t] for t in java_hashmap_order(status[p])} for p in java_hashmap_order(status)}


def _erp_records(order_type: str, order_no: str) -> list[tuple[str, str, str, str]]:
    if order_type == "inStock":  # [PROD, QTY, UNIT, GWN, BANQTY]
        return [(erp_text(r[0]), type_name(erp_text(r[3])),
                 java_format_2f(java_parse_double(erp_text(r[1])) + java_parse_double(erp_text(r[4]))),
                 unit_name(erp_text(r[2]))) for r in erp.in_stock_order(order_no)]
    if order_type == "assemble":  # [PROD, GWN, QTY, UNIT]
        return [(erp_text(r[0]), type_name(erp_text(r[1])), java_format_2f(java_parse_double(erp_text(r[2]))),
                 unit_name(erp_text(r[3]))) for r in erp.assemble_order(order_no)]
    rows = erp.customer_return_order(order_no) if order_type == "customerReturn" else erp.store_return_order(order_no)
    # [PROD, QTY, UNIT, GWN]
    return [(erp_text(r[0]), type_name(erp_text(r[3])), java_format_2f(java_parse_double(erp_text(r[1]))),
             unit_name(erp_text(r[2]))) for r in rows]


def query_order(session: Session, order_type: str, order_no: str) -> dict[str, Status]:
    current = _collect(_erp_records(order_type, order_no))
    records = session.scalars(select(InStockOrderRecord).where(
        InStockOrderRecord.inStockType == ORDER_TYPES[order_type],
        InStockOrderRecord.inStockOrderNo == order_no).order_by(InStockOrderRecord.id)).all()
    previous = _collect([(r.productNo or "", r.type, r.quantity or "", r.unit) for r in records])
    waiting = {p: {t: dict(v) for t, v in by_type.items()} for p, by_type in current.items()}
    for product_no, by_type in waiting.items():
        for type_, entry in by_type.items():
            if type_ in previous.get(product_no, {}):
                entry["quantity"] = java_format_2f(java_parse_double(entry["quantity"])
                                                   - java_parse_double(previous[product_no][type_]["quantity"]))
    return {"currentStatus": _java_ordered(current), "waitHandleStatus": _java_ordered(waiting)}


PRODUCT_INFORMATION_KEYS = ("productNo", "cName", "spec", "supp", "suppName", "prodDesc", "userField1", "descrip",
                            "packDesc", "addType", "picture", "cCost", "cCCCODE", "eNAME", "eSPEC")


def empty_product_information() -> dict[str, Any]:
    return dict.fromkeys(PRODUCT_INFORMATION_KEYS)


def out_stock_to_store_order(order_no: str) -> list[dict[str, Any]]:
    out = []
    for r in erp.out_stock_to_store_order(order_no):  # [PROD, CNAME, CCCCODE, SPEC, PACKDESC]
        info = empty_product_information()
        info.update(productNo=null_value(erp_text(r[0])), cName=null_value(erp_text(r[1])),
                    cCCCODE=null_value(erp_text(r[2])), spec=null_value(erp_text(r[3])),
                    packDesc=null_value(erp_text(r[4])))
        out.append(info)
    return out


def sync_product_category(session: Session) -> None:
    """Every product takes its ERP class (CLAS), or 未分類 when the ERP has none."""
    classes = {erp_text(code): erp_text(clas) for code, clas in erp.product_classes()}
    for product in session.scalars(select(Product).order_by(Product.id)):
        target = classes.get(product.productNo or "", "未分類")
        if product.category != target:
            product.category = target
            product.updatedAt = java_now_utc()
    session.flush()
