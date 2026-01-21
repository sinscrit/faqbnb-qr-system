# REQ-E03-021: Create Translation Status API Endpoint - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks
**Created:** 2026-01-20
**Last Modified:** 2026-01-21
**Epic:** 3 - Dynamic Content Translation
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.1
**Size:** M (Medium)
**Status:** Implemented

**Overview Document:** `/docs/REQ-E03-021-create-translation-status-api-endpoint-overview.md`
**Requirements:** `/docs/gen_requests_epic3.md` - Request #21
**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`

---

## Summary

Create a public GET API endpoint at `/api/translations/status/[entityType]/[entityId]` that returns comprehensive translation status for any content entity (item, article, link, tag). The endpoint combines job processing status with stored translation records to enable UI components to display accurate translation status badges, progress indicators, and language availability.

---

## Prerequisites

Before starting implementation, verify:

- [x] REQ-E03-006 (Translation Status Utilities) is complete - provides `getEntityTranslationStatus` function ---implemented:verified exists at @/lib/content-translation/storage/translation-status.ts---
- [x] Epic 1 translation infrastructure is in place (translation_jobs table, translation tables) ---implemented:verified exists---
- [x] Supabase client is configured at `/src/lib/supabase.ts` ---implemented:verified exists---
- [x] Next.js 15.5.9 App Router patterns are followed ---implemented:using async params pattern---

---

## Task Breakdown

### Task 1: Create Directory Structure and Route File

**File:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

**Subtasks:**

1.1. Create the nested directory structure for the API route
```
mkdir -p src/app/api/translations/status/[entityType]/[entityId]
```

1.2. Create the route.ts file with basic structure:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  // Implementation to follow
}
```

**Acceptance Criteria:**
- [x] Directory structure exists at correct path ---implemented:created src/app/api/translations/status/[entityType]/[entityId]---
- [x] Route file is created with proper Next.js 15 App Router exports ---implemented:route.ts with GET and OPTIONS handlers--- -unit tested-
- [x] File compiles without TypeScript errors ---ts-check: passed (0 errors, baseline: 0)---

---

### Task 2: Implement Request Parameter Validation

**File:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

**Subtasks:**

2.1. Define valid entity types constant:
```typescript
const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;
type EntityType = typeof VALID_ENTITY_TYPES[number];
```

2.2. Define UUID validation regex:
```typescript
const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
```

2.3. Implement entityType validation:
```typescript
const { entityType, entityId } = await params;

if (!VALID_ENTITY_TYPES.includes(entityType as EntityType)) {
  return NextResponse.json(
    { success: false, error: 'Invalid entity type. Must be one of: item, article, link, tag' },
    { status: 400 }
  );
}
```

2.4. Implement entityId UUID format validation:
```typescript
if (!UUID_REGEX.test(entityId)) {
  return NextResponse.json(
    { success: false, error: 'Invalid entityId format' },
    { status: 400 }
  );
}
```

**Acceptance Criteria:**
- [x] Invalid entityType returns 400 with descriptive error message ---implemented:returns 400 with "Invalid entity type. Must be one of: item, article, link, tag"--- -unit tested-
- [x] Invalid UUID format returns 400 with descriptive error message ---implemented:returns 400 with "Invalid entityId format" for non-tag entities--- -unit tested-
- [x] Valid parameters proceed to entity existence check ---implemented:switch statement routes to verifyEntityExists--- -unit tested-
- [x] Error responses follow project pattern: `{ success: false, error: string }` ---implemented:all error responses use this format--- -unit tested-

---

### Task 3: Implement Entity Existence Verification

**File:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

**Subtasks:**

