import React, { Component } from "react";

class Header extends Component {
  render() {
    return (
      <nav className="navbar navbar-expand-sm navbar-dark bg-primary mb-4">
        <div className="container">
          <a className="navbar-brand" href="Dashboard.html">
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
              <li className="nav-item">
                <a className="nav-link" href="/cloth/instock">
                  入庫作業
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="/#"
                  id="navbarDropdown"
                  data-toggle="dropdown"
                >
                  庫存異動
                </a>
                <div className="dropdown-menu">
                  <a className="dropdown-item" href="/cloth/modify">
                    板卷變動
                  </a>
                  <a className="dropdown-item" href="/cloth/delete">
                    庫存註銷
                  </a>
                </div>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/cloth/query">
                  查詢庫存
                </a>
              </li>
            </ul>

            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a className="nav-link" href="login.html">
                  登入
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
