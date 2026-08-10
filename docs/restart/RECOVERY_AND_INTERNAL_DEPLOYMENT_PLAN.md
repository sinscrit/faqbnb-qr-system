# Restart Recovery And Internal Deployment Plan

Status: **EXECUTION IN PROGRESS — PHASES 0–4B INDEPENDENTLY ACCEPTED; PHASE 5 ACTIVE**

Updated: 2026-08-10.

## Objective

Recover the interrupted Slice 3A.2/3A.3 work, complete the smallest useful
QR-backed host-to-guest journey, validate it against the intended runtime, and
deploy it to an internal environment. After the internal deployment is proven,
continue the broader restart as smaller independently accepted slices.

The internal MVP journey is:

```text
login -> property -> item and instruction -> publish -> QR -> external scan -> guest page
```

This plan is subordinate to `PRODUCT_SPEC.md`, `ARCHITECTURE.md`,
`CONVENTIONS.md`, and `DATA_MIGRATION_DECISION.md`. Authorization to deploy the
completed work does not authorize destructive mutation of the existing
data-bearing Supabase project. The preferred deployment target is a fresh,
isolated internal Supabase environment.

## Why This Plan Replaces The Earlier Draft

All reviewed recommendations scored above 80/100 confidence and are included:

- protect the interrupted work with a verified recovery checkpoint;
- resolve the known failures before expanding scope;
- use pinned deterministic local validation;
- run both mocked and real-stack browser acceptance;
- validate the database on Supabase PostgreSQL 17;
- include canonical QR generation in the internal MVP;
- require an independent security/code review and coherent documentation;
- prefer a fresh isolated internal deployment;
- require backup and reconciliation before any existing-data deployment;
- include smoke, logs, health, and rollback checks;
- defer non-blocking media and consolidation work until after the MVP; and
- split the remaining restart into bounded slices rather than one final task.

## Release Boundaries

### Internal preview

An internal preview may be deployed after the publication-to-guest slice passes
local application, database, and browser acceptance. It may expose a direct
guest-page link while QR work is still in progress, but it must be labelled as
a preview and must use an isolated database.

### Internal MVP

The internal MVP additionally requires canonical QR generation and a verified
external scan to the guest page. This is the default deployment target for this
plan.

### Existing-data or production deployment

Any deployment that applies migrations to the existing data-bearing backend
remains blocked until backup/restore evidence, schema reconciliation, and an
accountable data decision are complete. Internal status alone does not remove
that data-safety requirement.

## Definition Of Work Completed

Work is complete and authorized for internal deployment only when all of the
following are true:

1. The interrupted working tree has a verified recovery copy.
2. Every required focused and prerequisite test, including new regressions,
   passes under the pinned runtime.
3. Typecheck, route gate, production build, and diff hygiene pass.
4. All six restart migrations replay from zero on disposable Supabase
   PostgreSQL 17 and all 475 pgTAP assertions pass.
5. Generated database types are current and the application still passes.
6. Mocked desktop/mobile browser acceptance passes for recovery and failure
   states.
7. The real host-to-guest journey passes against the local database stack.
8. One canonical public URL produces a QR code that an external client can scan
   to the exact guest page.
9. Independent review finds no unresolved P0 tenant, authorization, public-data,
   idempotency, or secret-handling defect.
10. Canonical restart documents match the accepted implementation.
11. The intended internal deployment has a recorded target, smoke checklist,
    health checks, and rollback path.

Test counts are evidence, not a fixed target. The pre-correction focused
application baseline was 99 tests; the independently accepted Phase 1 matrix is
now `105/105`. Adding later regressions may raise that total or the 475 database
assertions; the gate is that every required test passes.

## Phase 0 — Recovery Checkpoint

### Actions

1. Fetch remote metadata without merging and confirm the current branch is not
   behind its base.
2. Record the current commit, branch, `git status`, tracked diff summary, and
   exact untracked-file inventory without printing credential-like files.
3. Create a dedicated recovery branch from the current commit, for example
   `restart/p0-internal-deployment`.
4. Outside the repository, create:
   - a binary-capable patch for tracked modifications;
   - an archive containing only the intended untracked Slice 3A.2/3A.3 files;
   - a manifest with file paths, sizes, and SHA-256 hashes.
5. Verify that both the patch and archive can be listed and that their manifest
   matches the current working tree.
6. Preserve unrelated user changes. Do not reset, clean, checkout, or stash the
   whole worktree.

### Gate

The working state can be reconstructed from the recorded base commit plus the
external patch/archive. The recovery material is not stored in the repository
and contains no environment or credential files.

## Phase 1 — Resolve The Known Acceptance Failures

