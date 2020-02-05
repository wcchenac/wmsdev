import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

class ConfirmModal extends Component {
  bodyContent() {
    const { outStockType } = this.props.searchInfo;

    switch (outStockType) {
      case 0:
        return "是否取消出貨？取消非當天出貨後，無法再以當天日期出貨";
      case 2:
        return "是否刪除此筆記錄";
      default:
        return null;
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
          <Modal.Title>確認執行動作</Modal.Title>
          <Modal.Body>{this.bodyContent()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.props.handleModalClose}>
              取消
            </Button>
            <Button variant="primary">儲存</Button>
          </Modal.Footer>
        </Modal.Header>
      </Modal>
    );
  }
}

export default ConfirmModal;
