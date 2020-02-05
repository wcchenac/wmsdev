import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getUserList,
  updateUser,
  deleteUser
} from "../../../../../actions/UserActions";
import LoadingOverlay from "react-loading-overlay";
import MaterialTable from "material-table";
import { tableIcons } from "./TableIcons";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import { Spinner } from "../../../../Others/Spinner";
import EditModal from "./EditModal";

class UserManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isQuery: false,
      modalShow: false,
      data: {}
    };
    this.handleQueryUser = this.handleQueryUser.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleUpdateSubmit = this.handleUpdateSubmit.bind(this);
    this.handleDeleteSubmit = this.handleDeleteSubmit.bind(this);
  }

  handleQueryUser() {
    this.setState({ isLoading: true }, () => {
      this.props.getUserList().then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  handleEditClick(data) {
    this.setState({ modalShow: true, data: data });
  }

  handleModalClose() {
    this.setState({ modalShow: false });
  }

  handleUpdateSubmit(updateUserRequest) {
    this.setState({ isLoading: true, modalShow: false }, () => {
      this.props.updateUser(updateUserRequest).then(response => {
        if (response.status === 200) {
          this.setState({ data: {}, isLoading: false });
        }
      });
    });
  }

  handleDeleteSubmit(employeeId) {
    this.setState({ isLoading: true }, () => {
      this.props.deleteUser(employeeId).then(response => {
        if (response.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  render() {
    return (
      <div className="userManagement">
        <div className="container">
          <button
            className="btn btn-sm btn-primary"
            onClick={this.handleQueryUser}
          >
            讀取員工清單
          </button>
          <hr />
          <LoadingOverlay active={this.state.isLoading} spinner={<Spinner />}>
            <div className="scrollbar-70">
              {this.state.isQuery ? (
                <div>
                  <MaterialTable
                    title="員工清單"
                    columns={[
                      { title: "員工編號", field: "employeeId" },
                      { title: "姓名", field: "fullName" },
                      { title: "權限", field: "role" }
                    ]}
                    icons={tableIcons}
                    data={this.props.queryResult}
                    actions={[
                      {
                        icon: () => <Edit />,
                        tooltip: "Edit User",
                        onClick: (event, rowData) =>
                          this.handleEditClick(rowData)
                      },
                      {
                        icon: () => <DeleteOutline />,
                        tooltip: "Delete User",
                        onClick: (event, rowData) => {
                          this.handleDeleteSubmit(rowData.employeeId);
                        }
                      }
                    ]}
                    options={{ filtering: true, draggable: false }}
                  />
                  {this.state.modalShow ? (
                    <EditModal
                      show={this.state.modalShow}
                      userInfo={this.state.data}
                      handleModalClose={this.handleModalClose}
                      handleUpdateSubmit={this.handleUpdateSubmit}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </LoadingOverlay>
        </div>
      </div>
    );
  }
}

UserManagement.propTypes = {
  getUserList: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired,
  deleteUser: PropTypes.func.isRequired,
  queryResult: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  queryResult: state.user.users,
  errors: state.errors
});

export default connect(mapStateToProps, {
  getUserList,
  updateUser,
  deleteUser
})(UserManagement);
