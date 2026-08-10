# Slice 2C.1 Item And Public Identity Database Foundation

Status: **IMPLEMENTATION CANDIDATE — INDEPENDENT VALIDATION PENDING**

Updated: 2026-08-10.

## Outcome

This slice adds the next ordered migration and database policy-test candidate on
top of the isolated Slice 2A.1 and 2B.1 baselines. It does not link to, identify,
query, or mutate a remote Supabase project. It is not a migration for the
current live schema and does not approve a data disposition.

The migration creates the smallest item boundary that can safely support the
next one-submit item-and-instruction workflow:

- an internal UUID primary key that never becomes a guest URL;
- a generated, required, globally unique UUID `public_id` that remains stable
  across creation retries;
- a required property foreign key and property-scoped creation-request UUID;
- a normalized, nonblank item name bounded to 120 characters;
- nullable `description` only as a compatibility field, with no creation-RPC
  input for it;
- a nullable `published_at` marker with no default, so every new item is a
  draft; and
- required creation/update timestamps using the shared updated-at trigger.

There is deliberately no location, tags, source language, media, QR field, or
publication write path in this isolated baseline. Instructions, publication,
the public application route, canonical URL construction, and QR generation
remain later slices. A later instruction-aware RPC may publish only after it
can prove the item has useful guest content.

The migration has fail-fast boundary and prerequisite checks. It rejects the
item table, every named primary/unique/index relation, either RPC, or the item
membership helper before any item DDL. It requires the complete named
identity/account and property/type boundary, then verifies the auth, property,
and membership column types/nullability, exact primary/foreign keys and cascade
behavior, prerequisite RLS, roles, and fixed-path function traits this slice
actually composes. Same-name but incompatible prerequisite shims therefore fail
before the first item object. This is a clean isolated slice, not a
preservation-safe live migration.

## Creation Contract

`public.create_current_item(p_property_id uuid, p_request_id uuid,
p_name text)` accepts one untrusted property hint, one client-generated request
UUID, and one content decision. It accepts no user ID, account ID, membership
role, email confirmation claim, description, publication state, media, QR data,
or guest URL.

The authenticated transaction:

1. Derives `auth.uid()` and verifies confirmed email ownership in `auth.users`.
2. Normalizes the name with outer whitespace removed, rejects blank or over-120
   input, and rejects unsafe ASCII/Unicode control and formatting characters.
3. Resolves the hinted property to its server-side account by joining the
   current identity's membership. Only owner, admin, or member roles are
   writable; a viewer or cross-account property receives the same
   `Writable property not found` failure.
4. Locks that membership row through the transaction, preventing a concurrent
   role change from becoming stale write authority.
5. Inserts a draft through the named unique `(property_id,
   creation_request_id)` boundary. Concurrent same-request calls serialize at
   that unique constraint.
6. Returns the existing item only when a retry supplies the same normalized
   name. A reused request UUID with a different normalized name fails without
   renaming or duplicating the first item.
7. Returns exactly `public_id`, `property_id`, and normalized `name` for the
   future server/API boundary.

The request identity is scoped to the property. The same UUID may identify an
independent creation for another authorized property, while neither value can
select an account without current membership. The database UUID, public UUID,
timestamps, draft marker, and compatibility description are server-owned.

This design lets the future browser generate one request UUID before submitting
the item name and first instruction together. A network retry can then recover
the same item/public identity without asking the host to repeat content.

## Read And Publication Boundary

PUBLIC, anonymous, and authenticated table privileges are explicitly revoked
before authenticated `SELECT` is granted back. RLS follows the item's
property to its canonical account and permits a current owner, admin, member,
or viewer membership to read that account's items. There are no direct item
insert, update, delete, or publication policies or grants.

`public.read_public_item(p_public_id uuid)` is executable only by `anon` and
`authenticated`. It uses static, fully qualified SQL with a fixed
`pg_catalog` search path and returns exactly `public_id` and `name` when
`published_at` is non-null. A draft and an unknown UUID both return zero rows.
Anonymous users receive no table privilege, so they cannot enumerate drafts,
property IDs, request IDs, descriptions, timestamps, or internal IDs.

