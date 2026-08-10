# Restart Handover

Updated: 2026-08-10.

## Phase 4C Generated-Type Hygiene Pending Validation

- Phase 4B's committed generated type ended with an extra blank line, so the
  post-commit `git diff --check HEAD^ HEAD` found one EOF warning despite the
  earlier candidate diff check. No schema or application behavior was wrong.
- The bounded correction normalizes trailing CR/LF sequences to one LF in the
  existing checked sibling temp file before its atomic move. CLI failure and
  empty-output protection remain fail-closed.
- Two final pinned generations from the accepted local PostgreSQL 17 stack are
  byte-identical at 473 lines, 13,339 bytes, and SHA-256
  `6a732e3339010267f6c043371ddbf478972371f208e73adb16ecea0dd9b75178`.
  The exact schema and publication/public-reader RPC content is unchanged from
  Phase 4B after EOF normalization, and the artifact has one terminal LF.
- Pinned typecheck, the nine-file focused publication matrix at `105/105`, and
  candidate diff hygiene pass. A separate agent must validate this correction
  and the committed diff before it is accepted. Phase 5 remains active but does
  not supersede this validation queue.

## Phase 4B Independently Accepted

- The local `faqbnb_manus` Supabase stack is running on PostgreSQL `17.6`
  (`17.6.1.158`, native ARM) through the independently accepted Colima runtime
  and repository-pinned CLI `2.113.0`.
- Fresh start/reset replayed exactly all six ordered migrations. The first live
  replay correctly failed on a real `p_item_name` versus canonical `p_name`
  mismatch; migration 5 and its catalog regression now match the application
  and migration-6 guard.
- PostgreSQL 17 also exposed unsafe raw outer U+2028/U+2029 being trimmed before
  validation. Migration 5 now checks raw item/title/body inputs before trimming;
  the expanded Slice 3A.2 plan proves both separators and raises the database
  total to `475/475`, all passing.
- Separate real-role probes pass simultaneous exact retry, changed-content
  conflict, downgrade-first membership serialization, injected-error atomic
  rollback, anonymous useful projection, draft/empty/unknown hiding, exact ACLs,
  raw Unicode rejection, and LF/TAB preservation.
- `src/types/database.generated.ts` was generated twice from local PostgreSQL
  with the identical SHA-256. `item-boundary.ts` derives its publication and
  reader RPC argument types from it. Exact Node `22.23.2`/npm `10.9.9` repeats
  pass `105/105`, `224/224`, `5/5`, typecheck, and production build.
- No Supabase login token, environment variable, project ref, pooler metadata,
  remote target, link, query, or mutation was present or used. The database was
  reset after probes and the local stack remains running for the validator.
- A different agent repeated remote safety, clean replay, `475/475`, targeted
  probes, deterministic generated-type hash, application gates, and final clean
  reset without correction. Exact evidence is in
  `PHASE_4B_SUPABASE_RUNTIME_ACCEPTANCE.md`; Phase 4B is independently accepted.

## Phase 4A Runtime Independently Accepted

- Docker Desktop remains unavailable. The existing Docker CLI and Desktop
  context were preserved.
- Native ARM Homebrew installed Colima `0.10.3`, Lima `2.2.0`, and Docker
  credential helper `0.9.8` without a cask, privileged service, login service,
  or removal of existing configurations.
- Colima is running through Virtualization.Framework with Docker `29.5.2`,
  `linux/arm64`, four CPUs, 8 GiB memory, a 40 GiB Docker data disk, Rosetta
  compatibility, and active context/socket `colima` at
  `unix:///Users/shinyqk/.colima/default/docker.sock`.
- A stale Desktop credential-helper reference blocked the first anonymous pull.
  The exact empty-auth Docker config was backed up, the compatible
  `osxkeychain` helper was installed, and only `credsStore` changed. Existing
  contexts were not deleted.
- A disposable `alpine:3.22` container returned native `aarch64` and
  `container_ok=true`; `--rm` left no test container. Repository-pinned
  Supabase CLI `2.113.0` reached the daemon and returned the expected missing
  `supabase_db_faqbnb_manus` result because the local stack is stopped.
- No Supabase stack, remote project, database, migration, type generation, or
  application source changed. The runtime remains running for Phase 4B.
