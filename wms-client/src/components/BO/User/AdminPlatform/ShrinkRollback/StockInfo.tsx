import React, { useState, useCallback } from "react";
import { Button } from "react-bootstrap";
import RollbackModal from "./RollbackModal";
import { ShrinkRollbackObject } from "../../../../../types";

interface StockInfoProps {
  object: ShrinkRollbackObject;
  handleShrinkRollback: (stockIdentifierId: number) => void;
}

const StockInfo: React.FC<StockInfoProps> = ({ object, handleShrinkRollback }) => {
  const [modalShow, setModalShow] = useState<boolean>(false);

  const handleModalShow = useCallback(() => {
    setModalShow(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalShow(false);
  }, []);

  const handleSubmitClick = useCallback(() => {
    setModalShow(false);
    if (object.stockInfo.stockIdentifier?.id) {
      handleShrinkRollback(object.stockInfo.stockIdentifier.id);
    }
  }, [handleShrinkRollback, object.stockInfo.stockIdentifier?.id]);

  return (
    <tr>
      <td>
        <button className="btn-customize" disabled>
          {object.stockInfo.stockIdentifier?.productNo}
        </button>
      </td>
      <td>
        <button className="btn-customize" disabled>
          {object.stockInfo.stockIdentifier?.lotNo}
        </button>
      </td>
      <td>
        <button className="btn-customize" disabled>
          {object.stockInfo.stockIdentifier?.type}
        </button>
      </td>
      <td>
        <button className="btn-customize" disabled>
          {(object.stockInfo.stockIdentifier?.quantity || "") +
            (object.stockInfo.stockIdentifier?.unit || "")}
        </button>
      </td>
      <td>
        <button className="btn-customize" disabled>
          {object.stockInfo.stockIdentifier?.eliminateDate}
        </button>
      </td>
      <td>
        <Button variant="primary" onClick={handleModalShow}>
          詳細資料
        </Button>
        {modalShow ? (
          <RollbackModal
            object={object}
            show
            handleModalClose={handleModalClose}
            handleSubmitClick={handleSubmitClick}
          />
        ) : null}
      </td>
    </tr>
  );
};

export default StockInfo;
