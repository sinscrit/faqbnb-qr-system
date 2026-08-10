# Auth API Handover

Updated: 2026-08-10.

## Slice 2A.3 Independently Validated Locally

`login` and `register` now use the request-bound cookie server client. Login
requires verified-email/account-context convergence and returns only
`/dashboard2`; registration performs Auth sign-up only, requires email
confirmation, exposes no identity, and denies an unsafe auto-confirm session.
`recovery/` owns generic recovery requests and cookie-bound password updates.

All auth mutations require same-origin JSON. Recovery uses a short-lived,
recovered-user-bound HMAC proof, and failed application gates deterministically
clear local Supabase cookies even if provider sign-out fails.
An unconfirmed cleanup adds `Clear-Site-Data: "cookies"` only to the failing
response as a last-resort browser defense.

Direct Google routes are compatibility login only, accept no registration
inputs, require an existing RLS-visible profile, use signed expiring state, and
are disabled unless all server configuration plus
`GOOGLE_EXISTING_USER_ONLY_VERIFIED=true` is present.
Keep the flag off until provider-side existing-user-only behavior is proven.
If provider signup denial is misconfigured, Supabase Auth can create an auth
identity before the application-profile check rejects it; no application
records are enrolled.

Independent validation passed 33 focused auth tests, five route-gate tests,
exact-pinned typecheck/build, non-empty build ID, and diff hygiene. Browser,
real email, live provider, Docker-backed Supabase 17, and remote proof remain
pending.

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
