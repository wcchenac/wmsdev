import { MutableRefObject, useCallback, useRef, useState } from 'react';

export interface SubmitLock {
  /** Reactive lock state for disabling buttons / showing loading UI. */
  isLocked: boolean;
  /** Synchronous lock flag, readable inside event handlers before re-render. */
  isLockedRef: MutableRefObject<boolean>;
  /**
   * Acquires the lock synchronously and invokes `task`. Concurrent calls while the lock is
   * held are ignored and resolve to `undefined`. Always releases the lock when `task` settles.
   */
  runLocked: <T>(task: () => Promise<T> | T) => Promise<T | undefined>;
}

/**
 * Prevents duplicate submissions caused by rapid double-clicks or repeated Enter presses
 * before React re-renders `disabled` states.
 */
export function useSubmitLock(): SubmitLock {
  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(false);

  const runLocked = useCallback(
    <T,>(task: () => Promise<T> | T): Promise<T | undefined> => {
      if (isLockedRef.current) {
        return Promise.resolve(undefined);
      }

      isLockedRef.current = true;
      setIsLocked(true);

      const release = () => {
        isLockedRef.current = false;
        setIsLocked(false);
      };

      let result: Promise<T> | T;
      try {
        result = task();
      } catch (err) {
        release();
        return Promise.reject(err);
      }

      return Promise.resolve(result).finally(release);
    },
    []
  );

  return { isLocked, isLockedRef, runLocked };
}
