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
          <NavLink className="nav-link" to="/login">
            <i className="fa fa-user-circle-o fa-lg me-1"></i>
            {fullName}
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            className="nav-link"
            to="/logout"
            onClick={logout}
          >
            登出
          </NavLink>
        </li>
      </ul>
    </React.Fragment>
  );

  return isAuthencated ? userAuthencated : userUnauthencated;
};

export default HeaderUserFunctions;
