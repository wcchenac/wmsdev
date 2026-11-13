import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import classnames from "classnames";
import { login } from "../../../actions/UserActions";
import { RootState } from "../../../store";

interface LoginErrors {
  username?: string;
  password?: string;
}

interface TouchedFields {
  employeeId: boolean;
  password: boolean;
}

const Login: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  // Redux state
  const user = useSelector((state: RootState) => state.user);
  const reduxErrors = useSelector((state: RootState) => state.errors) as LoginErrors | null;

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

  useEffect(() => {
    if (reduxErrors) {
      setErrors(reduxErrors);
      setIsSubmitting(false);
    }
  }, [reduxErrors]);

  const userKeyInChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    if (name === "employeeId") {
      setEmployeeId(value);
    } else if (name === "password") {
      setPassword(value);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name === "employeeId" ? "username" : name]: ""
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

    dispatch(login(loginRequest));
  };

  const hasEmployeeIdError = touched.employeeId && errors.username;
  const hasPasswordError = touched.password && errors.password;

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
                  <div className="form-group mb-4">
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
                        "is-valid": touched.employeeId && !errors.username && employeeId
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
                  <div className="form-group mb-4">
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
                        "is-valid": touched.password && !errors.password && password
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

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className={classnames("btn btn-primary btn-block py-2", {
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
                          <span className="sr-only">登入中...</span>
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
