# REQ-338: Create Re-Translate API Endpoint - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Reference:** docs/gen_requests_epic5.md - REQ-338
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.3

---

## Summary

Create a POST API endpoint at `/src/app/api/translations/retranslate/route.ts` that allows property owners to trigger re-translation of existing content. The endpoint supports bulk operations, provides control over manual edit preservation, and returns detailed processing results including job counts and skipped counts.

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| API Route Structure | `/src/app/api/admin/articles/route.ts` | Authentication, account context extraction, error handling |
| Auth Validation | `validateAdminAuth()` from `/src/lib/auth-server` | Request authentication and user validation |
| Job Queue Integration | `/src/lib/job-queue/translation-jobs.ts` | `createBatchTranslationJobs()` for queuing translation jobs |
| Translation Types | `/src/lib/job-queue/translation-jobs.types.ts` | `EntityType`, `SupportedLanguage`, `CreateBatchJobsParams` |
| Response Format | Existing API routes | `{ success: boolean, data?: T, error?: string }` pattern |

### Dependencies from Epic 1

| Dependency | Status | Location |
|------------|--------|----------|
| Translation tables | Available | `article_translations`, `item_translations`, `link_translations` |
| Translation jobs table | Available | `translation_jobs` |
| Job queue functions | Available | `/src/lib/job-queue/translation-jobs.ts` |
| Supported languages | Available | `en`, `fr`, `es`, `de`, `nl`, `it` |

### Database Schema Reference

**Translation Status Values:**
- `pending` - Not started
- `processing` - In progress
- `completed` - Done
- `failed` - Error occurred
- `manual` - Human-translated/manually edited

**Translation Tables:**
- `article_translations` - Has `reviewed_by` column for manual edit tracking
- `item_translations` - Stores item name/description translations
- `link_translations` - Stores link title translations

---

## Architecture

### API Endpoint Design

```
POST /api/translations/retranslate
```

**Request Body:**
```typescript
interface RetranslateRequest {
  entities: Array<{
    type: 'article' | 'item' | 'link';
    id: string;
  }>;
  skipManualEdits?: boolean;  // Default: true (preserve manual edits)
}
```

**Response:**
```typescript
interface RetranslateResponse {
  success: boolean;
  data?: {
    jobCount: number;      // Number of translation jobs queued
    skippedCount: number;  // Number skipped due to manual edit protection
  };
  error?: string;
}
```

### Data Flow

```
Client Request
    │
    ▼
Validate Authentication (validateAdminAuth)
    │
    ▼
Extract Account Context (getAccountContext)
    │
    ▼
Parse & Validate Request Body
    │
    ▼
For Each Entity:
    ├── Verify entity exists
    ├── Verify user owns entity (via property → account)
    ├── If skipManualEdits=true:
    │   └── Query existing translations with status='manual'
    │       └── Exclude these language combinations
    └── Queue translation jobs for remaining languages
    │
    ▼
Return Summary (jobCount, skippedCount)
```

### Entity Ownership Validation

The endpoint must verify that the authenticated user owns all specified entities before processing:

1. **Articles**: `item_articles` → `items` → `properties` → `account_id`
2. **Items**: `items` → `properties` → `account_id`
3. **Links**: `item_links` → `items` → `properties` → `account_id`

---

## Implementation Tasks

### Task 1: Create API Route File
**File:** `/src/app/api/translations/retranslate/route.ts`

Create the basic route structure with:
- Import statements for auth, supabase, job queue
- POST handler function skeleton
- TypeScript interfaces for request/response

### Task 2: Implement Authentication & Account Context
Reuse patterns from existing admin API routes:
- Call `validateAdminAuth(request)` for authentication
- Extract account context using helper similar to articles API
- Return 401/403 errors for unauthorized requests

### Task 3: Implement Request Validation
Validate the request body:
- `entities` array must be non-empty
- Each entity must have valid `type` and `id`
- `skipManualEdits` defaults to `true` if not provided

### Task 4: Implement Entity Ownership Verification
For each entity in the request:
- Query the appropriate table chain to get `account_id`
- Verify it matches the user's account
- Collect entities that fail validation for error response

### Task 5: Implement Manual Edit Detection
When `skipManualEdits` is true:
- Query translation tables for records with `translation_status = 'manual'`
- For `article_translations`, also check `reviewed_by IS NOT NULL`
- Build list of entity-language combinations to skip

### Task 6: Implement Job Queuing
Use existing job queue infrastructure:
- Call `createBatchTranslationJobs()` from `/src/lib/job-queue/translation-jobs.ts`
- Pass appropriate `entityType`, `entityId`, and `targetLanguages`
- Exclude languages that have manual translations (if skipManualEdits=true)

### Task 7: Implement Response Building
Build the response with:
- `jobCount`: Total number of translation jobs successfully queued
- `skippedCount`: Total entity-language combinations skipped due to manual edit protection
- Error handling for partial failures

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/retranslate/route.ts` | Main API endpoint implementation |

### Existing Files to Import From (Read Only)

| File Path | Functions/Types to Use |
|-----------|------------------------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()` |
| `/src/lib/supabase.ts` | `supabaseAdmin`, `Database` types |
| `/src/lib/job-queue/translation-jobs.ts` | `createBatchTranslationJobs()` |
| `/src/lib/job-queue/translation-jobs.types.ts` | `EntityType`, `SupportedLanguage`, `CreateBatchJobsParams` |

