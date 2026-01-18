# Implementation Plan: Localization Epic 3 - Dynamic Content Translation

**Generated:** 2026-01-17 23:45:00 UTC
**Last Modified:** 2026-01-17 23:45:00 UTC
**PRD Reference:** PRD_L10N_Epic3_Dynamic_Content_Translation.md
**Epic Size:** L (Large)
**Priority:** P1 - High
**Depends On:** Epic 1 (Foundation) - Plan-110

---

## Overview

This implementation plan details the automatic translation system for user-generated content (items, articles, links, tags) in FAQBNB. When owners create or update content, translations are queued and processed asynchronously to all 6 supported languages. The system stores pre-translated versions for instant retrieval by guests, ensuring no real-time translation delays. This epic builds upon the foundation infrastructure from Epic 1.

**Supported Languages:** English (en), French (fr), Spanish (es), German (de), Dutch (nl), Italian (it)

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **State Management** | React Context + useReducer |
| **UI Components** | Radix UI, Heroicons, Lucide React |
| **Authentication** | Supabase Auth with validateAdminAuth helper |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Deployment** | Railway |

### Dependencies from Epic 1 (Plan-110)

This epic assumes the following Epic 1 infrastructure is implemented:

| Component | Location | Status |
|-----------|----------|--------|
| Translation tables | Database | **Required** - article_translations, item_translations, link_translations, tag_translations, translation_jobs |
| Source language columns | Database | **Required** - items.source_language, item_articles.source_language, item_links.source_language |
| User/Account language prefs | Database | **Required** - users.preferred_language, accounts.preferred_language |
| Translation service | `/src/lib/translation-service/` | **Required** - translateText(), translateToAllLanguages() |
| Job queue | `/src/lib/job-queue/` | **Required** - Job processing infrastructure |
| i18n framework | next-intl | **Required** - IntlProvider, locale detection |

**IMPORTANT:** If Epic 1 is not fully implemented, complete those tasks first before proceeding with this plan.

### Existing Relevant Patterns

| Pattern | Location | Usage for Epic 3 |
|---------|----------|------------------|
| API auth validation | `/src/lib/auth-server.ts` | validateAdminAuth pattern for new endpoints |
| Account context | `/src/app/api/admin/items/route.ts` | getAccountContext helper pattern |
| Item CRUD | `/src/app/api/admin/items/route.ts` | Extend POST/PUT to queue translations |
| Article CRUD | `/src/app/api/admin/articles/route.ts` | Extend POST/PUT to queue translations |
| Database types | `/src/lib/supabase.ts` | Add translation table types |

---

## Architecture

### Component Structure

```
/src/lib/
├── translation-service/               # From Epic 1
│   ├── index.ts                       # Service exports
│   ├── translation-service.ts         # Main service
│   ├── translation-service.types.ts   # Types
│   ├── providers/
│   │   ├── claude-provider.ts         # Anthropic Claude
│   │   └── openai-provider.ts         # OpenAI fallback
│   └── utils/
│       ├── rate-limiter.ts            # Rate limiting
│       └── retry.ts                   # Exponential backoff
├── job-queue/                         # From Epic 1
│   ├── index.ts                       # Queue exports
│   ├── translation-jobs.ts            # Job processor
│   └── translation-jobs.types.ts      # Job types
└── content-translation/               # NEW for Epic 3
    ├── index.ts                       # Content translation exports
    ├── content-translation.ts         # Content translation orchestrator
    ├── content-translation.types.ts   # Content-specific types
    ├── triggers/
    │   ├── item-trigger.ts            # Item save translation trigger
    │   ├── article-trigger.ts         # Article save translation trigger
    │   ├── link-trigger.ts            # Link save translation trigger
    │   └── tag-trigger.ts             # Tag translation trigger
    └── storage/
        ├── translation-storage.ts     # Store/retrieve translations
        └── translation-status.ts      # Status tracking utilities

/src/app/api/
├── admin/
│   ├── items/route.ts                 # MODIFY: Add translation trigger
│   ├── articles/route.ts              # MODIFY: Add translation trigger
│   └── items/[id]/
│       └── links/route.ts             # MODIFY: Add translation trigger
└── translations/                      # NEW: Translation management APIs
    ├── status/
    │   └── [entityType]/
    │       └── [entityId]/route.ts    # GET translation status
    ├── retry/route.ts                 # POST retry failed translations
    └── [entityType]/
        └── [entityId]/
            └── [language]/route.ts    # PUT manual override
```

