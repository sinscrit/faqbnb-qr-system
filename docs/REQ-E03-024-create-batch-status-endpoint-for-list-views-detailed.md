# REQ-E03-024: Create Batch Status Endpoint for List Views

**Detailed Task Breakdown Document**

---

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E03-024 |
| **Title** | Create Batch Status Endpoint for List Views |
| **Type** | NEW FEATURE |
| **Size** | M (Medium) |
| **Epic** | Epic 3 - Dynamic Content Translation |
| **Phase** | 4 - Translation Status & Management APIs |
| **Task ID** | 4.4 |
| **Date Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 11:45:00 UTC |
| **PRD Reference** | Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| **Overview Document** | REQ-E03-024-create-batch-status-endpoint-for-list-views-overview.md |
| **Dependencies** | REQ-E03-006 (Translation Status Utilities), REQ-E03-021 (Single Entity Status Endpoint) |

---

## Table of Contents

1. [Summary](#1-summary)
2. [Prerequisites](#2-prerequisites)
3. [Implementation Tasks](#3-implementation-tasks)
4. [File Changes Summary](#4-file-changes-summary)
5. [Testing Requirements](#5-testing-requirements)
6. [Acceptance Criteria Checklist](#6-acceptance-criteria-checklist)

---

## 1. Summary

This document breaks down the implementation of REQ-E03-024 into granular, actionable tasks. The endpoint will accept an array of entity specifications and return translation status for all entities in a single optimized response, enabling efficient dashboard and list view scenarios without the N+1 query problem.

**Key Implementation Points:**
- POST endpoint at `/api/translations/status/batch`
- Maximum 100 entities per request
- Batch database queries using IN clauses (max 8 queries total)
- Response maintains request array order
- Handles not_found and error states per entity without failing entire request

---

## 2. Prerequisites

### 2.1 Required Dependencies (Must Be Completed First)

| Dependency | File/Location | Verification |
|------------|---------------|--------------|
| REQ-E03-001 | `/src/lib/content-translation/` | Module structure exists |
| REQ-E03-005 | `/src/lib/content-translation/storage/translation-storage.ts` | Storage utilities exist |
| REQ-E03-006 | `/src/lib/content-translation/storage/translation-status.ts` | Status utilities exist |
| Plan-111 Phase 6 | Database | Translation lookup indexes created |

### 2.2 Verification Commands

```bash
# Verify content translation module exists
ls -la src/lib/content-translation/

# Verify translation status utilities exist
ls -la src/lib/content-translation/storage/translation-status.ts

# Verify translation tables exist
# Use Supabase MCP: list_tables

# Verify indexes exist (via Supabase MCP or migration history)
# Check for: idx_translation_jobs_entity, idx_item_translations_lookup, etc.
```

---

## 3. Implementation Tasks

### Task 1: Create Types File for Batch Status Endpoint

**File:** `/src/app/api/translations/status/batch/types.ts`

**Description:** Define all TypeScript interfaces for the batch status endpoint request and response structures.

**Implementation Steps:**

1. Create the new file at the specified path
2. Import required types from existing modules:
   ```typescript
   import { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
   ```
3. Define `EntitySpecification` interface:
   ```typescript
   export interface EntitySpecification {
     entityType: 'item' | 'article' | 'link' | 'tag';
     entityId: string;
   }
   ```
4. Define `BatchStatusRequest` interface:
   ```typescript
   export interface BatchStatusRequest {
     entities: EntitySpecification[];
   }
   ```
5. Define `EntityStatus` type:
   ```typescript
   export type EntityStatus =
     | 'not_found'
     | 'error'
     | 'fully_translated'
     | 'partially_translated'
     | 'pending'
     | 'not_started'
     | 'has_failures';
   ```
6. Define `EntityStatusSummary` interface:
   ```typescript
   export interface EntityStatusSummary {
     entityType: 'item' | 'article' | 'link' | 'tag';
     entityId: string;
     status: EntityStatus;
     completionPercentage?: number;
     availableLanguages?: SupportedLanguage[];
     pendingCount?: number;
     failedCount?: number;
     errorMessage?: string;
   }
   ```
7. Define `BatchStatusMeta` interface:
   ```typescript
   export interface BatchStatusMeta {
     requested: number;
     returned: number;
     processingTimeMs: number;
   }
   ```
8. Define `BatchStatusResponse` interface:
   ```typescript
   export interface BatchStatusResponse {
     success: boolean;
     data?: EntityStatusSummary[];
     error?: string;
     meta?: BatchStatusMeta;
   }
   ```
9. Export all types

**Acceptance Criteria:**
- [ ] File exists at `/src/app/api/translations/status/batch/types.ts`
- [ ] All interfaces are properly typed with no `any` types
- [ ] Types are exported and importable
- [ ] TypeScript compilation succeeds with no errors

---

### Task 2: Create Route File with Basic Structure

**File:** `/src/app/api/translations/status/batch/route.ts`

**Description:** Create the route file with POST handler skeleton, imports, and error handling structure.

**Implementation Steps:**

1. Create directory structure if not exists: `/src/app/api/translations/status/batch/`
2. Create the route.ts file with imports:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { validateAdminAuth } from '@/lib/auth-server';
   import { createClient } from '@/lib/supabase';
   import type {
     BatchStatusRequest,
     BatchStatusResponse,
     EntitySpecification,
     EntityStatusSummary,
   } from './types';
   ```
3. Export async POST function with proper signature:
   ```typescript
   export async function POST(
     request: NextRequest
   ): Promise<NextResponse<BatchStatusResponse>> {
     // Implementation will go here
   }
   ```
4. Add try-catch wrapper with 500 error handling:
   ```typescript
   try {
     // Main logic
   } catch (error) {
     console.error('Batch status endpoint error:', error);
     return NextResponse.json(
       { success: false, error: 'Internal server error' },
       { status: 500 }
     );
   }
   ```
5. Add authentication check at start of try block:
   ```typescript
   const authResult = await validateAdminAuth(request);
   if (!authResult.isValid) {
     return NextResponse.json(
       { success: false, error: 'Unauthorized' },
       { status: 401 }
     );
   }
   ```
6. Add request body parsing with error handling:
   ```typescript
   let body: BatchStatusRequest;
   try {
     body = await request.json();
   } catch {
     return NextResponse.json(
       { success: false, error: 'Invalid JSON request body' },
       { status: 400 }
     );
   }
   ```

**Acceptance Criteria:**
- [ ] Route file exists at correct path
- [ ] POST handler is exported
- [ ] Authentication check is in place
- [ ] Error handling wraps main logic
- [ ] Request body is parsed with error handling

---

### Task 3: Implement Request Validation Function

**File:** `/src/app/api/translations/status/batch/route.ts`

**Description:** Implement the `validateBatchRequest` function that validates the request body structure, array limits, and entity types.

**Implementation Steps:**

1. Add the validation function before the POST handler:
   ```typescript
   const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;
   const MAX_ENTITIES = 100;

   function validateBatchRequest(
     body: unknown
   ): { valid: true; entities: EntitySpecification[] } | { valid: false; error: string } {
     // Implementation
   }
   ```

2. Validate body is an object:
   ```typescript
   if (!body || typeof body !== 'object') {
     return { valid: false, error: 'Request body must be an object' };
   }
   ```

3. Validate entities array exists:
   ```typescript
   const { entities } = body as { entities?: unknown };
   if (!entities || !Array.isArray(entities)) {
     return { valid: false, error: 'Request body must contain entities array' };
   }
   ```

4. Validate entities array is non-empty:
   ```typescript
   if (entities.length === 0) {
     return { valid: false, error: 'Entities array cannot be empty' };
   }
   ```

5. Validate entities array does not exceed limit:
   ```typescript
   if (entities.length > MAX_ENTITIES) {
     return {
       valid: false,
       error: `Entities array cannot exceed ${MAX_ENTITIES} elements (received ${entities.length})`
     };
   }
   ```

6. Validate each entity in the array:
   ```typescript
   for (let i = 0; i < entities.length; i++) {
     const entity = entities[i];
     if (!entity || typeof entity !== 'object') {
       return { valid: false, error: `Invalid entity at index ${i}: must be an object` };
     }
     const { entityType, entityId } = entity as { entityType?: unknown; entityId?: unknown };

     if (!entityType || typeof entityType !== 'string') {
       return { valid: false, error: `Invalid entity at index ${i}: missing or invalid entityType` };
     }
     if (!VALID_ENTITY_TYPES.includes(entityType as typeof VALID_ENTITY_TYPES[number])) {
       return {
         valid: false,
         error: `Invalid entity at index ${i}: entityType '${entityType}' is not supported. Valid types: ${VALID_ENTITY_TYPES.join(', ')}`
       };
     }
     if (!entityId || typeof entityId !== 'string' || entityId.trim() === '') {
       return { valid: false, error: `Invalid entity at index ${i}: missing or invalid entityId` };
     }
   }
   ```

7. Return valid result with typed entities:
   ```typescript
   return { valid: true, entities: entities as EntitySpecification[] };
   ```

8. Wire up validation in POST handler:
   ```typescript
   const validationResult = validateBatchRequest(body);
   if (!validationResult.valid) {
     return NextResponse.json(
       { success: false, error: validationResult.error },
       { status: 400 }
     );
   }
   const { entities } = validationResult;
   ```

**Acceptance Criteria:**
- [ ] Function validates body is an object
- [ ] Function validates entities array exists
- [ ] Function validates entities array is non-empty
- [ ] Function enforces maximum 100 entities
- [ ] Function validates each entity has valid entityType
- [ ] Function validates each entity has non-empty entityId
- [ ] Error messages include index information for invalid entities
- [ ] Function returns properly typed result

---

### Task 4: Implement Entity Grouping Function

**File:** `/src/app/api/translations/status/batch/route.ts`

**Description:** Implement the `groupEntitiesByType` function that groups entity IDs by their type for efficient batch querying.

**Implementation Steps:**

1. Define the entity type type:
   ```typescript
   type EntityType = 'item' | 'article' | 'link' | 'tag';
   ```

2. Add the grouping function:
   ```typescript
   function groupEntitiesByType(
     entities: EntitySpecification[]
   ): Map<EntityType, string[]> {
     const grouped = new Map<EntityType, string[]>();

     for (const entity of entities) {
       const existingIds = grouped.get(entity.entityType) || [];
       existingIds.push(entity.entityId);
       grouped.set(entity.entityType, existingIds);
     }

     return grouped;
   }
   ```

3. Alternative implementation using reduce (choose one):
   ```typescript
   function groupEntitiesByType(
     entities: EntitySpecification[]
   ): Map<EntityType, string[]> {
     return entities.reduce((map, entity) => {
       const existing = map.get(entity.entityType) || [];
       map.set(entity.entityType, [...existing, entity.entityId]);
       return map;
     }, new Map<EntityType, string[]>());
   }
   ```

**Acceptance Criteria:**
- [ ] Function accepts array of EntitySpecification
- [ ] Function returns Map<EntityType, string[]>
- [ ] All entity IDs are grouped under their respective types
- [ ] Mixed entity types are handled correctly
- [ ] Empty arrays for types with no entities are not created

---

### Task 5: Implement Job Status Batch Fetch Function

**File:** `/src/app/api/translations/status/batch/route.ts`

**Description:** Implement the `fetchBatchJobStatus` function that batch fetches translation jobs for a given entity type.

**Implementation Steps:**

1. Define the internal JobRecord type:
   ```typescript
   interface JobRecord {
     entity_id: string;
     target_language: string;
     status: 'queued' | 'processing' | 'completed' | 'failed';
     error_message: string | null;
     created_at: string;
   }
   ```

2. Implement the fetch function:
   ```typescript
   async function fetchBatchJobStatus(
     supabase: ReturnType<typeof createClient>,
     entityType: EntityType,
     entityIds: string[]
   ): Promise<Map<string, JobRecord[]>> {
     const result = new Map<string, JobRecord[]>();

     if (entityIds.length === 0) {
       return result;
     }

     const { data, error } = await supabase
       .from('translation_jobs')
       .select('entity_id, target_language, status, error_message, created_at')
       .eq('entity_type', entityType)
       .in('entity_id', entityIds);

     if (error) {
       console.error(`Error fetching job status for ${entityType}:`, error);
       // Return empty map - individual entities will be marked as error
       return result;
     }

     // Group jobs by entity_id
     for (const job of data || []) {
       const existing = result.get(job.entity_id) || [];
       existing.push(job);
       result.set(job.entity_id, existing);
     }

     return result;
   }
   ```

**Acceptance Criteria:**
- [ ] Function accepts supabase client, entityType, and array of entityIds
- [ ] Function queries translation_jobs table with IN clause
- [ ] Function filters by entity_type
- [ ] Function selects only necessary fields
- [ ] Function returns Map<entityId, JobRecord[]>
- [ ] Function handles empty entityIds array
- [ ] Function handles database errors gracefully

---

### Task 6: Implement Translation Status Batch Fetch Function

**File:** `/src/app/api/translations/status/batch/route.ts`

**Description:** Implement the `fetchBatchTranslationStatus` function that batch fetches stored translations for a given entity type.

**Implementation Steps:**

1. Define the internal TranslationRecord type:
   ```typescript
   interface TranslationRecord {
     entity_id: string;  // Will be mapped from actual column name
     language: string;
     translation_status: 'pending' | 'completed' | 'failed' | 'manual';
   }
   ```

2. Define table and column mappings:
   ```typescript
   const TRANSLATION_TABLE_CONFIG: Record<EntityType, { table: string; idColumn: string }> = {
     item: { table: 'item_translations', idColumn: 'item_id' },
     article: { table: 'article_translations', idColumn: 'article_id' },
     link: { table: 'link_translations', idColumn: 'link_id' },
     tag: { table: 'tag_translations', idColumn: 'tag_key' },
   };
   ```

3. Implement the fetch function:
   ```typescript
   async function fetchBatchTranslationStatus(
     supabase: ReturnType<typeof createClient>,
     entityType: EntityType,
     entityIds: string[]
   ): Promise<Map<string, TranslationRecord[]>> {
     const result = new Map<string, TranslationRecord[]>();

     if (entityIds.length === 0) {
       return result;
     }

     const config = TRANSLATION_TABLE_CONFIG[entityType];

     const { data, error } = await supabase
       .from(config.table)
       .select(`${config.idColumn}, language, translation_status`)
       .in(config.idColumn, entityIds);

     if (error) {
       console.error(`Error fetching translations for ${entityType}:`, error);
       return result;
     }

     // Group translations by entity_id
     for (const translation of data || []) {
       const entityId = translation[config.idColumn as keyof typeof translation] as string;
       const record: TranslationRecord = {
         entity_id: entityId,
         language: translation.language,
         translation_status: translation.translation_status,
       };

       const existing = result.get(entityId) || [];
       existing.push(record);
       result.set(entityId, existing);
     }

     return result;
   }
   ```

**Acceptance Criteria:**
- [ ] Function accepts supabase client, entityType, and array of entityIds
- [ ] Function queries correct table based on entityType
- [ ] Function uses correct ID column for each table
- [ ] Function queries with IN clause
- [ ] Function returns Map<entityId, TranslationRecord[]>
- [ ] Function handles empty entityIds array
- [ ] Function handles database errors gracefully

---

### Task 7: Implement Status Aggregation Function

**File:** `/src/app/api/translations/status/batch/route.ts`

**Description:** Implement the `aggregateEntityStatus` function that calculates overall status for a single entity from its jobs and translations.

**Implementation Steps:**

1. Import or define target languages constant:
   ```typescript
   const TARGET_LANGUAGES = ['fr', 'es', 'de', 'nl', 'it'] as const;
   ```

2. Implement the aggregation function:
   ```typescript
   function aggregateEntityStatus(
     entityType: EntityType,
     entityId: string,
     jobs: JobRecord[],
     translations: TranslationRecord[]
   ): EntityStatusSummary {
     // Check for failures first
     const failedJobs = jobs.filter(j => j.status === 'failed');
     const failedCount = failedJobs.length;

     // Count pending jobs (queued or processing)
     const pendingJobs = jobs.filter(j => j.status === 'queued' || j.status === 'processing');
     const pendingCount = pendingJobs.length;

     // Count completed translations
     const completedTranslations = translations.filter(
       t => t.translation_status === 'completed' || t.translation_status === 'manual'
     );
     const completedCount = completedTranslations.length;

     // Get available languages
     const availableLanguages = completedTranslations.map(t => t.language) as SupportedLanguage[];

     // Calculate completion percentage
     const totalTargetLanguages = TARGET_LANGUAGES.length;
     const completionPercentage = Math.round((completedCount / totalTargetLanguages) * 100);

     // Determine overall status
     let status: EntityStatus;

     if (failedCount > 0) {
       status = 'has_failures';
     } else if (completedCount === totalTargetLanguages) {
       status = 'fully_translated';
     } else if (pendingCount > 0) {
       status = 'pending';
     } else if (completedCount > 0) {
       status = 'partially_translated';
     } else {
       status = 'not_started';
     }

     return {
       entityType,
       entityId,
       status,
       completionPercentage,
       availableLanguages,
       pendingCount,
       failedCount,
     };
   }
   ```

**Acceptance Criteria:**
- [ ] Function accepts entityType, entityId, jobs array, and translations array
- [ ] Function correctly identifies failed jobs
- [ ] Function correctly counts pending jobs (queued + processing)
- [ ] Function correctly counts completed translations (completed + manual)
- [ ] Function calculates completion percentage correctly (0-100)
- [ ] Function collects available languages
- [ ] Function determines correct overall status based on priority rules
- [ ] Function returns complete EntityStatusSummary

---

### Task 8: Implement POST Handler Main Logic

**File:** `/src/app/api/translations/status/batch/route.ts`

**Description:** Complete the POST handler by wiring together all helper functions and building the response.

**Implementation Steps:**

1. Record start time for performance tracking:
   ```typescript
   const startTime = Date.now();
   ```

2. Group entities by type:
   ```typescript
   const groupedEntities = groupEntitiesByType(entities);
   ```

3. Initialize maps for jobs and translations:
   ```typescript
   const allJobs = new Map<string, Map<string, JobRecord[]>>();
   const allTranslations = new Map<string, Map<string, TranslationRecord[]>>();
   ```

4. Create supabase client:
   ```typescript
   const supabase = createClient();
   ```

5. Fetch data for each entity type present:
   ```typescript
   for (const [entityType, entityIds] of groupedEntities) {
     const [jobsMap, translationsMap] = await Promise.all([
       fetchBatchJobStatus(supabase, entityType, entityIds),
       fetchBatchTranslationStatus(supabase, entityType, entityIds),
     ]);

     allJobs.set(entityType, jobsMap);
     allTranslations.set(entityType, translationsMap);
   }
   ```

6. Build response array maintaining input order:
   ```typescript
   const results: EntityStatusSummary[] = entities.map(entity => {
     const jobsMap = allJobs.get(entity.entityType);
     const translationsMap = allTranslations.get(entity.entityType);

     const jobs = jobsMap?.get(entity.entityId) || [];
     const translations = translationsMap?.get(entity.entityId) || [];

     // If no jobs and no translations exist, entity might not exist
     if (jobs.length === 0 && translations.length === 0) {
       return {
         entityType: entity.entityType,
         entityId: entity.entityId,
         status: 'not_found' as EntityStatus,
       };
     }

     return aggregateEntityStatus(
       entity.entityType,
       entity.entityId,
       jobs,
       translations
     );
   });
   ```

7. Calculate processing time and build response:
   ```typescript
   const processingTimeMs = Date.now() - startTime;

   return NextResponse.json({
     success: true,
     data: results,
     meta: {
       requested: entities.length,
       returned: results.length,
       processingTimeMs,
     },
   });
   ```

**Acceptance Criteria:**
- [ ] POST handler validates authentication
- [ ] POST handler validates request body
- [ ] POST handler groups entities by type
- [ ] POST handler fetches jobs and translations in parallel per type
- [ ] POST handler builds response maintaining input order
- [ ] POST handler handles not_found entities
- [ ] POST handler includes metadata with processing time
- [ ] Response is returned as JSON with 200 status

---

### Task 9: Add Error Handling for Individual Entities

**File:** `/src/app/api/translations/status/batch/route.ts`

**Description:** Enhance error handling to mark individual entities with 'error' status rather than failing the entire request.

**Implementation Steps:**

1. Modify fetchBatchJobStatus to track errors:
   ```typescript
   async function fetchBatchJobStatus(
     supabase: ReturnType<typeof createClient>,
     entityType: EntityType,
     entityIds: string[]
   ): Promise<{ data: Map<string, JobRecord[]>; error: boolean }> {
     // ... existing implementation

     if (error) {
       console.error(`Error fetching job status for ${entityType}:`, error);
       return { data: new Map(), error: true };
     }

     // ... rest of implementation
     return { data: result, error: false };
   }
   ```

2. Modify fetchBatchTranslationStatus similarly

3. Track errors per entity type in main handler:
   ```typescript
   const errorTypes = new Set<EntityType>();

   for (const [entityType, entityIds] of groupedEntities) {
     const [jobsResult, translationsResult] = await Promise.all([
       fetchBatchJobStatus(supabase, entityType, entityIds),
       fetchBatchTranslationStatus(supabase, entityType, entityIds),
     ]);

     if (jobsResult.error || translationsResult.error) {
       errorTypes.add(entityType);
     }

     allJobs.set(entityType, jobsResult.data);
     allTranslations.set(entityType, translationsResult.data);
   }
   ```

4. Mark entities from error types:
   ```typescript
   const results: EntityStatusSummary[] = entities.map(entity => {
     if (errorTypes.has(entity.entityType)) {
       return {
         entityType: entity.entityType,
         entityId: entity.entityId,
         status: 'error' as EntityStatus,
         errorMessage: 'Database query failed for this entity type',
       };
     }
     // ... rest of existing logic
   });
   ```

**Acceptance Criteria:**
- [ ] Database errors are caught and logged
- [ ] Entities affected by errors are marked with 'error' status
- [ ] Error message is included in response for error entities
- [ ] Other entities in the same request are processed successfully
- [ ] Request does not fail entirely due to partial database errors

---

### Task 10: Add CORS and Response Headers

**File:** `/src/app/api/translations/status/batch/route.ts`

**Description:** Add appropriate CORS headers and ensure proper content-type.

**Implementation Steps:**

1. Add headers to successful response:
   ```typescript
   return NextResponse.json(
     {
       success: true,
       data: results,
       meta: {
         requested: entities.length,
         returned: results.length,
         processingTimeMs,
       },
     },
     {
       headers: {
         'Content-Type': 'application/json',
         'Cache-Control': 'no-store',
       },
     }
   );
   ```

2. Add OPTIONS handler for CORS preflight if needed:
   ```typescript
   export async function OPTIONS() {
     return new NextResponse(null, {
       status: 204,
       headers: {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Methods': 'POST, OPTIONS',
         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
       },
     });
   }
   ```

**Acceptance Criteria:**
- [ ] Response includes Content-Type header
- [ ] Response includes Cache-Control header (no-store for dynamic data)
- [ ] CORS headers are set for cross-origin requests if required

---

## 4. File Changes Summary

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/batch/types.ts` | TypeScript type definitions for request/response |
| `/src/app/api/translations/status/batch/route.ts` | POST handler for batch status endpoint |

### Modified Files

| File Path | Changes |
|-----------|---------|
| None | This is a new endpoint with no modifications to existing files |

### Files to Reference (Read-Only)

| File Path | Items to Import/Reference |
|-----------|---------------------------|
| `/src/lib/auth-server.ts` | `validateAdminAuth` function |
| `/src/lib/supabase.ts` | `createClient` function |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type |
| `/src/lib/content-translation/storage/translation-status.ts` | Reference for status logic patterns |

---

## 5. Testing Requirements

### 5.1 Unit Tests

**File:** `/src/app/api/translations/status/batch/__tests__/route.test.ts`

| Test Case | Description |
|-----------|-------------|
| `validateBatchRequest - empty body` | Should return error for empty request body |
| `validateBatchRequest - missing entities` | Should return error when entities array is missing |
| `validateBatchRequest - empty entities array` | Should return error for empty entities array |
| `validateBatchRequest - exceeds limit` | Should return error when more than 100 entities |
| `validateBatchRequest - invalid entityType` | Should return error with index for invalid type |
| `validateBatchRequest - missing entityId` | Should return error with index for missing ID |
| `validateBatchRequest - valid request` | Should return valid with typed entities |
| `groupEntitiesByType - mixed types` | Should correctly group mixed entity types |
| `groupEntitiesByType - single type` | Should handle single type correctly |
| `groupEntitiesByType - empty array` | Should return empty map for empty input |
| `aggregateEntityStatus - fully translated` | Should return fully_translated when all complete |
| `aggregateEntityStatus - has failures` | Should return has_failures when failed jobs exist |
| `aggregateEntityStatus - pending` | Should return pending when jobs are queued/processing |
| `aggregateEntityStatus - partially translated` | Should return correct status and percentage |
| `aggregateEntityStatus - not started` | Should return not_started when no jobs or translations |

### 5.2 Integration Tests

**File:** `/src/app/api/translations/status/batch/__tests__/integration.test.ts`

| Test Case | Description |
|-----------|-------------|
| `POST - full request flow` | Test complete flow with database |
| `POST - mixed entity types` | Test request with items, articles, links, tags |
| `POST - non-existent entities` | Verify not_found status is returned |
| `POST - response order matches request` | Verify array order is maintained |
| `POST - performance 100 entities` | Verify < 2s response time |
| `POST - performance 20 entities` | Verify < 500ms response time |
| `POST - database query efficiency` | Verify max 8 queries executed |
| `POST - unauthorized request` | Verify 401 returned without auth |
| `POST - malformed JSON` | Verify 400 returned for invalid JSON |

### 5.3 Manual Testing Checklist

- [ ] Test with Postman/curl using valid request
- [ ] Test with invalid entity types
- [ ] Test with mixed entity types
- [ ] Test with exactly 100 entities
- [ ] Test with 101 entities (should fail)
- [ ] Test with non-existent entity IDs
- [ ] Test without Authorization header
- [ ] Verify response includes metadata
- [ ] Verify processing time is reasonable

---

## 6. Acceptance Criteria Checklist

### Endpoint Structure
- [ ] POST endpoint exists at `/api/translations/status/batch`
- [ ] Request body contains `entities` array with `entityType` and `entityId` for each element
- [ ] Endpoint validates request body structure and returns 400 for malformed requests
- [ ] Endpoint validates `entityType` values against supported types for each array element
- [ ] Endpoint returns 400 with index information when invalid types are found
- [ ] Endpoint enforces maximum request size of 100 entities and returns 400 when exceeded

### Database Operations
- [ ] Endpoint groups entity specifications by type for efficient batch processing
- [ ] Endpoint executes batch database queries using IN clauses
- [ ] Endpoint performs maximum of 8 database queries regardless of entity count
- [ ] Endpoint retrieves translation job data for all specified entities in batch queries
- [ ] Endpoint retrieves translation record data for all specified entities in batch queries
- [ ] Endpoint aggregates job and translation data to determine per-entity status

### Response Structure
- [ ] Endpoint returns 200 status with JSON array response
- [ ] Response array length matches request array length exactly
- [ ] Response array order matches request array order exactly
- [ ] Each response element includes `entityType` and `entityId` for reference
- [ ] Each response element includes overall status enumeration value
- [ ] Each response element includes completion percentage (0-100)
- [ ] Each response element includes array of available language codes
- [ ] Each response element includes count of pending languages
- [ ] Each response element includes count of failed languages

### Error Handling
- [ ] Non-existent entities return element with status 'not_found' rather than failing request
- [ ] Entities with database query errors return element with status 'error' and error message
- [ ] Response includes metadata with processing time

### Performance
- [ ] Endpoint completes within 2 seconds for requests containing 100 entities
- [ ] Endpoint completes within 500ms for requests containing 20 entities
- [ ] Database queries use appropriate indexes

### Type Safety
- [ ] TypeScript types are defined for request body structure, entity specification, and response array

---

## 7. Example Request/Response

### Request

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "entities": [
      {"entityType": "item", "entityId": "item-uuid-001"},
      {"entityType": "item", "entityId": "item-uuid-002"},
      {"entityType": "article", "entityId": "article-uuid-001"},
      {"entityType": "link", "entityId": "link-uuid-001"}
    ]
  }' \
  https://faqbnb-staging.up.railway.app/api/translations/status/batch
```

### Successful Response (200)

```json
{
  "success": true,
  "data": [
    {
      "entityType": "item",
      "entityId": "item-uuid-001",
      "status": "fully_translated",
      "completionPercentage": 100,
      "availableLanguages": ["fr", "es", "de", "nl", "it"],
      "pendingCount": 0,
      "failedCount": 0
    },
    {
      "entityType": "item",
      "entityId": "item-uuid-002",
      "status": "pending",
      "completionPercentage": 40,
      "availableLanguages": ["fr", "es"],
      "pendingCount": 3,
      "failedCount": 0
    },
    {
      "entityType": "article",
      "entityId": "article-uuid-001",
      "status": "not_found"
    },
    {
      "entityType": "link",
      "entityId": "link-uuid-001",
      "status": "has_failures",
      "completionPercentage": 60,
      "availableLanguages": ["fr", "es", "de"],
      "pendingCount": 0,
      "failedCount": 2
    }
  ],
  "meta": {
    "requested": 4,
    "returned": 4,
    "processingTimeMs": 145
  }
}
```

### Validation Error Response (400)

```json
{
  "success": false,
  "error": "Invalid entity at index 2: entityType 'invalid' is not supported. Valid types: item, article, link, tag"
}
```

---

*Document generated: 2026-01-20 11:45:00 UTC*
*Last modified: 2026-01-20 11:45:00 UTC*
