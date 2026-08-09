# Production Route Gate

Status: complete and independently validated, 2026-08-10.

## Outcome

Production requests to prototype, test, demo, and diagnostic routes receive a direct `404` before any Supabase or session work runs. The source remains available in development for focused component and workflow testing. This gives production users one intentional product path without destroying useful prototype evidence.

The centralized policy is `src/lib/routing/production-route-policy.ts`. `src/middleware.ts` applies it before authentication and contains the statically analyzable Next.js matchers required for the middleware to run on those routes.

## Gated Surface

| Production route | Coverage | Development behavior |
| --- | --- | --- |
| `/test/**` | All 35 active App Router test pages, including `/test` | Available |
| `/test-file-upload` | Exact page | Available |
| `/simple-admin` | Exact duplicate admin page | Available |
| `/simple-login` | Exact duplicate login page | Available |
| `/qr-demo` | Exact demo page | Available |
| `/sentry-example-page` | Exact diagnostic page | Available |
| `/version` | Exact support/diagnostic page | Available |
| `/api/simple-auth/**` | All current and future nested simple-auth handlers | Available |
| `/api/sentry-example-api` | Exact diagnostic handler | Available |
| `/api/version` | Exact support/diagnostic handler | Available |

The gate deliberately does not cover `/`, `/login`, `/dashboard2/**`, `/item/[publicId]`, `/api/public/**`, `/api/user/**`, or the reserved `/api/system/**` namespace. Legacy dashboard/admin/user consolidation remains Milestone 5 work; this slice does not change those behaviors.

## Regression Guard

`npm run test:route-gate` runs `src/lib/routing/__tests__/production-route-policy.test.ts`, which verifies that:

- every declared exact route and prefix is blocked in production;
- the same prototype sources remain available in development and test;
- canonical and boundary-similar routes are not blocked;
- every active App Router page or handler whose path identifies it as test, demo, example, or a simple login/admin duplicate is covered;
- each central policy entry also has the static middleware matcher Next.js needs to invoke the gate.

When a new development-only route is added under an existing prefix, prefix coverage applies automatically. A newly named test/demo/example/simple duplicate outside those prefixes makes the focused test fail until it is explicitly classified.

## Verification Evidence

All code checks used Node `22.23.2`; the production build and server used npm `10.9.9`.

| Check | Result |
| --- | --- |
| `npm run test:route-gate` | Passed: 1 file, 5 tests |
| TypeScript `tsc --noEmit` | Passed with no diagnostics |
| `npm run build` | Passed under the pinned toolchain |
| Production HTTP smoke on `/test`, nested `/test`, `/test-file-upload`, `/simple-admin`, `/simple-login`, `/qr-demo`, `/sentry-example-page`, `/version`, `/api/simple-auth/me`, `/api/sentry-example-api`, and `/api/version` | Every request returned `404` |
| Canonical HTTP smoke | `/` and `/login` returned `200`; anonymous `/dashboard2` retained its login redirect; `/item/route-gate-smoke` remained reachable; canonical APIs retained their own `401`/`404` behavior |
| `git diff --check` | Passed |

`/api/system` has no handler in the current tree and therefore returned its pre-existing application `404`; the unit policy proves that the namespace is not route-gated. This slice does not create the future system API.

## Independent Validation

Result: **PASS**. A separate validator reviewed the policy, middleware placement and matcher coverage, active route inventory, focused tests, pinned production build, runtime HTTP evidence, canonical exclusions, documentation, and diff scope. Validation added the previously audited support/diagnostic pair `/version` and `/api/version` to the gate and strengthened the route-inventory test so those exact paths cannot silently reappear.

The validator also observed Next.js trailing-slash normalization: requests such as `/version/` and `/api/version/` receive a framework `308` to the canonical path, which then receives the policy `404`. This is a low-risk framework behavior rather than a route-gate bypass because following the redirect cannot reach the support/diagnostic handler.

## Operational Notes

- The response is intentionally an empty `404` with `Cache-Control: no-store`; it does not advertise that a prototype route exists.
- The gate is a production access boundary, not an authorization boundary for canonical data APIs.
- Prototype pages still appear in Next's build route listing because their source is preserved. Runtime middleware makes them unavailable in production, while the focused test prevents an uncovered development-only route from silently entering the accessible surface.
- The focused Vitest run passes but reports the repository's existing `test.poolOptions` Vitest 4 deprecation; test-runner configuration cleanup remains separate maintenance work.
