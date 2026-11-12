import React, { Component } from "react";
import classnames from "classnames";
import Select, { ValueType } from "react-select";
import { animatedSelectComponents } from "../../../../../types/select";
import {
  UnitOptions,
  ColorOptions,
  DefectOptions,
} from "../../../../../enums/Enums";
import ShipModal from "../../Utilities/ShipModal";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import CheckBoxRoundedIcon from "@material-ui/icons/CheckBoxRounded";
import CheckBoxOutlineBlankRoundedIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import type { DefectOption, FieldErrors } from "../../../../../types/domain";

export interface InStockEditorRow {
  productNo: string;
  lotNo: string;
  type: string;
  quantity: string;
  unit: string;
  color?: string | number;
  defect?: DefectOption[] | readonly DefectOption[] | string | null;
  record: string;
  remark?: string;
  outStockReason: string;
  errors: FieldErrors;
  directShip?: boolean;
  inStockType?: string;
  orderNo?: string;
}

type FieldChange = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;

interface Props {
  index: number;
  typeList: string[];
  typeValidation: boolean;
  stockInfo: InStockEditorRow;
  errors: FieldErrors;
  handleInfoChange: (event: FieldChange, index: number) => void;
  handleDefectChange: (
    selectedOptions: ValueType<DefectOption, true>,
    index: number
  ) => void;
  handleShipCheck: (checked: boolean, index: number) => void;
  handleReasonButton: (value: string, index: number) => void;
}

interface State {
  modalShow: boolean;
}

class StockInfo extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      modalShow: false,
    };
    this.onChange = this.onChange.bind(this);
    this.onDefectChange = this.onDefectChange.bind(this);
    this.onShipCheck = this.onShipCheck.bind(this);
    this.onCancleShipClick = this.onCancleShipClick.bind(this);
    this.onReansonButtonChange = this.onReansonButtonChange.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
  }

  onChange(e: FieldChange) {
    this.props.handleInfoChange(e, this.props.index);
  }

  onDefectChange(selectedOptions: ValueType<DefectOption, true>) {
    this.props.handleDefectChange(selectedOptions, this.props.index);
  }

  onShipCheck() {
    this.setState({ modalShow: false }, () => {
      this.props.handleShipCheck(
        this.props.stockInfo.outStockReason !== "",
        this.props.index
      );
    });
  }

  onCancleShipClick() {
    this.setState({ modalShow: false }, () => {
      this.props.handleShipCheck(false, this.props.index);
    });
  }

  onReansonButtonChange(e: React.MouseEvent<HTMLButtonElement>) {
    this.props.handleReasonButton(
      (e.target as HTMLButtonElement).value,
      this.props.index
    );
  }

  handleModalOpen() {
    this.setState({ modalShow: true });
  }

  handleModalClose() {
    this.setState({ modalShow: false });
  }

  render() {
    const { typeValidation, errors, stockInfo } = this.props;
    const animatedComponents = animatedSelectComponents<DefectOption, true>();
    const defectValue = Array.isArray(stockInfo.defect)
      ? [...stockInfo.defect]
      : [];

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
              onChange={this.onChange}
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
                onChange={this.onChange}
              >
                {this.props.typeList.map((type, index) => (
                  <option key={index} value={type}>
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
              onChange={this.onChange}
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
                  onChange={this.onChange}
                >
                  {UnitOptions.map((unit, index) => (
                    <option key={index} value={unit}>
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
                  onChange={this.onChange}
                >
                  {ColorOptions.map((color, index) => (
                    <option key={index} value={color}>
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
                defaultValue={defectValue}
                isMulti
                name="defect"
                options={DefectOptions}
                onChange={this.onDefectChange}
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
              onChange={this.onChange}
            />
          </div>
        </td>
        <td>
          <div className="form-group mt-1 ml-1">
            {stockInfo.outStockReason !== "" ? (
              <OverlayTrigger
                key={this.props.index}
                overlay={
                  <Tooltip id={`tooltip-${this.props.index}`} placement="bottom">
                    {stockInfo.outStockReason}
                  </Tooltip>
                }
              >
                <CheckBoxRoundedIcon onClick={this.onCancleShipClick} />
              </OverlayTrigger>
            ) : (
              <CheckBoxOutlineBlankRoundedIcon onClick={this.handleModalOpen} />
            )}
          </div>
          {this.state.modalShow ? (
            <ShipModal
              outStockReason={stockInfo.outStockReason}
              onChange={this.onChange}
              onReansonButtonChange={this.onReansonButtonChange}
              onShipClick={this.onShipCheck}
              onCancleShipClick={this.onCancleShipClick}
              handleModalClose={this.handleModalClose}
              show
            />
          ) : null}
        </td>
      </tr>
    );
  }
}

export default StockInfo;
