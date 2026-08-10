# Data Migration Decision

Status: **PENDING — preservation-safe default; 2A.1 runtime replay remains blocked**

Decision date: not yet approved

Decision owner: project owner, informed by the restart PM's evidence report

## Current Evidence

- The independently validated read-only live inventory records 21 auth identities, 11 public profiles, 11 accounts, 11 memberships, 17 properties, 23 items, 14 articles, 34 links, 23 access requests, and eight aggregate objects in one public storage bucket. Existing data is material and must be preserved by default.
- The live P0 schema, RLS enablement/policy labels, indexes, constraints, functions/triggers, storage aggregates, 109-entry migration ledger, and security-advisor summary are documented in `LIVE_SCHEMA_INVENTORY.md`. Policy predicates and identity values were not collected.
- The independently validated local reconciliation in `SCHEMA_RECONCILIATION.md` finds zero exact migration-name matches between the 109-entry live ledger and the three partial local migrations. The checked-in SQL cannot replay the live P0 chain from zero.
- `database/schema.sql`, the database README, and the two root seed files are obsolete for canonical bootstrap; the seeds omit the live-required item `property_id`.
- The inline `Database` type has no reproducible generator in the repository and includes columns absent live: `users.preferred_language`, `items.location`, and three access-request lifecycle fields.
- Canonical queries already depend on absent columns and mixed tenant rules. In particular, property detail selects nonexistent property fields, dashboard stats selects `items.location`, and language preferences select `users.preferred_language`.
- Per-resource ownership coverage, exact classification of incomplete auth
  identities, policy predicates, backup/restore proof, and storage path ownership
  remain unresolved. Validation of the inventory and reconciliation does not
  make a final data disposition safe.
- The independently validated read-only auth discovery counted 21 auth users
  and 21 identity rows: 15
  email and six Google. Nineteen auth users have one identity row, one has
  multiple, and one has none. Seventeen users are confirmed, four unconfirmed;
  none are anonymous or marked invited. No individual identity values were
  collected.
- Aggregate bootstrap coverage shows all 11 public profiles have an owner-role
  membership on an account owned by the same auth user, while ten auth users
  have no profile, membership, or owned account. These states must be preserved
  and classified before any backfill or cleanup; they are not evidence that the
  ten identities are safe to delete.
- Provider distribution and coarse auth activity are now documented in
  `AUTH_DISCOVERY.md`. An independent aggregate re-query reproduced these totals
  and the strengthened profile/owner-membership/account-ownership coverage.
  Backup/restore proof, policy predicates, storage path ownership, exact
  classification of incomplete identities, and accountable disposition
  approval remain unresolved.
- An isolated `supabase/` project, identity/account migration, transactional
  current-user bootstrap RPC, and two-identity pgTAP/RLS harness are now
  independently statically validated locally. They have not been applied
  remotely and do not change this pending decision. Docker is unavailable, so
  Supabase 17 replay and policy-test execution remain unproven; see
  `SLICE_2A1_DATABASE.md`.

## Binding Interim Decision

Treat all existing remote users and data as requiring preservation until evidence and an accountable approval say otherwise. Discovery is read-only. Do not reset, drop, truncate, overwrite, rewrite migration history, or apply a replacement baseline to a live project while this document is pending.

New migrations may be designed and tested only in an isolated local/test project. Use the additive slices and compatibility requirements in `SCHEMA_RECONCILIATION.md`; do not apply them to live while this decision remains pending.

## Evidence Required For Final Approval

- Target Supabase project/environment identifiers recorded without secrets.
- Non-sensitive row counts and ownership coverage for canonical tables.
- Auth identity/provider and bootstrap-coverage counts, including a deliberate
  classification plan for identities without application records.
- Storage bucket/object inventory and ownership rules.
- Live columns, constraints, indexes, functions, triggers, RLS enablement, and policies.
- Comparison against committed migrations, generated types, and queries used by canonical routes.
- Verified backup/export timestamp and a restore check in an isolated environment.
- Selected outcome, validation checks, rollback trigger, owner, and approval date.

## Allowed Outcomes

1. **Preserve in place:** additive/backfill migrations with compatibility windows and rollback.
2. **Transform to a fresh schema:** restore/copy into staging, validate entity and ownership counts, rehearse cutover, then approve production migration.
3. **Discard:** only when the owner confirms no user or business data must survive and a final backup exists.

## Approval Record

Complete this section before live mutation:

- Outcome:
- Evidence report:
- Backup and restore proof:
- Validation queries/results location:
- Rollback plan:
- Approved by:
- Approved on:

Until completed, the only approved outcome is preservation-safe discovery.
