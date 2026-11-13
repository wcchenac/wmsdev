"""/api/user/* — login and admin user management (5 endpoints)."""

from conftest import JWT_SECRET, USERS, exec_sql, login, rows, sign_jwt


def user_table(db):
    return rows(
        db,
        "SELECT u.id, u.employeeId, u.fullName, r.role FROM user u JOIN role r ON r.id = u.role_id ORDER BY u.id",
    )


# POST /api/user/login ------------------------------------------------------


def test_login_each_role(http, golden):
    for employee_id, (_, password, _) in USERS.items():
        resp = http.post("/api/user/login", json={"employeeId": employee_id, "password": password})
        golden.response(employee_id, resp)


def test_login_rejections(http, golden):
    golden.response("wrong_password", http.post("/api/user/login", json={"employeeId": "admin", "password": "nope"}))
    golden.response("unknown_user", http.post("/api/user/login", json={"employeeId": "ghost", "password": "x"}))
    golden.response("empty_body", http.post("/api/user/login", json={}))


def test_token_is_required(http, golden):
    golden.response("no_token", http.get("/api/user/adminManagement/user/userList"))
    golden.response(
        "garbage_token",
        http.get("/api/user/adminManagement/user/userList", headers={"Authorization": "Bearer not-a-jwt"}),
    )


def test_token_edge_cases(http, db, golden):
    import base64
    import time

    store_token = login(http, "store")
    admin_token = login(http, "admin")
    exec_sql(db, "DELETE FROM user WHERE employeeId = %s", "store")  # removed after login
    golden.response("deleted_user", http.get("/api/stock/queryStock/query/2/CF1001",
                                             headers={"Authorization": store_token}))

    user_list = "/api/user/adminManagement/user/userList"
    now = int(time.time())
    claims = {"id": "1", "employeeId": "admin", "fullName": "管理員甲", "role": {"authority": "ROLE_Admin"}}
    key = base64.b64decode(JWT_SECRET)
    expired = sign_jwt({**claims, "iat": now - 7200, "exp": now - 3600}, key)
    other_key = sign_jwt({**claims, "iat": now, "exp": now + 3600}, b"k" * 64)
    alg_none = sign_jwt({**claims, "iat": now, "exp": now + 3600}, None, alg="none")
    golden.response("expired", http.get(user_list, headers={"Authorization": "Bearer " + expired}))
    golden.response("other_key", http.get(user_list, headers={"Authorization": "Bearer " + other_key}))
    golden.response("alg_none", http.get(user_list, headers={"Authorization": "Bearer " + alg_none}))

    raw = admin_token.removeprefix("Bearer ")
    golden.response("lowercase_bearer", http.get(user_list, headers={"Authorization": "bearer " + raw}))
    golden.response("no_space", http.get(user_list, headers={"Authorization": "Bearer" + raw}))
    golden.response("unimplemented_path_no_token", http.get("/api/does/not/exist"))


# POST /api/user/adminManagement/user/register --------------------------------


def test_register(admin, operator, anonymous, db, golden):
    body = {"employeeId": "newbie", "fullName": "新人戊", "password": "pw123456", "confirmPassword": "pw123456",
            "role": "ROLE_Sales"}
    golden.response("created", admin.post("/api/user/adminManagement/user/register", json=body))
    golden.response("duplicate", admin.post("/api/user/adminManagement/user/register", json=body))
    golden.response("bad_role_name", admin.post("/api/user/adminManagement/user/register",
                                                json={**body, "employeeId": "x2", "role": "ROLE_Boss"}))
    golden.response("missing_fields", admin.post("/api/user/adminManagement/user/register",
                                                 json={"employeeId": "x3"}))
    golden.response("operator_forbidden", operator.post("/api/user/adminManagement/user/register",
                                                        json={**body, "employeeId": "x4"}))
    golden.response("anonymous", anonymous.post("/api/user/adminManagement/user/register",
                                                json={**body, "employeeId": "x5"}))
    golden.add("users", user_table(db))
    login = admin.http.post("/api/user/login", json={"employeeId": "newbie", "password": "pw123456"})
    golden.response("new_user_can_login", login)


# GET /api/user/adminManagement/user/userList ---------------------------------


def test_user_list(admin, sales, golden):
    golden.response("admin", admin.get("/api/user/adminManagement/user/userList"))
    golden.response("sales_forbidden", sales.get("/api/user/adminManagement/user/userList"))


# PATCH /api/user/adminManagement/user/update ---------------------------------


def test_update_user(admin, http, db, golden):
    url = "/api/user/adminManagement/user/update"
    golden.response("rename_and_promote", admin.patch(url, json={
        "employeeId": "store", "newPassword": "", "fullName": "門市丁丁", "role": "ROLE_Sales"}))
    golden.response("change_password", admin.patch(url, json={
        "employeeId": "sales", "newPassword": "sales999", "fullName": "業務丙", "role": "ROLE_Sales"}))
    golden.response("unknown_user", admin.patch(url, json={
        "employeeId": "ghost", "newPassword": "", "fullName": "x", "role": "ROLE_Sales"}))
    golden.add("users", user_table(db))
    golden.response("old_password", http.post("/api/user/login", json={"employeeId": "sales", "password": "sales123"}))
    golden.response("new_password", http.post("/api/user/login", json={"employeeId": "sales", "password": "sales999"}))


def test_update_user_password_semantics(admin, http, golden):
    """newPassword omitted keeps the password; "" sets it to the empty string (Java behavior)."""
    url = "/api/user/adminManagement/user/update"

    def try_login(employee_id, password):
        return http.post("/api/user/login", json={"employeeId": employee_id, "password": password})

    golden.response("omit_new_password", admin.patch(url, json={
        "employeeId": "store", "fullName": "門市丁", "role": "ROLE_Normal"}))
    golden.response("omit_new_password/login_old", try_login("store", "store123"))

    golden.response("empty_new_password", admin.patch(url, json={
        "employeeId": "sales", "newPassword": "", "fullName": "業務丙", "role": "ROLE_Sales"}))
    golden.response("empty_new_password/login_empty", try_login("sales", ""))
    golden.response("empty_new_password/login_old", try_login("sales", "sales123"))

    golden.response("bad_role", admin.patch(url, json={
        "employeeId": "operator", "fullName": "倉管乙", "role": "ROLE_Boss"}))


# DELETE /api/user/adminManagement/user/delete --------------------------------


def test_delete_user(admin, db, golden):
    url = "/api/user/adminManagement/user/delete"
    golden.response("delete_store", admin.delete(url, params={"employeeId": "store"}))
    golden.response("delete_again", admin.delete(url, params={"employeeId": "store"}))
    golden.response("missing_param", admin.delete(url))
    golden.add("users", user_table(db))
