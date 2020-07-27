import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class HeaderAdmin extends Component {
  render() {
    return (
      <React.Fragment>
        <ul className="navbar-nav mr-auto">
          <li className="nav-item dropdown">
            <NavLink
              className="nav-link dropdown-toggle"
              to="/#"
              id="navbarDropdown"
              data-toggle="dropdown"
            >
              入庫作業
            </NavLink>
            <div className="dropdown-menu">
              <NavLink className="dropdown-item" to="/stock/1/1">
                進貨單入庫
              </NavLink>
              <NavLink className="dropdown-item" to="/stock/1/2">
                組裝單入庫
              </NavLink>
              <NavLink className="dropdown-item" to="/stock/1/3">
                退貨單入庫
              </NavLink>
              <NavLink className="dropdown-item" to="/stock/1/4">
                調撥單入庫
              </NavLink>
            </div>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/stock/2/2">
              庫存查詢
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/stock/2/3">
              出庫單查詢
            </NavLink>
          </li>
          <li className="nav-item dropdown">
            <NavLink
              className="nav-link dropdown-toggle"
              to="/#"
              id="navbarDropdown"
              data-toggle="dropdown"
            >
              庫存異動作業
            </NavLink>
            <div className="dropdown-menu">
              <NavLink className="dropdown-item" to="/stock/3/1">
                庫存異動
              </NavLink>
              <NavLink className="dropdown-item" to="/stock/3/2">
                減肥清單
              </NavLink>
            </div>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/stock/4">
              拉貨明細
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/stock/5">
              歷史記錄查詢
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/files">
              檔案總管
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin">
              管理員區域
            </NavLink>
          </li>
        </ul>
      </React.Fragment>
    );
  }
}

export default HeaderAdmin;
