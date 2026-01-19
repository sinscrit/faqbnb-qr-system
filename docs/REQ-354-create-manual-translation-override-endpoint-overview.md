# Implementation Breakdown: REQ-330 - Create Manual Translation Override Endpoint

**Generated:** 2026-01-19 UTC
**Last Modified:** 2026-01-19 UTC
**Request ID:** REQ-330 (Pipeline Task 4.3, referenced as REQ-354)
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.3
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## Overview

This document provides a detailed implementation breakdown for creating the manual translation override API endpoint. This endpoint allows authorized users (property owners and administrators) to manually submit or override translations for content entities, bypassing the automatic translation system when human-quality translations are preferred.

### Business Context

Property owners with domain expertise or professionally translated content need the ability to submit their own translations rather than relying solely on automated AI translations. This feature enables:

- High-quality human translations for content requiring precise language or cultural nuance
- Self-service translation corrections without contacting support
- Audit trail of who provided manual translations for quality assurance
- Distinction between manual and automatic translations for future quality metrics

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| API Route Handler Structure | `/src/app/api/admin/items/[publicId]/route.ts` | Dynamic route parameters, PUT handler structure |
| Authentication | `/src/lib/auth-server.ts` | `validateAdminAuth()` pattern |
| Account Context | `/src/app/api/admin/items/route.ts` | `getAccountContext()` helper |
| Translation Types | `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage`, `TranslationStatus`, entity types |
| Job Queue Types | `/src/lib/job-queue/translation-jobs.types.ts` | `EntityType` definition |
| Error Response Pattern | All admin API routes | Standard `{ success: false, error: string, code: string }` format |

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1: Translation tables | Required | `item_translations`, `article_translations`, `link_translations`, `tag_translations` |
| Epic 1: Translation service types | Required | `SupportedLanguage`, `TranslationStatus` types |
| Authentication infrastructure | Exists | `validateAdminAuth()` from `/src/lib/auth-server.ts` |
| Supabase client | Exists | `createSupabaseServer()` from `/src/lib/supabase-server.ts` |

---

## API Contract

### Endpoint Specification

```
PUT /api/translations/{entityType}/{entityId}/{language}
```

### Route Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | `'item' \| 'article' \| 'link' \| 'tag'` | Yes | Type of content entity |
| `entityId` | `string` (UUID) | Yes | Unique identifier of the entity |
| `language` | `SupportedLanguage` | Yes | Target language code (en, fr, es, de, nl, it) |

### Request Body (Varies by Entity Type)

**For Items:**
```typescript
{
  name: string;        // Required - translated item name
  description?: string; // Optional - translated item description
}
```

**For Articles:**
```typescript
{
  title: string;       // Required - translated article title
  description?: string; // Optional - translated article description
}
```

**For Links:**
```typescript
{
  title: string;       // Required - translated link title
}
```

**For Tags:**
```typescript
{
  value: string;       // Required - translated tag value
}
```

### Success Response (200 OK or 201 Created)

```typescript
{
  success: true;
  data: {
    entityId: string;
    language: string;
    translationStatus: 'manual';
    reviewedBy: string;    // User ID who provided the translation
    updatedAt: string;     // ISO 8601 timestamp
    // Entity-specific fields echoed back
    name?: string;         // For items
    title?: string;        // For articles/links
    description?: string;  // For items/articles
    value?: string;        // For tags
  };
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `INVALID_ENTITY_TYPE` | entityType not in supported list |
| 400 | `INVALID_LANGUAGE` | language not a supported language code |
| 400 | `VALIDATION_ERROR` | Missing required fields or empty values |
| 401 | `UNAUTHORIZED` | Invalid or expired authentication |
| 403 | `FORBIDDEN` | User doesn't have edit access to entity |
| 404 | `NOT_FOUND` | Entity doesn't exist |
| 500 | `INTERNAL_ERROR` | Database or server error |

---

## Implementation Tasks

### Task 1: Create Route File Structure

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

Create the Next.js App Router file structure with the three dynamic segments.

**Subtasks:**
1. Create directory structure: `/src/app/api/translations/[entityType]/[entityId]/[language]/`
2. Create `route.ts` file with proper exports

**Acceptance Criteria:**
- [ ] Directory structure exists at the specified path
- [ ] File exports a PUT handler function

---

### Task 2: Implement Route Parameter Validation

**Function:** Parameter extraction and validation logic

**Subtasks:**
1. Extract `entityType`, `entityId`, `language` from route params
2. Validate `entityType` is one of: `'item'`, `'article'`, `'link'`, `'tag'`
3. Validate `entityId` is a valid UUID format
4. Validate `language` is a supported language code using `isSupportedLanguage()` from translation types
5. Return appropriate 400 errors for invalid parameters

**Implementation Notes:**
```typescript
// Use existing type guard from translation-service types
import { isSupportedLanguage, SupportedLanguage } from '@/lib/translation-service/translation-service.types';

