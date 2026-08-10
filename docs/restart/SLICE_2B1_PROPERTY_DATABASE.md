# Slice 2B.1 Property Database And Context Foundation

Status: **INDEPENDENT STATIC ACCEPTANCE — SUPABASE 17 REPLAY PENDING**

Updated: 2026-08-10.

## Outcome

This slice adds the next ordered migration and database policy test on top of
the isolated Slice 2A.1 baseline. It does not link to, identify, query, or
mutate a remote Supabase project. It is not a migration for the current live
schema and does not approve a data disposition.

The migration reproduces the validated live property/type fields while making
the clean isolated tenant invariant explicit:

- `property_types(id, name, display_name, description, created_at)`;
- `properties(id, user_id, property_type_id, nickname, address, created_at,
  updated_at, account_id)`;
- non-null canonical `properties.account_id`;
- non-null compatibility `properties.user_id`, always derived from the current
  auth identity by the creation RPC rather than accepted from a client;
- bounded names and addresses, foreign keys, live-shaped indexes, and the safe
  Slice 2A.1 updated-at trigger; and
- authenticated type reads plus membership-scoped property reads, with no
  direct client insert, update, or delete path.

The migration begins with two fail-fast checks. It rejects an existing property
table, RPC, or property helper before changing that boundary, so it cannot be
applied additively to the current live project. It also requires the complete
isolated Slice 2A.1 table/trigger/membership-helper boundary before any 2B.1 DDL,
so an out-of-order manual replay cannot leave a partial property implementation.
A preservation-safe live migration still requires ownership coverage, restore
proof, and the approval record in `DATA_MIGRATION_DECISION.md`.

## Deterministic Product Taxonomy

Clean isolated replay seeds exactly seven stable product types: apartment,
house, villa, cabin, cottage, guesthouse, and other. `other` is the default.
The IDs, names, labels, and descriptions are deterministic so tests and UI can
rely on them.

This is a new product seed. The read-only live inventory found seven live rows,
but did not collect their values. This slice does not claim that the seed IDs or
labels match live data and must not use them as a future live backfill without
approved mapping evidence.

## Property Context Contract

`public.resolve_current_property(p_nickname text, p_address text,
p_property_type_name text)` accepts only property content. It accepts no user
ID, account ID, property ID, membership role, or confirmation authority.

The authenticated transaction:

1. Derives `auth.uid()` and verifies that the corresponding auth identity has a
   confirmed email.
2. Resolves the earliest account, ordered by creation time and ID, where that
   identity has an owner, admin, or member role. Viewer-only memberships never
   become host-workflow write authority. The selected membership row is held
   with an update lock through the transaction, so a concurrent role downgrade
   cannot race the later write-authority check.
3. Takes an account-scoped transaction advisory lock so concurrent
   first-property retries serialize.
4. Returns one strict state:
   - no property and no supplied nickname: `needs_property`, with no write;
   - no property and a valid nickname: creates exactly one property and returns
     `ready`;
   - one property: returns `ready` and the existing property without renaming or
     duplicating it, even when retry inputs differ;
   - more than one property: returns `selection_required` with the exact count
     and no selected property or leaked details.
5. Rechecks write membership immediately before first creation and derives both
   `account_id` and compatibility `user_id` server-side.

The stable result fields are account ID, state, property count, nullable
property ID/name/address, and nullable type name/display label. The dashboard
therefore needs one property-name decision for a new account, no selector for a
single property, and an explicit future selector only when several properties
already exist. The RPC never deletes, consolidates, renames, or silently chooses
among multiple properties.

Nickname and address whitespace is trimmed. A blank submitted nickname,
unknown type, name over 100 characters, address over 500 characters, or unsafe
ASCII/Unicode control and direction-formatting character fails before a row is
inserted. The same safe-text invariant is enforced by table constraints. Address
is optional and a blank address becomes null. An omitted or blank type uses
`other`.

## Security Boundary

- Both tables have RLS enabled.
- Property types are read-only to `authenticated`; `anon` has no table access.
- Properties are selectable only through Slice 2A.1's non-recursive membership
  helper, so owner/member/viewer memberships can read their account properties.
- There are no property write policies and authenticated clients receive no
  property INSERT, UPDATE, or DELETE grants.
- The only first-property write path is the authenticated security-definer RPC.
- Every security-definer function uses a fixed `pg_catalog` search path and
  fully qualified relation references.
