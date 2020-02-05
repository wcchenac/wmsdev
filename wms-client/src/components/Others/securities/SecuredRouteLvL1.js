import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { RoleOption } from "../../../enums/Enums";

const SecuredRouteLvL1 = ({ component: Component, user, ...otherProps }) => (
  <Route
    {...otherProps}
    render={props => {
      if (!user.validToken) {
        return <Redirect to="/login" />;
      }
      if (user.user.role.authority === RoleOption["業務"]) {
        return <Redirect to="/" />; // unauthorized page
      }
      return <Component {...props} />;
    }}
  />
);

SecuredRouteLvL1.propTypes = {
  user: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(SecuredRouteLvL1);