const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;
type EntityType = typeof VALID_ENTITY_TYPES[number];

function isValidEntityType(type: string): type is EntityType {
  return VALID_ENTITY_TYPES.includes(type as EntityType);
}
```

**Acceptance Criteria:**
- [ ] Invalid entityType returns 400 with `INVALID_ENTITY_TYPE` code
- [ ] Invalid language returns 400 with `INVALID_LANGUAGE` code
- [ ] Invalid entityId format returns 400 with `VALIDATION_ERROR` code

---

### Task 3: Implement Authentication and Authorization

**Function:** User authentication and entity access validation

**Subtasks:**
1. Import and call `validateAdminAuth()` from `/src/lib/auth-server.ts`
2. Implement entity ownership/access check for each entity type
3. For items: verify user owns the property containing the item, or is admin
4. For articles: verify user owns the item containing the article, or is admin
5. For links: verify user owns the item containing the link, or is admin
6. For tags: verify user has permission (admin or account member)

**Implementation Notes:**
```typescript
// Reuse the validateItemAccess pattern from items/[publicId]/route.ts
// Entity access should check:
// 1. Entity exists
// 2. User has edit permission (owner via property or admin)
```

**Acceptance Criteria:**
- [ ] Unauthenticated requests return 401
- [ ] Users without edit access receive 403
- [ ] Non-existent entities return 404
- [ ] Admins can override any translation
- [ ] Property owners can override translations for their content

---

### Task 4: Implement Request Body Validation

**Function:** Entity-type-specific field validation

**Subtasks:**
1. Parse request body as JSON
2. Validate required fields based on entityType:
   - Items: `name` required, `description` optional
   - Articles: `title` required, `description` optional
   - Links: `title` required
   - Tags: `value` required
3. Reject empty string values for required fields
4. Sanitize input (trim whitespace)

**Implementation Notes:**
```typescript
interface ItemTranslationBody {
  name: string;
  description?: string;
}

interface ArticleTranslationBody {
  title: string;
  description?: string;
}

interface LinkTranslationBody {
  title: string;
}

interface TagTranslationBody {
  value: string;
}
```

**Acceptance Criteria:**
- [ ] Missing required fields return 400 with field-specific error
- [ ] Empty string values for required fields return 400
- [ ] Invalid JSON returns 400
- [ ] Fields are trimmed of leading/trailing whitespace

---

### Task 5: Implement Translation UPSERT Logic

**Function:** Database UPSERT operation for each entity type

**Subtasks:**
1. Determine target translation table based on entityType:
   - `item` → `item_translations`
   - `article` → `article_translations`
   - `link` → `link_translations`
   - `tag` → `tag_translations`
2. Build UPSERT query with:
   - Entity reference (item_id, article_id, link_id, tag_key)
   - Language code
   - Translated fields
   - `translation_status: 'manual'`
   - `reviewed_by: userId`
   - `translated_at: now()`
   - `updated_at: now()`
3. Use Supabase's `.upsert()` method with conflict resolution on (entity_id, language)

**Implementation Notes:**
```typescript
// For items
const { data, error } = await supabase
  .from('item_translations')
  .upsert({
    item_id: entityId,
    language: language,
    name: body.name,
    description: body.description || null,
    translation_status: 'manual',
    reviewed_by: user.id,
    translated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'item_id,language'
  })
  .select()
  .single();
