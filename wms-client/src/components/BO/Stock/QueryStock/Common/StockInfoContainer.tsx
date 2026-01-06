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
        <table className="table table-sm table-hover mb-0">
          <thead className="thead-dark">
            <tr>
              {typeValidation ? (
                <React.Fragment>
                  <th style={{ width: "15%" }}>貨號</th>
                  <th style={{ width: "15%" }}>批號</th>
                  <th style={{ width: "15%" }}>型態</th>
                  <th style={{ width: "15%" }}>數量</th>
                  <th style={{ width: "15%" }}>單位</th>
                  <th style={{ width: "10%" }}>註解</th>
                  <th style={{ width: "15%" }}>進貨日期</th>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <th style={{ width: "14%" }}>貨號</th>
                  <th style={{ width: "10%" }}>批號</th>
                  <th style={{ width: "10%" }}>型態</th>
                  <th style={{ width: "10%" }}>數量</th>
                  <th style={{ width: "8%" }}>單位</th>
                  <th style={{ width: "8%" }}>色號</th>
                  <th style={{ width: "12%" }}>瑕疵</th>
                  <th style={{ width: "12%" }}>註解</th>
                  <th style={{ width: "16%" }}>進貨日期</th>
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
