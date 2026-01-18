# REQ-306: Create Re-Translate API Endpoint - Technical Overview

**Generated:** 2026-01-18 05:45:00 UTC
**Last Modified:** 2026-01-18 05:45:00 UTC
**Request Reference:** REQ-306 from gen_requests_epic5.md
**Implementation Plan Reference:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 1 - API Endpoints
**Task ID:** 1.3

---

## Summary

Create a POST API endpoint at `/api/translations/retranslate` that allows property owners to queue re-translation jobs for their content. The endpoint supports bulk operations for multiple entities, provides options to preserve or overwrite manually curated translations, and returns a summary of jobs queued and skipped.

---

## Requirements Analysis

### From REQ-306 Acceptance Criteria

1. Endpoint accepts multiple entity identifiers in a single request
2. Endpoint accepts a parameter specifying whether to skip or overwrite manually edited translations
3. Only queues re-translation jobs for entities owned by the authenticated user
4. Response indicates the total number of jobs queued successfully
5. Response indicates the number of entities skipped due to manual edit protection
6. Returns authorization error when user lacks access to any specified entity
7. Returns validation error when entity identifiers are malformed or missing
8. Handles requests for non-existent entities gracefully without queuing jobs

### From Implementation Plan (Task 1.3)

- File: `/src/app/api/translations/retranslate/route.ts`
- POST to queue re-translation jobs
- Support bulk entities
- Option to skip/overwrite manual edits
- Return job count and skipped count

---

## Technical Design

### API Contract

**Endpoint:** `POST /api/translations/retranslate`

**Request Body:**
```typescript
interface RetranslateRequest {
  /** Array of entities to re-translate */
  entities: {
    type: 'article' | 'item' | 'link';
    id: string;  // UUID
  }[];
  /** Optional: Specific languages to re-translate (all if omitted) */
  languages?: SupportedLanguage[];
  /** Whether to overwrite manual translations (default: false = skip) */
  overwriteManual?: boolean;
}
```

**Success Response (200):**
```typescript
interface RetranslateResponse {
  success: true;
  /** Number of translation jobs successfully queued */
  jobsQueued: number;
  /** Number of entity-language pairs skipped */
  skipped: number;
  /** Reason for skipped items (if any) */
  skippedReason?: string;
  /** Optional: Breakdown by entity type */
  breakdown?: {
    articles: { queued: number; skipped: number };
    items: { queued: number; skipped: number };
    links: { queued: number; skipped: number };
  };
}
```

**Error Responses:**
- `400 Bad Request`: Missing or malformed entity identifiers
- `401 Unauthorized`: Invalid or expired authentication token
- `403 Forbidden`: User lacks access to one or more specified entities
- `500 Internal Server Error`: Server-side failure

### Supported Languages (from Epic 1)

```typescript
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

### Dependencies

#### Epic 1 Foundation (Required)

| Dependency | Status | Notes |
|------------|--------|-------|
| `translation_jobs` table | **Not yet created** | Must exist to queue jobs |
| `article_translations` table | **Not yet created** | Check for manual status |
| `item_translations` table | **Not yet created** | Check for manual status |
| `link_translations` table | **Not yet created** | Check for manual status |
| Translation service module | **Not yet created** | `/src/lib/translation-service/` |
| Job queue module | **Not yet created** | `/src/lib/job-queue/` |

#### Existing Codebase Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Authentication validation | `/src/lib/auth-server.ts` | Use `validateAdminAuth()` |
| Account context extraction | `/src/app/api/admin/articles/route.ts` | Use `getAccountContext()` helper pattern |
| Response formatting | `/src/app/api/admin/items/route.ts` | Follow existing JSON response structure |
| Entity ownership validation | `/src/app/api/admin/articles/route.ts` | Join with properties table for account_id check |

---

## Implementation Approach

### Step 1: Request Validation

1. Parse and validate request body structure
2. Validate `entities` array is non-empty
3. Validate each entity has valid `type` ('article', 'item', 'link') and UUID `id`
4. Validate `languages` array contains valid language codes (if provided)
5. Default `overwriteManual` to `false` if not specified

### Step 2: Authentication & Authorization

1. Call `validateAdminAuth(request)` to verify user session
2. Extract account context using existing `getAccountContext()` pattern
3. For each entity in the request:
   - Query the relevant source table (items, item_articles, item_links)
   - Join with properties table to get account_id
   - Verify account_id matches user's account context
   - Collect any unauthorized entities for error response

### Step 3: Manual Edit Detection

For each authorized entity-language pair:
1. Query the relevant translation table (article_translations, item_translations, link_translations)
2. Check if `translation_status = 'manual'`
3. If `overwriteManual === false` and status is 'manual', mark as skipped
4. Track skipped counts and reasons

### Step 4: Queue Translation Jobs

For each entity-language pair that passed validation:
1. Insert a new record into `translation_jobs` table with:
   - `entity_type`: 'article', 'item', or 'link'
   - `entity_id`: UUID of the entity
   - `target_language`: language code
   - `status`: 'pending'
   - `priority`: 'normal' (or configurable)
   - `created_at`: current timestamp
   - `requested_by`: authenticated user ID
2. Count successfully queued jobs

### Step 5: Build Response

1. Calculate total jobs queued
2. Calculate total skipped (manual edits + non-existent)
3. Build breakdown by entity type (optional)
4. Return success response with counts

---

## Entity Ownership Validation Logic

```typescript
// Validation approach for each entity type

