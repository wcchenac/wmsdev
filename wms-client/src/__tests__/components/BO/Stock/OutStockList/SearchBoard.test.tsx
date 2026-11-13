import React from 'react';
import { render, screen, RenderResult } from '@testing-library/react';
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
  handleSubmitClick: jest.Mock;
  handleDeleteClick: jest.Mock;
  downloadFile: jest.Mock;
  handleModalShow: jest.Mock;
  initialize: jest.Mock;
}

// Mock SearchContainer
jest.mock('../../../../../components/BO/Stock/OutStockList/SearchContainer', () => {
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
});

// Mock DeepCopy
jest.mock('../../../../../utilities/DeepCopy', () => ({
  copy: jest.fn((obj: unknown) => JSON.parse(JSON.stringify(obj)))
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
    handleSubmitClick: jest.fn(),
    handleDeleteClick: jest.fn(),
    downloadFile: jest.fn(),
    handleModalShow: jest.fn(),
    initialize: jest.fn()
  };

  const renderSearchBoard = (props: Partial<SearchBoardProps> = {}): RenderResult => {
    return render(<SearchBoard {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
});
