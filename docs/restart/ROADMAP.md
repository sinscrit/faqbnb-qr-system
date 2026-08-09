# Restart Roadmap

Updated: 2026-08-10.

## Current Position

Milestones 0.1 and 0.2 are complete and independently validated. The Milestone 0.3 runtime and clean-build slice is also complete and independently validated. Production route gating is the active Milestone 0.3 slice; live-system discovery follows it.

## Milestones

| Milestone | Status | Exit evidence |
| --- | --- | --- |
| 0.1 Canonical control docs | Complete | Eight canonical documents created; plan coverage, internal consistency, handover, and Markdown sanity independently validated |
| 0.2 Workspace and secret safety | Complete | Current-tree remediation, inventory, safe MCP/example/ignore configuration, and diff hygiene independently validated |
| 0.3 Reproducible build and route gate | In progress: build complete; route gate active | Exact runtime pins, clean `npm ci --include=optional`, typecheck/build, forbidden-route gate |
| 1 Live schema and auth discovery | Not started | Reconciliation map and approved data decision |
| 2A Account/membership | Not started | Real RLS tests and automatic single-account context |
| 2B Property | Not started | Create/select property with cross-account denial |
| 2C Item/public page | Not started | Create item and unauthenticated guest-safe page on staging |
| 3 Instructions and QR | Not started | Useful instruction, one URL builder, verified external QR |
| 4 Minimal media/workflow hardening | Not started | Optional minimum media plus complete recovery states |
| 5 Surface consolidation | Not started | Canonical consumers migrated; duplicate routes removed/gated |
| 6 CI, deployment, and recovery | Not started | Clean checkout-to-staging path and exercised recovery docs |

## Immediate Queue

1. Gate known test, example, debug, and simple-auth routes from production.
2. Record provider-side rotation/revocation completion separately; do not block local work on a dangerous history rewrite.
3. Inspect the live Supabase schema, RLS, auth configuration, and data inventory without mutation.
4. Compare live state with migrations, generated types, and canonical queries; finalize `DATA_MIGRATION_DECISION.md`.

## Required Decisions

- Existing-data disposition remains pending live inventory and an accountable approval.
- Select one initial canonical auth method after verifying live users/provider configuration.
- Select the one account-context transport in Slice 2A; prefer server-derived or path context over a user-editable header where practical.
- Confirm whether one optional image materially improves P0b before implementing media.

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
