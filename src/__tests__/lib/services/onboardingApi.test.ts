import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onboardingApi } from '@/lib/services/onboardingApi';

const mockApiRequest = vi.fn();
vi.mock('@/lib/api/client', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

describe('onboardingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitDetails', () => {
    it('calls POST /onboarding/details', async () => {
      const details = {
        organization_name: 'My Org',
        trade_name: 'My Trade Name',
        business_license: 'lic-123',
        tin: 'tin-456',
        owner_name: 'Owner',
        owner_email: 'owner@org.com',
        owner_phone: '+251911111111',
        country: 'ET',
        city: 'Addis Ababa',
        sub_city: 'Bole',
        woreda: '03',
        location: { lat: 9.0, lng: 38.7 },
      };
      mockApiRequest.mockResolvedValueOnce({
        data: { status: 'PENDING', message: 'Submitted' },
        status: 200,
      });

      const result = await onboardingApi.submitDetails(details);

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/onboarding/details',
        body: details,
      });
      expect(result.status).toBe('PENDING');
    });
  });

  describe('selectPlan', () => {
    it('calls POST /onboarding/plan', async () => {
      const planData = { plan: 'PRO', billing_cycle: 'annual' };
      mockApiRequest.mockResolvedValueOnce({
        data: { status: 'COMPLETED', message: 'Plan selected' },
        status: 200,
      });

      const result = await onboardingApi.selectPlan(planData);

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/onboarding/plan',
        body: planData,
      });
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('complete', () => {
    it('calls POST /onboarding/complete', async () => {
      mockApiRequest.mockResolvedValueOnce({
        data: { status: 'VERIFIED', message: 'Onboarding complete' },
        status: 200,
      });

      const result = await onboardingApi.complete();

      expect(mockApiRequest).toHaveBeenCalledWith({ method: 'POST', path: '/onboarding/complete' });
      expect(result.status).toBe('VERIFIED');
    });
  });
});
