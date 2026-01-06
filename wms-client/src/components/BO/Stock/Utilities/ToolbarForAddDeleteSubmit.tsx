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
}) => {
  return (
    <React.Fragment>
      <div className="row">
        <div className="col-md-auto">
          <button
            type="button"
            className="btn btn-primary mr-2"
            onClick={onAddClick}
          >
            新增一列
          </button>
          <button
            type="button"
            className="btn btn-primary mr-2"
            onClick={onDeleteClick}
            disabled={deleteDisabled}
          >
            刪除最後一列
          </button>
        </div>
        <div className="col-md-auto mr-auto">
          <form className="form-inline" onSubmit={handleRowNumSubmit}>
            <label className="form-label mr-2">新增複數列數</label>

            <input
              type="text"
              className="form-control col-3 mr-2"
              placeholder="輸入列數"
              name="assignRowNum"
              value={assignRowNum}
              onChange={handleRowNumChange}
            />
            <button className="btn btn-primary">新增</button>
          </form>
        </div>
        <div className="col-md-auto">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={onSubmitClick}
            disabled={submitDisabled}
          >
            送出
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ToolbarForAddDeleteSubmit;
