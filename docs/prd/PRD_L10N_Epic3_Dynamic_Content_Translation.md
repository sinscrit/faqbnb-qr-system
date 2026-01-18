# PRD: Localization Epic 3 - Dynamic Content Translation

**Document ID:** PRD_L10N_Epic3
**Created:** 2026-01-17
**Last Modified:** 2026-01-17
**Status:** Draft
**Epic Size:** L (Large)
**Priority:** P1 - High
**Depends On:** Epic 1 (Foundation)

---

## 1. Executive Summary

This epic implements the system for automatically translating user-generated content (items, articles, links, tags) when owners create or update content. The translation happens asynchronously in the background, storing pre-translated versions for all 6 supported languages. This ensures guests can view content in their preferred language without real-time translation delays.

### Key Concept
Content is created in the app's current language (source language) and automatically translated to the other 5 languages. Translations are stored in the database for instant retrieval.

---

## 2. Goals & Objectives

### Primary Goals
1. Automatically translate user content to all supported languages upon save
2. Track source language for all content
3. Store translations efficiently for fast retrieval
4. Re-translate content when the source is updated
5. Translate user-created tags alongside system tags

### Success Criteria
- Content saved in any language triggers translation to other 5 languages
- Translations complete within 60 seconds of save
- Translation status is visible to content owners
- Failed translations don't block content saving
- Source language is always preserved and identifiable

---

## 3. Content Types to Translate

### 3.1 Items
**Table:** `items`
**Fields to Translate:**
- `name` (VARCHAR 255) - Item display name
- `description` (TEXT) - Item description

**Example:**
```
Source (French): "Machine a laver Samsung"
→ English: "Samsung Washing Machine"
→ Spanish: "Lavadora Samsung"
→ German: "Samsung Waschmaschine"
→ Dutch: "Samsung Wasmachine"
→ Italian: "Lavatrice Samsung"
```

### 3.2 Articles
**Table:** `item_articles`
**Fields to Translate:**
- `title` (VARCHAR 255) - Article title
- `description` (TEXT) - Article description/content

**Example:**
```
Source (English): "How to Use the Dishwasher"
→ French: "Comment utiliser le lave-vaisselle"
→ Spanish: "Como usar el lavavajillas"
...
```

### 3.3 Links
**Table:** `item_links`
**Fields to Translate:**
- `title` (VARCHAR 255) - Link display title

**Note:** URLs are NOT translated.

### 3.4 Tags
**Table:** `items.tags` (array column)
**Stored in:** `tag_translations` table

**Tag Categories:**
1. **System Tags** - Pre-defined (e.g., `#room.kitchen`)
   - Pre-seeded translations in Epic 1
   - Not user-editable

2. **User Tags** - Created by users (e.g., `appliance`, `frequently-used`)
   - Translated on first use
   - Cached for reuse

---

## 4. Functional Requirements

### 4.1 Source Language Detection

#### FR-1.1: Language on Save
When content is saved, the source language is determined by:
1. User's current app language setting (primary)
2. Account's preferred language (fallback)
3. English (default fallback)

#### FR-1.2: Source Language Storage
Store source language in the content table:
```sql
items.source_language = 'fr'
item_articles.source_language = 'fr'
item_links.source_language = 'fr'
```

#### FR-1.3: Language Override
Allow users to explicitly specify source language if different from app language:
```typescript
interface ContentSaveRequest {
  content: string;
  sourceLanguage?: string; // Optional override
}
```

### 4.2 Translation Trigger System

