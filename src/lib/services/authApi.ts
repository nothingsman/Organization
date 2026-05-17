import { apiRequest } from '../api/client';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiRequest<LoginResponse>({
      method: 'POST',
      path: '/auth/login',
      body: data,
      skipAuth: true,
    });
    return res.data;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const res = await apiRequest<LoginResponse>({
      method: 'POST',
      path: '/auth/register',
      body: data,
      skipAuth: true,
    });
    return res.data;
  },

  async logout(): Promise<void> {
    await apiRequest<void>({
      method: 'POST',
      path: '/auth/logout',
    });
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number }> {
    const res = await apiRequest<{ accessToken: string; expiresAt: number }>({
      method: 'POST',
      path: '/auth/refresh',
      body: { refreshToken },
      skipAuth: true,
    });
    return res.data;
  },
};
