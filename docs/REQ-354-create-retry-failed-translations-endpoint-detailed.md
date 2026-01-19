# REQ-354: Create Retry Failed Translations Endpoint - Detailed Task Breakdown

**Generated:** 2026-01-19 19:45:00 UTC
**Last Modified:** 2026-01-19 19:45:00 UTC
**Request Source:** docs/gen_requests_epic3.md - REQ-354
**Overview Document:** docs/REQ-354-create-retry-failed-translations-endpoint-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.2
**Estimated Size:** M (Medium)
**Dependencies:** Epic 1 (Foundation) - translation_jobs table, Job Queue module

---

## Summary

This document provides granular, actionable tasks for implementing the retry failed translations API endpoint. The endpoint allows administrators and content owners to retry failed translation jobs for specific content entities, either for all languages or a targeted subset of languages.

---

## Prerequisites Checklist

Before starting implementation, verify the following are in place:

- [ ] Translation service module exists at `/src/lib/translation-service/`
- [ ] Job queue module exists at `/src/lib/job-queue/`
- [ ] Types file exists at `/src/lib/job-queue/translation-jobs.types.ts` with `EntityType`, `SupportedLanguage`, `JobStatus` types
- [ ] Database table `translation_jobs` exists with columns: id, entity_type, entity_id, source_language, target_language, status, attempts, error_message, created_at, started_at, completed_at, locked_by, locked_at
- [ ] Auth helper `validateAdminAuth` exists at `/src/lib/auth-server.ts`
- [ ] Supabase admin client exists at `/src/lib/supabase.ts`

---

## Task Breakdown

### Task 1: Create API Route Directory Structure

**File:** `/src/app/api/translations/retry/route.ts`
**Estimated Story Points:** 1
**Type:** File Creation

**Description:**
Create the route file with the required Next.js App Router structure and establish the file header with proper documentation.

**Implementation Steps:**

1. Create directory `/src/app/api/translations/retry/` if it doesn't exist
2. Create file `route.ts` in the directory
3. Add file header comment with REQ number, creation date, and module documentation
4. Add required imports

**Code to Implement:**

```typescript
/**
 * Retry Failed Translations API Endpoint
 * REQ-354: Allows retrying failed translation jobs for specific entities
 *
 * This endpoint accepts POST requests with entityType, entityId, and optional
 * languages array. It finds all failed translation jobs matching the criteria
 * and resets them to queued status for reprocessing.
 *
 * @module api/translations/retry
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import type { EntityType, SupportedLanguage, JobStatus } from '@/lib/job-queue/translation-jobs.types';
```

**Acceptance Criteria:**
- [ ] File created at `/src/app/api/translations/retry/route.ts`
- [ ] File header comment includes REQ-354 reference
- [ ] All required imports are present and resolve correctly
- [ ] No TypeScript compilation errors

**Verification Command:**
```bash
npx tsc --noEmit src/app/api/translations/retry/route.ts
```

---

### Task 2: Define Type Interfaces and Constants

**File:** `/src/app/api/translations/retry/route.ts`
**Estimated Story Points:** 1
**Type:** Code Addition

**Description:**
Define all TypeScript interfaces for request validation and response formatting, along with constants for supported languages and valid entity types.

**Implementation Steps:**

1. Add constants section after imports
2. Define `SUPPORTED_LANGUAGES` constant array
3. Define `VALID_ENTITY_TYPES` constant array
4. Define `RetryTranslationRequest` interface
5. Define `RetryTranslationResponse` interface
6. Define `ReQueuedJobInfo` interface for internal use

**Code to Implement:**

```typescript
// =============================================================================
// Type Definitions
// =============================================================================

const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
const VALID_ENTITY_TYPES: readonly EntityType[] = ['article', 'item', 'link', 'tag'];

/**
 * Request body for retry endpoint
 */
interface RetryTranslationRequest {
  /** Type of entity whose translations should be retried */
  entityType: EntityType;
  /** UUID of the specific entity */
  entityId: string;
  /** Optional array of language codes to retry (if omitted, retries all failed) */
  languages?: SupportedLanguage[];
}

/**
 * Response body for retry endpoint
 */
interface RetryTranslationResponse {
  success: boolean;
  data?: {
    /** Number of jobs re-queued */
    jobsQueued: number;
    /** Languages that were re-queued */
    queuedLanguages: SupportedLanguage[];
    /** Details of each re-queued job */
    jobs: ReQueuedJobInfo[];
  };
  error?: string;
  code?: string;
}

/**
 * Information about a single re-queued job
 */
interface ReQueuedJobInfo {
  id: string;
  entityType: EntityType;
  entityId: string;
  targetLanguage: SupportedLanguage;
  previousAttempts: number;
}

/**
 * Database row structure for translation_jobs table
 */
interface TranslationJobRow {
  id: string;
  entity_type: string;
  entity_id: string;
  source_language: string;
  target_language: string;
  status: string;
  attempts: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  locked_by: string | null;
  locked_at: string | null;
}
```

