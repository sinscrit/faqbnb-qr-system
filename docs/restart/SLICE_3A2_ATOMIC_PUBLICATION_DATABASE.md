# Slice 3A.2 Atomic Publication Database Half

Status: **INDEPENDENTLY VALIDATED — ACCEPTED ONLY WITH 3A.3 CANDIDATE**

Updated: 2026-08-10.

## Release Boundary

This is the database half of one coherent publication-to-guest vertical slice.
It must not be deployed or treated as independently releasable until the
matching host API/UI and exact anonymous instruction projection are implemented
and accepted. It was developed only against a disposable isolated PostgreSQL
compatibility database. No remote Supabase project was linked, queried, or
mutated.

The migration deliberately leaves both earlier contracts unchanged:

- authenticated callers retain `create_current_item(uuid, uuid, text)`; and
- anonymous and authenticated callers retain the two-field
  `read_public_item(uuid)` projection.

Slice 3A.3 owns the coordinated reader and application contract change.
Applying this function alone would publish identity through the old reader
without yet rendering the instruction, so this file remains nondeployable on
its own and is accepted only as the database half of that full candidate.

## Narrow RPC Contract

`public.publish_current_item_with_instruction(uuid, uuid, text, text, text)` is
a volatile, table-owned, fixed-`pg_catalog`-path security-definer function. It
accepts only property hint, request UUID, item name, instruction title, and
instruction body. It returns exactly:

```text
public_id uuid
item_name text
instruction_title text
instruction_body text
```

Only `authenticated` receives execute. `anon` and `PUBLIC` receive none. No
new table grants, policies, direct write routes, account/user/role parameters,
publication timestamp input, internal IDs, URL, QR, media, or language fields
are added.

## Validation And Atomicity

All text is validated before locking or writing. The inherited Unicode 17.0
trim and complete `Cf` helpers remove outer Unicode whitespace, reject Unicode
blank values and format controls, and preserve meaningful internal LF/TAB only
for the instruction body. Item name and title are single-line and at most 120
characters. Body is at most 8,000 characters. The normalized values are the
only values compared, stored, and returned.

The transaction uses one lock order:

1. verify a confirmed authenticated identity;
2. derive the property account and lock the caller's writable membership row;
3. create or recover the property/request item, then lock that item;
4. create or recover exactly one `purpose='instructions'`, `display_order=0`
   article bound to the same request, then lock that article;
5. require that it is the item's sole instruction; and
6. set `published_at` only after the useful-content invariant holds.

Slice 2C used ASCII `btrim`, so an unpublished legacy draft may contain outer
NBSP or U+3000 even when its meaningful name matches the canonical request.
Only after acquiring the item lock, the RPC compares the Unicode-trimmed stored
name. A matching draft is updated to the canonical name before instruction
creation, making storage, return DTO, retry, and old-reader output converge. A
published mismatch is never silently rewritten and instead returns `23505`.

The property UUID is never tenant authority. Missing, cross-account, and
nonwritable properties share `P0002`/`Writable property not found`. Anonymous
and unconfirmed identities use authorization SQLSTATE `42501`.

An identical retry returns the same public UUID and preserves the original
`published_at`. Reusing a request after changing item name, title, body,
purpose, or order, occupying order zero with another request, or encountering
more than one instruction raises the same application-mappable SQLSTATE
`23505` and generic message. The statement remains atomic: any downstream
article error rolls back a newly inserted item. The same request UUID remains
independent for another validated property because item retry identity is
`(property_id, creation_request_id)`.

## Guard And Test Candidate

`20260810000500_atomic_item_publication.sql` rejects every pre-existing overload
of the publication function. Before creating it, the guard requires the full
2A.1, 2B.1, 2C.1, and 3A.1 relation/function boundary, exact membership,
property, item, and article column arrays, parent/cascade and retry/ordering
keys, all six validated 3A.1 content/order constraints, inherited RLS, and the
two client roles. It also requires exact owner, return type, argument/output
names, modes and types, volatility, strictness, security, search path, and least
execute ACLs for the inherited text helpers, membership helpers, draft RPC, and
two-field public reader.

`supabase/tests/database/3a2_atomic_item_publication.test.sql` contains exactly
72 planned assertions covering function identity, input/output names and
types, owner/security/search-path traits, least execute, unchanged old RPC
grants/projection, static lock/retry boundaries, owner/admin/member success,
viewer/unconfirmed/anonymous/cross-account denial, draft completion, same-
property exact retry, same request on another property, stable timestamp,
all three content conflicts, order collision, changed order, extra instruction,
validation/Unicode bounds, unchanged conflict rows, publication only with one
instruction, item rollback after an injected article failure, exact inherited
function/constraint prerequisites, exact exploded inherited-function ACL sets,
NBSP/U+3000 legacy recovery and stable
retry/old-reader results, and immutability of a published normalization
mismatch.

## Compatibility Evidence

Implementation-agent evidence on a fresh UTF8 PostgreSQL 14.17 cluster:

- all five ordered isolated migrations replayed successfully;
- the created RPC is a volatile set-returning security definer owned with the
  item table, has fixed `search_path=pg_catalog`, exact five input/four output
  names, and execute ACL `authenticated=true`, `anon=false`, `PUBLIC=false`;
- normalized atomic creation and sequential exact retry returned one stable
  public UUID, left one item and one article, and preserved publication;
- NBSP- and U+3000-wrapped legacy drafts canonicalized under lock, returned and
  read canonically through the unchanged reader, and retained stable IDs on
  retry; a pre-published wrapped mismatch returned `23505` unchanged;
- the unchanged public reader returned only public UUID and item name;
- changed content returned generic `23505`, a viewer received generic `P0002`,
  and an unconfirmed member received `42501`;
- two simultaneous identical calls returned the same public UUID and left
  exactly one item, one article, and one non-null publication marker;
- a role downgrade that acquired the membership lock first made publication
  wait, then deny after the role became `viewer`, leaving zero request rows; and
- an injected article-insert failure left zero item and zero article rows for
  the failed request.
- independent negative guard databases with wrong helper ownership, changed
  public-reader return shape, and broadened draft-RPC ACL each failed before
  creating any publication function.
- an unrelated-role probe granting draft-RPC execute to built-in `pg_monitor`
  likewise failed before publication-function creation; the guard compares
  exact exploded grantee/privilege/grantability rows independent of grantor.

PostgreSQL 14 is compatibility evidence only. Docker remains unavailable, so
configured Supabase PostgreSQL 17 replay, real pgTAP execution (including this
72-assertion candidate), and generated types remain blocked. Independent
review is still required before this database half may be accepted into the
larger vertical slice.
