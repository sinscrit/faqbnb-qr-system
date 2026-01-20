# REQ-E03-024: Create Batch Status Endpoint for List Views

**Implementation Breakdown Document**

---

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E03-024 |
| **Title** | Create Batch Status Endpoint for List Views |
| **Type** | NEW FEATURE |
| **Size** | M (Medium) |
| **Epic** | Epic 3 - Dynamic Content Translation |
| **Phase** | 4 - Translation Status & Management APIs |
| **Task ID** | 4.4 |
| **Date Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 |
| **PRD Reference** | Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| **Dependencies** | REQ-E03-006 (Translation Status Utilities), REQ-E03-021 (Single Entity Status Endpoint) |

---

## 1. Summary

Create a POST API endpoint that efficiently returns translation status for multiple content entities in a single request, optimized for dashboard and list view scenarios. This endpoint accepts an array of entity specifications and uses batch database queries to aggregate translation status, avoiding the N+1 query problem that would occur if the UI made individual status requests per item.

---

## 2. Background & Context

### Current State
- The single-entity translation status endpoint (REQ-E03-021) handles only one entity per request
- Dashboard and list views displaying dozens or hundreds of content items would require separate API calls for each entity's translation status
- This results in poor performance, excessive network overhead, and potential rate limiting issues
- There is no efficient way to query translation status for content collections

### Why This Change Is Needed
- List views (Items Manager, Articles List, Dashboard) need to display translation status badges for all visible items
- Making 50+ individual API calls per page load is unacceptable for UX
- Batch database queries using `IN` clauses are significantly more efficient than individual queries
- A dedicated batch endpoint enables responsive UI even with large content collections

### Existing Patterns to Follow
Based on codebase investigation:
1. **Batch Job Creation** (`/src/lib/job-queue/translation-jobs.ts`): Uses `createBatchTranslationJobs()` with array mapping and `.upsert(array)` pattern
2. **Batch Filtering** (`/src/app/api/user/stats/route.ts`): Uses `.in('field', arrayOfIds)` for efficient multi-entity queries
3. **Partial Failure Handling** (`/src/app/api/admin/translate/route.ts`): Uses `Partial<Record<Key, Result>>` to capture per-item errors while continuing
4. **Response Structure**: Standard `{ success: boolean, data?: T, error?: string }` format

---

## 3. Technical Requirements

### 3.1 Endpoint Specification

| Property | Value |
|----------|-------|
| **Route** | `/src/app/api/translations/status/batch/route.ts` |
| **HTTP Method** | POST |
| **Authentication** | Required (validateAdminAuth pattern) |
| **Content-Type** | application/json |

### 3.2 Request Schema

```typescript
interface BatchStatusRequest {
  entities: EntitySpecification[];
}

interface EntitySpecification {
  entityType: 'item' | 'article' | 'link' | 'tag';
  entityId: string;  // UUID
}
```

**Constraints:**
- `entities` array: required, non-empty, maximum 100 elements
- Each element must have valid `entityType` and `entityId`
- Mixed entity types allowed in single request

### 3.3 Response Schema

```typescript
interface BatchStatusResponse {
  success: boolean;
  data?: EntityStatusSummary[];
  error?: string;
  meta?: {
    requested: number;
    returned: number;
    processingTimeMs: number;
  };
}

interface EntityStatusSummary {
  entityType: 'item' | 'article' | 'link' | 'tag';
  entityId: string;
  status: 'not_found' | 'error' | TranslationOverallStatus;
  completionPercentage?: number;  // 0-100
  availableLanguages?: SupportedLanguage[];
  pendingCount?: number;
  failedCount?: number;
  errorMessage?: string;  // Only present if status is 'error'
}

type TranslationOverallStatus =
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'not_started'
  | 'has_failures';
```

### 3.4 HTTP Status Codes

| Code | Condition |
|------|-----------|
| 200 | Success (even with partial results - per-item errors in response body) |
| 400 | Invalid request body, empty entities array, exceeds 100 limit, invalid entity types |
| 401 | Missing or invalid authentication |
| 403 | User lacks access |
| 500 | Database error or internal server error |

### 3.5 Performance Requirements

| Metric | Target |
|--------|--------|
| 100 entities | < 2 seconds |
| 20 entities | < 500 milliseconds |
| Database queries | Maximum 8 (2 per entity type: jobs + translations) |

---

## 4. Implementation Approach

### 4.1 Algorithm Overview

