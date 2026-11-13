import React from 'react';
import { act, render, screen } from '@testing-library/react';
import Alert from '../../../components/UI/Alert';

describe('Alert', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('auto-closes after autoClose ms and calls onDismiss once', () => {
    const onDismiss = vi.fn();
    render(<Alert autoClose={1000} onDismiss={onDismiss}>Saved</Alert>);

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('a parent re-render with a new onDismiss does not restart the timer and the latest callback is used', () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(<Alert autoClose={1000} onDismiss={first}>Saved</Alert>);

    act(() => {
      vi.advanceTimersByTime(600);
    });
    rerender(<Alert autoClose={1000} onDismiss={latest}>Saved</Alert>);
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });
});
