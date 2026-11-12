import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import ShipModalBody from "../../Utilities/ShipModalBody";
import MaterialTable, { Icons } from "material-table";
import { tableIcons } from "../../../../Others/TableIcons";

import type { StockIdentifier } from "../../../../../types/domain";

interface ShipRequest {
  stockIdentifierId: number;
  reason: string;
}

interface Props {
  show: boolean;
  data: StockIdentifier[];
  typeValidation?: boolean;
  handleModalClose: () => void;
  handleShipList: (shipList: ShipRequest[]) => void;
}

interface State {
  outStockReason: string;
}


class BatchShipModal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      outStockReason: ""
    };
    this.onChange = this.onChange.bind(this);
    this.handleReasonButton = this.handleReasonButton.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.name === "outStockReason") {
      this.setState({ outStockReason: (e.target as HTMLButtonElement).value });
    }
  }

  handleReasonButton(e: React.MouseEvent<HTMLButtonElement>) {
    this.setState({ outStockReason: (e.target as HTMLButtonElement).value });
  }

  onSave(data: StockIdentifier[]) {
    const shipList: ShipRequest[] = [];

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
                icons={tableIcons as unknown as Icons}
                actions={[
                  {
                    tooltip: "Save all selected items",
                    icon: tableIcons.Save as unknown as () => React.ReactElement,
                    onClick: (_event, data) => {
                      this.onSave(data as StockIdentifier[]);
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
