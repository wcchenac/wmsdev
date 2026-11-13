import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// Testing Library only auto-cleans when the runner exposes a global afterEach
// before it is imported; register it explicitly so DOM never leaks between tests.
afterEach(() => {
  cleanup();
});

// react-bootstrap's Modal/Fade schedules a transitionend fallback (setTimeout; 5ms in jsdom,
// where transitions take 0s) and does not cancel it on unmount. When a file's last test opens
// or closes a modal and the environment is torn down within those 5ms, the timer fires without
// `document` and vitest reports an unhandled error (exit 1 although every test passed). Timers
// fire in deadline order, so waiting longer than that here lets them run while the DOM exists.
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: vi.fn(),
    pathname: '/',
    search: '',
    hash: '',
  },
  configurable: true,
  writable: true,
});

// Mock window.URL.createObjectURL for file download tests
window.URL.createObjectURL = vi.fn(() => 'blob:test-url');
window.URL.revokeObjectURL = vi.fn();

// Mock MutationObserver
globalThis.MutationObserver = class {
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof MutationObserver;

// Suppress expected React warnings in tests (remove for debugging)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
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
  vi.clearAllMocks();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
  localStorageMock.clear.mockReset();
});

