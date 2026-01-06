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
            <table className="table table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th style={{ width: '18%' }}>
                            <div className="pl-3">貨號</div>
                        </th>
                        <th style={{ width: '8%' }}>
                            <div className="pl-1">批號</div>
                        </th>
                        <th style={{ width: '8%' }}>
                            {' '}
                            <div className="pl-2">型態</div>
                        </th>
                        <th style={{ width: '9%' }}>
                            {' '}
                            <div className="pl-1">數量</div>
                        </th>
                        <th style={{ width: '8%' }}>
                            {' '}
                            <div className="pl-1">單位</div>
                        </th>
                        <th style={{ width: '7.5%' }}>色號</th>
                        <th style={{ width: '9%' }}>
                            {' '}
                            <div className="pl-2">瑕疵</div>
                        </th>
                        <th style={{ width: '10.5%' }} />
                        <th style={{ width: '10.5%' }} />
                        <th style={{ width: '10.5%' }} />
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