### Database Schema (Extends Epic 1)

Epic 1 creates the base tables. Epic 3 adds these indexes for the job processing workload:

```sql
-- Fast lookup of pending/processing jobs (for job processor)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('queued', 'processing');

-- Fast lookup of jobs by entity (for status queries)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity
  ON translation_jobs(entity_type, entity_id, target_language);

-- Fast lookup of stale processing jobs (for cleanup)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_stale
  ON translation_jobs(status, started_at)
  WHERE status = 'processing';
```

### Data Flow

```
Content Save Request
    │
    ▼
API Route (items/articles/links)
    │
    ├── 1. Save content with source_language
    │
    ├── 2. Delete existing translations (if update)
    │
    ├── 3. Queue translation jobs (5 target languages)
    │       │
    │       └── Insert into translation_jobs table
    │           - entity_type: 'item' | 'article' | 'link' | 'tag'
    │           - entity_id: UUID
    │           - source_language: detected from user/account
    │           - target_language: each of 5 other languages
    │           - status: 'queued'
    │           - priority: based on job type
    │
    └── 4. Return success immediately
            │
            └── Response includes translationJobIds

    === ASYNC BACKGROUND PROCESSING ===

Job Processor (polling/cron)
    │
    ├── 1. Pick up queued job (with locking)
    │       UPDATE translation_jobs
    │       SET status = 'processing', started_at = now()
    │       WHERE id = (SELECT id ... FOR UPDATE SKIP LOCKED)
    │
    ├── 2. Fetch source content
    │       SELECT name, description FROM items WHERE id = ?
    │
    ├── 3. Call Translation Service
    │       translateText({
    │         text: content,
    │         sourceLanguage: 'en',
    │         targetLanguage: 'fr',
    │         context: { contentType: 'item_name', ... }
    │       })
    │
    ├── 4. On Success:
    │       │
    │       ├── UPSERT into item_translations
    │       │   - translation_status: 'completed'
    │       │   - translated_at: now()
    │       │
    │       └── UPDATE translation_jobs
    │           SET status = 'completed', completed_at = now()
    │
    └── 5. On Failure:
            │
            ├── INCREMENT attempts
            │
            ├── IF attempts < 3:
            │   UPDATE translation_jobs
            │   SET status = 'queued', error_message = ?
            │   (re-queue with exponential backoff)
            │
            └── IF attempts >= 3:
                UPDATE translation_jobs
                SET status = 'failed', error_message = ?
```

### State Management

```typescript
// Translation status summary for UI display
interface EntityTranslationStatus {
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  sourceLanguage: SupportedLanguage;
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
  translations: {
    [language: string]: {
      status: 'pending' | 'completed' | 'failed' | 'manual';
      translatedAt?: string;
      reviewedBy?: string;
    }
  };
  pendingLanguages: string[];
  completedLanguages: string[];
  failedLanguages: string[];
}
```

---

## Integration Contract

### Content Translation Service Interface

```typescript
// /src/lib/content-translation/content-translation.types.ts

import { SupportedLanguage, TranslationContext } from '@/lib/translation-service';

export type EntityType = 'item' | 'article' | 'link' | 'tag';
export type TranslationTrigger = 'create' | 'update';

export interface ContentToTranslate {
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  fields: TranslatableField[];
}

export interface TranslatableField {
  fieldName: string;
  value: string;
  context: TranslationContext;
  maxLength?: number;
}

export interface QueueTranslationOptions {
  /** Content to translate */
  content: ContentToTranslate;
  /** Trigger type affects priority */
  trigger: TranslationTrigger;
  /** Skip specific languages */
  excludeLanguages?: SupportedLanguage[];
  /** Custom priority override (higher = more urgent) */
  priority?: number;
}

export interface QueueTranslationResult {
  success: boolean;
  jobIds: string[];
  queuedLanguages: SupportedLanguage[];
  error?: string;
}

export interface TranslationStatusResult {
  entityId: string;
  entityType: EntityType;
  sourceLanguage: SupportedLanguage;
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
  translations: Record<SupportedLanguage, LanguageTranslationStatus>;
}

export interface LanguageTranslationStatus {
  status: 'pending' | 'completed' | 'failed' | 'manual';
  translatedAt?: string;
  reviewedBy?: string;
  error?: string;
}
```

