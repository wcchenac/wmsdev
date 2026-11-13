import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import classnames from "classnames";
import { login } from "../../../actions/UserActions";
import { RootState } from "../../../store";
import { AppDispatch } from "../../../types";
import { useUpdateEffect } from "../../../utilities/useUpdateEffect";

interface LoginErrors {
  username?: string;
  password?: string;
  /** Set when the request itself failed (no response): "登入失敗，請檢查帳號密碼". */
  message?: string;
}

interface TouchedFields {
  employeeId: boolean;
  password: boolean;
}

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const user = useSelector((state: RootState) => state.user);
  // The error reducer keeps the last GET_Errors payload in state.errors.errors; for a rejected
  // login that is the backend's { username, password } messages.
  const reduxErrors = useSelector((state: RootState) => state.errors.errors) as LoginErrors | null;

  // Local state
  const [employeeId, setEmployeeId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [touched, setTouched] = useState<TouchedFields>({
    employeeId: false,
    password: false
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user.validToken) {
      navigate("/");
    }
  }, [user.validToken, navigate]);

  // Only errors that arrive while the page is open (dev's componentWillReceiveProps): an
  // earlier failed login, or another page's error, must not show up when the page opens.
  useUpdateEffect(reduxErrors, (nextErrors) => {
    if (nextErrors) {
      setErrors(nextErrors);
    }
  });

  const userKeyInChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    if (name === "employeeId") {
      setEmployeeId(value);
    } else if (name === "password") {
      setPassword(value);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name === "employeeId" ? "username" : name]: "",
      message: ""
    }));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name } = e.target;
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ employeeId: true, password: true });
    setIsSubmitting(true);

    const loginRequest = {
      employeeId,
      password
    };

    // The button comes back when the request settles, not when the stored error changes:
    // the same error twice in a row leaves the store unchanged.
    dispatch(login(loginRequest)).finally(() => {
      setIsSubmitting(false);
    });
  };

  const hasEmployeeIdError = touched.employeeId && errors.username;
  const hasPasswordError = touched.password && errors.password;
  // A check mark only means "filled in"; while a login failure is on screen it would
  // contradict the error, so neither field gets one until every error is cleared.
  const loginFailed = Boolean(errors.message || errors.username || errors.password);
  const showEmployeeIdValid = touched.employeeId && !loginFailed && Boolean(employeeId);
  const showPasswordValid = touched.password && !loginFailed && Boolean(password);

  return (
    <div className="login fade-in">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            {/* Login Card */}
            <div
              className="card shadow-sm"
              style={{
                borderRadius: "var(--border-radius-lg)",
                overflow: "hidden"
              }}
            >
              {/* Card Header */}
              <div
                className="card-header text-center py-4"
                style={{
                  background: "var(--color-primary)",
                  color: "var(--color-white)"
                }}
              >
                <h1
                  className="h4 mb-0"
                  style={{ fontWeight: "var(--font-weight-semibold)" }}
                >
                  庫存管理系統
                </h1>
                <p className="mb-0 mt-2 small" style={{ opacity: 0.9 }}>
                  使用者登入
                </p>
              </div>

              {/* Card Body */}
              <div className="card-body p-4">
                <form onSubmit={handleSubmit} noValidate>
                  {/* Employee ID Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="employeeId"
                      className="form-label"
                      style={{
                        fontWeight: "var(--font-weight-medium)",
                        color: "var(--color-gray-700)",
                        marginBottom: "var(--spacing-2)"
                      }}
                    >
                      員工編號
                      <span
                        className="text-danger ms-1"
                        aria-hidden="true"
                      >
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      id="employeeId"
                      name="employeeId"
                      value={employeeId}
                      className={classnames("form-control", {
                        "is-invalid": hasEmployeeIdError,
                        "is-valid": showEmployeeIdValid
                      })}
                      placeholder="請輸入員工編號"
                      onChange={userKeyInChange}
                      onBlur={handleBlur}
                      aria-required="true"
                      aria-invalid={hasEmployeeIdError ? "true" : "false"}
                      aria-describedby={hasEmployeeIdError ? "employeeId-error" : undefined}
                      autoComplete="username"
                      autoFocus
                    />
                    {hasEmployeeIdError && (
                      <div
                        id="employeeId-error"
                        className="invalid-feedback"
                        role="alert"
                      >
                        {errors.username}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label"
                      style={{
                        fontWeight: "var(--font-weight-medium)",
                        color: "var(--color-gray-700)",
                        marginBottom: "var(--spacing-2)"
                      }}
                    >
                      密碼
                      <span
                        className="text-danger ms-1"
                        aria-hidden="true"
                      >
                        *
                      </span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      className={classnames("form-control", {
                        "is-invalid": hasPasswordError,
                        "is-valid": showPasswordValid
                      })}
                      placeholder="請輸入密碼"
                      onChange={userKeyInChange}
                      onBlur={handleBlur}
                      aria-required="true"
                      aria-invalid={hasPasswordError ? "true" : "false"}
                      aria-describedby={hasPasswordError ? "password-error" : undefined}
                      autoComplete="current-password"
                    />
                    {hasPasswordError && (
                      <div
                        id="password-error"
                        className="invalid-feedback"
                        role="alert"
                      >
                        {errors.password}
                      </div>
                    )}
                  </div>

                  {/* A failure that belongs to neither field, e.g. the backend is unreachable */}
                  {errors.message && (
                    <div className="alert alert-danger py-2" role="alert">
                      {errors.message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className={classnames("btn btn-primary w-100 py-2", {
                        "btn-loading": isSubmitting
                      })}
                      disabled={isSubmitting}
                      style={{
                        fontSize: "var(--font-size-base)",
                        fontWeight: "var(--font-weight-medium)"
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="visually-hidden">登入中...</span>
                          登入中...
                        </>
                      ) : (
                        "登入"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer hint */}
            <p
              className="text-center mt-3 small"
              style={{ color: "var(--color-gray-500)" }}
            >
              請使用您的員工編號和密碼登入系統
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
