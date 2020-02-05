import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logout } from "../../actions/UserActions";
import HeaderStockFunctions from "./HeaderStockFunctions";
import HeaderUserFunctions from "./HeaderUserFunctions";

class Header extends Component {
  logout() {
    this.props.logout();
    window.location.href = "/";
  }

  renderHeaderContent() {
    const { validToken, user } = this.props.user;
    let authority = user.role ? user.role.authority : null;

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
    let headerContent = this.renderHeaderContent();

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

Header.propTypes = {
  logout: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps, { logout })(Header);
