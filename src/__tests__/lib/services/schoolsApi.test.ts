import { describe, it, expect, vi, beforeEach } from 'vitest';
import { schoolsApi } from '@/lib/services/schoolsApi';

const mockApiRequest = vi.fn();
vi.mock('@/lib/api/client', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

describe('schoolsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('calls GET /api/schools/', async () => {
      const response = { results: [{ id: '1', name: 'School A' }] };
      mockApiRequest.mockResolvedValueOnce({ data: response, status: 200 });

      const result = await schoolsApi.list();

      expect(mockApiRequest).toHaveBeenCalledWith({ method: 'GET', path: '/api/schools/' });
      expect(result.results).toHaveLength(1);
    });
  });

  describe('get', () => {
    it('calls GET /api/schools/{id}/', async () => {
      const school = { id: '1', name: 'Test School' };
      mockApiRequest.mockResolvedValueOnce({ data: school, status: 200 });

      const result = await schoolsApi.get('1');

      expect(mockApiRequest).toHaveBeenCalledWith({ method: 'GET', path: '/api/schools/1/' });
      expect(result).toEqual(school);
    });
  });

  describe('create', () => {
    it('calls POST /api/schools/ with body', async () => {
      const data = { name: 'New School', country: 'ET', organization: 'org-1' };
      mockApiRequest.mockResolvedValueOnce({ data: { id: '2', ...data }, status: 201 });

      const result = await schoolsApi.create(data);

      expect(mockApiRequest).toHaveBeenCalledWith({ method: 'POST', path: '/api/schools/', body: data });
      expect(result.name).toBe('New School');
    });
  });

  describe('update', () => {
    it('calls PATCH /api/schools/{id}/', async () => {
      const data = { name: 'Updated' };
      mockApiRequest.mockResolvedValueOnce({ data: { id: '1', name: 'Updated' }, status: 200 });

      const result = await schoolsApi.update('1', data);

      expect(mockApiRequest).toHaveBeenCalledWith({ method: 'PATCH', path: '/api/schools/1/', body: data });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('calls DELETE /api/schools/{id}/', async () => {
      mockApiRequest.mockResolvedValueOnce({ status: 204, data: undefined });

      await schoolsApi.delete('1');

      expect(mockApiRequest).toHaveBeenCalledWith({ method: 'DELETE', path: '/api/schools/1/' });
    });
  });
});