### API Endpoint Contracts

#### Modified: Create/Update Item
```typescript
// POST /api/admin/items
// Request (extended)
interface CreateItemRequest {
  publicId: string;
  name: string;
  description?: string;
  propertyId: string;
  tags?: string[];
  sourceLanguage?: string; // NEW: Optional override (defaults to user's language)
  // ... existing fields
}

// Response (extended)
interface CreateItemResponse {
  success: boolean;
  data: Item;
  translationJobIds?: string[]; // NEW: IDs of queued translation jobs
  accountContext?: {...};
}
```

#### New: Translation Status Endpoint
```typescript
// GET /api/translations/status/{entityType}/{entityId}
interface TranslationStatusResponse {
  success: boolean;
  data: {
    entityId: string;
    entityType: EntityType;
    sourceLanguage: string;
    translations: {
      [language: string]: {
        status: 'pending' | 'completed' | 'failed' | 'manual';
        translatedAt?: string;
        reviewedBy?: string;
        error?: string;
      }
    };
    overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
  };
  error?: string;
}
```

#### New: Retry Failed Translations
```typescript
// POST /api/translations/retry
interface RetryTranslationRequest {
  entityType: EntityType;
  entityId: string;
  languages?: string[]; // Optional, retry all failed if omitted
}

interface RetryTranslationResponse {
  success: boolean;
  jobsQueued: number;
  queuedLanguages: string[];
  error?: string;
}
```

#### New: Manual Translation Override
```typescript
// PUT /api/translations/{entityType}/{entityId}/{language}
interface ManualTranslationRequest {
  // Field names match the entity type
  name?: string;        // For items
  title?: string;       // For articles/links
  description?: string; // For items/articles
}

interface ManualTranslationResponse {
  success: boolean;
  data: {
    entityId: string;
    language: string;
    translationStatus: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
  error?: string;
}
```

### Usage Examples

```typescript
// Triggering translation when item is saved (in items/route.ts POST)
import { queueContentTranslations } from '@/lib/content-translation';

// After item is created successfully
const translationResult = await queueContentTranslations({
  content: {
    entityType: 'item',
    entityId: newItem.id,
    sourceLanguage: body.sourceLanguage || userLanguage || 'en',
    fields: [
      {
        fieldName: 'name',
        value: newItem.name,
        context: { contentType: 'item_name', domain: 'property_rental' },
        maxLength: 255
      },
      {
        fieldName: 'description',
        value: newItem.description || '',
        context: { contentType: 'item_description', domain: 'property_rental' }
      }
    ]
  },
  trigger: 'create'
});

// Include job IDs in response
return NextResponse.json({
  success: true,
  data: transformedItem,
  translationJobIds: translationResult.jobIds
});
```

```typescript
// Checking translation status from frontend
const response = await fetch(`/api/translations/status/item/${itemId}`);
const { data } = await response.json();

if (data.overallStatus === 'complete') {
  // All translations ready
} else if (data.overallStatus === 'partial') {
  // Show which languages are pending
  console.log('Pending:', data.translations);
}
```

---

## Implementation Approach

### Pre-Implementation Validation

**CRITICAL: Verify Epic 1 completion before starting Epic 3**

```bash
# Check translation tables exist
supabase db list tables | grep translation

# Check translation service exists
ls -la src/lib/translation-service/

# Check job queue exists
ls -la src/lib/job-queue/

# Check next-intl is installed
npm list next-intl
```

If any of these fail, complete Epic 1 first (Plan-110).

---

### Phase 1: Content Translation Infrastructure (2-3 days)

- [ ] **Task 1.1:** Create content-translation module structure
  - File: `/src/lib/content-translation/index.ts`
  - File: `/src/lib/content-translation/content-translation.types.ts`
  - Define all TypeScript interfaces for content translation

