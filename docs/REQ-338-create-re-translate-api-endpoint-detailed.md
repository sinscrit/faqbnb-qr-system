# REQ-338: Create Re-Translate API Endpoint - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Reference:** docs/gen_requests_epic5.md - REQ-338
**Overview Document:** docs/REQ-338-create-re-translate-api-endpoint-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.3
**Estimated Effort:** 3-4 story points (1 story point = ~2-4 hours)

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for implementing the re-translate API endpoint at `/src/app/api/translations/retranslate/route.ts`. The endpoint enables property owners to trigger re-translation of existing content with bulk operation support, manual edit preservation controls, and detailed processing results.

---

## Prerequisites

Before starting implementation, verify:

- [ ] REQ-243 (Translation Job Queue Module) is complete
- [ ] REQ-244 (Job Processor) is complete
- [ ] Translation tables exist: `article_translations`, `item_translations`, `link_translations`
- [ ] `translation_jobs` table exists with proper schema
- [ ] `createBatchTranslationJobs()` function is available in `/src/lib/job-queue/translation-jobs.ts`

---

## Task Breakdown

### Task 1: Create API Route File Structure
**Estimated Effort:** 0.5 story points
**File:** `/src/app/api/translations/retranslate/route.ts`

#### Step 1.1: Create Directory Structure
Create the route file with basic Next.js App Router structure.

```typescript
// /src/app/api/translations/retranslate/route.ts
/**
 * REQ-338: Re-Translate API Endpoint
 * Created: 2026-01-19
 *
 * POST /api/translations/retranslate - Queue re-translation jobs for entities
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Implementation to follow
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}
```