Before editing, classify each failure against the canonical product,
architecture, convention, slice, and handover contracts. Prefer correcting the
implementation when a security or user-visible contract is violated; correct a
test only when the rendered or returned behavior already satisfies the contract.

### Required corrections

1. Reject carriage return and CRLF input consistently in the client submission
   normalizer, route parser, server boundary, and database-facing DTO while
   continuing to preserve meaningful LF and TAB in instruction bodies.
2. Map property-context failures into the exact documented `PublicationResult`
   shape instead of leaking additional internal result fields.
3. On client validation failures, focus the first invalid field and announce the
   associated error without immediately moving focus to the alert. Focus an
   alert for asynchronous, server, or unavailable failures where no invalid
   field is the recovery target.
4. Correct the guest multiline-content test matcher while preserving semantic
   markup and `white-space: pre-wrap` rendering.
5. Add regressions for CR, CRLF, LF/TAB preservation, exact failure shapes,
   validation-versus-network focus routing, and multiline guest output.

### Gate

All focused publication, public reader, create form, guest page, provider, and
canonical routing tests pass, including every new regression.

## Phase 2 — Deterministic Local Application Acceptance

Implementation status: **INDEPENDENTLY ACCEPTED.** Exact
commands, counts, timings, warnings, and boundary scans are recorded in
`PHASE_2_LOCAL_APPLICATION_ACCEPTANCE.md`. A different agent repeated every
executable gate and accepted the corrected evidence and boundary record.

### Runtime

- Node: exactly `22.23.2`
- npm: exactly `10.9.9`
- Install: clean `npm ci --include=optional`

### Required checks

1. Run the recorded Slice 3A.3 focused suite.
2. Run prerequisite property-context, authentication, route-policy, item API,
   public-reader, and provider-isolation suites.
3. Run `npm run test:route-gate`.
4. Run `npm run typecheck`.
5. Run the production build and require a non-empty build ID.
6. Run `git diff --check` and inspect the complete scoped diff.
7. Confirm no unexpected new route, legacy provider dependency, service-role
   import, application self-fetch, generated artifact, or credential file was
   introduced.
8. Record warnings separately from failures. A new warning that affects runtime,
   authorization, or deployment must be resolved before acceptance.

### Gate

Every required check passes under the pinned runtime from the clean install.

## Phase 3 — Mocked Browser Acceptance

Implementation status: **INDEPENDENTLY ACCEPTED.** Separate executor and
validator sessions passed `23/23` scenarios across
`1440x900` and `390x844`, with no external browser request, request failure,
page error, or unexpected console issue. Exact initialization, loopback mock
boundaries, scenario evidence, and the streamed development not-found transport
observation are recorded in `PHASE_3_MOCKED_BROWSER_ACCEPTANCE.md`. No
application source changed.

Follow the repository root `AGENTS.md` before any browser tool use:

1. Run the repository `browser-init` workflow.
2. Read `cdp_port` from `.projstuff` and verify the matching `/json/version`
   endpoint.
3. Start Chrome for Testing with the repository script only if that endpoint is
   unavailable.
4. Start the local application separately.
5. Use only the standalone Playwright MCP connection. Never use the in-app
   browser for this repository.

### Required mocked matrix

- desktop and mobile layouts;
- keyboard-only navigation;
- zero, one, and multiple property states;
- invalid item, title, and body focus behavior;
- duplicate-submit suppression;
- frozen retry resending the exact UUID and normalized body;
- definitive 400 thawing without content loss;
- 401/403 authentication recovery;
- 409 publication conflict recovery;
- 503 unavailable recovery;
- success navigation to the canonical guest URL;
- invalid, draft, unknown, and unavailable guest-page states;
- semantic ordered multiline instruction rendering; and
- no unexpected external requests, console errors, or page errors.

### Gate

The mocked desktop/mobile matrix passes and any browser-discovered correction is
covered by an automated regression.

## Phase 4 — Supabase PostgreSQL 17 Acceptance

Implementation status: **INDEPENDENTLY ACCEPTED.** Exact runtime
installation, configuration, disposable-container proof, safety boundary, and
recovery commands are in `PHASE_4A_CONTAINER_RUNTIME.md`.

### Runtime prerequisite

Restore a supported Docker-compatible runtime. If Docker Desktop is unavailable,
either install/start an approved compatible runtime or use a disposable remote
test Supabase project created solely for acceptance. Do not substitute the local
PostgreSQL 14 compatibility evidence for this gate.

Accepted status: Colima `0.10.3` now provides a user-level Docker `29.5.2`
`linux/arm64` daemon with four CPUs, 8 GiB memory, a 40 GiB data disk, and the
`colima` context. A disposable Alpine container and repository-pinned Supabase
CLI `2.113.0` daemon preflight pass. A different agent repeated the live
runtime, cleanup, CLI, and no-Supabase-resource evidence and independently
accepted Phase 4A. No local Supabase stack or remote project was started,
linked, queried, or mutated during runtime restoration.

