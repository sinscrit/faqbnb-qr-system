# Slice 3A.1 Instruction Database Foundation

Status: **INDEPENDENTLY STATICALLY ACCEPTED — RUNTIME BLOCKED**

Updated: 2026-08-10.

## Outcome

This slice adds the ordered isolated plain-text instruction/article foundation
after Slices 2A.1, 2B.1, and 2C.1. It does not link to, query, or mutate a
remote Supabase project, and it is not an additive migration for the richer
live article schema.

`public.item_articles` stores one ordered instruction row with a generated UUID,
required item parent, item-scoped creation-request UUID, purpose constrained to
`instructions`, normalized safe title/body, nonnegative item-unique display
order, and shared timestamps. The database `description` column is the future
Instruction DTO body. `source_language` is deliberately deferred.

This slice adds no links, media, creation RPC, publication transition,
anonymous projection, API, UI, or public-reader replacement. It does not make
an item useful or published by itself.

## Text And Ordering Contract

Titles use the inherited strict single-line helper and are trimmed, nonblank,
and at most 120 characters. Both fields additionally use a documented,
immutable, fixed-path safety helper that enumerates all 170 Unicode 17.0 `Cf`
code points, including supplementary-plane format/tag controls, and explicitly
rejects U+2028/U+2029. Bodies still permit horizontal tab and line feed inside
meaningful content while rejecting every other C0/C1 control.

The enumerations are pinned to the Unicode 17.0 UCD `PropList.txt` White_Space
property and `extracted/DerivedGeneralCategory.txt` `Cf` section rather than to
database locale or regular-expression behavior.

A separate immutable, strict, fixed-path trim helper enumerates the Unicode
17.0 `White_Space` set: ASCII TAB through CR and space, NEL, NBSP, OGHAM SPACE
MARK, U+2000–U+200A, U+2028/U+2029, U+202F, U+205F, and U+3000. Titles and
bodies must equal that trimmed value and remain nonblank. Thus NBSP-only,
LF/tab-only, and any outer Unicode whitespace fail while meaningful internal
multiline/tab body formatting remains. Bodies contain at most 8,000 characters.

Unique `(item_id, creation_request_id)` reserves retry identity for a later
narrow RPC. Unique `(item_id, display_order)` makes ordering deterministic.
Both indexes already begin with `item_id`, so no redundant item-only,
item-order, or source-language index is added.

## Access And Guard Boundary

RLS is enabled but deliberately not forced; this does not copy the live table's
unexplained forced-RLS state. One authenticated SELECT policy follows
item -> property -> account membership through a table-owned, fixed-path
security-definer helper. PUBLIC, `anon`, and `authenticated` rights are revoked
before only authenticated SELECT is restored. There is no direct write grant
or policy, and no anonymous table access.

The migration rejects any existing named instruction object before DDL. It
also requires the complete named 2A.1/2B.1/2C.1 boundary, exact public column
arrays, composed auth columns, parent primary keys/cascades, inherited RLS,
roles, and fixed-path function traits. Legacy, partial, malformed, weakened,
out-of-order, and second-run states fail without a partial instruction boundary.

## Test Candidate And Evidence

`supabase/tests/database/3a1_instruction_foundation.test.sql` contains exactly
132 planned assertions. It covers exact shape/defaults/keys/cascade/order and
retry uniqueness/index economy, all content constraints, trigger, RLS/no-force,
function owners/search paths/grants, prerequisite guards, same/cross-account
reads (including viewer allow and cross-account denial), anonymous denial,
direct DML denial, and parent deletion.

Implementation-agent evidence:

- A fresh PostgreSQL 14.17 cluster replayed all four migrations in order.
- Two `authenticated` role sessions each saw only their account's article;
  anonymous table read and authenticated direct insert failed.
- All 170 Unicode 17.0 `Cf` code points were rejected in a UTF8 replay; the
  complete enumerated Unicode `White_Space` set trimmed to blank as expected.
- Meaningful multiline/tab content stored, while LF/tab-only, NBSP-only,
  outer-Unicode-whitespace, carriage-return, U+2028/U+2029, BMP `Cf`, and
  supplementary-plane format/tag-control bodies failed.
- A viewer saw its same-account instruction and zero cross-account rows.
- Out-of-order, malformed-item, weakened-search-path, and second 3A.1 runs
  failed at the intended guard and left zero partial instruction objects.
- Exactly 132 assertion calls match `plan(132)`.
- Exact Node `22.23.2`/npm `10.9.9` typecheck and diff hygiene pass.

PostgreSQL 14 is compatibility evidence only. Docker is unavailable at
`/Users/shinyqk/.docker/run/docker.sock`, so configured Supabase PostgreSQL 17,
actual pgTAP, and generated types remain blocked. Runtime acceptance requires
all four migrations from zero and all 376 assertions (44 + 77 + 123 + 132)
before `npm run db:types`.

Independent validation passed after requiring and verifying the complete
Unicode 17.0 `Cf` and `White_Space` boundaries, supplementary-plane and
U+2028/U+2029 probes, NBSP blank/outer-normalization enforcement, explicit
viewer allow/cross-account denial, exact 132-assertion count, guarded UTF8
PostgreSQL 14 replay, pinned typecheck, and diff hygiene. Runtime acceptance
remains blocked only on the Docker-backed Supabase 17, real pgTAP, and
generated-type gates above.
