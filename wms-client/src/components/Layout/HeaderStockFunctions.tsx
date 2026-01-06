import React from "react";
import { RoleOption } from "../../enums/Enums";
import HeaderAdmin from "./RoleHeader/HeaderAdmin";
import HeaderOperator from "./RoleHeader/HeaderOperator";
import HeaderNormal from "./RoleHeader/HeaderNormal";
import HeaderSales from "./RoleHeader/HeaderSales";

interface HeaderStockFunctionsProps {
  isAuthencated: boolean;
  authority: string | null;
}

const HeaderStockFunctions = ({
  isAuthencated,
  authority,
}: HeaderStockFunctionsProps): React.ReactElement | null => {
  const userAuthencated = (): React.ReactElement | null => {
    switch (authority) {
      case RoleOption["管理員"]:
        return <HeaderAdmin />;
      case RoleOption["庫存相關人員"]:
        return <HeaderOperator />;
      case RoleOption["一般人員/門市"]:
        return <HeaderNormal />;
      case RoleOption["業務"]:
        return <HeaderSales />;
      default:
        return null;
    }
  };

  return isAuthencated ? userAuthencated() : null;
};

export default HeaderStockFunctions;
