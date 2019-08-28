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
              <li className="nav-item">
                <a className="nav-link" href="/cloth/1">
                  入庫作業
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/cloth/2">
                  庫存查詢/異動
                </a>
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
