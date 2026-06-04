# Frontend API Integration Guide

This file is for a frontend AI agent or frontend engineer integrating with the current backend implementation in this repository.

It documents:

- authentication and JWT handling
- file uploads
- global API conventions
- every routed model API endpoint under `/api/`
- important custom actions, filters, and write-vs-read behavior

## 1. Base Rules

### 1.1 API roots

- Auth endpoints live under `/auth/`
- Main resource endpoints live under `/api/`
- Media upload endpoints live under `/api/media`

### 1.2 Authentication

Protected endpoints require JWT auth by default.

Send:

```http
Authorization: Bearer <access_token>
```

The backend also accepts `JWT <token>`, but `Bearer` should be the frontend default.

### 1.3 Pagination

DRF page-number pagination is enabled globally with page size `10`.

For list endpoints, expect the standard paginated response shape:

```json
{
  "count": 123,
  "next": "http://.../?page=2",
  "previous": null,
  "results": [...]
}
```

Exception: some custom actions return a plain array or a custom object instead of paginated `results`.

### 1.4 Error format

Errors are normalized into this shape:

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
- do not assume DRF default `{ "detail": ... }` responses
- auth failures often return `code = "not_authenticated"`, but login endpoints can return more specific rejection codes

### 1.5 Response envelopes

Normal model endpoints generally return:

- plain object on retrieve/create/update
- paginated object on list
- plain array on some custom actions

Media endpoints are different. They use an envelope:

```json
{
  "data": { ... }
}
```

Some media delete/abort responses return:

```json
{
  "data": null,
  "message": "..."
}
```

### 1.6 IDs and enums

- All primary keys are UUIDs
- Treat enum values as exact strings
- Most business enums are uppercase, for example `ACTIVE`, `PRESENT`, `HOMEWORK`
- Media status values are lowercase: `pending`, `uploaded`, `failed`, `deleted`

### 1.7 Access scoping

The backend scopes querysets by authenticated user.

- Superuser: unrestricted
- Organization owner: sees records belonging to organizations they own
- Branch admin: sees branch-scoped records for assigned active branches
- Parent: sees records linked to their organizations, branches, and children

Frontend implication:

- never assume a user can read arbitrary UUIDs
- `404` may mean "not in scope" as well as "does not exist"

### 1.8 Filter and query-param conventions

Most list endpoints support some combination of these query params:

- `?page=` for DRF pagination
- `?search=` for DRF text search
- exact-match foreign key filters like `?organization=<uuid>`, `?branch=<uuid>`, `?section=<uuid>`, `?student=<uuid>`
- exact-match enum filters like `?status=ACTIVE` or `?task_type=HOMEWORK`

Frontend defaults:

- treat query param names as endpoint-specific; there is no single global filter contract
- prefer sending enum filters in uppercase because many endpoints normalize with `.upper()`
- send boolean filters as `true` or `false`
- for repeated filters, only `attendance/daily-status` currently supports multi-value `status` via repeated params like `?status=ABSENT&status=LATE`
- only `announcements` currently supports `?ordering=` and only for `created_at` and `scheduled_at`
- custom collection actions like `by-section`, `by-grade`, `by-student`, and `by-assessment` commonly require specific query params and return `400` when they are missing

Practical implication:

- build query objects per endpoint instead of trying to share one generic filter builder across the whole app
- preserve pagination params separately from filter params
- expect some custom actions to return plain arrays or custom objects instead of paginated `results`

## 2. Authentication and User Lifecycle

## 2.1 Core auth endpoints

Configured auth stack:

- Djoser under `/auth/`
- JWT auth under `/auth/` via `djoser.urls.jwt`
- profile API under `/api/users/`

### 2.1.1 Signup

`POST /auth/users/`

Supported request fields:

```json
{
  "email": "user@example.com",
  "password": "strong-password-123",
  "name": "First Name",
  "father_name": "Father Name",
  "grandfather_name": "Grandfather Name",
  "phone_number": "+15555550123",
  "address": "123 Main Street"
}
```

Notes:

- `username` is not used
- `address` is optional
- `name` is expected by the user model
- signup rejects privileged fields such as `role`, `is_staff`, `is_superuser`, `groups`, `user_permissions`, `verified_at`

### 2.1.2 Activation

Activation email sending is enabled.

Frontend-facing activation URL pattern:

```text
activate/{uid}/{token}
```

Backend integration expectation:

- the frontend should own a route like `/activate/:uid/:token`
- that route should submit the activation payload to the Djoser activation endpoint

