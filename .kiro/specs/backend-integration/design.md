# Design Document: Backend Integration

## Overview

This document describes the technical design for integrating the Next.js 15.1.4 / React 19 / TypeScript frontend with a real backend REST API. The integration replaces the current mock localStorage-based authentication (`AuthContext.tsx`) and hardcoded constants (`MOCK_SCHOOLS`, `MOCK_BRANCHES`, `MOCK_ADMINS`) with a production-ready API client layer, token management system, typed data-fetching hooks, and an incremental migration path controlled by feature flags.

### Goals

- Centralized, type-safe HTTP client with request/response interceptors
- Secure token lifecycle management (store, refresh, clear)
- Consistent error handling and loading state patterns across all features
- Data-fetching hooks for schools, branches, analytics, billing, settings, and onboarding
- Request retry with exponential backoff, cancellation via `AbortController`, and in-memory caching
- Feature flags enabling incremental migration without breaking existing functionality

### Non-Goals

- Server-side rendering of authenticated data (all API calls remain client-side for now)
- Real-time / WebSocket communication
- Offline support beyond in-memory caching

---

## Architecture

The integration introduces a layered architecture sitting between the React component tree and the backend API.

```
┌─────────────────────────────────────────────────────────────┐
│                    React Component Tree                      │
│  (pages, feature components, AuthContext)                    │
└────────────────────────┬────────────────────────────────────┘
                         │ uses
┌────────────────────────▼────────────────────────────────────┐
│                  Data-Fetching Hooks Layer                   │
│  useSchools · useBranches · useAnalytics · useBilling        │
│  useSettings · useOnboarding · useAuth (real)                │
└────────────────────────┬────────────────────────────────────┘
                         │ calls
┌────────────────────────▼────────────────────────────────────┐
│                    API Service Layer                         │
│  schoolsApi · branchesApi · analyticsApi · billingApi        │
│  settingsApi · onboardingApi · authApi                       │
└────────────────────────┬────────────────────────────────────┘
                         │ uses
┌────────────────────────▼────────────────────────────────────┐
│                    API Client Core                           │
│  apiClient (fetch wrapper) · RequestInterceptor              │
│  ResponseInterceptor · RetryLogic · CacheManager             │
│  TokenManager · ErrorHandler                                 │
└────────────────────────┬────────────────────────────────────┘
                         │ reads
┌────────────────────────▼────────────────────────────────────┐
│              Environment Configuration                       │
│  NEXT_PUBLIC_API_BASE_URL · NEXT_PUBLIC_API_TIMEOUT          │
│  GEMINI_API_KEY · GOOGLE_MAPS_PLATFORM_KEY                   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
  lib/
    api/
      client.ts          # Core fetch wrapper, interceptors, retry, timeout
      cache.ts           # In-memory cache manager
      errors.ts          # Error normalization and ApiError class
      tokenManager.ts    # Token storage, retrieval, refresh
      config.ts          # Environment config validation
      logger.ts          # Dev-mode request/response logger
    services/
      authApi.ts
      schoolsApi.ts
      branchesApi.ts
      analyticsApi.ts
      billingApi.ts
      settingsApi.ts
      onboardingApi.ts
    hooks/
      useApiRequest.ts   # Base hook: loading, error, data, cancellation
      useAuth.ts         # Replaces mock AuthContext login/logout
      useSchools.ts
      useBranches.ts
      useAnalytics.ts
      useBilling.ts
      useSettings.ts
      useOnboarding.ts
    types/
      api.ts             # Shared request/response type contracts
      auth.ts
      schools.ts
      branches.ts
      analytics.ts
      billing.ts
      settings.ts
      onboarding.ts
  config/
    featureFlags.ts      # Feature flag definitions and reader
```

---

## Components and Interfaces

### 1. Environment Configuration (`src/lib/api/config.ts`)

Validates required environment variables at module load time and exports a typed config object.

```typescript
export interface AppConfig {
  apiBaseUrl: string;       // NEXT_PUBLIC_API_BASE_URL
  apiTimeout: number;       // NEXT_PUBLIC_API_TIMEOUT (ms, default 30000)
  geminiApiKey: string;     // GEMINI_API_KEY
  googleMapsKey: string;    // GOOGLE_MAPS_PLATFORM_KEY
}

export function validateConfig(): AppConfig;
// Throws ConfigError listing all missing variables if any are absent.
```

