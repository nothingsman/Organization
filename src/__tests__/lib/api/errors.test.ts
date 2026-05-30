import { describe, it, expect } from 'vitest';
import { ApiError, normalizeError } from '@/lib/api/errors';

describe('normalizeError', () => {
  it('handles abort error (Cancelled)', () => {
    const domException = new DOMException('Aborted', 'AbortError');
    const result = normalizeError(domException);
    expect(result.code).toBe('CANCELLED');
    expect(result.message).toBe('Request was cancelled.');
  });

  it('passes through an already-normalized ApiError', () => {
    const apiError = new ApiError({
      code: 'NOT_FOUND',
      message: 'Resource not found',
      originalStatus: 404,
    });
    const result = normalizeError(apiError);
    expect(result.code).toBe('NOT_FOUND');
    expect(result.message).toBe('Resource not found');
    expect(result.originalStatus).toBe(404);
  });

  it('handles network TypeError', () => {
    const typeError = new TypeError('Failed to fetch');
    const result = normalizeError(typeError);
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toBe('Connection issue. Check your internet and try again.');
  });

  it('maps 401 status', () => {
    const result = normalizeError({}, 401);
    expect(result.code).toBe('UNAUTHORIZED');
    expect(result.message).toBe('Your session has expired. Please log in again.');
  });

  it('maps 403 status', () => {
    const result = normalizeError({}, 403);
    expect(result.code).toBe('FORBIDDEN');
  });

  it('maps 404 status', () => {
    const result = normalizeError({}, 404);
    expect(result.code).toBe('NOT_FOUND');
  });

  it('maps 422 status', () => {
    const result = normalizeError({}, 422);
    expect(result.code).toBe('VALIDATION_ERROR');
  });

  it('maps 500 status', () => {
    const result = normalizeError({}, 500);
    expect(result.code).toBe('SERVER_ERROR');
  });

  it('handles 400 status without specific mapping', () => {
    const result = normalizeError({ detail: 'Bad request' }, 400);
    expect(result.code).toBe('UNKNOWN');
    expect(result.message).toBe('Bad request');
    expect(result.originalStatus).toBe(400);
  });

  it('extracts field errors from array-style error payload', () => {
    const raw = {
      errors: [
        { field: 'email', detail: 'Enter a valid email address.', code: 'invalid' },
        { field: 'password', detail: 'This password is too short.', code: 'invalid' },
      ],
    };
    const result = normalizeError(raw, 400);
    expect(result.fieldErrors).toHaveLength(2);
    expect(result.fieldErrors![0]).toEqual({ field: 'email', message: 'Enter a valid email address.' });
    expect(result.fieldErrors![1]).toEqual({ field: 'password', message: 'This password is too short.' });
  });

  it('extracts field errors from object-style error payload', () => {
    const raw = {
      errors: {
        email: 'Enter a valid email address.',
        password: 'This password is too short.',
      },
    };
    const result = normalizeError(raw, 400);
    expect(result.fieldErrors).toHaveLength(2);
  });

  it('extracts detail string from payload', () => {
    const result = normalizeError({ detail: 'Invalid credentials.' }, 401);
    expect(result.message).toBe('Invalid credentials.');
  });

  it('extracts message string from payload', () => {
    const result = normalizeError({ message: 'Something went wrong.' }, 500);
    expect(result.message).toBe('Something went wrong.');
  });

  it('uses default message for unknown status >= 500', () => {
    const result = normalizeError({}, 503);
    expect(result.code).toBe('SERVER_ERROR');
    expect(result.message).toBe('Service temporarily unavailable. Please try again shortly.');
  });

  it('falls back to Error.message for non-API errors', () => {
    const result = normalizeError(new Error('Oops!'));
    expect(result.code).toBe('UNKNOWN');
    expect(result.message).toBe('Oops!');
  });

  it('returns fallback message for unrecognized input', () => {
    const result = normalizeError(null);
    expect(result.code).toBe('UNKNOWN');
    expect(result.message).toBe('An unexpected error occurred. Please try again.');
  });
});

describe('ApiError', () => {
  it('creates an error with normalized data', () => {
    const normalized = { code: 'NOT_FOUND' as const, message: 'Not found', originalStatus: 404 };
    const error = new ApiError(normalized);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.normalized).toEqual(normalized);
    expect(error.message).toBe('Not found');
  });
});