Use the standard Djoser activation flow:

- `POST /auth/users/activation/`
- optional resend flow: `POST /auth/users/resend_activation/`

Expected payload shape:

```json
{
  "uid": "<uid>",
  "token": "<token>"
}
```

### 2.1.3 JWT login

Use the standard Djoser JWT endpoints:

- `POST /auth/jwt/create/`
- `POST /auth/jwt/refresh/`
- `POST /auth/jwt/verify/`

Login request:

```json
{
  "email": "user@example.com",
  "password": "strong-password-123"
}
```

Login response is expected to contain at least:

```json
{
  "access": "<jwt-access-token>",
  "refresh": "<jwt-refresh-token>"
}
```

Organization-role login handling has two outcomes:

- zero organizations:
  `/auth/jwt/create/` returns normal JWT tokens
- one or more organizations, but none `ACTIVE + VERIFIED`:
  `/auth/jwt/create/` returns the pending-verification auth error
- at least one `ACTIVE + VERIFIED` organization:
  `/auth/jwt/create/` returns normal JWT tokens

Login failure handling matters here because `/auth/jwt/create/` can reject valid credentials for organization accounts that are not yet allowed to log in.

Expected rejection codes:

- `no_active_account`
  Invalid credentials or inactive user.
- `organization_not_verified`
  Organization-role user exists, but none of their organizations is both `ACTIVE` and `VERIFIED`.

Frontend handling recommendation:

1. Read `errors[0].code` first, not just the HTTP status.
2. For `organization_not_verified`, show a dedicated pending-approval message instead of the generic invalid-login copy.
3. For `no_active_account`, keep the standard invalid-credentials/inactive-account UI.
4. Do not retry login automatically for blocked-login rejection types.
5. Only run the normal post-login flow when the response includes both `access` and `refresh`.

### 2.1.4 Password reset

Password reset email sending is enabled.

Frontend-facing reset URL pattern:

```text
reset-password/{uid}/{token}
```

Use the standard Djoser reset flow:

- `POST /auth/users/reset_password/`
- `POST /auth/users/reset_password_confirm/`

Expected confirm payload:

```json
{
  "uid": "<uid>",
  "token": "<token>",
  "new_password": "new-strong-password"
}
```

### 2.1.5 Authenticated profile endpoints

#### `GET /api/users/`

- returns only the current authenticated user in paginated list form
- do not treat this as a directory of all users

#### `GET /api/users/me/`

- preferred "who am I" endpoint
- returns the authenticated user as a plain object

#### `GET /api/users/{id}/`

- only works for the current authenticated user's own UUID

#### `PATCH /api/users/{id}/`

Supported write fields:

- `name`
- `father_name`
- `grandfather_name`
- `email`
- `phone_number`
- `address`
- `password`

Returned read fields:

- `id`
- `name`
- `father_name`
- `grandfather_name`
- `email`
- `phone_number`
- `address`
- `verified_at`
- `created_at`
- `updated_at`

### 2.1.6 Frontend auth defaults

Use this strategy:

1. Sign in with `/auth/jwt/create/`
2. Store both access and refresh tokens
3. Attach access token to all protected requests
4. On `401`, refresh once with `/auth/jwt/refresh/`
5. If refresh fails, clear session and require login
6. Fetch `/api/users/me/` after login, after activation completion, and after profile update

Do not implement server logout assumptions unless the frontend intentionally adds a local logout action. JWT logout here is effectively client-side token disposal.

## 3. Media Upload Workflow

This backend does not accept raw file binaries inside model create/update endpoints.

File-linked resources expect a `MediaFile` UUID after upload completes:

- `organizations.business_license_image`
- `schools.logo`
- `students.photo`
- `teacher-qualifications.certificate_copy`

## 3.1 Media endpoints

- `POST /api/media/upload`
- `POST /api/media/{id}/multipart/part-url`
- `POST /api/media/{id}/multipart/complete`
- `POST /api/media/{id}/multipart/abort`
- `GET /api/media/{id}`
- `GET /api/media/{id}/url`
- `DELETE /api/media/{id}`

Important: these routes are slashless. Use `/api/media/upload`, not `/api/media/upload/`.

## 3.2 Upload algorithm

### Step 1: initiate upload

`POST /api/media/upload`

Request:

```json
{
  "file_name": "report-card.pdf",
  "content_type": "application/pdf"
}
```

Response:

```json
{
  "data": {
    "id": "<media-uuid>",
    "key": "media/<user>/<media-id>/report-card.pdf",
    "upload_id": "<multipart-upload-id>",
    "expires_in": 900
  }
}
```

Notes:

- upload requires auth
- uploads are self-scoped to `uploaded_by`
- duplicate uploads within the fingerprint window may return the existing media record with `200`

### Step 2: request part URL

`POST /api/media/{id}/multipart/part-url`

Request:

```json
{
  "upload_id": "<multipart-upload-id>",
  "part_number": 1
}
```

Response:

```json
{
  "data": {
    "presigned_url": "https://...",
    "expires_in": 900
  }
}
```

### Step 3: upload part bytes directly to storage

Use the returned `presigned_url` from the browser or frontend runtime. This does not go through Django.

For remote frontend testing, configure the backend's public storage endpoint so the
returned `presigned_url` is browser-reachable. In local Docker this typically means:

- `S3_INTERNAL_ENDPOINT=http://minio:9000` for Django-to-MinIO traffic
- `S3_PUBLIC_ENDPOINT=https://your-public-minio-host` for browser uploads

If `S3_PUBLIC_ENDPOINT` is unset, the backend falls back to `S3_ENDPOINT`.

Capture each uploaded part's `ETag`.

### Step 4: complete multipart upload

`POST /api/media/{id}/multipart/complete`

Request:

```json
{
  "upload_id": "<multipart-upload-id>",
  "parts": [
    {
      "part_number": 1,
      "etag": "\"etag-value\""
    }
  ]
}
```

Response:

```json
{
  "data": {
    "id": "<media-uuid>",
    "status": "uploaded",
    "etag": "\"etag-value\"",
    "size": 1024
  }
}
```

Only after this step should the frontend use the media UUID in a model create/update payload.

### Step 5: optional abort

`POST /api/media/{id}/multipart/abort`

Request:

```json
{
  "upload_id": "<multipart-upload-id>"
}
```

Response:

```json
{
  "data": null,
  "message": "Multipart upload aborted"
}
```

### Step 6: inspect media metadata

`GET /api/media/{id}`

Returns:

- `id`
- `key`
- `bucket`
- `file_name`
- `content_type`
- `size`
- `etag`
- `status`
- `uploaded_by`
- `created_at`
- `updated_at`
- `download_url`

`download_url` is only present when status is `uploaded`.

### Step 7: get a fresh download URL

`GET /api/media/{id}/url`

Response:

```json
{
  "data": {
    "download_url": "https://..."
  }
}
```

### Step 8: delete media

`DELETE /api/media/{id}`

This soft-deletes by setting status to `deleted`.

Response:

```json
{
  "data": null,
  "message": "Media deleted"
}
```

## 3.3 Media validation rules

When a model endpoint receives a media UUID:

- the media must belong to the current user
- the media status must already be `uploaded`
- some fields require image content types:
  - organization license image
  - school logo
  - student photo

## 4. Resource Endpoint Catalog

All routes below are under `/api/` and generally use trailing slashes.

## 4.1 Users

### Endpoints

- `GET /api/users/`
- `GET /api/users/me/`
- `GET /api/users/{id}/`
- `PATCH /api/users/{id}/`
- `PUT /api/users/{id}/`

### Notes

- self-scoped only
- list returns only the current user
- use `/api/users/me/` as the default identity endpoint

## 4.2 Organizations

### Endpoints

- `GET /api/organizations/`
- `POST /api/organizations/`
- `GET /api/organizations/{id}/`
- `PATCH /api/organizations/{id}/`
- `PUT /api/organizations/{id}/`
- `DELETE /api/organizations/{id}/`

### Write fields

- `name`
- `trade_name`
- `tin_number`
- `license_no`
- `client_full_name`
- `business_address`
- `business_phone_number`
- `client_phone_number`
- `business_license_image`

### Read-only or server-managed fields

- `id`
- `owner`
- `status`
- `verification_status`
- `verification_checked_at`
- `verification_failure_reason`
- `verification_match_source`
- `verified_name`
- `verified_license_no`
- `verified_tin_number`
- `requires_manual_verification`
- timestamps

### Notes

- create is custom and runs organization verification
- `tin_number` is required on create
- `business_license_image` must be an uploaded image media UUID
- queryset is owner-scoped

## 4.3 Schools

### Endpoints

- `GET /api/schools/`
- `POST /api/schools/`
- `GET /api/schools/{id}/`
- `PATCH /api/schools/{id}/`
- `PUT /api/schools/{id}/`
- `DELETE /api/schools/{id}/`

