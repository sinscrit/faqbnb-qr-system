# `src/lib` Handover

Updated: 2026-08-10.

## Active Canonical Auth Primitive

`current-user-context.ts` is the Slice 2A.2 server-only identity/account
resolver. It accepts a request-bound client, validates `auth.getUser()`,
requires confirmed email ownership, invokes only `bootstrap_current_user`, and
returns one minimal account context with `/dashboard2` as the only destination.

Do not add request headers, query parameters, bearer tokens, local storage,
service-role clients, account lists, or role redirects to this primitive.
Client authority must not enter its interface. Database/auth failures and
invalid bootstrap output must remain fail-closed.

Focused coverage is in `__tests__/current-user-context.test.ts`. The tests use
dependency-injected clients only; they are not live database proof. Slice 2A.1
still requires Docker-backed Supabase 17 replay and pgTAP acceptance.

Slice 2A.2 passed independent local validation. Keep malformed auth/RPC
envelopes fail-closed, require `email_confirmed_at` rather than deprecated
generic `confirmed_at`, strictly parse exactly one bootstrap row, and retain
Unicode-safe optional-name bounds.

No remote Supabase call or mutation is allowed while
`../../docs/restart/DATA_MIGRATION_DECISION.md` remains pending.

## Slice 2A.3 Shared Contracts

`auth-flow.ts` is the shared client/server request and password contract;
`auth-origin.ts` is the server-only trusted callback-origin and Google feature
gate; `recovery-intent.ts` defines the short-lived callback-minted recovery
proof consumed by the password update route; `oauth-state.ts` provides the
separate signed Google state; and `auth-session-cleanup.ts` guarantees local
cookie removal after application-gate failure even when provider sign-out
fails, with a failing-response `Clear-Site-Data` fallback when neither cleanup
path can be confirmed. Keep HMAC keys independent, origin selection environment-owned, HTTPS
outside loopback, and request schemas strict, same-origin, JSON-only, and
size-bounded. Slice 2A.3 is independently validated locally; browser, staging
email/provider, and live-database evidence remain pending.