- [ ] **Task 1.2:** Implement content translation orchestrator
  - File: `/src/lib/content-translation/content-translation.ts`
  - Main function: `queueContentTranslations(options: QueueTranslationOptions): Promise<QueueTranslationResult>`
  - Coordinates translation job creation for all target languages
  - Uses translation service types from Epic 1

- [ ] **Task 1.3:** Implement entity-specific translation triggers
  - File: `/src/lib/content-translation/triggers/item-trigger.ts`
    - `triggerItemTranslation(itemId: string, sourceLanguage: string): Promise<QueueTranslationResult>`
    - Extracts `name`, `description` fields
  - File: `/src/lib/content-translation/triggers/article-trigger.ts`
    - `triggerArticleTranslation(articleId: string, sourceLanguage: string): Promise<QueueTranslationResult>`
    - Extracts `title`, `description` fields
  - File: `/src/lib/content-translation/triggers/link-trigger.ts`
    - `triggerLinkTranslation(linkId: string, sourceLanguage: string): Promise<QueueTranslationResult>`
    - Extracts `title` field only (URLs not translated)

- [ ] **Task 1.4:** Implement tag translation trigger
  - File: `/src/lib/content-translation/triggers/tag-trigger.ts`
  - `triggerTagTranslation(tagKey: string, sourceLanguage: string): Promise<QueueTranslationResult>`
  - Check if translation already exists before queuing
  - Handle both system tags (skip - already seeded) and user tags

- [ ] **Task 1.5:** Implement translation storage utilities
  - File: `/src/lib/content-translation/storage/translation-storage.ts`
  - `storeItemTranslation(itemId: string, language: string, data: {...})`
  - `storeArticleTranslation(articleId: string, language: string, data: {...})`
  - `storeLinkTranslation(linkId: string, language: string, data: {...})`
  - `storeTagTranslation(tagKey: string, language: string, value: string)`
  - All use UPSERT pattern to handle updates

- [ ] **Task 1.6:** Implement translation status utilities
  - File: `/src/lib/content-translation/storage/translation-status.ts`
  - `getEntityTranslationStatus(entityType: EntityType, entityId: string): Promise<TranslationStatusResult>`
  - `getBatchTranslationStatus(entities: {type: EntityType, id: string}[]): Promise<TranslationStatusResult[]>`
  - Aggregates job status with stored translations

---

### Phase 2: Modify Existing Content APIs (2-3 days)

- [ ] **Task 2.1:** Add source language detection utility
  - File: `/src/lib/content-translation/source-language.ts`
  - `detectSourceLanguage(user: User, account: Account, override?: string): SupportedLanguage`
  - Priority: override > user.preferred_language > account.preferred_language > 'en'

- [ ] **Task 2.2:** Modify Items API to trigger translations
  - File: `/src/app/api/admin/items/route.ts`
  - **POST handler:**
    - Accept optional `sourceLanguage` in request body
    - After successful item creation, call `queueContentTranslations`
    - Include `translationJobIds` in response
  - **PUT/PATCH handler (in [id]/route.ts):**
    - Delete existing translations for this item before update
    - Queue new translations after update
    - Include `translationJobIds` in response

- [ ] **Task 2.3:** Modify Articles API to trigger translations
  - File: `/src/app/api/admin/articles/route.ts`
  - **POST handler:**
    - Accept optional `sourceLanguage` in request body
    - After successful article creation, call `queueContentTranslations`
  - **PUT/PATCH handler (in [id]/route.ts):**
    - Delete existing article translations
    - Queue new translations

- [ ] **Task 2.4:** Create/Modify Links API to trigger translations
  - File: `/src/app/api/admin/items/[id]/links/route.ts`
  - **POST handler:**
    - Queue link title translation after creation
  - **PUT handler:**
    - Delete existing link translations
    - Queue new translations

- [ ] **Task 2.5:** Add tag translation on item save
  - Modify items POST/PUT handlers
  - For each user tag in `tags[]`:
    - Check if translation exists
    - If not, queue tag translation job
  - Skip system tags (starting with `#`)

- [ ] **Task 2.6:** Update TypeScript types for API responses
  - File: `/src/types/index.ts`
  - Add `translationJobIds?: string[]` to ItemResponse, ArticleResponse
  - Add `sourceLanguage?: string` to CreateItemRequest, CreateArticleRequest
  - Export translation-related types

