# REQ-331: Create Batch Translation Status Endpoint for List Views

**Last Modified:** 2026-01-18
**Request ID:** REQ-331
**Type:** NEW FEATURE
**Size:** M
**Phase:** 4 - Translation Status & Management APIs
**Task ID:** 4.4
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`

---

## Summary

Create a RESTful API endpoint that accepts multiple entity identifiers in a single request and returns translation status for all requested entities efficiently, optimized for rendering dashboard list views with translation indicators.

---

## Current Behavior

No API endpoint exists to query translation status for multiple entities in a single request. Dashboard list views that display translation status indicators must make individual API calls for each entity in the list, resulting in dozens or hundreds of sequential HTTP requests when rendering large lists. This creates significant performance bottlenecks, increases page load times, and generates excessive network overhead when displaying tables or lists of content items with translation status badges.

---

## Expected Behavior

When a POST request is made to `/api/translations/status/batch`, the API:

1. Accepts a request body containing an array of entity specifiers (each with `entityType` and `entityId`)
2. Validates that all entity types are supported content types (`item`, `article`, `link`, `tag`)
3. Processes the batch request efficiently using optimized database queries that minimize round trips
4. For each entity, queries translation job queues and translation storage tables to determine:
   - Completed translations
   - Pending jobs
   - Missing languages
5. Returns an array of status summaries maintaining the same order as the input request
6. Supports batch sizes up to 100 entities per request

Each summary includes:
- `entityId`: The entity identifier
- `entityType`: The content type
- `coveragePercentage`: Percentage of languages with completed translations
- `completedCount`: Number of completed translations
- `pendingCount`: Number of pending or in-progress jobs
- `missingCount`: Number of languages with no translation or job
- `totalLanguages`: Count of all supported target languages (5)

---

## User Impact

- Dashboard list views render translation status for all visible items with a single API request
- Page load performance dramatically improves (single request vs hundreds)
- Property owners viewing lists see immediate translation status indicators
- Application remains responsive even when displaying large content lists

---

## Business Value

Enables performant translation management interfaces by providing batch status retrieval optimized for list rendering scenarios, improving overall application responsiveness and reducing server load from repetitive individual status queries.

---

## Technical Details

### File Location
`/src/app/api/translations/status/batch/route.ts`

### HTTP Method
POST

### Request Body
```typescript
interface BatchStatusRequest {
  entities: Array<{
    entityType: 'item' | 'article' | 'link' | 'tag';
    entityId: string;
  }>;
}
```

### Response Format
```typescript
interface BatchStatusResponse {
  success: boolean;
  data: Array<{
    entityId: string;
    entityType: 'item' | 'article' | 'link' | 'tag';
    coveragePercentage: number;
    completedCount: number;
    pendingCount: number;
    missingCount: number;
    totalLanguages: number;
  }>;
  error?: string;
}
```

### Supported Languages
The system supports 6 languages total: English (en), French (fr), Spanish (es), German (de), Dutch (nl), Italian (it). For a given entity, there are 5 target languages (excluding the source language).

### Authentication
Requires authenticated user with access to at least one of the queried entities.

---

## Architecture

### Data Flow

```
POST /api/translations/status/batch
    │
    ├── 1. Validate authentication (validateAdminAuth)
    │
    ├── 2. Parse and validate request body
    │       - Check entities array exists
    │       - Check array is not empty
    │       - Check batch size <= 100
    │       - Validate each entityType
    │
    ├── 3. Group entities by type for optimized queries
    │       - items: [...entityIds]
    │       - articles: [...entityIds]
    │       - links: [...entityIds]
    │       - tags: [...entityIds]
    │
    ├── 4. Batch query translation jobs (single query)
    │       SELECT entity_type, entity_id, target_language, status
    │       FROM translation_jobs
    │       WHERE (entity_type = 'item' AND entity_id IN (...))
    │          OR (entity_type = 'article' AND entity_id IN (...))
    │          ...
    │
    ├── 5. Batch query completed translations per entity type
    │       - item_translations WHERE item_id IN (...)
    │       - article_translations WHERE article_id IN (...)
    │       - link_translations WHERE link_id IN (...)
    │       - tag_translations WHERE tag_key IN (...)
    │
    ├── 6. Aggregate status for each entity
    │       - Map job statuses to pending counts
    │       - Map stored translations to completed counts
    │       - Calculate missing = total - completed - pending
    │       - Calculate coverage = (completed / total) * 100
    │
    └── 7. Return ordered response array (same order as input)
