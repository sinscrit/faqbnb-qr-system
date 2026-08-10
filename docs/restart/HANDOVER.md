# Restart Handover

Updated: 2026-08-10.

## Active Step

Milestone 1.3 auth/provider discovery and the initial method decision are complete and independently validated. Isolated Slice 2A.1 has independent static acceptance, while real Docker-backed Supabase 17 replay remains blocked because Docker Desktop is not installed. Slice 2A.2's local cookie-backed server session/bootstrap/account boundary is independently validated. No remote Supabase call or mutation occurred and no data decision has been accepted.

## Slice 2A.2 Independently Validated Locally

- Replaced `/api/auth/session` bearer-token, client-selected account, token
  response, account-list, and fail-open behavior with one GET-only no-store
  cookie-session boundary.
- Validates `auth.getUser()` and requires an email plus
  `email_confirmed_at`; every failure sets `authenticated: false`.
- Calls only `bootstrap_current_user` with a normalized optional display name
  and server/database account-name default; imports no service-role client.
- Requires exactly one well-formed bootstrap row for the authenticated user and
  returns only display name, current account ID/name, and `/dashboard2`.
- Ignores request inputs by construction: the route has no request parameter.
  No bearer token, header, query, body, role, account ID, local storage, or
  client confirmation flag can choose context.
- Added 27 focused tests across the core and route. They pass under exact Node
  `22.23.2` and npm `10.9.9`; typecheck also passes.
- The 27 focused tests, typecheck, production build, non-empty build ID, and
  diff hygiene pass under the pinned toolchain. No browser/E2E or live database
  proof is claimed.
- Independent validation corrected malformed auth/RPC-envelope handling,
  email-specific confirmation semantics, strict RPC output parsing,
  Unicode-safe name bounds, GET-only coverage, and consumer documentation.
- See `SLICE_2A2_SESSION_CONTEXT.md`, `../../src/lib/HANDOVER.md`, and
  `../../src/app/api/auth/HANDOVER.md`.

## Slice 2A.1 Static Validation Accepted; Runtime Blocked

- Added exact `supabase@2.113.0` dev tooling plus canonical start, reset, test,
  stop, and local type-generation scripts.
- Added the validated live-shape `users`, `accounts`, and `account_users`
  boundary, explicit constraints/indexes, safe updated-at triggers, and RLS.
- Added non-recursive `private` membership/owner policy helpers with fixed
  search paths and least grants.
- Added one authenticated bootstrap RPC that derives `auth.uid()`, email, and
  provider server-side; accepts optional names only; serializes retries; and
  creates/repairs a profile, one initial owned account, and owner membership.
- Added 44-assertion real-role pgTAP coverage for two identities, exact function
  grants, own access, cross-account denial, retry/idempotency, no-name default,
  anonymous denial, all direct insert denial, and safe multiple-account repair
  without service-role application behavior.
- Preserved `database/` as legacy evidence and created `supabase/HANDOVER.md`.
- Generated types were intentionally not created because no replayed local
  database existed.
- Independent static validation found and fixed the bootstrap membership
  upsert's ambiguous PL/pgSQL conflict target. A fresh PostgreSQL 14 shim replay
  and manual RLS checks pass, but they do not replace Supabase 17/pgTAP.
- Blocker: Docker CLI is present, but its daemon socket at
  `/Users/shinyqk/.docker/run/docker.sock` does not exist and Docker Desktop is
  not installed. This is not a database-test pass; see
  `SLICE_2A1_DATABASE.md`.

## Completed Milestone 1.3 Auth Discovery

- Used aggregate read-only Supabase SQL only; recorded no emails, UUIDs, raw
  metadata, tokens, URLs, logs, or individual rows and performed no mutation.
- Counted 21 auth users and 21 identity rows: 15 email and six Google; 17 users
  are confirmed, four unconfirmed, none anonymous, and none marked invited.
- Recorded coarse activity only: six never signed in, ten last signed in 91–365
  days ago, and five over 365 days ago; no last sign-in occurred within 90 days.
- Found 19 users with one identity row, one with multiple, and one with none.
- Aggregate bootstrap coverage shows all 11 public profiles have an owner-role
  membership on an account owned by the same auth user, while ten auth users
  have none of those application records.
- Mapped email login/registration, both Google callback families, middleware,
  `AuthContext`, account bootstrap, and the legacy access-request/code flow.
- Selected email/password as canonical registration/login, with required reset,
  one `/dashboard2` destination, and subordinate existing-Google compatibility.
