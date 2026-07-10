# 02 Route Inventory

Date: 2026-07-10

## Counts

- Page routes found: 95
- API routes found: 65
- `/test/*` page routes found: 35
- Backup/static page variants found: 22

These counts are high for the intended MVP and are a strong signal that route consolidation is required before a restart can be efficient.

## Top-Level Route Groups

| Group | Classification | Notes |
| --- | --- | --- |
| `/` | Keep | Marketing/beta landing page; localized and connected to mailing list/login. |
| `/item/[publicId]` | Keep | Canonical guest QR destination. Uses public API with translation support and demo fallback. |
| `/login` | Keep/refactor | Current auth entry. Contains debug logging and should be cleaned. |
| `/register`, `/register/complete`, `/register/success` | Keep/refactor | Matches PRD access-code/OAuth onboarding. |
| `/request-access` | Keep/refactor | Useful beta/private SaaS gate. Has `.bak` variant. |
| `/dashboard2/*` | Keep as likely canonical host dashboard | Newest and most structured shell. Uses `Dashboard2LayoutClient`, `PropertyProvider`, translated nav, settings, print, properties, instructions, items. |
| `/dashboard/*` | Archive or migrate | Older dashboard shell with overlapping items/properties/analytics/instructions. Has many `.bak` files. |
| `/admin/*` | Split | Some routes overlap with host dashboard; system-admin routes should move under a clearly named platform admin area. |
| `/user/*` | Archive or migrate | Overlaps dashboard/account/profile/property concerns. |
| `/print/qr-codes/[propertyId]` | Review | May be older or standalone print flow; overlaps `/dashboard2/print`. |
| `/simple-admin`, `/simple-login`, `/api/simple-auth/*` | Archive | Prototype/simple auth path. |
| `/qr-demo`, `/test-file-upload`, `/sentry-example-page`, `/version` | Dev/support | Keep only if gated or removed from production route tree. |
| `/test/*` | Move out of production app routes | Test harness pages should not ship as public app routes. |

## Likely Canonical Routes For Restart

| Route | Purpose |
| --- | --- |
| `/` | Landing page and beta/access CTA. |
| `/login` | Host login. |
| `/register` | Access-code registration. |
| `/request-access` | Public beta access request. |
| `/dashboard2` | Host dashboard home. |
| `/dashboard2/properties` | Property management. |
| `/dashboard2/items` | Item management. |
| `/dashboard2/instructions` | Guide/instruction management. |
| `/dashboard2/create` | Guided item/instruction creation. |
| `/dashboard2/print` | QR/PDF print workflow. |
| `/dashboard2/translations` | Translation management after core CRUD is stable. |
| `/dashboard2/settings` | Account/language/settings. |
| `/item/[publicId]` | Public guest QR page. |

## API Route Groups

| API Group | Classification | Notes |
| --- | --- | --- |
| `/api/public/items/*` | Keep | Public guest item content and languages. Should remain unauthenticated but carefully scoped to public fields. |
| `/api/items/[publicId]` | Review | Appears to overlap public item endpoint. Decide one canonical public item API. |
| `/api/auth/*` | Keep/refactor | Login, logout, session, register, Google OAuth, code validation. Needs security review. |
| `/api/access/redeem` | Keep/refactor | Access-code redemption fits PRD. |
| `/api/public/access-request` | Keep/refactor | Public request flow. |
| `/api/user/*` | Keep/refactor | Best namespace for host-owned resources. Should become primary non-admin CRUD namespace. |
| `/api/admin/items`, `/api/admin/properties`, `/api/admin/articles` | Rename/split | Some are host operations disguised as admin APIs. Move host CRUD to `/api/user` or enforce admin-only semantics. |
| `/api/admin/access-requests`, `/api/admin/accounts`, `/api/admin/check-sysadmin` | Keep as platform admin | Should require system admin. |
| `/api/admin/generate-pdf`, `/api/admin/upload` | Rename/scope | Host-facing operational APIs should not live under admin unless admin-only. |
| `/api/translations/*`, `/api/admin/process-translations`, `/api/admin/translation-jobs` | Keep later | Important but should not block MVP restart. Needs job/security audit. |
| `/api/reactions`, `/api/items/[publicId]/reactions`, `/api/visits` | Consolidate | Multiple public interaction endpoints; choose one pattern. |
| `/api/mailing-list` | Keep if beta launch remains. |
| `/api/sentry-example-api`, `/api/simple-auth/me`, `/api/test*` | Remove or dev-gate. |

## Duplicate And Legacy Signals

- `/admin`, `/dashboard`, and `/dashboard2` all implement overlapping authenticated shells.
- `/admin/properties/*` and `/dashboard/properties/*` overlap.
- `/admin/items/*`, `/dashboard/items/*`, `/dashboard2/items/*`, and `/user/items` overlap.
- `/api/admin/*` contains both true platform-admin operations and ordinary host CRUD.
- Backup files such as `page.tsx.bak` and `page-static.tsx` are still inside route directories.
- Test/demo pages live under `src/app`, making them production-routable unless otherwise blocked.

## Restart Recommendation

Choose `/dashboard2` as the canonical host dashboard unless later workflow testing proves it is unusable. Then:

1. Freeze `/dashboard2` route names as the host experience.
2. Move host CRUD APIs out of `/api/admin` or create compatibility wrappers while using canonical `/api/user` APIs.
3. Move true platform-admin screens into `/admin/system` or a new `/system` group.
4. Archive `/dashboard`, `/user`, `simple-*`, and public `/test/*` pages after confirming no unique production behavior remains.
5. Add route-level protection for dev/test/support pages that remain.

## Immediate Route Cleanup Candidates

Do not delete yet. Mark these for archive after the audit:

- `src/app/test/**`
- `src/app/simple-admin/page.tsx`
- `src/app/simple-login/page.tsx`
- `src/app/api/simple-auth/**`
- `src/app/sentry-example-page/page.tsx`
- `src/app/api/sentry-example-api/route.ts`
- `src/app/qr-demo/page.tsx`
- `src/app/test-file-upload/page.tsx`
- `*.bak` route files
- `page-static.tsx` route variants
