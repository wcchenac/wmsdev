import React, { useMemo, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import { StockInfo, DefectOption } from "../../../../../types";

const formatDefect = (defect: string | DefectOption[] | undefined): string => {
  if (!defect) return "";
  if (typeof defect === "string") return defect;
  return defect.map(d => d.label).join(", ");
};

interface RollbackModalProps {
  show: boolean;
  handleModalClose: () => void;
  handleSubmitClick: (idList: number[]) => void;
  list: StockInfo[];
}

const RollbackModal: React.FC<RollbackModalProps> = ({
  show,
  handleModalClose,
  handleSubmitClick,
  list
}) => {
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
    handleSubmitClick(idList);
  }, [handleSubmitClick, idList]);

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
          <thead className="thead-dark">
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
                  <td>
                    <button className="btn-customize" disabled>
                      {item.stockIdentifier?.productNo}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {item.stockIdentifier?.lotNo}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {item.stockIdentifier?.type}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {(item.stockIdentifier?.quantity || "") +
                        (item.stockIdentifier?.unit || "")}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {formatDefect(item.defect)}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {item.record}
                    </button>
                  </td>
                  <td>
                    <button className="btn-customize" disabled>
                      {item.remark}
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
          onClick={handleSubmit}
        >
          確認
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RollbackModal;
