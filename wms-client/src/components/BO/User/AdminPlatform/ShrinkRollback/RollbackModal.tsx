import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { ShrinkRollbackObject, DefectOption } from "../../../../../types";

const formatDefect = (defect: string | DefectOption[] | undefined): string => {
  if (!defect) return "";
  if (typeof defect === "string") return defect;
  return defect.map(d => d.label).join(", ");
};

interface RollbackModalProps {
  show: boolean;
  isLoading?: boolean;
  handleModalClose: () => void;
  handleSubmitClick: () => Promise<unknown> | void;
  object: ShrinkRollbackObject;
}

const RollbackModal: React.FC<RollbackModalProps> = ({
  show,
  isLoading = false,
  handleModalClose,
  handleSubmitClick,
  object
}) => {
  const clickedRef = useRef(false);
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  useEffect(() => {
    if (!show || !isLoading) {
      clickedRef.current = false;
    }
  }, [show, isLoading]);

  const onConfirmClick = useCallback(() => {
    if (isLoading || clickedRef.current) {
      return;
    }
    clickedRef.current = true;
    Promise.resolve(handleSubmitClick()).finally(() => {
      if (!isLoadingRef.current) {
        clickedRef.current = false;
      }
    });
  }, [isLoading, handleSubmitClick]);

  const isRollbackDisabled = useMemo(() => {
    return object.nodes.some(
      (node) => node.stockInfo.stockIdentifier?.exist === false
    );
  }, [object.nodes]);

  return (
    <Modal
      centered
      show={show}
      onHide={isLoading ? undefined : handleModalClose}
      backdrop={isLoading ? "static" : true}
      keyboard={!isLoading}
      size="xl"
    >
      <Modal.Header
        closeButton={!isLoading}
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
                  <td>{node.stockInfo.stockIdentifier?.productNo}</td>
                  <td>{node.stockInfo.stockIdentifier?.lotNo}</td>
                  <td>{node.stockInfo.stockIdentifier?.type}</td>
                  <td>
                    {(node.stockInfo.stockIdentifier?.quantity ?? "") +
                      (node.stockInfo.stockIdentifier?.unit ?? "")}
                  </td>
                  <td>{formatDefect(node.stockInfo.defect)}</td>
                  <td>{node.stockInfo.record}</td>
                  <td>{node.stockInfo.remark}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose} disabled={isLoading}>
          取消
        </Button>
        <Button
          variant="primary"
          disabled={isLoading || isRollbackDisabled}
          aria-busy={isLoading}
          onClick={onConfirmClick}
        >
          確認
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RollbackModal;
