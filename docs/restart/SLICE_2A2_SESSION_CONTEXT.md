# Slice 2A.2: Server Session And Account Context

Status: **IMPLEMENTED AND INDEPENDENTLY VALIDATED LOCALLY** on 2026-08-10.

## Outcome

`GET /api/auth/session` is now the single server boundary for turning a valid
cookie-backed Supabase identity into one deterministic host account context.
The endpoint has one successful destination, `/dashboard2`, and no account
picker or role-based branch.

This is a local application slice. It made no remote Supabase call or mutation
and does not grant runtime acceptance to Slice 2A.1.

## Trust Boundary

The route creates the request-bound `@supabase/ssr` server client and the core
resolver calls `auth.getUser()` without a caller-supplied token. The route
handler intentionally accepts no request argument, so bearer tokens, headers,
query parameters, bodies, local storage, user/account IDs, roles, and
client-supplied confirmation flags cannot select identity or tenant context.

An eligible identity must have both an email address and a non-empty
`email_confirmed_at`. The deprecated generic `confirmed_at` field is not used
because it can also represent phone confirmation. The resolver then calls only
`bootstrap_current_user(p_display_name, p_account_name)`. The optional display
name is normalized from the validated auth user's non-authoritative name
metadata; account naming uses the database's server-controlled default. No
service-role client is imported or used.

Success requires exactly one well-formed bootstrap row for the authenticated
user, with the owner role produced by Slice 2A.1. Empty, multiple, malformed,
wrong-user, unexpected-role, thrown, and error-bearing RPC results all fail
closed.

## HTTP Contract

Successful responses use HTTP `200`, `Cache-Control: no-store`, and only:

```json
{
  "success": true,
  "authenticated": true,
  "context": {
    "user": { "displayName": "Example Host" },
    "currentAccount": { "id": "<uuid>", "name": "My account" },
    "next": "/dashboard2"
  }
}
```

The response never contains email, access/refresh tokens, roles, an account
list, owner IDs, session expiry, provider errors, or database errors.

| Condition | HTTP | Stable code | Recovery |
| --- | ---: | --- | --- |
| No valid user | 401 | `AUTH_REQUIRED` | Sign in |
| Identity has no email | 403 | `EMAIL_REQUIRED` | Use an eligible verified-email identity |
| Email is unverified | 403 | `EMAIL_VERIFICATION_REQUIRED` | Verify email |
| Client/bootstrap unavailable or invalid | 503 | `ACCOUNT_CONTEXT_UNAVAILABLE` | Retry |

Every failure returns `authenticated: false` with a fixed safe message. The
previous POST refresh-token endpoint is removed; Supabase cookie/session
refresh stays within the SSR session mechanism instead of accepting refresh
tokens in an application payload.

An exhaustive source search found no runtime caller of `/api/auth/session`
under `src/`; only the focused route test imports it. Removing the old POST and
response shape therefore does not silently break a canonical UI consumer.
Legacy requirement and audit documents still describe the old endpoint as
historical evidence.

## Focused Evidence

Under temporary exact Node `22.23.2` (`Jod`) and npm `10.9.9` packages:

- two focused Vitest files pass: 27 tests total;
- unauthenticated, missing-email, unverified-email, RPC error/throw, malformed
  output, successful normalization, spoofed authority metadata, token leakage,
  request-input spoofing, GET-only method behavior, strict output fields,
  Unicode/control/length name handling, and repeated-request contracts are
  covered;
- `npm run typecheck` passes with no diagnostics.
- `npm run build` passes, includes `/api/auth/session` in the App Router output,
  and emits a non-empty `.next/BUILD_ID`;
- `git diff --check` passes after the implementation and documentation changes.

The build retained the already documented Sentry, Next Intl/Webpack cache, and
legacy PDF-route diagnostic output; none failed the build. No browser/E2E, live
database, or real email/provider behavior is claimed by this slice.

## Remaining Gates

- Docker Desktop remains unavailable. Slice 2A.1 still needs a clean local
  Supabase 17 replay, all 44 pgTAP assertions, and generated types.
- The committed inline `Database` type does not yet include the bootstrap RPC;
  the route uses a narrow explicit boundary cast until local generation can run.
- Registration, login, confirmation UX, password recovery, Google
  compatibility, and migration of other bearer-token/account-header APIs are
  separate slices.
- No live mutation is allowed while `DATA_MIGRATION_DECISION.md` remains
  pending.

Independent validation corrected malformed auth/RPC-envelope handling,
email-specific confirmation semantics, strict RPC output parsing, Unicode-safe
name length/control handling, explicit GET-only coverage, and documentation of
the zero runtime-consumer search. It then repeated the focused suite,
typecheck, production build, build-ID, and diff checks under the pinned
toolchain.