// Articles: item_articles -> items -> properties -> account_id
const articleOwnership = await supabase
  .from('item_articles')
  .select('id, items!inner(property_id, properties!inner(account_id))')
  .eq('id', entityId)
  .single();

// Items: items -> properties -> account_id
const itemOwnership = await supabase
  .from('items')
  .select('id, property_id, properties!inner(account_id)')
  .eq('id', entityId)
  .single();

// Links: item_links -> items -> properties -> account_id
const linkOwnership = await supabase
  .from('item_links')
  .select('id, item_id, items!inner(property_id, properties!inner(account_id))')
  .eq('id', entityId)
  .single();
```

---

## Database Schema Requirements

### Translation Tables (from Epic 1 - NOT YET CREATED)

```sql
-- Required: article_translations
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_id, language)
);

-- Required: item_translations
CREATE TABLE item_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  translation_status VARCHAR(20) DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  source_version_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, language)
);

-- Required: link_translations
CREATE TABLE link_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES item_links(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title VARCHAR(255),
  translation_status VARCHAR(20) DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  source_version_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(link_id, language)
);

-- Required: translation_jobs
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,
  target_language VARCHAR(5) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(10) DEFAULT 'normal',
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  requested_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(entity_type, entity_id, target_language, status)
);
```

---

## Error Handling

| Scenario | HTTP Code | Response |
|----------|-----------|----------|
| Empty entities array | 400 | `{ success: false, error: 'No entities provided for re-translation' }` |
| Invalid entity type | 400 | `{ success: false, error: 'Invalid entity type: {type}. Must be article, item, or link' }` |
| Invalid UUID format | 400 | `{ success: false, error: 'Invalid entity ID format: {id}' }` |
| Invalid language code | 400 | `{ success: false, error: 'Invalid language code: {code}' }` |
| Not authenticated | 401 | `{ success: false, error: 'Invalid or expired token', code: 'UNAUTHORIZED' }` |
| Entity not found | 200 | Treated as skipped (graceful handling per AC) |
| No account access | 403 | `{ success: false, error: 'Access denied to entity: {id}' }` |
| Database error | 500 | `{ success: false, error: 'Failed to queue translation jobs' }` |

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/retranslate/route.ts` | Main API route handler |

### Files to Reference (Read-Only Patterns)

| File Path | Pattern to Follow |
|-----------|-------------------|
| `/src/lib/auth-server.ts` | `validateAdminAuth()` function for authentication |
| `/src/app/api/admin/articles/route.ts` | `getAccountContext()` helper pattern, entity ownership validation |
| `/src/app/api/admin/items/route.ts` | Request validation, response formatting |
| `/src/lib/supabase.ts` | Database types and client usage |
| `/src/types/index.ts` | Type definitions pattern |

### Types to Add

| Location | Types |
|----------|-------|
| `/src/types/index.ts` or new `/src/types/translation.ts` | `RetranslateRequest`, `RetranslateResponse`, `SupportedLanguage` |

---

## Testing Considerations

### Unit Tests

1. Request validation (empty array, invalid types, invalid UUIDs)
2. Language code validation
3. overwriteManual flag behavior
4. Response structure validation

### Integration Tests

1. Authentication required
2. Successful bulk re-translation request
3. Mixed entities (some owned, some not)
4. Manual edit preservation (skip behavior)
5. Manual edit overwrite (when flag is true)
6. Non-existent entity handling
7. Empty result handling (all skipped)

### Manual Testing

1. Queue re-translation for single article
2. Queue re-translation for multiple items
3. Test manual edit protection
4. Verify jobs appear in translation_jobs table

---

## Implementation Notes

### Performance Considerations

- Batch entity ownership validation queries where possible
- Use transactions for job insertion if supported
- Consider pagination/limits for very large bulk requests (e.g., max 100 entities)

### Security Considerations

- Always validate entity ownership before queuing jobs
- Never expose internal database IDs in error messages
- Log suspicious patterns (many failed ownership checks)

### Future Enhancements

- Job priority levels (urgent, normal, low)
- Scheduled re-translation (cron-based)
- Progress tracking via realtime subscriptions
- Retry configuration per request

---

## Blocking Dependencies

**CRITICAL:** This endpoint depends on Epic 1 database tables that do not yet exist:
- `translation_jobs`
- `article_translations`
- `item_translations`
- `link_translations`

Implementation should either:
1. Wait for Epic 1 completion, OR
2. Create stub/mock implementations for testing, OR
3. Include table creation as part of this task (coordinate with Epic 1)

---

## References

- PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request: `/docs/gen_requests_epic5.md` - REQ-306
- Epic 1 Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`

---

*Technical overview generated for FAQBNB L10N Epic 5 - Phase 1 Task 1.3*
