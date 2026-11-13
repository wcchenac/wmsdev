import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import CheckBoxForSelectionBoard from '../../../../../components/BO/Stock/InStock/Common/CheckBoxForSelectionBoard';

interface WaitHandleStatusItem {
  quantity: string;
  unit: string;
}

interface WaitHandleStatus {
  [key: string]: WaitHandleStatusItem;
}

interface CheckBoxProps {
  productNo: string;
  index: number;
  checked: boolean;
  waitHandleStatus: WaitHandleStatus;
  handleCheckBoxSelected: Mock;
}

describe('CheckBoxForSelectionBoard', () => {
  const defaultProps: CheckBoxProps = {
    productNo: 'PROD001',
    index: 0,
    checked: false,
    waitHandleStatus: {
      '板卷': { quantity: '10', unit: '碼' },
      '整卷': { quantity: '5', unit: '碼' }
    },
    handleCheckBoxSelected: vi.fn()
  };

  const renderCheckBox = (props: Partial<CheckBoxProps> = {}): RenderResult => {
    return render(<CheckBoxForSelectionBoard {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders product number label', () => {
      renderCheckBox();
      expect(screen.getByText('PROD001')).toBeInTheDocument();
    });

    test('renders checkbox input', () => {
      renderCheckBox();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    test('renders wait handle label', () => {
      renderCheckBox();
      expect(screen.getByText('待處理:')).toBeInTheDocument();
    });

    test('renders wait handle status for each type', () => {
      renderCheckBox();
      expect(screen.getByText('板卷')).toBeInTheDocument();
      expect(screen.getByText('整卷')).toBeInTheDocument();
      expect(screen.getByText('10 碼')).toBeInTheDocument();
      expect(screen.getByText('5 碼')).toBeInTheDocument();
    });
  });

  describe('checkbox state', () => {
    test('checkbox is unchecked when checked prop is false', () => {
      renderCheckBox({ checked: false });
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    test('checkbox is checked when checked prop is true', () => {
      renderCheckBox({ checked: true });
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('checkbox disable logic', () => {
    test('checkbox is enabled when waitHandleStatus has non-zero quantities', () => {
      renderCheckBox();
      expect(screen.getByRole('checkbox')).not.toBeDisabled();
    });

    test('checkbox is disabled when all waitHandleStatus quantities are zero', () => {
      const propsWithZero: Partial<CheckBoxProps> = {
        ...defaultProps,
        waitHandleStatus: {
          '板卷': { quantity: '0', unit: '碼' },
          '整卷': { quantity: '0', unit: '碼' }
        }
      };
      renderCheckBox(propsWithZero);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    test('checkbox is enabled when at least one quantity is non-zero', () => {
      const propsMixed: Partial<CheckBoxProps> = {
        ...defaultProps,
        waitHandleStatus: {
          '板卷': { quantity: '0', unit: '碼' },
          '整卷': { quantity: '5', unit: '碼' }
        }
      };
      renderCheckBox(propsMixed);
      expect(screen.getByRole('checkbox')).not.toBeDisabled();
    });
  });

  describe('checkbox interaction', () => {
    test('calls handleCheckBoxSelected on change', () => {
      renderCheckBox();
      fireEvent.click(screen.getByRole('checkbox'));
      expect(defaultProps.handleCheckBoxSelected).toHaveBeenCalled();
    });

    test('passes correct index to handleCheckBoxSelected', () => {
      const handleCheckBoxSelected = vi.fn();
      renderCheckBox({ index: 5, handleCheckBoxSelected });
      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleCheckBoxSelected).toHaveBeenCalledWith(expect.anything(), 5);
    });
  });

  describe('CSS styling', () => {
    test('has card container', () => {
      const { container } = renderCheckBox();
      expect(container.querySelector('.card')).toBeInTheDocument();
    });

    test('card body has bg-light class when enabled', () => {
      const { container } = renderCheckBox();
      expect(container.querySelector('.card-body.bg-light')).toBeInTheDocument();
    });

    test('card body has bg-secondary class when disabled', () => {
      const propsDisabled: Partial<CheckBoxProps> = {
        ...defaultProps,
        waitHandleStatus: {
          '板卷': { quantity: '0', unit: '碼' }
        }
      };
      const { container } = renderCheckBox(propsDisabled);
      expect(container.querySelector('.card-body.bg-secondary')).toBeInTheDocument();
    });
  });

  describe('label rendering', () => {
    test('label has correct htmlFor attribute', () => {
      renderCheckBox({ index: 3 });
      const label = screen.getByText('PROD001').closest('label');
      expect(label).toHaveAttribute('for', 'checkbox-3');
    });

    test('checkbox has correct id attribute', () => {
      renderCheckBox({ index: 3 });
      expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'checkbox-3');
    });
  });
});