#### FR-2.1: Create Trigger
When new content is created:
1. Save content with source language
2. Queue translation jobs for 5 target languages
3. Return success immediately (don't wait for translations)

#### FR-2.2: Update Trigger
When existing content is updated:
1. Update source content and source language
2. Delete existing translations for this content
3. Queue new translation jobs for 5 target languages
4. Return success immediately

#### FR-2.3: Delete Trigger
When content is deleted:
- Translations are automatically deleted via CASCADE

#### FR-2.4: Batch Operations
When multiple items are saved (e.g., import):
- Queue all translation jobs
- Process in batches to avoid rate limiting
- Track overall batch progress

### 4.3 Translation Job Processing

#### FR-3.1: Job Creation
Create translation jobs in the `translation_jobs` table:
```typescript
interface TranslationJob {
  entity_type: 'item' | 'article' | 'link' | 'tag';
  entity_id: string;
  source_language: string;
  target_language: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number; // Higher = more urgent
  attempts: number;
  error_message?: string;
}
```

#### FR-3.2: Job Prioritization
Priority order:
1. Recently created content (user is likely waiting)
2. Updated content
3. Batch imports
4. Retry failed translations

#### FR-3.3: Job Processing Flow
```
Job Picked Up
    │
    ▼
Fetch Source Content
    │
    ▼
Call Translation API
    │
    ├── Success ──► Store Translation ──► Mark Completed
    │
    └── Failure ──► Increment Attempts
                        │
                        ├── Attempts < 3 ──► Re-queue with backoff
                        │
                        └── Attempts >= 3 ──► Mark Failed
```

#### FR-3.4: Rate Limiting
- Maximum 10 concurrent translation API calls
- Exponential backoff on rate limit errors
- Respect provider-specific limits

#### FR-3.5: Translation API Context
Provide context to improve translation quality:
```typescript
{
  text: "Steamer",
  sourceLanguage: "en",
  targetLanguage: "fr",
  context: {
    contentType: "item_name",
    domain: "property_rental_appliances",
    maxLength: 255
  }
}
```

### 4.4 Translation Storage

#### FR-4.1: Storage Pattern
Store translations in dedicated tables (created in Epic 1):
- `item_translations`
- `article_translations`
- `link_translations`
- `tag_translations`

#### FR-4.2: Translation Record Structure
```typescript
interface TranslationRecord {
  id: string;
  entity_id: string;
  language: string;
  translated_content: {
    name?: string;      // For items
    title?: string;     // For articles/links
    description?: string;
  };
  translation_status: 'pending' | 'completed' | 'failed' | 'manual';
  translated_at: Date;
  reviewed_by?: string;
}
```

#### FR-4.3: Upsert Logic
When translation completes:
- If translation exists for (entity_id, language): UPDATE
- If not exists: INSERT
- Never create duplicates

### 4.5 Tag Translation

#### FR-5.1: System Tags
Pre-seeded in Epic 1. No runtime translation needed.

#### FR-5.2: User Tag Translation
When a user creates a new tag:
1. Check if translation already exists in `tag_translations`
2. If not, queue translation jobs for the tag
3. Store translations for reuse by all users

#### FR-5.3: Tag Lookup
When displaying tags:
```sql
SELECT
  t.tag_key,
  COALESCE(tt.translated_value, t.tag_key) as display_value
FROM unnest(items.tags) as t(tag_key)
LEFT JOIN tag_translations tt
  ON tt.tag_key = t.tag_key
  AND tt.language = :userLanguage
```

### 4.6 Translation Status Tracking

#### FR-6.1: Per-Entity Status
Track translation status for each entity:
```typescript
interface EntityTranslationStatus {
  entity_id: string;
  entity_type: string;
  source_language: string;
  translations: {
    [language: string]: {
      status: 'pending' | 'completed' | 'failed';
      translated_at?: Date;
      reviewed?: boolean;
    }
  }
}
```

#### FR-6.2: Status API
Provide API endpoint to check translation status:
```
GET /api/translations/status/{entityType}/{entityId}

Response:
{
  "entityId": "abc-123",
  "sourceLanguage": "en",
  "translations": {
    "fr": { "status": "completed", "translatedAt": "2026-01-17T10:00:00Z" },
    "es": { "status": "completed", "translatedAt": "2026-01-17T10:00:01Z" },
    "de": { "status": "pending" },
    "nl": { "status": "failed", "error": "Rate limit exceeded" },
    "it": { "status": "completed", "translatedAt": "2026-01-17T10:00:02Z" }
  }
}
```

#### FR-6.3: Batch Status
For listing pages, include translation status summary:
```typescript
interface ItemWithTranslationStatus {
  ...item,
  translationStatus: 'complete' | 'partial' | 'pending' | 'failed';
  translatedLanguages: string[];
  pendingLanguages: string[];
}
```

---

## 5. API Changes

### 5.1 Create/Update Item
**Existing Endpoint:** `POST /api/admin/items`

**Changes:**
- Accept optional `sourceLanguage` parameter
- Queue translation jobs after successful save
- Return translation job IDs in response

```typescript
// Request
POST /api/admin/items
{
  "name": "Lave-vaisselle",
  "description": "Comment utiliser...",
  "sourceLanguage": "fr"  // New field
}

// Response
{
  "success": true,
  "data": { ...item },
  "translationJobIds": ["job-1", "job-2", "job-3", "job-4", "job-5"]
}
```

### 5.2 Create/Update Article
**Existing Endpoint:** `POST /api/admin/items/{id}/articles`

**Changes:** Same pattern as items.

### 5.3 Translation Status Endpoint
**New Endpoint:** `GET /api/translations/status/{entityType}/{entityId}`

See FR-6.2 for response format.

### 5.4 Retry Failed Translations
**New Endpoint:** `POST /api/translations/retry`

```typescript
// Request
{
  "entityType": "article",
  "entityId": "abc-123",
  "languages": ["nl"]  // Optional, retry all if omitted
}

// Response
{
  "success": true,
  "jobsQueued": 1
}
```

### 5.5 Manual Translation Override
**New Endpoint:** `PUT /api/translations/{entityType}/{entityId}/{language}`

```typescript
// Request
{
  "title": "Manually corrected title",
  "description": "Manually corrected description"
}

// Response
{
  "success": true,
  "translation": {
    ...translation,
    "translation_status": "manual",
    "reviewed_by": "user-id"
  }
}
```

---

## 6. Database Changes

### 6.1 New Columns (if not added in Epic 1)
```sql
ALTER TABLE items ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE item_articles ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';
ALTER TABLE item_links ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';
```

### 6.2 Indexes for Translation Queries
```sql
-- Fast lookup of translations by entity and language
CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
  ON item_translations(item_id, language);

CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
  ON article_translations(article_id, language);

CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
  ON link_translations(link_id, language);

-- Fast lookup of pending jobs
CREATE INDEX IF NOT EXISTS idx_translation_jobs_pending
  ON translation_jobs(status, created_at)
  WHERE status IN ('queued', 'processing');
```

### 6.3 Trigger for Updated Timestamp
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
```

---

## 7. Translation Service Integration

### 7.1 Service Module
File: `/src/lib/translation-service.ts`

```typescript
interface TranslationService {
  translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    context?: TranslationContext
  ): Promise<TranslationResult>;

  translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string,
    context?: TranslationContext
  ): Promise<TranslationResult[]>;

  translateToAllLanguages(
    text: string,
    sourceLanguage: string,
    context?: TranslationContext
  ): Promise<Record<string, string>>;
}