---

### Phase 3: Translation Job Processing Enhancement (3-4 days)

- [ ] **Task 3.1:** Enhance job processor for content-specific handling
  - File: `/src/lib/job-queue/translation-jobs.ts` (extend from Epic 1)
  - Add content-aware job processing:
    ```typescript
    async function processTranslationJob(job: TranslationJob): Promise<void> {
      switch (job.entityType) {
        case 'item':
          await processItemTranslation(job);
          break;
        case 'article':
          await processArticleTranslation(job);
          break;
        case 'link':
          await processLinkTranslation(job);
          break;
        case 'tag':
          await processTagTranslation(job);
          break;
      }
    }
    ```

- [ ] **Task 3.2:** Implement item translation processor
  - Fetch item by ID
  - Translate `name` and `description` fields
  - Store in `item_translations` table
  - Update job status

- [ ] **Task 3.3:** Implement article translation processor
  - Fetch article by ID
  - Translate `title` and `description` fields
  - Store in `article_translations` table
  - Update job status

- [ ] **Task 3.4:** Implement link translation processor
  - Fetch link by ID
  - Translate `title` field only
  - Store in `link_translations` table
  - Update job status

- [ ] **Task 3.5:** Implement tag translation processor
  - Translate tag value
  - Store in `tag_translations` table
  - Mark as user tag (is_system_tag = false)
  - Update job status

- [ ] **Task 3.6:** Implement job prioritization
  - File: `/src/lib/job-queue/priority.ts`
  - Priority levels:
    1. **Priority 100:** Recently created content (last 5 minutes)
    2. **Priority 50:** Updated content
    3. **Priority 25:** Batch imports
    4. **Priority 10:** Retry failed translations
  - Job picker query orders by priority DESC, created_at ASC

- [ ] **Task 3.7:** Implement concurrency control
  - File: `/src/lib/job-queue/concurrency.ts`
  - Maximum 10 concurrent translation API calls
  - Semaphore or queue-based throttling
  - Respect provider rate limits

- [ ] **Task 3.8:** Implement stale job cleanup
  - Jobs stuck in 'processing' for > 5 minutes
  - Reset to 'queued' with incremented attempts
  - Run cleanup before picking new jobs

---

### Phase 4: Translation Status & Management APIs (2-3 days)

- [ ] **Task 4.1:** Create translation status API endpoint
  - File: `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`
  - GET handler returns full translation status
  - Include job status + stored translations
  - Cache-friendly response headers

- [ ] **Task 4.2:** Create retry failed translations endpoint
  - File: `/src/app/api/translations/retry/route.ts`
  - POST handler accepts entityType, entityId, optional languages[]
  - Find failed jobs for entity
  - Reset status to 'queued', reset attempts
  - Return count of jobs re-queued

- [ ] **Task 4.3:** Create manual translation override endpoint
  - File: `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
  - PUT handler accepts translated field values
  - Validate user has edit access to entity
  - UPSERT translation with status 'manual'
  - Set reviewed_by to current user ID

- [ ] **Task 4.4:** Create batch status endpoint for list views
  - File: `/src/app/api/translations/status/batch/route.ts`
  - POST handler accepts array of {entityType, entityId}
  - Return summary status for each entity
  - Optimized for dashboard list views

---

### Phase 5: Job Processing Trigger Setup (1-2 days)

- [ ] **Task 5.1:** Create job processing API route
  - File: `/src/app/api/admin/process-translations/route.ts`
  - POST handler triggers job processing
  - Accept `batchSize` parameter (default 10)
  - Return processing statistics
  - Secure with service role or admin auth

- [ ] **Task 5.2:** Set up Railway cron job (or alternative)
  - Configure cron to call process-translations endpoint
  - Recommended: every 30 seconds for low latency
  - Alternative: every 5 minutes for cost savings
  - Document cron configuration

- [ ] **Task 5.3:** Implement job monitoring endpoint
  - File: `/src/app/api/admin/translation-jobs/route.ts`
  - GET handler returns job queue statistics:
    - Queued count
    - Processing count
    - Completed (last hour)
    - Failed (last hour)
  - Filter by entityType, status

---

### Phase 6: Database Indexes & Optimization (1 day)

- [ ] **Task 6.1:** Create translation job indexes
  - Apply indexes from Architecture section
  - Use Supabase migration or MCP

- [ ] **Task 6.2:** Create translation lookup indexes
  - Fast lookup for displaying translated content:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
    ON item_translations(item_id, language);
  CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
    ON article_translations(article_id, language);
  CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
    ON link_translations(link_id, language);
  CREATE INDEX IF NOT EXISTS idx_tag_translations_tag_lang
    ON tag_translations(tag_key, language);
  ```

