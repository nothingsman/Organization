import { apiRequest } from '../api/client';
import type { OnboardingDetailsRequest, PlanSelectionRequest, OnboardingStatusResponse } from '../types/onboarding';

export const onboardingApi = {
  async submitDetails(data: OnboardingDetailsRequest): Promise<OnboardingStatusResponse> {
    const res = await apiRequest<OnboardingStatusResponse>({
      method: 'POST',
      path: '/onboarding/details',
      body: data,
    });
    return res.data;
  },

  async selectPlan(data: PlanSelectionRequest): Promise<OnboardingStatusResponse> {
    const res = await apiRequest<OnboardingStatusResponse>({
      method: 'POST',
      path: '/onboarding/plan',
      body: data,
    });
    return res.data;
  },

  async complete(): Promise<OnboardingStatusResponse> {
    const res = await apiRequest<OnboardingStatusResponse>({
      method: 'POST',
      path: '/onboarding/complete',
    });
    return res.data;
  },
};
