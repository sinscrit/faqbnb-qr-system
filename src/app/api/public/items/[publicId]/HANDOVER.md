# Public Item Route Handover

Updated: 2026-08-10.

`route.ts` is the independently accepted local Slice 3A.3 published-instruction
reader. It
accepts only a UUID path parameter, constructs a cookie-free anon-key client,
canonicalizes the UUID to lowercase, calls `readPublicItem`, and returns exactly
public ID/name plus ordered `{title,body}` instructions. Invalid, draft, and
unknown UUIDs share one 404; protocol/upstream failures are safe 503s. All
responses are `no-store`.

Never add internal IDs, properties, accounts, translation, language selection,
analytics, demo fallbacks, service role, direct table reads, or self-fetch here.
The exact pinned Phase 1 focused matrix passes `105/105`, with typecheck and diff
hygiene also passing. Separate review accepted Phase 1. Phase 2 clean-build and
Phase 4 database runtime proof remain pending.
