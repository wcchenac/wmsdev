import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class HeaderNormal extends Component {
  render() {
    return (
      <React.Fragment>
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <NavLink className="nav-link" to="/stock/2/1">
              庫存查詢
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/stock/2/3">
              出庫單查詢
            </NavLink>
          </li>
        </ul>
      </React.Fragment>
    );
  }
}

export default HeaderNormal;
