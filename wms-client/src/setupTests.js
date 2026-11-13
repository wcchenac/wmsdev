import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = {
  href: '',
  assign: jest.fn(),
  pathname: '/',
  search: '',
  hash: ''
};

// Mock window.URL.createObjectURL for file download tests
global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
global.URL.revokeObjectURL = jest.fn();

// Mock MutationObserver
global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, init) {}
  takeRecords() { return [] }
};

// Suppress console errors during tests (optional - can be removed for debugging)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Filter out expected React warnings in tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: An update to') ||
       args[0].includes('act(...)'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
  localStorageMock.clear.mockReset();
});

// Mock react-dnd-html5-backend to fix "SyntaxError: Cannot use import statement outside a module"
jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: {},
  getEmptyImage: () => {},
}));

// Mock react-sortable-tree (virtual mock since package may not be installed)
jest.mock('react-sortable-tree', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('div', null, 'SortableTree'),
    SortableTreeWithoutDndContext: () => React.createElement('div', null, 'SortableTreeWithoutDndContext'),
  };
}, { virtual: true });

// Mock react-loading-overlay (virtual mock since package is react-loading-overlay-ts)
jest.mock('react-loading-overlay', () => {
  const React = require('react');
  return function MockLoadingOverlay({ children, active }) {
    return React.createElement('div', { 'data-testid': 'loading-overlay', 'data-active': active }, children);
  };
}, { virtual: true });
