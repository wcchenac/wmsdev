import React, { Component } from "react";
import { RoleOption } from "../../../../enums/Enums";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import classnames from "classnames";
import { registerUser } from "../../../../actions/UserActions";
import LoadingOverlay from "react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class UserRegister extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState();
    this.userKeyInChange = this.userKeyInChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  initialState() {
    return {
      isLoading: false,
      employeeId: "",
      fullName: "",
      password: "",
      role: "",
      errors: {}
    };
  }

  componentWillReceiveProps(nextProps) {
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

    const { employeeId, fullName, password, role } = this.state;

    let registration = {
      employeeId: employeeId,
      fullName: fullName,
      password: password,
      role: role
    };

    this.setState({ isLoading: true }, () => {
      this.props
        .registerUser(registration, this.props.history)
        .then(response => {
          this.setState(this.initialState());
          toast.success("register success");
        })
        .catch(err => {
          this.setState({ isLoading: false });
          toast.error("register fail");
        });
    });
  }

  submissionValidate() {
    const { employeeId, fullName, password, role } = this.state;

    if (
      employeeId !== "" &&
      fullName !== "" &&
      password !== "" &&
      role !== ""
    ) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <div className="container">
        <LoadingOverlay active={this.state.isLoading} spinner={<Spinner />}>
          <div style={{ height: "80vh" }}>
            <div className="row justify-content-center">
              <div
                className="col-4"
                style={{ border: "1px solid black", borderRadius: "5px" }}
              >
                <div className="mt-2 mb-2">
                  <p className="h5 text-center mb-3">註冊新員工</p>
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
                          className="form-control"
                          placeholder="員工編號"
                          onChange={this.userKeyInChange}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label
                        htmlFor="fullName"
                        className="col-4 col-form-label"
                      >
                        姓名
                      </label>
                      <div className="col-8">
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          className="form-control"
                          placeholder="姓名"
                          onChange={this.userKeyInChange}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label
                        htmlFor="password"
                        className="col-4 col-form-label"
                      >
                        密碼
                      </label>
                      <div className="col-8">
                        <input
                          type="password"
                          id="password"
                          name="password"
                          className="form-control"
                          placeholder="密碼"
                          onChange={this.userKeyInChange}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label htmlFor="role" className="col-4 col-form-label">
                        權限
                      </label>
                      <div className="col-8">
                        <select
                          id="role"
                          name="role"
                          className="custom-select"
                          defaultValue=""
                          onChange={this.userKeyInChange}
                        >
                          {Object.keys(RoleOption).map((title, index) => (
                            <option key={index} value={RoleOption[title]}>
                              {title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row justify-content-center">
                      <div className="col-6">
                        <button
                          type="submit"
                          className="btn btn-primary btn-block"
                          disabled={this.submissionValidate()}
                        >
                          註冊
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="form-group">
                    <ToastContainer />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </LoadingOverlay>
      </div>
    );
  }
}

UserRegister.propTypes = {
  registerUser: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user,
  errors: state.errors
});

export default connect(mapStateToProps, { registerUser })(
  withRouter(UserRegister)
);
