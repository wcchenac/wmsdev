import React, { useState, useCallback, useMemo, useRef, ChangeEvent, MouseEvent } from 'react';
import classnames from 'classnames';
import Select, { MultiValue } from 'react-select';
import makeAnimated from 'react-select/animated';
import {
    UnitOptions,
    DefectOptions,
    StockIdentifierType,
    DefectOption,
} from '../../../../../enums/Enums';
import ShipModal from '../../Utilities/ShipModal';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import { NewStockInfoItem } from './ModifyRequestBoard';

interface ModifyRequestProps {
    typeValidation: boolean;
    stockInfo: NewStockInfoItem;
    index: number;
    disabled?: boolean;
    onRequestChange: (request: { target: { name: string; value: string } }, index: number) => void;
    handleDefectChange: (selectedOptions: (DefectOption | undefined)[], index: number) => void;
    handleShipCheck: (checked: boolean, index: number) => void;
    handleReasonButton: (value: string, index: number) => void;
}

const ModifyRequest: React.FC<ModifyRequestProps> = ({
    typeValidation,
    stockInfo,
    index,
    disabled = false,
    onRequestChange,
    handleDefectChange,
    handleShipCheck,
    handleReasonButton,
}) => {
    const [modalShow, setModalShow] = useState<boolean>(false);
    const reasonAtOpen = useRef(stockInfo.outStockReason);
    const skipRestore = useRef(false);

    const animatedComponents = useMemo(() => makeAnimated(), []);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            onRequestChange({ target: { name: e.target.name, value: e.target.value } }, index);
        },
        [onRequestChange, index],
    );

    const onDefectChange = useCallback(
        (selectedOptions: MultiValue<DefectOption | undefined>) => {
            handleDefectChange([...selectedOptions], index);
        },
        [handleDefectChange, index],
    );

    const onShipCheck = useCallback(() => {
        skipRestore.current = true;
        setModalShow(false);
        handleShipCheck(stockInfo.outStockReason !== '', index);
    }, [handleShipCheck, stockInfo.outStockReason, index]);

    const onCancleShipClick = useCallback(() => {
        if (disabled) return;
        skipRestore.current = true;
        setModalShow(false);
        handleShipCheck(false, index);
    }, [handleShipCheck, index, disabled]);

    const onReansonButtonChange = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            handleReasonButton((e.target as HTMLButtonElement).value, index);
        },
        [handleReasonButton, index],
    );

    const handleModalOpen = useCallback(() => {
        if (disabled) return;
        skipRestore.current = false;
        reasonAtOpen.current = stockInfo.outStockReason;
        setModalShow(true);
    }, [disabled, stockInfo.outStockReason]);

    const handleModalClose = useCallback(() => {
        const restore = !skipRestore.current;
        const previous = reasonAtOpen.current;
        skipRestore.current = false;
        setModalShow(false);
        // Backdrop and the close X dismiss without confirming: put the reason back and
        // leave directShip unchanged. Confirm and 取消 set skipRestore.
        if (restore && stockInfo.outStockReason !== previous) {
            handleReasonButton(previous, index);
        }
    }, [handleReasonButton, index, stockInfo.outStockReason]);

    return (
        <tr>
            <td>
                {typeValidation ? (
                    <div className="mb-0">
                        <input
                            type="text"
                            className="form-control"
                            name="type"
                            value={stockInfo.type || ''}
                            disabled
                        />
                    </div>
                ) : (
                    <div className="mb-0">
                        <select
                            className="form-select"
                            name="type"
                            value={stockInfo.type || ''}
                            onChange={handleChange}
                            disabled={disabled}
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
                <div className="mb-0">
                    <input
                        type="text"
                        className={classnames('form-control', {
                            'is-invalid': stockInfo.errors.quantity,
                        })}
                        placeholder="數量"
                        name="quantity"
                        value={stockInfo.quantity}
                        onChange={handleChange}
                        disabled={disabled}
                    />
                    {stockInfo.errors.quantity && (
                        <div className="invalid-feedback">
                            {stockInfo.errors.quantity}
                        </div>
                    )}
                </div>
            </td>
            {typeValidation ? (
                <React.Fragment>
                    <td>
                        <div className="mb-0">
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
                        <div className="mb-0">
                            <select
                                className="form-select"
                                name="unit"
                                value={stockInfo.unit}
                                onChange={handleChange}
                                disabled={disabled}
                            >
                                {UnitOptions.map((unit, idx) => (
                                    <option key={idx} value={unit}>
                                        {unit}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </td>
                    <td>
                        <Select
                            className="stock-defect-select"
                            closeMenuOnSelect
                            components={animatedComponents}
                            value={stockInfo.defect}
                            isMulti
                            menuPosition="fixed"
                            name="defect"
                            options={[...DefectOptions]}
                            onChange={onDefectChange}
                            isDisabled={disabled}
                        />
                    </td>
                </React.Fragment>
            )}
            <td>
                <div className="mb-0">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="註解"
                        name="remark"
                        value={stockInfo.remark}
                        onChange={handleChange}
                        disabled={disabled}
                    />
                </div>
            </td>
            <td>
                <div className="mb-3 mt-1 ms-1">
                    {stockInfo.directShip ? (
                        <OverlayTrigger
                            key={index}
                            placement="bottom"
                            overlay={
                                <Tooltip id={`tooltip-${index}`}>
                                    {stockInfo.outStockReason}
                                </Tooltip>
                            }
                        >
                            <CheckBoxRoundedIcon
                                onClick={onCancleShipClick}
                            />
                        </OverlayTrigger>
                    ) : (
                        <CheckBoxOutlineBlankRoundedIcon
                            onClick={handleModalOpen}
                        />
                    )}
                </div>
                {modalShow ? (
                    <ShipModal
                        outStockReason={stockInfo.outStockReason}
                        onChange={handleChange}
                        onReansonButtonChange={onReansonButtonChange}
                        onShipClick={onShipCheck}
                        onCancleShipClick={onCancleShipClick}
                        handleModalClose={handleModalClose}
                        show
                    />
                ) : null}
            </td>
        </tr>
    );
};

export default ModifyRequest;
