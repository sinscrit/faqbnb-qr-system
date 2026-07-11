# 10 LLM Restart Plan

Date: 2026-07-11

## Objective

Restart FAQBNB as a maintainable SaaS by salvaging the strongest existing blocks and rebuilding the unstable foundation. The restart should optimize for small, verifiable tasks that an LLM can complete without reinterpreting the whole repo each time.

## Guiding Constraints

- Keep the product scope narrow until P0 is complete.
- Prefer one canonical route/API/component path over multiple variants.
- Make database, auth, tenancy, and API contracts explicit before broad feature work.
- Require focused verification for every implementation slice.
- Archive or gate prototype surfaces before they create more drift.
- Do not make the current full Vitest suite a blocking gate until test infrastructure is repaired.

## P0 Product Boundary

The restarted app is complete enough for P0 when:

1. A host can register or log in.
2. A host can create or select an account context.
3. A host can create one property.
4. A host can create one item for that property.
5. A host can add useful instructions/content/media to that item.
6. A host can generate or view a QR code for the canonical public item URL.
7. A guest can open `/item/[publicId]` without login.
8. Account A cannot read or mutate Account B data.

## Canonical Product Surfaces

Use these as the restart defaults unless a later implementation task proves otherwise.

| Surface | Canonical Choice |
| --- | --- |
| Host app shell | `/dashboard2` |
| Guest item page | `/item/[publicId]` |
| Public guest API | `/api/public/*` |
| Host/account API | `/api/user/*` |
| System-admin API | `/api/system/*` |
| Database owner boundary | `account_id` |
| Deployment target | Railway/Nixpacks, unless product direction changes |
| Primary health gates | `npm run typecheck`, `npm run build`, focused tests |

## Stage 0: Stabilize The Workspace

Goal: make the restart work visible and prevent more accidental drift.

Tasks:

- Create or keep a restart branch.
- Freeze feature work until database/auth/API decisions are written.
- Preserve pre-existing dirty work separately from audit/restart commits.
- Add a short `docs/restart/README.md` or update `HANDOVER.md` with the active stage.
- Decide whether archive folders live under `docs/archive` or outside route-bearing folders.

Acceptance:

- `HANDOVER.md` names the current restart stage.
- Unrelated local changes are not included in restart commits.
- The route/API canonical choices are visible in docs.

## Stage 1: Write Canonical Product And Engineering Docs

Goal: give future LLM tasks stable source material.

Create or update:

- `docs/restart/PRODUCT_SPEC.md`
- `docs/restart/ARCHITECTURE.md`
- `docs/restart/CONVENTIONS.md`
- `docs/restart/ROADMAP.md`

Minimum content:

- P0 user stories.
- Canonical route/API namespaces.
- Account/tenancy rules.
- Environment variable list.
- Definition of done for implementation tasks.
- Testing expectations by risk level.

Acceptance:

- A future task can cite one canonical doc instead of rediscovering competing routes.
- P0/P1/deferred scope is explicit.

## Stage 2: Rebuild Database Reproducibility

Goal: make a fresh Supabase project recreate the schema that the app expects.

Tasks:

- Audit generated TypeScript database types against real migrations.
- Create a complete migration baseline for P0 entities:
  - accounts
  - account_users
  - users/profiles
  - properties
  - property_types
  - items
  - instruction/articles/content blocks
  - media/uploads
  - access requests, if kept for P0
- Add RLS policies for account isolation.
- Add seed data only if it helps local smoke testing.
- Regenerate and commit database types from the migration-applied schema.
- Replace or archive obsolete `database/schema.sql` and stale database README content.

Acceptance:

- A documented command sequence can create the P0 database from scratch.
- Generated types match migrations.
- Cross-account access should be denied by database policy, not only app code.

## Stage 3: Consolidate Auth And Tenancy

Goal: remove ambiguity before touching sensitive workflows.

Tasks:

- Create a small auth module with explicit helpers:
  - `requireUser`
  - `requireAccountMember`
  - `requireAccountOwner`
  - `requireSystemAdmin`
- Split Supabase clients by runtime and privilege:
  - browser anon client
  - server user/session client
  - service-role admin client
- Make service-role configuration fail fast when required.
- Remove or rename misleading helpers such as an admin-only `requireAuth`.
- Pick one account context convention and delete duplicate header patterns.
- Update middleware only after route ownership is documented.

Acceptance:

- Protected host APIs all call the same tenancy helper.
- Public APIs do not require host auth.
- System-admin checks are separate from host/account membership checks.

## Stage 4: Normalize API Contracts

Goal: make backend changes safe for LLM-driven work.

Tasks:

- Define P0 DTO schemas for property, item, instruction, media, and QR responses.
- Move host-owned CRUD away from `/api/admin` into `/api/user`.
- Reserve `/api/system` for platform administration.
- Keep `/api/public` strictly guest-safe.
- Add route tests or focused handler tests for the highest-risk API boundaries.
- Add a central public URL builder for `/item/[publicId]`.

