import React from 'react';
import ShrinkInfo from './ShrinkInfo';
import { StockInfo } from '../../../../../types';

type ModifyType = 'typeExchange' | 'sameTypeModify' | 'hardwareModify';

interface ShrinkInfoContainerProps {
    shrinkList: StockInfo[];
    onModifyClick: (type: ModifyType, info: StockInfo) => void;
    onCancelShrinkClick: (stockIdentifierId: number) => void;
}

const ShrinkInfoContainer: React.FC<ShrinkInfoContainerProps> = ({
    shrinkList,
    onModifyClick,
    onCancelShrinkClick
}) => {
    if (shrinkList.length === 0) {
        return (
            <div className="alert alert-warning text-center" role="alert">
                查無資料
            </div>
        );
    }

    return (
        <div className="table-wrapper-scroll-y scrollbar-75">
            <table className="table table-hover table-actions-center text-nowrap">
                <thead className="table-dark">
                    <tr>
                        <th>
                            <div className="ps-3">貨號</div>
                        </th>
                        <th>
                            <div className="ps-1">批號</div>
                        </th>
                        <th>
                            {' '}
                            <div className="ps-2">型態</div>
                        </th>
                        <th>
                            {' '}
                            <div className="ps-1">數量</div>
                        </th>
                        <th>
                            {' '}
                            <div className="ps-1">單位</div>
                        </th>
                        <th>色號</th>
                        <th>
                            {' '}
                            <div className="ps-2">瑕疵</div>
                        </th>
                        <th />
                        <th />
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {shrinkList.map((stockInfo, index) => (
                        <ShrinkInfo
                            key={index}
                            stockInfo={stockInfo}
                            onModifyClick={onModifyClick}
                            onCancelShrinkClick={onCancelShrinkClick}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ShrinkInfoContainer;
