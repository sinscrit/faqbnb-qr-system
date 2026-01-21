# FAQBNB Project Notes

Last Modified: 2026-01-21

## URLs

- **Staging:** https://faqbnb-staging.up.railway.app
- **Version API:** https://faqbnb-staging.up.railway.app/api/version

## Version

Auto-versioning is enabled via pre-commit hook. Version format: `0.{commit_count}`

Check current version:
- Local: `cat version.json`
- Remote: `curl https://faqbnb-staging.up.railway.app/api/version`

## Deployment

```bash
railway up
```

## Database

- Supabase (check MCP for access)
- Tables: `users`, `accounts`, `access_requests`, `auth.users`, `items`, `properties`, `item_articles`, `item_links`

## Naming Conventions

### Database vs TypeScript

| Context | Convention | Example |
|---------|-----------|---------|
| Database columns | snake_case | `public_id`, `created_at`, `qr_code_url` |
| TypeScript types | camelCase | `publicId`, `createdAt`, `qrCodeUrl` |
| API responses | camelCase | Return camelCase to frontend |

### Transform Utilities

Use `src/lib/db-transforms.ts` to convert between formats:

```typescript
import { dbItemToItem, itemToDbItem } from '@/lib/db-transforms';

// Database query → TypeScript
const dbResult = await supabase.from('items').select('*');
const items = dbResult.data?.map(dbItemToItem) ?? [];

// TypeScript → Database insert
const dbData = itemToDbItem(myItem);
await supabase.from('items').insert(dbData);
```

### Key Rules

1. **Never mix conventions** - Pick one and stick to it in each layer
2. **Transform at boundaries** - Convert at API/database edges, not in components
3. **Types are source of truth** - If types say `publicId`, use `publicId`

## Internationalization (i18n)

This project uses **next-intl** for translations.

### Translation Function Types

**IMPORTANT:** When creating helper functions that accept a translation function (`t`), use the shared types from `@/types`:

```typescript
import type { TranslationFn } from '@/types';

// CORRECT: Use shared type
function getDeleteMessage(t: TranslationFn, count: number): string {
  return count === 1 ? t('single') : t('multiple', { count });
}

// WRONG: Don't define your own type - it won't match next-intl's Translator
function getDeleteMessage(t: (key: string, params?: Record<string, unknown>) => string, count: number) { ... }
```

### Available Types

| Type | Use Case |
|------|----------|
| `TranslationFn` | Generic translator function parameter |
| `StringTranslationFn` | When return must be `string` |
| `WithTranslation` | Props interface mixin with `t` prop |

### Translation Files

- Location: `/messages/{locale}.json` (e.g., `en.json`, `fr.json`)
- Namespaces: Nested keys like `common.buttons.save`, `auth.login.title`

## TypeScript

### Scripts

```bash
npm run typecheck        # Run type check
npm run typecheck:watch  # Watch mode
npm run precommit        # Run before committing (typecheck + lint)
```

### Regenerating Types

After database schema changes:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.generated.ts
```

### Current Type Status

- Strict `tsc --noEmit` may show errors from Supabase relationship inference
- These don't block builds - Next.js uses permissive compilation
- Priority fixes: TS2339 (property doesn't exist), TS2322 (type mismatch)

## CI/CD

### GitHub Actions

- **ci.yml** - Runs on PRs: typecheck, lint, build, test
- **run-pipeline.yml** - Manual trigger for L10N pipelines

### Pre-deployment Checks

The build must pass before deploying. TypeScript errors are logged but non-blocking until cleanup is complete.