- Exact commands, evidence, safety boundary, configuration backup, stop/restart
  procedure, and independent validation are in
  `PHASE_4A_CONTAINER_RUNTIME.md`.
- A different agent repeated the installed versions, persisted resources,
  context/socket, Docker server, helper/backup, and pinned CLI checks. Its
  distinct `phase4a-validator-20260810` `--rm` proof returned `aarch64`/`ok`
  with zero residual containers. It also found zero Supabase/PostgreSQL images,
  containers, volumes, or networks and no login/project/remote-operation or
  source-diff evidence.
- Independent validation accepted Phase 4A without a correction. Historical
  pre-install events cannot be repeated after restoration; preserved artifacts
  and current outcomes are consistent with the executor record. Phase 4B is
  now the active database acceptance gate.

## Phase 3 Independently Accepted

- Root browser initialization used `.projstuff` CDP port `9340`, the required
  Chrome for Testing launcher, a successful `/json/version` probe, and only
  standalone Playwright. The in-app browser was never used.
- The application ran separately under exact Node `22.23.2`, npm `10.9.9`, and
  Next.js `15.5.9` with all application/backend origins constrained to
  loopback. Browser APIs were intercepted; the real guest server component and
  anonymous client used a loopback-only fake PostgREST projection.
- The final clean matrix passes `23/23`: 19 scenarios at `1440x900`, four at
  `390x844`. It covers every required property, keyboard, focus, duplicate,
  retry, thaw, auth, conflict, unavailable, success, and guest state.
- The run observed 269 browser requests, zero external requests, zero request
  failures, zero page errors, and zero unexpected console issues. Nine expected
  Chromium failed-resource diagnostics correspond exactly to deliberately
  mocked `400`/`401`/`403`/`409`/`503` responses.
- Invalid, draft, and unknown guest states have identical title/copy and
  `noindex`. Streamed development `notFound()` documents reported transport
  `200`; production smoke must record its transport result separately.
- No browser-discovered product defect remained and no application source
  changed. Exact evidence and the acceptance boundary are in
  `PHASE_3_MOCKED_BROWSER_ACCEPTANCE.md`.
- A different agent repeated the `23/23` matrix in a fresh session. Its
  accepted scenario groups observed 439 browser requests, zero external
  requests, zero page errors, and only expected mocked failure diagnostics.
  Cookie-free guest RPCs targeted only the loopback anonymous endpoint;
  `14/14` component tests, typecheck, and diff hygiene also passed.
- Duplicate development `noindex` tags were non-conflicting and non-blocking.
  Production status and metadata smoke remains required.
- Phase 3 is independently accepted. Phase 4 Supabase PostgreSQL 17 is the
  active next gate.

## Phase 2 Independently Accepted

- Exact Node `22.23.2`/LTS `Jod` and npm `10.9.9` were used for every Phase 2
  command. Clean `npm ci --include=optional` passed in 11.09s with 951 packages
  added and 952 audited.
- The optional native `@parcel/watcher-darwin-arm64` 2.5.4 package and its
  326112-byte `watcher.node` binary are present after the clean install.
- The exact historical nine-file Slice 3A.3 matrix passes `105/105`; the full
  18-file auth/session/property/item/public-reader/provider prerequisite union
  passes `224/224`; and the separate production route gate passes `5/5`.
- Pinned typecheck passes in 2.38s. The Next.js 15.5.9 production build passes
  in 28.64s and emits a non-empty 21-byte build ID plus the expected canonical
  create, publication API, public API, and guest routes.
- Current and complete candidate diff hygiene pass. Scoped scans find no new
  service role, server self-fetch, legacy provider dependency on canonical
  pages, credential material, or tracked generated artifact. No application
  code, remote service, database, provider, or deployment state changed.
- Existing unresolved output is recorded without hiding it: four install
  deprecations, 29 audit findings, the Vitest pool-options deprecation, Sentry
  configuration deprecations, and legacy PDFKit font diagnostics. The audit's
  direct runtime findings require scoped triage before internal deployment and
  security acceptance; Phase 2 neither resolves nor waives them.
- Exact commands, files, counts, timings, warnings, and boundary evidence are
  in `PHASE_2_LOCAL_APPLICATION_ACCEPTANCE.md`. A different agent repeated all
  executable gates, inspected the diff/source boundary, required bounded
  documentation corrections, and independently accepted Phase 2.

## Phase 1 Independently Accepted

