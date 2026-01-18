# REQ-328: Create Translation Status API Endpoint - Implementation Overview

**Last Modified:** 2026-01-18 15:45:00 UTC
**Request ID:** REQ-328
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.1
**Size:** M (Medium)
**Priority:** P1 - High

---

## Summary

Create a RESTful API endpoint that returns comprehensive translation status information for any content entity (item, article, link, tag). The endpoint combines active job queue status with stored translation records to provide a complete picture of translation availability, supporting cache-friendly responses.

---

## Current Behavior

No API endpoint exists to query translation status for content entities. Property owners and application components cannot programmatically determine:
- Which languages have completed translations
- Which translations are currently being processed
- Which languages are missing translations entirely

This lack of visibility prevents building translation management interfaces and makes it impossible to display accurate translation availability indicators to users.

---

## Expected Behavior

When a GET request is made to `/api/translations/status/[entityType]/[entityId]`, the API:

1. Validates the `entityType` parameter against supported types: `item`, `article`, `link`, `tag`
2. Retrieves the entity to confirm it exists
3. Queries the `translation_jobs` table to identify pending/in-progress translation jobs
4. Queries the appropriate translation storage table to retrieve completed translations
5. Returns a comprehensive status response including:
   - Entity identifier and type
   - Source language
   - Array of completed translations (with language code and timestamp)
   - Array of pending translations (with language code and job status)
   - Array of missing language codes
   - Overall translation coverage percentage
6. Includes cache-friendly headers (Cache-Control with max-age, ETag for conditional requests)

---

## Technical Details

