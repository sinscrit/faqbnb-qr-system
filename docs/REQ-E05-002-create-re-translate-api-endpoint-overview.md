# REQ-E05-002: Bulk Content Re-Translation Request API Endpoint

**Document Type**: Implementation Overview
**Created**: 2026-01-19
**Last Modified**: 2026-01-19
**Request ID**: REQ-E05-002
**Epic**: Epic 5 - Owner Translation Management
**Phase**: 1 - API Endpoints
**Task ID**: 1.3
**Size**: L (Large)
**Implementation Plan Reference**: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

---

## 1. Summary

This task implements a POST API endpoint at `/api/translations/retranslate` that allows property owners to request re-translation of their content. The endpoint supports both individual and bulk operations across multiple entity types (items, articles, links), provides configurable handling of manually edited translations (skip or overwrite), and returns detailed counts of jobs queued versus skipped.

---

## 2. Background & Context

### 2.1 Business Need

Property owners need the ability to refresh translations when:
- Source content has been significantly updated
- Translation quality needs improvement
- New translation providers or improved models become available
- Bulk correction of translations across multiple items

Currently, there is no API endpoint for owners to trigger re-translation, forcing them to manually delete translations or wait for automatic staleness detection.

### 2.2 Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| Translation tables | Epic 1 Foundation | Available |
| Translation jobs queue | `/src/lib/job-queue/` | Available |
| `createBatchTranslationJobs()` | `/src/lib/job-queue/translation-jobs.ts` | Available |
| `SupportedLanguage` type | `/src/lib/job-queue/translation-jobs.types.ts` | Available |
| `EntityType` type | `/src/lib/job-queue/translation-jobs.types.ts` | Available |
| Authentication helpers | `/src/lib/auth-server.ts` | Available |
| Translation status API | `/api/translations/status` (Task 1.1) | Dependency |

### 2.3 Database Schema Reference

**Translation tables (from Epic 1)**:
- `article_translations` - `translation_status` enum: 'pending', 'processing', 'completed', 'failed', 'manual'
- `item_translations` - same status enum
- `link_translations` - same status enum
- `tag_translations` - system tags table

**Translation jobs table**:
- `translation_jobs.entity_type` - 'article' | 'item' | 'link' | 'tag'
- `translation_jobs.entity_id` - UUID reference
- `translation_jobs.status` - 'queued' | 'processing' | 'completed' | 'failed'

---

## 3. Technical Design

### 3.1 API Specification

```typescript
// POST /api/translations/retranslate

// Request Body
interface RetranslateRequest {
  /** Array of entity references to re-translate */
  entities: {
    type: 'article' | 'item' | 'link';
    id: string;  // UUID
  }[];
  /** Target languages (all supported if omitted) */
  languages?: ('en' | 'fr' | 'es' | 'de' | 'nl' | 'it')[];
  /** Skip entities with status='manual' (default: true) */
  skipManualEdits?: boolean;
  /** Force overwrite even manual edits (default: false) */
  overwriteManualEdits?: boolean;
}

// Response
interface RetranslateResponse {
  success: boolean;
  /** Number of translation jobs queued */
  jobsQueued: number;
  /** Number skipped (manual edits, duplicates, unauthorized) */
  jobsSkipped: number;
  /** Reason for skipped jobs */
  skippedReason?: string;
  /** Details per entity (optional, for debugging) */
  details?: {
    entityType: string;
    entityId: string;
    languagesQueued: string[];
    languagesSkipped: string[];
    reason?: string;
  }[];
  error?: string;
}
```

### 3.2 Request Validation

1. **Required fields**: `entities` array with at least one entry
2. **Entity validation**: Each entity must have valid `type` and `id` (UUID format)
3. **Mutual exclusivity**: `skipManualEdits` and `overwriteManualEdits` cannot both be true
4. **Language validation**: If provided, languages must be valid ISO 639-1 codes from supported set
5. **Batch limit**: Maximum 100 entities per request (configurable)

### 3.3 Authorization Flow

