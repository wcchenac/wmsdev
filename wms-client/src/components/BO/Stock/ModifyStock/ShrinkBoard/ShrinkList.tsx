import React, { useEffect, useRef, memo } from 'react';
import ShrinkInfoContainer from './ShrinkInfoContainer';
import LoadingOverlay from '@achmadk/react-loading-overlay';
import { Spinner } from '../../../../Others/Spinner';
import { StockInfo } from '../../../../../types';

const refreshTime = 1000 * 60 * 10;

type ModifyType = 'typeExchange' | 'sameTypeModify' | 'hardwareModify';

interface ShrinkListProps {
    queryShrinkList: () => void;
    isLoading: boolean;
    shrinkList: StockInfo[];
    onModifyClick: (type: ModifyType, info: StockInfo) => void;
    onCancelShrinkClick: (stockIdentifierId: number) => void;
}

const ShrinkList: React.FC<ShrinkListProps> = memo(({
    queryShrinkList,
    isLoading,
    shrinkList,
    onModifyClick,
    onCancelShrinkClick
}) => {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        queryShrinkList();
        intervalRef.current = setInterval(() => {
            queryShrinkList();
        }, refreshTime);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [queryShrinkList]);

    return (
        <div className="shrink_list">
            <div className="container">
                <p className="h3 text-center">待處理清單</p>
                <hr />
                <LoadingOverlay
                    active={isLoading}
                    spinner={<Spinner />}
                >
                    <div style={{ height: '80vh' }}>
                        <ShrinkInfoContainer
                            shrinkList={shrinkList}
                            onModifyClick={onModifyClick}
                            onCancelShrinkClick={onCancelShrinkClick}
                        />
                    </div>
                </LoadingOverlay>
            </div>
        </div>
    );
});

ShrinkList.displayName = 'ShrinkList';

export default ShrinkList;
