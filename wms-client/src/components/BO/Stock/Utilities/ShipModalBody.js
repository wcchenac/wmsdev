import React, { Component } from "react";
import { StoreList, OutStockOtherReason } from "../../../../enums/Enums";

class ShipModalBody extends Component {
  render() {
    return (
      <React.Fragment>
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
                onClick={this.props.onReansonButtonChange}
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
              onClick={this.props.onReansonButtonChange}
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
                onClick={this.props.onReansonButtonChange}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default ShipModalBody;
