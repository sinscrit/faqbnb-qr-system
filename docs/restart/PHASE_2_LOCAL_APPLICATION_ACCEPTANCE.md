# Phase 2 Local Application Acceptance

Status: **INDEPENDENTLY ACCEPTED**

Updated: 2026-08-10.

## Scope

This record covers only Phase 2 of
`RECOVERY_AND_INTERNAL_DEPLOYMENT_PLAN.md`: deterministic local application
acceptance for the recovered Slice 3A.3 publication-to-guest candidate. It is
not browser, database-runtime, generated-type, QR, remote-provider, or
deployment evidence.

No application code changed during this phase. No application backend or
operational service—Supabase, identity/translation provider, email, or
Railway—was called or mutated. Temporary Node/npm package resolution, the clean
install, and audit metadata can use the npm package registry read-only; that
registry access is outside the application's runtime and operational-service
boundary.

## Runtime And Clean Install

Every command ran from the repository root through temporary exact
`node@22.23.2` and `npm@10.9.9` packages because the host defaults are newer.
The runtime identity was `v22.23.2`, LTS `Jod`, and npm `10.9.9`.

| Check | Command | Result | Wall time |
| --- | --- | --- | ---: |
| Runtime | `node --version`; `node -p "process.release.lts"`; `npm --version` | `v22.23.2`; `Jod`; `10.9.9` | 1.6s including temporary package resolution |
| Clean install | `npm ci --include=optional` | Passed; 951 packages added, 952 audited | 11.09s |
| Native optional dependency | Load `@parcel/watcher-darwin-arm64/package.json` and verify `watcher.node` | Version `2.5.4`; 326112-byte native binary present | under 1s |

The clean install reconstructed `node_modules` from `package-lock.json`; it did
not change the lockfile or tracked source.

## Application Matrix

The exact historical Slice 3A.3 nine-file matrix was:

```text
src/app/api/user/items/__tests__/route.test.ts
src/app/api/public/items/[publicId]/__tests__/route.test.ts
src/app/dashboard2/__tests__/layout.test.tsx
src/app/dashboard2/create/__tests__/publish-form.test.tsx
src/app/item/[publicId]/__tests__/page.test.tsx
src/components/auth/__tests__/canonical-auth-forms.test.tsx
src/lib/__tests__/item-boundary.test.ts
src/lib/__tests__/public-item-url.test.ts
src/lib/routing/__tests__/canonical-route-policy.test.ts
```

It passed `105/105` tests across nine files in 1.06s of Vitest time and 2.00s
wall time.

The documented prerequisite union then ran the focused matrix together with
the accepted authentication, session, property-context, logout, dashboard,
anonymous-client, item API, public-reader, URL, and provider-isolation suites:

```text
src/lib/__tests__/auth-flow.test.ts
src/lib/__tests__/current-user-context.test.ts
src/app/api/auth/session/__tests__/route.test.ts
src/app/api/auth/__tests__/canonical-email-auth.test.ts
src/app/api/auth/logout/__tests__/route.test.ts
src/components/auth/__tests__/canonical-auth-forms.test.tsx
src/lib/__tests__/property-context.test.ts
src/app/api/user/property-context/__tests__/route.test.ts
src/app/dashboard2/__tests__/property-setup.test.tsx
src/app/dashboard2/__tests__/layout.test.tsx
src/lib/__tests__/item-boundary.test.ts
src/lib/__tests__/supabase-public-server.test.ts
src/app/api/user/items/__tests__/route.test.ts
src/app/api/public/items/[publicId]/__tests__/route.test.ts
src/lib/__tests__/public-item-url.test.ts
src/app/dashboard2/create/__tests__/publish-form.test.tsx
src/app/item/[publicId]/__tests__/page.test.tsx
src/lib/routing/__tests__/canonical-route-policy.test.ts
```

It passed `224/224` tests across 18 files in 1.45s of Vitest time and 2.06s
wall time. The count is evidence for this revision, not a fixed future target.

## Build And Hygiene

| Check | Exact repository command | Result | Wall time |
| --- | --- | --- | ---: |
| Production route gate | `npm run test:route-gate` | Passed `5/5` | 1.35s |
| TypeScript | `npm run typecheck` | Passed without diagnostics | 2.38s |
| Production build | `npm run build` | Passed; Next.js 15.5.9 emitted all expected routes | 28.64s |
| Build identity | `wc -c .next/BUILD_ID` plus a one-line read | Non-empty, 21 bytes | under 1s |
| Current diff hygiene | `git diff --check` | Passed | under 1s |
| Complete candidate diff hygiene | `git diff --check ac3f205..HEAD` | Passed | under 1s |

The complete 42-file, 3045-insertion/1419-deletion candidate diff from the
plan commit `ac3f205` through `HEAD` was enumerated and inspected by path and
boundary. The production build contains exact `/dashboard2/create`,
`/api/user/items`, `/api/public/items/[publicId]`, and `/item/[publicId]`
routes. No additional Phase 2 route or source change was introduced.

Targeted source scans over the canonical production boundary found no:

- service-role key or service-role client;
- server-side application `fetch`/self-fetch;
- legacy Auth/Account/Property provider import on the create or guest pages;
- credential/private-key pattern or credential-like changed filename; or
- tracked `.next`, `node_modules`, coverage, distribution, environment, or key
  artifact.

The provider-isolation, canonical-route-policy, anonymous-client, public-reader,
and exact DTO tests are the executable evidence supporting those scans.

## Unresolved Diagnostic And Security Output

No deterministic Phase 2 command failed. The run recorded these findings,
which predate Slice 3A.3 and are not resolved or waived by a successful build:

- install deprecations for both legacy Supabase auth-helper packages,
  `jpeg-exif`, and `node-domexception`;
- 29 audit findings: 1 low, 11 moderate, 15 high, and 2 critical; no unreviewed
  bulk audit fix was run;
- Vitest 4's existing `test.poolOptions` deprecation;
- Sentry deprecations for three webpack options and the legacy
  `sentry.client.config.ts` location; and
- verbose legacy PDFKit font diagnostics during page-data collection.

The build also reports the configured experimental `clientTraceMetadata` flag.
The audit includes direct runtime-package findings affecting Next.js
middleware/proxy bypass behavior, XSS, SSRF/cache behavior, and denial of
service, plus findings in `next-intl` and Sentry dependencies where applicable.
They did not prevent deterministic Phase 2 reproduction, but they require
scoped dependency and exposure triage before internal deployment and the
independent security-acceptance gate. This record makes no claim that the
findings are unreachable, harmless, accepted, resolved, or waived.

## Acceptance Boundary

Implementation evidence satisfies every Phase 2 action under the pinned clean
install. A different agent repeated every executable gate, inspected the
complete scoped diff and source boundaries, required correction of the evidence
link and audit/external-call wording, and independently accepted Phase 2 after
those corrections. Phase 3 mocked browser acceptance and Phase 4 Supabase
PostgreSQL 17 acceptance remain pending.