**Acceptance Criteria:**
- [ ] `RetryTranslationRequest` interface includes entityType, entityId, and optional languages
- [ ] `RetryTranslationResponse` interface matches API contract from overview document
- [ ] `ReQueuedJobInfo` interface includes id, entityType, entityId, targetLanguage, previousAttempts
- [ ] Constants use `readonly` for type safety
- [ ] No TypeScript compilation errors

---

### Task 3: Implement Request Validation Function

**File:** `/src/app/api/translations/retry/route.ts`
**Estimated Story Points:** 2
**Type:** Code Addition

**Description:**
Create a validation function that checks the request body for required fields, correct types, and valid values. Returns a typed discriminated union result.

**Implementation Steps:**

1. Add validation section after type definitions
2. Define UUID regex pattern
3. Create `validateRetryRequest` function
4. Implement entityType validation (required, must be valid type)
5. Implement entityId validation (required, must be valid UUID)
6. Implement optional languages array validation
7. Return typed validation result

**Code to Implement:**

```typescript
// =============================================================================
// Validation
// =============================================================================

const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

/**
 * Validates the retry request body
 * @param body - Raw request body to validate
 * @returns Typed validation result with either validated data or error details
 */
function validateRetryRequest(body: unknown):
  | { valid: true; data: RetryTranslationRequest }
  | { valid: false; error: string; code: string } {

  // Check body exists and is an object
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required', code: 'INVALID_REQUEST' };
  }

  const request = body as Partial<RetryTranslationRequest>;

  // Validate entityType - required field
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

  // Validate entityId - required field, must be UUID format
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
      if (typeof lang !== 'string' || !SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
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
- [ ] Function validates entityType is present and one of valid types
- [ ] Function validates entityId is present and UUID format
- [ ] Function validates languages array if provided (each must be valid language code)
- [ ] Function returns typed discriminated union result
- [ ] Error codes match those defined in overview document (INVALID_REQUEST, INVALID_ENTITY_TYPE, INVALID_ENTITY_ID, INVALID_LANGUAGE)

**Test Cases:**
```typescript
// Should fail - missing entityType
validateRetryRequest({ entityId: '123e4567-e89b-12d3-a456-426614174000' });
// Expected: { valid: false, error: 'entityType field is required', code: 'INVALID_REQUEST' }

// Should fail - invalid entityType
validateRetryRequest({ entityType: 'invalid', entityId: '123e4567-e89b-12d3-a456-426614174000' });
// Expected: { valid: false, error: 'entityType must be one of: article, item, link, tag', code: 'INVALID_ENTITY_TYPE' }

// Should fail - invalid UUID
validateRetryRequest({ entityType: 'item', entityId: 'not-a-uuid' });
// Expected: { valid: false, error: 'entityId must be a valid UUID', code: 'INVALID_ENTITY_ID' }

// Should fail - invalid language in array
validateRetryRequest({ entityType: 'item', entityId: '123e4567-e89b-12d3-a456-426614174000', languages: ['en', 'xx'] });
// Expected: { valid: false, error: 'Invalid language: xx. Must be one of: en, fr, es, de, nl, it', code: 'INVALID_LANGUAGE' }

// Should succeed - valid request without languages
validateRetryRequest({ entityType: 'item', entityId: '123e4567-e89b-12d3-a456-426614174000' });
// Expected: { valid: true, data: { entityType: 'item', entityId: '...', languages: undefined } }

// Should succeed - valid request with languages
validateRetryRequest({ entityType: 'article', entityId: '123e4567-e89b-12d3-a456-426614174000', languages: ['fr', 'es'] });
// Expected: { valid: true, data: { entityType: 'article', entityId: '...', languages: ['fr', 'es'] } }
```

---

### Task 4: Implement POST Handler - Authentication Section

**File:** `/src/app/api/translations/retry/route.ts`
**Estimated Story Points:** 1
**Type:** Code Addition

**Description:**
Implement the POST handler function with authentication check using the existing `validateAdminAuth` pattern from other admin endpoints.

**Implementation Steps:**

1. Create exported `POST` async function
2. Wrap entire handler in try-catch for unexpected errors
3. Call `validateAdminAuth(request)` to validate session
4. Check for authentication error response
5. Verify user has admin or sysadmin privileges
6. Log admin user initiating the retry

**Code to Implement:**

```typescript
// =============================================================================
// API Handler
// =============================================================================

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

    // ... continue with request processing (Task 5)
