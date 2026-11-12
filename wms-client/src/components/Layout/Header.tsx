import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { logout } from "../../actions/UserActions";
import HeaderStockFunctions from "./HeaderStockFunctions";
import HeaderUserFunctions from "./HeaderUserFunctions";
import type { RootState, UserState } from "../../types/state";

interface StateProps {
  user: UserState;
}

interface DispatchProps {
  logout: () => void;
}

type Props = StateProps & DispatchProps;

class Header extends Component<Props> {
  logout() {
    this.props.logout();
    window.location.href = "/";
  }

  renderHeaderContent() {
    const { validToken, user } = this.props.user;
    const authority = user.role ? user.role.authority ?? null : null;

    return (
      <div className="collapse navbar-collapse" id="mobile-nav">
        <HeaderStockFunctions
          isAuthencated={validToken}
          authority={authority}
        />
        <HeaderUserFunctions
          isAuthencated={validToken}
          fullName={user.fullName}
          authority={authority}
          logout={this.logout.bind(this)}
        />
      </div>
    );
  }

  render() {
    const headerContent = this.renderHeaderContent();

    return (
      <nav className="navbar sticky-top navbar-expand-sm navbar-dark bg-primary mb-4">
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            庫存管理工具
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#mobile-nav"
          >
            <span className="navbar-toggler-icon" />
          </button>
          {headerContent}
        </div>
      </nav>
    );
  }
}

const mapStateToProps = (state: RootState): StateProps => ({
  user: state.user,
});

export default connect(mapStateToProps, { logout })(Header);