- Reproduced the exact seven interrupted Slice 3A.3 failures under Node
  `22.23.2` and npm `10.9.9`: four property-result shape leaks, API carriage
  acceptance, client-validation focus theft, and an incorrect multiline guest
  matcher.
- `item-boundary.ts` now validates the strict publication DTO before property or
  database work and rejects CR/CRLF while retaining LF/TAB. The API parser and
  client normalizer enforce the same body contract; the existing SQL boundary
  already rejects carriage returns.
- Property-context errors are reconstructed into the exact
  `PublicationResult` failure shape, so `authenticated` and other context fields
  cannot escape that boundary.
- Client validation now leaves focus on the first invalid field while the alert
  remains its accessible description. Network/server recovery errors still
  move focus to the alert. The guest implementation was already correct; its
  test now asserts exact paragraph text and `whitespace-pre-wrap` directly.
- Added six regressions covering CR/CRLF across API, client-recovered drafts,
  and server DTO; LF/TAB preservation; exact failure shape; validation versus
  network focus; and exact multiline guest output.
- The exact historical nine-file focused matrix now passes `105/105` under the
  pinned runtime. Pinned `tsc --noEmit` and `git diff --check` pass. Vitest emits
  only the pre-existing `test.poolOptions` deprecation warning.
- A different agent repeated the code/test evidence, verified the corrected
  handover state, and independently accepted Phase 1. Phase 2 clean-install and
  full local acceptance and Phase 3 browser acceptance subsequently passed and
  are independently accepted in the sections above. Phase 4 database runtime
  evidence remains pending. No push, browser, database, clean
  install, deployment, or remote mutation occurred during Phase 1.

## Phase 0 Recovery Checkpoint Independently Accepted

- The interrupted Slice 3A.2/3A.3 working tree now lives unchanged on the
  dedicated `restart/p0-internal-deployment` branch at base commit
  `2d7adc81d122b0c04a28413beb74d63068a14b15`.
- A fresh `git fetch --prune origin` completed before branch creation. The
  source branch `fix-qr-code-generation` was 26 commits ahead and 0 commits
  behind `origin/fix-qr-code-generation`; nothing was merged or rebased.
- The exact pre-correction tracked and intended untracked working state is
  preserved outside the repository at
  `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/.faqbnb_manus-recovery/20260810T141036Z-phase0/`.
  It contains `tracked-working-tree.patch` (binary-capable full-index patch),
  `intended-untracked.tar.gz`, `WORKTREE_MANIFEST.tsv`,
  `UNTRACKED_PATHS.txt`, `RECOVERY_MANIFEST.sha256`, and `metadata.txt`.
- The manifest records each changed path's tracked/untracked class, byte size,
  and SHA-256 digest. Archive listing, artifact checksums, and a comparison of
  the archived untracked files against the live worktree passed. Credential-
  like filenames and high-confidence private-key/access-token patterns were
  excluded by inventory and content checks; no environment or credential file
  is present.
- Independent validation accepted the recovery branch, patch applicability,
  exact 15-path untracked archive, 32-entry live-worktree manifest, checksums,
  secret exclusions, and reconstruction evidence. It found only one bounded
  documentation hygiene correction: an extra blank line at the execution
  plan's EOF.
- The external checkpoint deliberately remains the immutable exact
  pre-correction snapshot. The EOF correction and this accepted-status
  handover correction are the two documentation changes to commit as the
  accepted Phase 0 step; neither changes implementation behavior or weakens
  recovery.
- No reset, clean, checkout of paths, stash, merge, rebase, remote mutation, or
  implementation-file correction occurred.

## Active Step

Phases 0–3 are independently accepted. Phase 2's pinned clean install,
`105/105` focused matrix, `224/224` prerequisite union, `5/5` route gate,
typecheck, build/build-ID, diff, and source-boundary executor evidence all pass;
the separate validator repeated the executable gates and accepted the corrected
record. Phase 3's `23/23` mocked browser matrix is independently accepted.
Phases 4A and 4B are independently accepted. Phase 4B passes six-migration
replay, all `475/475` pgTAP assertions, targeted probes, generated types, and
repeated application acceptance on disposable Supabase PostgreSQL 17; its
separate validator found no correction. Phase 5 QR completion is active;
real-stack browser acceptance, independent security review, and isolated
internal deployment follow its implementation gates. No remote Supabase call or mutation
has occurred, and the existing-data decision remains unaccepted.

