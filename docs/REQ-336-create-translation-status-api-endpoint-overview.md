# REQ-336: Create Translation Status API Endpoint

**Generated:** 2026-01-19 00:00:00 UTC
**Last Modified:** 2026-01-19 00:00:00 UTC
**Request Source:** docs/gen_requests_epic5.md - Request #336
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.1
**Estimated Size:** M (Medium)
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## Overview

This document provides the implementation breakdown for creating a translation status API endpoint that allows property owners to query translation status information for their content. The endpoint accepts optional filters and returns both summary counts and item-level status details.

### Purpose

Property owners and account administrators need visibility into which of their properties, FAQ items, articles, or other content have been translated, are pending translation, or have failed translation. This endpoint provides the backend data infrastructure for all translation management UI features.

### Business Value

- Enables owners to monitor translation coverage and identify content gaps
- Ensures guests receive complete information in their preferred language
- Supports diverse user workflows from high-level overview to detailed item-specific management

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Admin Auth Validation | `/src/lib/auth-server.ts` - `validateAdminAuth()` | Authentication and admin/user verification |
| Account Context Extraction | `/src/app/api/admin/articles/route.ts` - `getAccountContext()` | Account-scoped access control pattern |
| Language Preference API | `/src/app/api/user/language/route.ts` | Response structure patterns |
| Translation Test API | `/src/app/api/admin/translate/route.ts` | Translation service integration patterns |
| Supabase Server Client | `/src/lib/supabase-server.ts` | Server-side database access |

### Database Schema References

Translation tables (from Epic 1) that will be queried:

```typescript
// From /src/lib/supabase.ts

// article_translations
{
  id: string;
  article_id: string;
  language: string;
  title: string;
  description: string | null;
  translation_status: string; // 'pending' | 'processing' | 'completed' | 'failed' | 'manual'
  translated_at: string | null;
  reviewed_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// item_translations
{
  id: string;
  item_id: string;
  language: string;
  name: string;
  description: string | null;
  translation_status: string;
  translated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// link_translations
{
  id: string;
  link_id: string;
  language: string;
  title: string;
  translation_status: string;
  translated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

### Supported Languages

```typescript
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
```

---

## API Contract

### Endpoint

```
GET /api/translations/status
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | `'article' \| 'item' \| 'link'` | No | Filter by entity type |
| `entityId` | `string` (UUID) | No | Filter by specific entity ID |
| `status` | `'pending' \| 'processing' \| 'completed' \| 'failed' \| 'manual'` | No | Filter by translation status |
| `propertyId` | `string` (UUID) | No | Filter by property scope |
| `account_id` | `string` (UUID) | No | Explicit account context (header or param) |

### Response Format

```typescript
interface TranslationStatusResponse {
  success: boolean;
  data?: {
    summary: {
      total: number;      // Total translation records
      complete: number;   // Fully translated entities
      partial: number;    // Partially translated entities
      pending: number;    // Pending translation jobs
      failed: number;     // Failed translation attempts
    };
    items: TranslationStatusItem[];
  };
  error?: string;
  code?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

interface TranslationStatusItem {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  name: string;                           // Entity name for display
  sourceLanguage: SupportedLanguage;      // Original content language
  translations: {
    [K in SupportedLanguage]?: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
      isStale?: boolean;                  // Source updated after translation
      translatedAt?: string;              // ISO timestamp
      reviewedBy?: string;                // User ID if manually reviewed
    };
  };
}
```

### Error Responses

| HTTP Code | Error Code | Description |
|-----------|------------|-------------|
| 401 | `UNAUTHORIZED` | No valid session or token |
| 403 | `FORBIDDEN` | User lacks access to requested account/property |
| 400 | `INVALID_PARAMETER` | Invalid filter parameter value |
| 500 | `INTERNAL_ERROR` | Database or server error |

---

## Implementation Tasks

### Task 1: Create Route File Structure

**File:** `/src/app/api/translations/status/route.ts`

Create the route file with proper imports and exports:

```typescript
// Required imports
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] All required imports present
- [ ] GET handler exported

---

### Task 2: Implement Authentication and Account Context

Reuse the authentication pattern from `/src/app/api/admin/articles/route.ts`:

```typescript
// Authentication flow
const authResult = await validateAdminAuth(request);
if (authResult.error) {
  return authResult.error;
}

const user = authResult.user;
const userIsAdmin = authResult.isAdmin;
const supabase = authResult.supabase;

