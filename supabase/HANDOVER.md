# Supabase Handover

Updated: 2026-08-10.

## Current State

Slices 2A.1 and 2B.1 have passed independent static validation. Slice 2B.1 has
an ordered property/type migration and 77-assertion pgTAP candidate. Both
migrations replayed in an
isolated PostgreSQL 14 compatibility probe; a real Docker-backed Supabase 17
replay and pgTAP run remain blocked. No remote Supabase project was linked,
queried, or mutated. Do not use `supabase link`, `db push`, `migration repair`,
remote type generation, or a project ID while the data decision is pending.

## Start Here

1. Read `../docs/restart/DATA_MIGRATION_DECISION.md`.
2. Read `../docs/restart/SLICE_2A1_DATABASE.md`.
3. Read `../docs/restart/SLICE_2B1_PROPERTY_DATABASE.md`.
4. Inspect `migrations/20260810000100_identity_account_foundation.sql` and
   `tests/database/2a1_identity_account.test.sql`.
5. Inspect `migrations/20260810000200_property_context_foundation.sql` and
   `tests/database/2b1_property_context.test.sql`.
6. Confirm `node_modules/.bin/supabase --version` is `2.113.0`.

## Validation Queue

With Docker running, from the repository root:

```text
npm run db:start
npm run db:reset
npm run db:test
npm run db:types
npm run db:stop
```

Do not grant runtime acceptance unless both ordered migrations replay from zero
and all 44 Slice 2A.1 plus 77 Slice 2B.1 pgTAP assertions pass. `db:types` replaces
`src/types/database.generated.ts` atomically only after successful non-empty
local generation; still inspect provenance and diff before staging it.

Independent review corrected the guard to require the complete Slice 2A.1
baseline before any 2B.1 DDL. It also expanded the test candidate to cover
PUBLIC table grants, function owner/security/search-path properties, an earlier
viewer membership not shadowing a writable account, and null property details
when explicit selection is required. PostgreSQL 14 compatibility probes returned
one shared row for simultaneous first-create calls and made a concurrent role
downgrade wait for the membership lock. These are not substitutes for Supabase
17 or pgTAP runtime acceptance.

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
- These database slices add no property application route/UI wiring.
- Email confirmation remains required; the bootstrap RPC never creates or
  confirms auth identities.
- Existing Google access and the preservation-safe no-live-mutation rule remain
  unchanged.
