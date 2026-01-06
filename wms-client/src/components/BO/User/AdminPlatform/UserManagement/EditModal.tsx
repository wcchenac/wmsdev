import React, { useState, useCallback, ChangeEvent } from "react";
import { Modal, Button } from "react-bootstrap";
import { copy } from "../../../../../utilities/DeepCopy";
import { RoleOption } from "../../../../../enums/Enums";
import { UpdateUserRequest, User } from "../../../../../types";

interface EditModalProps {
  show: boolean;
  handleModalClose: () => void;
  handleUpdateSubmit: (updateUserRequest: UpdateUserRequest) => void;
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
      userInfoCopy["role"] = RoleOption[roleValue] || roleValue;
    }
    return userInfoCopy;
  }, []);

  const [editMode, setEditMode] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfoState>(() => roleTranslate(propsUserInfo));

  const handleEditMode = useCallback((): void => {
    setEditMode(prev => !prev);
  }, []);

  const handleInfoChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;

    setUserInfo(prevInfo => {
      const infoCopy = copy(prevInfo) as UserInfoState;

      switch (name) {
        case "fullName":
          infoCopy["employeeId"] = value;
          break;
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

  const handleUpdateSubmitClick = useCallback((): void => {
    const updateInfoRequest: UpdateUserRequest = {
      employeeId: userInfo.employeeId || "",
      newPassword: userInfo.newPassword,
      fullName: userInfo.fullName,
      role: userInfo.role
    };

    handleUpdateSubmit(updateInfoRequest);
  }, [userInfo, handleUpdateSubmit]);

  const renderEditModeOff = (): React.ReactNode => {
    // Handle both string and object formats for role display
    const displayRole = propsUserInfo.role
      ? typeof propsUserInfo.role === 'string'
        ? propsUserInfo.role
        : propsUserInfo.role.authority ?? ''
      : '';

    return (
      <React.Fragment>
        <div className="form-group row mb-0">
          <label className="col-6 col-form-label text-center">員工編號</label>
          <label className="col-6 col-form-label">{propsUserInfo.employeeId}</label>
        </div>
        <div className="form-group row mb-0">
          <label className="col-6 col-form-label text-center">姓名</label>
          <label className="col-6 col-form-label">{propsUserInfo.fullName}</label>
        </div>
        <div className="form-group row mb-0">
          <label className="col-6 col-form-label text-center">權限</label>
          <label className="col-6 col-form-label">{displayRole}</label>
        </div>
      </React.Fragment>
    );
  };

  const renderEditModeOn = (): React.ReactNode => {
    return (
      <React.Fragment>
        <div className="form-group row mb-0">
          <label className="col-6 col-form-label text-center">員工編號</label>
          <label className="col-6 col-form-label">{userInfo.employeeId}</label>
        </div>
        <div className="form-group row mb-0">
          <label className="col-6 col-form-label text-center">姓名</label>
          <label className="col-6 col-form-label">{userInfo.fullName}</label>
        </div>
        <div className="form-group row mb-0">
          <label className="col-6 col-form-label text-center">新密碼</label>
          <div className="col-6">
            <input
              type="password"
              className="form-control"
              placeholder="新密碼"
              name="newPassword"
              onChange={handleInfoChange}
            />
          </div>
        </div>
        <div className="form-group row pb-0">
          <label className="col-6 col-form-label text-center">權限</label>
          <div className="col-6">
            <select
              name="role"
              className="custom-select"
              defaultValue={userInfo.role}
              onChange={handleInfoChange}
            >
              {Object.keys(RoleOption).map((title, index) => (
                <option key={index} value={RoleOption[title]}>
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
      onHide={handleModalClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="row">
            <div className="col-md-auto mr-auto">
              <p className="h5 mb-0 mt-2">更新員工資料</p>
            </div>
            <div className="col-md-auto">
              <i
                className="fa fa-pencil"
                aria-hidden="true"
                onClick={handleEditMode}
              ></i>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editMode ? renderEditModeOn() : renderEditModeOff()}
      </Modal.Body>
      {editMode ? (
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleUpdateSubmitClick}>
            儲存
          </Button>
        </Modal.Footer>
      ) : null}
    </Modal>
  );
};

export default EditModal;
