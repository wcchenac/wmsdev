import React, { ChangeEvent } from "react";

interface WaitHandleStatusItem {
  quantity: string | number;
  unit: string;
}

interface WaitHandleProductStatus {
  [type: string]: WaitHandleStatusItem;
}

interface CheckBoxForSelectionBoardProps {
  productNo: string;
  index: number;
  checked: boolean;
  waitHandleStatus: WaitHandleProductStatus;
  handleCheckBoxSelected: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
}

const checkBoxDisableAlgorithm = (waitHandleStatus: WaitHandleProductStatus): boolean => {
  let result = true;

  Object.keys(waitHandleStatus).forEach((type) => {
    if (parseFloat(waitHandleStatus[type].quantity as string) !== 0) {
      result = false;
    }
  });

  return result;
};

const CheckBoxForSelectionBoard: React.FC<CheckBoxForSelectionBoardProps> = ({
  productNo,
  index,
  checked,
  waitHandleStatus,
  handleCheckBoxSelected,
}) => {
  const handleChecked = (e: ChangeEvent<HTMLInputElement>): void => {
    handleCheckBoxSelected(e, index);
  };

  const validation = checkBoxDisableAlgorithm(waitHandleStatus);

  return (
    <div className="card w-50">
      <div
        className={
          validation
            ? "card-body bg-secondary text-white"
            : "card-body bg-light"
        }
      >
        <div className="row">
          <div className="col-md-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={"checkbox-" + index}
                checked={checked}
                disabled={validation}
                onChange={handleChecked}
              />
              <label
                className={
                  validation
                    ? "form-check-label bg-secondary text-white"
                    : "form-check-label bg-light"
                }
                htmlFor={"checkbox-" + index}
              >
                {productNo}
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <label className="mb-0">待處理:</label>
          </div>
          <div className="col-md-5">
            {Object.keys(waitHandleStatus).map((type, idx) => {
              return (
                <div key={idx}>
                  <div className="row mb-0">
                    <label className="col-auto mb-0">{type.toString()}</label>
                    <label className="col-auto mb-0">
                      {waitHandleStatus[type].quantity +
                        " " +
                        waitHandleStatus[type].unit}
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckBoxForSelectionBoard;
