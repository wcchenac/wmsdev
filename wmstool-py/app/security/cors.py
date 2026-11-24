"""CORS the way the Java service answers it.

Java: WebMvcConfig allows any origin for GET/POST/PATCH/DELETE, exposes
Content-Disposition, max-age 3600; StockController and FileController add
@CrossOrigin, whose default max-age (1800) wins on /api/stock and /api/file.
Preflights are answered before authentication (Spring's CorsFilter runs first).
"""

from starlette.datastructures import Headers, MutableHeaders
from starlette.responses import PlainTextResponse, Response
from starlette.types import ASGIApp, Message, Receive, Scope, Send

ALLOWED_METHODS = ("GET", "POST", "PATCH", "DELETE")
EXPOSED = "Content-Disposition"


def _max_age(path: str) -> str:
    return "1800" if path.startswith(("/api/stock/", "/api/file/")) else "3600"


class JavaCorsMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        headers = Headers(scope=scope)
        if "origin" not in headers:
            await self.app(scope, receive, send)
            return

        requested = headers.get("access-control-request-method")
        if scope["method"] == "OPTIONS" and requested is not None:
            await self._preflight(scope, headers, requested)(scope, receive, send)
            return

        async def send_with_cors(message: Message) -> None:
            if message["type"] == "http.response.start":
                out = MutableHeaders(scope=message)
                out["Access-Control-Allow-Origin"] = "*"
                out["Access-Control-Expose-Headers"] = EXPOSED
                out.add_vary_header("Origin")
            await send(message)

        await self.app(scope, receive, send_with_cors)

    @staticmethod
    def _preflight(scope: Scope, headers: Headers, requested: str) -> Response:
        if requested.upper() not in ALLOWED_METHODS:
            return PlainTextResponse("Invalid CORS request", status_code=403)
        out = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": ",".join(ALLOWED_METHODS),
            "Access-Control-Expose-Headers": EXPOSED,
            "Access-Control-Max-Age": _max_age(scope["path"]),
            "Vary": "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
        }
        if "access-control-request-headers" in headers:
            out["Access-Control-Allow-Headers"] = headers["access-control-request-headers"]
        return Response(status_code=200, headers=out)
