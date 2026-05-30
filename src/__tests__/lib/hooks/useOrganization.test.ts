import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOrganization } from '@/lib/hooks/useOrganization';

const mockOrgContext = vi.hoisted(() => ({
  organization: { id: 'org-1', name: 'Test Org', trade_name: 'Test' },
  loading: false,
  error: null,
  refetch: vi.fn().mockResolvedValue(undefined),
  setOrganization: vi.fn(),
}));

const mockOrganizationsApi = vi.hoisted(() => ({
  update: vi.fn(),
}));

vi.mock('@/context/OrganizationContext', () => ({
  useOrganizationContext: () => mockOrgContext,
}));

vi.mock('@/lib/services/organizationsApi', () => ({
  organizationsApi: mockOrganizationsApi,
}));

describe('useOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrgContext.organization = { id: 'org-1', name: 'Test Org', trade_name: 'Test' };
  });

  it('returns organization from context', () => {
    const { result } = renderHook(() => useOrganization());

    expect(result.current.organization).toEqual({
      id: 'org-1',
      name: 'Test Org',
      trade_name: 'Test',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('updateOrganization', () => {
    it('calls API update and refreshes context', async () => {
      const updatedOrg = { id: 'org-1', name: 'Updated Org', trade_name: 'Updated' };
      mockOrganizationsApi.update.mockResolvedValue(updatedOrg);

      const { result } = renderHook(() => useOrganization());

      const returned = await result.current.updateOrganization({ name: 'Updated Org' });

      expect(mockOrganizationsApi.update).toHaveBeenCalledWith('org-1', { name: 'Updated Org' });
      expect(mockOrgContext.setOrganization).toHaveBeenCalledWith(updatedOrg);
      expect(mockOrgContext.refetch).toHaveBeenCalledTimes(1);
      expect(returned).toEqual(updatedOrg);
    });

    it('throws if no organization exists', async () => {
      mockOrgContext.organization = null;

      const { result } = renderHook(() => useOrganization());

      await expect(result.current.updateOrganization({ name: 'x' })).rejects.toThrow(
        'No organization found'
      );
    });
  });

  it('exposes refreshOrganization as alias for refetch', () => {
    const { result } = renderHook(() => useOrganization());

    result.current.refreshOrganization();
    expect(mockOrgContext.refetch).toHaveBeenCalled();
  });
});
