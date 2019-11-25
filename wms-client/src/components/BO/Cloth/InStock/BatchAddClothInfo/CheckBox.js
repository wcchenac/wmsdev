import React, { Component } from "react";

class CheckBox extends Component {
  constructor(props) {
    super(props);
    this.handleChecked = this.handleChecked.bind(this);
  }

  handleChecked(e) {
    this.props.handleCheckBoxSelected(e, this.props.index);
  }

  checkBoxDisableAlgorithm(waitHandleStatus) {
    let result = true;

    Object.keys(waitHandleStatus).forEach(type => {
      if (parseFloat(waitHandleStatus[type].length) !== 0) {
        result = false;
        return result;
      }
    });

    return result;
  }

  render() {
    const { productNo, index, checked, waitHandleStatus } = this.props;
    let validation = this.checkBoxDisableAlgorithm(waitHandleStatus);

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
              {Object.keys(waitHandleStatus).map((type, index) => {
                return (
                  <div key={index}>
                    <div className="row mb-0">
                      <label className="col-auto mb-0">{type.toString()}</label>
                      <label className="col-auto mb-0">
                        {waitHandleStatus[type].length}{" "}
                        {waitHandleStatus[type].unit}
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

export default CheckBox;
