import React, { Component } from "react";
import { StockIdentifierType } from "../../../../../enums/Enums";

class ShrinkInfo extends Component {
  constructor(props) {
    super(props);
    this.onModifyClick = this.onModifyClick.bind(this);
    this.onCancelShrinkClick = this.onCancelShrinkClick.bind(this);
  }

  onModifyClick(e) {
    this.props.onModifyClick(e.target.value, this.props.stockInfo);
  }

  onCancelShrinkClick() {
    this.props.onCancelShrinkClick(this.props.stockInfo.stockIdentifier.id);
  }

  actionButtonAlgorithm(type) {
    if (type === StockIdentifierType.roll) {
      return (
        <React.Fragment>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              value="typeExchange"
              onClick={this.onModifyClick}
            >
              板卷異動
            </button>
          </td>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              value="sameTypeModify"
              onClick={this.onModifyClick}
            >
              整支異動
            </button>
          </td>
        </React.Fragment>
      );
    }
    if (type === StockIdentifierType.board) {
      return (
        <React.Fragment>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              value="typeExchange"
              onClick={this.onModifyClick}
            >
              板卷異動
            </button>
          </td>
          <td></td>
        </React.Fragment>
      );
    }
    if (type === StockIdentifierType.hardware) {
      return (
        <React.Fragment>
          <td>
            <button
              type="button"
              className="btn btn-primary"
              value="hardwareModify"
              onClick={this.onModifyClick}
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
    if (
      type === StockIdentifierType.roll ||
      type === StockIdentifierType.board
    ) {
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
    if (type === StockIdentifierType.hardware) {
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
          {stockIdentifier.type === StockIdentifierType.hardware ? null : (
            <button className="btn-customize" disabled>
              {stockInfo.color}
            </button>
          )}
        </td>
        <td>
          {stockIdentifier.type === StockIdentifierType.hardware ? null : (
            <button className="btn-customize" disabled>
              {stockInfo.defect}
            </button>
          )}
        </td>
        {actionButtonContent}
        <td>{cancelButtonContent}</td>
      </tr>
    );
  }
}

export default ShrinkInfo;
