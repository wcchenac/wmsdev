import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all the components that require complex routing or external dependencies
vi.mock('./utilities/LocalStorageValidate', () => ({ default: vi.fn() }));
vi.mock('./components/Layout/Header', () => ({ default: function MockHeader() {
  return <header data-testid="mock-header">Header</header>;
} }));

// Mock react-router's BrowserRouter to use MemoryRouter
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
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
