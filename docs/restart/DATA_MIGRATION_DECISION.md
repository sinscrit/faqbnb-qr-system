# Data Migration Decision

Status: **PENDING — preservation-safe default**

Decision date: not yet approved

Decision owner: project owner, informed by the restart PM's evidence report

## Current Evidence

- Checked-in `database/schema.sql` does not recreate the schema represented by application code and generated types.
- Account/property migrations and account-aware RLS documented in legacy requirements are absent from the committed migration set.
- Generated types indicate accounts, memberships, properties, items, instructions/articles, analytics, access, and translation tables.
- The current live Supabase schema, policies, auth-user inventory, storage inventory, and business-data value have not yet been verified in this restart.

## Binding Interim Decision

Treat all existing remote users and data as requiring preservation until evidence and an accountable approval say otherwise. Discovery is read-only. Do not reset, drop, truncate, overwrite, rewrite migration history, or apply a replacement baseline to a live project while this document is pending.

New migrations may be designed in an isolated local/test project only after the live reconciliation map identifies compatibility requirements.

## Evidence Required For Final Approval

- Target Supabase project/environment identifiers recorded without secrets.
- Non-sensitive row counts and ownership coverage for canonical tables.
- Auth identity/provider counts and whether active users exist.
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