Acceptance:

- QR/PDF/share links all use the same public URL builder.
- New host CRUD routes consistently enforce account membership.
- Old API routes are redirected, removed, or marked for archive.

## Stage 5: Repair The P0 User Workflow

Goal: get one complete SaaS path working end to end.

Tasks:

- Make login/register/account bootstrap work with the canonical auth helpers.
- Make property creation/select work in `/dashboard2`.
- Make item creation work through the canonical `/api/user` routes.
- Make instruction editing/display work for one item.
- Make QR generation point to `/item/[publicId]`.
- Make the public item page load without auth and without exposing host-only data.

Acceptance:

- `npm run typecheck` passes.
- `npm run build` passes.
- A manual or Playwright smoke path proves the P0 workflow.
- Cross-account denial is verified.

## Stage 6: Establish Reliable Tests

Goal: replace noisy confidence with small, trusted gates.

Tasks:

- Fix Vitest 4 config drift.
- Add safe test env defaults or mocks for Supabase client creation.
- Repair syntactically invalid tests.
- Fix the PostCSS/Vite test setup for Tailwind 4.
- Add browser API mocks only where unit tests should own that behavior.
- Move media/canvas-heavy behavior to Playwright if unit tests become unrealistic.
- Create one P0 Playwright smoke test.
- Shard or scope full suite execution before making it a CI gate.

Acceptance:

- Focused tests for changed code pass.
- P0 smoke test passes locally.
- Full test-suite failure is either resolved or explicitly documented as non-blocking with known categories.

## Stage 7: Archive Or Gate Non-Canonical Routes

Goal: reduce the active product surface.

Tasks:

- Move `/test/**` pages out of production route trees or gate them to development.
- Archive `simple-*` routes and `simple-auth` API after confirming no dependency.
- Archive stale dashboard/admin/user duplicates after useful code is migrated.
- Remove `.bak` and `page-static` variants from routable locations.
- Add a script or test that fails if forbidden production routes reappear.

Acceptance:

- Production route output no longer includes dev/prototype pages unless intentionally gated.
- Future LLM tasks see one canonical implementation path.

## Stage 8: Reintroduce P1 Features

Goal: build on a stable P0 rather than expanding unstable foundations.

Candidates:

- PDF print/export workflow.
- Translation job processing and translation UI.
- Access request workflows.
- Analytics.
- Team roles beyond the minimum account owner/member model.
- Billing.

Acceptance:

- Each P1 feature starts with a short spec and API/data contract.
- No P1 feature bypasses auth/tenancy helpers.

## Standard LLM Task Template

Use this format for future implementation prompts:

```md
Goal:
Implement [one concrete behavior].

Relevant docs:
- docs/restart/PRODUCT_SPEC.md
- docs/restart/ARCHITECTURE.md
- docs/restart/CONVENTIONS.md
- docs/audit/[relevant audit file]

Canonical files/surfaces:
- [specific route/component/API files]

Do not touch:
- [unrelated routes/features]

Acceptance:
- [observable behavior]
- `npm run typecheck`
- `npm run build` or focused test command
- [specific smoke/manual check]

Commit:
- Commit only files required for this task.
- Update HANDOVER.md.
```

## Definition Of Done For Restart Tasks

A restart task is done only when:

- The canonical docs or handover reflect the current state.
- The change is narrowly scoped.
- Types pass, unless the task explicitly documents why they cannot.
- Build passes for route/app-level changes.
- Focused tests or a manual smoke check cover the changed behavior.
- Old competing code is archived, gated, or explicitly left for a named future task.
- The commit message describes the implementation slice.

## Recommended First Implementation Sequence

1. Create `docs/restart/*` canonical docs from this audit.
2. Build a complete Supabase migration baseline and regenerate types.
3. Consolidate Supabase/auth helpers.
4. Create canonical `/api/user` P0 endpoints.
5. Fix QR URL generation to use `/item/[publicId]`.
6. Repair the P0 host create-item workflow.
7. Add the P0 public item smoke test.
8. Gate or archive production test/prototype routes.

## Health Gates To Use During Restart

Use these now:

- `npm run typecheck`
- `npm run build`
- Focused unit tests for changed code only
- Manual or Playwright P0 smoke test

Do not use these as hard gates yet:

- Current full `npm test -- --run`
- Current lint command

Before making them hard gates, repair the known failures documented in `07-health-check.md`.

## Final Recommendation

Proceed with a controlled salvage. The project is not clean enough for broad feature work, but it is too advanced to discard. The efficient path is to preserve the strongest product blocks while rebuilding the contracts that let an LLM work safely: schema, auth, tenancy, API boundaries, route ownership, and focused verification.
