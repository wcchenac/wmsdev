import React from 'react';
import { render } from '@testing-library/react';
import localStorageValidate from '../utilities/LocalStorageValidate';
import App from '../App';

// The stored token is checked once, when the app starts and before the first render
// (index.tsx: IndexStartup.test.tsx). It is not checked again on every render of App (React
// re-renders, StrictMode renders twice).

vi.mock('../utilities/LocalStorageValidate', () => ({ default: vi.fn() }));
vi.mock('../components/Layout/Header', () => ({ default: () => <header /> }));
// setupTests stubs window.location without an origin, which BrowserRouter needs once a route
// redirects; a MemoryRouter does not.
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <actual.MemoryRouter initialEntries={['/']}>{children}</actual.MemoryRouter>
    ),
  };
});

test('rendering App does not check the token', () => {
  const { rerender } = render(<App />);
  rerender(<App />);

  expect(localStorageValidate).not.toHaveBeenCalled();
});