3.1. Create helper function for entity existence check:
```typescript
import { supabase } from '@/lib/supabase';

async function verifyEntityExists(
  entityType: EntityType,
  entityId: string
): Promise<{ exists: boolean; sourceLanguage?: string }> {
  const tableMap: Record<EntityType, { table: string; idColumn: string; sourceLanguageColumn?: string }> = {
    item: { table: 'items', idColumn: 'id', sourceLanguageColumn: 'source_language' },
    article: { table: 'item_articles', idColumn: 'id', sourceLanguageColumn: 'source_language' },
    link: { table: 'item_links', idColumn: 'id', sourceLanguageColumn: 'source_language' },
    tag: { table: 'tag_translations', idColumn: 'tag_key' }
  };

  const config = tableMap[entityType];

  // For tags, check tag_translations table
  if (entityType === 'tag') {
    const { data, error } = await supabase
      .from('tag_translations')
      .select('tag_key, language')
      .eq('tag_key', entityId)
      .limit(1);

    return { exists: !error && data && data.length > 0, sourceLanguage: 'en' };
  }

  // For other entities, check main table
  const { data, error } = await supabase
    .from(config.table)
    .select(`id${config.sourceLanguageColumn ? `, ${config.sourceLanguageColumn}` : ''}`)
    .eq(config.idColumn, entityId)
    .single();

  if (error || !data) {
    return { exists: false };
  }

  return {
    exists: true,
    sourceLanguage: config.sourceLanguageColumn ? data[config.sourceLanguageColumn] || 'en' : 'en'
  };
}
```

3.2. Integrate existence check into route handler:
```typescript
const entityCheck = await verifyEntityExists(entityType as EntityType, entityId);
if (!entityCheck.exists) {
  return NextResponse.json(
    { success: false, error: 'Entity not found' },
    { status: 404 }
  );
}
```

**Acceptance Criteria:**
- [x] Function queries correct table based on entity type ---implemented:verifyEntityExists uses switch with explicit queries per table--- -unit tested-
- [x] Non-existent entities return 404 with error message ---implemented:returns 404 with "Entity not found"--- -unit tested-
- [x] Source language is retrieved for items, articles, and links ---implemented:queries source_language column from each table--- -unit tested-
- [x] Tags default to 'en' as source language ---implemented:tag case returns sourceLanguage: 'en'--- -unit tested-
- [x] Database errors are handled gracefully ---implemented:try-catch wrapper returns exists:false on error--- -unit tested-

---

### Task 4: Implement Translation Status Aggregation

**File:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

**Subtasks:**

4.1. Define supported languages constant:
```typescript
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
```

4.2. Create helper function for fetching translation jobs:
```typescript
async function fetchTranslationJobs(entityType: EntityType, entityId: string) {
  const { data, error } = await supabase
    .from('translation_jobs')
    .select('id, target_language, status, attempts, error_message, created_at, started_at, completed_at')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('target_language');

  if (error) {
    console.error('Error fetching translation jobs:', error);
    return [];
  }
  return data || [];
}
```

4.3. Create helper function for fetching stored translations:
```typescript
async function fetchStoredTranslations(entityType: EntityType, entityId: string) {
  const tableMap: Record<EntityType, { table: string; idColumn: string }> = {
    item: { table: 'item_translations', idColumn: 'item_id' },
    article: { table: 'article_translations', idColumn: 'article_id' },
    link: { table: 'link_translations', idColumn: 'link_id' },
    tag: { table: 'tag_translations', idColumn: 'tag_key' }
  };

  const config = tableMap[entityType];

  const { data, error } = await supabase
    .from(config.table)
    .select('language, translation_status, translated_at, updated_at')
    .eq(config.idColumn, entityId);

  if (error) {
    console.error('Error fetching stored translations:', error);
    return [];
  }
  return data || [];
}
```

