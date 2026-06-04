import { apiRequest } from '../api/client';
import type {
  LoginRequest,
  RegisterRequest,
  JWTResponse,
  ApiUser,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ActivationRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
} from '../types/auth';

export const authApi = {
  async register(data: RegisterRequest): Promise<ApiUser> {
    const res = await apiRequest<ApiUser>({
      method: 'POST',
      path: '/auth/users/',
      body: data,
      skipAuth: true,
    });
    return res.data;
  },

  async login(data: LoginRequest): Promise<JWTResponse> {
    const res = await apiRequest<JWTResponse>({
      method: 'POST',
      path: '/auth/jwt/create/',
      body: data,
      skipAuth: true,
    });
    return res.data;
  },

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const res = await apiRequest<RefreshTokenResponse>({
      method: 'POST',
      path: '/auth/jwt/refresh/',
      body: data,
      skipAuth: true,
    });
    return res.data;
  },

  async verifyToken(token: string): Promise<void> {
    await apiRequest<void>({
      method: 'POST',
      path: '/auth/jwt/verify/',
      body: { token },
      skipAuth: true,
    });
  },

  async activate(data: ActivationRequest): Promise<void> {
    await apiRequest<void>({
      method: 'POST',
      path: '/auth/users/activation/',
      body: data,
      skipAuth: true,
    });
  },

  async resendActivation(email: string): Promise<void> {
    await apiRequest<void>({
      method: 'POST',
      path: '/auth/users/resend_activation/',
      body: { email },
      skipAuth: true,
    });
  },

  async resetPassword(data: PasswordResetRequest): Promise<void> {
    await apiRequest<void>({
      method: 'POST',
      path: '/auth/users/reset_password/',
      body: data,
      skipAuth: true,
    });
  },

  async resetPasswordConfirm(data: PasswordResetConfirmRequest): Promise<void> {
    await apiRequest<void>({
      method: 'POST',
      path: '/auth/users/reset_password_confirm/',
      body: data,
      skipAuth: true,
    });
  },

  async organizationApprovalExchange(data: ActivationRequest): Promise<JWTResponse> {
    const res = await apiRequest<JWTResponse>({
      method: 'POST',
      path: '/auth/organization-approval/exchange/',
      body: data,
      skipAuth: true,
    });
    return res.data;
  },

  async getCurrentUser(): Promise<ApiUser> {
    const res = await apiRequest<ApiUser>({
      method: 'GET',
      path: '/api/users/me/',
    });
    return res.data;
  },

  async updateProfile(id: string, data: Partial<ApiUser>): Promise<ApiUser> {
    const res = await apiRequest<ApiUser>({
      method: 'PATCH',
      path: `/api/users/${id}/`,
      body: data,
    });
    return res.data;
  },
};
