import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { RoleOption } from "../../../enums/Enums";

const SecuredRouteLvM2 = ({ component: Component, user, ...otherProps }) => (
  <Route
    {...otherProps}
    render={(props) => {
      if (!user.validToken) {
        return <Redirect to="/login" />;
      } else {
        switch (user.user.role.authority) {
          case RoleOption["庫存相關人員"]:
          case RoleOption["管理員"]:
          case RoleOption["業務"]:
            return <Component {...props} />;
          case RoleOption["一般人員/門市"]:
          default:
            return <Redirect to="/" />; // unauthorized page
        }
      }
    }}
  />
);

SecuredRouteLvM2.propTypes = {
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(SecuredRouteLvM2);
