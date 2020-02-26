import React, { Component } from "react";
import classnames from "classnames";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  UnitOptions,
  DefectOptions,
  StockIdentifierType
} from "../../../../../enums/Enums";
import ShipModal from "../../Utilities/ShipModal";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

class ModifyRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalShow: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.onDefectChange = this.onDefectChange.bind(this);
    this.onShipCheck = this.onShipCheck.bind(this);
    this.onReansonButtonChange = this.onReansonButtonChange.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
  }

  handleChange(e) {
    this.props.onRequestChange(e, this.props.index);
  }

  onDefectChange(selectedOptions) {
    this.props.handleDefectChange(selectedOptions, this.props.index);
  }

  onShipCheck(e) {
    this.setState({ modalShow: true });
    this.props.handleShipCheck(e, this.props.index);
  }

  onReansonButtonChange(e) {
    this.props.handleReasonButton(e, this.props.index);
  }

  handleModalClose() {
    this.setState({ modalShow: false });
  }

  render() {
    const { typeValidation, stockInfo } = this.props;
    const animatedComponents = makeAnimated();

    return (
      <tr>
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
                defaultValue={stockInfo.type}
                onChange={this.handleChange}
              >
                <option value={StockIdentifierType.roll}>整支</option>
                <option value={StockIdentifierType.board}>板卷</option>
              </select>
            </div>
          )}
        </td>
        <td>
          <div className="form-group mb-0">
            <input
              type="text"
              className={classnames("form-control", {
                "is-invalid": stockInfo.errors.quantity
              })}
              placeholder="數量"
              name="quantity"
              onChange={this.handleChange}
            />
            {stockInfo.errors.quantity && (
              <div className="invalid-feedback">
                {stockInfo.errors.quantity}
              </div>
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
                  defaultValue={stockInfo.unit}
                  onChange={this.handleChange}
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
              <Select
                closeMenuOnSelect={false}
                components={animatedComponents}
                defaultValue={stockInfo.defect}
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
              placeholder="註解"
              name="remark"
              onChange={this.handleChange}
            />
          </div>
        </td>
        <td>
          <div className="form-check mt-2 ml-2">
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`tooltip-${this.props.index}`}>
                  {stockInfo.outStockReason}
                </Tooltip>
              }
            >
              <input
                type="checkbox"
                className="form-check-input"
                value={stockInfo.directShip}
                checked={stockInfo.outStockReason !== ""}
                onChange={this.onShipCheck}
              />
            </OverlayTrigger>
          </div>
          {stockInfo.directShip && this.state.modalShow ? (
            <ShipModal
              outStockReason={stockInfo.outStockReason}
              onChange={this.handleChange}
              onReansonButtonChange={this.onReansonButtonChange}
              onShipClick={this.handleModalClose}
              handleModalClose={this.handleModalClose}
              show
            />
          ) : null}
        </td>
      </tr>
    );
  }
}

export default ModifyRequest;
