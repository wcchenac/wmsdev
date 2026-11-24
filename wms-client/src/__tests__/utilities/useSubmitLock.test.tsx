import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useSubmitLock } from '../../utilities/useSubmitLock';

const Harness: React.FC<{ onRun: () => Promise<unknown> | unknown }> = ({ onRun }) => {
  const { isLocked, isLockedRef, runLocked } = useSubmitLock();
  return (
    <button
      type="button"
      data-ref-locked={String(isLockedRef.current)}
      disabled={isLocked}
      onClick={() => void runLocked(onRun)}
    >
      {isLocked ? 'locked' : 'submit'}
    </button>
  );
};

describe('useSubmitLock', () => {
  test('blocks synchronous double invocations before React re-renders and resolves blocked calls to undefined', async () => {
    let resolveTask!: (val: string) => void;
    const task = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveTask = resolve;
        })
    );

    const results: Array<unknown> = [];
    const RefCheckHarness: React.FC = () => {
      const { isLocked, isLockedRef, runLocked } = useSubmitLock();
      return (
        <button
          type="button"
          disabled={isLocked}
          onClick={() => {
            expect(isLockedRef.current).toBe(false);
            void runLocked(task).then((v) => results.push(v));
            expect(isLockedRef.current).toBe(true);
            void runLocked(task).then((v) => results.push(v));
          }}
        >
          {isLocked ? 'locked' : 'submit'}
        </button>
      );
    };

    render(<RefCheckHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    expect(task).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'locked' })).toBeDisabled();

    await act(async () => {
      resolveTask('done');
    });

    expect(results).toContain('done');
    expect(results).toContain(undefined);
    expect(screen.getByRole('button', { name: 'submit' })).toBeEnabled();
  });

  test('releases the lock when task rejects asynchronously or throws synchronously', async () => {
    let rejectTask!: (err: Error) => void;
    const asyncRejectTask = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectTask = reject;
        })
    );

    let caughtAsync: unknown;
    const AsyncHarness: React.FC = () => {
      const { isLocked, runLocked } = useSubmitLock();
      return (
        <button
          type="button"
          disabled={isLocked}
          onClick={() => {
            runLocked(asyncRejectTask).catch((err) => {
              caughtAsync = err;
            });
          }}
        >
          {isLocked ? 'locked' : 'async'}
        </button>
      );
    };

    render(<AsyncHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'async' }));
    expect(screen.getByRole('button', { name: 'locked' })).toBeDisabled();

    await act(async () => {
      rejectTask(new Error('async boom'));
    });

    expect(caughtAsync).toBeInstanceOf(Error);
    expect(screen.getByRole('button', { name: 'async' })).toBeEnabled();

    const syncThrowTask = vi.fn(() => {
      throw new Error('sync boom');
    });
    let caughtSync: unknown;
    const ThrowHarness: React.FC = () => {
      const { isLocked, runLocked } = useSubmitLock();
      return (
        <button
          type="button"
          onClick={() => {
            runLocked(syncThrowTask).catch((err) => {
              caughtSync = err;
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

    expect(caughtSync).toBeInstanceOf(Error);
    expect(screen.getByRole('button', { name: 'trigger' })).toBeEnabled();
  });

  test('handles synchronous non-Promise tasks cleanly', async () => {
    const syncTask = vi.fn();
    render(<Harness onRun={syncTask} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    expect(syncTask).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'submit' })).toBeEnabled();
  });
});