All three security-definer functions in this boundary are owned with the item
table and use fixed `pg_catalog` search paths. The policy helper returns only a
membership boolean and is executable only by `authenticated` for RLS use. No
application service-role client participates in this contract.

## Test Contract

`supabase/tests/database/2c1_item_public_identity.test.sql` contains exactly 123
planned pgTAP assertions. Its fixtures use three auth identities and switch
contract operations to real `anon` or `authenticated` database roles. It
covers:

- exact columns, every type/nullability/default, no publication default,
  foreign-key cascade, unique public identity, exact property/request unique
  columns, and absence of duplicate public-ID/property-prefix indexes because
  the two unique B-trees already cover those lookups, plus trigger, RLS, and
  policy count;
- zero PUBLIC/anonymous table rights, authenticated read-only table rights, exact RPC
  execution grants, function ownership/security/search paths, static public
  SQL, named conflict handling, and membership locking;
- confirmation, null, blank, overlong, ASCII-control, Unicode-control, and
  direct table-constraint failures;
- owner, admin, and member creation; viewer reads but no viewer write;
- server-normalized storage, server-created stable UUIDs, draft/description
  defaults, same-payload retry, conflicting retry, and no duplicates;
- cross-account read and write denial plus same-account reads;
- property-scoped request identities;
- no direct insert, update/publication, or delete path; and
- identical zero-row behavior for draft and unknown public IDs, followed by an
  exact two-field published projection to anonymous and authenticated callers.
- observable prerequisite column, key, cascade, RLS, and fixed-path function
  traits matching the stronger fail-fast guard.

The source-level unique-constraint and lock assertions make the concurrency and
role-race mechanisms observable in the pgTAP candidate. The implementation
agent also exercised both mechanisms with concurrent PostgreSQL 14 sessions as
compatibility evidence described below.

## Verification Evidence And Blocker

Completed during implementation:

- Replayed the ordered Slice 2A.1, 2B.1, and 2C.1 migrations in a fresh
  PostgreSQL 14.17 cluster using local `auth.uid()` and role compatibility
  shims.
- Confirmed owner creation, normalization, draft/description defaults,
  same-request stability, conflicting-payload failure, and cross-account
  denial under the real `authenticated` role.
- Confirmed anonymous draft invisibility, anonymous table denial, and the exact
  public projection after publication was arranged as a database-owner test
  fixture.
- Ran two simultaneous same-property/same-request creation transactions. Both
  returned the same public UUID and exactly one item row remained.
- Began a member-to-viewer downgrade transaction before a concurrent creation.
  The creation waited for the membership row, then failed with
  `Writable property not found`; the request left zero item rows.
- Confirmed out-of-order, malformed-prerequisite, named-index-boundary, and
  second 2C.1 migration runs fail at their respective guards without a partial
  item table.
- Confirmed the pgTAP source has exactly 123 assertion calls matching
  `plan(123)` and `git diff --check` passes for the new files.

The PostgreSQL 14 probe is compatibility evidence only. It is not the configured
Supabase PostgreSQL 17 stack, does not include Supabase Auth internals, and does
not have pgTAP installed. The Docker client still cannot connect because
`/Users/shinyqk/.docker/run/docker.sock` does not exist. No `db:reset`,
`db:test`, or generated-type pass is claimed.

Still required before runtime acceptance:

1. Start Docker and replay all three ordered migrations from zero with
   `npm run db:reset` against the configured Supabase PostgreSQL 17 project.
2. Run `npm run db:test` and pass all 44 Slice 2A.1, 77 Slice 2B.1, and 123 Slice
   2C.1 assertions.
3. Correct any PostgreSQL 17, pgTAP, or Supabase Auth fixture issue and repeat
   from a clean reset.
4. Run `npm run db:types`, inspect the generated output and provenance, and
   stage it only after every database test passes.

Independent static validation of this implementation candidate is pending. No
generated types, application route/UI, public page, instruction schema,
publication, URL/QR implementation, remote link, or remote mutation is included.