```
1. Validate request body and authentication
2. Group entities by entityType
3. For each entity type present:
   a. Batch query translation_jobs table using IN clause
   b. Batch query *_translations table using IN clause
4. Aggregate results per entity:
   a. Combine job data + translation data
   b. Calculate overall status
   c. Compute completion percentage
   d. Collect language arrays
5. Assemble response maintaining input order
6. Return with metadata
```

### 4.2 Database Query Strategy

**Query 1: Translation Jobs (per entity type)**
```sql
SELECT entity_id, target_language, status, error_message
FROM translation_jobs
WHERE entity_type = $1
  AND entity_id IN ($2, $3, ..., $n)
```

**Query 2: Stored Translations (per entity type)**
```sql
-- Example for items
SELECT item_id, language, translation_status
FROM item_translations
WHERE item_id IN ($1, $2, ..., $n)
```

### 4.3 Status Aggregation Logic

```typescript
function calculateOverallStatus(jobs: JobRecord[], translations: TranslationRecord[]): TranslationOverallStatus {
  const targetLanguages = ['fr', 'es', 'de', 'nl', 'it']; // All except source

  // Check for failures first
  const failedCount = jobs.filter(j => j.status === 'failed').length;
  if (failedCount > 0) return 'has_failures';

  // Check completion
  const completedLanguages = translations.filter(t =>
    t.translation_status === 'completed' || t.translation_status === 'manual'
  ).length;

  if (completedLanguages === targetLanguages.length) return 'fully_translated';

  // Check pending
  const pendingCount = jobs.filter(j =>
    j.status === 'queued' || j.status === 'processing'
  ).length;

  if (pendingCount > 0) return 'pending';

  if (completedLanguages > 0) return 'partially_translated';

  return 'not_started';
}
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/batch/route.ts` | Batch status API endpoint (POST handler) |

### 5.2 Functions to Implement

#### File: `/src/app/api/translations/status/batch/route.ts`

| Function | Signature | Description |
|----------|-----------|-------------|
| `POST` | `async function POST(request: NextRequest): Promise<NextResponse<BatchStatusResponse>>` | Main POST handler for batch status requests |
| `validateBatchRequest` | `function validateBatchRequest(body: unknown): { valid: true; entities: EntitySpecification[] } \| { valid: false; error: string }` | Validate request body structure, array limits, entity types |
| `groupEntitiesByType` | `function groupEntitiesByType(entities: EntitySpecification[]): Map<EntityType, string[]>` | Group entity IDs by their type for efficient batching |
| `fetchBatchJobStatus` | `async function fetchBatchJobStatus(entityType: EntityType, entityIds: string[]): Promise<Map<string, JobRecord[]>>` | Batch fetch translation jobs for a type |
| `fetchBatchTranslationStatus` | `async function fetchBatchTranslationStatus(entityType: EntityType, entityIds: string[]): Promise<Map<string, TranslationRecord[]>>` | Batch fetch stored translations for a type |
| `aggregateEntityStatus` | `function aggregateEntityStatus(entityId: string, jobs: JobRecord[], translations: TranslationRecord[]): EntityStatusSummary` | Calculate overall status for single entity |

### 5.3 Existing Files/Functions to Use (Read-Only)

| File | Items to Import/Use |
|------|---------------------|
| `/src/lib/auth-server.ts` | `validateAdminAuth` - for authentication |
| `/src/lib/supabase.ts` | `supabase` client, `Database` types |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage`, `TranslationStatus`, `SUPPORTED_LANGUAGES` |
| `/src/lib/job-queue/translation-jobs.types.ts` | `JobStatus`, `EntityType` |

### 5.4 Types to Add

**Add to `/src/types/index.ts` or create `/src/app/api/translations/status/batch/types.ts`:**

```typescript
// Request types
export interface BatchStatusRequest {
  entities: EntitySpecification[];
}

export interface EntitySpecification {
  entityType: EntityType;
  entityId: string;
}

// Response types
export interface BatchStatusResponse {
  success: boolean;
  data?: EntityStatusSummary[];
  error?: string;
  meta?: BatchStatusMeta;
}

export interface EntityStatusSummary {
  entityType: EntityType;
  entityId: string;
  status: EntityStatus;
  completionPercentage?: number;
  availableLanguages?: SupportedLanguage[];
  pendingCount?: number;
  failedCount?: number;
  errorMessage?: string;
}

export interface BatchStatusMeta {
  requested: number;
  returned: number;
  processingTimeMs: number;
}

