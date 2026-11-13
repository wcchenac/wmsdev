import React, { useState, useCallback, ChangeEvent, FormEvent, MouseEvent } from "react";
import StockInfo from "./StockInfo";
import { copy } from "../../../../../utilities/DeepCopy";
import {
  quantityAccumulate,
  updateStockInfoesCopy,
} from "../../Utilities/StockInfoHelperMethods";
import ToolbarForAddDeleteSubmit from "../../Utilities/ToolbarForAddDeleteSubmit";
import LoadingOverlay from "react-loading-overlay-ts";
import { Spinner } from "../../../../Others/Spinner";
import { DefectOptions, DefectOption } from "../../../../../enums/Enums";
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
    inStockRequests: StockInfoData[]
  ) => void;
}

interface QuantitySum {
  [key: string]: number;
}

function initialInfoContent(props: StockInfoContainerProps): StockInfoData {
  const { typeValidation, waitHandleStatus, productNo, type, orderNo } = props;
  const typeKey = Object.keys(waitHandleStatus).pop() as string;
  const newStockInfo: StockInfoData = {
    productNo: productNo,
    lotNo: "",
    type: typeKey.toString(),
    quantity: "",
    unit: waitHandleStatus[typeKey].unit,
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

  const quantityValid: Record<string, boolean> = { "雜項": false, "整支": false, "板卷": false };

  // check input total quantity is same as waitHandleStatus
  typeList.forEach((type) => {
    if (
      parseFloat(waitHandleStatus[type].quantity as string) ===
      parseFloat(quantitySum[type] as unknown as string)
    ) {
      quantityValid[type] = true;
    } else {
      quantityValid[type] = false;
    }
  });

  // every type in waitHandleStatus must to meet the equation
  // "quantitySum[type] equal to waitHandleStatus[type].quantity"
  // otherwise, return false
  if (typeList.length === 1) {
    return quantityValid[typeList[0]];
  } else if (typeList.length === 2) {
    return quantityValid["板卷"] && quantityValid["整支"];
  } else {
    return false;
  }
}

// Helper function to join defect array for submission
function joinInfoesDefectArray(stockInfoesCopy: StockInfoData[]): void {
  stockInfoesCopy.forEach((stockInfo, index) => {
    if (Array.isArray(stockInfo.defect)) {
      const defectArray = stockInfo.defect as DefectOption[];
      let newDefectContent = "";
      defectArray.forEach((object, idx) => {
        if (object === undefined) {
          return;
        }
        if (idx === defectArray.length - 1) {
          newDefectContent = newDefectContent + object.value;
        } else {
          newDefectContent = newDefectContent + object.value + "/";
        }
      });
      (stockInfoesCopy[index].defect as string) = newDefectContent;
    }
  });
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
      updateStockInfoesCopy(stockInfoesCopy as unknown as Parameters<typeof updateStockInfoesCopy>[0], name as Parameters<typeof updateStockInfoesCopy>[1], value, i);
      return stockInfoesCopy;
    });
  }, []);

  const handleDefectChange = useCallback((selectedOptions: MultiValue<DefectOption>, i: number) => {
    setStockInfoes((prevStockInfoes) => {
      const copyList = [...prevStockInfoes];
      copyList[i].defect = selectedOptions as DefectOption[];
      return copyList;
    });
  }, []);

  const handleShipCheck = useCallback((checked: boolean, i: number) => {
    setStockInfoes((prevStockInfoes) => {
      const copyList = [...prevStockInfoes];
      copyList[i].directShip = checked;

      if (!checked) {
        copyList[i].outStockReason = "";
      }

      return copyList;
    });
  }, []);

  const handleReasonButton = useCallback((value: string, i: number) => {
    setStockInfoes((prevStockInfoes) => {
      const copyList = [...prevStockInfoes];
      copyList[i].outStockReason = value;
      return copyList;
    });
  }, []);

  const handleRowNumChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setAssignRowNum(e.target.value);
  }, []);

  const handleRowNumSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      for (let i = 0; i < Number(assignRowNum); i += 1) {
        stockInfoesCopy.push(newStockInfo);
      }

      return stockInfoesCopy;
    });

    setAssignRowNum(0);
  }, [productNo, type, orderNo, assignRowNum, props]);

  const handleSubmitClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const stockInfoesCopy = copy(stockInfoes);

    if (!typeValidation) {
      joinInfoesDefectArray(stockInfoesCopy);
    }

    handleInStockRequestSubmit(e, index, stockInfoesCopy);
  }, [stockInfoes, typeValidation, handleInStockRequestSubmit, index]);

  const typeList = Object.keys(waitHandleStatus);
  const quantitySum = quantityAccumulate(stockInfoes as unknown as Parameters<typeof quantityAccumulate>[0]);
  const isFormValid = checkFormAlgorithm(
    stockInfoes,
    typeList,
    quantitySum as unknown as QuantitySum,
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
          <thead className="thead-dark">
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
                  <div className="form-group mb-0">
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
                  <div className="form-group mb-0">
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
                  <div className="form-group mb-0">
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
                  <div className="form-group mb-0">
                    <input
                      type="text"
                      className="form-control"
                      name="quantity_handled"
                      value={(quantitySum as unknown as Record<string, number>)[typeKey]?.toString() || "0"}
                      readOnly
                    />
                  </div>
                </td>
                <td>
                  <div className="form-group mb-0">
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
      <table className="table table-sm">
        <thead className="thead-dark">
          <tr>
            {typeValidation ? (
              <React.Fragment>
                <th style={{ width: "20%" }}>貨號</th>
                <th style={{ width: "14%" }}>批號</th>
                <th style={{ width: "14%" }}>型態</th>
                <th style={{ width: "14%" }}>數量</th>
                <th style={{ width: "14%" }}>單位</th>
                <th style={{ width: "20%" }}>記錄</th>
                <th style={{ width: "4%" }}>直出</th>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <th style={{ width: "20%" }}>貨號</th>
                <th style={{ width: "8%" }}>批號</th>
                <th style={{ width: "8%" }}>型態</th>
                <th style={{ width: "12%" }}>數量</th>
                <th style={{ width: "8%" }}>單位</th>
                <th style={{ width: "8%" }}>色號</th>
                <th style={{ width: "16%" }}>瑕疵</th>
                <th style={{ width: "16%" }}>記錄</th>
                <th style={{ width: "4%" }}>直出</th>
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
  );
});

export default StockInfoContainer;
