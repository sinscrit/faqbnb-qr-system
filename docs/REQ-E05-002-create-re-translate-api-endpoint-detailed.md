# REQ-E05-002: Bulk Content Re-Translation Request API Endpoint - Detailed Task Breakdown

**Document Type**: Detailed Implementation Tasks
**Created**: 2026-01-19
**Last Modified**: 2026-01-19
**Request ID**: REQ-E05-002
**Epic**: Epic 5 - Owner Translation Management
**Phase**: 1 - API Endpoints
**Task ID**: 1.3
**Size**: L (Large)
**Overview Reference**: docs/REQ-E05-002-create-re-translate-api-endpoint-overview.md
**Implementation Plan Reference**: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

---

## Executive Summary

This document provides granular, actionable implementation tasks for creating the POST `/api/translations/retranslate` endpoint. The endpoint allows property owners to request re-translation of their content (items, articles, links) with support for bulk operations, manual edit handling options, and detailed response counts.

---

## Prerequisites

Before starting implementation, verify the following exist and are functional:

| Dependency | Location | Verification Command |
|------------|----------|---------------------|
| Translation jobs table | Supabase `translation_jobs` | Query table in Supabase dashboard |
| `validateAdminAuth()` | `/src/lib/auth-server.ts` | Import test in new file |
| `createBatchTranslationJobs()` | `/src/lib/job-queue/translation-jobs.ts` | Import test in new file |
| `checkForDuplicateJob()` | `/src/lib/job-queue/concurrency-control.ts` | Import test in new file |
| Translation tables | `article_translations`, `item_translations`, `link_translations` | Query tables in Supabase |
| `supabaseAdmin` | `/src/lib/supabase.ts` | Import test in new file |

---

## Task Breakdown

### Task 1: Create API Route File with Basic Structure

**File**: `/src/app/api/translations/retranslate/route.ts`

**Objective**: Create the route file with imports, constants, and type definitions.

**Steps**:

1.1. Create the directory structure if it doesn't exist:
```bash
mkdir -p src/app/api/translations/retranslate
```

1.2. Create the route file with the following initial content:

```typescript
/**
 * REQ-E05-002: Bulk Content Re-Translation Request API Endpoint
 * POST /api/translations/retranslate
 *
 * Allows property owners to request re-translation of their content
 * with support for bulk operations and manual edit handling.
 *
 * Created: 2026-01-19
 * Last Modified: 2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import { createBatchTranslationJobs } from '@/lib/job-queue/translation-jobs';
import { checkForDuplicateJob } from '@/lib/job-queue/concurrency-control';
import type { SupportedLanguage, EntityType } from '@/lib/job-queue/translation-jobs.types';

// =============================================================================
// Constants
// =============================================================================

/** All supported languages for translation */
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

/** Valid entity types for re-translation */
const VALID_ENTITY_TYPES = ['article', 'item', 'link'] as const;

/** Maximum entities per request to prevent abuse */
const MAX_BATCH_SIZE = 100;

// =============================================================================
// Type Definitions
// =============================================================================

/** Entity reference in request */
interface EntityRef {
  type: 'article' | 'item' | 'link';
  id: string;
}

/** Request body structure */
interface RetranslateRequest {
  entities: EntityRef[];
  languages?: SupportedLanguage[];
  skipManualEdits?: boolean;
  overwriteManualEdits?: boolean;
}

/** Per-entity detail in response */
interface EntityDetail {
  entityType: string;
  entityId: string;
  languagesQueued: string[];
  languagesSkipped: string[];
  reason?: string;
}

/** Response structure */
interface RetranslateResponse {
  success: boolean;
  jobsQueued?: number;
  jobsSkipped?: number;
  skippedReason?: string;
  details?: EntityDetail[];
  error?: string;
}
```

**Acceptance Criteria**:
- [ ] File created at correct path
- [ ] All imports resolve without errors
- [ ] TypeScript compiles without type errors
- [ ] Constants are properly defined

