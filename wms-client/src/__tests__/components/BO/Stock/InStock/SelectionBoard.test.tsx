import React from 'react';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import SelectionBoard from '../../../../../components/BO/Stock/InStock/Common/SelectionBoard';

interface MockCheckBoxProps {
  index: number;
  productNo: string;
  checked: boolean;
  waitHandleStatus: Record<string, { quantity: string | number; unit: string }>;
  handleCheckBoxSelected: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
}

type SelectionBoardProps = React.ComponentProps<typeof SelectionBoard>;

// Mock CheckBoxForSelectionBoard
vi.mock('../../../../../components/BO/Stock/InStock/Common/CheckBoxForSelectionBoard', () => ({ default: (() => {
  return function MockCheckBoxForSelectionBoard(props: MockCheckBoxProps): React.JSX.Element {
    return (
      <div
        data-testid={`checkbox-${props.index}`}
        data-product-no={props.productNo}
        data-checked={props.checked}
      >
        <input
          type="checkbox"
          checked={props.checked}
          onChange={(e) => props.handleCheckBoxSelected(e, props.index)}
        />
        {props.productNo}
      </div>
    );
  };
})() }));

describe('SelectionBoard', () => {
  const defaultProps: SelectionBoardProps = {
    type: '進貨',
    orderNo: 'ORDER001',
    waitHandleStatus: {
      'PROD001': { 板卷: { quantity: '10', unit: '碼' } },
      'PROD002': { 板卷: { quantity: '5', unit: '碼' } }
    },
    selectedProductNoList: [
      { index: 0, productNo: 'PROD001', selected: false, isSubmitted: false },
      { index: 1, productNo: 'PROD002', selected: false, isSubmitted: false }
    ],
    handlePrevStep: vi.fn(),
    handleNextStep: vi.fn(),
    handleSelectionClick: vi.fn(),
    handleCheckBoxSelected: vi.fn()
  };

  const renderSelectionBoard = (props: Partial<SelectionBoardProps> = {}): RenderResult => {
    return render(<SelectionBoard {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders order number', () => {
      renderSelectionBoard();
      expect(screen.getByText('進貨單號: ORDER001')).toBeInTheDocument();
    });

    test('renders instruction text', () => {
      renderSelectionBoard();
      expect(screen.getByText('含有以下貨號，請選擇此次欲入庫貨號')).toBeInTheDocument();
    });

    test('renders prev button', () => {
      renderSelectionBoard();
      expect(screen.getByRole('button', { name: '上一步' })).toBeInTheDocument();
    });

    test('renders next button', () => {
      renderSelectionBoard();
      expect(screen.getByRole('button', { name: '下一步' })).toBeInTheDocument();
    });

    test('renders select all button', () => {
      renderSelectionBoard();
      expect(screen.getByRole('button', { name: '全選' })).toBeInTheDocument();
    });

    test('renders deselect all button', () => {
      renderSelectionBoard();
      expect(screen.getByRole('button', { name: '取消全選' })).toBeInTheDocument();
    });

    test('renders all product checkboxes', () => {
      renderSelectionBoard();
      expect(screen.getByTestId('checkbox-0')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    });
  });

  describe('next button state', () => {
    test('next button is disabled when no products selected', () => {
      renderSelectionBoard();
      const nextButton = screen.getByRole('button', { name: '下一步' });
      expect(nextButton).toBeDisabled();
    });

    test('next button is enabled when at least one product is selected', () => {
      const propsWithSelection: Partial<SelectionBoardProps> = {
        ...defaultProps,
        selectedProductNoList: [
          { index: 0, productNo: 'PROD001', selected: true, isSubmitted: false },
          { index: 1, productNo: 'PROD002', selected: false, isSubmitted: false }
        ]
      };
      renderSelectionBoard(propsWithSelection);
      const nextButton = screen.getByRole('button', { name: '下一步' });
      expect(nextButton).not.toBeDisabled();
    });

    test('next button is enabled when all products are selected', () => {
      const propsAllSelected: Partial<SelectionBoardProps> = {
        ...defaultProps,
        selectedProductNoList: [
          { index: 0, productNo: 'PROD001', selected: true, isSubmitted: false },
          { index: 1, productNo: 'PROD002', selected: true, isSubmitted: false }
        ]
      };
      renderSelectionBoard(propsAllSelected);
      const nextButton = screen.getByRole('button', { name: '下一步' });
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('button clicks', () => {
    test('calls handlePrevStep when prev button clicked', () => {
      renderSelectionBoard();
      fireEvent.click(screen.getByRole('button', { name: '上一步' }));
      expect(defaultProps.handlePrevStep).toHaveBeenCalled();
    });

    test('calls handleNextStep when next button clicked', () => {
      const propsWithSelection: Partial<SelectionBoardProps> = {
        ...defaultProps,
        selectedProductNoList: [
          { index: 0, productNo: 'PROD001', selected: true, isSubmitted: false }
        ]
      };
      renderSelectionBoard(propsWithSelection);
      fireEvent.click(screen.getByRole('button', { name: '下一步' }));
      expect(defaultProps.handleNextStep).toHaveBeenCalled();
    });

    test('calls handleSelectionClick with true when select all clicked', () => {
      renderSelectionBoard();
      fireEvent.click(screen.getByRole('button', { name: '全選' }));
      expect(defaultProps.handleSelectionClick).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: 'true' })
        })
      );
    });

    test('calls handleSelectionClick with false when deselect all clicked', () => {
      renderSelectionBoard();
      fireEvent.click(screen.getByRole('button', { name: '取消全選' }));
      expect(defaultProps.handleSelectionClick).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: 'false' })
        })
      );
    });
  });

  describe('checkbox rendering', () => {
    test('renders checkboxes with correct product numbers', () => {
      renderSelectionBoard();
      expect(screen.getByTestId('checkbox-0')).toHaveAttribute('data-product-no', 'PROD001');
      expect(screen.getByTestId('checkbox-1')).toHaveAttribute('data-product-no', 'PROD002');
    });

    test('renders checkboxes with correct checked state', () => {
      const propsWithSelection: Partial<SelectionBoardProps> = {
        ...defaultProps,
        selectedProductNoList: [
          { index: 0, productNo: 'PROD001', selected: true, isSubmitted: false },
          { index: 1, productNo: 'PROD002', selected: false, isSubmitted: false }
        ]
      };
      renderSelectionBoard(propsWithSelection);
      expect(screen.getByTestId('checkbox-0')).toHaveAttribute('data-checked', 'true');
      expect(screen.getByTestId('checkbox-1')).toHaveAttribute('data-checked', 'false');
    });

    test('calls handleCheckBoxSelected with change event and row index when checkbox toggled', () => {
      renderSelectionBoard();
      const firstInput = screen.getByTestId('checkbox-0').querySelector('input[type="checkbox"]')!;
      const secondInput = screen.getByTestId('checkbox-1').querySelector('input[type="checkbox"]')!;

      fireEvent.click(firstInput);
      expect(defaultProps.handleCheckBoxSelected).toHaveBeenCalledWith(expect.any(Object), 0);

      fireEvent.click(secondInput);
      expect(defaultProps.handleCheckBoxSelected).toHaveBeenCalledWith(expect.any(Object), 1);
    });
  });

  describe('CSS structure', () => {
    test('has scrollbar container', () => {
      const { container } = renderSelectionBoard();
      expect(container.querySelector('.scrollbar-65')).toBeInTheDocument();
    });

    test('has Bootstrap container', () => {
      const { container } = renderSelectionBoard();
      expect(container.querySelector('.container')).toBeInTheDocument();
    });
  });
});
