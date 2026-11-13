import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Calls `onUpdate(value)` when `value` changes after the component has mounted; the value
 * present at mount is ignored. This is the hooks form of reacting to a prop in
 * componentDidUpdate.
 *
 * The query pages share one Redux slice (state.stockInfo.stockInfoes). A plain useEffect
 * also runs on mount and would pick up whatever another page last stored there, so pages
 * use this to react only to results that arrive while they are on screen.
 */
export function useUpdateEffect<T>(value: T, onUpdate: (value: T) => void): void {
  const seen = useRef(value);
  const latestOnUpdate = useRef(onUpdate);

  // Keep the latest callback without re-running the effect when it changes.
  useLayoutEffect(() => {
    latestOnUpdate.current = onUpdate;
  });

  useEffect(() => {
    if (Object.is(seen.current, value)) {
      return;
    }
    seen.current = value;
    latestOnUpdate.current(value);
  }, [value]);
}
