# Slice 2A.1 Identity And Account Database Foundation

Status: **INDEPENDENT STATIC VALIDATION PASSED — DOCKER REPLAY STILL BLOCKED**

Updated: 2026-08-10.

## Outcome

This slice establishes `supabase/` as the canonical isolated migration and
database-test project. It does not link to, identify, query, or mutate a remote
Supabase project. The historical `database/` directory remains unchanged as
reconciliation evidence.

The migration creates only the validated identity/account boundary:

- `public.users`, matching the existing public profile fields;
- `public.accounts`, owned by an auth identity;
- `public.account_users`, with one constrained account role per identity;
- safe updated-at triggers;
- non-recursive membership and owner policy helpers in the unexposed `private`
  schema;
- RLS and least grants; and
- one authenticated, transactional, retry-safe bootstrap RPC.

It starts with an empty-boundary guard and fails before any DDL if the profile,
account, membership, trigger-helper, policy-helper, or bootstrap objects already
exist. This makes an accidental run against the current live project fail
closed instead of skipping tables and then replacing live grants or policies.
Any future live transition requires a separate preservation-safe migration
after the pending data decision is approved.

Properties, items, instructions, storage, application session helpers, auth UI,
provider configuration, remote migrations, and data backfills are out of scope.

## Canonical Files And Commands

- Local project configuration: `supabase/config.toml`
- Ordered migration:
  `supabase/migrations/20260810000100_identity_account_foundation.sql`
- Real policy tests:
  `supabase/tests/database/2a1_identity_account.test.sql`
- Local operating handover: `supabase/HANDOVER.md`
- Supabase CLI: exact dev dependency `supabase@2.113.0`

The package scripts are:

```text
npm run db:start
npm run db:reset
npm run db:test
npm run db:types
npm run db:stop
```

`db:types` writes `src/types/database.generated.ts` only from the replayed local
database. It generates into a temporary sibling and moves it into place only
after the CLI succeeds with non-empty output, so a stopped database cannot
truncate or create a falsely trusted generated file. No generated type file was
committed in this slice because the local database could not be started and
therefore no generated output could be trusted.

## Bootstrap Contract

`public.bootstrap_current_user(p_display_name text, p_account_name text)`:

1. Requires `auth.uid()` and rejects anonymous execution.
2. Accepts optional display and account names only. It accepts no user ID,
   account ID, email, role, confirmation state, or provider authority from the
   client.
3. Reads the email and provider from `auth.users` for the authenticated identity.
4. Takes a transaction-scoped advisory lock for that identity, so concurrent
   callback/retry requests cannot create duplicate initial accounts.
5. Creates or repairs the public profile.
6. Reuses the earliest existing account owned by the identity, or creates one
   account named `My account` when no optional name was supplied.
7. Creates or repairs the matching `owner` membership.
8. Returns the derived user/account context.

One function call is one database transaction. A new identity therefore gets
one initial account without an account-choice step; a retry updates an optional
display name but does not rename or duplicate the initial account. The function
does not auto-confirm email, create an auth identity, invoke the service role, or
delete/consolidate pre-existing accounts.

## Security Boundary

All security-definer functions use a fixed `pg_catalog` search path and fully
qualified object references. The bootstrap RPC is executable by
`authenticated` only. The trigger helper has no external execute grant. Policy
helpers live in `private`, accept only an account ID, derive identity from
`auth.uid()`, and are not exposed through the configured PostgREST schemas.

| Resource | Authenticated access | Anonymous access |
| --- | --- | --- |
| `users` | Select own profile only | No table privilege |
| `accounts` | Select member account; owner may update only `name`, `description`, and `settings` | No table privilege |
| `account_users` | Select memberships for a joined account | No table privilege |
| Bootstrap RPC | Execute for current identity | No execute privilege and explicit authentication check |

Direct profile, account, and membership inserts are not granted to the client.
That keeps the transactional RPC as the only initial-account creation path.

## Test Contract

The 44-assertion pgTAP test creates two confirmed local auth identities, without
using service-role behavior in the contract under test, and proves:

- bootstrap execute grants and unauthenticated denial;
- profile, account, and owner-membership creation;
- retry/idempotency and exactly one initial account;
- optional names and the zero-step `My account` default;
- own-profile/account/membership reads;
- own-account update and direct profile/account/membership insert denial;
- cross-account profile, account, membership, and update denial;
- anonymous table denial; and
- successful membership policy evaluation without recursive-policy failure;
- exact execute-grant boundaries for the RPC, policy helpers, and trigger
  helper; and
- deterministic, non-destructive repair when an owner already has multiple
  accounts.

The test seed itself runs as the local database owner only to insert its two
`auth.users` fixtures. Every bootstrap and tenant-isolation assertion switches
to `authenticated` or `anon`; it does not exercise application service-role
code.

## Verification Evidence And Blocker

Completed locally:

- Exact CLI dev dependency resolves to `2.113.0`.
- Supabase config parsing reached local status inspection without a config
  parse error.
- An independent static review checked SQL syntax, live-shape compatibility,
  function ownership/grants/search paths, non-recursive RLS, role privileges,
  bootstrap authority/idempotency/multiple-account behavior, test-plan count,
  local-only CLI scripts, and documentation.
- The review replaced permissive `CREATE TABLE IF NOT EXISTS` behavior with an
  empty-boundary guard, so this isolated baseline cannot silently proceed into
  live policy/grant changes when the three live tables already exist.
- The review replaced direct shell redirection in `db:types` with a checked
  temporary-file/atomic-move helper; failed generation now preserves any prior
  generated file and leaves no empty output behind.
- The independent review found a real PL/pgSQL ambiguity in the membership
  upsert (`account_id`/`user_id` also name output variables). It was corrected
  to target `account_users_pkey` explicitly.
- A fresh isolated PostgreSQL 14 compatibility probe replayed the corrected
  migration, bootstrapped two identities, and manually confirmed own-row reads,
  cross-account read/update denial, retry idempotency, and least function/table
  grants. This is useful static/runtime evidence but is not a substitute for
  the configured Supabase PostgreSQL 17 stack or pgTAP execution.
- A clean `npm ci --include=optional` passed under Node `22.23.2` and npm
  `10.9.9`; it installed 951 packages and resolved the pinned CLI.
- `npm run typecheck` passed under Node `22.23.2` and npm `10.9.9`.
- `git diff --check` passed.

Not completed:

- `npm run db:start`
- `npm run db:reset`
- `npm run db:test`
- `npm run db:types`

The Docker CLI is installed, but the Docker daemon socket does not exist at
`/Users/shinyqk/.docker/run/docker.sock`. Supabase therefore cannot inspect or
start its containers. This is an infrastructure blocker, not a database-test
pass. Do not generate or commit database types until `db:reset` and `db:test`
both pass against the replayed migration.

## Acceptance Still Required

Runtime acceptance still requires a validator with Docker to:

1. Start Docker and run `db:start`, `db:reset`, and `db:test`.
2. Correct any real PostgreSQL 17/pgTAP failures and repeat from a clean reset.
3. Run `db:types`, inspect the generated file, and commit it only if it came
   from that accepted replay.
4. Confirm no remote link/configuration or mutation occurred.

Independent acceptance does not authorize applying this migration to the live
project. `DATA_MIGRATION_DECISION.md` remains binding and pending.
