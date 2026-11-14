import React from 'react';
import { render, screen, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import FileCenter from '../../../../components/BO/File/FileCenter';

interface MockLoadingOverlayProps {
  children: React.ReactNode;
  active: boolean;
  spinner: React.ReactNode;
}

interface MockFileContainerProps {
  fileType: string;
  containerTitle: string;
}

interface MockFileContainerForCategoryProps {
  fileType: string;
}

interface StoreState {
  stockInfo: {
    stockInfoes: string[];
  };
}

// Mock LoadingOverlay - uses @achmadk/react-loading-overlay package
vi.mock('@achmadk/react-loading-overlay', () => ({ default: (() => {
  return function MockLoadingOverlay({ children, active }: MockLoadingOverlayProps): JSX.Element {
    return (
      <div data-testid="loading-overlay" data-active={active}>
        {active && <div data-testid="spinner">Loading...</div>}
        {children}
      </div>
    );
  };
})() }));

// Mock Spinner
vi.mock('../../../../components/Others/Spinner', () => ({
  Spinner: (): JSX.Element => <div data-testid="spinner-component">Spinner</div>
}));

// Mock FileContainer
vi.mock('../../../../components/BO/File/FileContainer', () => ({ default: (() => {
  return function MockFileContainer(props: MockFileContainerProps): JSX.Element {
    return (
      <div
        data-testid={`file-container-${props.fileType}`}
        data-title={props.containerTitle}
      >
        {props.containerTitle}
      </div>
    );
  };
})() }));

// Mock FileContainerForCategory
vi.mock('../../../../components/BO/File/FileContainerForCategory', () => ({ default: (() => {
  return function MockFileContainerForCategory(props: MockFileContainerForCategoryProps): JSX.Element {
    return (
      <div
        data-testid={`file-container-${props.fileType}`}
      >
        Category Detail Container
      </div>
    );
  };
})() }));

// Mock FileActions
vi.mock('../../../../actions/FileActions', () => ({
  queryFileCategoryTodayFile: vi.fn(() => Promise.resolve({ status: 200, data: 'test.xls' })),
  queryFileCategoryIntervalFiles: vi.fn(() => Promise.resolve({ status: 200, data: ['test1.xls', 'test2.xls'] })),
  queryCategoryDetailList: vi.fn(() => () => Promise.resolve()),
  downloadFile: vi.fn()
}));

const mockStore = configureMockStore([thunk]);

interface RenderFileCenterResult extends RenderResult {
  store: MockStoreEnhanced<unknown>;
}

const renderFileCenter = (storeState: Partial<StoreState> = {}): RenderFileCenterResult => {
  const defaultState: StoreState = {
    stockInfo: {
      stockInfoes: ['Category1', 'Category2']
    }
  };

  const store = mockStore({ ...defaultState, ...storeState });

  return {
    ...render(
      <Provider store={store}>
        <FileCenter />
      </Provider>
    ),
    store
  };
};

describe('FileCenter', () => {
  describe('rendering', () => {
    test('renders page title', () => {
      renderFileCenter();
      expect(screen.getByText('檔案下載')).toBeInTheDocument();
    });

    test('renders loading overlay', () => {
      renderFileCenter();
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });

    test('loading overlay is not active initially', () => {
      renderFileCenter();
      expect(screen.getByTestId('loading-overlay')).toHaveAttribute('data-active', 'false');
    });
  });

  describe('file containers', () => {
    test('renders allocation file container', () => {
      renderFileCenter();
      expect(screen.getByTestId('file-container-allocation')).toBeInTheDocument();
    });

    test('allocation container has correct title', () => {
      renderFileCenter();
      expect(screen.getByTestId('file-container-allocation')).toHaveAttribute('data-title', '每日倉庫調撥記錄');
    });

    test('renders adjustment file container', () => {
      renderFileCenter();
      expect(screen.getByTestId('file-container-adjustment')).toBeInTheDocument();
    });

    test('adjustment container has correct title', () => {
      renderFileCenter();
      expect(screen.getByTestId('file-container-adjustment')).toHaveAttribute('data-title', '每日存貨調整記錄');
    });

    test('renders daily comparison file container', () => {
      renderFileCenter();
      expect(screen.getByTestId('file-container-dailyComparison')).toBeInTheDocument();
    });

    test('daily comparison container has correct title', () => {
      renderFileCenter();
      expect(screen.getByTestId('file-container-dailyComparison')).toHaveAttribute('data-title', '每日庫存比對紀錄');
    });

    test('renders category detail file container', () => {
      renderFileCenter();
      expect(screen.getByTestId('file-container-categoryDetail')).toBeInTheDocument();
    });
  });

  describe('CSS structure', () => {
    test('has fileCenter container class', () => {
      const { container } = renderFileCenter();
      expect(container.querySelector('.fileCenter')).toBeInTheDocument();
    });

    test('has Bootstrap container', () => {
      const { container } = renderFileCenter();
      expect(container.querySelector('.container')).toBeInTheDocument();
    });

    test('has Bootstrap row for layout', () => {
      const { container } = renderFileCenter();
      const rows = container.querySelectorAll('.row');
      expect(rows.length).toBeGreaterThan(0);
    });
  });
});
