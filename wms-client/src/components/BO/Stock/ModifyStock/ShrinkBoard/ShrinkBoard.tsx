import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useUpdateEffect } from "../../../../../utilities/useUpdateEffect";
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

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [waitCreateResp, setWaitCreateResp] = useState<boolean>(false);
    const [shrinkList, setShrinkList] = useState<StockInfo[]>([]);
    const [stockInfo, setStockInfo] = useState<StockInfo>({});
    const [typeExchange, setTypeExchange] = useState<boolean>(false);
    const [sameTypeModify, setSameTypeModify] = useState<boolean>(false);
    const [hardwareModify, setHardwareModify] = useState<boolean>(false);

    // Only react to a list that arrives while this page is mounted, not one another page
    // left in the shared stockInfo slice (componentDidUpdate in dev).
    useUpdateEffect(shrinkListFromStore.stockInfoes, (result) => {
        if (Array.isArray(result)) {
            setShrinkList(result);
        }
    });

    const initialComponent = useCallback((): void => {
        setIsLoading(false);
        setWaitCreateResp(false);
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
        setIsLoading(true);
        dispatch(getShrinkList()).then((response: { status: number }) => {
            if (response.status === 200) {
                setIsLoading(false);
            }
        });
    }, [dispatch]);

    const handleModifyRequestSubmit = useCallback(
        (shrinkStockRequest: ShrinkStockRequest): void => {
            if (!waitCreateResp) {
                setIsLoading(true);
                setWaitCreateResp(true);
                dispatch(batchCreateStockInfoesForShrink(shrinkStockRequest))
                    .then((res: { status: number }) => {
                        if (res.status === 200) {
                            initialComponent();
                        }
                    })
                    .catch(() => {
                        // Reset loading state on error
                        setIsLoading(false);
                        setWaitCreateResp(false);
                    });
            }
        },
        [dispatch, waitCreateResp, initialComponent]
    );

    const onCancelShrinkClick = useCallback(
        (stockIdentifierId: number): void => {
            setIsLoading(true);
            dispatch(stockIdentifierWaitToShrinkIsFalse(stockIdentifierId)).then(
                (response: { status: number }) => {
                    if (response.status === 200) {
                        setIsLoading(false);
                    }
                }
            );
        },
        [dispatch]
    );

    return typeExchange || sameTypeModify || hardwareModify ? (
        <ModifyRequestBoard
            stockInfo={stockInfo}
            typeExchange={typeExchange}
            sameTypeModify={sameTypeModify}
            hardwareModify={hardwareModify}
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