- [ ] **Task 6.3:** Add updated_at trigger for translations
  ```sql
  CREATE OR REPLACE FUNCTION update_translation_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER item_translations_updated
    BEFORE UPDATE ON item_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_translation_timestamp();

  -- Repeat for article_translations, link_translations
  ```

---

### Phase 7: Testing & Validation (2-3 days)

- [ ] **Task 7.1:** Write unit tests for content translation module
  - Test queueContentTranslations function
  - Test entity-specific triggers
  - Test source language detection

- [ ] **Task 7.2:** Write unit tests for job processing
  - Test job pickup and locking
  - Test entity-specific processors
  - Test retry logic
  - Test concurrency control

- [ ] **Task 7.3:** Write integration tests for API endpoints
  - Test item creation triggers translations
  - Test article creation triggers translations
  - Test translation status endpoint
  - Test retry endpoint
  - Test manual override endpoint

- [ ] **Task 7.4:** Write E2E tests
  - Create item -> verify translations queued
  - Wait for processing -> verify translations stored
  - Check translation status -> verify complete
  - Retry failed -> verify re-queued

- [ ] **Task 7.5:** Performance testing
  - Test with 100+ concurrent translation jobs
  - Measure job completion time (target < 60s)
  - Verify rate limiting works correctly

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Translation trigger timing | On save, not on change detection | Simpler, matches PRD requirement, avoids complexity of diffing |
| Update strategy | Delete + re-queue | Clean slate ensures consistency, simpler than partial updates |
| Job priority system | Numeric priority column | Flexible, easy to adjust, allows fine-grained control |
| Concurrency control | Application-level semaphore | Simpler than DB-level, sufficient for current scale |
| Manual override status | 'manual' distinct from 'completed' | Preserves audit trail, shows human intervention |
| Tag translation caching | Global (not per-account) | User tags can be shared, reduces API costs |

---

