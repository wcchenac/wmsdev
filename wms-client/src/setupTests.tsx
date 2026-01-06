// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import React from 'react';
import '@testing-library/jest-dom';

// Mock for react-loading-overlay-ts
jest.mock('react-loading-overlay-ts', () => {
  return function LoadingOverlay({ children, active }: { children: React.ReactNode; active: boolean }) {
    return <div data-testid="loading-overlay" data-active={active}>{children}</div>;
  };
});

// Mock for react-loader-spinner
jest.mock('react-loader-spinner', () => ({
  ThreeDots: () => <div data-testid="spinner">Loading...</div>
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
