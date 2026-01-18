# Implementation Breakdown: REQ-304 - Create Update Translation API Endpoint

**Generated:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Reference:** docs/gen_requests_epic5.md - Request #304
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.2
**Size:** M (Medium)

---

## Summary

Create a PUT API endpoint that allows property owners to update existing translations for their content. The endpoint validates ownership, accepts revised translation text, sets the status to 'manual', and records the reviewer. This enables owners to correct or improve automatically generated translations.

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Usage for This Task |
|---------|----------|---------------------|
| API Route Structure | `/src/app/api/admin/articles/[articleId]/route.ts` | Dynamic route parameter handling |
| Authentication | `/src/lib/auth-server.ts` → `validateAdminAuth()` | Session validation |
| Account Context | `/src/app/api/admin/articles/route.ts:15-71` | Account-based access control |
| Entity Access Validation | `/src/app/api/admin/articles/[articleId]/route.ts:74-119` | Nested entity ownership check |
| Response Format | `/src/types/index.ts` | Standard `{ success, data, error }` pattern |

### Translation Tables (from Epic 1)

```sql
-- article_translations
CREATE TABLE article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES item_articles(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),
  translated_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, language)
);

-- item_translations
CREATE TABLE item_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, language)
);

-- link_translations
CREATE TABLE link_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES item_links(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  title VARCHAR(255) NOT NULL,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(link_id, language)
);
```

### Supported Languages

```typescript
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
```

### Translation Status Values

```typescript
const TRANSLATION_STATUS = ['pending', 'processing', 'completed', 'failed', 'manual'] as const;
type TranslationStatus = typeof TRANSLATION_STATUS[number];
```

---

## Requirements Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Accept PUT requests with entity type, entity ID, language code, and translation content | Route: `/api/translations/[entityType]/[entityId]/[language]/route.ts` with PUT handler |
| Verify requesting user has ownership/management rights | Use existing account context + entity access validation pattern |
| Successfully updated translations have status changed to 'manual' | Set `translation_status = 'manual'` in update query |
| Record user ID of who reviewed/updated | Set `reviewed_by = user.id` in update query |
| Unauthorized attempts return appropriate errors | Return 403 Forbidden using standard error pattern |
| Updated translations immediately available | Use Supabase `.update()` - changes apply immediately |
| Validate language code is supported | Check against `SUPPORTED_LANGUAGES` array |
| Validate entity type and ID exist | Query entity table before update |

---

## Implementation Tasks

### Task 1: Create API Route File Structure

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

Create the nested dynamic route structure to handle PUT requests for translation updates.

### Task 2: Implement Entity Type Validation

Validate `entityType` parameter against supported types:
- `article` → `article_translations` table
- `item` → `item_translations` table
- `link` → `link_translations` table

### Task 3: Implement Language Code Validation

Validate `language` parameter against: `['en', 'fr', 'es', 'de', 'nl', 'it']`

### Task 4: Implement Entity Access Validation

For each entity type, validate user has access via the ownership chain:

**Article Access Chain:**
```
user → account_users → account → property → item → item_articles
```

**Item Access Chain:**
```
user → account_users → account → property → items
```

**Link Access Chain:**
```
user → account_users → account → property → item → item_links
```

### Task 5: Implement Translation Update Logic

- Check if translation record exists for entity+language combination
- If exists: UPDATE with new content, set status='manual', set reviewed_by
- If not exists: INSERT new translation with status='manual'
- Always set `updated_at = NOW()` and `translated_at = NOW()`

### Task 6: Implement Request Body Validation

**For articles:**
```typescript
interface UpdateArticleTranslationRequest {
  title: string;          // Required
  description?: string;   // Optional
}
```

**For items:**
```typescript
interface UpdateItemTranslationRequest {
  name: string;           // Required
  description?: string;   // Optional
}
```

**For links:**
```typescript
interface UpdateLinkTranslationRequest {
  title: string;          // Required
}
```

### Task 7: Implement Response Formatting

```typescript
interface UpdateTranslationResponse {
  success: boolean;
  translation?: {
    id: string;
    language: SupportedLanguage;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
  error?: string;
}
```

---

## Ordered Implementation Steps

1. Create folder structure: `/src/app/api/translations/[entityType]/[entityId]/[language]/`
2. Create `route.ts` with PUT handler skeleton
3. Import and use `validateAdminAuth` from `/src/lib/auth-server`
4. Implement `getAccountContext` helper (copy from articles route pattern)
5. Create `validateEntityAccess` helper for each entity type
6. Implement language validation
7. Implement request body validation per entity type
8. Implement translation upsert logic
9. Implement response formatting
10. Add error handling and logging

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Main API route handler |

### Files to Reference (Read Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/app/api/admin/articles/route.ts` | Account context pattern |
| `/src/app/api/admin/articles/[articleId]/route.ts` | Entity access validation pattern |
| `/src/lib/auth-server.ts` | Authentication validation |
| `/src/types/index.ts` | Type definitions |

### Functions to Use

| Function | Source | Purpose |
|----------|--------|---------|
| `validateAdminAuth()` | `/src/lib/auth-server.ts` | Authenticate request |
| `getAccountContext()` | Local implementation (copy pattern) | Extract account context |

---

## API Contract

### Endpoint

```
PUT /api/translations/{entityType}/{entityId}/{language}
```

