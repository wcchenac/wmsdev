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

// Reset mocks and restore real timers between tests
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
  localStorageMock.clear.mockReset();
});

