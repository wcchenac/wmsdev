import React, { Component } from "react";

class InformationModal extends Component {
  render() {
    const { index, clothInfo } = this.props;
    const { clothIdentifier } = this.props.clothInfo;

    return (
      <div
        className="modal fade"
        id={"detailInfo-" + index}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="content"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
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
              <div className="form-group row">
                <label className="col-6 col-form-label text-center">貨號</label>
                <label className="col-6 col-form-label">
                  {clothIdentifier.productNo}
                </label>
              </div>
              <div className="form-group row">
                <label className="col-6 col-form-label text-center">批號</label>
                <label className="col-6 col-form-label">
                  {clothIdentifier.lotNo}
                </label>
              </div>
              <div className="form-group row">
                <label className="col-6 col-form-label text-center">型態</label>
                <label className="col-6 col-form-label">
                  {clothIdentifier.type}
                </label>
              </div>
              <div className="form-group row">
                <label className="col-6 col-form-label text-center">長度</label>
                <label className="col-6 col-form-label">
                  {clothIdentifier.length}
                </label>
              </div>
              <div className="form-group row">
                <label className="col-6 col-form-label text-center">單位</label>
                <label className="col-6 col-form-label">
                  {clothIdentifier.unit}
                </label>
              </div>
              <div className="form-group row">
                <label className="col-6 col-form-label text-center">色號</label>
                <label className="col-6 col-form-label">
                  {clothInfo.color}
                </label>
              </div>
              <div className="form-group row">
                <label className="col-6 col-form-label text-center">缺陷</label>
                <label className="col-6 col-form-label">
                  {clothInfo.defect}
                </label>
              </div>
              <div className="form-group row">
                <label className="col-6 col-form-label text-center">註解</label>
                <label className="col-6 col-form-label">
                  {clothInfo.remark}
                </label>
              </div>
              <div className="form-group row">
                <label className="col-6 col-form-label text-center">記錄</label>
                <label className="col-6 col-form-label">
                  {clothInfo.record}
                </label>
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
                onClick={this.onShipClick}
                disabled={!this.props.outStockReason}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default InformationModal;
