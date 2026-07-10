# 01 Product Map

Date: 2026-07-10

## Product Intent

FAQBNB is intended to be a multi-tenant SaaS for short-term rental hosts and property managers. Hosts create property-specific guest instructions, publish those instructions through QR codes, and use analytics/translations to improve guest self-service.

The strongest current product sources are:

- `docs/PRD.md`
- `docs/PRD_faqbnb-v3.md`
- `README.md`
- Route/component names under `src/app`, `src/components`, and `src/lib`

## Primary Users

| User | Goal |
| --- | --- |
| Guest | Scan a QR code and instantly read item/property instructions without logging in. |
| Host / property manager | Create and manage properties, rooms, items, guides, media, and QR print assets. |
| Platform/system admin | Approve access, manage users/accounts, monitor analytics, and operate translations/jobs. |

## Core Product Domains

| Domain | Current Evidence | Restart Priority |
| --- | --- | --- |
| Public QR item pages | `/item/[publicId]`, `/api/public/items/[publicId]`, `ItemDisplay` | P0 |
| Auth and onboarding | `/login`, `/register`, `/request-access`, `/api/auth/*`, `/api/access/redeem` | P0 |
| Tenant/account/property ownership | `accounts`, `properties`, `AuthContext`, `PropertyContext`, user/admin APIs | P0 |
| Host dashboard | `/dashboard2/*`, `SimpleDashboard`, `ItemManager`, `InstructionEditor` | P0 |
| Item and instruction management | item routes, article routes, `ItemCreationWorkflow`, `ItemCapture`, `InstructionsTable` | P0 |
| QR/PDF printing | `/dashboard2/print`, `/print/qr-codes`, `/api/admin/generate-pdf`, PDF/QR scripts | P1 |
| Translation/localization | `next-intl`, `messages/*.json`, translation tables/jobs/services | P1 |
| Analytics/reactions/visits | analytics pages and APIs, visits/reactions APIs | P1 |
| File/media upload | `/api/admin/upload`, media components, Supabase storage assumptions | P1 |
| Mailing list/beta access | `/api/mailing-list`, request-access pages | P2 |
| Billing/subscriptions | No obvious implementation found in current dependency set | Future |

## Product Definition Drift

The product concept is coherent, but the repo shows several restarts:

- `README.md` still describes a simpler QR item display system with `items` and `item_links`.
- PRDs describe a richer multi-tenant SaaS with OAuth, access codes, properties, analytics, and file uploads.
- Current routes include `/admin`, `/dashboard`, `/dashboard2`, `/user`, `/simple-admin`, and `/simple-login`, which suggests multiple competing app shells.
- Root and `docs/` contain many `REQ-*`, `pipeline-*`, debug, validation, and one-off implementation artifacts.
- Some files use older terminology such as item links, while newer flows use articles, guides, instructions, translations, accounts, and properties.

## Recommended Product Canon

Use this as the restart target unless later audit findings contradict it:

1. **Public guest experience**
   - `GET /item/[publicId]`
   - Mobile-first translated instruction page
   - No login required
   - Records visits/reactions where privacy-safe

2. **Host experience**
   - Login/register/request access
   - Manage properties
   - Manage rooms/tags if they materially improve item organization
   - Create/edit items and attached instructions/media
   - Print QR codes for selected properties/items

3. **Platform admin experience**
   - Approve access requests
   - View accounts/users
   - Operate translation jobs
   - View system-wide analytics

4. **Foundation**
   - Supabase Auth, Postgres, Storage
   - Tenant-scoped row access
   - Shared Zod validation
   - One canonical dashboard app shell
   - One canonical API namespace per actor: public, user, admin/system

## Scope To Avoid During Restart

Do not start by rebuilding every discovered feature. The repo contains enough partial work that a broad rewrite would likely reproduce the same drift.

Avoid in the first restart milestone:

- Native mobile app
- Team roles beyond account owner/admin
- Advanced analytics beyond simple visits/scans
- Bulk CSV import
- Multiple dashboard shells
- Complex AI translation workflows before core CRUD is stable
- Maintaining all `/test/*` pages as production-accessible routes

## MVP Completion Definition

An LLM-completable MVP should be defined as:

1. A host can register or log in.
2. A host can create one property.
3. A host can create one item/instruction under that property.
4. A host can produce a QR code pointing to the public item page.
5. A guest can scan/open the public item page without login.
6. Data is tenant-scoped and cannot leak between hosts.
7. The app builds and has a small smoke test suite for these flows.
