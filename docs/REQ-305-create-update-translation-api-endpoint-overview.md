# REQ-305: Create Update Translation API Endpoint - Implementation Overview

**Last Modified:** 2026-01-18
**Request ID:** REQ-305
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 1 - API Endpoints
**Task ID:** 1.2
**Implementation Plan Reference:** `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Summary

Create an API endpoint that allows property owners to manually update translation content for their entities (articles, items, links). When a manual update is received, the system records the translation as manually reviewed, captures who performed the review, sets the status to 'manual', and validates the user has appropriate access before persisting changes.

---

## Current Behavior

No endpoint exists for owners to manually provide or edit translations. Translations can only be created through automated translation services, leaving owners unable to correct machine translations or provide their own preferred translations.

---

## Expected Behavior

- Authenticated users can submit updated translation content for entities they own
- System validates user has access to the entity before allowing updates
- Translation status is set to 'manual' to indicate human curation
- The authenticated user is recorded as the reviewer
- Updated translation record is returned upon success
- Appropriate error responses for authorization failures, validation errors, and non-existent entities

---

## Dependencies

### Epic 1 (Foundation) Prerequisites

| Dependency | Status | Notes |
|------------|--------|-------|
| `article_translations` table | **Required** | Must be created via migration |
| `item_translations` table | **Required** | Must be created via migration |
| `link_translations` table | **Required** | Must be created via migration |
| Translation status enum | **Required** | Values: 'pending', 'processing', 'completed', 'failed', 'manual' |
| `reviewed_by` column | **Required** | UUID reference to user who manually edited |
| `translation_status` column | **Required** | Status indicator on translation tables |

**Note:** Translation tables do not currently exist in the database. This implementation depends on Epic 1 migrations being completed first. The implementation should be designed to work with the expected schema.

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| Auth validation | `src/lib/auth-server.ts` | `validateAdminAuth()` function |
| Account context | `src/app/api/admin/articles/[articleId]/route.ts` | `getAccountContext()` helper |
| Entity access validation | `src/app/api/admin/articles/[articleId]/route.ts` | `validateArticleAccess()` pattern |
| Supabase server client | `src/lib/supabase-server.ts` | `createSupabaseServer()` |
| Dynamic route params | Next.js 15 | `params: Promise<{ ... }>` pattern |

---

## Technical Approach

### API Route Structure

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Method:** `PUT`

**URL Pattern:** `PUT /api/translations/{entityType}/{entityId}/{language}`

**Path Parameters:**
- `entityType`: One of `'article'`, `'item'`, `'link'`
- `entityId`: UUID of the entity
- `language`: ISO language code (e.g., `'fr'`, `'es'`, `'de'`, `'nl'`, `'it'`)

### Request Body Schema

```typescript
interface UpdateTranslationRequest {
  /** Translated title (for articles/links) */
  title?: string;
  /** Translated description (for articles/items) */
  description?: string;
  /** Translated name (for items) */
  name?: string;
}
```

### Response Schema

**Success (200):**
```typescript
interface UpdateTranslationResponse {
  success: true;
  translation: {
    entityType: 'article' | 'item' | 'link';
    entityId: string;
    language: SupportedLanguage;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
    content: {
      title?: string;
      description?: string;
      name?: string;
    };
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid entity type, language code, or missing required fields
- `401 Unauthorized`: Invalid or expired authentication
- `403 Forbidden`: User lacks access to the entity
- `404 Not Found`: Entity or translation record not found
- `500 Internal Server Error`: Database or server errors

### Implementation Flow

```
1. Validate authentication (validateAdminAuth)
   │
2. Extract and validate path parameters
   │  - entityType: must be 'article', 'item', or 'link'
   │  - entityId: must be valid UUID
   │  - language: must be supported language code
   │
3. Get account context (getAccountContext)
   │
4. Validate entity exists and user has access
   │  - Query entity table with account filtering
   │  - Check property ownership chain (entity → property → account)
   │
5. Parse and validate request body
   │  - At least one translation field must be provided
   │
6. Upsert translation record
   │  - Update if exists, insert if not
   │  - Set status = 'manual'
   │  - Set reviewed_by = user.id
   │  - Set translated_at = now()
   │
7. Return updated translation record
```

### Entity Access Validation Logic

Each entity type requires different access validation:

**Article:**
```sql
SELECT ia.id, i.property_id, p.account_id, p.user_id
FROM item_articles ia
JOIN items i ON i.id = ia.item_id
JOIN properties p ON p.id = i.property_id
WHERE ia.id = :entityId
```

**Item:**
```sql
SELECT i.id, i.property_id, p.account_id, p.user_id
FROM items i
JOIN properties p ON p.id = i.property_id
WHERE i.id = :entityId
```

**Link:**
```sql
SELECT il.id, i.property_id, p.account_id, p.user_id
FROM item_links il
JOIN items i ON i.id = il.item_id
JOIN properties p ON p.id = i.property_id
WHERE il.id = :entityId
```

### Translation Table Mapping

| Entity Type | Translation Table | Key Columns |
|-------------|------------------|-------------|
| `article` | `article_translations` | `article_id`, `language` |
| `item` | `item_translations` | `item_id`, `language` |
| `link` | `link_translations` | `link_id`, `language` |

### Supported Languages

Based on Epic configuration:
- `en` - English (source, typically not translated)
- `fr` - French
- `es` - Spanish
- `de` - German
- `nl` - Dutch
- `it` - Italian

---

## Ordered Implementation Tasks

### Task 1: Create route file structure
- Create directory structure: `/src/app/api/translations/[entityType]/[entityId]/[language]/`
- Create `route.ts` file with basic exports

### Task 2: Implement path parameter validation
- Extract `entityType`, `entityId`, `language` from params
- Validate `entityType` is one of: 'article', 'item', 'link'
- Validate `entityId` is valid UUID format
- Validate `language` is supported language code

### Task 3: Implement authentication and authorization
- Call `validateAdminAuth()` for session validation
- Call `getAccountContext()` for account scoping
- Implement entity access validation helper function

### Task 4: Implement entity access validation
- Create `validateEntityAccess()` helper function
- Support all three entity types with appropriate joins
- Verify account ownership chain

### Task 5: Implement request body validation
- Parse JSON body
- Validate at least one translation field is provided
- Sanitize input values

### Task 6: Implement translation upsert logic
- Map entity type to translation table
- Use Supabase upsert with `onConflict` for idempotency
- Set `translation_status = 'manual'`
- Set `reviewed_by = user.id`
- Set `translated_at = new Date().toISOString()`

### Task 7: Build and return response
- Format success response with updated translation
- Handle and format error cases

### Task 8: Add TypeScript types
- Add request/response types to appropriate location
- Export types for consumer use

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Main API route handler |

### Files to Modify (if needed)

| File Path | Modification |
|-----------|--------------|
| `/src/types/index.ts` | Add translation-related type exports (optional, if types grow large) |
| `/src/lib/supabase.ts` | Add translation table types to Database type (after Epic 1 migration) |

### Functions to Implement

| Function | Location | Purpose |
|----------|----------|---------|
| `PUT` handler | route.ts | Main request handler |
| `validateEntityAccess` | route.ts (helper) | Verify user can access entity |
| `getTranslationTable` | route.ts (helper) | Map entity type to table name |
| `upsertTranslation` | route.ts (inline) | Insert or update translation record |

### Functions to Reuse

| Function | Source | Purpose |
|----------|--------|---------|
| `validateAdminAuth` | `@/lib/auth-server` | Authenticate user session |
| `getAccountContext` | Copy pattern from articles route | Extract account context |
| `createSupabaseServer` | `@/lib/supabase-server` | Create server-side Supabase client |

---

## Validation Rules

### Path Parameters

| Parameter | Validation | Error Code |
|-----------|------------|------------|
| `entityType` | Must be 'article', 'item', or 'link' | 400 INVALID_ENTITY_TYPE |
| `entityId` | Must be valid UUID | 400 INVALID_ENTITY_ID |
| `language` | Must be supported language code | 400 INVALID_LANGUAGE |

### Request Body

| Field | Validation | Notes |
|-------|------------|-------|
| `title` | Optional string, max 500 chars | For articles/links |
| `description` | Optional string, max 5000 chars | For articles/items |
| `name` | Optional string, max 200 chars | For items only |
| (general) | At least one field must be provided | 400 if all empty |

---

## Error Handling

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Invalid entity type | 400 | INVALID_ENTITY_TYPE | "Entity type must be 'article', 'item', or 'link'" |
| Invalid UUID format | 400 | INVALID_ENTITY_ID | "Invalid entity ID format" |
| Invalid language | 400 | INVALID_LANGUAGE | "Language code not supported" |
| No content provided | 400 | NO_CONTENT | "At least one translation field must be provided" |
| Not authenticated | 401 | UNAUTHORIZED | "Invalid or expired token" |
| Entity not found | 404 | NOT_FOUND | "Entity not found" |
| No access to entity | 403 | FORBIDDEN | "Access denied to entity" |
| Translation table missing | 500 | TABLE_NOT_FOUND | "Translation table not configured" |
| Database error | 500 | DATABASE_ERROR | "Failed to update translation" |

---

## Testing Considerations

### Unit Test Cases

1. **Valid update** - Update article translation with valid data
2. **Partial update** - Update only title field
3. **Invalid entity type** - Reject invalid entityType parameter
4. **Invalid UUID** - Reject malformed entityId
5. **Invalid language** - Reject unsupported language code
6. **Empty body** - Reject request with no content
7. **Unauthorized** - Reject without valid session
8. **Forbidden** - Reject when user doesn't own entity
9. **Not found** - Handle non-existent entity

### Integration Test Scenarios

1. Create translation for entity that has no existing translation (insert path)
2. Update existing translation (update path)
3. Verify `reviewed_by` is set to current user
4. Verify `translation_status` is set to 'manual'
5. Verify access control across different account boundaries

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Endpoint accepts entity type, entity ID, language code, and translation content | Path params + request body |
| Only processes requests from users who own the specified entity | `validateEntityAccess()` helper |
| Updates the translation status to reflect manual curation | Set `translation_status = 'manual'` |
| Records the authenticated user as the reviewer | Set `reviewed_by = user.id` |
| Returns the updated translation record upon success | Response includes full translation data |
| Returns authorization error when user lacks access | 403 FORBIDDEN response |
| Returns validation error when required fields are missing | 400 with specific error codes |
| Handles non-existent entities gracefully | 404 NOT_FOUND response |

---

## Related Documentation

- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Epic 5 PRD:** `docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Epic 1 Foundation:** `docs/prd/PRD_L10N_Epic1_Foundation.md` (translation table schema)
- **Similar Pattern:** `src/app/api/admin/articles/[articleId]/route.ts`

---

## Notes

1. **Epic 1 Dependency:** This endpoint requires translation tables from Epic 1 to be created. Implementation should proceed with expected schema, but actual deployment must wait for migrations.

2. **Upsert Strategy:** Use Supabase's `upsert` with `onConflict: ['entity_id', 'language']` to handle both insert and update cases cleanly.

3. **Audit Trail:** The `reviewed_by` and `translated_at` fields provide basic audit capability. Future enhancement could add `translation_edit_history` table per Plan notes.

4. **Content Validation:** Consider adding language-specific validation (e.g., character set validation) in future iterations.

5. **Rate Limiting:** Consider adding rate limiting for translation updates to prevent abuse (future enhancement).