interface TranslationContext {
  contentType: 'item_name' | 'item_description' | 'article_title' | 'article_description' | 'link_title' | 'tag';
  domain: string;
  maxLength?: number;
}

interface TranslationResult {
  translatedText: string;
  confidence?: number;
  provider: 'claude' | 'openai';
}
```

### 7.2 Translation Prompt Template
```
You are translating content for a property rental application.
The content describes items, appliances, and instructions for guests.

Translate the following {contentType} from {sourceLanguage} to {targetLanguage}.
Keep the translation natural and appropriate for the context.
{maxLength ? `Keep the translation under ${maxLength} characters.` : ''}

Source text:
{text}

Provide only the translated text, nothing else.
```

### 7.3 Error Handling
```typescript
class TranslationError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'API_ERROR' | 'INVALID_LANGUAGE' | 'CONTENT_TOO_LONG',
    public retryable: boolean
  ) {
    super(message);
  }
}
```

---

## 8. Background Job Implementation

### 8.1 Job Queue Processor
File: `/src/lib/translation-queue.ts`

```typescript
interface TranslationQueueProcessor {
  // Start processing jobs
  start(): void;

  // Stop processing (graceful shutdown)
  stop(): Promise<void>;

  // Process a single job
  processJob(job: TranslationJob): Promise<void>;

  // Get queue statistics
  getStats(): QueueStats;
}

interface QueueStats {
  queued: number;
  processing: number;
  completed_last_hour: number;
  failed_last_hour: number;
}
```

### 8.2 Implementation Options

#### Option A: Polling (Recommended for MVP)
```typescript
// Poll every 5 seconds for new jobs
setInterval(async () => {
  const jobs = await getQueuedJobs(10); // Get up to 10
  await Promise.all(jobs.map(processJob));
}, 5000);
```

#### Option B: Supabase Realtime
```typescript
// Subscribe to new jobs
supabase
  .channel('translation_jobs')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'translation_jobs'
  }, handleNewJob)
  .subscribe();
