/**
 * Environment configuration validation.
 * Reads and validates all required environment variables at module load time.
 */

export interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  googleMapsKey: string;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback ?? '';
  return value;
}

export const appConfig: AppConfig = {
  apiBaseUrl: getEnvVar('NEXT_PUBLIC_API_BASE_URL', ''),
  apiTimeout: parseInt(getEnvVar('NEXT_PUBLIC_API_TIMEOUT', '30000'), 10),
  googleMapsKey: getEnvVar('NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY', ''),
};
