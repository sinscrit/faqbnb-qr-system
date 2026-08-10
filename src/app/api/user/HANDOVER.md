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
