import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

class ShrinkConfirmModal extends Component {
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
        <Modal.Body>{this.props.modalContent}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.handleModalClose}>
            取消
          </Button>
          <Button variant="primary" onClick={this.props.handleSubmitClick}>
            送出
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ShrinkConfirmModal;
