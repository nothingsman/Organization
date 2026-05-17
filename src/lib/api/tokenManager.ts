/**
 * Token Manager — handles access token storage, retrieval, and clearing.
 *
 * Strategy:
 * - Primary: httpOnly cookies set by the backend (browser sends automatically, not readable by JS)
 * - Session indicator: sessionStorage stores non-sensitive session metadata
 * - Fallback: If the backend sets a token in the response body, store it in sessionStorage
 *
 * When the backend uses httpOnly cookies, getAccessToken() returns null because JS
 * cannot read httpOnly cookies — the browser attaches them automatically to every request.
 * In that case, set skipAuth: true on the apiRequest and rely on cookie-based auth.
 */

const SESSION_KEY = 'org-session';
const TOKEN_KEY = 'org-access-token';

export interface SessionMeta {
  userId: string;
  email: string;
  expiresAt: number; // Unix timestamp (ms)
  onboardingComplete: boolean;
}

export const tokenManager = {
  /**
   * Returns the stored access token, or null if using httpOnly cookies.
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(TOKEN_KEY);
  },

  /**
   * Stores an access token in sessionStorage (fallback for non-httpOnly setups).
   */
  setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Stores non-sensitive session metadata.
   */
  setSession(meta: SessionMeta): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(meta));
  },

  /**
   * Retrieves session metadata.
   */
  getSession(): SessionMeta | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SessionMeta;
    } catch {
      return null;
    }
  },

  /**
   * Returns true if the stored session token is expired.
   */
  isTokenExpired(): boolean {
    const session = this.getSession();
    if (!session) return true;
    return Date.now() >= session.expiresAt;
  },

  /**
   * Clears all stored tokens and session data.
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  },
};
