# 10 LLM Restart Plan

Original date: 2026-07-11

Revised: 2026-08-10

## Objective

Restart FAQBNB as a maintainable SaaS through controlled salvage: preserve the strongest working product blocks while rebuilding the unstable contracts around database reproducibility, authentication, tenancy, APIs, deployment, and verification.

The restart will proceed as small vertical slices. Every slice must produce an observable result, include focused tests for its risk boundaries, and remain deployable. Infrastructure work must not run for long without proving a user-visible path.

## Guiding Constraints

- Keep the product scope narrow until P0 is complete.
- Continue with controlled salvage; do not start a blank rewrite without new evidence that salvage is infeasible.
- Prefer one canonical route, API, component, and data contract over competing variants.
- Establish the live database and data-preservation requirements before designing replacement migrations.
- Build schema, RLS, auth, API, UI, and tests together in resource-level vertical slices.
- Require account-isolation tests for every account-owned resource.
- Keep the application deployable and demonstrate a staging increment at least every three to five implementation tasks.
- Gate prototype and test routes early; fully archive them only after confirming they have no canonical consumers.
- Do not make the current full Vitest suite a blocking gate until focused P0 tests are trusted and legacy test infrastructure is repaired.
- Defer PDF, translation, analytics, billing, advanced roles, and other P1 features until the core P0 path is stable.

## P0 Product Boundary

The restarted app is complete enough for P0 when:

1. A host can register or log in.
2. A host can create or select an account context.
3. A host can create and select one property.
4. A host can create one item for that property.
5. A host can add useful instructions or content to that item.
6. A host can generate or view a QR code for the canonical public item URL.
7. A guest can open `/item/[publicId]` without login.
8. Account A cannot read or mutate Account B data through the UI, API, or direct database policy.
9. The complete path works in a Railway staging deployment backed by a database created from the canonical migrations.

Media in P0 means only the smallest behavior needed for a useful guest item. Rich media editing, PDF export, translation, analytics, billing, and advanced team roles are P1 or later.

## Canonical Product Surfaces

Use these as restart defaults unless a documented implementation task proves that a change is necessary.

| Surface | Canonical choice |
| --- | --- |
| Host app shell | `/dashboard2` |
| Guest item page | `/item/[publicId]` |
| Public guest API | `/api/public/*` |
| Host/account API | `/api/user/*` |
| System-admin API | `/api/system/*` |
| Database owner boundary | `account_id` |
| Public URL construction | One `buildPublicItemUrl(publicId)` utility |
| Deployment target | Railway/Nixpacks |
| Database/Auth/Storage | Supabase, recreated from committed migrations |
| Primary health gates | Clean install, typecheck, build, focused tests, staging smoke test |

## Execution Rules And Stopping Conditions

- One task should normally change one migration/resource boundary, one route family, or one user-visible behavior.
- Documentation-only startup work is limited to one or two commits before implementation begins.
- Every implementation task must name its canonical files, observable acceptance criteria, focused tests, and out-of-scope areas.
- Every account-owned resource must ship with positive membership coverage and negative cross-account coverage.
- Every three to five implementation tasks must end with a deployable, user-visible increment on staging.
- If a task discovers unrelated inconsistencies, record them in the roadmap or debt register rather than expanding scope.
- Do not introduce a second canonical path as a temporary shortcut.
- Stop and revise the plan if live-schema discovery shows that controlled salvage would cause unacceptable data loss or migration risk.
- Do not begin the next milestone until the current milestone's acceptance criteria are recorded in `HANDOVER.md`.

## Milestone 0: Workspace, Security, And Build Baseline

Goal: make restart work safe, reproducible, and visible before changing product behavior.

Tasks:

- Create or keep a dedicated restart branch and preserve the existing audit commits.
- Separate or explicitly preserve the pre-existing dirty debug-badge work.
- Inventory tracked and untracked credential-like files without printing their contents.
- Rotate potentially live credentials, remove secrets/session material from version control, and add safe example files and ignore rules.
- Document which environment variables are browser-exposed, server-only, or service-role privileged.
- Perform a clean dependency installation using the documented Node and npm versions.
- Resolve the missing platform-specific `@parcel/watcher` installation and prove a clean production build.
- Gate `/test/**`, `simple-*`, example, and debug routes from production immediately; postpone irreversible deletion until dependencies are checked.
- Create `docs/restart/README.md` and update `HANDOVER.md` with the active milestone.

