import React, { useState, useCallback, ChangeEvent } from "react";
import InformationModal from "./InformationModal";
import ShipModal from "../../Utilities/ShipModal";
import { Button } from "react-bootstrap";
import { StockInfo as StockInfoType, ShipRequest } from "../../../../../types";

// ============================================
// Type Definitions
// ============================================
interface UpdateInfoRequest {
  id?: number;
  color?: string;
  defect?: string;
  record?: string;
  remark?: string;
}

interface StockInfoProps {
  stockInfo: StockInfoType;
  index: number;
  typeValidation: boolean;
  handleShip: (shipRequest: ShipRequest) => void;
  handleShrink: (id: number) => void;
  handleStockInfoUpdate: (updateInfoRequest: UpdateInfoRequest) => void;
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
  const [outStockReason, setOutStockReason] = useState<string>("");

  const { stockIdentifier } = stockInfo;

  const onShipClick = useCallback(() => {
    const shipRequest: ShipRequest = {
      stockIdentifierId: stockInfo.stockIdentifier?.id as number,
      reason: outStockReason
    };

    setModalShow(false);
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
            className="mr-2"
            onClick={onShrinkClick}
          >
            {typeVal ? "\u5206\u88dd" : "\u6e1b\u80a5"}
          </Button>
          <Button
            variant="primary"
            className="mr-2"
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
        <button type="button" className="btn btn-secondary mr-2" disabled>
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
      <td>
        <button className="btn-customize" disabled>
          {stockIdentifier?.productNo}
        </button>
      </td>
      <td>
        <button className="btn-customize" disabled>
          {stockIdentifier?.lotNo}
        </button>
      </td>
      <td>
        <button className="btn-customize" disabled>
          {stockIdentifier?.type}
        </button>
      </td>
      <td>
        <button className="btn-customize" disabled>
          {stockIdentifier?.quantity + " " + stockIdentifier?.unit}
        </button>
      </td>
      {typeValidation ? null : (
        <React.Fragment>
          <td>
            <button className="btn-customize" disabled>
              {stockInfo.color}
            </button>
          </td>
          <td>
            <button className="btn-customize" disabled>
              {stockInfo.defect as string}
            </button>
          </td>
        </React.Fragment>
      )}
      <td>
        <button className="btn-customize" disabled>
          {stockIdentifier?.firstInStockAt}
        </button>
      </td>
      <td>
        <button className="btn-customize" disabled>
          {stockInfo.remark}
        </button>
      </td>
      <td>
        <button
          className="btn btn-primary mr-2"
          data-toggle="modal"
          data-target={"#detailInfo-" + index}
        >
          {"\u8a73\u7d30\u8cc7\u6599"}
        </button>
        <InformationModal
          index={index}
          typeValidation={typeValidation}
          stockInfo={stockInfo}
          handleStockInfoUpdate={handleStockInfoUpdate}
        />
        {btnContent}
      </td>
    </tr>
  );
};

export default StockInfo;
