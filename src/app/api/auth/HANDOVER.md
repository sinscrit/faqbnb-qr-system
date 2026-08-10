# Auth API Handover

Updated: 2026-08-10.

## Canonical Session Endpoint

`session/route.ts` now exposes GET only. It creates the cookie-backed server
Supabase client and delegates to `src/lib/current-user-context.ts`. The handler
accepts no request argument, uses no bearer or refresh token, trusts no account
hint, and returns one minimal no-store context pointing to `/dashboard2`.

The removed POST behavior must not be restored. Supabase SSR owns cookie/session
refresh. Future registration, login, confirmation, recovery, and existing-
Google compatibility work must ship as separate bounded slices and preserve one
post-auth destination.

There is currently no runtime `/api/auth/session` consumer under `src/`; an
exhaustive source search found only its focused test. New consumers must adopt
the minimal GET response and must not recreate the legacy token/account-list
contract.

Route coverage is in `session/__tests__/route.test.ts`. It proves spoofed
headers/query values cannot affect context and that safe 401/403/503 responses do
not expose upstream details. No browser/E2E, provider, email-delivery, or live
database proof exists for this slice.

Independent local Slice 2A.2 validation passed with 27 focused tests plus the
pinned typecheck and production build. Docker-backed Slice 2A.1 replay remains
blocked because Docker Desktop is unavailable. Do not call or mutate remote
Supabase while the data decision remains pending.
