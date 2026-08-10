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
