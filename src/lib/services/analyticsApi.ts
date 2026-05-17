import { apiRequest } from '../api/client';
import type { AnalyticsResponse, AnalyticsQueryParams } from '../types/analytics';

export const analyticsApi = {
  async get(params?: AnalyticsQueryParams): Promise<AnalyticsResponse> {
    const res = await apiRequest<AnalyticsResponse>({
      method: 'GET',
      path: '/analytics',
      params: params as Record<string, string>,
    });
    return res.data;
  },
};
