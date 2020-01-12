import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class HeaderUserFunctions extends Component {
  render() {
    const userUnauthencated = (
      <React.Fragment>
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <NavLink className="nav-link" to="/login">
              登入
            </NavLink>
          </li>
        </ul>
      </React.Fragment>
    );

    const userAuthencated = (
      <React.Fragment>
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <NavLink className="nav-link" to="/login">
              <i className="fa fa-user-circle-o fa-lg mr-1"></i>
              {this.props.fullName}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/logout"
              onClick={this.props.logout}
            >
              登出
            </NavLink>
          </li>
        </ul>
      </React.Fragment>
    );

    return this.props.isAuthencated ? userAuthencated : userUnauthencated;
  }
}

export default HeaderUserFunctions;
