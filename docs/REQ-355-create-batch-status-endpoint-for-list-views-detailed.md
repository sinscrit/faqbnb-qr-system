# REQ-355: Create Batch Translation Status Endpoint for List Views - Detailed Task Breakdown

**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.4
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md
**Overview Document:** REQ-355-create-batch-status-endpoint-for-list-views-overview.md

---

## Executive Summary

This document provides a detailed, step-by-step task breakdown for implementing the batch translation status endpoint at `/api/translations/status/batch`. The endpoint accepts an array of entity references and returns summary translation status for each entity, optimized for dashboard list views.

---

## Pre-Implementation Checklist

Before starting implementation, verify the following prerequisites:

- [ ] Translation tables exist: `translation_jobs`, `item_translations`, `article_translations`, `link_translations`, `tag_translations`
- [ ] Job queue types are defined in `/src/lib/job-queue/translation-jobs.types.ts`
- [ ] `validateAdminAuth` is available in `/src/lib/auth-server.ts`
- [ ] Supabase client is configured in `/src/lib/supabase.ts`

---

## Task Breakdown

### Task 1: Create TypeScript Types for Batch Status

**File to Create:** `/src/app/api/translations/status/batch/types.ts`

**Objective:** Define all TypeScript interfaces and types needed for the batch status endpoint.

**Implementation Steps:**

1.1. Create the directory structure:
```bash
mkdir -p src/app/api/translations/status/batch
```

1.2. Create `types.ts` with the following type definitions:

```typescript
/**
 * Batch Translation Status Types
 * Part of REQ-355: Batch Translation Status Endpoint
 */

import { EntityType, SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';

/** Single entity reference in the batch request */
export interface EntityReference {
  entityType: 'item' | 'article' | 'link' | 'tag';
  entityId: string; // UUID format
}

/** Request body for batch status endpoint */
export interface BatchStatusRequest {
  entities: EntityReference[];
}

/** Overall status determination for an entity */
export type OverallStatus =
  | 'no_translations'  // No jobs and no translations exist
  | 'pending'          // Jobs are queued but not processing
  | 'in_progress'      // At least one job is processing
  | 'completed'        // All target languages have completed translations
  | 'partial'          // Mix of completed and pending/failed
  | 'failed';          // All jobs have failed

/** Summary status for a single entity */
export interface EntityStatusSummary {
  entityType: 'item' | 'article' | 'link' | 'tag';
  entityId: string;
  overallStatus: OverallStatus;
  completedCount: number;    // Languages with completed translations
  pendingCount: number;      // Languages with queued or processing jobs
  failedCount: number;       // Languages with failed jobs
  totalLanguages: number;    // Number of target languages (typically 5)
}

/** Response body for batch status endpoint */
export interface BatchStatusResponse {
  success: boolean;
  data?: EntityStatusSummary[];
  error?: string;
}

/** Internal type for job status aggregation */
export interface JobStatusCounts {
  entityId: string;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}

/** Internal type for translation counts */
export interface TranslationCounts {
  entityId: string;
  completedCount: number;
}
```

**Acceptance Criteria:**
- [ ] All types are exported and can be imported by route handler
- [ ] Types match the API contracts defined in the overview document
- [ ] Types reuse `EntityType` from job queue types where appropriate

**Estimated Effort:** 0.5 story points

---

### Task 2: Implement Request Validation Utilities

**File to Create:** `/src/app/api/translations/status/batch/validation.ts`

**Objective:** Create reusable validation functions for request body parsing and validation.

**Implementation Steps:**

2.1. Create `validation.ts` with validation functions:

