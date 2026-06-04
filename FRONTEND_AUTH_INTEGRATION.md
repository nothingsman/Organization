# Frontend Auth Integration Guide

This file documents only the frontend-consumed auth flows implemented by this backend.

It covers:

- signup
- email activation
- JWT login, refresh, and verify
- password reset
- organization approval magic-link login
- authenticated user/profile endpoints

It does not cover the server-rendered `/accounts/` browser/session flow.

## 1. Base Rules

### 1.1 Auth roots

- auth endpoints live under `/auth/`
- authenticated profile endpoints live under `/api/users/`

### 1.2 Auth method

Protected API endpoints require JWT auth by default.

Send:

```http
Authorization: Bearer <access_token>
```

The backend also accepts `JWT <token>`, but `Bearer` should be the frontend default.

### 1.3 Error shape

Errors are normalized into this format:

```json
{
  "errors": [
    {
      "code": "bad_request",
      "detail": "Human-readable message",
      "field": "email"
    }
  ]
}
```

Notes:

- `field` may be `null`
- auth failures may use codes such as `not_authenticated`, `no_active_account`, or `organization_not_verified`
- frontend logic should prefer `errors[0].code` over raw status text

## 2. Signup

Endpoint:

- `POST /auth/users/`

Authentication:

- not required

Request payload:

```json
{
  "email": "user@example.com",
  "password": "strong-password-123",
  "name": "First Name",
  "father_name": "Father Name",
  "grandfather_name": "Grandfather Name",
  "phone_number": "+15555550123",
  "address": "123 Main Street",
  "role": "ORGANIZATION"
}
```

Field notes:

- `username` is not used
- `email` is the login identifier
- `address` is optional
- `role` is allowed by the current serializer
- privileged fields are rejected during signup

Rejected privileged fields include:

- `verified_at`
- `is_staff`
- `is_superuser`
- `is_active`
- `groups`
- `user_permissions`

Success:

- expected status: `201 Created`
- response contains the created user payload

Frontend handling:

- treat signup as account creation only
- if activation email is enabled, continue into the activation flow before normal login

## 3. Email Activation

Backend endpoints:

- `POST /auth/users/activation/`
- `POST /auth/users/resend_activation/`

Authentication:

- not required

Frontend route expected by backend emails:

```text
/activate/:uid/:token
```

Activation request payload:

```json
{
  "uid": "<uid>",
  "token": "<token>"
}
```

Frontend flow:

1. Read `uid` and `token` from the frontend route.
2. Submit them to `/auth/users/activation/`.
3. On success, move to login or directly into the normal post-activation auth flow.

Resend activation:

- use `POST /auth/users/resend_activation/`
- send the user email in the request body

Frontend handling:

- treat invalid or expired activation links as terminal states for that page
- offer resend activation when appropriate

## 4. JWT Login

Endpoints:

- `POST /auth/jwt/create/`
- `POST /auth/jwt/refresh/`
- `POST /auth/jwt/verify/`

### 4.1 Create token pair

Request payload:

```json
{
  "email": "user@example.com",
  "password": "strong-password-123"
}
```

Success response:

```json
{
  "access": "<jwt-access-token>",
  "refresh": "<jwt-refresh-token>"
}
```

Expected status:

- `200 OK`

Known failure codes:

- `no_active_account`
- `organization_not_verified`

Organization-specific behavior:

- non-organization roles use normal JWT login behavior
- organization users with zero organizations can log in normally
- organization users with at least one `ACTIVE + VERIFIED` organization can log in normally
- organization users with organizations but none `ACTIVE + VERIFIED` are blocked from login

Representative blocked-login response:

```json
{
  "errors": [
    {
      "code": "organization_not_verified",
      "detail": "Your organization account is pending verification approval.",
      "field": null
    }
  ]
}
```

Frontend handling:

1. Read `errors[0].code` first.
2. For `organization_not_verified`, show a dedicated pending-approval state.
3. For `no_active_account`, keep the normal invalid-credentials or inactive-account UI.
4. Only continue into the authenticated app when both `access` and `refresh` are present.

### 4.2 Refresh access token

Endpoint:

- `POST /auth/jwt/refresh/`

Request payload:

```json
{
  "refresh": "<jwt-refresh-token>"
}
```

Success response:

```json
{
  "access": "<new-jwt-access-token>"
}
```