### Database Tables Accessed (Read)

| Table | Purpose |
|-------|---------|
| `items` | Verify item ownership |
| `item_articles` | Verify article ownership |
| `item_links` | Verify link ownership |
| `properties` | Get account_id for ownership check |
| `account_users` | Verify user has access to account |
| `article_translations` | Check for manual edits |
| `item_translations` | Check for manual edits |
| `link_translations` | Check for manual edits |

### Database Tables Modified (Write)

| Table | Operation |
|-------|-----------|
| `translation_jobs` | Insert new jobs via `createBatchTranslationJobs()` |

---

## Acceptance Criteria Mapping

| Requirement | Implementation |
|-------------|----------------|
| Endpoint at `/src/app/api/translations/retranslate/route.ts` | Task 1 |
| POST requests with entity identifiers | Task 3 |
| Array of entity objects (type + id) | Task 3 |
| Boolean for manual edit handling | Task 3 |
| Skip manual edits when true | Task 5 |
| Queue all languages when false | Task 6 |
| Validate user owns entities | Task 4 |
| Reject unauthorized entities | Task 4 |
| Queue jobs per entity-language | Task 6 |
| Return jobCount | Task 7 |
| Return skippedCount | Task 7 |
| Handle non-existent entities | Task 4 |
| Handle malformed identifiers | Task 3 |
| Handle empty arrays | Task 3 |
| Support bulk operations | Task 6 |
| Enforce authentication | Task 2 |

---

## Error Handling

| Scenario | HTTP Status | Error Response |
|----------|-------------|----------------|
| Missing authentication | 401 | `{ success: false, error: 'Authentication required' }` |
| User lacks account access | 403 | `{ success: false, error: 'Access denied' }` |
| Entity not owned by user | 403 | `{ success: false, error: 'Access denied to one or more entities' }` |
| Empty entities array | 400 | `{ success: false, error: 'At least one entity is required' }` |
| Invalid entity type | 400 | `{ success: false, error: 'Invalid entity type: {type}' }` |
| Malformed entity ID | 400 | `{ success: false, error: 'Invalid entity ID format' }` |
| Entity not found | 404 | `{ success: false, error: 'Entity not found: {type}/{id}' }` |
| Job queue failure | 500 | `{ success: false, error: 'Failed to queue translation jobs' }` |

---

## Test Scenarios

1. **Happy Path - Single Entity**
   - POST with one article entity, skipManualEdits=false
   - Expect 5 jobs queued (excluding source language)

2. **Happy Path - Bulk Entities**
   - POST with 3 items, skipManualEdits=false
   - Expect 15 jobs queued (3 items × 5 languages)

3. **Manual Edit Protection**
   - POST with entity that has 2 manual translations
   - skipManualEdits=true
   - Expect 3 jobs queued, 2 skipped

4. **Overwrite Manual Edits**
   - POST with entity that has manual translations
   - skipManualEdits=false
   - Expect all 5 jobs queued, 0 skipped

5. **Unauthorized Entity**
   - POST with entity owned by different account
   - Expect 403 error

6. **Non-existent Entity**
   - POST with entity ID that doesn't exist
   - Expect 404 error

7. **Empty Request**
   - POST with empty entities array
   - Expect 400 error

---

## Code Example

```typescript
// /src/app/api/translations/retranslate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { createBatchTranslationJobs } from '@/lib/job-queue/translation-jobs';
import { EntityType, SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';

const ALL_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

interface RetranslateRequest {
  entities: Array<{ type: EntityType; id: string }>;
  skipManualEdits?: boolean;
}

export async function POST(request: NextRequest) {
  // 1. Validate authentication
  const authResult = await validateAdminAuth(request);
  if (authResult.error) return authResult.error;

  // 2. Parse and validate request body
  const body: RetranslateRequest = await request.json();
  // ... validation logic

  // 3. Verify ownership and queue jobs
  let totalJobCount = 0;
  let totalSkippedCount = 0;

  for (const entity of body.entities) {
    // Verify ownership
    // Check for manual translations if skipManualEdits=true
    // Queue jobs for valid language combinations
  }

  return NextResponse.json({
    success: true,
    data: {
      jobCount: totalJobCount,
      skippedCount: totalSkippedCount
    }
  });
}
```

---

## Dependencies

### Prerequisites (Must Be Complete)
- Epic 1 Foundation: Translation tables and job queue ✅
- REQ-243: Translation job queue module ✅
- REQ-244: Job processor ✅

### Blocks (Dependent Tasks)
- REQ-310: TranslationPreviewPanel (uses re-translate endpoint)
- REQ-321: BulkTranslationBar (uses re-translate endpoint for bulk ops)

---

## References

- PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
- Job Queue Functions: `/src/lib/job-queue/translation-jobs.ts`
- Example API Route: `/src/app/api/admin/articles/route.ts`
