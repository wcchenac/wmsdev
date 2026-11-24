import React from "react";
import StockInfo from "./StockInfo";
import { ShrinkRollbackObject } from "../../../../../types";

interface StockInfoContainerProps {
  isLoading?: boolean;
  result: ShrinkRollbackObject[];
  handleShrinkRollback: (stockIdentifierId: number) => Promise<boolean> | void;
}

const StockInfoContainer: React.FC<StockInfoContainerProps> = ({
  isLoading = false,
  result,
  handleShrinkRollback
}) => {
  return (
    <div className="table-wrapper-scroll-y scrollbar-70">
      <table className="table table-sm table-hover table-actions-center text-nowrap">
        <thead className="table-dark">
          <tr>
            <th>
              <div className="ps-3">貨號</div>
            </th>
            <th>
              <div className="ps-2">批號</div>
            </th>
            <th>
              <div className="ps-2">型態</div>
            </th>
            <th>
              <div className="ps-2">數量/單位</div>
            </th>
            <th>
              <div className="ps-2">減肥日期</div>
            </th>
            <th>
              <span className="visually-hidden">操作</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {result.map((object, index) => (
            <StockInfo
              isLoading={isLoading}
              object={object}
              key={object.stockInfo.stockIdentifier?.id ?? index}
              handleShrinkRollback={handleShrinkRollback}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockInfoContainer;
