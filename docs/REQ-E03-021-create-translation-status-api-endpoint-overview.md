# REQ-E03-021: Create Translation Status API Endpoint

**Document Type:** Implementation Overview
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Epic:** 3 - Dynamic Content Translation
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.1
**Size:** M (Medium)
**Status:** Not Started

---

## Summary

Create a public API endpoint that returns comprehensive translation status for any content entity (item, article, link, tag), combining job processing status with stored translation records. This endpoint enables UI components to display accurate translation status badges, progress indicators, and language availability to users.

---

## Background & Context

### Current State
- Translation infrastructure exists (service, job queue, types) from Epic 1
- Translation tables exist: `item_translations`, `article_translations`, `link_translations`, `tag_translations`, `translation_jobs`
- No API endpoint exists to query translation status
- No unified mechanism to determine if content is fully translated
- UI cannot show translation progress without direct database access

### Dependencies
- **REQ-E03-006:** Translation status utilities (provides `getEntityTranslationStatus` function)
- **Epic 1:** Translation service infrastructure, job queue, database tables

### Technical Context
| Component | Details |
|-----------|---------|
| Framework | Next.js 15.5.9 App Router |
| Database | Supabase PostgreSQL |
| Auth | Optional (public endpoint for read access) |
| Supported Languages | en, fr, es, de, nl, it |
| Entity Types | item, article, link, tag |

---

## Implementation Requirements

### Endpoint Specification

**Route Pattern:**
```
GET /api/translations/status/[entityType]/[entityId]
```

**File Location:**
```
/src/app/api/translations/status/[entityType]/[entityId]/route.ts
```

**Route Parameters:**
| Parameter | Type | Description | Validation |
|-----------|------|-------------|------------|
| `entityType` | string | Content type | Must be one of: item, article, link, tag |
| `entityId` | string | Entity UUID | Valid UUID format |

### Response Schema

**Success Response (200):**
```typescript
interface TranslationStatusResponse {
  success: true;
  data: {
    entityId: string;
    entityType: 'item' | 'article' | 'link' | 'tag';
    sourceLanguage: string;
    overallStatus: 'fully_translated' | 'partially_translated' | 'pending' | 'not_started' | 'has_failures';
    completionPercentage: number; // 0-100
    lastUpdated: string | null; // ISO 8601 timestamp
    languages: {
      [languageCode: string]: {
        status: 'not_started' | 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
        translatedAt?: string;
        error?: string;
      };
    };
    completedLanguages: string[];
    pendingLanguages: string[];
    failedLanguages: string[];
  };
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Invalid entityType | `{ success: false, error: 'Invalid entity type. Must be one of: item, article, link, tag' }` |
| 400 | Invalid entityId format | `{ success: false, error: 'Invalid entityId format' }` |
| 404 | Entity not found | `{ success: false, error: 'Entity not found' }` |
| 500 | Database/internal error | `{ success: false, error: 'Internal server error' }` |

### Caching Strategy

**Cache Headers:**
```typescript
// For fully translated content
{
  'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
  'ETag': `"${translationUpdateTimestamp}"`,
  'Last-Modified': translationUpdateTimestamp
}

// For pending/failed content
{
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}
```

---

## Data Flow

```
GET Request
    │
    ▼
Route Handler
    │
    ├── 1. Validate entityType parameter
    │       └── Return 400 if invalid
    │
    ├── 2. Validate entityId format (UUID)
    │       └── Return 400 if invalid
    │
    ├── 3. Verify entity exists in database
    │       │   Query: items/articles/links/tags table
    │       └── Return 404 if not found
    │
    ├── 4. Query translation jobs table
    │       SELECT * FROM translation_jobs
    │       WHERE entity_type = ? AND entity_id = ?
    │
    ├── 5. Query translations table (entity-specific)
    │       SELECT * FROM {entity}_translations
    │       WHERE {entity}_id = ?
    │
    ├── 6. Aggregate status data
    │       - Combine job status with stored translations
    │       - Calculate completion percentage
    │       - Determine overall status
    │       - Group languages by status
    │
    ├── 7. Determine cache headers
    │       - If fully_translated: max-age=60
    │       - Otherwise: no-cache
    │
    └── 8. Return response with appropriate headers
```

---

## Database Queries

### Entity Existence Check

```sql
-- For items
SELECT id FROM items WHERE id = $entityId;

-- For articles
SELECT id FROM item_articles WHERE id = $entityId;

-- For links
SELECT id FROM item_links WHERE id = $entityId;

