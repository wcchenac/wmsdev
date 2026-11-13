"""/api/stock/* — ported from StockController.

Role checks run inside each handler after request validation (Spring order).
Handlers whose Java counterpart wraps the call in try/catch answer 400 on any
error and roll back; everything else lets exceptions reach the 500 handler,
which also rolls the request's transaction back (get_session).
"""

import logging

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, PlainTextResponse, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_session
from app.security.auth import require_roles
from app.stock import moves
from app.stock.intake import InStockItem, create_stock_infoes
from app.stock.serializers import history_json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/stock")
ops = require_roles("ROLE_Operator", "ROLE_Admin")
admin = require_roles("ROLE_Admin")


def _bad_request(session: Session, what: str) -> Response:
    session.rollback()
    logger.exception("%s failed", what)
    return Response(status_code=400)


def _blank(value: object) -> bool:
    # Bean Validation @NotBlank: null, or only characters <= U+0020 (Java trim()).
    return value is None or (isinstance(value, str) and value.strip("".join(chr(c) for c in range(0x21))) == "")


def constraint_violations(items: list[BaseModel], param: str, messages: dict[str, str]) -> dict[str, str]:
    """`List<@Valid T>` on a @Validated controller -> ConstraintViolationException, which
    CustomResponseEntityExceptionHandler turns into {"<param>[i].<field>": "<message>"} (400)."""
    errors = {}
    for i, item in enumerate(items):
        for field, message in messages.items():
            if _blank(getattr(item, field)):
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
            outStockReason=self.outStockReason,
        )


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
