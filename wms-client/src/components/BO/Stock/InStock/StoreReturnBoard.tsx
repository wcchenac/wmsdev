import React from "react";
import { getStoreReturnOrder } from "../../../../actions/StockActions";
import InStockBoard from "./Common/InStockBoard";

const StoreReturnBoard: React.FC = () => (
  <InStockBoard orderLabel="調撥單" inStockType="storeReturn" fetchOrder={getStoreReturnOrder} />
);

export default StoreReturnBoard;