### Write fields

- `organization`
- `name`
- `description`
- `country`
- `contact_email`
- `contact_phone`
- `logo`
- `website`
- `status`

### Notes

- `logo` is an uploaded image media UUID
- user can only manage schools in organizations they own

## 4.4 Branches

### Endpoints

- `GET /api/branches/`
- `POST /api/branches/`
- `GET /api/branches/{id}/`
- `PATCH /api/branches/{id}/`
- `PUT /api/branches/{id}/`
- `DELETE /api/branches/{id}/`

### Write fields

- `organization`
- `school`
- `name`
- `address`
- `city`
- `region`
- `contact_phone`
- `contact_email`
- `status`

### Notes

- selected `school` must belong to selected `organization`
- org owners and branch admins can read scoped branch data
- branch admins do not automatically own cross-organization write permissions; validation still checks ownership on some writes

## 4.5 Branch Admins

### Endpoints

- `GET /api/branch-admins/`
- `POST /api/branch-admins/`
- `GET /api/branch-admins/{id}/`
- `PATCH /api/branch-admins/{id}/`
- `PUT /api/branch-admins/{id}/`
- `DELETE /api/branch-admins/{id}/`

### Write fields

- `organization`
- `branch`
- `user`
- `emergency_contact_name`
- `emergency_contact_phone`
- `role_title`
- `qualification`
- `status`

### Read-only fields

- `last_login`
- timestamps

## 4.6 Academic Years

### Endpoints

- `GET /api/academic-years/`
- `POST /api/academic-years/`
- `GET /api/academic-years/{id}/`
- `PATCH /api/academic-years/{id}/`
- `PUT /api/academic-years/{id}/`
- `DELETE /api/academic-years/{id}/`

### Filters and search

- `?search=`
- search fields: academic year name, branch name

### Write fields

- `organization`
- `branch`
- `name`
- `start_date`
- `end_date`
- `is_current`

## 4.7 Grades

### Endpoints

- `GET /api/grades/`
- `POST /api/grades/`
- `GET /api/grades/{id}/`
- `PATCH /api/grades/{id}/`
- `PUT /api/grades/{id}/`
- `DELETE /api/grades/{id}/`

### Filters and search

- `?search=`
- search field: `name`

### Write fields

- `organization`
- `branch`
- `name`
- `level`

## 4.8 Sections

### Endpoints

- `GET /api/sections/`
- `POST /api/sections/`
- `GET /api/sections/{id}/`
- `PATCH /api/sections/{id}/`
- `PUT /api/sections/{id}/`
- `DELETE /api/sections/{id}/`

### Filters and search

- `?search=`
- search fields: section name, grade name, branch name

### Write fields

- `organization`
- `branch`
- `grade`
- `academic_year`
- `name`

## 4.9 Subjects

### Endpoints

- `GET /api/subjects/`
- `POST /api/subjects/`
- `GET /api/subjects/{id}/`
- `PATCH /api/subjects/{id}/`
- `PUT /api/subjects/{id}/`
- `DELETE /api/subjects/{id}/`

### Filters and search

- `?search=`
- search fields: subject name, code, grade name

### Write fields

- `organization`
- `branch`
- `grade`
- `name`
- `code`

## 4.10 Grade Subjects

### Endpoints

- `GET /api/grade-subjects/`
- `POST /api/grade-subjects/`
- `GET /api/grade-subjects/{id}/`
- `PATCH /api/grade-subjects/{id}/`
- `PUT /api/grade-subjects/{id}/`
- `DELETE /api/grade-subjects/{id}/`

### Filters and search

- `?grade=<uuid>`
- `?subject=<uuid>`
- `?organization=<uuid>`
- `?search=`

### Write fields

- `organization`
- `grade`
- `subject`

### Read extras on list/retrieve

- `grade_details`
- `subject_details`

## 4.11 Students

### Endpoints

- `GET /api/students/`
- `POST /api/students/`
- `GET /api/students/{id}/`
- `PATCH /api/students/{id}/`
- `PUT /api/students/{id}/`
- `DELETE /api/students/{id}/`
- `GET /api/students/by-section/?section=<uuid>`
- `GET /api/students/by-grade/?grade=<uuid>`

### Filters and search

- `?section=<uuid>`
- `?grade=<uuid>`
- `?branch=<uuid>`
- `?organization=<uuid>`
- `?academic_year=<uuid>`
- `?status=ACTIVE|INACTIVE|WITHDRAWN|GRADUATED`
- `?gender=MALE|FEMALE|OTHER`
- `?search=`

