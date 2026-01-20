# REQ-E05-001: Manual Translation Update API Endpoint - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Reference:** REQ-E05-002 (gen_requests_epic5.md)
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 1 - API Endpoints
**Task ID:** 1.2

---

## 1. Summary

This task implements a PUT API endpoint that allows property owners to manually update and override machine-generated translations for their content. The endpoint marks updated translations with status 'manual', records the reviewer's identity, validates ownership permissions, and persists changes to the appropriate translation table based on entity type.

**Endpoint:** `PUT /api/translations/[entityType]/[entityId]/[language]`

---

## 2. Requirements (from REQ-E05-002)

### Acceptance Criteria
- [ ] PUT request accepts entityType, entityId, and language as path parameters
- [ ] Request body contains the updated translation content fields
- [ ] System automatically sets translation status to 'manual' upon update
- [ ] System records the reviewedBy field with the authenticated user's identifier
- [ ] System validates that the requesting user has access to the specified entity
- [ ] Unauthorized access attempts return 403 Forbidden responses
- [ ] Invalid entity references return 404 Not Found responses
- [ ] Successful updates return the complete updated translation record
- [ ] Translation version history is preserved when content is updated
- [ ] Content validation ensures required fields are present and properly formatted

---

## 3. Technical Context

### 3.1 Existing Patterns to Follow

| Pattern | Source File | Usage |
|---------|-------------|-------|
| Dynamic route parameters | `/src/app/api/admin/items/[publicId]/route.ts` | Path parameter extraction with `Promise<{ param: string }>` |
| Authentication validation | `/src/lib/auth-server.ts` | `validateAdminAuth(request)` pattern |
| Account context extraction | `/src/app/api/admin/items/[publicId]/route.ts:129-203` | `getAccountContext()` helper |
| Entity access validation | `/src/app/api/admin/items/[publicId]/route.ts:205-294` | `validateItemAccess()` pattern |
| UUID validation | `/src/app/api/admin/items/[publicId]/route.ts:327-333` | Regex-based UUID format check |
| Response format | All API routes | `{ success: boolean, data?, error?, code? }` |

### 3.2 Translation Tables Schema (from Epic 1)

**article_translations:**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| article_id | UUID | FK to item_articles.id |
| language | VARCHAR(5) | en, fr, es, de, nl, it |
| title | VARCHAR(255) | Required |
| description | TEXT | Optional |
| translation_status | VARCHAR(20) | pending, processing, completed, failed, manual |
| translated_at | TIMESTAMPTZ | When translation was completed |
| reviewed_by | UUID | FK to users.id (for manual edits) |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

**item_translations:**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| item_id | UUID | FK to items.id |
| language | VARCHAR(5) | en, fr, es, de, nl, it |
| name | VARCHAR(255) | Required |
| description | TEXT | Optional |
| translation_status | VARCHAR(20) | pending, processing, completed, failed, manual |
| translated_at | TIMESTAMPTZ | When translation was completed |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

**link_translations:**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| link_id | UUID | FK to item_links.id |
| language | VARCHAR(5) | en, fr, es, de, nl, it |
| title | VARCHAR(255) | Required |
| translation_status | VARCHAR(20) | pending, processing, completed, failed, manual |
| translated_at | TIMESTAMPTZ | When translation was completed |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

### 3.3 Existing Types (from translation-service.types.ts)

```typescript
// Types to reuse
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
type TranslatableEntityType = 'article' | 'item' | 'link' | 'tag';

// Existing record types
interface ArticleTranslationRecord { ... }
interface ItemTranslationRecord { ... }
interface LinkTranslationRecord { ... }
```

### 3.4 Entity Ownership Chain

To validate user access to a translation, follow this ownership chain:

```
User → account_users → accounts → properties → items → [entity]
                                            ↘ item_articles → article_translations
                                            ↘ item_links → link_translations
                                            ↘ item_translations
```

**Validation Logic:**
1. For `item`: items.property_id → properties.account_id → account_users.user_id
2. For `article`: item_articles.item_id → items.property_id → properties.account_id → account_users.user_id
3. For `link`: item_links.item_id → items.property_id → properties.account_id → account_users.user_id

---

## 4. API Contract

### 4.1 Request

```
PUT /api/translations/{entityType}/{entityId}/{language}
```

**Path Parameters:**
| Parameter | Type | Description | Validation |
|-----------|------|-------------|------------|
| entityType | string | Type of entity: 'article', 'item', or 'link' | Must be valid TranslatableEntityType (exclude 'tag' for this endpoint) |
| entityId | UUID | ID of the source entity | Valid UUID format |
| language | string | Target language code | Must be valid SupportedLanguage |

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| Cookie | Yes | Supabase auth session cookies |
| x-account-id | No | Optional account context for multi-account users |