- The write-authority helper derives identity from `auth.uid()` and is not
  executable by clients.

The RPC uses the database owner only as its narrow implementation boundary. It
does not use the application service role and cannot create or confirm an auth
identity.

## Test Contract

`supabase/tests/database/2b1_property_context.test.sql` contains exactly 77
planned pgTAP assertions. Its fixtures use two auth identities and switch every
contract assertion to the real `anon` or `authenticated` database role. The
test covers:

- exact seven-row seed and stable `other` default;
- table/function existence, non-null account tenancy, RLS, policy structure,
  PUBLIC/client least grants, and function owner/security/search-path traits;
- anonymous and unconfirmed-identity denial;
- zero state, bounded malformed inputs, first creation, optional address,
  default and selected property types, and idempotent retry;
- ASCII control, Unicode zero-width, and directional-control rejection at the
  RPC plus direct table-constraint rejection for unsafe Unicode text;
- server-derived creator/account attribution;
- own, member, and viewer reads, viewer non-shadowing of writable context, plus
  cross-account read denial;
- first-property creation by a `member` role without client tenant authority;
- direct insert/update/delete denial and viewer-only RPC denial;
- multiple-property `selection_required`, all-null property details, and no
  implicit create/rename/consolidation; and
- deterministic earliest writable-account derivation.

The local database owner is used only to arrange auth/account fixtures and
historical multiple-property states. Application behavior under test never
uses a service-role client.

## Verification Evidence And Blocker

Completed by the implementation agent:

- Reproduced the Docker blocker once: the Docker client cannot connect because
  `/Users/shinyqk/.docker/run/docker.sock` does not exist.
- Replayed Slice 2A.1 and Slice 2B.1 in a fresh isolated PostgreSQL 14 cluster
  with local `auth.uid()`/role compatibility shims.
- Manually exercised zero state, first creation, address/type normalization,
  retry idempotency, cross-account denial, member visibility, and viewer
  visibility under real database roles.
- Replayed the final exclusive membership-row lock and unsafe-text constraints;
  a member-role first creation passed, both Unicode helper probes returned the
  expected result, and direct unsafe table insertion failed its check
  constraint.
- Confirmed that a second Slice 2B.1 replay fails at the empty-property-boundary
  guard.
- Confirmed the pgTAP source contains exactly 70 assertion calls matching
  `plan(70)`.
- `git diff --check` passed at implementation time.

Completed by the independent validation agent:

- Found and corrected the missing Slice 2A.1 prerequisite guard. Before the
  correction, a manual out-of-order replay could start 2B.1 DDL before failing
  on a missing 2A.1 relation. It now raises `55000` before any 2B.1 helper or
  table is created.
- Expanded the pgTAP candidate from 70 to 77 assertions for PUBLIC table
  privileges, RPC/helper security traits, viewer non-shadowing, and null
  property details in `selection_required`.
- Replayed the corrected ordered migrations in a fresh PostgreSQL 14 shim and
  confirmed the seven deterministic rows, exact property columns/nullability,
  RLS/policy counts, least grants, fixed-path function traits, Unicode code-point
  handling, zero/create/retry states, and cross-account denial.
- Two simultaneous first-create calls returned the same property UUID and left
  exactly one row. A concurrent membership downgrade waited on the resolver's
  membership row lock, then changed the role; a later viewer call failed with
  `No writable account membership`.
- Confirmed the corrected source has exactly 77 assertion calls matching
  `plan(77)` and passed exact Node `22.23.2`/npm `10.9.9`, Supabase CLI `2.113.0`,
  TypeScript, and diff-hygiene checks.

The PostgreSQL 14 probe is compatibility evidence only. It is not the configured
Supabase PostgreSQL 17 stack, does not include Supabase Auth internals, and does
not have pgTAP installed. No claim is made that the 77-assertion suite ran.

Still required before runtime acceptance:

1. Start Docker and replay both ordered migrations from zero with
   `npm run db:reset`.
2. Run `npm run db:test` and pass all 44 Slice 2A.1 plus 77 Slice 2B.1
   assertions against Supabase 17.
3. Correct any PostgreSQL 17, pgTAP, or Supabase Auth fixture issue and repeat
   from a clean reset.
4. Generate and inspect local types only after the reset and both database test
   files pass.

No generated database types were created. No remote Supabase command or
mutation occurred.