### Write fields

- `organization`
- `branch`
- `first_name`
- `last_name`
- `gender`
- `date_of_birth`
- `roll_no`
- `current_section`
- `admission_date`
- `photo`
- `status`

### Read extras on list/retrieve/custom reads

- `section_name`
- `grade_id`
- `grade_name`
- `grade_level`
- `academic_year_id`
- `academic_year_name`
- `branch_name`
- `organization_name`

### Notes

- `photo` must be an uploaded image media UUID
- `by-section` requires `section`
- `by-grade` requires `grade`
- both custom actions return plain arrays

## 4.12 Parents

### Endpoints

- `GET /api/parents/`
- `POST /api/parents/`
- `GET /api/parents/{id}/`
- `PATCH /api/parents/{id}/`
- `PUT /api/parents/{id}/`
- `DELETE /api/parents/{id}/`
- `GET /api/parents/by-branch/?branch=<uuid>`
- `GET /api/parents/by-organization/?organization=<uuid>`
- `GET /api/parents/{id}/branches/`
- `GET /api/parents/{id}/organizations/`
- `GET /api/parents/{id}/students/`
- `GET /api/parents/me/`
- `GET /api/parents/my-students/`

### Filters and search

- `?organization=<uuid>`
- `?branch=<uuid>`
- `?user=<uuid>`
- `?occupation=<string>`
- `?is_active=true|false`
- `?search=`

### Write fields

- `user`
- `organizations`
- `branches`
- `secondary_phone_number`
- `occupation`
- `work_address`
- `relationship_notes`
- `emergency_contact_name`
- `emergency_contact_phone`
- `is_active`

### Read extras

- `user_details`
- `organization_details`
- `branch_details`
- `student_details`

### Notes

- creating or updating a parent may force the linked user's role to `PARENT`
- every selected branch must belong to one of the selected organizations
- `me` returns the authenticated user's parent profile
- `my-students` returns a plain array of the authenticated parent's students

## 4.13 Parent Links

### Endpoints

- `GET /api/parent-links/`
- `POST /api/parent-links/`
- `GET /api/parent-links/{id}/`
- `PATCH /api/parent-links/{id}/`
- `PUT /api/parent-links/{id}/`
- `DELETE /api/parent-links/{id}/`

### Write fields

- `student`
- `parent`
- `relationship_type`
- `is_primary_contact`

### Read extras

- `student_details`
- `parent_details`

### Notes

- parent must belong to the student's organization and branch

## 4.14 Teachers

### Endpoints

- `GET /api/teachers/`
- `POST /api/teachers/`
- `GET /api/teachers/{id}/`
- `PATCH /api/teachers/{id}/`
- `PUT /api/teachers/{id}/`
- `DELETE /api/teachers/{id}/`
- `GET /api/teachers/{id}/qualifications/`
- `GET /api/teachers/{id}/assignments/`

### Filters and search

- `?organization=<uuid>`
- `?branch=<uuid>`
- `?search=`

### Write fields

- `user`
- `organization`
- `branch`
- `employee_id`
- `bio`
- `specialization`
- `joining_date`

### Read extras

- `qualifications`
- `user_name`
- `user_email`

## 4.15 Teacher Qualifications

### Endpoints

- `GET /api/teacher-qualifications/`
- `POST /api/teacher-qualifications/`
- `GET /api/teacher-qualifications/{id}/`
- `PATCH /api/teacher-qualifications/{id}/`
- `PUT /api/teacher-qualifications/{id}/`
- `DELETE /api/teacher-qualifications/{id}/`

### Filters and search

- `?teacher=<uuid>`
- `?organization=<uuid>`
- `?search=`

### Write fields

- `teacher`
- `organization`
- `degree_name`
- `institution`
- `field_of_study`
- `completion_date`
- `certificate_copy`

### Notes

- `certificate_copy` is a media UUID
- no image-only restriction is enforced here

## 4.16 Teacher Assignments

### Endpoints

- `GET /api/teacher-assignments/`
- `POST /api/teacher-assignments/`
- `GET /api/teacher-assignments/{id}/`
- `PATCH /api/teacher-assignments/{id}/`
- `PUT /api/teacher-assignments/{id}/`
- `DELETE /api/teacher-assignments/{id}/`
- `GET /api/teacher-assignments/by-section/?section=<uuid>`
- `GET /api/teacher-assignments/by-subject/?subject=<uuid>`

