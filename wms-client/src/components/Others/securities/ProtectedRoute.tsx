import React from "react";
import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import { RoleOption } from "../../../enums/Enums";
import { RootState } from "../../../types";

type RoleLevel = "H" | "M1" | "M2" | "L1" | "L2" | "L3";

interface ProtectedRouteProps {
  level: RoleLevel;
  children?: React.ReactNode;
}

const ROLE_LEVELS: Record<RoleLevel, string[]> = {
  H: [RoleOption["管理員"]],
  M1: [RoleOption["庫存相關人員"], RoleOption["管理員"]],
  M2: [RoleOption["庫存相關人員"], RoleOption["管理員"], RoleOption["業務"]],
  L1: [RoleOption["一般人員/門市"]],
  L2: [RoleOption["業務"], RoleOption["庫存相關人員"], RoleOption["管理員"]],
  L3: [RoleOption["一般人員/門市"], RoleOption["管理員"]]
};

function ProtectedRoute({ level, children }: ProtectedRouteProps): React.ReactElement {
  const user = useSelector((state: RootState) => state.user);

  if (!user.validToken) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = ROLE_LEVELS[level] || [];
  const role = user.user?.role;
  // Handle both string and object formats for role
  // Backend JWT may return { authority: "ROLE_Admin" } or "ROLE_Admin"
  const userRole: string | null = role
    ? typeof role === 'string'
      ? role
      : role.authority ?? null
    : null;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
