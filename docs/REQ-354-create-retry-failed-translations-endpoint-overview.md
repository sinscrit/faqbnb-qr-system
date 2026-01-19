# REQ-354: Create Retry Failed Translations Endpoint

**Generated:** 2026-01-19 00:00:00 UTC
**Last Modified:** 2026-01-19 00:00:00 UTC
**Request Source:** docs/gen_requests_epic3.md - Request #354
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.2
**Estimated Size:** M (Medium)
**Dependencies:** Epic 1 (Foundation) - translation_jobs table, Job Queue module

---

## Overview

This document provides the implementation breakdown for creating a retry failed translations API endpoint. The endpoint allows administrators and content owners to retry failed translation jobs for specific content entities, either for all languages or a targeted subset of languages.

### Purpose

When translation jobs fail due to API errors, rate limiting, or temporary service unavailability, they remain in failed state indefinitely. This endpoint provides a self-service mechanism for users to trigger retries without direct database access or waiting for manual intervention by system administrators.

### Business Value

- Reduces manual operational overhead for translation failure recovery
- Improves content completeness by enabling self-service retry capabilities
- Decreases time-to-resolution for translation issues affecting multiple content items
- Enables automated monitoring systems to trigger retries based on failure patterns

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Admin Auth Validation | `/src/lib/auth-server.ts` - `validateAdminAuth()` | Authentication and admin/user verification |
| Translation Test API | `/src/app/api/admin/translate/route.ts` | POST handler pattern, request validation |
| Job Queue Functions | `/src/lib/job-queue/translation-jobs.ts` | `getJobsByEntity()`, `updateJobStatus()` patterns |
| Job Queue Types | `/src/lib/job-queue/translation-jobs.types.ts` | `EntityType`, `JobStatus`, `TranslationJob` |
| Response Structure | `/src/app/api/admin/items/route.ts` | Standard success/error response format |

### Database Schema References

Translation jobs table (from Epic 1):

```typescript
// From /src/lib/job-queue/translation-jobs.types.ts
interface TranslationJob {
  id: string;
  entityType: EntityType;           // 'article' | 'item' | 'link' | 'tag'
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;                // 'queued' | 'processing' | 'completed' | 'failed'
  attempts: number;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
}
```

### Supported Languages

```typescript
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
```

### Valid Entity Types

```typescript
const VALID_ENTITY_TYPES = ['article', 'item', 'link', 'tag'] as const;
type EntityType = typeof VALID_ENTITY_TYPES[number];
```

---

## API Contract

### Endpoint

```
POST /api/translations/retry
```

### Request Body

```typescript
interface RetryTranslationRequest {
  /** Type of entity whose translations should be retried */
  entityType: 'article' | 'item' | 'link' | 'tag';
  /** UUID of the specific entity */
  entityId: string;
  /** Optional array of language codes to retry (if omitted, retries all failed) */
  languages?: SupportedLanguage[];
}
```

### Response Format

```typescript
interface RetryTranslationResponse {
  success: boolean;
  data?: {
    /** Number of jobs re-queued */
    jobsQueued: number;
    /** Languages that were re-queued */
    queuedLanguages: SupportedLanguage[];
    /** Details of each re-queued job */
    jobs: {
      id: string;
      entityType: EntityType;
      entityId: string;
      targetLanguage: SupportedLanguage;
      previousAttempts: number;
    }[];
  };
  error?: string;
  code?: string;
}
```

### Error Responses

| HTTP Code | Error Code | Description |
|-----------|------------|-------------|
| 400 | `INVALID_REQUEST` | Missing required fields or invalid JSON |
| 400 | `INVALID_ENTITY_TYPE` | entityType not one of allowed values |
| 400 | `INVALID_ENTITY_ID` | entityId not valid UUID format |
| 400 | `INVALID_LANGUAGE` | One or more languages in array invalid |
| 401 | `UNAUTHORIZED` | No valid session or token |
| 403 | `FORBIDDEN` | User lacks admin access |
| 404 | `NO_FAILED_JOBS` | No failed jobs found for entity (not an error, returns success with jobsQueued: 0) |
| 500 | `INTERNAL_ERROR` | Database or server error |

---

## Implementation Tasks

### Task 1: Create Route File Structure

**File:** `/src/app/api/translations/retry/route.ts`

Create the route file with proper imports and exports:

```typescript
/**
 * Retry Failed Translations API Endpoint
 * REQ-354: Allows retrying failed translation jobs for specific entities
 *
 * @module api/translations/retry
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import type { EntityType, SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
```

