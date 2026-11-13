import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import ShipModal from '../../../../../components/BO/Stock/Utilities/ShipModal';

interface MockShipModalBodyProps {
  outStockReason: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReansonButtonChange: (e: { target: { value: string } }) => void;
}

interface ShipModalProps {
  show: boolean;
  outStockReason: string;
  handleModalClose: Mock;
  onChange: Mock;
  onReansonButtonChange: Mock;
  onCancleShipClick: Mock;
  onShipClick: Mock;
}

// Mock ShipModalBody
vi.mock('../../../../../components/BO/Stock/Utilities/ShipModalBody', () => ({ default: (() => {
  return function MockShipModalBody(props: MockShipModalBodyProps): JSX.Element {
    return (
      <div data-testid="ship-modal-body">
        <input
          data-testid="reason-input"
          value={props.outStockReason}
          onChange={props.onChange}
        />
        <button
          data-testid="reason-button"
          onClick={() => props.onReansonButtonChange({ target: { value: '門市' } })}
        >
          門市
        </button>
      </div>
    );
  };
})() }));

describe('ShipModal', () => {
  const defaultProps: ShipModalProps = {
    show: true,
    outStockReason: '',
    handleModalClose: vi.fn(),
    onChange: vi.fn(),
    onReansonButtonChange: vi.fn(),
    onCancleShipClick: vi.fn(),
    onShipClick: vi.fn()
  };

  const renderShipModal = (props: Partial<ShipModalProps> = {}): RenderResult => {
    return render(<ShipModal {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders modal when show is true', () => {
      renderShipModal();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('renders modal title', () => {
      renderShipModal();
      expect(screen.getByText('出庫確認')).toBeInTheDocument();
    });

    test('renders ShipModalBody', () => {
      renderShipModal();
      expect(screen.getByTestId('ship-modal-body')).toBeInTheDocument();
    });

    test('renders cancel button', () => {
      renderShipModal();
      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    });

    test('renders confirm button', () => {
      renderShipModal();
      expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument();
    });
  });

  describe('confirm button state', () => {
    test('confirm button is disabled when outStockReason is empty', () => {
      renderShipModal({ outStockReason: '' });
      expect(screen.getByRole('button', { name: '確認' })).toBeDisabled();
    });

    test('confirm button is enabled when outStockReason is provided', () => {
      renderShipModal({ outStockReason: '門市A' });
      expect(screen.getByRole('button', { name: '確認' })).not.toBeDisabled();
    });
  });

  describe('button interactions', () => {
    test('calls onCancleShipClick when cancel button clicked', () => {
      renderShipModal();
      fireEvent.click(screen.getByRole('button', { name: '取消' }));
      expect(defaultProps.onCancleShipClick).toHaveBeenCalled();
    });

    test('calls onShipClick when confirm button clicked', () => {
      renderShipModal({ outStockReason: '門市A' });
      fireEvent.click(screen.getByRole('button', { name: '確認' }));
      expect(defaultProps.onShipClick).toHaveBeenCalled();
    });
  });

  describe('props passing', () => {
    test('passes outStockReason to ShipModalBody', () => {
      renderShipModal({ outStockReason: '測試原因' });
      const input = screen.getByTestId('reason-input') as HTMLInputElement;
      expect(input).toHaveValue('測試原因');
    });
  });

  describe('CSS structure', () => {
    test('cancel button has secondary variant', () => {
      renderShipModal();
      const button = screen.getByRole('button', { name: '取消' });
      expect(button).toHaveClass('btn-secondary');
    });

    test('confirm button has primary variant', () => {
      renderShipModal({ outStockReason: 'test' });
      const button = screen.getByRole('button', { name: '確認' });
      expect(button).toHaveClass('btn-primary');
    });
  });
});
