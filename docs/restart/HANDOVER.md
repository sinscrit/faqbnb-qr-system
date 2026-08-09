# Restart Handover

Updated: 2026-08-10.

## Active Step

Milestone 0.2: inventory and remediate workspace credential/session risks without exposing values or sweeping unrelated work into the restart.

## Completed Milestone 0.1

- Defined the control-document hierarchy and canonical product surfaces.
- Narrowed the host UX to one path: identity, property, item/instruction, preview/publish, QR.
- Added P0a/P0b/P0c checkpoints while retaining the plan's maintainable-P0 requirements.
- Recorded architecture, security, testing, implementation, environment, and commit conventions.
- Established a preservation-safe default pending live database discovery.
- Recorded the executable milestone queue and unresolved decisions.
- Passed independent validation for governing-plan coverage, internal consistency, delegation/validation rules, and Markdown/diff sanity.

## Next Logical Steps

1. Inventory credential-like files by path and tracking state without printing contents.
2. Classify each as safe example, local-only material, or potentially exposed live material.
3. Rotate/remove potentially live material and add safe ignore/example rules without rewriting Git history unless separately approved.
4. Independently validate the remediation, update this handover, and commit only the accepted Milestone 0.2 files.
5. Establish the exact Node 22/npm 10 pin, clean install, typecheck, and build baseline in Milestone 0.3.
6. Add the production route gate in Milestone 0.3.

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
