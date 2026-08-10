# Canonical User API Handover

Updated: 2026-08-10.

`property-context/route.ts` is the Slice 2B.2 cookie-backed property setup
boundary. GET accepts no client context. POST accepts only strict same-origin,
16 KiB JSON `create` or `select` actions. Never add an account header, account
query/body value, bearer token, service-role client, raw metadata, or upstream
error detail.

Creation sends only property content to `resolve_current_property`. Selection
is a hint and must be revalidated after fresh cookie/account resolution through
the authenticated RLS client. Multi-property choices must remain minimal and
account-scoped. All responses remain `no-store` and sanitized.

Independent local validation passes; Supabase 17 replay, generated types,
remote behavior, and browser acceptance are pending. Do not mutate the existing
data-bearing project while `docs/restart/DATA_MIGRATION_DECISION.md` is pending.
The execution plan separately permits a proven disposable acceptance target and,
after its gates, a fresh isolated internal target.

`items/route.ts` is the independently accepted local Slice 3A.3 atomic
publication boundary. It exports POST only and accepts exact same-origin 32 KiB
JSON with property UUID, retry UUID, normalized item name, and one normalized
title/body instruction. It must
continue through the cookie-bound server client and `publishCurrentItem`; never
add account/user/role authority, description, explicit publication state,
list/GET behavior, service role, or upstream detail. The body preserves LF/TAB
but rejects CR/CRLF at the client, route, server DTO, and database boundaries.
A sanitized `409 PUBLISH_CONFLICT` requires a fresh request UUID after
intentional content changes; it is not a retryable availability failure.
Its only success DTO is
`{success:true,item:{publicId,name},instruction:{title,body}}` and every response
is `no-store`. Phase 1 evidence passes the exact pinned `105/105` focused
matrix, typecheck, and diff hygiene; separate review accepted the boundary.
Phase 2 clean-build and Phase 4 database runtime gates remain pending. See
`items/HANDOVER.md` and
`docs/restart/SLICE_3A3_PUBLISH_GUEST_VERTICAL.md`.