---

### Task 2: Implement Account Context Helper Function

**File**: `/src/app/api/translations/retranslate/route.ts`

**Objective**: Add helper function to extract account context from authenticated request (following existing pattern from articles/route.ts).

**Steps**:

2.1. Add the `getAccountContext` helper function after the type definitions:

```typescript
// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extract account context from authenticated request
 * Pattern follows /src/app/api/admin/articles/route.ts
 */
async function getAccountContext(
  request: NextRequest,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<{ accountId: string | null; accountRole: string; error?: NextResponse }> {
  try {
    const { searchParams } = new URL(request.url);
    const requestedAccountId = searchParams.get('account_id') || request.headers.get('x-account-id');

    if (requestedAccountId) {
      // Validate user has access to requested account
      const { data: accountAccess, error: accessError } = await supabase
        .from('account_users')
        .select('account_id, role')
        .eq('account_id', requestedAccountId)
        .eq('user_id', userId)
        .single();

      if (accessError || !accountAccess) {
        return {
          accountId: null,
          accountRole: '',
          error: NextResponse.json(
            { success: false, error: 'Access denied to requested account', code: 'FORBIDDEN' },
            { status: 403 }
          )
        };
      }

      return { accountId: requestedAccountId, accountRole: accountAccess.role };
    }

    // Admin without specific account can access all
    if (isAdmin) {
      return { accountId: null, accountRole: 'admin' };
    }

    // Get user's default account
    const { data: userAccounts, error: accountsError } = await supabase
      .from('account_users')
      .select('account_id, role')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (accountsError || !userAccounts) {
      return {
        accountId: null,
        accountRole: '',
        error: NextResponse.json(
          { success: false, error: 'No account access found for user', code: 'FORBIDDEN' },
          { status: 403 }
        )
      };
    }

    return { accountId: userAccounts.account_id, accountRole: userAccounts.role };
  } catch (error) {
    console.error('[Retranslate API] Account context extraction error:', error);
    return {
      accountId: null,
      accountRole: '',
      error: NextResponse.json(
        { success: false, error: 'Failed to determine account context', code: 'ACCOUNT_ERROR' },
        { status: 500 }
      )
    };
  }
}
```

**Acceptance Criteria**:
- [ ] Function returns accountId and accountRole on success
- [ ] Function returns error response for unauthorized access
- [ ] Admin users can proceed without specific account
- [ ] Non-admin users get their default account

---

### Task 3: Implement Entity Ownership Validation Helper

**File**: `/src/app/api/translations/retranslate/route.ts`

**Objective**: Add helper function to validate that the requesting user has ownership access to a specific entity.

**Steps**:

3.1. Add the `validateEntityOwnership` helper function:

```typescript
/**
 * Validate that user has access to the specified entity
 * Returns ownership status and source language
 */
async function validateEntityOwnership(
  entity: EntityRef,
  accountId: string | null,
  isAdmin: boolean
): Promise<{ hasAccess: boolean; sourceLanguage: SupportedLanguage }> {
  // Table configuration for each entity type
  const tableConfig: Record<string, { table: string; idCol: string; selectQuery: string }> = {
    article: {
      table: 'item_articles',
      idCol: 'id',
      selectQuery: 'source_language, items!inner(property_id, properties!inner(account_id))'
    },
    item: {
      table: 'items',
      idCol: 'id',
      selectQuery: 'source_language, properties!inner(account_id)'
    },
    link: {
      table: 'item_links',
      idCol: 'id',
      selectQuery: 'source_language, items!inner(property_id, properties!inner(account_id))'
    }
  };

  const config = tableConfig[entity.type];
  if (!config) {
    console.error(`[Retranslate API] Unknown entity type: ${entity.type}`);
    return { hasAccess: false, sourceLanguage: 'en' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(config.table)
      .select(config.selectQuery)
      .eq(config.idCol, entity.id)
      .single();

    if (error || !data) {
      console.warn(`[Retranslate API] Entity not found: ${entity.type}/${entity.id}`, error?.message);
      return { hasAccess: false, sourceLanguage: 'en' };
    }

    // Extract account_id from nested structure based on entity type
    let entityAccountId: string | null = null;
    if (entity.type === 'item') {
      entityAccountId = (data as any).properties?.account_id;
    } else {
      // article and link have items.properties.account_id
      entityAccountId = (data as any).items?.properties?.account_id;
    }

    // Admin has access to everything
    const hasAccess = isAdmin || entityAccountId === accountId;

    // Get source language, default to 'en' if not set
    const sourceLanguage = ((data as any).source_language || 'en') as SupportedLanguage;

    return { hasAccess, sourceLanguage };
  } catch (error) {
    console.error(`[Retranslate API] Error validating ownership for ${entity.type}/${entity.id}:`, error);
    return { hasAccess: false, sourceLanguage: 'en' };
  }
}
```

