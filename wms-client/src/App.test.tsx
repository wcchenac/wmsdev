import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all the components that require complex routing or external dependencies
jest.mock('./utilities/LocalStorageValidate', () => jest.fn());
jest.mock('./components/Layout/Header', () => function MockHeader() {
  return <header data-testid="mock-header">Header</header>;
});

// Mock react-router-dom's BrowserRouter to use MemoryRouter
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <actual.MemoryRouter initialEntries={['/']}>{children}</actual.MemoryRouter>
    )
  };
});

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // App renders successfully with mocked header
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });
});
