import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getUserList,
  updateUser,
  deleteUser
} from "../../../../../actions/UserActions";
import LoadingOverlay from "react-loading-overlay-ts";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Spinner } from "../../../../Others/Spinner";
import EditModal from "./EditModal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { RootState } from "../../../../../store";
import { AppDispatch, UpdateUserRequest, User } from "../../../../../types";

interface UserRow extends User {
  id: string | number;
}

const UserManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<User>({});

  const dispatch = useDispatch<AppDispatch>();
  const queryResult = useSelector((state: RootState) => state.user.users);

  const handleQueryUser = useCallback((): void => {
    setIsLoading(true);
    dispatch(getUserList()).then((response) => {
      if (response?.status === 200) {
        setIsLoading(false);
        setIsQuery(true);
      }
    }).catch(() => {
      setIsLoading(false);
    });
  }, [dispatch]);

  const handleEditClick = useCallback((data: User): void => {
    setModalShow(true);
    setSelectedData(data);
  }, []);

  const handleModalClose = useCallback((): void => {
    setModalShow(false);
    setSelectedData({});
  }, []);

  const handleUpdateSubmit = useCallback((updateUserRequest: UpdateUserRequest): void => {
    setIsLoading(true);
    setModalShow(false);
    dispatch(updateUser(updateUserRequest)).then((response) => {
      if (response?.status === 200) {
        setSelectedData({});
        setIsLoading(false);
      }
    }).catch(() => {
      setIsLoading(false);
    });
  }, [dispatch]);

  const handleDeleteSubmit = useCallback((employeeId: string): void => {
    setIsLoading(true);
    dispatch(deleteUser(employeeId)).then((response) => {
      if (response?.status === 200) {
        setIsLoading(false);
      }
    }).catch(() => {
      setIsLoading(false);
    });
  }, [dispatch]);

  const columns: GridColDef[] = [
    { field: "employeeId", headerName: "員工編號", flex: 1 },
    { field: "fullName", headerName: "姓名", flex: 1 },
    { field: "role", headerName: "權限", flex: 1 },
    {
      field: "actions",
      headerName: "操作",
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams<UserRow>) => (
        <>
          <IconButton
            size="small"
            onClick={() => handleEditClick(params.row)}
            aria-label="編輯"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteSubmit(params.row.employeeId || "")}
            aria-label="刪除"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      )
    }
  ];

  const rows: UserRow[] = queryResult.map((user, index) => ({
    id: user.employeeId || index,
    ...user
  }));

  return (
    <div className="container">
      <button
        className="btn btn-sm btn-primary"
        onClick={handleQueryUser}
      >
        讀取員工清單
      </button>
      <hr />
      <LoadingOverlay active={isLoading} spinner={<Spinner />}>
        <div className="scrollbar-70">
          {isQuery ? (
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[10, 20]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } }
                }}
                disableRowSelectionOnClick
              />
              {modalShow && (
                <EditModal
                  show
                  userInfo={selectedData}
                  handleModalClose={handleModalClose}
                  handleUpdateSubmit={handleUpdateSubmit}
                />
              )}
            </div>
          ) : null}
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default UserManagement;