export type EntityStatus =
  | 'not_found'
  | 'error'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'not_started'
  | 'has_failures';
```

---

## 6. Implementation Tasks

### Task 1: Create Batch Status Route File
**File:** `/src/app/api/translations/status/batch/route.ts`

Create the route file with basic structure:
- Import dependencies (NextRequest, NextResponse, supabase, auth, types)
- Export POST handler function
- Set up try-catch error handling structure

### Task 2: Implement Request Validation
**Function:** `validateBatchRequest`

Validation rules:
- Body must be object with `entities` array
- `entities` array must be non-empty
- `entities` array must not exceed 100 elements
- Each element must have valid `entityType` ('item', 'article', 'link', 'tag')
- Each element must have non-empty `entityId` string
- Return descriptive error messages with invalid index information

### Task 3: Implement Entity Grouping
**Function:** `groupEntitiesByType`

- Create Map<EntityType, string[]>
- Iterate through entities array
- Push each entityId to the appropriate type's array
- Return map for batch query optimization

### Task 4: Implement Job Status Batch Fetch
**Function:** `fetchBatchJobStatus`

- Accept entityType and array of entityIds
- Query `translation_jobs` table with `.in('entity_id', entityIds)`
- Filter by `entity_type`
- Select: entity_id, target_language, status, error_message, created_at
- Return Map<entityId, JobRecord[]> for lookup

### Task 5: Implement Translation Status Batch Fetch
**Function:** `fetchBatchTranslationStatus`

- Accept entityType and array of entityIds
- Query appropriate table based on entityType:
  - 'item' -> item_translations (item_id)
  - 'article' -> article_translations (article_id)
  - 'link' -> link_translations (link_id)
  - 'tag' -> tag_translations (tag_key)
- Select: entity_id field, language, translation_status
- Return Map<entityId, TranslationRecord[]>

### Task 6: Implement Status Aggregation
**Function:** `aggregateEntityStatus`

- Calculate overall status using job + translation data
- Compute completion percentage: (completed + manual) / total target languages * 100
- Collect available languages where status is completed/manual
- Count pending (queued + processing)
- Count failed
- Return EntityStatusSummary object

### Task 7: Implement POST Handler
**Function:** `POST`

- Call validateAdminAuth for authentication
- Parse and validate request body
- Record start time for performance tracking
- Group entities by type
- For each entity type present:
  - Fetch jobs batch
  - Fetch translations batch
- Build response array maintaining original order
- Handle not_found entities (no jobs or translations)
- Include metadata (requested, returned, processingTimeMs)
- Return 200 with data

### Task 8: Add Error Handling
- Handle database query failures per entity type
- Mark individual entities with 'error' status rather than failing entire request
- Log errors with context for debugging
- Return 500 only for complete database failure

---

## 7. Database Indexes Required

The following indexes from Plan-111 Phase 6 support this endpoint:

```sql
-- Fast lookup of jobs by entity (for batch status queries)
CREATE INDEX IF NOT EXISTS idx_translation_jobs_entity
  ON translation_jobs(entity_type, entity_id, target_language);

-- Fast lookup for displaying translated content
CREATE INDEX IF NOT EXISTS idx_item_translations_lookup
  ON item_translations(item_id, language);
CREATE INDEX IF NOT EXISTS idx_article_translations_lookup
  ON article_translations(article_id, language);
CREATE INDEX IF NOT EXISTS idx_link_translations_lookup
  ON link_translations(link_id, language);
CREATE INDEX IF NOT EXISTS idx_tag_translations_tag_lang
  ON tag_translations(tag_key, language);