**Request Body:**
```typescript
interface UpdateTranslationRequest {
  // For article translations
  title?: string;       // Max 255 chars
  description?: string; // Optional

  // For item translations
  name?: string;        // Max 255 chars
  description?: string; // Optional

  // For link translations
  title?: string;       // Max 255 chars
}
```

### 4.2 Responses

**Success (200 OK):**
```typescript
interface UpdateTranslationResponse {
  success: true;
  data: {
    id: string;
    entityType: 'article' | 'item' | 'link';
    entityId: string;
    language: SupportedLanguage;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
    content: {
      title?: string;
      name?: string;
      description?: string;
    };
  };
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid entityType, language, or missing required fields |
| 400 | INVALID_FORMAT | Invalid UUID format for entityId |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | User lacks access to the entity |
| 404 | NOT_FOUND | Entity or translation record not found |
| 500 | INTERNAL_ERROR | Server error during update |

**Error Response Format:**
```typescript
{
  success: false;
  error: string;
  code: string;
}
```

---

## 5. Implementation Steps

### Step 1: Create Route Directory Structure
Create the nested dynamic route file structure:
```
/src/app/api/translations/
└── [entityType]/
    └── [entityId]/
        └── [language]/
            └── route.ts
```

### Step 2: Implement Path Parameter Validation
- Extract and validate `entityType` (must be 'article', 'item', or 'link')
- Extract and validate `entityId` (must be valid UUID)
- Extract and validate `language` (must be supported language code)

### Step 3: Implement Authentication
- Call `validateAdminAuth(request)` from `/src/lib/auth-server.ts`
- Handle authentication errors (401)
- Extract user ID for reviewedBy field

### Step 4: Implement Entity Access Validation
Create helper function `validateEntityAccess()`:
1. Query the source entity with property/account joins
2. Verify the authenticated user has access via account_users
3. Return 403 if access denied, 404 if entity not found

### Step 5: Implement Request Body Validation
- Parse JSON request body
- Validate required fields based on entityType:
  - `article`: title required
  - `item`: name required
  - `link`: title required
- Validate field lengths (max 255 for title/name)

### Step 6: Implement Translation Upsert
1. Check if translation record exists for (entityId, language)
2. If exists: UPDATE with new content
3. If not exists: INSERT new record
4. Always set:
   - `translation_status = 'manual'`
   - `reviewed_by = user.id`
   - `translated_at = now()`
   - `updated_at = now()`

### Step 7: Return Response
- Return complete updated translation record
- Include all relevant fields for UI consumption

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Main API route handler |

### 6.2 Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | Import `validateAdminAuth` function |
| `/src/lib/supabase-server.ts` | Import `createSupabaseServer` function |
| `/src/lib/translation-service/translation-service.types.ts` | Import types: `SupportedLanguage`, `TranslationStatus`, `TranslatableEntityType` |
| `/src/app/api/admin/items/[publicId]/route.ts` | Reference for patterns: getAccountContext, validateItemAccess |

### 6.3 Types to Import/Use

```typescript
// From translation-service.types.ts
import {
  SupportedLanguage,
  TranslationStatus,
  TranslatableEntityType,
  isSupportedLanguage
} from '@/lib/translation-service/translation-service.types';

// From auth-server.ts
import { validateAdminAuth } from '@/lib/auth-server';

// From supabase-server.ts
import { createSupabaseServer } from '@/lib/supabase-server';
```

---

## 7. Database Operations

### 7.1 Entity Access Validation Queries

**For Article:**
```sql
SELECT
  ia.id,
  ia.item_id,
  i.property_id,
  p.account_id,
  p.user_id
FROM item_articles ia
JOIN items i ON ia.item_id = i.id
JOIN properties p ON i.property_id = p.id
WHERE ia.id = $entityId
```

**For Item:**
```sql
SELECT
  i.id,
  i.property_id,
  p.account_id,
  p.user_id
FROM items i
JOIN properties p ON i.property_id = p.id
WHERE i.id = $entityId
```

**For Link:**
```sql
SELECT
  il.id,
  il.item_id,
  i.property_id,
  p.account_id,
  p.user_id
FROM item_links il
JOIN items i ON il.item_id = i.id
JOIN properties p ON i.property_id = p.id
WHERE il.id = $entityId
```

### 7.2 Translation Upsert Query (PostgreSQL)

Using Supabase upsert with ON CONFLICT:

```typescript
// Example for article_translations
const { data, error } = await supabase
  .from('article_translations')
  .upsert({
    article_id: entityId,
    language: language,
    title: body.title,
    description: body.description || null,
    translation_status: 'manual',
    reviewed_by: user.id,
    translated_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'article_id,language'
  })
  .select()
  .single();
