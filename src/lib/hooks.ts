import { useCallback, useEffect, useRef, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initial;
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — degrade gracefully */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

/** Hash router: #/path?key=value */
export interface Route {
  path: string;
  query: URLSearchParams;
}

const parse = (): Route => {
  if (typeof window === 'undefined') return { path: '/dashboard', query: new URLSearchParams() };
  const raw = window.location.hash.replace(/^#/, '') || '/dashboard';
  const [path, qs = ''] = raw.split('?');
  return { path: path || '/dashboard', query: new URLSearchParams(qs) };
};

export function useRoute() {
  const [route, setRoute] = useState<Route>(parse);

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('hashchange', onChange);
    if (!window.location.hash) window.location.hash = '#/dashboard';
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (typeof window === 'undefined') return;
  const hash = to.startsWith('#') ? to : `#${to.startsWith('/') ? '' : '/'}${to}`;
  if (window.location.hash === hash) return;
  if (opts.replace) {
    window.history.replaceState(null, '', hash);
    const EventCtor = typeof window.HashChangeEvent === 'function' ? window.HashChangeEvent : window.Event;
    window.dispatchEvent(new EventCtor('hashchange'));
  } else {
    window.location.hash = hash;
  }
}

export function useIdleCallback(cb: () => void, delay: number) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    const t = window.setTimeout(() => ref.current(), delay);
    return () => window.clearTimeout(t);
  }, [delay]);
}

export function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

export function useDebounced<T>(value: T, delay = 180) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      return true;
    } catch {
      return false;
    }
  }, []);
  return { copied, copy };
}
