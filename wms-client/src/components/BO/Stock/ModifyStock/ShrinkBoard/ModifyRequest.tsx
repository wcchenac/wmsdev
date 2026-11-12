import React, { Component } from 'react';
import classnames from 'classnames';
import Select from 'react-select';
import { animatedSelectComponents } from '../../../../../types/select';
import {
    UnitOptions,
    DefectOptions,
    StockIdentifierType,
} from '../../../../../enums/Enums';
import ShipModal from '../../Utilities/ShipModal';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import CheckBoxRoundedIcon from '@material-ui/icons/CheckBoxRounded';
import CheckBoxOutlineBlankRoundedIcon from '@material-ui/icons/CheckBoxOutlineBlankRounded';

import type { ValueType } from "react-select";
import type { DefectOption } from "../../../../../types/domain";
import type { ShrinkFormRow } from "./ModifyRequestContainer";

interface Props {
  index: number;
  typeValidation: boolean;
  stockInfo: ShrinkFormRow;
  onRequestChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => void;
  handleDefectChange: (selected: ValueType<DefectOption, true>, index: number) => void;
  handleShipCheck: (checked: boolean, index: number) => void;
  handleReasonButton: (value: string, index: number) => void;
}

interface State {
  modalShow: boolean;
}


class ModifyRequest extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            modalShow: false,
        };
        this.handleChange = this.handleChange.bind(this);
        this.onDefectChange = this.onDefectChange.bind(this);
        this.onShipCheck = this.onShipCheck.bind(this);
        this.onCancleShipClick = this.onCancleShipClick.bind(this);
        this.onReansonButtonChange = this.onReansonButtonChange.bind(this);
        this.handleModalOpen = this.handleModalOpen.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
    }

    handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        this.props.onRequestChange(e, this.props.index);
    }

    onDefectChange(selectedOptions: ValueType<DefectOption, true>) {
        this.props.handleDefectChange(selectedOptions, this.props.index);
    }

    onShipCheck() {
        this.setState({ modalShow: false }, () => {
            this.props.handleShipCheck(
                this.props.stockInfo.outStockReason !== '',
                this.props.index,
            );
        });
    }

    onCancleShipClick() {
        this.setState({ modalShow: false }, () => {
            this.props.handleShipCheck(false, this.props.index);
        });
    }

    onReansonButtonChange(e: React.MouseEvent<HTMLButtonElement>) {
        this.props.handleReasonButton((e.target as HTMLButtonElement).value, this.props.index);
    }

    handleModalOpen() {
        this.setState({ modalShow: true });
    }

    handleModalClose() {
        this.setState({ modalShow: false });
    }

    render() {
        const { typeValidation, stockInfo } = this.props;
        const animatedComponents = animatedSelectComponents<DefectOption, true>();

        return (
            <tr>
                <td>
                    {typeValidation ? (
                        <div className="form-group mb-0">
                            <input
                                type="text"
                                className="form-control"
                                name="type"
                                value={stockInfo.type}
                                disabled
                            />
                        </div>
                    ) : (
                        <div className="form-group mb-0">
                            <select
                                className="custom-select"
                                name="type"
                                defaultValue={stockInfo.type}
                                onChange={this.handleChange}
                            >
                                <option value={StockIdentifierType.roll}>
                                    整支
                                </option>
                                <option value={StockIdentifierType.board}>
                                    板卷
                                </option>
                            </select>
                        </div>
                    )}
                </td>
                <td>
                    <div className="form-group mb-0">
                        <input
                            type="text"
                            className={classnames('form-control', {
                                'is-invalid': stockInfo.errors!.quantity,
                            })}
                            placeholder="數量"
                            name="quantity"
                            onChange={this.handleChange}
                        />
                        {stockInfo.errors!.quantity && (
                            <div className="invalid-feedback">
                                {stockInfo.errors!.quantity}
                            </div>
                        )}
                    </div>
                </td>
                {typeValidation ? (
                    <React.Fragment>
                        <td>
                            <div className="form-group mb-0">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="unit"
                                    value={stockInfo.unit}
                                    disabled
                                />
                            </div>
                        </td>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <td>
                            <div className="form-group mb-0">
                                <select
                                    className="custom-select"
                                    name="unit"
                                    defaultValue={stockInfo.unit}
                                    onChange={this.handleChange}
                                >
                                    {UnitOptions.map((unit, index) => (
                                        <option key={index} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </td>
                        <td>
                            <Select
                                closeMenuOnSelect
                                components={animatedComponents}
                                defaultValue={
                                    (Array.isArray(stockInfo.defect)
                                        ? stockInfo.defect
                                        : []) as DefectOption[]
                                }
                                isMulti
                                name="defect"
                                options={DefectOptions}
                                onChange={this.onDefectChange}
                            />
                        </td>
                    </React.Fragment>
                )}
                <td>
                    <div className="form-group mb-0">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="註解"
                            name="remark"
                            onChange={this.handleChange}
                        />
                    </div>
                </td>
                <td>
                    <div className="form-group mt-1 ml-1">
                        {stockInfo.outStockReason !== '' ? (
                            <OverlayTrigger
                                key={this.props.index}
                                placement="bottom"
                                overlay={
                                    <Tooltip id={`tooltip-${this.props.index}`}>
                                        {stockInfo.outStockReason}
                                    </Tooltip>
                                }
                            >
                                <CheckBoxRoundedIcon
                                    onClick={this.onCancleShipClick}
                                />
                            </OverlayTrigger>
                        ) : (
                            <CheckBoxOutlineBlankRoundedIcon
                                onClick={this.handleModalOpen}
                            />
                        )}
                    </div>
                    {this.state.modalShow ? (
                        <ShipModal
                            outStockReason={stockInfo.outStockReason}
                            onChange={this.handleChange}
                            onReansonButtonChange={this.onReansonButtonChange}
                            onShipClick={this.onShipCheck}
                            onCancleShipClick={this.onCancleShipClick}
                            handleModalClose={this.handleModalClose}
                            show
                        />
                    ) : null}
                </td>
            </tr>
        );
    }
}

export default ModifyRequest;
