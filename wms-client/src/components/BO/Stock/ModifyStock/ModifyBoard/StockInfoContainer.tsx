import React from "react";
import StockInfo from "./StockInfo";
import { StockInfo as StockInfoType, ShipRequest, UpdateStockInfoRequest } from "../../../../../types";

// ============================================
// Type Definitions
// ============================================

interface StockInfoContainerProps {
  typeValidation: boolean;
  stockInfoes: StockInfoType[];
  handleShip: (shipRequest: ShipRequest) => void;
  handleShrink: (id: number) => void;
  handleStockInfoUpdate: (updateInfoRequest: UpdateStockInfoRequest) => void;
}

// ============================================
// Component
// ============================================
const StockInfoContainer: React.FC<StockInfoContainerProps> = ({
  typeValidation,
  stockInfoes,
  handleShip,
  handleShrink,
  handleStockInfoUpdate
}) => {
  return (
    <div className="table-wrapper-scroll-y scrollbar-70">
      <table className="table table-sm table-hover">
        <thead className="table-dark">
          <tr>
            {typeValidation ? (
              <React.Fragment>
                <th style={{ width: "20%" }}>
                  <div className="ps-3">{"\u8ca8\u865f"}</div>
                </th>
                <th style={{ width: "8%" }}>
                  <div className="ps-1">{"\u6279\u865f"}</div>
                </th>
                <th style={{ width: "10%" }}>
                  <div className="ps-2">{"\u578b\u614b"}</div>
                </th>
                <th style={{ width: "10%" }}>
                  <div className="ps-2">{"\u6578\u91cf/\u55ae\u4f4d"}</div>
                </th>
                <th style={{ width: "15%" }}>
                  <div className="ps-2">{"\u9032\u8ca8\u65e5\u671f"}</div>
                </th>
                <th style={{ width: "15%" }}>{"\u8a3b\u89e3"}</th>
                <th style={{ width: "22%" }} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <th style={{ width: "15%" }}>
                  <div className="ps-3">{"\u8ca8\u865f"}</div>
                </th>
                <th style={{ width: "8%" }}>
                  <div className="ps-1">{"\u6279\u865f"}</div>
                </th>
                <th style={{ width: "7%" }}>
                  <div className="ps-2">{"\u578b\u614b"}</div>
                </th>
                <th style={{ width: "10%" }}>
                  <div className="ps-1">{"\u6578\u91cf/\u55ae\u4f4d"}</div>
                </th>
                <th style={{ width: "5%" }}>{"\u8272\u865f"}</th>
                <th style={{ width: "8%" }}>
                  <div className="ps-2">{"\u7461\u75b5"}</div>
                </th>
                <th style={{ width: "12%" }}>
                  <div className="ps-2">{"\u9032\u8ca8\u65e5\u671f"}</div>
                </th>
                <th style={{ width: "13%" }}>{"\u8a3b\u89e3"}</th>
                <th style={{ width: "22%" }} />
              </React.Fragment>
            )}
          </tr>
        </thead>
        <tbody>
          {stockInfoes.map((stockInfo, index) => (
            <StockInfo
              key={index}
              index={index}
              typeValidation={typeValidation}
              stockInfo={stockInfo}
              handleShip={handleShip}
              handleShrink={handleShrink}
              handleStockInfoUpdate={handleStockInfoUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockInfoContainer;
