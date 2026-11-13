import React from 'react';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import ConfirmModal from '../../../../../components/BO/Stock/OutStockList/ConfirmModal';

interface SearchInfo {
  id: number;
  stockIdentifierId: number;
  outStockType: number;
}

interface ConfirmModalProps {
  show: boolean;
  searchInfo: SearchInfo;
  handleModalClose: jest.Mock;
  cancelShip: jest.Mock;
  deleteOutStock: jest.Mock;
}

describe('ConfirmModal', () => {
  const defaultProps: ConfirmModalProps = {
    show: true,
    searchInfo: {
      id: 1,
      stockIdentifierId: 100,
      outStockType: 0
    },
    handleModalClose: jest.fn(),
    cancelShip: jest.fn(),
    deleteOutStock: jest.fn()
  };

  const renderConfirmModal = (props: Partial<ConfirmModalProps> = {}): RenderResult => {
    return render(<ConfirmModal {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders modal when show is true', () => {
      renderConfirmModal();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('renders modal title', () => {
      renderConfirmModal();
      // outStockType 0 shows "取消出貨確認" title
      expect(screen.getByText('取消出貨確認')).toBeInTheDocument();
    });

    test('renders cancel button', () => {
      renderConfirmModal();
      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    });

    test('renders submit button', () => {
      renderConfirmModal();
      // outStockType 0 shows "確認取消" button
      expect(screen.getByRole('button', { name: '確認取消' })).toBeInTheDocument();
    });
  });

  describe('body content for outStockType 0 (cancel ship)', () => {
    test('shows cancel ship message', () => {
      renderConfirmModal({
        searchInfo: { ...defaultProps.searchInfo, outStockType: 0 }
      });
      // Component shows message and warning separately
      expect(screen.getByText('是否取消出貨？')).toBeInTheDocument();
      expect(screen.getByText(/取消非當天出貨後，無法再以當天日期出貨/)).toBeInTheDocument();
    });

    test('calls cancelShip on submit', () => {
      renderConfirmModal({
        searchInfo: { ...defaultProps.searchInfo, outStockType: 0, stockIdentifierId: 123 }
      });
      fireEvent.click(screen.getByRole('button', { name: '確認取消' }));
      expect(defaultProps.cancelShip).toHaveBeenCalledWith(123);
    });
  });

  describe('body content for outStockType 2 (delete)', () => {
    test('shows delete message', () => {
      renderConfirmModal({
        searchInfo: { ...defaultProps.searchInfo, outStockType: 2 }
      });
      // Component uses "是否刪除此筆記錄？" with question mark
      expect(screen.getByText('是否刪除此筆記錄？')).toBeInTheDocument();
    });

    test('calls deleteOutStock on submit', () => {
      renderConfirmModal({
        searchInfo: { ...defaultProps.searchInfo, outStockType: 2, id: 456 }
      });
      fireEvent.click(screen.getByRole('button', { name: '確認刪除' }));
      expect(defaultProps.deleteOutStock).toHaveBeenCalledWith(456);
    });
  });

  describe('body content for unknown outStockType', () => {
    test('shows default message for unknown type', () => {
      renderConfirmModal({
        searchInfo: { ...defaultProps.searchInfo, outStockType: 99 }
      });
      // Default config shows "確認執行動作" title
      expect(screen.getByText('確認執行動作')).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    test('calls handleModalClose when cancel button clicked', () => {
      renderConfirmModal();
      fireEvent.click(screen.getByRole('button', { name: '取消' }));
      expect(defaultProps.handleModalClose).toHaveBeenCalled();
    });

    test('does not call cancelShip or deleteOutStock for unknown type', () => {
      renderConfirmModal({
        searchInfo: { ...defaultProps.searchInfo, outStockType: 99 }
      });
      fireEvent.click(screen.getByRole('button', { name: '確認' }));
      expect(defaultProps.cancelShip).not.toHaveBeenCalled();
      expect(defaultProps.deleteOutStock).not.toHaveBeenCalled();
    });
  });

  describe('modal visibility', () => {
    test('modal is shown when show prop is true', () => {
      renderConfirmModal({ show: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
