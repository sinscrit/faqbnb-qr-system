# Restart Roadmap

Updated: 2026-08-10.

## Current Position

Milestone 0.1 is complete and independently validated. Product code has not yet been changed by the restart. Milestone 0.2 workspace and credential safety is active; reproducible build setup and live-system discovery follow it.

## Milestones

| Milestone | Status | Exit evidence |
| --- | --- | --- |
| 0.1 Canonical control docs | Complete | Eight canonical documents created; plan coverage, internal consistency, handover, and Markdown sanity independently validated |
| 0.2 Workspace and secret safety | In progress | Credential inventory, rotation/removal record, unrelated work preserved |
| 0.3 Reproducible build and route gate | Not started | Documented runtime, clean `npm ci`, typecheck/build, forbidden-route gate |
| 1 Live schema and auth discovery | Not started | Reconciliation map and approved data decision |
| 2A Account/membership | Not started | Real RLS tests and automatic single-account context |
| 2B Property | Not started | Create/select property with cross-account denial |
| 2C Item/public page | Not started | Create item and unauthenticated guest-safe page on staging |
| 3 Instructions and QR | Not started | Useful instruction, one URL builder, verified external QR |
| 4 Minimal media/workflow hardening | Not started | Optional minimum media plus complete recovery states |
| 5 Surface consolidation | Not started | Canonical consumers migrated; duplicate routes removed/gated |
| 6 CI, deployment, and recovery | Not started | Clean checkout-to-staging path and exercised recovery docs |

## Immediate Queue

1. Inventory credential-like files by path and tracking state without printing their contents.
2. Rotate/remove potentially live material and add safe ignore/example rules while preserving unrelated work.
3. Pin and record the exact Node 22 and npm 10 versions used for a clean install.
4. Prove `npm ci`, typecheck, and build; fix the platform watcher dependency reproducibly.
5. Gate known test, example, debug, and simple-auth routes from production.
6. Inspect the live Supabase schema, RLS, auth configuration, and data inventory without mutation.
7. Compare live state with migrations, generated types, and canonical queries; finalize `DATA_MIGRATION_DECISION.md`.

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
