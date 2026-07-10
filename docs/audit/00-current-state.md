# 00 Current State

Date: 2026-07-10

## Repository Snapshot

- Path: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`
- Branch: `fix-qr-code-generation`
- Start HEAD: `f2cd626`
- Recent commit subject: `Fix 8 bugs (REQ-257 to REQ-264) with localization and UI improvements`

## Pre-Existing Dirty Worktree

The following files were dirty before audit work began:

| Status | Path |
| --- | --- |
| Modified | `.mcp.json` |
| Modified | `src/app/layout.tsx` |
| Modified | `src/components/InstructionsTable/GuideCard.tsx` |
| Modified | `src/components/ItemManager/components/ItemRow.tsx` |
| Modified | `src/components/PropertySelector.tsx` |
| Untracked | `gcloud_auth_url.txt` |
| Untracked | `src/components/DebugBadge.tsx` |
| Untracked | `src/contexts/DebugContext.tsx` |

Audit commits should avoid these paths unless the audit intentionally updates them.

## Detected Stack

From `package.json` and config files:

- Framework: Next.js 15 App Router
- Runtime: Node >= 22, npm >= 10
- UI: React 19, Tailwind CSS, Radix primitives, Lucide icons, Heroicons
- Backend: Next.js API routes
- Database/Auth/Storage: Supabase packages are installed
- Localization: `next-intl`, locale message JSON files, translation service modules
- PDF/QR: `pdf-lib`, `pdfkit`, `qrcode`, `react-qr-code`, `pdfjs-dist`
- AI translation: Anthropic and OpenAI SDKs
- Testing: Vitest, Testing Library, Playwright, axe-core
- Monitoring: Sentry Next.js integration

## Repository Shape

Important folders observed:

- `src/app`: many App Router pages and API routes.
- `src/components`: several large feature component areas.
- `src/lib`: shared utilities, translation service, job queue, validation, Supabase helpers.
- `database`: schema, migrations, seeds, setup docs.
- `docs`: large number of requirement and implementation notes.
- `docs/audit`: existing API error report plus this audit series.
- `claude-pipelines`, `pipelines-execution`, many root `pipeline*.yaml/json` files: generated planning/execution artifacts.
- `coverage`, `playwright-report`, `test-results`, `screenshots`, `tmp`, `temp-qr-images`: generated/test output directories.

## Initial Product Read

The project appears to have restarted several times. Current intent is still coherent: FAQBNB is a SaaS for vacation rental hosts/property managers to create guest-facing item and instruction pages accessed by QR code. However, the codebase now contains overlapping dashboard/admin/user surfaces, numerous test/demo routes, and many generated requirement artifacts.

## Immediate Risks

- Multiple competing dashboard/admin implementations may hide the real production path.
- Multi-tenancy and authorization need verification before adding features.
- Database docs in `database/README.md` describe an older simple item/link schema, while PRDs describe a richer multi-tenant SaaS model.
- Root contains many one-off scripts and validation files, making it hard for an LLM to identify canonical behavior.
- Environment config includes production-sensitive services but may not document all current requirements.

## Next Audit Step

Create product and route maps that classify what is canonical, duplicate, prototype, or stale.
