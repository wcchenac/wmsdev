import React, { useState, ChangeEvent, FormEvent } from "react";
import { useDispatch } from "react-redux";
import { RoleOption } from "../../../../enums/Enums";
import { registerUser } from "../../../../actions/UserActions";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import { toast } from "react-toastify";
import { notifyRequestFailed } from "../../../../utilities/notifyRequestFailed";
import "react-toastify/dist/ReactToastify.css";
import { AppDispatch } from "../../../../types";

interface UserRegisterState {
  isLoading: boolean;
  employeeId: string;
  fullName: string;
  password: string;
  role: string;
}

/**
 * The backend's 400 answers (ApiResponse) to a registration the admin can fix, in Chinese.
 */
const REGISTER_REJECTED_MESSAGES = new Map<string, string>([
  ["EmployeeId is already exists!", "員工編號已存在"],
  ["Role setting error", "角色設定錯誤"],
]);

/** The Chinese message for a 400 the admin can fix, or undefined for any other failure. */
function registerRejectedMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = error.response;
  if (typeof response !== "object" || response === null) return undefined;
  if (!("status" in response) || response.status !== 400) return undefined;
  const data = "data" in response ? response.data : undefined;
  if (typeof data !== "object" || data === null || !("message" in data)) return undefined;
  const message = data.message;
  return typeof message === "string" ? REGISTER_REJECTED_MESSAGES.get(message) : undefined;
}

const initialState: UserRegisterState = {
  isLoading: false,
  employeeId: "",
  fullName: "",
  password: "",
  role: ""
};

const UserRegister: React.FC = () => {
  const [state, setState] = useState<UserRegisterState>(initialState);
  const dispatch = useDispatch<AppDispatch>();

  const userKeyInChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const { employeeId, fullName, password, role } = state;

    const registration = {
      employeeId,
      fullName,
      password,
      role,
      username: employeeId,
      confirmPassword: password
    };

    setState((prev) => ({ ...prev, isLoading: true }));

    dispatch(registerUser(registration))
      .then(() => {
        setState(initialState);
        toast.success("新增使用者成功");
      })
      .catch((error) => {
        setState((prev) => ({ ...prev, isLoading: false }));
        // A taken employee ID or an unknown role is named so the admin can fix it; anything
        // else (and the 401 left to API.ts) gets the usual handling.
        const rejectedMessage = registerRejectedMessage(error);
        if (rejectedMessage) {
          toast.error(rejectedMessage);
        } else {
          notifyRequestFailed(error);
        }
      });
  };

  const submissionValidate = (): boolean => {
    const { employeeId, fullName, password, role } = state;
    return !(employeeId !== "" && fullName !== "" && password !== "" && role !== "");
  };

  return (
    <div className="container">
      <LoadingOverlay active={state.isLoading} spinner={<Spinner />}>
        <div style={{ height: "80vh" }}>
          <div className="row justify-content-center">
            <div
              className="col-4"
              style={{ border: "1px solid black", borderRadius: "5px" }}
            >
              <div className="mt-2 mb-3">
                <p className="h5 text-center mb-3">註冊新員工</p>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3 row">
                    <label htmlFor="employeeId" className="col-4 col-form-label">
                      員工編號
                    </label>
                    <div className="col-8">
                      <input
                        type="text"
                        id="employeeId"
                        name="employeeId"
                        className="form-control"
                        placeholder="員工編號"
                        value={state.employeeId}
                        onChange={userKeyInChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label htmlFor="fullName" className="col-4 col-form-label">
                      姓名
                    </label>
                    <div className="col-8">
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        className="form-control"
                        placeholder="姓名"
                        value={state.fullName}
                        onChange={userKeyInChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label htmlFor="password" className="col-4 col-form-label">
                      密碼
                    </label>
                    <div className="col-8">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-control"
                        placeholder="密碼"
                        value={state.password}
                        onChange={userKeyInChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label htmlFor="role" className="col-4 col-form-label">
                      權限
                    </label>
                    <div className="col-8">
                      <select
                        id="role"
                        name="role"
                        className="form-select"
                        value={state.role}
                        onChange={userKeyInChange}
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
                        className="btn btn-primary w-100"
                        disabled={submissionValidate()}
                      >
                        註冊
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default UserRegister;
