# Slice 2A.3 — Canonical Email Authentication

Status: **IMPLEMENTED AND INDEPENDENTLY VALIDATED LOCALLY**; browser proof,
staging delivery, and provider proof remain pending, 2026-08-10.

## User Journey

- `/login` has one primary email/password form, password recovery, and account
  creation links. Server success has one accepted destination: `/dashboard2`.
- `/register` asks only for optional display name, email, password, and password
  confirmation. Success stays inline with one action back to sign in.
- `/forgot-password` always shows the same generic success state, regardless of
  whether an identity exists.
- `/reset-password` requires the recovery cookie session and offers one recovery
  link when the session is invalid or expired.
- All four canonical auth pages are isolated from the legacy root AuthContext,
  locale, theme, debug, version-footer, browser Supabase, and localStorage stack.
- `/auth/confirm` handles supported PKCE `code` and email `token_hash` shapes.
  Confirmation converges through the canonical current-user context; recovery
  proceeds to the password form. No query parameter selects a destination.

Legacy `/register/complete`, `/register/success`, and `/auth/oauth/callback`
requests are redirected to the canonical entry points before legacy middleware
logging or account behavior runs. Deferred access-request, access-code redeem,
code-validation, and OAuth-completion pages/APIs return the production route
gate's non-cacheable `404`, while their source remains available in development.

## Server And Security Contract

- Login, registration, recovery request, and password update use only the
  request-bound `createSupabaseServer` cookie client.
- Mutation requests require exact configured same-origin authority and JSON
  content, use strict shapes, and are limited to 16 KiB. Password validation is
  shared by browser and server: 10–128 characters with at least one letter and
  number.
- Login calls `resolveCurrentUserContext` after password sign-in and clears the
  cookie session if verified-email/bootstrap convergence fails.
- Registration calls Supabase Auth only. It performs no access-code operation,
  public-table write, role redirect, or token/user response. A returned session
  indicates unsafe auto-confirm configuration, is cleared, and fails closed.
  Deterministic cookie removal runs even if provider sign-out fails.
  If neither provider sign-out nor targeted cookie deletion can be confirmed,
  the failing response adds `Clear-Site-Data: "cookies"` as a last-resort
  browser defense; it never reports auth success.
- `APP_ORIGIN` (falling back to the existing `NEXT_PUBLIC_APP_URL`) is parsed as
  an exact origin before it can construct confirmation/recovery URLs. HTTPS is
  mandatory outside `localhost`, `127.0.0.1`, and `[::1]` loopback development.
- Recovery request success is enumeration-resistant. A successful recovery
  callback mints a ten-minute, HMAC-authenticated, recovered-user-bound,
  HttpOnly, SameSite-strict proof cookie scoped only to the update endpoint.
  Password update clears the cookie before every attempt and requires the proof
  plus a server-validated matching recovery session, then resolves the same
  canonical context; an ordinary authenticated session is denied. The HMAC key
  is an independent server secret of at least 32 bytes. Rotation immediately
  invalidates outstanding ten-minute proofs.
- Cookie clearing makes the ordinary browser journey single-attempt. The proof
  is deliberately stateless, so durable server-side concurrent replay
  prevention is not claimed; that would require an accepted nonce store.
- Responses are `no-store` and contain stable sanitized messages. Touched routes
  contain no auth-code, email, user-ID, provider-error, or token logging.

## Google Compatibility Boundary

Email remains the only registration method. A subordinate “already use Google”
link appears only when both provider credentials, a dedicated OAuth-state HMAC
secret, and
`GOOGLE_EXISTING_USER_ONLY_VERIFIED=true`. That flag attests provider-side
new-user creation is disabled and the boundary has passed staging. The
initiation route accepts no access-code, email, or registration parameters.
After Google sign-in, the
callback requires an existing RLS-visible application profile before resolving
context; otherwise it signs out and performs no profile/account enrollment.
OAuth state is HMAC-authenticated, expires after ten minutes, is callback-path
scoped, and is consumed on every callback attempt.

This local behavior does not prove that the provider is configured to refuse
creation of a new Supabase Auth identity. If the attestation is wrong,
`signInWithIdToken` can create an `auth.users` row before the application-profile
check signs the browser out; the application does not create public profile,
account, or membership rows. Keep the feature flag off until provider-side
signup denial and both callback outcomes are proven in staging.

## Local Evidence

- 33 focused tests cover shared password/request validation, strict body shape
  and size, trusted origins, sanitized login failures, verified-context
  convergence, auto-confirm denial, generic duplicate/recovery behavior,
  provider-signout failure cleanup, HMAC recovery binding/tamper/expiry,
  callback shapes/flow confusion, duplicate-submit suppression,
  labels/autocomplete/links, Google configuration visibility, signed OAuth
  state, provider-stack isolation for all four auth pages, and unknown/existing
  Google profile boundaries. The five route-gate
  regressions also pass with canonical auth paths admitted and legacy auth
  journeys blocked in production.
- Under exact Node `22.23.2` (`Jod`) and npm `10.9.9`, all 33 focused tests, five
  route-gate tests, typecheck, production build, a 21-byte non-empty build ID,
  and diff hygiene pass.
- Independent validation corrected the forgeable UUID recovery proof, unsigned
  OAuth state, missing same-origin/content-type boundary, sign-out failure
  cleanup, recovery-user binding, callback shape confusion, no-store gaps,
  sensitive middleware redirects/logs, production access-code surfaces, and
  unintended legacy provider/localStorage initialization on auth pages.
- No browser, live provider, real email delivery, or remote database
  call/mutation was performed.

## Remaining Acceptance Gates

1. Standalone Playwright must exercise the responsive journey after the local
   app is started through the repository's required `browser-init` workflow.
2. Railway staging must configure independent recovery/OAuth HMAC keys and
   prove real confirmation and recovery delivery, expired
   link recovery, cookie continuity, and `/dashboard2` convergence.
3. Existing-Google compatibility stays disabled until provider-side signup
   denial, redirect, unknown-profile denial, and existing-identity behavior are
   proven; any `auth.users` side effect must be checked explicitly.
4. Docker-backed Slice 2A.1 replay and all 44 pgTAP assertions remain blocked
   because Docker Desktop/Supabase 17 are unavailable locally.
