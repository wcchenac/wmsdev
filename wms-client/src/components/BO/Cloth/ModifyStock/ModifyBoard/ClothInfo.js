import React, { Component } from "react";
import { StoreList, OutStockOtherReason } from "../../../../../enums/Enums";
import InformationModal from "./InformationModal";

class ClothInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      outStockReason: ""
    };
    this.onShipClick = this.onShipClick.bind(this);
    this.onShrinkClick = this.onShrinkClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.handleReasonButton = this.handleReasonButton.bind(this);
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

  handleReasonButton(e) {
    this.setState({ outStockReason: e.target.value });
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
                  <div className="row  justify-content-end">
                    <div className="col-md-8">
                      {StoreList.map((store, index) => (
                        <button
                          type="button"
                          className="btn btn-outline-info mr-1 mb-1"
                          key={index}
                          value={store}
                          onClick={this.handleReasonButton}
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
                        onClick={this.handleReasonButton}
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
                          onClick={this.handleReasonButton}
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
          className="btn btn-secondary mr-2"
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
      <tr className={clothIdentifier.waitToShrink ? "table-warning" : ""}>
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
          <button className="btn-customize" disabled>
            {clothIdentifier.firstInStockAt}
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
          <InformationModal
            index={index}
            clothInfo={clothInfo}
            handleClothInfoUpdate={this.props.handleClothInfoUpdate}
          />
          {btnContent}
        </td>
      </tr>
    );
  }
}

export default ClothInfo;
