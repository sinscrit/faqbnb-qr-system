# Environment Contract

This is the restart's environment classification. It documents names and boundaries, never values.

## Runtime

- Canonical local and CI runtime: Node.js `22.23.2` LTS (`Jod`) and npm `10.9.9`.
- `.nvmrc` and `.node-version` carry the exact Node selection. The Node engine accepts `>=22.23.2 <23` for Nixpacks' major-only model while rejecting older patches and other majors.
- `package.json#packageManager` and the npm engine carry the exact npm pin.
- Canonical install/build/start: `npm ci --include=optional`, `npm run build`, `npm start`.
- `package-lock.json` is authoritative. Use npm `10.9.9` to update it through npm commands; never hand-edit it or use `npm install` as the clean-build acceptance command.
- `.npmrc` keeps optional dependencies enabled on every platform. Do not add `@parcel/watcher-darwin-arm64` as a direct dependency; npm selects the lockfile-declared native package on eligible hosts.
- Railway/Nixpacks is primary. Docker and older hosting instructions are non-canonical until reconciled.
- Nixpacks supports only a Node major selector, so `nixpacks.toml` selects Node `22` and explicitly executes npm `10.9.9`. Inspect the resolved Node patch in deployment logs before claiming exact parity; see `BUILD_BASELINE.md`.

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

## Existing-Google-Identity Compatibility

The independently validated auth decision makes these variables optional
compatibility inputs, not core P0 requirements or evidence that Google works.
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are server-only inputs to the
legacy direct-Google flow. They are not part of new-user P0 registration. Keep
them unset for the core P0 path. Enable them server-side only for a deliberate
existing-user compatibility test after the provider console, redirect allowlist,
and secret rotation are prepared; then verify Railway configuration and staging
behavior before exposing the subordinate login. `NEXT_PUBLIC_APP_URL` remains
the canonical callback origin; no callback may derive authority from a
caller-supplied origin.

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
- exact local/CI runtime versions and recorded Railway-resolved runtime evidence;
- a clean install and production build without relying on an existing `node_modules`;
- a Railway variable checklist containing names and classifications only.

The local/CI patch baseline is complete and independently validated. Railway patch parity remains a deployment-evidence requirement because Nixpacks cannot request an exact Node patch.