```

**Acceptance Criteria:**
- [ ] Uses `validateAdminAuth` from `/src/lib/auth-server.ts`
- [ ] Returns 401 for unauthenticated requests (handled by validateAdminAuth)
- [ ] Returns 403 with code 'FORBIDDEN' for non-admin users
- [ ] Logs admin email when retry is initiated
- [ ] Follows same pattern as `/src/app/api/admin/translate/route.ts`

---

### Task 5: Implement POST Handler - Request Parsing and Validation

**File:** `/src/app/api/translations/retry/route.ts`
**Estimated Story Points:** 1
**Type:** Code Addition

**Description:**
Parse the JSON request body and run validation, returning appropriate error responses for malformed or invalid requests.

**Implementation Steps:**

1. Parse request body with JSON error handling
2. Call validation function on parsed body
3. Return 400 error with specific code if validation fails
4. Log the validated request details

**Code to Implement:**

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

    console.log(`[RetryTranslations] Processing retry for ${body.entityType}:${body.entityId}`, {
      languages: body.languages || 'all failed'
    });

    // ... continue with database operations (Task 6)
```

**Acceptance Criteria:**
- [ ] Parses request JSON with try-catch for malformed JSON
- [ ] Runs validation function on parsed body
- [ ] Returns 400 with specific error code on validation failure
- [ ] Returns 400 with 'INVALID_REQUEST' code for malformed JSON
- [ ] Logs the entity type, entity ID, and languages being retried

---

### Task 6: Implement POST Handler - Fetch Failed Jobs

**File:** `/src/app/api/translations/retry/route.ts`
**Estimated Story Points:** 2
**Type:** Code Addition

**Description:**
Query the database for failed translation jobs matching the entity criteria, optionally filtered by specific languages.

**Implementation Steps:**

1. Build Supabase query for translation_jobs table
2. Filter by entity_type, entity_id, and status='failed'
3. Conditionally add language filter if languages array provided
4. Execute query and handle database errors
5. Return success with jobsQueued: 0 if no failed jobs found

**Code to Implement:**

```typescript
    // Step 3: Find failed translation jobs for the entity
    let query = supabaseAdmin
      .from('translation_jobs')
      .select('*')
      .eq('entity_type', body.entityType)
      .eq('entity_id', body.entityId)
      .eq('status', 'failed' as JobStatus);

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

    // If no failed jobs found, return success with zero count (not an error)
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

    console.log(`[RetryTranslations] Found ${failedJobs.length} failed jobs to re-queue`);

    // ... continue with job update (Task 7)
```

**Acceptance Criteria:**
- [ ] Queries translation_jobs with entity_type, entity_id, and status='failed'
- [ ] Applies language filter when languages array is provided
- [ ] Returns success with `jobsQueued: 0` when no failed jobs found (HTTP 200, not 404)
- [ ] Handles database errors gracefully with 500 response
- [ ] Logs number of failed jobs found

---

### Task 7: Implement POST Handler - Reset Failed Jobs

**File:** `/src/app/api/translations/retry/route.ts`
**Estimated Story Points:** 2
**Type:** Code Addition

**Description:**
Update the failed jobs to queued status, resetting attempt counters and clearing error/lock fields.

**Implementation Steps:**

1. Extract job IDs from fetched failed jobs
2. Build array of job info for response (capturing previousAttempts before reset)
3. Execute batch UPDATE to reset jobs to 'queued' status
4. Clear attempts, error_message, started_at, completed_at, locked_by, locked_at
5. Handle update errors
6. Extract unique languages for response

**Code to Implement:**

