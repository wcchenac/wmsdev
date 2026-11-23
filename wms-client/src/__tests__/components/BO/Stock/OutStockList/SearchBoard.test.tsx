import React from 'react';
import { fireEvent, render, screen, RenderResult } from '@testing-library/react';
import SearchBoard from '../../../../../components/BO/Stock/OutStockList/SearchBoard';
import { OutStockInfo } from '../../../../../components/BO/Stock/OutStockList/SearchInfo';

interface MockSearchContainerProps {
  index: number;
  date: string;
  outStockListFiltered?: Array<{ id: number; handled: boolean }>;
  toBeSubmit?: Record<string, { selected: boolean; whName: string }>;
  allSelectMethod: (date: string, selected: boolean) => void;
  handleToBeSubmitChange: (date: string, checked: boolean, id: number) => void;
  handleToBeSubmitWHChange: (date: string, value: string, id: number) => void;
}

type BoardProps = React.ComponentProps<typeof SearchBoard>;
type QueryResult = BoardProps['queryResult'];
// SearchBoard renders nothing for an undefined queryResult, which one test checks.
type SearchBoardProps = Omit<BoardProps, 'queryResult'> & { queryResult: QueryResult | undefined };

// The fixtures carry only the fields these tests read; SearchBoard's OutStockInfo has more.
const queryResultFixture = (value: Record<string, Partial<OutStockInfo>[]>): QueryResult =>
  value as QueryResult;

// Mock SearchContainer with minimal controls so tests drive warehouse/selection state via UI events
vi.mock('../../../../../components/BO/Stock/OutStockList/SearchContainer', () => ({ default: (() => {
  return function MockSearchContainer(props: MockSearchContainerProps): React.JSX.Element {
    return (
      <div
        data-testid={`search-container-${props.index}`}
        data-date={props.date}
        className={props.index === 0 ? 'tab-pane fade show active' : 'tab-pane fade'}
      >
        Search Container for {props.date}
        <span data-testid={`item-count-${props.index}`}>
          {props.outStockListFiltered?.length || 0} items
        </span>
        <button
          type="button"
          onClick={() => props.allSelectMethod(props.date, false)}
        >
          unselect-all-{props.date}
        </button>
        {(props.outStockListFiltered ?? []).filter((r) => !r.handled).map((row) => (
          <div key={row.id}>
            <select
              aria-label={`wh-${props.date}-${row.id}`}
              value={props.toBeSubmit?.[row.id]?.whName ?? ''}
              onChange={(e) => props.handleToBeSubmitWHChange(props.date, e.target.value, row.id)}
            >
              <option value="">請選擇...</option>
              <option value="內倉">內倉</option>
              <option value="外倉">外倉</option>
            </select>
            <input
              type="checkbox"
              aria-label={`select-${props.date}-${row.id}`}
              checked={props.toBeSubmit?.[row.id]?.selected ?? false}
              onChange={(e) =>
                props.handleToBeSubmitChange(props.date, !e.target.checked, row.id)
              }
            />
          </div>
        ))}
      </div>
    );
  };
})() }));

