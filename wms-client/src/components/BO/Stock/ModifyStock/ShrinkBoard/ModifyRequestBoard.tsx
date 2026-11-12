import React, { Component } from 'react';
import { StockIdentifierType, ShrinkType } from '../../../../../enums/Enums';
import ModifyRequestContainer from './ModifyRequestContainer';
import { copy } from '../../../../../utilities/DeepCopy';
import {
    updateStockInfoesCopy,
    joinInfoesDefectArray,
    defectStringTransToOptions,
} from '../../Utilities/StockInfoHelperMethods';
import ToolbarForAddDeleteSubmit from '../../Utilities/ToolbarForAddDeleteSubmit';
import ShrinkConfirmModal from './ShrinkConfirmModal';

import equal from "fast-deep-equal";

import type { ValueType } from "react-select";
import type { DefectOption, StoredStockInfo } from "../../../../../types/domain";
import type { ShrinkFormRow } from "./ModifyRequestContainer";
import type { MutableStockRow } from "../../Utilities/StockInfoHelperMethods";
import type { LengthCalculation } from "./ShrinkConfirmModal";

interface ShrinkLength extends LengthCalculation {
  allocation?: number;
  shrinkType?: string;
}

interface ShrinkSubmit {
  oldStockIdentifierId: number;
  inStockRequests: ShrinkFormRow[];
  allocation?: number;
  adjustment: number;
  shrinkType?: string;
}

interface Props {
  isLoading: boolean;
  stockInfo: StoredStockInfo;
  typeExchange: boolean;
  sameTypeModify: boolean;
  hardwareModify: boolean;
  handleGoBack: () => void;
  handleModifyRequestSubmit: (request: ShrinkSubmit) => void;
  initialComponent: () => void;
}

interface State {
  modalShow: boolean;
  oldStockInfo: StoredStockInfo;
  newStockInfoes: ShrinkFormRow[];
  typeValidation: boolean;
  assignRowNum: number | string;
}


