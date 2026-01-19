# REQ-336: Create Translation Status API Endpoint - Detailed Task Breakdown

**Generated:** 2026-01-19 12:00:00 UTC
**Last Modified:** 2026-01-19 12:00:00 UTC
**Request Source:** docs/gen_requests_epic5.md - Request #336
**Overview Document:** docs/REQ-336-create-translation-status-api-endpoint-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.1
**Estimated Size:** M (Medium)
**Estimated Effort:** 4-6 hours (single 1-story-point tasks)
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## Executive Summary

This document provides granular implementation tasks for creating a translation status API endpoint. The endpoint allows property owners to query translation status information for their content, supporting filters by entity type, entity ID, translation status, and property ID. The response includes both summary counts and item-level status details.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Translation tables exist in database (`article_translations`, `item_translations`, `link_translations`)
- [ ] Translation status column exists with valid values: `pending`, `processing`, `completed`, `failed`, `manual`
- [ ] `validateAdminAuth` function is available from `/src/lib/auth-server.ts`
- [ ] `supabaseAdmin` is available from `/src/lib/supabase.ts`
- [ ] `createSupabaseServer` is available from `/src/lib/supabase-server.ts`

---

## Task Breakdown

### Task 1: Create Route File and Directory Structure

**File:** `/src/app/api/translations/status/route.ts`
**Estimated Effort:** 15 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

1. Create the directory structure:
   ```
   /src/app/api/translations/status/
   ```

2. Create the route file with initial imports:

```typescript
// /src/app/api/translations/status/route.ts
// REQ-336: Translation Status API Endpoint
// Phase: 1 - API Endpoints
// Task ID: 1.1
// Last Modified: 2026-01-19

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
```

#### Acceptance Criteria

- [ ] Directory `/src/app/api/translations/status/` exists
- [ ] File `route.ts` created at correct path
- [ ] All required imports present and valid
- [ ] File compiles without TypeScript errors

#### Verification Command

```bash
# Verify file exists and compiles
npx tsc --noEmit src/app/api/translations/status/route.ts
```

---

### Task 2: Define TypeScript Interfaces and Constants

**File:** `/src/app/api/translations/status/route.ts`
**Estimated Effort:** 20 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

1. Add supported languages constant:

```typescript
// Supported language codes (matches i18n configuration)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Valid entity types
const VALID_ENTITY_TYPES = ['article', 'item', 'link'] as const;
type EntityType = typeof VALID_ENTITY_TYPES[number];

// Valid translation statuses
const VALID_STATUSES = ['pending', 'processing', 'completed', 'failed', 'manual'] as const;
type TranslationStatus = typeof VALID_STATUSES[number];
```

2. Add response interfaces:

```typescript
// Response interfaces
interface TranslationStatusSummary {
  total: number;      // Total unique entities with translations
  complete: number;   // Entities with all languages translated
  partial: number;    // Entities with some (but not all) translations
  pending: number;    // Entities with pending/processing translations
  failed: number;     // Entities with at least one failed translation
}

interface TranslationLanguageStatus {
  status: TranslationStatus;
  isStale?: boolean;
  translatedAt?: string;
  reviewedBy?: string;
}

interface TranslationStatusItem {
  entityType: EntityType;
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: Partial<Record<SupportedLanguage, TranslationLanguageStatus>>;
}

interface TranslationStatusResponse {
  success: boolean;
  data?: {
    summary: TranslationStatusSummary;
    items: TranslationStatusItem[];
  };
  error?: string;
  code?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

// Internal type for raw translation records
interface TranslationRecord {
  entityType: EntityType;
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  language: SupportedLanguage;
  status: TranslationStatus;
  translatedAt: string | null;
  reviewedBy: string | null;
}
```

3. Add type guard functions:

```typescript
// Type guards
function isValidEntityType(value: string): value is EntityType {
  return VALID_ENTITY_TYPES.includes(value as EntityType);
}

function isValidStatus(value: string): value is TranslationStatus {
  return VALID_STATUSES.includes(value as TranslationStatus);
}

function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}
```

#### Acceptance Criteria

- [ ] All interfaces defined with proper JSDoc comments
- [ ] Type guards implemented for entityType, status, and UUID validation
- [ ] Constants defined for supported languages, entity types, and statuses
- [ ] Types match the API contract in overview document

---

### Task 3: Implement getAccountContext Helper Function

