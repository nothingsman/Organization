import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isRenderableMediaUrl, resolveMediaUrl } from '@/lib/media/resolveMediaUrl';

vi.mock('@/lib/media/browserMediaClient', () => ({
  createBrowserMediaClient: () => ({
    getDownloadUrl: vi.fn((id: string) => {
      if (id === 'valid-id') return Promise.resolve('https://cdn.example.com/resolved.jpg');
      return Promise.reject(new Error('Not found'));
    }),
  }),
}));

describe('isRenderableMediaUrl', () => {
  it('returns false for null', () => {
    expect(isRenderableMediaUrl(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isRenderableMediaUrl(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isRenderableMediaUrl('')).toBe(false);
  });

  it('returns true for https URL', () => {
    expect(isRenderableMediaUrl('https://example.com/img.jpg')).toBe(true);
  });

  it('returns true for http URL', () => {
    expect(isRenderableMediaUrl('http://example.com/img.jpg')).toBe(true);
  });

  it('returns true for protocol-relative URL', () => {
    expect(isRenderableMediaUrl('//cdn.example.com/img.jpg')).toBe(true);
  });

  it('returns true for data URI', () => {
    expect(isRenderableMediaUrl('data:image/png;base64,iVBOR')).toBe(true);
  });

  it('returns true for blob URI', () => {
    expect(isRenderableMediaUrl('blob:http://example.com/uuid')).toBe(true);
  });

  it('returns false for a media ID (not a URL)', () => {
    expect(isRenderableMediaUrl('abc-123-def')).toBe(false);
  });
});

describe('resolveMediaUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for null input', async () => {
    expect(await resolveMediaUrl(null)).toBeNull();
  });

  it('returns null for undefined input', async () => {
    expect(await resolveMediaUrl(undefined)).toBeNull();
  });

  it('returns the value as-is for a renderable URL', async () => {
    const url = 'https://cdn.example.com/existing.jpg';
    expect(await resolveMediaUrl(url)).toBe(url);
  });

  it('resolves a media ID via the API client', async () => {
    const result = await resolveMediaUrl('valid-id');
    expect(result).toBe('https://cdn.example.com/resolved.jpg');
  });

  it('returns null when resolution fails', async () => {
    const result = await resolveMediaUrl('bad-id');
    expect(result).toBeNull();
  });
});
