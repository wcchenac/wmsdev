import React, { useState, useCallback, useEffect, useRef, ChangeEvent } from "react";
import { Modal, Button } from "react-bootstrap";
import { copy } from "../../../../../utilities/DeepCopy";
import { RoleOption, RoleOptionKey } from "../../../../../enums/Enums";
import { UpdateUserRequest, User } from "../../../../../types";

interface EditModalProps {
  show: boolean;
  isLoading?: boolean;
  handleModalClose: () => void;
  handleUpdateSubmit: (updateUserRequest: UpdateUserRequest) => Promise<unknown> | void;
  userInfo: User;
}

interface UserInfoState {
  employeeId?: string;
  username?: string;
  fullName?: string;
  role?: string;  // Always string in UI state
  iat?: number;
  exp?: number;
  newPassword?: string;
}

const EditModal: React.FC<EditModalProps> = ({
  show,
  isLoading = false,
  handleModalClose,
  handleUpdateSubmit,
  userInfo: propsUserInfo
}) => {
  const roleTranslate = useCallback((info: User): UserInfoState => {
    const userInfoCopy = copy(info) as UserInfoState;
    if (info.role) {
      // Handle both string and object formats for role
      const roleValue = typeof info.role === 'string'
        ? info.role
        : info.role.authority ?? '';
      const isRoleKey = (key: string): key is RoleOptionKey => Object.hasOwn(RoleOption, key);
      userInfoCopy["role"] = isRoleKey(roleValue) ? RoleOption[roleValue] : roleValue;
    }
    return userInfoCopy;
  }, []);

  const [editMode, setEditMode] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfoState>(() => roleTranslate(propsUserInfo));
  const submittingRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(isLoading);
  isLoadingRef.current = isLoading;

  useEffect(() => {
    if (!show || !isLoading) {
      submittingRef.current = false;
    }
  }, [show, isLoading]);

  const handleEditMode = useCallback((): void => {
    if (isLoading) {
      return;
    }
    setEditMode(prev => !prev);
  }, [isLoading]);

  const handleInfoChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;

    setUserInfo(prevInfo => {
      const infoCopy = copy(prevInfo) as UserInfoState;

      // The name is read-only here: it is shown and sent back unchanged.
      switch (name) {
        case "newPassword":
          infoCopy["newPassword"] = value;
          break;
        case "role":
          infoCopy["role"] = value;
          break;
        default:
          break;
      }

      return infoCopy;
    });
  }, []);

  // The backend rejects an empty role (「請選擇...」): RoleName.valueOf("") fails.
  const canSave = Boolean(userInfo.role);

  const handleUpdateSubmitClick = useCallback((): void => {
    if (isLoading || submittingRef.current || !userInfo.role) {
      return;
    }
    submittingRef.current = true;
    // The backend re-hashes the password whenever newPassword is not null, so a field that
    // was typed in and then cleared (or only spaces) is left out instead of setting "".
    const newPassword = userInfo.newPassword?.trim() ? userInfo.newPassword : undefined;
    const updateInfoRequest: UpdateUserRequest = {
      employeeId: userInfo.employeeId || "",
      newPassword,
      fullName: userInfo.fullName,
      role: userInfo.role
    };

    Promise.resolve(handleUpdateSubmit(updateInfoRequest)).finally(() => {
      if (!isLoadingRef.current) {
        submittingRef.current = false;
      }
    });
  }, [isLoading, userInfo, handleUpdateSubmit]);

  const renderEditModeOff = (): React.ReactNode => {
    // Handle both string and object formats for role display
    const displayRole = propsUserInfo.role
      ? typeof propsUserInfo.role === 'string'
        ? propsUserInfo.role
        : propsUserInfo.role.authority ?? ''
      : '';

    return (
      <React.Fragment>
        <div className="row mb-0">
          <label className="col-6 col-form-label text-center">員工編號</label>
          <label className="col-6 col-form-label">{propsUserInfo.employeeId}</label>
        </div>
        <div className="row mb-0">
          <label className="col-6 col-form-label text-center">姓名</label>
          <label className="col-6 col-form-label">{propsUserInfo.fullName}</label>
        </div>
        <div className="row mb-0">
          <label className="col-6 col-form-label text-center">權限</label>
          <label className="col-6 col-form-label">{displayRole}</label>
        </div>
      </React.Fragment>
    );
  };

  const renderEditModeOn = (): React.ReactNode => {
    return (
      <React.Fragment>
        <div className="row mb-0">
          <label className="col-6 col-form-label text-center">員工編號</label>
          <label className="col-6 col-form-label">{userInfo.employeeId}</label>
        </div>
        <div className="row mb-0">
          <label className="col-6 col-form-label text-center">姓名</label>
          <label className="col-6 col-form-label">{userInfo.fullName}</label>
        </div>
        <div className="row mb-0">
          <label className="col-6 col-form-label text-center">新密碼</label>
          <div className="col-6">
            <input
              type="password"
              className="form-control"
              placeholder="新密碼"
              name="newPassword"
              value={userInfo.newPassword ?? ""}
              disabled={isLoading}
              onChange={handleInfoChange}
            />
          </div>
        </div>
        <div className="mb-3 row pb-0">
          <label className="col-6 col-form-label text-center">權限</label>
          <div className="col-6">
            <select
              name="role"
              className="form-select"
              value={userInfo.role ?? ""}
              disabled={isLoading}
              onChange={handleInfoChange}
            >
              {Object.entries(RoleOption).map(([title, value]) => (
                <option key={title} value={value}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <Modal
      centered
      show={show}
      onHide={isLoading ? undefined : handleModalClose}
      backdrop={isLoading ? "static" : true}
      keyboard={!isLoading}
    >
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title>
          <div className="row">
            <div className="col-md-auto me-auto">
              <p className="h5 mb-0 mt-2">更新員工資料</p>
            </div>
            <div className="col-md-auto">
              <button
                type="button"
                className="border-0 bg-transparent p-0 text-reset"
                aria-label="編輯"
                aria-pressed={editMode}
                disabled={isLoading}
                onClick={handleEditMode}
              >
                <i className="fa fa-pencil" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editMode ? renderEditModeOn() : renderEditModeOff()}
      </Modal.Body>
      {editMode ? (
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose} disabled={isLoading}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateSubmitClick}
            disabled={isLoading || !canSave}
            aria-busy={isLoading}
          >
            {isLoading ? "儲存中..." : "儲存"}
          </Button>
        </Modal.Footer>
      ) : null}
    </Modal>
  );
};

export default EditModal;