The milestone and slice sections below are retained as historical acceptance
records. Their embedded follow-up language is superseded by the Active Step and
Next Logical Steps in this handover.

## Slice 3A.1 Independently Statically Accepted; Runtime Pending

- Added isolated ordered plain-text instruction storage with an exact
  `instructions` purpose, safe normalized title/body, shared timestamps,
  item cascade, idempotency/order unique boundaries, and no redundant indexes.
- Authenticated same-account membership receives SELECT only. RLS is enabled
  but not forced; anonymous/PUBLIC access, direct DML, creation/publication
  RPCs, source language, and a public reader are absent.
- Independent review found and the implementation corrected two Unicode gaps:
  both fields now use the complete Unicode 17.0 `Cf` set plus U+2028/U+2029,
  and a complete Unicode `White_Space` trim/nonblank boundary. Explicit viewer
  same-account allow and cross-account denial coverage was also added.
- A 132-assertion pgTAP candidate and fresh UTF8 PostgreSQL 14 ordered replay,
  real-role, text-boundary, and guard probes pass. Pinned typecheck and diff
  hygiene pass. Supabase 17, all 376 database assertions, and generated types
  remain pending. See
  `SLICE_3A1_INSTRUCTION_DATABASE.md`.

## Slice 2C.2 Independently Validated Locally

- Added strict same-origin, JSON-only, 16 KiB-bounded POST
  `/api/user/items`; it accepts exactly property UUID, retry UUID, and one
  normalized bounded item name. Tenant/identity, description, publication,
  internal ID, URL, QR, media, and extra fields are rejected.
- The cookie-bound helper freshly resolves current user/account and revalidates
  the property UUID as a hint before calling `create_current_item`. It requires
  one strict row matching the selected property and submitted normalized name,
  then returns only public ID/name.
- Accepted UUIDs are lowercase-canonicalized. Names are NFKC-normalized and
  reject control/format characters before whitespace collapse. SQLSTATE
  `22023` becomes sanitized non-retryable `409 ITEM_CREATION_CONFLICT`; a
  deliberate content change requires a fresh request UUID.
- Added a separate cookie-free, non-persistent anon-key server client. Exact
  GET `/api/public/items/[publicId]` calls only `read_public_item` and returns
  only public ID/name. Invalid, draft, and unknown UUIDs receive the same 404;
  malformed, multiple, mismatched, thrown, or upstream-error results receive a
  sanitized 503.
- Removed the exact public endpoint's legacy translation, analytics, in-memory
  rate-limit, demo, logging, service-role, and nested-data behavior. Neither new
  production path self-fetches an application URL.
- Implementation evidence passes a 123-test prerequisite matrix and final 52
  focused tests, exact Node `22.23.2`/npm `10.9.9` typecheck/build, a 21-byte build ID,
  source-boundary checks, and diff hygiene.
- Independent validation accepted the local server boundary. No host item UI, instruction,
  publication transition, guest-page compatibility, URL/QR path, generated
  types, live database call, or remote mutation is claimed. The legacy guest
  page still expects its superseded translated shape and self-fetches; the
  legacy public languages sibling remains outside this contract. See
  `SLICE_2C2_ITEM_API.md` and the `src/lib` and API handovers.

## Slice 2C.1 Independently Statically Accepted; Runtime Pending

- Added the ordered isolated item migration after the accepted identity/account
  and property foundations. Strong guards reject an existing/partial item
  boundary and an incomplete prerequisite boundary before any item DDL.
- Added internal and generated public UUIDs, a required property parent,
  property-scoped creation-request UUID, normalized/safe 120-character name,
  nullable compatibility description, draft-only nullable `published_at`, and
  shared timestamps. Location, tags, language, media, QR, and instruction data
  are explicitly absent.
- Added `create_current_item`, which accepts only a property hint, request UUID,
  and item name; derives confirmed auth identity and property account; locks a
  writable owner/admin/member membership; creates exactly one draft; and
  returns only public ID, property ID, and normalized name. Same-payload retries
  return the stable row while request/payload conflicts fail closed.
- Added membership-scoped authenticated reads with no direct DML and an
  anonymous/authenticated `read_public_item` that returns only public ID/name
  for published rows. Draft and unknown public UUIDs both return zero rows, and
  anonymous callers have zero item table rights.
