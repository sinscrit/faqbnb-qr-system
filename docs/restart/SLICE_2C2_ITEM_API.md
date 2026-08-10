# Slice 2C.2 Item Server And Public Read Boundary

Status: **INDEPENDENTLY VALIDATED LOCALLY**

Updated: 2026-08-10.

## Outcome

This slice wires the isolated Slice 2C.1 item RPCs into two small server-only
application boundaries. It does not add item UI, instructions, publication,
guest-page rendering, URL construction, QR generation, translation, analytics,
or live database behavior.

- `POST /api/user/items` creates one draft item for a freshly validated
  cookie/account/property context.
- `GET /api/public/items/[publicId]` reads only the published two-field guest
  projection through an anonymous, cookie-free client.
- Both handlers return `Cache-Control: no-store` and stable, sanitized errors.

No remote Supabase call or mutation occurred. The pending data decision still
forbids applying the isolated database foundation to a live project.

## Authenticated Creation Contract

The host endpoint exports POST only. It accepts exactly same-origin,
JSON-only, 16 KiB-bounded:

```json
{
  "propertyId": "uuid",
  "requestId": "uuid",
  "name": "Coffee machine"
}
```

The schema rejects account IDs, user IDs, roles, descriptions, publication
state, internal IDs, URLs, QR fields, media, and all other extra input. The
name is NFKC-normalized, then unsafe control/format characters are rejected
before whitespace collapse and trim. Newlines and tabs therefore fail rather
than silently becoming spaces. The result is bounded to 120 Unicode code
points. Both accepted UUIDs are canonicalized to lowercase.

The request-bound Supabase client first runs the accepted current-user/account
resolver, then treats `propertyId` only as a hint through
`resolvePropertySelection`. A one-property context must match it; a
multiple-property context must revalidate it through account-scoped RLS. Only
after that fresh check does the helper call:

```text
create_current_item(p_property_id, p_request_id, p_name)
```

The helper requires exactly one strict RPC row, the same freshly resolved
property UUID, the normalized submitted name, and a valid generated public
UUID. The application response exposes only:

```json
{
  "success": true,
  "item": {
    "publicId": "uuid",
    "name": "Coffee machine"
  }
}
```

The request UUID remains the retry boundary established by Slice 2C.1. It is
not returned and cannot choose a tenant. A retry with the same normalized
content returns the stable item. Reusing it after intentionally changing the
name maps SQLSTATE `22023` to sanitized `409 ITEM_CREATION_CONFLICT`; the client
must mint a new request UUID before resubmitting changed content. This is not a
retryable 503. There is no authenticated GET/list contract in this slice.

## Anonymous Published Read Contract

`createPublicSupabaseServer` uses only the public Supabase URL and anon key. It
has no cookie adapter, does not persist or refresh sessions, and never imports
the service-role client or key.

The public handler validates a UUID route parameter and calls only:

```text
read_public_item(p_public_id)
```

It requires zero or one strict row. Zero rows are the Slice 2C.1 contract for
both drafts and unknown UUIDs and become the same `ITEM_NOT_FOUND` 404. An
invalid route UUID receives that same response without a database call.
Malformed, multiple, mismatched, thrown, or upstream-error results fail closed
with a sanitized 503. A successful response exposes only public ID and name.

The handler contains no translation, language, analytics, in-memory rate-limit,
demo-data, internal table query, service-role, or self-fetch path. The existing
legacy `/api/public/items/[publicId]/languages` sibling and `/item/[publicId]`
page are not part of this accepted contract and still require migration.

## Verification Evidence

Implementation-agent evidence under exact Node `22.23.2` and npm `10.9.9`:

- 52 focused tests pass across item core, public-client, authenticated route,
  and public route files;
- 123 prerequisite/focused tests pass when current-user, property-context, and
  session/property route suites are included;
- TypeScript typecheck passes;
- the production build passes and produces a 21-byte `.next/BUILD_ID`;
- source checks find no self-fetch, service-role, translation, analytics,
  rate-limit, or demo dependency in the new production boundary; and
- `git diff --check` passes.

The final 52 focused tests cover strict origin/content type/size, forged fields, name and UUID
validation, current-user/property sequencing, cross-account denial, exact RPC
arguments, output cardinality and property/name equality, safe status mapping,
exact DTOs, anon-key client configuration, uniform draft/unknown behavior, and
malformed public results.

Independent validation inspected the trust boundary and repeated the focused,
pinned checks before accepting the slice locally. This is still not live or
local-database integration proof.

## Remaining Boundary

- Slice 2C.1 has independent static acceptance. Docker-backed Supabase 17
  replay, all 244 database assertions, and generated types remain pending.
- No publication write path exists, so this slice cannot itself make a draft
  visible to the anonymous reader.
- The canonical item/instruction host UI is not wired to `POST /api/user/items`.
- The existing guest page expects a legacy translated, nested DTO and performs
  server self-fetches. It is intentionally not claimed compatible with this
  minimal endpoint.
- Instructions, useful-content validation, the only publication transition,
  one public URL builder, external QR verification, and guest-page/browser
  acceptance remain later work.
