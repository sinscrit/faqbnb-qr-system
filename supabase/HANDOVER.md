# Supabase Handover

Updated: 2026-08-10.

## Current State

Slices 2A.1, 2B.1, and 2C.1 have passed independent static validation. Slice
2C.1 provides the ordered draft-item/public-identity boundary and a
123-assertion pgTAP candidate. All three migrations replayed in an isolated PostgreSQL 14
compatibility probe; a real Docker-backed Supabase 17 replay and pgTAP run
remain blocked. No remote Supabase project was linked, queried, or mutated. Do
not use `supabase link`, `db push`, `migration repair`, remote type generation,
or a project ID while the data decision is pending.

Slice 3A.1 is independently statically accepted after those three migrations.
It adds private plain-text instruction storage and a 132-assertion candidate,
but no creation/publication RPC or anonymous reader. UTF8 PostgreSQL 14 ordered
replay and role/guard probes pass; Supabase 17 runtime validation remains
pending.

## Start Here

1. Read `../docs/restart/DATA_MIGRATION_DECISION.md`.
2. Read `../docs/restart/SLICE_2A1_DATABASE.md`.
3. Read `../docs/restart/SLICE_2B1_PROPERTY_DATABASE.md`.
4. Inspect `migrations/20260810000100_identity_account_foundation.sql` and
   `tests/database/2a1_identity_account.test.sql`.
5. Inspect `migrations/20260810000200_property_context_foundation.sql` and
   `tests/database/2b1_property_context.test.sql`.
6. Read `../docs/restart/SLICE_2C1_ITEM_DATABASE.md`, then inspect
   `migrations/20260810000300_item_public_identity.sql` and
   `tests/database/2c1_item_public_identity.test.sql`.
7. Read `../docs/restart/SLICE_3A1_INSTRUCTION_DATABASE.md`, then inspect
   `migrations/20260810000400_instruction_foundation.sql` and
   `tests/database/3a1_instruction_foundation.test.sql`.
8. Confirm `node_modules/.bin/supabase --version` is `2.113.0`.

## Validation Queue

With Docker running, from the repository root:

```text
npm run db:start
npm run db:reset
npm run db:test
npm run db:types
npm run db:stop
```

Do not grant Slice 3A.1 runtime acceptance unless all four ordered migrations
replay from zero and all 376 assertions pass (44 Slice 2A.1 + 77 Slice 2B.1 +
123 Slice 2C.1 + 132 Slice 3A.1). `db:types` replaces `src/types/database.generated.ts`
atomically only after successful non-empty local generation; still inspect
provenance and diff before staging it.

Independent review corrected the guard to require the complete Slice 2A.1
baseline before any 2B.1 DDL. It also expanded the test candidate to cover
PUBLIC table grants, function owner/security/search-path properties, an earlier
viewer membership not shadowing a writable account, and null property details
when explicit selection is required. PostgreSQL 14 compatibility probes returned
one shared row for simultaneous first-create calls and made a concurrent role
downgrade wait for the membership lock. These are not substitutes for Supabase
17 or pgTAP runtime acceptance.

The independently statically accepted Slice 2C.1 boundary guards every named item relation and
function, requires the complete 2A.1/2B.1 boundary, and verifies the exact
column/key/cascade/RLS/function traits it composes before item DDL. It creates draft-only
items through a confirmed authenticated owner/admin/member RPC, treats the
property UUID as a membership-validated hint, uses a property-scoped request
UUID for exact retry/conflict behavior, and exposes published identity only
through a two-field anonymous RPC. PUBLIC and both client roles are explicitly
stripped of table rights before authenticated read-only access is restored.
The public-ID and `(property_id, creation_request_id)` unique B-trees provide
the required public and property-prefix lookups; redundant single-column
indexes are deliberately absent, while their historical names remain guarded.
PostgreSQL 14 compatibility probes returned
one public UUID/one row for simultaneous duplicate requests and made a
downgrade-first role race wait before denying creation. This evidence and
static acceptance are not Supabase 17 or pgTAP runtime acceptance.

## Current Blocker

The Docker CLI exists, but its daemon is not running. The CLI reports no socket
at `/Users/shinyqk/.docker/run/docker.sock`, and `open -a Docker` confirms that
Docker Desktop is not installed. No database test pass is claimed.

## Scope Boundary

- `supabase/` is the canonical forward migration/test tree.
- `../database/` is unchanged legacy evidence and must not be replayed.
- The 2A.1 migration deliberately fails before DDL when identity/account
  boundary objects already exist. It is a fresh isolated baseline, not the
  future preservation-safe live migration.
- The 2B.1 migration likewise fails before property DDL when property boundary
  objects already exist. Its stable seven-type seed is new product data and is
  not claimed to map to the seven live rows. It is not an additive live
  migration.
- `properties.account_id` is non-null in the isolated baseline, while live
  remains nullable. A future preservation migration must prove ownership,
  backfill safely, preserve `user_id` during compatibility, and map types before
  enforcing that invariant.
- Property clients have read-only table access; first creation is through
  `resolve_current_property`. Multiple properties return `selection_required`
  without selecting, renaming, creating, deleting, or consolidating anything.
- The local project uses PostgreSQL 17, the current default of the pinned CLI;
  the live database major version remains unverified and must be checked before
  any future live migration approval.
- Slice 2C.1 adds no instruction/content table, publication write path,
  application route/UI, public page, URL builder, QR field, media, tags,
  location, or language field. New rows are drafts and anonymous table access
  remains zero.
- Slice 3A.1 adds instruction storage only. It has no client creation/editing
  RPC, publication transition, anonymous projection, source language, links,
  media, API, or UI; it does not make a useful guest page available.
- The isolated database slices do not by themselves replace the canonical
  application APIs or generated database types.
- Email confirmation remains required; the bootstrap RPC never creates or
  confirms auth identities.
- Existing Google access and the preservation-safe no-live-mutation rule remain
  unchanged.