```typescript
    // Step 4: Store job info before update for response
    const jobIds = (failedJobs as TranslationJobRow[]).map(job => job.id);
    const reQueuedJobs: ReQueuedJobInfo[] = [];

    for (const job of failedJobs as TranslationJobRow[]) {
      reQueuedJobs.push({
        id: job.id,
        entityType: job.entity_type as EntityType,
        entityId: job.entity_id,
        targetLanguage: job.target_language as SupportedLanguage,
        previousAttempts: job.attempts
      });
    }

    // Step 5: Reset failed jobs to queued status
    const { error: updateError } = await supabaseAdmin
      .from('translation_jobs')
      .update({
        status: 'queued' as JobStatus,
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

    // Extract unique languages for response
    const queuedLanguages = [...new Set(reQueuedJobs.map(job => job.targetLanguage))];

    console.log(`[RetryTranslations] Successfully re-queued ${reQueuedJobs.length} jobs for languages: [${queuedLanguages.join(', ')}]`);

    // ... continue with success response (Task 8)
```

**Acceptance Criteria:**
- [ ] Updates status from 'failed' to 'queued'
- [ ] Resets attempts counter to 0
- [ ] Clears error_message field to null
- [ ] Clears started_at, completed_at, locked_by, locked_at to null
- [ ] Uses batch update with IN clause for efficiency
- [ ] Handles update errors gracefully with 500 response
- [ ] Captures previousAttempts before the reset for response
- [ ] Extracts unique queuedLanguages for response

---

### Task 8: Implement POST Handler - Success Response and Error Handler

**File:** `/src/app/api/translations/retry/route.ts`
**Estimated Story Points:** 1
**Type:** Code Addition

**Description:**
Assemble and return the success response with re-queued job details, and add the outer try-catch error handler.

**Implementation Steps:**

1. Build response object with jobsQueued, queuedLanguages, and jobs array
2. Return 200 JSON response
3. Add outer catch block for unexpected errors
4. Log unexpected errors and return 500 with INTERNAL_ERROR code

**Code to Implement:**

```typescript
    // Step 6: Return success response
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
- [ ] Response includes `jobsQueued` count
- [ ] Response includes `queuedLanguages` array (unique languages)
- [ ] Response includes `jobs` array with id, entityType, entityId, targetLanguage, previousAttempts
- [ ] Outer try-catch handles unexpected errors
- [ ] Unexpected errors return 500 with 'INTERNAL_ERROR' code
- [ ] Errors are logged with `[RetryTranslations]` prefix

---

### Task 9: Add Unit Tests for Validation Function

**File:** `/src/app/api/translations/retry/__tests__/route.test.ts`
**Estimated Story Points:** 2
**Type:** Test Creation

**Description:**
Create unit tests for the validation function covering all validation scenarios.

**Implementation Steps:**

1. Create test file in `__tests__` directory
2. Import validation function (may need to export it)
3. Write tests for missing entityType
4. Write tests for invalid entityType
5. Write tests for missing entityId
6. Write tests for invalid UUID format
7. Write tests for empty languages array
8. Write tests for invalid language codes
9. Write tests for valid requests

**Test Cases to Implement:**

```typescript
import { describe, it, expect } from 'vitest';

