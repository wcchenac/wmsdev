import type { Mock } from 'vitest';
import React, { createRef } from 'react';
import { act, fireEvent, render, screen, RenderResult } from '@testing-library/react';
import SearchBoard from '../../../../../components/BO/Stock/OutStockList/SearchBoard';

interface MockSearchContainerProps {
  index: number;
  date: string;
  outStockListFiltered?: unknown[];
}

interface QueryResultItem {
  id: number;
  productNo: string;
  createdBy: string;
  handled: boolean;
}

interface QueryResult {
  [date: string]: QueryResultItem[];
}

interface SelectedUserItem {
  user: string;
  selected: boolean;
}

interface SearchBoardProps {
  queryResult: QueryResult | undefined;
  selectedUserList: SelectedUserItem[];
  handleSubmitClick: Mock;
  handleDeleteClick: Mock;
  downloadFile: Mock;
  handleModalShow: Mock;
  initialize: Mock;
}

// Mock SearchContainer
vi.mock('../../../../../components/BO/Stock/OutStockList/SearchContainer', () => ({ default: (() => {
  return function MockSearchContainer(props: MockSearchContainerProps): JSX.Element {
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
      </div>
    );
  };
})() }));

// Mock DeepCopy
vi.mock('../../../../../utilities/DeepCopy', () => ({
  copy: vi.fn((obj: unknown) => JSON.parse(JSON.stringify(obj)))
}));

