import React from "react";
import StockInfo from "./StockInfo";
import { StockInfo as StockInfoType } from "../../../../../types";

interface StockInfoContainerProps {
  typeValidation: boolean;
  stockInfoes: StockInfoType[];
}

const StockInfoContainer: React.FC<StockInfoContainerProps> = ({
  typeValidation,
  stockInfoes
}) => {
  return (
    <div
      className="stock-info-table-container"
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div className="table-wrapper-scroll-y scrollbar-70">
        <table
          className={`table table-sm table-hover mb-0 text-nowrap table-cells-top${
            typeValidation ? " stock-table-hardware" : ""
          }`}
        >
          <thead className="table-dark">
            <tr>
              {typeValidation ? (
                <React.Fragment>
                  <th>貨號</th>
                  <th>批號</th>
                  <th>型態</th>
                  <th>數量</th>
                  <th>單位</th>
                  <th>註解</th>
                  <th>進貨日期</th>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <th>貨號</th>
                  <th>批號</th>
                  <th>型態</th>
                  <th>數量</th>
                  <th>單位</th>
                  <th>色號</th>
                  <th>瑕疵</th>
                  <th>註解</th>
                  <th>進貨日期</th>
                </React.Fragment>
              )}
            </tr>
          </thead>
          <tbody>
            {stockInfoes.map((stockInfo, index) => (
              <StockInfo
                key={index}
                typeValidation={typeValidation}
                stockInfo={stockInfo}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockInfoContainer;
