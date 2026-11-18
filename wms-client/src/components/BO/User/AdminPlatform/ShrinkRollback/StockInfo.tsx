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
    const id = object.stockInfo.stockIdentifier?.id;
    if (id !== undefined && id !== null) {
      handleShrinkRollback(id);
    }
  }, [handleShrinkRollback, object.stockInfo.stockIdentifier?.id]);

  return (
    <tr>
      <td>{object.stockInfo.stockIdentifier?.productNo}</td>
      <td>{object.stockInfo.stockIdentifier?.lotNo}</td>
      <td>{object.stockInfo.stockIdentifier?.type}</td>
      <td>
        {(object.stockInfo.stockIdentifier?.quantity || "") +
          (object.stockInfo.stockIdentifier?.unit || "")}
      </td>
      <td>{object.stockInfo.stockIdentifier?.eliminateDate}</td>
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
