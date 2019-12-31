import React, { Component } from "react";

class ShrinkInfo extends Component {
  constructor(props) {
    super(props);
    this.onTypeExchangeClick = this.onTypeExchangeClick.bind(this);
    this.onSameTypeClick = this.onSameTypeClick.bind(this);
    this.onHardwareModifyClick = this.onHardwareModifyClick.bind(this);
    this.onCancelShrinkClick = this.onCancelShrinkClick.bind(this);
  }

  onTypeExchangeClick() {
    this.props.onModifyClick("typeExchange", this.props.stockInfo);
  }

  onSameTypeClick() {
    this.props.onModifyClick("sameTypeModify", this.props.stockInfo);
  }

  onHardwareModifyClick() {
    this.props.onModifyClick("hardwareModify", this.props.stockInfo);
  }

  onCancelShrinkClick() {
    this.props.onCancelShrinkClick(this.props.stockInfo.stockIdentifier.id);
  }

  actionButtonAlgorithm(type) {
    if (type === "整支") {
      return (
        <React.Fragment>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onTypeExchangeClick}
            >
              板卷異動
            </button>
          </td>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onSameTypeClick}
            >
              整支異動
            </button>
          </td>
        </React.Fragment>
      );
    }
    if (type === "板卷") {
      return (
        <React.Fragment>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onTypeExchangeClick}
            >
              板卷異動
            </button>
          </td>
          <td></td>
        </React.Fragment>
      );
    }
    if (type === "雜項") {
      return (
        <React.Fragment>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.onHardwareModifyClick}
            >
              雜項異動
            </button>
          </td>
          <td></td>
        </React.Fragment>
      );
    }
  }

  cancelButtonAlgorithm(type) {
    if (type === "整支" || type === "板卷") {
      return (
        <React.Fragment>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.onCancelShrinkClick}
          >
            取消減肥
          </button>
        </React.Fragment>
      );
    }
    if (type === "雜項") {
      return (
        <React.Fragment>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.onCancelShrinkClick}
          >
            取消分裝
          </button>
        </React.Fragment>
      );
    }
  }

  render() {
    const { stockInfo } = this.props;
    const { stockIdentifier } = this.props.stockInfo;
    let actionButtonContent = this.actionButtonAlgorithm(stockIdentifier.type);
    let cancelButtonContent = this.cancelButtonAlgorithm(stockIdentifier.type);

    return (
      <tr>
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
            {stockIdentifier.quantity}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {stockIdentifier.unit}
          </button>
        </td>
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
        {actionButtonContent}
        <td>{cancelButtonContent}</td>
      </tr>
    );
  }
}

export default ShrinkInfo;
