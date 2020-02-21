import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

class RollbackModal extends Component {
  rollbackValidate() {
    let validation = false;

    this.props.object.nodes.forEach(object => {
      if (object.stockInfo.stockIdentifier.exist === false) {
        return (validation = true);
      }
    });

    return validation;
  }

  render() {
    return (
      <Modal
        centered
        show={this.props.show}
        onHide={this.props.handleModalClose}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>回朔確認</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>子項目清單</p>
          <hr />
          <table className="table table-sm table-hover">
            <thead className="thead-dark">
              <tr>
                <th>
                  <div className="pl-3">貨號</div>
                </th>
                <th>
                  <div className="pl-1">批號</div>
                </th>
                <th>
                  <div className="pl-2">型態</div>
                </th>
                <th>
                  <div className="pl-2">數量/單位</div>
                </th>
                <th>
                  <div className="pl-1">瑕疵</div>
                </th>
                <th>
                  <div className="pl-1">記錄</div>
                </th>
                <th>
                  <div className="pl-2">備註</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.props.object.nodes.map((object, index) => {
                return (
                  <tr
                    key={index}
                    className={
                      object.stockInfo.stockIdentifier.exist
                        ? ""
                        : "table-secondary"
                    }
                  >
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
                        {object.stockInfo.defect}
                      </button>
                    </td>
                    <td>
                      <button className="btn-customize" disabled>
                        {object.stockInfo.record}
                      </button>
                    </td>
                    <td>
                      <button className="btn-customize" disabled>
                        {object.stockInfo.remark}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.handleModalClose}>
            取消
          </Button>
          <Button
            variant="primary"
            disabled={this.rollbackValidate()}
            onClick={this.props.handleSubmitClick}
          >
            確認
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default RollbackModal;
