# Authentication Discovery And Initial Decision

Status: **COMPLETE AND INDEPENDENTLY VALIDATED**

Updated: 2026-08-10.

## Decision

The initial canonical host identity path is **email and password**:

1. A new host enters email and password; a display name is optional.
2. The app creates the auth identity, public profile, account, and owner
   membership atomically at the database boundary or leaves a safely recoverable
   pending state.
3. The host confirms the email through the delivered link. Isolated automated
   tests may use test-only confirmed identities; production may not bypass
   ownership confirmation through the service role.
4. The host lands in `/dashboard2`; a single valid account is selected without
   an account-choice screen.

The canonical login screen presents email/password as the one primary action.
It includes a visible **Forgot password?** recovery link. Password reset is a
necessary part of this path, not a later enhancement.

**Google sign-in is a compatibility fallback for existing Google identities,
not a second registration path.** It remains available with subordinate copy
such as “Previously used Google?” until those identities can sign in through a
validated replacement or explicitly migrate. New Google registration is
deferred. Access requests, invitation codes, manual code redemption, and
provider-specific registration branching are also deferred from P0a.

This decision is evidence-based but does not approve the current auth code for
production. Slice 2A must rebuild the chosen contract before the canonical UI
is simplified.

## Why This Is The Lowest-Friction Safe Choice

- Email is the largest live identity provider: 15 of 21 identity rows, compared
  with six Google identity rows.
- The email/password sign-in primitive is already implemented and has fewer
  external configuration dependencies than the custom direct-Google flow.
- The checked local Railway variable-name set does not include the Google client
  variables or the canonical app-origin variable used by that flow. Presence in
  a local ignored file does not prove staging or production configuration.
- Open P0 host creation avoids the existing request, approval, code delivery,
  manual code entry, provider choice, and second-login sequence.
- Existing Google users are not stranded: compatibility sign-in is retained
  until it is verified and intentionally retired.
- Magic link, passkey, and one-time-password paths are not implemented locally
  and have no live configuration evidence. Selecting one would be speculation.

## Read-Only Remote Evidence

The Supabase MCP SQL tool was used for aggregate `SELECT` queries only. No
individual row, email, UUID, raw metadata, token, URL, log, policy, setting, or
identity value was requested or recorded. No remote mutation or configuration
change occurred.

### Identity and lifecycle aggregates

| Metric | Aggregate evidence |
| --- | --- |
| Auth users | 21 |
| Identity rows by provider | 15 email; 6 Google |
| Identities per auth user | 19 users have one; one has multiple; one has none |
| Auth confirmation state | 17 confirmed; 4 unconfirmed |
| Anonymous users | 0 anonymous; 21 non-anonymous |
| Invitation marker | 0 invited; 21 not invited |
| Last sign-in | 6 never; 10 between 91 and 365 days; 5 over 365 days |
| Creation | 11 between 91 and 365 days; 10 over 365 days |

No auth user has a last sign-in in the last 90 days. This proves that historical
users exist; it does not prove that any current deployment or provider callback
still works.

Identity-row provider/confirmation/activity aggregates were also checked:

| Provider state | Count |
| --- | ---: |
| Email, confirmed, last sign-in 91–365 days | 6 |
| Email, confirmed, never signed in | 1 |
| Email, confirmed, last sign-in over 365 days | 4 |
| Email, unconfirmed, never signed in | 4 |
| Google, confirmed, last sign-in 91–365 days | 4 |
| Google, confirmed, never signed in | 1 |
| Google, confirmed, last sign-in over 365 days | 1 |

### Bootstrap coverage aggregates

Aggregate joins between auth identities and the public profile, membership, and
account-owner tables found:

| Provider shape | Profile + owner-role membership on an owned account | No profile, membership, or owned account |
| --- | ---: | ---: |
| Email only | 5 | 9 |
| Google only | 4 | 1 |
| Multiple identities | 1 | 0 |
| No identity row | 1 | 0 |