**Acceptance Criteria**:
- [ ] Function correctly handles all three entity types (article, item, link)
- [ ] Function extracts account_id from nested property relationship
- [ ] Admin users have access to all entities
- [ ] Non-admin users only have access to their account's entities
- [ ] Source language is extracted from entity data

---

### Task 4: Implement Manual Translation Detection Helper

**File**: `/src/app/api/translations/retranslate/route.ts`

**Objective**: Add helper function to find languages with manual translations for an entity.

**Steps**:

4.1. Add the `getManualTranslationLanguages` helper function:

```typescript
/**
 * Get list of languages with manual (human-edited) translations for an entity
 */
async function getManualTranslationLanguages(entity: EntityRef): Promise<SupportedLanguage[]> {
  // Translation table configuration for each entity type
  const tableConfig: Record<string, { table: string; idCol: string }> = {
    article: { table: 'article_translations', idCol: 'article_id' },
    item: { table: 'item_translations', idCol: 'item_id' },
    link: { table: 'link_translations', idCol: 'link_id' }
  };

  const config = tableConfig[entity.type];
  if (!config) {
    console.error(`[Retranslate API] Unknown entity type for manual check: ${entity.type}`);
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(config.table)
      .select('language')
      .eq(config.idCol, entity.id)
      .eq('translation_status', 'manual');

    if (error) {
      console.error(`[Retranslate API] Error fetching manual translations for ${entity.type}/${entity.id}:`, error);
      return [];
    }

    return (data || []).map(row => row.language as SupportedLanguage);
  } catch (error) {
    console.error(`[Retranslate API] Exception in getManualTranslationLanguages:`, error);
    return [];
  }
}
```

**Acceptance Criteria**:
- [ ] Function queries correct translation table based on entity type
- [ ] Function returns only languages with `translation_status = 'manual'`
- [ ] Function handles errors gracefully and returns empty array on failure

---

### Task 5: Implement Pending Jobs Detection Helper

**File**: `/src/app/api/translations/retranslate/route.ts`

**Objective**: Add helper function to find languages with pending/processing translation jobs.

**Steps**:

5.1. Add the `getPendingJobLanguages` helper function:

```typescript
/**
 * Get list of languages with pending or processing translation jobs for an entity
 * Prevents duplicate job creation
 */
async function getPendingJobLanguages(entity: EntityRef): Promise<SupportedLanguage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .select('target_language')
      .eq('entity_type', entity.type)
      .eq('entity_id', entity.id)
      .in('status', ['queued', 'processing']);

    if (error) {
      console.error(`[Retranslate API] Error fetching pending jobs for ${entity.type}/${entity.id}:`, error);
      return [];
    }

    return (data || []).map(row => row.target_language as SupportedLanguage);
  } catch (error) {
    console.error(`[Retranslate API] Exception in getPendingJobLanguages:`, error);
    return [];
  }
}
```