Phase 4B executor evidence now replays all six migrations from zero on local
PostgreSQL 17.6, passes all 475 pgTAP assertions and every targeted real-role,
concurrency, rollback, ACL, reader, and Unicode probe, deterministically
generates the canonical database types, and repeats the focused/prerequisite
application tests, route gate, typecheck, and build under the pinned runtime.
It corrected the publication RPC input name and raw-before-trim unsafe-character
validation discovered by the live runtime. A different agent repeated the full
safety, replay, `475/475`, targeted-probe, deterministic-type, application,
typecheck, build, and clean-reset evidence without correction. Exact evidence
is in `PHASE_4B_SUPABASE_RUNTIME_ACCEPTANCE.md`.

### Required checks

1. Prove the test target is disposable and is not the existing data-bearing
   Supabase project.
2. Start/reset the test environment and replay all six ordered restart
   migrations from zero.
3. Run all database pgTAP files, including at least the current 475 assertions.
4. Re-run transaction rollback, identical concurrent retry, request-content
   conflict, membership downgrade, anonymous-reader, draft hiding, useful-
   instruction, least-privilege, and Unicode boundary probes.
5. Generate canonical database types only after the successful replay.
6. Re-run focused application tests, typecheck, and production build against
   the generated types.
7. Record the exact Supabase CLI and PostgreSQL versions used.

### Gate

The six-migration replay, complete pgTAP suite, generated types, application
tests, typecheck, and build all pass against Supabase PostgreSQL 17.

## Phase 5 — Complete The QR-Backed Internal MVP

Implementation status: **ACTIVE.** Phase 4B left the accepted clean local
Supabase stack running for QR implementation and later real-stack acceptance.

### Contract

Use `src/lib/public-item-url.ts` as the only public URL builder. QR generation
must consume that URL rather than construct its own origin or path. The QR must
contain no account, property, internal item, token, or host-session data.

### Required work

1. Connect the publication success state to the smallest useful QR action.
2. Generate a QR for the exact canonical `/item/[publicId]` URL.
3. Provide the minimum internal download or print behavior required to use the
   QR outside the host browser.
4. Add automated coverage for canonical origin selection, public ID encoding,
   invalid configuration, and absence of internal data.
5. Scan the QR with an external client and verify it resolves to the correct
   cookie-free guest page.

### Gate

One published instruction produces one stable canonical URL and a scannable QR
that opens the exact anonymous guest page from an external client.

## Phase 6 — Real-Stack Browser Acceptance

Repeat the root `AGENTS.md` browser initialization, then run the application
against the accepted disposable Supabase stack rather than mocked API responses.

### Required journey

1. Establish a confirmed internal test identity.
2. Sign in through the canonical email path.
3. Resolve or create the first property.
4. Enter item and instruction content.
5. Publish exactly once.
6. Verify retry/idempotency behavior does not duplicate the item or instruction.
7. Generate and externally scan the QR.
8. Load the guest page without host cookies.
9. Verify the displayed content, metadata, canonical URL, and absence of internal
   identifiers or host navigation.
10. Repeat the critical path at desktop and mobile widths and inspect console,
    page-error, and network evidence.

### Gate

The complete real host-to-guest journey passes without mocked application APIs,
remote production calls, unexpected external traffic, or duplicate data.

## Phase 7 — Independent Review And Documentation

Use a reviewer who did not implement the final corrections. The review must
cover:

- tenant derivation and property revalidation;
- exact authenticated and anonymous function grants;
- transaction atomicity, lock ordering, retry identity, and conflicts;
- exact public DTO and nested instruction projection;
- absence of service-role shortcuts and direct anonymous table grants;
- no application HTTP self-fetch or legacy provider dependency;
- validation consistency across client, API, TypeScript boundary, and SQL;
- session-storage recovery and absence of identity/account authority there;
- canonical URL and QR safety;
- secret, generated-artifact, and route-gate hygiene; and
- browser accessibility and recovery behavior.

Resolve every P0 finding and add a regression for every behavioral correction.
Then update `README.md`, `ROADMAP.md`, `HANDOVER.md`,
`SCHEMA_RECONCILIATION.md`, both slice documents, and component handovers so
their statuses, counts, evidence, blockers, and next steps agree.

### Gate

Independent review accepts the slice, all P0 findings are closed, and canonical
documentation describes the tested implementation exactly.

## Phase 8 — Commit And Push

1. Fetch remote metadata again and confirm no unexpected divergence.
2. Inspect the final path-scoped diff and scan for credential or generated
   artifacts.
