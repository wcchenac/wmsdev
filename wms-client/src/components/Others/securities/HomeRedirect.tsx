import React from "react";
import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import { RoleOption } from "../../../enums/Enums";
import { RootState } from "../../../types";
import { userRole } from "./ProtectedRoute";

/** Each role's landing page: the first item of its menu (Layout/RoleHeader/Header*.tsx). */
export const HOME_BY_ROLE: Record<string, string> = {
  [RoleOption["管理員"]]: "/stock/1/1",
  [RoleOption["庫存相關人員"]]: "/stock/1/1",
  [RoleOption["一般人員/門市"]]: "/stock/2/1",
  [RoleOption["業務"]]: "/stock/2/2",
};

/**
 * Element for "/" — where login, the logo and ProtectedRoute send people. Signed-out users
 * go to /login, signed-in users to their role's first page.
 */
function HomeRedirect(): React.ReactElement {
  const user = useSelector((state: RootState) => state.user);

  if (!user.validToken) {
    return <Navigate to="/login" replace />;
  }

  const home = HOME_BY_ROLE[userRole(user.user) ?? ""];
  if (!home) {
    // Redirecting to /login would bounce straight back: Login sends signed-in users to "/".
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          此帳號沒有可使用的功能，請聯絡管理員確認權限。
        </div>
      </div>
    );
  }
  return <Navigate to={home} replace />;
}

export default HomeRedirect;
