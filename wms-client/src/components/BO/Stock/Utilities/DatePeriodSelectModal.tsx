import React from "react";
import DatePicker from "react-datepicker";

type ButtonSize = "sm" | "lg" | undefined;

interface DatePeriodSelectModalProps {
  startDate: Date;
  endDate: Date;
  dayRange: number;
  btnSize?: ButtonSize;
  btnTitle: string;
  fileType: string;
  handleStartDateSelection: (date: Date | null) => void;
  handleEndDateSelection: (date: Date | null) => void;
  handleDateSelectionModeClick: () => void;
}

const dateSettingAlgorithm = (
  startDate: Date,
  endDate: Date,
  dayRange: number
): boolean => {
  if (endDate < startDate) {
    return true;
  }

  if (endDate.getTime() - startDate.getTime() > 86400000 * dayRange) {
    return true;
  }

  return false;
};

const getClassNameString = (btnSize: ButtonSize): string => {
  let classNameString = "btn btn-info";

  switch (btnSize) {
    case "sm":
      classNameString = "btn btn-sm btn-info";
      break;
    case "lg":
      classNameString = "btn btn-lg btn-info";
      break;
    default:
      break;
  }

  return classNameString;
};

const DatePeriodSelectModal: React.FC<DatePeriodSelectModalProps> = ({
  startDate,
  endDate,
  dayRange,
  btnSize,
  btnTitle,
  fileType,
  handleStartDateSelection,
  handleEndDateSelection,
  handleDateSelectionModeClick,
}) => {
  const wrongDateSetting = dateSettingAlgorithm(startDate, endDate, dayRange);

  return (
    <React.Fragment>
      <button
        className={getClassNameString(btnSize)}
        data-toggle="modal"
        data-target={"#dateCondition-" + fileType}
      >
        {btnTitle}
      </button>
      <div
        className="modal fade"
        id={"dateCondition-" + fileType}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="content"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark, #138496) 100%)',
                color: 'var(--color-white)',
                borderBottom: 'none',
                padding: 'var(--spacing-4)',
              }}
            >
              <h5
                className="modal-title"
                style={{
                  fontWeight: 'var(--font-weight-semibold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                }}
              >
                <i className="fa fa-calendar-alt" aria-hidden="true" />
                時間區間查詢
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col">
                  <label>起始日期</label>
                  <DatePicker
                    name="start"
                    selected={startDate}
                    onChange={handleStartDateSelection}
                  />
                </div>
                <div className="col">
                  <label>結束日期</label>
                  <DatePicker
                    name="end"
                    selected={endDate}
                    onChange={handleEndDateSelection}
                  />
                </div>
              </div>
              <small className="text-muted">時間區間最長{dayRange}天</small>
              <br />
              {wrongDateSetting && (
                <small className="text-danger">
                  日期設定錯誤，請修改日期
                </small>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-dismiss="modal"
                disabled={wrongDateSetting}
                onClick={handleDateSelectionModeClick}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default DatePeriodSelectModal;