**Acceptance Criteria**:
- [ ] Function queries translation_jobs table correctly
- [ ] Function filters for 'queued' and 'processing' statuses
- [ ] Function handles errors gracefully and returns empty array on failure

---

### Task 6: Implement Request Validation Logic

**File**: `/src/app/api/translations/retranslate/route.ts`

**Objective**: Add helper function to validate the request body.

**Steps**:

6.1. Add the `validateRequest` helper function:

```typescript
/**
 * Validate request body structure and values
 * Returns error response if validation fails, null if valid
 */
function validateRequest(body: any): NextResponse | null {
  // Check entities array exists and is non-empty
  if (!body.entities || !Array.isArray(body.entities) || body.entities.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Missing required field: entities (must be non-empty array)' },
      { status: 400 }
    );
  }

  // Check batch size limit
  if (body.entities.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { success: false, error: `Maximum ${MAX_BATCH_SIZE} entities per request` },
      { status: 400 }
    );
  }

  // Check mutual exclusivity of skip/overwrite options
  if (body.skipManualEdits === true && body.overwriteManualEdits === true) {
    return NextResponse.json(
      { success: false, error: 'Cannot specify both skipManualEdits and overwriteManualEdits as true' },
      { status: 400 }
    );
  }

  // Validate each entity reference
  for (let i = 0; i < body.entities.length; i++) {
    const entity = body.entities[i];

    // Check entity has required fields
    if (!entity.type || !entity.id) {
      return NextResponse.json(
        { success: false, error: `Entity at index ${i} missing required field: type and id are required` },
        { status: 400 }
      );
    }

    // Check entity type is valid
    if (!VALID_ENTITY_TYPES.includes(entity.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid entity type: ${entity.type}. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Basic UUID format validation (36 chars with hyphens)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(entity.id)) {
      return NextResponse.json(
        { success: false, error: `Invalid entity ID format at index ${i}: ${entity.id}` },
        { status: 400 }
      );
    }
  }

  // Validate languages array if provided
  if (body.languages !== undefined) {
    if (!Array.isArray(body.languages)) {
      return NextResponse.json(
        { success: false, error: 'languages must be an array' },
        { status: 400 }
      );
    }

    for (const lang of body.languages) {
      if (!SUPPORTED_LANGUAGES.includes(lang)) {
        return NextResponse.json(
          { success: false, error: `Invalid language: ${lang}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}` },
          { status: 400 }
        );
      }
    }
  }

  return null; // Validation passed
}
```

**Acceptance Criteria**:
- [ ] Function validates entities array is present and non-empty
- [ ] Function enforces batch size limit
- [ ] Function checks mutual exclusivity of skip/overwrite options
- [ ] Function validates each entity has type and id
- [ ] Function validates entity types are in allowed list
- [ ] Function validates UUID format of entity IDs
- [ ] Function validates language codes if provided

---

### Task 7: Implement Main POST Handler

**File**: `/src/app/api/translations/retranslate/route.ts`

**Objective**: Implement the main POST handler that orchestrates the re-translation workflow.

**Steps**:

7.1. Add the POST handler function:

```typescript
// =============================================================================
// API Route Handler
// =============================================================================

/**
 * POST /api/translations/retranslate
 *
 * Queue re-translation jobs for specified entities
 *
 * Request Body:
 * {
 *   entities: [{ type: 'article' | 'item' | 'link', id: string }],
 *   languages?: SupportedLanguage[],  // All supported if omitted
 *   skipManualEdits?: boolean,         // Default: true
 *   overwriteManualEdits?: boolean     // Default: false
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   jobsQueued: number,
 *   jobsSkipped: number,
 *   skippedReason?: string,
 *   details?: EntityDetail[]
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<RetranslateResponse>> {
  console.log('[Retranslate API] POST request received');

  try {
    // 1. Authenticate user
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log('[Retranslate API] Authentication failed');
      return authResult.error;
    }

    const { user, isAdmin, supabase } = authResult;
    console.log(`[Retranslate API] Authenticated user: ${user.email}, isAdmin: ${isAdmin}`);

    // 2. Get account context
    const accountContext = await getAccountContext(request, user.id, isAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }
    const { accountId } = accountContext;
    console.log(`[Retranslate API] Account context: ${accountId || 'admin (all accounts)'}`);

    // 3. Parse request body
    let body: RetranslateRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 4. Validate request
    const validationError = validateRequest(body);
    if (validationError) {
      return validationError;
    }

    // 5. Determine options with defaults
    const targetLanguages = body.languages || SUPPORTED_LANGUAGES;
    const skipManualEdits = body.skipManualEdits !== false; // Default: true
    const overwriteManualEdits = body.overwriteManualEdits === true; // Default: false

    console.log(`[Retranslate API] Processing ${body.entities.length} entities, ` +
      `targetLanguages: ${targetLanguages.join(',')}, ` +
      `skipManualEdits: ${skipManualEdits}, overwriteManualEdits: ${overwriteManualEdits}`);

    // 6. Process each entity
    let totalJobsQueued = 0;
    let totalJobsSkipped = 0;
    const details: EntityDetail[] = [];
    let hasAnyAccess = false;

    for (const entity of body.entities) {
      // 6.1 Validate ownership
      const { hasAccess, sourceLanguage } = await validateEntityOwnership(
        entity,
        accountId,
        isAdmin
      );

      if (!hasAccess) {
        // Count all potential translations as skipped
        const potentialLanguages = targetLanguages.filter(lang => lang !== sourceLanguage);
        totalJobsSkipped += potentialLanguages.length;
        details.push({
          entityType: entity.type,
          entityId: entity.id,
          languagesQueued: [],
          languagesSkipped: potentialLanguages,
          reason: 'unauthorized'
        });
        continue;
      }

      hasAnyAccess = true;

      // 6.2 Filter target languages (exclude source language)
      let languagesToQueue = targetLanguages.filter(lang => lang !== sourceLanguage);
      const skippedLanguages: SupportedLanguage[] = [];
      const skippedReasons: string[] = [];

      // 6.3 Check for manual translations if skipManualEdits is enabled
      if (skipManualEdits && !overwriteManualEdits) {
        const manualLanguages = await getManualTranslationLanguages(entity);
        const manualSet = new Set(manualLanguages);

        const beforeManual = languagesToQueue.length;
        languagesToQueue = languagesToQueue.filter(lang => !manualSet.has(lang));
        const manualSkipped = manualLanguages.filter(lang =>
          targetLanguages.includes(lang) && lang !== sourceLanguage
        );

        if (manualSkipped.length > 0) {
          skippedLanguages.push(...manualSkipped);
          skippedReasons.push('manual_edit');
        }
      }

      // 6.4 Check for pending jobs to avoid duplicates
      const pendingLanguages = await getPendingJobLanguages(entity);
      const pendingSet = new Set(pendingLanguages);

      const pendingSkipped = languagesToQueue.filter(lang => pendingSet.has(lang));
      languagesToQueue = languagesToQueue.filter(lang => !pendingSet.has(lang));

      if (pendingSkipped.length > 0) {
        skippedLanguages.push(...pendingSkipped);
        skippedReasons.push('already_pending');
      }

      // 6.5 Queue translation jobs
      let queuedCount = 0;
      if (languagesToQueue.length > 0) {
        const result = await createBatchTranslationJobs({
          entityType: entity.type as EntityType,
          entityId: entity.id,
          sourceLanguage,
          targetLanguages: languagesToQueue
        });

        if (result.success && result.data) {
          queuedCount = result.data.length;
          totalJobsQueued += queuedCount;
          console.log(`[Retranslate API] Queued ${queuedCount} jobs for ${entity.type}/${entity.id}`);
        } else {
          // Job creation failed - add to skipped
          skippedLanguages.push(...languagesToQueue);
          skippedReasons.push('queue_error');
          console.error(`[Retranslate API] Failed to queue jobs for ${entity.type}/${entity.id}: ${result.error}`);
        }
      }

      totalJobsSkipped += skippedLanguages.length;

      // 6.6 Record details for this entity
      details.push({
        entityType: entity.type,
        entityId: entity.id,
        languagesQueued: languagesToQueue.filter(lang => !skippedLanguages.includes(lang)),
        languagesSkipped: skippedLanguages,
        reason: skippedReasons.length > 0 ? skippedReasons.join(', ') : undefined
      });
    }

    // 7. Check if user had access to any entities
    if (!hasAnyAccess) {
      console.log('[Retranslate API] No access to any specified entities');
      return NextResponse.json(
        { success: false, error: 'No access to specified entities' },
        { status: 403 }
      );
    }

    // 8. Build response
    const response: RetranslateResponse = {
      success: true,
      jobsQueued: totalJobsQueued,
      jobsSkipped: totalJobsSkipped,
      details
    };

    // Add skip reason summary if any were skipped
    if (totalJobsSkipped > 0) {
      const reasons: string[] = [];
      if (details.some(d => d.reason?.includes('manual_edit'))) {
        reasons.push('manual translations preserved');
      }
      if (details.some(d => d.reason?.includes('already_pending'))) {
        reasons.push('jobs already pending');
      }
      if (details.some(d => d.reason?.includes('unauthorized'))) {
        reasons.push('unauthorized entities');
      }
      if (details.some(d => d.reason?.includes('queue_error'))) {
        reasons.push('job queue errors');
      }
      response.skippedReason = `Some translations skipped: ${reasons.join(', ')}`;
    }

    console.log(`[Retranslate API] Completed: ${totalJobsQueued} queued, ${totalJobsSkipped} skipped`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Retranslate API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria**:
- [ ] Handler authenticates user with validateAdminAuth
- [ ] Handler extracts account context
- [ ] Handler validates request body
- [ ] Handler processes each entity sequentially
- [ ] Handler validates ownership for each entity
- [ ] Handler skips manual translations when skipManualEdits is true
- [ ] Handler skips languages with pending jobs
- [ ] Handler queues translation jobs for valid entities/languages
- [ ] Handler returns 403 if no entities are accessible
- [ ] Handler returns detailed response with counts and per-entity details

---

### Task 8: Add Structured Logging

**File**: `/src/app/api/translations/retranslate/route.ts`

**Objective**: Ensure comprehensive logging is in place for monitoring and debugging.

**Steps**:

8.1. Verify all logging statements use consistent prefix `[Retranslate API]`

8.2. Ensure the following events are logged:
- Request received
- Authentication result
- Account context extracted
- Validation errors
- Each entity processing start
- Ownership validation results
- Manual translation detection results
- Pending job detection results
- Job queueing results (success/failure)
- Final counts

**Acceptance Criteria**:
- [ ] All log statements use `[Retranslate API]` prefix
- [ ] Log levels are appropriate (log/warn/error)
- [ ] No sensitive data (passwords, tokens) is logged
- [ ] Request flow can be traced through logs

---

### Task 9: Build and Type Check

**Objective**: Ensure the implementation compiles without errors.

**Steps**:

9.1. Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

9.2. Fix any type errors that appear

9.3. Run linting:
```bash
npm run lint
```

9.4. Fix any linting errors

**Acceptance Criteria**:
- [ ] TypeScript compiles without errors
- [ ] No ESLint errors
- [ ] All imports resolve correctly

---

### Task 10: Manual Testing Checklist

**Objective**: Verify the endpoint works correctly with manual testing.

**Test Cases**:

10.1. **Authentication Test**
- [ ] Request without auth token returns 401
- [ ] Request with invalid token returns 401
- [ ] Request with valid user token succeeds

10.2. **Request Validation Tests**
- [ ] Empty entities array returns 400
- [ ] Missing entities field returns 400
- [ ] Invalid entity type returns 400
- [ ] Invalid UUID format returns 400
- [ ] Both skipManualEdits and overwriteManualEdits true returns 400
- [ ] More than 100 entities returns 400
- [ ] Invalid language code returns 400

10.3. **Authorization Tests**
- [ ] User can re-translate own entities
- [ ] User cannot re-translate other account's entities
- [ ] Admin can re-translate any entities
- [ ] All entities unauthorized returns 403

10.4. **Functionality Tests**
- [ ] Single entity re-translation queues jobs correctly
- [ ] Bulk entities (5-10) re-translation works
- [ ] Mixed entity types in single request work
- [ ] Specific languages parameter works
- [ ] skipManualEdits=true skips manual translations
- [ ] overwriteManualEdits=true overwrites manual translations
- [ ] Pending jobs are not duplicated

10.5. **Response Validation Tests**
- [ ] Response includes jobsQueued count
- [ ] Response includes jobsSkipped count
- [ ] Response includes details array
- [ ] skippedReason is present when jobs skipped

**Testing Commands**:

```bash
# Test single entity re-translation
curl -X POST http://localhost:3000/api/translations/retranslate \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth-cookie>" \
  -d '{
    "entities": [{"type": "article", "id": "<article-uuid>"}]
  }'

