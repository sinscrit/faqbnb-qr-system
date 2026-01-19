# REQ-337: Create Update Translation API Endpoint - Implementation Overview

**Last Modified:** 2026-01-19 12:00:00 UTC
**Request ID:** REQ-337
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 1 - API Endpoints
**Task ID:** 1.2
**Epic:** L10N Epic 5 - Owner Translation Management
**Priority:** P2 - Medium
**Depends On:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## Summary

Create a secure API endpoint that allows property owners to manually update translation content for entities they own (articles, items, links). The endpoint should validate ownership, persist the updated translation, mark the translation status as 'manual', and record the reviewer's identity.

---

## Requirements Reference

### From REQ-337 (gen_requests_epic5.md)

**Summary:** Property owners should be able to update translation content for entities they own through a secure API endpoint that marks translations as manually reviewed.

**Expected Behavior:**
- Endpoint accepts requests containing entity type, entity identifier, language code, and updated translation content
- System verifies authenticated user has ownership rights to the specified entity
- When authorization is confirmed, endpoint persists updated translation content
- Automatically sets translation status to 'manual'
- Records authenticated user's identifier as the reviewer
- Returns complete updated translation record upon successful save
- Rejects unauthorized requests with authorization error
- Returns validation errors for missing or malformed required fields

**Acceptance Criteria:**
- [ ] Endpoint accepts PUT requests with entity type, entity ID, language code, and translation content
- [ ] Endpoint validates the authenticated user owns the specified entity before processing
- [ ] Endpoint rejects unauthorized requests with appropriate authorization error
- [ ] Endpoint validates all required fields are present and properly formatted
- [ ] Endpoint returns validation error when required fields are missing or malformed
- [ ] Endpoint updates the translation content in the database when validation passes
- [ ] Endpoint sets translation status to indicate manual curation
- [ ] Endpoint records the authenticated user's identifier as the reviewer
- [ ] Endpoint returns the complete updated translation record upon success
- [ ] Endpoint handles requests for non-existent entities with appropriate error response
- [ ] Endpoint handles requests for non-existent translations by creating new translation records
- [ ] Response format is consistent with other API endpoints in the system
- [ ] Endpoint enforces proper request authentication and session validation

### From Implementation Plan (Plan-111-L10N-Epic5)

**Task 1.2:** Create update translation API endpoint
- File: `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
- PUT to update translation content
- Set status to 'manual', record reviewedBy
- Validate user has access to entity

---

## Technical Context

### Existing Patterns

The codebase follows established patterns for API routes:

| Pattern | Reference Location | Relevance |
|---------|-------------------|-----------|
| **Auth Validation** | `/src/app/api/admin/articles/[articleId]/route.ts` | Uses `validateAdminAuth()` helper |
| **Account Context** | `/src/app/api/admin/items/[publicId]/route.ts` | `getAccountContext()` pattern |
| **Entity Validation** | `/src/app/api/admin/articles/[articleId]/route.ts` | `validateArticleAccess()` pattern |
| **Response Format** | All admin API routes | `{ success: boolean, data?: any, error?: string }` |
| **Translation Testing** | `/src/app/api/admin/translate/route.ts` | Translation type definitions |

### Database Schema (from Epic 1)

**Translation Tables:**
- `article_translations` - Stores translated article content (title, description)
- `item_translations` - Stores translated item content (name, description)
- `link_translations` - Stores translated link content (title)

**Common Columns:**
| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `[entity]_id` | UUID | Foreign key to parent entity |
| `language` | VARCHAR | Language code (en, fr, es, de, nl, it) |
| `translation_status` | VARCHAR | Status: pending, processing, completed, failed, manual |
| `translated_at` | TIMESTAMPTZ | When translation was last updated |
| `reviewed_by` | UUID (article only) | User who reviewed/edited |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Entity-specific content columns:**
- `article_translations`: `title`, `description`
- `item_translations`: `name`, `description`
- `link_translations`: `title`

### Supported Languages

```typescript
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

### Entity Types

```typescript
type TranslatableEntityType = 'article' | 'item' | 'link';
```

---

## Architecture

### API Route Structure

