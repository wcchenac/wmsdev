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
        errors: {
          length: ""
        }
      }
    };
    this.handleRequestChange = this.handleRequestChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
      user: outStockRequest.user
    };

    this.props.handleOutStockRequestSubmit(e, newOutStockRequest);
  }

  checkLengthAlgorithm(outStockRequest) {
    var isLengthChecked = false;

    if (
      outStockRequest.errors.length === "" &&
      outStockRequest.length.length > 0
    ) {
      isLengthChecked = true;
    } else {
      isLengthChecked = false;
    }

    return isLengthChecked;
  }

  render() {
    const { outStockRequest } = this.state;
    const { errors } = this.state.outStockRequest;
    let isLengthChecked = this.checkLengthAlgorithm(outStockRequest);

    return (
      <div className="outStock_board">
        <div className="container">
          <table className="table">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "35%" }}>貨號</th>
                <th style={{ width: "17.5%" }}>型態</th>
                <th style={{ width: "30%" }}>長度</th>
                <th style={{ width: "17.5%" }}>單位</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="productNo"
                      value={outStockRequest.productNo}
                      disabled
                    />
                  </div>
                </td>
                <td>
                  <div className="form-group">
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
                </td>
                <td>
                  <div className="form-group">
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
                        <div className="invalid-feedback">{errors.length}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="form-group">
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
                </td>
              </tr>
            </tbody>
          </table>
          <div className="row">
            <div className="col-md-auto  ml-auto">
              <button
                tyep="submit"
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={this.handleSubmit}
                disabled={!isLengthChecked}
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
