import React, { useState, useCallback, useMemo } from "react";
import { Button } from "react-bootstrap";
import RollbackModal from "./RollbackModal";
import { StockInfo as StockInfoType } from "../../../../../types";
import { round10 } from "../../../../../utilities/DecimalAdjust";

interface StockInfoProps {
  isLoading?: boolean;
  productNo: string;
  list: StockInfoType[];
  handleInStockRollback: (idList: number[]) => Promise<boolean> | void;
}

const StockInfo: React.FC<StockInfoProps> = ({
  isLoading = false,
  productNo,
  list,
  handleInStockRollback
}) => {
  const [modalShow, setModalShow] = useState<boolean>(false);

  const handleModalShow = useCallback(() => {
    setModalShow(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalShow(false);
  }, []);

  const handleSubmitClick = useCallback(async (idList: number[]) => {
    const ok = await Promise.resolve(handleInStockRollback(idList));
    if (ok !== false) {
      setModalShow(false);
    }
  }, [handleInStockRollback]);

  const content = useMemo(() => {
    let totalQuantity = 0;
    const unit = list[0]?.stockIdentifier?.unit || "";

    list.forEach(object => {
      totalQuantity += parseFloat(String(object.stockIdentifier?.quantity || 0));
    });

    return {
      totalQuantity: round10(totalQuantity, -2),
      unit: unit
    };
  }, [list]);

  return (
    <tr>
      <td>{productNo}</td>
      <td>{content.totalQuantity + content.unit}</td>
      <td>{list.length}</td>
      <td>
        <Button variant="primary" onClick={handleModalShow} disabled={isLoading}>
          詳細資料
        </Button>
        {modalShow ? (
          <RollbackModal
            isLoading={isLoading}
            list={list}
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
