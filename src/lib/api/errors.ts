/**
 * Centralized error normalization.
 * Maps raw API errors to a consistent NormalizedError shape.
 */

export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'CANCELLED'
  | 'UNKNOWN';

export interface FieldError {
  field: string;
  message: string;
}

export interface NormalizedError {
  code: ApiErrorCode;
  message: string;
  fieldErrors?: FieldError[];
  originalStatus?: number;
}

export class ApiError extends Error {
  readonly normalized: NormalizedError;

  constructor(normalized: NormalizedError) {
    super(normalized.message);
    this.name = 'ApiError';
    this.normalized = normalized;
  }
}

const STATUS_MESSAGES: Record<number, { code: ApiErrorCode; message: string }> = {
  401: { code: 'UNAUTHORIZED', message: 'Your session has expired. Please log in again.' },
  403: { code: 'FORBIDDEN', message: "You don't have permission to access this resource." },
  404: { code: 'NOT_FOUND', message: 'The requested resource was not found.' },
  408: { code: 'TIMEOUT', message: 'The request timed out. Please try again.' },
  422: { code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields.' },
  429: { code: 'SERVER_ERROR', message: 'Too many requests. Please wait a moment and try again.' },
  500: { code: 'SERVER_ERROR', message: 'Something went wrong on our end. Please try again shortly.' },
  502: { code: 'SERVER_ERROR', message: 'Something went wrong on our end. Please try again shortly.' },
  503: { code: 'SERVER_ERROR', message: 'Service temporarily unavailable. Please try again shortly.' },
  504: { code: 'SERVER_ERROR', message: 'The server took too long to respond. Please try again.' },
};

export function normalizeError(raw: unknown, status?: number): NormalizedError {
  // Cancelled request — silent
  if (raw instanceof DOMException && raw.name === 'AbortError') {
    return { code: 'CANCELLED', message: 'Request was cancelled.' };
  }

  // Already normalized
  if (raw instanceof ApiError) {
    return raw.normalized;
  }

  // Network failure (fetch throws TypeError for network errors)
  if (raw instanceof TypeError) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Connection issue. Check your internet and try again.',
    };
  }

  // HTTP status-based errors
  if (status !== undefined) {
    const mapped = STATUS_MESSAGES[status];
    if (mapped) {
      return { ...mapped, originalStatus: status };
    }
    if (status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: 'Something went wrong on our end. Please try again shortly.',
        originalStatus: status,
      };
    }
    if (status >= 400) {
      return {
        code: 'UNKNOWN',
        message: 'An unexpected error occurred. Please try again.',
        originalStatus: status,
      };
    }
  }

  // Fallback
  const message =
    raw instanceof Error ? raw.message : 'An unexpected error occurred. Please try again.';
  return { code: 'UNKNOWN', message };
}
