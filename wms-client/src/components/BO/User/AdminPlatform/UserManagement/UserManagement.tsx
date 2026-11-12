import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getUserList,
  updateUser,
  deleteUser
} from "../../../../../actions/UserActions";
import LoadingOverlay from "react-loading-overlay";
import MaterialTable, { Icons } from "material-table";
import { tableIcons } from "../../../../Others/TableIcons";
import { Spinner } from "../../../../Others/Spinner";
import EditModal from "./EditModal";

import type { RootState, ErrorState } from "../../../../../types/state";
import type { ApiStatus } from "../../../../../types/domain";
import type { EditableUser } from "./EditModal";

interface StateProps {
  queryResult: EditableUser[];
  errors: ErrorState;
}

interface DispatchProps {
  getUserList: () => Promise<ApiStatus | undefined>;
  updateUser: (request: {
    employeeId?: string;
    newPassword?: string;
    fullName?: string;
    role?: string;
  }) => Promise<ApiStatus | undefined>;
  deleteUser: (employeeId: string) => Promise<ApiStatus | undefined>;
}

type Props = StateProps & DispatchProps;

interface State {
  isLoading: boolean;
  isQuery: boolean;
  modalShow: boolean;
  data: EditableUser;
}


class UserManagement extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      isQuery: false,
      modalShow: false,
      data: {} as EditableUser
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
        if (response && response.status === 200) {
          this.setState({ isLoading: false, isQuery: true });
        }
      });
    });
  }

  handleEditClick(data: EditableUser) {
    this.setState({ modalShow: true, data: data });
  }

  handleModalClose() {
    this.setState({ modalShow: false, data: {} as EditableUser });
  }

  handleUpdateSubmit(updateUserRequest: {
    employeeId?: string;
    newPassword?: string;
    fullName?: string;
    role?: string;
  }) {
    this.setState({ isLoading: true, modalShow: false }, () => {
      this.props.updateUser(updateUserRequest).then(response => {
        if (response && response.status === 200) {
          this.setState({ data: {} as EditableUser, isLoading: false });
        }
      });
    });
  }

  handleDeleteSubmit(employeeId: string) {
    this.setState({ isLoading: true }, () => {
      this.props.deleteUser(employeeId).then(response => {
        if (response && response.status === 200) {
          this.setState({ isLoading: false });
        }
      });
    });
  }

  render() {
    return (
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
                  icons={tableIcons as unknown as Icons}
                  data={this.props.queryResult}
                  actions={[
                    {
                      icon: tableIcons.Edit as unknown as () => React.ReactElement,
                      tooltip: "Edit User",
                      onClick: (_event, rowData) => this.handleEditClick(rowData as EditableUser)
                    },
                    {
                      icon: tableIcons.Delete as unknown as () => React.ReactElement,
                      tooltip: "Delete User",
                      onClick: (_event, rowData) => {
                        this.handleDeleteSubmit((rowData as EditableUser).employeeId ?? "");
                      }
                    }
                  ]}
                  options={{
                    filtering: true,
                    draggable: false,
                    pageSize: 10,
                    pageSizeOptions: [10, 20]
                  }}
                />
                {this.state.modalShow ? (
                  <EditModal
                    show
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
    );
  }
}


const mapStateToProps = (state: RootState): StateProps => ({
  queryResult: state.user.users as EditableUser[],
  errors: state.errors
});

export default connect(mapStateToProps, {
  getUserList,
  updateUser,
  deleteUser
})(UserManagement);
