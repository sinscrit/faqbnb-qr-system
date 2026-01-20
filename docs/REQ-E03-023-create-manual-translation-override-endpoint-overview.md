# REQ-E03-023: Create Manual Translation Override Endpoint - Implementation Overview

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E03-023
**Epic:** 3 - Dynamic Content Translation
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.3
**Size:** M

---

## 1. Summary

Create a PUT API endpoint that allows property owners with edit access to manually override automatic translations for specific content entities and languages. This enables users to provide higher-quality translations when automatic translations are inadequate, or to integrate with professional translation workflows.

---

## 2. Background & Context

### Current State
- Automatic translations are generated via the translation job queue and stored in entity-specific translation tables (`item_translations`, `article_translations`, `link_translations`, `tag_translations`)
- Once translations are generated, there is no mechanism for users to correct or improve them
- Translation records track status via `translation_status` field: `pending`, `processing`, `completed`, `failed`
- No `manual` status exists for human-provided translations

### Problem Statement
Property owners who speak multiple languages or work with professional translators cannot substitute higher-quality translations for machine-generated content. All translations remain as initially generated regardless of accuracy or cultural appropriateness.

### Solution Overview
Implement a PUT endpoint at `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` that:
- Validates user has edit access to the underlying entity
- Accepts translated field values in the request body
- UPSERTs the translation with status `manual`
- Records the user who provided the translation via `reviewed_by` field

---

## 3. Dependencies

### Upstream Dependencies (Required Before Implementation)
| Dependency | Source | Status |
|------------|--------|--------|
| Translation tables exist | Epic 1 Foundation | Required |
| `reviewed_by` column in translation tables | Epic 1 Migration | Required |
| `validateAdminAuth` helper | `/src/lib/auth-server.ts` | Existing |
| Translation types | `/src/lib/translation-service/translation-service.types.ts` | Existing |
| Job queue types | `/src/lib/job-queue/translation-jobs.types.ts` | Existing |

### Downstream Dependencies (What This Enables)
| Dependent | Epic | Purpose |
|-----------|------|---------|
| Translation Management UI | Epic 5 | UI for manual translation editing |
| Translation preview panel | Epic 5 | Display manual vs auto status |

---

## 4. Technical Specification

### 4.1 API Endpoint Design

**Route:** `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`

**Method:** `PUT`

**Route Parameters:**
| Parameter | Type | Description | Validation |
|-----------|------|-------------|------------|
| `entityType` | string | Entity type: `item`, `article`, `link`, `tag` | Must be valid EntityType |
| `entityId` | string | UUID of the entity | Valid UUID format |
| `language` | string | Target language code | Must be SupportedLanguage |

**Request Body (varies by entityType):**

For items:
```typescript
interface ItemTranslationOverrideRequest {
  name?: string;        // Translated item name
  description?: string; // Translated item description
}
```

For articles:
```typescript
interface ArticleTranslationOverrideRequest {
  title?: string;       // Translated article title
  description?: string; // Translated article description
}
```

For links:
```typescript
interface LinkTranslationOverrideRequest {
  title?: string;       // Translated link title (URL is never translated)
}
```

For tags:
```typescript
interface TagTranslationOverrideRequest {
  value?: string;       // Translated tag value
}
```

**Response (200 OK):**
```typescript
interface ManualTranslationResponse {
  success: true;
  data: {
    entityId: string;
    entityType: EntityType;
    language: SupportedLanguage;
    fieldsUpdated: number;
    translationStatus: 'manual';
    reviewedBy: string;      // User ID who provided translation
    updatedAt: string;       // ISO 8601 timestamp
  };
}
```

