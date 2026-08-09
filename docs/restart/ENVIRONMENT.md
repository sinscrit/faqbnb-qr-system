# Environment Contract

This is the restart's environment classification. It documents names and boundaries, never values.

## Runtime

- Canonical runtime family: Node.js 22 and npm 10, matching Nixpacks and the package engine floor.
- Milestone 0.3 must record the exact tested Node and npm versions and provide a repository pin before reproducibility is accepted.
- Canonical install/build/start: `npm ci`, `npm run build`, `npm start`.
- Railway/Nixpacks is primary. Docker and older hosting instructions are non-canonical until reconciled.

## P0 Variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-visible | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-visible | RLS-constrained anon/session access |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, privileged | Explicit service operations; never imported by client code |
| `NEXT_PUBLIC_APP_URL` | Browser-visible | Canonical deployed origin for auth redirects and public URLs |
| `NEXT_PUBLIC_QR_DOMAIN_OVERRIDE` | Browser-visible, optional | Temporary explicit QR origin; converge on the canonical URL builder |
| `SYSADMIN_EMAILS` | Server-only | Transitional system-admin allow-list; must not define tenant roles |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser-visible, optional | Client/server error reporting endpoint |
| `SENTRY_ORG`, `SENTRY_PROJECT` | Build/server-only | Sentry build integration |
| `PORT` | Server runtime | Runtime listener, commonly supplied by Railway |

Only variables prefixed `NEXT_PUBLIC_` may be intentionally bundled for the browser. Public does not mean trusted: authorization must never depend on their secrecy.

## Deferred/P1 Variables

`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, translation provider/tuning variables, and `TRANSLATION_SERVICE_TOKEN` are server-only and are not required for the P0 core path. Disable translation jobs until their configuration and bearer-token boundary are verified.

Legacy `NEXTAUTH_SECRET` and `NEXTAUTH_URL` references require discovery. Do not add them to P0 merely because old documentation mentions them; first confirm that canonical Supabase Auth code needs them.

## Secret Rules

- Real secrets, cookies, auth URLs, service tokens, and local session artifacts are never committed.
- Example files contain obvious non-working placeholders only.
- Service-role client creation fails fast when a route genuinely needs it; no fallback to the anon client.
- Logs must not include credentials, fragments/prefixes, cookies, bearer tokens, user emails, or sensitive third-party responses.
- Rotate a potentially exposed live credential before repository cleanup. History rewriting is a separate, explicitly approved operation.

## Environment Acceptance

Milestone 0/1 must produce:

- a safe `.env.example` containing all required P0 names;
- startup validation divided by browser, server-session, and privileged needs;
- exact local/CI/Railway runtime versions;
- a clean install and production build without relying on an existing `node_modules`;
- a Railway variable checklist containing names and classifications only.
