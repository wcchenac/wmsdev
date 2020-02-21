import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import ShipModalBody from "../../Utilities/ShipModalBody";
import MaterialTable from "material-table";
import { tableIcons } from "../../../../Others/TableIcons";

class BatchShipModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      outStockReason: ""
    };
    this.onChange = this.onChange.bind(this);
    this.handleReasonButton = this.handleReasonButton.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleReasonButton(e) {
    this.setState({ outStockReason: e.target.value });
  }

  onSave(data) {
    let shipList = [];

    data.forEach(identifier => {
      let shipRequest = {
        stockIdentifierId: identifier.id,
        reason: this.state.outStockReason
      };

      shipList.push(shipRequest);
    });

    this.props.handleShipList(shipList);
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
          <Modal.Title>批量出庫</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row no-gutters">
            <div className="col-5">
              <ShipModalBody
                outStockReason={this.state.outStockReason}
                onChange={this.onChange}
                onReansonButtonChange={this.handleReasonButton}
              />
            </div>
            <div className="col-7">
              <MaterialTable
                title="庫存清單"
                columns={[
                  { title: "貨號", field: "productNo" },
                  { title: "批號", field: "lotNo" },
                  { title: "型態", field: "type" },
                  { title: "數量", field: "quantity" },
                  { title: "單位", field: "unit" }
                ]}
                data={this.props.data}
                icons={tableIcons}
                actions={[
                  {
                    tooltip: "Save all selected items",
                    icon: tableIcons.Save,
                    onClick: (e, data) => {
                      this.onSave(data);
                    },
                    disabled: this.state.outStockReason === ""
                  }
                ]}
                options={{
                  search: false,
                  filtering: true,
                  draggable: false,
                  selection: true,
                  paging: false
                }}
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

export default BatchShipModal;
