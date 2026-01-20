# Implementation Breakdown: REQ-E05-001 - Translation Status Query API Endpoint

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-E05-001
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 1 - API Endpoints
**Task ID:** 1.1
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## 1. Overview

### 1.1 Summary
Create a GET API endpoint at `/src/app/api/translations/status/route.ts` that allows property owners to query the translation status of their content. The endpoint will provide both summary statistics (total, pending, completed, failed counts) and detailed item-level translation status information.

### 1.2 User Impact
Property owners can integrate translation status monitoring into their workflows, dashboards will display accurate translation progress, and automated systems can trigger actions based on translation completion states.

### 1.3 Business Value
Enables owners to track multilingual content coverage and identify gaps in translated content, supporting better guest experiences across language preferences.

---

## 2. Technical Requirements

### 2.1 Functional Requirements
| ID | Requirement |
|----|-------------|
| FR-1 | GET request accepts query parameters: `entityType`, `entityId`, `status`, `propertyId` |
| FR-2 | Response includes summary counts showing total, pending, completed, and failed translations |
| FR-3 | Response includes item-level status details with entity information and translation state |
| FR-4 | System validates that requesting account has access to the specified property |
| FR-5 | Unauthorized access attempts return appropriate error responses (401/403) |
| FR-6 | Empty result sets return successfully with zero counts |
| FR-7 | Query performance remains acceptable with large datasets (response time under 2 seconds) |

### 2.2 Non-Functional Requirements
| ID | Requirement |
|----|-------------|
| NFR-1 | Follow existing API route patterns (validateAdminAuth, getAccountContext) |
| NFR-2 | TypeScript strict mode compliance |
| NFR-3 | Proper error handling with consistent error response structure |
| NFR-4 | Logging for debugging and audit purposes |

---

## 3. Dependencies

### 3.1 Epic 1 (Foundation) Dependencies
| Dependency | Location | Status |
|------------|----------|--------|
| Translation tables | `article_translations`, `item_translations`, `link_translations`, `tag_translations` | Required |
| Translation jobs table | `translation_jobs` | Required |
| Translation status types | `/src/lib/translation-service/translation-service.types.ts` | Available |
| SupportedLanguage type | `/src/lib/translation-service/translation-service.types.ts` | Available |

### 3.2 Existing Patterns to Follow
| Pattern | Location | Usage |
|---------|----------|-------|
| Auth validation | `/src/lib/auth-server.ts` → `validateAdminAuth()` | Authentication & authorization |
| Account context extraction | `/src/app/api/admin/articles/route.ts` → `getAccountContext()` | Account scoping |
| API response structure | `/src/app/api/admin/articles/route.ts` | Standard success/error response format |
| Property access validation | `/src/app/api/admin/articles/route.ts` (lines 111-129) | Check account ownership |
| Database types | `/src/lib/supabase.ts` | Translation table type definitions |

---

## 4. API Design

### 4.1 Endpoint Specification

```
GET /api/translations/status
```

