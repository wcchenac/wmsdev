import React, { Component } from "react";
import { RoleOption } from "../../enums/Enums";
import HeaderAdmin from "./RoleHeader/HeaderAdmin";
import HeaderOperator from "./RoleHeader/HeaderOperator";
import HeaderNormal from "./RoleHeader/HeaderNormal";
import HeaderSales from "./RoleHeader/HeaderSales";

class HeaderStockFunctions extends Component {
  userAuthencated() {
    switch (this.props.authority) {
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
  }

  render() {
    return this.props.isAuthencated ? this.userAuthencated() : null;
  }
}

export default HeaderStockFunctions;