describe('SearchBoard', () => {
  const defaultProps: BoardProps = {
    queryResult: queryResultFixture({
      '2024-01-01': [
        { id: 1, productNo: 'PROD001', createdBy: 'user1', handled: false },
        { id: 2, productNo: 'PROD002', createdBy: 'user1', handled: true }
      ],
      '2024-01-02': [
        { id: 3, productNo: 'PROD003', createdBy: 'user2', handled: false }
      ]
    }),
    selectedUserList: [
      { user: 'user1', selected: true, index: 0 },
      { user: 'user2', selected: true, index: 1 }
    ],
    handleSubmitClick: vi.fn(),
    handleDeleteClick: vi.fn(),
    downloadFile: vi.fn(),
    handleModalShow: vi.fn(),
    initialize: vi.fn()
  };

  const renderSearchBoard = (props: Partial<SearchBoardProps> = {}): RenderResult => {
    return render(<SearchBoard {...({ ...defaultProps, ...props } as BoardProps)} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('returns null when queryResult is undefined', () => {
      const { container } = renderSearchBoard({ queryResult: undefined });
      expect(container.firstChild).toBeNull();
    });

    test('renders submit button', () => {
      renderSearchBoard();
      expect(screen.getByRole('button', { name: '儲存' })).toBeInTheDocument();
    });

    test('renders date tabs', () => {
      renderSearchBoard();
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
      expect(screen.getByText('2024-01-02')).toBeInTheDocument();
    });

    test('renders SearchContainer for each date', () => {
      renderSearchBoard();
      expect(screen.getByTestId('search-container-0')).toBeInTheDocument();
      expect(screen.getByTestId('search-container-1')).toBeInTheDocument();
    });

    test('first tab is active by default', () => {
      renderSearchBoard();
      const firstTab = screen.getByText('2024-01-01');
      expect(firstTab).toHaveClass('active');
    });
  });

  describe('tab navigation', () => {
    test('renders correct number of tabs', () => {
      renderSearchBoard();
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);
    });

    test('tabs are sorted by date', () => {
      renderSearchBoard();
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveTextContent('2024-01-01');
      expect(tabs[1]).toHaveTextContent('2024-01-02');
    });
  });

  describe('submit button state', () => {
    test('submit button is initially disabled', () => {
      renderSearchBoard();
      const submitButton = screen.getByRole('button', { name: '儲存' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('user filtering', () => {
    test('filters results by selected users', () => {
      const propsWithFilteredUser: Partial<SearchBoardProps> = {
        ...defaultProps,
        selectedUserList: [
          { user: 'user1', selected: true, index: 0 },
          { user: 'user2', selected: false, index: 1 }
        ]
      };
      renderSearchBoard(propsWithFilteredUser);
      expect(screen.getByTestId('item-count-0')).toHaveTextContent('2 items');
      expect(screen.getByTestId('item-count-1')).toHaveTextContent('0 items');
    });

    test('shows empty when no users selected', () => {
      const propsNoUsers: Partial<SearchBoardProps> = {
        ...defaultProps,
        selectedUserList: [
          { user: 'user1', selected: false, index: 0 },
          { user: 'user2', selected: false, index: 1 }
        ]
      };
      renderSearchBoard(propsNoUsers);
      expect(screen.getByTestId('item-count-0')).toHaveTextContent('0 items');
      expect(screen.getByTestId('item-count-1')).toHaveTextContent('0 items');
    });
  });

  describe('updates', () => {
    test('updates toBeSubmit when queryResult changes', () => {
      const { rerender } = renderSearchBoard();

      const newProps: BoardProps = {
        ...defaultProps,
        queryResult: queryResultFixture({
          '2024-01-03': [
            { id: 4, productNo: 'PROD004', createdBy: 'user1', handled: false }
          ]
        })
      };

      rerender(<SearchBoard {...newProps} />);
      expect(screen.getByText('2024-01-03')).toBeInTheDocument();
    });
  });

  describe('CSS structure', () => {
    test('has nav-pills container', () => {
      const { container } = renderSearchBoard();
      expect(container.querySelector('.nav-pills')).toBeInTheDocument();
    });

    test('has tab-content container', () => {
      const { container } = renderSearchBoard();
      expect(container.querySelector('.tab-content')).toBeInTheDocument();
    });

    test('submit button has Bootstrap classes', () => {
      renderSearchBoard();
      const button = screen.getByRole('button', { name: '儲存' });
      expect(button).toHaveClass('btn', 'btn-primary');
    });
  });

  describe('empty state', () => {
    test('handles empty queryResult object', () => {
      renderSearchBoard({ queryResult: {} });
      expect(screen.getByRole('button', { name: '儲存' })).toBeInTheDocument();
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });
  });

  describe('warehouse change', () => {
    test('changing whName updates that row without affecting other rows', () => {
      renderSearchBoard();

      const wh1 = screen.getByLabelText<HTMLSelectElement>('wh-2024-01-01-1');
      const wh3 = screen.getByLabelText<HTMLSelectElement>('wh-2024-01-02-3');
      expect(wh1.value).toBe('');
      expect(wh3.value).toBe('');

      fireEvent.change(wh1, { target: { value: '內倉' } });

      expect(wh1.value).toBe('內倉');
      expect(wh3.value).toBe('');
    });
  });

  describe('multi-date warehouse validation', () => {
    test('an empty warehouse on an earlier date keeps save disabled', () => {
      renderSearchBoard();

      fireEvent.change(screen.getByLabelText('wh-2024-01-02-3'), { target: { value: '內倉' } });

      expect(screen.getByRole('button', { name: '儲存' })).toBeDisabled();
    });

    test('save is enabled when every selected row has a warehouse', () => {
      renderSearchBoard();

      fireEvent.change(screen.getByLabelText('wh-2024-01-01-1'), { target: { value: '外倉' } });
      fireEvent.change(screen.getByLabelText('wh-2024-01-02-3'), { target: { value: '內倉' } });

      expect(screen.getByRole('button', { name: '儲存' })).toBeEnabled();
    });

    test('save stays disabled when nothing is selected', () => {
      renderSearchBoard();

      fireEvent.change(screen.getByLabelText('wh-2024-01-01-1'), { target: { value: '內倉' } });
      fireEvent.change(screen.getByLabelText('wh-2024-01-02-3'), { target: { value: '外倉' } });
      fireEvent.click(screen.getByRole('button', { name: 'unselect-all-2024-01-01' }));
      fireEvent.click(screen.getByRole('button', { name: 'unselect-all-2024-01-02' }));

      expect(screen.getByRole('button', { name: '儲存' })).toBeDisabled();
    });
  });

  describe('hidden rows', () => {
    test('a hidden row with an empty warehouse is not submitted', () => {
      renderSearchBoard({
        selectedUserList: [
          { user: 'user1', selected: true, index: 0 },
          { user: 'user2', selected: false, index: 1 },
        ],
      });

      fireEvent.change(screen.getByLabelText('wh-2024-01-01-1'), { target: { value: '內倉' } });

      const submit = screen.getByRole('button', { name: '儲存' });
      expect(submit).toBeEnabled();
      fireEvent.click(submit);

      expect(defaultProps.handleSubmitClick).toHaveBeenCalledWith({
        outStockUpdate: { '1': '內倉' },
      });
    });

    test('changing the user filter drops hidden rows before save', () => {
      const { rerender } = renderSearchBoard();

      fireEvent.change(screen.getByLabelText('wh-2024-01-01-1'), { target: { value: '內倉' } });

      rerender(
        <SearchBoard
          {...defaultProps}
          selectedUserList={[
            { user: 'user1', selected: true, index: 0 },
            { user: 'user2', selected: false, index: 1 },
          ]}
        />
      );

      expect(screen.queryByLabelText('wh-2024-01-02-3')).not.toBeInTheDocument();
      const submit = screen.getByRole('button', { name: '儲存' });
      expect(submit).toBeEnabled();
      fireEvent.click(submit);
      expect(defaultProps.handleSubmitClick).toHaveBeenCalledWith({
        outStockUpdate: { '1': '內倉' },
      });
    });

    test('updating non-empty queryResult preserves unsaved warehouse selections for existing rows', () => {
      const { rerender } = renderSearchBoard();

      fireEvent.change(screen.getByLabelText('wh-2024-01-01-1'), { target: { value: '內倉' } });

      const updatedQueryResult = queryResultFixture({
        ...defaultProps.queryResult,
        '2024-01-02': [
          ...(defaultProps.queryResult['2024-01-02'] ?? []),
          { id: 99, productNo: 'PROD099', createdBy: 'user1', handled: false, outStockType: 1 },
        ],
      });

      rerender(<SearchBoard {...defaultProps} queryResult={updatedQueryResult} />);

      expect(screen.getByLabelText<HTMLSelectElement>('wh-2024-01-01-1').value).toBe('內倉');
      expect(screen.getByLabelText<HTMLInputElement>('select-2024-01-02-99').checked).toBe(true);
    });
  });
});
