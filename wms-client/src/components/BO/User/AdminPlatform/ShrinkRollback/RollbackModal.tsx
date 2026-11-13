import React, { useMemo } from "react";
import { Modal, Button } from "react-bootstrap";
import { ShrinkRollbackObject, DefectOption } from "../../../../../types";

const formatDefect = (defect: string | DefectOption[] | undefined): string => {
  if (!defect) return "";
  if (typeof defect === "string") return defect;
  return defect.map(d => d.label).join(", ");
};

interface RollbackModalProps {
  show: boolean;
  handleModalClose: () => void;
  handleSubmitClick: () => void;
  object: ShrinkRollbackObject;
}

const RollbackModal: React.FC<RollbackModalProps> = ({
  show,
  handleModalClose,
  handleSubmitClick,
  object
}) => {
  const isRollbackDisabled = useMemo(() => {
    return object.nodes.some(
      (node) => node.stockInfo.stockIdentifier?.exist === false
    );
  }, [object.nodes]);

  return (
    <Modal
      centered
      show={show}
      onHide={handleModalClose}
      size="xl"
    >
      <Modal.Header
        closeButton
        style={{
          background: "linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-dark, #e0a800) 100%)",
          color: "var(--color-gray-900)",
          borderBottom: "none",
          padding: "var(--spacing-4)",
        }}
      >
        <Modal.Title
          style={{
            fontWeight: "var(--font-weight-semibold)",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-2)",
          }}
        >
          <i className="fa fa-history" aria-hidden="true" />
          回朔確認
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>子項目清單</p>
        <hr />
        <table className="table table-sm table-hover">
          <thead className="table-dark">
            <tr>
              <th>
                <div className="ps-3">貨號</div>
              </th>
              <th>
                <div className="ps-1">批號</div>
              </th>
              <th>
                <div className="ps-2">型態</div>
              </th>
              <th>
                <div className="ps-2">數量/單位</div>
              </th>
              <th>
                <div className="ps-1">瑕疵</div>
              </th>
              <th>
                <div className="ps-1">記錄</div>
              </th>
              <th>
                <div className="ps-2">備註</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {object.nodes.map((node, index) => {
              return (
                <tr
                  key={index}
                  className={
                    node.stockInfo.stockIdentifier?.exist
                      ? ""
                      : "table-secondary"
                  }
                >
                  <td>
                    <button className="btn-customize" disabled>
                      {node.stockInfo.stockIdentifier?.productNo}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {node.stockInfo.stockIdentifier?.lotNo}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {node.stockInfo.stockIdentifier?.type}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {(node.stockInfo.stockIdentifier?.quantity || "") +
                        (node.stockInfo.stockIdentifier?.unit || "")}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {formatDefect(node.stockInfo.defect)}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {node.stockInfo.record}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {node.stockInfo.remark}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          取消
        </Button>
        <Button
          variant="primary"
          disabled={isRollbackDisabled}
          onClick={handleSubmitClick}
        >
          確認
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RollbackModal;
