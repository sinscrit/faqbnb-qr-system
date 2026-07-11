# 07 Health Check

Date: 2026-07-11

## Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `npm ci` | Pass | Installed 946 packages. npm audit reports 27 vulnerabilities: 1 low, 14 moderate, 10 high, 2 critical. |
| `npm run typecheck` | Pass | `tsc --noEmit` completed successfully. |
| `npm run lint` | Fail | Uses deprecated `next lint`; many warnings and several errors. |
| `npm test -- --run` | Fail | 90 failed files, 115 passed files, 1,855 failed tests, 3,142 passed tests, 5 unhandled errors; one worker exited after out-of-memory. |
| `npm run build` | Pass | Next.js production build compiled successfully in about 2.2 minutes and generated route output. |

## Environment Used

- Node: `v25.2.1`
- npm: `11.6.2`
- Package engines expect Node `>=22.0.0`, npm `>=10.0.0`.
- `node_modules` was missing before audit checks and was installed with `npm ci`.
- Build detected `.env.local` in this local working copy. Values were not inspected or documented.

## Typecheck

`npm run typecheck` passed. This is a strong positive signal: despite route/code drift, the TypeScript compiler currently accepts the app.

## Lint

`npm run lint` failed.

Important findings:

- `next lint` is deprecated and will be removed in Next.js 16.
- Sentry config emits deprecation warnings:
  - `disableLogger`
  - `automaticVercelMonitors`
  - `reactComponentAnnotation`
- Lint output includes many unused variables, `any` warnings, hook dependency warnings, `require()` imports, image warnings, and production/debug leftovers.
- Actual lint errors observed include:
  - `react/no-unescaped-entities` in older `/dashboard/items/*` pages.
  - `react/display-name` in an ItemCapture media editor test.
  - `prefer-const` in `useMediaEditor.ts`.
  - `@typescript-eslint/no-empty-object-type` in ItemCreationWorkflow a11y test helpers.

Interpretation: lint is not a reliable gate yet. The codebase needs either targeted cleanup or an explicit lint migration/scope reset.

## Tests

`npm test -- --run` failed heavily.

Aggregate:

- Test files: 90 failed, 115 passed, 206 total.
- Tests: 1,855 failed, 3,142 passed, 5,002 total.
- Unhandled errors: 5.
- Runtime ended with a Vitest worker out-of-memory failure.

Failure categories observed:

| Category | Evidence | Interpretation |
| --- | --- | --- |
| Missing test env variables | Supabase client throws because URL/API key are required. | Tests need safe mock env or module-level client creation must be deferred. |
| Stale Vitest config | Vitest 4 reports `test.poolOptions` was removed. | Config requires Vitest 4 migration. |
| Invalid test files | `retry-logic.unit.test.ts` and `useItemSelection.test.ts` have malformed block comments causing esbuild transform errors. | Some generated tests are syntactically invalid. |
| PostCSS/Vite mismatch | ReactCrop CSS import fails with `Invalid PostCSS Plugin found at plugins[0]`. | Vitest/Vite cannot consume current Tailwind 4 PostCSS config as-is. |
| Incorrect `next/dynamic` mock | Some MediaEditorStep tests mock `next/dynamic` incorrectly for Vitest. | Shared test setup or per-test mocks need repair. |
| Browser API gaps in jsdom | Canvas and media APIs are missing for crop/thumbnail/video tests. | These tests need mocks, `canvas`, or Playwright/component tests. |
| Component API/test drift | Many component suites fail wholesale. | Tests likely target older component text/structure or lack i18n/providers. |
| Performance/flaky threshold | ItemDisplay toggle timing expected `<100ms`, measured about `138ms`. | Timing test is brittle or performance regressed. |
| Memory pressure | Full run reached about 4GB heap and worker OOM. | Test suite must be sharded/scoped before it can be a normal CI gate. |

Interpretation: many useful tests exist, but the full suite is not currently a trustworthy completion signal. Treat passing focused tests as meaningful; treat full-suite failure as expected until test infrastructure is repaired.

## Build

`npm run build` passed.

Important build observations:

- Build skips linting via `next.config.mjs`.
- Type validity check passes during build.
- Sentry deprecation warnings appear.
- Next.js warns that `sentry.client.config.ts` should be renamed or moved to `instrumentation-client.ts` for Turbopack compatibility.
- Webpack cache emits warnings around `next-intl` dynamic import parsing.
- Build logs include verbose PDFKit font debug output from `/api/admin/generate-pdf`.
- Production route output confirms many dev/test/prototype routes are included in the build, including `/test/*`, `/simple-admin`, `/simple-login`, `/qr-demo`, and `/sentry-example-page`.

## Bundle/Route Size Signals

Notable first-load sizes from build output:

- `/dashboard2/create`: about 610 kB first-load JS.
- `/dashboard2/instructions/[articleId]/edit`: about 616 kB.
- `/dashboard2/items`: about 545 kB.
- `/item/[publicId]`: about 450 kB.
- `/admin/access-requests`: about 604 kB.

These are not necessarily blockers, but the core guest page and creation flow are heavy enough to warrant later bundle review.

## Health Conclusion

Current state is buildable but not clean:

- **Deployable:** likely yes, because production build passes.
- **Maintainable:** partially, but route/API/test drift is significant.
- **CI-ready:** no, because lint and tests fail.
- **LLM-ready for feature work:** only after scoping to a small canonical path and defining focused checks.

## Recommended Health Gates For Restart

Use these gates in order:

1. `npm run typecheck`
2. `npm run build`
3. Focused unit tests for changed feature only.
4. One Playwright P0 smoke test for login/property/item/public QR.
5. Later: repaired lint gate.
6. Later: sharded full test suite.

Do not require the current full Vitest suite to pass before restart work begins; first fix or archive stale tests.