```typescript
/**
 * Request Validation Utilities
 * Part of REQ-355: Batch Translation Status Endpoint
 */

import { BatchStatusRequest, EntityReference } from './types';

/** Valid entity types */
const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;

/** Maximum batch size */
export const MAX_BATCH_SIZE = 100;

/** UUID format regex */
const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: BatchStatusRequest;
}

/**
 * Validates a single entity reference
 */
export function validateEntityReference(
  entity: unknown,
  index: number
): { valid: boolean; error?: string } {
  if (!entity || typeof entity !== 'object') {
    return { valid: false, error: `Entity at index ${index} is invalid` };
  }

  const ref = entity as Partial<EntityReference>;

  // Validate entityType
  if (!ref.entityType || !VALID_ENTITY_TYPES.includes(ref.entityType as any)) {
    return {
      valid: false,
      error: `Invalid entityType at index ${index}: ${ref.entityType}. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`
    };
  }

  // Validate entityId format (UUID)
  if (!ref.entityId || typeof ref.entityId !== 'string') {
    return { valid: false, error: `Missing entityId at index ${index}` };
  }

  if (!UUID_REGEX.test(ref.entityId)) {
    return {
      valid: false,
      error: `Invalid entityId format at index ${index}: ${ref.entityId}. Must be a valid UUID`
    };
  }

  return { valid: true };
}

/**
 * Validates the entire batch status request
 */
export function validateBatchRequest(body: unknown): ValidationResult {
  // Check body is an object
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const request = body as Partial<BatchStatusRequest>;

  // Check entities array exists
  if (!request.entities) {
    return { valid: false, error: 'Missing entities array in request body' };
  }

  // Check entities is an array
  if (!Array.isArray(request.entities)) {
    return { valid: false, error: 'entities must be an array' };
  }

  // Check array is not empty
  if (request.entities.length === 0) {
    return { valid: false, error: 'Entities array cannot be empty' };
  }

  // Check batch size limit
  if (request.entities.length > MAX_BATCH_SIZE) {
    return {
      valid: false,
      error: `Batch size exceeds limit of ${MAX_BATCH_SIZE}. Received: ${request.entities.length}`
    };
  }

  // Validate each entity reference
  for (let i = 0; i < request.entities.length; i++) {
    const result = validateEntityReference(request.entities[i], i);
    if (!result.valid) {
      return { valid: false, error: result.error };
    }
  }

  return {
    valid: true,
    data: request as BatchStatusRequest
  };
}
```

**Acceptance Criteria:**
- [ ] Validates request body is valid JSON object
- [ ] Returns 400 for empty or missing entities array
- [ ] Returns 400 for batch size > 100
- [ ] Returns 400 for invalid entityType values
- [ ] Returns 400 for invalid UUID format in entityId
- [ ] Returns descriptive error messages for each validation failure

**Estimated Effort:** 0.5 story points

---

### Task 3: Implement Status Computation Logic

**File to Create:** `/src/app/api/translations/status/batch/status-computation.ts`

**Objective:** Create the logic for computing overall status from job and translation counts.

**Implementation Steps:**

3.1. Create `status-computation.ts`:

```typescript
/**
 * Status Computation Logic
 * Part of REQ-355: Batch Translation Status Endpoint
 */

import { OverallStatus, EntityStatusSummary } from './types';

/** Number of target languages (excluding source language) */
export const TARGET_LANGUAGES_COUNT = 5;

/**
 * Computes the overall translation status based on job and translation counts.
 *
 * Status Determination Logic:
 * - no_translations: No jobs and no translations exist
 * - completed: All target languages have completed translations
 * - failed: All jobs are failed (no completed, no pending)
 * - in_progress: Any jobs are in 'processing' status
 * - pending: Any jobs are in 'queued' status (but none processing)
 * - partial: Mix of completed and pending/failed
 */
export function computeOverallStatus(
  completedCount: number,
  queuedCount: number,
  processingCount: number,
  failedCount: number,
  totalLanguages: number = TARGET_LANGUAGES_COUNT
): OverallStatus {
  const totalJobs = queuedCount + processingCount + failedCount;

  // No jobs and no completed translations
  if (totalJobs === 0 && completedCount === 0) {
    return 'no_translations';
  }

  // All target languages have completed translations
  if (completedCount >= totalLanguages) {
    return 'completed';
  }

  // All jobs failed (no completed translations, no pending jobs)
  if (failedCount > 0 && queuedCount === 0 && processingCount === 0 && completedCount === 0) {
    return 'failed';
  }

  // Any jobs are currently processing
  if (processingCount > 0) {
    return 'in_progress';
  }

  // Any jobs are queued (but not processing)
  if (queuedCount > 0) {
    return 'pending';
  }

  // Mix of completed and failed (partial success)
  if (completedCount > 0 && (failedCount > 0 || completedCount < totalLanguages)) {
    return 'partial';
  }

  // Default to no_translations if nothing else matches
  return 'no_translations';
}

/**
 * Creates an EntityStatusSummary with the computed status
 */
export function createStatusSummary(
  entityType: 'item' | 'article' | 'link' | 'tag',
  entityId: string,
  completedCount: number,
  queuedCount: number,
  processingCount: number,
  failedCount: number
): EntityStatusSummary {
  const totalLanguages = TARGET_LANGUAGES_COUNT;
  const pendingCount = queuedCount + processingCount;

  return {
    entityType,
    entityId,
    overallStatus: computeOverallStatus(
      completedCount,
      queuedCount,
      processingCount,
      failedCount,
      totalLanguages
    ),
    completedCount,
    pendingCount,
    failedCount,
    totalLanguages
  };
}
```