```

---

## 8. Error Handling Matrix

| Scenario | HTTP Status | Error Code | Error Message |
|----------|-------------|------------|---------------|
| No auth session | 401 | UNAUTHORIZED | Invalid or expired token |
| User not in system | 403 | FORBIDDEN | User not found in system |
| Invalid entityType | 400 | VALIDATION_ERROR | Invalid entity type. Must be: article, item, link |
| Invalid UUID format | 400 | INVALID_FORMAT | Invalid entityId format |
| Invalid language code | 400 | VALIDATION_ERROR | Invalid language code. Must be: en, fr, es, de, nl, it |
| Missing required field | 400 | VALIDATION_ERROR | Missing required field: {fieldName} |
| Field too long | 400 | VALIDATION_ERROR | {fieldName} exceeds maximum length of 255 characters |
| Entity not found | 404 | NOT_FOUND | {EntityType} not found |
| No account access | 403 | FORBIDDEN | Access denied to entity |
| Database error | 500 | INTERNAL_ERROR | Failed to update translation |

---

## 9. Testing Considerations

### 9.1 Unit Test Cases

1. **Path Parameter Validation:**
   - Valid entityType values (article, item, link)
   - Invalid entityType returns 400
   - Valid UUID format accepted
   - Invalid UUID format returns 400
   - Valid language codes accepted
   - Invalid language code returns 400

2. **Authentication:**
   - Missing session returns 401
   - Invalid session returns 401
   - Valid session proceeds to authorization

3. **Authorization:**
   - Owner can update their entity's translations
   - Admin can update any entity's translations
   - Non-owner returns 403
   - Entity not found returns 404

4. **Request Body Validation:**
   - Missing required field returns 400
   - Empty required field returns 400
   - Field exceeding max length returns 400

5. **Translation Update:**
   - Creates new translation if none exists
   - Updates existing translation
   - Sets status to 'manual'
   - Records reviewedBy with user ID
   - Updates translated_at timestamp

### 9.2 Integration Test Cases

1. Full flow: authenticate → validate access → update translation → verify response
2. Concurrent update handling (optimistic locking not required per spec)
3. Response contains complete translation record

---

## 10. Dependencies

### 10.1 Epic 1 Dependencies (Must Be Complete)

| Dependency | Status | Notes |
|------------|--------|-------|
| article_translations table | ✅ Exists | Has reviewed_by column |
| item_translations table | ✅ Exists | No reviewed_by column - may need migration |
| link_translations table | ✅ Exists | No reviewed_by column - may need migration |
| Translation service types | ✅ Exists | `/src/lib/translation-service/translation-service.types.ts` |

### 10.2 Migration Consideration

**Note:** The `item_translations` and `link_translations` tables do not currently have a `reviewed_by` column. Two options:

**Option A (Recommended):** Add `reviewed_by` column to these tables via migration
```sql
ALTER TABLE item_translations ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE link_translations ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
```

**Option B:** Only track reviewedBy for article_translations (partial feature)

---

## 11. Security Considerations

1. **Input Sanitization:** All string inputs should be treated as untrusted
2. **SQL Injection:** Use parameterized queries (Supabase handles this)
3. **XSS Prevention:** Content stored as-is; sanitization at display time
4. **Authorization:** Always verify account ownership chain before update
5. **Rate Limiting:** Consider adding rate limiting for manual edits (future)

---

## 12. Performance Considerations

1. **Index Usage:** Queries use existing indexes on (entity_id, language)
2. **Single Query Update:** Use upsert to minimize round trips
3. **Response Size:** Return only essential fields, not full join data

---

## 13. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Document: `/docs/gen_requests_epic5.md` (REQ-E05-002)
- Translation Types: `/src/lib/translation-service/translation-service.types.ts`
- API Pattern Reference: `/src/app/api/admin/items/[publicId]/route.ts`
- Auth Pattern Reference: `/src/lib/auth-server.ts`

---

## 14. Estimated Effort

| Task | Estimate |
|------|----------|
| Route file creation and setup | 0.5 hours |
| Path parameter validation | 0.5 hours |
| Authentication integration | 0.5 hours |
| Entity access validation helpers | 1.5 hours |
| Request body validation | 0.5 hours |
| Translation upsert logic | 1.0 hours |
| Error handling and responses | 0.5 hours |
| Unit tests | 1.5 hours |
| **Total** | **6.5 hours** |

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