4.4. Create main aggregation function:
```typescript
interface LanguageStatus {
  status: 'not_started' | 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
  translatedAt?: string;
  error?: string;
}

interface TranslationStatusData {
  entityId: string;
  entityType: EntityType;
  sourceLanguage: string;
  overallStatus: 'fully_translated' | 'partially_translated' | 'pending' | 'not_started' | 'has_failures';
  completionPercentage: number;
  lastUpdated: string | null;
  languages: Record<string, LanguageStatus>;
  completedLanguages: string[];
  pendingLanguages: string[];
  failedLanguages: string[];
}

async function getTranslationStatus(
  entityType: EntityType,
  entityId: string,
  sourceLanguage: string
): Promise<TranslationStatusData> {
  const [jobs, translations] = await Promise.all([
    fetchTranslationJobs(entityType, entityId),
    fetchStoredTranslations(entityType, entityId)
  ]);

  // Target languages exclude source language
  const targetLanguages = SUPPORTED_LANGUAGES.filter(l => l !== sourceLanguage);

  // Build language status map
  const languages: Record<string, LanguageStatus> = {};
  const completedLanguages: string[] = [];
  const pendingLanguages: string[] = [];
  const failedLanguages: string[] = [];
  let lastUpdated: string | null = null;

  for (const lang of targetLanguages) {
    // Check stored translations first
    const storedTranslation = translations.find(t => t.language === lang);
    const job = jobs.find(j => j.target_language === lang);

    if (storedTranslation?.translation_status === 'completed' || storedTranslation?.translation_status === 'manual') {
      languages[lang] = {
        status: storedTranslation.translation_status as 'completed' | 'manual',
        translatedAt: storedTranslation.translated_at || storedTranslation.updated_at
      };
      completedLanguages.push(lang);

      // Track most recent update
      const updateTime = storedTranslation.translated_at || storedTranslation.updated_at;
      if (updateTime && (!lastUpdated || updateTime > lastUpdated)) {
        lastUpdated = updateTime;
      }
    } else if (job) {
      // Use job status
      if (job.status === 'completed') {
        languages[lang] = {
          status: 'completed',
          translatedAt: job.completed_at
        };
        completedLanguages.push(lang);
        if (job.completed_at && (!lastUpdated || job.completed_at > lastUpdated)) {
          lastUpdated = job.completed_at;
        }
      } else if (job.status === 'failed') {
        languages[lang] = {
          status: 'failed',
          error: job.error_message || undefined
        };
        failedLanguages.push(lang);
      } else if (job.status === 'processing') {
        languages[lang] = { status: 'processing' };
        pendingLanguages.push(lang);
      } else if (job.status === 'queued') {
        languages[lang] = { status: 'pending' };
        pendingLanguages.push(lang);
      }
    } else {
      languages[lang] = { status: 'not_started' };
    }
  }

  // Calculate completion percentage
  const totalTargetLanguages = targetLanguages.length;
  const completionPercentage = totalTargetLanguages > 0
    ? Math.round((completedLanguages.length / totalTargetLanguages) * 100)
    : 0;

  // Determine overall status
  let overallStatus: TranslationStatusData['overallStatus'];
  if (failedLanguages.length > 0) {
    overallStatus = 'has_failures';
  } else if (completedLanguages.length === totalTargetLanguages) {
    overallStatus = 'fully_translated';
  } else if (completedLanguages.length > 0) {
    overallStatus = 'partially_translated';
  } else if (pendingLanguages.length > 0) {
    overallStatus = 'pending';
  } else {
    overallStatus = 'not_started';
  }

  return {
    entityId,
    entityType,
    sourceLanguage,
    overallStatus,
    completionPercentage,
    lastUpdated,
    languages,
    completedLanguages,
    pendingLanguages,
    failedLanguages
  };
}
```

**Acceptance Criteria:**
- [x] Jobs and translations are fetched in parallel for efficiency ---implemented:delegated to getEntityTranslationStatus from REQ-E03-006 which uses parallel fetching--- -unit tested-
- [x] All target languages (excluding source) are evaluated ---implemented:getEntityTranslationStatus handles this via getTargetLanguages helper--- -unit tested-
- [x] Status priorities: stored translation > job status > not_started ---implemented:determineLanguageStatus in REQ-E03-006 handles priority--- -unit tested-
- [x] Completion percentage is calculated correctly (0-100) ---implemented:mapStatusToApiResponse extracts completionPercentage from StatusResult--- -unit tested-
- [x] Overall status correctly reflects aggregate state ---implemented:mapStatusToApiResponse maps overallStatus with overallStatusMap--- -unit tested-
- [x] lastUpdated reflects most recent translation timestamp ---implemented:extracts lastUpdatedAt from StatusResult--- -unit tested-
- [x] Language arrays are correctly populated ---implemented:builds completedLanguages, pendingLanguages, failedLanguages arrays--- -unit tested-

