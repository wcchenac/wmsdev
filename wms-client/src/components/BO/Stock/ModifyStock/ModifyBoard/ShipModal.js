import React, { Component } from "react";
import { StoreList, OutStockOtherReason } from "../../../../../enums/Enums";

class ShipModal extends Component {
  render() {
    return (
      <React.Fragment>
        <div
          className="modal fade"
          id={"reasonContent-" + this.props.index}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="content"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">出庫確認</h5>
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
                  <label className="col-md-auto col-form-label text-center">
                    出庫原因
                  </label>
                  <div className="col">
                    <input
                      type="text"
                      name="outStockReason"
                      placeholder="請輸入出庫原因"
                      className="form-control"
                      value={this.props.outStockReason}
                      onChange={this.props.onChange}
                    />
                  </div>
                </div>
                <div className="row  justify-content-end">
                  <div className="col-md-8">
                    {StoreList.map((store, index) => (
                      <button
                        type="button"
                        className="btn btn-outline-info mr-1 mb-1"
                        key={index}
                        value={store}
                        onClick={this.props.handleReasonButton}
                      >
                        {store}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <button
                      className="btn btn-secondary"
                      value=""
                      onClick={this.props.handleReasonButton}
                    >
                      重置
                    </button>
                  </div>
                  <div className="col-md-8">
                    {OutStockOtherReason.map((reason, index) => (
                      <button
                        type="button"
                        className="btn btn-outline-info mr-1 mb-1"
                        key={index}
                        value={reason}
                        onClick={this.props.handleReasonButton}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
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
                  onClick={this.props.onShipClick}
                  disabled={!this.props.outStockReason}
                >
                  確認
                </button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default ShipModal;
