import React, { Component } from "react";
import classnames from "classnames";

class OutStockBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      outStockRequest: {
        productNo: this.props.productNo,
        type: "整支",
        length: "",
        unit: "碼",
        user: "",
        reason: "",
        errors: {
          length: ""
        }
      }
    };
    this.handleRequestChange = this.handleRequestChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.productNo !== prevProps.productNo) {
      this.initialize();
    }
  }

  initialize() {
    this.setState({
      outStockRequest: {
        productNo: this.props.productNo,
        type: "整支",
        length: "",
        unit: "碼",
        user: "",
        reason: "",
        errors: {
          length: ""
        }
      }
    });
  }

  handleRequestChange(request) {
    let outStockRequestsCopy = this.state.outStockRequest;
    const { name, value } = request.target;

    switch (name) {
      case "type":
        outStockRequestsCopy.type = value;
        break;
      case "length":
        outStockRequestsCopy.errors.length = /^\d*\.?\d+$/.test(value)
          ? ""
          : "請輸入純數字或長度不可空白";
        outStockRequestsCopy.length = "約" + value;
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
      length: outStockRequest.length,
      unit: outStockRequest.unit,
      user: outStockRequest.user,
      reason: outStockRequest.reason
    };

    this.props.handleOutStockRequestSubmit(e, newOutStockRequest);
  }

  checkFormAlgorithm(outStockRequest) {
    var isFormValid = false;

    if (
      outStockRequest.errors.length === "" &&
      outStockRequest.length.length > 0 &&
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
                    <div className="col-8">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <div className="input-group-text">約</div>
                        </div>
                        <input
                          type="text"
                          className={classnames("form-control", {
                            "is-invalid": errors.length
                          })}
                          placeholder="長度"
                          name="length"
                          onChange={this.handleRequestChange}
                        />
                        {errors.length && (
                          <div className="invalid-feedback">
                            {errors.length}
                          </div>
                        )}
                      </div>
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
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-dismiss="modal"
              >
                取消
              </button>
              <button
                type="button"
                class="btn btn-primary"
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
