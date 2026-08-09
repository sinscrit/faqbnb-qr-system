# HANDOVER

## Current Goal

Implement the approved restart plan as small, independently validated vertical slices. Milestone 0.1 canonical control documentation is complete; the active step is Milestone 0.2 workspace and credential safety.

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
- Active: workspace/credential safety. Next: reproducible build setup and production route gating.

## Commit Notes

- First audit commit triggered the repository commit hook, which updated `version.json` and Claude backup zip files in addition to audit docs.
- Use `git commit --no-verify` for later audit-only commits if hook churn should be avoided.

## Commit Discipline

Commit only the files required by the accepted logical task. Use explicit pathspecs in `git add` to avoid including pre-existing or unrelated changes.

## Latest Audit Output

- Audit documents are in `docs/audit/00-current-state.md` through `docs/audit/10-llm-restart-plan.md`.
- Recommended approach: controlled salvage, not a blank rewrite.
- Canonical P0 path: `/dashboard2` host workflow, `/item/[publicId]` public guest page, `/api/public`, `/api/user`, and `/api/system`.
- The July audit's clean install, typecheck, and build passed on Node 25/npm 11; the current Node 22/npm 10 reproducibility baseline remains pending. Lint and the full Vitest suite failed and are documented in `docs/audit/07-health-check.md`.
