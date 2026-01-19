# REQ-330: Create Manual Translation Override Endpoint - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request ID:** REQ-330
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.3
**Size:** M (Medium)
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`

---

## 1. Summary

Create a RESTful API endpoint that allows authorized users to manually submit or override translations for content entities. This endpoint bypasses the automatic translation system, enabling property owners with professionally translated content or domain expertise to provide human-quality translations. The endpoint stores translations with a `manual` status to distinguish them from automatic translations and maintains an audit trail by recording the reviewer's identity.

---

## 2. Current Behavior

- All translations are generated automatically through the translation service with no mechanism for manual intervention
- Property owners and administrators who have professionally translated content cannot submit those translations through the API
- Users with domain expertise in specific languages cannot correct or improve automatically generated translations
- There is no path to manual override when automatic translations are inadequate
- No distinction exists between human-reviewed translations and machine-generated translations

---

## 3. Expected Behavior

When a PUT request is made to `/api/translations/[entityType]/[entityId]/[language]`:

1. **Route Parameter Validation:**
   - Extract `entityType`, `entityId`, and `language` from URL path parameters
   - Validate `entityType` is one of: `item`, `article`, `link`, `tag`
   - Validate `language` is a supported language code (`en`, `fr`, `es`, `de`, `nl`, `it`)
   - Return 400 Bad Request for invalid parameters

2. **Entity Verification:**
   - Query the database to confirm the entity exists
   - Return 404 Not Found if entity not found

3. **Authorization Check:**
   - Verify the authenticated user has edit access to the entity
   - For items/articles/links: User must be owner or account admin
   - For tags: System tags require admin; user tags require account access
   - Return 403 Forbidden if user lacks edit access

4. **Request Body Validation:**
   - Validate request body contains required fields for the entity type:
     - For `item`: `{ name: string, description: string }`
     - For `article`: `{ title: string, description: string }`
     - For `link`: `{ title: string }`
     - For `tag`: `{ value: string }`
   - Return 400 Bad Request for missing or empty required fields

5. **Translation Storage:**
   - Perform UPSERT operation on the appropriate translation table:
     - `items_translations` for items
     - `articles_translations` for articles
     - `links_translations` for links
     - `tags_translations` for tags
   - Set `translation_status` to `'manual'`
   - Set `reviewed_by` to the current authenticated user's ID
   - Set `translated_at` and `updated_at` to current timestamp

6. **Response:**
   - Return 200 OK for successful update (existing translation)
   - Return 201 Created for successful insert (new translation)
   - Include the stored translation record details in response

---

## 4. Technical Approach

### 4.1 API Route Structure

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

```typescript
// Route Parameters:
//   entityType: 'item' | 'article' | 'link' | 'tag'
//   entityId: string (UUID)
//   language: 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'

// Request Body (varies by entity type):
interface ItemTranslationOverride {
  name: string;
  description: string;
}

interface ArticleTranslationOverride {
  title: string;
  description: string;
}

interface LinkTranslationOverride {
  title: string;
}

interface TagTranslationOverride {
  value: string;
}

