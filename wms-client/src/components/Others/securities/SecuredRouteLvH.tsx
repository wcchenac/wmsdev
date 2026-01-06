import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RoleOption } from "../../../enums/Enums";
import { RootState } from "../../../types";

interface SecuredRouteLvHProps {
  children?: React.ReactNode;
}

const SecuredRouteLvH: React.FC<SecuredRouteLvHProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.user);

  if (!user.validToken) {
    return <Navigate to="/login" replace />;
  }

  if (user.user.role !== RoleOption["管理員"]) {
    return <Navigate to="/" replace />; // unauthorized page
  }

  return children ? <>{children}</> : <Outlet />;
};

export default SecuredRouteLvH;
