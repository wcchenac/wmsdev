import React, { useCallback, useId, useState } from "react";
import { Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";

type ButtonSize = "sm" | "lg" | undefined;

interface DatePeriodSelectModalProps {
  startDate: Date;
  endDate: Date;
  dayRange: number;
  btnSize?: ButtonSize;
  btnTitle: string;
  fileType: string;
  disabled?: boolean;
  handleStartDateSelection: (date: Date | null) => void;
  handleEndDateSelection: (date: Date | null) => void;
  handleDateSelectionModeClick: (startDate?: Date, endDate?: Date) => void;
}

const MS_PER_DAY = 86_400_000;

const toUtcCalendarDayMs = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Validates that endDate is not before startDate and the calendar-day span does not exceed
 * dayRange (comparing normalized calendar dates rather than raw 23:59:59.999 timestamps).
 */
const dateSettingAlgorithm = (
  startDate: Date,
  endDate: Date,
  dayRange: number
): boolean => {
  const startDayMs = toUtcCalendarDayMs(startDate);
  const endDayMs = toUtcCalendarDayMs(endDate);

  if (endDayMs < startDayMs) {
    return true;
  }

  return (endDayMs - startDayMs) / MS_PER_DAY > dayRange;
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
  disabled = false,
  handleStartDateSelection,
  handleEndDateSelection,
  handleDateSelectionModeClick,
}) => {
  const [show, setShow] = useState(false);
  const [draftStartDate, setDraftStartDate] = useState<Date>(startDate);
  const [draftEndDate, setDraftEndDate] = useState<Date>(endDate);
  const wrongDateSetting = dateSettingAlgorithm(draftStartDate, draftEndDate, dayRange);
  const titleId = "dateCondition-" + fileType + "-title";
  const startDateId = useId();
  const endDateId = useId();

  const handleOpen = useCallback(() => {
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setShow(true);
  }, [startDate, endDate]);

  const handleClose = useCallback(() => {
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setShow(false);
  }, [startDate, endDate]);

  const handleConfirm = useCallback(() => {
    setShow(false);
    handleStartDateSelection(draftStartDate);
    handleEndDateSelection(draftEndDate);
    handleDateSelectionModeClick(draftStartDate, draftEndDate);
  }, [draftStartDate, draftEndDate, handleStartDateSelection, handleEndDateSelection, handleDateSelectionModeClick]);

  return (
    <React.Fragment>
      <button
        type="button"
        className={getClassNameString(btnSize)}
        onClick={handleOpen}
        disabled={disabled}
      >
        {btnTitle}
      </button>
      <Modal
        show={show}
        onHide={handleClose}
        centered
        id={"dateCondition-" + fileType}
        aria-labelledby={titleId}
      >
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
            id={titleId}
            style={{
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
            }}
          >
            <i className="fa fa-calendar" aria-hidden="true" />
            時間區間查詢
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={handleClose}
          />
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col">
              <label htmlFor={startDateId}>起始日期</label>
              <DatePicker
                id={startDateId}
                name="start"
                selected={draftStartDate}
                onChange={(date: Date | null) => {
                  if (date) setDraftStartDate(date);
                }}
              />
            </div>
            <div className="col">
              <label htmlFor={endDateId}>結束日期</label>
              <DatePicker
                id={endDateId}
                name="end"
                selected={draftEndDate}
                onChange={(date: Date | null) => {
                  if (date) setDraftEndDate(date);
                }}
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
            onClick={handleClose}
          >
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={wrongDateSetting}
            onClick={handleConfirm}
          >
            確認
          </button>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default DatePeriodSelectModal;