**File:** `/src/app/api/translations/status/route.ts`
**Estimated Effort:** 20 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

Copy and adapt the `getAccountContext` pattern from `/src/app/api/admin/articles/route.ts`:

```typescript
/**
 * Extract account context from request
 * Validates user has access to the requested account or falls back to their primary account
 */
async function getAccountContext(
  request: NextRequest,
  userId: string,
  isAdmin: boolean,
  supabase: ReturnType<typeof createSupabaseServer> extends Promise<infer T> ? T : never
): Promise<{
  accountId: string | null;
  accountRole: string;
  error?: NextResponse;
}> {
  try {
    const { searchParams } = new URL(request.url);
    const requestedAccountId = searchParams.get('account_id') || request.headers.get('x-account-id');

    // If specific account requested, validate access
    if (requestedAccountId) {
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

    // Admin users can query across all accounts
    if (isAdmin) {
      return { accountId: null, accountRole: 'admin' };
    }

    // Regular users: get their primary account
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
    console.error('[TranslationStatus] Account context error:', error);
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

#### Acceptance Criteria

- [ ] Function extracts account_id from query params or headers
- [ ] Admin users can query without account restriction
- [ ] Non-admin users are scoped to their own account
- [ ] Invalid account access returns 403 FORBIDDEN
- [ ] Missing account access returns 403 FORBIDDEN

---

### Task 4: Implement Query Parameter Parsing and Validation

**File:** `/src/app/api/translations/status/route.ts`
**Estimated Effort:** 25 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

Create a parameter parsing and validation function:

```typescript
/**
 * Parse and validate query parameters from the request
 */