### Filters and search

- `?teacher=<uuid>`
- `?subject=<uuid>`
- `?section=<uuid>`
- `?academic_year=<uuid>`
- `?organization=<uuid>`
- `?search=`

### Write fields

- `teacher`
- `organization`
- `subject`
- `section`
- `academic_year`

### Read extras

- `teacher_name`
- `teacher_employee_id`
- `subject_name`
- `subject_code`
- `section_name`
- `grade_name`
- `academic_year_name`

### Custom action notes

- `by-section` requires `section`, optional `academic_year`
- `by-subject` requires `subject`, optional `academic_year`
- `by-section` returns a section-teaching schedule shape

## 4.17 Homeroom Assignments

### Endpoints

- `GET /api/homeroom-assignments/`
- `POST /api/homeroom-assignments/`
- `GET /api/homeroom-assignments/{id}/`
- `PATCH /api/homeroom-assignments/{id}/`
- `PUT /api/homeroom-assignments/{id}/`
- `DELETE /api/homeroom-assignments/{id}/`
- `GET /api/homeroom-assignments/by-section/?section=<uuid>`
- `GET /api/homeroom-assignments/by-teacher/?teacher=<uuid>`

### Filters and search

- `?organization=<uuid>`
- `?branch=<uuid>`
- `?academic_year=<uuid>`
- `?section=<uuid>`
- `?teacher=<uuid>`
- `?search=`

### Write fields

- `organization`
- `branch`
- `academic_year`
- `section`
- `teacher`
- `notes`

### Read extras

- teacher identity and contact fields
- section and grade names
- academic year labels and dates
- `branch_name`
- `organization_name`

### Notes

- one homeroom teacher per section per academic year

## 4.18 Attendance

### Endpoints

- `GET /api/attendance/`
- `POST /api/attendance/`
- `GET /api/attendance/{id}/`
- `PATCH /api/attendance/{id}/`
- `PUT /api/attendance/{id}/`
- `DELETE /api/attendance/{id}/`
- `POST /api/attendance/bulk-submit/`
- `GET /api/attendance/by-section/?section=<uuid>&date=YYYY-MM-DD`
- `GET /api/attendance/by-student/?student=<uuid>`
- `GET /api/attendance/daily-status/`

### Filters and search

- `?organization=<uuid>`
- `?branch=<uuid>`
- `?section=<uuid>`
- `?student=<uuid>`
- `?academic_year=<uuid>`
- `?date=YYYY-MM-DD`
- `?status=PRESENT|ABSENT|LATE|EXCUSED`
- `?search=`

### Write fields

- `organization`
- `branch`
- `academic_year`
- `section`
- `student`
- `date`
- `status`
- `remarks`
- `client_side_id`

### Read extras

- `student_name`
- `student_roll_no`
- `section_name`
- `grade_name`
- `academic_year_name`
- `branch_name`
- `recorded_by_name`
- `status_display`
- `needs_reason`
- nested `reason`

### Bulk submit request

`POST /api/attendance/bulk-submit/`

```json
{
  "section": "<uuid>",
  "academic_year": "<uuid>",
  "organization": "<uuid>",
  "branch": "<uuid>",
  "date": "2026-05-17",
  "records": [
    {
      "student": "<uuid>",
      "status": "PRESENT",
      "remarks": "",
      "client_side_id": "<uuid>"
    }
  ]
}
```

### Bulk submit response

```json
{
  "created": 10,
  "skipped": 2,
  "errors": [],
  "created_ids": ["..."]
}
```

### Notes

- `bulk-submit` is idempotent for existing `(student, date, section)` records
- attendance cannot be submitted for a future date
- for individual create, `recorded_by` is set server-side

## 4.19 Attendance Reasons

### Endpoints

- `GET /api/attendance-reasons/`
- `POST /api/attendance-reasons/`
- `GET /api/attendance-reasons/{id}/`
- `PATCH /api/attendance-reasons/{id}/`
- `PUT /api/attendance-reasons/{id}/`
- `DELETE /api/attendance-reasons/{id}/`
- `PATCH /api/attendance-reasons/{id}/parent-update/`

### Filters and search

- `?organization=<uuid>`
- `?attendance=<uuid>`
- `?student=<uuid>`
- `?parent_confirmed=true|false`
- `?search=`

### Standard write fields

- `organization`
- `attendance`
- `reason_category`
- `note`
- `parent_confirmed`

### Read extras

- `reason_category_display`
- `confirmed_by_name`

### Parent update fields

