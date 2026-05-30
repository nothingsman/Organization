import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMediaClient } from '@/lib/media/mediaClient';

describe('createMediaClient', () => {
  const mockFetch = vi.fn();
  vi.stubGlobal('fetch', mockFetch);

  const mockGetAuthHeaders = vi.fn().mockResolvedValue({ Authorization: 'Bearer test' });
  const client = createMediaClient({
    baseUrl: 'https://media.test.com',
    getAuthHeaders: mockGetAuthHeaders,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initiateUpload', () => {
    it('sends POST /api/media/upload with file metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ data: { id: 'media-1', key: 'uploads/f', upload_id: 'up-1', expires_in: 3600 } }),
      });

      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
      const result = await client.initiateUpload(file);

      expect(result.id).toBe('media-1');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('/api/media/upload');
    });
  });

  describe('getPartUrl', () => {
    it('sends POST for presigned URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ data: { presigned_url: 'https://storage.example.com/part', expires_in: 3600 } }),
      });

      const result = await client.getPartUrl({ mediaId: 'm1', uploadId: 'up-1', partNumber: 1 });

      expect(result.presigned_url).toBe('https://storage.example.com/part');
    });
  });

  describe('uploadPart', () => {
    it('uploads blob to presigned URL and returns ETag', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ etag: '"abc123"' }),
      });

      const etag = await client.uploadPart({
        presignedUrl: 'https://storage.example.com/part',
        blob: new Blob(['data']),
      });

      expect(etag).toBe('"abc123"');
    });

    it('throws on failed upload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers(),
        text: () => Promise.resolve(''),
      });

      await expect(
        client.uploadPart({ presignedUrl: 'https://bad.url', blob: new Blob(['x']) })
      ).rejects.toThrow('Part upload failed');
    });
  });

  describe('completeUpload', () => {
    it('sends POST to complete multipart upload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ data: { id: 'm1', status: 'uploaded', etag: '"final"', size: 100 } }),
      });

      const result = await client.completeUpload({
        mediaId: 'm1',
        uploadId: 'up-1',
        parts: [{ part_number: 1, etag: '"abc"' }],
      });

      expect(result.status).toBe('uploaded');
    });
  });

  describe('getMedia', () => {
    it('fetches media metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ data: { id: 'm1', key: 'uploads/f', file_name: 'photo.jpg' } }),
      });

      const result = await client.getMedia('m1');

      expect(result.file_name).toBe('photo.jpg');
    });
  });

  describe('getDownloadUrl', () => {
    it('returns download URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ data: { download_url: 'https://cdn.example.com/img.jpg' } }),
      });

      const url = await client.getDownloadUrl('m1');

      expect(url).toBe('https://cdn.example.com/img.jpg');
    });
  });

  describe('deleteMedia', () => {
    it('sends DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers({}),
      });

      await client.deleteMedia('m1');

      expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
    });
  });
});
