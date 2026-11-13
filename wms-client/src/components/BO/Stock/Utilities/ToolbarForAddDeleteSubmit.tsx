import React, { ChangeEvent, FormEvent, MouseEvent, useId } from "react";
import { exceedsRowCountLimit, MAX_ASSIGN_ROW_COUNT } from "./StockInfoHelperMethods";

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
  const rowLimitHintId = useId();
  const tooManyRows = exceedsRowCountLimit(assignRowNum);

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
          <form className="d-flex align-items-center" onSubmit={handleRowNumSubmit}>
            <label className="form-label mb-0 me-2 text-nowrap">新增複數列數</label>

            <div className="position-relative me-2">
              <input
                type="text"
                className={"form-control w-auto" + (tooManyRows ? " is-invalid" : "")}
                placeholder="輸入列數"
                name="assignRowNum"
                value={assignRowNum}
                onChange={handleRowNumChange}
                disabled={isLoading}
                aria-invalid={tooManyRows || undefined}
                aria-describedby={tooManyRows ? rowLimitHintId : undefined}
              />
              {tooManyRows ? (
                <div id={rowLimitHintId} className="invalid-tooltip">
                  一次最多新增 {MAX_ASSIGN_ROW_COUNT} 列
                </div>
              ) : null}
            </div>
            <button className="btn btn-primary text-nowrap" disabled={isLoading || tooManyRows}>新增</button>
          </form>
        </div>
        <div className="col-md-auto">
          <button
            type="button"
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
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
