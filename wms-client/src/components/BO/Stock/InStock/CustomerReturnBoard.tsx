import React from "react";
import { getCustomerReturnOrder } from "../../../../actions/StockActions";
import InStockBoard from "./Common/InStockBoard";

const CustomerReturnBoard: React.FC = () => (
  <InStockBoard orderLabel="退貨單" inStockType="customerReturn" fetchOrder={getCustomerReturnOrder} />
);

export default CustomerReturnBoard;