#### Step 1.2: Add Import Statements
Add all required imports:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import { createBatchTranslationJobs } from '@/lib/job-queue/translation-jobs';
import type { EntityType, SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';
```

#### Step 1.3: Define TypeScript Interfaces
Add request/response interfaces at top of file:

```typescript
/**
 * Request body for re-translation endpoint
 */
interface RetranslateRequest {
  entities: Array<{
    type: 'article' | 'item' | 'link';
    id: string;
  }>;
  skipManualEdits?: boolean;  // Default: true (preserve manual edits)
}

/**
 * Response type for re-translation endpoint
 */
interface RetranslateResponse {
  success: boolean;
  data?: {
    jobCount: number;      // Number of translation jobs queued
    skippedCount: number;  // Number skipped due to manual edit protection
  };
  error?: string;
}

/**
 * Entity validation result
 */
interface EntityValidation {
  valid: boolean;
  entityType: EntityType;
  entityId: string;
  accountId?: string;
  error?: string;
}
```

**Acceptance Criteria:**
- [ ] File exists at correct path
- [ ] All imports resolve without errors
- [ ] TypeScript interfaces are properly defined
- [ ] File compiles without TypeScript errors

---

### Task 2: Implement Authentication & Account Context
**Estimated Effort:** 0.5 story points

#### Step 2.1: Add Authentication Validation
Implement authentication check using existing `validateAdminAuth`:

```typescript
export async function POST(request: NextRequest) {
  try {
    console.log('RETRANSLATE_API: Starting re-translate request...');

    // 1. Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log('RETRANSLATE_API: Authentication failed');
      return authResult.error;
    }

    const { user, isAdmin, supabase } = authResult;
    console.log('RETRANSLATE_API: User authenticated:', user.email);

    // Continue with request processing...
  } catch (error) {
    console.error('RETRANSLATE_API: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Step 2.2: Extract User Account Context
Get the user's account ID for ownership validation:

```typescript
// Get user's account(s) for authorization checks
const { data: userAccounts, error: accountsError } = await supabase
  .from('account_users')
  .select('account_id, role')
  .eq('user_id', user.id);

if (accountsError || !userAccounts || userAccounts.length === 0) {
  console.log('RETRANSLATE_API: No account access for user');
  return NextResponse.json(
    { success: false, error: 'No account access found' },
    { status: 403 }
  );
}

const userAccountIds = userAccounts.map(ua => ua.account_id);
console.log('RETRANSLATE_API: User has access to accounts:', userAccountIds);
```

**Acceptance Criteria:**
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 403 for users with no account access
- [ ] Successfully extracts user account IDs
- [ ] Logging provides debugging visibility

---

### Task 3: Implement Request Validation
**Estimated Effort:** 0.5 story points

#### Step 3.1: Parse Request Body
Parse and validate JSON body structure:

```typescript
// 2. Parse request body
let body: RetranslateRequest;
try {
  body = await request.json();
} catch {
  return NextResponse.json(
    { success: false, error: 'Invalid JSON in request body' },
    { status: 400 }
  );
}

console.log('RETRANSLATE_API: Request body:', {
  entityCount: body.entities?.length,
  skipManualEdits: body.skipManualEdits
});
```

#### Step 3.2: Validate Entities Array
Check entities array exists and is non-empty:

```typescript
// 3. Validate entities array
if (!body.entities || !Array.isArray(body.entities)) {
  return NextResponse.json(
    { success: false, error: 'Missing required field: entities (must be an array)' },
    { status: 400 }
  );
}

if (body.entities.length === 0) {
  return NextResponse.json(
    { success: false, error: 'At least one entity is required' },
    { status: 400 }
  );
}
```

#### Step 3.3: Validate Each Entity Object
Validate type and ID for each entity:

```typescript
const VALID_ENTITY_TYPES = ['article', 'item', 'link'] as const;

// 4. Validate each entity
for (const entity of body.entities) {
  if (!entity.type || !VALID_ENTITY_TYPES.includes(entity.type as typeof VALID_ENTITY_TYPES[number])) {
    return NextResponse.json(
      { success: false, error: `Invalid entity type: ${entity.type}. Must be one of: article, item, link` },
      { status: 400 }
    );
  }

  if (!entity.id || typeof entity.id !== 'string' || entity.id.trim() === '') {
    return NextResponse.json(
      { success: false, error: 'Invalid entity ID format: ID must be a non-empty string' },
      { status: 400 }
    );
  }

  // Validate UUID format (optional but recommended)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(entity.id)) {
    return NextResponse.json(
      { success: false, error: `Invalid entity ID format: ${entity.id}` },
      { status: 400 }
    );
  }
}

// Default skipManualEdits to true if not provided
const skipManualEdits = body.skipManualEdits !== false;
```

**Acceptance Criteria:**
- [ ] Returns 400 for missing entities array
- [ ] Returns 400 for empty entities array
- [ ] Returns 400 for invalid entity type
- [ ] Returns 400 for missing/invalid entity ID
- [ ] `skipManualEdits` defaults to `true`

---

### Task 4: Implement Entity Ownership Verification
**Estimated Effort:** 1 story point

#### Step 4.1: Create Ownership Verification Helper Function
Add helper function to verify entity ownership:

```typescript
/**
 * Verifies that the user owns the specified entity
 * Returns the account_id if authorized, or an error
 */
async function verifyEntityOwnership(
  entityType: 'article' | 'item' | 'link',
  entityId: string,
  userAccountIds: string[],
  supabase: any
): Promise<{ authorized: boolean; accountId?: string; error?: string }> {
  try {
    switch (entityType) {
      case 'article': {
        // Articles: item_articles -> items -> properties -> account_id
        const { data, error } = await supabase
          .from('item_articles')
          .select(`
            id,
            items!inner (
              id,
              properties!inner (
                account_id
              )
            )
          `)
          .eq('id', entityId)
          .single();

        if (error || !data) {
          return { authorized: false, error: 'Entity not found' };
        }

        const accountId = (data.items as any)?.properties?.account_id;
        if (!userAccountIds.includes(accountId)) {
          return { authorized: false, error: 'Access denied' };
        }

        return { authorized: true, accountId };
      }

      case 'item': {
        // Items: items -> properties -> account_id
        const { data, error } = await supabase
          .from('items')
          .select(`
            id,
            properties!inner (
              account_id
            )
          `)
          .eq('id', entityId)
          .single();

        if (error || !data) {
          return { authorized: false, error: 'Entity not found' };
        }

        const accountId = (data.properties as any)?.account_id;
        if (!userAccountIds.includes(accountId)) {
          return { authorized: false, error: 'Access denied' };
        }

        return { authorized: true, accountId };
      }

      case 'link': {
        // Links: item_links -> items -> properties -> account_id
        const { data, error } = await supabase
          .from('item_links')
          .select(`
            id,
            items!inner (
              id,
              properties!inner (
                account_id
              )
            )
          `)
          .eq('id', entityId)
          .single();

        if (error || !data) {
          return { authorized: false, error: 'Entity not found' };
        }

        const accountId = (data.items as any)?.properties?.account_id;
        if (!userAccountIds.includes(accountId)) {
          return { authorized: false, error: 'Access denied' };
        }

        return { authorized: true, accountId };
      }

      default:
        return { authorized: false, error: 'Unknown entity type' };
    }
  } catch (error) {
    console.error('RETRANSLATE_API: Ownership verification error:', error);
    return { authorized: false, error: 'Verification failed' };
  }
}
```

#### Step 4.2: Verify All Entities Before Processing
Check ownership for all entities upfront:

```typescript
// 5. Verify ownership for all entities
const unauthorizedEntities: string[] = [];
const notFoundEntities: string[] = [];

for (const entity of body.entities) {
  const ownership = await verifyEntityOwnership(
    entity.type as 'article' | 'item' | 'link',
    entity.id,
    userAccountIds,
    supabase
  );

  if (!ownership.authorized) {
    if (ownership.error === 'Entity not found') {
      notFoundEntities.push(`${entity.type}/${entity.id}`);
    } else {
      unauthorizedEntities.push(`${entity.type}/${entity.id}`);
    }
  }
}

// Return error if any entities are not found
if (notFoundEntities.length > 0) {
  return NextResponse.json(
    {
      success: false,
      error: `Entity not found: ${notFoundEntities[0]}`,
      notFoundEntities
    },
    { status: 404 }
  );
}

// Return error if any entities are unauthorized
if (unauthorizedEntities.length > 0) {
  return NextResponse.json(
    {
      success: false,
      error: 'Access denied to one or more entities',
      unauthorizedEntities
    },
    { status: 403 }
  );
}

console.log('RETRANSLATE_API: All entities verified');
```

**Acceptance Criteria:**
- [ ] Returns 404 for non-existent entities
- [ ] Returns 403 for entities user doesn't own
- [ ] Verifies ownership through correct table relationships
- [ ] Handles all entity types: article, item, link

---

### Task 5: Implement Manual Edit Detection
**Estimated Effort:** 0.5 story points

#### Step 5.1: Create Manual Translation Detection Helper
Add function to get manually edited languages for an entity:

```typescript
const ALL_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

/**
 * Gets languages that have manual translations for an entity
 */
async function getManualTranslationLanguages(
  entityType: 'article' | 'item' | 'link',
  entityId: string
): Promise<SupportedLanguage[]> {
  const translationTable = {
    article: 'article_translations',
    item: 'item_translations',
    link: 'link_translations'
  }[entityType];

  const idColumn = {
    article: 'article_id',
    item: 'item_id',
    link: 'link_id'
  }[entityType];

  try {
    // Query for manual translations
    // Status 'manual' indicates manually edited
    // For articles, also check reviewed_by IS NOT NULL
    let query = supabaseAdmin
      .from(translationTable)
      .select('language')
      .eq(idColumn, entityId)
      .eq('translation_status', 'manual');

    const { data, error } = await query;

    if (error) {
      console.error(`RETRANSLATE_API: Error fetching manual translations for ${entityType}/${entityId}:`, error);
      return [];
    }

    return (data || []).map(row => row.language as SupportedLanguage);
  } catch (error) {
    console.error('RETRANSLATE_API: Manual translation detection error:', error);
    return [];
  }
}

/**
 * Gets the source language for an entity
 */
async function getEntitySourceLanguage(
  entityType: 'article' | 'item' | 'link',
  entityId: string
): Promise<SupportedLanguage> {
  const table = {
    article: 'item_articles',
    item: 'items',
    link: 'item_links'
  }[entityType];

  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('source_language')
      .eq('id', entityId)
      .single();

    if (error || !data || !data.source_language) {
      return 'en'; // Default to English
    }

    return data.source_language as SupportedLanguage;
  } catch {
    return 'en';
  }
}
```

**Acceptance Criteria:**
- [ ] Correctly identifies manual translations by status
- [ ] Returns empty array on errors (graceful degradation)
- [ ] Handles all entity types

---

### Task 6: Implement Job Queuing Logic
**Estimated Effort:** 1 story point

#### Step 6.1: Process Each Entity and Queue Jobs
Implement the main processing loop:

```typescript
// 6. Process entities and queue translation jobs
let totalJobCount = 0;
let totalSkippedCount = 0;

for (const entity of body.entities) {
  const entityType = entity.type as EntityType;
  const entityId = entity.id;

  console.log(`RETRANSLATE_API: Processing ${entityType}/${entityId}`);

  // Get source language for this entity
  const sourceLanguage = await getEntitySourceLanguage(entityType, entityId);

  // Determine target languages (all except source)
  let targetLanguages = ALL_LANGUAGES.filter(lang => lang !== sourceLanguage);

  // If skipManualEdits is true, exclude manually edited languages
  if (skipManualEdits) {
    const manualLanguages = await getManualTranslationLanguages(entityType, entityId);
    const skippedForManual = targetLanguages.filter(lang => manualLanguages.includes(lang));
    totalSkippedCount += skippedForManual.length;

    targetLanguages = targetLanguages.filter(lang => !manualLanguages.includes(lang));

    console.log(`RETRANSLATE_API: ${entityType}/${entityId} - Skipping manual languages:`, skippedForManual);
  }

  // Skip if no target languages remain
  if (targetLanguages.length === 0) {
    console.log(`RETRANSLATE_API: ${entityType}/${entityId} - No target languages to process`);
    continue;
  }

  // Queue translation jobs
  const result = await createBatchTranslationJobs({
    entityType,
    entityId,
    sourceLanguage,
    targetLanguages
  });

  if (result.success && result.data) {
    totalJobCount += result.data.length;
    console.log(`RETRANSLATE_API: ${entityType}/${entityId} - Queued ${result.data.length} jobs`);
  } else {
    console.error(`RETRANSLATE_API: Failed to queue jobs for ${entityType}/${entityId}:`, result.error);
    // Continue processing other entities even if one fails
  }
}
```

#### Step 6.2: Handle Edge Cases
Add handling for edge cases:

```typescript
// Handle case where all jobs were skipped
if (totalJobCount === 0 && totalSkippedCount === 0) {
  // This shouldn't happen if validation passed, but handle gracefully
  console.log('RETRANSLATE_API: No jobs queued or skipped');
}
```

**Acceptance Criteria:**
- [ ] Correctly excludes source language from targets
- [ ] Respects `skipManualEdits` parameter
- [ ] Uses existing `createBatchTranslationJobs()` function
- [ ] Continues processing if one entity fails
- [ ] Tracks both queued and skipped counts

---

### Task 7: Implement Response Building
**Estimated Effort:** 0.25 story points

#### Step 7.1: Build Success Response
Return the final response with counts:

```typescript
// 7. Return success response
const response: RetranslateResponse = {
  success: true,
  data: {
    jobCount: totalJobCount,
    skippedCount: totalSkippedCount
  }
};

console.log('RETRANSLATE_API: Complete', response.data);

return NextResponse.json(response);
```

#### Step 7.2: Add Error Handling Wrapper
Ensure all errors are caught:

```typescript
} catch (error) {
  console.error('RETRANSLATE_API: Unexpected error:', error);
  return NextResponse.json(
    {
      success: false,
      error: 'Failed to queue translation jobs'
    },
    { status: 500 }
  );
}
```

**Acceptance Criteria:**
- [ ] Returns `jobCount` - total jobs queued
- [ ] Returns `skippedCount` - skipped due to manual edit protection
- [ ] 500 errors are caught and returned gracefully

---

## Complete Implementation Reference

Below is the complete implementation for reference during code review:

```typescript
/**
 * REQ-338: Re-Translate API Endpoint
 * Created: 2026-01-19
 *
 * POST /api/translations/retranslate - Queue re-translation jobs for entities
 *
 * Enables property owners to trigger re-translation of existing content with:
 * - Bulk operation support (multiple entities in one request)
 * - Manual edit preservation control (skipManualEdits parameter)
 * - Detailed processing results (jobCount, skippedCount)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import { createBatchTranslationJobs } from '@/lib/job-queue/translation-jobs';
import type { EntityType, SupportedLanguage } from '@/lib/job-queue/translation-jobs.types';

// Supported languages for translation
const ALL_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
const VALID_ENTITY_TYPES = ['article', 'item', 'link'] as const;

/**
 * Request body for re-translation endpoint
 */
interface RetranslateRequest {
  entities: Array<{
    type: 'article' | 'item' | 'link';
    id: string;
  }>;
  skipManualEdits?: boolean;
}

/**
 * Response type for re-translation endpoint
 */
interface RetranslateResponse {
  success: boolean;
  data?: {
    jobCount: number;
    skippedCount: number;
  };
  error?: string;
}

/**
 * Verifies that the user owns the specified entity
 */
async function verifyEntityOwnership(
  entityType: 'article' | 'item' | 'link',
  entityId: string,
  userAccountIds: string[],
  supabase: any
): Promise<{ authorized: boolean; accountId?: string; error?: string }> {
  // ... implementation from Task 4
}

/**
 * Gets languages that have manual translations for an entity
 */
async function getManualTranslationLanguages(
  entityType: 'article' | 'item' | 'link',
  entityId: string
): Promise<SupportedLanguage[]> {
  // ... implementation from Task 5
}

/**
 * Gets the source language for an entity
 */
async function getEntitySourceLanguage(
  entityType: 'article' | 'item' | 'link',
  entityId: string
): Promise<SupportedLanguage> {
  // ... implementation from Task 5
}

/**
 * POST /api/translations/retranslate
 */
export async function POST(request: NextRequest) {
  try {
    console.log('RETRANSLATE_API: Starting re-translate request...');

    // 1. Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const { user, isAdmin, supabase } = authResult;

    // Get user's accounts
    const { data: userAccounts, error: accountsError } = await supabase
      .from('account_users')
      .select('account_id')
      .eq('user_id', user.id);

    if (accountsError || !userAccounts?.length) {
      return NextResponse.json(
        { success: false, error: 'No account access found' },
        { status: 403 }
      );
    }

    const userAccountIds = userAccounts.map(ua => ua.account_id);

    // 2. Parse and validate request body
    let body: RetranslateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 3. Validate entities array
    if (!body.entities || !Array.isArray(body.entities) || body.entities.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one entity is required' },
        { status: 400 }
      );
    }

    // 4. Validate each entity
    for (const entity of body.entities) {
      if (!entity.type || !VALID_ENTITY_TYPES.includes(entity.type as any)) {
        return NextResponse.json(
          { success: false, error: `Invalid entity type: ${entity.type}` },
          { status: 400 }
        );
      }

      if (!entity.id || typeof entity.id !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Invalid entity ID format' },
          { status: 400 }
        );
      }
    }

    const skipManualEdits = body.skipManualEdits !== false;

    // 5. Verify ownership for all entities
    for (const entity of body.entities) {
      const ownership = await verifyEntityOwnership(
        entity.type as 'article' | 'item' | 'link',
        entity.id,
        userAccountIds,
        supabase
      );

      if (!ownership.authorized) {
        const status = ownership.error === 'Entity not found' ? 404 : 403;
        return NextResponse.json(
          { success: false, error: ownership.error || 'Access denied' },
          { status }
        );
      }
    }

    // 6. Process entities and queue translation jobs
    let totalJobCount = 0;
    let totalSkippedCount = 0;

    for (const entity of body.entities) {
      const entityType = entity.type as EntityType;
      const entityId = entity.id;

      const sourceLanguage = await getEntitySourceLanguage(entityType, entityId);
      let targetLanguages = ALL_LANGUAGES.filter(lang => lang !== sourceLanguage);

      if (skipManualEdits) {
        const manualLanguages = await getManualTranslationLanguages(entityType, entityId);
        totalSkippedCount += targetLanguages.filter(lang => manualLanguages.includes(lang)).length;
        targetLanguages = targetLanguages.filter(lang => !manualLanguages.includes(lang));
      }

      if (targetLanguages.length === 0) continue;

      const result = await createBatchTranslationJobs({
        entityType,
        entityId,
        sourceLanguage,
        targetLanguages
      });

      if (result.success && result.data) {
        totalJobCount += result.data.length;
      }
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      data: {
        jobCount: totalJobCount,
        skippedCount: totalSkippedCount
      }
    });

  } catch (error) {
    console.error('RETRANSLATE_API: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to queue translation jobs' },
      { status: 500 }
    );
  }
}
```

---

## Test Scenarios

### Manual Test Cases

| # | Scenario | Input | Expected Output |
|---|----------|-------|-----------------|
| 1 | Single entity, no manual edits | `{ entities: [{ type: "article", id: "..." }], skipManualEdits: false }` | 200: `{ success: true, data: { jobCount: 5, skippedCount: 0 } }` |
| 2 | Bulk entities (3 items) | 3 items, `skipManualEdits: false` | 200: `{ success: true, data: { jobCount: 15, skippedCount: 0 } }` |
| 3 | Manual edit protection | Entity with 2 manual translations, `skipManualEdits: true` | 200: `{ success: true, data: { jobCount: 3, skippedCount: 2 } }` |
| 4 | Overwrite manual edits | Entity with manual translations, `skipManualEdits: false` | 200: `{ success: true, data: { jobCount: 5, skippedCount: 0 } }` |
| 5 | Unauthorized entity | Entity owned by different account | 403: `{ success: false, error: "Access denied" }` |
| 6 | Non-existent entity | Invalid entity ID | 404: `{ success: false, error: "Entity not found" }` |
| 7 | Empty entities array | `{ entities: [] }` | 400: `{ success: false, error: "At least one entity is required" }` |
| 8 | Invalid entity type | `{ entities: [{ type: "invalid", id: "..." }] }` | 400: `{ success: false, error: "Invalid entity type: invalid" }` |
| 9 | Missing authentication | No auth header | 401: `{ success: false, error: "Invalid or expired token" }` |

### Automated Test File Location
Create tests at: `/src/app/api/translations/retranslate/__tests__/route.test.ts`

---

## Error Response Catalog

| HTTP Status | Error Code | Condition |
|-------------|------------|-----------|
| 400 | `VALIDATION_ERROR` | Missing/invalid request body |
| 400 | `VALIDATION_ERROR` | Empty entities array |
| 400 | `VALIDATION_ERROR` | Invalid entity type |
| 400 | `VALIDATION_ERROR` | Invalid entity ID format |
| 401 | `UNAUTHORIZED` | Missing/invalid authentication |
| 403 | `FORBIDDEN` | User lacks account access |
| 403 | `FORBIDDEN` | User doesn't own entity |
| 404 | `NOT_FOUND` | Entity doesn't exist |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## Files to Create/Modify

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/retranslate/route.ts` | Main API endpoint implementation |

### Files to Import From (Read Only)

| File Path | Functions/Types Used |
|-----------|---------------------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()` |
| `/src/lib/supabase.ts` | `supabaseAdmin` |
| `/src/lib/job-queue/translation-jobs.ts` | `createBatchTranslationJobs()` |
| `/src/lib/job-queue/translation-jobs.types.ts` | `EntityType`, `SupportedLanguage` |

### Database Tables Accessed

| Table | Operation | Purpose |
|-------|-----------|---------|
| `account_users` | SELECT | Get user's account IDs |
| `items` | SELECT | Verify item ownership |
| `item_articles` | SELECT | Verify article ownership, get source language |
| `item_links` | SELECT | Verify link ownership |
| `properties` | SELECT (via join) | Get account_id |
| `article_translations` | SELECT | Check for manual edits |
| `item_translations` | SELECT | Check for manual edits |
| `link_translations` | SELECT | Check for manual edits |
| `translation_jobs` | INSERT (via job queue) | Queue new jobs |

---

## Dependencies & Blockers

### Must Be Complete Before This Task
- [x] Epic 1 Foundation (translation tables, job queue)
- [x] REQ-243: Translation job queue module
- [x] REQ-244: Job processor

### Blocked By This Task
- REQ-310: TranslationPreviewPanel (uses re-translate endpoint)
- REQ-321: BulkTranslationBar (uses re-translate endpoint for bulk ops)

---

## Definition of Done

- [ ] All 7 tasks completed and tested
- [ ] Endpoint responds correctly to all test scenarios
- [ ] Authentication and authorization working
- [ ] Manual edit protection working when `skipManualEdits=true`
- [ ] Bulk operations working with multiple entities
- [ ] All error responses match catalog
- [ ] Console logging provides debugging visibility
- [ ] TypeScript compiles without errors
- [ ] No lint warnings or errors
- [ ] Code follows existing patterns from `/src/app/api/admin/articles/route.ts`

---

## References

- Overview Document: `/docs/REQ-338-create-re-translate-api-endpoint-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Job Queue Module: `/src/lib/job-queue/translation-jobs.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
- API Pattern Reference: `/src/app/api/admin/articles/route.ts`
- Auth Helper: `/src/lib/auth-server.ts`
