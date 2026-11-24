import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getUserList,
  updateUser,
  deleteUser
} from "../../../../../actions/UserActions";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Spinner } from "../../../../Others/Spinner";
import EditModal from "./EditModal";
import ConfirmDialog from "../../../../UI/ConfirmDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { RootState } from "../../../../../store";
import { AppDispatch, UpdateUserRequest, User } from "../../../../../types";
import { isRefreshFailure, notifyRequestFailed } from "../../../../../utilities/notifyRequestFailed";
import { useSubmitLock } from "../../../../../utilities/useSubmitLock";
import { toast } from "react-toastify";

interface UserRow extends User {
  id: string | number;
}

const UserManagement: React.FC = () => {
  const { isLocked: isLoading, isLockedRef, runLocked } = useSubmitLock();
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<User>({});
  // The user waiting for the delete confirmation, if any.
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const queryResult = useSelector((state: RootState) => state.user.users);

  const handleQueryUser = useCallback((): void => {
    void runLocked(() =>
      dispatch(getUserList())
        .then(() => {
          setIsQuery(true);
        })
        .catch(notifyRequestFailed)
    );
  }, [dispatch, runLocked]);

  const handleEditClick = useCallback((data: User): void => {
    setModalShow(true);
    setSelectedData(data);
  }, []);

  const handleModalClose = useCallback((): void => {
    setModalShow(false);
    setSelectedData({});
  }, []);

  const handleUpdateSubmit = useCallback((updateUserRequest: UpdateUserRequest): void => {
    void runLocked(() => {
      setModalShow(false);
      return dispatch(updateUser(updateUserRequest))
        .then(() => {
          setSelectedData({});
          toast.success("已更新員工資料");
        })
        .catch((error) => {
          if (isRefreshFailure(error)) {
            setSelectedData({});
          }
          notifyRequestFailed(error);
        });
    });
  }, [dispatch, runLocked]);

  const handleDeleteSubmit = useCallback((employeeId: string): void => {
    void runLocked(() =>
      dispatch(deleteUser(employeeId))
        .then(() => {
          toast.success(`已刪除員工 ${employeeId}`);
        })
        .catch(notifyRequestFailed)
    );
  }, [dispatch, runLocked]);

  // Deleting cannot be undone, so the delete icon only asks; the dialog's confirm deletes.
  const handleDeleteConfirm = useCallback((): void => {
    if (isLockedRef.current) {
      return;
    }
    const employeeId = deleteTarget?.employeeId;
    setDeleteTarget(null);
    if (employeeId) {
      handleDeleteSubmit(employeeId);
    }
  }, [deleteTarget, handleDeleteSubmit, isLockedRef]);

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
            onClick={() => setDeleteTarget(params.row)}
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
        disabled={isLoading}
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
      <ConfirmDialog
        show={deleteTarget !== null}
        onHide={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        variant="danger"
        title="刪除員工"
        message={`確定要刪除員工 ${deleteTarget?.employeeId ?? ""}（${deleteTarget?.fullName ?? ""}）嗎？刪除後無法復原。`}
        confirmText="刪除"
        cancelText="取消"
      />
    </div>
  );
};

export default UserManagement;
