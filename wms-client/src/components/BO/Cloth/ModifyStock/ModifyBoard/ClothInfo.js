import React, { Component } from "react";

class ClothInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      outStockReason: ""
    };
    this.onShipClick = this.onShipClick.bind(this);
    this.onShrinkClick = this.onShrinkClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onShipClick() {
    const shipRequest = {
      clothIdentifierId: this.props.clothInfo.clothIdentifier.id,
      reason: this.state.outStockReason
    };
    this.props.handleShip(shipRequest);
  }

  onShrinkClick() {
    this.props.handleShrink(this.props.clothInfo.clothIdentifier.id);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  btnAlgorithm(waitToShrink, index) {
    if (waitToShrink === false) {
      return (
        <React.Fragment>
          <button
            type="button"
            className="btn btn-primary mr-2"
            onClick={this.onShrinkClick}
          >
            減肥
          </button>
          <button
            type="button"
            className="btn btn-primary mr-2"
            data-toggle="modal"
            data-target={"#reasonContent-" + index}
          >
            出庫
          </button>
          <div
            className="modal fade"
            id={"reasonContent-" + index}
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
                        value={this.state.outStockReason}
                        onChange={this.onChange}
                      />
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
                    onClick={this.onShipClick}
                    disabled={!this.state.outStockReason}
                  >
                    確認
                  </button>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    } else {
      return (
        <button
          type="button"
          className="btn btn-primary mr-2"
          onClick={this.onShrinkClick}
          disabled
        >
          減肥處理中
        </button>
      );
    }
  }

  render() {
    const { clothInfo, index } = this.props;
    const { clothIdentifier } = this.props.clothInfo;
    let btnContent = this.btnAlgorithm(clothIdentifier.waitToShrink, index);

    return (
      <tr className={clothIdentifier.waitToShrink && "table-warning"}>
        <td>
          <button className="btn-customize" disabled>
            {clothIdentifier.productNo}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothIdentifier.lotNo}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothIdentifier.type}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothIdentifier.length}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothIdentifier.unit}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothInfo.color}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {clothInfo.defect}
          </button>
        </td>
        <td>
          <button
            className="btn btn-primary mr-2"
            data-toggle="modal"
            data-target={"#detailInfo-" + index}
          >
            詳細資料
          </button>
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
                    <label className="col-6 col-form-label text-center">
                      貨號
                    </label>
                    <label className="col-6 col-form-label">
                      {clothIdentifier.productNo}
                    </label>
                  </div>
                  <div className="form-group row">
                    <label className="col-6 col-form-label text-center">
                      批號
                    </label>
                    <label className="col-6 col-form-label">
                      {clothIdentifier.lotNo}
                    </label>
                  </div>
                  <div className="form-group row">
                    <label className="col-6 col-form-label text-center">
                      型態
                    </label>
                    <label className="col-6 col-form-label">
                      {clothIdentifier.type}
                    </label>
                  </div>
                  <div className="form-group row">
                    <label className="col-6 col-form-label text-center">
                      長度
                    </label>
                    <label className="col-6 col-form-label">
                      {clothIdentifier.length}
                    </label>
                  </div>
                  <div className="form-group row">
                    <label className="col-6 col-form-label text-center">
                      單位
                    </label>
                    <label className="col-6 col-form-label">
                      {clothIdentifier.unit}
                    </label>
                  </div>
                  <div className="form-group row">
                    <label className="col-6 col-form-label text-center">
                      流水號
                    </label>
                    <label className="col-6 col-form-label">
                      {clothIdentifier.serialNo}
                    </label>
                  </div>
                  <div className="form-group row">
                    <label className="col-6 col-form-label text-center">
                      色號
                    </label>
                    <label className="col-6 col-form-label">
                      {clothInfo.color}
                    </label>
                  </div>
                  <div className="form-group row">
                    <label className="col-6 col-form-label text-center">
                      缺陷
                    </label>
                    <label className="col-6 col-form-label">
                      {clothInfo.defect}
                    </label>
                  </div>
                  <div className="form-group row">
                    <label className="col-6 col-form-label text-center">
                      註解
                    </label>
                    <label className="col-6 col-form-label">
                      {clothInfo.remark}
                    </label>
                  </div>
                  <div className="form-group row">
                    <label className="col-6 col-form-label text-center">
                      記錄
                    </label>
                    <label className="col-6 col-form-label">
                      {clothInfo.record}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {btnContent}
        </td>
      </tr>
    );
  }
}

export default ClothInfo;
