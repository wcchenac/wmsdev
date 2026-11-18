import React, { useState, useCallback, useMemo, useRef, ChangeEvent, MouseEvent } from "react";
import classnames from "classnames";
import Select, { MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import {
  UnitOptions,
  ColorOptions,
  DefectOptions,
  DefectOption,
} from "../../../../../enums/Enums";
import ShipModal from "../../Utilities/ShipModal";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";

interface StockInfoErrors {
  quantity: string;
}

interface StockInfoData {
  productNo: string;
  lotNo: string;
  type: string;
  quantity: string;
  unit: string;
  color: string;
  defect: DefectOption[] | string;
  record: string;
  remark: string;
  inStockType: string;
  orderNo: string;
  directShip: boolean;
  outStockReason: string;
  errors: StockInfoErrors;
}

interface StockInfoProps {
  typeValidation: boolean;
  errors: StockInfoErrors;
  stockInfo: StockInfoData;
  index: number;
  typeList: string[];
  handleInfoChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => void;
  handleDefectChange: (selectedOptions: MultiValue<DefectOption>, index: number) => void;
  handleShipCheck: (checked: boolean, index: number) => void;
  handleReasonButton: (value: string, index: number) => void;
  disabled?: boolean;
}

const StockInfo: React.FC<StockInfoProps> = ({
  typeValidation,
  errors,
  stockInfo,
  index,
  typeList,
  handleInfoChange,
  handleDefectChange,
  handleShipCheck,
  handleReasonButton,
  disabled = false,
}) => {
  const [modalShow, setModalShow] = useState(false);
  const reasonAtOpen = useRef(stockInfo.outStockReason);
  const skipRestore = useRef(false);

  const animatedComponents = useMemo(() => makeAnimated(), []);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      handleInfoChange(e, index);
    },
    [handleInfoChange, index]
  );

  const onDefectChange = useCallback(
    (selectedOptions: MultiValue<DefectOption>) => {
      handleDefectChange(selectedOptions, index);
    },
    [handleDefectChange, index]
  );

  const onShipCheck = useCallback(() => {
    skipRestore.current = true;
    setModalShow(false);
    handleShipCheck(stockInfo.outStockReason !== "", index);
  }, [handleShipCheck, stockInfo.outStockReason, index]);

  const onCancleShipClick = useCallback(() => {
    if (disabled) return;
    skipRestore.current = true;
    setModalShow(false);
    handleShipCheck(false, index);
  }, [handleShipCheck, index, disabled]);

  const onReansonButtonChange = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      handleReasonButton((e.target as HTMLButtonElement).value, index);
    },
    [handleReasonButton, index]
  );

  const handleModalOpen = useCallback(() => {
    if (disabled) return;
    skipRestore.current = false;
    reasonAtOpen.current = stockInfo.outStockReason;
    setModalShow(true);
  }, [disabled, stockInfo.outStockReason]);

  const handleModalClose = useCallback(() => {
    const restore = !skipRestore.current;
    const previous = reasonAtOpen.current;
    skipRestore.current = false;
    setModalShow(false);
    // Backdrop and the close X dismiss without confirming: put the reason back and
    // leave directShip unchanged. Confirm and 取消 set skipRestore.
    if (restore && stockInfo.outStockReason !== previous) {
      handleReasonButton(previous, index);
    }
  }, [handleReasonButton, index, stockInfo.outStockReason]);

  return (
    <tr>
      <td>
        <div className="mb-0">
          <input
            type="text"
            className="form-control"
            name="productNo"
            value={stockInfo.productNo}
            disabled
          />
        </div>
      </td>
      <td>
        <div className="mb-0">
          <input
            type="text"
            className="form-control"
            name="lotNo"
            placeholder="批號"
            value={stockInfo.lotNo}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </td>
      <td>
        {typeValidation ? (
          <div className="mb-0">
            <input
              type="text"
              className="form-control"
              name="type"
              value={stockInfo.type}
              disabled
            />
          </div>
        ) : (
          <div className="mb-0">
            <select
              className="form-select"
              name="type"
              value={stockInfo.type}
              onChange={onChange}
              disabled={disabled}
            >
              {typeList.map((type, idx) => (
                <option key={idx} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}
      </td>
      <td>
        <div className="mb-0">
          <input
            type="text"
            className={classnames("form-control", {
              "is-invalid": errors.quantity,
            })}
            placeholder="數量"
            name="quantity"
            value={stockInfo.quantity}
            onChange={onChange}
            disabled={disabled}
          />
          {errors.quantity && (
            <div className="invalid-feedback">{errors.quantity}</div>
          )}
        </div>
      </td>
      {typeValidation ? (
        <React.Fragment>
          <td>
            <div className="mb-0">
              <input
                type="text"
                className="form-control"
                name="unit"
                value={stockInfo.unit}
                disabled
              />
            </div>
          </td>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <td>
            <div className="mb-0">
              <select
                className="form-select"
                name="unit"
                value={stockInfo.unit}
                onChange={onChange}
                disabled={disabled}
              >
                {UnitOptions.map((unit, idx) => (
                  <option key={idx} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </td>
          <td>
            <div className="mb-0">
              <select
                className="form-select"
                name="color"
                value={stockInfo.color}
                onChange={onChange}
                disabled={disabled}
              >
                {ColorOptions.map((color, idx) => (
                  <option key={idx} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </td>
          <td>
            <Select
              className="stock-defect-select"
              closeMenuOnSelect
              components={animatedComponents}
              value={stockInfo.defect as DefectOption[]}
              isMulti
              menuPosition="fixed"
              name="defect"
              options={[...DefectOptions]}
              onChange={onDefectChange}
              isDisabled={disabled}
            />
          </td>
        </React.Fragment>
      )}
      <td>
        <div className="mb-0">
          <input
            type="text"
            className="form-control"
            placeholder="記錄"
            name="record"
            value={stockInfo.record}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </td>
      <td>
        <div className="mb-3 mt-1 ms-1" style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
          {stockInfo.directShip ? (
            <OverlayTrigger
              key={index}
              overlay={
                <Tooltip id={`tooltip-${index}`} placement="bottom">
                  {stockInfo.outStockReason}
                </Tooltip>
              }
            >
              <CheckBoxRoundedIcon onClick={onCancleShipClick} />
            </OverlayTrigger>
          ) : (
            <CheckBoxOutlineBlankRoundedIcon onClick={handleModalOpen} />
          )}
        </div>
        {modalShow ? (
          <ShipModal
            outStockReason={stockInfo.outStockReason}
            onChange={onChange}
            onReansonButtonChange={onReansonButtonChange}
            onShipClick={onShipCheck}
            onCancleShipClick={onCancleShipClick}
            handleModalClose={handleModalClose}
            show
          />
        ) : null}
      </td>
    </tr>
  );
};

export default StockInfo;