# Test bulk re-translation
curl -X POST http://localhost:3000/api/translations/retranslate \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth-cookie>" \
  -d '{
    "entities": [
      {"type": "article", "id": "<article-uuid>"},
      {"type": "item", "id": "<item-uuid>"}
    ],
    "languages": ["fr", "es"],
    "skipManualEdits": true
  }'
```

**Acceptance Criteria**:
- [ ] All test cases pass
- [ ] Response format matches specification
- [ ] Error messages are clear and actionable

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `/src/app/api/translations/retranslate/route.ts` | CREATE | Main API endpoint implementation |

## Database Tables Referenced

| Table | Operations | Purpose |
|-------|------------|---------|
| `account_users` | SELECT | Validate account access |
| `items` | SELECT | Validate item ownership |
| `item_articles` | SELECT | Validate article ownership |
| `item_links` | SELECT | Validate link ownership |
| `properties` | SELECT (join) | Get account_id for ownership check |
| `article_translations` | SELECT | Check for manual translations |
| `item_translations` | SELECT | Check for manual translations |
| `link_translations` | SELECT | Check for manual translations |
| `translation_jobs` | SELECT | Check for pending jobs |

## Dependencies Used

| Dependency | Source | Purpose |
|------------|--------|---------|
| `validateAdminAuth()` | `/src/lib/auth-server.ts` | Authentication |
| `supabaseAdmin` | `/src/lib/supabase.ts` | Database queries |
| `createBatchTranslationJobs()` | `/src/lib/job-queue/translation-jobs.ts` | Job creation |
| `SupportedLanguage`, `EntityType` | `/src/lib/job-queue/translation-jobs.types.ts` | Type definitions |

---

## Acceptance Criteria Mapping (from Requirements)

| Requirement | Task | Status |
|-------------|------|--------|
| POST accepts array of entity references | Task 6, 7 | - |
| Supports 'skipManualEdits' option | Task 4, 7 | - |
| Supports 'overwriteManualEdits' option | Task 7 | - |
| Validates ownership access to all entities | Task 3, 7 | - |
| Queues jobs for all supported languages | Task 7 | - |
| Returns 'jobsQueued' count | Task 7 | - |
| Returns 'jobsSkipped' count | Task 7 | - |
| Handles mixed entity types | Task 7 | - |
| Partial authorization failures clear messages | Task 7 | - |
| Job creation failures don't block others | Task 7 | - |
| Prevents duplicate job creation | Task 5, 7 | - |
| Empty request returns validation error | Task 6 | - |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-19 | Claude (Senior Dev) | Initial detailed task breakdown |
