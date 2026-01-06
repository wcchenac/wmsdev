import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RoleOption } from "../../../enums/Enums";
import { RootState } from "../../../types";

interface SecuredRouteLvL1Props {
  children?: React.ReactNode;
}

const SecuredRouteLvL1: React.FC<SecuredRouteLvL1Props> = ({ children }) => {
  const user = useSelector((state: RootState) => state.user);

  if (!user.validToken) {
    return <Navigate to="/login" replace />;
  }

  switch (user.user.role) {
    case RoleOption["一般人員/門市"]:
      return children ? <>{children}</> : <Outlet />;
    case RoleOption["業務"]:
    case RoleOption["庫存相關人員"]:
    case RoleOption["管理員"]:
    default:
      return <Navigate to="/" replace />; // unauthorized page
  }
};

export default SecuredRouteLvL1;
