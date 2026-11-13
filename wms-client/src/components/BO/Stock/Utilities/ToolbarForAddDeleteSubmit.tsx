import React, { ChangeEvent, FormEvent, MouseEvent } from "react";

interface ToolbarForAddDeleteSubmitProps {
  onAddClick: (e: MouseEvent<HTMLButtonElement>) => void;
  onDeleteClick: (e: MouseEvent<HTMLButtonElement>) => void;
  deleteDisabled: boolean;
  handleRowNumSubmit: (e: FormEvent<HTMLFormElement>) => void;
  assignRowNum: string | number;
  handleRowNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmitClick: (e: MouseEvent<HTMLButtonElement>) => void;
  submitDisabled: boolean;
  isLoading?: boolean;
}

const ToolbarForAddDeleteSubmit: React.FC<ToolbarForAddDeleteSubmitProps> = ({
  onAddClick,
  onDeleteClick,
  deleteDisabled,
  handleRowNumSubmit,
  assignRowNum,
  handleRowNumChange,
  onSubmitClick,
  submitDisabled,
  isLoading = false,
}) => {
  return (
    <React.Fragment>
      <div className="row">
        <div className="col-md-auto">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={onAddClick}
            disabled={isLoading}
          >
            新增一列
          </button>
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={onDeleteClick}
            disabled={deleteDisabled || isLoading}
          >
            刪除最後一列
          </button>
        </div>
        <div className="col-md-auto me-auto">
          <form className="form-inline" onSubmit={handleRowNumSubmit}>
            <label className="form-label me-2">新增複數列數</label>

            <input
              type="text"
              className="form-control col-3 me-2"
              placeholder="輸入列數"
              name="assignRowNum"
              value={assignRowNum}
              onChange={handleRowNumChange}
              disabled={isLoading}
            />
            <button className="btn btn-primary" disabled={isLoading}>新增</button>
          </form>
        </div>
        <div className="col-md-auto">
          <button
            type="button"
            className="btn btn-primary btn-block d-flex align-items-center justify-content-center"
            style={{ minWidth: "100px" }}
            onClick={onSubmitClick}
            disabled={submitDisabled || isLoading}
          >
            {isLoading ? (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            ) : null}
            {isLoading ? "處理中..." : "送出"}
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ToolbarForAddDeleteSubmit;
