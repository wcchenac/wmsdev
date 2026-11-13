"""/api/file/* — report lookup, download and in-stock Excel import.

Every route needs ROLE_Operator or ROLE_Admin (class-level @PreAuthorize in
Java), checked inside the handler after request validation, as in the user router.
"""

from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse, Response

from app.files import reports
from app.security.auth import require_roles

router = APIRouter(prefix="/api/file")
ops_only = require_roles("ROLE_Operator", "ROLE_Admin")


@router.get("/query/{fileCategory}/today")
def query_today(fileCategory: str, request: Request) -> Response:
    ops_only(request)
    if fileCategory not in reports.DATED_LOOKUP:
        return Response(status_code=400)
    return PlainTextResponse(reports.find_today(fileCategory, reports.taipei_today()))


@router.get("/query/{fileCategory}/interval")
def query_interval(fileCategory: str, startDate: str, endDate: str, request: Request) -> object:
    ops_only(request)
    if fileCategory not in reports.DATED_LOOKUP:
        return Response(status_code=400)
    return reports.find_period(fileCategory, startDate, endDate)


@router.get("/query/categoryList")
def query_category_list(request: Request) -> list[dict[str, str]]:
    ops_only(request)
    return reports.list_categories()