```
/src/app/api/translations/
└── [entityType]/
    └── [entityId]/
        └── [language]/
            └── route.ts    <-- This endpoint
```

### Request Flow

```
Client PUT Request
    │
    ├── Validate Authentication (validateAdminAuth)
    │
    ├── Extract & Validate Route Parameters
    │   ├── entityType: 'article' | 'item' | 'link'
    │   ├── entityId: UUID
    │   └── language: SupportedLanguage
    │
    ├── Parse & Validate Request Body
    │   └── Translation content fields
    │
    ├── Validate Entity Ownership
    │   ├── Fetch entity with property join
    │   ├── Check account_id matches user's account
    │   └── Return 403 if unauthorized
    │
    ├── Upsert Translation Record
    │   ├── Check if translation exists
    │   ├── UPDATE if exists, INSERT if new
    │   ├── Set translation_status = 'manual'
    │   └── Set reviewed_by = user.id
    │
    └── Return Updated Translation
        └── { success: true, data: { translation: {...} } }
```

### Integration Contract

```typescript
// PUT /api/translations/[entityType]/[entityId]/[language]

// Route Parameters
interface RouteParams {
  entityType: 'article' | 'item' | 'link';
  entityId: string;  // UUID
  language: 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
}

// Request Body
interface UpdateTranslationRequest {
  // For articles:
  title?: string;
  description?: string;

  // For items:
  name?: string;
  description?: string;

  // For links:
  title?: string;
}

// Response (Success)
interface UpdateTranslationResponse {
  success: true;
  data: {
    translation: {
      id: string;
      entityType: string;
      entityId: string;
      language: string;
      content: {
        title?: string;
        name?: string;
        description?: string;
      };
      status: 'manual';
      reviewedBy: string;
      translatedAt: string;
      updatedAt: string;
    };
  };
  accountContext?: {
    accountId: string;
    accountRole: string;
  };
}

// Response (Error)
interface ErrorResponse {
  success: false;
  error: string;
  code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_REQUEST' | 'VALIDATION_ERROR' | 'SERVER_ERROR';
}
```

---

## Implementation Tasks

### Task 1: Create API Route File Structure
**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

Create the nested dynamic route directory structure to match the API design pattern.

### Task 2: Implement Authentication & Authorization

```typescript
// Use existing validateAdminAuth pattern
const authResult = await validateAdminAuth(request);
if (authResult.error) {
  return authResult.error;
}

// Extract account context
const accountContext = await getAccountContext(request, user.id, isAdmin, supabase);
if (accountContext.error) {
  return accountContext.error;
}
```

### Task 3: Implement Route Parameter Validation

```typescript
const VALID_ENTITY_TYPES = ['article', 'item', 'link'];
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'];

// Validate entityType
if (!VALID_ENTITY_TYPES.includes(entityType)) {
  return NextResponse.json(
    { success: false, error: 'Invalid entity type', code: 'VALIDATION_ERROR' },
    { status: 400 }
  );
}

// Validate entityId (UUID format)
const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
if (!uuidRegex.test(entityId)) {
  return NextResponse.json(
    { success: false, error: 'Invalid entity ID format', code: 'VALIDATION_ERROR' },
    { status: 400 }
  );
}

// Validate language
if (!SUPPORTED_LANGUAGES.includes(language)) {
  return NextResponse.json(
    { success: false, error: 'Unsupported language code', code: 'VALIDATION_ERROR' },
    { status: 400 }
  );
}
```

### Task 4: Implement Entity Ownership Validation

For each entity type, validate the user owns the entity via property → account chain:

**Article:**
```typescript
async function validateArticleOwnership(articleId: string, accountId: string, supabase: any) {
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
    .eq('id', articleId)
    .single();

  if (error || !article) {
    return { found: false };
  }

  const propertyAccountId = (article as any).items.properties.account_id;
  return {
    found: true,
    authorized: propertyAccountId === accountId,
    entity: article
  };
}
```

