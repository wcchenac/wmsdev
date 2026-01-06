import React, { useState, useCallback, useMemo, ChangeEvent } from 'react';
import { StockIdentifierType, ShrinkType, DefectOption } from '../../../../../enums/Enums';
import ModifyRequestContainer from './ModifyRequestContainer';
import { copy } from '../../../../../utilities/DeepCopy';
import {
    updateStockInfoesCopy,
    joinInfoesDefectArray,
    defectStringTransToOptions,
} from '../../Utilities/StockInfoHelperMethods';
import ToolbarForAddDeleteSubmit from '../../Utilities/ToolbarForAddDeleteSubmit';
import ShrinkConfirmModal from './ShrinkConfirmModal';
import { StockInfo, ShrinkStockRequest } from '../../../../../types';

const equal = require('fast-deep-equal');

// Extend Math interface for round10
declare global {
    interface Math {
        round10(value: number, exp: number): number;
        floor10(value: number, exp: number): number;
        ceil10(value: number, exp: number): number;
    }
}

export interface NewStockInfoItem {
    productNo: string;
    lotNo: string;
    type?: string;
    quantity: string;
    unit: string;
    color: string;
    defect: (DefectOption | undefined)[];
    record: string;
    remark: string;
    inStockType: string;
    directShip: boolean;
    outStockReason: string;
    parentId: number;
    errors: {
        quantity: string;
    };
}

export interface InfoLengthCalculation {
    adjustment: number;
    totalQuantity: number;
    allocation: number;
    shrinkType: string;
}

interface ModifyRequestBoardProps {
    stockInfo: StockInfo;
    typeExchange: boolean;
    sameTypeModify: boolean;
    hardwareModify: boolean;
    handleGoBack: () => void;
    handleModifyRequestSubmit: (request: ShrinkStockRequest) => void;
}