**Error Responses:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_ENTITY_TYPE` | entityType not in [item, article, link, tag] |
| 400 | `INVALID_LANGUAGE` | language not in supported languages |
| 400 | `INVALID_FIELDS` | Request contains non-translatable fields |
| 400 | `EMPTY_FIELDS` | All field values are empty or missing |
| 401 | `UNAUTHORIZED` | No authenticated user |
| 403 | `FORBIDDEN` | User lacks edit access to entity |
| 404 | `ENTITY_NOT_FOUND` | Entity with given ID does not exist |
| 500 | `DATABASE_ERROR` | Database operation failed |

### 4.2 Authorization Model

The endpoint must validate edit access using the existing account context pattern:

1. **Authenticate user** via `validateAdminAuth()`
2. **Fetch entity** to determine ownership:
   - Items: Via `properties.account_id` and `properties.user_id`
   - Articles: Via `item_articles.item_id` → `items.property_id` → `properties`
   - Links: Via `item_links.item_id` → `items.property_id` → `properties`
   - Tags: Via tag ownership (tag_key association or system vs user tag check)
3. **Validate access**:
   - Admin users can edit any entity within their account context
   - Regular users can edit entities where `properties.user_id` matches their ID

### 4.3 Database Operations

**UPSERT Pattern (Supabase):**
```typescript
const { data, error } = await supabase
  .from(`${entityType}_translations`)
  .upsert(
    {
      [`${entityType}_id`]: entityId,  // e.g., item_id, article_id
      language: targetLanguage,
      ...translatedFields,             // name, title, description, etc.
      translation_status: 'manual',
      reviewed_by: userId,
      translated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: `${entityType}_id,language`,
    }
  )
  .select()
  .single();
```

### 4.4 Field Validation Rules

| Entity Type | Valid Fields | Constraints |
|-------------|--------------|-------------|
| item | `name`, `description` | name: max 255 chars |
| article | `title`, `description` | title: max 255 chars |
| link | `title` | title: max 255 chars, URL excluded |
| tag | `value` | value: max 255 chars |

All fields:
- Must be non-empty strings if provided
- At least one field must be provided in the request
- Cannot include system fields (id, created_at, etc.)

---

## 5. Implementation Approach

### Step 1: Create Route File Structure
Create the nested dynamic route file following Next.js App Router conventions.

### Step 2: Implement Parameter Validation
- Extract and validate route parameters
- Use existing type guards: `isSupportedLanguage()` from translation types
- Return 400 errors for invalid inputs

### Step 3: Implement Authentication & Authorization
- Call `validateAdminAuth()` to get authenticated user and supabase client
- Implement entity-specific ownership lookup
- Verify user has edit access following existing account context pattern

### Step 4: Implement Field Validation
- Create entity-type-specific field validators
- Ensure only translatable fields are accepted
- Validate field value constraints (non-empty, max length)

### Step 5: Implement Database UPSERT
- Construct UPSERT query with proper conflict resolution
- Set `translation_status` to `'manual'`
- Set `reviewed_by` to current user ID
- Update timestamps

### Step 6: Return Response
- Format success response with operation details
- Include number of fields updated for confirmation

---

## 6. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts` | Main endpoint implementation |

### Existing Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()` pattern |
| `/src/app/api/admin/items/[publicId]/route.ts` | Entity access validation pattern |
| `/src/lib/translation-service/translation-service.types.ts` | Type definitions, `isSupportedLanguage()` |
| `/src/lib/job-queue/translation-jobs.types.ts` | `EntityType`, `SupportedLanguage` types |

### Types to Add/Export

| File Path | Changes |
|-----------|---------|
| `/src/types/index.ts` | Export translation override request/response types |

---

## 7. Acceptance Criteria

### Functional Requirements
- [ ] PUT endpoint exists at route pattern with entityType, entityId, and language parameters
- [ ] Endpoint validates entityType parameter against supported types (item, article, link, tag)
- [ ] Endpoint returns 400 error for unsupported entity types
- [ ] Endpoint validates language parameter against supported language codes
- [ ] Endpoint returns 400 error for unsupported language codes
- [ ] Endpoint queries database to verify entity existence before processing
- [ ] Endpoint returns 404 error when specified entity does not exist
- [ ] Endpoint retrieves entity record to determine ownership information
- [ ] Endpoint compares requesting user ID against entity owner or editors list
- [ ] Endpoint returns 403 error when user lacks edit access to entity
- [ ] Endpoint validates request body contains only valid translatable fields for entity type
- [ ] Endpoint returns 400 error when request includes non-translatable fields
- [ ] Endpoint returns 400 error when field values are empty or non-string
- [ ] Endpoint performs UPSERT operation on appropriate translation table
- [ ] UPSERT operation sets status field to 'manual' value
- [ ] UPSERT operation records current user ID in reviewed_by field
- [ ] UPSERT operation updates all provided field values
- [ ] UPSERT operation updates timestamp field to current time
- [ ] UPSERT operation preserves existing metadata (source_language, created_at, etc.)
- [ ] Endpoint returns 200 status with success payload after successful override
- [ ] Response payload includes entity type and ID for confirmation
- [ ] Response payload includes target language code
- [ ] Response payload includes count of fields updated
- [ ] Response payload includes timestamp of operation
- [ ] Response payload includes translation status value ('manual')

