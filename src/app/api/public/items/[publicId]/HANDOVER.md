# Public Item Route Handover

Updated: 2026-08-10.

`route.ts` is the Slice 2C.2 minimal published-identity reader candidate. It
accepts only a UUID path parameter, constructs a cookie-free anon-key client,
canonicalizes the UUID to lowercase, calls `readPublicItem`, and returns exactly public ID/name. Invalid, draft, and
unknown UUIDs share one 404; protocol/upstream failures are safe 503s. All
responses are `no-store`.

Never add nested instructions, internal IDs, properties, accounts, translation,
language selection, analytics, demo fallbacks, service role, direct table reads,
or self-fetch here. Publication does not exist yet, and the legacy guest page
is not compatible with this DTO. Independent validation is pending.