`PATCH /api/attendance-reasons/{id}/parent-update/`

Allowed fields:

- `reason_category`
- `note`
- `parent_confirmed`

Notes:

- intended for parent confirmation flows
- if `parent_confirmed` becomes true, server sets `confirmed_by` and `confirmed_at`
- endpoint rejects attendance that does not require a reason

## 4.20 Attendance Summaries

### Endpoints

- `GET /api/attendance-summaries/`
- `GET /api/attendance-summaries/{id}/`

### Filters and search

- `?organization=<uuid>`
- `?student=<uuid>`
- `?academic_year=<uuid>`
- `?search=`

### Returned fields

- `id`
- `organization`
- `student`
- `student_name`
- `academic_year`
- `academic_year_name`
- `total_present`
- `total_absent`
- `total_late`
- `total_excused`
- `total_school_days`
- `attendance_rate`
- `last_updated`

### Notes

- read-only endpoint
- use for dashboards and attendance analytics

## 4.21 Assessments

### Endpoints

- `GET /api/assessments/`
- `POST /api/assessments/`
- `GET /api/assessments/{id}/`
- `PATCH /api/assessments/{id}/`
- `PUT /api/assessments/{id}/`
- `DELETE /api/assessments/{id}/`
- `GET /api/assessments/by-section/?section=<uuid>`
- `GET /api/assessments/by-teacher/?teacher=<uuid>`

### Filters and search

- `?organization=<uuid>`
- `?branch=<uuid>`
- `?teacher_assignment=<uuid>`
- `?task_type=ASSIGNMENT|EXAM|QUIZ|HOMEWORK|PROJECT|LAB`
- `?status=DRAFT|PUBLISHED|CLOSED`
- `?search=`

### Write fields

- `organization`
- `branch`
- `teacher_assignment`
- `title`
- `task_type`
- `description`
- `total_marks`
- `passing_marks`
- `due_date`
- `status`

### Read extras

- `task_type_display`
- `status_display`
- `section_name`
- `grade_name`
- `subject_name`
- `subject_code`
- `teacher_name`
- `teacher_employee_id`
- `academic_year_name`
- `branch_name`
- `result_count`

## 4.22 Assessment Results

### Endpoints

- `GET /api/assessment-results/`
- `POST /api/assessment-results/`
- `GET /api/assessment-results/{id}/`
- `PATCH /api/assessment-results/{id}/`
- `PUT /api/assessment-results/{id}/`
- `DELETE /api/assessment-results/{id}/`
- `POST /api/assessment-results/bulk-grade/`
- `PATCH /api/assessment-results/{id}/confirm-homework/`
- `GET /api/assessment-results/by-assessment/?assessment=<uuid>`
- `GET /api/assessment-results/by-student/?student=<uuid>`

### Filters and search

- `?organization=<uuid>`
- `?assessment=<uuid>`
- `?student=<uuid>`
- `?submission_status=PENDING|SUBMITTED|LATE|MISSING|GRADED`
- `?parent_confirmed=true|false`
- `?search=`

### Standard write fields

- `organization`
- `assessment`
- `student`
- `obtained_marks`
- `submission_status`
- `feedback`
- `parent_confirmed`

Server-managed fields:

- `graded_by`
- `parent_confirmed_by`
- `parent_confirmed_at`

### Read extras

- `submission_status_display`
- `student_name`
- `student_roll_no`
- `section_name`
- `subject_name`
- `assessment_title`
- `total_marks`
- `passing_marks`
- `percentage`
- `is_below_passing`
- `graded_by_name`

### Bulk grade request

`POST /api/assessment-results/bulk-grade/`

```json
{
  "assessment": "<uuid>",
  "results": [
    {
      "student": "<uuid>",
      "obtained_marks": 38,
      "submission_status": "GRADED",
      "feedback": ""
    }
  ]
}
```

### Bulk grade response

```json
{
  "assessment": "<uuid>",
  "created": 10,
  "updated": 5,
  "errors": []
}
```

### Homework confirmation

`PATCH /api/assessment-results/{id}/confirm-homework/`

Allowed fields:

- `parent_confirmed`
- `feedback`

Notes:

- only valid for `HOMEWORK` assessments
- if newly confirmed, server sets `parent_confirmed_by` and `parent_confirmed_at`
- repeat confirmation returns `400`

## 4.23 Intervention Logs

### Endpoints

