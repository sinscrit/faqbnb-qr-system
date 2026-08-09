# Restart Handover

Updated: 2026-08-10.

## Active Step

Milestone 1 live schema and auth discovery is active. Milestone 0, including the separate runtime/build and production route-gate slices, is complete and independently validated.

## Completed Milestone 0.3 Route Gate

- Added a central production-only policy in `src/lib/routing/production-route-policy.ts`.
- Applied the policy at the beginning of middleware, before Supabase/session work, with a direct non-cacheable `404`.
- Covered all 35 `/test/**` pages plus `/test-file-upload`, `/simple-admin`, `/simple-login`, `/qr-demo`, `/sentry-example-page`, `/version`, `/api/simple-auth/**`, `/api/sentry-example-api`, and `/api/version`.
- Preserved prototype source and development access; no broad deletion or legacy dashboard consolidation was performed.
- Added `npm run test:route-gate`, a five-test focused guard for production/development behavior, canonical exclusions, active route-tree coverage, and static matcher coverage.
- Passed the focused suite, `tsc --noEmit`, and `npm run build` under Node `22.23.2` (build/server npm `10.9.9`).
- Passed production HTTP smoke checks: all named forbidden surfaces returned `404`; `/`, `/login`, `/dashboard2`, `/item/**`, `/api/public/**`, and `/api/user/**` retained their route-specific behavior.
- Recorded policy, exact scope, limitations, and evidence in `ROUTE_GATE.md`.
- Passed independent validation of policy completeness, middleware placement, route inventory, strengthened regression tests, build/runtime evidence, canonical exclusions, documentation, and diff scope.
- Validator corrections added `/version` and `/api/version` to the production gate and explicit inventory coverage.
- Retained one low-risk framework behavior: trailing-slash requests such as `/version/` normalize with `308` to the canonical path, which then returns the gate `404`.

## Completed Milestone 0.3 Runtime/Build Slice

- Added exact Node selectors in `.nvmrc` and `.node-version`, a compatible Node 22 engine range, and the exact npm package-manager/engine pin.
- Added `.npmrc` policy to keep lockfile-declared optional dependencies enabled.
- Updated npm-generated lockfile metadata under the pinned npm version; no hand-editing was used.
- Aligned Nixpacks to its supported Node 22 major selector and explicit npm `10.9.9` install/build execution.
- Stopped only the repository-local dev server before the clean install; an unrelated dev server in another project was preserved.
- Passed `npm ci --include=optional` under Node `22.23.2`/npm `10.9.9`; the final repeat install completed in 12s.
- Verified `@parcel/watcher-darwin-arm64` `2.5.4` and its native binary without adding a direct platform-specific dependency.
- Passed `npm run typecheck` and the post-clean-install `npm run build` under the pinned toolchain; the final build completed in 37.65s.
- Classified install audit/deprecation and Sentry/Webpack warnings in `BUILD_BASELINE.md`; no environment values were recorded.
- Passed independent validation of the runtime pins, clean optional-dependency install, native watcher resolution, typecheck/build evidence, and diff hygiene.
- Retained explicit risks: host defaults can differ, engine metadata is advisory, Railway patch parity needs deployment evidence, and dependency vulnerability triage remains separate.
- External provider rotations from Milestone 0.2 remain outstanding and do not block this local slice.

## Completed Milestone 0.2

- Added `SECURITY_INVENTORY.md` with tracking state, classification, current-tree action, and provider/history follow-ups without values.
- Removed tracked cookie, Google OAuth URL, Supabase service-role, Playwright credential-entry screenshot, authenticated storage-state, and generated report artifacts from the current tree.
- Removed redundant ignored `.env.local` backups while preserving `.env.local` and the uniquely shaped `.env.railway` configuration.
- Removed an embedded Supabase access token from `.mcp.json`; Supabase MCP now inherits its access token from the parent environment and remains read-only.
- Removed redundant tracked `.cursor/mcp.json` and local-agent settings that also embedded Supabase access tokens; their local-only paths are ignored.
- Configured standalone Playwright MCP for the CDP port recorded in `.projstuff`.
- Replaced project-specific credential-like Supabase literals in two deployment documents and one legacy validation log with explicit non-working redactions; rejected five false-positive replacements that would have corrupted unrelated test paths.
- Added local credential/session ignores and a safe, trackable `.env.example`.
- Performed no external rotation, live-system mutation, or Git history rewrite.
- Passed independent repository-side validation for removals, redactions, safe config, pattern scans, and diff hygiene.
- Left provider rotations, session invalidations, replacement propagation, and any Git-history rewrite explicitly outstanding in `SECURITY_INVENTORY.md`.

## Completed Milestone 0.1

- Defined the control-document hierarchy and canonical product surfaces.
- Narrowed the host UX to one path: identity, property, item/instruction, preview/publish, QR.
- Added P0a/P0b/P0c checkpoints while retaining the plan's maintainable-P0 requirements.
- Recorded architecture, security, testing, implementation, environment, and commit conventions.
- Established a preservation-safe default pending live database discovery.
- Recorded the executable milestone queue and unresolved decisions.
- Passed independent validation for governing-plan coverage, internal consistency, delegation/validation rules, and Markdown/diff sanity.

## Next Logical Steps

1. Commit the accepted route-gate slice with explicit pathspecs.
2. Begin delegated, read-only live Supabase schema, RLS, auth-provider, and non-sensitive data discovery; perform no live mutation while the preservation decision remains pending.
3. Reconcile live evidence with migrations, generated types, and canonical queries, then finalize `DATA_MIGRATION_DECISION.md` with accountable approval evidence.
4. Coordinate the outstanding provider actions in `SECURITY_INVENTORY.md`; keep history rewriting separately approved.

## Unresolved Decisions

- Data preservation cannot be finalized until the live Supabase inventory and restore proof exist.
- The one initial canonical auth method requires live auth/provider and user discovery.
- The one account-context transport is selected during Slice 2A.
- Optional P0b image support requires product validation; plain text remains sufficient for P0a.

## Safety And Scope

- The restart PM delegates each implementation task and assigns a different subagent to validate it before acceptance and commit.
- Do not mutate a live Supabase project while `DATA_MIGRATION_DECISION.md` is pending.
- Do not expose or print values from credential-like files during inventory.
- Preserve unrelated local changes and stage restart commits with explicit pathspecs.
- Do not add new behavior to legacy dashboard, admin-host, user, simple, example, or test surfaces.
- Follow root `AGENTS.md` for browser testing; use `.projstuff` and standalone Playwright MCP only.

## Evidence Sources

- Governing plan: `docs/audit/10-llm-restart-plan.md`
- Current-state evidence: `docs/audit/00-current-state.md` through `09-keep-rebuild-archive.md`
- Canonical restart entry: `docs/restart/README.md`
