import { describe, it, expect, beforeEach } from 'vitest';

const store = new Map<string, { data: unknown; expiresAt: number }>();

const cacheManager = {
  get<T>(key: string): T | null {
    const entry = store.get(key) as { data: T; expiresAt: number } | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.data;
  },
  set<T>(key: string, data: T, ttlMs = 300000): void {
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

describe('cacheManager', () => {
  beforeEach(() => {
    cacheManager.clear();
  });

  describe('get/set', () => {
    it('stores and retrieves a value', () => {
      cacheManager.set('key1', { foo: 'bar' });
      expect(cacheManager.get('key1')).toEqual({ foo: 'bar' });
    });

    it('returns null for a missing key', () => {
      expect(cacheManager.get('nonexistent')).toBeNull();
    });

    it('returns null for an expired entry', () => {
      cacheManager.set('expired', 'data', -1000);
      expect(cacheManager.get('expired')).toBeNull();
    });

    it('removes expired entry from store', () => {
      cacheManager.set('will-expire', 'data', -1);
      cacheManager.get('will-expire');
      expect(store.has('will-expire')).toBe(false);
    });

    it('stores with custom TTL', () => {
      cacheManager.set('custom-ttl', 'value', 5000);
      const entry = store.get('custom-ttl')!;
      expect(entry.expiresAt).toBeGreaterThan(Date.now() + 4990);
      expect(entry.expiresAt).toBeLessThan(Date.now() + 5010);
    });
  });

  describe('invalidate', () => {
    it('invalidates keys matching a string prefix', () => {
      cacheManager.set('GET:/api/schools', 'data1');
      cacheManager.set('GET:/api/users', 'data2');
      cacheManager.invalidate('GET:/api/schools');
      expect(cacheManager.get('GET:/api/schools')).toBeNull();
      expect(cacheManager.get('GET:/api/users')).toBe('data2');
    });

    it('invalidates keys matching a regex pattern', () => {
      cacheManager.set('schools:1', 'a');
      cacheManager.set('schools:2', 'b');
      cacheManager.set('users:1', 'c');
      cacheManager.invalidate(/^schools:/);
      expect(cacheManager.get('schools:1')).toBeNull();
      expect(cacheManager.get('schools:2')).toBeNull();
      expect(cacheManager.get('users:1')).toBe('c');
    });

    it('does nothing when no keys match', () => {
      cacheManager.set('a', 1);
      cacheManager.set('b', 2);
      cacheManager.invalidate('nonexistent');
      expect(cacheManager.get('a')).toBe(1);
      expect(cacheManager.get('b')).toBe(2);
    });
  });

  describe('clear', () => {
    it('removes all entries', () => {
      cacheManager.set('k1', 1);
      cacheManager.set('k2', 2);
      cacheManager.clear();
      expect(cacheManager.get('k1')).toBeNull();
      expect(cacheManager.get('k2')).toBeNull();
    });
  });
});
