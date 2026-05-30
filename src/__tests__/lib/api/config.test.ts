import { describe, it, expect, beforeEach } from 'vitest';

const originalEnv = { ...process.env };

describe('appConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('uses environment variable for apiBaseUrl', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
    const { appConfig } = await import('@/lib/api/config');
    expect(appConfig.apiBaseUrl).toBe('https://api.example.com');
  });

  it('falls back to localhost default', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    const { appConfig } = await import('@/lib/api/config');
    expect(appConfig.apiBaseUrl).toBe('http://localhost:8000');
  });

  it('parses API timeout from environment', async () => {
    process.env.NEXT_PUBLIC_API_TIMEOUT = '15000';
    const { appConfig } = await import('@/lib/api/config');
    expect(appConfig.apiTimeout).toBe(15000);
  });

  it('defaults API timeout to 30000', async () => {
    delete process.env.NEXT_PUBLIC_API_TIMEOUT;
    const { appConfig } = await import('@/lib/api/config');
    expect(appConfig.apiTimeout).toBe(30000);
  });

  it('reads google maps key', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY = 'my-key';
    const { appConfig } = await import('@/lib/api/config');
    expect(appConfig.googleMapsKey).toBe('my-key');
  });

  it('defaults google maps key to empty string', async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY;
    const { appConfig } = await import('@/lib/api/config');
    expect(appConfig.googleMapsKey).toBe('');
  });
});
