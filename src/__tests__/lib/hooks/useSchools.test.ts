import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSchools } from '@/lib/hooks/useSchools';

const mockSchoolsApi = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

const mockResolveMediaUrl = vi.hoisted(() => vi.fn());
const mockGetSchoolAvatarUrl = vi.hoisted(() => vi.fn());

vi.mock('@/lib/services/schoolsApi', () => ({
  schoolsApi: mockSchoolsApi,
}));

vi.mock('@/lib/media/resolveMediaUrl', () => ({
  resolveMediaUrl: (...args: unknown[]) => mockResolveMediaUrl(...args),
}));

vi.mock('@/lib/utils/schoolAvatar', () => ({
  getSchoolAvatarUrl: (...args: unknown[]) => mockGetSchoolAvatarUrl(...args),
}));

const mockSchool = {
  id: 's1',
  name: 'Sunrise Academy',
  logo: null,
  country: 'Ethiopia',
  description: 'A great school',
  website: 'https://sunrise.edu',
  organization: 'org-1',
  contact_email: 'info@sunrise.edu',
  contact_phone: '+251911111111',
  status: 'ACTIVE',
};

describe('useSchools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSchoolsApi.list.mockResolvedValue({ results: [mockSchool] });
    mockResolveMediaUrl.mockResolvedValue(null);
    mockGetSchoolAvatarUrl.mockReturnValue('https://ui-avatars.com/api/?name=Sunrise+Academy');
  });

  it('loads schools on mount', async () => {
    const { result } = renderHook(() => useSchools());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.schools).toHaveLength(1);
    expect(result.current.schools[0].name).toBe('Sunrise Academy');
    expect(result.current.error).toBeNull();
  });

  it('sets error when API fails', async () => {
    mockSchoolsApi.list.mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useSchools());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load schools');
    expect(result.current.schools).toHaveLength(0);
  });

  it('handles NOT_FOUND by returning empty array', async () => {
    mockSchoolsApi.list.mockRejectedValue({
      normalized: { code: 'NOT_FOUND' },
    });

    const { result } = renderHook(() => useSchools());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.schools).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('addSchool calls API and prepends school', async () => {
    mockSchoolsApi.list.mockResolvedValue({ results: [] });
    mockSchoolsApi.create.mockResolvedValue({
      ...mockSchool,
      id: 's2',
      name: 'New School',
    });

    const { result } = renderHook(() => useSchools());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addSchool({
        name: 'New School',
        country: 'ET',
        organization: 'org-1',
      });
    });

    expect(result.current.schools).toHaveLength(1);
    expect(result.current.schools[0].name).toBe('New School');
  });

  it('updateSchool calls API and updates school in list', async () => {
    mockSchoolsApi.list.mockResolvedValue({ results: [mockSchool] });
    mockSchoolsApi.update.mockResolvedValue({
      ...mockSchool,
      name: 'Updated Academy',
    });

    const { result } = renderHook(() => useSchools());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateSchool('s1', { name: 'Updated Academy' });
    });

    expect(result.current.schools[0].name).toBe('Updated Academy');
  });
});
