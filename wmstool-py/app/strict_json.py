"""Request bodies parsed as strictly as Jackson does.

Python's json.loads accepts NaN, Infinity and -Infinity, which are not JSON. Jackson's
parser rejects them while reading, before any property is bound (even one the request
class does not have), so Java answers 400 with an empty body. Every router uses
StrictJsonRoute: the error becomes a JSONDecodeError, which FastAPI turns into the same
RequestValidationError (400, empty body) as any other malformed JSON.
"""

import json
from collections.abc import Callable, Coroutine
from typing import Any

from fastapi.routing import APIRoute
from starlette.requests import Request
from starlette.responses import Response


def _reject_constant(name: str) -> float:
    raise json.JSONDecodeError(f"{name} is not valid JSON", name, 0)


class StrictJsonRequest(Request):
    async def json(self) -> Any:
        if not hasattr(self, "_json"):
            self._json = json.loads(await self.body(), parse_constant=_reject_constant)
        return self._json


class StrictJsonRoute(APIRoute):
    def get_route_handler(self) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        handler = super().get_route_handler()

        async def strict_handler(request: Request) -> Response:
            return await handler(StrictJsonRequest(request.scope, request.receive))

        return strict_handler
