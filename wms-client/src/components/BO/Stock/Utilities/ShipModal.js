import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
import ShipModalBody from "./ShipModalBody";

class ShipModal extends Component {
  render() {
    return (
      <Modal
        centered
        show={this.props.show}
        onHide={this.props.handleModalClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>出庫確認</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ShipModalBody
            outStockReason={this.props.outStockReason}
            onChange={this.props.onChange}
            onReansonButtonChange={this.props.onReansonButtonChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={this.props.onCancleShipClick}
            value=""
          >
            取消
          </Button>
          <Button
            variant="primary"
            onClick={this.props.onShipClick}
            disabled={!this.props.outStockReason}
          >
            確認
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ShipModal;