describe('SearchBoard', () => {
  const defaultProps: SearchBoardProps = {
    queryResult: {
      '2024-01-01': [
        { id: 1, productNo: 'PROD001', createdBy: 'user1', handled: false },
        { id: 2, productNo: 'PROD002', createdBy: 'user1', handled: true }
      ],
      '2024-01-02': [
        { id: 3, productNo: 'PROD003', createdBy: 'user2', handled: false }
      ]
    },
    selectedUserList: [
      { user: 'user1', selected: true },
      { user: 'user2', selected: true }
    ],
    handleSubmitClick: vi.fn(),
    handleDeleteClick: vi.fn(),
    downloadFile: vi.fn(),
    handleModalShow: vi.fn(),
    initialize: vi.fn()
  };

  const renderSearchBoard = (props: Partial<SearchBoardProps> = {}): RenderResult => {
    return render(<SearchBoard {...defaultProps} {...props} />);
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
          { user: 'user1', selected: true },
          { user: 'user2', selected: false }
        ]
      };
      renderSearchBoard(propsWithFilteredUser);
      // SearchContainer should receive filtered list
      expect(screen.getByTestId('search-container-0')).toBeInTheDocument();
    });

    test('shows empty when no users selected', () => {
      const propsNoUsers: Partial<SearchBoardProps> = {
        ...defaultProps,
        selectedUserList: [
          { user: 'user1', selected: false },
          { user: 'user2', selected: false }
        ]
      };
      renderSearchBoard(propsNoUsers);
      // Should still render but with empty filtered lists
      expect(screen.getByTestId('search-container-0')).toBeInTheDocument();
    });
  });

  describe('componentDidUpdate', () => {
    test('updates toBeSubmit when queryResult changes', () => {
      const { rerender } = renderSearchBoard();

      const newProps: SearchBoardProps = {
        ...defaultProps,
        queryResult: {
          '2024-01-03': [
            { id: 4, productNo: 'PROD004', createdBy: 'user1', handled: false }
          ]
        }
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
    test('changing whName does not mutate the previous toBeSubmit state', () => {
      const queryResult = defaultProps.queryResult;
      if (queryResult === undefined) {
        throw new Error('queryResult is required');
      }

      const ref = createRef<SearchBoard>();
      render(<SearchBoard ref={ref} {...defaultProps} queryResult={queryResult} />);
      const board = ref.current;
      if (board === null) {
        throw new Error('SearchBoard did not mount');
      }

      act(() => {
        board.setState({
          toBeSubmit: board.initialToBeSubmit(queryResult, defaultProps.selectedUserList)
        });
      });

      const before = board.state.toBeSubmit;
      expect(before['2024-01-01'][1].whName).toBe('');

      act(() => {
        board.handleToBeSubmitWHChange('2024-01-01', '內倉', 1);
      });

      expect(before['2024-01-01'][1].whName).toBe('');
      expect(before['2024-01-01'][1]).toEqual({ selected: true, whName: '' });
      expect(board.state.toBeSubmit).not.toBe(before);
      expect(board.state.toBeSubmit['2024-01-01']).not.toBe(before['2024-01-01']);
      expect(board.state.toBeSubmit['2024-01-01'][1].whName).toBe('內倉');
      expect(board.state.toBeSubmit['2024-01-01'][1].selected).toBe(true);
    });
  });

  describe('multi-date warehouse validation', () => {
    test('an empty warehouse on an earlier date keeps save disabled', () => {
      const ref = createRef<SearchBoard>();
      render(<SearchBoard ref={ref} {...defaultProps} />);
      const board = ref.current;
      if (board === null) {
        throw new Error('SearchBoard did not mount');
      }

      act(() => {
        board.setState({
          toBeSubmit: {
            '2024-01-01': { 1: { selected: true, whName: '' } },
            '2024-01-02': { 3: { selected: true, whName: '內倉' } },
          },
        });
      });

      expect(screen.getByRole('button', { name: '儲存' })).toBeDisabled();
    });

    test('save is enabled when every selected row has a warehouse', () => {
      const ref = createRef<SearchBoard>();
      render(<SearchBoard ref={ref} {...defaultProps} />);
      const board = ref.current;
      if (board === null) {
        throw new Error('SearchBoard did not mount');
      }

      act(() => {
        board.setState({
          toBeSubmit: {
            '2024-01-01': { 1: { selected: true, whName: '外倉' } },
            '2024-01-02': { 3: { selected: true, whName: '內倉' } },
          },
        });
      });

      expect(screen.getByRole('button', { name: '儲存' })).toBeEnabled();
    });

    test('save stays disabled when nothing is selected', () => {
      const ref = createRef<SearchBoard>();
      render(<SearchBoard ref={ref} {...defaultProps} />);
      const board = ref.current;
      if (board === null) {
        throw new Error('SearchBoard did not mount');
      }

      act(() => {
        board.setState({
          toBeSubmit: {
            '2024-01-01': { 1: { selected: false, whName: '內倉' } },
            '2024-01-02': { 3: { selected: false, whName: '外倉' } },
          },
        });
      });

      expect(screen.getByRole('button', { name: '儲存' })).toBeDisabled();
    });
  });

  describe('hidden rows', () => {
    test('a hidden row with an empty warehouse is not submitted', () => {
      const ref = createRef<SearchBoard>();
      render(
        <SearchBoard
          ref={ref}
          {...defaultProps}
          selectedUserList={[
            { user: 'user1', selected: true },
            { user: 'user2', selected: false },
          ]}
        />
      );
      const board = ref.current;
      if (board === null) {
        throw new Error('SearchBoard did not mount');
      }

      act(() => {
        board.setState({
          toBeSubmit: {
            '2024-01-01': { 1: { selected: true, whName: '內倉' } },
            '2024-01-02': { 3: { selected: true, whName: '' } },
          },
        });
      });

      const submit = screen.getByRole('button', { name: '儲存' });
      expect(submit).toBeEnabled();
      fireEvent.click(submit);

      expect(defaultProps.handleSubmitClick).toHaveBeenCalledWith({
        outStockUpdate: { '1': '內倉' },
      });
    });

    test('changing the user filter drops hidden rows before save', () => {
      const queryResult = defaultProps.queryResult;
      if (queryResult === undefined) {
        throw new Error('queryResult is required');
      }

      const ref = createRef<SearchBoard>();
      const { rerender } = render(<SearchBoard ref={ref} {...defaultProps} />);
      const board = ref.current;
      if (board === null) {
        throw new Error('SearchBoard did not mount');
      }

      act(() => {
        board.setState({
          toBeSubmit: board.initialToBeSubmit(queryResult, defaultProps.selectedUserList),
        });
      });
      act(() => {
        board.handleToBeSubmitWHChange('2024-01-01', '內倉', 1);
      });

      rerender(
        <SearchBoard
          ref={ref}
          {...defaultProps}
          selectedUserList={[
            { user: 'user1', selected: true },
            { user: 'user2', selected: false },
          ]}
        />
      );

      expect(board.state.toBeSubmit['2024-01-02']?.[3]).toBeUndefined();
      const submit = screen.getByRole('button', { name: '儲存' });
      expect(submit).toBeEnabled();
      fireEvent.click(submit);
      expect(defaultProps.handleSubmitClick).toHaveBeenCalledWith({
        outStockUpdate: { '1': '內倉' },
      });
    });
  });
});
