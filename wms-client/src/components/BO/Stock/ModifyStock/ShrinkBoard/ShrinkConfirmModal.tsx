import React, { useCallback, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { InfoLengthCalculation } from './ModifyRequestBoard';

interface ShrinkConfirmModalProps {
    show: boolean;
    isLoading?: boolean;
    unit?: string;
    handleModalClose: () => void;
    handleSubmitClick: (infoLengthCalculation: InfoLengthCalculation) => Promise<unknown> | void;
    infoLengthCalculation: InfoLengthCalculation;
}

const ShrinkConfirmModal: React.FC<ShrinkConfirmModalProps> = ({
    show,
    isLoading = false,
    unit = '碼',
    handleModalClose,
    handleSubmitClick,
    infoLengthCalculation
}) => {
    const clickedRef = useRef(false);
    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;

    useEffect(() => {
        if (!show || !isLoading) {
            clickedRef.current = false;
        }
    }, [show, isLoading]);

    const onSubmitClick = useCallback(() => {
        if (isLoading || clickedRef.current) {
            return;
        }
        clickedRef.current = true;
        Promise.resolve(handleSubmitClick(infoLengthCalculation)).finally(() => {
            if (!isLoadingRef.current) {
                clickedRef.current = false;
            }
        });
    }, [isLoading, handleSubmitClick, infoLengthCalculation]);

    const modalContent = (): React.ReactNode => {
        if (infoLengthCalculation.adjustment === 0) {
            return (
                <React.Fragment>
                    <p>減肥前後總數量相符，</p>
                    <p>是否確認送出？</p>
                </React.Fragment>
            );
        } else if (
            Math.abs(infoLengthCalculation.adjustment) >
            infoLengthCalculation.totalQuantity * 0.03
        ) {
            return (
                <React.Fragment>
                    <p>減肥前後總數量不符，</p>
                    <p>
                        差異量：
                        <strong>{infoLengthCalculation.adjustment}</strong>{' '}
                        {unit}，大於平常值，
                    </p>
                    <p>是否確認送出？</p>
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <p>減肥前後總數量不符，</p>
                    <p>
                        差異量：{' '}
                        <strong>{infoLengthCalculation.adjustment}</strong> {unit}，
                    </p>
                    <p>是否確認送出？</p>
                </React.Fragment>
            );
        }
    };

    return (
        <Modal
            centered
            show={show}
            onHide={isLoading ? undefined : handleModalClose}
            backdrop={isLoading ? 'static' : true}
            keyboard={!isLoading}
        >
            <Modal.Header
                closeButton={!isLoading}
                style={{
                    background: "linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-dark, #e0a800) 100%)",
                    color: "var(--color-gray-900)",
                    borderBottom: "none",
                    padding: "var(--spacing-4)",
                }}
            >
                <Modal.Title
                    style={{
                        fontWeight: "var(--font-weight-semibold)",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--spacing-2)",
                    }}
                >
                    <i className="fa fa-exclamation-triangle" aria-hidden="true" />
                    減肥確認
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalContent()}</Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleModalClose}
                    disabled={isLoading}
                >
                    取消
                </Button>
                <Button variant="primary" onClick={onSubmitClick} disabled={isLoading} aria-busy={isLoading}>
                    {isLoading ? '處理中...' : '送出'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShrinkConfirmModal;
