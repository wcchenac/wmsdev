import React, { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { Modal } from "react-bootstrap";
import Select, { MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import { ColorOptions, DefectOptions, DefectOption } from "../../../../../enums/Enums";
import { copy } from "../../../../../utilities/DeepCopy";
import {
  joinInfoDefectArray,
  updateStockInfoCopy,
  defectStringTransToOptions
} from "../../Utilities/StockInfoHelperMethods";
import { StockInfo as StockInfoType, StockIdentifier, UpdateStockInfoRequest } from "../../../../../types";

const animatedComponents = makeAnimated();

// ============================================
// Type Definitions
// ============================================
interface StockInfoWithDefectOptions extends Omit<StockInfoType, 'defect'> {
  defect: DefectOption[];
  stockIdentifier: StockIdentifier;
}


interface InformationModalProps {
  show: boolean;
  isLoading?: boolean;
  onHide: () => void;
  index: number;
  typeValidation: boolean;
  stockInfo: StockInfoType;
  handleStockInfoUpdate: (updateInfoRequest: UpdateStockInfoRequest) => Promise<boolean> | void;
}

// ============================================
// Helper Functions
// ============================================
const stateInitial = (stockInfo: StockInfoType): StockInfoWithDefectOptions => {
  const infoCopy = copy(stockInfo) as StockInfoWithDefectOptions;
  infoCopy.defect = defectStringTransToOptions(stockInfo.defect as string | undefined);
  return infoCopy;
};

// ============================================
// Component
// ============================================
const InformationModal: React.FC<InformationModalProps> = ({
  show,
  isLoading = false,
  onHide,
  index,
  typeValidation,
  stockInfo: propStockInfo,
  handleStockInfoUpdate
}) => {
  const [stockInfo, setStockInfo] = useState<StockInfoWithDefectOptions>(() => stateInitial(propStockInfo));
  const [editMode, setEditMode] = useState<boolean>(false);
  const submittingRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(isLoading);
  isLoadingRef.current = isLoading;

  useEffect(() => {
    setStockInfo(stateInitial(propStockInfo));
    setEditMode(false);
    submittingRef.current = false;
  }, [propStockInfo, show]);

  useEffect(() => {
    if (!isLoading) {
      submittingRef.current = false;
    }
  }, [isLoading]);

  const handleEditMode = useCallback(() => {
    if (isLoading) {
      return;
    }
    if (editMode) {
      setStockInfo(stateInitial(propStockInfo));
    }
    setEditMode((prev) => !prev);
  }, [editMode, isLoading, propStockInfo]);

  const handleInfoChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStockInfo((prev) => {
      const infoCopy = copy(prev) as StockInfoWithDefectOptions;
      updateStockInfoCopy(infoCopy, name, value);
      return infoCopy;
    });
  }, []);

  const handleDefectChange = useCallback((selectedOptions: MultiValue<DefectOption>) => {
    setStockInfo((prev) => {
      const copyInfo = copy(prev) as StockInfoWithDefectOptions;
      copyInfo.defect = selectedOptions as DefectOption[];
      return copyInfo;
    });
  }, []);

  const handleUpdateSubmit = useCallback(async () => {
    if (isLoading || submittingRef.current) {
      return;
    }
    submittingRef.current = true;
    const updateInfoRequest: UpdateStockInfoRequest = {
      id: stockInfo.id,
      color: stockInfo.color,
      defect: joinInfoDefectArray({ defect: stockInfo.defect }),
      record: stockInfo.record,
      remark: stockInfo.remark
    };

    try {
      const ok = await Promise.resolve(handleStockInfoUpdate(updateInfoRequest));
      if (ok !== false) {
        onHide();
      }
    } finally {
      if (!isLoadingRef.current) {
        submittingRef.current = false;
      }
    }
  }, [isLoading, stockInfo, handleStockInfoUpdate, onHide]);

  const renderEditModeOff = (): React.ReactElement => {
    const { stockIdentifier } = propStockInfo;

    return (
      <React.Fragment>
        <div className="modal-body">
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8ca8\u865f"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.productNo}
            </label>
          </div>
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u6279\u865f"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.lotNo}
            </label>
          </div>
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u578b\u614b"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.type}
            </label>
          </div>
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u6578\u91cf"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.quantity}
            </label>
          </div>
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u55ae\u4f4d"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.unit}
            </label>
          </div>
          {typeValidation ? null : (
            <React.Fragment>
              <div className="row mb-0">
                <label className="col-6 col-form-label text-center">{"\u8272\u865f"}</label>
                <label className="col-6 col-form-label">
                  {propStockInfo.color}
                </label>
              </div>
              <div className="row mb-0">
                <label className="col-6 col-form-label text-center">{"\u7455\u75b5"}</label>
                <label className="col-6 col-form-label">
                  {propStockInfo.defect as string}
                </label>
              </div>
              <div className="row mb-0">
                <label className="col-6 col-form-label text-center">
                  {"\u6e1b\u80a5\u65e5\u671f"}
                </label>
                <label className="col-6 col-form-label">
                  {propStockInfo.shrinkAt}
                </label>
              </div>
            </React.Fragment>
          )}
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8a3b\u89e3"}</label>
            <label className="col-6 col-form-label">{propStockInfo.remark}</label>
          </div>
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8a18\u9304"}</label>
            <label className="col-6 col-form-label">{propStockInfo.record}</label>
          </div>
        </div>
        <div className="modal-footer"></div>
      </React.Fragment>
    );
  };

  const renderEditModeOn = (): React.ReactElement => {
    const { stockIdentifier } = stockInfo;

    return (
      <React.Fragment>
        <div className="modal-body">
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8ca8\u865f"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.productNo}
            </label>
          </div>
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u6279\u865f"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.lotNo}
            </label>
          </div>
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u578b\u614b"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.type}
            </label>
          </div>
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u6578\u91cf"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.quantity}
            </label>
          </div>
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u55ae\u4f4d"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.unit}
            </label>
          </div>
          {typeValidation ? null : (
            <React.Fragment>
              <div className="row mb-0">
                <label className="col-6 col-form-label text-center">{"\u8272\u865f"}</label>
                <div className="col-6">
                  <select
                    className="form-select"
                    name="color"
                    value={stockInfo.color}
                    disabled={isLoading}
                    onChange={handleInfoChange}
                  >
                    {ColorOptions.map((color, idx) => (
                      <option key={idx} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row mb-0">
                <label className="col-6 col-form-label text-center">{"\u7455\u75b5"}</label>
                <div className="col-6">
                  <Select
                    closeMenuOnSelect
                    components={animatedComponents}
                    value={stockInfo.defect}
                    isMulti
                    isDisabled={isLoading}
                    name="defect"
                    options={[...DefectOptions]}
                    onChange={handleDefectChange}
                  />
                </div>
              </div>
            </React.Fragment>
          )}
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8a3b\u89e3"}</label>
            <div className="col-6">
              <input
                type="text"
                className="form-control"
                placeholder="註解"
                name="remark"
                value={stockInfo.remark || ""}
                disabled={isLoading}
                onChange={handleInfoChange}
              />
            </div>
          </div>
          <div className="row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8a18\u9304"}</label>
            <div className="col-6">
              <input
                type="text"
                className="form-control"
                placeholder="記錄"
                name="record"
                value={stockInfo.record || ""}
                disabled={isLoading}
                onChange={handleInfoChange}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleEditMode}
            disabled={isLoading}
          >
            {"\u53d6\u6d88"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpdateSubmit}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {"\u78ba\u8a8d"}
          </button>
        </div>
      </React.Fragment>
    );
  };

  return (
    <Modal
      show={show}
      onHide={isLoading ? undefined : onHide}
      backdrop={isLoading ? "static" : true}
      keyboard={!isLoading}
      centered
      scrollable
      // The modal used to be rendered inside a table cell and inherited
      // `.table tbody tr td:last-child { text-align: center }`; keep that look now that it is portaled.
      contentClassName="text-center"
      id={"detailInfo-" + index}
      aria-labelledby={"detailInfo-" + index + "-title"}
    >
      <div
        className="modal-header"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          color: 'var(--color-white)',
          borderBottom: 'none',
          padding: 'var(--spacing-4)',
        }}
      >
        <h5
          className="modal-title"
          id={"detailInfo-" + index + "-title"}
          style={{
            fontWeight: 'var(--font-weight-semibold)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            flex: 1,
          }}
        >
          <i className="fa fa-info-circle" aria-hidden="true" />
          詳細資料
          <button
            type="button"
            className="btn btn-sm btn-outline-light ms-auto"
            onClick={handleEditMode}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)',
              padding: 'var(--spacing-1) var(--spacing-2)',
              borderRadius: 'var(--border-radius-sm)',
            }}
          >
            <i className="fa fa-pencil" aria-hidden="true" />
            {editMode ? '取消編輯' : '編輯'}
          </button>
        </h5>
        <button
          type="button"
          className="btn-close btn-close-white ms-2"
          aria-label="Close"
          onClick={onHide}
          disabled={isLoading}
        />
      </div>
      {editMode ? renderEditModeOn() : renderEditModeOff()}
    </Modal>
  );
};

export default InformationModal;
