import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getClothInfoes,
  clothIndentifierIsShiped,
  clothIdentifierWaitToShrinkIsTrue,
  createOutStockRequest
} from "../../../../../actions/ClothInfoAcions";
import ClothInfoContainer from "./ClothInfoContainer";
import OutStockBoard from "./OutStockBoard";
import { trackPromise } from "react-promise-tracker";

class ModifyBoard extends Component {
  constructor() {
    super();
    this.state = {
      isQuery: false,
      productNo: "",
      productInfo: {},
      clothInfoes: []
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleOutStockRequestSubmit = this.handleOutStockRequestSubmit.bind(
      this
    );
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();
    trackPromise(this.props.getClothInfoes(this.state.productNo));
    this.setState({ isQuery: true });
  }

  handleOutStockRequestSubmit(e, outStockRequest) {
    e.preventDefault();
    this.props.createOutStockRequest(outStockRequest);
  }

  componentDidUpdate(prevProps) {
    if (this.props.queryResult !== prevProps.queryResult) {
      this.setState({
        productInfo: this.props.queryResult.clothInfoes.information,
        clothInfoes: this.props.queryResult.clothInfoes.result
      });
    }
  }

  render() {
    const { isQuery, productNo, productInfo } = this.state;
    const { clothInfoes } = this.state;

    return (
      <div className="modify_clothInfo">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <form onSubmit={this.onSubmit}>
                <div className="form-group row">
                  <label className="col-md-auto col-form-label text-center">
                    貨號查詢
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      name="productNo"
                      placeholder="請輸入貨號"
                      className="form-control"
                      value={this.state.productNo}
                      onChange={this.onChange}
                    />
                  </div>
                  <div className="col-md-auto">
                    <button type="submit" className="btn btn-primary btn-block">
                      查詢
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-md-auto mr-2">
              <button
                className="btn btn-info"
                disabled={
                  !isQuery || productNo.toUpperCase() !== productInfo.productNo
                }
                data-toggle="modal"
                data-target="#picture"
              >
                詳細資料
              </button>
              <div
                className="modal fade"
                id="picture"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="content"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-lg" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">詳細資料</h5>
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
                      <div className="card">
                        <div className="row no-gutters">
                          <div className="col-md-6">
                            {productInfo.picture === "" ? (
                              "No image"
                            ) : (
                              <img
                                src={productInfo.picture}
                                className="img-fluid"
                                alt=""
                              ></img>
                            )}
                          </div>
                          <div className="col-md-6">
                            <div className="card-body">
                              <div className="form-group row">
                                <label className="col-5 col-form-label text-right">
                                  品名:
                                </label>
                                <label className="col-7 col-form-label">
                                  {productInfo.cName}
                                </label>
                              </div>
                              <div className="form-group row">
                                <label className="col-5 col-form-label text-right">
                                  規格:
                                </label>
                                <label className="col-7 col-form-label">
                                  {productInfo.spec}
                                </label>
                              </div>
                              <div className="form-group row">
                                <label className="col-5 col-form-label text-right">
                                  廠商代碼/名稱:
                                </label>
                                <label className="col-7 col-form-label">
                                  {productInfo.supp +
                                    "/" +
                                    productInfo.suppName}
                                </label>
                              </div>
                              <div className="form-group row">
                                <label className="col-5 col-form-label text-right">
                                  自設欄1:
                                </label>
                                <label className="col-7 col-form-label">
                                  {productInfo.userField1}
                                </label>
                              </div>
                              <div className="form-group row">
                                <label className="col-5 col-form-label text-right">
                                  產品描述:
                                </label>
                                <label className="col-7 col-form-label">
                                  {productInfo.prodDesc}
                                </label>
                              </div>
                              <div className="form-group row">
                                <label className="col-5 col-form-label text-right">
                                  基重:
                                </label>
                                <label className="col-7 col-form-label">
                                  {productInfo.packDesc}
                                </label>
                              </div>
                              <div className="form-group row">
                                <label className="col-5 col-form-label text-right">
                                  追加狀態:
                                </label>
                                <label className="col-7 col-form-label">
                                  {productInfo.addType}
                                </label>
                              </div>
                              <div className="form-group row">
                                <label className="col-5 col-form-label text-right">
                                  成本:
                                </label>
                                <label className="col-7 col-form-label">
                                  成本
                                </label>
                              </div>
                              <div className="form-group row">
                                <label className="col-5 col-form-label text-right">
                                  價格異動:
                                </label>
                                <label className="col-7 col-form-label">
                                  {productInfo.descrip}
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-auto">
              <button
                className="btn btn-primary"
                disabled={
                  !isQuery || productNo.toUpperCase() !== productInfo.productNo
                }
                data-toggle="modal"
                data-target="#outStockRequest"
              >
                拉貨要求
              </button>
              {productNo.toUpperCase() !== productInfo.productNo ? null : (
                <OutStockBoard
                  productNo={productNo.toUpperCase()}
                  handleOutStockRequestSubmit={this.handleOutStockRequestSubmit}
                />
              )}
            </div>
          </div>
          <hr />
          {isQuery ? (
            <ClothInfoContainer
              clothInfoes={clothInfoes}
              handleShip={this.props.clothIndentifierIsShiped}
              handleShrink={this.props.clothIdentifierWaitToShrinkIsTrue}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

ModifyBoard.propTypes = {
  queryResult: PropTypes.object.isRequired,
  getClothInfoes: PropTypes.func.isRequired,
  clothIndentifierIsShiped: PropTypes.func.isRequired,
  clothIdentifierWaitToShrinkIsTrue: PropTypes.func.isRequired,
  createOutStockRequest: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  queryResult: state.clothInfo
});

export default connect(
  mapStateToProps,
  {
    getClothInfoes,
    clothIndentifierIsShiped,
    clothIdentifierWaitToShrinkIsTrue,
    createOutStockRequest
  }
)(ModifyBoard);
