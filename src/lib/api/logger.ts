/**
 * Development-only API request/response logger.
 * Redacts sensitive fields in production.
 */

const isDev = process.env.NODE_ENV === 'development';

const REDACTED_KEYS = new Set(['authorization', 'password', 'token', 'secret', 'x-api-key']);

function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    result[key] = REDACTED_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : value;
  }
  return result;
}

function redactBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    result[key] = REDACTED_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : value;
  }
  return result;
}

export const apiLogger = {
  logRequest(method: string, url: string, headers: Record<string, string>, body?: unknown): void {
    if (!isDev) return;
    console.groupCollapsed(`[API →] ${method} ${url}`);
    console.log('Headers:', redactHeaders(headers));
    if (body) console.log('Body:', redactBody(body));
    console.groupEnd();
  },

  logResponse(method: string, url: string, status: number, data: unknown, durationMs: number): void {
    if (!isDev) return;
    const color = status >= 400 ? 'color: #ef4444' : 'color: #10b981';
    console.groupCollapsed(`[API ←] ${method} ${url} → %c${status}%c (${durationMs}ms)`, color, '');
    console.log('Response:', data);
    console.groupEnd();
  },

  logError(method: string, url: string, error: unknown, durationMs: number): void {
    if (!isDev) return;
    console.groupCollapsed(`[API ✗] ${method} ${url} (${durationMs}ms)`);
    console.error('Error:', error);
    console.groupEnd();
  },
};
