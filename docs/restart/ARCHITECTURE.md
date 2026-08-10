# Architecture

## Shape

FAQBNB remains a Next.js 15 App Router monolith using React 19 and TypeScript. Next.js route handlers provide the API. Supabase provides Auth, Postgres, and Storage. Railway/Nixpacks is the canonical runtime.

Controlled salvage is mandatory unless live-system discovery proves it unsafe. Preserve mature product blocks and rebuild the contracts beneath them.

## Canonical Surfaces

| Concern | Canonical surface |
| --- | --- |
| Host application | `/dashboard2` |
| Public item page | `/item/[publicId]` |
| Guest-safe API | `/api/public/*` |
| Authenticated host API | `/api/user/*` |
| Platform operations API | `/api/system/*` |
| Tenant boundary | `account_id` |
| Public links | `buildPublicItemUrl(publicId)` |
| Database source after reconciliation | ordered, committed Supabase migrations |

Old `/dashboard`, `/user`, host CRUD under `/admin`, `simple-*`, example, and test routes are transition sources only. New behavior must not be added there.

## Reuse Boundaries

Keep and adapt `/dashboard2`, `/item/[publicId]`, `ItemDisplay`, `ItemCreationWorkflow`, `ItemManager`, `InstructionsTable`, `InstructionEditor`, validation utilities, and low-level QR/PDF/i18n utilities. Defer translation jobs, analytics, and advanced printing.

Physical folder reorganization is not a prerequisite. Move code only when a bounded slice benefits from it.

## Data And Trust Model

```text
auth.users -> profile
           -> account membership -> account
                                    -> property
                                       -> item (stable public_id)
                                          -> instruction/content
                                          -> optional media
```

- Account ownership is canonical; legacy `user_id` ownership is treated as migration evidence or `created_by`, not a tenant boundary.
- Protected requests authenticate the user, resolve one account context, verify membership/role, and constrain the query to that account.
- RLS independently denies cross-account access. A service-role client is never used to prove tenant isolation.
- Public handlers resolve only a stable public identifier and return an explicit guest-safe DTO. They never return internal account, user, moderation, or job fields.

## Supabase Client Boundaries

- Browser anon/session client: client components only; no privileged key.
- Server session client: request-bound authenticated operations.
- Service-role client: server-only operations that explicitly require privilege; creation fails fast if configuration is missing.
- Generated database types: produced from a migration-applied database and committed; do not maintain a second handwritten schema contract.

## Canonical Authentication Contract

- The method boundary is independently validated from aggregate live evidence
  and local source tracing; provider-side configuration remains unverified.
- Email/password is the primary P0 identity method; password reset and verified
  email ownership are part of the same contract.
- Existing Google identities receive a compatibility login only after its
  provider configuration, single callback, redirect allowlist, and staging
  behavior pass verification. Do not add new Google registration in P0a.
- Registration and account bootstrap execute in server-only code and are
  idempotent. A successful bootstrap produces one public profile, one account,
  and one owner membership; partial success must be safely retryable.
- Supabase owns session persistence. Client context may display session and
  account state but must not persist a substitute authenticated state or grant
  authority from local storage.
- The canonical session/account transport is a request-bound cookie-backed
  server client validated with `auth.getUser()`, followed by the transactional
  `bootstrap_current_user` RPC. The boundary accepts no bearer token, account
  header, query parameter, request body, role, or client confirmation claim.
  It returns one account context and no account list by default.
- Every successful authentication or confirmed account-completion path resolves
  to `/dashboard2`; unauthenticated confirmation and recovery prompts return to
  `/login` with one clear next action. Duplicate callback families and
  role-based redirects to legacy `/admin` are transition code only.
- Recovery and error responses do not reveal whether an email is registered.
- `AUTH_DISCOVERY.md` owns provider evidence and the compatibility/deferment
  boundary for the Slice 2A rebuild.

## Canonical Property Context

- The exact `/dashboard2` home is isolated from legacy root and dashboard
  providers. Nested transition routes retain a dynamically separated legacy
  shell only until migrated consumer-by-consumer.
- A cookie-backed server resolver establishes the canonical account before
  calling `resolve_current_property`; content inputs never select identity or
  tenancy, and an RPC account mismatch fails closed.
- Multi-property choices are read through the authenticated RLS client only
  after server account derivation. A browser property UUID and the optional
  last-property storage value are hints that require fresh server validation.
- The canonical browser persists no account, role, token, or substitute auth
  context. The exact dashboard consumes only `/api/user/property-context` and
  same-origin cookie logout.

## Vertical Slice Rule

Each account-owned resource ships database migration, RLS, generated types, DTO validation, API behavior, minimal UI, positive membership test, and negative cross-account test together. Infrastructure work must regularly prove the visible host-to-guest path.

## UX Architecture

- One host shell owns navigation and account/property context.
- Context is inferred when only one valid choice exists and persisted when appropriate.
- Creation steps use one shared flow; lists and empty states link back to it rather than creating alternatives.
- Optional and advanced settings are collapsed or deferred.
- Loading, empty, error, retry, back, and success states are part of each slice's acceptance criteria.
