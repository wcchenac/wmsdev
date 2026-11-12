const ROLE_LABEL = {
  ROLE_Admin: "管理員",
  ROLE_Operator: "庫存相關人員",
  ROLE_Sales: "業務",
  ROLE_Normal: "一般人員/門市",
};

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function signToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS512", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      id: String(user.id),
      employeeId: user.employeeId,
      fullName: user.fullName,
      role: { authority: user.role },
      iat: now,
      exp: now + 12 * 60 * 60,
    })
  );
  const signature = base64url("wms-ui-mock");
  return `${header}.${payload}.${signature}`;
}

function readToken(headerValue) {
  if (!headerValue || !headerValue.startsWith("Bearer ")) {
    return null;
  }
  const token = headerValue.slice("Bearer ".length).trim();
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

function invalidLogin() {
  return { username: "無效的員工編號", password: "無效的密碼" };
}

module.exports = {
  ROLE_LABEL,
  signToken,
  readToken,
  invalidLogin,
};
