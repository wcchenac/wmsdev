import React, { useState, useCallback, useMemo, ChangeEvent, MouseEvent } from "react";
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
}) => {
  const [modalShow, setModalShow] = useState(false);

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
    setModalShow(false);
    handleShipCheck(stockInfo.outStockReason !== "", index);
  }, [handleShipCheck, stockInfo.outStockReason, index]);

  const onCancleShipClick = useCallback(() => {
    setModalShow(false);
    handleShipCheck(false, index);
  }, [handleShipCheck, index]);

  const onReansonButtonChange = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      handleReasonButton((e.target as HTMLButtonElement).value, index);
    },
    [handleReasonButton, index]
  );

  const handleModalOpen = useCallback(() => {
    setModalShow(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalShow(false);
  }, []);

  return (
    <tr>
      <td>
        <div className="form-group mb-0">
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
        <div className="form-group mb-0">
          <input
            type="text"
            className="form-control"
            name="lotNo"
            placeholder="批號"
            value={stockInfo.lotNo}
            onChange={onChange}
          />
        </div>
      </td>
      <td>
        {typeValidation ? (
          <div className="form-group mb-0">
            <input
              type="text"
              className="form-control"
              name="type"
              value={stockInfo.type}
              disabled
            />
          </div>
        ) : (
          <div className="form-group mb-0">
            <select
              className="custom-select"
              name="type"
              value={stockInfo.type}
              onChange={onChange}
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
        <div className="form-group mb-0">
          <input
            type="text"
            className={classnames("form-control", {
              "is-invalid": errors.quantity,
            })}
            placeholder="數量"
            name="quantity"
            onChange={onChange}
          />
          {errors.quantity && (
            <div className="invalid-feedback">{errors.quantity}</div>
          )}
        </div>
      </td>
      {typeValidation ? (
        <React.Fragment>
          <td>
            <div className="form-group mb-0">
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
            <div className="form-group mb-0">
              <select
                className="custom-select"
                name="unit"
                value={stockInfo.unit}
                onChange={onChange}
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
            <div className="form-group mb-0">
              <select
                className="custom-select"
                name="color"
                value={stockInfo.color}
                onChange={onChange}
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
              closeMenuOnSelect
              components={animatedComponents}
              defaultValue={stockInfo.defect as DefectOption[]}
              isMulti
              name="defect"
              options={[...DefectOptions]}
              onChange={onDefectChange}
            />
          </td>
        </React.Fragment>
      )}
      <td>
        <div className="form-group mb-0">
          <input
            type="text"
            className="form-control"
            placeholder="記錄"
            name="record"
            value={stockInfo.record}
            onChange={onChange}
          />
        </div>
      </td>
      <td>
        <div className="form-group mt-1 ml-1">
          {stockInfo.outStockReason !== "" ? (
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