---

### Task 5: Implement Cache Header Logic

**File:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

**Subtasks:**

5.1. Create function to generate appropriate cache headers:
```typescript
function getCacheHeaders(statusData: TranslationStatusData): HeadersInit {
  if (statusData.overallStatus === 'fully_translated') {
    // Cache fully translated content for 60 seconds
    return {
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
      'ETag': `"${statusData.lastUpdated || Date.now()}"`,
      'Last-Modified': statusData.lastUpdated || new Date().toISOString()
    };
  }

  // No caching for incomplete translations
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}
```

**Acceptance Criteria:**
- [x] Fully translated content has max-age=60 ---implemented:getCacheHeaders returns 'public, max-age=60, s-maxage=60, stale-while-revalidate=30' for fully_translated--- -unit tested-
- [x] Pending/partial/failed content has no-cache headers ---implemented:returns 'no-cache, no-store, must-revalidate' for other statuses--- -unit tested-
- [x] ETag is based on lastUpdated timestamp ---implemented:ETag: lastUpdated || Date.now()--- -unit tested-
- [x] Last-Modified header is included ---implemented:Last-Modified: lastUpdated || new Date().toISOString()--- -unit tested-

---

### Task 6: Implement Complete Route Handler

**File:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

**Subtasks:**

6.1. Assemble complete GET handler with all components:
```typescript
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
    const entityCheck = await verifyEntityExists(entityType as EntityType, entityId);
    if (!entityCheck.exists) {
      return NextResponse.json(
        { success: false, error: 'Entity not found' },
        { status: 404 }
      );
    }

    // 4-6. Get translation status
    const statusResult = await getTranslationStatus(
      entityType as EntityType,
      entityId,
      entityCheck.sourceLanguage || 'en'
    );

    // 7. Determine cache headers
    const cacheHeaders = getCacheHeaders(statusResult);

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

**Acceptance Criteria:**
- [x] All validation steps execute in correct order ---implemented:GET handler validates entityType, entityId, verifies existence, then gets status--- -unit tested-
- [x] Success response includes full status data ---implemented:returns { success: true, data: apiData } with TranslationStatusApiData--- -unit tested-
- [x] Error handling catches and logs unexpected errors ---implemented:try-catch logs to console.error and returns generic error--- -unit tested-
- [x] 500 response for internal errors ---implemented:catch block returns { success: false, error: 'Internal server error' }--- -unit tested-
- [x] Response follows project pattern: `{ success: boolean, data?: object, error?: string }` ---implemented:all responses use this pattern--- -unit tested-

---

### Task 7: Add TypeScript Type Definitions

**File:** `/src/types/index.ts` (modifications)

**Subtasks:**

7.1. Add translation status types to `/src/types/index.ts`:
```typescript
// Translation Status API Types (REQ-E03-021)

export type TranslationEntityType = 'item' | 'article' | 'link' | 'tag';

export type TranslationLanguageStatus =
  | 'not_started'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'manual';

export type TranslationOverallStatus =
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'not_started'
  | 'has_failures';

export interface LanguageTranslationStatus {
  status: TranslationLanguageStatus;
  translatedAt?: string;
  error?: string;
}

export interface TranslationStatusData {
  entityId: string;
  entityType: TranslationEntityType;
  sourceLanguage: string;
  overallStatus: TranslationOverallStatus;
  completionPercentage: number;
  lastUpdated: string | null;
  languages: Record<string, LanguageTranslationStatus>;
  completedLanguages: string[];
  pendingLanguages: string[];
  failedLanguages: string[];
}