All 11 public profiles have an owner-role membership on an account owned by the
same auth user in this aggregate view. Ten auth users have no profile,
membership, or owned account. This is preservation evidence, not permission to
backfill or delete: Slice 2A must distinguish incomplete registration,
abandoned identities, and intentional state without exposing or mutating
individual records.

## Local Flow Map

### Email/password login

`/login` renders `LoginForm`, which calls `AuthContext.signIn`, then
`signInWithEmail` and Supabase `signInWithPassword`. That helper also reads the
application profile, memberships, and accounts. Login-page and middleware
redirect rules disagree: some paths send owner/admin roles to legacy `/admin`,
while others send every authenticated user to canonical `/dashboard2`.

### Email/password registration

`/register` currently requires an access code in its visible flow, then offers a
Gmail-dependent provider selector or email/password form. The registration API
also accepts requests with no access code, but uses the service-role admin API to
create an already-confirmed auth user, then separately creates the profile,
default account, and owner membership. Failures can leave partial identities;
account or membership failure is explicitly treated as non-fatal. The admin API
does not return a user session, so the client makes a second password sign-in
request; it normally redirects to `/dashboard2`, but falls back to the login
page when that second request fails. A separate legacy success page also exists.

### Google paths

There are two overlapping callback systems:

- `/api/auth/google` and `/api/auth/google/callback` implement a custom direct
  Google authorization-code exchange and Supabase `signInWithIdToken`.
- `/auth/oauth/callback` implements a separate Supabase PKCE callback path.

The custom callback branches again between login and access-code registration.
Registration separately creates a profile, account, membership, and consumes a
code. `/register/complete` exists to repair an authenticated Google identity
that has no public profile. This is too many states for the primary P0 path.

### Session, middleware, and account context

Middleware protects `/dashboard2` but also legacy `/admin`, `/user`, and
`/dashboard`. It performs session, language, profile, and system-admin checks and
redirects missing-profile identities to `/register/complete`. `AuthContext` is a
large client state machine that duplicates Supabase session persistence,
persists redacted session placeholders and account data in local storage, and
contains a hard-coded emergency account recovery object. Account selection is
then re-derived by several service-role-backed helpers.

The canonical replacement must let Supabase own session persistence, derive the
current user server-side, resolve memberships server-side, and treat client
storage only as an optional preference hint.

### Access request and redemption

`/request-access` asks for email, full name, an ambiguous account/property
identifier, and optional message. The public API searches account names and has
a status lookup by email or request ID. The page links to `/redeem-access`, but
no page exists at that route. Registration has separate access-code validation,
OAuth completion, and redemption handlers with incompatible-looking paths.

This flow is not required for a new host to create a first account. It remains
deferred until invitations are deliberately designed with opaque, single-use
tokens and non-enumerating public responses.

## Security, Reliability, And UX Risks To Remove In Slice 2A

1. **Privileged registration from shared code.** `src/lib/auth.ts` exports a
   service-role client that falls back to the browser anon client and is imported
   by client code. Privileged operations need a server-only module that fails
   closed when its secret is unavailable.
2. **Non-atomic bootstrap.** Auth identity, profile, account, and membership are
   created in separate operations with partial failure accepted. Bootstrap must
   be idempotent and transactionally safe at the database boundary.
3. **Auto-confirmed passwords and missing recovery.** Current registration forces
   email confirmation true, while no password-reset UI or handler exists. The
   chosen path requires validated confirmation and reset behavior.
4. **Sensitive diagnostic logging.** Auth code logs emails, user IDs, request
   URLs/search parameters, callback data, account IDs, access-code fragments,
   service-key prefixes, and raw database results. Canonical auth must use
   minimal structured events with no identity or secret-bearing payloads.
5. **Duplicate callbacks and redirects.** Two callback families and conflicting
   `/admin` versus `/dashboard2` redirects create loops and orphan states. One
   callback contract and one post-auth destination are required.
