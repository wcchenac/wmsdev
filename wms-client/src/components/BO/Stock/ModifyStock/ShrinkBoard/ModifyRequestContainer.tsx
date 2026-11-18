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
        <div className="table-responsive">
            <table className="table table-actions-center text-nowrap">
                <thead className="table-dark">
                    <tr>
                        {typeValidation ? (
                            <React.Fragment>
                                <th>型態</th>
                                <th>數量</th>
                                <th>單位</th>
                                <th>註解</th>
                                <th>直出</th>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <th>型態</th>
                                <th>數量</th>
                                <th>單位</th>
                                <th>瑕疵</th>
                                <th>註解</th>
                                <th>直出</th>
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