- Required confirmed email ownership in production and a real staging
  confirmation/recovery delivery test; silent admin auto-confirm is forbidden.
- Identified missing provider/config evidence and did not treat local environment
  variable names or historical identities as proof of a working deployment.
- Added no app code; Slice 2A now produces executable database/auth progress.
- Passed independent validation with aggregate-only re-queries reproducing auth,
  provider, lifecycle, activity, identity-multiplicity, and strengthened
  profile/owner-membership/account-ownership totals; no individual values or
  remote mutations were involved.
- Preserved validator corrections for optional display name, the email flow's
  second password sign-in, owner-role/owner-ID coverage, authenticated and
  unauthenticated redirect semantics, optional Google variables, and fail-closed
  denial of unknown Google identities without enrollment.

## Completed Milestone 1.2 Local Reconciliation

- Added `SCHEMA_RECONCILIATION.md` with the requested P0 matrix for accounts, identity/membership, properties/types, items/public IDs, articles/links, storage, and access requests.
- Proved that the local replay path is incomplete: the first local migration references tables with no prior creation migration, and the manual schema path still lacks `users` and `accounts`.
- Recorded zero exact migration-name matches between the 109-entry live ledger and three local migrations; listed the exact live P0 evolution entries that have no checked-in file.
- Classified `database/schema.sql`, `database/README.md`, both root seeds, the manual admin template, and the translation seed for replacement/deferment.
- Identified confirmed type/query drift: absent live `users.preferred_language`, `items.location`, three access-request lifecycle fields, property `thumbnail_url`, and stricter domain nullability.
- Identified canonical runtime breakpoints: property detail selects absent `name`/`description`, dashboard stats selects absent `location`, language API selects absent preferred language, and create/item-list code build plural `/items/{id}` instead of canonical `/item/{id}`.
- Identified a compatibility transport mismatch: canonical consumers send `x-current-account`, admin item/article/property helpers read `x-account-id` or `account_id`, and create does not pass its prepared account header to `adminApi.createItem`.
- Inventoried remaining canonical UI compatibility calls to admin item/article/property/upload/PDF/analytics routes and required consumer-by-consumer migration to `/api/user`.
- Kept the preservation decision pending and defined additive isolated slices with automatic server-validated account/property context for the simplest host journey.
- Passed independent validation of the seven-area matrix, source evidence, migration-name comparison, type/query findings, compatibility scope, preservation constraints, document consistency, and diff hygiene.
- Preserved validator corrections for type provenance, roadmap-aligned slice numbering, multiple-choice UX, trigger dependencies, plural guest URLs, and account-header transport mismatch.

## Completed Milestone 1.1 Live Inventory

- Captured and independently re-queried the live P0 schema, aggregate counts, RLS/policy metadata, indexes, relevant functions/triggers, storage aggregates/policies, remote migrations, and security-advisor summary without row data or mutation.
- Removed the live project identifier from restart documentation and retained only a non-identifying target description.
- Confirmed 26 public tables, nine detailed P0 tables, one storage bucket with eight aggregate objects, 109 remote migrations, eight security warnings, and five P0-relevant triggers out of nine non-internal triggers in the inspected scope.
- Preserved the data decision as pending: policy predicates, ownership coverage,
  provider-side auth configuration, and backup/restore proof remain unresolved;
  local-to-live reconciliation was subsequently completed in Milestone 1.2 and
  aggregate auth discovery in Milestone 1.3.

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

1. When Docker becomes available, run Slice 2A.1's clean Supabase 17 replay,
   44 pgTAP tests, and local type generation; fix real database failures before
   runtime acceptance.
2. Gather remaining per-resource ownership/policy evidence and backup/restore
   proof without identity values or live mutation.
3. After 2A.1 acceptance, build server-only auth/bootstrap primitives, email registration/login, and
   password recovery in separate accepted slices; verify confirmation delivery
   before fixing the environment policy.
4. Gather backup/restore proof before any final data decision or live mutation.
5. Coordinate the outstanding provider actions in `SECURITY_INVENTORY.md`; keep history rewriting separately approved.

## Unresolved Decisions

- Data preservation cannot be finalized until the remaining ownership/policy
  evidence, restore proof, and accountable approval exist.
- Email/password is selected as the initial canonical path. Production requires
  confirmed email ownership and staging must prove confirmation/recovery email
  delivery; existing Google login remains a compatibility obligation until
  independently verified or migrated.
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
- Independently validated local reconciliation: `docs/restart/SCHEMA_RECONCILIATION.md`
