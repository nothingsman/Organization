import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest } from '@/lib/api/client';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.mock('@/lib/api/config', () => ({
  appConfig: { apiBaseUrl: 'https://api.test.com', apiTimeout: 30000, googleMapsKey: '' },
}));

vi.mock('@/lib/api/tokenManager', () => ({
  tokenManager: {
    getAccessToken: vi.fn(() => 'test-access-token'),
    getRefreshToken: vi.fn(() => 'test-refresh-token'),
    setAccessToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

vi.mock('@/lib/api/refreshToken', () => ({
  refreshAccessToken: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/lib/api/logger', () => ({
  apiLogger: {
    logRequest: vi.fn(),
    logResponse: vi.fn(),
    logError: vi.fn(),
  },
}));

vi.mock('@/lib/api/cache', () => ({
  cacheManager: {
    get: vi.fn(() => null),
    set: vi.fn(),
    invalidate: vi.fn(),
    clear: vi.fn(),
  },
  DEFAULT_TTL_MS: 300000,
}));

describe('apiRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends a GET request and returns parsed data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ id: 1, name: 'Test' }),
    });

    const result = await apiRequest<{ id: number; name: string }>({
      method: 'GET',
      path: '/api/test/',
    });

    expect(result.data).toEqual({ id: 1, name: 'Test' });
    expect(result.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('sends a POST request with JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ id: 1 }),
    });

    const body = { name: 'New School' };
    await apiRequest({ method: 'POST', path: '/api/schools/', body });

    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[1].method).toBe('POST');
    expect(fetchCall[1].body).toBe(JSON.stringify(body));
  });

  it('attaches Authorization header when skipAuth is false', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    });

    await apiRequest({ method: 'GET', path: '/api/protected/' });

    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[1].headers['Authorization']).toBe('Bearer test-access-token');
  });

  it('skips Authorization header when skipAuth is true', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    });

    await apiRequest({ method: 'POST', path: '/auth/login/', skipAuth: true, body: {} });

    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[1].headers['Authorization']).toBeUndefined();
  });

  it('throws ApiError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    });

    await expect(apiRequest({ method: 'GET', path: '/not-found/' })).rejects.toThrow();
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(apiRequest({ method: 'GET', path: '/api/test/' })).rejects.toThrow();
  });

  it('retries on retryable status codes', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ recovered: true }),
      });

    const result = await apiRequest<{ recovered: boolean }>({ method: 'GET', path: '/api/retry/' });
    expect(result.data).toEqual({ recovered: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 4xx non-retryable status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    });

    await expect(apiRequest({ method: 'GET', path: '/api/bad/' })).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('builds URL with query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    });

    await apiRequest({ method: 'GET', path: '/api/search/', params: { q: 'test', page: 1 } });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('q=test');
    expect(url).toContain('page=1');
  });
});
