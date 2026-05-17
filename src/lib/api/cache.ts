/**
 * In-memory cache manager for GET request responses.
 * Cleared on logout.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const cacheManager = {
  get<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.data;
  },

  set<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
  },

  invalidate(keyPattern: string | RegExp): void {
    for (const key of store.keys()) {
      const matches =
        typeof keyPattern === 'string' ? key.startsWith(keyPattern) : keyPattern.test(key);
      if (matches) store.delete(key);
    }
  },

  clear(): void {
    store.clear();
  },
};
