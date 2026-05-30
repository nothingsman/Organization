import { describe, it, expect, beforeEach, vi } from 'vitest';

const SESSION_KEY = 'org-session';
const TOKEN_KEY = 'org-access-token';
const REFRESH_TOKEN_KEY = 'org-refresh-token';

const tokenManager = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(TOKEN_KEY);
  },
  setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(TOKEN_KEY, token);
  },
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  setSession(meta: { userId: string; email: string; name: string; expiresAt: number; onboardingComplete: boolean }): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(meta));
  },
  getSession(): { userId: string; email: string; name: string; expiresAt: number; onboardingComplete: boolean } | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  isTokenExpired(): boolean {
    const session = this.getSession();
    if (!session) return true;
    return Date.now() >= session.expiresAt;
  },
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  },
};

describe('tokenManager', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('access token', () => {
    it('stores and retrieves access token', () => {
      tokenManager.setAccessToken('abc123');
      expect(tokenManager.getAccessToken()).toBe('abc123');
    });

    it('returns null when no token is stored', () => {
      expect(tokenManager.getAccessToken()).toBeNull();
    });

    it('overwrites existing token', () => {
      tokenManager.setAccessToken('first');
      tokenManager.setAccessToken('second');
      expect(tokenManager.getAccessToken()).toBe('second');
    });
  });

  describe('refresh token', () => {
    it('stores and retrieves refresh token', () => {
      tokenManager.setRefreshToken('refresh-xyz');
      expect(tokenManager.getRefreshToken()).toBe('refresh-xyz');
    });

    it('returns null when no refresh token', () => {
      expect(tokenManager.getRefreshToken()).toBeNull();
    });
  });

  describe('session', () => {
    const mockSession = {
      userId: 'u1',
      email: 'test@example.com',
      name: 'Test User',
      expiresAt: Date.now() + 3600000,
      onboardingComplete: false,
    };

    it('stores and retrieves session metadata', () => {
      tokenManager.setSession(mockSession);
      const session = tokenManager.getSession();
      expect(session).toEqual(mockSession);
    });

    it('returns null when no session stored', () => {
      expect(tokenManager.getSession()).toBeNull();
    });

    it('returns null for corrupted session data', () => {
      sessionStorage.setItem(SESSION_KEY, 'not-json');
      expect(tokenManager.getSession()).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('returns true when no session exists', () => {
      expect(tokenManager.isTokenExpired()).toBe(true);
    });

    it('returns false when token is still valid', () => {
      tokenManager.setSession({
        userId: 'u1',
        email: 'a@b.com',
        name: '',
        expiresAt: Date.now() + 3600000,
        onboardingComplete: true,
      });
      expect(tokenManager.isTokenExpired()).toBe(false);
    });

    it('returns true when token has expired', () => {
      tokenManager.setSession({
        userId: 'u1',
        email: 'a@b.com',
        name: '',
        expiresAt: Date.now() - 1000,
        onboardingComplete: true,
      });
      expect(tokenManager.isTokenExpired()).toBe(true);
    });
  });

  describe('clearTokens', () => {
    it('removes all stored data', () => {
      tokenManager.setAccessToken('token');
      tokenManager.setRefreshToken('refresh');
      tokenManager.setSession({
        userId: 'u1',
        email: 'a@b.com',
        name: '',
        expiresAt: Date.now() + 3600000,
        onboardingComplete: true,
      });
      tokenManager.clearTokens();
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
      expect(tokenManager.getSession()).toBeNull();
    });
  });
});