### 4.2 Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | `'article' \| 'item' \| 'link'` | No | Filter by entity type |
| `entityId` | `string` (UUID) | No | Filter by specific entity |
| `status` | `'pending' \| 'processing' \| 'completed' \| 'failed' \| 'manual'` | No | Filter by translation status |
| `propertyId` | `string` (UUID) | No | Filter by property (scopes to property's content) |

### 4.3 Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Cookie` | Yes | Supabase auth session cookies |
| `x-account-id` | No | Optional account context override |

### 4.4 Response Structure

```typescript
// Success Response (200 OK)
interface TranslationStatusResponse {
  success: true;
  data: {
    summary: {
      total: number;
      complete: number;
      partial: number;
      pending: number;
      failed: number;
    };
    items: TranslationStatusItem[];
  };
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

interface TranslationStatusItem {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: {
    [K in SupportedLanguage]?: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
      isStale?: boolean;
      translatedAt?: string;
      reviewedBy?: string;
    };
  };
}

// Error Response (4xx/5xx)
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}
```

### 4.5 Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 401 | `UNAUTHORIZED` | No valid session or expired token |
| 403 | `FORBIDDEN` | User lacks access to requested property/account |
| 400 | `BAD_REQUEST` | Invalid query parameters |
| 500 | `INTERNAL_ERROR` | Server-side error |

---

## 5. Implementation Tasks

### Task 5.1: Create Route File Structure
**File:** `/src/app/api/translations/status/route.ts`

Create the base route file with imports and authentication validation following the existing pattern from `/src/app/api/admin/articles/route.ts`.

**Implementation Details:**
- Import `NextRequest`, `NextResponse` from `next/server`
- Import `validateAdminAuth` from `@/lib/auth-server`
- Import types from `@/lib/translation-service/translation-service.types.ts`
- Set up consistent logging prefix

### Task 5.2: Implement Query Parameter Parsing
Parse and validate query parameters: `entityType`, `entityId`, `status`, `propertyId`.

**Implementation Details:**
- Extract params using `new URL(request.url).searchParams`
- Validate `entityType` against allowed values: `['article', 'item', 'link']`
- Validate `status` against translation status enum: `['pending', 'processing', 'completed', 'failed', 'manual']`
- UUID validation for `entityId` and `propertyId` (use regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`)

### Task 5.3: Implement Account Context Helper
Extract and reuse `getAccountContext` pattern from admin/articles route.

**Implementation Details:**
- Check for `account_id` query param or `x-account-id` header
- Validate user's access via `account_users` table
- For admin users, allow broader access
- Return `accountId` and `accountRole` for response context

### Task 5.4: Implement Property Access Validation
Validate that the requesting user has access to the property being queried.

**Implementation Details:**
- If `propertyId` is provided, verify:
  - Property exists in `properties` table
  - Property's `account_id` matches user's account (unless admin)
- Return 403 if access denied
- If no `propertyId`, scope to user's account automatically

### Task 5.5: Implement Translation Status Query Logic
Query translation tables and aggregate status information.

**Implementation Details:**
1. Query strategy based on filters:
   - If `entityId` provided: fetch single entity's translations
   - If `propertyId` provided: fetch all entities for property
   - Otherwise: fetch all entities for user's account

2. Query each translation table:
   ```sql
   -- For items
   SELECT i.id, i.name, i.source_language, it.*
   FROM items i
   LEFT JOIN item_translations it ON i.id = it.item_id
   WHERE i.property_id IN (user's properties)

   -- For articles
   SELECT ia.id, ia.title, ia.source_language, at.*
   FROM item_articles ia
   JOIN items i ON ia.item_id = i.id
   LEFT JOIN article_translations at ON ia.id = at.article_id
   WHERE i.property_id IN (user's properties)

   -- For links
   SELECT il.id, il.title, il.source_language, lt.*
   FROM item_links il
   JOIN items i ON il.item_id = i.id
   LEFT JOIN link_translations lt ON il.id = lt.link_id
   WHERE i.property_id IN (user's properties)
   ```

3. Apply additional filters (`entityType`, `status`) to queries

### Task 5.6: Implement Summary Calculation
Calculate summary statistics from query results.

**Implementation Details:**
- **total**: Count of unique entities with at least one translation record
- **complete**: Entities where all 5 non-source languages have `completed` or `manual` status
- **partial**: Entities with some but not all translations completed
- **pending**: Entities with `pending` or `processing` translations
- **failed**: Entities with any `failed` translations

```typescript
function calculateSummary(items: TranslationStatusItem[]): Summary {
  const NON_EN_LANGUAGES = 5; // fr, es, de, nl, it

  return {
    total: items.length,
    complete: items.filter(item => {
      const translations = Object.values(item.translations);
      const completed = translations.filter(t =>
        t?.status === 'completed' || t?.status === 'manual'
      );
      return completed.length >= NON_EN_LANGUAGES;
    }).length,
    // ... calculate partial, pending, failed
  };
}
```

### Task 5.7: Implement Response Formatting
Format the query results into the API response structure.

**Implementation Details:**
- Transform database records to `TranslationStatusItem` format
- Include all languages in translations map (even if no record exists)
- Set `isStale` flag based on `source_version_at` comparison (if column exists)
- Include `translatedAt` and `reviewedBy` fields where applicable

### Task 5.8: Add Error Handling and Logging
Implement comprehensive error handling with appropriate logging.

**Implementation Details:**
- Try-catch wrapper around entire handler
- Log authentication failures at info level
- Log database errors at error level with query context
- Return consistent error response structure
- Handle edge cases: empty results, partial failures

---

## 6. Authorized Files and Functions for Modification

### 6.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/route.ts` | Main API route handler |

### 6.2 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()` function pattern |
| `/src/app/api/admin/articles/route.ts` | `getAccountContext()` helper pattern |
| `/src/lib/supabase.ts` | Database types for translation tables |
| `/src/lib/translation-service/translation-service.types.ts` | Type definitions |
| `/src/contexts/LocaleContext.tsx` | `SupportedLanguage` type reference |

### 6.3 Database Tables Referenced

| Table | Operations | Purpose |
|-------|------------|---------|
| `properties` | SELECT | Property access validation |
| `items` | SELECT | Item entity data |
| `item_articles` | SELECT | Article entity data |
| `item_links` | SELECT | Link entity data |
| `item_translations` | SELECT | Item translation status |
| `article_translations` | SELECT | Article translation status |
| `link_translations` | SELECT | Link translation status |
| `account_users` | SELECT | Account access validation |

---

## 7. Testing Considerations

### 7.1 Test Scenarios

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| TC-1 | Authenticated user queries own property | Returns translation status |
| TC-2 | Unauthenticated request | 401 Unauthorized |
| TC-3 | User queries different account's property | 403 Forbidden |
| TC-4 | Filter by entityType=item | Returns only item translations |
| TC-5 | Filter by status=failed | Returns only failed translations |
| TC-6 | Filter by specific entityId | Returns single entity status |
| TC-7 | No translations exist | Returns empty items array with zero counts |
| TC-8 | Admin user queries any property | Returns translation status |
| TC-9 | Invalid entityType parameter | 400 Bad Request |
| TC-10 | Performance with 100+ entities | Response under 2 seconds |

### 7.2 Manual Testing via curl

```bash
# Test with authentication
curl -X GET 'http://localhost:3000/api/translations/status?propertyId=<uuid>' \
  -H 'Cookie: <session-cookies>'

# Test with filters
curl -X GET 'http://localhost:3000/api/translations/status?entityType=article&status=pending' \
  -H 'Cookie: <session-cookies>'
```

---

## 8. Acceptance Criteria Checklist

- [ ] GET request accepts query parameters: entityType, entityId, status, propertyId
- [ ] Response includes summary counts showing total, pending, completed, and failed translations
- [ ] Response includes item-level status details with entity information and translation state
- [ ] System validates that requesting account has access to the specified property
- [ ] Unauthorized access attempts return appropriate error responses
- [ ] Empty result sets return successfully with zero counts
- [ ] Query performance remains acceptable with large datasets (response time under 2 seconds)

---

## 9. Implementation Notes

### 9.1 Code Style Requirements
- Follow existing patterns from `/src/app/api/admin/articles/route.ts`
- Use TypeScript strict mode
- Add JSDoc comments for exported functions
- Use consistent logging with debug prefix

### 9.2 Performance Considerations
- Use efficient JOINs rather than N+1 queries
- Consider indexing on `translation_status` columns (Epic 5 adds these indexes)
- Implement pagination for large result sets in future iterations
- Use `Promise.all` for parallel queries where possible

### 9.3 Future Enhancements (Out of Scope)
- Pagination support for large datasets
- Real-time subscription for status changes
- Caching for frequently accessed status data
- Batch status endpoint (Task 1.4 in Epic 5)

---

## 10. References

- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-E05-001)
- **Related Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **API Pattern Reference:** `/src/app/api/admin/articles/route.ts`
