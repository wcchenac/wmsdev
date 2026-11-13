import React from "react";
import StockInfo from "./StockInfo";
import { InStockRollbackResult } from "../../../../../types";

interface StockInfoContainerProps {
  result: InStockRollbackResult;
  handleInStockRollback: (idList: number[]) => void;
}

const StockInfoContainer: React.FC<StockInfoContainerProps> = ({
  result,
  handleInStockRollback
}) => {
  return (
    <div className="table-wrapper-scroll-y scrollbar-70">
      <table className="table table-sm table-hover">
        <thead className="thead-dark">
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
            <th style={{ width: "25%" }}></th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(result).map((productNo, index) => (
            <StockInfo
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
