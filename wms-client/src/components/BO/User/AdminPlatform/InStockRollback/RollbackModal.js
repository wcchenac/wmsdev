import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

class RollbackModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idList: this.idListSelection()
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  idListSelection() {
    let idList = [];

    this.props.list.forEach(object => {
      if (object.stockIdentifier.exist === true) {
        idList.push(object.stockIdentifier.id);
      }
    });

    return idList;
  }

  rollbackValidate() {
    let validation = false;

    this.props.list.forEach(object => {
      if (object.stockIdentifier.exist === false) {
        return (validation = true);
      }
    });

    return validation;
  }

  handleSubmit() {
    this.props.handleSubmitClick(this.state.idList);
  }

  render() {
    return (
      <Modal
        centered
        scrollable
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
              {this.props.list.map((object, index) => {
                return (
                  <tr
                    key={index}
                    className={
                      object.stockIdentifier.exist ? "" : "table-secondary"
                    }
                  >
                    <td>
                      <button className="btn-customize" disabled>
                        {object.stockIdentifier.productNo}
                      </button>
                    </td>
                    <td>
                      <button className="btn-customize" disabled>
                        {object.stockIdentifier.lotNo}
                      </button>
                    </td>
                    <td>
                      <button className="btn-customize" disabled>
                        {object.stockIdentifier.type}
                      </button>
                    </td>
                    <td>
                      <button className="btn-customize" disabled>
                        {object.stockIdentifier.quantity +
                          object.stockIdentifier.unit}
                      </button>
                    </td>
                    <td>
                      <button className="btn-customize" disabled>
                        {object.defect}
                      </button>
                    </td>
                    <td>
                      <button className="btn-customize" disabled>
                        {object.record}
                      </button>
                    </td>
                    <td>
                      <button className="btn-customize" disabled>
                        {object.remark}
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
            onClick={this.handleSubmit}
          >
            確認
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default RollbackModal;