-- For tags
SELECT tag_key FROM tag_translations WHERE tag_key = $entityId LIMIT 1;
-- Or check item_tags table if tags are stored there
```

### Translation Jobs Query

```sql
SELECT
  id,
  target_language,
  status,
  attempts,
  error_message,
  created_at,
  started_at,
  completed_at
FROM translation_jobs
WHERE entity_type = $entityType
  AND entity_id = $entityId
ORDER BY target_language;
```

### Translation Records Query (Example: Items)

```sql
SELECT
  language,
  translation_status,
  translated_at,
  updated_at
FROM item_translations
WHERE item_id = $entityId;
```

---

## Implementation Steps

### Step 1: Create Directory Structure
```
mkdir -p src/app/api/translations/status/[entityType]/[entityId]
```

### Step 2: Create Route Handler

**File:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// Import translation status utility when available from REQ-E03-006
// import { getEntityTranslationStatus } from '@/lib/content-translation';

// Valid entity types
const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;
type EntityType = typeof VALID_ENTITY_TYPES[number];

// UUID validation regex
const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  try {
    const { entityType, entityId } = await params;

    // 1. Validate entityType
    if (!VALID_ENTITY_TYPES.includes(entityType as EntityType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entity type. Must be one of: item, article, link, tag' },
        { status: 400 }
      );
    }

    // 2. Validate entityId format
    if (!UUID_REGEX.test(entityId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entityId format' },
        { status: 400 }
      );
    }

    // 3. Verify entity exists
    const entityExists = await verifyEntityExists(entityType as EntityType, entityId);
    if (!entityExists) {
      return NextResponse.json(
        { success: false, error: 'Entity not found' },
        { status: 404 }
      );
    }

    // 4-6. Get translation status (integrate with REQ-E03-006 utility)
    const statusResult = await getTranslationStatus(entityType as EntityType, entityId);

    // 7. Determine cache headers
    const cacheHeaders = statusResult.overallStatus === 'fully_translated'
      ? {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
          'ETag': `"${statusResult.lastUpdated || Date.now()}"`,
          'Last-Modified': statusResult.lastUpdated || new Date().toISOString()
        }
      : {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        };

    // 8. Return response
    return NextResponse.json(
      { success: true, data: statusResult },
      { status: 200, headers: cacheHeaders }
    );

  } catch (error) {
    console.error('Translation status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 3: Implement Helper Functions

```typescript
// Entity existence verification
async function verifyEntityExists(entityType: EntityType, entityId: string): Promise<boolean> {
  // Implementation maps entity type to table and query
}

// Translation status aggregation
async function getTranslationStatus(entityType: EntityType, entityId: string) {
  // Calls translation status utility from REQ-E03-006
  // Or implements inline aggregation
}
```

### Step 4: Add TypeScript Types

**File:** `/src/types/translation-status.ts` (or extend `/src/types/index.ts`)

```typescript
export interface TranslationStatusResponse {
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  sourceLanguage: string;
  overallStatus: 'fully_translated' | 'partially_translated' | 'pending' | 'not_started' | 'has_failures';
  completionPercentage: number;
  lastUpdated: string | null;
  languages: Record<string, LanguageStatus>;
  completedLanguages: string[];
  pendingLanguages: string[];
  failedLanguages: string[];
}

