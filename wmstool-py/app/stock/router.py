"""/api/stock/* — ported from StockController.

Role checks run inside each handler after request validation (Spring order).
Handlers whose Java counterpart wraps the call in try/catch answer 400 on any
error and roll back; everything else lets exceptions reach the 500 handler,
which also rolls the request's transaction back (get_session).
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, PlainTextResponse, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_session
from app.javacompat import java_is_blank
from app.security.auth import require_roles
from app.stock import compare, history, moves, orders, queries, shrink
from app.stock.intake import InStockItem, create_stock_infoes
from app.stock.serializers import history_json, out_stock_request_json
from app.users.schemas import NotBlank

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/stock")
ops = require_roles("ROLE_Operator", "ROLE_Admin")
admin = require_roles("ROLE_Admin")


def _bad_request(session: Session, what: str) -> Response:
    session.rollback()
    logger.exception("%s failed", what)
    return Response(status_code=400)


def constraint_violations(items: list[BaseModel], param: str, messages: dict[str, str]) -> dict[str, str]:
    """`List<@Valid T>` on a @Validated controller -> ConstraintViolationException, which
    CustomResponseEntityExceptionHandler turns into {"<param>[i].<field>": "<message>"} (400)."""
    errors = {}
    for i, item in enumerate(items):
        for field, message in messages.items():
            if java_is_blank(getattr(item, field)):
                errors[f"{param}[{i}].{field}"] = message
    return errors


IN_STOCK_MESSAGES = {"productNo": "貨號不可空白", "type": "型態不可空白", "quantity": "長度不可空白"}


class InStockRequest(BaseModel):
    productNo: str | None = None
    lotNo: str | None = None
    type: str | None = None
    quantity: str | None = None
    unit: str | None = None
    color: int = 0
    defect: str | None = None
    record: str | None = None
    remark: str | None = None
    inStockType: str | None = None
    orderNo: str | None = None
    directShip: bool = False
    outStockReason: str | None = None
    parentId: int = 0  # used by the shrink in-stock path (part 2)

    def to_item(self) -> InStockItem:
        assert self.productNo is not None and self.type is not None and self.quantity is not None  # validated
        return InStockItem(
            productNo=self.productNo, lotNo=self.lotNo, type=self.type, quantity=self.quantity, unit=self.unit,
            color=self.color, defect=self.defect, record=self.record, remark=self.remark,
            inStockType=self.inStockType, orderNo=self.orderNo, directShip=self.directShip,
            outStockReason=self.outStockReason, parentId=self.parentId,
        )


class ShrinkStockRequest(BaseModel):
    oldStockIdentifierId: int = 0
    inStockRequests: list[InStockRequest] = []  # no @Valid on this list in Java
    allocation: float | None = None
    adjustment: float | None = None
    shrinkType: str | None = None


class UpdateInfoRequest(BaseModel):
    id: int | None = None
    color: int = 0
    defect: str | None = None
    record: str | None = None
    remark: str | None = None


@router.post("/inStocks")
def in_stocks(body: list[InStockRequest], request: Request, session: Session = Depends(get_session)) -> Response:
    errors = constraint_violations(body, "inStockRequests", IN_STOCK_MESSAGES)
    if errors:
        return JSONResponse(errors, status_code=400)
    principal = ops(request)
    try:
        create_stock_infoes(session, [b.to_item() for b in body], principal.full_name)
    except Exception:
        return _bad_request(session, "inStocks")
    return Response(status_code=200)


@router.post("/shrinkStock")
def shrink_stock(body: ShrinkStockRequest, request: Request, session: Session = Depends(get_session)) -> Response:
    principal = ops(request)
    try:
        report_writes = shrink.shrink_stock(session, shrink.ShrinkRequest(
            old_identifier_id=body.oldStockIdentifierId, pieces=[r.to_item() for r in body.inStockRequests],
            allocation=body.allocation, adjustment=body.adjustment, shrink_type=body.shrinkType,
        ), principal.full_name)
        session.commit()
    except Exception:
        return _bad_request(session, "shrinkStock")
    # Reports only after the commit. A failed write keeps the shrink and answers 400,
    # which is what Java does (javax @Transactional commits on its IOException).
    try:
        for write in report_writes:
            write()
    except Exception:
        logger.exception("shrink %s committed but a report write failed; rewrite the report by hand",
                         body.oldStockIdentifierId)
        return Response(status_code=400)
    return Response(status_code=200)


@router.patch("/shrinkStock/rollback/{stockIdentifierId}")
def shrink_stock_rollback(stockIdentifierId: int, request: Request,
                          session: Session = Depends(get_session)) -> Response:
    principal = admin(request)
    shrink.rollback_shrink(session, stockIdentifierId, principal.full_name)  # Java ignores the result
    return Response(status_code=200)


@router.get("/queryStock/shrinkRollback/{productNo}")
def shrink_rollback_list(productNo: str, request: Request, session: Session = Depends(get_session)) -> Response:
    ops(request)
    return JSONResponse(history.shrink_rollback_candidates(session, productNo.upper()))


class OutStockUpdateRequest(BaseModel):
    outStockUpdate: dict[int, str | None] = {}


@router.patch("/outStock/update")
def out_stock_update(body: OutStockUpdateRequest, request: Request,
                     session: Session = Depends(get_session)) -> Response:
    principal = ops(request)
    try:
        moves.handle_out_stock_requests(session, dict(body.outStockUpdate), principal.full_name)
    except Exception:
        return _bad_request(session, "outStock/update")
    return Response(status_code=200)


@router.get("/stockManagement/daily/stockCompare")
def daily_stock_compare(request: Request, session: Session = Depends(get_session)) -> Response:
    admin(request)
    try:
        compare.stock_full_comparison(session)
    except Exception:
        return _bad_request(session, "stockCompare")
    return Response(status_code=200)


@router.patch("/inStocks/rollback")
def in_stocks_rollback(body: list[int], request: Request, session: Session = Depends(get_session)) -> Response:
    admin(request)
    moves.rollback_in_stock(session, body)  # Java ignores the boolean result
    return Response(status_code=200)


@router.patch("/updateStock")
def update_stock(body: UpdateInfoRequest, request: Request, session: Session = Depends(get_session)) -> Response:
    principal = ops(request)
    if body.id is None:
        raise moves.NotFound("id is null")
    product_no = moves.update_stock_info(session, body.id, body.color, body.defect, body.record, body.remark,
                                         principal.full_name)
    return PlainTextResponse(product_no)


@router.patch("/queryStock/updateHistory")
def update_history(id: int, childs: str, request: Request, session: Session = Depends(get_session)) -> Response:
    admin(request)
    try:
        history = moves.update_history(session, id, childs)
    except Exception:
        return _bad_request(session, "updateHistory")
    return JSONResponse(history_json(history))


@router.get("/queryOrder/{orderType}/{orderNo}")
def query_order(orderType: str, orderNo: str, request: Request, session: Session = Depends(get_session)) -> Response:
    require_roles("ROLE_Normal", "ROLE_Operator", "ROLE_Admin")(request)
    if orderType == "outStockToStore":
        return JSONResponse(orders.out_stock_to_store_order(orderNo))
    if orderType not in orders.ORDER_TYPES:
        return Response(status_code=400)
    return JSONResponse(orders.query_order(session, orderType, orderNo))


@router.get("/queryStock/query/2/{productNo}")
def query_product_basic(productNo: str, request: Request, session: Session = Depends(get_session)) -> Response:
    require_roles("ROLE_Normal", "ROLE_Sales", "ROLE_Operator", "ROLE_Admin")(request)
    return JSONResponse(queries.product_overview(session, productNo.upper(), basic=True))


@router.get("/queryStock/query/1/{productNo}")
def query_product_detail(productNo: str, request: Request, session: Session = Depends(get_session)) -> Response:
    require_roles("ROLE_Sales", "ROLE_Operator", "ROLE_Admin")(request)
    return JSONResponse(queries.product_overview(session, productNo.upper(), basic=False))


@router.get("/stockManagement/weekly/syncProductCategory")
def sync_product_category(request: Request, session: Session = Depends(get_session)) -> Response:
    admin(request)
    try:
        orders.sync_product_category(session)
    except Exception:
        return _bad_request(session, "syncProductCategory")
    return Response(status_code=200)


@router.get("/queryStock/shrinkList")
def shrink_list(request: Request, session: Session = Depends(get_session)) -> Response:
    ops(request)
    return JSONResponse(queries.wait_to_shrink_list(session))


@router.get("/queryStock/inStockRollback")
def in_stock_rollback_list(orderType: str, orderNo: str, request: Request,
                           session: Session = Depends(get_session)) -> Response:
    admin(request)
    return JSONResponse(queries.in_stock_rollback_list(session, orderType, orderNo))


@router.get("/queryStock/categoryList")
def category_list(request: Request, session: Session = Depends(get_session)) -> Response:
    admin(request)
    try:
        return JSONResponse(queries.category_list(session))
    except Exception:
        return _bad_request(session, "categoryList")


@router.get("/queryStock/category/{category}")
def category_detail(category: str, request: Request, session: Session = Depends(get_session)) -> Response:
    admin(request)
    try:
        queries.category_detail_report(session, category)
    except Exception:
        return _bad_request(session, "category detail")
    return Response(status_code=200)


@router.get("/queryStock/history/{productNo}")
def history_route(productNo: str, request: Request, startDate: str | None = None, endDate: str | None = None,
                  id: int | None = None, session: Session = Depends(get_session)) -> Response:
    """Java maps history/{productNo} (tree) and history/{id} (structure) to the same
    path and answers 500 for both. Fixed as in contract-tests/java-patches: the
    query parameters pick the handler, before authorization (Spring's order)."""
    is_tree = startDate is not None and endDate is not None
    is_structure = id is not None
    if is_tree and is_structure:
        raise RuntimeError("Ambiguous handler methods")  # both params conditions match -> 500
    if is_tree:
        assert startDate is not None and endDate is not None
        require_roles("ROLE_Sales", "ROLE_Operator", "ROLE_Admin")(request)
        return JSONResponse(history.period_trees(session, productNo.upper(), startDate, endDate))
    if is_structure:
        assert id is not None
        admin(request)
        try:
            return PlainTextResponse(history.structure_gson(session, id))
        except Exception:
            return _bad_request(session, "history structure")
    return Response(status_code=400)  # no mapping's params condition is met


@router.get("/outStock/waitHandleList/basic")
def wait_handle_basic(request: Request, session: Session = Depends(get_session)) -> Response:
    ops(request)
    return JSONResponse(queries.wait_handle_today(session))


@router.get("/outStock/waitHandleList/interval")
def wait_handle_interval(startDate: str, endDate: str, request: Request,
                         session: Session = Depends(get_session)) -> Response:
    ops(request)
    return JSONResponse(queries.wait_handle_interval(session, startDate, endDate))


class ShipRequest(BaseModel):
    stockIdentifierId: int = 0
    reason: str | None = None


class ValidShipRequest(ShipRequest):
    reason: NotBlank  # type: ignore[assignment]  # @Valid @RequestBody: a blank reason is a plain 400


@router.patch("/shipStock")
def ship_stock(body: ValidShipRequest, request: Request, session: Session = Depends(get_session)) -> Response:
    principal = ops(request)
    moves.ship_identifier(session, body.stockIdentifierId, body.reason, principal.full_name)
    return Response(status_code=200)


@router.patch("/shipStocks")
def ship_stocks(body: list[ShipRequest], request: Request, session: Session = Depends(get_session)) -> Response:
    errors = constraint_violations(body, "shipRequests", {"reason": "原因不可空白"})
    if errors:
        return JSONResponse(errors, status_code=400)
    principal = ops(request)
    for ship in body:  # any failure propagates: the whole request rolls back (500)
        moves.ship_identifier(session, ship.stockIdentifierId, ship.reason, principal.full_name)
    return Response(status_code=200)


@router.patch("/shipStock/rollback/{stockIdentifierId}")
def ship_stock_rollback(stockIdentifierId: int, request: Request, session: Session = Depends(get_session)) -> Response:
    principal = ops(request)
    moves.unship_identifier(session, stockIdentifierId, principal.full_name)
    return Response(status_code=200)


@router.patch("/waitToShrink/{stockIdentifierId}")
def wait_to_shrink(stockIdentifierId: int, request: Request, session: Session = Depends(get_session)) -> Response:
    principal = ops(request)
    return PlainTextResponse(moves.mark_wait_to_shrink(session, stockIdentifierId, principal.full_name))


@router.patch("/waitToShrink/rollback/{stockIdentifierId}")
def wait_to_shrink_rollback(stockIdentifierId: int, request: Request,
                            session: Session = Depends(get_session)) -> Response:
    principal = ops(request)
    moves.unmark_wait_to_shrink(session, stockIdentifierId, principal.full_name)
    return Response(status_code=200)


@router.post("/outStock")
def out_stock(body: dict[str, Any], request: Request, session: Session = Depends(get_session)) -> Response:
    principal = ops(request)
    created = moves.create_out_stock_request(session, body, principal.full_name)
    return JSONResponse(out_stock_request_json(created))


@router.patch("/outStock/rollback/{outStockRequestId}")
def out_stock_rollback(outStockRequestId: int, request: Request, session: Session = Depends(get_session)) -> Response:
    principal = ops(request)
    moves.delete_out_stock_request(session, outStockRequestId, principal.full_name)
    return Response(status_code=200)