- Added a 123-assertion pgTAP candidate for schema, constraints, grants, RLS,
  fixed-path/owned definer functions, validation, roles, retry/conflict,
  cross-account denial, draft hiding, and public projection.
- Fresh ordered PostgreSQL 14.17 replay and manual real-role probes passed.
  Simultaneous duplicate requests returned one public UUID/one row; a
  downgrade-first membership race waited then denied creation with zero rows;
  out-of-order and second replay guards left no partial boundary.
- Exact Node `22.23.2`/npm `10.9.9` typecheck, Supabase CLI `2.113.0`,
  assertion-count, and diff checks pass, and independent static validation
  accepted the boundary. Docker-backed Supabase 17 replay, all 244 database
  assertions, and generated types remain blocked. Application wiring, public
  page, and instruction/publication flow are separate later slices. See
  `SLICE_2C1_ITEM_DATABASE.md` and `../../supabase/HANDOVER.md`.

## Slice 2B.2 Independently Validated Locally And In Standalone Browser

- Added a dependency-injected property resolver that first establishes verified
  cookie identity/account, calls only `resolve_current_property` with content,
  requires one strict state row, and fails closed on account mismatch.
- Added no-store `GET/POST /api/user/property-context`: GET has no request
  authority; strict same-origin 16 KiB POST supports content-only creation or a
  hint-only UUID selection revalidated through account-scoped RLS.
- Replaced logout with same-origin cookie-backed POST only, deterministic local
  cookie cleanup, safe fallback, and no browser Supabase/logged details.
- Isolated exact `/dashboard2` from both root legacy providers and the legacy
  dashboard/AuthContext/PropertyContext shell while retaining that dynamically
  separated stack for nested transition routes.
- Replaced the dashboard home with zero/one/many/auth/retry states, one property
  name decision, one first-item CTA, inline validated choices, subordinate sign
  out, accessible errors, duplicate suppression, and mobile-first layout.
- Persists only a last-property UUID hint, auto-uses it only in a fresh choice
  list, and never stores account context, roles, identities, or tokens.
- Independent validation corrected the logout request to exact empty JSON,
  rejected duplicate server/client choice IDs, classified a multiple-row
  selection protocol error as unavailable rather than not found, cleared stale
  auto-selection hints, focused initial auth/unavailable alerts, and added a
  synchronous mutation lock for create/select/logout.
- The initial focused/prerequisite run passes 109 tests across seven files, plus
  five route-gate tests, pinned typecheck/build, a 21-byte build ID, and diff
  hygiene under exact Node `22.23.2`/npm `10.9.9`. The build retains a compact
  270 kB exact dashboard while nested `/dashboard2/create` retains its separate
  611 kB legacy shell.
- Standalone browser acceptance then exposed and corrected exact `/dashboard2`
  still entering legacy middleware session/profile work before its canonical
  API. An exact-route policy now bypasses that branch without changing nested
  dashboard routes. Desktop and 390 px zero/one/many, recovery, malformed,
  duplicate, logout, focus, layout, provider-isolation, storage, and network
  checks pass with local API fixtures and no remote request. There were no
  unexpected JavaScript console errors or page errors; Chrome's expected HTTP
  status console entries occurred for deliberately mocked 401/403/503 responses.
- The corrected run passes 120 focused/prerequisite assertions across eight
  files, the five-test route gate, pinned typecheck, and production build. Six
  screenshots were visually inspected and deliberately not retained.
  Independent browser validation passed. Live authenticated-cookie staging
  convergence remains pending; see
  `SLICE_2B2_BROWSER_ACCEPTANCE.md`.
- No remote Supabase/email/provider action occurred. Slice 2B.1 Supabase
  17/pgTAP runtime evidence remains blocked.

## Slice 2B.1 Independently Statically Accepted; Runtime Pending

- Added a guarded second migration for the validated live-shaped property/type
  fields, with canonical non-null `account_id` only in a fresh isolated target
  and compatibility `user_id` derived from the auth identity.
- Added a deterministic seven-type product seed with `other` as the default;
  these values are explicitly not claimed to match the seven live rows.
- Added authenticated read-only type access, membership-scoped property reads,
  no direct property DML grants/policies, and a fixed-search-path private write
  helper that clients cannot execute.
