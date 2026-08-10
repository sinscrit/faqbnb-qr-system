# `src/types` Handover

Updated: 2026-08-10.

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
