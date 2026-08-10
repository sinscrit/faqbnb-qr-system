# Canonical Public API Handover

Updated: 2026-08-10.

Exact `items/[publicId]/route.ts` is the unvalidated Slice 2C.2 candidate. It
uses the cookie-free anon-key server client and only `read_public_item`. Keep
the response to public ID/name, with one uniform 404 for invalid, draft, and
unknown UUIDs and sanitized 503 for malformed/upstream results. Responses stay
`no-store`. Canonicalize an accepted UUID to lowercase before the RPC.

Do not reintroduce service role, direct item-table access, translation,
analytics, demo data, in-memory rate limiting, logging of public IDs, or server
self-fetch. The existing `items/[publicId]/languages` route is legacy and not
part of the 2C.2 contract. The existing `/item/[publicId]` page is also not yet
compatible with the new DTO and must be migrated separately.

Independent validation, instructions/publication, guest-page/browser evidence,
one public URL builder, and QR verification remain pending.
