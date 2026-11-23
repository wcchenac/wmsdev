import React, { useState, useCallback, ChangeEvent } from "react";
import InformationModal from "./InformationModal";
import ShipModal from "../../Utilities/ShipModal";
import { Button } from "react-bootstrap";
import { StockInfo as StockInfoType, ShipRequest, UpdateStockInfoRequest } from "../../../../../types";

// ============================================
// Type Definitions
// ============================================

interface StockInfoProps {
  stockInfo: StockInfoType;
  index: number;
  typeValidation: boolean;
  handleShip: (shipRequest: ShipRequest) => void;
  handleShrink: (id: number) => void;
  handleStockInfoUpdate: (updateInfoRequest: UpdateStockInfoRequest) => void;
}

// ============================================
// Component
// ============================================
const StockInfo: React.FC<StockInfoProps> = ({
  stockInfo,
  index,
  typeValidation,
  handleShip,
  handleShrink,
  handleStockInfoUpdate
}) => {
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [infoShow, setInfoShow] = useState<boolean>(false);
  const [outStockReason, setOutStockReason] = useState<string>("");

  const { stockIdentifier } = stockInfo;

  const onShipClick = useCallback(() => {
    const shipRequest: ShipRequest = {
      stockIdentifierId: stockInfo.stockIdentifier?.id as number,
      reason: outStockReason
    };

    setModalShow(false);
    setOutStockReason("");
    handleShip(shipRequest);
  }, [stockInfo.stockIdentifier?.id, outStockReason, handleShip]);

  const onCancleShipClick = useCallback(() => {
    setModalShow(false);
    setOutStockReason("");
  }, []);

  const onShrinkClick = useCallback(() => {
    handleShrink(stockInfo.stockIdentifier?.id as number);
  }, [handleShrink, stockInfo.stockIdentifier?.id]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "outStockReason") {
      setOutStockReason(e.target.value);
    }
  }, []);

  const handleModalShow = useCallback(() => {
    setModalShow(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalShow(false);
  }, []);

  const handleReasonButton = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setOutStockReason((e.target as HTMLButtonElement).value);
  }, []);

  const btnAlgorithm = (waitToShrink: boolean | undefined, typeVal: boolean, _index: number): React.ReactElement => {
    if (waitToShrink === false) {
      return (
        <React.Fragment>
          <Button
            variant="primary"
            className="me-2"
            onClick={onShrinkClick}
          >
            {typeVal ? "\u5206\u88dd" : "\u6e1b\u80a5"}
          </Button>
          <Button
            variant="primary"
            className="me-2"
            onClick={handleModalShow}
          >
            {"\u51fa\u5eab"}
          </Button>
          {modalShow ? (
            <ShipModal
              show
              outStockReason={outStockReason}
              onChange={onChange}
              onReansonButtonChange={handleReasonButton}
              onShipClick={onShipClick}
              onCancleShipClick={onCancleShipClick}
              handleModalClose={handleModalClose}
            />
          ) : null}
        </React.Fragment>
      );
    } else {
      return (
        <button type="button" className="btn btn-secondary me-2" disabled>
          {typeVal ? "\u5206\u88dd\u8655\u7406\u4e2d" : "\u6e1b\u80a5\u8655\u7406\u4e2d"}
        </button>
      );
    }
  };

  const btnContent = btnAlgorithm(
    stockIdentifier?.waitToShrink,
    typeValidation,
    index
  );

  return (
    <tr className={stockIdentifier?.waitToShrink ? "table-warning" : ""}>
      <td>{stockIdentifier?.productNo}</td>
      <td>{stockIdentifier?.lotNo}</td>
      <td>{stockIdentifier?.type}</td>
      <td>{(stockIdentifier?.quantity ?? "") + " " + (stockIdentifier?.unit ?? "")}</td>
      {typeValidation ? null : (
        <React.Fragment>
          <td>{stockInfo.color}</td>
          <td>{stockInfo.defect as string}</td>
        </React.Fragment>
      )}
      <td>{stockIdentifier?.firstInStockAt}</td>
      {/* 註解 is free text: it wraps within its own width limits (App.css .stock-remark) while the
          rest of the table stays on one line. */}
      <td className="stock-remark">
        <div className="stock-remark-text">{stockInfo.remark}</div>
      </td>
      {/* Row actions sit at the top of a row made tall by a long 註解 (App.css .stock-actions). */}
      <td className="stock-actions">
        <button
          type="button"
          className="btn btn-primary me-2"
          onClick={() => setInfoShow(true)}
        >
          {"\u8a73\u7d30\u8cc7\u6599"}
        </button>
        {infoShow ? (
          <InformationModal
            show
            onHide={() => setInfoShow(false)}
            index={index}
            typeValidation={typeValidation}
            stockInfo={stockInfo}
            handleStockInfoUpdate={handleStockInfoUpdate}
          />
        ) : null}
        {btnContent}
      </td>
    </tr>
  );
};

export default StockInfo;
