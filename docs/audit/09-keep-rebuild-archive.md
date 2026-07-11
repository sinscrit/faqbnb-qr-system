# 09 Keep, Rebuild, Archive

Date: 2026-07-11

## Decision Summary

Do not restart from a blank repository. The codebase contains valuable working blocks, especially around the guest item page, dashboard2 UI, item creation, instruction management, QR/PDF generation, translations, and Supabase integration.

The restart should be a controlled salvage:

1. Keep the strongest user-facing workflows.
2. Rebuild the foundation that defines trust boundaries: database migrations, auth, tenancy, API namespaces, and route gating.
3. Archive prototype routes, duplicate shells, stale scripts, and obsolete documentation.
4. Add a small set of reliable gates so LLM-driven implementation can proceed in narrow, verifiable increments.

## Keep

These areas appear worth preserving and using as the basis for the restarted implementation.

| Area | Keep Because | Restart Notes |
| --- | --- | --- |
| `/item/[publicId]` | Canonical public guest route exists and is buildable. | Fix upstream QR URL generation so generated QR codes point here, not `/items/${publicId}`. |
| `/api/public/items/[publicId]` | Clear public API boundary for guest item reads. | Keep public data minimal and enforce no host-only leakage. |
| `ItemDisplay` and guest content components | Substantial guest-facing UX exists. | Reduce bundle weight later; first preserve behavior. |
| `dashboard2` shell | Most mature host dashboard direction. | Treat as canonical host app shell. |
| `SimpleDashboard` components | Useful dashboard summary pieces. | Move into canonical dashboard only if they still match current schema. |
| `ItemCreationWorkflow` | Multi-step create flow exists and has accessibility/test investment. | Simplify integration and align it with canonical API/account headers. |
| `ItemManager` | Mature list/selection/item management component area. | Reconnect to canonical item DTOs and focused tests. |
| `InstructionsTable` and `InstructionEditor` | Instruction CRUD/editing has real implementation depth. | Keep the UI concepts, but align data contracts. |
| QR utilities and PDF generation helpers | Core SaaS output capability is present. | Remove debug noise and verify route/domain generation. |
| Translation service/job queue | Valuable P1 feature work already exists. | Defer until P0 item/instruction workflow is stable. |
| i18n utilities and locale handling | App already uses `next-intl` and translation structures. | Keep, but define the minimum P0 locale behavior. |
| Validation utilities | Useful for making LLM tasks safer. | Standardize DTO/schema validation around API boundaries. |

## Refactor

These areas are too central to ignore but too inconsistent to keep as-is.

| Area | Problem | Refactor Target |
| --- | --- | --- |
| Auth/session helpers | Multiple auth paths, ambiguous `requireAuth`, global browser clients, duplicated admin helpers. | One server auth module, one browser auth module, explicit `requireUser`, `requireAccountMember`, `requireSystemAdmin`. |
| Supabase clients | Service-role fallback can hide misconfiguration. | Explicit anon/server/service clients; service client must fail fast if key is missing. |
| Tenancy headers | `x-current-account` and `x-account-id` drift. | One account context convention; prefer server-derived account membership where possible. |
| `/api/admin` host CRUD | Host CRUD and system admin concerns are mixed. | Rename/re-home into `/api/user/*` for host-owned data and `/api/system/*` for system-admin actions. |
| Database migrations | Generated TypeScript types imply schema that checked-in SQL cannot recreate. | Create complete reproducible baseline migrations and regenerate types from them. |
| QR URL generation | Evidence of `/items/${publicId}` generation while route is `/item/[publicId]`. | Central `buildPublicItemUrl(publicId)` utility used by QR, PDF, and sharing. |
| PDF/QR logging | Build logs include verbose PDFKit font/debug output. | Quiet production logs; keep structured errors. |
| Test infrastructure | Large suite fails from config drift, env gaps, invalid tests, jsdom gaps, and memory pressure. | Repair config first, then keep focused tests around canonical flows. |
| Deployment docs | Railway/Nixpacks appears current, but stale Vercel/Node 18/simple-system docs remain. | One canonical deployment guide, with old docs archived or removed. |

## Rebuild

These pieces should be rebuilt intentionally, even if some existing code can be referenced.

| Area | Rebuild Scope |
| --- | --- |
| Database source of truth | A complete Supabase migration set covering accounts, account users, properties, property types, items, instructions/articles, media, access requests, analytics, and translation tables. |
| RLS and tenancy policy | Account-scoped policies and helper SQL so cross-account access cannot depend only on UI/API filters. |
| Generated database types | Regenerate from the actual migration-applied database and commit as an artifact. |
| Auth/tenancy helper layer | One small server-side API that every route uses before touching account data. |
| API DTO schemas | Define request/response schemas for P0 routes to reduce LLM drift. |
| API namespace contract | `/api/public` for guest unauthenticated reads, `/api/user` for host/member operations, `/api/system` for platform admin. |
| P0 smoke test | A Playwright path for login/register, property creation, item creation, instruction creation, QR/public-page load, and cross-account denial. |
| Production route gate | A build or lint script that fails if `/test/**`, `simple-*`, examples, or debug pages ship unintentionally. |
| Environment contract | A checked, documented environment-variable list with startup validation for required production values. |

## Archive Or Gate

These areas should not remain part of the active product surface during the restart.

| Area | Action |
| --- | --- |
| `/test/**` pages | Move out of production routes or gate behind development-only checks. |
| `/simple-admin`, `/simple-login` | Archive after confirming no active workflow depends on them. |
| `/api/simple-auth` | Archive or replace with canonical auth APIs. |
| Older `/dashboard` pages | Archive after migrating any still-useful UI into `dashboard2`. |
| Most `/user` pages | Reconcile with canonical dashboard; archive duplicates. |
| Host CRUD pages under `/admin` | Re-home host functionality into user/account routes; reserve admin for system admin. |
| `.bak` pages and `page-static` variants | Remove from active route tree or move to an archive folder outside `app`. |
| Root debug scripts/reports | Move to `docs/archive` or delete if obsolete. |
| Stale deployment scripts | Remove or replace with non-mutating docs. `deploy-railway.sh` should not be run in its current form. |
| Old database README/schema | Archive after new migrations and setup docs exist. |

## Defer

These are valid SaaS features, but starting with them would slow the restart and increase ambiguity.

- Billing and subscriptions.
- Advanced analytics dashboards.
- Multi-role team management beyond owner/member basics.
- Native/mobile app surface.
- Bulk CSV/import tooling.
- Full translation job management UI.
- Marketplace/template features.
- Complex onboarding automation.

## Recommended Restart Boundary

The restart should define a P0 product that is narrow and complete:

1. A host can create an account/session.
2. A host can create one property.
3. A host can create one item for that property.
4. A host can add instructions/content/media to that item.
5. The app can generate a QR code for the canonical public item URL.
6. A guest can open the public item page without login.
7. A host cannot access another account's property/item data.

Everything outside that boundary should be explicitly P1 or archived until the P0 path is stable.

## LLM Implementation Implication

Future LLM work should not be framed as "finish the SaaS app." It should be framed as small contracts:

- One route or workflow at a time.
- Named canonical files only.
- A before/after acceptance check.
- A short command set.
- No unrelated cleanup.

The existing codebase is too broad for reliable autonomous changes unless each task narrows the path and names the canonical surface.
