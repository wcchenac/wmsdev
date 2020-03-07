import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
import { copy } from "../../../../../utilities/DeepCopy";
import { RoleOption } from "../../../../../enums/Enums";

class EditModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      userInfo: this.roleTranslate(this.props.userInfo)
    };
    this.handleEditMode = this.handleEditMode.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleUpdateSubmit = this.handleUpdateSubmit.bind(this);
  }

  roleTranslate(userInfo) {
    let userInfoCopy = copy(userInfo);

    userInfoCopy["role"] = RoleOption[userInfo.role];

    return userInfoCopy;
  }

  handleEditMode() {
    this.setState({ editMode: !this.state.editMode });
  }

  handleInfoChange(e) {
    let infoCopy = copy(this.state.userInfo);
    const { name, value } = e.target;

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

    this.setState({ userInfo: infoCopy });
  }

  handleUpdateSubmit() {
    let { userInfo } = this.state;

    const updateInfoRequest = {
      employeeId: userInfo.employeeId,
      newPassword: userInfo.newPassword,
      fullName: userInfo.fullName,
      role: userInfo.role
    };

    this.props.handleUpdateSubmit(updateInfoRequest);
  }

  renderEditModeOff() {
    const { userInfo } = this.props;

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
          <label className="col-6 col-form-label text-center">權限</label>
          <label className="col-6 col-form-label">{userInfo.role}</label>
        </div>
      </React.Fragment>
    );
  }

  renderEditModeOn() {
    const { userInfo } = this.state;

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
              onChange={this.handleInfoChange}
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
              onChange={this.handleInfoChange}
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
  }

  render() {
    const { editMode } = this.state;

    return (
      <Modal
        centered
        show={this.props.show}
        onHide={this.props.handleModalClose}
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
                  onClick={this.handleEditMode}
                ></i>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editMode ? this.renderEditModeOn() : this.renderEditModeOff()}
        </Modal.Body>
        {editMode ? (
          <Modal.Footer>
            <Button variant="secondary" onClick={this.props.handleModalClose}>
              取消
            </Button>
            <Button variant="primary" onClick={this.handleUpdateSubmit}>
              儲存
            </Button>
          </Modal.Footer>
        ) : null}
      </Modal>
    );
  }
}

export default EditModal;
