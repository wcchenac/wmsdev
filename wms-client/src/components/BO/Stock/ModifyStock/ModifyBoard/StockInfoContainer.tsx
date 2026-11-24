import React from "react";
import StockInfo from "./StockInfo";
import { StockInfo as StockInfoType, ShipRequest, UpdateStockInfoRequest } from "../../../../../types";

// ============================================
// Type Definitions
// ============================================

interface StockInfoContainerProps {
  isLoading?: boolean;
  typeValidation: boolean;
  stockInfoes: StockInfoType[];
  handleShip: (shipRequest: ShipRequest) => Promise<boolean> | void;
  handleShrink: (id: number) => Promise<boolean> | void;
  handleStockInfoUpdate: (updateInfoRequest: UpdateStockInfoRequest) => Promise<boolean> | void;
}

// ============================================
// Component
// ============================================
const StockInfoContainer: React.FC<StockInfoContainerProps> = ({
  isLoading = false,
  typeValidation,
  stockInfoes,
  handleShip,
  handleShrink,
  handleStockInfoUpdate
}) => {
  return (
    // text-nowrap: the table needs about 1060px; in a narrower box it keeps that width and the
    // box (overflow: auto) scrolls sideways, instead of squeezing the columns until headers and
    // values break into one character per line. The headers have no fixed widths: columns size
    // to their content, so a long 註解 can use its full 20em (App.css .stock-remark).
    // table-cells-top lines every cell up with that tall 註解 (App.css).
    // stock-table-hardware marks the 五金 layout (7 columns): it keeps the 8em minimum at
    // 992-1199px, where the 布料 one gets 14em, and gets 14em only below 992px.
    <div className="table-wrapper-scroll-y scrollbar-70">
      <table
        className={`table table-sm table-hover table-actions-center text-nowrap table-cells-top${
          typeValidation ? " stock-table-hardware" : ""
        }`}
      >
        <thead className="table-dark">
          <tr>
            {typeValidation ? (
              <React.Fragment>
                <th>
                  <div className="ps-3">{"\u8ca8\u865f"}</div>
                </th>
                <th>
                  <div className="ps-1">{"\u6279\u865f"}</div>
                </th>
                <th>
                  <div className="ps-2">{"\u578b\u614b"}</div>
                </th>
                <th>
                  <div className="ps-2">{"\u6578\u91cf/\u55ae\u4f4d"}</div>
                </th>
                <th>
                  <div className="ps-2">{"\u9032\u8ca8\u65e5\u671f"}</div>
                </th>
                <th>{"\u8a3b\u89e3"}</th>
                <th>
                  <span className="visually-hidden">{"\u64cd\u4f5c"}</span>
                </th>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <th>
                  <div className="ps-3">{"\u8ca8\u865f"}</div>
                </th>
                <th>
                  <div className="ps-1">{"\u6279\u865f"}</div>
                </th>
                <th>
                  <div className="ps-2">{"\u578b\u614b"}</div>
                </th>
                <th>
                  <div className="ps-1">{"\u6578\u91cf/\u55ae\u4f4d"}</div>
                </th>
                <th>{"\u8272\u865f"}</th>
                <th>
                  <div className="ps-2">{"\u7455\u75b5"}</div>
                </th>
                <th>
                  <div className="ps-2">{"\u9032\u8ca8\u65e5\u671f"}</div>
                </th>
                <th>{"\u8a3b\u89e3"}</th>
                <th>
                  <span className="visually-hidden">{"\u64cd\u4f5c"}</span>
                </th>
              </React.Fragment>
            )}
          </tr>
        </thead>
        <tbody>
          {stockInfoes.map((stockInfo, index) => (
            <StockInfo
              key={stockInfo.stockIdentifier?.id ?? index}
              index={index}
              isLoading={isLoading}
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