// Response:
interface ManualTranslationResponse {
  success: boolean;
  data?: {
    entityId: string;
    entityType: string;
    language: string;
    translatedFields: Record<string, string>;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
  error?: string;
}
```

### 4.2 Authentication & Authorization

- Use existing `validateAdminAuth()` pattern from `/src/lib/auth-server.ts`
- After authentication, verify user has edit access to the specific entity:
  - Query entity with account relationship join
  - Verify `account_id` matches user's account context
  - For non-admin users, verify direct ownership

### 4.3 Database Operations

**Delete-then-Insert UPSERT Pattern (recommended for this codebase):**

```sql
-- Step 1: Delete existing translation (if any)
DELETE FROM item_translations
WHERE item_id = $1 AND language = $2;

-- Step 2: Insert new manual translation
INSERT INTO item_translations (
  item_id,
  language,
  name,
  description,
  translation_status,
  translated_at,
  reviewed_by,
  created_at,
  updated_at
) VALUES (
  $1, $2, $3, $4, 'manual', NOW(), $5, NOW(), NOW()
)
RETURNING *;
```

### 4.4 Entity-Specific Field Mapping

| Entity Type | Translation Table | Fields to Store |
|-------------|-------------------|-----------------|
| `item` | `item_translations` | `name`, `description` |
| `article` | `article_translations` | `title`, `description` |
| `link` | `link_translations` | `title` |
| `tag` | `tag_translations` | `translated_value` |

### 4.5 Supported Languages Reference

From implementation plan, supported languages are:
- `en` (English)
- `fr` (French)
- `es` (Spanish)
- `de` (German)
- `nl` (Dutch)
- `it` (Italian)

---

## 5. Acceptance Criteria

- [ ] A route handler file is created at `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
- [ ] The PUT handler extracts `entityType`, `entityId`, and `language` from route parameters
- [ ] The handler validates `entityType` is one of: `item`, `article`, `link`, `tag`
- [ ] Invalid `entityType` values return 400 Bad Request with descriptive error message
- [ ] The handler validates `language` is a valid supported language code
- [ ] Invalid language codes return 400 Bad Request with descriptive error message
- [ ] The handler queries the database to verify the entity exists before proceeding
- [ ] Non-existent entities return 404 Not Found with descriptive error message
- [ ] The handler verifies the authenticated user has edit access to the entity (owner or admin)
- [ ] Users without edit access receive 403 Forbidden with descriptive error message
- [ ] For item entities, the handler validates request body contains `name` and `description` fields
- [ ] For article entities, the handler validates request body contains `title` and `description` fields
- [ ] For link entities, the handler validates request body contains `title` field
- [ ] For tag entities, the handler validates request body contains `value` field
- [ ] Missing required fields return 400 Bad Request with field-specific error messages
- [ ] The handler performs UPSERT on the appropriate translation table
- [ ] The UPSERT sets the translation status to `'manual'` to distinguish from automatic translations
- [ ] The UPSERT sets the `reviewed_by` field to the current authenticated user's ID
- [ ] The UPSERT updates the `updated_at` timestamp to the current time
- [ ] The response includes the `entityId`, `language`, translated field values, `status`, `reviewedBy`, and `updatedAt` fields
- [ ] The handler returns 200 OK for successful update operations
- [ ] The handler returns 201 Created for successful insert operations when no previous translation existed
- [ ] Database operation errors return 500 Internal Server Error with generic error message
- [ ] The handler logs manual translation operations including entity details, language, and user for audit purposes
- [ ] The implementation integrates with the translation storage utilities established in REQ-263
- [ ] The endpoint prevents SQL injection and validates all input parameters before database operations
- [ ] Empty string values for required fields are rejected with 400 Bad Request

---

## 6. Implementation Tasks

### Task 1: Create API Route File Structure
**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
- Create nested directory structure for dynamic route segments
- Create the route file with TypeScript interfaces for request/response
- Add necessary imports from auth and database modules
- Define supported entity types and languages as constants

### Task 2: Implement Route Parameter Validation
- Extract `entityType`, `entityId`, `language` from `params`
- Validate `entityType` against allowed values: `['item', 'article', 'link', 'tag']`
- Validate `language` against supported languages: `['en', 'fr', 'es', 'de', 'nl', 'it']`
- Return 400 Bad Request for validation failures with descriptive messages

### Task 3: Implement Authentication & Authorization
- Call `validateAdminAuth(request)` to verify user session
- Return 401 Unauthorized for missing/invalid auth
- Implement entity access verification (see Task 4b)
- Return 403 Forbidden if user lacks edit access

### Task 4: Implement Entity Existence and Access Check
**Task 4a: Entity Existence**
- Query appropriate entity table based on `entityType`:
  - `item` -> `items` table (use `id` column)
  - `article` -> `item_articles` table (use `id` column)
  - `link` -> `item_links` table (use `id` column)
  - `tag` -> `tags` table (use `key` column)
- Return 404 Not Found if entity doesn't exist

**Task 4b: Edit Access Verification**
- For items: Query with join to `properties`, verify `properties.account_id` matches user's account
- For articles/links: Query with join to parent `items` -> `properties`, verify account access
- For tags: If system tag, require admin; if user tag, verify account access

### Task 5: Implement Request Body Validation
- Parse request body as JSON
- Based on `entityType`, validate required fields:
  - `item`: require `name` (string, non-empty), `description` (string)
  - `article`: require `title` (string, non-empty), `description` (string)
  - `link`: require `title` (string, non-empty)
  - `tag`: require `value` (string, non-empty)
- Return 400 Bad Request with field-specific error messages for missing/invalid fields

### Task 6: Implement Translation UPSERT Logic
- Determine target translation table based on `entityType`
- Check if existing translation exists (for 200 vs 201 response)
- Delete existing translation if present
- Insert new translation record with:
  - Entity ID and language as identifiers
  - Translated field values from request body
  - `translation_status` = `'manual'`
  - `reviewed_by` = current user ID
  - `translated_at` = current timestamp
  - `updated_at` = current timestamp

### Task 7: Implement Response Building
- Build success response with stored translation details
- Return 200 OK if translation was updated (existed before)
- Return 201 Created if translation was newly created
- Include all required fields in response data

### Task 8: Implement Logging & Error Handling
- Log successful manual translation operations with entity details
- Log user ID for audit trail
- Wrap database operations in try/catch
- Return 500 Internal Server Error for unexpected failures
- Log errors with context for debugging

---

## 7. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Main API route handler for manual translation override endpoint |

### Existing Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()` function for authentication |
| `/src/lib/supabase.ts` | Database types and client creation |
| `/src/lib/supabase-server.ts` | `createSupabaseServer()` for server-side client |
| `/src/app/api/admin/items/[publicId]/route.ts` | Reference pattern for entity access verification |
| `/src/app/api/admin/articles/[articleId]/route.ts` | Reference pattern for article operations |
| `/src/app/api/translations/retry/route.ts` | Reference pattern for translation API structure (REQ-329) |
| `/src/app/api/translations/status/[entityType]/[entityId]/route.ts` | Reference pattern for dynamic route with entityType/entityId (REQ-328) |

### Database Tables Accessed

| Table | Operation | Purpose |
|-------|-----------|---------|
| `items` | SELECT | Verify item entity exists, check ownership |
| `item_articles` | SELECT | Verify article entity exists, check ownership |
| `item_links` | SELECT | Verify link entity exists, check ownership |
| `tags` | SELECT | Verify tag entity exists, determine if system/user tag |
| `properties` | SELECT (via join) | Verify account ownership for access control |
| `item_translations` | DELETE, INSERT, SELECT | Store manual translation for items |
| `article_translations` | DELETE, INSERT, SELECT | Store manual translation for articles |
| `link_translations` | DELETE, INSERT, SELECT | Store manual translation for links |
| `tag_translations` | DELETE, INSERT, SELECT | Store manual translation for tags |

---

## 8. Dependencies

### Required Before Implementation

| Dependency | Source | Status |
|------------|--------|--------|
| Translation tables with `manual` status support | Epic 1 / Database migrations | Required - must exist with `translation_status` column supporting 'manual' value |
| `reviewed_by` column in translation tables | Epic 1 / Database migrations | Required - must exist to store reviewer user ID |
| `validateAdminAuth()` function | `/src/lib/auth-server.ts` | Required - existing |
| Supabase client helpers | `/src/lib/supabase.ts`, `/src/lib/supabase-server.ts` | Required - existing |
| Translation storage utilities | REQ-263 | Optional - can integrate if already implemented |

### Downstream Dependencies

| Component | Description |
|-----------|-------------|
| Translation status API (REQ-328) | Status endpoint will display manual translations with their reviewer |
| Guest translation retrieval (Epic 4) | Guests will receive manual translations when available |
| Owner translation management (Epic 5) | UI will use this endpoint for translation editing |

---

## 9. API Contract

### Request

```http
PUT /api/translations/item/550e8400-e29b-41d4-a716-446655440000/fr
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Machine à café",
  "description": "Une machine à café professionnelle avec fonction expresso."
}
```

### Response - Success (Translation Created)

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "entityId": "550e8400-e29b-41d4-a716-446655440000",
    "entityType": "item",
    "language": "fr",
    "translatedFields": {
      "name": "Machine à café",
      "description": "Une machine à café professionnelle avec fonction expresso."
    },
    "status": "manual",
    "reviewedBy": "user-123-abc",
    "updatedAt": "2026-01-18T15:30:00.000Z"
  }
}
```

### Response - Success (Translation Updated)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "entityId": "550e8400-e29b-41d4-a716-446655440000",
    "entityType": "item",
    "language": "fr",
    "translatedFields": {
      "name": "Machine à café",
      "description": "Une machine à café professionnelle avec fonction expresso et moulin intégré."
    },
    "status": "manual",
    "reviewedBy": "user-123-abc",
    "updatedAt": "2026-01-18T16:45:00.000Z"
  }
}
```