### File Location
`/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

### HTTP Method
GET

### Route Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `entityType` | string | Type of content entity: `item`, `article`, `link`, `tag` |
| `entityId` | string (UUID) | Unique identifier of the entity |

### Response Format

**Success Response (200 OK):**
```typescript
{
  success: true,
  data: {
    entityId: string,
    entityType: 'item' | 'article' | 'link' | 'tag',
    sourceLanguage: string,
    totalLanguages: number,
    coveragePercentage: number,
    completedTranslations: Array<{
      languageCode: string,
      updatedAt: string
    }>,
    pendingTranslations: Array<{
      languageCode: string,
      jobStatus: 'queued' | 'processing'
    }>,
    missingLanguages: string[]
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid entityType or entityId format
- `404 Not Found` - Entity does not exist
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - No access to entity
- `500 Internal Server Error` - Database or server error

### Cache Headers
| Header | Value | Purpose |
|--------|-------|---------|
| `Cache-Control` | `public, max-age=30` | 30-second cache for polling efficiency |
| `ETag` | Content hash | Enable conditional GET requests |

### Conditional Request Support
When `If-None-Match` header matches current ETag, return `304 Not Modified` with no body.

---

## Supported Languages

The system supports 6 languages (defined in Epic 1 foundation):
- English (en)
- French (fr)
- Spanish (es)
- German (de)
- Dutch (nl)
- Italian (it)

---

## Dependencies

### Required Prior Implementations
| Dependency | Location | Status |
|------------|----------|--------|
| REQ-264: Translation Status Utilities | `/src/lib/content-translation/storage/translation-status.ts` | **PENDING** |
| Translation Jobs Table | Database `translation_jobs` | **EXISTS** |
| Item Translations Table | Database `item_translations` | **EXISTS** |
| Article Translations Table | Database `article_translations` | **EXISTS** |
| Link Translations Table | Database `link_translations` | **EXISTS** |
| Tag Translations Table | Database `tag_translations` | **EXISTS** |
| Auth Helper | `/src/lib/auth-server.ts` | **EXISTS** |

### Database Tables Used

**translation_jobs:**
```typescript
{
  id: string
  entity_type: string        // 'item' | 'article' | 'link' | 'tag'
  entity_id: string          // UUID of the entity
  source_language: string
  target_language: string
  status: string             // 'queued' | 'processing' | 'completed' | 'failed'
  attempts: number | null
  error_message: string | null
  created_at: string | null
  started_at: string | null
  completed_at: string | null
}
```

**item_translations:**
```typescript
{
  id: string
  item_id: string
  language: string
  name: string
  description: string | null
  translation_status: string  // 'pending' | 'completed' | 'failed' | 'manual'
  translated_at: string | null
  created_at: string | null
  updated_at: string | null
}
```

**article_translations:**
```typescript
{
  id: string
  article_id: string
  language: string
  title: string
  description: string | null
  translation_status: string
  translated_at: string | null
  reviewed_by: string | null
  created_at: string | null
  updated_at: string | null
}
```

**link_translations:**
```typescript
{
  id: string
  link_id: string
  language: string
  title: string
  translation_status: string
  translated_at: string | null
  created_at: string | null
  updated_at: string | null
}
```

**tag_translations:**
```typescript
{
  id: string
  tag_key: string
  language: string
  translated_value: string
  is_system_tag: boolean | null
  created_at: string | null
}
```

---

## Implementation Tasks

### Task 1: Create Directory Structure
Create the nested route directory:
```
/src/app/api/translations/status/[entityType]/[entityId]/
```

### Task 2: Create Translation Status Utility (if not exists)
If REQ-264 is not yet implemented, create a minimal utility:

**File:** `/src/lib/content-translation/storage/translation-status.ts`

```typescript
import { supabaseAdmin } from '@/lib/supabase';

export type EntityType = 'item' | 'article' | 'link' | 'tag';
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

export interface TranslationStatusResult {
  entityId: string;
  entityType: EntityType;
  sourceLanguage: string;
  totalLanguages: number;
  coveragePercentage: number;
  completedTranslations: Array<{ languageCode: string; updatedAt: string }>;
  pendingTranslations: Array<{ languageCode: string; jobStatus: 'queued' | 'processing' }>;
  missingLanguages: string[];
}

export async function getEntityTranslationStatus(
  entityType: EntityType,
  entityId: string
): Promise<TranslationStatusResult> {
  // Implementation details in Task 2
}
```

### Task 3: Implement Route Handler

**File:** `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`

Key implementation steps:
1. Extract and validate route parameters
2. Authenticate user via `validateAdminAuth`
3. Verify entity exists and user has access
4. Query translation jobs for pending/processing status
5. Query translation storage table for completed translations
6. Calculate missing languages
7. Generate ETag from response data
8. Handle conditional GET (If-None-Match)
9. Return JSON response with cache headers

### Task 4: Add Logging
Log all status requests for monitoring with:
- Entity type and ID
- User ID making request
- Response time
- Cache hit/miss

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/[entityType]/[entityId]/route.ts` | Main route handler |
| `/src/lib/content-translation/storage/translation-status.ts` | Translation status utility (if not exists) |
| `/src/lib/content-translation/index.ts` | Module exports (if not exists) |

### Existing Files to Modify

| File Path | Modification | Lines (Approx) |
|-----------|--------------|----------------|
| None required | - | - |

### Functions to Create

| Function | File | Purpose |
|----------|------|---------|
| `GET` | route.ts | Main route handler for GET requests |
| `getEntityTranslationStatus` | translation-status.ts | Aggregate translation status from jobs and storage |
| `getTranslationTable` | translation-status.ts | Map entity type to translation table name |
| `getEntityIdColumn` | translation-status.ts | Map entity type to ID column name |
| `generateETag` | route.ts | Generate content hash for ETag header |

### Database Tables Queried (Read-Only)

| Table | Operations |
|-------|------------|
| `translation_jobs` | SELECT (filter by entity_type, entity_id, status) |
| `item_translations` | SELECT (filter by item_id) |
| `article_translations` | SELECT (filter by article_id) |
| `link_translations` | SELECT (filter by link_id) |
| `tag_translations` | SELECT (filter by tag_key) |
| `items` | SELECT (verify entity exists) |
| `item_articles` | SELECT (verify entity exists) |
| `item_links` | SELECT (verify entity exists) |

---

## Code Patterns to Follow

### Authentication Pattern
```typescript
import { validateAdminAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ entityType: string; entityId: string }> }) {
  try {
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const { user, supabase } = authResult;
    // ... rest of handler
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Parameter Extraction Pattern
```typescript
const { entityType, entityId } = await params;
```

### UUID Validation Pattern
```typescript
const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
if (!uuidRegex.test(entityId)) {
  return NextResponse.json(
    { success: false, error: 'Invalid entityId format' },
    { status: 400 }
  );
}
```

### EntityType Validation Pattern
```typescript
const validEntityTypes = ['item', 'article', 'link', 'tag'];
if (!validEntityTypes.includes(entityType)) {
  return NextResponse.json(
    { success: false, error: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}` },
    { status: 400 }
  );
}
```

### Cache Header Pattern
```typescript
const etag = `"${generateContentHash(responseData)}"`;
const ifNoneMatch = request.headers.get('if-none-match');

