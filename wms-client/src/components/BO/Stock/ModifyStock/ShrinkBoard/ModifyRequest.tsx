import React, { useState, useCallback, useMemo, ChangeEvent, MouseEvent } from 'react';
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
    onRequestChange: (request: { target: { name: string; value: string } }, index: number) => void;
    handleDefectChange: (selectedOptions: (DefectOption | undefined)[], index: number) => void;
    handleShipCheck: (checked: boolean, index: number) => void;
    handleReasonButton: (value: string, index: number) => void;
}

const ModifyRequest: React.FC<ModifyRequestProps> = ({
    typeValidation,
    stockInfo,
    index,
    onRequestChange,
    handleDefectChange,
    handleShipCheck,
    handleReasonButton,
}) => {
    const [modalShow, setModalShow] = useState<boolean>(false);

    const animatedComponents = useMemo(() => makeAnimated(), []);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            onRequestChange({ target: { name: e.target.name, value: e.target.value } }, index);
        },
        [onRequestChange, index],
    );

    const onDefectChange = useCallback(
        (selectedOptions: MultiValue<DefectOption>) => {
            handleDefectChange(selectedOptions as (DefectOption | undefined)[], index);
        },
        [handleDefectChange, index],
    );

    const onShipCheck = useCallback(() => {
        setModalShow(false);
        handleShipCheck(stockInfo.outStockReason !== '', index);
    }, [handleShipCheck, stockInfo.outStockReason, index]);

    const onCancleShipClick = useCallback(() => {
        setModalShow(false);
        handleShipCheck(false, index);
    }, [handleShipCheck, index]);

    const onReansonButtonChange = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            handleReasonButton((e.target as HTMLButtonElement).value, index);
        },
        [handleReasonButton, index],
    );

    const handleModalOpen = useCallback(() => {
        setModalShow(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setModalShow(false);
    }, []);

    return (
        <tr>
            <td>
                {typeValidation ? (
                    <div className="form-group mb-0">
                        <input
                            type="text"
                            className="form-control"
                            name="type"
                            value={stockInfo.type || ''}
                            disabled
                        />
                    </div>
                ) : (
                    <div className="form-group mb-0">
                        <select
                            className="custom-select"
                            name="type"
                            defaultValue={stockInfo.type}
                            onChange={handleChange}
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
                            'is-invalid': stockInfo.errors.quantity,
                        })}
                        placeholder="數量"
                        name="quantity"
                        onChange={handleChange}
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
                                onChange={handleChange}
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
                            closeMenuOnSelect
                            components={animatedComponents}
                            defaultValue={stockInfo.defect}
                            isMulti
                            name="defect"
                            options={[...DefectOptions]}
                            onChange={onDefectChange}
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
                        onChange={handleChange}
                    />
                </div>
            </td>
            <td>
                <div className="form-group mt-1 ml-1">
                    {stockInfo.outStockReason !== '' ? (
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
