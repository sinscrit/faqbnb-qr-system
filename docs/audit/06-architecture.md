# 06 Architecture And Reusable Blocks

Date: 2026-07-10

## Architectural Shape

The app is a Next.js App Router monolith with:

- React client-heavy dashboard pages.
- Next.js route handlers for APIs.
- Supabase for auth/database/storage.
- Local React context for auth and property/account selection.
- Large feature component folders with local hooks, utils, and tests.
- Translation/job/PDF/QR utilities in `src/lib`.

This architecture can work for an MVP SaaS, but the boundaries need simplification.

## Strong Reusable Blocks

| Block | Location | Reuse Recommendation |
| --- | --- | --- |
| Public item display | `ItemDisplay`, guest components, `/item/[publicId]` | Keep and harden as the guest-facing core. |
| Dashboard2 shell | `src/app/dashboard2/*`, `Dashboard2LayoutClient` | Use as canonical host shell. |
| Item creation wizard | `src/components/ItemCreationWorkflow` | Reuse, but simplify integration and backend contract. |
| Item manager | `src/components/ItemManager` | Reuse for host item list once API shapes are stable. |
| Instructions list/editor | `src/components/InstructionsTable`, `InstructionEditor` | Reuse after terminology/model cleanup. |
| Simple dashboard widgets | `src/components/SimpleDashboard` | Reuse for host home and property management. |
| QR utilities | `src/lib/qrcode-utils.ts`, `useQRCodeGeneration` | Keep; centralize URL building through `buildQRUrl`. |
| PDF utilities | `src/lib/pdf-*`, `QRCodePrintManager` | Keep lower-level utilities; trim debug scripts after validation. |
| i18n guest/user language utilities | `src/lib/i18n`, `LanguageSwitcher`, guest language components | Keep; already well tested. |
| Translation service/job queue | `src/lib/translation-service`, `src/lib/job-queue`, `src/lib/content-translation` | Preserve but defer as P1. |
| Validation utilities | `src/lib/validation` | Reuse; expand for API DTO contracts. |

## Blocks To Archive Or Gate

| Block | Reason |
| --- | --- |
| `/src/app/test/**` | Public-routable test harnesses should not ship. |
| `/simple-admin`, `/simple-login`, `/api/simple-auth/*` | Prototype auth path duplicates real auth. |
| Older `/dashboard/*` shell | Overlaps `/dashboard2`; keep only unique behavior during migration. |
| Most `/user/*` pages | Overlap dashboard/account/profile/property concerns. |
| Older `/admin/*` host CRUD pages | Host CRUD should live in dashboard2; system admin should remain separate. |
| Root debug/fix/test scripts | Useful as forensic evidence, not canonical app workflow. |
| `.bak` and `page-static.tsx` route variants | Archive once canonical implementation is confirmed. |

## Architectural Problems

### 1. Too Many Canonical Surfaces

The repo has several active shells:

- `/admin`
- `/dashboard`
- `/dashboard2`
- `/user`
- simple auth/admin routes

This makes it hard for humans and LLMs to know where to implement features. Pick `/dashboard2` for host workflows and reserve a clearly named system-admin area for platform operations.

### 2. API Namespaces Do Not Match Product Roles

`adminApi` is the primary client API wrapper for host dashboard work. Many host actions call `/api/admin/*`, including item CRUD, property CRUD, upload, article management, and PDF generation.

This should become:

```text
publicApi -> /api/public/*
userApi   -> /api/user/*
systemApi -> /api/system/*
```

Compatibility wrappers can remain during migration, but new code should not add host features under `/api/admin`.

### 3. Frontend And Backend DTOs Drift

Examples:

- `ItemManager` expects fields that dashboard2 fills with defaults.
- APIs use `publicId`, database uses `public_id`, older components use `title`, newer code uses `name`.
- Instructions are represented as articles, guides, item links, content pieces, and instructions depending on context.

Add explicit request/response DTO schemas with Zod and use them at route boundaries.

### 4. Server-Only And Client-Compatible Modules Are Mixed

`src/lib/supabase.ts` exports both browser and service-role-ish clients. This increases accidental import risk and hides missing service-role configuration.

Recommended split:

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.server.ts`
- `src/lib/supabase/types.ts`

### 5. Debug Logging Is Embedded In Production Paths

Auth, middleware, QR, PDF, and dashboard code contain extensive debug logging. Keep structured error logging, but remove noisy console output before hardening.

### 6. Generated Artifacts Obscure The App

The root directory has many one-off test scripts, reports, pipeline state files, and fix scripts. They make repository navigation expensive for an LLM.

Recommended:

- Move forensic scripts/reports under `archive/forensics/YYYY-MM/`.
- Keep only package scripts, reusable scripts, and current test suites at root.
- Keep generated reports out of normal source navigation.

## Recommended Target Architecture

```text
src/app
  (marketing)/...
  dashboard2/...         # canonical host app, later rename to dashboard
  item/[publicId]/...    # public guest app
  system/...             # platform admin only
  api/public/...
  api/user/...
  api/system/...

src/features
  auth/
  accounts/
  properties/
  items/
  instructions/
  qr-print/
  translations/
  analytics/

src/lib
  supabase/
  validation/
  i18n/
  pdf/
  qr/
```

The repo does not need to be physically reorganized all at once. Use this as the direction for new or touched code.

## LLM-Friendly Implementation Rules

1. One canonical route per workflow.
2. One canonical API namespace per actor.
3. One auth helper path for all protected APIs.
4. DTO schemas live beside route handlers or feature modules.
5. Database migrations are complete and reproducible.
6. Tests target the P0 workflow before secondary features.
7. Archive obsolete files instead of letting an LLM rediscover them as active options.

## Most Valuable Reuse Path

Do not restart from a blank app. The best path is a controlled salvage:

1. Keep `/dashboard2`, `/item/[publicId]`, and core feature components.
2. Stabilize schema/auth/API boundaries underneath them.
3. Fix QR URL generation.
4. Add smoke tests for the full P0 flow.
5. Archive old shells and test routes.
6. Reintroduce translation, analytics, and advanced print polish after the core path is reliable.
