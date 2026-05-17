'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { featureFlags } from '@/config/featureFlags';
import { authApi } from '@/lib/services/authApi';
import { tokenManager } from '@/lib/api/tokenManager';
import { cacheManager } from '@/lib/api/cache';

const STORAGE_KEY = 'organization-portal-auth';

export type AuthUser = { email: string; id?: string; name?: string } | null;

export type AuthState = {
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  user: AuthUser;
};

const defaultAuth: AuthState = {
  isAuthenticated: false,
  onboardingComplete: false,
  user: null,
};

// ─── localStorage helpers (kept for mock fallback) ───────────────────────────

function readStoredAuth(): AuthState {
  if (typeof window === 'undefined') return defaultAuth;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAuth;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      onboardingComplete: Boolean(parsed.onboardingComplete),
      user: parsed.user ?? null,
    };
  } catch {
    return defaultAuth;
  }
}

function writeStoredAuth(state: AuthState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Context types ────────────────────────────────────────────────────────────

type AuthContextValue = AuthState & {
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  directLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(defaultAuth);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (featureFlags.useRealAuth) {
      // Restore session from tokenManager (sessionStorage)
      const session = tokenManager.getSession();
      if (session && !tokenManager.isTokenExpired()) {
        setAuth({
          isAuthenticated: true,
          onboardingComplete: session.onboardingComplete,
          user: { email: session.email, id: session.userId },
        });
      }
    } else {
      setAuth(readStoredAuth());
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: AuthState) => {
    setAuth(next);
    if (!featureFlags.useRealAuth) {
      writeStoredAuth(next);
    }
  }, []);

  // ── login (used by onboarding AuthScreen — sets onboardingComplete: false) ──
  const login = useCallback(
    async (email: string, password: string) => {
      if (!email || !password) throw new Error('Email and password are required');

      if (featureFlags.useRealAuth) {
        const response = await authApi.register({ name: '', fatherName: '', email, password });
        tokenManager.setAccessToken(response.accessToken);
        tokenManager.setSession({
          userId: response.user.id,
          email: response.user.email,
          expiresAt: response.expiresAt,
          onboardingComplete: response.user.onboardingComplete,
        });
        setAuth({
          isAuthenticated: true,
          onboardingComplete: response.user.onboardingComplete,
          user: { email: response.user.email, id: response.user.id, name: response.user.name },
        });
      } else {
        // Mock: simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        persist({
          isAuthenticated: true,
          onboardingComplete: false,
          user: { email },
        });
      }
    },
    [persist],
  );

  // ── directLogin (used by /login page — sets onboardingComplete: true) ────────
  const directLogin = useCallback(
    async (email: string, password: string) => {
      if (!email || !password) throw new Error('Email and password are required');

      if (featureFlags.useRealAuth) {
        const response = await authApi.login({ email, password });
        tokenManager.setAccessToken(response.accessToken);
        tokenManager.setSession({
          userId: response.user.id,
          email: response.user.email,
          expiresAt: response.expiresAt,
          onboardingComplete: response.user.onboardingComplete,
        });
        setAuth({
          isAuthenticated: true,
          onboardingComplete: response.user.onboardingComplete,
          user: { email: response.user.email, id: response.user.id, name: response.user.name },
        });
      } else {
        // Mock: simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        persist({
          isAuthenticated: true,
          onboardingComplete: true,
          user: { email },
        });
      }
    },
    [persist],
  );

  const completeOnboarding = useCallback(() => {
    setAuth((prev) => {
      const next: AuthState = {
        ...prev,
        isAuthenticated: true,
        onboardingComplete: true,
      };
      if (!featureFlags.useRealAuth) {
        writeStoredAuth(next);
      } else {
        // Update session metadata
        const session = tokenManager.getSession();
        if (session) {
          tokenManager.setSession({ ...session, onboardingComplete: true });
        }
      }
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    if (featureFlags.useRealAuth) {
      try {
        await authApi.logout();
      } catch {
        // Best-effort — always clear local state
      }
      tokenManager.clearTokens();
      cacheManager.clear();
    } else {
      writeStoredAuth({ ...defaultAuth });
    }
    setAuth({ ...defaultAuth });
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
      ...auth,
      hydrated,
      login,
      directLogin,
      logout,
      completeOnboarding,
    }),
    [auth, hydrated, login, directLogin, logout, completeOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
