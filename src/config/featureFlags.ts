/**
 * Feature flags for incremental backend migration.
 *
 * Set the corresponding NEXT_PUBLIC_FF_* env var to "true" to enable real API calls.
 * When false (default), the app falls back to mock data — keeping everything working
 * before the backend is ready.
 *
 * Example .env.local:
 *   NEXT_PUBLIC_FF_REAL_AUTH=true
 *   NEXT_PUBLIC_FF_REAL_SCHOOLS=true
 */

function flag(key: string): boolean {
  return process.env[key] === 'true';
}

export const featureFlags = {
  useRealAuth: flag('NEXT_PUBLIC_FF_REAL_AUTH'),
  useRealSchools: flag('NEXT_PUBLIC_FF_REAL_SCHOOLS'),
  useRealBranches: flag('NEXT_PUBLIC_FF_REAL_BRANCHES'),
  useRealAnalytics: flag('NEXT_PUBLIC_FF_REAL_ANALYTICS'),
  useRealBilling: flag('NEXT_PUBLIC_FF_REAL_BILLING'),
  useRealSettings: flag('NEXT_PUBLIC_FF_REAL_SETTINGS'),
  useRealOnboarding: flag('NEXT_PUBLIC_FF_REAL_ONBOARDING'),
};