Acceptance:

- No known live credential or session file remains tracked.
- A documented clean-install command succeeds on the supported environment.
- `npm run typecheck` passes.
- `npm run build` passes from the clean installation.
- Production route output does not expose known test, example, or debug routes unless explicitly authorized.
- Existing unrelated local changes have not been swept into restart commits.

## Milestone 1: Canonical Decisions And Live-System Discovery

Goal: establish the real source of truth before creating replacement database or API contracts.

Create or update:

- `docs/restart/PRODUCT_SPEC.md`
- `docs/restart/ARCHITECTURE.md`
- `docs/restart/CONVENTIONS.md`
- `docs/restart/ROADMAP.md`
- `docs/restart/ENVIRONMENT.md`
- `docs/restart/DATA_MIGRATION_DECISION.md`

Tasks:

- Inspect and compare, without exposing sensitive data:
  - the live Supabase schema and RLS policies;
  - checked-in migrations and schema files;
  - generated TypeScript database types;
  - tables and columns referenced by canonical application queries.
- Record discrepancies and identify which source currently drives working behavior.
- Decide explicitly whether existing users and data must be preserved, transformed, or may be discarded.
- If data must be preserved, define compatibility, backup, validation, and rollback requirements before writing new migrations.
- Document P0 user stories, canonical namespaces, account rules, environment contract, testing expectations, and deployment target.
- Define P0, P1, deferred scope, and measurable maintainability criteria.

Acceptance:

- The data-preservation decision is explicit and approved in the repository.
- The live schema, migrations, generated types, and canonical queries have a documented reconciliation map.
- A future task can cite one canonical document instead of rediscovering competing routes or requirements.
- Documentation startup work has not exceeded two commits without an implementation slice.

## Milestone 2: Thin Vertical P0 — Account, Property, Item, Public Page

Goal: prove the smallest complete SaaS path across database, RLS, auth, API, UI, and staging before broadening the schema.

Implement this milestone as separate resource slices.

### Slice 2A: Account And Membership Bootstrap

- Add or reconcile migrations for profiles/users, accounts, and account membership.
- Add RLS and helper policies for membership and ownership.
- Split Supabase clients into browser anon, server session, and service-role clients.
- Make privileged configuration fail fast when required.
- Introduce explicit `requireUser`, `requireAccountMember`, `requireAccountOwner`, and `requireSystemAdmin` helpers.
- Choose one account-context convention and remove duplicate header conventions from the canonical path.
- Add focused tests for valid membership, missing membership, cross-account denial, and separation of system administration from host membership.

### Slice 2B: Property

- Add or reconcile property and property-type migrations.
- Add property RLS policies and positive/negative tenant-isolation tests.
- Define validated property DTOs.
- Implement canonical `/api/user` property endpoints.
- Connect property creation and selection in `/dashboard2`.
- Migrate one consumer at a time from old endpoints; record remaining consumers before removing compatibility paths.

### Slice 2C: Item And Public Identity

- Add or reconcile item migrations, including stable public identity.
- Add item RLS policies and positive/negative tenant-isolation tests.
- Define validated host and public item DTOs with an explicit guest-safe field set.
- Implement canonical `/api/user` item endpoints and `/api/public/items/[publicId]`.
- Connect one-item creation in `/dashboard2`.
- Make `/item/[publicId]` load without authentication and without exposing host-only fields.

Acceptance:

- A host can log in, establish account context, create/select one property, and create one item.
- A guest can open that item's public page without authentication.
- Cross-account attempts fail at both API and RLS boundaries for accounts, properties, and items.
- Generated types match the applied migrations used for these resources.
- Focused tests, typecheck, and build pass.
- The thin path works in a Railway staging deployment backed by a database created from canonical migrations.

## Milestone 3: Instructions, Content, And Canonical QR

Goal: turn the thin item path into the minimum useful FAQBNB product.

### Slice 3A: Instructions And Content

- Add or reconcile the minimum instruction/article/content-block schema needed for P0.
- Add RLS policies and positive/negative tenant-isolation tests.
- Define validated host and guest-safe DTOs.
- Implement canonical `/api/user` content endpoints and the minimum public response.
- Connect the existing `InstructionsTable` and editor concepts to canonical contracts.
- Verify that content is editable by an authorized host and visible to a guest.