`next.config.mjs` is updated to expose `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_TIMEOUT` alongside existing keys.

### 2. Token Manager (`src/lib/api/tokenManager.ts`)

Manages the auth token lifecycle. In a Next.js app, httpOnly cookies are set by the backend on the `/api/auth/login` response. The client reads a non-sensitive session indicator from a regular cookie or `sessionStorage` to know whether a session exists, while the actual token travels only in httpOnly cookies (sent automatically by the browser).

```typescript
export interface TokenManager {
  getAccessToken(): string | null;
  setAccessToken(token: string): void;
  clearTokens(): void;
  refreshAccessToken(): Promise<string>;
  isTokenExpired(): boolean;
}
```

Token storage strategy:
- **Primary**: httpOnly cookie set by the backend (not readable by JS — browser sends it automatically)
- **Session indicator**: `sessionStorage` key `org-session` stores `{ userId, expiresAt }` (no sensitive data)
- **Fallback**: If httpOnly cookies are unavailable (e.g., cross-origin dev setup), store access token in `sessionStorage` with a warning log

### 3. API Client Core (`src/lib/api/client.ts`)

A thin wrapper around the native `fetch` API. Does not introduce Axios to keep the bundle lean.

```typescript
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
  skipAuth?: boolean;
  skipCache?: boolean;
  cacheKey?: string;
  cacheTtlMs?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export async function apiRequest<T>(config: RequestConfig): Promise<ApiResponse<T>>;
```

**Request Interceptor pipeline** (applied before every fetch):
1. Attach `Authorization: Bearer <token>` header (unless `skipAuth: true`)
2. Set `Content-Type: application/json` for requests with a body
3. Append query parameters to URL
4. Log request in development mode

**Response Interceptor pipeline** (applied to every response):
1. Check HTTP status — throw `ApiError` for non-2xx
2. Parse JSON body
3. Log response in development mode
4. On 401: call `tokenManager.refreshAccessToken()` once; if refresh fails, clear session and redirect to `/login`

### 4. Error Handling (`src/lib/api/errors.ts`)

```typescript
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
  message: string;           // User-friendly message
  fieldErrors?: FieldError[]; // Present for 422 responses
  originalStatus?: number;
}

export class ApiError extends Error {
  readonly normalized: NormalizedError;
  constructor(normalized: NormalizedError);
}

export function normalizeError(raw: unknown): NormalizedError;
```

Status-to-code mapping:
| HTTP Status | Code | User Message |
|---|---|---|
| Network failure | `NETWORK_ERROR` | "Connection issue. Check your internet and try again." |
| 401 | `UNAUTHORIZED` | (triggers redirect, no toast) |
| 403 | `FORBIDDEN` | "You don't have permission to access this resource." |
| 404 | `NOT_FOUND` | "The requested resource was not found." |
| 408 / timeout | `TIMEOUT` | "The request timed out. Please try again." |
| 422 | `VALIDATION_ERROR` | "Please correct the highlighted fields." |
| 5xx | `SERVER_ERROR` | "Something went wrong on our end. Please try again shortly." |
| Cancelled | `CANCELLED` | (silent — no UI update) |

### 5. Retry Logic (`src/lib/api/client.ts`)

Retry is implemented inside `apiRequest` before returning to the caller.

```typescript
export interface RetryConfig {
  maxAttempts: number;       // default 3
  baseDelayMs: number;       // default 1000
  retryableStatuses: number[]; // default [408, 429, 500, 502, 503, 504]
}
```

Algorithm:
- Attempt 1 → on failure, check if status is retryable
- If retryable: wait `baseDelayMs * 2^(attempt-1)` ms (1s, 2s, 4s)
- After `maxAttempts` exhausted: throw `ApiError`
- 4xx codes (except 408, 429) are never retried

### 6. Cache Manager (`src/lib/api/cache.ts`)

In-memory cache keyed by a string cache key (typically `method:path:params`).

```typescript
export interface CacheEntry<T> {
  data: T;
  expiresAt: number; // Date.now() + ttl
}

export interface CacheManager {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttlMs: number): void;
  invalidate(keyPattern: string | RegExp): void;
  clear(): void;
}
```

- Default TTL: 5 minutes for list endpoints, 2 minutes for detail endpoints
- Mutation operations (POST/PUT/PATCH/DELETE) call `invalidate` with the resource prefix (e.g., `invalidate(/^GET:\/schools/)`)
- `clear()` is called on logout

