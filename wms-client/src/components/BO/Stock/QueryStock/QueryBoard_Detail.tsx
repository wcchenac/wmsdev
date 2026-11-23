import React from "react";
import { getStockInfoes } from "../../../../actions/StockActions";
import StockQueryBoard from "./Common/StockQueryBoard";

const QueryBoard_Detail: React.FC = () => (
  <StockQueryBoard isBasic={false} fetchStockInfo={getStockInfoes} />
);

export default QueryBoard_Detail;
