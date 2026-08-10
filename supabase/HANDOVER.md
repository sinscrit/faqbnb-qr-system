# Supabase Handover

Updated: 2026-08-10.

## Phase 4C Generated-Type Hygiene Pending Validation

The local schema and migrations are unchanged. The type-generation wrapper now
normalizes the Supabase CLI's trailing CR/LF run to exactly one LF in its
checked temporary file before atomic replacement. Two pinned generations from
the accepted local stack are identical at 473 lines, 13,339 bytes, and SHA-256
`6a732e3339010267f6c043371ddbf478972371f208e73adb16ecea0dd9b75178`.
Comparison with Phase 4B proves only EOF changed; publication and public-reader
RPC types remain exact. Pinned typecheck, `105/105` focused tests, and candidate
diff hygiene pass. This bounded post-acceptance correction awaits independent
validation; do not describe it as accepted yet.

## Current State

All six ordered restart migrations and their 475 pgTAP assertions are
independently accepted on Supabase PostgreSQL 17.6. Slices 2A.1,
2B.1, 2C.1, and 3A.1 establish identity/account, property, draft item, and
instruction storage. Slice 3A.2 adds the atomic item/instruction publication RPC
with 73 assertions; Slice 3A.3 adds the exact public instruction projection with
26 assertions and is accepted only as the coordinated database half of the
publication-to-guest vertical.

Phase 4A restored a local user-level Colima Docker runtime and is independently
accepted. Phase 4B executor evidence now passes fresh six-migration replay,
`475/475` pgTAP, all targeted real-role/concurrency/rollback/ACL/Unicode probes,
deterministic local type generation, the focused/prerequisite application
matrices, route gate, typecheck, and build. Exact evidence is in
`../docs/restart/PHASE_4B_SUPABASE_RUNTIME_ACCEPTANCE.md`. A different agent
repeated the complete evidence and final clean reset without correction. The
older PostgreSQL 14 compatibility evidence is historical. No remote Supabase
project was linked, queried, or mutated. Do not use
`supabase link`, `db push`, `migration repair`, remote type generation, or a
project ID against the existing data-bearing project while the data decision is
pending. Phase 4 may use a target proven disposable, and later internal
deployment may use a fresh isolated target after its gates; verify the target
identity and scope before any linking or migration command.

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
8. Read `../docs/restart/SLICE_3A2_ATOMIC_PUBLICATION_DATABASE.md`, then inspect
   `migrations/20260810000500_atomic_item_publication.sql` and
   `tests/database/3a2_atomic_item_publication.test.sql`.
9. Read `../docs/restart/SLICE_3A3_PUBLISH_GUEST_VERTICAL.md`, then inspect
   `migrations/20260810000600_public_instruction_projection.sql` and
   `tests/database/3a3_public_instruction_projection.test.sql`.
10. Confirm `node_modules/.bin/supabase --version` is `2.113.0`.

## Validation Queue

With Docker running, from the repository root:

```text
npm run db:start
npm run db:reset
npm run db:test
npm run db:types
npm run db:stop
```

Do not grant Phase 4 database runtime acceptance unless all six ordered
migrations replay from zero and all 475 assertions pass (44 Slice 2A.1 + 77
Slice 2B.1 + 123 Slice 2C.1 + 132 Slice 3A.1 + 73 Slice 3A.2 + 26 Slice
3A.3). `db:types` replaces `src/types/database.generated.ts` atomically only
after successful non-empty local generation; still inspect provenance and diff
before staging it.

## Historical Compatibility Evidence

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

## Current Accepted Runtime

Docker Desktop remains unavailable, but Phase 4A installed and started a
user-level Colima `0.10.3` runtime. Docker Engine `29.5.2` is reachable as
`linux/arm64` through context `colima` and socket
`unix:///Users/shinyqk/.colima/default/docker.sock`, with four CPUs, 8 GiB
memory, and a 40 GiB data disk. Repository-pinned Supabase CLI `2.113.0` now
runs the complete local `faqbnb_manus` stack, including PostgreSQL 17.6 on the
`17.6.1.158` image. Exact runtime evidence and recovery commands are in
`../docs/restart/PHASE_4A_CONTAINER_RUNTIME.md`.

Phase 4A is independently accepted. Its separate validator repeated the live
runtime, resource, context/socket, cleanup, pinned CLI, and absent local
Supabase-resource checks without finding a correction. Phase 4B executor work
then corrected the publication input name and raw-before-trim unsafe-character
validation, replayed all six migrations from zero, passed all 475 assertions
and required probes, generated stable local types, and repeated application
acceptance. A different agent repeated those gates without correction. The
clean local stack remains running for Phase 5 and later real-stack acceptance.

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
- Historically, Slice 2C.1 added no instruction/publication write path, and
  Slice 3A.1 added instruction storage only. Those precursor limitations are
  superseded by the accepted coordinated 3A.2/3A.3 candidate and must not be
  read as current migration-tree behavior.
- Slice 3A.2/3A.3 atomically publishes one item/instruction and exposes only the
  allow-listed ordered public projection. They add no QR, media, tags, location,
  language, anonymous table grants, or direct client DML.
- The generated local database types are now canonical for the restart schema;
  the publication boundary derives both publication and public-reader RPC
  arguments from them. They deliberately do not replace the broader legacy
  application's richer inline database type.
- Email confirmation remains required; the bootstrap RPC never creates or
  confirms auth identities.
- Existing Google access and the preservation-safe no-live-mutation rule remain
  unchanged.
