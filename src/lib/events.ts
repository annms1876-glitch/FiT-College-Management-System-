/**
 * Tiny typed event bus for cross-shell UI events (mobile nav drawer).
 * Kept deliberately minimal — no external dependency.
 */
type Events = {
  'mobile-nav:toggle': void;
  'mobile-nav:close': void;
};

const listeners = new Map<keyof Events, Set<() => void>>();

export const uiBus = {
  on<K extends keyof Events>(event: K, handler: () => void) {
    const set = listeners.get(event) ?? new Set();
    set.add(handler);
    listeners.set(event, set);
    return () => set.delete(handler);
  },
  emit<K extends keyof Events>(event: K) {
    listeners.get(event)?.forEach((handler) => handler());
  },
};