```

---

## 8. Testing Requirements

### Unit Tests
- Request validation: empty array, exceeds limit, invalid types, missing fields
- Entity grouping: mixed types, single type, empty
- Status aggregation: all statuses, mixed statuses, no data

### Integration Tests
- Full request flow with database
- Mixed entity types in single request
- Non-existent entities handled correctly
- Large batch (100 entities) completes within time limit
- Response order matches request order

### Performance Tests
- 100 entities: verify < 2s response time
- 20 entities: verify < 500ms response time
- Database query count: verify max 8 queries regardless of entity count

---

## 9. Acceptance Criteria Checklist

- [ ] POST endpoint exists at `/api/translations/status/batch`
- [ ] Request body contains `entities` array with `entityType` and `entityId` for each element
- [ ] Endpoint validates request body structure and returns 400 for malformed requests
- [ ] Endpoint validates `entityType` values against supported types for each array element
- [ ] Endpoint returns 400 with index information when invalid types are found
- [ ] Endpoint enforces maximum request size of 100 entities and returns 400 when exceeded
- [ ] Endpoint groups entity specifications by type for efficient batch processing
- [ ] Endpoint executes batch database queries using IN clauses
- [ ] Endpoint performs maximum of 8 database queries regardless of entity count
- [ ] Endpoint retrieves translation job data for all specified entities in batch queries
- [ ] Endpoint retrieves translation record data for all specified entities in batch queries
- [ ] Endpoint aggregates job and translation data to determine per-entity status
- [ ] Endpoint returns 200 status with JSON array response
- [ ] Response array length matches request array length exactly
- [ ] Response array order matches request array order exactly
- [ ] Each response element includes `entityType` and `entityId` for reference
- [ ] Each response element includes overall status enumeration value
- [ ] Each response element includes completion percentage (0-100)
- [ ] Each response element includes array of available language codes
- [ ] Each response element includes count of pending languages
- [ ] Each response element includes count of failed languages
- [ ] Non-existent entities return element with status 'not_found' rather than failing request
- [ ] Entities with database query errors return element with status 'error' and error message
- [ ] Response includes metadata with processing time
- [ ] Endpoint completes within 2 seconds for requests containing 100 entities
- [ ] Endpoint completes within 500ms for requests containing 20 entities
- [ ] Database queries use appropriate indexes
- [ ] TypeScript types are defined for request body structure, entity specification, and response array

---

## 10. Example Usage

### Request
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "entities": [
      {"entityType": "item", "entityId": "item-uuid-001"},
      {"entityType": "item", "entityId": "item-uuid-002"},
      {"entityType": "article", "entityId": "article-uuid-001"},
      {"entityType": "link", "entityId": "link-uuid-001"}
    ]
  }' \
  https://api.example.com/api/translations/status/batch
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "entityType": "item",
      "entityId": "item-uuid-001",
      "status": "fully_translated",
      "completionPercentage": 100,
      "availableLanguages": ["fr", "es", "de", "nl", "it"],
      "pendingCount": 0,
      "failedCount": 0
    },
    {
      "entityType": "item",
      "entityId": "item-uuid-002",
      "status": "pending",
      "completionPercentage": 40,
      "availableLanguages": ["fr", "es"],
      "pendingCount": 3,
      "failedCount": 0
    },
    {
      "entityType": "article",
      "entityId": "article-uuid-001",
      "status": "not_found"
    },
    {
      "entityType": "link",
      "entityId": "link-uuid-001",
      "status": "has_failures",
      "completionPercentage": 60,
      "availableLanguages": ["fr", "es", "de"],
      "pendingCount": 0,
      "failedCount": 2
    }
  ],
  "meta": {
    "requested": 4,
    "returned": 4,
    "processingTimeMs": 145
  }
}
```

---

## 11. Dependencies

### Upstream Dependencies (Must Be Completed First)
| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-E03-001 | Required | Content translation module structure |
| REQ-E03-005 | Required | Translation storage utilities (for table structures) |
| REQ-E03-006 | Required | Translation status utilities (can reuse logic) |
| Plan-111 Phase 6 | Required | Database indexes for efficient queries |

### Downstream Dependencies (Blocked By This)
| Dependent | Impact |
|-----------|--------|
| Items Manager UI | Can display translation status badges in list view |
| Articles List UI | Can show translation progress per article |
| Dashboard widgets | Can show aggregate translation status |
| Bulk operations UI | Can identify which items need translation attention |

---

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large batch query timeout | Low | Medium | Enforce 100-item limit, use indexed queries |
| Memory pressure with 100 items | Low | Low | Stream processing, limit fields returned |
| Database connection exhaustion | Low | High | Single connection per query, connection pooling |
| Inconsistent status between jobs and translations | Medium | Low | Order of precedence: jobs > translations for recent data |

---

## 13. References

- **Request Document:** `/docs/gen_requests_epic3.md` - REQ-E03-024
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` - Phase 4, Task 4.4
- **Related Patterns:**
  - `/src/lib/job-queue/translation-jobs.ts` - Batch job creation pattern
  - `/src/app/api/user/stats/route.ts` - `.in()` clause pattern
  - `/src/app/api/admin/translate/route.ts` - Partial failure handling pattern

---

*Document generated: 2026-01-20*
*Last modified: 2026-01-20*
