import React, { Component } from "react";
import InformationModal from "./InformationModal";
import ShipModal from "../../Utilities/ShipModal";
import { Button } from "react-bootstrap";

class StockInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalShow: false,
      outStockReason: ""
    };
    this.onShipClick = this.onShipClick.bind(this);
    this.onCancleShipClick = this.onCancleShipClick.bind(this);
    this.onShrinkClick = this.onShrinkClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.handleReasonButton = this.handleReasonButton.bind(this);
    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
  }

  onShipClick() {
    const shipRequest = {
      stockIdentifierId: this.props.stockInfo.stockIdentifier.id,
      reason: this.state.outStockReason
    };

    this.setState({ modalShow: false }, () => {
      this.props.handleShip(shipRequest);
    });
  }

  onCancleShipClick() {
    this.setState({ modalShow: false, outStockReason: "" });
  }

  onShrinkClick() {
    this.props.handleShrink(this.props.stockInfo.stockIdentifier.id);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleModalShow() {
    this.setState({ modalShow: true });
  }

  handleModalClose() {
    this.setState({ modalShow: false });
  }

  handleReasonButton(e) {
    this.setState({ outStockReason: e.target.value });
  }

  btnAlgorithm(waitToShrink, typeValidation, index) {
    if (waitToShrink === false) {
      return (
        <React.Fragment>
          <Button
            variant="primary"
            className="mr-2"
            onClick={this.onShrinkClick}
          >
            {typeValidation ? "分裝" : "減肥"}
          </Button>
          <Button
            variant="primary"
            className="mr-2"
            onClick={this.handleModalShow}
          >
            出庫
          </Button>
          {this.state.modalShow ? (
            <ShipModal
              show
              outStockReason={this.state.outStockReason}
              onChange={this.onChange}
              onReansonButtonChange={this.handleReasonButton}
              onShipClick={this.onShipClick}
              onCancleShipClick={this.onCancleShipClick}
              handleModalClose={this.handleModalClose}
            />
          ) : null}
        </React.Fragment>
      );
    } else {
      return (
        <button type="button" className="btn btn-secondary mr-2" disabled>
          {typeValidation ? "分裝處理中" : "減肥處理中"}
        </button>
      );
    }
  }

  render() {
    const { stockInfo, index, typeValidation } = this.props;
    const { stockIdentifier } = this.props.stockInfo;
    let btnContent = this.btnAlgorithm(
      stockIdentifier.waitToShrink,
      typeValidation,
      index
    );

    return (
      <tr className={stockIdentifier.waitToShrink ? "table-warning" : ""}>
        <td>
          <button className="btn-customize" disabled>
            {stockIdentifier.productNo}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {stockIdentifier.lotNo}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {stockIdentifier.type}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {stockIdentifier.quantity + " " + stockIdentifier.unit}
          </button>
        </td>
        {typeValidation ? null : (
          <React.Fragment>
            <td>
              <button className="btn-customize" disabled>
                {stockInfo.color}
              </button>
            </td>
            <td>
              <button className="btn-customize" disabled>
                {stockInfo.defect}
              </button>
            </td>
          </React.Fragment>
        )}
        <td>
          <button className="btn-customize" disabled>
            {stockIdentifier.firstInStockAt}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {stockInfo.remark}
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
            typeValidation={typeValidation}
            stockInfo={stockInfo}
            handleStockInfoUpdate={this.props.handleStockInfoUpdate}
          />
          {btnContent}
        </td>
      </tr>
    );
  }
}

export default StockInfo;
