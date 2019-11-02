import React, { Component } from "react";
import classnames from "classnames";
import { copy } from "../../../../../utilities/DeepCopy";

class OutStockBoard extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState();
    this.handleRequestChange = this.handleRequestChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  initialState() {
    return {
      outStockRequest: {
        productNo: this.props.productNo,
        type: "整支",
        length1: "",
        length2: "",
        unit: "碼",
        user: "",
        reason: "",
        errors: {
          length1: "",
          length2: ""
        }
      }
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.productNo !== prevProps.productNo) {
      this.setState(this.initialState());
    }
  }

  handleRequestChange(request) {
    let outStockRequestsCopy = copy(this.state.outStockRequest);
    const { name, value } = request.target;

    switch (name) {
      case "type":
        outStockRequestsCopy.type = value;
        break;
      case "length1":
        outStockRequestsCopy.errors.length1 = /^\d*\.?\d+$/.test(value)
          ? ""
          : "請輸入純數字或長度不可空白";
        outStockRequestsCopy.length1 = value;
        break;
      case "length2":
        outStockRequestsCopy.errors.length2 = /^\d*\.?\d+$/.test(value)
          ? ""
          : "請輸入純數字或長度不可空白";
        outStockRequestsCopy.length2 = value;
        break;
      case "unit":
        outStockRequestsCopy.unit = value;
        break;
      case "outStockReason":
        outStockRequestsCopy.reason = value;
        break;
      default:
        break;
    }

    this.setState({ outStockRequest: outStockRequestsCopy });
  }

  handleSubmit(e) {
    const { outStockRequest } = this.state;
    const newOutStockRequest = {
      productNo: outStockRequest.productNo,
      type: outStockRequest.type,
      length: "約" + outStockRequest.length1 + "~" + outStockRequest.length2,
      unit: outStockRequest.unit,
      user: outStockRequest.user,
      reason: outStockRequest.reason
    };

    this.props.handleOutStockRequestSubmit(e, newOutStockRequest);
  }

  checkFormAlgorithm(outStockRequest) {
    var isFormValid = false;

    if (
      outStockRequest.errors.length1 === "" &&
      outStockRequest.length1 > 0 &&
      outStockRequest.errors.length2 === "" &&
      outStockRequest.length2 > 0 &&
      outStockRequest.reason !== ""
    ) {
      isFormValid = true;
    } else {
      isFormValid = false;
    }

    return isFormValid;
  }

  render() {
    const { outStockRequest } = this.state;
    const { errors } = this.state.outStockRequest;
    let isFormValid = this.checkFormAlgorithm(outStockRequest);

    return (
      <div
        className="modal fade"
        id="outStockRequest"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="content"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">拉貨要求</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="container">
                <form>
                  <div className="form-group row">
                    <label className="col-4 col-form-label">貨號</label>
                    <div className="col-8">
                      <input
                        type="text"
                        className="form-control"
                        name="productNo"
                        value={outStockRequest.productNo}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-4 col-form-label">型態</label>
                    <div className="col-8">
                      <select
                        className="custom-select"
                        name="type"
                        defaultValue="整支"
                        onChange={this.handleRequestChange}
                      >
                        <option value="整支">整支</option>
                        <option value="板卷">板卷</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-4 col-form-label">長度</label>
                    <div className="col-4">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <div className="input-group-text">約</div>
                        </div>
                        <input
                          type="text"
                          className={classnames("form-control", {
                            "is-invalid": errors.length1
                          })}
                          placeholder="長度"
                          name="length1"
                          onChange={this.handleRequestChange}
                        />
                        {errors.length1 && (
                          <div className="invalid-feedback">
                            {errors.length1}
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="col-1 col-form-label">~</label>
                    <div className="col-3">
                      <input
                        type="text"
                        className={classnames("form-control", {
                          "is-invalid": errors.length2
                        })}
                        placeholder="長度"
                        name="length2"
                        onChange={this.handleRequestChange}
                      />
                      {errors.length2 && (
                        <div className="invalid-feedback">{errors.length2}</div>
                      )}
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-4 col-form-label">單位</label>
                    <div className="col-8">
                      <select
                        className="custom-select"
                        name="unit"
                        defaultValue="碼"
                        onChange={this.handleRequestChange}
                      >
                        <option value="碼">碼</option>
                        <option value="尺">尺</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-4 col-form-label">出庫原因</label>
                    <div className="col-8">
                      <input
                        type="text"
                        name="outStockReason"
                        placeholder="請輸入出庫原因"
                        className="form-control"
                        onChange={this.handleRequestChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
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
                onClick={this.handleSubmit}
                disabled={!isFormValid}
              >
                儲存至明細
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OutStockBoard;