3. Commit the accepted database half and application/public-projection half as
   adjacent logical commits. Neither database half is deployable independently.
4. Include the final control-document synchronization with the accepted slice.
5. Push normally to the dedicated restart branch. Never force push.
6. Confirm the remote commit IDs and require the local worktree to be clean.

### Gate

The accepted work is recoverable remotely, commit boundaries match the reviewed
contracts, and the worktree is clean.

## Phase 9 — Internal Deployment

Deployment is authorized once the Definition Of Work Completed is satisfied.
Railway/Nixpacks remains the canonical application runtime.

### Preferred fresh-environment path

1. Identify and record the exact internal Railway project, environment, and
   service without recording secret values.
2. Provision or select a fresh isolated Supabase environment.
3. Verify required server and browser-visible environment-variable names and
   origin values against `ENVIRONMENT.md`.
4. Record a pre-deployment configuration snapshot and the previous Railway
   deployment ID, if one exists.
5. Apply the six accepted migrations to the fresh database through a repeatable
   recorded procedure.
6. Deploy the accepted commit to Railway.
7. Confirm the application and database target identifiers correspond to the
   internal environment before exercising the app.

### Existing-data path

Do not use this path merely for convenience. Before applying migrations:

1. complete the accountable data-migration decision;
2. create a backup and prove it can be restored;
3. reconcile every affected live table, function, policy, grant, trigger, and
   migration ledger entry;
4. prove preservation/backfill behavior on a disposable restored copy; and
5. define a maintenance and forward-recovery procedure.

### Deployment smoke matrix

- health and canonical route availability;
- login and logout;
- first-property resolution or creation;
- item/instruction publication;
- exact retry without duplication;
- QR creation and external scan;
- anonymous guest-page load;
- invalid/draft/unknown 404 parity;
- unavailable/retry behavior;
- route-gated prototype surfaces returning their production result;
- no cookies, tokens, internal IDs, or raw database errors in public responses;
- application logs free of unexpected exceptions or sensitive values; and
- CPU, memory, restart count, and response health within the internal baseline.

### Rollback and recovery

- If application smoke fails, redeploy the previously recorded Railway
  deployment or accepted commit.
- Prefer forward database correction. Do not destructively reverse migrations
  against data-bearing environments.
- A fresh disposable internal database may be recreated from the accepted
  migrations and seed fixtures.
- If authorization, tenant isolation, or public-data exposure fails, disable
  access to the deployment immediately and treat recovery as a P0 incident.
- Record the failed check, deployment ID, observed logs, recovery action, and
  final state without secret values.

### Gate

Every smoke check passes on the internal URL, runtime health is stable, no P0
log or security issue exists, and the rollback path has been verified at least
to the point of identifying the exact prior application deployment.

## Phase 10 — Post-Deployment Restart Slices

The successful internal MVP becomes the working baseline. Continue with bounded
slices rather than a single broad cleanup task:

1. Observe the internal journey and correct P0 recovery or usability defects.
2. Decide whether one optional image materially improves the product before
   implementing media.
3. Consolidate canonical consumers and remove/gate legacy surfaces one resource
   at a time.
4. Add the minimum CI required to reproduce the accepted test, typecheck, build,
   database, and route gates on every relevant change.
5. Reconcile deployment documents and exercise backup/restore and operational
   recovery.
6. Address remaining non-blocking dependency, lint, bundle, logging, and
   legacy-suite debt as separately scoped work. This does not include the
   current direct runtime audit findings, which require triage before internal
   deployment and security acceptance.

Media, broad legacy removal, and general hardening do not block the initial
internal MVP unless discovery shows that they affect the core journey, tenant
isolation, public-data safety, recoverability, or deployment stability.

## Stop Conditions

Stop the current phase, preserve evidence, and correct the problem before
continuing if any of the following occurs:

- the working-tree inventory differs unexpectedly from the recovery manifest;
- a command targets the existing data-bearing Supabase project during local
  acceptance;
- a required focused, prerequisite, pgTAP, typecheck, build, or browser check
  fails;
- generated database types disagree with the application contract;
- a public response exposes internal or sensitive data;
- tenant, role, retry, or anonymous-reader behavior is ambiguous;
- the browser CDP endpoint does not match `.projstuff`;
- deployment target or origin configuration is uncertain; or
- smoke testing reveals a P0 security, data, authentication, or availability
  defect.

An unrelated legacy test or non-P0 warning enters the deferred register unless
it blocks this plan's acceptance criteria. Repeated tool or filesystem stalls
must not trigger destructive recovery; retain the recovery archive, record the
last completed gate, and resume from that gate in a fresh session.
