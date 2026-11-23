import React from "react";
import { getAssembleOrder } from "../../../../actions/StockActions";
import InStockBoard from "./Common/InStockBoard";

const AssembleStockBoard: React.FC = () => (
  <InStockBoard orderLabel="組裝單" inStockType="assemble" fetchOrder={getAssembleOrder} />
);

export default AssembleStockBoard;
