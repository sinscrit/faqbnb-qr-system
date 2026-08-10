# Restart Roadmap

Updated: 2026-08-10.

## Current Position

Milestone 0, Milestone 1.1 live inventory, and Milestone 1.2 local schema/type/query reconciliation are complete and independently validated. Bounded read-only auth/provider discovery is active. No data disposition has been approved; ownership and backup/restore evidence remain outstanding.

## Milestones

| Milestone | Status | Exit evidence |
| --- | --- | --- |
| 0.1 Canonical control docs | Complete | Eight canonical documents created; plan coverage, internal consistency, handover, and Markdown sanity independently validated |
| 0.2 Workspace and secret safety | Complete | Current-tree remediation, inventory, safe MCP/example/ignore configuration, and diff hygiene independently validated |
| 0.3 Reproducible build and route gate | Complete | Exact runtime pins, clean `npm ci --include=optional`, typecheck/build, forbidden-route gate, production HTTP smoke, and independent validation |
| 1 Live schema and auth discovery | In progress: 1.1/1.2 complete; auth/provider discovery active | Validated reconciliation map, auth discovery, restore evidence, and approved data decision |
| 2A Account/membership | Not started | Real RLS tests and automatic single-account context |
| 2B Property | Not started | Create/select property with cross-account denial |
| 2C Item/public page | Not started | Create item and unauthenticated guest-safe page on staging |
| 3 Instructions and QR | Not started | Useful instruction, one URL builder, verified external QR |
| 4 Minimal media/workflow hardening | Not started | Optional minimum media plus complete recovery states |
| 5 Surface consolidation | Not started | Canonical consumers migrated; duplicate routes removed/gated |
| 6 CI, deployment, and recovery | Not started | Clean checkout-to-staging path and exercised recovery docs |

## Immediate Queue

1. Run the bounded read-only auth-provider/configuration discovery without identity values or mutation; select one initial canonical auth method from evidence.
2. Design the isolated additive 2A.1 identity/account migration and real two-identity RLS harness; do not apply it live.
3. Gather ownership coverage plus backup/restore proof, then finalize `DATA_MIGRATION_DECISION.md` with accountable approval evidence.
4. Record provider-side rotation/revocation completion separately; do not block read-only discovery on a dangerous history rewrite.

## Required Decisions

- Existing-data disposition remains pending live inventory and an accountable approval.
- Select one initial canonical auth method after verifying live users/provider configuration.
- Select the one account-context transport in Slice 2A; prefer server-derived or path context over a user-editable header where practical.
- Confirm whether one optional image materially improves P0b before implementing media.

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
