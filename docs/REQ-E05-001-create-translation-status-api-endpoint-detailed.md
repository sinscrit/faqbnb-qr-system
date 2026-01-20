# Detailed Task Breakdown: REQ-E05-001 - Translation Status Query API Endpoint

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-E05-001
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 1 - API Endpoints
**Task ID:** 1.1
**Overview Document:** `/docs/REQ-E05-001-create-translation-status-api-endpoint-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating the Translation Status Query API endpoint. Each task is designed to be completable in approximately 1 story point by an AI coding agent or junior developer.

**Total Estimated Tasks:** 12
**Target File:** `/src/app/api/translations/status/route.ts`

---

## Prerequisites Checklist

Before starting implementation, verify these dependencies exist:

- [ ] Translation tables exist in database: `article_translations`, `item_translations`, `link_translations`, `tag_translations`
- [ ] `translation_jobs` table exists in database
- [ ] Translation types exist at `/src/lib/translation-service/translation-service.types.ts`
- [ ] Auth validation function exists at `/src/lib/auth-server.ts` → `validateAdminAuth()`
- [ ] Pattern reference exists at `/src/app/api/admin/articles/route.ts`

---

## Task Breakdown

### Task 1: Create Directory and File Structure

**Task ID:** E05-001-T01
**Estimated Effort:** 1 SP
**Dependencies:** None

**Objective:** Create the API route file with basic structure and imports.

**File to Create:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

1. Create the directory structure `/src/app/api/translations/status/`
2. Create `route.ts` file with the following initial content:

```typescript
/**
 * REQ-E05-001: Translation Status Query API Endpoint
 * Created: 2026-01-19
 *
 * GET /api/translations/status - Query translation status for content
 *
 * Query Parameters:
 * - entityType: 'article' | 'item' | 'link' (optional, filter by type)
 * - entityId: string UUID (optional, filter by specific entity)
 * - status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual' (optional)
 * - propertyId: string UUID (optional, filter by property)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import type {
  SupportedLanguage,
  TranslationStatus
} from '@/lib/translation-service/translation-service.types';

const DEBUG_PREFIX = '[TRANS_STATUS_API]';

// Types will be added in Task 2
// GET handler will be added in Task 3
```

**Acceptance Criteria:**
- [ ] File exists at `/src/app/api/translations/status/route.ts`
- [ ] Imports are correct and resolve without errors
- [ ] File compiles without TypeScript errors

**Verification Command:**
```bash
npx tsc --noEmit src/app/api/translations/status/route.ts
```

---

### Task 2: Define Response Type Interfaces

**Task ID:** E05-001-T02
**Estimated Effort:** 1 SP
**Dependencies:** E05-001-T01

**Objective:** Add TypeScript interfaces for API request parameters and response structure.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

Add the following interfaces after the imports section:

```typescript
// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Valid entity types that can have translations queried
 */
type QueryableEntityType = 'article' | 'item' | 'link';

/**
 * Valid query parameter values for entity type filter
 */
const VALID_ENTITY_TYPES: QueryableEntityType[] = ['article', 'item', 'link'];

/**
 * Valid translation status values
 */
const VALID_STATUSES: TranslationStatus[] = ['pending', 'processing', 'completed', 'failed', 'manual'];

/**
 * UUID validation regex pattern
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Translation status for a single language
 */
interface LanguageTranslationStatus {
  status: TranslationStatus;
  isStale?: boolean;
  translatedAt?: string;
  reviewedBy?: string;
}

/**
 * Translation status for a single entity (item, article, or link)
 */
interface TranslationStatusItem {
  entityType: QueryableEntityType;
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: {
    [K in SupportedLanguage]?: LanguageTranslationStatus;
  };
}

/**
 * Summary statistics for translation status
 */
interface TranslationStatusSummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
}

/**
 * Successful API response structure
 */
interface TranslationStatusResponse {
  success: true;
  data: {
    summary: TranslationStatusSummary;
    items: TranslationStatusItem[];
  };
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

/**
 * Error API response structure
 */
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}
```

**Acceptance Criteria:**
- [ ] All interfaces are properly typed with no `any` types
- [ ] Types align with the overview document specification
- [ ] File compiles without TypeScript errors

---

### Task 3: Implement Query Parameter Parsing and Validation

**Task ID:** E05-001-T03
**Estimated Effort:** 1 SP
**Dependencies:** E05-001-T02

**Objective:** Create a helper function to parse and validate query parameters.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

Add the following function after the type definitions:

```typescript
// ============================================================================
// Query Parameter Parsing
// ============================================================================

