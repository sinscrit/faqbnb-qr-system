# HANDOVER

## Current Goal

Implement the approved restart plan as small, independently validated vertical slices. Milestone 0 and Milestone 1.1–1.3 are complete and independently validated. Isolated Slice 2A.1 and Slice 2B.1 have independent static acceptance; Docker-backed Supabase 17 replay remains blocked because Docker Desktop is not installed. Slices 2A.2, 2A.3, and 2B.2 are independently validated locally. Slice 2B.2 implements the canonical property-context API, safe logout, and exact provider-free `/dashboard2` setup UX; standalone browser acceptance remains pending. The auth method decision is closed; real-email, staging-provider, ownership/policy/backup evidence, and accountable data approval remain active.

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
- Slice 2A.3 extended that production gate to the five superseded
  access-request/access-code/OAuth-enrollment surfaces while preserving their
  development source; focused policy/matcher tests and the pinned build pass.
- Completed and independently validated: bounded read-only live P0 schema/storage/migration/security-advisor inventory in `docs/restart/LIVE_SCHEMA_INVENTORY.md`; the live project identifier is omitted, no row data was recorded, and no remote mutation occurred.
- Completed and independently validated: `docs/restart/SCHEMA_RECONCILIATION.md` compares validated live evidence with every local SQL artifact, inline/domain database types, canonical-route queries, and only admin compatibility routes still used by canonical UI. It identifies the non-replayable local chain, zero exact migration-name overlap, obsolete bootstrap docs/seeds, confirmed absent-column queries, account-header mismatch, and additive slice strategy. No remote call/mutation occurred and no data decision was accepted.
- Validator corrections preserved: cautious type provenance, roadmap-aligned slice numbering, simple selection only when multiple valid choices exist, trigger-function replay dependency, all known plural guest URL construction, and account-context header transport mismatch.
- Completed and independently validated: `docs/restart/AUTH_DISCOVERY.md`
  records aggregate-only auth evidence, maps the local auth/bootstrap paths, and
  selects email/password as the canonical P0 method with required recovery,
  existing-Google compatibility login, and deferred new Google/access-code
  registration. No remote mutation or app-code change occurred.
- Aggregate auth evidence: 21 auth users and 21 identity rows (15 email, six
  Google), 17 confirmed and four unconfirmed, no anonymous/invited users, 19
  users with one identity, one with multiple, and one with none. All 11 profiles
  have an owner-role membership on an account owned by the same auth user; ten
  auth users have none of those application records. No identity values or
  individual rows were collected.
- Independent aggregate re-queries reproduced the provider/lifecycle totals and
  strengthened coverage: every profile has an owner-role membership on an
  account owned by the same auth user. Validator corrections also require
  unknown Google identities to fail closed without enrollment.
- Independently statically accepted: isolated Slice 2A.1
  under `supabase/`, including the identity/account migration, transactional
  current-user bootstrap RPC, and 44-assertion two-identity pgTAP/RLS harness.
  The validator fixed a real bootstrap conflict-target ambiguity and passed an
  isolated PostgreSQL 14 replay/manual RLS probe. Docker Desktop is not
  installed, so Supabase 17 clean replay, pgTAP tests, and local type generation
  remain explicitly unproven. See
  `docs/restart/SLICE_2A1_DATABASE.md` and `supabase/HANDOVER.md`.
- Independently validated locally: Slice 2A.2 replaces the
  bearer-token/client-account `/api/auth/session` contract with a GET-only,
  cookie-backed, `auth.getUser()`-validated boundary that requires verified
  email, calls only `bootstrap_current_user`, fails closed, and returns one
  minimal account context pointing to `/dashboard2`. Twenty-seven focused
  tests, pinned typecheck/build, non-empty build ID, and diff hygiene pass.
  See `docs/restart/SLICE_2A2_SESSION_CONTEXT.md`.
- Independently validated locally: Slice 2A.3 replaces the
  canonical auth pages and APIs with one cookie-backed email path, confirmation,
  recovery, strict same-origin JSON validation, safe callback origin, one
  dashboard destination, user-bound signed recovery proof, signed OAuth state,
  deterministic local session cleanup with a failing-response browser fallback,
  provider-free canonical auth pages, and explicitly gated existing-Google
  compatibility. Thirty-three focused tests, five route-gate tests, pinned
  typecheck/build, 21-byte build ID, and diff checks pass. Standalone browser
  acceptance at desktop/mobile sizes passed with intercepted local API states;
  it corrected login focus order and recovery-page metadata. Real-email,
  authenticated-cookie convergence, staging-provider, and live-database
  evidence remain pending. See `docs/restart/SLICE_2A3_EMAIL_AUTH.md` and
  `docs/restart/SLICE_2A3_BROWSER_ACCEPTANCE.md`.
- Independently statically accepted: isolated Slice 2B.1
  adds live-shaped property/type fields with canonical non-null account tenancy,
  a deterministic seven-type product seed, safe-text constraints,
  membership-scoped reads, RPC-only
  first creation, and a three-state property context that auto-selects only one
  property and refuses to guess among several. It locks the selected membership
  against role-change races and rejects selected control, zero-width, and
  direction-formatting text. The
  77-assertion two-identity
  pgTAP candidate covers least grants, RLS, validation, idempotency,
  member/viewer behavior, cross-account denial, and multiple-property safety.
  Independent validation added a fail-fast 2A.1 prerequisite guard, strengthened
  grant/function/viewer/multiple-state tests, and corrected the test-count docs.
  A fresh PostgreSQL 14 shim replay/manual real-role and concurrency probe
  passed, but Docker, Supabase 17 replay, pgTAP execution, generated types, and
  application wiring remain pending. No remote call or mutation occurred. See
  `docs/restart/SLICE_2B1_PROPERTY_DATABASE.md` and `supabase/HANDOVER.md`.
- Independently validated locally: Slice 2B.2 composes the
  cookie/account resolver with strict `resolve_current_property` parsing,
  account-scoped RLS choices, hint-only explicit selection, strict same-origin
  property mutations, POST-only safe logout, and a compact provider-free exact
  `/dashboard2` shell. Independent validation corrected strict empty-JSON
  logout, duplicate-choice rejection, multiple-row error classification,
  stale-hint cleanup, error focus, and same-tick mutation suppression. The
  resulting 109-test focused/prerequisite run, five route-gate tests,
  pinned typecheck/build, 21-byte build ID, and diff hygiene pass. No
  remote/provider/browser call occurred; Supabase 17 and
  live/mocked standalone browser acceptance remain pending. See
  `docs/restart/SLICE_2B2_DASHBOARD_PROPERTY_SETUP.md`.
- Next: Docker-backed runtime acceptance of both ordered database slices when
  infrastructure is available, alongside remaining ownership/policy and
  backup/restore evidence.
  No live decision or data outcome is approved.
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
