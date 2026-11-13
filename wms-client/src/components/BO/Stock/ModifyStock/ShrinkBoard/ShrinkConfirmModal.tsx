import React, { useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { InfoLengthCalculation } from './ModifyRequestBoard';

interface ShrinkConfirmModalProps {
    show: boolean;
    handleModalClose: () => void;
    handleSubmitClick: (infoLengthCalculation: InfoLengthCalculation) => void;
    infoLengthCalculation: InfoLengthCalculation;
}

const ShrinkConfirmModal: React.FC<ShrinkConfirmModalProps> = ({
    show,
    handleModalClose,
    handleSubmitClick,
    infoLengthCalculation
}) => {
    const onSubmitClick = useCallback(() => {
        handleSubmitClick(infoLengthCalculation);
    }, [handleSubmitClick, infoLengthCalculation]);

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
                        碼，大於平常值，
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
                        <strong>{infoLengthCalculation.adjustment}</strong> 碼，
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
            onHide={handleModalClose}
        >
            <Modal.Header
                closeButton
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
                >
                    取消
                </Button>
                <Button variant="primary" onClick={onSubmitClick}>
                    送出
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShrinkConfirmModal;