```

**Acceptance Criteria:**
- [ ] New translations create new records (201 response)
- [ ] Existing translations are updated (200 response)
- [ ] `translation_status` is set to `'manual'`
- [ ] `reviewed_by` contains the user's ID
- [ ] `translated_at` is set to current timestamp
- [ ] Database errors return 500

---

### Task 6: Implement Response Formatting

**Function:** Build and return appropriate response

**Subtasks:**
1. Determine if operation was insert (201) or update (200)
2. Build response object with:
   - `entityId`
   - `language`
   - `translationStatus: 'manual'`
   - `reviewedBy` (user ID)
   - `updatedAt` (timestamp)
   - Entity-specific translated fields
3. Return JSON response with appropriate status code

**Acceptance Criteria:**
- [ ] Insert operations return 201 Created
- [ ] Update operations return 200 OK
- [ ] Response includes all required fields
- [ ] Timestamps are in ISO 8601 format

---

### Task 7: Implement Audit Logging

**Function:** Log manual translation operations for audit trail

**Subtasks:**
1. Log successful manual translation operations with:
   - User email
   - Entity type and ID
   - Target language
   - Timestamp
2. Log failed operations with error details
3. Use existing logging patterns from other API routes

**Implementation Notes:**
```typescript
console.log(`Manual translation override: user=${user.email}, entityType=${entityType}, entityId=${entityId}, language=${language}`);
```

**Acceptance Criteria:**
- [ ] Successful operations are logged with user and entity details
- [ ] Failed operations are logged with error details
- [ ] Logs can be used for audit and debugging

---

### Task 8: Write Unit Tests

**File:** `/src/app/api/translations/[entityType]/[entityId]/[language]/__tests__/route.test.ts`

**Subtasks:**
1. Test parameter validation (invalid entityType, language, entityId)
2. Test authentication failures (no token, expired token)
3. Test authorization failures (no access to entity)
4. Test request body validation for each entity type
5. Test successful insert (new translation)
6. Test successful update (existing translation)
7. Test database error handling

**Acceptance Criteria:**
- [ ] All validation scenarios have test coverage
- [ ] All entity types have test coverage
- [ ] Error responses are tested
- [ ] Success responses are tested
- [ ] Tests pass without external dependencies (mocked Supabase)

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Main API route handler |
| `/src/app/api/translations/[entityType]/[entityId]/[language]/__tests__/route.test.ts` | Unit tests |

### Existing Files That May Be Modified

| File Path | Modification |
|-----------|--------------|
| `/src/types/index.ts` | Add `ManualTranslationRequest` and `ManualTranslationResponse` types if needed |
| `/src/lib/translation-service/translation-service.types.ts` | Reference existing types (no modification expected) |

### Functions to Implement

| Function | Location | Purpose |
|----------|----------|---------|
| `PUT` handler | `route.ts` | Main API handler for manual translation override |
| `isValidEntityType` | `route.ts` | Type guard for entity type validation |
| `validateEntityAccess` | `route.ts` | Check user has edit access to entity |
| `getTranslationTable` | `route.ts` | Map entity type to database table name |
| `validateRequestBody` | `route.ts` | Entity-type-specific body validation |

### Existing Functions to Reuse

| Function | Location | Usage |
|----------|----------|-------|
| `validateAdminAuth` | `/src/lib/auth-server.ts` | Authentication |
| `createSupabaseServer` | `/src/lib/supabase-server.ts` | Database client |
| `isSupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` | Language validation |

---

## Database Tables Involved

### Translation Tables (Read/Write)

| Table | Operations | Key Columns |
|-------|------------|-------------|
| `item_translations` | UPSERT | `item_id`, `language`, `name`, `description`, `translation_status`, `reviewed_by`, `translated_at` |
| `article_translations` | UPSERT | `article_id`, `language`, `title`, `description`, `translation_status`, `reviewed_by`, `translated_at` |
| `link_translations` | UPSERT | `link_id`, `language`, `title`, `translation_status`, `reviewed_by`, `translated_at` |
| `tag_translations` | UPSERT | `tag_key`, `language`, `translated_value`, `is_system_tag` |

### Entity Tables (Read Only - for access validation)

| Table | Purpose |
|-------|---------|
| `items` | Validate item exists, get property_id |
| `item_articles` | Validate article exists, get item_id |
| `item_links` | Validate link exists, get item_id |
| `properties` | Validate user owns property |

---

## Security Considerations

1. **Input Validation:** All route parameters and request body fields must be validated
2. **SQL Injection Prevention:** Use parameterized queries (Supabase handles this)
3. **Authorization:** Verify user has edit access before allowing override
4. **Audit Trail:** Log all manual translation operations with user identity
5. **Rate Limiting:** Consider adding rate limiting for abuse prevention (future enhancement)

---

## Testing Strategy

### Unit Tests
- Parameter validation
- Authentication/authorization
- Request body validation
- UPSERT logic for each entity type

### Integration Tests
- Full request flow with test database
- Verify translations are stored correctly
- Verify audit logging

### Manual Testing Checklist
- [ ] Create manual translation for an item
- [ ] Update existing manual translation
- [ ] Verify unauthorized access is blocked
- [ ] Verify 404 for non-existent entities
- [ ] Test each entity type (item, article, link, tag)

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Task 1: Route file structure | 0.5 hours |
| Task 2: Parameter validation | 1 hour |
| Task 3: Auth and authorization | 2 hours |
| Task 4: Request body validation | 1 hour |
| Task 5: UPSERT logic | 2 hours |
| Task 6: Response formatting | 0.5 hours |
| Task 7: Audit logging | 0.5 hours |
| Task 8: Unit tests | 2 hours |
| **Total** | **~9.5 hours** |

---

## References

- [PRD: L10N Epic 3 Dynamic Content Translation](/docs/prd/PRD_L10N_Epic3_Dynamic_Content_Translation.md)
- [Implementation Plan: Plan-111-L10N-Epic3-Dynamic-Content-Translation](/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md)
- [REQ-330: Create Manual Translation Override Endpoint](/docs/gen_requests_epic3.md#req-330)
- [Supabase UPSERT Documentation](https://supabase.com/docs/reference/javascript/upsert)
