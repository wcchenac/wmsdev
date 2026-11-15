import React from 'react';
import { render } from '@testing-library/react';

// The stored token is checked once, when the app starts and before the first render, so a
// page opened directly already finds the user signed in. It is not checked again on every
// render of App (React re-renders, StrictMode renders twice).

afterEach(() => {
  vi.doUnmock('../utilities/LocalStorageValidate');
  vi.doUnmock('../components/Layout/Header');
  vi.doUnmock('../App');
  vi.doUnmock('react-dom/client');
  vi.resetModules();
});

test('rendering App does not check the token', async () => {
  vi.resetModules();
  const validate = vi.fn();
  vi.doMock('../utilities/LocalStorageValidate', () => ({ default: validate }));
  vi.doMock('../components/Layout/Header', () => ({ default: () => <header /> }));
  const { default: App } = await import('../App');

  const { rerender } = render(<App />);
  rerender(<App />);

  expect(validate).not.toHaveBeenCalled();
});

test('index.tsx checks the token once, before the first render', async () => {
  vi.resetModules();
  const calls: string[] = [];
  vi.doMock('../utilities/LocalStorageValidate', () => ({ default: () => calls.push('validate') }));
  vi.doMock('../App', () => ({ default: () => null }));
  vi.doMock('react-dom/client', () => ({
    createRoot: () => ({ render: () => calls.push('render') }),
  }));
  document.body.innerHTML = '<div id="root"></div>';

  await import('../index');

  expect(calls).toEqual(['validate', 'render']);
});
