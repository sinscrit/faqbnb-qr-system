# Phase 3 Mocked Browser Acceptance

Status: **INDEPENDENTLY ACCEPTED**

Updated: 2026-08-10.

## Scope

This record covers Phase 3 of
`RECOVERY_AND_INTERNAL_DEPLOYMENT_PLAN.md`: mocked browser acceptance for the
Slice 3A.3 publication-to-guest candidate. It does not claim Supabase
PostgreSQL 17 replay, pgTAP, generated types, a real authenticated cookie, QR
generation, real-stack browser acceptance, or deployment.

No application source changed. No remote Supabase, identity, provider,
observability, email, Railway, or deployment service was called or mutated.

## Browser Initialization And Runtime

The root `AGENTS.md` procedure was completed before the first Playwright page
operation:

- `.projstuff` supplied CDP port `9340`; the repository-local
  `.codex/config.toml` also points standalone Playwright at `9340`.
- The initial `http://localhost:9340/json/version` probe failed, so the required
  repository launcher was run with the recorded port and `--keep-session`.
- The repeated endpoint probe succeeded with Chrome for Testing
  `151.0.7922.71`, protocol `1.3`, and a debugger WebSocket on port `9340`.
- A standalone `mcp__playwright__browser_tabs` call then proved the Playwright
  connection. The in-app browser was never used.
- No callable repository executable named `browser-init` was present; the
  exact initialization operations required by root `AGENTS.md` were therefore
  performed directly and in order.

The application ran separately on `http://localhost:3000` under the exact
temporary Node `22.23.2` and npm `10.9.9` runtime. The listener executable was
verified at the temporary pinned Node path. Next.js reported version `15.5.9`.
Shell environment overrides pointed both the trusted application origin and
Supabase URL to loopback, supplied a non-secret mock anon value, and cleared
observability and deferred provider configuration for the run.

The owned Next and fake PostgREST processes were stopped after verification.
Chrome was intentionally left under the launcher's `--keep-session` policy.

## Mock Boundary

Playwright intercepted only the browser's canonical client API requests:

- `/api/user/property-context`
- `/api/user/items`

Guest pages were not replaced with static HTML and no production-only mock hook
was added. A loopback-only fake PostgREST server at `127.0.0.1:54329` accepted
the real anonymous Supabase client's `read_public_item` RPC request and returned:

| Public ID suffix | Mock projection | Expected application state |
| --- | --- | --- |
| `...0001` | One strict item with two ordered instructions | Published guest page |
| `...0002` | Zero rows | Draft/not-found |
| `...0003` | Zero rows | Unknown/not-found |
| `...0004` | Sanitized upstream `503` | Retryable unavailable page |

This exercised the real server component, cookie-free anonymous client,
request-cached loader, strict public DTO validation, metadata, `notFound()`, and
unavailable rendering without an operational service call.

## Final Clean Matrix

A fresh browser tab with no exploratory routes, listeners, or console history
passed `23/23` scenarios. Nineteen ran at `1440x900`; four ran at `390x844`.

| # | Viewport | Scenario | Result |
| ---: | --- | --- | --- |
| 1 | `1440x900` | One-property create layout, exactly three fields, preview, no overflow | Pass |
| 2 | `390x844` | One-property mobile create layout and publish action, no overflow | Pass |
| 3 | `390x844` | Zero-property safe state with no content fields | Pass |
| 4 | `1440x900` | Multiple properties: keyboard-only selection, fresh revalidation, field entry, and publish | Pass |
| 5 | `1440x900` | Invalid item focuses the item field without alert focus theft | Pass |
| 6 | `1440x900` | Invalid title focuses the title field without alert focus theft | Pass |
| 7 | `1440x900` | Invalid body focuses the body field without alert focus theft | Pass |
| 8 | `1440x900` | Two same-tick submits while the first request is held produce one request | Pass |
| 9 | `1440x900` | `503` freeze and retry resend exact normalized request bytes | Pass |
| 10 | `1440x900` | Definitive `400` thaws, preserves content, and clears the snapshot | Pass |
| 11 | `1440x900` | Publication `401` exposes focused auth recovery | Pass |
| 12 | `1440x900` | Publication `403` exposes focused auth recovery | Pass |
| 13 | `1440x900` | Publication `409` freezes; discard preserves content and mints a UUID | Pass |
| 14 | `1440x900` | Property-context `401` exposes focused auth recovery | Pass |
| 15 | `1440x900` | Property-context `403` exposes focused auth recovery | Pass |
| 16 | `1440x900` | Property-context `503` focuses Retry and recovers on one retry | Pass |
| 17 | `1440x900` | Success exposes only the canonical `/item/[publicId]` link | Pass |
| 18 | `1440x900` | Guest desktop: cookie-free strict content, canonical metadata, semantic order and multiline preservation | Pass |
| 19 | `390x844` | Guest mobile layout and complete ordered content, no overflow | Pass |
| 20 | `1440x900` | Invalid guest ID uses the shared not-found title, copy, and `noindex` | Pass |
| 21 | `1440x900` | Draft guest ID is indistinguishable from invalid/unknown | Pass |
| 22 | `1440x900` | Unknown guest ID is indistinguishable from invalid/draft | Pass |
| 23 | `390x844` | Unavailable guest page has sanitized same-path Retry and no overflow | Pass |

The exact retry comparison covered the full serialized request body, including
the frozen request UUID and normalized item/title/body. LF and TAB bytes were
retained. The held-request duplicate test avoided a false result caused by
allowing an intercepted request to complete before attempting a second submit.

## Browser Diagnostics

The final run observed 269 browser requests:

- zero non-loopback/external requests;
- zero Playwright `requestfailed` events;
- zero page errors; and
- zero unexpected console warnings or errors.

Chromium emitted nine expected `Failed to load resource` console entries for
the deliberately intercepted `400`, `401`, `403`, `409`, and `503` responses.
Every console issue matched that closed allowlist; no other warning or error
occurred.

The invalid, draft, and unknown pages were identical and contained `noindex`.
Their streamed Next.js development document responses reported HTTP `200` even
though the route called `notFound()`. This is recorded as framework transport
behavior, not used as evidence of a transport-level `404`; the production
deployment smoke phase must record that status separately.

## Independent Validation

A different agent repeated the complete matrix in a fresh browser session and
independently accepted Phase 3. Its accepted scenario groups passed `23/23` and
observed 439 browser requests, zero external requests, zero page errors, and
only the expected failed-resource diagnostics from deliberately mocked failure
responses. The validator also proved that guest RPC requests were cookie-free
and used only the loopback anonymous PostgREST target.

The validator repeated the two focused component files at `14/14`; pinned
typecheck and diff hygiene passed. It observed duplicate development
`meta[name="robots"]` `noindex` tags on the not-found surface. Because both tags
have the same safe directive and no conflicting indexing policy, this is
non-blocking for mocked acceptance. Production status and metadata smoke must
still record the final transport status and head output.

## Acceptance Boundary And Next Gate

Phase 3 is independently accepted with no browser-discovered product defect
and no application-source correction. Phase 4 is now the active gate: restore
a disposable Supabase PostgreSQL 17 runtime, replay all six migrations, execute
the complete 474-assertion pgTAP candidate, generate canonical types, and repeat
the required application checks. The existing data-bearing project remains out
of scope.