### Slice 3B: Public URL And QR

- Add one central `buildPublicItemUrl(publicId)` utility.
- Migrate QR generation, sharing, and any retained PDF link generation to that utility one consumer at a time.
- Remove hard-coded `/items/${publicId}` and other competing URL construction from canonical code.
- Verify that a real generated QR code resolves externally to `/item/[publicId]` on staging.

Acceptance:

- One item can contain useful guest-facing instructions or content.
- Host-only fields remain absent from public responses.
- QR and share links use the same public URL builder.
- A real QR scan from an external device opens the correct staging public page.
- Content and QR focused tests, tenant-isolation tests, typecheck, and build pass.

## Milestone 4: Minimal Media And Workflow Hardening

Goal: add only the media behavior required by P0 and make the canonical host workflow dependable.

Tasks:

- Decide the minimum P0 media behavior based on the product specification.
- Add or reconcile only the required media/storage schema and bucket policies.
- Add authorization, ownership, file-type, size, and cross-account tests for upload and retrieval.
- Connect the minimum media workflow to canonical item/content APIs.
- Repair the canonical `/dashboard2` create-item workflow without expanding into advanced editing.
- Verify retry, error, empty, and loading behavior for the P0 path.

Acceptance:

- The minimum supported media can be added by an authorized host and viewed by a guest where intended.
- Unauthorized and cross-account media access is denied by storage/database policy and API checks.
- The entire P0 workflow passes locally and on staging.
- Focused tests, typecheck, and build pass.

## Milestone 5: Consolidate APIs And Active Product Surface

Goal: remove ambiguity only after the canonical replacement path is proven.

Tasks:

- Inventory remaining consumers of host CRUD under `/api/admin` and other deprecated namespaces.
- Migrate consumers one route family at a time to `/api/user`.
- Use narrowly scoped compatibility adapters only when needed to keep a deployable increment; give each adapter a removal task.
- Reserve `/api/system` for actual platform administration.
- Keep `/api/public` strictly guest-safe.
- Archive stale dashboard/admin/user duplicates after useful code has moved.
- Remove `.bak`, `page-static`, `simple-*`, and test/example routes after confirming zero canonical dependencies.
- Add a route gate that fails if forbidden production routes reappear.

Acceptance:

- Canonical host components no longer call deprecated API routes.
- Every protected P0 route uses the shared auth and tenancy helpers.
- No compatibility adapter remains without an owner and removal milestone.
- Production route output contains only intentional product surfaces.

## Milestone 6: Confidence, CI, Deployment, And Recovery

Goal: turn the focused P0 confidence established in earlier milestones into a sustainable delivery system.

Tasks:

- Preserve all trusted focused tests created during Milestones 2 through 5.
- Maintain one Playwright P0 smoke path covering login, account, property, item, content, QR/public page, and cross-account denial.
- Repair Vitest 4 configuration drift, test environment defaults, invalid test files, and PostCSS/Vite setup.
- Add browser API mocks only where unit testing is appropriate; use Playwright for media/canvas-heavy behavior.
- Classify legacy tests as repair, rewrite, or archive before spending effort on them.
- Shard or scope the full suite before making it a CI gate.
- Replace the deprecated lint command and establish a reliable lint scope.
- Add CI gates for clean install, typecheck, build, focused tests, route gating, and the P0 smoke test.
- Document staging deployment, production promotion, database backup, migration validation, and rollback/recovery procedures.

Acceptance:

- A clean checkout can install, typecheck, test, build, and deploy using documented commands.
- The trusted P0 test set passes reliably in CI.
- A fresh staging database can be created from committed migrations and pass the P0 smoke path.
- Full-suite failures are resolved or explicitly classified and excluded with documented reasons.
- Deployment and database recovery procedures have been exercised at least once in staging.

## P0 Maintainability Exit Criteria

P0 is considered maintainable only when all of the following are true:

- A clean dependency installation and production build succeed on the documented runtime.
- A fresh Supabase project can be created from committed migrations without manual schema repair.
- Generated database types match the migration-applied schema.
- Existing production data has either a tested migration path or an explicit approved discard decision.
- Every canonical account-owned resource has positive authorization and negative cross-account RLS/API tests.
- Every canonical host API uses the shared auth and tenancy helpers.
- Canonical components no longer call deprecated host CRUD routes.
- QR, sharing, and retained PDF links use one public URL builder.
- Test, example, backup, and debug routes do not ship unintentionally.
- The P0 Playwright path passes locally, in CI, and against Railway staging.
- Environment variables, deployment, backup, migration, and rollback procedures are documented.
- A new task can identify its canonical documents and files without searching the legacy requirement archive.

## Deferred P1 And Later Features

Do not start these until every P0 maintainability exit criterion is satisfied:

- Full PDF print/export workflow beyond preserving canonical links.
- Translation job processing and translation-management UI.
- Access-request workflows unless product discovery promotes them into P0.
- Analytics and advanced reporting.
- Team roles beyond the minimum owner/member model.
- Billing and subscriptions.
- Advanced media editing.
- Bulk imports, marketplace features, and native/mobile surfaces.

Each reintroduced feature must begin with a short spec, data/API contract, authorization model, focused tests, and staging acceptance check.

## Standard LLM Task Template

Use this format for implementation prompts:

```md
Goal:
Implement [one concrete behavior or one resource boundary].

Relevant docs:
- docs/restart/PRODUCT_SPEC.md
- docs/restart/ARCHITECTURE.md
- docs/restart/CONVENTIONS.md
- docs/restart/DATA_MIGRATION_DECISION.md
- docs/audit/[relevant audit file]

Canonical files/surfaces:
- [specific migration, route, component, and test files]

Do not touch:
- [unrelated routes/features]

Security boundary:
- [required membership/role]
- [cross-account behavior]
- [public field restrictions, if applicable]

Acceptance:
- [observable user behavior]
- [focused positive test]
- [focused negative/cross-account test]
- `npm run typecheck`
- `npm run build` for route/app-level changes
- [local or staging smoke check]

Transition:
- [old consumers migrated]
- [compatibility adapter and removal task, if needed]

Commit:
- Commit only files required for this task.
- Update HANDOVER.md and the roadmap/debt register.
```

## Definition Of Done For Restart Tasks

A restart task is done only when:

- The canonical docs and `HANDOVER.md` reflect the current state.
- The change is narrowly scoped and leaves no unnamed competing canonical path.
- Types pass.
- Build passes for route/app-level changes.
- Focused tests cover the changed behavior and its security boundary.
- Account-owned changes include cross-account denial coverage.
- A user-visible increment has a local or staging smoke check appropriate to its risk.
- Old consumers are migrated, archived, or assigned a named transition task.
- Newly discovered unrelated work is recorded rather than absorbed into scope.
- The commit message describes the implementation slice.

## Recommended First Implementation Sequence

1. Secure the workspace, separate dirty work, and establish a clean install/build baseline.
2. Gate known test, example, and debug production routes.
3. Create the canonical `docs/restart/*` documents in no more than two commits.
4. Inspect and reconcile the live schema, migrations, generated types, and canonical queries.
5. Record the existing-data preservation or discard decision.
6. Implement account/membership, property, and item/public-page vertical slices with RLS tests.
7. Deploy the thin P0 path to Railway staging.
8. Add instructions/content and the central public URL/QR behavior.
9. Add only the minimum P0 media behavior.
10. Consolidate remaining API consumers and archive superseded product surfaces.
11. Expand trusted tests into CI and document deployment/recovery.

## Health Gates During Restart

Use immediately:

- Clean dependency installation on the documented runtime.
- `npm run typecheck`.
- `npm run build`.
- Focused unit, handler, migration, RLS, and tenant-isolation tests for changed code.
- Local smoke checks for each user-visible slice.
- Railway staging smoke checks at least every three to five implementation tasks.

Do not use as hard gates yet:

- The current full `npm test -- --run` suite.
- The current deprecated lint command.

Promote the full suite and lint to hard gates only after Milestone 6 makes them reliable and appropriately scoped.

## Final Recommendation

Proceed with controlled salvage through vertical delivery, not layer-by-layer reconstruction. Preserve the existing guest page, `/dashboard2` concepts, item/content components, localization foundation, and useful QR/PDF utilities. Rebuild trust boundaries in small resource slices, validate every slice with tenant-isolation tests, and prove progress regularly on staging. If live-schema discovery shows unacceptable migration or data-loss risk, stop and revise the salvage decision before implementation continues.
