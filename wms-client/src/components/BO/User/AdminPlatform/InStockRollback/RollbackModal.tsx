import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { StockInfo, DefectOption } from "../../../../../types";

const formatDefect = (defect: string | DefectOption[] | undefined): string => {
  if (!defect) return "";
  if (typeof defect === "string") return defect;
  return defect.map(d => d.label).join(", ");
};

interface RollbackModalProps {
  show: boolean;
  isLoading?: boolean;
  handleModalClose: () => void;
  handleSubmitClick: (idList: number[]) => void;
  list: StockInfo[];
}

const RollbackModal: React.FC<RollbackModalProps> = ({
  show,
  isLoading = false,
  handleModalClose,
  handleSubmitClick,
  list
}) => {
  const clickedRef = useRef(false);

  useEffect(() => {
    if (!show || !isLoading) {
      clickedRef.current = false;
    }
  }, [show, isLoading]);
  const idList = useMemo(() => {
    return list
      .filter((item) => item.stockIdentifier?.exist === true)
      .map((item) => item.stockIdentifier?.id)
      .filter((id): id is number => id !== undefined);
  }, [list]);

  const isRollbackDisabled = useMemo(() => {
    return list.some((item) => item.stockIdentifier?.exist === false);
  }, [list]);

  const handleSubmit = useCallback(() => {
    if (isLoading || clickedRef.current) {
      return;
    }
    clickedRef.current = true;
    handleSubmitClick(idList);
  }, [isLoading, handleSubmitClick, idList]);

  return (
    <Modal
      centered
      scrollable
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
          <i className="fa fa-undo" aria-hidden="true" />
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
            {list.map((item, index) => {
              return (
                <tr
                  key={index}
                  className={
                    item.stockIdentifier?.exist ? "" : "table-secondary"
                  }
                >
                  <td>{item.stockIdentifier?.productNo}</td>
                  <td>{item.stockIdentifier?.lotNo}</td>
                  <td>{item.stockIdentifier?.type}</td>
                  <td>
                    {(item.stockIdentifier?.quantity ?? "") +
                      (item.stockIdentifier?.unit ?? "")}
                  </td>
                  <td>{formatDefect(item.defect)}</td>
                  <td>{item.record}</td>
                  <td>{item.remark}</td>
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
          onClick={handleSubmit}
        >
          確認
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RollbackModal;
