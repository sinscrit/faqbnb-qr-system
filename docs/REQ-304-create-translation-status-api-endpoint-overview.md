# REQ-304: Translation Status API Endpoint - Implementation Overview

**Last Modified:** 2026-01-18 12:00:00 UTC
**Request ID:** REQ-304
**Phase:** 1 - API Endpoints
**Task ID:** 1.1
**Status:** Planning

---

## Summary

Create a translation status query endpoint at `/src/app/api/translations/status/route.ts` that enables property owners and account administrators to query the translation status of their content. The endpoint supports filtering by entity type, entity ID, translation status, and property ID, returning both summary counts and detailed item-level status information while enforcing account-based access control.

---

## Dependencies

### Epic 1 (Foundation) - REQUIRED BEFORE IMPLEMENTATION

| Dependency | Description | Status |
|------------|-------------|--------|
| Translation tables | `article_translations`, `item_translations`, `link_translations` tables with `translation_status` column | **NOT YET CREATED** |
| Translation status enum | Values: `pending`, `processing`, `completed`, `failed`, `manual` | **NOT YET CREATED** |
| Source language columns | `items.source_language`, `item_articles.source_language`, `item_links.source_language` | **NOT YET CREATED** |

**BLOCKER:** Translation tables do not exist in the database yet. These must be created via Epic 1 migrations before this endpoint can be implemented.

### Existing Infrastructure (Available)

| Component | Location | Purpose |
|-----------|----------|---------|
| Auth validation | `/src/lib/auth-server.ts` → `validateAdminAuth()` | User authentication and admin validation |
| Account context | `/src/app/api/admin/items/route.ts` → `getAccountContext()` | Multi-tenant account filtering pattern |
| Supabase clients | `/src/lib/supabase.ts`, `/src/lib/supabase-server.ts` | Database access |
| Response types | `/src/types/index.ts` | Type definitions pattern |

---

## Technical Approach

### Endpoint Specification

```
GET /api/translations/status
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | string | No | Filter by type: `article`, `item`, `link` |
| `entityId` | string | No | Filter by specific entity UUID |
| `status` | string | No | Filter by status: `pending`, `processing`, `completed`, `failed`, `manual` |
| `propertyId` | string | No | Filter by property UUID |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20, max: 100) |

#### Response Structure

```typescript
interface TranslationStatusResponse {
  success: boolean;
  summary: {
    total: number;           // Total entities with translations
    complete: number;        // Fully translated (all languages)
    partial: number;         // Some translations complete
    pending: number;         // Awaiting translation
    failed: number;          // Translation failures
  };
  items: TranslationStatusItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  error?: string;
}

interface TranslationStatusItem {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  name: string;                           // Entity name for display
  sourceLanguage: SupportedLanguage;      // Original content language
  propertyId: string;                     // For property context
  translations: {
    [K in SupportedLanguage]?: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
      isStale?: boolean;                  // Source updated after translation
      translatedAt?: string;              // ISO timestamp
      reviewedBy?: string;                // User ID for manual edits
    };
  };
}

type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'nl' | 'it';
```

---

## Implementation Plan

### Task 1: Create Response Types (30 min)

**File:** `/src/types/translations.ts` (NEW)

Add TypeScript interfaces for:
- `TranslationStatusResponse`
- `TranslationStatusItem`
- `SupportedLanguage` type
- `TranslationStatus` type
- Re-export from `/src/types/index.ts`

### Task 2: Create API Route Handler (2-3 hours)

**File:** `/src/app/api/translations/status/route.ts` (NEW)

Implementation steps:

1. **Import dependencies:**
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { validateAdminAuth } from '@/lib/auth-server';
   import type { TranslationStatusResponse, TranslationStatusItem } from '@/types';
   ```

2. **Implement `getAccountContext()` helper** (copy pattern from `/src/app/api/admin/items/route.ts`)

3. **Implement `GET` handler:**
   - Validate authentication via `validateAdminAuth()`
   - Extract account context
   - Parse and validate query parameters
   - Build dynamic Supabase queries for each entity type
   - Aggregate results with summary counts
   - Return paginated response

4. **Query Strategy:**
   - Query each translation table separately (parallel)
   - Join with parent tables to get entity names
   - Filter by account ownership via property relationship
   - Aggregate into unified response

### Task 3: Database Query Functions (1-2 hours)

**Within route.ts, implement helper functions:**

```typescript
async function queryArticleTranslations(
  supabase: SupabaseClient,
  filters: TranslationFilters,
  accountId: string | null
): Promise<TranslationStatusItem[]>

async function queryItemTranslations(...)

async function queryLinkTranslations(...)

async function computeSummary(
  items: TranslationStatusItem[]
): TranslationSummary
```

### Task 4: Account Access Validation (30 min)

Implement access validation pattern:
- User must have account membership to view translations
- Filter results to only show translations for entities in accessible properties
- Admin users can optionally view all (when no account specified)

### Task 5: Error Handling (30 min)

Implement consistent error responses:

| Scenario | Status Code | Error Code |
|----------|-------------|------------|
| Missing auth | 401 | `UNAUTHORIZED` |
| No account access | 403 | `FORBIDDEN` |
| Invalid entity type | 400 | `INVALID_ENTITY_TYPE` |
| Invalid status value | 400 | `INVALID_STATUS` |
| Invalid UUID format | 400 | `INVALID_FORMAT` |
| Database error | 500 | `DB_ERROR` |

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/route.ts` | Main API endpoint handler |
| `/src/types/translations.ts` | Translation-related type definitions |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/types/index.ts` | Add `export * from './translations';` |

### Reference Files (Read Only - Do Not Modify)

| File Path | Pattern to Follow |
|-----------|-------------------|
| `/src/app/api/admin/items/route.ts` | Account context extraction, query building, response structure |
| `/src/lib/auth-server.ts` | Authentication validation pattern |
| `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | UI filtering pattern reference for future integration |

---

## Code Patterns to Follow

### Authentication Pattern (from `/src/lib/auth-server.ts`)

```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    // 2. Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;

    // ... rest of implementation
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

### Query Parameter Pattern (from items route)

```typescript
const { searchParams } = new URL(request.url);
const entityType = searchParams.get('entityType') || '';
const status = searchParams.get('status') || '';
const propertyId = searchParams.get('propertyId') || '';
const page = parseInt(searchParams.get('page') || '1');
const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

// Validate entityType if provided
const validEntityTypes = ['article', 'item', 'link'];
if (entityType && !validEntityTypes.includes(entityType)) {
  return NextResponse.json(
    { success: false, error: 'Invalid entityType', code: 'INVALID_ENTITY_TYPE' },
    { status: 400 }
  );
}
```

### Response Pattern

```typescript
const response: TranslationStatusResponse = {
  success: true,
  summary: computedSummary,
  items: translationItems,
  pagination: {
    page,
    limit,
    total: totalCount,
    hasMore: translationItems.length === limit,
  },
  accountContext: {
    accountId,
    accountRole
  }
};

return NextResponse.json(response);
```

---

## Database Schema Reference

### Expected Translation Tables (From Epic 1 Plan)

```sql
-- article_translations
CREATE TABLE article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES item_articles(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  translation_status VARCHAR(20) DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  source_version_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, language)
);

-- item_translations
CREATE TABLE item_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  translation_status VARCHAR(20) DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  source_version_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, language)
);

-- link_translations
CREATE TABLE link_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES item_links(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title VARCHAR(255),
  translation_status VARCHAR(20) DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  source_version_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(link_id, language)
);
```

---

## Query Strategy

### Entity-to-Property Chain for Access Control

```
article_translations → item_articles → items → properties → accounts
item_translations → items → properties → accounts
link_translations → item_links → items → properties → accounts
```

### Sample Query for Article Translations

```typescript
const { data: articleTranslations, error } = await supabase
  .from('article_translations')
  .select(`
    id,
    article_id,
    language,
    title,
    description,
    translation_status,
    translated_at,
    reviewed_by,
    source_version_at,
    item_articles!inner (
      id,
      title,
      source_language,
      items!inner (
        id,
        name,
        property_id,
        properties!inner (
          id,
          account_id
        )
      )
    )
  `)
  .eq('item_articles.items.properties.account_id', accountId);
```

---

## Acceptance Criteria Mapping

| Criteria | Implementation |
|----------|----------------|
| AC-1: Optional filters for entity type, entity ID, status, property ID | Query parameter parsing and conditional query building |
| AC-2: Summary counts grouped by status | `computeSummary()` function aggregating by translation_status |
| AC-3: Item-level details with entity, language, status, timestamps | `TranslationStatusItem` structure in response |
| AC-4: Only returns records for authenticated user's account | Account context filtering via property chain |
| AC-5: Unauthorized users receive appropriate error | 401/403 responses with error codes |
| AC-6: Performance acceptable for large result sets | Pagination with page/limit, indexed queries |

---

## Testing Considerations

### Unit Test Scenarios

1. **Authentication tests:**
   - Missing authorization → 401
   - Invalid token → 401
   - Non-admin user without account access → 403

2. **Query parameter validation:**
   - Invalid entityType → 400
   - Invalid status value → 400
   - Invalid UUID format → 400

3. **Response structure:**
   - Empty results return correct summary (all zeros)
   - Single entity type filter works
   - Multiple filters combine correctly
   - Pagination works correctly

4. **Access control:**
   - User only sees translations for their account's properties
   - Admin sees all when no account specified
   - Admin sees filtered when account specified

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation tables not created | HIGH | BLOCKS | Wait for Epic 1 completion or create stub |
| Complex join performance | Medium | Medium | Add indexes, consider denormalization for hot path |
| Missing source_language column | HIGH | Medium | Handle null gracefully, default to 'en' |

---

## Related Documents

- PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request: `/docs/gen_requests_epic5.md` (Request #304)
- Epic 1 Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` (prerequisite)

---

## Notes

1. **BLOCKER:** This endpoint cannot be fully implemented until Epic 1 translation tables are created. The implementation can be started with stub data or mock responses for testing the API structure.

2. The endpoint follows existing patterns from `/src/app/api/admin/items/route.ts` for authentication, account context, and response structure.

3. Future enhancements could include:
   - Caching for frequently accessed status queries
   - Realtime subscription support via Supabase Realtime
   - Batch status updates for bulk operations

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