**Acceptance Criteria:**
- [ ] File created at `/src/app/api/translations/retry/route.ts`
- [ ] All required imports present
- [ ] POST handler exported
- [ ] File header comment with REQ number and date

---

### Task 2: Define Type Interfaces

Define local type interfaces for request validation and response:

```typescript
// =============================================================================
// Type Definitions
// =============================================================================

const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
const VALID_ENTITY_TYPES: readonly EntityType[] = ['article', 'item', 'link', 'tag'];

interface RetryTranslationRequest {
  entityType: EntityType;
  entityId: string;
  languages?: SupportedLanguage[];
}

interface RetryTranslationResponse {
  success: boolean;
  data?: {
    jobsQueued: number;
    queuedLanguages: SupportedLanguage[];
    jobs: {
      id: string;
      entityType: EntityType;
      entityId: string;
      targetLanguage: SupportedLanguage;
      previousAttempts: number;
    }[];
  };
  error?: string;
  code?: string;
}

interface ReQueuedJobInfo {
  id: string;
  entityType: EntityType;
  entityId: string;
  targetLanguage: SupportedLanguage;
  previousAttempts: number;
}
```

**Acceptance Criteria:**
- [ ] Request interface defined with all fields
- [ ] Response interface defined matching API contract
- [ ] Constants for valid entity types and languages

---

### Task 3: Implement Request Validation Function

Create a validation function for the request body:

```typescript
// =============================================================================
// Validation
// =============================================================================

const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

function validateRetryRequest(body: unknown): { valid: true; data: RetryTranslationRequest } | { valid: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required', code: 'INVALID_REQUEST' };
  }

  const request = body as Partial<RetryTranslationRequest>;

  // Validate entityType
  if (!request.entityType || typeof request.entityType !== 'string') {
    return { valid: false, error: 'entityType field is required', code: 'INVALID_REQUEST' };
  }
  if (!VALID_ENTITY_TYPES.includes(request.entityType as EntityType)) {
    return {
      valid: false,
      error: `entityType must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
      code: 'INVALID_ENTITY_TYPE'
    };
  }

  // Validate entityId
  if (!request.entityId || typeof request.entityId !== 'string') {
    return { valid: false, error: 'entityId field is required', code: 'INVALID_REQUEST' };
  }
  if (!UUID_REGEX.test(request.entityId)) {
    return { valid: false, error: 'entityId must be a valid UUID', code: 'INVALID_ENTITY_ID' };
  }

  // Validate optional languages array
  if (request.languages !== undefined) {
    if (!Array.isArray(request.languages)) {
      return { valid: false, error: 'languages must be an array', code: 'INVALID_REQUEST' };
    }
    if (request.languages.length === 0) {
      return { valid: false, error: 'languages array cannot be empty if provided', code: 'INVALID_REQUEST' };
    }
    for (const lang of request.languages) {
      if (!SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
        return {
          valid: false,
          error: `Invalid language: ${lang}. Must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
          code: 'INVALID_LANGUAGE'
        };
      }
    }
  }

  return {
    valid: true,
    data: {
      entityType: request.entityType as EntityType,
      entityId: request.entityId,
      languages: request.languages as SupportedLanguage[] | undefined
    }
  };
}
```

**Acceptance Criteria:**
- [ ] Validates entityType is present and one of valid types
- [ ] Validates entityId is present and UUID format
- [ ] Validates languages array if provided (each must be valid language)
- [ ] Returns typed validation result with error details

---

### Task 4: Implement Authentication Check

Add authentication using the standard pattern:

```typescript
export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate and authorize admin user
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      return authResult.error;
    }

    // Only admins can retry failed translations
    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required to retry translations',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    console.log(`[RetryTranslations] Admin ${authResult.user?.email} initiated retry request`);
    // ... continue with request processing
```

**Acceptance Criteria:**
- [ ] Uses `validateAdminAuth` from auth-server
- [ ] Returns 401 for unauthenticated requests (handled by validateAdminAuth)
- [ ] Returns 403 for non-admin users
- [ ] Logs admin user initiating the retry

---

### Task 5: Parse and Validate Request Body

Parse JSON body and run validation:

```typescript
    // Step 2: Parse and validate request body
    let body: RetryTranslationRequest;
    try {
      const rawBody = await request.json();
      const validationResult = validateRetryRequest(rawBody);

      if (!validationResult.valid) {
        return NextResponse.json(
          {
            success: false,
            error: validationResult.error,
            code: validationResult.code
          },
          { status: 400 }
        );
      }

      body = validationResult.data;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    console.log(`[RetryTranslations] Retrying for ${body.entityType}:${body.entityId}`, {
      languages: body.languages || 'all failed'
    });
```

**Acceptance Criteria:**
- [ ] Parses request JSON with error handling
- [ ] Runs validation function on parsed body
- [ ] Returns 400 with specific error code on validation failure
- [ ] Logs the retry request details

---

### Task 6: Fetch Failed Jobs for Entity

Query the database for failed jobs matching the entity:

```typescript
    // Step 3: Find failed translation jobs for the entity
    let query = supabaseAdmin
      .from('translation_jobs')
      .select('*')
      .eq('entity_type', body.entityType)
      .eq('entity_id', body.entityId)
      .eq('status', 'failed');

    // Optionally filter by specific languages
    if (body.languages && body.languages.length > 0) {
      query = query.in('target_language', body.languages);
    }

    const { data: failedJobs, error: fetchError } = await query;

    if (fetchError) {
      console.error('[RetryTranslations] Database error fetching failed jobs:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch translation jobs',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }

    // If no failed jobs found, return success with zero count
    if (!failedJobs || failedJobs.length === 0) {
      console.log(`[RetryTranslations] No failed jobs found for ${body.entityType}:${body.entityId}`);
      return NextResponse.json({
        success: true,
        data: {
          jobsQueued: 0,
          queuedLanguages: [],
          jobs: []
        }
      });
    }

    console.log(`[RetryTranslations] Found ${failedJobs.length} failed jobs`);
```

**Acceptance Criteria:**
- [ ] Queries translation_jobs with entity_type, entity_id, and status='failed'
- [ ] Applies language filter when languages array is provided
- [ ] Returns success with jobsQueued: 0 when no failed jobs found (not an error)
- [ ] Handles database errors gracefully

---

### Task 7: Reset Failed Jobs to Queued Status

Update the failed jobs to queued status with reset attempts:

```typescript
    // Step 4: Reset failed jobs to queued status
    const jobIds = failedJobs.map(job => job.id);
    const reQueuedJobs: ReQueuedJobInfo[] = [];

    // Store job info before update for response
    for (const job of failedJobs) {
      reQueuedJobs.push({
        id: job.id,
        entityType: job.entity_type as EntityType,
        entityId: job.entity_id,
        targetLanguage: job.target_language as SupportedLanguage,
        previousAttempts: job.attempts
      });
    }

    // Update jobs: reset status to 'queued' and attempts to 0
    const { error: updateError } = await supabaseAdmin
      .from('translation_jobs')
      .update({
        status: 'queued',
        attempts: 0,
        error_message: null,
        started_at: null,
        completed_at: null,
        locked_by: null,
        locked_at: null
      })
      .in('id', jobIds);

    if (updateError) {
      console.error('[RetryTranslations] Database error updating jobs:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to re-queue translation jobs',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }

    const queuedLanguages = [...new Set(reQueuedJobs.map(job => job.targetLanguage))];

    console.log(`[RetryTranslations] Successfully re-queued ${reQueuedJobs.length} jobs for languages: [${queuedLanguages.join(', ')}]`);
```

**Acceptance Criteria:**
- [ ] Updates status from 'failed' to 'queued'
- [ ] Resets attempts counter to 0
- [ ] Clears error_message, started_at, completed_at, locked_by, locked_at
- [ ] Handles update errors gracefully
- [ ] Extracts unique languages for response

---

### Task 8: Return Success Response

Assemble and return the success response:

```typescript
    // Step 5: Return success response
    const response: RetryTranslationResponse = {
      success: true,
      data: {
        jobsQueued: reQueuedJobs.length,
        queuedLanguages,
        jobs: reQueuedJobs
      }
    };

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('[RetryTranslations] Unexpected error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] Returns 200 with success response on successful re-queue
- [ ] Response includes jobsQueued count
- [ ] Response includes array of queuedLanguages
- [ ] Response includes array of job details with id, entityType, entityId, targetLanguage, previousAttempts
- [ ] Catches unexpected errors and returns 500

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/retry/route.ts` | Main endpoint implementation |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | Import `validateAdminAuth` function |
| `/src/lib/supabase.ts` | Import `supabaseAdmin` for database access |
| `/src/lib/job-queue/translation-jobs.types.ts` | Reference `EntityType`, `SupportedLanguage`, `JobStatus` types |
| `/src/app/api/admin/translate/route.ts` | Reference POST handler pattern, validation structure |
| `/src/app/api/admin/items/route.ts` | Reference response format patterns |

### Database Tables Accessed

| Table | Operation | Access Pattern |
|-------|-----------|----------------|
| `translation_jobs` | SELECT | Find failed jobs by entity_type, entity_id, status='failed' |
| `translation_jobs` | UPDATE | Reset status to 'queued', reset attempts to 0, clear error fields |

### Functions from Existing Modules

| Function | Source | Purpose |
|----------|--------|---------|
| `validateAdminAuth` | `/src/lib/auth-server.ts` | Authenticate request and check admin status |
| `supabaseAdmin` | `/src/lib/supabase.ts` | Database client with service role |

---

## Testing Considerations

### Unit Test Cases

1. **Authentication Tests**
   - Returns 401 when no session
   - Returns 401 for invalid/expired token
   - Returns 403 for non-admin users
   - Proceeds for admin/sysadmin users

2. **Request Validation Tests**
   - Returns 400 when entityType missing
   - Returns 400 when entityType invalid
   - Returns 400 when entityId missing
   - Returns 400 when entityId not UUID format
   - Returns 400 when languages array empty
   - Returns 400 when languages contains invalid code
   - Accepts valid request without languages (retry all failed)
   - Accepts valid request with specific languages array

3. **Job Fetching Tests**
   - Returns jobsQueued: 0 when no failed jobs exist
   - Finds all failed jobs for entity when no language filter
   - Finds only matching language jobs when language filter provided
   - Does not include 'queued', 'processing', or 'completed' jobs

4. **Job Update Tests**
   - Updates status from 'failed' to 'queued'
   - Resets attempts to 0
   - Clears error_message field
   - Clears lock fields (locked_by, locked_at)
   - Only updates specified job IDs

5. **Response Format Tests**
   - Response includes correct jobsQueued count
   - queuedLanguages contains unique languages only
   - jobs array contains correct job details
   - previousAttempts reflects value before reset

### Integration Test Scenarios

1. **Retry All Failed for Entity**
   - Create item with 5 failed translation jobs
   - Call retry endpoint without languages
   - Verify all 5 jobs reset to queued

2. **Retry Specific Languages**
   - Create item with failed jobs for fr, es, de
   - Call retry endpoint with languages: ['fr', 'es']
   - Verify only fr, es jobs reset; de remains failed

3. **No Failed Jobs Scenario**
   - Create item with completed translations
   - Call retry endpoint
   - Verify returns success with jobsQueued: 0

4. **Job Processor Integration**
   - Create failed job, call retry
   - Verify job processor picks up re-queued job
   - Verify successful translation completes

---

## Usage Examples

### Retry All Failed Translations for an Item

```bash
curl -X POST https://api.example.com/api/translations/retry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "entityType": "item",
    "entityId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobsQueued": 3,
    "queuedLanguages": ["fr", "de", "es"],
    "jobs": [
      {
        "id": "job-uuid-1",
        "entityType": "item",
        "entityId": "123e4567-e89b-12d3-a456-426614174000",
        "targetLanguage": "fr",
        "previousAttempts": 3
      },
      {
        "id": "job-uuid-2",
        "entityType": "item",
        "entityId": "123e4567-e89b-12d3-a456-426614174000",
        "targetLanguage": "de",
        "previousAttempts": 2
      },
      {
        "id": "job-uuid-3",
        "entityType": "item",
        "entityId": "123e4567-e89b-12d3-a456-426614174000",
        "targetLanguage": "es",
        "previousAttempts": 1
      }
    ]
  }
}
```

### Retry Specific Languages Only

```bash
curl -X POST https://api.example.com/api/translations/retry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "entityType": "article",
    "entityId": "987e6543-e21b-12d3-a456-426614174999",
    "languages": ["fr", "es"]
  }'
```

---

## Performance Considerations

- Query uses indexed columns (entity_type, entity_id, status)
- Batch update uses IN clause for efficient multi-row update
- No pagination needed as failed jobs per entity typically small
- Consider rate limiting if bulk retry operations become common

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Document: `/docs/gen_requests_epic3.md` - REQ-354
- Job Queue Module: `/src/lib/job-queue/translation-jobs.ts`
- Translation Test API: `/src/app/api/admin/translate/route.ts`

---

## Acceptance Criteria Checklist

From REQ-354:

- [ ] POST endpoint accepts entityType parameter (item, article, link, tag) in request body
- [ ] POST endpoint accepts entityId parameter (UUID) in request body
- [ ] POST endpoint accepts optional languages parameter (array of language codes) in request body
- [ ] Endpoint finds all translation jobs with status failed matching entityType and entityId
- [ ] When languages parameter is provided, only jobs for specified languages are selected
- [ ] Selected jobs have their status changed from failed to queued
- [ ] Selected jobs have their attempts counter reset to 0
- [ ] Response includes count of jobs re-queued
- [ ] Response includes array of re-queued job details (job ID, language, entity type, entity ID)
