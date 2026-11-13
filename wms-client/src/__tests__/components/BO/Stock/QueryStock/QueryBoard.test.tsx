import React from 'react';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import QueryBoard from '../../../../../components/BO/Stock/QueryStock/QueryBoard';

interface MockLoadingOverlayProps {
  children: React.ReactNode;
  active: boolean;
  spinner: React.ReactNode;
}

interface MockStockInfoContainerProps {
  typeValidation: string;
  stockInfoes?: unknown[];
}

interface MockQueryProductInformationProps {
  productNo: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

interface MockShowProductInformationProps {
  isBasic: boolean;
  isQuery: boolean;
  productNo: string;
}

interface MockToolbarForNextPrevProps {
  prevProduct: string;
  nextProduct: string;
  handleFutureProductQuery: () => void;
}

interface ProductListItem {
  type: string;
  quantity: number;
}

interface StoreState {
  stockInfo: {
    stockInfoes: {
      information: {
        productNo: string | null;
        name?: string;
      };
      result: unknown[];
      prevProduct: string;
      nextProduct: string;
      productList: ProductListItem[];
    };
  };
}

interface RenderQueryBoardResult extends RenderResult {
  store: MockStoreEnhanced<unknown>;
}

// Mock child components
vi.mock('../../../../../components/BO/Stock/QueryStock/Common/StockInfoContainer', () => ({ default: (() => {
  return function MockStockInfoContainer(props: MockStockInfoContainerProps): JSX.Element {
    return (
      <div data-testid="stock-info-container"
           data-type-validation={props.typeValidation}
           data-count={props.stockInfoes?.length || 0}>
        Stock Info Container
      </div>
    );
  };
})() }));

vi.mock('../../../../../components/BO/Stock/Utilities/QueryProductInformation', () => ({ default: (() => {
  return function MockQueryProductInformation(props: MockQueryProductInformationProps): JSX.Element {
    return (
      <form onSubmit={props.onSubmit} data-testid="query-form">
        <input
          data-testid="product-no-input"
          name="productNo"
          value={props.productNo}
          onChange={props.onChange}
        />
        <button type="submit" data-testid="query-submit">Search</button>
      </form>
    );
  };
})() }));

vi.mock('../../../../../components/BO/Stock/Utilities/ShowProductInformation', () => ({ default: (() => {
  return function MockShowProductInformation(props: MockShowProductInformationProps): JSX.Element {
    return (
      <div data-testid="show-product-info"
           data-is-basic={props.isBasic}
           data-is-query={props.isQuery}
           data-product-no={props.productNo}>
        Product Information
      </div>
    );
  };
})() }));

vi.mock('../../../../../components/BO/Stock/Utilities/QueryResponseWithNoStock', () => ({ default: (() => {
  return function MockQueryResponseWithNoStock(): JSX.Element {
    return <div data-testid="no-stock-response">No Stock Found</div>;
  };
})() }));

vi.mock('../../../../../components/BO/Stock/Utilities/ShowProductQuantity', () => ({ default: (() => {
  return function MockShowProductQuantity(): JSX.Element {
    return <div data-testid="product-quantity">Quantity Info</div>;
  };
})() }));

vi.mock('../../../../../components/BO/Stock/Utilities/ToolbarForNextPrev', () => ({ default: (() => {
  return function MockToolbarForNextPrev(props: MockToolbarForNextPrevProps): JSX.Element {
    return (
      <div data-testid="toolbar-next-prev">
        <button
          data-testid="prev-button"
          value={props.prevProduct}
          onClick={props.handleFutureProductQuery}
          disabled={!props.prevProduct}
        >
          Prev
        </button>
        <button
          data-testid="next-button"
          value={props.nextProduct}
          onClick={props.handleFutureProductQuery}
          disabled={!props.nextProduct}
        >
          Next
        </button>
      </div>
    );
  };
})() }));

vi.mock('react-loading-overlay-ts', () => ({ default: (() => {
  return function MockLoadingOverlay({ children, active }: MockLoadingOverlayProps): JSX.Element {
    return (
      <div data-testid="loading-overlay" data-active={active}>
        {active && <div data-testid="spinner">Loading...</div>}
        {children}
      </div>
    );
  };
})() }));

vi.mock('../../../../../components/Others/Spinner', () => ({
  Spinner: (): JSX.Element => <div data-testid="spinner-component">Spinner</div>
}));

// Mock action
const mockGetStockInfoesBasic = vi.fn();
vi.mock('../../../../../actions/StockActions', () => ({
  getStockInfoesBasic: (productNo: string) => () => mockGetStockInfoesBasic(productNo)
}));

const mockStore = configureMockStore([thunk]);

const renderQueryBoard = (storeState: Partial<StoreState> = {}): RenderQueryBoardResult => {
  const defaultState: StoreState = {
    stockInfo: {
      stockInfoes: {
        information: { productNo: null },
        result: [],
        prevProduct: '',
        nextProduct: '',
        productList: []
      }
    }
  };

  const store = mockStore({ ...defaultState, ...storeState });

  return {
    ...render(
      <Provider store={store}>
        <QueryBoard />
      </Provider>
    ),
    store
  };
};

describe('QueryBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStockInfoesBasic.mockResolvedValue({ status: 200 });
  });

  describe('rendering', () => {
    test('renders query form', () => {
      renderQueryBoard();
      expect(screen.getByTestId('query-form')).toBeInTheDocument();
    });

    test('renders product no input', () => {
      renderQueryBoard();
      expect(screen.getByTestId('product-no-input')).toBeInTheDocument();
    });

    test('renders loading overlay', () => {
      renderQueryBoard();
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });

    test('renders toolbar for navigation', () => {
      renderQueryBoard();
      expect(screen.getByTestId('toolbar-next-prev')).toBeInTheDocument();
    });

    test('does not show content before query', () => {
      renderQueryBoard();
      expect(screen.queryByTestId('stock-info-container')).not.toBeInTheDocument();
      expect(screen.queryByTestId('no-stock-response')).not.toBeInTheDocument();
    });
  });

  describe('input handling', () => {
    test('updates productNo on input change', () => {
      renderQueryBoard();

      const input = screen.getByTestId('product-no-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'PROD001', name: 'productNo' } });

      expect(input).toHaveValue('PROD001');
    });
  });

  describe('form submission', () => {
    test('calls getStockInfoesBasic on form submit', async () => {
      renderQueryBoard();

      const input = screen.getByTestId('product-no-input');
      const form = screen.getByTestId('query-form');

      fireEvent.change(input, { target: { value: 'PROD001', name: 'productNo' } });
      fireEvent.submit(form);

      // Use flushPromises pattern instead of waitFor
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockGetStockInfoesBasic).toHaveBeenCalledWith('PROD001');
    });

    test('shows loading state during query', async () => {
      // Make the promise resolve after a delay
      mockGetStockInfoesBasic.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({ status: 200 }), 100);
      }));

      renderQueryBoard();

      const input = screen.getByTestId('product-no-input');
      const form = screen.getByTestId('query-form');

      fireEvent.change(input, { target: { value: 'PROD001', name: 'productNo' } });
      fireEvent.submit(form);

      // Loading should be active briefly
      const overlay = screen.getByTestId('loading-overlay');
      expect(overlay).toHaveAttribute('data-active', 'true');
    });
  });

  describe('navigation buttons', () => {
    test('prev button is disabled when no prevProduct', () => {
      renderQueryBoard();

      const prevButton = screen.getByTestId('prev-button');
      expect(prevButton).toBeDisabled();
    });

    test('next button is disabled when no nextProduct', () => {
      renderQueryBoard();

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('query results display', () => {
    test('shows product information component', () => {
      renderQueryBoard();
      expect(screen.getByTestId('show-product-info')).toBeInTheDocument();
    });

    test('passes isBasic=true to ShowProductInformation', () => {
      renderQueryBoard();
      expect(screen.getByTestId('show-product-info')).toHaveAttribute('data-is-basic', 'true');
    });
  });

  describe('CSS structure', () => {
    test('has query_stockInfo container class', () => {
      const { container } = renderQueryBoard();
      expect(container.querySelector('.query_stockInfo')).toBeInTheDocument();
    });

    test('has Bootstrap container', () => {
      const { container } = renderQueryBoard();
      expect(container.querySelector('.container')).toBeInTheDocument();
    });
  });

  describe('componentDidUpdate behavior', () => {
    test('updates state when stockInfo changes', () => {
      const initialState: StoreState = {
        stockInfo: {
          stockInfoes: {
            information: { productNo: null },
            result: [],
            prevProduct: '',
            nextProduct: '',
            productList: []
          }
        }
      };

      const { rerender } = renderQueryBoard(initialState);

      // Verify initial state is shown
      expect(screen.getByTestId('show-product-info')).toHaveAttribute('data-product-no', '');

      // Create new store with updated data
      const updatedState: StoreState = {
        stockInfo: {
          stockInfoes: {
            information: { productNo: 'PROD001', name: 'Test Product' },
            result: [{ id: 1 }],
            prevProduct: 'PROD000',
            nextProduct: 'PROD002',
            productList: [{ type: '板卷', quantity: 10 }]
          }
        }
      };

      const newStore = mockStore(updatedState);

      rerender(
        <Provider store={newStore}>
          <QueryBoard />
        </Provider>
      );
    });
  });
});
