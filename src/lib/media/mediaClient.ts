// lib/media/mediaClient.ts
import { refreshAccessToken } from '@/lib/api/refreshToken';

export type MediaId = string;

export type MediaUploadInitResponse = {
  id: MediaId;
  key: string;
  upload_id: string;
  expires_in: number;
};

export type MediaPartUrlResponse = {
  presigned_url: string;
  expires_in: number;
};

export type UploadedPart = {
  part_number: number;
  etag: string;
};

export type MediaCompleteResponse = {
  id: MediaId;
  status: "uploaded";
  etag: string;
  size: number;
};

export type MediaMetadata = {
  id: MediaId;
  key: string;
  bucket: string;
  file_name: string;
  content_type: string;
  size: number;
  etag: string;
  status: "pending" | "uploaded" | "deleted" | string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  download_url?: string;
};

type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

type MediaClientOptions = {
  baseUrl?: string;
  getAuthHeaders?: () => HeadersInit | Promise<HeadersInit>;
};

const DEFAULT_PART_SIZE = 8 * 1024 * 1024; // 8MB

export function createMediaClient(options: MediaClientOptions = {}) {
  const baseUrl = options.baseUrl ?? "";

  const formatMediaError = (status: number, statusText: string, text: string, path: string) => {
    const fallback = "Media upload failed. Please try again.";
    const isHtml = text.trim().startsWith("<!DOCTYPE html>") || text.includes("<html");

    if (status === 404) {
      return "Media upload service is unavailable. Please contact support.";
    }

    if (status === 413) {
      return "File is too large. Please upload a smaller file.";
    }

    if (status === 415) {
      return "Unsupported file type. Please upload a supported file.";
    }

    if (status >= 500) {
      return "Media upload is temporarily unavailable. Please try again later.";
    }

    if (text && !isHtml) {
      return text;
    }

    if (statusText) {
      return `${fallback} (${status} ${statusText})`;
    }

    return fallback;
  };

  async function apiFetch<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> {
    const buildHeaders = async () => {
      const authHeaders = options.getAuthHeaders
        ? await options.getAuthHeaders()
        : {};

      return {
        "Content-Type": "application/json",
        ...authHeaders,
        ...init.headers,
      };
    };

    let headers = await buildHeaders();
    let res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (res.status === 401) {
      const nextAccessToken = await refreshAccessToken();
      if (nextAccessToken) {
        headers = await buildHeaders();
        res = await fetch(`${baseUrl}${path}`, {
          ...init,
          headers,
        });
      }
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const message = formatMediaError(res.status, res.statusText, text, path);
      throw new Error(message);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return res.json();
    }

    const text = await res.text().catch(() => "");
    return (text ? text : undefined) as T;
  }

  async function initiateUpload(file: File): Promise<MediaUploadInitResponse> {
    const res = await apiFetch<ApiEnvelope<MediaUploadInitResponse>>(
      "/api/media/upload",
      {
        method: "POST",
        body: JSON.stringify({
          file_name: file.name,
          content_type: file.type || "application/octet-stream",
        }),
      }
    );
    return res.data;
  }

  async function getPartUrl(params: {
    mediaId: MediaId;
    uploadId: string;
    partNumber: number;
  }): Promise<MediaPartUrlResponse> {
    const res = await apiFetch<ApiEnvelope<MediaPartUrlResponse>>(
      `/api/media/${params.mediaId}/multipart/part-url`,
      {
        method: "POST",
        body: JSON.stringify({
          upload_id: params.uploadId,
          part_number: params.partNumber,
        }),
      }
    );
    return res.data;
  }

  async function uploadPart(params: {
    presignedUrl: string;
    blob: Blob;
    contentType?: string;
  }): Promise<string> {
    // Don't send Content-Type header - it might not match the presigned URL signature
    const res = await fetch(params.presignedUrl, {
      method: "PUT",
      body: params.blob,
      // Don't include any headers - presigned URLs are very strict about what was signed
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      console.error('[Media Upload] Part upload failed:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText,
      });
      throw new Error(`Part upload failed: ${res.status} ${res.statusText}`);
    }

    const etag = res.headers.get("ETag");
    if (!etag) {
      throw new Error("Part upload succeeded but no ETag was returned");
    }

    return etag;
  }

  async function completeUpload(params: {
    mediaId: MediaId;
    uploadId: string;
    parts: UploadedPart[];
  }): Promise<MediaCompleteResponse> {
    const res = await apiFetch<ApiEnvelope<MediaCompleteResponse>>(
      `/api/media/${params.mediaId}/multipart/complete`,
      {
        method: "POST",
        body: JSON.stringify({
          upload_id: params.uploadId,
          parts: params.parts,
        }),
      }
    );
    return res.data;
  }

  async function abortUpload(params: {
    mediaId: MediaId;
    uploadId: string;
  }): Promise<void> {
    await apiFetch<ApiEnvelope<null>>(
      `/api/media/${params.mediaId}/multipart/abort`,
      {
        method: "POST",
        body: JSON.stringify({
          upload_id: params.uploadId,
        }),
      }
    );
  }

  async function getMedia(mediaId: MediaId): Promise<MediaMetadata> {
    const res = await apiFetch<ApiEnvelope<MediaMetadata>>(
      `/api/media/${mediaId}`,
      {
        method: "GET",
      }
    );
    return res.data;
  }

  async function getDownloadUrl(mediaId: MediaId): Promise<string> {
    const res = await apiFetch<ApiEnvelope<{ download_url: string }>>(
      `/api/media/${mediaId}/url`,
      {
        method: "GET",
      }
    );
    return res.data.download_url;
  }

  async function deleteMedia(mediaId: MediaId): Promise<void> {
    await apiFetch<ApiEnvelope<null>>(`/api/media/${mediaId}`, {
      method: "DELETE",
    });
  }

  async function uploadFile(params: {
    file: File;
    partSize?: number;
    onProgress?: (progress: {
      uploadedBytes: number;
      totalBytes: number;
      percentage: number;
    }) => void;
  }): Promise<MediaCompleteResponse> {
    const file = params.file;
    const partSize = params.partSize ?? DEFAULT_PART_SIZE;

    console.log('[Media Upload] Starting upload for:', file.name, 'Size:', file.size);
    
    const initiated = await initiateUpload(file);
    console.log('[Media Upload] Initiated:', initiated);
    
    const parts: UploadedPart[] = [];
    let uploadedBytes = 0;

    try {
      const totalParts = Math.ceil(file.size / partSize);
      console.log('[Media Upload] Total parts:', totalParts);

      for (let index = 0; index < totalParts; index++) {
        const partNumber = index + 1;
        const start = index * partSize;
        const end = Math.min(start + partSize, file.size);
        const blob = file.slice(start, end);

        console.log(`[Media Upload] Getting presigned URL for part ${partNumber}...`);
        const { presigned_url } = await getPartUrl({
          mediaId: initiated.id,
          uploadId: initiated.upload_id,
          partNumber,
        });

        console.log(`[Media Upload] Uploading part ${partNumber} to storage...`);
        const etag = await uploadPart({
          presignedUrl: presigned_url,
          blob,
        });

        console.log(`[Media Upload] Part ${partNumber} uploaded, ETag:`, etag);
        parts.push({
          part_number: partNumber,
          etag,
        });

        uploadedBytes += blob.size;
        params.onProgress?.({
          uploadedBytes,
          totalBytes: file.size,
          percentage: Math.round((uploadedBytes / file.size) * 100),
        });
      }

      console.log('[Media Upload] Completing upload...');
      const result = await completeUpload({
        mediaId: initiated.id,
        uploadId: initiated.upload_id,
        parts,
      });
      
      console.log('[Media Upload] Upload completed successfully:', result);
      return result;
    } catch (error) {
      console.error('[Media Upload] Upload failed:', error);
      console.log('[Media Upload] Aborting upload...');
      
      await abortUpload({
        mediaId: initiated.id,
        uploadId: initiated.upload_id,
      }).catch((abortError) => {
        console.error('[Media Upload] Abort failed:', abortError);
      });
      
      throw error;
    }
  }

  return {
    initiateUpload,
    getPartUrl,
    uploadPart,
    completeUpload,
    abortUpload,
    getMedia,
    getDownloadUrl,
    deleteMedia,
    uploadFile,
  };
}
