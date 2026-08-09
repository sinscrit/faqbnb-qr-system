# Restart Handover

Updated: 2026-08-10.

## Active Step

Milestone 0.3: establish the exact Node 22/npm 10 runtime, prove a clean install/typecheck/build, and gate forbidden production routes.

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

1. Establish the exact Node 22/npm 10 pin and document local, CI, and Railway alignment.
2. Prove a clean `npm ci`, typecheck, and production build without relying on an existing `node_modules`.
3. Add and verify the production route gate for known test, example, debug, and simple-auth surfaces.
4. Independently validate and commit each accepted Milestone 0.3 logical slice.
5. Coordinate the outstanding provider actions in `SECURITY_INVENTORY.md`; keep history rewriting separately approved.

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
