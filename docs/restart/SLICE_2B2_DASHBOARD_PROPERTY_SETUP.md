# Slice 2B.2 Dashboard Property Setup

Status: **INDEPENDENTLY VALIDATED LOCALLY — LIVE/MOCKED BROWSER ACCEPTANCE PENDING**

Updated: 2026-08-10.

## Outcome

The exact `/dashboard2` home is now a compact provider-free property setup
shell. It has one path through loading, authentication recovery, retry, first
property creation, explicit multi-property selection, and the first-item CTA.
It no longer initializes the legacy `AuthContext`, `PropertyContext`, account
local-storage machinery, navigation, statistics, settings, or translation
controls.
Nested `/dashboard2/*` transition routes retain the dynamically separated
legacy shell until their own canonical slices.

The root layout's shared `NextIntlClientProvider` still wraps every route; this
slice does not consume it or any translation control, and it is not identity or
tenant authority. “Provider-free” here means the legacy application provider
stack plus the dashboard `AuthContext`/`PropertyContext` shell are absent.

This local application slice made no remote Supabase, email, provider, or
browser call. It does not grant runtime acceptance to the Slice 2A.1/2B.1
database migrations.

## Server Contract

`src/lib/property-context.ts` first resolves the cookie identity/account through
the Slice 2A.2 `resolveCurrentUserContext` boundary. It then calls only
`resolve_current_property`, passing nullable property content plus the fixed
`other` type; it never accepts user, account, role, or confirmation authority.
Exactly one strict RPC row is required and its account ID must match the
canonical account context. Empty, multiple, malformed, inconsistent,
error-bearing, and account-mismatched output fails closed.

`GET /api/user/property-context` supplies no request input. Zero and one states
return only the minimal property state. A multiple-property state queries the
authenticated RLS client only after server account derivation and returns a
sorted `{id,name}` choice list whose row count must match the RPC count.

`POST /api/user/property-context` requires exact same-origin JSON bounded to 16
KiB and accepts one strict discriminated action:

- `create` accepts only a normalized property name; address is null and type is
  `other`, while identity and tenancy remain database-derived;
- `select` accepts a property UUID only as a hint, re-resolves cookie/account
  context, and requires an account-scoped RLS-visible property before returning
  `ready`.

Responses are `no-store`, use stable sanitized 400/401/403/404/503 contracts,
and expose no account list, account ID, identity, email, role, address, token,
type metadata, or upstream error detail.

## Logout Boundary

`POST /api/auth/logout` is now the only logout method. It requires exact empty
JSON, is same-origin and cookie-backed, uses local-scope provider sign-out plus
deterministic targeted cookie removal, has no browser Supabase import, logs no
auth detail, and has no GET mutation. If cleanup cannot be confirmed it fails
closed with a safe 503 and `Clear-Site-Data: "cookies"` fallback.

## UX Contract

- `needs_property`: one required **Property name** field and one **Create
  property** action; no address, type, or account choice.
- `ready`: current property name, one **Add your first item** link to
  `/dashboard2/create` with only the property UUID as an untrusted query hint,
  and subordinate sign out.
- `selection_required`: only fresh server-returned choices with one **Choose**
  action each; no dead navigation or implicit first-property selection.
- 401/403: one path to sign in/verification. 503: one Retry action.
- Form input survives recoverable failures, duplicate submissions are
  suppressed, alerts receive focus, controls meet touch sizing, and the shell
  remains single-column at a 390 px viewport.

The only persisted value is `faqbnb_last_property_hint`, containing a property
UUID. It is never authority: it is auto-submitted only when present in a fresh
server-validated choice list, and the POST endpoint revalidates it through the
cookie/RLS boundary. Account context, tokens, roles, and identity are not stored.

## Local Evidence

The independent validation run passes 109 focused/prerequisite tests across
seven files under exact Node `22.23.2` and npm `10.9.9`. Coverage includes
zero/one/many RPC states, strict row parsing and account mismatch, RLS
choice/select behavior, cross-account/missing denial, safe errors and response
fields, request origin/type/size/shape, same-tick duplicate create/select/
logout suppression, stored-hint validation, provider isolation, responsive/
accessible states, the exact CTA, and logout cleanup.

Independent review corrected six acceptance defects before the final run:
logout now requires exact empty JSON; duplicate property IDs fail closed in
both server and client choice parsing; a multiple-row selection protocol error
is unavailable rather than falsely not-found; disappearing auto-selection
hints are cleared; initial auth/unavailable alerts receive focus; and a
synchronous mutation lock closes the React state-update window for duplicate
create/select/logout events.

The five route-gate tests, pinned typecheck, production build, 21-byte build ID,
and diff hygiene also pass. Build output reports a 270 kB first load for exact
`/dashboard2` and 611 kB for nested `/dashboard2/create`, consistent with the
separate legacy shell. The build retains the already documented Sentry and
legacy PDF diagnostic warnings. Standalone browser acceptance remains pending.
Browser work must follow `AGENTS.md` and use `.projstuff` plus standalone
Playwright, never the in-app browser.

## Remaining Gates

1. Docker-backed Supabase 17 replay plus the 44 Slice 2A.1 and 77 Slice 2B.1
   pgTAP assertions remain blocked; helper/API tests use injected clients only.
2. Standalone browser acceptance with local mocked API states and live
   authenticated-cookie staging convergence are pending.
3. `/dashboard2/create` remains a nested legacy-provider consumer and treats
   the query UUID only as a future hint until Slice 2C validates it server-side.
