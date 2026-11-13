"""/api/user/* — login and admin user management (5 endpoints)."""

from conftest import USERS, rows


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


# DELETE /api/user/adminManagement/user/delete --------------------------------


def test_delete_user(admin, db, golden):
    url = "/api/user/adminManagement/user/delete"
    golden.response("delete_store", admin.delete(url, params={"employeeId": "store"}))
    golden.response("delete_again", admin.delete(url, params={"employeeId": "store"}))
    golden.response("missing_param", admin.delete(url))
    golden.add("users", user_table(db))