class ModifyRequestBoard extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            modalShow: false,
            oldStockInfo: this.props.stockInfo,
            newStockInfoes: [
                this.modifyRequestInitialContent(),
                this.modifyRequestInitialContent(),
            ],
            typeValidation:
                this.props.stockInfo.stockIdentifier.type ===
                StockIdentifierType.hardware,
            assignRowNum: 0,
        };
        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleNewDataClick = this.handleNewDataClick.bind(this);
        this.handleDeleteDataClick = this.handleDeleteDataClick.bind(this);
        this.handleRequestChange = this.handleRequestChange.bind(this);
        this.handleDefectChange = this.handleDefectChange.bind(this);
        this.handleSubmitClick = this.handleSubmitClick.bind(this);
        this.handleModalShow = this.handleModalShow.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleShipCheck = this.handleShipCheck.bind(this);
        this.handleReasonButton = this.handleReasonButton.bind(this);
        this.handleRowNumChange = this.handleRowNumChange.bind(this);
        this.handleRowNumSubmit = this.handleRowNumSubmit.bind(this);
    }

    handleBackClick() {
        this.props.handleGoBack();
    }

    modifyRequestInitialContent() {
        const { typeExchange, sameTypeModify, hardwareModify } = this.props;
        const initialContent: ShrinkFormRow = {
            type: "",
            productNo: this.props.stockInfo.stockIdentifier.productNo,
            lotNo: this.props.stockInfo.stockIdentifier.lotNo,
            quantity: '',
            unit: this.props.stockInfo.stockIdentifier.unit,
            color: this.props.stockInfo.color,
            defect: defectStringTransToOptions(this.props.stockInfo.defect),
            record: '',
            remark: '',
            inStockType: 'shrink',
            directShip: false,
            outStockReason: '',
            parentId: this.props.stockInfo.stockIdentifier.id, // for history use
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
    }

    infoLengthCalculation() {
        // 閉包函數 十進位近似值
        // cite from https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Math/round
        (function () {
            /**
             * Decimal adjustment of a number.
             *
             * @param {String}  type  The type of adjustment.
             * @param {Number}  value The number.
             * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
             * @returns {Number} The adjusted value.
             */
            function decimalAdjust(
                type: "round" | "floor" | "ceil",
                value: number,
                exp: number | undefined
            ): number {
                // If the exp is undefined or zero...
                if (typeof exp === 'undefined' || +exp === 0) {
                    return Math[type](value);
                }
                let numeric = +value;
                const exponent = +exp;
                // If the value is not a number or the exp is not an integer...
                if (
                    isNaN(numeric) ||
                    !(typeof exponent === 'number' && exponent % 1 === 0)
                ) {
                    return NaN;
                }
                // Shift
                const parts = numeric.toString().split('e');
                numeric = Math[type](
                    +(parts[0] + 'e' + (parts[1] ? +parts[1] - exponent : -exponent)),
                );
                // Shift back
                const shifted = numeric.toString().split('e');
                return +(shifted[0] + 'e' + (shifted[1] ? +shifted[1] + exponent : exponent));
            }

            // Decimal round
            if (!Math.round10) {
                Math.round10 = function (value: number, exp: number) {
                    return decimalAdjust('round', value, exp);
                };
            }
            // Decimal floor
            if (!Math.floor10) {
                Math.floor10 = function (value: number, exp: number) {
                    return decimalAdjust('floor', value, exp);
                };
            }
            // Decimal ceil
            if (!Math.ceil10) {
                Math.ceil10 = function (value: number, exp: number) {
                    return decimalAdjust('ceil', value, exp);
                };
            }
        })();

        const { oldStockInfo, newStockInfoes } = this.state;
        let oldTotalLength = parseFloat(oldStockInfo.stockIdentifier.quantity);
        let oldType = oldStockInfo.stockIdentifier.type;
        let typeDifference = false;
        let totalQuantity = 0;
        let allocation = 0;

        for (let i = 0; i < newStockInfoes.length; i += 1) {
            let childQuantity = parseFloat(newStockInfoes[i].quantity);
            totalQuantity += childQuantity;

            // allocation occurs when newType not equals to oldType
            if (!equal(oldType, newStockInfoes[i].type)) {
                allocation += childQuantity;
                typeDifference = true;
            }
        }

        let adjustment = totalQuantity - oldTotalLength;

        const result: {
            adjustment: number;
            totalQuantity: number;
            allocation?: number;
            shrinkType?: string;
        } = {
            adjustment: Math.round10(adjustment, -1),
            totalQuantity: totalQuantity,
        };

        if (typeDifference) {
            result['allocation'] = Math.round10(allocation, -1);

            if (oldType === StockIdentifierType.board) {
                result['shrinkType'] = ShrinkType.BtoR;
            }
            if (oldType === StockIdentifierType.roll) {
                result['shrinkType'] = ShrinkType.RtoB;
            }
        } else {
            result['allocation'] = 0;

            if (oldType === StockIdentifierType.board) {
                result['shrinkType'] = ShrinkType.BtoB;
            }
            if (oldType === StockIdentifierType.roll) {
                result['shrinkType'] = ShrinkType.RtoR;
            }
            if (oldType === StockIdentifierType.hardware) {
                result['shrinkType'] = ShrinkType.HtoH;
            }
        }

        return result;
    }

    handleModalClose() {
        this.setState({ modalShow: false });
    }

    handleModalShow() {
        this.setState({ modalShow: true });
    }

    handleNewDataClick() {
        const { newStockInfoes } = this.state;
        let newStockInfo: ShrinkFormRow;

        if (newStockInfoes.length === 0) {
            newStockInfo = this.modifyRequestInitialContent();
        } else {
			let idx = newStockInfoes.length - 1; // 複製最下面一筆
            newStockInfo = {
                productNo: this.props.stockInfo.stockIdentifier.productNo,
                lotNo: this.props.stockInfo.stockIdentifier.lotNo,
                type: newStockInfoes[idx].type,
                quantity: '',
                unit: newStockInfoes[idx].unit,
                color: newStockInfoes[idx].color,
                defect: newStockInfoes[idx].defect,
                record: this.props.stockInfo.record,
                remark: '',
                inStockType: 'shrink',
                directShip: false,
                outStockReason: '',
                parentId: this.props.stockInfo.stockIdentifier.id, // for history use
                errors: {
                    quantity: '',
                },
            };
        }

        this.setState({
            newStockInfoes: [...this.state.newStockInfoes, newStockInfo],
        });
    }

    handleDeleteDataClick() {
        let stockInfoesCopy = [...this.state.newStockInfoes];

        stockInfoesCopy.splice(stockInfoesCopy.length - 1, 1);

        this.setState({
            newStockInfoes: stockInfoesCopy,
        });
    }

    handleRequestChange(request: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, i: number) {
        const newStockInfoesCopy = copy(this.state.newStockInfoes) as ShrinkFormRow[];
        const { name, value } = request.target;

        updateStockInfoesCopy(newStockInfoesCopy as MutableStockRow[], name, value, i);

        this.setState({ newStockInfoes: newStockInfoesCopy });
    }

    handleDefectChange(selectedOptions: ValueType<DefectOption, true>, i: number) {
        const copyList = [...this.state.newStockInfoes];

        copyList[i].defect = selectedOptions;

        this.setState({
            newStockInfoes: copyList,
        });
    }

    handleSubmitClick(infoLengthCalculation: ShrinkLength) {
        const { oldStockInfo, newStockInfoes } = this.state;
        const stockInfoesCopy = copy(newStockInfoes) as ShrinkFormRow[];

        joinInfoesDefectArray(stockInfoesCopy as MutableStockRow[]);

        let shrinkStockRequest = {
            oldStockIdentifierId: oldStockInfo.stockIdentifier.id,
            inStockRequests: stockInfoesCopy,
            allocation: infoLengthCalculation.allocation,
            adjustment: infoLengthCalculation.adjustment,
            shrinkType: infoLengthCalculation.shrinkType,
        };

        this.props.handleModifyRequestSubmit(shrinkStockRequest);
        this.handleModalClose();
    }

    handleRowNumChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.name === "assignRowNum") {
            this.setState({ assignRowNum: e.target.value });
        }
    }

    handleRowNumSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const stockInfoesCopy = [...this.state.newStockInfoes];
        const { newStockInfoes } = this.state;
        let newStockInfo: ShrinkFormRow;

        if (newStockInfoes.length === 0) {
            newStockInfo = this.modifyRequestInitialContent();
        } else {
			let idx = newStockInfoes.length - 1; // 複製最下面一筆
            newStockInfo = {
                productNo: this.state.oldStockInfo.stockIdentifier.productNo,
                lotNo: this.state.oldStockInfo.stockIdentifier.lotNo,
                type: newStockInfoes[idx].type,
                quantity: '',
                unit: newStockInfoes[idx].unit,
                color: newStockInfoes[idx].color,
                defect: newStockInfoes[idx].defect,
                record: this.state.oldStockInfo.record,
                remark: '',
                inStockType: 'shrink',
                directShip: false,
                outStockReason: '',
                parentId: this.state.oldStockInfo.stockIdentifier.id, // for history use
                errors: {
                    quantity: '',
                },
            };
        }

        for (let i = 0; i < Number(this.state.assignRowNum); i += 1) {
            stockInfoesCopy.push(newStockInfo);
        }

        this.setState({ assignRowNum: 0, newStockInfoes: stockInfoesCopy });
    }

    handleShipCheck(checked: boolean, i: number) {
        const copyList = [...this.state.newStockInfoes];

        copyList[i].directShip = checked;

        if (!checked) {
            copyList[i].outStockReason = '';
        }

        this.setState({
            newStockInfoes: copyList,
        });
    }

    handleReasonButton(value: string, i: number) {
        const copyList = [...this.state.newStockInfoes];

        copyList[i].outStockReason = value;

        this.setState({
            newStockInfoes: copyList,
        });
    }

    checkLengthAlgorithm(stockInfoes: ShrinkFormRow[]): boolean {
        var isLengthChecked = false;

        for (let i = 0; i < stockInfoes.length; i += 1) {
            if (
                stockInfoes[i].errors?.quantity === '' &&
                Number(stockInfoes[i].quantity) > 0
            ) {
                isLengthChecked = true;
            } else {
                isLengthChecked = false;
                break;
            }
        }

        return isLengthChecked;
    }

    render() {
        const {
            modalShow,
            oldStockInfo,
            newStockInfoes,
            typeValidation,
            assignRowNum,
        } = this.state;
        let isLengthChecked = this.checkLengthAlgorithm(newStockInfoes);
        let infoLengthCalculation = modalShow
            ? this.infoLengthCalculation()
            : null;

        return (
            <div className="stock_info">
                <div className="container">
                    <button
                        type="button"
                        onClick={this.handleBackClick}
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
                                                    .productNo
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
                                                    .lotNo
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
                                                    .type
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
                                                    .quantity
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
                                                    .unit
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
                                            value={oldStockInfo.record}
                                            disabled
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <ToolbarForAddDeleteSubmit
                        onAddClick={this.handleNewDataClick}
                        onDeleteClick={this.handleDeleteDataClick}
                        onSubmitClick={this.handleModalShow}
                        handleRowNumChange={this.handleRowNumChange}
                        handleRowNumSubmit={this.handleRowNumSubmit}
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
                                onRequestChange={this.handleRequestChange}
                                handleDefectChange={this.handleDefectChange}
                                handleShipCheck={this.handleShipCheck}
                                handleReasonButton={this.handleReasonButton}
                            />
                            {modalShow && infoLengthCalculation ? (
                                <ShrinkConfirmModal
                                    show
                                    infoLengthCalculation={
                                        infoLengthCalculation
                                    }
                                    handleModalClose={this.handleModalClose}
                                    handleSubmitClick={this.handleSubmitClick}
                                />
                            ) : null}
                        </div>
                    )}
                    <hr />
                </div>
            </div>
        );
    }
}

export default ModifyRequestBoard;