**Acceptance Criteria:**
- [ ] Returns 'no_translations' when no jobs and no translations exist
- [ ] Returns 'completed' when all target languages have completed translations
- [ ] Returns 'failed' when all jobs have failed
- [ ] Returns 'in_progress' when any job is processing
- [ ] Returns 'pending' when jobs are queued but not processing
- [ ] Returns 'partial' for mix of completed and pending/failed

**Estimated Effort:** 0.5 story points

---

### Task 4: Implement Database Query Logic

**File to Create:** `/src/app/api/translations/status/batch/database.ts`

**Objective:** Create optimized database queries to fetch job status and translation counts.

**Implementation Steps:**

4.1. Create `database.ts` with query functions:

```typescript
/**
 * Database Query Functions
 * Part of REQ-355: Batch Translation Status Endpoint
 */

import { createSupabaseServer } from '@/lib/supabase-server';
import { EntityReference, JobStatusCounts, TranslationCounts } from './types';
import { EntityType, JobStatus } from '@/lib/job-queue/translation-jobs.types';

/**
 * Groups entity references by type for efficient querying
 */
export function groupEntitiesByType(
  entities: EntityReference[]
): Map<EntityType, string[]> {
  const grouped = new Map<EntityType, string[]>();

  for (const entity of entities) {
    const existing = grouped.get(entity.entityType as EntityType) || [];
    existing.push(entity.entityId);
    grouped.set(entity.entityType as EntityType, existing);
  }

  return grouped;
}

/**
 * Fetches job status counts for entities of a specific type
 */
export async function fetchJobStatusCounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  entityType: EntityType,
  entityIds: string[]
): Promise<Map<string, JobStatusCounts>> {
  const result = new Map<string, JobStatusCounts>();

  // Initialize with zero counts for all requested entities
  for (const id of entityIds) {
    result.set(id, {
      entityId: id,
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0
    });
  }

  // Query job counts grouped by entity_id and status
  const { data, error } = await supabase
    .from('translation_jobs')
    .select('entity_id, status')
    .eq('entity_type', entityType)
    .in('entity_id', entityIds);

  if (error) {
    console.error(`Error fetching job counts for ${entityType}:`, error);
    throw new Error(`Database error fetching job counts: ${error.message}`);
  }

  // Aggregate counts by entity and status
  for (const job of data || []) {
    const counts = result.get(job.entity_id);
    if (counts) {
      const status = job.status as JobStatus;
      if (status === 'queued') counts.queued++;
      else if (status === 'processing') counts.processing++;
      else if (status === 'completed') counts.completed++;
      else if (status === 'failed') counts.failed++;
    }
  }

  return result;
}

/**
 * Fetches completed translation counts for items
 */
async function fetchItemTranslationCounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  entityIds: string[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>();

  // Initialize with zero for all
  for (const id of entityIds) {
    result.set(id, 0);
  }

  const { data, error } = await supabase
    .from('item_translations')
    .select('item_id')
    .in('item_id', entityIds)
    .eq('translation_status', 'completed');

  if (error) {
    console.error('Error fetching item translation counts:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  // Count occurrences per item
  for (const row of data || []) {
    const current = result.get(row.item_id) || 0;
    result.set(row.item_id, current + 1);
  }

  return result;
}

/**
 * Fetches completed translation counts for articles
 */
async function fetchArticleTranslationCounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  entityIds: string[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>();

  for (const id of entityIds) {
    result.set(id, 0);
  }

  const { data, error } = await supabase
    .from('article_translations')
    .select('article_id')
    .in('article_id', entityIds)
    .eq('translation_status', 'completed');

  if (error) {
    console.error('Error fetching article translation counts:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  for (const row of data || []) {
    const current = result.get(row.article_id) || 0;
    result.set(row.article_id, current + 1);
  }

  return result;
}

/**
 * Fetches completed translation counts for links
 */
async function fetchLinkTranslationCounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  entityIds: string[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>();

  for (const id of entityIds) {
    result.set(id, 0);
  }

  const { data, error } = await supabase
    .from('link_translations')
    .select('link_id')
    .in('link_id', entityIds)
    .eq('translation_status', 'completed');

  if (error) {
    console.error('Error fetching link translation counts:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  for (const row of data || []) {
    const current = result.get(row.link_id) || 0;
    result.set(row.link_id, current + 1);
  }

  return result;
}

/**
 * Fetches completed translation counts for tags
 */
async function fetchTagTranslationCounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  entityIds: string[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>();

  for (const id of entityIds) {
    result.set(id, 0);
  }

  // Note: tag_translations may use tag_key instead of tag_id
  // Adjust column name based on actual schema
  const { data, error } = await supabase
    .from('tag_translations')
    .select('tag_key')
    .in('tag_key', entityIds);

  if (error) {
    console.error('Error fetching tag translation counts:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  for (const row of data || []) {
    const current = result.get(row.tag_key) || 0;
    result.set(row.tag_key, current + 1);
  }

  return result;
}

/**
 * Fetches completed translation counts for entities of a specific type
 */
export async function fetchTranslationCounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  entityType: EntityType,
  entityIds: string[]
): Promise<Map<string, number>> {
  switch (entityType) {
    case 'item':
      return fetchItemTranslationCounts(supabase, entityIds);
    case 'article':
      return fetchArticleTranslationCounts(supabase, entityIds);
    case 'link':
      return fetchLinkTranslationCounts(supabase, entityIds);
    case 'tag':
      return fetchTagTranslationCounts(supabase, entityIds);
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
}
```

