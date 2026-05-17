/**
 * Core API client — thin fetch wrapper with:
 * - Request/response interceptors
 * - Auth token attachment
 * - Retry with exponential backoff
 * - In-memory caching for GET requests
 * - AbortController support
 * - Dev-mode logging
 */

import { appConfig } from './config';
import { ApiError, normalizeError } from './errors';
import { tokenManager } from './tokenManager';
import { apiLogger } from './logger';
import { cacheManager, DEFAULT_TTL_MS } from './cache';

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
  /** Skip attaching Authorization header (e.g. login, refresh) */
  skipAuth?: boolean;
  /** Skip reading/writing cache */
  skipCache?: boolean;
  /** Custom cache key (defaults to method:path:params) */
  cacheKey?: string;
  /** Cache TTL in ms (defaults to DEFAULT_TTL_MS) */
  cacheTtlMs?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

function buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
  const base = appConfig.apiBaseUrl.replace(/\/$/, '');
  const url = new URL(`${base}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function buildCacheKey(config: RequestConfig): string {
  if (config.cacheKey) return config.cacheKey;
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${config.method}:${config.path}:${params}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attemptFetch<T>(
  url: string,
  fetchOptions: RequestInit,
  config: RequestConfig,
): Promise<ApiResponse<T>> {
  const start = Date.now();
  const method = config.method;

  apiLogger.logRequest(method, url, fetchOptions.headers as Record<string, string>, config.body);

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    const duration = Date.now() - start;
    apiLogger.logError(method, url, err, duration);
    throw new ApiError(normalizeError(err));
  }

  const duration = Date.now() - start;

  let data: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  apiLogger.logResponse(method, url, response.status, data, duration);

  if (!response.ok) {
    // Extract field errors from 422 responses
    let fieldErrors: { field: string; message: string }[] | undefined;
    if (response.status === 422 && data && typeof data === 'object') {
      const errData = data as Record<string, unknown>;
      if (errData.errors && typeof errData.errors === 'object') {
        fieldErrors = Object.entries(errData.errors as Record<string, string>).map(
          ([field, message]) => ({ field, message }),
        );
      }
    }

    const normalized = normalizeError(null, response.status);
    if (fieldErrors) normalized.fieldErrors = fieldErrors;
    throw new ApiError(normalized);
  }

  return { data: data as T, status: response.status };
}

export async function apiRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
  const url = buildUrl(config.path, config.params);
  const cacheKey = buildCacheKey(config);

  // Serve from cache for GET requests
  if (config.method === 'GET' && !config.skipCache) {
    const cached = cacheManager.get<T>(cacheKey);
    if (cached !== null) {
      return { data: cached, status: 200 };
    }
  }

  // Build headers
  const headers: Record<string, string> = {};
  if (config.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (!config.skipAuth) {
    const token = tokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // If no token in sessionStorage, the browser will send httpOnly cookies automatically
  }

  const fetchOptions: RequestInit = {
    method: config.method,
    headers,
    credentials: 'include', // Always send cookies (for httpOnly cookie auth)
    signal: config.signal,
  };

  if (config.body) {
    fetchOptions.body = JSON.stringify(config.body);
  }

  // Retry loop
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await attemptFetch<T>(url, fetchOptions, config);

      // Cache successful GET responses
      if (config.method === 'GET' && !config.skipCache) {
        cacheManager.set(cacheKey, result.data, config.cacheTtlMs ?? DEFAULT_TTL_MS);
      }

      // Invalidate cache for mutations
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method)) {
        cacheManager.invalidate(`GET:${config.path}`);
      }

      return result;
    } catch (err) {
      // Never retry cancelled requests
      if (err instanceof ApiError && err.normalized.code === 'CANCELLED') throw err;

      // Never retry 4xx (except 408 and 429)
      if (err instanceof ApiError && err.normalized.originalStatus !== undefined) {
        const status = err.normalized.originalStatus;
        if (status >= 400 && status < 500 && !RETRYABLE_STATUSES.has(status)) {
          throw err;
        }
      }

      lastError = err;

      if (attempt < MAX_ATTEMPTS) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
