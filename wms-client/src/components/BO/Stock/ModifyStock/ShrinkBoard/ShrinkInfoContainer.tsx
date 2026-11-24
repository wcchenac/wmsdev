import React from 'react';
import ShrinkInfo from './ShrinkInfo';
import { EmptyState } from '../../../../UI';
import { StockInfo } from '../../../../../types';

type ModifyType = 'typeExchange' | 'sameTypeModify' | 'hardwareModify';

interface ShrinkInfoContainerProps {
    isLoading?: boolean;
    shrinkList: StockInfo[];
    onModifyClick: (type: ModifyType, info: StockInfo) => void;
    onCancelShrinkClick: (stockIdentifierId: number) => void;
}

const ShrinkInfoContainer: React.FC<ShrinkInfoContainerProps> = ({
    isLoading = false,
    shrinkList,
    onModifyClick,
    onCancelShrinkClick
}) => {
    if (shrinkList.length === 0) {
        return (
            <EmptyState
                type="search"
                title="查無資料"
                description="目前沒有待減肥項目"
                compact
            />
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
                        <th>
                            <span className="visually-hidden">異動方式</span>
                        </th>
                        <th>
                            <span className="visually-hidden">異動按鈕</span>
                        </th>
                        <th>
                            <span className="visually-hidden">取消減肥</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {shrinkList.map((stockInfo, index) => (
                        <ShrinkInfo
                            key={index}
                            isLoading={isLoading}
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