### 7. Logger (`src/lib/api/logger.ts`)

```typescript
export interface ApiLogger {
  logRequest(config: RequestConfig, startTime: number): void;
  logResponse(config: RequestConfig, response: ApiResponse<unknown>, durationMs: number): void;
  logError(config: RequestConfig, error: unknown, durationMs: number): void;
}
```

- Active only when `process.env.NODE_ENV === 'development'`
- Redacts `Authorization` header values and `password` fields from logged payloads
- Logs timing: `[API] GET /schools → 200 (142ms)`

### 8. Base Data-Fetching Hook (`src/lib/hooks/useApiRequest.ts`)

All feature hooks are built on top of this base hook.

```typescript
export interface UseApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: NormalizedError | null;
}

export interface UseApiRequestOptions<T> {
  immediate?: boolean;        // auto-fetch on mount (default true)
  onSuccess?: (data: T) => void;
  onError?: (error: NormalizedError) => void;
}

export function useApiRequest<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  options?: UseApiRequestOptions<T>
): UseApiRequestState<T> & {
  refetch: () => void;
  reset: () => void;
};
```

- Creates an `AbortController` on each fetch; cancels on component unmount or re-fetch
- Sets `loading: true` before fetch, `loading: false` in finally block
- Ignores `CANCELLED` errors (does not update error state)
- Prevents duplicate in-flight requests via a `pendingRef`

### 9. Feature Flags (`src/config/featureFlags.ts`)

```typescript
export interface FeatureFlags {
  useRealAuth: boolean;
  useRealSchools: boolean;
  useRealBranches: boolean;
  useRealAnalytics: boolean;
  useRealBilling: boolean;
  useRealSettings: boolean;
  useRealOnboarding: boolean;
}

export function getFeatureFlags(): FeatureFlags;
// Reads from NEXT_PUBLIC_FF_* environment variables, defaults to false
```

Each data-fetching hook checks the relevant flag and falls back to mock data when disabled.

---

## Data Models

### API Type Contracts (`src/lib/types/`)

All types are defined as TypeScript interfaces. The backend is expected to conform to these contracts; a future step can generate them from an OpenAPI schema.

#### Auth (`src/lib/types/auth.ts`)

```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp
  user: ApiUser;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'viewer';
  onboardingComplete: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresAt: number;
}
```

#### Schools (`src/lib/types/schools.ts`)

```typescript
export interface ApiSchool {
  id: string;
  name: string;
  logoUrl: string;
  location: string;
  studentCount: number;
  staffCount: number;
  description?: string;
  website?: string;
  createdAt: string; // ISO 8601
}

export interface CreateSchoolRequest {
  name: string;
  location: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  phoneNumber?: string;
}

export interface UpdateSchoolRequest extends Partial<CreateSchoolRequest> {}

export interface SchoolsListResponse {
  schools: ApiSchool[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### Branches (`src/lib/types/branches.ts`)

```typescript
export interface ApiBranch {
  id: string;
  schoolId: string;
  name: string;
  address: string;
  city: string;
  studentCount: number;
  teacherCount: number;
  capacity: number;
  performanceHistory: number[];
}

export interface CreateBranchRequest {
  schoolId: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
}

export interface ApiAdmin {
  id: string;
  branchId: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  email: string;
}
```

#### Analytics (`src/lib/types/analytics.ts`)

```typescript
export interface AnalyticsQueryParams {
  startDate: string; // ISO 8601 date
  endDate: string;
  granularity: 'day' | 'week' | 'month';
}

export interface AnalyticsDataPoint {
  period: string;
  students: number;
  revenue: number;
  activeSessions: number;
}

export interface AnalyticsResponse {
  dataPoints: AnalyticsDataPoint[];
  summary: {
    totalStudents: number;
    totalStaff: number;
    activeSessions: number;
    monthlyRevenue: number;
    studentsTrend: number;   // percentage change
    staffTrend: number;
    revenueTrend: number;
  };
}

// Chart-ready format (output of transform function)
export interface ChartDataPoint {
  name: string;
  students: number;
  revenue: number;
}
```

#### Billing (`src/lib/types/billing.ts`)

```typescript
export interface BillingInfo {
  currentPlan: SubscriptionPlan;
  paymentMethod: PaymentMethod;
  billingContact: BillingContact;
  nextRenewalDate: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number | null; // null = custom/enterprise
  features: string[];
}

