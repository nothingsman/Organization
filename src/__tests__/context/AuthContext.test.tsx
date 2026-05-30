import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const mockTokenManager = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  getRefreshToken: vi.fn(() => 'refresh-token'),
  setRefreshToken: vi.fn(),
  setSession: vi.fn(),
  getSession: vi.fn(),
  isTokenExpired: vi.fn(),
  clearTokens: vi.fn(),
}));

const mockAuthApi = vi.hoisted(() => ({
  login: vi.fn(),
}));

vi.mock('@/lib/api/tokenManager', () => ({
  tokenManager: mockTokenManager,
}));

vi.mock('@/lib/services/authApi', () => ({
  authApi: mockAuthApi,
}));

vi.mock('@/lib/api/cache', () => ({
  cacheManager: { clear: vi.fn() },
}));

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="onboarding">{String(auth.onboardingComplete)}</span>
      <span data-testid="user-email">{auth.user?.email ?? 'none'}</span>
      <span data-testid="hydrated">{String(auth.hydrated)}</span>
      <button data-testid="login-btn" onClick={() => auth.login('user@test.com', 'Pass123!')}>
        Login
      </button>
      <button data-testid="direct-login-btn" onClick={() => auth.directLogin('admin@test.com', 'Pass123!')}>
        Direct Login
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
      <button data-testid="complete-onboarding-btn" onClick={() => auth.completeOnboarding()}>
        Complete
      </button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTokenManager.getSession.mockReturnValue(null);
    mockTokenManager.getAccessToken.mockReturnValue(null);
  });

  it('provides default unauthenticated state', () => {
    renderWithAuth();

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('onboarding').textContent).toBe('false');
    expect(screen.getByTestId('user-email').textContent).toBe('none');
  });

  it('restores session from token manager on mount', () => {
    mockTokenManager.getSession.mockReturnValue({
      userId: 'u1',
      email: 'existing@test.com',
      name: 'Existing',
      expiresAt: Date.now() + 3600000,
      onboardingComplete: true,
    });
    mockTokenManager.isTokenExpired.mockReturnValue(false);

    renderWithAuth();

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-email').textContent).toBe('existing@test.com');
    expect(screen.getByTestId('onboarding').textContent).toBe('true');
  });

  it('login calls authApi and updates state', async () => {
    const user = userEvent.setup();
    mockAuthApi.login.mockResolvedValue({
      access: 'access-token',
      refresh: 'refresh-token',
    });

    renderWithAuth();

    await user.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(mockAuthApi.login).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'Pass123!',
      });
    });

    expect(mockTokenManager.setAccessToken).toHaveBeenCalledWith('access-token');
    expect(mockTokenManager.setRefreshToken).toHaveBeenCalledWith('refresh-token');
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('directLogin calls authApi and updates state', async () => {
    const user = userEvent.setup();
    mockAuthApi.login.mockResolvedValue({
      access: 'access-token',
      refresh: 'refresh-token',
    });

    renderWithAuth();

    await user.click(screen.getByTestId('direct-login-btn'));

    await waitFor(() => {
      expect(mockAuthApi.login).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'Pass123!',
      });
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('completeOnboarding sets onboardingComplete to true', async () => {
    const user = userEvent.setup();
    mockTokenManager.getSession.mockReturnValue({
      userId: 'u1',
      email: 'test@test.com',
      name: '',
      expiresAt: Date.now() + 3600000,
      onboardingComplete: false,
    });

    renderWithAuth();

    await user.click(screen.getByTestId('complete-onboarding-btn'));

    expect(screen.getByTestId('onboarding').textContent).toBe('true');
  });

  it('logout clears tokens and resets state', async () => {
    const user = userEvent.setup();
    mockTokenManager.getSession.mockReturnValue({
      userId: 'u1',
      email: 'test@test.com',
      name: '',
      expiresAt: Date.now() + 3600000,
      onboardingComplete: true,
    });
    mockTokenManager.isTokenExpired.mockReturnValue(false);

    renderWithAuth();
    expect(screen.getByTestId('authenticated').textContent).toBe('true');

    await user.click(screen.getByTestId('logout-btn'));

    expect(mockTokenManager.clearTokens).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-email').textContent).toBe('none');
  });

  it('useAuth throws when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });
});
