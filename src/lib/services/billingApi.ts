import { apiRequest } from '../api/client';
import type { BillingInfo, InvoicesResponse, UpdatePlanRequest } from '../types/billing';

export const billingApi = {
  async getBillingInfo(): Promise<BillingInfo> {
    const res = await apiRequest<BillingInfo>({
      method: 'GET',
      path: '/billing',
    });
    return res.data;
  },

  async getInvoices(): Promise<InvoicesResponse> {
    const res = await apiRequest<InvoicesResponse>({
      method: 'GET',
      path: '/billing/invoices',
    });
    return res.data;
  },

  async updatePlan(data: UpdatePlanRequest): Promise<void> {
    await apiRequest<void>({
      method: 'POST',
      path: '/billing/plan',
      body: data,
    });
  },
};