const ModifyRequestBoard: React.FC<ModifyRequestBoardProps> = ({
    stockInfo,
    typeExchange,
    sameTypeModify,
    hardwareModify,
    handleGoBack,
    handleModifyRequestSubmit,
}) => {
    const createInitialContent = useCallback((): NewStockInfoItem => {
        const initialContent: NewStockInfoItem = {
            productNo: stockInfo.stockIdentifier?.productNo || '',
            lotNo: stockInfo.stockIdentifier?.lotNo || '',
            quantity: '',
            unit: stockInfo.stockIdentifier?.unit || '',
            color: stockInfo.color || '',
            defect: defectStringTransToOptions(stockInfo.defect as string),
            record: '',
            remark: '',
            inStockType: 'shrink',
            directShip: false,
            outStockReason: '',
            parentId: stockInfo.stockIdentifier?.id || 0,
            errors: {
                quantity: '',
            },
        };
        if (typeExchange) {
            initialContent.type = StockIdentifierType.board;
        }
        if (sameTypeModify) {
            initialContent.type = StockIdentifierType.roll;
        }
        if (hardwareModify) {
            initialContent.type = StockIdentifierType.hardware;
        }

        return initialContent;
    }, [stockInfo, typeExchange, sameTypeModify, hardwareModify]);

    const [modalShow, setModalShow] = useState<boolean>(false);
    const [oldStockInfo] = useState<StockInfo>(stockInfo);
    const [newStockInfoes, setNewStockInfoes] = useState<NewStockInfoItem[]>(() => [
        createInitialContent(),
        createInitialContent(),
    ]);
    const [assignRowNum, setAssignRowNum] = useState<number | string>(0);

    const typeValidation = useMemo(() =>
        stockInfo.stockIdentifier?.type === StockIdentifierType.hardware,
    [stockInfo.stockIdentifier?.type]);

    const infoLengthCalculation = useCallback((): InfoLengthCalculation => {
        // Decimal adjustment closure
        (function () {
            function decimalAdjust(type: 'round' | 'floor' | 'ceil', value: number, exp: number): number {
                if (typeof exp === 'undefined' || +exp === 0) {
                    return Math[type](value);
                }
                let valueNum = +value;
                const expNum = +exp;
                if (
                    isNaN(valueNum) ||
                    !(typeof expNum === 'number' && expNum % 1 === 0)
                ) {
                    return NaN;
                }
                const valueArr = valueNum.toString().split('e');
                const shifted = Math[type](
                    +(valueArr[0] + 'e' + (valueArr[1] ? +valueArr[1] - expNum : -expNum)),
                );
                const shiftedArr = shifted.toString().split('e');
                return +(shiftedArr[0] + 'e' + (shiftedArr[1] ? +shiftedArr[1] + expNum : expNum));
            }

            if (!Math.round10) {
                Math.round10 = function (value: number, exp: number): number {
                    return decimalAdjust('round', value, exp);
                };
            }
            if (!Math.floor10) {
                Math.floor10 = function (value: number, exp: number): number {
                    return decimalAdjust('floor', value, exp);
                };
            }
            if (!Math.ceil10) {
                Math.ceil10 = function (value: number, exp: number): number {
                    return decimalAdjust('ceil', value, exp);
                };
            }
        })();

        const oldTotalLength = parseFloat(String(oldStockInfo.stockIdentifier?.quantity || 0));
        const oldType = oldStockInfo.stockIdentifier?.type;
        let typeDifference = false;
        let totalQuantity = 0;
        let allocation = 0;

        for (let i = 0; i < newStockInfoes.length; i += 1) {
            const childQuantity = parseFloat(newStockInfoes[i].quantity);
            totalQuantity += childQuantity;

            if (!equal(oldType, newStockInfoes[i].type)) {
                allocation += childQuantity;
                typeDifference = true;
            }
        }

        const adjustment = totalQuantity - oldTotalLength;

        const result: InfoLengthCalculation = {
            adjustment: Math.round10(adjustment, -1),
            totalQuantity: totalQuantity,
            allocation: 0,
            shrinkType: '',
        };

        if (typeDifference) {
            result.allocation = Math.round10(allocation, -1);

            if (oldType === StockIdentifierType.board) {
                result.shrinkType = ShrinkType.BtoR;
            }
            if (oldType === StockIdentifierType.roll) {
                result.shrinkType = ShrinkType.RtoB;
            }
        } else {
            result.allocation = 0;

            if (oldType === StockIdentifierType.board) {
                result.shrinkType = ShrinkType.BtoB;
            }
            if (oldType === StockIdentifierType.roll) {
                result.shrinkType = ShrinkType.RtoR;
            }
            if (oldType === StockIdentifierType.hardware) {
                result.shrinkType = ShrinkType.HtoH;
            }
        }

        return result;
    }, [oldStockInfo, newStockInfoes]);

    const checkLengthAlgorithm = useCallback((stockInfoes: NewStockInfoItem[]): boolean => {
        let isLengthChecked = false;

        for (let i = 0; i < stockInfoes.length; i += 1) {
            if (
                stockInfoes[i].errors.quantity === '' &&
                parseFloat(stockInfoes[i].quantity) > 0
            ) {
                isLengthChecked = true;
            } else {
                isLengthChecked = false;
                break;
            }
        }

        return isLengthChecked;
    }, []);

    const handleBackClick = useCallback((): void => {
        handleGoBack();
    }, [handleGoBack]);

    const handleModalClose = useCallback((): void => {
        setModalShow(false);
    }, []);

    const handleModalShow = useCallback((): void => {
        setModalShow(true);
    }, []);

    const handleNewDataClick = useCallback((): void => {
        let newStockInfo: NewStockInfoItem;

        if (newStockInfoes.length === 0) {
            newStockInfo = createInitialContent();
        } else {
            const idx = newStockInfoes.length - 1;
            newStockInfo = {
                productNo: stockInfo.stockIdentifier?.productNo || '',
                lotNo: stockInfo.stockIdentifier?.lotNo || '',
                type: newStockInfoes[idx].type,
                quantity: '',
                unit: newStockInfoes[idx].unit,
                color: newStockInfoes[idx].color,
                defect: newStockInfoes[idx].defect,
                record: stockInfo.record || '',
                remark: '',
                inStockType: 'shrink',
                directShip: false,
                outStockReason: '',
                parentId: stockInfo.stockIdentifier?.id || 0,
                errors: {
                    quantity: '',
                },
            };
        }

        setNewStockInfoes(prev => [...prev, newStockInfo]);
    }, [newStockInfoes, stockInfo, createInitialContent]);

    const handleDeleteDataClick = useCallback((): void => {
        setNewStockInfoes(prev => {
            const stockInfoesCopy = [...prev];
            stockInfoesCopy.splice(stockInfoesCopy.length - 1, 1);
            return stockInfoesCopy;
        });
    }, []);

    const handleRequestChange = useCallback((request: { target: { name: string; value: string } }, i: number): void => {
        setNewStockInfoes(prev => {
            const newStockInfoesCopy = copy(prev) as NewStockInfoItem[];
            const { name, value } = request.target;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updateStockInfoesCopy(newStockInfoesCopy as any, name as any, value, i);
            return newStockInfoesCopy;
        });
    }, []);

    const handleDefectChange = useCallback((selectedOptions: (DefectOption | undefined)[], i: number): void => {
        setNewStockInfoes(prev => {
            const copyList = [...prev];
            copyList[i].defect = selectedOptions;
            return copyList;
        });
    }, []);

    const handleSubmitClick = useCallback((infoLengthCalc: InfoLengthCalculation): void => {
        const stockInfoesCopy = copy(newStockInfoes) as NewStockInfoItem[];

        // Cast to any to allow the helper method to modify defect field from array to string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        joinInfoesDefectArray(stockInfoesCopy as any);

        const shrinkStockRequest: ShrinkStockRequest = {
            oldStockIdentifierId: oldStockInfo.stockIdentifier?.id || 0,
            inStockRequests: stockInfoesCopy,
            allocation: infoLengthCalc.allocation,
            adjustment: infoLengthCalc.adjustment,
            shrinkType: infoLengthCalc.shrinkType,
        };

        handleModifyRequestSubmit(shrinkStockRequest);
        handleModalClose();
    }, [newStockInfoes, oldStockInfo, handleModifyRequestSubmit, handleModalClose]);

    const handleRowNumChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
        setAssignRowNum(e.target.value);
    }, []);

    const handleRowNumSubmit = useCallback((e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        setNewStockInfoes(prev => {
            const stockInfoesCopy = [...prev];
            let newStockInfo: NewStockInfoItem;

            if (prev.length === 0) {
                newStockInfo = createInitialContent();
            } else {
                const idx = prev.length - 1;
                newStockInfo = {
                    productNo: oldStockInfo.stockIdentifier?.productNo || '',
                    lotNo: oldStockInfo.stockIdentifier?.lotNo || '',
                    type: prev[idx].type,
                    quantity: '',
                    unit: prev[idx].unit,
                    color: prev[idx].color,
                    defect: prev[idx].defect,
                    record: oldStockInfo.record || '',
                    remark: '',
                    inStockType: 'shrink',
                    directShip: false,
                    outStockReason: '',
                    parentId: oldStockInfo.stockIdentifier?.id || 0,
                    errors: {
                        quantity: '',
                    },
                };
            }

            const numRows = typeof assignRowNum === 'string' ? parseInt(assignRowNum, 10) : assignRowNum;
            for (let i = 0; i < numRows; i += 1) {
                stockInfoesCopy.push({ ...newStockInfo });
            }

            return stockInfoesCopy;
        });

        setAssignRowNum(0);
    }, [assignRowNum, oldStockInfo, createInitialContent]);

    const handleShipCheck = useCallback((checked: boolean, i: number): void => {
        setNewStockInfoes(prev => {
            const copyList = [...prev];
            copyList[i].directShip = checked;

            if (!checked) {
                copyList[i].outStockReason = '';
            }

            return copyList;
        });
    }, []);

    const handleReasonButton = useCallback((value: string, i: number): void => {
        setNewStockInfoes(prev => {
            const copyList = [...prev];
            copyList[i].outStockReason = value;
            return copyList;
        });
    }, []);

    const isLengthChecked = checkLengthAlgorithm(newStockInfoes);
    const calculatedInfoLength = modalShow ? infoLengthCalculation() : null;

    return (
        <div className="stock_info">
            <div className="container">
                <button
                    type="button"
                    onClick={handleBackClick}
                    className="btn btn-secondary"
                >
                    返回
                </button>
                <p className="h3 text-center">異動前狀態</p>
                <hr />
                <table className="table">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">貨號</th>
                            <th scope="col">批號</th>
                            <th scope="col">型態</th>
                            <th scope="col">數量</th>
                            <th scope="col">單位</th>
                            <th scope="col">記錄</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="productNo"
                                        value={
                                            oldStockInfo.stockIdentifier
                                                ?.productNo || ''
                                        }
                                        disabled
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="lotNo"
                                        value={
                                            oldStockInfo.stockIdentifier
                                                ?.lotNo || ''
                                        }
                                        disabled
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="type"
                                        value={
                                            oldStockInfo.stockIdentifier
                                                ?.type || ''
                                        }
                                        disabled
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="quantity"
                                        value={
                                            oldStockInfo.stockIdentifier
                                                ?.quantity || ''
                                        }
                                        disabled
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="unit"
                                        value={
                                            oldStockInfo.stockIdentifier
                                                ?.unit || ''
                                        }
                                        disabled
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="record"
                                        value={oldStockInfo.record || ''}
                                        disabled
                                    />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <ToolbarForAddDeleteSubmit
                    onAddClick={handleNewDataClick}
                    onDeleteClick={handleDeleteDataClick}
                    onSubmitClick={handleModalShow}
                    handleRowNumChange={handleRowNumChange}
                    handleRowNumSubmit={handleRowNumSubmit}
                    deleteDisabled={newStockInfoes.length === 0}
                    submitDisabled={!isLengthChecked}
                    assignRowNum={assignRowNum}
                />
                {newStockInfoes.length === 0 ? (
                    <div
                        className="alert alert-warning text-center"
                        role="alert"
                    >
                        請新增資料
                    </div>
                ) : (
                    <div>
                        <ModifyRequestContainer
                            typeValidation={typeValidation}
                            newStockInfoes={newStockInfoes}
                            onRequestChange={handleRequestChange}
                            handleDefectChange={handleDefectChange}
                            handleShipCheck={handleShipCheck}
                            handleReasonButton={handleReasonButton}
                        />
                        {modalShow && calculatedInfoLength ? (
                            <ShrinkConfirmModal
                                show
                                infoLengthCalculation={calculatedInfoLength}
                                handleModalClose={handleModalClose}
                                handleSubmitClick={handleSubmitClick}
                            />
                        ) : null}
                    </div>
                )}
                <hr />
            </div>
        </div>
    );
};

export default ModifyRequestBoard;