export interface LanguageStatus {
  status: 'not_started' | 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
  translatedAt?: string;
  error?: string;
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/[entityType]/[entityId]/route.ts` | Main API route handler |

### Files to Modify (if needed)

| File Path | Changes |
|-----------|---------|
| `/src/types/index.ts` | Add translation status response types |
| `/src/lib/content-translation/storage/translation-status.ts` | Integrate with status utility (if exists) |

### Functions to Implement

| Function | Location | Purpose |
|----------|----------|---------|
| `GET` | route.ts | Main route handler |
| `verifyEntityExists` | route.ts (or utility) | Check entity existence |
| `getTranslationStatus` | route.ts (or utility) | Aggregate status data |
| `calculateCompletionPercentage` | route.ts (or utility) | Calculate % complete |
| `determineOverallStatus` | route.ts (or utility) | Determine overall status enum |

### Database Tables Accessed (Read-Only)

| Table | Operation | Purpose |
|-------|-----------|---------|
| `items` | SELECT | Verify item exists |
| `item_articles` | SELECT | Verify article exists |
| `item_links` | SELECT | Verify link exists |
| `tag_translations` | SELECT | Verify tag exists (and get translations) |
| `translation_jobs` | SELECT | Get job status for entity |
| `item_translations` | SELECT | Get stored translations for items |
| `article_translations` | SELECT | Get stored translations for articles |
| `link_translations` | SELECT | Get stored translations for links |

---

## Testing Requirements

### Unit Tests

1. **Route parameter validation**
   - Invalid entity type returns 400
   - Invalid UUID format returns 400
   - Valid parameters proceed to processing

2. **Entity existence verification**
   - Non-existent entity returns 404
   - Existing entity proceeds to status aggregation

3. **Status aggregation**
   - Correct overall status calculation
   - Accurate completion percentage
   - Proper language grouping

### Integration Tests

1. **Full request flow**
   - Create entity → queue translations → check status
   - Verify status updates as jobs complete

2. **Cache header validation**
   - Fully translated content has max-age=60
   - Pending content has no-cache

### Test Cases

| Test | Expected Result |
|------|-----------------|
| GET with valid item ID, all translations complete | 200, overallStatus: 'fully_translated', completionPercentage: 100 |
| GET with valid item ID, partial translations | 200, overallStatus: 'partially_translated', completionPercentage: 60 |
| GET with valid item ID, pending translations | 200, overallStatus: 'pending', pendingLanguages populated |
| GET with valid item ID, no translations started | 200, overallStatus: 'not_started', completionPercentage: 0 |
| GET with valid item ID, some failures | 200, overallStatus: 'has_failures', failedLanguages populated |
| GET with invalid entity type | 400, error message |
| GET with invalid UUID | 400, error message |
| GET with non-existent entity | 404, error message |

---

## Performance Considerations

- **Target Response Time:** < 500ms for typical requests
- **Database Optimization:** Use indexes on `entity_type, entity_id` columns
- **Query Efficiency:** Use single queries with JOINs where possible
- **Caching:** 60-second cache for fully translated content reduces database load

### Required Database Indexes

```sql
-- Already defined in Epic 3 architecture
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity
  ON translation_jobs(entity_type, entity_id, target_language);

-- Translation lookup indexes
CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
  ON item_translations(item_id, language);
CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
  ON article_translations(article_id, language);
CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
  ON link_translations(link_id, language);
```

---

## Security Considerations

- **Public Read Access:** This endpoint provides read-only status information, safe for public access
- **No Sensitive Data:** Response contains only status metadata, no content
- **CORS:** Include appropriate CORS headers for cross-origin requests if needed
- **Rate Limiting:** Consider rate limiting if high traffic expected

---

## Acceptance Criteria

- [ ] GET endpoint exists at route matching pattern `/api/translations/status/[entityType]/[entityId]`
- [ ] Endpoint validates entityType parameter against supported types (item, article, link, tag)
- [ ] Endpoint returns 400 error for unsupported entity types
- [ ] Endpoint validates entityId format as valid UUID
- [ ] Endpoint queries database to verify entity existence before checking translation status
- [ ] Endpoint returns 404 error when entity does not exist
- [ ] Endpoint calls translation status utility to aggregate status data
- [ ] Endpoint returns 200 status with JSON payload for valid requests
- [ ] Response payload includes overall status enumeration value
- [ ] Response payload includes numeric completion percentage (0-100)
- [ ] Response payload includes array of per-language status objects
- [ ] Each language status object includes language code and status enumeration
- [ ] Response payload includes timestamp of most recent translation update
- [ ] Response payload includes array of completed language codes
- [ ] Response payload includes array of pending language codes
- [ ] Response payload includes array of failed language codes
- [ ] Response includes Cache-Control header with max-age=60 for fully translated content
- [ ] Response includes Cache-Control header with no-cache for partially translated or pending content
- [ ] Response includes ETag header computed from translation update timestamp
- [ ] Response includes Last-Modified header matching most recent translation update
- [ ] Endpoint handles database errors gracefully with 500 status and error payload
- [ ] Endpoint handles translation status utility errors gracefully
- [ ] TypeScript types are defined for request parameters, response payload, and error responses
- [ ] All types are properly exported from the API types module
- [ ] Endpoint execution completes within 500ms for typical content entities
- [ ] Endpoint includes appropriate CORS headers for cross-origin requests

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Request Specification:** `/docs/gen_requests_epic3.md` - REQ-E03-021
- **Translation Service Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Job Queue Types:** `/src/lib/job-queue/translation-jobs.types.ts`
- **Existing API Pattern:** `/src/app/api/items/[publicId]/route.ts`

---

## Related Tasks

| Task | Relationship |
|------|--------------|
| REQ-E03-006 | Provides `getEntityTranslationStatus` utility (dependency) |
| REQ-E03-022 | Create retry failed translations endpoint (related) |
| REQ-E03-023 | Create manual translation override endpoint (related) |
| REQ-E03-024 | Create batch status endpoint for list views (extends this pattern) |
