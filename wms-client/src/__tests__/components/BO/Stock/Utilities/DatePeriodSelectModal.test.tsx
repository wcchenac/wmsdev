import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitForElementToBeRemoved, RenderResult } from '@testing-library/react';
import DatePeriodSelectModal from '../../../../../components/BO/Stock/Utilities/DatePeriodSelectModal';

interface MockDatePickerProps {
  name: string;
  selected: Date | null;
  onChange: (date: Date) => void;
}

interface DatePeriodSelectModalProps {
  fileType: string;
  btnTitle: string;
  btnSize?: 'sm' | 'lg';
  startDate: Date;
  endDate: Date;
  dayRange: number;
  handleStartDateSelection: Mock;
  handleEndDateSelection: Mock;
  handleDateSelectionModeClick: Mock;
}

// Mock react-datepicker
vi.mock('react-datepicker', () => ({ default: (() => {
  return function MockDatePicker(props: MockDatePickerProps): JSX.Element {
    return (
      <input
        data-testid={`datepicker-${props.name}`}
        type="date"
        value={props.selected ? props.selected.toISOString().split('T')[0] : ''}
        onChange={(e) => props.onChange(new Date(e.target.value))}
      />
    );
  };
})() }));

describe('DatePeriodSelectModal', () => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);

  const defaultProps: DatePeriodSelectModalProps = {
    fileType: 'test',
    btnTitle: '選擇日期',
    btnSize: 'sm',
    startDate: today,
    endDate: tomorrow,
    dayRange: 7,
    handleStartDateSelection: vi.fn(),
    handleEndDateSelection: vi.fn(),
    handleDateSelectionModeClick: vi.fn()
  };

  const renderModal = (props: Partial<DatePeriodSelectModalProps> = {}): RenderResult => {
    return render(<DatePeriodSelectModal {...defaultProps} {...props} />);
  };

  // react-bootstrap renders the modal into document.body only while it is open.
  const openModal = (props: Partial<DatePeriodSelectModalProps> = {}): RenderResult => {
    const result = renderModal(props);
    fireEvent.click(screen.getByRole('button', { name: props.btnTitle ?? defaultProps.btnTitle }));
    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders trigger button with correct title', () => {
      renderModal();
      expect(screen.getByRole('button', { name: '選擇日期' })).toBeInTheDocument();
    });

    test('does not render the modal until the trigger is clicked', () => {
      renderModal();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('時間區間查詢')).not.toBeInTheDocument();
    });

    test('renders modal title', () => {
      openModal();
      expect(screen.getByText('時間區間查詢')).toBeInTheDocument();
    });

    test('labels the dialog with its title', () => {
      openModal();
      expect(screen.getByRole('dialog', { name: '時間區間查詢' })).toBeInTheDocument();
    });

    test('renders start date label', () => {
      openModal();
      expect(screen.getByText('起始日期')).toBeInTheDocument();
    });

    test('renders end date label', () => {
      openModal();
      expect(screen.getByText('結束日期')).toBeInTheDocument();
    });

    test('renders day range hint', () => {
      openModal();
      expect(screen.getByText('時間區間最長7天')).toBeInTheDocument();
    });

    test('renders cancel button', () => {
      openModal();
      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    });

    test('renders confirm button', () => {
      openModal();
      expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument();
    });

    test('renders date pickers', () => {
      openModal();
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
      openModal({
        startDate: today,
        endDate: yesterday
      });
      expect(screen.getByText('日期設定錯誤，請修改日期')).toBeInTheDocument();
    });

    test('shows error when date range exceeds dayRange', () => {
      const twoWeeksFromNow = new Date(today.getTime() + 86400000 * 14);
      openModal({
        startDate: today,
        endDate: twoWeeksFromNow,
        dayRange: 7
      });
      expect(screen.getByText('日期設定錯誤，請修改日期')).toBeInTheDocument();
    });

    test('does not show error for valid date range', () => {
      openModal({
        startDate: today,
        endDate: tomorrow,
        dayRange: 7
      });
      expect(screen.queryByText('日期設定錯誤，請修改日期')).not.toBeInTheDocument();
    });

    test('confirm button is disabled when date setting is wrong', () => {
      const yesterday = new Date(today.getTime() - 86400000);
      openModal({
        startDate: today,
        endDate: yesterday
      });
      expect(screen.getByRole('button', { name: '確認' })).toBeDisabled();
    });

    test('confirm button is enabled when date setting is correct', () => {
      openModal({
        startDate: today,
        endDate: tomorrow
      });
      expect(screen.getByRole('button', { name: '確認' })).not.toBeDisabled();
    });
  });

  describe('button interactions', () => {
    test('calls handleDateSelectionModeClick and closes when confirm clicked', async () => {
      openModal();
      fireEvent.click(screen.getByRole('button', { name: '確認' }));
      expect(defaultProps.handleDateSelectionModeClick).toHaveBeenCalledTimes(1);
      await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
    });

    test('closes without applying when cancel clicked', async () => {
      openModal();
      fireEvent.click(screen.getByRole('button', { name: '取消' }));
      await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
      expect(defaultProps.handleDateSelectionModeClick).not.toHaveBeenCalled();
    });

    test('closes without applying when the close button is clicked', async () => {
      openModal();
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
      expect(defaultProps.handleDateSelectionModeClick).not.toHaveBeenCalled();
    });
  });

  describe('CSS structure', () => {
    test('trigger button has btn-info class', () => {
      renderModal();
      const button = screen.getByRole('button', { name: '選擇日期' });
      expect(button).toHaveClass('btn-info');
    });

    test('cancel button has btn-secondary class', () => {
      openModal();
      expect(screen.getByRole('button', { name: '取消' })).toHaveClass('btn-secondary');
    });

    test('confirm button has btn-primary class', () => {
      openModal();
      expect(screen.getByRole('button', { name: '確認' })).toHaveClass('btn-primary');
    });

    test('close button uses the Bootstrap 5 white close style', () => {
      openModal();
      expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('btn-close', 'btn-close-white');
    });
  });

  describe('modal attributes', () => {
    test('modal has correct id based on fileType', () => {
      openModal({ fileType: 'export' });
      expect(document.getElementById('dateCondition-export')).toBeInTheDocument();
    });
  });
});
