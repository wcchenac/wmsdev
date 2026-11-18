import React from "react";
import { NavLink } from "react-router";

interface HeaderUserFunctionsProps {
  isAuthencated: boolean;
  fullName?: string;
  authority?: string | null;
  logout: () => void;
}

const HeaderUserFunctions: React.FC<HeaderUserFunctionsProps> = ({
  isAuthencated,
  fullName,
  logout,
}) => {
  const userUnauthencated = (
    <React.Fragment>
      <ul className="navbar-nav ms-auto">
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
      <ul className="navbar-nav ms-auto">
        <li className="nav-item">
          {/* The name is capped (App.css .navbar-user-name) so a long one cannot push the bar
              onto a second line; the full name shows on hover. */}
          <NavLink className="nav-link" to="/login" title={fullName}>
            <i className="fa fa-user-circle-o fa-lg me-1"></i>
            <span className="navbar-user-name">{fullName}</span>
          </NavLink>
        </li>
        <li className="nav-item">
          {/* An action, not a page: Header's logout signs out and opens /login. */}
          <button
            type="button"
            className="nav-link border-0"
            onClick={logout}
          >
            登出
          </button>
        </li>
      </ul>
    </React.Fragment>
  );

  return isAuthencated ? userAuthencated : userUnauthencated;
};

export default HeaderUserFunctions;
