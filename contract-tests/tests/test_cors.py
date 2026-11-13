"""CORS: the Java service allows any origin (WebMvcConfig + http.cors()).

The React client may call the backend cross-origin (absolute baseURL), so
preflights must succeed before authentication. Header lists are compared as
sets, since their spelling and order are not part of the contract.
"""

from conftest import Api

ORIGIN = "http://192.168.20.113:3000"


def _cors(resp):
    h = resp.headers

    def as_set(name):
        value = h.get(name)
        return None if value is None else sorted(v.strip().lower() for v in value.split(","))

    return {
        "status": resp.status_code,
        "allow-origin": h.get("access-control-allow-origin"),
        "allow-methods": as_set("access-control-allow-methods"),
        "expose-headers": as_set("access-control-expose-headers"),
        "max-age": h.get("access-control-max-age"),
    }


def _preflight(http, path, method, headers="authorization,content-type"):
    return http.options(path, headers={
        "Origin": ORIGIN,
        "Access-Control-Request-Method": method,
        "Access-Control-Request-Headers": headers,
    })


def test_preflight(http, golden):
    golden.add("login", _cors(_preflight(http, "/api/user/login", "POST", "content-type")))
    golden.add("protected", _cors(_preflight(http, "/api/user/adminManagement/user/userList", "GET")))
    golden.add("patch", _cors(_preflight(http, "/api/stock/updateStock", "PATCH")))


def test_actual_request_carries_cors_headers(http, golden):
    admin = Api(http, "admin")
    golden.add("authorized", _cors(admin.get("/api/user/adminManagement/user/userList",
                                             headers={"Origin": ORIGIN})))
    golden.add("unauthorized", _cors(http.get("/api/user/adminManagement/user/userList",
                                              headers={"Origin": ORIGIN})))
