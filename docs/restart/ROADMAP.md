# Restart Roadmap

Updated: 2026-08-10.

## Current Position

Milestone 0 and Milestone 1.1–1.3 are complete and independently validated. The email/password primary path and existing-Google compatibility boundary are closed decisions. Isolated Slices 2A.1 and 2B.1 have independent static acceptance; Docker-backed Supabase replay/RLS tests remain blocked. Slices 2A.2 and 2A.3 are independently validated locally. Slice 2B.1 has an isolated property/type boundary and deterministic property-context contract. Real-email, staging-provider, ownership/policy, backup/restore, and accountable data-approval evidence remain active. No data disposition has been approved.

## Milestones

| Milestone | Status | Exit evidence |
| --- | --- | --- |
| 0.1 Canonical control docs | Complete | Eight canonical documents created; plan coverage, internal consistency, handover, and Markdown sanity independently validated |
| 0.2 Workspace and secret safety | Complete | Current-tree remediation, inventory, safe MCP/example/ignore configuration, and diff hygiene independently validated |
| 0.3 Reproducible build and route gate | Complete | Exact runtime pins, clean `npm ci --include=optional`, typecheck/build, forbidden-route gate, production HTTP smoke, and independent validation |
| 1 Live schema and auth discovery | In progress: 1.1/1.2/1.3 complete; remaining evidence active | Validated reconciliation map, auth discovery, ownership/policy evidence, restore evidence, and approved data decision |
| 2A Account/membership and auth | 2A.1 statically accepted with runtime blocked; 2A.2/2A.3 independently validated locally | Real RLS tests, browser/staging delivery, automatic single-account context, and verified email journey |
| 2B Property | 2B.1 independently statically accepted; Supabase 17 replay pending | Create/select property with cross-account denial |
| 2C Item/public page | Not started | Create item and unauthenticated guest-safe page on staging |
| 3 Instructions and QR | Not started | Useful instruction, one URL builder, verified external QR |
| 4 Minimal media/workflow hardening | Not started | Optional minimum media plus complete recovery states |
| 5 Surface consolidation | Not started | Canonical consumers migrated; duplicate routes removed/gated |
| 6 CI, deployment, and recovery | Not started | Clean checkout-to-staging path and exercised recovery docs |

## Immediate Queue

1. When Docker becomes available, prove both ordered migrations from zero plus
   all 44 Slice 2A.1 and 77 Slice 2B.1 real-role pgTAP/RLS assertions; do not
   apply either migration live.
2. Gather per-resource ownership/policy evidence plus backup/restore proof,
   then finalize `DATA_MIGRATION_DECISION.md` with accountable approval evidence.
3. Configure independent recovery/OAuth HMAC keys and verify staging
   confirmation and recovery delivery; production requires
   confirmed email ownership and must never service-role auto-confirm silently.
4. Keep Google compatibility off until provider-side signup denial and both
   existing/unknown identity outcomes are proven without application enrollment.
5. Record provider-side rotation/revocation completion separately; do not block safe local work on a dangerous history rewrite.

## Required Decisions

- Existing-data disposition remains pending the ownership/policy evidence,
  restore proof, and accountable approval defined in
  `DATA_MIGRATION_DECISION.md`.
- Email/password is selected as the initial canonical auth method. Production
  requires confirmed email ownership; real staging confirmation/recovery
  delivery remains an acceptance check rather than an open product decision.
- Preserve Slice 2A.2's selected account-context transport: validated
  cookie-backed server identity plus transactional database bootstrap, with no
  user-editable account header or parameter.
- Confirm whether one optional image materially improves P0b before implementing media.
- Preserve existing Google identity access through subordinate compatibility
  login until provider configuration and staging callback behavior are verified;
  do not offer new Google registration in P0a.

## Reconciliation Constraints

- Treat `database/schema.sql`, `database/README.md`, and both root seed files as legacy until a migration-only replay path replaces them.
- Do not add `items.location`; canonical room context already lives in tags.
- Do not query preferred-language columns until a deliberate accepted migration creates them.
- Derive account/property context automatically and validate it server-side; client headers and local storage are hints, never tenant authority.
- Move canonical host consumers from `/api/admin` to `/api/user` one resource slice at a time.

## Scope Controls

- No P1 feature work before all P0 maintainability criteria pass.
- No more than two documentation-only restart commits before a code or operational slice.
- Demonstrate a deployable user-visible increment at least every three to five implementation tasks.
- A newly found issue enters this roadmap unless it blocks the current acceptance criteria.

## Deferred Debt Register

- Repair/classify the legacy Vitest suite and replace the deprecated lint command in Milestone 6.
- Reconcile stale deployment documents and the mutating deployment script after the canonical Railway path works.
- Archive generated forensic artifacts and legacy requirement noise without losing audit evidence.
- Remove compatibility APIs only after canonical consumer count reaches zero.