function parseQueryParams(request: NextRequest): {
  filters: {
    entityType?: EntityType;
    entityId?: string;
    status?: TranslationStatus;
    propertyId?: string;
  };
  error?: NextResponse;
} {
  const { searchParams } = new URL(request.url);

  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const status = searchParams.get('status');
  const propertyId = searchParams.get('propertyId');

  // Validate entityType if provided
  if (entityType && !isValidEntityType(entityType)) {
    return {
      filters: {},
      error: NextResponse.json(
        {
          success: false,
          error: `Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
          code: 'INVALID_PARAMETER'
        },
        { status: 400 }
      )
    };
  }

  // Validate entityId if provided (must be UUID)
  if (entityId && !isValidUUID(entityId)) {
    return {
      filters: {},
      error: NextResponse.json(
        {
          success: false,
          error: 'Invalid entityId. Must be a valid UUID.',
          code: 'INVALID_PARAMETER'
        },
        { status: 400 }
      )
    };
  }

  // Validate status if provided
  if (status && !isValidStatus(status)) {
    return {
      filters: {},
      error: NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_PARAMETER'
        },
        { status: 400 }
      )
    };
  }

  // Validate propertyId if provided (must be UUID)
  if (propertyId && !isValidUUID(propertyId)) {
    return {
      filters: {},
      error: NextResponse.json(
        {
          success: false,
          error: 'Invalid propertyId. Must be a valid UUID.',
          code: 'INVALID_PARAMETER'
        },
        { status: 400 }
      )
    };
  }

  return {
    filters: {
      entityType: entityType as EntityType | undefined,
      entityId: entityId || undefined,
      status: status as TranslationStatus | undefined,
      propertyId: propertyId || undefined,
    }
  };
}
```

#### Acceptance Criteria

- [ ] `entityType` validated against allowed values (article, item, link)
- [ ] `entityId` validated as UUID format when provided
- [ ] `status` validated against allowed translation statuses
- [ ] `propertyId` validated as UUID format when provided
- [ ] Invalid parameters return 400 with descriptive error message
- [ ] Missing/optional parameters handled gracefully (return undefined)

---

### Task 5: Implement Property Access Validation

**File:** `/src/app/api/translations/status/route.ts`
**Estimated Effort:** 20 minutes
**Priority:** P1 - High

#### Implementation Steps

Create a property access validation function:

```typescript
/**
 * Validate user has access to the specified property
 * Returns the property if access is granted, or an error response
 */
async function validatePropertyAccess(
  supabase: ReturnType<typeof createSupabaseServer> extends Promise<infer T> ? T : never,
  propertyId: string,
  accountId: string | null,
  userIsAdmin: boolean
): Promise<{
  property?: { id: string; account_id: string };
  error?: NextResponse;
}> {
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

  // Non-admin users must belong to the property's account
  if (!userIsAdmin && property.account_id !== accountId) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Access denied to property', code: 'FORBIDDEN' },
        { status: 403 }
      )
    };
  }

  return { property };
}
```

#### Acceptance Criteria

- [ ] Property existence validated against database
- [ ] Property account membership verified for non-admin users
- [ ] Returns 404 for non-existent property
- [ ] Returns 403 for unauthorized property access
- [ ] Admin users can access any property

---

### Task 6: Implement Translation Data Fetching Functions

**File:** `/src/app/api/translations/status/route.ts`
**Estimated Effort:** 45 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

1. Create helper function to fetch article translations:

```typescript
/**
 * Fetch article translations with account/property filtering
 */
async function fetchArticleTranslations(
  accountId: string | null,
  filters: { entityId?: string; status?: string; propertyId?: string },
  userIsAdmin: boolean
): Promise<TranslationRecord[]> {
  // Build query with joins to items and properties for access control
  let query = supabaseAdmin
    .from('article_translations')
    .select(`
      id,
      article_id,
      language,
      title,
      translation_status,
      translated_at,
      reviewed_by,
      item_articles!inner (
        id,
        title,
        source_language,
        items!inner (
          id,
          name,
          properties!inner (
            id,
            account_id
          )
        )
      )
    `);

  // Apply entityId filter
  if (filters.entityId) {
    query = query.eq('article_id', filters.entityId);
  }

  // Apply status filter
  if (filters.status) {
    query = query.eq('translation_status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[TranslationStatus] Article translations fetch error:', error);
    return [];
  }

  // Filter by account/property access and transform to TranslationRecord format
  const records: TranslationRecord[] = [];

  for (const row of data || []) {
    const article = row.item_articles as any;
    const item = article?.items;
    const property = item?.properties;

    // Skip if no property data (shouldn't happen with inner joins)
    if (!property) continue;

    // Apply account filter for non-admin users
    if (!userIsAdmin && accountId && property.account_id !== accountId) {
      continue;
    }

    // Apply property filter if specified
    if (filters.propertyId && property.id !== filters.propertyId) {
      continue;
    }

    records.push({
      entityType: 'article',
      entityId: row.article_id,
      name: article.title || 'Untitled Article',
      sourceLanguage: (article.source_language as SupportedLanguage) || 'en',
      language: row.language as SupportedLanguage,
      status: row.translation_status as TranslationStatus,
      translatedAt: row.translated_at,
      reviewedBy: row.reviewed_by,
    });
  }

  return records;
}
```

2. Create helper function to fetch item translations:

```typescript
/**
 * Fetch item translations with account/property filtering
 */
async function fetchItemTranslations(
  accountId: string | null,
  filters: { entityId?: string; status?: string; propertyId?: string },
  userIsAdmin: boolean
): Promise<TranslationRecord[]> {
  let query = supabaseAdmin
    .from('item_translations')
    .select(`
      id,
      item_id,
      language,
      name,
      translation_status,
      translated_at,
      items!inner (
        id,
        name,
        source_language,
        properties!inner (
          id,
          account_id
        )
      )
    `);

  // Apply entityId filter
  if (filters.entityId) {
    query = query.eq('item_id', filters.entityId);
  }

  // Apply status filter
  if (filters.status) {
    query = query.eq('translation_status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[TranslationStatus] Item translations fetch error:', error);
    return [];
  }

  const records: TranslationRecord[] = [];

  for (const row of data || []) {
    const item = row.items as any;
    const property = item?.properties;

    if (!property) continue;

    // Apply account filter for non-admin users
    if (!userIsAdmin && accountId && property.account_id !== accountId) {
      continue;
    }

    // Apply property filter if specified
    if (filters.propertyId && property.id !== filters.propertyId) {
      continue;
    }

    records.push({
      entityType: 'item',
      entityId: row.item_id,
      name: item.name || 'Untitled Item',
      sourceLanguage: (item.source_language as SupportedLanguage) || 'en',
      language: row.language as SupportedLanguage,
      status: row.translation_status as TranslationStatus,
      translatedAt: row.translated_at,
      reviewedBy: null, // Items don't have reviewed_by field
    });
  }

  return records;
}
```

3. Create helper function to fetch link translations:

```typescript
/**
 * Fetch link translations with account/property filtering
 */
async function fetchLinkTranslations(
  accountId: string | null,
  filters: { entityId?: string; status?: string; propertyId?: string },
  userIsAdmin: boolean
): Promise<TranslationRecord[]> {
  let query = supabaseAdmin
    .from('link_translations')
    .select(`
      id,
      link_id,
      language,
      title,
      translation_status,
      translated_at,
      item_links!inner (
        id,
        title,
        item_id,
        article_id,
        items (
          id,
          properties!inner (
            id,
            account_id
          )
        ),
        item_articles (
          id,
          items!inner (
            id,
            properties!inner (
              id,
              account_id
            )
          )
        )
      )
    `);

  // Apply entityId filter
  if (filters.entityId) {
    query = query.eq('link_id', filters.entityId);
  }

  // Apply status filter
  if (filters.status) {
    query = query.eq('translation_status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[TranslationStatus] Link translations fetch error:', error);
    return [];
  }

  const records: TranslationRecord[] = [];

  for (const row of data || []) {
    const link = row.item_links as any;

    // Links can belong to items directly or via articles
    let property: { id: string; account_id: string } | null = null;

    if (link.items?.properties) {
      property = link.items.properties;
    } else if (link.item_articles?.items?.properties) {
      property = link.item_articles.items.properties;
    }

    if (!property) continue;

    // Apply account filter for non-admin users
    if (!userIsAdmin && accountId && property.account_id !== accountId) {
      continue;
    }

    // Apply property filter if specified
    if (filters.propertyId && property.id !== filters.propertyId) {
      continue;
    }

    records.push({
      entityType: 'link',
      entityId: row.link_id,
      name: link.title || 'Untitled Link',
      sourceLanguage: 'en', // Links don't have source_language, default to English
      language: row.language as SupportedLanguage,
      status: row.translation_status as TranslationStatus,
      translatedAt: row.translated_at,
      reviewedBy: null, // Links don't have reviewed_by field
    });
  }

  return records;
}
```

4. Create main fetch function that combines all entity types:

```typescript
/**
 * Fetch all translation data based on filters
 */
async function fetchTranslationData(
  accountId: string | null,
  filters: {
    entityType?: EntityType;
    entityId?: string;
    status?: TranslationStatus;
    propertyId?: string;
  },
  userIsAdmin: boolean
): Promise<TranslationRecord[]> {
  const typesToQuery: EntityType[] = filters.entityType
    ? [filters.entityType]
    : ['article', 'item', 'link'];

  const results: TranslationRecord[] = [];

  // Fetch translations for each entity type
  const fetchPromises: Promise<TranslationRecord[]>[] = [];

  if (typesToQuery.includes('article')) {
    fetchPromises.push(fetchArticleTranslations(accountId, filters, userIsAdmin));
  }

  if (typesToQuery.includes('item')) {
    fetchPromises.push(fetchItemTranslations(accountId, filters, userIsAdmin));
  }

  if (typesToQuery.includes('link')) {
    fetchPromises.push(fetchLinkTranslations(accountId, filters, userIsAdmin));
  }

  // Execute all fetches in parallel
  const fetchResults = await Promise.all(fetchPromises);

  // Combine results
  for (const records of fetchResults) {
    results.push(...records);
  }

  return results;
}
```

#### Acceptance Criteria

- [ ] Queries all three translation tables when no entityType filter provided
- [ ] Correctly joins to parent entities for access control
- [ ] Filters by account when user is not admin
- [ ] Applies entityId filter when provided
- [ ] Applies status filter when provided
- [ ] Applies propertyId filter when provided
- [ ] Handles database errors gracefully (logs and returns empty array)
- [ ] Parallel fetching for performance when querying multiple entity types

---

### Task 7: Implement Response Transformation Functions

**File:** `/src/app/api/translations/status/route.ts`
**Estimated Effort:** 30 minutes
**Priority:** P1 - High

#### Implementation Steps

1. Create function to group translations by entity:

```typescript
/**
 * Group raw translation records by unique entity
 */
function groupTranslationsByEntity(records: TranslationRecord[]): TranslationStatusItem[] {
  const entityMap = new Map<string, TranslationStatusItem>();

  for (const record of records) {
    const key = `${record.entityType}:${record.entityId}`;

    if (!entityMap.has(key)) {
      entityMap.set(key, {
        entityType: record.entityType,
        entityId: record.entityId,
        name: record.name,
        sourceLanguage: record.sourceLanguage,
        translations: {}
      });
    }

    const item = entityMap.get(key)!;
    item.translations[record.language] = {
      status: record.status,
      translatedAt: record.translatedAt || undefined,
      reviewedBy: record.reviewedBy || undefined,
      // TODO: Add isStale calculation when source_version_at is implemented
    };
  }

  return Array.from(entityMap.values());
}
```

2. Create function to calculate summary statistics:

```typescript
/**
 * Calculate summary statistics from grouped translation items
 */
function calculateSummary(items: TranslationStatusItem[]): TranslationStatusSummary {
  let total = items.length;
  let complete = 0;
  let partial = 0;
  let pending = 0;
  let failed = 0;

  // Number of non-source languages to check for completion
  const targetLanguageCount = SUPPORTED_LANGUAGES.length - 1; // Exclude source language

  for (const item of items) {
    const translationEntries = Object.entries(item.translations);

    // Filter out source language from translation count
    const targetTranslations = translationEntries.filter(
      ([lang]) => lang !== item.sourceLanguage
    );

    const statuses = targetTranslations.map(([, t]) => t.status);

    const completedCount = statuses.filter(s => s === 'completed' || s === 'manual').length;
    const hasFailed = statuses.some(s => s === 'failed');
    const hasPending = statuses.some(s => s === 'pending' || s === 'processing');

    // All target languages are translated
    if (completedCount >= targetLanguageCount) {
      complete++;
    } else if (hasFailed) {
      // At least one translation failed
      failed++;
    } else if (hasPending) {
      // At least one translation is pending/processing
      pending++;
    } else if (completedCount > 0) {
      // Some but not all translations complete
      partial++;
    } else {
      // No translations yet - count as pending
      pending++;
    }
  }

  return { total, complete, partial, pending, failed };
}
```

#### Acceptance Criteria

- [ ] Records grouped by unique entity (entityType + entityId)
- [ ] Each entity shows all available language translations
- [ ] Missing languages excluded from response (not shown as null)
- [ ] Timestamps formatted as ISO strings or undefined
- [ ] Summary counts calculated correctly:
  - Total equals number of unique entities
  - Complete = entities with all target languages translated
  - Partial = entities with some (but not all) translations
  - Pending = entities with pending/processing translations
  - Failed = entities with at least one failed translation

---

### Task 8: Implement GET Handler

**File:** `/src/app/api/translations/status/route.ts`
**Estimated Effort:** 30 minutes
**Priority:** P0 - Blocker

#### Implementation Steps

```typescript
/**
 * GET /api/translations/status
 * Query translation status for entities with optional filters
 *
 * Query Parameters:
 * - entityType: 'article' | 'item' | 'link' (optional)
 * - entityId: UUID (optional, filter to specific entity)
 * - status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual' (optional)
 * - propertyId: UUID (optional, filter to property scope)
 * - account_id: UUID (optional, explicit account context)
 */
export async function GET(request: NextRequest): Promise<NextResponse<TranslationStatusResponse>> {
  try {
    console.log('[TranslationStatus] GET request received');

    // Step 1: Authenticate user
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    console.log('[TranslationStatus] User authenticated:', user.email, 'isAdmin:', userIsAdmin);

    // Step 2: Extract account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    console.log('[TranslationStatus] Account context:', { accountId, accountRole });

    // Step 3: Parse and validate query parameters
    const { filters, error: parseError } = parseQueryParams(request);
    if (parseError) {
      return parseError;
    }

    console.log('[TranslationStatus] Filters:', filters);

    // Step 4: Validate property access if propertyId provided
    if (filters.propertyId) {
      const { error: propertyError } = await validatePropertyAccess(
        supabase,
        filters.propertyId,
        accountId,
        userIsAdmin
      );
      if (propertyError) {
        return propertyError;
      }
    }

    // Step 5: Fetch translation data
    const records = await fetchTranslationData(accountId, filters, userIsAdmin);
    console.log('[TranslationStatus] Fetched records:', records.length);

    // Step 6: Group and transform data
    const items = groupTranslationsByEntity(records);
    const summary = calculateSummary(items);

    console.log('[TranslationStatus] Summary:', summary);

    // Step 7: Return success response
    return NextResponse.json({
      success: true,
      data: { summary, items },
      accountContext: { accountId, accountRole }
    });

  } catch (error) {
    console.error('[TranslationStatus] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

#### Acceptance Criteria

- [ ] Returns 200 with data on success
- [ ] Returns empty items array when no matches (not error)
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 403 for unauthorized account access
- [ ] Returns 400 for invalid parameters
- [ ] Returns 404 for non-existent property
- [ ] Returns 500 for unexpected errors
- [ ] Includes accountContext in response
- [ ] Catches and logs unexpected errors

---

### Task 9: Add Logging and Error Handling

**File:** `/src/app/api/translations/status/route.ts`
**Estimated Effort:** 15 minutes
**Priority:** P2 - Medium

#### Implementation Steps

Ensure comprehensive logging throughout:

```typescript
// Add at the top of the file
const LOG_PREFIX = '[TranslationStatus]';

// Add logging helper
function logInfo(message: string, data?: Record<string, unknown>): void {
  console.log(`${LOG_PREFIX} ${message}`, data ? JSON.stringify(data) : '');
}

function logError(message: string, error?: unknown): void {
  console.error(`${LOG_PREFIX} ${message}`, error);
}
```

Update fetch functions to use consistent logging:

```typescript
// In each fetch function, add:
logInfo(`Fetching ${entityType} translations`, { filters });

// On error:
logError(`${entityType} translations fetch error`, error);

// On success:
logInfo(`Fetched ${records.length} ${entityType} translation records`);
```

#### Acceptance Criteria

- [ ] All major operations logged with consistent prefix
- [ ] Error logging includes error details
- [ ] Sensitive data not logged (only IDs, counts, not content)
- [ ] Performance-relevant information logged (record counts)

---

### Task 10: Write Unit Tests

**File:** `/src/app/api/translations/status/__tests__/route.test.ts`
**Estimated Effort:** 45 minutes
**Priority:** P1 - High

#### Implementation Steps

Create test file with comprehensive test cases:

```typescript
// /src/app/api/translations/status/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock dependencies
vi.mock('@/lib/auth-server', () => ({
  validateAdminAuth: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

describe('GET /api/translations/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('returns 401 when no valid session', async () => {
      // Mock validateAdminAuth to return error
      const { validateAdminAuth } = await import('@/lib/auth-server');
      (validateAdminAuth as any).mockResolvedValue({
        error: new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 })
      });

      const request = new NextRequest('http://localhost/api/translations/status');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('Parameter Validation', () => {
    it('returns 400 for invalid entityType', async () => {
      // Setup auth mock
      const { validateAdminAuth } = await import('@/lib/auth-server');
      (validateAdminAuth as any).mockResolvedValue({
        user: { id: 'user-id', email: 'test@test.com' },
        isAdmin: false,
        supabase: mockSupabase,
      });

      const request = new NextRequest('http://localhost/api/translations/status?entityType=invalid');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.code).toBe('INVALID_PARAMETER');
    });

    it('returns 400 for invalid entityId (non-UUID)', async () => {
      // ... similar test setup
    });

    it('returns 400 for invalid status', async () => {
      // ... similar test setup
    });
  });

  describe('Data Filtering', () => {
    it('returns all entity types when no filter provided', async () => {
      // ... test implementation
    });

    it('filters by entityType correctly', async () => {
      // ... test implementation
    });

    it('filters by status correctly', async () => {
      // ... test implementation
    });
  });

  describe('Response Format', () => {
    it('includes summary with correct counts', async () => {
      // ... test implementation
    });

    it('groups translations by entity', async () => {
      // ... test implementation
    });

    it('returns empty array when no matches', async () => {
      // ... test implementation
    });
  });
});
```

#### Acceptance Criteria

- [ ] Test file created at correct path
- [ ] Authentication tests: 401 for no session, 401 for invalid token
- [ ] Authorization tests: 403 for unauthorized account access
- [ ] Filter tests: entityType, entityId, status, propertyId validation
- [ ] Response format tests: summary counts, items grouping
- [ ] Error handling tests: 500 for database errors
- [ ] All tests pass

---

## Integration Testing

### Manual Test Cases

After implementation, verify with manual testing:

1. **Test No Filters (All Data)**
   ```bash
   curl -X GET 'http://localhost:3000/api/translations/status' \
     -H 'Cookie: <auth-cookie>'
   ```
   Expected: Returns all translations for user's account

2. **Test Entity Type Filter**
   ```bash
   curl -X GET 'http://localhost:3000/api/translations/status?entityType=article' \
     -H 'Cookie: <auth-cookie>'
   ```
   Expected: Returns only article translations

3. **Test Status Filter**
   ```bash
   curl -X GET 'http://localhost:3000/api/translations/status?status=failed' \
     -H 'Cookie: <auth-cookie>'
   ```
   Expected: Returns only failed translations

4. **Test Property Filter**
   ```bash
   curl -X GET 'http://localhost:3000/api/translations/status?propertyId=<property-uuid>' \
     -H 'Cookie: <auth-cookie>'
   ```
   Expected: Returns translations for property's entities only

5. **Test Invalid Parameter**
   ```bash
   curl -X GET 'http://localhost:3000/api/translations/status?entityType=invalid' \
     -H 'Cookie: <auth-cookie>'
   ```
   Expected: 400 with INVALID_PARAMETER error

6. **Test Unauthorized Access**
   ```bash
   curl -X GET 'http://localhost:3000/api/translations/status' \
     # No auth cookie
   ```
   Expected: 401 Unauthorized

---

## Files Summary

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/route.ts` | Main endpoint implementation |
| `/src/app/api/translations/status/__tests__/route.test.ts` | Unit tests |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | Import `validateAdminAuth` function |
| `/src/lib/supabase-server.ts` | Import `createSupabaseServer` function |
| `/src/lib/supabase.ts` | Import `supabaseAdmin`, Database types |
| `/src/app/api/admin/articles/route.ts` | Reference `getAccountContext` pattern |
| `/src/app/api/user/language/route.ts` | Reference response structure patterns |

### Database Tables Accessed (Read-Only)

| Table | Access Pattern |
|-------|----------------|
| `article_translations` | SELECT with joins to articles/items/properties |
| `item_translations` | SELECT with joins to items/properties |
| `link_translations` | SELECT with joins to links/articles/items/properties |
| `item_articles` | JOIN for article access control |
| `items` | JOIN for item/link access control |
| `item_links` | JOIN for link access control |
| `properties` | JOIN for account-based access control |
| `account_users` | Used by `getAccountContext` for access validation |

---

## Acceptance Criteria Checklist

- [ ] Endpoint accepts GET requests at `/api/translations/status`
- [ ] Endpoint accepts optional `entityType` query parameter
- [ ] Endpoint accepts optional `entityId` query parameter
- [ ] Endpoint accepts optional `status` query parameter
- [ ] Endpoint accepts optional `propertyId` query parameter
- [ ] Endpoint returns translation records matching all provided filter criteria
- [ ] Endpoint returns all translation records within user's access scope when no filters provided
- [ ] Response includes `summary` object with counts grouped by translation status
- [ ] Response includes `items` array with detailed translation records
- [ ] Each item includes entity, language statuses, and timestamps
- [ ] Endpoint validates authenticated user has access to all entities in results
- [ ] Endpoint rejects unauthorized requests with 401 status
- [ ] Endpoint rejects forbidden requests with 403 status
- [ ] Endpoint handles invalid filter parameters with 400 status
- [ ] Endpoint returns empty results when filters match no translation records
- [ ] Response format is consistent with other API endpoints
- [ ] Endpoint performance remains acceptable for large result sets
- [ ] Endpoint enforces proper request authentication and session validation
- [ ] Unit tests written and passing
- [ ] TypeScript compiles without errors
- [ ] Build succeeds

---

## Performance Considerations

- Use database indexes on `translation_status` columns (created in Epic 1)
- Parallel fetching of different entity types for efficiency
- Use inner joins to leverage database filtering vs client-side filtering
- Consider adding pagination for large result sets (future enhancement)
- Log record counts for performance monitoring

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Overview Document: `/docs/REQ-336-create-translation-status-api-endpoint-overview.md`
- Request Document: `/docs/gen_requests_epic5.md` - REQ-336
- Epic 1 Foundation: Translation table schemas
- Epic 3 Dynamic Translation: Translation status tracking patterns
- Existing API Pattern: `/src/app/api/admin/articles/route.ts`
- Language Preference API: `/src/app/api/user/language/route.ts`

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
*Task ID: 1.1 - Create Translation Status API Endpoint*
