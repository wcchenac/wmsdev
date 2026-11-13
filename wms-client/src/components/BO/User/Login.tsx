import React, { Component } from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { type RouteComponentProps } from "react-router-dom";
import { login } from "../../../actions/UserActions";
import type { RootState, UserState, ErrorState } from "../../../types/state";

interface LoginErrors {
  username?: string;
  password?: string;
}

interface StateProps {
  user: UserState;
  errors: ErrorState;
}

interface DispatchProps {
  login: (loginRequest: { employeeId: string; password: string }) => void;
}

type Props = StateProps & DispatchProps & RouteComponentProps;

interface State {
  employeeId: string;
  password: string;
  errors: LoginErrors;
}

class Login extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      employeeId: "",
      password: "",
      errors: {},
    };
    this.userKeyInChange = this.userKeyInChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (this.props.user.validToken) {
      this.props.history.push("/");
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.user.validToken) {
      this.props.history.push("/");
    }

    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors as LoginErrors,
      });
    }
  }

  userKeyInChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === "employeeId") {
      this.setState({ employeeId: value });
    } else if (name === "password") {
      this.setState({ password: value });
    }
  }

  handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const loginRequest = {
      employeeId: this.state.employeeId,
      password: this.state.password,
    };

    this.props.login(loginRequest);
  }

  render() {
    const { errors } = this.state;

    return (
      <div className="login">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-4">
              <p className="h5 text-center">使用者登入</p>
              <div className="pt-2">
                <form onSubmit={this.handleSubmit}>
                  <div className="form-group row">
                    <label htmlFor="employeeId" className="col-4 col-form-label">
                      員工編號
                    </label>
                    <div className="col-8">
                      <input
                        type="text"
                        id="employeeId"
                        name="employeeId"
                        className={classnames("form-control", {
                          "is-invalid": errors.username,
                        })}
                        placeholder="員工編號"
                        onChange={this.userKeyInChange}
                      />
                      {errors.username && (
                        <div className="invalid-feedback">{errors.username}</div>
                      )}
                    </div>
                  </div>
                  <div className="form-group row">
                    <label htmlFor="password" className="col-4 col-form-label">
                      密碼
                    </label>
                    <div className="col-8">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className={classnames("form-control", {
                          "is-invalid": errors.password,
                        })}
                        placeholder="密碼"
                        onChange={this.userKeyInChange}
                      />
                      {errors.username && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>
                  </div>
                  <div className="row justify-content-center">
                    <div className="col-4">
                      <button type="submit" className="btn btn-primary btn-block">
                        登入
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): StateProps => ({
  user: state.user,
  errors: state.errors,
});

export default connect(mapStateToProps, { login })(Login);
