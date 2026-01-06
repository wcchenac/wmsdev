import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DatePeriodSelectModal from '../../../../../components/BO/Stock/Utilities/DatePeriodSelectModal';

// Mock react-datepicker
jest.mock('react-datepicker', () => {
  return function MockDatePicker(props) {
    return (
      <input
        data-testid={`datepicker-${props.name}`}
        type="date"
        value={props.selected ? props.selected.toISOString().split('T')[0] : ''}
        onChange={(e) => props.onChange(new Date(e.target.value))}
      />
    );
  };
});

describe('DatePeriodSelectModal', () => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const weekFromNow = new Date(today.getTime() + 86400000 * 7);

  const defaultProps = {
    fileType: 'test',
    btnTitle: '選擇日期',
    btnSize: 'sm',
    startDate: today,
    endDate: tomorrow,
    dayRange: 7,
    handleStartDateSelection: jest.fn(),
    handleEndDateSelection: jest.fn(),
    handleDateSelectionModeClick: jest.fn()
  };

  const renderModal = (props = {}) => {
    return render(<DatePeriodSelectModal {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders trigger button with correct title', () => {
      renderModal();
      expect(screen.getByRole('button', { name: '選擇日期' })).toBeInTheDocument();
    });

    test('renders modal title', () => {
      renderModal();
      expect(screen.getByText('時間區間查詢')).toBeInTheDocument();
    });

    test('renders start date label', () => {
      renderModal();
      expect(screen.getByText('起始日期')).toBeInTheDocument();
    });

    test('renders end date label', () => {
      renderModal();
      expect(screen.getByText('結束日期')).toBeInTheDocument();
    });

    test('renders day range hint', () => {
      renderModal();
      expect(screen.getByText('時間區間最長7天')).toBeInTheDocument();
    });

    test('renders cancel button', () => {
      renderModal();
      expect(screen.getByText('取消')).toBeInTheDocument();
    });

    test('renders confirm button', () => {
      renderModal();
      expect(screen.getByText('確認')).toBeInTheDocument();
    });

    test('renders date pickers', () => {
      renderModal();
      expect(screen.getByTestId('datepicker-start')).toBeInTheDocument();
      expect(screen.getByTestId('datepicker-end')).toBeInTheDocument();
    });
  });

  describe('button size classes', () => {
    test('renders small button when btnSize is sm', () => {
      renderModal({ btnSize: 'sm' });
      const button = screen.getByRole('button', { name: '選擇日期' });
      expect(button).toHaveClass('btn-sm');
    });

    test('renders large button when btnSize is lg', () => {
      renderModal({ btnSize: 'lg' });
      const button = screen.getByRole('button', { name: '選擇日期' });
      expect(button).toHaveClass('btn-lg');
    });

    test('renders default button when btnSize is not specified', () => {
      renderModal({ btnSize: undefined });
      const button = screen.getByRole('button', { name: '選擇日期' });
      expect(button).toHaveClass('btn', 'btn-info');
      expect(button).not.toHaveClass('btn-sm');
      expect(button).not.toHaveClass('btn-lg');
    });
  });

  describe('date validation', () => {
    test('shows error when end date is before start date', () => {
      const yesterday = new Date(today.getTime() - 86400000);
      renderModal({
        startDate: today,
        endDate: yesterday
      });
      expect(screen.getByText('日期設定錯誤，請修改日期')).toBeInTheDocument();
    });

    test('shows error when date range exceeds dayRange', () => {
      const twoWeeksFromNow = new Date(today.getTime() + 86400000 * 14);
      renderModal({
        startDate: today,
        endDate: twoWeeksFromNow,
        dayRange: 7
      });
      expect(screen.getByText('日期設定錯誤，請修改日期')).toBeInTheDocument();
    });

    test('does not show error for valid date range', () => {
      renderModal({
        startDate: today,
        endDate: tomorrow,
        dayRange: 7
      });
      expect(screen.queryByText('日期設定錯誤，請修改日期')).not.toBeInTheDocument();
    });

    test('confirm button is disabled when date setting is wrong', () => {
      const yesterday = new Date(today.getTime() - 86400000);
      const { container } = renderModal({
        startDate: today,
        endDate: yesterday
      });
      const confirmButton = container.querySelector('.btn-primary');
      expect(confirmButton).toBeDisabled();
    });

    test('confirm button is enabled when date setting is correct', () => {
      const { container } = renderModal({
        startDate: today,
        endDate: tomorrow
      });
      const confirmButton = container.querySelector('.btn-primary');
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('button interactions', () => {
    test('calls handleDateSelectionModeClick when confirm clicked', () => {
      const { container } = renderModal();
      const confirmButton = container.querySelector('.btn-primary');
      fireEvent.click(confirmButton);
      expect(defaultProps.handleDateSelectionModeClick).toHaveBeenCalled();
    });
  });

  describe('CSS structure', () => {
    test('trigger button has btn-info class', () => {
      renderModal();
      const button = screen.getByRole('button', { name: '選擇日期' });
      expect(button).toHaveClass('btn-info');
    });

    test('cancel button has btn-secondary class', () => {
      const { container } = renderModal();
      const cancelButtons = container.querySelectorAll('.btn-secondary');
      expect(cancelButtons.length).toBeGreaterThan(0);
    });

    test('confirm button has btn-primary class', () => {
      const { container } = renderModal();
      const primaryButtons = container.querySelectorAll('.btn-primary');
      expect(primaryButtons.length).toBeGreaterThan(0);
    });
  });

  describe('modal attributes', () => {
    test('modal has correct id based on fileType', () => {
      const { container } = renderModal({ fileType: 'export' });
      expect(container.querySelector('#dateCondition-export')).toBeInTheDocument();
    });

    test('trigger button targets correct modal', () => {
      renderModal({ fileType: 'export' });
      const button = screen.getByRole('button', { name: '選擇日期' });
      expect(button).toHaveAttribute('data-target', '#dateCondition-export');
    });
  });
});
