# Canonical Auth Components Handover

The components in this folder implement the single-column email journey for
Slice 2A.3. They call cookie-backed same-origin API routes, use the shared
password contract from `src/lib/auth-flow.ts`, disable duplicate submissions,
and navigate only to server-returned canonical destinations.

Do not reconnect these forms to `AuthContext`, local storage, role redirects,
access codes, client Supabase auth, or arbitrary return URLs. Google is a
secondary existing-user compatibility link supplied only by the server page
when all required configuration and the explicit compatibility flag are set.

`AuthPageProviderBoundary.tsx` keeps `/login`, `/register`,
`/forgot-password`, and `/reset-password` outside the legacy AuthContext,
locale, theme, debug, and version-footer stack. Do not remove that isolation or
reintroduce localStorage/session initialization around canonical auth pages.
The legacy provider module is dynamically separated so merely loading a
canonical auth page does not initialize the legacy browser Supabase client.

Slice 2B.2 extends this root provider-free boundary to the exact
`/dashboard2` home. Nested `/dashboard2/*` routes remain legacy and receive a
dynamically separated dashboard shell. Keep exact-path matching: broad prefix
matching would silently remove providers from unmigrated nested consumers.

Slice 3A.3 extends the accepted provider-free set to exact
`/dashboard2/create` and to the `/item/*` guest prefix. Other nested dashboard
routes remain on the legacy transition stack. The expanded Phase 1 focused
matrix passes `105/105`, and separate review independently accepted this
isolation. Phase 2 executor evidence passes the clean install and full
`224/224` prerequisite/provider-isolation union; see
`../../../docs/restart/PHASE_2_LOCAL_APPLICATION_ACCEPTANCE.md`. A separate
validator accepted Phase 2; Phase 3 browser acceptance remains pending.

Standalone Playwright accepted the four canonical pages at desktop and mobile
sizes with intercepted local APIs. Browser evidence moved the recovery link
after the password input in DOM order while CSS preserves its top-right visual
position. Keep the keyboard order logo, email, password, recovery, sign in,
then registration. See `docs/restart/SLICE_2A3_BROWSER_ACCEPTANCE.md`.