```

#### Option C: Edge Function with Cron
```typescript
// Supabase Edge Function triggered by cron
Deno.serve(async () => {
  const jobs = await getQueuedJobs(50);
  await processJobs(jobs);
  return new Response('OK');
});
```

### 8.3 Job Locking
Prevent duplicate processing:
```sql
UPDATE translation_jobs
SET status = 'processing', started_at = now()
WHERE id = (
  SELECT id FROM translation_jobs
  WHERE status = 'queued'
  ORDER BY priority DESC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

---

## 9. Non-Functional Requirements

### NFR-1: Performance
- Translation jobs complete within 60 seconds of queuing
- No blocking of user actions during translation
- Bulk operations translate in background without timeout

### NFR-2: Reliability
- Failed translations retry automatically (up to 3 times)
- System recovers from translation API outages
- No data loss if translation fails

### NFR-3: Scalability
- Handle 100+ concurrent translation jobs
- Support accounts with 1000+ items
- Efficient batch processing for imports

### NFR-4: Observability
- Log all translation requests and results
- Track translation latency metrics
- Alert on high failure rates

---

## 10. Acceptance Criteria

### AC-1: Content Creation Translation
- [ ] New item triggers translation to 5 languages
- [ ] New article triggers translation to 5 languages
- [ ] New link triggers translation to 5 languages
- [ ] Source language is recorded correctly

### AC-2: Content Update Translation
- [ ] Updated content re-triggers translation
- [ ] Old translations are replaced
- [ ] Update doesn't block user action

### AC-3: Tag Translation
- [ ] User tags are translated on first use
- [ ] Translated tags are cached for reuse
- [ ] System tags display in correct language

### AC-4: Translation Job Processing
- [ ] Jobs process within 60 seconds
- [ ] Failed jobs retry with backoff
- [ ] Rate limiting is respected
- [ ] Concurrent job limit enforced

### AC-5: Status Tracking
- [ ] Translation status API works
- [ ] Status updates in real-time
- [ ] Failed translations are identifiable

### AC-6: Manual Override
- [ ] Owners can edit translations
- [ ] Manual edits are preserved
- [ ] Manual status is tracked

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation API costs spike | Medium | Medium | Monitor usage, set budget alerts |
| Rate limiting causes delays | Medium | Low | Queue with backoff, batch wisely |
| Poor translation quality | Medium | Medium | Allow manual override, review UI |
| Job queue backlog | Low | Medium | Prioritization, scaling, monitoring |
| Data inconsistency | Low | High | Transactional updates, validation |

---

## 12. Dependencies

### Upstream
- Epic 1: Foundation (translation tables, service setup)

### Downstream
- Epic 4: Guest Experience (requires translations to exist)
- Epic 5: Owner Translation Management (uses translation data)

---

## 13. Out of Scope

- Real-time translation (streaming)
- Translation memory / TM integration
- Professional translation workflow
- Image/video translation
- URL translation

---

## 14. Appendix

### A. Translation Job State Machine
```
      ┌──────────────────────────────────────┐
      │                                      │
      ▼                                      │
  ┌───────┐    picked up    ┌────────────┐  │
  │ QUEUED│ ──────────────► │ PROCESSING │  │
  └───────┘                 └────────────┘  │
                                  │         │
                    ┌─────────────┼─────────┘
                    │             │      retry (attempts < 3)
                    │ success     │ failure
                    ▼             ▼
              ┌───────────┐  ┌────────┐
              │ COMPLETED │  │ FAILED │
              └───────────┘  └────────┘
```

### B. Sample Translation Job Record
```json
{
  "id": "job-abc-123",
  "entity_type": "article",
  "entity_id": "article-xyz-789",
  "source_language": "en",
  "target_language": "fr",
  "status": "queued",
  "priority": 10,
  "attempts": 0,
  "created_at": "2026-01-17T10:00:00Z",
  "started_at": null,
  "completed_at": null,
  "error_message": null
}
```

### C. Translation API Cost Estimation
Assuming OpenAI GPT-4 pricing (~$0.03/1K tokens):
- Average content: ~100 tokens source + ~150 tokens translation
- Cost per translation: ~$0.0075
- Per content item (5 languages): ~$0.0375
- 1000 items fully translated: ~$37.50
