import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classnames from "classnames";
import { login } from "../../../actions/UserActions";

class Login extends Component {
  constructor() {
    super();
    this.state = {
      employeeId: "",
      password: "",
      errors: {}
    };
    this.userKeyInChange = this.userKeyInChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (this.props.user.validToken) {
      this.props.history.push("/");
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.user.validToken) {
      this.props.history.push("/");
    }

    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  userKeyInChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();

    const loginRequest = {
      employeeId: this.state.employeeId,
      password: this.state.password
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
                    <label
                      htmlFor="employeeId"
                      className="col-4 col-form-label"
                    >
                      員工編號
                    </label>
                    <div className="col-8">
                      <input
                        type="text"
                        id="employeeId"
                        name="employeeId"
                        className={classnames("form-control", {
                          "is-invalid": errors.username
                        })}
                        placeholder="員工編號"
                        onChange={this.userKeyInChange}
                      />
                      {errors.username && (
                        <div className="invalid-feedback">
                          {errors.username}
                        </div>
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
                          "is-invalid": errors.password
                        })}
                        placeholder="密碼"
                        onChange={this.userKeyInChange}
                      />
                      {errors.username && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row justify-content-center">
                    <div className="col-4">
                      <button
                        type="submit"
                        className="btn btn-primary btn-block"
                      >
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

Login.propTypes = {
  login: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user,
  errors: state.errors
});

export default connect(mapStateToProps, { login })(Login);
