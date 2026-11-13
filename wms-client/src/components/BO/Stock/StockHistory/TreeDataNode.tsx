import React from "react";
import { StockInfo } from "../../../../types";

// Extended StockIdentifier for history display
interface StockIdentifierExtended {
  id?: number;
  productNo?: string;
  lotNo?: string;
  type?: string;
  quantity?: number;
  unit?: string;
  exist?: boolean;
  eliminateDate?: string;
  eliminateReason?: string;
  eliminateType?: string;
  waitToShrink?: boolean;
  firstInStockAt?: string;
  inStockType?: string;
  adjustment?: number | null;
}

// Extended StockInfo for history display
interface StockInfoExtended extends Omit<StockInfo, "stockIdentifier"> {
  stockIdentifier: StockIdentifierExtended;
}

interface TreeDataNodeProps {
  stockInfo: StockInfoExtended;
}

const TreeDataNode: React.FC<TreeDataNodeProps> = ({ stockInfo }) => {
  const { stockIdentifier } = stockInfo;

  return (
    <div
      style={
        stockIdentifier.exist
          ? {
              backgroundColor: "palegreen",
              display: "inline-block",
              borderRadius: 10,
              color: "black",
              padding: "0px 5px",
            }
          : {
              backgroundColor: "lightgray",
              display: "inline-block",
              borderRadius: 10,
              color: "black",
              padding: "0px 5px",
            }
      }
    >
      <p className="mb-0">
        首次入庫日期: {stockIdentifier.firstInStockAt}, 入庫方式:{" "}
        {stockIdentifier.inStockType}
      </p>
      <p className="mb-0">
        貨號/批號:
        {stockIdentifier.productNo}/{stockIdentifier.lotNo}, 型態:{" "}
        {stockIdentifier.type}, 數量/單位: {stockIdentifier.quantity}
        {stockIdentifier.unit}
      </p>
      <p className="mb-0">
        {`瑕疵: ${stockInfo.defect}, 色號: ${stockInfo.color}, 記錄: ${stockInfo.record}`}
      </p>
      {stockIdentifier.exist ? null : (
        <p className="mb-0">
          出庫日期: {stockIdentifier.eliminateDate}, 出庫原因:{" "}
          {stockIdentifier.eliminateReason}
          {stockIdentifier.eliminateType === "1" &&
          stockIdentifier.adjustment !== null
            ? ", 短溢數量/單位: " +
              stockIdentifier.adjustment +
              stockIdentifier.unit
            : null}
        </p>
      )}
    </div>
  );
};

export default TreeDataNode;