```
Request
  │
  ▼
Validate auth (validateAdminAuth)
  │
  ▼
Extract account context
  │
  ▼
For each entity:
  ├── Query entity with property join
  ├── Check property.account_id matches user's account
  ├── Mark unauthorized entities for skip
  │
  ▼
Process authorized entities only
  │
  ▼
Return results with skip counts
```

### 3.4 Processing Logic

```typescript
async function processRetranslation(
  entities: EntityRef[],
  options: RetranslateOptions,
  accountId: string
): Promise<RetranslateResult> {
  let jobsQueued = 0;
  let jobsSkipped = 0;
  const details = [];

  // Determine target languages
  const targetLanguages = options.languages || ALL_SUPPORTED_LANGUAGES;

  for (const entity of entities) {
    // 1. Validate ownership
    const hasAccess = await validateEntityOwnership(entity, accountId);
    if (!hasAccess) {
      jobsSkipped += targetLanguages.length;
      details.push({ ...entity, reason: 'unauthorized' });
      continue;
    }

    // 2. Get source language from entity
    const sourceLanguage = await getEntitySourceLanguage(entity);

    // 3. Filter target languages (remove source)
    const validTargets = targetLanguages.filter(lang => lang !== sourceLanguage);

    // 4. Check for manual translations if skipManualEdits
    let languagesToQueue = validTargets;
    if (options.skipManualEdits && !options.overwriteManualEdits) {
      const manualLanguages = await getManualTranslationLanguages(entity);
      languagesToQueue = validTargets.filter(lang => !manualLanguages.includes(lang));
      jobsSkipped += manualLanguages.length;
    }

    // 5. Check for pending/processing jobs (avoid duplicates)
    const pendingJobs = await getPendingJobLanguages(entity);
    languagesToQueue = languagesToQueue.filter(lang => !pendingJobs.includes(lang));
    jobsSkipped += pendingJobs.length;

    // 6. Queue translation jobs
    if (languagesToQueue.length > 0) {
      const result = await createBatchTranslationJobs({
        entityType: entity.type,
        entityId: entity.id,
        sourceLanguage,
        targetLanguages: languagesToQueue,
      });

      if (result.success) {
        jobsQueued += result.data?.length || 0;
      } else {
        jobsSkipped += languagesToQueue.length;
      }
    }
  }

  return { success: true, jobsQueued, jobsSkipped };
}
```

### 3.5 Error Handling

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| No authentication | 401 | `{ success: false, error: "Unauthorized", code: "UNAUTHORIZED" }` |
| Empty entities array | 400 | `{ success: false, error: "Missing required field: entities" }` |
| Invalid entity type | 400 | `{ success: false, error: "Invalid entity type: {type}" }` |
| Conflicting options | 400 | `{ success: false, error: "Cannot specify both skipManualEdits and overwriteManualEdits" }` |
| Batch limit exceeded | 400 | `{ success: false, error: "Maximum 100 entities per request" }` |
| Partial failures | 200 | `{ success: true, jobsQueued: N, jobsSkipped: M, skippedReason: "..." }` |
| All unauthorized | 403 | `{ success: false, error: "No access to specified entities" }` |
| Server error | 500 | `{ success: false, error: "Internal server error" }` |

---

## 4. Implementation Tasks

### Task 4.1: Create API Route File Structure
- Create `/src/app/api/translations/retranslate/route.ts`
- Add appropriate TypeScript interfaces

### Task 4.2: Implement Request Validation
- Validate `entities` array is non-empty
- Validate each entity has valid `type` and `id`
- Validate UUID format for entity IDs
- Validate `languages` array if provided
- Check mutual exclusivity of skip/overwrite options
- Enforce batch size limit (100 entities)

### Task 4.3: Implement Authorization Check
- Use `validateAdminAuth()` for authentication
- Extract account context using existing pattern
- Create helper function to validate entity ownership by account
- Support mixed entity types in single request