**Item:**
```typescript
async function validateItemOwnership(itemId: string, accountId: string, supabase: any) {
  const { data: item, error } = await supabase
    .from('items')
    .select(`
      id,
      property_id,
      properties!inner(account_id)
    `)
    .eq('id', itemId)
    .single();

  if (error || !item) {
    return { found: false };
  }

  const propertyAccountId = (item as any).properties.account_id;
  return {
    found: true,
    authorized: propertyAccountId === accountId,
    entity: item
  };
}
```

**Link:**
```typescript
async function validateLinkOwnership(linkId: string, accountId: string, supabase: any) {
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
    .eq('id', linkId)
    .single();

  if (error || !link) {
    return { found: false };
  }

  const propertyAccountId = (link as any).items.properties.account_id;
  return {
    found: true,
    authorized: propertyAccountId === accountId,
    entity: link
  };
}
```

### Task 5: Implement Request Body Validation

Validate required fields based on entity type:

```typescript
function validateTranslationBody(
  body: unknown,
  entityType: string
): { valid: boolean; error?: string; data?: any } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const data = body as Record<string, unknown>;

  switch (entityType) {
    case 'article':
      // At least title or description required
      if (!data.title && !data.description) {
        return { valid: false, error: 'At least title or description is required for article translation' };
      }
      if (data.title && typeof data.title !== 'string') {
        return { valid: false, error: 'title must be a string' };
      }
      if (data.description && typeof data.description !== 'string') {
        return { valid: false, error: 'description must be a string' };
      }
      return { valid: true, data: { title: data.title, description: data.description } };

    case 'item':
      // At least name or description required
      if (!data.name && !data.description) {
        return { valid: false, error: 'At least name or description is required for item translation' };
      }
      if (data.name && typeof data.name !== 'string') {
        return { valid: false, error: 'name must be a string' };
      }
      if (data.description && typeof data.description !== 'string') {
        return { valid: false, error: 'description must be a string' };
      }
      return { valid: true, data: { name: data.name, description: data.description } };

    case 'link':
      // title is required
      if (!data.title) {
        return { valid: false, error: 'title is required for link translation' };
      }
      if (typeof data.title !== 'string') {
        return { valid: false, error: 'title must be a string' };
      }
      return { valid: true, data: { title: data.title } };

    default:
      return { valid: false, error: 'Invalid entity type' };
  }
}
```

### Task 6: Implement Translation Upsert Logic

Handle both update (existing translation) and insert (new translation) cases:

```typescript
async function upsertTranslation(
  entityType: string,
  entityId: string,
  language: string,
  content: Record<string, string | undefined>,
  userId: string,
  supabase: any
) {
  const tableName = `${entityType}_translations`;
  const foreignKeyColumn = `${entityType}_id`;
  const now = new Date().toISOString();

  // Check if translation exists
  const { data: existing, error: selectError } = await supabase
    .from(tableName)
    .select('id')
    .eq(foreignKeyColumn, entityId)
    .eq('language', language)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    // PGRST116 = "not found", which is expected for new translations
    throw new Error(`Failed to check existing translation: ${selectError.message}`);
  }

  const translationData = {
    ...content,
    translation_status: 'manual',
    translated_at: now,
    updated_at: now,
    ...(entityType === 'article' ? { reviewed_by: userId } : {}),
  };

  let result;

  if (existing) {
    // Update existing translation
    const { data, error } = await supabase
      .from(tableName)
      .update(translationData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update translation: ${error.message}`);
    }
    result = data;
  } else {
    // Insert new translation
    const insertData = {
      [foreignKeyColumn]: entityId,
      language,
      ...translationData,
      created_at: now,
    };

    const { data, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create translation: ${error.message}`);
    }
    result = data;
  }

  return result;
}
```

### Task 7: Implement Response Formatting

```typescript
function formatTranslationResponse(
  entityType: string,
  entityId: string,
  translation: any,
  accountContext: { accountId: string | null; accountRole: string }
) {
  return {
    success: true,
    data: {
      translation: {
        id: translation.id,
        entityType,
        entityId,
        language: translation.language,
        content: {
          ...(translation.title && { title: translation.title }),
          ...(translation.name && { name: translation.name }),
          ...(translation.description && { description: translation.description }),
        },
        status: translation.translation_status,
        reviewedBy: translation.reviewed_by || null,
        translatedAt: translation.translated_at,
        updatedAt: translation.updated_at,
      },
    },
    accountContext,
  };
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Main API endpoint |

### Files to Reference (Read-Only)

| File Path | Pattern to Follow |
|-----------|-------------------|
| `/src/app/api/admin/articles/[articleId]/route.ts` | Auth validation, account context, article ownership validation |
| `/src/app/api/admin/items/[publicId]/route.ts` | Item ownership validation pattern |
| `/src/app/api/admin/translate/route.ts` | Translation type definitions, validation patterns |
| `/src/lib/auth-server.ts` | `validateAdminAuth` function |
| `/src/lib/supabase.ts` | Database types for translations |

### Database Tables (Read/Write)

| Table | Operations |
|-------|------------|
| `article_translations` | SELECT, INSERT, UPDATE |
| `item_translations` | SELECT, INSERT, UPDATE |
| `link_translations` | SELECT, INSERT, UPDATE |
| `item_articles` | SELECT (for ownership validation) |
| `items` | SELECT (for ownership validation) |
| `item_links` | SELECT (for ownership validation) |
| `properties` | SELECT (for account_id check) |

---

## Error Handling

| Scenario | Status Code | Error Code | Message |
|----------|-------------|------------|---------|
| Not authenticated | 401 | UNAUTHORIZED | Invalid or expired token |
| User not found | 403 | FORBIDDEN | User not found in system |
| No account access | 403 | FORBIDDEN | No account access found for user |
| Invalid entity type | 400 | VALIDATION_ERROR | Invalid entity type. Must be: article, item, link |
| Invalid entity ID | 400 | VALIDATION_ERROR | Invalid entity ID format |
| Invalid language | 400 | VALIDATION_ERROR | Unsupported language code |
| Entity not found | 404 | NOT_FOUND | {entityType} not found |
| Access denied | 403 | FORBIDDEN | Access denied to {entityType} |
| Missing required fields | 400 | VALIDATION_ERROR | {field} is required for {entityType} translation |
| Invalid field type | 400 | VALIDATION_ERROR | {field} must be a string |
| Database error | 500 | SERVER_ERROR | Failed to update translation |

---

## Testing Considerations

### Unit Tests
- Route parameter validation (entity type, entity ID format, language code)
- Request body validation for each entity type
- Ownership validation helper functions
- Response formatting

### Integration Tests
- Successful update of existing article translation
- Successful insert of new item translation
- Successful update of link translation
- Unauthorized access rejection (different account)
- Non-existent entity handling
- Invalid language code rejection
- Missing required fields rejection

### Manual Testing Scenarios
1. As property owner, update translation for own article
2. As property owner, create new translation for item without existing translation
3. Attempt to update translation for entity owned by different account (should fail)
4. Update translation with empty body (should fail validation)
5. Verify `reviewed_by` is correctly recorded for article translations
6. Verify `translation_status` is set to 'manual'

---

## Dependencies

### Required from Epic 1 (Foundation)
- [x] Translation tables created (`article_translations`, `item_translations`, `link_translations`)
- [x] `translation_status` column with valid values including 'manual'
- [x] `reviewed_by` column on `article_translations` table

### Required from Epic 3 (Dynamic Content Translation)
- [ ] Translation service module (for consistency, though not directly used by this endpoint)

### Existing Dependencies
- [x] `/src/lib/auth-server.ts` - `validateAdminAuth` function
- [x] Account-based access control pattern in existing API routes

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Concurrent updates overwriting data | Low | Medium | Database timestamps track last update; consider optimistic locking in future |
| Performance with large translations | Low | Low | Single record updates are efficient |
| RLS policy blocking updates | Medium | High | Verify RLS policies allow updates for authenticated users to their own translations |
| Missing reviewed_by on items/links | Low | Low | Only article_translations has reviewed_by; document this distinction |

---

## References

- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Epic 1 Foundation:** `/docs/prd/PRD_L10N_Epic1_Foundation.md`
- **Request Definition:** `/docs/gen_requests_epic5.md` (REQ-337)

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
