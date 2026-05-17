import { apiRequest } from '../api/client';
import type { UserSettings, ChangePasswordRequest } from '../types/settings';

export const settingsApi = {
  async get(): Promise<UserSettings> {
    const res = await apiRequest<UserSettings>({
      method: 'GET',
      path: '/settings',
    });
    return res.data;
  },

  async update(data: Partial<UserSettings>): Promise<UserSettings> {
    const res = await apiRequest<UserSettings>({
      method: 'PUT',
      path: '/settings',
      body: data,
    });
    return res.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiRequest<void>({
      method: 'POST',
      path: '/settings/password',
      body: data,
    });
  },
};