export interface TranslationStatusResponse {
  success: true;
  data: TranslationStatusData;
}

export interface TranslationStatusErrorResponse {
  success: false;
  error: string;
}
```

**Acceptance Criteria:**
- [x] All translation status types are defined ---implemented:added TranslationEntityType, TranslationLanguageStatus, TranslationOverallStatus, ApiLanguageTranslationStatus, TranslationStatusData, TranslationStatusResponse, TranslationStatusErrorResponse--- -unit tested-
- [x] Types are exported from `/src/types/index.ts` ---implemented:all types exported at end of file--- -unit tested-
- [x] Types match the API response structure exactly ---implemented:TranslationStatusData matches response data structure--- -unit tested-
- [x] TypeScript compilation succeeds ---ts-check: passed (0 errors, baseline: 0)---

---

### Task 8: Integration with REQ-E03-006 (Conditional)

**Note:** If REQ-E03-006 (Translation Status Utilities) provides a `getEntityTranslationStatus` function, integrate it instead of the inline implementation.

**File:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

**Subtasks:**

8.1. If `/src/lib/content-translation/storage/translation-status.ts` exists with `getEntityTranslationStatus`:
```typescript
import { getEntityTranslationStatus } from '@/lib/content-translation';

// Replace inline getTranslationStatus with:
const statusResult = await getEntityTranslationStatus(entityType, entityId);
```

8.2. If the utility doesn't exist, the inline implementation from Task 4 serves as the primary implementation.

**Acceptance Criteria:**
- [x] If utility exists, it is used instead of inline code ---implemented:imports and uses getEntityTranslationStatus from @/lib/content-translation, maps result via mapStatusToApiResponse--- -unit tested-
- [x] If utility doesn't exist, inline implementation works correctly ---implemented:N/A - utility exists and is used---
- [x] Either approach returns identical response format ---implemented:mapStatusToApiResponse converts StatusTranslationStatusResult to TranslationStatusApiData--- -unit tested-

---

### Task 9: Add CORS Headers (Optional)

**File:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

**Subtasks:**

9.1. Add CORS headers for cross-origin requests if needed:
```typescript
// Add to response headers
const headers = {
  ...cacheHeaders,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Content-Type'
};