- `GET /api/intervention-logs/`
- `POST /api/intervention-logs/`
- `GET /api/intervention-logs/{id}/`
- `PATCH /api/intervention-logs/{id}/`
- `PUT /api/intervention-logs/{id}/`
- `DELETE /api/intervention-logs/{id}/`

### Filters and search

- `?organization=<uuid>`
- `?student=<uuid>`
- `?intervention_type=LOW_GRADE|ATTENDANCE|BEHAVIOUR|OTHER`
- `?severity=LOW|MEDIUM|HIGH|CRITICAL`
- `?status=OPEN|IN_PROGRESS|RESOLVED|DISMISSED`
- `?search=`

### Write fields

- `organization`
- `student`
- `intervention_type`
- `severity`
- `status`
- `source_model`
- `source_id`
- `title`
- `description`
- `resolved_at`

### Read extras

- `student_name`
- `intervention_type_display`
- `severity_display`
- `status_display`

## 5. Frontend Dependency Order

When building forms and screens, use this rough dependency order:

1. Auth and current user
2. Organization
3. School
4. Branch
5. Academic year and grade
6. Section and subject
7. Teacher and parent profiles
8. Students
9. Teacher assignments and homeroom assignments
10. Attendance and assessments
11. Analytics and intervention logs

This matters because many payloads require upstream UUIDs.

## 6. Frontend Implementation Defaults

### 6.1 Safe write behavior

On create/update, only send fields explicitly listed in this file as writable.

Do not send:

- derived display fields
- nested read-only detail objects
- server-managed timestamps
- server-assigned actor fields like `recorded_by`, `graded_by`, `owner`

### 6.2 Read vs write serializers

Several endpoints use richer read serializers than write serializers.

Typical pattern:

- list/retrieve returns expanded names and nested details
- create/update expects only UUID foreign keys and raw write fields

Never round-trip a GET response directly into PATCH/POST without pruning.

### 6.3 Query param handling

When required query params are missing on custom actions, the backend commonly returns `400`.

Examples:

- `students/by-section` requires `section`
- `students/by-grade` requires `grade`
- `attendance/by-section` requires `section` and `date`
- `assessment-results/by-assessment` requires `assessment`

Common filter patterns across the current API:

- tenant/resource filters:
  `organization`, `branch`, `school`, `school_id`, `grade`, `section`, `academic_year`, `teacher`, `teacher_assignment`, `subject`, `student`, `assessment`, `attendance`, `user`
- enum/status filters:
  `status`, `verification_status`, `task_type`, `submission_status`, `intervention_type`, `severity`, `target_roles`, `gender`
- boolean filters:
  `is_active`, `is_urgent`, `parent_confirmed`
- text search:
  `search`
- ordering:
  `ordering` on announcements only

Endpoint families worth treating as separate frontend filter configs:

- organizations and schools:
  mostly exact-match filters using `DjangoFilterBackend`
- academics, students, teachers, attendance, assessments, analytics:
  mostly manual query-param filtering plus `?search=`
- announcements:
  manual filters plus `?search=` and `?ordering=`

Booleans are not perfectly uniform in backend parsing:

- many endpoints treat `true`, `1`, and `yes` as truthy
- some endpoints only apply the filter when the param is present and non-empty
- safest frontend default is to send lowercase `true` or `false`

### 6.4 404 handling

Treat `404` carefully. Because of access scoping, it can mean:

- the UUID is invalid
- the record exists but is outside the user's scope

### 6.5 File fields

For any file/image field:

1. upload to `/api/media/...`
2. wait for upload status `uploaded`
3. send returned media UUID in the model payload

Do not attempt multipart form submission directly to model endpoints.

## 7. Recommended Frontend Client Shape

Suggested API client behavior:

- one auth-aware HTTP client for `/auth/` and `/api/`
- one upload helper for `/api/media/...`
- automatic token refresh interceptor
- typed enums for all business statuses
- UUID-typed IDs across all resource models
- helper mappers for paginated results vs plain arrays

## 8. Quick Reference

### Media-backed model fields

- Organization: `business_license_image`
- School: `logo`
- Student: `photo`
- TeacherQualification: `certificate_copy`

### Parent-facing custom flows

- `GET /api/parents/me/`
- `GET /api/parents/my-students/`
- `PATCH /api/attendance-reasons/{id}/parent-update/`
- `PATCH /api/assessment-results/{id}/confirm-homework/`

### Teacher/staff bulk flows

- `POST /api/attendance/bulk-submit/`
- `POST /api/assessment-results/bulk-grade/`

### Best default identity fetch

- `GET /api/users/me/`