### Task 4.4: Implement Manual Edit Detection
- Query translation tables for `translation_status = 'manual'`
- Return list of languages with manual translations per entity
- Support all three translation tables (article, item, link)

### Task 4.5: Implement Duplicate Job Prevention
- Check `translation_jobs` for pending/processing jobs
- Filter out languages with existing queued jobs
- Use existing `checkForDuplicateJob()` from concurrency-control module

### Task 4.6: Implement Job Queueing Logic
- Use `createBatchTranslationJobs()` from job-queue module
- Handle partial failures gracefully
- Aggregate counts across all entities

### Task 4.7: Implement Response Assembly
- Calculate totals: jobsQueued, jobsSkipped
- Compile skip reasons
- Optionally include per-entity details

### Task 4.8: Add Logging and Error Handling
- Structured logging for audit trail
- Error handling for each entity (don't fail entire batch)
- Log unauthorized access attempts

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Create

| File | Purpose |
|------|---------|
| `/src/app/api/translations/retranslate/route.ts` | Main API route handler |

### 5.2 Files to Reference (Read-Only)

| File | Usage |
|------|-------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()` function for authentication |
| `/src/lib/job-queue/translation-jobs.ts` | `createBatchTranslationJobs()` for queueing jobs |
| `/src/lib/job-queue/translation-jobs.types.ts` | `SupportedLanguage`, `EntityType` types |
| `/src/lib/job-queue/concurrency-control.ts` | `checkForDuplicateJob()` for duplicate prevention |
| `/src/lib/supabase.ts` | `supabaseAdmin` for database queries |
| `/src/app/api/admin/articles/route.ts` | Reference pattern for account context extraction |

### 5.3 Database Tables to Query

| Table | Operations | Purpose |
|-------|------------|---------|
| `items` | SELECT | Get item data and validate ownership |
| `item_articles` | SELECT | Get article data and validate ownership |
| `item_links` | SELECT | Get link data and validate ownership |
| `properties` | SELECT | Join for account_id validation |
| `article_translations` | SELECT | Check for manual translations |
| `item_translations` | SELECT | Check for manual translations |
| `link_translations` | SELECT | Check for manual translations |
| `translation_jobs` | SELECT | Check for pending/processing jobs |

### 5.4 Functions to Reuse

| Function | Source | Purpose |
|----------|--------|---------|
| `validateAdminAuth()` | `/src/lib/auth-server.ts` | Authentication |
| `createBatchTranslationJobs()` | `/src/lib/job-queue/translation-jobs.ts` | Queue jobs |
| `checkForDuplicateJob()` | `/src/lib/job-queue/concurrency-control.ts` | Prevent duplicates |
| `getJobsByEntity()` | `/src/lib/job-queue/translation-jobs.ts` | Check existing jobs |

---

## 6. Testing Requirements

### 6.1 Unit Tests

- Request validation (empty array, invalid types, UUID format)
- Options validation (mutual exclusivity)
- Batch limit enforcement

### 6.2 Integration Tests

- Authentication flow (unauthorized, valid user)
- Single entity re-translation
- Bulk re-translation (multiple entities)
- Mixed entity types in single request
- Manual edit skipping
- Manual edit overwriting
- Duplicate job prevention
- Partial authorization (some entities accessible, some not)

### 6.3 Edge Cases

- Empty entities array
- All entities unauthorized
- All translations already manual
- All jobs already pending
- Source language same as all targets
- Maximum batch size (100 entities)

---

## 7. Acceptance Criteria Mapping

| Requirement | Implementation |
|-------------|----------------|
| POST accepts array of entity references | Task 4.2: Request validation |
| Supports 'skipManualEdits' option | Task 4.4: Manual edit detection |
| Supports 'overwriteManualEdits' option | Task 4.4: Override logic |
| Validates ownership access to all entities | Task 4.3: Authorization check |
| Queues jobs for all supported languages | Task 4.6: Job queueing |
| Returns 'jobsQueued' count | Task 4.7: Response assembly |
| Returns 'jobsSkipped' count | Task 4.7: Response assembly |
| Handles mixed entity types | Task 4.3: Entity validation |
| Partial authorization failures clear messages | Task 4.7: Details array |
| Job creation failures don't block others | Task 4.6: Graceful handling |
| Prevents duplicate job creation | Task 4.5: Duplicate prevention |
| Empty request returns validation error | Task 4.2: Request validation |

---

## 8. Code Example

```typescript
// /src/app/api/translations/retranslate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import { createBatchTranslationJobs, EntityType, SupportedLanguage } from '@/lib/job-queue';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
const MAX_BATCH_SIZE = 100;

interface EntityRef {
  type: 'article' | 'item' | 'link';
  id: string;
}

interface RetranslateRequest {
  entities: EntityRef[];
  languages?: SupportedLanguage[];
  skipManualEdits?: boolean;
  overwriteManualEdits?: boolean;
}

// Helper: Get account context (pattern from articles/route.ts)
async function getAccountContext(request: NextRequest, userId: string, isAdmin: boolean, supabase: any) {
  // ... (follow existing pattern from /src/app/api/admin/articles/route.ts)
}

// Helper: Validate entity ownership
async function validateEntityOwnership(
  entity: EntityRef,
  accountId: string | null,
  isAdmin: boolean
): Promise<{ hasAccess: boolean; sourceLanguage: SupportedLanguage }> {
  const tableMap = {
    article: { table: 'item_articles', idCol: 'id', itemJoin: 'items!inner(property_id, properties!inner(account_id))' },
    item: { table: 'items', idCol: 'id', itemJoin: 'properties!inner(account_id)' },
    link: { table: 'item_links', idCol: 'id', itemJoin: 'items!inner(property_id, properties!inner(account_id))' },
  };

  const config = tableMap[entity.type];
  const { data, error } = await supabaseAdmin
    .from(config.table)
    .select(`source_language, ${config.itemJoin}`)
    .eq(config.idCol, entity.id)
    .single();

  if (error || !data) {
    return { hasAccess: false, sourceLanguage: 'en' };
  }

  // Extract account_id from nested structure
  const entityAccountId = extractAccountId(data, entity.type);
  const hasAccess = isAdmin || entityAccountId === accountId;
  const sourceLanguage = (data.source_language || 'en') as SupportedLanguage;

  return { hasAccess, sourceLanguage };
}

// Helper: Get manual translation languages
async function getManualTranslationLanguages(entity: EntityRef): Promise<SupportedLanguage[]> {
  const tableMap = {
    article: { table: 'article_translations', idCol: 'article_id' },
    item: { table: 'item_translations', idCol: 'item_id' },
    link: { table: 'link_translations', idCol: 'link_id' },
  };

  const config = tableMap[entity.type];
  const { data } = await supabaseAdmin
    .from(config.table)
    .select('language')
    .eq(config.idCol, entity.id)
    .eq('translation_status', 'manual');

  return (data || []).map(row => row.language as SupportedLanguage);
}

// Helper: Get pending job languages
async function getPendingJobLanguages(entity: EntityRef): Promise<SupportedLanguage[]> {
  const { data } = await supabaseAdmin
    .from('translation_jobs')
    .select('target_language')
    .eq('entity_type', entity.type)
    .eq('entity_id', entity.id)
    .in('status', ['queued', 'processing']);

  return (data || []).map(row => row.target_language as SupportedLanguage);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const { user, isAdmin, supabase } = authResult;

    // 2. Get account context
    const accountContext = await getAccountContext(request, user.id, isAdmin, supabase);
    if (accountContext.error) return accountContext.error;
    const { accountId } = accountContext;

    // 3. Parse and validate request
    const body: RetranslateRequest = await request.json();

    if (!body.entities || !Array.isArray(body.entities) || body.entities.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: entities' },
        { status: 400 }
      );
    }

    if (body.entities.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_BATCH_SIZE} entities per request` },
        { status: 400 }
      );
    }

    if (body.skipManualEdits && body.overwriteManualEdits) {
      return NextResponse.json(
        { success: false, error: 'Cannot specify both skipManualEdits and overwriteManualEdits' },
        { status: 400 }
      );
    }

    // Validate entity types
    const validTypes = ['article', 'item', 'link'];
    for (const entity of body.entities) {
      if (!validTypes.includes(entity.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid entity type: ${entity.type}` },
          { status: 400 }
        );
      }
    }

    // 4. Process entities
    const targetLanguages = body.languages || SUPPORTED_LANGUAGES;
    const skipManualEdits = body.skipManualEdits !== false; // Default true
    const overwriteManualEdits = body.overwriteManualEdits === true;

    let jobsQueued = 0;
    let jobsSkipped = 0;
    const details: any[] = [];
    let hasAnyAccess = false;

    for (const entity of body.entities) {
      const { hasAccess, sourceLanguage } = await validateEntityOwnership(
        entity, accountId, isAdmin
      );

      if (!hasAccess) {
        const skipCount = targetLanguages.filter(l => l !== sourceLanguage).length;
        jobsSkipped += skipCount;
        details.push({
          entityType: entity.type,
          entityId: entity.id,
          languagesQueued: [],
          languagesSkipped: targetLanguages.filter(l => l !== sourceLanguage),
          reason: 'unauthorized',
        });
        continue;
      }

      hasAnyAccess = true;
      let languagesToQueue = targetLanguages.filter(l => l !== sourceLanguage);
      const languagesSkipped: string[] = [];

      // Check for manual translations
      if (skipManualEdits && !overwriteManualEdits) {
        const manualLanguages = await getManualTranslationLanguages(entity);
        const filtered = languagesToQueue.filter(l => !manualLanguages.includes(l));
        const skipped = languagesToQueue.filter(l => manualLanguages.includes(l));
        languagesToQueue = filtered;
        languagesSkipped.push(...skipped);
      }

      // Check for pending jobs
      const pendingLanguages = await getPendingJobLanguages(entity);
      const beforePending = languagesToQueue.length;
      languagesToQueue = languagesToQueue.filter(l => !pendingLanguages.includes(l));
      const pendingSkipped = beforePending - languagesToQueue.length;
      if (pendingSkipped > 0) {
        languagesSkipped.push(...pendingLanguages.filter(l =>
          targetLanguages.includes(l) && l !== sourceLanguage
        ));
      }

      // Queue jobs
      if (languagesToQueue.length > 0) {
        const result = await createBatchTranslationJobs({
          entityType: entity.type as EntityType,
          entityId: entity.id,
          sourceLanguage,
          targetLanguages: languagesToQueue,
        });

        if (result.success && result.data) {
          jobsQueued += result.data.length;
        } else {
          languagesSkipped.push(...languagesToQueue);
        }
      }

      jobsSkipped += languagesSkipped.length;
      details.push({
        entityType: entity.type,
        entityId: entity.id,
        languagesQueued: languagesToQueue,
        languagesSkipped,
        reason: languagesSkipped.length > 0 ? 'manual_or_pending' : undefined,
      });
    }

    // 5. Check if any access was granted
    if (!hasAnyAccess) {
      return NextResponse.json(
        { success: false, error: 'No access to specified entities' },
        { status: 403 }
      );
    }

    // 6. Return response
    return NextResponse.json({
      success: true,
      jobsQueued,
      jobsSkipped,
      skippedReason: jobsSkipped > 0
        ? 'Some translations skipped due to manual edits, pending jobs, or unauthorized access'
        : undefined,
      details,
    });

  } catch (error) {
    console.error('Retranslate API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 9. Related Documents

- **Request Document**: `/docs/gen_requests_epic5.md` - REQ-E05-003
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Task 1.1**: REQ-E05-001 - Translation Status Query API Endpoint (dependency)
- **Task 1.2**: Manual Translation Update API Endpoint (related)
- **Epic 1 Plan**: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Job Queue Module**: `/src/lib/job-queue/` (existing implementation)

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | Claude (Tech Lead) | Initial implementation overview |