if (ifNoneMatch === etag) {
  return new NextResponse(null, { status: 304 });
}

return NextResponse.json({ success: true, data: responseData }, {
  headers: {
    'Cache-Control': 'public, max-age=30',
    'ETag': etag
  }
});
```

---

## Testing Scenarios

### Happy Path Tests
1. GET status for item with all translations complete
2. GET status for item with some translations pending
3. GET status for item with no translations
4. GET status for article, link, and tag entity types
5. Conditional GET with matching ETag returns 304

### Error Tests
1. Invalid entityType returns 400
2. Invalid entityId format returns 400
3. Non-existent entity returns 404
4. Unauthenticated request returns 401
5. No access to entity returns 403

### Edge Cases
1. Entity exists but no translation jobs ever created
2. All translation jobs failed
3. Mixed status: some completed, some pending, some failed
4. Tag entity type (uses tag_key instead of UUID)

---

## Acceptance Criteria Checklist

- [ ] Route handler file created at `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`
- [ ] GET handler extracts entityType and entityId from route parameters
- [ ] Handler validates entityType is one of: 'item', 'article', 'link', 'tag'
- [ ] Invalid entityType values return 400 Bad Request with descriptive error message
- [ ] Handler queries database to verify entity exists before proceeding
- [ ] Non-existent entities return 404 Not Found with descriptive error message
- [ ] Handler calls getEntityTranslationStatus utility to retrieve aggregated status
- [ ] Response includes entityId and entityType fields for context
- [ ] Response includes sourceLanguage field indicating original content language
- [ ] Response includes completedTranslations array with languageCode and updatedAt
- [ ] Response includes pendingTranslations array with languageCode and jobStatus
- [ ] Response includes missingLanguages array with language codes
- [ ] Response includes coveragePercentage field
- [ ] Response includes Cache-Control header with max-age of 30 seconds
- [ ] Response includes ETag header based on content hash
- [ ] Handler returns 304 Not Modified when If-None-Match header matches current ETag
- [ ] Database query errors return 500 Internal Server Error with generic error message
- [ ] Implementation integrates with authentication middleware
- [ ] Response includes totalLanguages field
- [ ] Handler logs status requests for monitoring and debugging

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| REQ-264 not implemented | Medium | Medium | Create minimal inline utility or implement as part of this task |
| Tag entity uses different ID pattern | Low | Low | Handle tag_key vs UUID in validation and queries |
| Performance with many translations | Low | Low | Indexed queries on entity_type + entity_id |
| Cache invalidation complexity | Low | Medium | Short 30-second max-age reduces stale data risk |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Epic 3 Requests:** `/docs/gen_requests_epic3.md`
- **Auth Helper:** `/src/lib/auth-server.ts`
- **Database Types:** `/src/lib/supabase.ts` (lines 607-677)
- **API Pattern Reference:** `/src/app/api/admin/items/[publicId]/route.ts`

---

*Generated for FAQBNB L10N Epic 3 - Phase 4.1*
