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

const SecuredRouteLvM1 = ({ component: Component, user, ...otherProps }: Props) => (
  <Route
    {...otherProps}
    render={(props) => {
      if (!user.validToken) {
        return <Redirect to="/login" />;
      }
      switch (user.user.role!.authority) {
        case RoleOption["庫存相關人員"]:
        case RoleOption["管理員"]:
          return <Component {...props} />;
        case RoleOption["一般人員/門市"]:
        case RoleOption["業務"]:
        default:
          return <Redirect to="/" />; // unauthorized page
      }
    }}
  />
);

const mapStateToProps = (state: RootState): StateProps => ({
  user: state.user,
});

export default connect(mapStateToProps)(SecuredRouteLvM1);
