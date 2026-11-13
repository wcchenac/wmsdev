import React, { Component } from "react";
import type { StatusByType } from "../../../../../types/domain";

interface Props {
  index: number;
  productNo: string;
  checked: boolean;
  waitHandleStatus: StatusByType;
  handleCheckBoxSelected: (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void;
}

class CheckBoxForSelectionBoard extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.handleChecked = this.handleChecked.bind(this);
  }

  handleChecked(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.handleCheckBoxSelected(e, this.props.index);
  }

  checkBoxDisableAlgorithm(waitHandleStatus: StatusByType) {
    let result = true;

    Object.keys(waitHandleStatus).forEach((type) => {
      if (parseFloat(waitHandleStatus[type].quantity) !== 0) {
        return (result = false);
      }
    });

    return result;
  }

  render() {
    const { productNo, index, checked, waitHandleStatus } = this.props;
    const validation = this.checkBoxDisableAlgorithm(waitHandleStatus);

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
                  onChange={this.handleChecked}
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
              {Object.keys(waitHandleStatus).map((type, typeIndex) => {
                return (
                  <div key={typeIndex}>
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
  }
}

export default CheckBoxForSelectionBoard;