describe('validateRetryRequest', () => {
  describe('entityType validation', () => {
    it('should return error when entityType is missing', () => {
      const result = validateRetryRequest({ entityId: '123e4567-e89b-12d3-a456-426614174000' });
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_REQUEST');
    });

    it('should return error when entityType is invalid', () => {
      const result = validateRetryRequest({
        entityType: 'invalid',
        entityId: '123e4567-e89b-12d3-a456-426614174000'
      });
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_ENTITY_TYPE');
    });

    it('should accept valid entityType values', () => {
      const validTypes = ['article', 'item', 'link', 'tag'];
      for (const type of validTypes) {
        const result = validateRetryRequest({
          entityType: type,
          entityId: '123e4567-e89b-12d3-a456-426614174000'
        });
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('entityId validation', () => {
    it('should return error when entityId is missing', () => {
      const result = validateRetryRequest({ entityType: 'item' });
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_REQUEST');
    });

    it('should return error when entityId is not a valid UUID', () => {
      const result = validateRetryRequest({
        entityType: 'item',
        entityId: 'not-a-uuid'
      });
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_ENTITY_ID');
    });

    it('should accept valid UUID formats', () => {
      const result = validateRetryRequest({
        entityType: 'item',
        entityId: '123e4567-e89b-12d3-a456-426614174000'
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('languages array validation', () => {
    it('should return error when languages is empty array', () => {
      const result = validateRetryRequest({
        entityType: 'item',
        entityId: '123e4567-e89b-12d3-a456-426614174000',
        languages: []
      });
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_REQUEST');
    });

    it('should return error when languages contains invalid code', () => {
      const result = validateRetryRequest({
        entityType: 'item',
        entityId: '123e4567-e89b-12d3-a456-426614174000',
        languages: ['en', 'xx']
      });
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_LANGUAGE');
    });

    it('should accept valid language codes', () => {
      const result = validateRetryRequest({
        entityType: 'item',
        entityId: '123e4567-e89b-12d3-a456-426614174000',
        languages: ['fr', 'es', 'de']
      });
      expect(result.valid).toBe(true);
      expect(result.data?.languages).toEqual(['fr', 'es', 'de']);
    });

    it('should accept request without languages (retry all)', () => {
      const result = validateRetryRequest({
        entityType: 'item',
        entityId: '123e4567-e89b-12d3-a456-426614174000'
      });
      expect(result.valid).toBe(true);
      expect(result.data?.languages).toBeUndefined();
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests cover all validation error scenarios
- [ ] Tests verify correct error codes are returned
- [ ] Tests cover valid request scenarios
- [ ] All tests pass

---

### Task 10: Add Integration Tests for API Endpoint

**File:** `/src/app/api/translations/retry/__tests__/route.integration.test.ts`
**Estimated Story Points:** 3
**Type:** Test Creation

**Description:**
Create integration tests for the API endpoint testing authentication, request handling, and database operations.

**Test Scenarios to Cover:**

1. **Authentication Tests**
   - Returns 401 when no session
   - Returns 403 for non-admin users
   - Proceeds for admin/sysadmin users

2. **Request Validation Tests**
   - Returns 400 for malformed JSON
   - Returns 400 for missing required fields
   - Returns 400 for invalid values

3. **Database Operation Tests**
   - Returns 200 with jobsQueued: 0 when no failed jobs exist
   - Finds and re-queues failed jobs for entity
   - Filters by language when languages array provided
   - Correctly resets job status, attempts, and clears error fields

4. **Response Format Tests**
   - Response includes correct jobsQueued count
   - Response includes unique queuedLanguages
   - Response includes job details with previousAttempts

**Acceptance Criteria:**
- [ ] Tests mock authentication for different user types
- [ ] Tests mock database operations
- [ ] Tests verify correct HTTP status codes
- [ ] Tests verify response body structure
- [ ] All tests pass

---

## Complete File Structure

After all tasks are complete, the file should have this structure:

```
/src/app/api/translations/retry/
├── route.ts              # Main API endpoint (Tasks 1-8)
└── __tests__/
    ├── route.test.ts              # Unit tests (Task 9)
    └── route.integration.test.ts  # Integration tests (Task 10)
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/retry/route.ts` | Main endpoint implementation |
| `/src/app/api/translations/retry/__tests__/route.test.ts` | Unit tests |
| `/src/app/api/translations/retry/__tests__/route.integration.test.ts` | Integration tests |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | Import `validateAdminAuth` function |
| `/src/lib/supabase.ts` | Import `supabaseAdmin` for database access |
| `/src/lib/job-queue/translation-jobs.types.ts` | Reference `EntityType`, `SupportedLanguage`, `JobStatus` types |
| `/src/app/api/admin/translate/route.ts` | Reference POST handler pattern, validation structure |

### Database Tables Accessed

| Table | Operation | Access Pattern |
|-------|-----------|----------------|
| `translation_jobs` | SELECT | Find failed jobs by entity_type, entity_id, status='failed' |
| `translation_jobs` | UPDATE | Reset status to 'queued', reset attempts to 0, clear error fields |

---

## Final Acceptance Criteria Checklist

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
- [ ] Endpoint returns 200 with count 0 when no failed jobs exist for the entity
- [ ] Endpoint validates entityType against allowed values and returns 400 for invalid types
- [ ] Endpoint validates entityId format (must be valid UUID) and returns 400 for invalid format
- [ ] Endpoint validates language codes format and returns 400 for invalid or unsupported languages
- [ ] Endpoint includes appropriate authentication and authorization checks
- [ ] Re-queued jobs are immediately eligible for pickup by the job processor

---

## Usage Examples

### Retry All Failed Translations for an Item

```bash
curl -X POST https://api.example.com/api/translations/retry \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<token>" \
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
  -H "Cookie: sb-access-token=<token>" \
  -d '{
    "entityType": "article",
    "entityId": "987e6543-e21b-12d3-a456-426614174999",
    "languages": ["fr", "es"]
  }'
```

---

## References

- Overview Document: `/docs/REQ-354-create-retry-failed-translations-endpoint-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Document: `/docs/gen_requests_epic3.md` - REQ-354
- Auth Pattern: `/src/lib/auth-server.ts`
- API Pattern Reference: `/src/app/api/admin/translate/route.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
