import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    // App already contains its own Provider and Router
    render(<App />);
    // App renders successfully
    expect(document.body).toBeInTheDocument();
  });
});
