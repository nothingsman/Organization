import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaUpload } from '@/lib/hooks/useMediaUpload';

const mockUploadFile = vi.fn();
const mockDeleteMedia = vi.fn();

vi.mock('@/lib/media/browserMediaClient', () => ({
  createBrowserMediaClient: () => ({
    uploadFile: mockUploadFile,
    deleteMedia: mockDeleteMedia,
  }),
}));

describe('useMediaUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('upload', () => {
    it('returns the uploaded media result', async () => {
      const expected = { id: 'm1', status: 'uploaded' as const, etag: '"abc"', size: 100 };
      mockUploadFile.mockResolvedValue(expected);

      const { result } = renderHook(() => useMediaUpload());

      let uploadResult: unknown;
      await act(async () => {
        uploadResult = await result.current.upload(new File(['test'], 'doc.pdf'));
      });

      expect(uploadResult).toEqual(expected);
    });

    it('tracks uploading state during upload', async () => {
      let resolveUpload: (v: unknown) => void;
      const uploadPromise = new Promise((resolve) => { resolveUpload = resolve; });
      mockUploadFile.mockReturnValue(uploadPromise);

      const { result } = renderHook(() => useMediaUpload());

      const call = result.current.upload(new File(['t'], 't.pdf'));

      await act(async () => {
        await new Promise(process.nextTick);
      });

      expect(result.current.uploading).toBe(true);
      expect(result.current.progress).toBe(0);

      await act(async () => {
        resolveUpload!({ id: 'm1', status: 'uploaded', etag: '"e"', size: 1 });
        await call;
      });

      expect(result.current.uploading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('sets error on upload failure', async () => {
      mockUploadFile.mockRejectedValue(new Error('Upload failed'));

      const { result } = renderHook(() => useMediaUpload());

      await act(async () => {
        await expect(result.current.upload(new File(['t'], 't.pdf'))).rejects.toThrow('Upload failed');
      });

      expect(result.current.error).toBe('Upload failed');
      expect(result.current.uploading).toBe(false);
    });

    it('sets error with fallback message for non-Error throws', async () => {
      mockUploadFile.mockRejectedValue('string error');

      const { result } = renderHook(() => useMediaUpload());

      await act(async () => {
        await expect(result.current.upload(new File(['t'], 't.pdf'))).rejects.toBe('string error');
      });

      expect(result.current.error).toBe('Upload failed');
    });
  });

  describe('remove', () => {
    it('calls mediaClient.deleteMedia and clears removing state', async () => {
      mockDeleteMedia.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMediaUpload());

      await act(async () => {
        await result.current.remove('media-1');
      });

      expect(mockDeleteMedia).toHaveBeenCalledWith('media-1');
      expect(result.current.removing).toBe(false);
    });

    it('sets error on remove failure', async () => {
      mockDeleteMedia.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useMediaUpload());

      await act(async () => {
        await expect(result.current.remove('bad-id')).rejects.toThrow('Delete failed');
      });

      expect(result.current.error).toBe('Delete failed');
    });
  });
});