```

### Database Queries

#### Translation Jobs Query
```sql
SELECT entity_type, entity_id, target_language, status
FROM translation_jobs
WHERE (entity_type, entity_id) IN (
  ('item', 'id1'), ('item', 'id2'),
  ('article', 'id3'),
  ...
)
AND status IN ('queued', 'processing')
```

#### Translation Tables Queries (per entity type)
```sql
-- Items
SELECT item_id, language, translation_status
FROM item_translations
WHERE item_id IN ('id1', 'id2', ...)

-- Articles
SELECT article_id, language, translation_status
FROM article_translations
WHERE article_id IN ('id3', ...)

-- Links
SELECT link_id, language, translation_status
FROM link_translations
WHERE link_id IN ('id4', ...)

-- Tags
SELECT tag_key, language
FROM tag_translations
WHERE tag_key IN ('key1', ...)
```

---

## Dependencies

### Required (Must exist before implementation)

| Dependency | Location | Status |
|------------|----------|--------|
| Translation tables | Database | **Required** - item_translations, article_translations, link_translations, tag_translations |
| Translation jobs table | Database | **Required** - translation_jobs queue table |
| validateAdminAuth | `/src/lib/auth-server.ts` | **Exists** |
| Supabase client | `/src/lib/supabase.ts` | **Exists** |
| Database types | `/src/lib/supabase.ts` | **Exists** - includes translation table types |

### Related Requests

| REQ | Title | Relationship |
|-----|-------|--------------|
| REQ-264 | Translation Status Utilities | Provides batch status aggregation function (if implemented) |
| REQ-328 | Translation Status API Endpoint | Establishes individual status response patterns |
| REQ-227 | TypeScript Types for Translation Tables | Provides database type definitions |

---

## Implementation Tasks

### Task 1: Create Route Handler File

**File:** `/src/app/api/translations/status/batch/route.ts`

Create the route handler file with the POST handler skeleton:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

// Supported entity types
const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;
type EntityType = typeof VALID_ENTITY_TYPES[number];

// Supported languages (excluding source)
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
const TOTAL_TARGET_LANGUAGES = 5; // Source language excluded from target count

// Maximum batch size
const MAX_BATCH_SIZE = 100;

interface EntityRequest {
  entityType: EntityType;
  entityId: string;
}

interface EntityStatus {
  entityId: string;
  entityType: EntityType;
  coveragePercentage: number;
  completedCount: number;
  pendingCount: number;
  missingCount: number;
  totalLanguages: number;
}

export async function POST(request: NextRequest) {
  // Implementation follows in subsequent tasks
}
```

### Task 2: Implement Request Validation

Add request body parsing and validation within the POST handler:

```typescript
export async function POST(request: NextRequest) {
  const DEBUG_PREFIX = '[BATCH_STATUS]';

  try {
    // 1. Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const { user } = authResult;

    // 2. Parse request body
    let body: { entities?: EntityRequest[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 3. Validate entities array exists
    if (!body.entities) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: entities' },
        { status: 400 }
      );
    }

    // 4. Validate entities is an array
    if (!Array.isArray(body.entities)) {
      return NextResponse.json(
        { success: false, error: 'Field "entities" must be an array' },
        { status: 400 }
      );
    }

    // 5. Validate array is not empty
    if (body.entities.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one entity is required' },
        { status: 400 }
      );
    }

    // 6. Validate batch size
    if (body.entities.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { success: false, error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE} entities` },
        { status: 400 }
      );
    }

    // 7. Validate each entity object
    for (let i = 0; i < body.entities.length; i++) {
      const entity = body.entities[i];

      if (!entity.entityType) {
        return NextResponse.json(
          { success: false, error: `Entity at index ${i} is missing entityType` },
          { status: 400 }
        );
      }

      if (!entity.entityId) {
        return NextResponse.json(
          { success: false, error: `Entity at index ${i} is missing entityId` },
          { status: 400 }
        );
      }

      if (!VALID_ENTITY_TYPES.includes(entity.entityType as EntityType)) {
        return NextResponse.json(
          { success: false, error: `Entity at index ${i} has invalid entityType: "${entity.entityType}". Must be one of: ${VALID_ENTITY_TYPES.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const entities = body.entities as EntityRequest[];
    console.log(`${DEBUG_PREFIX} Processing batch status for ${entities.length} entities`);

    // Continue to Task 3...
  } catch (error) {
    console.error(`${DEBUG_PREFIX} Error:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Task 3: Implement Entity Grouping and Batch Job Query

Add logic to group entities by type and query translation jobs:

```typescript
// Group entities by type for optimized queries
const groupedEntities: Record<EntityType, string[]> = {
  item: [],
  article: [],
  link: [],
  tag: []
};

for (const entity of entities) {
  groupedEntities[entity.entityType].push(entity.entityId);
}

// Build conditions for translation_jobs query
const jobConditions: string[] = [];
const jobParams: string[] = [];

for (const [entityType, entityIds] of Object.entries(groupedEntities)) {
  if (entityIds.length > 0) {
    // We'll use .or() with multiple conditions
    jobConditions.push(`entity_type.eq.${entityType},entity_id.in.(${entityIds.join(',')})`);
  }
}

// Query pending/processing translation jobs
const { data: pendingJobs, error: jobsError } = await supabaseAdmin
  .from('translation_jobs')
  .select('entity_type, entity_id, target_language, status')
  .in('status', ['queued', 'processing'])
  .or(
    Object.entries(groupedEntities)
      .filter(([_, ids]) => ids.length > 0)
      .map(([type, ids]) => `and(entity_type.eq.${type},entity_id.in.(${ids.join(',')}))`)
      .join(',')
  );

if (jobsError) {
  console.error(`${DEBUG_PREFIX} Error querying translation jobs:`, jobsError);
  return NextResponse.json(
    { success: false, error: 'Failed to query translation status' },
    { status: 500 }
  );
}
```

### Task 4: Implement Batch Translation Queries

Query completed translations from each translation table:

```typescript
// Query completed translations for each entity type
const translationQueries: Promise<{ type: EntityType; data: any[] | null; error: any }>[] = [];

// Items
if (groupedEntities.item.length > 0) {
  translationQueries.push(
    supabaseAdmin
      .from('item_translations')
      .select('item_id, language, translation_status')
      .in('item_id', groupedEntities.item)
      .then(({ data, error }) => ({ type: 'item' as EntityType, data, error }))
  );
}

// Articles
if (groupedEntities.article.length > 0) {
  translationQueries.push(
    supabaseAdmin
      .from('article_translations')
      .select('article_id, language, translation_status')
      .in('article_id', groupedEntities.article)
      .then(({ data, error }) => ({ type: 'article' as EntityType, data, error }))
  );
}

// Links
if (groupedEntities.link.length > 0) {
  translationQueries.push(
    supabaseAdmin
      .from('link_translations')
      .select('link_id, language, translation_status')
      .in('link_id', groupedEntities.link)
      .then(({ data, error }) => ({ type: 'link' as EntityType, data, error }))
  );
}

// Tags
if (groupedEntities.tag.length > 0) {
  translationQueries.push(
    supabaseAdmin
      .from('tag_translations')
      .select('tag_key, language')
      .in('tag_key', groupedEntities.tag)
      .then(({ data, error }) => ({ type: 'tag' as EntityType, data, error }))
  );
}

// Execute all translation queries in parallel
const translationResults = await Promise.all(translationQueries);

// Check for errors
for (const result of translationResults) {
  if (result.error) {
    console.error(`${DEBUG_PREFIX} Error querying ${result.type} translations:`, result.error);
    return NextResponse.json(
      { success: false, error: 'Failed to query translation status' },
      { status: 500 }
    );
  }
}
```

### Task 5: Implement Status Aggregation

Aggregate job and translation data into status summaries:

```typescript
// Build lookup maps for efficient aggregation
// Map: entityType -> entityId -> Set of pending languages
const pendingMap = new Map<string, Map<string, Set<string>>>();
for (const type of VALID_ENTITY_TYPES) {
  pendingMap.set(type, new Map());
}

for (const job of pendingJobs || []) {
  const typeMap = pendingMap.get(job.entity_type);
  if (typeMap) {
    if (!typeMap.has(job.entity_id)) {
      typeMap.set(job.entity_id, new Set());
    }
    typeMap.get(job.entity_id)!.add(job.target_language);
  }
}

// Map: entityType -> entityId -> Set of completed languages
const completedMap = new Map<string, Map<string, Set<string>>>();
for (const type of VALID_ENTITY_TYPES) {
  completedMap.set(type, new Map());
}

for (const result of translationResults) {
  const typeMap = completedMap.get(result.type);
  if (typeMap && result.data) {
    for (const translation of result.data) {
      // Get the entity ID field based on type
      const entityId =
        result.type === 'item' ? translation.item_id :
        result.type === 'article' ? translation.article_id :
        result.type === 'link' ? translation.link_id :
        translation.tag_key;

      // Only count as completed if status is 'completed' or 'manual'
      // Tags don't have translation_status, they're always complete if they exist
      const isComplete =
        result.type === 'tag' ||
        translation.translation_status === 'completed' ||
        translation.translation_status === 'manual';

      if (isComplete) {
        if (!typeMap.has(entityId)) {
          typeMap.set(entityId, new Set());
        }
        typeMap.get(entityId)!.add(translation.language);
      }
    }
  }
}

// Build response array maintaining input order
const statusResults: EntityStatus[] = entities.map(entity => {
  const pendingLanguages = pendingMap.get(entity.entityType)?.get(entity.entityId) || new Set();
  const completedLanguages = completedMap.get(entity.entityType)?.get(entity.entityId) || new Set();

  const pendingCount = pendingLanguages.size;
  const completedCount = completedLanguages.size;
  const missingCount = Math.max(0, TOTAL_TARGET_LANGUAGES - completedCount - pendingCount);
  const coveragePercentage = Math.round((completedCount / TOTAL_TARGET_LANGUAGES) * 100);

  return {
    entityId: entity.entityId,
    entityType: entity.entityType,
    coveragePercentage,
    completedCount,
    pendingCount,
    missingCount,
    totalLanguages: TOTAL_TARGET_LANGUAGES
  };
});
```

### Task 6: Return Response with Cache Headers

Return the final response with appropriate headers:

```typescript
// Log batch processing
console.log(`${DEBUG_PREFIX} Batch status completed for ${entities.length} entities by user ${user.email}`);

// Return response with cache headers
return NextResponse.json(
  {
    success: true,
    data: statusResults
  },
  {
    status: 200,
    headers: {
      'Cache-Control': 'private, max-age=30',
      'Vary': 'Authorization'
    }
  }
);
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/translations/status/batch/route.ts` | Batch status endpoint handler |

### Files That May Be Modified (if needed)

| File Path | Potential Changes |
|-----------|-------------------|
| `/src/lib/supabase.ts` | No changes expected (types already exist) |
| `/src/types/index.ts` | May add BatchStatusRequest/Response types if centralizing |

### Existing Patterns to Follow

| Pattern | Source File | Usage |
|---------|-------------|-------|
| Authentication validation | `/src/lib/auth-server.ts` | Use `validateAdminAuth()` |
| Supabase admin client | `/src/lib/supabase.ts` | Use `supabaseAdmin` for queries |
| Response format | `/src/app/api/admin/items/route.ts` | Follow `{ success, data, error }` pattern |
| Error handling | `/src/app/api/admin/analytics/route.ts` | Follow 4xx/5xx status codes |
| Batch query patterns | `/src/app/api/admin/items/route.ts` | Use `Promise.all()` for parallel queries |

---

## Acceptance Criteria

- [ ] A route handler file is created at `/src/app/api/translations/status/batch/route.ts`
- [ ] The POST handler accepts a request body containing an entities array
- [ ] Each entity object in the array must include `entityType` and `entityId` properties
- [ ] Missing entities array returns 400 Bad Request with descriptive error message
- [ ] Empty entities array returns 400 Bad Request indicating at least one entity is required
- [ ] Batch size exceeding 100 entities returns 400 Bad Request with descriptive error message
- [ ] The handler validates each entityType is one of: 'item', 'article', 'link', 'tag'
- [ ] Invalid entityType values return 400 Bad Request identifying which entity has an invalid type
- [ ] The response returns an array of status objects in the same order as the input entities array
- [ ] Each status object includes `entityId`, `entityType`, and `coveragePercentage` fields
- [ ] Each status object includes `completedCount` indicating number of completed translations
- [ ] Each status object includes `pendingCount` indicating number of pending or in-progress jobs
- [ ] Each status object includes `missingCount` indicating number of languages with no translation or job
- [ ] Each status object includes `totalLanguages` indicating the count of all supported target languages
- [ ] The handler optimizes database queries to minimize round trips when retrieving status for multiple entities
- [ ] Non-existent entities return a status object with zero counts rather than failing the entire batch
- [ ] Database query errors return 500 Internal Server Error with generic error message
- [ ] The implementation integrates with authentication middleware to verify user is authenticated
- [ ] The handler logs batch status requests including entity count for monitoring purposes
- [ ] The response includes appropriate cache headers to support efficient polling of batch status
- [ ] The endpoint validates that entityId values are properly formatted strings

---

## Testing Considerations

### Unit Test Cases

1. **Valid batch request** - 10 entities of mixed types, expect ordered status array
2. **Empty entities array** - Expect 400 error
3. **Missing entities field** - Expect 400 error
4. **Batch size exceeds 100** - Expect 400 error
5. **Invalid entityType** - Expect 400 error with index
6. **Missing entityId** - Expect 400 error with index
7. **Non-existent entities** - Expect zero counts (not error)
8. **Unauthenticated request** - Expect 401 error

### Integration Test Cases

1. Query batch with entities that have completed translations
2. Query batch with entities that have pending jobs
3. Query batch with mix of complete, pending, missing
4. Query batch with entities from all 4 types
5. Verify response order matches input order
6. Verify cache headers are present

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large batches slow response | Medium | Medium | Enforce 100 entity limit, optimize queries |
| N+1 query problem | Low | High | Use batch queries with IN clauses, parallel Promise.all |
| Status calculation errors | Low | Medium | Unit test edge cases (zero counts, all complete, all pending) |
| Auth bypass | Low | High | Use existing validateAdminAuth pattern |

---

## Notes

- The endpoint does not verify entity existence - non-existent entities return zero counts
- Coverage percentage is calculated based on 5 target languages (total 6 minus source)
- Tags don't have `translation_status` field - existence implies completion
- Response maintains input order for predictable frontend mapping
- Cache-Control is set to 30 seconds for efficient dashboard polling
