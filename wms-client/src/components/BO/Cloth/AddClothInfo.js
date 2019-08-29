import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createClothInfo } from "../../../actions/ClothInfoAcions";
import classnames from "classnames";

class AddClothInfo extends Component {
  constructor() {
    super();
    this.state = {
      productNo: "",
      lotNo: "",
      type: "捲",
      length: "",
      color: "",
      defect: "",
      record: "",
      remark: "",
      errors: {
        productNo: "",
        lotNo: "",
        length: ""
      }
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    e.preventDefault();
    const { name, value } = e.target;
    let errors = this.state.errors;
    switch (name) {
      case "productNo":
        errors.productNo = value.length < 1 ? "貨號不可空白" : "";
        break;
      case "lotNo":
        errors.lotNo = value.length < 1 ? "批號不可空白" : "";
        break;
      case "length":
        errors.length = value.length < 1 ? "長度不可空白" : "";
        break;
      default:
        break;
    }
    this.setState({ errors, [name]: value });
  }

  onSubmit(e) {
    e.preventDefault();
    const inStockRequest = {
      productNo: this.state.productNo,
      lotNo: this.state.lotNo,
      type: this.state.type,
      length: this.state.length,
      color: this.state.color,
      defect: this.state.defect,
      record: this.state.record,
      remark: this.state.remark
    };

    // console.log(inStockRequest);
    // this.props.history.replace("/cloth/instock");
    this.props.createClothInfo(inStockRequest, this.props.history);
  }

  render() {
    const { errors } = this.state;
    return (
      <div className="cloth_info">
        <div className="container">
          <div className="row">
            <div className="col-md-6 m-auto">
              <p className="h3 text-center">入庫基本資料</p>
              <hr />
              <form onSubmit={this.onSubmit}>
                <div className="clothIdentifierBacklog">
                  <div className="form-group">
                    <input
                      type="text"
                      className={classnames("form-control form-control-lg ", {
                        "is-invalid": errors.productNo
                      })}
                      placeholder="貨號"
                      name="productNo"
                      value={this.state.productNo}
                      onChange={this.onChange}
                    />
                    {errors.productNo && (
                      <div className="invalid-feedback">{errors.productNo}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      className={classnames("form-control form-control-lg ", {
                        "is-invalid": errors.lotNo
                      })}
                      placeholder="批號"
                      name="lotNo"
                      value={this.state.lotNo}
                      onChange={this.onChange}
                    />
                    {errors.lotNo && (
                      <div className="invalid-feedback">{errors.lotNo}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <select
                      className="custom-select custom-select-lg"
                      name="type"
                      defaultValue="捲"
                      onChange={this.onChange}
                    >
                      <option value="捲">捲</option>
                      <option value="板">板</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      className={classnames("form-control form-control-lg ", {
                        "is-invalid": errors.length
                      })}
                      placeholder="長度"
                      name="length"
                      value={this.state.length}
                      onChange={this.onChange}
                    />
                    {errors.length && (
                      <div className="invalid-feedback">{errors.length}</div>
                    )}
                  </div>
                </div>
                <div className="clothInfo">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="色號"
                      name="color"
                      value={this.state.color}
                      onChange={this.onChange}
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      className="form-control form-control-lg"
                      placeholder="缺陷"
                      name="defect"
                      value={this.state.defect}
                      onChange={this.onChange}
                    />
                  </div>
                </div>
                <div className="clothRecords">
                  <div className="form-group">
                    <textarea
                      className="form-control form-control-lg"
                      placeholder="記錄"
                      name="record"
                      value={this.state.record}
                      onChange={this.onChange}
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      className="form-control form-control-lg"
                      placeholder="註解"
                      name="remark"
                      value={this.state.remark}
                      onChange={this.onChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    !this.state.productNo ||
                    !this.state.lotNo ||
                    !this.state.length
                  }
                  className="btn btn-primary btn-block mt-4"
                >
                  送出
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AddClothInfo.propTypes = {
  createClothInfo: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { createClothInfo }
)(AddClothInfo);
