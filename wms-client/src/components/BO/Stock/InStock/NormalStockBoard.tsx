import React from "react";
import { getInStockOrder } from "../../../../actions/StockActions";
import InStockBoard from "./Common/InStockBoard";

const NormalStockBoard: React.FC = () => (
  <InStockBoard orderLabel="進貨單" inStockType="normal" fetchOrder={getInStockOrder} />
);

export default NormalStockBoard;
