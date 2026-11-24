import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useSubmitLock } from '../../utilities/useSubmitLock';

const Harness: React.FC<{ onRun: () => Promise<void> | void }> = ({ onRun }) => {
  const { isLocked, runLocked } = useSubmitLock();
  return (
    <button type="button" disabled={isLocked} onClick={() => void runLocked(onRun)}>
      {isLocked ? 'locked' : 'submit'}
    </button>
  );
};

describe('useSubmitLock', () => {
  test('blocks synchronous double invocations before React re-renders disabled', async () => {
    let resolveTask!: () => void;
    const task = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveTask = resolve;
        })
    );

    render(<Harness onRun={task} />);
    const btn = screen.getByRole('button', { name: 'submit' });

    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(task).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'locked' })).toBeDisabled();

    await act(async () => {
      resolveTask();
    });

    expect(screen.getByRole('button', { name: 'submit' })).toBeEnabled();
  });

  test('releases the lock when task rejects or throws synchronously', async () => {
    const syncThrowTask = vi.fn(() => {
      throw new Error('sync boom');
    });

    let caught: unknown;
    const ThrowHarness: React.FC = () => {
      const { isLocked, runLocked } = useSubmitLock();
      return (
        <button
          type="button"
          onClick={() => {
            runLocked(syncThrowTask).catch((err) => {
              caught = err;
            });
          }}
        >
          {isLocked ? 'locked' : 'trigger'}
        </button>
      );
    };

    render(<ThrowHarness />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
    });

    expect(caught).toBeInstanceOf(Error);
    expect(screen.getByRole('button', { name: 'trigger' })).toBeEnabled();
  });
});
