import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '@/lib/services/authApi';

const mockApiRequest = vi.fn();
vi.mock('@/lib/api/client', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('calls apiRequest with POST /auth/users/', async () => {
      const userData = { email: 'test@test.com', password: 'StrongP@ss1', name: 'Test' };
      mockApiRequest.mockResolvedValueOnce({ data: { id: '1', email: 'test@test.com' }, status: 201 });

      const result = await authApi.register(userData);

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/auth/users/',
        body: userData,
        skipAuth: true,
      });
      expect(result).toEqual({ id: '1', email: 'test@test.com' });
    });
  });

  describe('login', () => {
    it('calls apiRequest with POST /auth/jwt/create/', async () => {
      const credentials = { email: 'a@b.com', password: 'pass' };
      mockApiRequest.mockResolvedValueOnce({
        data: { access: 'token', refresh: 'refresh' },
        status: 200,
      });

      const result = await authApi.login(credentials);

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/auth/jwt/create/',
        body: credentials,
        skipAuth: true,
      });
      expect(result.access).toBe('token');
    });
  });

  describe('activate', () => {
    it('calls apiRequest with POST /auth/users/activation/', async () => {
      mockApiRequest.mockResolvedValueOnce({ status: 204, data: undefined });

      await authApi.activate({ uid: '1', token: 'abc' });

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/auth/users/activation/',
        body: { uid: '1', token: 'abc' },
        skipAuth: true,
      });
    });
  });

  describe('resendActivation', () => {
    it('calls apiRequest with POST /auth/users/resend_activation/', async () => {
      mockApiRequest.mockResolvedValueOnce({ status: 204, data: undefined });

      await authApi.resendActivation('user@test.com');

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/auth/users/resend_activation/',
        body: { email: 'user@test.com' },
        skipAuth: true,
      });
    });
  });

  describe('resetPassword', () => {
    it('calls apiRequest with POST /auth/users/reset_password/', async () => {
      mockApiRequest.mockResolvedValueOnce({ status: 204, data: undefined });

      await authApi.resetPassword({ email: 'user@test.com' });

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/auth/users/reset_password/',
        body: { email: 'user@test.com' },
        skipAuth: true,
      });
    });
  });

  describe('resetPasswordConfirm', () => {
    it('calls apiRequest with POST /auth/users/reset_password_confirm/', async () => {
      mockApiRequest.mockResolvedValueOnce({ status: 204, data: undefined });

      await authApi.resetPasswordConfirm({ uid: '1', token: 'abc', new_password: 'NewP@ss1' });

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/auth/users/reset_password_confirm/',
        body: { uid: '1', token: 'abc', new_password: 'NewP@ss1' },
        skipAuth: true,
      });
    });
  });

  describe('getCurrentUser', () => {
    it('calls apiRequest with GET /api/users/me/', async () => {
      const user = { id: '1', email: 'a@b.com' };
      mockApiRequest.mockResolvedValueOnce({ data: user, status: 200 });

      const result = await authApi.getCurrentUser();

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/api/users/me/',
      });
      expect(result).toEqual(user);
    });
  });

  describe('updateProfile', () => {
    it('calls apiRequest with PATCH /api/users/{id}/', async () => {
      const updates = { name: 'New Name' };
      mockApiRequest.mockResolvedValueOnce({ data: { id: '1', ...updates }, status: 200 });

      const result = await authApi.updateProfile('1', updates);

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/api/users/1/',
        body: updates,
      });
      expect(result.name).toBe('New Name');
    });
  });
});
