# Phase 4B Supabase Runtime Acceptance

Status: **INDEPENDENTLY ACCEPTED**

Updated: 2026-08-10.

## Scope And Safety Boundary

This record covers Phase 4B of `RECOVERY_AND_INTERNAL_DEPLOYMENT_PLAN.md`:
fresh replay of the six restart migrations, the complete database test suite,
targeted transaction/concurrency/role probes, local type generation, and the
application acceptance repeat against those generated types.

Only the repository-local Supabase project named `faqbnb_manus` was used. It
ran on the user-level Colima runtime accepted in Phase 4A. Before start and
again after acceptance:

- no environment-variable name beginning with `SUPABASE`, `POSTGRES`, `PG`, or
  `DATABASE_URL` was present;
- neither supported Supabase CLI access-token file existed;
- `supabase/.temp/project-ref` and `supabase/.temp/pooler-url` were absent;
- the only pre-start local CLI metadata was `supabase/.temp/cli-latest`;
- no remote project identifier, pooler/database URL, or `supabase.co` endpoint
  appeared in the canonical local config, migrations, tests, or type script;
- `supabase/config.toml` selected only local ports and PostgreSQL major 17; and
- no `login`, `link`, `db push`, `migration repair`, remote type generation,
  remote query, or remote database mutation command ran.

The existing data-bearing Supabase project was not named, linked, queried, or
mutated. The local stack remains available for the independent validator.

## Exact Runtime And Inventory

- Supabase CLI: repository-pinned `2.113.0`.
- PostgreSQL: `17.6`, image
  `public.ecr.aws/supabase/postgres:17.6.1.158`, native `aarch64`.
- Docker server: `29.5.2`, `linux/arm64`, through Colima `0.10.3`.
- Application repeat: Node `22.23.2`, LTS `Jod`, npm `10.9.9`.

The exact ordered migration inventory is:

1. `20260810000100_identity_account_foundation.sql`
2. `20260810000200_property_context_foundation.sql`
3. `20260810000300_item_public_identity.sql`
4. `20260810000400_instruction_foundation.sql`
5. `20260810000500_atomic_item_publication.sql`
6. `20260810000600_public_instruction_projection.sql`

Their pre-run SHA-256 inventory was recorded in the executor transcript. The
database migration ledger after every successful reset contained exactly those
six versions in that order.

The final pgTAP plans are `44 + 77 + 123 + 132 + 73 + 26 = 475`. Slice 3A.2
rose from 72 to 73 because runtime discovery added an outer-U+2029 regression.

## Replay Findings And Corrections

The first start downloaded the local image set, applied migrations 1–5, then
correctly failed closed at the Slice 3A.3 guard. Migration 5 had created the
publication input as `p_item_name`; the application and Slice 3A.3 contract use
`p_name`. The migration and catalog regression now use the canonical `p_name`.
No database container survived that failed start.

The next start replayed all six migrations in 27.02 seconds. Explicit clean
resets subsequently replayed all six in 25.42, 25.32, and 25.32 seconds. The
last reset left zero item rows and no probe function.

PostgreSQL 17 and its bundled pgTAP exposed test portability and coordinated-
schema issues that the earlier PostgreSQL 14 compatibility runs could not:

- `column` was no longer safe as an unquoted table alias;
- pgTAP catalog comparisons needed explicit `C` collation or direct typed
  array equality;
- `col_default_is` compares the current default value rather than the printed
  default expression in this runtime;
- an anon caller without function EXECUTE correctly receives the grant-boundary
  permission error before a security-definer function body can run;
- the older 2C/3A.2 files needed to assert the final Slice 3A.3 ACL and reader
  shape, not their historical intermediate state; and
- authenticated access to the obsolete draft RPC is restored only inside the
  rolled-back 2C test transaction so its still-present owner primitive remains
  covered without weakening the final ACL.

One additional production defect was found. Publication normalized text before
checking unsafe characters, so an outer U+2028/U+2029 separator could be
trimmed away and accepted. Migration 5 now checks the raw item name, title, and
body for unsafe characters before trimming, then validates and stores only the
normalized values. The existing outer-U+2028 title assertion and new outer-
U+2029 body assertion prove the correction.