// Extract account context
const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
if (accountContext.error) {
  return accountContext.error;
}
```

**Acceptance Criteria:**
- [ ] `validateAdminAuth` validates user session
- [ ] Account context extracted from request
- [ ] Non-admin users scoped to their account's entities
- [ ] Admin users can query across accounts (when no account filter)

---

### Task 3: Implement Query Parameter Parsing and Validation

Parse and validate the optional filter parameters:

```typescript
const { searchParams } = new URL(request.url);
const entityType = searchParams.get('entityType');
const entityId = searchParams.get('entityId');
const status = searchParams.get('status');
const propertyId = searchParams.get('propertyId');

// Validation
const VALID_ENTITY_TYPES = ['article', 'item', 'link'];
const VALID_STATUSES = ['pending', 'processing', 'completed', 'failed', 'manual'];

if (entityType && !VALID_ENTITY_TYPES.includes(entityType)) {
  return NextResponse.json(
    { success: false, error: `Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`, code: 'INVALID_PARAMETER' },
    { status: 400 }
  );
}
// Similar validation for status parameter
```

**Acceptance Criteria:**
- [ ] `entityType` validated against allowed values
- [ ] `entityId` validated as UUID format (if provided)
- [ ] `status` validated against allowed translation statuses
- [ ] `propertyId` validated as UUID format (if provided)
- [ ] Invalid parameters return 400 with descriptive error

---

### Task 4: Implement Property Access Validation

When `propertyId` is specified, validate the user has access:

```typescript
if (propertyId) {
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id, account_id')
    .eq('id', propertyId)
    .single();

  if (propertyError || !property) {
    return NextResponse.json(
      { success: false, error: 'Property not found', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  // Non-admin users must belong to the property's account
  if (!userIsAdmin && property.account_id !== accountId) {
    return NextResponse.json(
      { success: false, error: 'Access denied to property', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] Property existence validated
- [ ] Property account membership verified for non-admins
- [ ] 404 returned for non-existent property
- [ ] 403 returned for unauthorized property access

---

### Task 5: Implement Translation Data Fetching

Query translation tables based on filters:

```typescript
interface TranslationRecord {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  name: string;
  language: string;
  status: string;
  translatedAt: string | null;
  reviewedBy: string | null;
}

async function fetchTranslationData(
  supabase: any,
  accountId: string | null,
  filters: {
    entityType?: string;
    entityId?: string;
    status?: string;
    propertyId?: string;
  },
  userIsAdmin: boolean
): Promise<TranslationRecord[]> {
  const results: TranslationRecord[] = [];
  const typesToQuery = filters.entityType
    ? [filters.entityType]
    : ['article', 'item', 'link'];

  for (const type of typesToQuery) {
    // Build query based on entity type
    // Join with parent entity and property tables for access control
    // Apply filters
  }

  return results;
}
```

**Query Logic per Entity Type:**

1. **Articles:** Join `article_translations` -> `item_articles` -> `items` -> `properties`
2. **Items:** Join `item_translations` -> `items` -> `properties`
3. **Links:** Join `link_translations` -> `item_links` -> (items or item_articles) -> `properties`

**Acceptance Criteria:**
- [ ] Queries all three translation tables when no entityType filter
- [ ] Correctly joins to parent entities for access control
- [ ] Filters by account when user is not admin
- [ ] Applies entityId filter when provided
- [ ] Applies status filter when provided
- [ ] Applies propertyId filter when provided

---

### Task 6: Implement Summary Aggregation

Calculate summary counts from the fetched data:

```typescript
function calculateSummary(items: TranslationStatusItem[]): {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
} {
  let total = items.length;
  let complete = 0;
  let partial = 0;
  let pending = 0;
  let failed = 0;

  for (const item of items) {
    const statuses = Object.values(item.translations).map(t => t?.status);
    const hasCompleted = statuses.some(s => s === 'completed' || s === 'manual');
    const allCompleted = statuses.every(s => s === 'completed' || s === 'manual');
    const hasPending = statuses.some(s => s === 'pending' || s === 'processing');
    const hasFailed = statuses.some(s => s === 'failed');

    if (allCompleted) {
      complete++;
    } else if (hasFailed) {
      failed++;
    } else if (hasPending) {
      pending++;
    } else if (hasCompleted) {
      partial++;
    }
  }

  return { total, complete, partial, pending, failed };
}
```

**Acceptance Criteria:**
- [ ] Total count equals number of unique entities
- [ ] Complete count includes entities with all languages translated
- [ ] Partial count includes entities with some (but not all) translations
- [ ] Pending count includes entities with pending/processing translations
- [ ] Failed count includes entities with at least one failed translation

---

### Task 7: Implement Response Assembly

Transform fetched records into response format:

```typescript
function groupTranslationsByEntity(
  records: TranslationRecord[]
): TranslationStatusItem[] {
  const entityMap = new Map<string, TranslationStatusItem>();

  for (const record of records) {
    const key = `${record.entityType}:${record.entityId}`;

    if (!entityMap.has(key)) {
      entityMap.set(key, {
        entityType: record.entityType,
        entityId: record.entityId,
        name: record.name,
        sourceLanguage: 'en', // Default, should come from source entity
        translations: {}
      });
    }

    const item = entityMap.get(key)!;
    item.translations[record.language as SupportedLanguage] = {
      status: record.status as TranslationStatus,
      translatedAt: record.translatedAt || undefined,
      reviewedBy: record.reviewedBy || undefined
    };
  }

  return Array.from(entityMap.values());
}
```

**Acceptance Criteria:**
- [ ] Records grouped by unique entity
- [ ] Each entity shows all available language translations
- [ ] Missing languages are excluded (not shown as null)
- [ ] Timestamps formatted as ISO strings

---

### Task 8: Assemble Final Response

```typescript
export async function GET(request: NextRequest) {
  try {
    // ... authentication and validation code ...

    const records = await fetchTranslationData(supabase, accountId, filters, userIsAdmin);
    const items = groupTranslationsByEntity(records);
    const summary = calculateSummary(items);

    return NextResponse.json({
      success: true,
      data: { summary, items },
      accountContext: { accountId, accountRole }
    });

  } catch (error) {
    console.error('[TranslationStatus] API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [ ] Returns 200 with data on success
- [ ] Returns empty items array when no matches (not error)
- [ ] Includes accountContext in response
- [ ] Catches and logs unexpected errors
- [ ] Returns 500 with generic message for unexpected errors

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/route.ts` | Main endpoint implementation |

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
| `account_users` | Used by `validateAdminAuth` |

---

## Testing Considerations

### Unit Test Cases

1. **Authentication Tests**
   - Returns 401 when no session
   - Returns 401 for invalid/expired token
   - Proceeds for valid authenticated user

2. **Authorization Tests**
   - Non-admin can only see own account's entities
   - Admin can see all accounts (when no filter)
   - Returns 403 for property not in user's account

3. **Filter Tests**
   - No filters returns all accessible entities
   - `entityType` filter limits to single type
   - `entityId` filter returns single entity
   - `status` filter limits by translation status
   - `propertyId` filter limits to property's entities
   - Combined filters work correctly

4. **Response Format Tests**
   - Summary counts are accurate
   - Items grouped correctly by entity
   - Translations nested under correct language keys
   - Timestamps are valid ISO strings

5. **Error Handling Tests**
   - Invalid entityType returns 400
   - Invalid status returns 400
   - Non-existent propertyId returns 404
   - Database errors return 500

### Integration Test Scenarios

1. Query translation status for all items in a property
2. Query translation status for a single article
3. Query all failed translations for an account
4. Verify response updates when translations complete

---

## Performance Considerations

- Use database indexes on `translation_status` columns (created in Epic 1)
- Consider pagination for large result sets (future enhancement)
- Limit result set size with sensible defaults
- Use efficient JOIN strategies to minimize query count

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Document: `/docs/gen_requests_epic5.md` - REQ-336
- Epic 1 Foundation: Translation table schemas
- Epic 3 Dynamic Translation: Translation status tracking patterns

---

## Acceptance Criteria Checklist

- [ ] Endpoint accepts GET requests with optional entityType query parameter
- [ ] Endpoint accepts GET requests with optional entityId query parameter
- [ ] Endpoint accepts GET requests with optional status query parameter
- [ ] Endpoint accepts GET requests with optional propertyId query parameter
- [ ] Endpoint returns translation records matching all provided filter criteria
- [ ] Endpoint returns all translation records within user's access scope when no filters are provided
- [ ] Response includes summary object with counts grouped by translation status
- [ ] Response includes array of detailed translation records showing entity, language, status, and timestamps
- [ ] Endpoint validates authenticated user has access to all entities included in results
- [ ] Endpoint rejects unauthorized requests with appropriate error response
- [ ] Endpoint handles invalid filter parameters gracefully without crashing
- [ ] Endpoint returns empty results when filters match no translation records
- [ ] Response format is consistent with other API endpoints in the system
- [ ] Endpoint performance remains acceptable when querying large result sets
- [ ] Endpoint enforces proper request authentication and session validation
