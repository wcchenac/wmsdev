import React, { useState, useCallback, useMemo, ChangeEvent } from "react";
import { Modal, Button } from "react-bootstrap";
import ShipModalBody from "../../Utilities/ShipModalBody";
import { DataGrid, GridColDef, GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";

// ============================================
// Type Definitions
// ============================================
interface StockIdentifierData {
  id: number;
  productNo?: string;
  lotNo?: string;
  type?: string;
  quantity?: number;
  unit?: string;
}

interface ShipListItem {
  stockIdentifierId: number;
  reason: string;
}

interface BatchShipModalProps {
  show: boolean;
  handleModalClose: () => void;
  handleShipList: (shipList: ShipListItem[]) => void;
  data: StockIdentifierData[];
  typeValidation?: boolean;
}

// X Data Grid 8+ stores selection as { type, ids }. "Select all" yields
// type "exclude" with the unchecked ids, so membership must honour the type.
const EMPTY_SELECTION: GridRowSelectionModel = { type: "include", ids: new Set() };

const isRowSelected = (model: GridRowSelectionModel, id: GridRowId): boolean =>
  model.type === "include" ? model.ids.has(id) : !model.ids.has(id);

// ============================================
// Component
// ============================================
const BatchShipModal: React.FC<BatchShipModalProps> = ({
  show,
  handleModalClose,
  handleShipList,
  data
}) => {
  const [outStockReason, setOutStockReason] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>(EMPTY_SELECTION);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setOutStockReason(e.target.value);
  }, []);

  const handleReasonButton = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setOutStockReason((e.target as HTMLButtonElement).value);
  }, []);

  const selectedCount = useMemo(
    () => data.filter((item) => isRowSelected(selectedIds, item.id)).length,
    [data, selectedIds]
  );

  const onSave = useCallback(() => {
    const selectedRows = data.filter((item) => isRowSelected(selectedIds, item.id));
    const shipList: ShipListItem[] = selectedRows.map((identifier) => ({
      stockIdentifierId: identifier.id,
      reason: outStockReason
    }));
    handleShipList(shipList);
  }, [data, selectedIds, outStockReason, handleShipList]);

  const columns: GridColDef[] = [
    { field: "productNo", headerName: "\u8ca8\u865f", flex: 1 },
    { field: "lotNo", headerName: "\u6279\u865f", flex: 1 },
    { field: "type", headerName: "\u578b\u614b", flex: 1 },
    { field: "quantity", headerName: "\u6578\u91cf", flex: 1 },
    { field: "unit", headerName: "\u55ae\u4f4d", flex: 1 }
  ];

  const rows = data.map((item, index) => ({
    id: item.id || index,
    ...item
  }));

  return (
    <Modal
      centered
      scrollable
      show={show}
      onHide={handleModalClose}
      size="xl"
    >
      <Modal.Header
        closeButton
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
          color: "var(--color-white)",
          borderBottom: "none",
          padding: "var(--spacing-4)",
        }}
        closeVariant="white"
      >
        <Modal.Title
          style={{
            fontWeight: "var(--font-weight-semibold)",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-2)",
          }}
        >
          <i className="fa fa-truck" aria-hidden="true" />
          批量出庫
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row no-gutters">
          <div className="col-5">
            <ShipModalBody
              outStockReason={outStockReason}
              onChange={onChange}
              onReansonButtonChange={handleReasonButton}
            />
          </div>
          <div className="col-7">
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                onRowSelectionModelChange={(ids) => setSelectedIds(ids)}
                rowSelectionModel={selectedIds}
                disableRowSelectionOnClick
                hideFooter
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          {"\u53d6\u6d88"}
        </Button>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={outStockReason === "" || selectedCount === 0}
        >
          <SaveIcon style={{ marginRight: 8, fontSize: 18 }} />
          {"\u5132\u5b58\u9078\u53d6\u9805\u76ee"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BatchShipModal;
