import React from "react";
import StockInfo from "./StockInfo";
import { ShrinkRollbackObject } from "../../../../../types";

interface StockInfoContainerProps {
  result: ShrinkRollbackObject[];
  handleShrinkRollback: (stockIdentifierId: number) => void;
}

const StockInfoContainer: React.FC<StockInfoContainerProps> = ({
  result,
  handleShrinkRollback
}) => {
  return (
    <div className="table-wrapper-scroll-y scrollbar-70">
      <table className="table table-sm table-hover">
        <thead className="thead-dark">
          <tr>
            <th style={{ width: "20%" }}>
              <div className="ps-3">貨號</div>
            </th>
            <th style={{ width: "10%" }}>
              <div className="ps-2">批號</div>
            </th>
            <th style={{ width: "10%" }}>
              <div className="ps-2">型態</div>
            </th>
            <th style={{ width: "20%" }}>
              <div className="ps-2">數量/單位</div>
            </th>
            <th style={{ width: "20%" }}>
              <div className="ps-2">減肥日期</div>
            </th>
            <th style={{ width: "20%" }}></th>
          </tr>
        </thead>
        <tbody>
          {result.map((object, index) => (
            <StockInfo
              object={object}
              key={index}
              handleShrinkRollback={handleShrinkRollback}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockInfoContainer;