### Response - Validation Error (Invalid Entity Type)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Invalid entityType. Must be one of: item, article, link, tag"
}
```

### Response - Validation Error (Invalid Language)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Invalid language code. Supported languages: en, fr, es, de, nl, it"
}
```

### Response - Validation Error (Missing Required Field)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Missing required field: name"
}
```

### Response - Validation Error (Empty Field Value)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Field 'name' cannot be empty"
}
```

### Response - Entity Not Found

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "success": false,
  "error": "Item not found"
}
```

### Response - Unauthorized

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "error": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

### Response - Forbidden

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "success": false,
  "error": "Access denied. You do not have edit access to this entity."
}
```

### Response - Server Error

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "success": false,
  "error": "Internal server error"
}
```

---

## 10. Error Handling

| Error Condition | HTTP Status | Error Message |
|-----------------|-------------|---------------|
| Invalid entityType | 400 | "Invalid entityType. Must be one of: item, article, link, tag" |
| Invalid language code | 400 | "Invalid language code. Supported languages: en, fr, es, de, nl, it" |
| Missing required field (item) | 400 | "Missing required field: {name\|description}" |
| Missing required field (article) | 400 | "Missing required field: {title\|description}" |
| Missing required field (link) | 400 | "Missing required field: title" |
| Missing required field (tag) | 400 | "Missing required field: value" |
| Empty required field | 400 | "Field '{fieldName}' cannot be empty" |
| Entity not found | 404 | "{EntityType} not found" |
| No auth token | 401 | "Invalid or expired token" |
| User not authorized | 403 | "Access denied. You do not have edit access to this entity." |
| Database error | 500 | "Internal server error" |

---

## 11. Testing Considerations

### Unit Tests

1. **Route Parameter Validation Tests**
   - Test with invalid entityType (e.g., `"user"`)
   - Test with valid entityType values
   - Test with invalid language code (e.g., `"zh"`)
   - Test with valid language codes
   - Test entityId format validation

2. **Request Body Validation Tests**
   - Test item with missing `name`
   - Test item with missing `description`
   - Test item with empty `name` value
   - Test article with missing `title`
   - Test article with missing `description`
   - Test link with missing `title`
   - Test tag with missing `value`
   - Test with valid request bodies

3. **Entity Existence Tests**
   - Test with non-existent item
   - Test with non-existent article
   - Test with non-existent link
   - Test with non-existent tag
   - Test with existing entities

4. **Authorization Tests**
   - Test with unauthenticated request
   - Test with user without access to entity
   - Test with entity owner (should succeed)
   - Test with account admin (should succeed)
   - Test system tag override with non-admin (should fail)
   - Test system tag override with admin (should succeed)

5. **UPSERT Tests**
   - Test creating new translation (returns 201)
   - Test updating existing translation (returns 200)
   - Verify `translation_status` set to `'manual'`
   - Verify `reviewed_by` set to current user ID
   - Verify `updated_at` timestamp is current

### Integration Tests

1. Create item -> manually override translation -> verify translation stored with `manual` status
2. Override existing automatic translation -> verify status changes to `manual`
3. Override same translation multiple times -> verify only latest values stored
4. Check translation status API reflects manual translation with reviewer
5. Verify different entity types (item, article, link, tag) all work correctly

---

## 12. Logging Requirements

Log the following events:

1. **Override Request Received**
   ```
   [INFO] Manual translation override requested: entityType={type}, entityId={id}, language={lang}, user={email}
   ```

2. **Entity Access Verified**
   ```
   [DEBUG] User {userId} authorized for {entityType}/{entityId} via {account|ownership}
   ```

3. **Translation Stored**
   ```
   [INFO] Manual translation stored: entityType={type}, entityId={id}, language={lang}, reviewedBy={userId}, isNew={true|false}
   ```

4. **Validation Errors**
   ```
   [WARN] Manual translation validation failed: {error}, entityType={type}, entityId={id}
   ```

5. **Database Errors**
   ```
   [ERROR] Manual translation storage failed: {error}, entityType={type}, entityId={id}, language={lang}
   ```

---

## 13. Security Considerations

1. **Authentication:** All requests must include valid auth token
2. **Authorization:**
   - Verify user has edit access to the specific entity (not just authenticated)
   - Account ownership check via `properties.account_id` join
   - System tags require elevated privileges (admin)
3. **Input Validation:**
   - Sanitize all inputs before database operations
   - Validate enum values (entityType, language)
   - Prevent SQL injection via parameterized queries (Supabase handles this)
4. **Field Length Limits:**
   - Consider enforcing max length on translated fields
   - Match database column constraints
5. **Audit Trail:**
   - Store `reviewed_by` user ID for accountability
   - Log all override operations with user identity
6. **Rate Limiting:** Consider adding rate limiting to prevent abuse (e.g., max 30 overrides per minute per user)

---

## 14. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Request Definition: `/docs/gen_requests_epic3.md` (REQ-330)
- Related: REQ-328 (Translation Status API)
- Related: REQ-329 (Retry Failed Translations)
- Related: REQ-263 (Translation Storage Utilities)
- Database Schema: `/database/migrations/20260117_l10n_foundation.sql`

---

## 15. Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-18 | Tech Lead Agent | Initial document creation |
