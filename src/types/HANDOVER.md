# `src/types` Handover

Updated: 2026-08-10.

## Phase 4C EOF Hygiene Pending Validation

`scripts/generate-local-db-types.sh` now removes only the generated artifact's
trailing CR/LF run and writes exactly one terminal LF while the content is
still in its checked sibling temporary file. Empty CLI output still fails
before replacement, and the final move remains atomic.

Two runs under Node `22.23.2`, npm `10.9.9`, and local Supabase CLI `2.113.0`
produced the same 473-line, 13,339-byte file with SHA-256
`6a732e3339010267f6c043371ddbf478972371f208e73adb16ecea0dd9b75178`.
The prior 474-line, 13,340-byte hash was
`40b846e497de6f194b84cd3e737d45d666b1647096e7a132441558c0961e088e`.
Normalizing the prior file's EOF makes it byte-identical to this one, so schema
and RPC content did not change. Pinned typecheck, `105/105` focused publication
tests, and candidate diff hygiene pass. A separate agent must validate this
post-acceptance correction before it is accepted.

## Canonical Restart Database Types

`database.generated.ts` is generated only from the disposable local Supabase
schema with `npm run db:types`; never generate it from or redirect output from
an existing data-bearing remote project. The generation script writes a
temporary sibling, requires non-empty output, and atomically replaces the final
file only after local CLI success.

Phase 4B executor evidence generated the file with repository-pinned Supabase
CLI `2.113.0` after a clean six-migration replay on PostgreSQL `17.6`. Two runs
produced the same 474-line, 13,340-byte file and SHA-256
`40b846e497de6f194b84cd3e737d45d666b1647096e7a132441558c0961e088e`.
The publication RPC uses canonical `p_name`, and the public reader returns only
public ID, name, and JSON instructions.

`../lib/item-boundary.ts` derives the publication and public-reader RPC argument
types from this file. Do not replace the broad legacy inline database type in
`../lib/supabase.ts` with this restart-only isolated schema: legacy surfaces
still reference tables outside the six restart migrations.

Exact provenance, runtime tests, and remote-safety evidence are in
`../../docs/restart/PHASE_4B_SUPABASE_RUNTIME_ACCEPTANCE.md`. A different agent
regenerated the file, obtained the same hash, repeated all Phase 4B gates and a
final clean reset without correction, and independently accepted the phase.
