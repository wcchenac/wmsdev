import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import Select, { MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import { ColorOptions, DefectOptions, DefectOption } from "../../../../../enums/Enums";
import { copy } from "../../../../../utilities/DeepCopy";
import {
  joinInfoDefectArray,
  updateStockInfoCopy,
  defectStringTransToOptions
} from "../../Utilities/StockInfoHelperMethods";
import { StockInfo as StockInfoType, StockIdentifier } from "../../../../../types";

// ============================================
// Type Definitions
// ============================================
interface StockInfoWithDefectOptions extends Omit<StockInfoType, 'defect'> {
  defect: DefectOption[];
  stockIdentifier: StockIdentifier;
}

interface UpdateInfoRequest {
  id?: number;
  color?: string;
  defect?: string;
  record?: string;
  remark?: string;
}

interface InformationModalProps {
  index: number;
  typeValidation: boolean;
  stockInfo: StockInfoType;
  handleStockInfoUpdate: (updateInfoRequest: UpdateInfoRequest) => void;
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
  index,
  typeValidation,
  stockInfo: propStockInfo,
  handleStockInfoUpdate
}) => {
  const [stockInfo, setStockInfo] = useState<StockInfoWithDefectOptions>(() => stateInitial(propStockInfo));
  const [editMode, setEditMode] = useState<boolean>(false);

  useEffect(() => {
    setStockInfo(stateInitial(propStockInfo));
    setEditMode(false);
  }, [propStockInfo]);

  const handleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, []);

  const handleInfoChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStockInfo((prev) => {
      const infoCopy = copy(prev) as StockInfoWithDefectOptions;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateStockInfoCopy(infoCopy as any, name, value);
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

  const handleUpdateSubmit = useCallback(() => {
    const updateInfoRequest: UpdateInfoRequest = {
      id: stockInfo.id,
      color: stockInfo.color,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defect: joinInfoDefectArray(stockInfo as any),
      record: stockInfo.record,
      remark: stockInfo.remark
    };

    handleStockInfoUpdate(updateInfoRequest);
  }, [stockInfo, handleStockInfoUpdate]);

  const renderEditModeOff = (): React.ReactElement => {
    const { stockIdentifier } = propStockInfo;

    return (
      <React.Fragment>
        <div className="modal-body">
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8ca8\u865f"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.productNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u6279\u865f"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.lotNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u578b\u614b"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.type}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u6578\u91cf"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.quantity}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u55ae\u4f4d"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.unit}
            </label>
          </div>
          {typeValidation ? null : (
            <React.Fragment>
              <div className="form-group row mb-0">
                <label className="col-6 col-form-label text-center">{"\u8272\u865f"}</label>
                <label className="col-6 col-form-label">
                  {propStockInfo.color}
                </label>
              </div>
              <div className="form-group row mb-0">
                <label className="col-6 col-form-label text-center">{"\u7461\u75b5"}</label>
                <label className="col-6 col-form-label">
                  {propStockInfo.defect as string}
                </label>
              </div>
              <div className="form-group row mb-0">
                <label className="col-6 col-form-label text-center">
                  {"\u6e1b\u80a5\u65e5\u671f"}
                </label>
                <label className="col-6 col-form-label">
                  {propStockInfo.shrinkAt}
                </label>
              </div>
            </React.Fragment>
          )}
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8a3b\u89e3"}</label>
            <label className="col-6 col-form-label">{propStockInfo.remark}</label>
          </div>
          <div className="form-group row mb-0">
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
    const animatedComponents = makeAnimated();

    return (
      <React.Fragment>
        <div className="modal-body">
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8ca8\u865f"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.productNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u6279\u865f"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.lotNo}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u578b\u614b"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.type}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u6578\u91cf"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.quantity}
            </label>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u55ae\u4f4d"}</label>
            <label className="col-6 col-form-label">
              {stockIdentifier?.unit}
            </label>
          </div>
          {typeValidation ? null : (
            <React.Fragment>
              <div className="form-group row mb-0">
                <label className="col-6 col-form-label text-center">{"\u8272\u865f"}</label>
                <div className="col-6">
                  <select
                    className="custom-select"
                    name="color"
                    value={stockInfo.color}
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
              <div className="form-group row mb-0">
                <label className="col-6 col-form-label text-center">{"\u7461\u75b5"}</label>
                <div className="col-6">
                  <Select
                    closeMenuOnSelect
                    components={animatedComponents}
                    defaultValue={stockInfo.defect}
                    isMulti
                    name="defect"
                    options={DefectOptions as unknown as DefectOption[]}
                    onChange={handleDefectChange}
                  />
                </div>
              </div>
            </React.Fragment>
          )}
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8a3b\u89e3"}</label>
            <div className="col-6">
              <input
                type="text"
                className="form-control"
                placeholder="\u8a3b\u89e3"
                name="remark"
                value={stockInfo.remark || ""}
                onChange={handleInfoChange}
              />
            </div>
          </div>
          <div className="form-group row mb-0">
            <label className="col-6 col-form-label text-center">{"\u8a18\u9304"}</label>
            <div className="col-6">
              <input
                type="text"
                className="form-control"
                placeholder="\u8a18\u9304"
                name="record"
                value={stockInfo.record || ""}
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
          >
            {"\u53d6\u6d88"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-dismiss="modal"
            onClick={handleUpdateSubmit}
          >
            {"\u78ba\u8a8d"}
          </button>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div
      className="modal fade"
      id={"detailInfo-" + index}
      tabIndex={-1}
      role="dialog"
      aria-labelledby="content"
      aria-hidden="true"
    >
      <div
        className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
        role="document"
      >
        <div className="modal-content">
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
              className="close ms-2"
              data-dismiss="modal"
              aria-label="Close"
              style={{ color: 'var(--color-white)', opacity: 0.8 }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          {editMode ? renderEditModeOn() : renderEditModeOff()}
        </div>
      </div>
    </div>
  );
};

export default InformationModal;
