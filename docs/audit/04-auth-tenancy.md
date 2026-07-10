# 04 Auth And Tenancy

Date: 2026-07-10

## Sources Reviewed

- `src/middleware.ts`
- `src/lib/auth.ts`
- `src/lib/auth-server.ts`
- `src/lib/supabase.ts`
- `src/lib/supabase-server.ts`
- `src/lib/permissions.ts`
- `src/contexts/AuthContext.tsx`
- `src/app/api/auth/*`
- representative `/api/admin/*`, `/api/user/*`, `/api/public/*` routes

## Intended Auth Model

The intended model appears to be:

- Supabase Auth handles identity and sessions.
- App `users` table stores profile, role, language, provider, and admin flag.
- `admin_users` and/or `users.is_admin` identify system/platform admins.
- `accounts` and `account_users` identify tenant membership.
- `properties.account_id` scopes host data.
- Public QR item pages are unauthenticated.

## Middleware Behavior

`src/middleware.ts` protects these route groups:

- `/admin`
- `/user`
- `/dashboard`
- `/dashboard2`
- `/login`
- `/auth/oauth/callback`
- `/register`
- `/item`

Positive signals:

- Unauthenticated users are redirected from protected app routes to `/login`.
- Authenticated users on `/login` are redirected to `/dashboard2`, which confirms `/dashboard2` is probably the current intended dashboard.
- Orphaned Supabase auth users without an app `users` row are redirected to `/register/complete`.
- `/item/*` is included for guest language detection, not auth blocking.

Risks:

- `/admin/back-office` has special system-admin middleware checks, but `/admin/system/back-office` exists separately and should be verified.
- Middleware protects pages, not API routes. API route security depends on each route's local implementation.
- QR print routes are exempted from middleware auth and rely on page/API-level checks.
- Middleware has extensive debug logging, including user identifiers and emails.

## API Auth Pattern Drift

The repo uses several different API authentication patterns:

| Pattern | Example |
| --- | --- |
| Cookie-aware server Supabase client | `createSupabaseServer()` |
| Explicit Bearer token required | `/api/auth/session`, some `/api/user/*` routes |
| Imported browser/global `supabase` in API route | `/api/user/properties`, `/api/admin/accounts` |
| Shared `validateAdminAuth` from `src/lib/auth-server.ts` | many `/api/admin/*` and translation routes |
| Locally duplicated `validateAdminAuth` | some admin analytics/accounts/items/property routes |
| Service-role queries after auth | translation/status/admin/account/access-request routes |

This inconsistency is a major restart risk. It makes it hard for an LLM to know which auth helper is correct and easy to accidentally bypass account scoping.

## Critical Auth Findings

### 1. `requireAuth` Name Is Misleading

In `src/lib/auth.ts`, `requireAuth()` throws unless `isAdmin(userResponse.data)` is true. A helper named `requireAuth` should not require admin privileges. This can cause accidental over-restriction or confusing workarounds.

Recommended split:

- `requireUser()`
- `requireAccountMember(accountId)`
- `requireAccountRole(accountId, role)`
- `requireSystemAdmin()`

### 2. System Admin And Account Admin Are Blurred

The code uses several admin signals:

- `admin_users` table
- `users.is_admin`
- `user.role === 'admin'`
- `SYSADMIN_EMAILS`
- account role values like `owner`, `admin`, `member`, `viewer`

These should be separated:

- **System admin**: can operate platform-wide.
- **Account owner/admin**: can manage one tenant account.
- **Regular member/viewer**: scoped tenant access only.

### 3. Host APIs Live Under `/api/admin`

Many ordinary host operations are under `/api/admin`, including properties, items, articles, upload, and PDF generation. This makes endpoint semantics misleading and increases the chance of treating account admins as platform admins or vice versa.

Recommended namespaces:

- `/api/public/*`: no auth, public QR-safe fields only.
- `/api/user/*`: authenticated host/account operations.
- `/api/system/*`: platform/system admin operations.

### 4. Account Header Names Are Inconsistent

The code uses both:

- `x-current-account`
- `x-account-id`
- `account_id` query parameter

Pick one canonical account context mechanism. Prefer `x-current-account` or path-based account context, then validate membership server-side every time.

### 5. `supabaseAdmin` Fallback Is Dangerous

In `src/lib/supabase.ts`, `supabaseAdmin` falls back to the regular `supabase` client if `SUPABASE_SERVICE_ROLE_KEY` is absent. That hides misconfiguration and can produce environment-specific behavior.

Recommended behavior:

- On server-only admin-client creation, throw if the service role key is required and missing.
- Do not export a service-role client from a module commonly imported by client components.
- Use a separate `supabase-admin.server.ts` module.

### 6. Checked-In RLS Does Not Match Code

Current code expects account-scoped access. Checked-in SQL does not provide complete account-scoped RLS. Until this is fixed, application-level checks are carrying too much security responsibility.

## Public QR Endpoint

`/api/public/items/[publicId]` is intentionally unauthenticated and includes:

- language selection
- in-memory rate limiting
- cache headers
- translated content fetch via `fetchTranslatedItem`

Risks:

- In-memory rate limiting is not reliable across serverless/multi-instance deployment.
- Public item visibility appears controlled by `public_id`, but there is no reviewed public/private field in the current generated type.
- Public responses must avoid leaking tenant/account/user/internal translation job data.

## Recommended Auth/Tenancy Architecture

Use one server-side auth module with these primitives:

```text
getSessionUser(request)
requireUser(request)
requireAccount(request, accountId)
requireAccountRole(request, accountId, minRole)
requireSystemAdmin(request)
assertCanAccessProperty(userId, propertyId)
assertCanAccessItem(userId, publicIdOrItemId)
```

Every protected API route should:

1. Authenticate with one helper.
2. Resolve account context.
3. Validate account membership or system-admin privilege.
4. Query through account/property ownership constraints.
5. Return normalized error codes.

## Restart Priorities

1. Define role vocabulary in one file.
2. Replace misleading `requireAuth()` naming.
3. Move or wrap host CRUD under `/api/user`.
4. Consolidate API auth into one server-only helper.
5. Make account-scoped RLS match application assumptions.
6. Remove debug logging that exposes auth/session details.
7. Add tests for cross-account access denial.
