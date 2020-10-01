import React, { Component } from "react";
import { isEmpty } from "../../../../utilities/IsEmpty";

const equal = require("fast-deep-equal");

export default class ShowProductInformation extends Component {
  render() {
    const { isBasic, isQuery, productNo, productInfo } = this.props;

    return (
      <React.Fragment>
        <button
          className="btn btn-info"
          disabled={
            !isQuery || productNo.toUpperCase() !== productInfo.productNo
          }
          data-toggle="modal"
          data-target="#picture"
        >
          貨號資料
        </button>
        <div
          className="modal fade"
          id="picture"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="content"
          aria-hidden="true"
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
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
                    <div className="col-md-6 d-flex align-items-center">
                      {equal(productInfo.picture, "無資料") ||
                      isEmpty(productInfo.picture) ? (
                        "No image"
                      ) : (
                        <img
                          src={productInfo.picture.substring(1)}
                          className="img-fluid rounded"
                          alt=""
                        />
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
                            價格異動:
                          </label>
                          <label className="col-7 col-form-label">
                            {productInfo.descrip}
                          </label>
                        </div>
                        {isBasic ? null : (
                          <React.Fragment>
                            <div className="form-group row">
                              <label className="col-5 col-form-label text-right">
                                廠商代碼/名稱:
                              </label>
                              <label className="col-7 col-form-label">
                                {productInfo.supp + "/" + productInfo.suppName}
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
                                成本:
                              </label>
                              <label className="col-7 col-form-label">
                                {productInfo.cCost}
                              </label>
                            </div>
                          </React.Fragment>
                        )}
                        <div className="form-group row">
                          <label className="col-5 col-form-label text-right">
                            大牌品名:
                          </label>
                          <label className="col-7 col-form-label">
                            {productInfo.cCCCODE}
                          </label>
                        </div>
                        {/** 
                        <div className="form-group row">
                          <label className="col-5 col-form-label text-right">
                            備註1:
                          </label>
                          <label className="col-7 col-form-label">
                            {productInfo.eNAME}
                          </label>
                        </div>
                        <div className="form-group row">
                          <label className="col-5 col-form-label text-right">
                            備註2:
                          </label>
                          <label className="col-7 col-form-label">
                            {productInfo.eSPEC}
                          </label>
                        </div>
                        */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
