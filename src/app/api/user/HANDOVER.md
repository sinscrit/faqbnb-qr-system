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
remote behavior, and browser acceptance are pending. No remote mutation is
allowed while `docs/restart/DATA_MIGRATION_DECISION.md` is pending.

`items/route.ts` is the Slice 2C.2 implementation candidate. It exports POST
only and accepts exact same-origin 16 KiB JSON with property UUID, retry UUID,
and normalized item name. It must continue through the cookie-bound server
client and `createCurrentItem`; never add account/user/role authority,
description, publication, list/GET behavior, service role, or upstream detail.
Normalize accepted UUIDs to lowercase and reject control/format characters
before collapsing name whitespace. A sanitized `409 ITEM_CREATION_CONFLICT`
requires a fresh request UUID after intentional content changes; it is not a
retryable availability failure.
Its only success DTO is `{success:true,item:{publicId,name}}` and every response
is `no-store`. Independent validation and a host UI consumer remain pending;
see `items/HANDOVER.md` and the Slice 2C.2 restart document.
