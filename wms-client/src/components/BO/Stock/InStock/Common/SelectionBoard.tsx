import React, { ChangeEvent, MouseEvent } from "react";
import CheckBoxForSelectionBoard from "./CheckBoxForSelectionBoard";
import { Button } from "react-bootstrap";

interface WaitHandleStatusItem {
  quantity: string | number;
  unit: string;
}

interface WaitHandleStatus {
  [productNo: string]: {
    [type: string]: WaitHandleStatusItem;
  };
}

interface SelectedProductNo {
  productNo: string;
  selected: boolean;
  index: number;
  isSubmitted: boolean;
}

interface SelectionBoardProps {
  orderNo: string;
  waitHandleStatus: WaitHandleStatus;
  selectedProductNoList: SelectedProductNo[];
  handlePrevStep: () => void;
  handleNextStep: () => void;
  handleSelectionClick: (e: MouseEvent<HTMLButtonElement>) => void;
  handleCheckBoxSelected: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
  type: string;
}

const SelectionBoard: React.FC<SelectionBoardProps> = ({
  orderNo,
  waitHandleStatus,
  selectedProductNoList,
  handlePrevStep,
  handleNextStep,
  handleSelectionClick,
  handleCheckBoxSelected,
  type,
}) => {
  const filterSelectedList = selectedProductNoList.filter(
    (object) => object.selected === true
  );

  return (
    <div>
      <div className="row justify-content-between">
        <Button variant="primary" onClick={handlePrevStep}>
          上一步
        </Button>
        <Button
          variant="primary"
          onClick={handleNextStep}
          disabled={filterSelectedList.length === 0}
        >
          下一步
        </Button>
      </div>
      <p className="h5 text-center">{type + "單號: " + orderNo}</p>
      <p className="h5 text-center">含有以下貨號，請選擇此次欲入庫貨號</p>
      <div className="row justify-content-end">
        <Button
          className="mr-2"
          variant="info"
          value="true"
          onClick={handleSelectionClick}
        >
          全選
        </Button>
        <Button
          variant="info"
          value="false"
          onClick={handleSelectionClick}
        >
          取消全選
        </Button>
      </div>
      <hr />
      <div className="scrollbar-65">
        <div className="container">
          <div className="row">
            {selectedProductNoList.map((object, index) => (
              <CheckBoxForSelectionBoard
                key={index}
                index={object.index}
                productNo={object.productNo}
                checked={object.selected}
                waitHandleStatus={waitHandleStatus[object.productNo]}
                handleCheckBoxSelected={handleCheckBoxSelected}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionBoard;
