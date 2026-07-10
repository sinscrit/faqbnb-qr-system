# 05 Workflow Status

Date: 2026-07-10

## Scope

This audit traces expected SaaS workflows from routes and components. It does not claim runtime success until health checks and browser testing are completed.

## Workflow Summary

| Workflow | Current Status | Evidence | Recommendation |
| --- | --- | --- | --- |
| Landing and beta request | Partial/usable | `/`, `MailingListSignup`, `/api/mailing-list`, `/request-access`, `/api/public/access-request` | Keep, but decide whether mailing list and access request are one flow or two. |
| Login/session | Partial/risky | `/login`, `LoginPageContent`, `AuthContext`, `/api/auth/session`, middleware | Keep concept, consolidate auth implementation before feature work. |
| Access-code registration/OAuth | Partial/risky | `/register`, `/register/complete`, `/api/auth/google`, `/api/auth/complete-oauth-registration`, `/api/access/redeem` | Keep, but simplify into one documented state machine. |
| Account/property setup | Partial | `/dashboard2`, `AddPropertyModal`, `/api/admin/properties`, `/api/user/properties` | Keep model; move host APIs to canonical namespace. |
| Item creation | Substantial but risky | `/dashboard2/create`, `ItemCreationWorkflow`, upload/QR/PDF hooks | Reuse component blocks; fix API naming and QR URL route mismatch. |
| Item management | Substantial | `/dashboard2/items`, `ItemManager`, `/api/admin/items` | Reuse; remove older dashboard/admin/user duplicate pages. |
| Instruction/guide management | Substantial | `/dashboard2/instructions`, `InstructionsTable`, `InstructionEditor`, article APIs | Reuse after confirming article/item/link model. |
| Public guest QR page | Substantial | `/item/[publicId]`, `ItemDisplay`, `/api/public/items/[publicId]`, guest i18n components | Keep as core P0 path; verify public data boundary. |
| QR/PDF printing | Substantial but fragmented | `/dashboard2/print`, `/dashboard2/print/[propertyId]`, `QRCodePrintManager`, PDF utilities | Reuse lower-level QR/PDF utilities; consolidate print routes. |
| Translation management | Advanced/secondary | `/dashboard2/translations`, translation APIs, job queue, providers | Preserve but defer until CRUD and auth are stable. |
| Analytics/reactions/visits | Partial | analytics APIs/pages, `VisitCounter`, `ReactionButtons` | Keep basic scan/visit analytics; defer advanced dashboards. |
| System admin access requests | Partial | `/admin/access-requests`, `/admin/system/back-office`, access management libs | Keep as platform-admin area; separate from host dashboard. |

## Detailed Workflow Findings

### 1. Guest Opens QR Page

Expected:

```text
QR URL -> /item/[publicId] -> /api/public/items/[publicId] -> ItemDisplay
```

Current strengths:

- Public page has translation-aware metadata.
- Guest language detection supports URL, cookie, and Accept-Language.
- `ItemDisplay` has dedicated tests for mobile, translations, and edge cases.
- Public API has rate limiting and cache headers.

Risks:

- Some host-side QR generation code builds `/items/{publicId}` while the actual route is `/item/[publicId]`.
- Public API must be reviewed to ensure it returns only QR-safe fields.
- In-memory rate limiting is not production-grade across multiple instances.

### 2. Host Registers Or Logs In

Expected:

```text
request access -> approved/access code -> register/OAuth -> app user -> account membership -> dashboard2
```

Current strengths:

- Access-code and OAuth flows are represented in code and docs.
- Middleware detects orphaned Supabase auth users and redirects to registration completion.
- `AuthContext` has an explicit state machine concept.

Risks:

- Debug logging is pervasive.
- Several API routes require Bearer headers while others rely on cookies.
- Account creation/membership behavior is spread across auth, access-management, and API routes.
- The registration flow likely needs an end-to-end smoke test before further feature work.

### 3. Host Creates A Property

Expected:

```text
dashboard2 -> AddPropertyModal -> create property under current account -> property selected
```

Current strengths:

- Dashboard2 has `PropertyProvider` and `PropertyDropdown`.
- SimpleDashboard has add/edit property modals and progressive empty states.
- Property APIs support account context.

Risks:

- Host property APIs still live mostly under `/api/admin/properties`.
- `properties` use both `user_id` and `account_id`, and code sometimes requires both.
- Current account header names are inconsistent.

### 4. Host Creates Item/Instruction Content

Expected:

```text
dashboard2/create -> ItemCreationWorkflow -> upload/save item/articles/links -> generate QR
```

Current strengths:

- `ItemCreationWorkflow` is a rich state-machine-based wizard.
- It supports room, item type, specific item, purpose, content type, media capture, preview/save, next action, and session summary.
- There is broad component and hook test coverage around this area.
- Media upload and QR generation utilities exist.

Risks:

- Create page calls `adminApi.createItem(itemData)` without passing prepared account headers, while other calls do pass headers.
- QR URLs are generated as `/items/${publicId}` in at least two places, but the public route is `/item/[publicId]`.
- Text content is encoded into data URIs inside `item_links.url`, which may not be the right long-term content model.
- Generated public IDs are full UUIDs, while PRDs mention shorter QR-friendly IDs.

### 5. Host Manages Existing Items

Expected:

```text
dashboard2/items -> ItemManager -> list/filter/edit/delete/duplicate
```

Current strengths:

- `ItemManager` is modular, configurable, and heavily tested.
- Search, filters, sorting, bulk actions, asset management, and translation-status integration exist.
- Dashboard2 page maps backend items into `ItemManager` records.

Risks:

- The mapping fills several fields with defaults because API data does not match component expectations.
- Duplicate item creation may omit account headers.
- Older `/dashboard`, `/admin`, and `/user` item pages duplicate similar behavior.

### 6. Host Manages Instructions

Expected:

```text
dashboard2/instructions -> articles list -> edit article -> update article/links
```

Current strengths:

- `InstructionsTable`, `GuideToolbar`, `GuideGrid`, search, filters, sort, and column visibility exist.
- The page correctly depends on selected property.
- Article edit route exists under `/dashboard2/instructions/[articleId]/edit`.

Risks:

- Item/article/link terminology needs a stable product vocabulary.
- APIs still live under `/api/admin/articles`.
- The page uses some `any` defensive mapping, indicating backend/front-end shape mismatch.

### 7. Host Prints QR Codes

Expected:

```text
dashboard2/print -> select property/properties -> dashboard2/print/[propertyId] -> QRCodePrintManager -> PDF
```

Current strengths:

- Print selection page exists.
- `QRCodePrintManager` handles generation, preview, settings, and PDF export.
- PDF utilities include layout, geometry, cutlines, validation, and QR embedding.
- Multiple validation scripts and reports exist around PDF/QR behavior.

Risks:

- Print flows exist under both `/dashboard2/print` and older `/dashboard`/`/admin` property QR routes.
- PDF code has many debug/fix artifacts and should be trimmed after canonical behavior is verified.
- Server PDF endpoint is under `/api/admin/generate-pdf` but host printing is not a platform-admin operation.

## P0 Smoke Test Recommendation

Create one browser/API smoke suite that proves:

1. A test user can log in.
2. A property can be created.
3. An item/instruction can be created under that property.
4. The app generates a QR URL using `/item/[publicId]`.
5. The public URL renders without auth.
6. Another test user/account cannot read or mutate the item through protected APIs.

Do not expand feature scope until this passes reliably.
