import React, { useCallback } from 'react';
import { StockIdentifierType } from '../../../../../enums/Enums';
import { StockInfo } from '../../../../../types';

type ModifyType = 'typeExchange' | 'sameTypeModify' | 'hardwareModify';

interface ShrinkInfoProps {
    stockInfo: StockInfo;
    onModifyClick: (type: ModifyType, info: StockInfo) => void;
    onCancelShrinkClick: (stockIdentifierId: number) => void;
}

const ShrinkInfo: React.FC<ShrinkInfoProps> = ({
    stockInfo,
    onModifyClick,
    onCancelShrinkClick
}) => {
    const { stockIdentifier } = stockInfo;

    const handleModifyClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const value = (e.target as HTMLButtonElement).value as ModifyType;
            onModifyClick(value, stockInfo);
        },
        [onModifyClick, stockInfo],
    );

    const handleCancelShrinkClick = useCallback(() => {
        if (stockIdentifier?.id) {
            onCancelShrinkClick(stockIdentifier.id);
        }
    }, [onCancelShrinkClick, stockIdentifier?.id]);

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
            <td>
                <button className="btn-customize" disabled>
                    {stockIdentifier?.productNo}
                </button>
            </td>
            <td>
                <button className="btn-customize" disabled>
                    {stockIdentifier?.lotNo}
                </button>
            </td>
            <td>
                <button className="btn-customize" disabled>
                    {stockIdentifier?.type}
                </button>
            </td>
            <td>
                <button className="btn-customize" disabled>
                    {stockIdentifier?.quantity}
                </button>
            </td>
            <td>
                <button className="btn-customize" disabled>
                    {stockIdentifier?.unit}
                </button>
            </td>
            <td>
                {stockIdentifier?.type ===
                StockIdentifierType.hardware ? null : (
                    <button className="btn-customize" disabled>
                        {stockInfo.color}
                    </button>
                )}
            </td>
            <td>
                {stockIdentifier?.type ===
                StockIdentifierType.hardware ? null : (
                    <button className="btn-customize" disabled>
                        {stockInfo.defect as string}
                    </button>
                )}
            </td>
            {actionButtonContent}
            {cancelButtonContent}
        </tr>
    );
};

export default ShrinkInfo;