- Added `resolve_current_property`, which derives confirmed identity and the
  earliest writable account server-side, holds the selected membership against
  concurrent role changes, serializes first creation, and returns
  `needs_property`, `ready`, or `selection_required` without accepting tenant
  authority or guessing among multiple properties.
- Rejects unsafe ASCII/Unicode control, zero-width, and direction-formatting
  characters at both the RPC and property-table constraint boundaries.
- Added a 77-assertion two-identity pgTAP candidate covering grants/RLS, zero and
  first-property states, bounded/safe text, idempotency, member/viewer behavior,
  cross-account denial, direct-write denial, multiple-property behavior, and
  deterministic account choice.
- Independent validation added an explicit Slice 2A.1 prerequisite guard, so an
  out-of-order manual replay now fails before creating any 2B.1 helper or table.
  It also strengthened PUBLIC-grant, function-owner/search-path, viewer-context,
  and multiple-property null-output coverage.
- Reproduced the missing Docker socket once. Fresh PostgreSQL 14 ordered replay,
  manual real-role context/RLS probes, concurrent first-create and membership
  downgrade probes passed; the guard rejected both out-of-order and second
  property-boundary replay. This is not Supabase 17 or pgTAP acceptance.
- No generated types, application wiring, live seed mapping, remote link, or
  remote mutation occurred. See `SLICE_2B1_PROPERTY_DATABASE.md` and
  `../../supabase/HANDOVER.md`.

## Slice 2A.3 Independently Validated And Browser UX Accepted

- Replaced canonical login/registration UI with one accessible single-column
  email journey independent of `AuthContext`, account selection, and roles.
- Isolated all four canonical auth pages from the legacy root auth/locale/theme/
  debug/version-footer provider stack so it performs no legacy browser
  Supabase/localStorage initialization on those pages.
- Added generic recovery request, recovery-session plus one-use callback proof
  password update, and one confirmation callback for PKCE code and email
  token-hash shapes.
- Added strict same-origin 16 KiB JSON contracts, one shared 10–128 character
  password rule, trusted-origin callback construction, no-store sanitized
  responses, and fail-closed verified-email/account-context convergence.
- Removed access-code/Google registration choices from the canonical path;
  legacy nested registration and callback paths redirect to canonical entry.
- Recovery proof and Google state are separately HMAC-authenticated, expire in
  ten minutes, and are cookie-consumed. Recovery proof is bound to the
  server-validated recovered user. Failed application gates clear local auth
  cookies even when provider sign-out fails and add a failing-response
  `Clear-Site-Data` fallback if cleanup cannot be confirmed.
- Existing-Google login is subordinate and disabled unless complete server
  config plus an explicit compatibility flag is present. Unknown profiles are
  signed out without application enrollment; a misconfigured provider could
  still create an auth identity, so the flag remains off pending staging proof.
- Independent validation corrected the forgeable UUID proof, unsigned OAuth
  state, origin/content-type and no-store gaps, cleanup failure behavior,
  callback confusion, sensitive middleware redirect/logging, and alternate
  production access-code surfaces.
- Thirty-three focused tests, five route-gate tests, exact-pinned typecheck,
  production build, 21-byte build ID, and diff hygiene pass.
- Standalone Playwright accepted the four canonical pages at desktop/mobile
  viewports with mocked local API states and no remote calls. Browser evidence
  corrected login keyboard order and recovery-page metadata. A real auth cookie
  and staging remain required for end-to-end `/dashboard2` convergence. See
  `SLICE_2A3_EMAIL_AUTH.md` and `SLICE_2A3_BROWSER_ACCEPTANCE.md`.

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
- Slice 2A.3 later extended the same production `404` boundary to
  `/request-access`, `/api/public/access-request`, `/api/access/redeem`,
  `/api/auth/validate-code`, and `/api/auth/complete-oauth-registration`; the
  five focused policy/matcher regressions pass, but no new HTTP smoke is
  claimed for this extension.
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

1. Complete canonical QR generation and external-scan proof, then run real-stack
   host-to-guest browser acceptance and independent security/code review.
2. Reconcile canonical restart documents, commit accepted slices, and deploy to
   a fresh isolated internal Supabase/Railway target with recorded smoke,
   health, and rollback evidence. Existing-data deployment remains gated by a
   verified backup/restore and data decision.

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
