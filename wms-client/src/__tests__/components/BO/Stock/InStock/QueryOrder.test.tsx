import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import QueryOrder from '../../../../../components/BO/Stock/InStock/Common/QueryOrder';

interface QueryOrderProps {
  type: string;
  isOrderValid: boolean | null;
  handleQueryOrderSubmit: Mock;
  handleOrderNo: Mock;
}

describe('QueryOrder', () => {
  const defaultProps: QueryOrderProps = {
    type: '進貨',
    isOrderValid: null,
    handleQueryOrderSubmit: vi.fn(),
    handleOrderNo: vi.fn()
  };

  const renderQueryOrder = (props: Partial<QueryOrderProps> = {}): RenderResult => {
    return render(<QueryOrder {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders form with correct type label', () => {
      renderQueryOrder();
      expect(screen.getByText('進貨單號查詢')).toBeInTheDocument();
    });

    test('renders input with correct placeholder', () => {
      renderQueryOrder();
      expect(screen.getByPlaceholderText('請輸入進貨單號')).toBeInTheDocument();
    });

    test('renders submit button', () => {
      renderQueryOrder();
      expect(screen.getByRole('button', { name: '查詢' })).toBeInTheDocument();
    });

    test('renders with different type', () => {
      renderQueryOrder({ type: '組裝' });
      expect(screen.getByText('組裝單號查詢')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('請輸入組裝單號')).toBeInTheDocument();
    });
  });

  describe('validation display', () => {
    test('does not show error when isOrderValid is null', () => {
      renderQueryOrder({ isOrderValid: null });
      expect(screen.queryByText(/查無進貨/)).not.toBeInTheDocument();
    });

    test('does not show error when isOrderValid is true', () => {
      renderQueryOrder({ isOrderValid: true });
      expect(screen.queryByText(/查無進貨/)).not.toBeInTheDocument();
    });

    test('shows error message when isOrderValid is false', () => {
      renderQueryOrder({ isOrderValid: false });
      expect(screen.getByText('查無進貨 或 進貨內沒有需要入庫的貨號')).toBeInTheDocument();
    });

    test('input has is-invalid class when isOrderValid is false', () => {
      renderQueryOrder({ isOrderValid: false });
      const input = screen.getByPlaceholderText('請輸入進貨單號');
      expect(input).toHaveClass('is-invalid');
    });
  });

  describe('input handling', () => {
    test('calls handleOrderNo on input change', () => {
      const handleOrderNo = vi.fn();
      renderQueryOrder({ handleOrderNo });

      const input = screen.getByPlaceholderText('請輸入進貨單號');
      fireEvent.change(input, { target: { value: 'ORDER001' } });

      expect(handleOrderNo).toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    test('calls handleQueryOrderSubmit on form submit', () => {
      const handleQueryOrderSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      renderQueryOrder({ handleQueryOrderSubmit });

      const button = screen.getByRole('button', { name: '查詢' });
      fireEvent.click(button);

      expect(handleQueryOrderSubmit).toHaveBeenCalled();
    });
  });

  describe('CSS structure', () => {
    test('has Bootstrap form classes', () => {
      const { container } = renderQueryOrder();
      expect(container.querySelector('.form-group')).toBeInTheDocument();
      expect(container.querySelector('.form-control')).toBeInTheDocument();
    });

    test('submit button has Bootstrap btn-primary class', () => {
      renderQueryOrder();
      const button = screen.getByRole('button', { name: '查詢' });
      expect(button).toHaveClass('btn', 'btn-primary');
    });
  });
});
