import React, { Component } from "react";
import { Button } from "react-bootstrap";
import RollbackModal from "./RollbackModal";

import type { StoredStockInfo } from "../../../../../types/domain";

export interface ShrinkHistoryNode {
  stockInfo: StoredStockInfo;
  nodes: ShrinkHistoryNode[];
}

interface Props {
  object: ShrinkHistoryNode;
  handleShrinkRollback: (stockIdentifierId: number) => void;
}

interface State {
  modalShow: boolean;
}


class StockInfo extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      modalShow: false
    };
    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  handleModalShow() {
    this.setState({ modalShow: true });
  }

  handleModalClose() {
    this.setState({ modalShow: false });
  }

  handleSubmitClick() {
    this.setState({ modalShow: false }, () => {
      this.props.handleShrinkRollback(
        this.props.object.stockInfo.stockIdentifier.id
      );
    });
  }

  render() {
    const { object } = this.props;
    const { modalShow } = this.state;

    return (
      <tr>
        <td>
          <button className="btn-customize" disabled>
            {object.stockInfo.stockIdentifier.productNo}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {object.stockInfo.stockIdentifier.lotNo}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {object.stockInfo.stockIdentifier.type}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {object.stockInfo.stockIdentifier.quantity +
              object.stockInfo.stockIdentifier.unit}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {object.stockInfo.stockIdentifier.eliminateDate}
          </button>
        </td>
        <td>
          <Button variant="primary" onClick={this.handleModalShow}>
            詳細資料
          </Button>
          {modalShow ? (
            <RollbackModal
              object={object}
              show
              handleModalClose={this.handleModalClose}
              handleSubmitClick={this.handleSubmitClick}
            />
          ) : null}
        </td>
      </tr>
    );
  }
}

export default StockInfo;
