# Canonical Public API Handover

Updated: 2026-08-10.

Exact `items/[publicId]/route.ts` is the independently accepted local Slice
3A.3 reader. It uses the cookie-free anon-key server client and only
`read_public_item`. Keep the response to public ID/name plus deterministically
ordered `{title,body}` instructions, with one uniform 404 for invalid, draft,
and unknown UUIDs and sanitized 503 for malformed/upstream results. Responses
stay `no-store`. Canonicalize an accepted UUID to lowercase before the RPC.

Do not introduce service role, direct item-table access, translation,
analytics, demo data, in-memory rate limiting, logging of public IDs, or server
self-fetch. The existing `items/[publicId]/languages` route is legacy and not
part of the Slice 3A.3 contract. `/item/[publicId]` now consumes this strict DTO
through the request-cached anonymous loader without an HTTP self-fetch.

The expanded pinned Phase 1 matrix passes `105/105`, and separate review
accepted the API/guest boundary. Phase 2 clean-build, Phase 3 browser, Phase 4
database runtime, and QR verification remain pending.
