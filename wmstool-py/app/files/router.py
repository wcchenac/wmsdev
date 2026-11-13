"""/api/file/* — report lookup, download and in-stock Excel import.

Every route needs ROLE_Operator or ROLE_Admin (class-level @PreAuthorize in
Java), checked inside the handler after request validation, as in the user router.
"""

import logging

from fastapi import APIRouter, File, Request, UploadFile
from fastapi.responses import PlainTextResponse, Response

from app.db import get_sessionmaker
from app.files import reports
from app.files.importer import ImportParseError, read_import_workbook
from app.security.auth import require_roles
from app.stock.intake import create_stock_infoes
from app.timeconv import taipei_today

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/file")
ops_only = require_roles("ROLE_Operator", "ROLE_Admin")


@router.get("/download/{fileCategory}/{fileName:path}")
def download(fileCategory: str, fileName: str, request: Request) -> Response:
    ops_only(request)
    path = reports.resolve_download(fileCategory, fileName)
    if path is None:
        return Response(status_code=400)
    # Tomcat writes headers as ISO-8859-1: characters outside it become '?'.
    header_name = path.name.encode("latin-1", "replace").decode("latin-1")
    return Response(
        content=path.read_bytes(),
        media_type=reports.MIME,
        headers={"Content-Disposition": f"attachment; filename={header_name}"},
    )


@router.post("/import/inStockFile")
def import_in_stock_file(request: Request, files: list[UploadFile] | None = File(None)) -> Response:
    """Each file is its own transaction, as in Java (FileService is @Transactional):
    unreadable files are skipped; a failure inside stock intake rolls that file
    back and answers 400, leaving later files unprocessed."""
    principal = ops_only(request)
    if files is None:
        raise RuntimeError("Current request is not a multipart request")  # Java answers 500
    for upload in files:
        try:
            items = read_import_workbook(upload.file.read())
        except ImportParseError:
            logger.warning("skipping unreadable import file %s", upload.filename, exc_info=True)
            continue
        with get_sessionmaker()() as session:
            try:
                create_stock_infoes(session, items, principal.full_name)
                session.commit()
            except Exception:
                session.rollback()
                logger.exception("stock intake failed for import file %s", upload.filename)
                return Response(status_code=400)
    return Response(status_code=200)


@router.get("/query/{fileCategory}/today")
def query_today(fileCategory: str, request: Request) -> Response:
    ops_only(request)
    if fileCategory not in reports.DATED_LOOKUP:
        return Response(status_code=400)
    return PlainTextResponse(reports.find_today(fileCategory, taipei_today()))


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
