# Slice 2A.3 Standalone Browser Acceptance

Status: **PASS for local responsive UX and mocked browser states** on
2026-08-10. A real authenticated-cookie transition, email delivery, and
provider behavior remain staging gates.

## Test Boundary

- Browser initialization followed the repository `browser-init` workflow.
  `.projstuff` supplied CDP port `9340`; `/json/version` reported Chrome 151
  and protocol 1.3 before any browser tool ran.
- Only standalone Playwright MCP was used. The in-app browser was not used.
- The local app ran under Node `22.23.2` (`Jod`) and npm `10.9.9`.
- Browser tests intercepted `/api/auth/*` with local 200, 202, 401, and 503
  JSON responses. Other local API requests and all non-local HTTP requests were
  blocked. Only `.test` email addresses and synthetic passwords were entered.
  No Supabase, email, Google, or other remote call/mutation was made.

## Responsive And Accessibility Evidence

`/login`, `/register`, `/forgot-password`, and `/reset-password` were rendered
and inspected at `1440x900` and `390x844`.

- Every page had zero horizontal overflow, complete visible controls, one
  submit action, and a single-column recovery path.
- All inputs had explicit labels and appropriate `autocomplete` values. New
  password help text was connected with `aria-describedby`.
- Default configuration showed no Google action, legacy footer, debug/version
  UI, access-code path, or competing primary action.
- Initial page responses returned `Cache-Control: no-store, must-revalidate`.
- Loading labels were visible and submit controls were disabled during delayed
  mocked responses, so duplicate actions produced one request.
- Post-fix keyboard order on login is logo, email, password, recovery, submit,
  then registration. Visual placement still keeps recovery beside the password
  label.
- The recovery and registration links were followed in-browser and converged
  on their one canonical page. Mobile registration fit within the viewport
  without clipped controls or awkward horizontal scrolling.

## Mocked State Evidence

| Journey | Browser result |
| --- | --- |
| Login 401 | Safe inline “Email or password is incorrect” alert; remained on `/login` |
| Login 503 | Recoverable inline unavailable message; remained on `/login` |
| Login 200 with external `next` | Rejected with generic sign-in failure; no external navigation |
| Registration password rule / mismatch | Inline validation; zero API requests |
| Registration 202 | Generic check-email state; exactly one next action to sign in |
| Recovery request 200 | Enumeration-resistant generic success; exactly one next action to sign in |
| Reset password rule / mismatch | Inline validation; zero API requests |
| Reset update 401 | Expired state; exactly one action to request another link |

A mocked successful login response caused the client to request exactly
`/dashboard2`. Because the mock intentionally creates no Supabase cookie, the
real middleware correctly returned `307` to login. The browser could not prove
the authenticated destination without either forging provider state or making
a real auth call, both outside this no-remote acceptance boundary. Cookie-backed
`/dashboard2` convergence therefore remains a staging acceptance item.

Expected DevTools failed-resource entries appeared only for deliberately
mocked 401/503 responses. Clean canonical page loads produced no auth API,
provider, Supabase, or other external network requests. A malformed local
confirmation URL returned the configured fail-closed response before any
browser API or external request.

## Browser-Driven Corrections

- Login DOM order now reaches the password field before the recovery link while
  retaining the familiar top-right visual link position.
- Forgot-password and reset-password pages now have specific localized document
  titles and descriptions rather than the generic application title.
- The login focus-order regression is covered by the focused component suite.

Screenshots were used only for transient visual inspection and are not tracked.
