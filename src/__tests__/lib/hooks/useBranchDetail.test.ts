import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useBranchDetail } from '@/lib/hooks/useBranchDetail';

const mockSchoolsApi = vi.hoisted(() => ({ get: vi.fn() }));
const mockBranchesApi = vi.hoisted(() => ({ listBySchool: vi.fn(), create: vi.fn(), update: vi.fn() }));
const mockOrganizationsApi = vi.hoisted(() => ({ list: vi.fn() }));
const mockBranchAdminsApi = vi.hoisted(() => ({ list: vi.fn() }));
const mockResolveMediaUrl = vi.hoisted(() => vi.fn());
const mockGetSchoolAvatarUrl = vi.hoisted(() => vi.fn());

vi.mock('@/lib/services/schoolsApi', () => ({ schoolsApi: mockSchoolsApi }));
vi.mock('@/lib/services/branchesApi', () => ({ branchesApi: mockBranchesApi }));
vi.mock('@/lib/services/organizationsApi', () => ({ organizationsApi: mockOrganizationsApi }));
vi.mock('@/lib/services/branchAdminsApi', () => ({ branchAdminsApi: mockBranchAdminsApi }));
vi.mock('@/lib/media/resolveMediaUrl', () => ({ resolveMediaUrl: (...args: unknown[]) => mockResolveMediaUrl(...args) }));
vi.mock('@/lib/utils/schoolAvatar', () => ({ getSchoolAvatarUrl: (...args: unknown[]) => mockGetSchoolAvatarUrl(...args) }));

const mockSchool = {
  id: 's1',
  name: 'Test School',
  logo: null,
  country: 'Ethiopia',
  description: '',
  website: '',
  organization: 'org-1',
  contact_email: '',
  contact_phone: '',
  status: 'ACTIVE',
};

const mockBranch = {
  id: 'b1',
  school: 's1',
  name: 'Main Campus',
  address: 'Bole',
  city: 'Addis Ababa',
  region: 'Addis Ababa',
  contact_phone: '+251911111111',
  contact_email: 'branch@test.com',
  status: 'ACTIVE',
};

describe('useBranchDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSchoolsApi.get.mockResolvedValue(mockSchool);
    mockBranchesApi.listBySchool.mockResolvedValue([mockBranch]);
    mockBranchAdminsApi.list.mockResolvedValue([]);
    mockResolveMediaUrl.mockResolvedValue(null);
    mockGetSchoolAvatarUrl.mockReturnValue('https://ui-avatars.com/api/?name=Test+School');
  });

  it('loads school and branches on mount', async () => {
    const { result } = renderHook(() => useBranchDetail('s1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.school?.name).toBe('Test School');
    expect(result.current.branches).toHaveLength(1);
    expect(result.current.branches[0].name).toBe('Main Campus');
  });

  it('does not fetch if schoolId is empty', () => {
    const { result } = renderHook(() => useBranchDetail(''));

    expect(result.current.loading).toBe(true);
    expect(mockSchoolsApi.get).not.toHaveBeenCalled();
  });

  it('handles school fetch error gracefully', async () => {
    mockSchoolsApi.get.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useBranchDetail('s1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.school).toBeUndefined();
  });

  describe('addBranch', () => {
    it('creates branch via API and prepends to list', async () => {
      mockOrganizationsApi.list.mockResolvedValue({ results: [{ id: 'org-1' }] });
      mockBranchesApi.create.mockResolvedValue({ ...mockBranch, id: 'b2', name: 'New Branch' });

      const { result } = renderHook(() => useBranchDetail('s1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addBranch({
          name: 'New Branch',
          address: 'Megenagna',
          city: 'Addis Ababa',
          region: 'Addis Ababa',
        });
      });

      expect(result.current.branches).toHaveLength(2);
      expect(result.current.branches[0].name).toBe('New Branch');
    });
  });

  describe('updateBranch', () => {
    it('updates branch via API and updates in list', async () => {
      const updated = { ...mockBranch, name: 'Updated Campus' };
      mockBranchesApi.update.mockResolvedValue(updated);

      const { result } = renderHook(() => useBranchDetail('s1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updateBranch('b1', { name: 'Updated Campus' });
      });

      expect(result.current.branches[0].name).toBe('Updated Campus');
    });
  });

  describe('refreshBranchAdmins', () => {
    it('fetches and updates branch admins map', async () => {
      const admin = { id: 'a1', name: 'Admin User', email: 'admin@test.com' };
      mockBranchAdminsApi.list.mockResolvedValue([admin]);

      const { result } = renderHook(() => useBranchDetail('s1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.refreshBranchAdmins('b1');
      });

      expect(result.current.branchAdminsMap['b1']).toEqual([admin]);
    });
  });
});
