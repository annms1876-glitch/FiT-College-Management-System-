import { useCallback, useEffect, useRef, useState } from 'react';

/* -------------------------------------------------------------------------- */
/*  Backend seam                                                              */
/* -------------------------------------------------------------------------- */
/**
 * The portal is built against a tiny repository contract so it can run fully
 * client-side today and be pointed at any open-source BaaS tomorrow.
 *
 *   Appwrite    → Databases API (collections mirror the Collection names below)
 *   PocketBase  → /api/collections/{collection}/records
 *   Supabase    → Postgres tables + RLS, called through /rest/v1/{collection}
 *   Parse/Baasbox/Nhost → identical CRUD surface
 *
 * To go live, implement `createHttpDriver()` below and return it from
 * `resolveDriver()`. No page or component needs to change: they only ever
 * touch `useCollection()` and the mutation helpers in AppStore.
 */
export type Collection =
  | 'students'
  | 'faculty'
  | 'assignments'
  | 'timetable'
  | 'scholarships'
  | 'fee_structures'
  | 'payments'
  | 'grievances'
  | 'tickets'
  | 'resources'
  | 'exams'
  | 'notices'
  | 'courses'
  | 'workflows'
  | 'audit_log';

export interface Entity {
  id: string;
}

export interface Driver {
  name: string;
  list<T extends Entity>(collection: Collection): Promise<T[] | null>;
  replace<T extends Entity>(collection: Collection, rows: T[]): Promise<void>;
  clear(collection: Collection): Promise<void>;
}

export interface BaaSConfig {
  url: string;
  project: string;
  apiKey?: string;
  driver: 'local' | 'appwrite' | 'pocketbase' | 'supabase';
}

const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};

export const baasConfig: BaaSConfig = {
  url: env.VITE_BAAS_URL ?? '',
  project: env.VITE_BAAS_PROJECT ?? '',
  apiKey: env.VITE_BAAS_KEY,
  driver: (env.VITE_BAAS_DRIVER as BaaSConfig['driver']) ?? 'local',
};

export const isRemote = () => baasConfig.driver !== 'local' && Boolean(baasConfig.url);

/* -------------------------------------------------------------------------- */
/*  Local driver — localStorage backed, keeps the demo offline-friendly      */
/* -------------------------------------------------------------------------- */
const PREFIX = 'vanguard:db:';
const memory = new Map<string, string>();

const storage = {
  get(key: string) {
    try {
      return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  },
  set(key: string, value: string) {
    memory.set(key, value);
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* private mode / quota — fall back to memory for this session */
    }
  },
  remove(key: string) {
    memory.delete(key);
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* no-op */
    }
  },
};

export const localDriver: Driver = {
  name: 'Local (browser)',
  async list<T extends Entity>(collection: Collection) {
    if (typeof window === 'undefined') return null;
    const raw = storage.get(`${PREFIX}${collection}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as T[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
  async replace<T extends Entity>(collection: Collection, rows: T[]) {
    if (typeof window === 'undefined') return;
    storage.set(`${PREFIX}${collection}`, JSON.stringify(rows));
  },
  async clear(collection: Collection) {
    storage.remove(`${PREFIX}${collection}`);
  },
};

/* -------------------------------------------------------------------------- */
/*  HTTP driver template — implement this against your BaaS                  */
/* -------------------------------------------------------------------------- */
/**
 * Example (PocketBase):
 *
 *   const driver: Driver = {
 *     name: 'PocketBase',
 *     async list(collection) {
 *       const res = await fetch(`${cfg.url}/api/collections/${collection}/records?perPage=500`, {
 *         headers: { Authorization: `Bearer ${cfg.apiKey}` },
 *       });
 *       if (res.status === 404) return null;
 *       const body = await res.json();
 *       return body.items;
 *     },
 *     async replace(collection, rows) { ... batch upsert ... },
 *     async clear(collection) { ... },
 *   };
 */
export function resolveDriver(): Driver {
  // Return a remote driver here once your BaaS collections are provisioned.
  return localDriver;
}

export const driver = resolveDriver();

/* -------------------------------------------------------------------------- */
/*  React binding                                                             */
/* -------------------------------------------------------------------------- */
export function useCollection<T extends Entity>(collection: Collection, seed: T[]) {
  const [rows, setRows] = useState<T[]>(seed);
  const [hydrated, setHydrated] = useState(false);
  const skipPersist = useRef(true);

  // Hydrate from the driver on mount; keep seed data when the store is empty.
  useEffect(() => {
    let alive = true;
    driver
      .list<T>(collection)
      .then((stored) => {
        if (!alive) return;
        if (stored && stored.length > 0) setRows(stored);
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  // Persist subsequent changes.
  useEffect(() => {
    if (!hydrated) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    void driver.replace(collection, rows);
  }, [collection, hydrated, rows]);

  const reset = useCallback(async () => {
    await driver.clear(collection);
    setRows(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  return [rows, setRows, { hydrated, reset }] as const;
}

export async function resetAllCollections(collections: Collection[]) {
  await Promise.all(collections.map((c) => driver.clear(c)));
}
