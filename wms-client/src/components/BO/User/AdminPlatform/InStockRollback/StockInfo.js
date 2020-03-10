import React, { Component } from "react";
import { Button } from "react-bootstrap";
import RollbackModal from "./RollbackModal";

class StockInfo extends Component {
  constructor(props) {
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

  handleSubmitClick(idList) {
    this.setState({ modalShow: false }, () => {
      this.props.handleInStockRollback(idList);
    });
  }

  totalQuantity() {
    const { list } = this.props;
    let totalQuantity = 0;
    let unit = list[0].stockIdentifier.unit;

    list.forEach(object => {
      totalQuantity += parseFloat(object.stockIdentifier.quantity);
    });

    return {
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      unit: unit
    };
  }

  render() {
    const { productNo, list } = this.props;
    const { modalShow } = this.state;
    let content = this.totalQuantity();

    return (
      <tr>
        <td>
          <button className="btn-customize" disabled>
            {productNo}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {content.totalQuantity + content.unit}
          </button>
        </td>
        <td>
          <button className="btn-customize" disabled>
            {list.length}
          </button>
        </td>
        <td>
          <Button variant="primary" onClick={this.handleModalShow}>
            詳細資料
          </Button>
          {modalShow ? (
            <RollbackModal
              list={list}
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
