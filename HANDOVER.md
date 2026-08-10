# HANDOVER

## Current Goal

Implement the approved restart plan as small, independently validated vertical slices. Milestone 0, Milestone 1.1 read-only live inventory, and Milestone 1.2 local reconciliation are complete and independently validated. Bounded read-only auth/provider discovery is active; isolated identity/account migration design follows.

## Operating Rules From User

- Act as the restart PM and perform all logical implementation steps autonomously.
- Use best judgement and keep moving if a topic is blocked.
- Delegate every implementation task to a subagent with an appropriate capability level.
- Require a different subagent to validate each task before accepting and committing it.
- Optimize touched UX for one obvious path, few required steps, clear recovery, and few ways to get lost.
- Commit after every logical step.
- Maintain this handover so another LLM can continue if interrupted.

## Baseline Context

- Date captured: 2026-07-10
- Repository path: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`
- Branch at audit start: `fix-qr-code-generation`
- HEAD at audit start: `f2cd626`
- Product appears to be FAQBNB, a QR-code instruction SaaS for short-term rental hosts.
- Stack appears to be Next.js 15, React 19, TypeScript, Supabase, Tailwind CSS, next-intl, PDF/QR libraries, Vitest, and Playwright.

## Pre-Existing Dirty Worktree At Audit Start

These changes existed before the audit and should not be reverted or accidentally swept into unrelated commits:

- Modified: `.mcp.json`
- Modified: `src/app/layout.tsx`
- Modified: `src/components/InstructionsTable/GuideCard.tsx`
- Modified: `src/components/ItemManager/components/ItemRow.tsx`
- Modified: `src/components/PropertySelector.tsx`
- Untracked: `gcloud_auth_url.txt`
- Untracked: `src/components/DebugBadge.tsx`
- Untracked: `src/contexts/DebugContext.tsx`

## Audit Progress

- Completed: baseline state capture and audit scaffolding.
- Completed: product intent map and route inventory.
- Completed: data model, auth, and tenancy audit.
- Completed: workflow, architecture, and reusable-block audit.
- Completed: health checks and deployment/configuration audit.
- Completed: keep/rebuild/archive decision.
- Completed: LLM restart plan.
- Completed and independently validated: canonical `docs/restart/*` control documents.
- Active handover: `docs/restart/HANDOVER.md`.
- Completed and independently validated: workspace/credential safety remediation and `docs/restart/SECURITY_INVENTORY.md`, including removal of tracked browser session state/report output and redundant local MCP/agent configs with embedded tokens.
- Provider rotations, session invalidations, and replacement propagation remain outstanding; Git history was not rewritten. Required external actions are recorded in the inventory.
- Completed and independently validated: Node `22.23.2`/npm `10.9.9` runtime policy, clean optional-dependency install, native macOS watcher, typecheck, production build, and `docs/restart/BUILD_BASELINE.md` evidence.
- Completed and independently validated: the production route gate returns production `404` responses for test, demo, example, simple duplicate, and version-diagnostic routes while preserving canonical behavior and development source. The accepted validator corrections added `/version`, `/api/version`, and stronger inventory coverage. See `docs/restart/ROUTE_GATE.md`.
- Completed and independently validated: bounded read-only live P0 schema/storage/migration/security-advisor inventory in `docs/restart/LIVE_SCHEMA_INVENTORY.md`; the live project identifier is omitted, no row data was recorded, and no remote mutation occurred.
- Completed and independently validated: `docs/restart/SCHEMA_RECONCILIATION.md` compares validated live evidence with every local SQL artifact, inline/domain database types, canonical-route queries, and only admin compatibility routes still used by canonical UI. It identifies the non-replayable local chain, zero exact migration-name overlap, obsolete bootstrap docs/seeds, confirmed absent-column queries, account-header mismatch, and additive slice strategy. No remote call/mutation occurred and no data decision was accepted.
- Validator corrections preserved: cautious type provenance, roadmap-aligned slice numbering, simple selection only when multiple valid choices exist, trigger-function replay dependency, all known plural guest URL construction, and account-context header transport mismatch.
- Active: bounded read-only auth/provider discovery without identity values or mutation.
- Next: design isolated Slice 2A.1 identity/account migrations plus real two-identity RLS tests; ownership coverage and backup/restore proof remain required before any live decision.
- External provider rotations remain separately outstanding.

## Commit Notes

- First audit commit triggered the repository commit hook, which updated `version.json` and Claude backup zip files in addition to audit docs.
- Use `git commit --no-verify` for later audit-only commits if hook churn should be avoided.

## Commit Discipline

Commit only the files required by the accepted logical task. Use explicit pathspecs in `git add` to avoid including pre-existing or unrelated changes.

## Latest Audit Output

- Audit documents are in `docs/audit/00-current-state.md` through `docs/audit/10-llm-restart-plan.md`.
- Recommended approach: controlled salvage, not a blank rewrite.
- Canonical P0 path: `/dashboard2` host workflow, `/item/[publicId]` public guest page, `/api/public`, `/api/user`, and `/api/system`.
- The Node `22.23.2`/npm `10.9.9` clean install, typecheck, and production build now pass and are independently validated in `docs/restart/BUILD_BASELINE.md`. Lint and the full Vitest suite remain deferred failures documented in `docs/audit/07-health-check.md`.
