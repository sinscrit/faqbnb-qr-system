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

Do not call or mutate the existing data-bearing Supabase project while
`../../docs/restart/DATA_MIGRATION_DECISION.md` remains pending. The execution
plan separately permits a proven disposable acceptance target and, after its
gates, a fresh isolated internal target.

## Slice 2B.2 Property Context

`property-context.ts` composes the canonical current-user resolver with only
`resolve_current_property`. Keep its strict single-row/state invariants and
account-ID equality check. Client property IDs are hints: re-resolve context and
check an account-scoped RLS row before returning ready. Multi-property lists
must stay minimal, sorted, count-matched, unique, and RLS-scoped. Never accept
client account/user/role authority or expose upstream detail. Independent local
validation passes; Supabase 17 remains pending.

`routing/canonical-route-policy.ts` is the exact-route middleware boundary for
the request-owned auth pages/callback and `/dashboard2`. Do not broaden its
dashboard match to nested routes: those still use the legacy transition shell.
The local standalone browser pass added this boundary after proving that legacy
middleware otherwise redirected before the canonical property API could own
auth. Eleven policy assertions, the corrected desktop/mobile matrix, and pinned
typecheck/build pass; independent browser repetition remains pending.

## Historical Slice 2C.2 Draft-Creation Boundary — Superseded

This section records the accepted draft-only precursor and is not current
implementation guidance. Slice 2C.2 composed `resolvePropertySelection` with
`create_current_item`, freshly resolved cookie/account/property state, and
returned only a strict public ID/name draft projection. It canonicalized UUIDs
and mapped changed-content request reuse to `409 ITEM_CREATION_CONFLICT`.

The precursor also established the separate cookie-free anonymous client and
uniform draft/unknown 404 behavior. Those security properties remain relevant,
but the old draft creation call and its no-publication scope are superseded by
the Slice 3A.3 publication boundary below. Do not restore `create_current_item`
as the current write path or treat the historical no-publication language as a
present constraint. See `../../docs/restart/SLICE_2C2_ITEM_API.md` only for the
historical acceptance record.

## Slice 3A.3 Publication Boundary — Phase 1 Independently Accepted

`item-boundary.ts` now owns the atomic publication DTO as a strict independent
server boundary before property or RPC work. It accepts canonical UUIDs,
bounded single-line item/title content, and an instruction body that preserves
LF/TAB while rejecting CR, CRLF, unsafe controls, format/surrogate characters,
U+2028, and U+2029. Property-context failures are deliberately reconstructed as
the exact `PublicationResult` error and must never leak `authenticated`, account,
or context fields.

The exact Node `22.23.2`/npm `10.9.9` historical nine-file Slice 3A.3 matrix,
expanded with six regressions, passes `105/105`; pinned typecheck and diff
hygiene pass. A separate validator repeated the evidence, verified the handover
corrections, and independently accepted Phase 1. Phase 2 executor evidence now
passes the exact clean install, `105/105` focused and `224/224` prerequisite
matrices, route gate, typecheck, build/build ID, boundary scans, and diff
hygiene; see `../../docs/restart/PHASE_2_LOCAL_APPLICATION_ACCEPTANCE.md`.
A separate validator accepted Phase 2. Phase 3 browser acceptance and Phase 4
Supabase 17 replay/generated types remain pending.

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