Frontend handling:

- refresh once after a `401` from a protected API request
- if refresh fails, clear local auth state and require login

### 4.3 Verify token

Endpoint:

- `POST /auth/jwt/verify/`

Request payload:

```json
{
  "token": "<jwt-access-or-refresh-token>"
}
```

Frontend use:

- optional token validity check
- usually less important than the create and refresh flows

## 5. Password Reset

Endpoints:

- `POST /auth/users/reset_password/`
- `POST /auth/users/reset_password_confirm/`

Authentication:

- not required

Frontend route expected by backend emails:

```text
/reset-password/:uid/:token
```

### 5.1 Request reset email

Send the user email to:

- `POST /auth/users/reset_password/`

Frontend handling:

- render a password reset request form
- avoid revealing whether the email exists through UI copy

### 5.2 Confirm new password

Request payload:

```json
{
  "uid": "<uid>",
  "token": "<token>",
  "new_password": "new-strong-password"
}
```

Frontend flow:

1. Read `uid` and `token` from the reset route.
2. Render a new-password form.
3. Submit `uid`, `token`, and `new_password` to `/auth/users/reset_password_confirm/`.

Frontend handling:

- treat invalid or expired reset links as terminal states
- on success, redirect to login and clear any stale local auth state

## 6. Organization Approval Magic-Link Login

This is a custom auth flow for organization users who were previously blocked from JWT login until an organization becomes approved.

Backend endpoint:

- `POST /auth/organization-approval/exchange/`

Authentication:

- not required

Frontend route expected by backend emails:

```text
/organization-approval/:uid/:token
```

Request payload:

```json
{
  "uid": "<uid-from-route>",
  "token": "<token-from-route>"
}
```

Success response:

```json
{
  "access": "<jwt-access-token>",
  "refresh": "<jwt-refresh-token>"
}
```

Expected status:

- `200 OK`

Backend behavior:

- validates the encoded user id
- validates the approval login token
- rejects reused tokens
- rejects expired tokens
- rejects invalid tokens
- rejects users who are not organization users
- rejects organization users who are still not allowed to log in
- marks the token as used after a successful exchange

Frontend flow:

1. Read `uid` and `token` from the route.
2. Submit them to `/auth/organization-approval/exchange/`.
3. On success, store the returned JWT tokens.
4. Fetch `/api/users/me/` and continue into the authenticated app.

Frontend handling:

- treat this page as a one-time login handoff
- treat invalid, expired, or reused links as terminal states
- do not retry the same token automatically

## 7. Authenticated User Endpoints

These endpoints are self-scoped to the current authenticated user.

### 7.1 Current user

Preferred endpoint:

- `GET /api/users/me/`

Authentication:

- required

Success response:

```json
{
  "id": "uuid",
  "name": "First Name",
  "father_name": "Father Name",
  "grandfather_name": "Grandfather Name",
  "email": "user@example.com",
  "phone_number": "+15555550123",
  "address": "123 Main Street",
  "role": "ORGANIZATION",
  "verified_at": null,
  "created_at": "2026-05-25T00:00:00Z",
  "updated_at": "2026-05-25T00:00:00Z"
}
```

Use this endpoint:

- after login
- after organization approval exchange
- after profile update

### 7.2 Self-scoped list and detail

Supported endpoints:

- `GET /api/users/`
- `GET /api/users/{id}/`
- `PATCH /api/users/{id}/`

Important behavior:

- `GET /api/users/` returns only the current user in paginated form
- `GET /api/users/{id}/` only works for the current user’s own UUID
- this is not a global user directory

PATCH write fields:

- `name`
- `father_name`
- `grandfather_name`
- `email`
- `phone_number`
- `address`
- `password`

Frontend handling:

- use `/api/users/me/` as the default identity endpoint
- do not build UI assumptions around browsing other users

## 8. Recommended Frontend Auth Default

Use this default client strategy:

1. Sign in with `/auth/jwt/create/`.
2. Store both `access` and `refresh`.
3. Attach `Authorization: Bearer <access_token>` to protected requests.
4. On `401`, refresh once with `/auth/jwt/refresh/`.
5. If refresh fails, clear local auth state and require login.
6. Fetch `/api/users/me/` after successful auth entry points.

Logout note:

- there is no server-side JWT logout flow documented here
- frontend logout is local token disposal
