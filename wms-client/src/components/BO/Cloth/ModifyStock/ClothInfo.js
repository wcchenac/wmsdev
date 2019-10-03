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

  render() {
    const { clothInfo } = this.props;
    const { clothIdentifier } = this.props.clothInfo;
    const { index } = this.props;

    const btnAlgorithm = waitToShrink => {
      if (waitToShrink === false) {
        return (
          <div>
            <div
              className="btn-group mr-2"
              role="group"
              aria-label="Second group"
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.onShrinkClick}
              >
                減肥
              </button>
            </div>
            <div className="btn-group" role="group" aria-label="Third group">
              <button
                type="button"
                className="btn btn-primary"
                data-toggle="modal"
                data-target={"#reasonContent-" + index}
              >
                出庫
              </button>
            </div>
            <div
              className="modal fade"
              id={"reasonContent-" + index}
              tabIndex="-1"
              role="dialog"
              aria-labelledby="content"
              aria-hidden="true"
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
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
          </div>
        );
      } else {
        return (
          <div
            className="btn-group mr-2"
            role="group"
            aria-label="Second group"
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onShrinkClick}
              disabled
            >
              減肥處理中
            </button>
          </div>
        );
      }
    };

    let btnContent;
    btnContent = btnAlgorithm(clothIdentifier.waitToShrink);

    return (
      <tr>
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
          <div
            className="btn-toolbar"
            role="toolbar"
            aria-label="Toolbar with button groups"
          >
            <div
              className="btn-group mr-2"
              role="group"
              aria-label="First group"
            >
              <button
                className="btn btn-primary"
                data-toggle="modal"
                data-target={"#detailInfo-" + index}
              >
                詳細資料
              </button>
            </div>
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
          </div>
        </td>
      </tr>
    );
  }
}

export default ClothInfo;
