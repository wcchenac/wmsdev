import React, { ChangeEvent, MouseEvent } from "react";
import { Modal, Button } from "react-bootstrap";
import ShipModalBody from "./ShipModalBody";

interface ShipModalProps {
  show: boolean;
  handleModalClose: () => void;
  outStockReason: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onReansonButtonChange: (e: MouseEvent<HTMLButtonElement>) => void;
  onCancleShipClick: (e: MouseEvent<HTMLButtonElement>) => void;
  onShipClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

const ShipModal: React.FC<ShipModalProps> = ({
  show,
  handleModalClose,
  outStockReason,
  onChange,
  onReansonButtonChange,
  onCancleShipClick,
  onShipClick,
}) => {
  return (
    <Modal centered show={show} onHide={handleModalClose}>
      <Modal.Header
        closeButton
        style={{
          background: "linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark, #1e7e34) 100%)",
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
          <i className="fa fa-check-circle" aria-hidden="true" />
          出庫確認
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ShipModalBody
          outStockReason={outStockReason}
          onChange={onChange}
          onReansonButtonChange={onReansonButtonChange}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancleShipClick} value="">
          取消
        </Button>
        <Button
          variant="primary"
          onClick={onShipClick}
          disabled={!outStockReason}
        >
          確認
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShipModal;
