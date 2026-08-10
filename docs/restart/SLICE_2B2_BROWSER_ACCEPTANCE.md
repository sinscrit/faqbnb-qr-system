# Slice 2B.2 Dashboard Browser Acceptance

Status: **LOCAL PASS — INDEPENDENT BROWSER VALIDATION PENDING**

Updated: 2026-08-10.

## Boundary

The browser run followed `AGENTS.md`: `.projstuff` supplied CDP port `9340`,
the existing Chrome for Testing `151.0.7922.71` endpoint passed the browser-init
health check, and only the standalone Playwright MCP was used. The application
ran separately on loopback under exact Node `22.23.2` (`Jod`) and npm `10.9.9`.

`/api/user/property-context` and `/api/auth/logout` were intercepted with strict
local fixtures. A catch-all route aborted and recorded every non-loopback
request. No live Supabase, email, identity provider, or other remote request was
allowed or observed. These fixtures prove browser behavior, not live database
or authenticated-cookie staging convergence.

## Integration Correction

The first run found that exact `/dashboard2` still entered the legacy
middleware Supabase session/profile flow. That branch could redirect to
`/login` before the canonical property-context API owned authentication, and it
made isolated local acceptance depend on a remote legacy session.

`canonical-route-policy.ts` now identifies only the exact canonical routes
whose request-bound APIs own authentication. Middleware bypasses its legacy
session/profile/language branch for exact `/dashboard2`, while
`/dashboard2/*` remains on the explicitly transitional legacy path. Eleven
focused policy assertions cover the canonical exact routes and reject trailing,
nested, legacy, and OAuth callback variants.

## Browser Matrix

Desktop (`1440x900`) and mobile (`390x844`) checks passed for:

- zero-property load, one-field creation, success, recoverable creation error,
  input preservation, and same-tick duplicate suppression;
- direct one-property ready state and the single first-item CTA with only the
  property UUID query hint;
- multiple-property choice, explicit selection, same-tick duplicate
  suppression, fresh stored-hint auto-selection, and stale-hint removal without
  a POST;
- 401 and 403 recovery with one sign-in link, 503 retry recovery, and malformed
  success fail-closed behavior;
- exact empty-JSON logout, single-request success navigation, and focused,
  retryable logout failure without leaving the ready state;
- keyboard order for create, choose, ready CTA, and sign out; focused auth,
  unavailable, and mutation alerts; and required/max-length field semantics;
- minimum 44 px interactive height, long-name wrapping, and zero horizontal
  overflow at 390 px;
- absence of legacy navigation, unexpected provider/API initialization, extra
  local-storage keys, and non-loopback requests;
- no unexpected JavaScript console errors or page errors. Chrome emitted its
  expected `Failed to load resource` console entries for the deliberately
  mocked 401, 403, and 503 HTTP responses.

Six desktop/mobile screenshots of the zero, ready, and selection states were
visually inspected. Each retained one compact card and one obvious primary
decision, with readable long-name wrapping and no clipped or dead controls.
The raw diagnostic screenshots were deliberately not added to the repository.

## Local Checks

Under exact Node `22.23.2` and npm `10.9.9`:

- eight focused/prerequisite files passed `120/120` assertions, including the
  11 new canonical route-policy assertions;
- the separate five-assertion production route gate passed;
- `npm run typecheck` passed;
- `npm run build` passed, retaining a `270 kB` first load for exact
  `/dashboard2` and the separately loaded approximately `610 kB` nested create
  route;
- `git diff --check` passed after the final documentation edit.

The successful build retained the already documented Sentry and legacy PDF
diagnostic warnings. Independent browser validation must repeat the corrected
path before this local pass becomes final accepted evidence.