## Database Test And Probe Evidence

The final complete command passed all six files and all 475 assertions in 0.86
seconds. Per-file results were:

| File | Result |
| --- | ---: |
| Slice 2A.1 | 44/44 |
| Slice 2B.1 | 77/77 |
| Slice 2C.1 | 123/123 |
| Slice 3A.1 | 132/132 |
| Slice 3A.2 | 73/73 |
| Slice 3A.3 | 26/26 |

Separate real-role probes then exercised the high-risk paths outside pgTAP:

- Two simultaneous `authenticated` transactions submitted identical property,
  request, and content values. Both exited zero and returned the same public
  UUID; the database retained exactly one item, one instruction, and one
  non-null publication marker.
- Reusing that request with changed item content returned SQLSTATE `23505` and
  left the original item unchanged.
- A membership-downgrade transaction acquired the membership lock, changed the
  owner to viewer, slept, and committed. Concurrent publication waited 1.62
  seconds, then returned `P0002` and left zero request rows. The fixture role
  was restored afterward.
- A trigger-injected article failure returned `23514` and left zero item and
  zero article rows for the request. The probe trigger/function were removed.
- The `anon` role read the useful published item as exactly public ID, name,
  and one `{title,body}` instruction object. Draft, published-without-
  instruction, and unknown identities each returned zero rows.
- Exact privilege probes returned publication `authenticated/anon/PUBLIC =
  true/false/false`, draft creation `false/false/false`, public reader
  `true/true/false`, and anonymous item/article table SELECT `false/false`.
- Raw outer U+2028 title and outer U+2029 body calls each returned `22023` and
  left zero rows. A meaningful LF/TAB body succeeded and stored byte sequence
  `0a09` between its lines.

The database was reset from zero again after these probes. No fixture or probe
object remains.

## Generated Types And Application Repeat

`npm run db:types` generated
`src/types/database.generated.ts` locally only after successful replay. It is
474 lines and 13,340 bytes with SHA-256
`40b846e497de6f194b84cd3e737d45d666b1647096e7a132441558c0961e088e`.
A second generation took 1.42 seconds and produced the identical hash.

The generated publication args contain canonical `p_name`; its output is the
four-field publication row. The public reader has one UUID input and exactly
public ID, name, and JSON instructions. `item-boundary.ts` now derives those
two RPC argument types from the generated file, so TypeScript checks the live
local RPC argument contract while the legacy application database type remains
isolated.

Under exact Node `22.23.2`/npm `10.9.9`:

| Check | Result | Wall time |
| --- | ---: | ---: |
| Slice 3A.3 focused matrix | 105/105 | 1.98s |
| Full prerequisite/focused union | 224/224 | 2.10s |
| Production route gate | 5/5 | 1.00s |
| TypeScript typecheck | Pass | 2.51s |
| Next.js 15.5.9 production build | Pass | 26.58s |
| Build identity | Non-empty, 21 bytes | under 1s |
| Diff hygiene | Pass | under 1s |

The build retained the previously recorded Vitest pool-options warning, Sentry
option/client-file deprecations, experimental `clientTraceMetadata` notice, and
legacy PDFKit font diagnostics. No new runtime, authorization, database, or
deployment warning appeared.

## Independent Validation

A different agent repeated the remote-safety inventory, clean six-migration
reset on PostgreSQL 17.6, complete `475/475` pgTAP suite, targeted real-role
retry/conflict/downgrade/rollback/reader/ACL/Unicode probes, deterministic type
generation with the same SHA-256, `105/105` focused and `224/224` prerequisite
matrices, `5/5` route gate, typecheck, production build, and diff hygiene. Its
final clean reset left six migration ledger rows, zero item fixtures, no probe
objects, and the local stack running for the next phase. It found no correction
and independently accepted Phase 4B.

## Acceptance Boundary And Next Step

Phase 4B satisfies every database-runtime action and gate. It does not
authorize an existing-data migration, prove the QR journey, or prove real-stack
browser behavior. Phase 5 QR-backed MVP work is the active next step.