**Acceptance Criteria:**
- [ ] Groups entities by type to minimize query count (max 8 queries: 4 for jobs + 4 for translations)
- [ ] Uses IN clause with array of IDs instead of individual queries
- [ ] Handles missing entities by returning zero counts
- [ ] Returns proper error messages for database failures

**Estimated Effort:** 1 story point

---

### Task 5: Implement the API Route Handler

**File to Create:** `/src/app/api/translations/status/batch/route.ts`

**Objective:** Implement the POST handler that ties together validation, database queries, and status computation.

**Implementation Steps:**

5.1. Create `route.ts`:

```typescript
/**
 * Batch Translation Status API Endpoint
 * POST /api/translations/status/batch
 *
 * Part of REQ-355: Batch Translation Status Endpoint
 *
 * Accepts an array of entity references and returns summary translation
 * status for each entity, optimized for dashboard list views.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { validateBatchRequest } from './validation';
import {
  groupEntitiesByType,
  fetchJobStatusCounts,
  fetchTranslationCounts
} from './database';
import { createStatusSummary } from './status-computation';
import {
  BatchStatusResponse,
  EntityStatusSummary,
  EntityReference
} from './types';
import { EntityType } from '@/lib/job-queue/translation-jobs.types';

/**
 * POST /api/translations/status/batch
 *
 * Request Body:
 * {
 *   "entities": [
 *     { "entityType": "item", "entityId": "uuid-1" },
 *     { "entityType": "article", "entityId": "uuid-2" }
 *   ]
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "entityType": "item",
 *       "entityId": "uuid-1",
 *       "overallStatus": "completed",
 *       "completedCount": 5,
 *       "pendingCount": 0,
 *       "failedCount": 0,
 *       "totalLanguages": 5
 *     }
 *   ]
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<BatchStatusResponse>> {
  const startTime = Date.now();

  try {
    // 1. Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error as NextResponse<BatchStatusResponse>;
    }

    const supabase = authResult.supabase;

    // 2. Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 3. Validate request
    const validation = validateBatchRequest(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { entities } = validation.data;

    // 4. Group entities by type for efficient querying
    const groupedEntities = groupEntitiesByType(entities);

    // 5. Fetch job status and translation counts for each entity type
    const jobCountsMap = new Map<string, { queued: number; processing: number; completed: number; failed: number }>();
    const translationCountsMap = new Map<string, number>();

    // Process each entity type in parallel
    const fetchPromises: Promise<void>[] = [];

    for (const [entityType, entityIds] of groupedEntities) {
      fetchPromises.push(
        (async () => {
          const [jobCounts, translationCounts] = await Promise.all([
            fetchJobStatusCounts(supabase, entityType, entityIds),
            fetchTranslationCounts(supabase, entityType, entityIds)
          ]);

          // Merge results into the maps using composite keys
          for (const [id, counts] of jobCounts) {
            const key = `${entityType}:${id}`;
            jobCountsMap.set(key, counts);
          }

          for (const [id, count] of translationCounts) {
            const key = `${entityType}:${id}`;
            translationCountsMap.set(key, count);
          }
        })()
      );
    }

    await Promise.all(fetchPromises);

    // 6. Build response in the same order as input
    const results: EntityStatusSummary[] = entities.map((entity: EntityReference) => {
      const key = `${entity.entityType}:${entity.entityId}`;
      const jobCounts = jobCountsMap.get(key) || { queued: 0, processing: 0, completed: 0, failed: 0 };
      const completedTranslations = translationCountsMap.get(key) || 0;

      return createStatusSummary(
        entity.entityType,
        entity.entityId,
        completedTranslations,
        jobCounts.queued,
        jobCounts.processing,
        jobCounts.failed
      );
    });

    // 7. Log performance metrics
    const duration = Date.now() - startTime;
    console.log(`Batch status endpoint completed: ${entities.length} entities in ${duration}ms`);

    // 8. Return response with caching headers
    const response = NextResponse.json<BatchStatusResponse>(
      { success: true, data: results },
      { status: 200 }
    );

    // Set Cache-Control header for short-term caching
    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');

    return response;

  } catch (error) {
    console.error('Batch status endpoint error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] POST endpoint accepts array of entity references
- [ ] Validates authentication before processing
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 400 for validation failures with descriptive errors
- [ ] Response order matches input order
- [ ] Includes Cache-Control header
- [ ] Completes within 2 seconds for 100 entities
- [ ] Handles database errors gracefully

**Estimated Effort:** 1 story point

---

### Task 6: Add Performance Validation and Logging

**File to Modify:** `/src/app/api/translations/status/batch/route.ts`

**Objective:** Ensure the endpoint meets the 2-second performance requirement and add appropriate logging.

**Implementation Steps:**

6.1. Add performance timing to the route handler (already included in Task 5)

6.2. Create a simple performance test script (optional, for manual testing):

**File to Create (optional):** `/scripts/test-batch-status-performance.ts`

```typescript
/**
 * Performance test for batch status endpoint
 * Run with: npx ts-node scripts/test-batch-status-performance.ts
 */