return NextResponse.json(
  { success: true, data: statusResult },
  { status: 200, headers }
);
```

9.2. Add OPTIONS handler for preflight requests:
```typescript
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
```

**Acceptance Criteria:**
- [x] CORS headers included if cross-origin access required ---implemented:all responses include Access-Control-Allow-Origin: *, Access-Control-Allow-Methods: GET, Access-Control-Allow-Headers: Content-Type--- -unit tested-
- [x] OPTIONS preflight handler responds correctly ---implemented:OPTIONS handler returns 204 with CORS headers--- -unit tested-
- [x] Only GET method is allowed ---implemented:only GET and OPTIONS handlers exported--- -unit tested-

---

## Verification Checklist

After implementation, verify each acceptance criterion from the overview document:

### Route Handler
- [x] GET endpoint exists at `/api/translations/status/[entityType]/[entityId]`
- [x] Validates entityType against supported types (item, article, link, tag)
- [x] Returns 400 for unsupported entity types with clear error message
- [x] Validates entityId format as UUID
- [x] Returns 400 for invalid UUID format
- [x] Verifies entity exists before checking translation status
- [x] Returns 404 when entity does not exist
- [x] Returns 200 with JSON payload for valid requests

### Response Payload
- [x] Includes overall status enumeration value
- [x] Includes numeric completion percentage (0-100)
- [x] Includes per-language status objects
- [x] Each language status includes language code and status
- [x] Includes timestamp of most recent translation update
- [x] Includes array of completed language codes
- [x] Includes array of pending language codes
- [x] Includes array of failed language codes

### Cache Headers
- [x] Cache-Control max-age=60 for fully translated content
- [x] Cache-Control no-cache for partial/pending content
- [x] ETag header from translation timestamp
- [x] Last-Modified header from translation timestamp

### Error Handling
- [x] Database errors return 500 with error payload
- [x] All errors follow `{ success: false, error: string }` pattern

### Type Safety
- [x] TypeScript types defined for all interfaces
- [x] Types exported from `/src/types/index.ts`
- [x] No TypeScript compilation errors

### Performance
- [x] Endpoint completes within 500ms for typical requests (delegated to REQ-E03-006)
- [x] Parallel database queries where possible (handled by REQ-E03-006)

---

## Test Cases

### Unit Tests

| Test ID | Description | Input | Expected Output |
|---------|-------------|-------|-----------------|
| U1 | Invalid entity type | `GET /api/translations/status/invalid/uuid` | 400, error message |
| U2 | Invalid UUID format | `GET /api/translations/status/item/not-a-uuid` | 400, error message |
| U3 | Valid params, entity not found | `GET /api/translations/status/item/valid-but-missing-uuid` | 404, error message |
| U4 | Valid item, fully translated | `GET /api/translations/status/item/{id}` | 200, overallStatus: 'fully_translated' |
| U5 | Valid item, partially translated | `GET /api/translations/status/item/{id}` | 200, overallStatus: 'partially_translated' |
| U6 | Valid item, pending translations | `GET /api/translations/status/item/{id}` | 200, overallStatus: 'pending' |
| U7 | Valid item, no translations | `GET /api/translations/status/item/{id}` | 200, overallStatus: 'not_started' |
| U8 | Valid item, has failures | `GET /api/translations/status/item/{id}` | 200, overallStatus: 'has_failures' |
| U9 | Valid article | `GET /api/translations/status/article/{id}` | 200, valid response |
| U10 | Valid link | `GET /api/translations/status/link/{id}` | 200, valid response |
| U11 | Valid tag | `GET /api/translations/status/tag/{key}` | 200, valid response |

### Integration Tests

| Test ID | Description | Steps | Expected |
|---------|-------------|-------|----------|
| I1 | Full item workflow | Create item -> Queue translations -> Check status | Status reflects jobs |
| I2 | Cache header validation | Request fully translated item twice | Second request uses cache |
| I3 | Completion percentage | Create item with 3/5 languages done | 60% completion |

---

## Files Summary

### Files to Create

| Path | Purpose |
|------|---------|
| `/src/app/api/translations/status/[entityType]/[entityId]/route.ts` | Main API route handler |

### Files to Modify

| Path | Changes |
|------|---------|
| `/src/types/index.ts` | Add translation status type definitions |

---

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| REQ-E03-006 Translation Status Utilities | Soft | Can work with or without |
| Supabase client | Required | Exists at `/src/lib/supabase.ts` |
| Translation tables | Required | From Epic 1 |
| Next.js 15 App Router | Required | Project uses this pattern |

---

## Related Tasks

| Task ID | Relationship |
|---------|--------------|
| REQ-E03-006 | Provides utility functions (dependency) |
| REQ-E03-022 | Retry failed translations endpoint (related) |
| REQ-E03-023 | Manual translation override endpoint (related) |
| REQ-E03-024 | Batch status endpoint (extends this pattern) |

---

## Notes for Implementation

1. **Database Query Efficiency:** Use parallel queries with `Promise.all` for jobs and translations to minimize response time.

2. **Source Language Handling:** The source language should be fetched from the entity record where possible. Tags default to 'en'.

3. **Status Priority:** When both a job and stored translation exist for a language, prefer the stored translation status as it represents the final state.

4. **Index Usage:** Ensure the queries benefit from indexes defined in Epic 3 architecture:
   - `idx_translation_jobs_entity` on `(entity_type, entity_id, target_language)`
   - `idx_item_translations_lookup` on `(item_id, language)`

5. **Error Logging:** Log all database errors with context for debugging but don't expose internal details to API consumers.

6. **Type Consistency:** Ensure the response types exactly match what the frontend components expect for status display.
