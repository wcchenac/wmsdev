import React from "react";
import { getStockInfoesBasic } from "../../../../actions/StockActions";
import StockQueryBoard from "./Common/StockQueryBoard";

const QueryBoard: React.FC = () => (
  <StockQueryBoard isBasic={true} fetchStockInfo={getStockInfoesBasic} />
);

export default QueryBoard;
