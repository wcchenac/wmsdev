import React, { Component } from "react";

class Header extends Component {
  render() {
    return (
      <nav className="navbar sticky-top navbar-expand-sm navbar-dark bg-primary mb-4">
        <div className="container">
          <a className="navbar-brand" href="/">
            庫存管理工具
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#mobile-nav"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mobile-nav">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="/#"
                  id="navbarDropdown"
                  data-toggle="dropdown"
                >
                  入庫作業
                </a>
                <div className="dropdown-menu">
                  <a className="dropdown-item" href="/cloth/1/1">
                    進貨單新增
                  </a>
                  <a className="dropdown-item" href="/cloth/1/2">
                    組裝單新增
                  </a>
                </div>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/cloth/2">
                  庫存查詢
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="/#"
                  id="navbarDropdown"
                  data-toggle="dropdown"
                >
                  庫存異動作業
                </a>
                <div className="dropdown-menu">
                  <a className="dropdown-item" href="/cloth/3/1">
                    庫存異動
                  </a>
                  <a className="dropdown-item" href="/cloth/3/2">
                    減肥清單
                  </a>
                  <a className="dropdown-item" href="/cloth/3/3">
                    拉貨明細
                  </a>
                </div>
              </li>
            </ul>
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a className="nav-link" href="/login.html">
                  登入
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/login.html">
                  登出
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

export default Header;