### Non-Functional Requirements
- [ ] Endpoint handles database constraint violations gracefully with appropriate errors
- [ ] Endpoint handles database errors gracefully with 500 status
- [ ] TypeScript types are defined for request body, route parameters, and response payload
- [ ] Request body type definitions are entity-type-specific
- [ ] Endpoint execution completes within 1 second for typical override operations
- [ ] Manual translations are never automatically overwritten by subsequent translation jobs

### Testing Requirements
- [ ] Integration tests verify authorization checks prevent unauthorized overrides
- [ ] Integration tests verify manual status is set and reviewed_by is recorded
- [ ] Unit tests for field validation per entity type
- [ ] Unit tests for language code validation

---

## 8. Testing Strategy

### Unit Tests
```typescript
describe('ManualTranslationOverride', () => {
  describe('Field Validation', () => {
    it('should accept valid item fields: name, description');
    it('should accept valid article fields: title, description');
    it('should accept valid link fields: title only');
    it('should reject URL field for links');
    it('should accept valid tag fields: value');
    it('should reject non-translatable fields');
    it('should reject empty field values');
    it('should enforce max length constraints');
  });

  describe('Language Validation', () => {
    it('should accept valid language codes: en, fr, es, de, nl, it');
    it('should reject invalid language codes');
  });
});
```

### Integration Tests
```typescript
describe('PUT /api/translations/[entityType]/[entityId]/[language]', () => {
  describe('Authorization', () => {
    it('should return 401 when not authenticated');
    it('should return 403 when user lacks edit access');
    it('should allow owner to update translation');
    it('should allow admin to update translation within account');
  });

  describe('UPSERT Behavior', () => {
    it('should create translation when none exists');
    it('should update existing translation');
    it('should set status to manual');
    it('should record reviewed_by with user ID');
    it('should update timestamps');
  });

  describe('Entity Types', () => {
    it('should handle item translations');
    it('should handle article translations');
    it('should handle link translations');
    it('should handle tag translations');
  });
});
```

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Automatic translation overwrites manual | Medium | High | Check `translation_status === 'manual'` in job processor and skip |
| Authorization bypass | Low | Critical | Use established `validateAdminAuth` + account context pattern |
| Invalid data in translations | Medium | Medium | Strict field validation before database write |
| Performance with large translations | Low | Low | Enforce max length, index lookup columns |

---

## 10. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` - Task 4.3
- **Request Definition:** `/docs/gen_requests_epic3.md` - REQ-E03-023
- **Auth Pattern:** `/src/lib/auth-server.ts` - `validateAdminAuth()`
- **Access Pattern:** `/src/app/api/admin/items/[publicId]/route.ts` - Entity ownership check
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Job Types:** `/src/lib/job-queue/translation-jobs.types.ts`

---

## 11. Appendix: Sample Requests and Responses

### Example: Override Item Translation (French)

**Request:**
```http
PUT /api/translations/item/550e8400-e29b-41d4-a716-446655440000/fr
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Machine à café",
  "description": "Machine à café automatique avec broyeur intégré. Appuyez sur le bouton pour démarrer."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "entityId": "550e8400-e29b-41d4-a716-446655440000",
    "entityType": "item",
    "language": "fr",
    "fieldsUpdated": 2,
    "translationStatus": "manual",
    "reviewedBy": "user-123-456",
    "updatedAt": "2026-01-20T15:30:00.000Z"
  }
}
```

### Example: Override Link Translation (German)

**Request:**
```http
PUT /api/translations/link/660e8400-e29b-41d4-a716-446655440001/de
Content-Type: application/json

{
  "title": "Video-Anleitung zur Kaffeemaschine"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "entityId": "660e8400-e29b-41d4-a716-446655440001",
    "entityType": "link",
    "language": "de",
    "fieldsUpdated": 1,
    "translationStatus": "manual",
    "reviewedBy": "user-789-012",
    "updatedAt": "2026-01-20T15:35:00.000Z"
  }
}
```

### Example: Error - No Edit Access

**Request:**
```http
PUT /api/translations/item/550e8400-e29b-41d4-a716-446655440000/es
```

**Response (403):**
```json
{
  "success": false,
  "error": "You do not have permission to edit translations for this entity",
  "code": "FORBIDDEN"
}
```
