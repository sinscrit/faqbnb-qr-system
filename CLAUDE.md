# FAQBNB Project Notes

Last Modified: 2026-01-23 13:30

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

## Pipeline Orchestrator

### MCP Tool Wildcards Don't Work

**Issue discovered 2026-01-21:** The `--allowedTools` flag in Claude CLI does NOT support wildcards like `mcp__supabase__*`. Using wildcards causes tools to be silently unavailable, resulting in agents hanging for 7+ minutes then failing with `num_turns: 0`.

**Wrong:**
```yaml
command:
  - "claude"
  - "-p"
  - "{prompt}"
  - "--allowedTools"
  - "Read,Write,Edit,Bash,Glob,Grep,mcp__supabase__*"  # BROKEN
```

**Correct:**
```yaml
command:
  - "claude"
  - "-p"
  - "{prompt}"
  - "--allowedTools"
  - "Read,Write,Edit,Bash,Glob,Grep,mcp__supabase__list_tables,mcp__supabase__execute_sql,mcp__supabase__apply_migration,mcp__supabase__list_migrations,mcp__supabase__generate_typescript_types,mcp__supabase__get_project_url"
```

### Debug Flags

For troubleshooting pipeline issues, add `--debug` and `--verbose` to the Claude command in pipeline YAML configs. Agent output is saved to `pipelines-execution/agent-output-{task_id}-{timestamp}.log`.

### Pipeline Scripts

#### Run Specific Pipeline Config

To run a specific pipeline YAML config with specific stages:

```bash
python3 claude-pipelines/pipeline_orchestrator.py \
    --config ./pipelines-execution/pipeline-l10n-epic2-static-ui.yaml \
    --stages "overview,details,implementation"
```

With `--keep` to preserve existing requests:

```bash
python3 claude-pipelines/pipeline_orchestrator.py \
    --config ./pipelines-execution/pipeline-l10n-epic2-static-ui.yaml \
    --stages "overview,details,implementation" \
    --keep
```

With `--stream` to enable real-time output monitoring:

```bash
python3 claude-pipelines/pipeline_orchestrator.py \
    --config ./pipelines-execution/pipeline-l10n-epic4-guest-experience.yaml \
    --stages "overview,details,implementation" \
    --keep \
    --stream
```

The `--stream` flag writes agent output to log files in real-time, allowing `./scripts/watch-pipeline.sh` to show live agent activity (file reads, tool calls, thinking) instead of waiting until completion.

#### Run Multiple Epics

Use `./scripts/run-epics.sh` to run multiple epic pipelines:

```bash
# Run specific epics in parallel
./scripts/run-epics.sh --epics "4,5" --parallel --keep

# Run all epics sequentially
./scripts/run-epics.sh

# Run epics 2,3,4 in parallel
./scripts/run-epics.sh --epics "2,3,4" --parallel --keep

# Dry run to see what would execute
./scripts/run-epics.sh --epics "4,5" --parallel --dry-run
```

Options:
- `--epics "X,Y"` - Comma-separated epic numbers (1-5)
- `--parallel` - Run epics in parallel with background processes
- `--staged` - Run Stage 1 sequential, then Stage 2+ parallel
- `--keep` - Keep existing requests, process remaining
- `--resume` - Resume from previous run
- `--delete` - Delete previous requests and regenerate
- `--stages "X,Y"` - Run specific stages only
- `--dry-run` - Show commands without executing

Logs are saved to `pipelines-execution/epic{N}-parallel.log`.

#### Monitor Progress

Use `./scripts/dashboard.sh` to monitor pipeline progress:

```bash
./scripts/dashboard.sh              # One-time view
./scripts/dashboard.sh --refresh 5  # Auto-refresh every 5 seconds
```

#### Watch Pipeline Activity

Use `./scripts/watch-pipeline.sh` to observe what agents are doing in real-time:

```bash
./scripts/watch-pipeline.sh              # Watch all epics
./scripts/watch-pipeline.sh --epic 4     # Watch specific epic
./scripts/watch-pipeline.sh --task 3.1   # Watch specific task
```

Shows:
- Currently processing task
- Agent log output (real-time)
- Recent doc file changes

#### Watch Agent Progress Journal

The implementation agent writes a progress journal with meaningful milestones:

```bash
# Watch the journal in real-time
tail -f pipelines-execution/agent-journal.log
```

Journal shows:
- Subtask start/completion
- Key decisions made
- Issues encountered and resolutions
- Phase transitions

#### Precheck & Auto-Fix

Use `./scripts/precheck-fix.sh` to run precheck and auto-fix issues:

```bash
./scripts/precheck-fix.sh              # Run precheck with auto-fix
./scripts/precheck-fix.sh --check-only # Check only, no auto-fix
./scripts/precheck-fix.sh --fix-only   # Run fixer agent directly
./scripts/precheck-fix.sh --verbose    # Show detailed output
```

Checks:
1. TypeScript compilation (production errors only)
2. Dev server responding on localhost:3000
3. Claude CLI availability

#### Reset Pipelines

Use `./scripts/reset-pipelines.sh` to reset pipeline state:

```bash
./scripts/reset-pipelines.sh        # Interactive reset
```