async function testPerformance() {
  const testEntities = Array.from({ length: 100 }, (_, i) => ({
    entityType: ['item', 'article', 'link', 'tag'][i % 4],
    entityId: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`
  }));

  console.log(`Testing with ${testEntities.length} entities...`);

  const start = Date.now();

  const response = await fetch('http://localhost:3000/api/translations/status/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add auth header as needed
    },
    body: JSON.stringify({ entities: testEntities })
  });

  const duration = Date.now() - start;
  const result = await response.json();

  console.log(`Response status: ${response.status}`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Result count: ${result.data?.length || 0}`);
  console.log(`Performance target met: ${duration < 2000 ? 'YES' : 'NO'}`);
}

testPerformance().catch(console.error);
```

**Acceptance Criteria:**
- [ ] Endpoint logs performance metrics for monitoring
- [ ] Batch of 100 entities completes in < 2 seconds
- [ ] Query strategy minimizes database round trips

**Estimated Effort:** 0.5 story points

---

### Task 7: Create Unit Tests

**File to Create:** `/src/app/api/translations/status/batch/__tests__/validation.test.ts`

**Objective:** Test request validation logic.

**Implementation Steps:**

7.1. Create validation tests:

```typescript
/**
 * Unit Tests for Batch Status Validation
 * Part of REQ-355
 */

import { describe, it, expect } from 'vitest';
import { validateBatchRequest, validateEntityReference, MAX_BATCH_SIZE } from '../validation';

describe('validateEntityReference', () => {
  it('returns valid for correct entity reference', () => {
    const result = validateEntityReference(
      { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789012' },
      0
    );
    expect(result.valid).toBe(true);
  });

  it('returns error for invalid entityType', () => {
    const result = validateEntityReference(
      { entityType: 'invalid', entityId: '12345678-1234-1234-1234-123456789012' },
      0
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid entityType');
  });

  it('returns error for invalid UUID format', () => {
    const result = validateEntityReference(
      { entityType: 'item', entityId: 'not-a-uuid' },
      0
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid entityId format');
  });

  it('returns error for missing entityId', () => {
    const result = validateEntityReference(
      { entityType: 'item' },
      0
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing entityId');
  });
});

describe('validateBatchRequest', () => {
  it('returns valid for correct request', () => {
    const result = validateBatchRequest({
      entities: [
        { entityType: 'item', entityId: '12345678-1234-1234-1234-123456789012' }
      ]
    });
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('returns error for missing body', () => {
    const result = validateBatchRequest(null);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid request body');
  });

  it('returns error for missing entities array', () => {
    const result = validateBatchRequest({});
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing entities array');
  });

  it('returns error for empty entities array', () => {
    const result = validateBatchRequest({ entities: [] });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Entities array cannot be empty');
  });

  it('returns error for batch size exceeding limit', () => {
    const entities = Array.from({ length: MAX_BATCH_SIZE + 1 }, (_, i) => ({
      entityType: 'item',
      entityId: `12345678-1234-1234-1234-${String(i).padStart(12, '0')}`
    }));
    const result = validateBatchRequest({ entities });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Batch size exceeds limit');
  });
});
```

**File to Create:** `/src/app/api/translations/status/batch/__tests__/status-computation.test.ts`

```typescript
/**
 * Unit Tests for Status Computation
 * Part of REQ-355
 */

import { describe, it, expect } from 'vitest';
import { computeOverallStatus, createStatusSummary } from '../status-computation';

describe('computeOverallStatus', () => {
  it('returns no_translations when no jobs and no translations', () => {
    expect(computeOverallStatus(0, 0, 0, 0)).toBe('no_translations');
  });

  it('returns completed when all languages have translations', () => {
    expect(computeOverallStatus(5, 0, 0, 0, 5)).toBe('completed');
  });

  it('returns failed when all jobs failed and no completed', () => {
    expect(computeOverallStatus(0, 0, 0, 5)).toBe('failed');
  });

  it('returns in_progress when any job is processing', () => {
    expect(computeOverallStatus(2, 1, 2, 0)).toBe('in_progress');
  });

  it('returns pending when jobs queued but not processing', () => {
    expect(computeOverallStatus(0, 3, 0, 0)).toBe('pending');
  });

  it('returns partial when mix of completed and failed', () => {
    expect(computeOverallStatus(3, 0, 0, 2)).toBe('partial');
  });

  it('returns partial when some completed but not all', () => {
    expect(computeOverallStatus(3, 0, 0, 0, 5)).toBe('partial');
  });
});

describe('createStatusSummary', () => {
  it('creates correct summary structure', () => {
    const summary = createStatusSummary('item', 'uuid-123', 3, 1, 1, 0);

    expect(summary.entityType).toBe('item');
    expect(summary.entityId).toBe('uuid-123');
    expect(summary.completedCount).toBe(3);
    expect(summary.pendingCount).toBe(2); // queued + processing
    expect(summary.failedCount).toBe(0);
    expect(summary.totalLanguages).toBe(5);
    expect(summary.overallStatus).toBe('in_progress');
  });
});
```

**Acceptance Criteria:**
- [ ] All validation scenarios are tested
- [ ] All status computation scenarios are tested
- [ ] Tests pass with `npm test`

**Estimated Effort:** 0.5 story points

---

### Task 8: Create Integration Tests

**File to Create:** `/src/app/api/translations/status/batch/__tests__/route.integration.test.ts`

**Objective:** Test the full endpoint behavior with mocked database.

**Implementation Steps:**

8.1. Create integration tests:

```typescript
/**
 * Integration Tests for Batch Status Endpoint
 * Part of REQ-355
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock the auth module
vi.mock('@/lib/auth-server', () => ({
  validateAdminAuth: vi.fn()
}));

// Mock the database module
vi.mock('../database', () => ({
  groupEntitiesByType: vi.fn(),
  fetchJobStatusCounts: vi.fn(),
  fetchTranslationCounts: vi.fn()
}));

import { validateAdminAuth } from '@/lib/auth-server';
import { groupEntitiesByType, fetchJobStatusCounts, fetchTranslationCounts } from '../database';

describe('POST /api/translations/status/batch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for unauthenticated requests', async () => {
    (validateAdminAuth as any).mockResolvedValue({
      error: new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 })
    });

    const request = new NextRequest('http://localhost/api/translations/status/batch', {
      method: 'POST',
      body: JSON.stringify({ entities: [] })
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid request body', async () => {
    (validateAdminAuth as any).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      supabase: {}
    });

    const request = new NextRequest('http://localhost/api/translations/status/batch', {
      method: 'POST',
      body: JSON.stringify({ entities: 'not-an-array' })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('array');
  });

  it('returns 400 for empty entities array', async () => {
    (validateAdminAuth as any).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      supabase: {}
    });

    const request = new NextRequest('http://localhost/api/translations/status/batch', {
      method: 'POST',
      body: JSON.stringify({ entities: [] })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('empty');
  });

  it('returns correct status summaries for valid request', async () => {
    const mockSupabase = {};

    (validateAdminAuth as any).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      supabase: mockSupabase
    });

    (groupEntitiesByType as any).mockReturnValue(
      new Map([['item', ['uuid-1', 'uuid-2']]])
    );

    (fetchJobStatusCounts as any).mockResolvedValue(
      new Map([
        ['uuid-1', { queued: 0, processing: 0, completed: 0, failed: 0 }],
        ['uuid-2', { queued: 2, processing: 1, completed: 0, failed: 0 }]
      ])
    );

    (fetchTranslationCounts as any).mockResolvedValue(
      new Map([
        ['uuid-1', 5],
        ['uuid-2', 2]
      ])
    );

    const request = new NextRequest('http://localhost/api/translations/status/batch', {
      method: 'POST',
      body: JSON.stringify({
        entities: [
          { entityType: 'item', entityId: 'uuid-1' },
          { entityType: 'item', entityId: 'uuid-2' }
        ]
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);

    // First item should be completed
    expect(data.data[0].overallStatus).toBe('completed');
    expect(data.data[0].completedCount).toBe(5);

    // Second item should be in_progress
    expect(data.data[1].overallStatus).toBe('in_progress');
    expect(data.data[1].pendingCount).toBe(3);
  });

  it('preserves input order in response', async () => {
    (validateAdminAuth as any).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      supabase: {}
    });

    (groupEntitiesByType as any).mockImplementation((entities: any[]) => {
      const map = new Map();
      for (const e of entities) {
        const arr = map.get(e.entityType) || [];
        arr.push(e.entityId);
        map.set(e.entityType, arr);
      }
      return map;
    });

    (fetchJobStatusCounts as any).mockResolvedValue(new Map());
    (fetchTranslationCounts as any).mockResolvedValue(new Map());

    const entities = [
      { entityType: 'item', entityId: 'uuid-1' },
      { entityType: 'article', entityId: 'uuid-2' },
      { entityType: 'link', entityId: 'uuid-3' }
    ];

    const request = new NextRequest('http://localhost/api/translations/status/batch', {
      method: 'POST',
      body: JSON.stringify({ entities })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.data[0].entityId).toBe('uuid-1');
    expect(data.data[1].entityId).toBe('uuid-2');
    expect(data.data[2].entityId).toBe('uuid-3');
  });

  it('includes Cache-Control header in response', async () => {
    (validateAdminAuth as any).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      supabase: {}
    });

    (groupEntitiesByType as any).mockReturnValue(new Map([['item', ['uuid-1']]]));
    (fetchJobStatusCounts as any).mockResolvedValue(new Map());
    (fetchTranslationCounts as any).mockResolvedValue(new Map());

    const request = new NextRequest('http://localhost/api/translations/status/batch', {
      method: 'POST',
      body: JSON.stringify({
        entities: [{ entityType: 'item', entityId: 'uuid-1' }]
      })
    });

    const response = await POST(request);

    expect(response.headers.get('Cache-Control')).toContain('max-age=10');
  });
});
```

**Acceptance Criteria:**
- [ ] Tests cover authentication scenarios
- [ ] Tests cover validation error scenarios
- [ ] Tests verify response structure
- [ ] Tests verify response order matches input
- [ ] Tests verify caching headers

**Estimated Effort:** 1 story point

---

## File Summary

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/batch/types.ts` | TypeScript type definitions |
| `/src/app/api/translations/status/batch/validation.ts` | Request validation utilities |
| `/src/app/api/translations/status/batch/status-computation.ts` | Status computation logic |
| `/src/app/api/translations/status/batch/database.ts` | Database query functions |
| `/src/app/api/translations/status/batch/route.ts` | Main API route handler |
| `/src/app/api/translations/status/batch/__tests__/validation.test.ts` | Validation unit tests |
| `/src/app/api/translations/status/batch/__tests__/status-computation.test.ts` | Status computation unit tests |
| `/src/app/api/translations/status/batch/__tests__/route.integration.test.ts` | Integration tests |

### Files to Reference (Read-Only)

| File Path | What to Reference |
|-----------|-------------------|
| `/src/lib/auth-server.ts` | `validateAdminAuth` function pattern |
| `/src/lib/job-queue/translation-jobs.types.ts` | `EntityType`, `JobStatus`, `SupportedLanguage` types |
| `/src/app/api/admin/items/route.ts` | API route patterns, error handling |
| `/src/lib/supabase.ts` | Database client usage |

---

## Estimated Total Effort

| Task | Story Points |
|------|-------------|
| Task 1: Create TypeScript Types | 0.5 |
| Task 2: Implement Request Validation | 0.5 |
| Task 3: Implement Status Computation | 0.5 |
| Task 4: Implement Database Queries | 1.0 |
| Task 5: Implement API Route Handler | 1.0 |
| Task 6: Performance Validation | 0.5 |
| Task 7: Unit Tests | 0.5 |
| Task 8: Integration Tests | 1.0 |
| **Total** | **5.5 story points** |

---

## Implementation Order

1. **Task 1** - Create types (foundation for all other tasks)
2. **Task 2** - Validation utilities
3. **Task 3** - Status computation logic
4. **Task 4** - Database query functions
5. **Task 5** - Main route handler
6. **Task 7** - Unit tests (can be done in parallel with Task 5)
7. **Task 8** - Integration tests
8. **Task 6** - Performance validation (final verification)

---

## Acceptance Criteria Verification Checklist

From REQ-355 requirements:

- [ ] POST endpoint accepts array of entity references in request body
- [ ] Each entity reference includes entityType field (item, article, link, tag)
- [ ] Each entity reference includes entityId field (UUID)
- [ ] Endpoint supports batch sizes up to 100 entities per request
- [ ] Response returns array of status summaries matching the order of input references
- [ ] Each status summary includes the original entityType and entityId for mapping
- [ ] Each status summary includes overall status (no_translations, pending, in_progress, completed, partial, failed)
- [ ] Each status summary includes completedCount (number of languages with completed translations)
- [ ] Each status summary includes pendingCount (number of languages with queued or processing jobs)
- [ ] Each status summary includes failedCount (number of languages with failed jobs)
- [ ] Each status summary includes totalLanguages (number of target languages configured)
- [ ] Database query uses optimized joins and aggregations to minimize query complexity
- [ ] Endpoint returns 400 when request body is malformed or exceeds batch size limit
- [ ] Endpoint validates entityType values and returns 400 for invalid types
- [ ] Endpoint validates entityId format (must be valid UUID) and returns 400 for invalid format
- [ ] For entities that do not exist, status summary indicates no_translations status with zero counts
- [ ] Response includes appropriate Cache-Control header to allow short-term caching
- [ ] Endpoint completes within 2 seconds for batches of 100 entities
- [ ] Response structure is documented for client-side consumption (TypeScript types)

---

## References

- **Overview Document:** REQ-355-create-batch-status-endpoint-for-list-views-overview.md
- **Implementation Plan:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md (Phase 4, Task 4.4)
- **PRD:** PRD_L10N_Epic3_Dynamic_Content_Translation.md
- **Related Endpoint:** Single entity status at `/api/translations/status/[entityType]/[entityId]`
