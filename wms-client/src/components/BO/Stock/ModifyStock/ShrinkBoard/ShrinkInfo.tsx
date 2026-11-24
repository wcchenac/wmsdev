import React, { useCallback } from 'react';
import { StockIdentifierType } from '../../../../../enums/Enums';
import { StockInfo } from '../../../../../types';

type ModifyType = 'typeExchange' | 'sameTypeModify' | 'hardwareModify';

interface ShrinkInfoProps {
    isLoading?: boolean;
    stockInfo: StockInfo;
    onModifyClick: (type: ModifyType, info: StockInfo) => void;
    onCancelShrinkClick: (stockIdentifierId: number) => void;
}

const ShrinkInfo: React.FC<ShrinkInfoProps> = ({
    isLoading = false,
    stockInfo,
    onModifyClick,
    onCancelShrinkClick
}) => {
    const { stockIdentifier } = stockInfo;

    const handleModifyClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            if (isLoading) {
                return;
            }
            const value = e.currentTarget.value as ModifyType;
            onModifyClick(value, stockInfo);
        },
        [isLoading, onModifyClick, stockInfo],
    );

    const handleCancelShrinkClick = useCallback(() => {
        if (!isLoading && stockIdentifier?.id) {
            onCancelShrinkClick(stockIdentifier.id);
        }
    }, [isLoading, onCancelShrinkClick, stockIdentifier?.id]);

    const renderActionButtons = (type: string | undefined): React.ReactNode => {
        if (type === StockIdentifierType.roll) {
            return (
                <React.Fragment>
                    <td>
                        <button
                            type="button"
                            className="btn btn-primary"
                            value="typeExchange"
                            onClick={handleModifyClick}
                            disabled={isLoading}
                        >
                            板卷異動
                        </button>
                    </td>
                    <td>
                        <button
                            type="button"
                            className="btn btn-primary"
                            value="sameTypeModify"
                            onClick={handleModifyClick}
                            disabled={isLoading}
                        >
                            整支異動
                        </button>
                    </td>
                </React.Fragment>
            );
        }
        if (type === StockIdentifierType.board) {
            return (
                <React.Fragment>
                    <td>
                        <button
                            type="button"
                            className="btn btn-primary"
                            value="typeExchange"
                            onClick={handleModifyClick}
                            disabled={isLoading}
                        >
                            板卷異動
                        </button>
                    </td>
                    <td></td>
                </React.Fragment>
            );
        }
        if (type === StockIdentifierType.hardware) {
            return (
                <React.Fragment>
                    <td>
                        <button
                            type="button"
                            className="btn btn-primary"
                            value="hardwareModify"
                            onClick={handleModifyClick}
                            disabled={isLoading}
                        >
                            雜項異動
                        </button>
                    </td>
                    <td></td>
                </React.Fragment>
            );
        }
        return null;
    };

    const renderCancelButton = (type: string | undefined): React.ReactNode => {
        let text = '';
        if (
            type === StockIdentifierType.roll ||
            type === StockIdentifierType.board
        ) {
            text = '取消減肥';
        }
        if (type === StockIdentifierType.hardware) {
            text = '取消分裝';
        }

        return (
            <React.Fragment>
                <td>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleCancelShrinkClick}
                        disabled={isLoading}
                    >
                        {text}
                    </button>
                </td>
            </React.Fragment>
        );
    };

    const actionButtonContent = renderActionButtons(stockIdentifier?.type);
    const cancelButtonContent = renderCancelButton(stockIdentifier?.type);

    return (
        <tr>
            <td>{stockIdentifier?.productNo}</td>
            <td>{stockIdentifier?.lotNo}</td>
            <td>{stockIdentifier?.type}</td>
            <td>{stockIdentifier?.quantity}</td>
            <td>{stockIdentifier?.unit}</td>
            <td>
                {stockIdentifier?.type ===
                StockIdentifierType.hardware ? null : stockInfo.color}
            </td>
            <td>
                {stockIdentifier?.type ===
                StockIdentifierType.hardware ? null : (stockInfo.defect as string)}
            </td>
            {actionButtonContent}
            {cancelButtonContent}
        </tr>
    );
};

export default ShrinkInfo;
