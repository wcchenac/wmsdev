import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

class ShrinkConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  handleSubmitClick() {
    this.props.handleSubmitClick(this.props.infoLengthCalculation);
  }

  modalContent() {
    const { infoLengthCalculation } = this.props;

    if (infoLengthCalculation.adjustment === 0) {
      return (
        <React.Fragment>
          <p>減肥前後總數量相符，</p>
          <p>是否確認送出？</p>
        </React.Fragment>
      );
    } else if (
      Math.abs(infoLengthCalculation.adjustment) >
      infoLengthCalculation.totalQuantity * 0.03
    ) {
      return (
        <React.Fragment>
          <p>減肥前後總數量不符，</p>
          <p>
            差異量：
            <strong>{infoLengthCalculation.adjustment}</strong> 碼，大於平常值，
          </p>
          <p>是否確認送出？</p>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <p>減肥前後總數量不符，</p>
          <p>
            差異量： <strong>{infoLengthCalculation.adjustment}</strong> 碼，
          </p>
          <p>是否確認送出？</p>
        </React.Fragment>
      );
    }
  }

  render() {
    return (
      <Modal
        centered
        show={this.props.show}
        onHide={this.props.handleModalClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>減肥確認</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.modalContent()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.handleModalClose}>
            取消
          </Button>
          <Button variant="primary" onClick={this.handleSubmitClick}>
            送出
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ShrinkConfirmModal;
