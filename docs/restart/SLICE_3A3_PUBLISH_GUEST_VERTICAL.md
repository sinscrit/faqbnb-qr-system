# Slice 3A.3 Publish-To-Guest Vertical

Status: **PHASES 1–2 INDEPENDENTLY ACCEPTED — PHASE 3/4 GATES PENDING**

Updated: 2026-08-10.

## Outcome

This slice joins the independently validated atomic publication database half
to one compact host flow and one guest-safe public page. Phase 1 did not query,
link, or mutate any remote Supabase project. Do not apply it to the existing
data-bearing project while the data-migration decision remains pending.
Plan-governed disposable acceptance and a fresh isolated internal target are
allowed only after their respective database and deployment gates pass.

The host follows one route, `/dashboard2/create`: fresh cookie-bound property
resolution, at most one compact property choice, three content fields, an
inline guest-shaped preview, and one `Publish guest page` action. Publication
atomically creates the item and first instruction before making the stable
public identity visible. Success offers one primary `View guest page` link.

## Trust Boundary

`POST /api/user/items` is same-origin, JSON-only, and limited to 32 KiB. Its
strict payload is property/request UUIDs plus item name and one title/body
instruction. UUIDs are lowercased. Text is NFKC-normalized before unsafe
control/format rejection; names and titles become bounded single lines, while
the bounded body preserves meaningful LF and TAB. Account, user, role,
publication, internal ID, URL, media, and description fields are rejected.

The server resolves cookie-bound identity/account/property state before calling
only `publish_current_item_with_instruction`. It requires exactly one strict
row equal to the normalized submission. SQLSTATE `23505` becomes sanitized
`409 PUBLISH_CONFLICT`; auth, property, and unavailable outcomes expose no raw
database detail. The response contains only `{publicId,name}` and
`{title,body}`.

Migration `20260810000600_public_instruction_projection.sql` guards the exact
3A.2 function and ACL boundary, revokes authenticated access to obsolete draft
creation, and replaces the old reader with a stable, fixed-path,
security-definer projection executable only by `anon` and `authenticated`.
It returns exactly public ID, name, and deterministically ordered JSON
instructions shaped only as `{title,body}`. Drafts, unknown IDs, and published
items without a valid instruction return zero rows; anonymous table grants are
not added.

## Recovery And UX

Property hints and drafts are versioned session-storage hints only and are
restored after fresh property validation. No auth, account, or role value is
stored. Before a network/ambiguous result, the client freezes the exact
normalized request UUID and body and disables editing; Retry resends those
exact bytes. A deliberate discard mints a new request UUID. A definitive 400
thaws the form without dropping content. Duplicate submits are suppressed in
the same tick. Client validation announces the error while leaving focus on the
first invalid field; asynchronous/server recovery errors receive alert focus.

The public page loads through the shared request-cached anonymous loader rather
than an HTTP self-fetch. `/item/[publicId]`, its metadata, and the host success
link all consume `public-item-url.ts`; absolute URLs require the explicitly
trusted configured origin. The page renders only semantic ordered instruction
sections with preserved line breaks. Invalid/draft/unknown IDs share not-found;
upstream failures show an honest same-page Retry. There is no guest UUID,
host navigation, demo fallback, translation, analytics, reaction, visit, or
external-request surface.

The exact create route and `/item/*` prefix bypass both legacy provider stacks
and legacy middleware work. Other nested dashboard routes stay on the existing
transition path.

## Validation Boundary

The focused suite covers strict request parsing, normalization, tenant/property
sequencing, RPC/result cardinality, safe errors, public DTO validation,
canonical URLs, provider/middleware isolation, property selection, frozen
retry recovery, accessibility, page rendering, metadata, and not-found versus
unavailable behavior.

`3a3_public_instruction_projection.test.sql` adds 26 pgTAP candidate assertions
for the guarded reader shape, ACLs, no table grants, deterministic nested
projection, no internal keys, and draft/unknown/empty-publication parity. The
isolated database candidate total is now 474 assertions (44 + 77 + 123 + 132 +
72 + 26). Docker-backed Supabase PostgreSQL 17 replay, actual pgTAP execution,
and generated types remain blocked; PostgreSQL compatibility evidence is not a
substitute. Exact Node 22.23.2/npm 10.9.9 clean installation, prerequisite
tests, typecheck, production build, and diff hygiene remain the separate Phase
2 application-acceptance gate.

Phase 1 correction evidence under the exact pinned runtime passes the expanded
historical nine-file matrix at `105/105`, plus typecheck and diff hygiene. It
adds explicit CR/CRLF rejection at the client, route, and server DTO boundaries,
LF/TAB preservation, exact property-error result shapes, validation-versus-
network focus routing, and an exact multiline guest assertion. Separate review
repeated the evidence, verified the handover corrections, and independently
accepted Phase 1. Clean install/build, browser, and Supabase 17 runtime gates
were not implied by that acceptance. The clean install/build executor evidence
is now independently accepted below; browser and Supabase 17 runtime gates
remain pending.

Phase 2 executor evidence now adds a clean optional-dependency install under
exact Node `22.23.2`/npm `10.9.9`, confirms the native macOS ARM watcher, repeats
the historical matrix at `105/105`, passes the complete documented 18-file
prerequisite/focused union at `224/224`, and passes the `5/5` production route
gate, typecheck, production build, non-empty 21-byte build ID, full candidate
diff hygiene, and source-boundary scans. No application code or external state
changed. A different agent repeated every executable gate, verified the source
and diff boundaries, required bounded evidence corrections, and independently
accepted Phase 2. See `PHASE_2_LOCAL_APPLICATION_ACCEPTANCE.md`. Phase 3 browser
and Phase 4 Supabase 17 evidence remain pending.
