import React from "react";
import { StockInfo as StockInfoType, StockIdentifier } from "../../../../../types";

interface StockInfoProps {
  typeValidation: boolean;
  stockInfo: StockInfoType;
}

interface StockInfoWithIdentifier extends StockInfoType {
  stockIdentifier: StockIdentifier & {
    waitToShrink?: boolean;
    firstInStockAt?: string;
  };
}

const StockInfo: React.FC<StockInfoProps> = ({ typeValidation, stockInfo }) => {
  const typedStockInfo = stockInfo as StockInfoWithIdentifier;
  const { stockIdentifier } = typedStockInfo;

  return (
    <tr className={stockIdentifier.waitToShrink ? "table-warning" : ""}>
      <td>{stockIdentifier.productNo}</td>
      <td>{stockIdentifier.lotNo}</td>
      <td>{stockIdentifier.type}</td>
      <td>{stockIdentifier.quantity}</td>
      <td>{stockIdentifier.unit}</td>
      {typeValidation ? null : (
        <React.Fragment>
          <td>{stockInfo.color}</td>
          <td>{typeof stockInfo.defect === 'string' ? stockInfo.defect : ''}</td>
        </React.Fragment>
      )}
      <td>{stockInfo.remark}</td>
      <td>{stockIdentifier.firstInStockAt}</td>
    </tr>
  );
};

export default StockInfo;
