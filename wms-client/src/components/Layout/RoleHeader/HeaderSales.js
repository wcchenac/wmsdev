import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class HeaderSales extends Component {
  render() {
    return (
      <React.Fragment>
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <NavLink className="nav-link" to="/stock/2/2">
              庫存查詢
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/stock/5">
              歷史記錄查詢
            </NavLink>
          </li>
        </ul>
      </React.Fragment>
    );
  }
}

export default HeaderSales;