### Path Parameters

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| `entityType` | string | Yes | Must be `article`, `item`, or `link` |
| `entityId` | string (UUID) | Yes | Valid UUID format, must exist |
| `language` | string | Yes | Must be one of: `en`, `fr`, `es`, `de`, `nl`, `it` |

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token or Supabase session |
| `x-account-id` | Optional | Specific account context |

### Request Body (Article)

```json
{
  "title": "Comment utiliser le lave-vaisselle",
  "description": "Chargez la vaisselle sur les paniers..."
}
```

### Request Body (Item)

```json
{
  "name": "Lave-vaisselle",
  "description": "Appareil de cuisine pour nettoyer la vaisselle"
}
```

### Request Body (Link)

```json
{
  "title": "Vidéo d'instructions"
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "translation": {
    "id": "uuid-here",
    "language": "fr",
    "status": "manual",
    "reviewedBy": "user-uuid-here",
    "updatedAt": "2026-01-18T12:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_ENTITY_TYPE` | entityType must be article, item, or link |
| 400 | `INVALID_LANGUAGE` | Language code not supported |
| 400 | `INVALID_UUID` | entityId is not a valid UUID |
| 400 | `MISSING_REQUIRED_FIELD` | Required field (title/name) missing |
| 401 | `UNAUTHORIZED` | Invalid or missing authentication |
| 403 | `FORBIDDEN` | User lacks access to entity |
| 404 | `NOT_FOUND` | Entity not found |
| 500 | `INTERNAL_ERROR` | Server error during update |

---

## Data Flow

```
Client PUT Request
        │
        ▼
┌─────────────────────┐
│ Validate Auth       │ ← validateAdminAuth()
│ (401 if invalid)    │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Get Account Context │ ← getAccountContext()
│ (403 if no access)  │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Validate Parameters │ ← entityType, language, UUID format
│ (400 if invalid)    │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Validate Entity     │ ← Query entity table with ownership chain
│ Access (403/404)    │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Validate Request    │ ← Check required fields
│ Body (400)          │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Check Existing      │ ← Query translation table
│ Translation         │
└─────────────────────┘
        │
        ├── Exists ──────────────────┐
        │                            │
        ▼                            ▼
┌─────────────────────┐  ┌─────────────────────┐
│ UPDATE Translation  │  │ INSERT Translation  │
│ status='manual'     │  │ status='manual'     │
│ reviewed_by=user.id │  │ reviewed_by=user.id │
└─────────────────────┘  └─────────────────────┘
        │                            │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌─────────────────────┐
        │ Return Success      │
        │ Response (200)      │
        └─────────────────────┘
```

---

## Entity Access Validation Queries

### Article Access Validation

```typescript
const { data: article, error } = await supabase
  .from('item_articles')
  .select(`
    id,
    item_id,
    items!inner(
      id,
      property_id,
      properties!inner(account_id)
    )
  `)
  .eq('id', entityId)
  .single();

// Check: article.items.properties.account_id === accountId
```

### Item Access Validation

```typescript
const { data: item, error } = await supabase
  .from('items')
  .select(`
    id,
    property_id,
    properties!inner(account_id)
  `)
  .eq('id', entityId)
  .single();

// Check: item.properties.account_id === accountId
```

### Link Access Validation

```typescript
const { data: link, error } = await supabase
  .from('item_links')
  .select(`
    id,
    item_id,
    items!inner(
      id,
      property_id,
      properties!inner(account_id)
    )
  `)
  .eq('id', entityId)
  .single();

// Check: link.items.properties.account_id === accountId
```

---

## Dependencies

### Epic 1 Prerequisites

| Dependency | Status | Notes |
|------------|--------|-------|
| Translation tables created | Required | `article_translations`, `item_translations`, `link_translations` |
| RLS policies applied | Required | Translation tables should have appropriate RLS |
| TypeScript types generated | Recommended | Run `mcp__supabase__generate_typescript_types` |

### Runtime Dependencies

| Dependency | Source |
|------------|--------|
| `@/lib/auth-server` | Existing |
| Supabase client | Existing via auth-server |
| Next.js App Router | Existing |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Translation tables not created | Check table exists before operations; return clear error if missing |
| Invalid entity ID crashes query | Validate UUID format before querying |
| User loses manual edits | Status='manual' prevents auto-overwrite; warn in UI (Epic 5 Phase 5) |
| Concurrent updates | Use `updated_at` timestamp; last write wins (acceptable for this use case) |

---

## Testing Considerations

### Manual Testing

1. Update article translation with valid auth - expect 200
2. Update item translation with valid auth - expect 200
3. Update link translation with valid auth - expect 200
4. Update with invalid language code - expect 400
5. Update with invalid entity type - expect 400
6. Update entity user doesn't own - expect 403
7. Update non-existent entity - expect 404
8. Update without auth - expect 401
9. Insert new translation (no existing record) - expect 200 with new record
10. Verify `reviewed_by` is set correctly
11. Verify `translation_status` is 'manual'

### Query to Verify

```sql
SELECT id, article_id, language, title, translation_status, reviewed_by, updated_at
FROM article_translations
WHERE article_id = 'test-article-uuid'
  AND language = 'fr';
```

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Epic 1 Foundation: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- Articles API Pattern: `/src/app/api/admin/articles/[articleId]/route.ts`
- Auth Server: `/src/lib/auth-server.ts`
- Type Definitions: `/src/types/index.ts`
