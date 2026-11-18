import React, { useState, useCallback, ChangeEvent, FormEvent, MouseEvent } from "react";
import StockInfo from "./StockInfo";
import { copy } from "../../../../../utilities/DeepCopy";
import {
  quantityAccumulate,
  updateStockInfoesCopy,
  joinInfoDefectArray,
  parseRowCount,
  exceedsRowCountLimit,
} from "../../Utilities/StockInfoHelperMethods";
import ToolbarForAddDeleteSubmit from "../../Utilities/ToolbarForAddDeleteSubmit";
import { DefectOptions, DefectOption } from "../../../../../enums/Enums";
import { InStockRequest } from "../../../../../types";
import { MultiValue } from "react-select";

interface WaitHandleStatusItem {
  quantity: string | number;
  unit: string;
}

interface WaitHandleProductStatus {
  [type: string]: WaitHandleStatusItem;
}

interface StockInfoErrors {
  quantity: string;
}

interface StockInfoData {
  productNo: string;
  lotNo: string;
  type: string;
  quantity: string;
  unit: string;
  color: string;
  defect: DefectOption[] | string;
  record: string;
  remark: string;
  inStockType: string;
  orderNo: string;
  directShip: boolean;
  outStockReason: string;
  errors: StockInfoErrors;
}

interface StockInfoContainerProps {
  sequence: number;
  /** Whether this tab pane is shown. Defaults to showing the first pane (sequence 0). */
  active?: boolean;
  index: number;
  productNo: string;
  typeValidation: boolean;
  waitHandleStatus: WaitHandleProductStatus;
  isLoading: boolean;
  type: string;
  orderNo: string;
  handleInStockRequestSubmit: (
    e: MouseEvent<HTMLButtonElement>,
    index: number,
    inStockRequests: InStockRequest[]
  ) => void;
}

interface QuantitySum {
  [key: string]: number;
}

function initialInfoContent(props: StockInfoContainerProps): StockInfoData {
  const { typeValidation, waitHandleStatus, productNo, type, orderNo } = props;
  const typeKeys = Object.keys(waitHandleStatus);
  const typeKey =
    typeKeys.find((key) => parseFloat(String(waitHandleStatus[key]?.quantity)) > 0) ??
    typeKeys[0] ??
    "";
  const newStockInfo: StockInfoData = {
    productNo: productNo,
    lotNo: "",
    type: typeKey,
    quantity: "",
    unit: waitHandleStatus[typeKey]?.unit ?? "",
    color: "1",
    defect: [DefectOptions[0]],
    record: "",
    remark: "",
    inStockType: type,
    orderNo: orderNo,
    directShip: false,
    outStockReason: "",
    errors: {
      quantity: "",
    },
  };
  if (typeValidation) {
    newStockInfo.color = "";
    newStockInfo.defect = "";
  }

  return newStockInfo;
}

function checkFormAlgorithm(
  stockInfoes: StockInfoData[],
  typeList: string[],
  quantitySum: QuantitySum,
  waitHandleStatus: WaitHandleProductStatus
): boolean {
  let isFormValid = false;

  if (stockInfoes.length === 0) {
    return isFormValid;
  }

  // check form has errors or invalid value
  for (let i = 0; i < stockInfoes.length; i += 1) {
    if (
      stockInfoes[i].errors.quantity === "" &&
      parseFloat(stockInfoes[i].quantity) > 0
    ) {
      isFormValid = true;
    } else {
      isFormValid = false;
      return isFormValid;
    }
  }

  if (typeList.length === 0) {
    return false;
  }

  return typeList.every(
    (type) => parseFloat(String(waitHandleStatus[type]?.quantity)) === quantitySum[type]
  );
}

