# 08 Deployment And Configuration

Date: 2026-07-11

## Sources Reviewed

- `.env.example`
- `Dockerfile`
- `nixpacks.toml`
- `railway.json`
- `.railwayignore`
- `DEPLOYMENT.md`
- `RAILWAY_DEPLOY.md`
- `RAILWAY_DEPLOYMENT_CHECKLIST.md`
- `deploy-railway.sh`
- `next.config.mjs`
- `sentry.server.config.ts`
- `sentry.client.config.ts`
- `playwright.config.ts`

## Current Deployment Shape

The repo is configured primarily for Railway/Nixpacks now, with older Vercel/Netlify/Docker docs also present.

Current active config:

- `railway.json`: Nixpacks builder, 1 replica, no sleep, restart on failure.
- `nixpacks.toml`: Node.js 22 and npm, `npm ci`, `npm run build`, `npm start`.
- `Dockerfile`: Node 22 Alpine, installs all dependencies with `npm install`, builds, starts with `npm start`.
- `package.json`: requires Node >=22 and npm >=10.

## Required Runtime Services

| Service | Current Evidence | Required For |
| --- | --- | --- |
| Supabase Auth | Supabase auth packages and auth routes | login/register/session/OAuth |
| Supabase Postgres | schema/types/API queries | all SaaS data |
| Supabase Storage | upload endpoint and media upload utilities | uploaded PDFs/images/videos |
| Google OAuth | `/api/auth/google`, OAuth docs | OAuth registration/login |
| Email delivery | email service/templates/access requests | access approvals/notifications, if enabled |
| Anthropic/OpenAI | translation providers | translation jobs |
| Sentry | Sentry config and Next integration | production monitoring |
| Cron/job trigger | translation process endpoint/docs | background translation processing |
| Railway/Vercel/etc. | deployment docs/config | hosting |

## Environment Variables

`.env.example` currently documents:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_QR_DOMAIN_OVERRIDE`
- `TRANSLATION_PROVIDER`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- translation retry/rate/job cleanup settings
- `TRANSLATION_SERVICE_TOKEN`
- `TRANSLATION_MODE`
- `TRANSLATION_BATCH_SIZE`
- `TRANSLATION_CRON_ENABLED`

Variables used in code/docs but not fully covered or not consistently documented:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `SYSADMIN_EMAILS`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `PORT`
- Railway-provided public domain variables, if used by deployment/domain helpers.

## Configuration Drift

| Area | Finding |
| --- | --- |
| Deployment docs | Older docs still describe the app as the simple QR Item Display System and mention Next.js 14/Node 18 in places. |
| Railway script | `deploy-railway.sh` rewrites `railway.json`, `nixpacks.toml`, `Dockerfile`, `.dockerignore`, `.env.railway`, and `package.json`; its generated configs are stale compared with current files. Do not run it blindly. |
| Docker | Current Dockerfile uses `npm install`, not `npm ci`, and copies the entire repo. It is less reproducible and less lean than the Nixpacks path. |
| Sentry | Next/Sentry config emits deprecation warnings during lint/build. |
| Test routes | Production build includes many `/test/*`, demo, simple-auth, and Sentry example routes. |
| Environment docs | Some deployment docs contain concrete Supabase project URL/anon key values. Anon keys are public by design, but this still anchors docs to one project and increases confusion. |
| Database setup docs | `database/README.md` describes an obsolete simple schema and does not explain current account/property/translation migrations. |

## Security And Operations Risks

- Service-role Supabase key is required by several server routes; it must never be exposed to browser bundles.
- `supabaseAdmin` currently falls back to the browser client if service-role key is absent, which can hide production misconfiguration.
- `SYSADMIN_EMAILS` controls system-admin access in code but is not prominent in `.env.example`.
- Public dev/test routes ship in production build.
- Build and runtime logs include verbose auth/PDF debug output.
- In-memory public API rate limiting will not protect a multi-replica deployment.
- Translation processing endpoint requires a bearer token; cron setup must be verified before enabling.

## Recommended Deployment Target For Restart

Use Railway/Nixpacks as the primary documented target if that is the intended host:

1. Delete or archive stale deployment docs/scripts.
2. Keep `railway.json` and `nixpacks.toml` as canonical.
3. Update `.env.example` to include every required production variable.
4. Replace `deploy-railway.sh` with a non-mutating checklist or remove it.
5. Update database setup docs so a fresh Supabase project can be recreated.
6. Add a production route audit/gate to prevent `/test/*` and `simple-*` routes from shipping.
7. Update Sentry config for current `@sentry/nextjs`.

## Suggested Production Checklist

Before next real deployment:

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`
4. Apply complete database migrations to target Supabase project.
5. Verify required env vars in Railway.
6. Run a P0 smoke test against the deployment.
7. Confirm `/item/[publicId]` QR URL opens without login.
8. Confirm protected host routes redirect/login correctly.
9. Confirm cross-account access is denied.
10. Confirm test/demo routes are unavailable or intentionally gated.