6. **Client-authoritative-looking state.** Local storage holds account context
   and a restorable authenticated state, while a hard-coded emergency account
   exists. Neither may grant or imply authorization.
7. **Enumeration and broken recovery paths.** Public access-request lookup can be
   filtered by email or request ID, account names are searched publicly, and the
   advertised redemption page is missing. Keep this surface out of P0a.
8. **No focused auth tests.** The repository has no focused canonical login,
   registration, recovery, callback, or bootstrap test suite.

## Canonical Slice 2A Contract

Slice 2A should implement and independently validate this order:

1. Server-only auth/session helpers and an idempotent account bootstrap backed
   by migrations and real RLS tests.
2. Email/password registration with the selected confirmation policy, exactly
   one account owner membership, and a direct post-confirmation path to
   `/dashboard2`.
3. Email/password login with a single canonical redirect.
4. Password-request and password-update pages with non-enumerating responses,
   one-time recovery links, and a return to login/dashboard.
5. Existing-Google-user compatibility login behind subordinate UI, only after
   its provider, redirect allowlist, secrets, callback, and staging behavior are
   verified. It must fail closed for an unknown Google identity and must not
   create a new auth identity, profile, account, or registration branch.
6. Removal/gating of duplicate callbacks and registration branches only after
   compatibility usage and tests prove they are no longer needed.

Acceptance must cover confirmed and unconfirmed email identities, wrong
password, unknown email without enumeration, expired recovery link, bootstrap
retry, a Google compatibility identity, an unknown Google identity denied
without enrollment, an existing identity missing a public profile,
single-account automatic selection, and cross-account denial using real
authenticated identities without service role.

## Provider And Deployment Facts Still Unavailable

The available read-only SQL tool does not expose Supabase Auth dashboard
configuration or Google Cloud configuration. The following remain unverified:

- whether email/password signup is enabled in each target environment;
- email confirmation policy, SMTP/deliverability, templates, rate limits, and
  recovery redirect allowlist;
- whether the Supabase Google provider is currently enabled;
- deployed Google client identifiers/secrets, consent-screen status, exact
  authorized origins/callbacks, and secret rotation completion;
- actual Railway variable presence and callback reachability;
- whether current users still control the relevant email or Google accounts.

Email ownership confirmation is required for production, and staging acceptance
must deliver both a real confirmation email and a real recovery email. Local
isolated tests may use pre-confirmed fixtures. If delivery cannot be made
reliable, stop before launch and choose an explicitly tested alternative rather
than silently auto-confirming through the service role or adding another
unverified button.

Google compatibility must not be declared operational until the provider-side
facts above are checked outside repository artifacts. This does not reopen the
initial primary-method decision.

## Safety Record

- Remote operations: aggregate `SELECT` queries only.
- Remote mutations: none.
- Auth/database/project configuration changes: none.
- Identity values or individual rows collected: none.
- Application-code changes in this slice: none.

## Independent Validation

An independent validator re-ran aggregate-only `SELECT` queries and reproduced
the recorded auth-user total, identity-provider totals, confirmation,
anonymous/invitation, identity-multiplicity, coarse activity, and creation
buckets. A strengthened aggregate bootstrap query also reproduced that all 11
public profiles have an owner-role membership on an account owned by the same
auth user, while ten auth users have none of the profile, membership, or owned
account records. No individual row or identity value was returned or recorded,
and no remote mutation occurred.

The validator independently traced the canonical login and registration source,
both callback families, middleware, account bootstrap, and access-request flow.
Corrections accepted into this document clarify that display name is optional,
email registration normally performs a second password sign-in, Google
compatibility must deny unknown identities without enrollment, and the
bootstrap coverage requires both owner role and matching account ownership.

Validation closes the primary-method decision. It does not prove provider-side
configuration, delivery, callback reachability, per-resource ownership, policy
predicates, or backup/restore readiness; those remain explicit Milestone 1 and
Slice 2A acceptance work.