const StockInfoContainer: React.FC<StockInfoContainerProps> = React.memo(function StockInfoContainer(
  props: StockInfoContainerProps
) {
  const {
    sequence,
    active,
    index,
    productNo,
    typeValidation,
    waitHandleStatus,
    isLoading,
    type,
    orderNo,
    handleInStockRequestSubmit,
  } = props;

  const [assignRowNum, setAssignRowNum] = useState<number | string>(0);
  const [stockInfoes, setStockInfoes] = useState<StockInfoData[]>([initialInfoContent(props)]);

  const handleNewDataClick = useCallback(() => {
    setStockInfoes((prevStockInfoes) => {
      let newStockInfo: StockInfoData;

      if (prevStockInfoes.length === 0) {
        newStockInfo = initialInfoContent(props);
      } else {
        newStockInfo = {
          productNo: productNo,
          lotNo: prevStockInfoes[prevStockInfoes.length - 1].lotNo,
          type: prevStockInfoes[prevStockInfoes.length - 1].type,
          quantity: "",
          unit: prevStockInfoes[prevStockInfoes.length - 1].unit,
          color: prevStockInfoes[prevStockInfoes.length - 1].color,
          defect: prevStockInfoes[prevStockInfoes.length - 1].defect,
          record: "",
          remark: "",
          inStockType: type,
          orderNo: orderNo,
          directShip: false,
          outStockReason: "",
          errors: {
            quantity: "",
          },
        };
      }

      return [...prevStockInfoes, newStockInfo];
    });
  }, [productNo, type, orderNo, props]);

  const handleDeleteDataClick = useCallback(() => {
    setStockInfoes((prevStockInfoes) => {
      const stockInfoesCopy = [...prevStockInfoes];
      stockInfoesCopy.splice(stockInfoesCopy.length - 1, 1);
      return stockInfoesCopy;
    });
  }, []);

  const handleInfoChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement>, i: number) => {
    setStockInfoes((prevStockInfoes) => {
      const stockInfoesCopy = copy(prevStockInfoes);
      const { name, value } = event.target;
      updateStockInfoesCopy(stockInfoesCopy, name, value, i);
      return stockInfoesCopy;
    });
  }, []);

  const handleDefectChange = useCallback((selectedOptions: MultiValue<DefectOption>, i: number) => {
    setStockInfoes((prevStockInfoes) => {
      const copyList = [...prevStockInfoes];
      copyList[i] = { ...copyList[i], defect: selectedOptions as DefectOption[] };
      return copyList;
    });
  }, []);

  const handleShipCheck = useCallback((checked: boolean, i: number) => {
    setStockInfoes((prevStockInfoes) => {
      const copyList = [...prevStockInfoes];
      copyList[i] = {
        ...copyList[i],
        directShip: checked,
        outStockReason: checked ? copyList[i].outStockReason : "",
      };
      return copyList;
    });
  }, []);

  const handleReasonButton = useCallback((value: string, i: number) => {
    setStockInfoes((prevStockInfoes) => {
      const copyList = [...prevStockInfoes];
      copyList[i] = { ...copyList[i], outStockReason: value };
      return copyList;
    });
  }, []);

  const handleRowNumChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setAssignRowNum(e.target.value);
  }, []);

  const handleRowNumSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // The toolbar shows the limit hint; keep the typed value so it stays visible.
    if (exceedsRowCountLimit(assignRowNum)) {
      return;
    }

    setStockInfoes((prevStockInfoes) => {
      const stockInfoesCopy = copy(prevStockInfoes);
      let newStockInfo: StockInfoData;

      if (prevStockInfoes.length === 0) {
        newStockInfo = initialInfoContent(props);
      } else {
        newStockInfo = {
          productNo: productNo,
          lotNo: prevStockInfoes[prevStockInfoes.length - 1].lotNo,
          type: prevStockInfoes[prevStockInfoes.length - 1].type,
          quantity: "",
          unit: prevStockInfoes[prevStockInfoes.length - 1].unit,
          color: prevStockInfoes[prevStockInfoes.length - 1].color,
          defect: prevStockInfoes[prevStockInfoes.length - 1].defect,
          record: "",
          remark: "",
          inStockType: type,
          orderNo: orderNo,
          directShip: false,
          outStockReason: "",
          errors: {
            quantity: "",
          },
        };
      }

      const numRows = parseRowCount(assignRowNum);
      for (let i = 0; i < numRows; i += 1) {
        // Each row gets its own object; sharing one made a change to a row show on all of them.
        stockInfoesCopy.push(copy(newStockInfo));
      }

      return stockInfoesCopy;
    });

    setAssignRowNum(0);
  }, [productNo, type, orderNo, assignRowNum, props]);

  const handleSubmitClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    // The backend takes the selected defects as one "GA/GB" string per row; hardware rows
    // already hold "".
    const inStockRequests: InStockRequest[] = copy(stockInfoes).map((row) => ({
      ...row,
      defect: Array.isArray(row.defect) ? joinInfoDefectArray({ defect: row.defect }) : row.defect,
    }));

    handleInStockRequestSubmit(e, index, inStockRequests);
  }, [stockInfoes, handleInStockRequestSubmit, index]);

  const typeList = Object.keys(waitHandleStatus);
  const quantitySum: QuantitySum = quantityAccumulate(stockInfoes);
  const isFormValid = checkFormAlgorithm(
    stockInfoes,
    typeList,
    quantitySum,
    waitHandleStatus
  );

  return (
    <div
      className={
        (active ?? sequence === 0) ? "tab-pane fade show active" : "tab-pane fade"
      }
      id={"nav-" + index}
      role="tabpanel"
      aria-labelledby={"nav-tab-" + index}
    >
      <p className="h4 text-center">待入庫總量</p>
      <div>
        <table className="table table-sm">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "20%" }}>貨號</th>
              <th style={{ width: "20%" }}>型態</th>
              <th style={{ width: "20%" }}>總數量</th>
              <th style={{ width: "20%" }}>目前數量</th>
              <th style={{ width: "20%" }}>單位</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(waitHandleStatus).map((typeKey, idx) => (
              <tr key={idx}>
                <td>
                  <div className="mb-0">
                    <input
                      type="text"
                      className="form-control"
                      name="productNo"
                      value={productNo}
                      readOnly
                    />
                  </div>
                </td>
                <td>
                  <div className="mb-0">
                    <input
                      type="text"
                      className="form-control"
                      name="type"
                      value={typeKey}
                      readOnly
                    />
                  </div>
                </td>
                <td>
                  <div className="mb-0">
                    <input
                      type="text"
                      className="form-control"
                      name="quantity_waitHandle"
                      value={waitHandleStatus[typeKey].quantity as string}
                      readOnly
                    />
                  </div>
                </td>
                <td>
                  <div className="mb-0">
                    <input
                      type="text"
                      className="form-control"
                      name="quantity_handled"
                      value={quantitySum[typeKey]?.toString() || "0"}
                      readOnly
                    />
                  </div>
                </td>
                <td>
                  <div className="mb-0">
                    <input
                      type="text"
                      className="form-control"
                      name="unit"
                      value={waitHandleStatus[typeKey].unit}
                      readOnly
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr />
      <ToolbarForAddDeleteSubmit
        onAddClick={handleNewDataClick}
        onDeleteClick={handleDeleteDataClick}
        onSubmitClick={handleSubmitClick}
        handleRowNumChange={handleRowNumChange}
        handleRowNumSubmit={handleRowNumSubmit}
        deleteDisabled={stockInfoes.length === 0}
        submitDisabled={!isFormValid}
        assignRowNum={assignRowNum}
        isLoading={isLoading}
      />
      <div className="table-responsive">
        <table className="table table-sm table-actions-center text-nowrap">
          <thead className="table-dark">
            <tr>
              {typeValidation ? (
                <React.Fragment>
                  <th>貨號</th>
                  <th>批號</th>
                  <th>型態</th>
                  <th>數量</th>
                  <th>單位</th>
                  <th>記錄</th>
                  <th>直出</th>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <th>貨號</th>
                  <th>批號</th>
                  <th>型態</th>
                  <th>數量</th>
                  <th>單位</th>
                  <th>色號</th>
                  <th>瑕疵</th>
                  <th>記錄</th>
                  <th>直出</th>
                </React.Fragment>
              )}
            </tr>
          </thead>
          <tbody>
            {stockInfoes.map((stockInfo, idx) => (
              <StockInfo
                key={idx}
                index={idx}
                typeValidation={typeValidation}
                stockInfo={stockInfo}
                errors={stockInfo.errors}
                typeList={typeList}
                handleInfoChange={handleInfoChange}
                handleDefectChange={handleDefectChange}
                handleShipCheck={handleShipCheck}
                handleReasonButton={handleReasonButton}
                disabled={isLoading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default StockInfoContainer;