## File Changes Summary

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/index.ts` | Module exports |
| `/src/lib/content-translation/content-translation.ts` | Main orchestrator |
| `/src/lib/content-translation/content-translation.types.ts` | TypeScript types |
| `/src/lib/content-translation/source-language.ts` | Language detection |
| `/src/lib/content-translation/triggers/item-trigger.ts` | Item translation trigger |
| `/src/lib/content-translation/triggers/article-trigger.ts` | Article translation trigger |
| `/src/lib/content-translation/triggers/link-trigger.ts` | Link translation trigger |
| `/src/lib/content-translation/triggers/tag-trigger.ts` | Tag translation trigger |
| `/src/lib/content-translation/storage/translation-storage.ts` | Storage utilities |
| `/src/lib/content-translation/storage/translation-status.ts` | Status utilities |
| `/src/lib/job-queue/priority.ts` | Job prioritization |
| `/src/lib/job-queue/concurrency.ts` | Concurrency control |
| `/src/app/api/translations/status/[entityType]/[entityId]/route.ts` | Status API |
| `/src/app/api/translations/status/batch/route.ts` | Batch status API |
| `/src/app/api/translations/retry/route.ts` | Retry API |
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Manual override API |
| `/src/app/api/admin/translation-jobs/route.ts` | Job monitoring API |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `/src/app/api/admin/items/route.ts` | Add translation triggers to POST |
| `/src/app/api/admin/items/[id]/route.ts` | Add translation triggers to PUT |
| `/src/app/api/admin/articles/route.ts` | Add translation triggers to POST |
| `/src/app/api/admin/articles/[id]/route.ts` | Add translation triggers to PUT |
| `/src/app/api/admin/items/[id]/links/route.ts` | Add translation triggers |
| `/src/lib/job-queue/translation-jobs.ts` | Add content-specific processors |
| `/src/types/index.ts` | Add translation types, extend API types |
| `/src/lib/supabase.ts` | Ensure translation table types are present |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation API costs spike | Medium | Medium | Monitor usage, set budget alerts, batch where possible |
| Rate limiting causes delays | Medium | Low | Queue with backoff, priority system, batch wisely |
| Poor translation quality | Medium | Medium | Include context, allow manual override in Epic 5 |
| Job queue backlog | Low | Medium | Prioritization, scaling, monitoring alerts |
| Data inconsistency | Low | High | Transactional updates, validation, idempotent operations |
| Epic 1 not complete | Medium | Critical | **Validate Epic 1 completion before starting** |

---

## Effort Estimate

| Phase | Estimate | Confidence |
|-------|----------|------------|
| Phase 1: Content Translation Infrastructure | 2-3 days | High |
| Phase 2: Modify Existing Content APIs | 2-3 days | High |
| Phase 3: Job Processing Enhancement | 3-4 days | Medium |
| Phase 4: Status & Management APIs | 2-3 days | High |
| Phase 5: Job Processing Trigger Setup | 1-2 days | High |
| Phase 6: Database Optimization | 1 day | High |
| Phase 7: Testing & Validation | 2-3 days | Medium |
| **Total** | **13-19 days** | Medium |

**Notes:**
- Estimates assume Epic 1 is fully implemented
- Single developer working full-time
- Parallel work possible between phases 2-3 and phase 4
- Buffer included for API integration issues

---

## Dependencies & Prerequisites

### Required Before Starting

1. **Epic 1 Complete (Plan-110):**
   - [ ] Translation tables created (article_translations, item_translations, link_translations, tag_translations, translation_jobs)
   - [ ] Source language columns added to items, item_articles, item_links
   - [ ] Translation service operational (`/src/lib/translation-service/`)
   - [ ] Job queue infrastructure in place (`/src/lib/job-queue/`)
   - [ ] System tags pre-seeded in tag_translations

2. **Environment Variables:**
   ```
   TRANSLATION_PROVIDER=claude|openai
   ANTHROPIC_API_KEY=sk-ant-xxx
   OPENAI_API_KEY=sk-xxx
   ```

### Downstream Dependencies

- **Epic 4 (Guest Experience):** Will consume translations from these tables
- **Epic 5 (Owner Translation Management):** Will use status APIs and manual override

---

## Open Questions

1. **Translation on Import:** When bulk importing items, should translations be queued individually or batched with lower priority?
   - *Recommendation:* Queue with priority 25 (lower than single creates), process in background

2. **Partial Field Updates:** If only `name` is updated but not `description`, should we re-translate both?
   - *Recommendation:* Re-translate all fields to ensure consistency (simpler implementation)

3. **Translation Retention:** When an item is updated, should we keep old translations until new ones complete?
   - *Recommendation:* Delete immediately, guests see source language while translating (matches PRD fallback behavior)

4. **Tag Deduplication:** If user creates tag "coffee maker" in French, and another user creates same tag in English?
   - *Recommendation:* Treat as separate tags (by key), each gets translated. Future epic could add tag normalization.

---

## Acceptance Criteria Mapping

| PRD Criteria | Implementation Task |
|--------------|---------------------|
| AC-1: New item triggers translation to 5 languages | Task 2.2 |
| AC-1: New article triggers translation to 5 languages | Task 2.3 |
| AC-1: New link triggers translation to 5 languages | Task 2.4 |
| AC-1: Source language is recorded correctly | Tasks 2.1, 2.2, 2.3, 2.4 |
| AC-2: Updated content re-triggers translation | Tasks 2.2, 2.3, 2.4 |
| AC-2: Old translations are replaced | Tasks 2.2, 2.3, 2.4 |
| AC-2: Update doesn't block user action | Tasks 2.2, 2.3, 2.4 (async) |
| AC-3: User tags are translated on first use | Task 2.5 |
| AC-3: Translated tags are cached for reuse | Task 3.5 |
| AC-3: System tags display in correct language | Epic 1 (pre-seeded) |
| AC-4: Jobs process within 60 seconds | Tasks 3.1-3.5, 5.1-5.2 |
| AC-4: Failed jobs retry with backoff | Task 3.1, Epic 1 retry logic |
| AC-4: Rate limiting is respected | Task 3.7 |
| AC-4: Concurrent job limit enforced | Task 3.7 |
| AC-5: Translation status API works | Task 4.1 |
| AC-5: Status updates in real-time | Task 4.1 |
| AC-5: Failed translations are identifiable | Task 4.1 |
| AC-6: Owners can edit translations | Task 4.3 |
| AC-6: Manual edits are preserved | Task 4.3 |
| AC-6: Manual status is tracked | Task 4.3 |

---

## References

- PRD: `/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md`
- Epic 1 PRD: `/docs/prd/PRD_L10N_Epic1_Foundation.md`
- Epic 1 Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/messages_post)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Railway Cron Jobs](https://docs.railway.app/reference/cron-jobs)

---

## Appendix A: Translation Context Templates

For optimal translation quality, use these context strings:

```typescript
const TRANSLATION_CONTEXTS = {
  item_name: {
    contentType: 'item_name' as const,
    domain: 'property_rental_appliances',
    systemPrompt: 'Translate the name of a household item or appliance in a vacation rental context. Keep it concise and natural.'
  },
  item_description: {
    contentType: 'item_description' as const,
    domain: 'property_rental_appliances',
    systemPrompt: 'Translate a description of a household item for vacation rental guests. Maintain helpful, friendly tone.'
  },
  article_title: {
    contentType: 'article_title' as const,
    domain: 'property_rental_instructions',
    systemPrompt: 'Translate the title of an instruction article for vacation rental guests. Format: "[How to/Safety/etc] - [Item Name]"'
  },
  article_description: {
    contentType: 'article_description' as const,
    domain: 'property_rental_instructions',
    systemPrompt: 'Translate instruction content for vacation rental guests. Keep instructions clear and actionable.'
  },
  link_title: {
    contentType: 'link_title' as const,
    domain: 'property_rental_media',
    systemPrompt: 'Translate a media link title (video, PDF, etc.) for vacation rental guests. Keep it descriptive but concise.'
  },
  tag: {
    contentType: 'tag' as const,
    domain: 'property_rental_categorization',
    systemPrompt: 'Translate a category tag for household items. Single word or short phrase, suitable for filtering/searching.'
  }
};
```

---

## Appendix B: Job State Machine

```
      +------------------+
      |                  |
      v                  |
  +-------+   picked   +------------+
  | QUEUED| ---------> | PROCESSING |
  +-------+            +------------+
                            |
              +-------------+-------------+
              |                           |
         success                     failure
              |                           |
              v                           v
      +-----------+                   +--------+
      | COMPLETED |                   | FAILED |
      +-----------+                   +--------+
                                          |
                                          | (if attempts < 3)
                                          |
                                          +---> Re-queue as QUEUED
                                                (with exponential backoff)
```

---

## Appendix C: Sample Job Records

```json
// Recently created item - high priority
{
  "id": "job-abc-123",
  "entity_type": "item",
  "entity_id": "item-xyz-789",
  "source_language": "fr",
  "target_language": "en",
  "status": "queued",
  "priority": 100,
  "attempts": 0,
  "created_at": "2026-01-17T12:00:00Z"
}

// Retried job - lower priority
{
  "id": "job-def-456",
  "entity_type": "article",
  "entity_id": "article-uvw-321",
  "source_language": "en",
  "target_language": "de",
  "status": "queued",
  "priority": 10,
  "attempts": 2,
  "error_message": "Rate limit exceeded",
  "created_at": "2026-01-17T11:30:00Z"
}

// Completed job
{
  "id": "job-ghi-789",
  "entity_type": "link",
  "entity_id": "link-rst-654",
  "source_language": "es",
  "target_language": "nl",
  "status": "completed",
  "priority": 50,
  "attempts": 1,
  "created_at": "2026-01-17T11:45:00Z",
  "started_at": "2026-01-17T11:45:05Z",
  "completed_at": "2026-01-17T11:45:08Z"
}
```

---

*Plan generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Depends on: Plan-110-L10N-Epic1-Foundation*
