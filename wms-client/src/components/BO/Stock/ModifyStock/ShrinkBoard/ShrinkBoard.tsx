import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { notifyRequestFailed } from "../../../../../utilities/notifyRequestFailed";
import { useUpdateEffect } from "../../../../../utilities/useUpdateEffect";
import { useSubmitLock } from "../../../../../utilities/useSubmitLock";
import {
    getShrinkList,
    stockIdentifierWaitToShrinkIsFalse,
    batchCreateStockInfoesForShrink,
} from '../../../../../actions/StockActions';
import ShrinkList from './ShrinkList';
import ModifyRequestBoard from './ModifyRequestBoard';
import { RootState, AppDispatch, StockInfo, ShrinkStockRequest } from '../../../../../types';

type ModifyType = 'typeExchange' | 'sameTypeModify' | 'hardwareModify';

const ShrinkBoard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const shrinkListFromStore = useSelector((state: RootState) => state.stockInfo);

    const { isLocked: isLoading, runLocked } = useSubmitLock();
    const [shrinkList, setShrinkList] = useState<StockInfo[]>([]);
    const [stockInfo, setStockInfo] = useState<StockInfo>({});
    const [typeExchange, setTypeExchange] = useState<boolean>(false);
    const [sameTypeModify, setSameTypeModify] = useState<boolean>(false);
    const [hardwareModify, setHardwareModify] = useState<boolean>(false);

    // Only react to a list that arrives while this page is mounted, not one another page
    // left in the shared stockInfo slice (componentDidUpdate in dev).
    useUpdateEffect(shrinkListFromStore.shrinkList, (result) => {
        if (Array.isArray(result)) {
            setShrinkList(result);
        }
    });

    const initialComponent = useCallback((): void => {
        setShrinkList([]);
        setStockInfo({});
        setTypeExchange(false);
        setSameTypeModify(false);
        setHardwareModify(false);
    }, []);

    const handleGoBack = useCallback((): void => {
        setTypeExchange(false);
        setSameTypeModify(false);
        setHardwareModify(false);
        setStockInfo({});
    }, []);

    const onModifyClick = useCallback((type: ModifyType, info: StockInfo): void => {
        if (type === 'typeExchange') {
            setTypeExchange(true);
        } else if (type === 'sameTypeModify') {
            setSameTypeModify(true);
        } else if (type === 'hardwareModify') {
            setHardwareModify(true);
        }
        setStockInfo(info);
    }, []);

    const queryShrinkList = useCallback((): void => {
        void runLocked(() =>
            dispatch(getShrinkList()).catch((error) => {
              notifyRequestFailed(error);
            })
        );
    }, [dispatch, runLocked]);

    const handleModifyRequestSubmit = useCallback(
        (shrinkStockRequest: ShrinkStockRequest): void => {
            void runLocked(() =>
                dispatch(batchCreateStockInfoesForShrink(shrinkStockRequest))
                    .then((res: { status: number }) => {
                        if (res.status === 200) {
                            initialComponent();
                        }
                    })
                    .catch((error) => {
                        notifyRequestFailed(error);
                    })
            );
        },
        [dispatch, runLocked, initialComponent]
    );

    const onCancelShrinkClick = useCallback(
        (stockIdentifierId: number): void => {
            void runLocked(() =>
                dispatch(stockIdentifierWaitToShrinkIsFalse(stockIdentifierId)).catch((error) => {
                  notifyRequestFailed(error);
                })
            );
        },
        [dispatch, runLocked]
    );

    return typeExchange || sameTypeModify || hardwareModify ? (
        <ModifyRequestBoard
            stockInfo={stockInfo}
            typeExchange={typeExchange}
            sameTypeModify={sameTypeModify}
            hardwareModify={hardwareModify}
            isLoading={isLoading}
            handleGoBack={handleGoBack}
            handleModifyRequestSubmit={handleModifyRequestSubmit}
        />
    ) : (
        <ShrinkList
            isLoading={isLoading}
            shrinkList={shrinkList}
            queryShrinkList={queryShrinkList}
            onModifyClick={onModifyClick}
            onCancelShrinkClick={onCancelShrinkClick}
        />
    );
};

export default ShrinkBoard;
