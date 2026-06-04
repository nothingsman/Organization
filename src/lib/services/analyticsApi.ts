import { apiRequest } from '../api/client';
import type { OrganizationAnalyticsResponse } from '../types/analytics';

export const analyticsApi = {
  async getOrganizationAnalytics(organizationId: string): Promise<OrganizationAnalyticsResponse> {
    const res = await apiRequest<OrganizationAnalyticsResponse>({
      method: 'GET',
      path: `/api/organizations/${organizationId}/analytics/`,
    });
    return res.data;
  },
};