export interface PaymentMethod {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface BillingContact {
  email: string;
  taxId?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amountCents: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
}
```

#### Settings (`src/lib/types/settings.ts`)

```typescript
export interface UserSettings {
  organizationName: string;
  organizationId: string;
  contactEmail: string;
  owner: OwnerProfile;
  notifications: NotificationPreferences;
}

export interface OwnerProfile {
  name: string;
  title: string;
  email: string;
}

export interface NotificationPreferences {
  emailDigest: boolean;
  smsCritical: boolean;
  systemPush: boolean;
  eventSubscriptions: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

#### Onboarding (`src/lib/types/onboarding.ts`)

```typescript
export interface OnboardingDetailsRequest {
  tradeName: string;
  licenseNumber: string;
  taxId: string;
  displayName: string;
  ownerName: string;
  adminEmail: string;
  phoneNumber: string;
  region: string;
  city: string;
  address: string;
  coordinates?: { lat: number; lng: number };
}

export interface PlanSelectionRequest {
  planId: 'BASIC' | 'PRO' | 'UNLIMITED';
}

export interface OnboardingCompleteRequest {
  organizationDetails: OnboardingDetailsRequest;
  planId: string;
}

export interface OnboardingStatusResponse {
  step: 'details' | 'plan' | 'complete';
  organizationId?: string;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Request interceptor always attaches auth token

*For any* outgoing API request config (any method, path, or body), when an auth token is present in the token manager, the request interceptor SHALL attach an `Authorization: Bearer <token>` header to the request.

**Validates: Requirements 1.3**

---

### Property 2: Error normalization produces consistent shape

*For any* raw API error response (any HTTP status code, any error body structure), the `normalizeError` function SHALL always return an object with a non-empty `code` field and a non-empty `message` field conforming to the `NormalizedError` interface.

**Validates: Requirements 5.7**

---

### Property 3: Validation errors are fully surfaced

*For any* 422 response containing a map of field names to error messages, the normalized error SHALL contain a `fieldErrors` array where every field from the API response is represented with its corresponding message.

**Validates: Requirements 5.6**

---

### Property 4: Duplicate requests are suppressed

*For any* data-fetching hook, if a request is already in-flight (loading is true), triggering the same fetch again SHALL NOT initiate a second network request.

**Validates: Requirements 6.4**

---

### Property 5: School creation round-trip preserves server response

*For any* valid `CreateSchoolRequest` payload, after a successful create call, the local schools state SHALL contain an entry whose fields match the `ApiSchool` object returned by the server (not the locally-constructed object).

**Validates: Requirements 7.2**

---

### Property 6: School deletion removes the school from state

*For any* list of schools and any school ID present in that list, after a successful delete call for that ID, the local schools state SHALL NOT contain a school with that ID.

**Validates: Requirements 7.4**

---

### Property 7: Analytics transform always produces valid chart data

*For any* `AnalyticsResponse` returned by the API (including responses with missing or null fields), the `transformAnalyticsToChartData` function SHALL return an array of `ChartDataPoint` objects where every entry has a non-null `name`, `students`, and `revenue` field.

**Validates: Requirements 9.3**

---

### Property 8: Settings validation rejects invalid data before API call

*For any* settings update object that violates the validation rules (e.g., empty organization name, malformed email), the settings service SHALL reject the request and NOT make a network call.

**Validates: Requirements 11.4**

---

### Property 9: Onboarding data is preserved after submission failure

*For any* `OrganizationDetails` object, if the onboarding submission API call fails, the onboarding hook's form data state SHALL remain equal to the original submitted data (no data loss on retry).

**Validates: Requirements 12.5**

---

### Property 10: Retry count is bounded for timeout failures

*For any* API request that fails with a network timeout, the retry logic SHALL attempt the request at most `maxAttempts` times (default 3) and SHALL NOT make more than `maxAttempts` total network calls.

**Validates: Requirements 14.1**

---

### Property 11: Exponential backoff delays are correct

*For any* sequence of retry attempts triggered by a 5xx response, the delay before attempt `n` SHALL be `baseDelayMs * 2^(n-1)` milliseconds, producing a strictly increasing sequence.

**Validates: Requirements 14.2**

---

### Property 12: 4xx errors (except 408 and 429) are never retried

*For any* HTTP status code in the range 400–499 excluding 408 and 429, the retry logic SHALL make exactly one network call and SHALL NOT retry.

**Validates: Requirements 14.3**

---

### Property 13: Component unmount cancels in-flight requests

*For any* data-fetching hook with an active request, when the component unmounts, the hook SHALL call `AbortController.abort()` and SHALL NOT update component state after cancellation.

**Validates: Requirements 15.1, 15.4**

---

### Property 14: GET responses are served from cache on repeat calls

*For any* GET request that has been made at least once and whose cache entry has not expired, making the same request again SHALL return the cached data and SHALL NOT make a new network call.

**Validates: Requirements 16.1, 16.2**

---

### Property 15: Mutation invalidates related cache entries

*For any* successful POST, PUT, PATCH, or DELETE request to a resource path, all cache entries whose keys match that resource prefix SHALL be invalidated, causing the next GET for that resource to make a fresh network call.

**Validates: Requirements 16.3**

---

### Property 16: Feature flag disabled falls back to mock data

*For any* feature whose flag is set to `false`, the corresponding data-fetching hook SHALL return mock data and SHALL NOT make any network calls to the backend API.

**Validates: Requirements 18.3**

---

### Property 17: Token storage round-trip

*For any* valid access token string, storing it via `tokenManager.setAccessToken()` and then immediately retrieving it via `tokenManager.getAccessToken()` SHALL return the original token string unchanged.

**Validates: Requirements 3.1, 3.4**

---

## Error Handling

### Error Flow

```
API call fails
     │
     ▼
normalizeError(raw)
     │
     ├─ CANCELLED → discard silently (no state update)
     │
     ├─ UNAUTHORIZED (401) → tokenManager.refreshAccessToken()
     │       ├─ success → retry original request once
     │       └─ failure → clearTokens() + router.push('/login')
     │
     ├─ VALIDATION_ERROR (422) → surface fieldErrors to form
     │
     └─ all others → set error state in hook → UI renders error message
```

### Component-Level Error Display

Each data-fetching hook exposes `error: NormalizedError | null`. Components render errors using a shared `<ApiErrorMessage error={error} />` component that maps `NormalizedError.code` to the appropriate user-facing string.

Loading indicators use `aria-busy="true"` and `role="status"` for accessibility.

### Global 401 Handler

The response interceptor handles 401 globally. Individual hooks do not need to handle session expiry — it is transparent to them.

---

## Testing Strategy

### Dual Testing Approach

Both unit/example tests and property-based tests are used. Unit tests cover specific scenarios and integration points; property tests verify universal invariants across generated inputs.

### Property-Based Testing Library

**[fast-check](https://github.com/dubzzz/fast-check)** is the chosen PBT library for TypeScript. It integrates with any test runner (Jest / Vitest) and provides rich arbitraries for generating typed inputs.

Install: `npm install --save-dev fast-check`

Each property test runs a minimum of **100 iterations** (fast-check default). Tests are tagged with a comment referencing the design property:

```typescript
// Feature: backend-integration, Property 2: Error normalization produces consistent shape
it('normalizeError always returns consistent NormalizedError shape', () => {
  fc.assert(
    fc.property(arbitraryRawApiError(), (raw) => {
      const result = normalizeError(raw);
      expect(result.code).toBeTruthy();
      expect(result.message).toBeTruthy();
    }),
    { numRuns: 100 }
  );
});
```

### Unit / Example Tests

- `config.ts`: missing env vars throw `ConfigError` naming the missing variable
- `tokenManager.ts`: store/retrieve/clear lifecycle; expired token detection; refresh flow
- `client.ts`: request interceptor attaches headers; response interceptor handles each status code
- `errors.ts`: each HTTP status maps to the correct `ApiErrorCode` and user message
- `useApiRequest.ts`: loading state transitions; cancellation on unmount; duplicate request suppression
- Each service (`schoolsApi`, etc.): correct endpoint paths and HTTP methods
- Each feature hook: correct integration with service layer and feature flags

### Integration Tests

- Token storage mechanism (httpOnly cookie vs sessionStorage fallback)
- Full auth flow: login → token stored → authenticated request → logout → token cleared
- 401 refresh flow: expired token → refresh → retry → success

### Test File Locations

Tests live alongside source files using the `.test.ts` / `.test.tsx` convention:

```
src/lib/api/client.test.ts
src/lib/api/errors.test.ts
src/lib/api/tokenManager.test.ts
src/lib/api/cache.test.ts
src/lib/hooks/useApiRequest.test.ts
src/lib/services/schoolsApi.test.ts
...
```
