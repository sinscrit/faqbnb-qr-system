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

## Slice 2C.2 Item Boundaries

`item-boundary.ts` composes `resolvePropertySelection` with
`create_current_item`. Keep the order: freshly resolve cookie/account/property,
then call the item RPC with only selected property, request UUID, and name.
Require exactly one strict row matching the fresh property and submitted name;
expose only camel-case public ID/name. Client property and request UUIDs remain
hints/idempotency content, never tenant authority.

Canonicalize both UUID hints to lowercase. SQLSTATE `22023` after API validation
means the request UUID was reused with different content; return sanitized
`409 ITEM_CREATION_CONFLICT`. The caller must mint a new request UUID after an
intentional name change instead of retrying the conflicting request.

The same module validates `read_public_item` separately for an anonymous
client. Zero rows mean the uniform draft/unknown 404; malformed, multiple,
mismatched, thrown, or upstream-error results remain sanitized 503s.
`supabase-public-server.ts` must stay cookie-free, anon-key-only, and unable to
persist or refresh a session. Never import the service-role key/client or add a
self-fetch, translation, analytics, demo, or internal-table fallback.

Focused implementation tests pass, but independent validation and database
runtime proof are pending. No publication write path or guest-page compatibility
is included; see `../../docs/restart/SLICE_2C2_ITEM_API.md`.

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
