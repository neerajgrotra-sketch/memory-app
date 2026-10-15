import { useSyncExternalStore } from 'react';

/**
 * Dev-only switch for the layout overlay (boxes, slot grid, bands and thirds drawn over the picture).
 * Kept in memory for the session so it stays on from one picture to the next.
 */
let on = false;
const listeners = new Set<() => void>();

export function toggleLayoutOverlay() {
  on = !on;
  listeners.forEach((l) => l());
}

export function useLayoutOverlay(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => on && __DEV__,
  );
}
