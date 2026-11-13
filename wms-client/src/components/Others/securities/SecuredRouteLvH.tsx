import React from "react";
import { Route, Redirect, type RouteComponentProps, type RouteProps } from "react-router-dom";
import { connect } from "react-redux";
import { RoleOption } from "../../../enums/Enums";
import type { RootState, UserState } from "../../../types/state";

interface OwnProps extends RouteProps {
  component: React.ComponentType<RouteComponentProps>;
}

interface StateProps {
  user: UserState;
}

type Props = OwnProps & StateProps;

const SecuredRouteLvH = ({ component: Component, user, ...otherProps }: Props) => (
  <Route
    {...otherProps}
    render={(props) => {
      if (!user.validToken) {
        return <Redirect to="/login" />;
      }
      if (user.user.role!.authority !== RoleOption["管理員"]) {
        return <Redirect to="/" />; // unauthorized page
      }
      return <Component {...props} />;
    }}
  />
);

const mapStateToProps = (state: RootState): StateProps => ({
  user: state.user,
});

export default connect(mapStateToProps)(SecuredRouteLvH);
