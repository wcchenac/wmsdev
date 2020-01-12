import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

const SecuredRouteLvL = ({ component: Component, user, ...otherProps }) => (
  <Route
    {...otherProps}
    render={props => {
      if (!user.validToken) {
        return <Redirect to="/login" />;
      }
      return <Component {...props} />;
    }}
  />
);

SecuredRouteLvL.propTypes = {
  user: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(SecuredRouteLvL);