interface ParsedQueryParams {
  entityType: QueryableEntityType | null;
  entityId: string | null;
  status: TranslationStatus | null;
  propertyId: string | null;
}

interface QueryParseResult {
  success: true;
  params: ParsedQueryParams;
} | {
  success: false;
  error: string;
  code: string;
}

/**
 * Parse and validate query parameters from the request URL
 */
function parseQueryParams(request: NextRequest): QueryParseResult {
  const { searchParams } = new URL(request.url);

  // Extract raw values
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const status = searchParams.get('status');
  const propertyId = searchParams.get('propertyId');

  // Validate entityType if provided
  if (entityType && !VALID_ENTITY_TYPES.includes(entityType as QueryableEntityType)) {
    return {
      success: false,
      error: `Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
      code: 'BAD_REQUEST'
    };
  }

  // Validate entityId is valid UUID if provided
  if (entityId && !UUID_REGEX.test(entityId)) {
    return {
      success: false,
      error: 'Invalid entityId format. Must be a valid UUID.',
      code: 'BAD_REQUEST'
    };
  }

  // Validate status if provided
  if (status && !VALID_STATUSES.includes(status as TranslationStatus)) {
    return {
      success: false,
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      code: 'BAD_REQUEST'
    };
  }

  // Validate propertyId is valid UUID if provided
  if (propertyId && !UUID_REGEX.test(propertyId)) {
    return {
      success: false,
      error: 'Invalid propertyId format. Must be a valid UUID.',
      code: 'BAD_REQUEST'
    };
  }

  return {
    success: true,
    params: {
      entityType: entityType as QueryableEntityType | null,
      entityId,
      status: status as TranslationStatus | null,
      propertyId
    }
  };
}
```

**Acceptance Criteria:**
- [ ] Function validates all four query parameters
- [ ] Returns typed error responses for invalid inputs
- [ ] UUID validation uses proper regex pattern
- [ ] Status values validated against enum

**Test Cases:**
- Valid empty params → success with all nulls
- Invalid entityType → error with BAD_REQUEST
- Invalid UUID format → error with BAD_REQUEST
- Invalid status → error with BAD_REQUEST
- All valid params → success with parsed values

---

### Task 4: Implement Account Context Helper (Copy from Admin Articles)

**Task ID:** E05-001-T04
**Estimated Effort:** 1 SP
**Dependencies:** E05-001-T01

**Objective:** Implement the `getAccountContext` helper function following the existing pattern.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Reference File:** `/src/app/api/admin/articles/route.ts` (lines 15-71)

**Implementation Steps:**

Copy and adapt the `getAccountContext` function from the admin articles route:

```typescript
// ============================================================================
// Account Context Helper
// ============================================================================

/**
 * Extract account context from request
 * Follows pattern from /src/app/api/admin/articles/route.ts
 */
async function getAccountContext(
  request: NextRequest,
  userId: string,
  isAdmin: boolean,
  supabase: any
): Promise<{ accountId: string | null; accountRole: string } | { error: NextResponse }> {
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
          error: NextResponse.json(
            { success: false, error: 'Access denied to requested account', code: 'FORBIDDEN' },
            { status: 403 }
          )
        };
      }

      return { accountId: requestedAccountId, accountRole: accountAccess.role };
    }

    // Admin users without specific account context
    if (isAdmin) {
      return { accountId: null, accountRole: 'admin' };
    }

    // Regular users get their primary account
    const { data: userAccounts, error: accountsError } = await supabase
      .from('account_users')
      .select('account_id, role')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (accountsError || !userAccounts) {
      return {
        error: NextResponse.json(
          { success: false, error: 'No account access found for user', code: 'FORBIDDEN' },
          { status: 403 }
        )
      };
    }

    return { accountId: userAccounts.account_id, accountRole: userAccounts.role };
  } catch (error) {
    console.error(`${DEBUG_PREFIX} Account context extraction error:`, error);
    return {
      error: NextResponse.json(
        { success: false, error: 'Failed to determine account context', code: 'ACCOUNT_ERROR' },
        { status: 500 }
      )
    };
  }
}
```

**Acceptance Criteria:**
- [ ] Function follows exact pattern from admin/articles route
- [ ] Handles account_id from query param or x-account-id header
- [ ] Returns proper error responses for access denied
- [ ] Admin users can access without specific account

---

### Task 5: Implement Property Access Validation

**Task ID:** E05-001-T05
**Estimated Effort:** 1 SP
**Dependencies:** E05-001-T04

**Objective:** Create a helper function to validate property access when propertyId filter is provided.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

Add the following function:

```typescript
// ============================================================================
// Property Access Validation
// ============================================================================

/**
 * Validate that user has access to the specified property
 * Returns property IDs to query (either the specific one or all for the account)
 */
async function validatePropertyAccess(
  supabase: any,
  accountId: string | null,
  propertyId: string | null,
  isAdmin: boolean
): Promise<{ propertyIds: string[] } | { error: NextResponse }> {

  if (propertyId) {
    // Validate specific property access
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, account_id')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Property not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      };
    }

    // Check account ownership (admin bypasses)
    if (!isAdmin && property.account_id !== accountId) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Access denied to property', code: 'FORBIDDEN' },
          { status: 403 }
        )
      };
    }

    return { propertyIds: [propertyId] };
  }

  // No specific property - get all properties for the account
  if (!accountId) {
    // Admin without account context - can see all (but should limit in practice)
    // For now, return empty to require explicit property filter for admins
    console.log(`${DEBUG_PREFIX} Admin user without property filter - returning empty result`);
    return { propertyIds: [] };
  }

  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('id')
    .eq('account_id', accountId);

  if (propertiesError) {
    console.error(`${DEBUG_PREFIX} Failed to fetch properties:`, propertiesError);
    return {
      error: NextResponse.json(
        { success: false, error: 'Failed to fetch properties', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    };
  }

  return { propertyIds: (properties || []).map(p => p.id) };
}
```

**Acceptance Criteria:**
- [ ] Validates specific property exists and user has access
- [ ] Returns 404 for non-existent property
- [ ] Returns 403 for properties user doesn't own
- [ ] Admin users can access any property
- [ ] Returns all account properties when no propertyId specified

---

### Task 6: Implement Items Translation Query

**Task ID:** E05-001-T06
**Estimated Effort:** 1 SP
**Dependencies:** E05-001-T05

**Objective:** Create a function to query item translations.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

```typescript
// ============================================================================
// Translation Query Functions
// ============================================================================

/**
 * Query item translations for given property IDs
 */
async function queryItemTranslations(
  supabase: any,
  propertyIds: string[],
  entityId: string | null,
  statusFilter: TranslationStatus | null
): Promise<TranslationStatusItem[]> {
  if (propertyIds.length === 0 && !entityId) {
    return [];
  }

  // Build base query for items
  let itemsQuery = supabase
    .from('items')
    .select(`
      id,
      name,
      source_language,
      property_id,
      item_translations (
        language,
        translation_status,
        translated_at
      )
    `);

  // Apply filters
  if (entityId) {
    itemsQuery = itemsQuery.eq('id', entityId);
  } else if (propertyIds.length > 0) {
    itemsQuery = itemsQuery.in('property_id', propertyIds);
  }

  const { data: items, error } = await itemsQuery;

  if (error) {
    console.error(`${DEBUG_PREFIX} Items query error:`, error);
    return [];
  }

  // Transform to TranslationStatusItem format
  const results: TranslationStatusItem[] = [];

  for (const item of items || []) {
    const translations: TranslationStatusItem['translations'] = {};

    for (const trans of item.item_translations || []) {
      // Apply status filter if provided
      if (statusFilter && trans.translation_status !== statusFilter) {
        continue;
      }

      translations[trans.language as SupportedLanguage] = {
        status: trans.translation_status as TranslationStatus,
        translatedAt: trans.translated_at || undefined
      };
    }

    // Only include item if it has matching translations (when filter applied) or always (no filter)
    if (!statusFilter || Object.keys(translations).length > 0) {
      results.push({
        entityType: 'item',
        entityId: item.id,
        name: item.name,
        sourceLanguage: (item.source_language as SupportedLanguage) || 'en',
        translations
      });
    }
  }

  return results;
}
```

**Acceptance Criteria:**
- [ ] Queries items with their translations
- [ ] Filters by propertyIds correctly
- [ ] Filters by specific entityId when provided
- [ ] Applies status filter when provided
- [ ] Returns properly formatted TranslationStatusItem array

---

### Task 7: Implement Articles Translation Query

**Task ID:** E05-001-T07
**Estimated Effort:** 1 SP
**Dependencies:** E05-001-T05

**Objective:** Create a function to query article translations.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

```typescript
/**
 * Query article translations for given property IDs
 */
async function queryArticleTranslations(
  supabase: any,
  propertyIds: string[],
  entityId: string | null,
  statusFilter: TranslationStatus | null
): Promise<TranslationStatusItem[]> {
  if (propertyIds.length === 0 && !entityId) {
    return [];
  }

  // Get items for these properties first
  let itemIds: string[] = [];

  if (!entityId && propertyIds.length > 0) {
    const { data: items } = await supabase
      .from('items')
      .select('id')
      .in('property_id', propertyIds);

    itemIds = (items || []).map((i: { id: string }) => i.id);

    if (itemIds.length === 0) {
      return [];
    }
  }

  // Build query for articles
  let articlesQuery = supabase
    .from('item_articles')
    .select(`
      id,
      title,
      source_language,
      item_id,
      article_translations (
        language,
        translation_status,
        translated_at,
        reviewed_by
      )
    `);

  // Apply filters
  if (entityId) {
    articlesQuery = articlesQuery.eq('id', entityId);
  } else if (itemIds.length > 0) {
    articlesQuery = articlesQuery.in('item_id', itemIds);
  }

  const { data: articles, error } = await articlesQuery;

  if (error) {
    console.error(`${DEBUG_PREFIX} Articles query error:`, error);
    return [];
  }

  // Transform to TranslationStatusItem format
  const results: TranslationStatusItem[] = [];

  for (const article of articles || []) {
    const translations: TranslationStatusItem['translations'] = {};

    for (const trans of article.article_translations || []) {
      // Apply status filter if provided
      if (statusFilter && trans.translation_status !== statusFilter) {
        continue;
      }

      translations[trans.language as SupportedLanguage] = {
        status: trans.translation_status as TranslationStatus,
        translatedAt: trans.translated_at || undefined,
        reviewedBy: trans.reviewed_by || undefined
      };
    }

    // Only include article if it has matching translations (when filter applied) or always (no filter)
    if (!statusFilter || Object.keys(translations).length > 0) {
      results.push({
        entityType: 'article',
        entityId: article.id,
        name: article.title,
        sourceLanguage: (article.source_language as SupportedLanguage) || 'en',
        translations
      });
    }
  }

  return results;
}
```

**Acceptance Criteria:**
- [ ] Queries articles through items → properties relationship
- [ ] Includes reviewed_by field in response
- [ ] Filters by itemIds derived from propertyIds
- [ ] Applies status filter when provided
- [ ] Returns properly formatted TranslationStatusItem array

---

### Task 8: Implement Links Translation Query

**Task ID:** E05-001-T08
**Estimated Effort:** 1 SP
**Dependencies:** E05-001-T05

**Objective:** Create a function to query link translations.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

```typescript
/**
 * Query link translations for given property IDs
 */
async function queryLinkTranslations(
  supabase: any,
  propertyIds: string[],
  entityId: string | null,
  statusFilter: TranslationStatus | null
): Promise<TranslationStatusItem[]> {
  if (propertyIds.length === 0 && !entityId) {
    return [];
  }

  // Get items for these properties first
  let itemIds: string[] = [];

  if (!entityId && propertyIds.length > 0) {
    const { data: items } = await supabase
      .from('items')
      .select('id')
      .in('property_id', propertyIds);

    itemIds = (items || []).map((i: { id: string }) => i.id);

    if (itemIds.length === 0) {
      return [];
    }
  }

  // Build query for links
  let linksQuery = supabase
    .from('item_links')
    .select(`
      id,
      title,
      source_language,
      item_id,
      link_translations (
        language,
        translation_status,
        translated_at
      )
    `);

  // Apply filters
  if (entityId) {
    linksQuery = linksQuery.eq('id', entityId);
  } else if (itemIds.length > 0) {
    linksQuery = linksQuery.in('item_id', itemIds);
  }

  const { data: links, error } = await linksQuery;

  if (error) {
    console.error(`${DEBUG_PREFIX} Links query error:`, error);
    return [];
  }

  // Transform to TranslationStatusItem format
  const results: TranslationStatusItem[] = [];

  for (const link of links || []) {
    const translations: TranslationStatusItem['translations'] = {};

    for (const trans of link.link_translations || []) {
      // Apply status filter if provided
      if (statusFilter && trans.translation_status !== statusFilter) {
        continue;
      }

      translations[trans.language as SupportedLanguage] = {
        status: trans.translation_status as TranslationStatus,
        translatedAt: trans.translated_at || undefined
      };
    }

    // Only include link if it has matching translations (when filter applied) or always (no filter)
    if (!statusFilter || Object.keys(translations).length > 0) {
      results.push({
        entityType: 'link',
        entityId: link.id,
        name: link.title,
        sourceLanguage: (link.source_language as SupportedLanguage) || 'en',
        translations
      });
    }
  }

  return results;
}
```

**Acceptance Criteria:**
- [ ] Queries links through items → properties relationship
- [ ] Filters by itemIds derived from propertyIds
- [ ] Applies status filter when provided
- [ ] Returns properly formatted TranslationStatusItem array

---

### Task 9: Implement Summary Calculation

**Task ID:** E05-001-T09
**Estimated Effort:** 1 SP
**Dependencies:** E05-001-T06, E05-001-T07, E05-001-T08

**Objective:** Create a function to calculate summary statistics from translation status items.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

```typescript
// ============================================================================
// Summary Calculation
// ============================================================================

/**
 * Number of non-English languages that need translations
 * Languages: fr, es, de, nl, it (5 total)
 */
const NON_EN_LANGUAGE_COUNT = 5;

/**
 * Calculate summary statistics from translation status items
 */
function calculateSummary(items: TranslationStatusItem[]): TranslationStatusSummary {
  let total = items.length;
  let complete = 0;
  let partial = 0;
  let pending = 0;
  let failed = 0;

  for (const item of items) {
    const translationValues = Object.values(item.translations);
    const translationCount = translationValues.length;

    // Count completed/manual translations
    const completedCount = translationValues.filter(
      t => t?.status === 'completed' || t?.status === 'manual'
    ).length;

    // Check for pending/processing
    const hasPending = translationValues.some(
      t => t?.status === 'pending' || t?.status === 'processing'
    );

    // Check for failed
    const hasFailed = translationValues.some(t => t?.status === 'failed');

    // Categorize the entity
    if (completedCount >= NON_EN_LANGUAGE_COUNT) {
      complete++;
    } else if (hasFailed) {
      // Any failed translation means entity is in failed state
      failed++;
    } else if (hasPending) {
      // Any pending/processing means entity is pending
      pending++;
    } else if (completedCount > 0) {
      // Some but not all translations complete
      partial++;
    }
    // Else: no translations yet (included in total but not in other categories)
  }

  return {
    total,
    complete,
    partial,
    pending,
    failed
  };
}
```

**Acceptance Criteria:**
- [ ] Correctly counts total entities
- [ ] Identifies fully translated entities (5/5 languages)
- [ ] Identifies partially translated entities
- [ ] Identifies entities with pending translations
- [ ] Identifies entities with failed translations
- [ ] Summary counts are mutually exclusive

**Test Cases:**
- Empty array → all zeros
- Entity with 5 completed → complete++
- Entity with 3 completed → partial++
- Entity with pending → pending++
- Entity with failed → failed++

---

### Task 10: Implement Main GET Handler

**Task ID:** E05-001-T10
**Estimated Effort:** 2 SP
**Dependencies:** E05-001-T03, E05-001-T04, E05-001-T05, E05-001-T06, E05-001-T07, E05-001-T08, E05-001-T09

**Objective:** Implement the main GET handler that orchestrates all components.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

```typescript
// ============================================================================
// GET Handler
// ============================================================================

/**
 * GET /api/translations/status
 *
 * Query translation status for content with optional filters.
 */
export async function GET(request: NextRequest): Promise<NextResponse<TranslationStatusResponse | ErrorResponse>> {
  try {
    console.log(`${DEBUG_PREFIX} Translation status API called - validating authentication...`);

    // Step 1: Authenticate user
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log(`${DEBUG_PREFIX} Authentication failed`);
      return authResult.error;
    }

    const user = authResult.user;
    const isAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    console.log(`${DEBUG_PREFIX} Authenticated user: ${user.email}, isAdmin: ${isAdmin}`);

    // Step 2: Get account context
    const accountContextResult = await getAccountContext(request, user.id, isAdmin, supabase);
    if ('error' in accountContextResult) {
      return accountContextResult.error;
    }

    const { accountId, accountRole } = accountContextResult;
    console.log(`${DEBUG_PREFIX} Account context: accountId=${accountId}, role=${accountRole}`);

    // Step 3: Parse and validate query parameters
    const parseResult = parseQueryParams(request);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error, code: parseResult.code },
        { status: 400 }
      );
    }

    const { entityType, entityId, status, propertyId } = parseResult.params;
    console.log(`${DEBUG_PREFIX} Query params: entityType=${entityType}, entityId=${entityId}, status=${status}, propertyId=${propertyId}`);

    // Step 4: Validate property access and get property IDs to query
    const propertyResult = await validatePropertyAccess(supabase, accountId, propertyId, isAdmin);
    if ('error' in propertyResult) {
      return propertyResult.error;
    }

    const { propertyIds } = propertyResult;
    console.log(`${DEBUG_PREFIX} Property IDs to query: ${propertyIds.length} properties`);

    // Step 5: Query translations based on entityType filter
    let allItems: TranslationStatusItem[] = [];

    if (!entityType || entityType === 'item') {
      const items = await queryItemTranslations(supabase, propertyIds, entityType === 'item' ? entityId : null, status);
      allItems = allItems.concat(items);
    }

    if (!entityType || entityType === 'article') {
      const articles = await queryArticleTranslations(supabase, propertyIds, entityType === 'article' ? entityId : null, status);
      allItems = allItems.concat(articles);
    }

    if (!entityType || entityType === 'link') {
      const links = await queryLinkTranslations(supabase, propertyIds, entityType === 'link' ? entityId : null, status);
      allItems = allItems.concat(links);
    }

    console.log(`${DEBUG_PREFIX} Found ${allItems.length} entities with translation status`);

    // Step 6: Calculate summary
    const summary = calculateSummary(allItems);

    // Step 7: Build and return response
    const response: TranslationStatusResponse = {
      success: true,
      data: {
        summary,
        items: allItems
      },
      accountContext: { accountId, accountRole }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error(`${DEBUG_PREFIX} Unexpected error:`, error);
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
- [ ] Authenticates user before processing
- [ ] Gets account context correctly
- [ ] Parses and validates query parameters
- [ ] Validates property access
- [ ] Queries correct entity types based on filter
- [ ] Returns properly formatted response
- [ ] Handles errors with appropriate status codes

---

### Task 11: Add Performance Optimization

**Task ID:** E05-001-T11
**Estimated Effort:** 1 SP
**Dependencies:** E05-001-T10

**Objective:** Optimize queries by running them in parallel where possible.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

Replace the sequential query section in the GET handler with parallel execution:

```typescript
    // Step 5: Query translations based on entityType filter (parallel execution)
    const queryPromises: Promise<TranslationStatusItem[]>[] = [];

    if (!entityType || entityType === 'item') {
      queryPromises.push(
        queryItemTranslations(supabase, propertyIds, entityType === 'item' ? entityId : null, status)
      );
    }

    if (!entityType || entityType === 'article') {
      queryPromises.push(
        queryArticleTranslations(supabase, propertyIds, entityType === 'article' ? entityId : null, status)
      );
    }

    if (!entityType || entityType === 'link') {
      queryPromises.push(
        queryLinkTranslations(supabase, propertyIds, entityType === 'link' ? entityId : null, status)
      );
    }

    // Execute all queries in parallel
    const results = await Promise.all(queryPromises);
    const allItems = results.flat();

    console.log(`${DEBUG_PREFIX} Found ${allItems.length} entities with translation status`);
```

**Acceptance Criteria:**
- [ ] Queries run in parallel using Promise.all
- [ ] Results are correctly flattened
- [ ] Response time improved for multi-entity queries
- [ ] No functional regressions

---

### Task 12: Add Comprehensive Error Handling and Logging

**Task ID:** E05-001-T12
**Estimated Effort:** 1 SP
**Dependencies:** E05-001-T10

**Objective:** Enhance error handling and add detailed logging for debugging and audit purposes.

**File to Modify:** `/src/app/api/translations/status/route.ts`

**Implementation Steps:**

1. Add request timing:

```typescript
// Add at the start of GET handler, after the opening try {
const startTime = Date.now();
```

2. Add timing log at the end (before return):

```typescript
const duration = Date.now() - startTime;
console.log(`${DEBUG_PREFIX} Request completed in ${duration}ms, returned ${allItems.length} items`);

// Add performance warning if response time exceeds threshold
if (duration > 2000) {
  console.warn(`${DEBUG_PREFIX} Performance warning: Response time ${duration}ms exceeds 2s threshold`);
}
```

3. Enhance error logging in query functions:

```typescript
// Add to each query function's error handling
if (error) {
  console.error(`${DEBUG_PREFIX} Items query error:`, {
    error: error.message,
    code: error.code,
    propertyIds: propertyIds.slice(0, 5), // Log first 5 for debugging
    entityId,
    statusFilter
  });
  return [];
}
```

**Acceptance Criteria:**
- [ ] Request timing is logged
- [ ] Performance warnings triggered for slow responses (>2s)
- [ ] Error logs include relevant context
- [ ] No sensitive data (tokens, full user IDs) logged
- [ ] Logs use consistent DEBUG_PREFIX format

---

## Integration Testing Checklist

After all tasks are complete, verify the following scenarios:

### Authentication Tests
- [ ] **TC-1:** Authenticated user queries own property → Returns translation status
- [ ] **TC-2:** Unauthenticated request → Returns 401 Unauthorized
- [ ] **TC-3:** User queries different account's property → Returns 403 Forbidden

### Filter Tests
- [ ] **TC-4:** Filter by entityType=item → Returns only item translations
- [ ] **TC-5:** Filter by entityType=article → Returns only article translations
- [ ] **TC-6:** Filter by entityType=link → Returns only link translations
- [ ] **TC-7:** Filter by status=failed → Returns only failed translations
- [ ] **TC-8:** Filter by specific entityId → Returns single entity status

### Edge Cases
- [ ] **TC-9:** No translations exist → Returns empty items array with zero counts
- [ ] **TC-10:** Admin user queries any property → Returns translation status
- [ ] **TC-11:** Invalid entityType parameter → Returns 400 Bad Request
- [ ] **TC-12:** Invalid UUID format → Returns 400 Bad Request

### Performance Tests
- [ ] **TC-13:** Query with 100+ entities → Response under 2 seconds

---

## Manual Testing Commands

```bash
# Test with authentication (replace with valid session cookie)
curl -X GET 'http://localhost:3000/api/translations/status?propertyId=<uuid>' \
  -H 'Cookie: <session-cookies>'

# Test with entity type filter
curl -X GET 'http://localhost:3000/api/translations/status?entityType=article&propertyId=<uuid>' \
  -H 'Cookie: <session-cookies>'

# Test with status filter
curl -X GET 'http://localhost:3000/api/translations/status?status=pending&propertyId=<uuid>' \
  -H 'Cookie: <session-cookies>'

# Test specific entity
curl -X GET 'http://localhost:3000/api/translations/status?entityType=item&entityId=<uuid>' \
  -H 'Cookie: <session-cookies>'
```

---

## Final Verification Steps

After implementation is complete:

1. **TypeScript Compilation:**
   ```bash
   npx tsc --noEmit
   ```

2. **Build Verification:**
   ```bash
   npm run build
   ```

3. **Runtime Testing:**
   - Start dev server: `npm run dev`
   - Execute manual test commands above
   - Verify response structure matches specification

4. **Code Review Checklist:**
   - [ ] All functions have proper JSDoc comments
   - [ ] No `any` types except where unavoidable (Supabase client)
   - [ ] Error messages are user-friendly
   - [ ] Debug logs don't expose sensitive data
   - [ ] Response structure matches the overview document specification

---

## References

- **Overview Document:** `/docs/REQ-E05-001-create-translation-status-api-endpoint-overview.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-E05-001)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Pattern Reference:** `/src/app/api/admin/articles/route.ts`
- **Auth Reference:** `/src/lib/auth-server.ts`
- **Type Reference:** `/src/lib/translation-service/translation-service.types.ts`
- **Database Types:** `/src/lib/supabase.ts`
