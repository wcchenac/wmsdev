import React from "react";
import StockInfo from "./StockInfo";
import { InStockRollbackResult } from "../../../../../types";

interface StockInfoContainerProps {
  isLoading?: boolean;
  result: InStockRollbackResult;
  handleInStockRollback: (idList: number[]) => void;
}

const StockInfoContainer: React.FC<StockInfoContainerProps> = ({
  isLoading = false,
  result,
  handleInStockRollback
}) => {
  return (
    <div className="table-wrapper-scroll-y scrollbar-70">
      <table className="table table-sm table-hover table-actions-center">
        <thead className="table-dark">
          <tr>
            <th style={{ width: "25%" }}>
              <div className="ps-3">貨號</div>
            </th>
            <th style={{ width: "25%" }}>
              <div className="ps-2">總數量/單位</div>
            </th>
            <th style={{ width: "25%" }}>
              <div className="ps-2">子項目總數</div>
            </th>
            <th style={{ width: "25%" }}>
              <span className="visually-hidden">操作</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(result).map((productNo, index) => (
            <StockInfo
              isLoading={isLoading}
              productNo={productNo}
              list={result[productNo]}
              key={index}
              handleInStockRollback={handleInStockRollback}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockInfoContainer;
