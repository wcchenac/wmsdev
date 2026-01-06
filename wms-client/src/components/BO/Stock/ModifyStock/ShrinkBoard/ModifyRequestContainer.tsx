import React from 'react';
import ModifyRequest from './ModifyRequest';
import { DefectOption } from '../../../../../enums/Enums';
import { NewStockInfoItem } from './ModifyRequestBoard';

interface ModifyRequestContainerProps {
    typeValidation: boolean;
    newStockInfoes: NewStockInfoItem[];
    onRequestChange: (request: { target: { name: string; value: string } }, index: number) => void;
    handleDefectChange: (selectedOptions: (DefectOption | undefined)[], index: number) => void;
    handleShipCheck: (checked: boolean, index: number) => void;
    handleReasonButton: (value: string, index: number) => void;
}

const ModifyRequestContainer: React.FC<ModifyRequestContainerProps> = ({
    typeValidation,
    newStockInfoes,
    onRequestChange,
    handleDefectChange,
    handleShipCheck,
    handleReasonButton,
}) => {
    return (
        <div>
            <table className="table">
                <thead className="thead-dark">
                    <tr>
                        {typeValidation ? (
                            <React.Fragment>
                                <th style={{ width: '24%' }}>型態</th>
                                <th style={{ width: '23%' }}>數量</th>
                                <th style={{ width: '23%' }}>單位</th>
                                <th style={{ width: '24%' }}>註解</th>
                                <th style={{ width: '6%' }}>直出</th>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <th style={{ width: '20%' }}>型態</th>
                                <th style={{ width: '14%' }}>數量</th>
                                <th style={{ width: '14%' }}>單位</th>
                                <th style={{ width: '23%' }}>瑕疵</th>
                                <th style={{ width: '23%' }}>註解</th>
                                <th style={{ width: '6%' }}>直出</th>
                            </React.Fragment>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {newStockInfoes.map((stockInfo, index) => (
                        <ModifyRequest
                            key={index}
                            index={index}
                            typeValidation={typeValidation}
                            stockInfo={stockInfo}
                            onRequestChange={onRequestChange}
                            handleDefectChange={handleDefectChange}
                            handleShipCheck={handleShipCheck}
                            handleReasonButton={handleReasonButton}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ModifyRequestContainer;
