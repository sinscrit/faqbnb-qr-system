# REQ-264: Implement Translation Status Utilities - Overview

**Date Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Type:** NEW FEATURE
**Size:** M
**Phase:** 1 - Content Translation Infrastructure
**Task ID:** 1.6
**Implementation Plan Reference:** Plan-111-L10N-Epic3-Dynamic-Content-Translation.md

---

## Summary

This task implements utility functions that aggregate translation job queue status with stored translation records to report comprehensive translation availability and completion status for individual entities and entity batches. The utilities enable property owners and the application to track translation progress and identify which languages are complete, pending, or missing.

---

## Current Behavior

No consolidated mechanism exists to determine the translation status of user-generated content entities. Property owners and the application cannot easily answer questions like:
- "Are all my property descriptions fully translated?"
- "Which languages are missing for this amenity?"
- "What is the overall translation status of my content?"

Without aggregated status information, tracking translation progress requires manual cross-referencing between job queues and translation storage tables.

---

## Expected Behavior

When translation status is requested for a content entity (item, article, link, or tag), the system provides a function that:
1. Accepts the entity type and identifier
2. Queries both the translation job queue and stored translation tables
3. Returns a comprehensive status report indicating:
   - Which languages have completed translations
   - Which languages have pending translation jobs
   - Which languages have no translation activity

For batch queries involving multiple entities, the system efficiently retrieves status for all requested entities in a single operation and returns an array of status results maintaining the order of the input request.

---

## Technical Approach

### Architecture

The translation status utilities will be implemented in:
```
/src/lib/content-translation/storage/translation-status.ts
```

This follows the module structure defined in the Epic 3 implementation plan and aligns with existing utility patterns in the codebase (see `src/lib/analytics.ts`, `src/lib/item-utils.ts`).

### Key Functions

#### 1. `getEntityTranslationStatus`
```typescript
async function getEntityTranslationStatus(
  entityType: EntityType,
  entityId: string
): Promise<TranslationStatusResult>
```

**Purpose:** Returns comprehensive translation status for a single entity.

**Logic:**
1. Query the `translation_jobs` table for jobs matching the entity type and ID
2. Query the appropriate translation table (`item_translations`, `article_translations`, `link_translations`, or `tag_translations`) based on entity type
3. Aggregate results to determine:
   - `completedLanguages`: Languages with stored translations (status = 'completed' or 'manual')
   - `pendingLanguages`: Languages with queued/processing jobs but no stored translation
   - `failedLanguages`: Languages where jobs failed and no translation exists
   - `missingLanguages`: Target languages with neither jobs nor translations
4. Calculate `overallStatus` based on aggregation:
   - `'complete'`: All target languages have translations
   - `'partial'`: Some languages translated, some pending/missing
   - `'pending'`: Jobs exist but none completed
   - `'failed'`: All jobs failed with no translations

#### 2. `getBatchTranslationStatus`
```typescript
async function getBatchTranslationStatus(
  entities: Array<{ type: EntityType; id: string }>
): Promise<TranslationStatusResult[]>
```

**Purpose:** Efficiently retrieves status for multiple entities in a single operation.

**Logic:**
1. Group entities by type for optimized queries
2. Batch query translation jobs using `IN` clause for entity IDs
3. Batch query translation tables using `IN` clause
4. Map results back to input order
5. Return array maintaining input order

### Types Required

The following types will be imported from `content-translation.types.ts` (created in REQ-259):

```typescript
export type EntityType = 'item' | 'article' | 'link' | 'tag';

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface TranslationStatusResult {
  entityId: string;
  entityType: EntityType;
  sourceLanguage: SupportedLanguage;
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
  translations: Record<SupportedLanguage, LanguageTranslationStatus>;
  completedLanguages: SupportedLanguage[];
  pendingLanguages: SupportedLanguage[];
  failedLanguages: SupportedLanguage[];
  missingLanguages: SupportedLanguage[];
  lastUpdatedAt?: string;
}

export interface LanguageTranslationStatus {
  status: 'pending' | 'completed' | 'failed' | 'manual' | 'missing';
  translatedAt?: string;
  reviewedBy?: string;
  error?: string;
  jobId?: string;
}
```

### Database Dependencies

This implementation depends on database tables from Epic 1 (Plan-110):

| Table | Purpose |
|-------|---------|
| `translation_jobs` | Job queue status (queued, processing, completed, failed) |
| `item_translations` | Stored translations for items |
| `article_translations` | Stored translations for articles |
| `link_translations` | Stored translations for links |
| `tag_translations` | Stored translations for tags |

**Note:** These tables must exist before this task can be implemented. Verify Epic 1 completion.

### Query Optimization

For batch operations:
- Use `IN` clause with array of entity IDs to minimize database round trips
- Group queries by entity type to leverage appropriate indexes
- Limit batch sizes if necessary (recommend max 100 entities per batch)
- Use `Promise.all` for parallel queries when querying different tables

### Error Handling

Following the pattern established in `src/lib/analytics.ts`:
- Log errors with context using `console.error`
- Throw descriptive errors for caller to handle
- Gracefully handle empty result sets (return empty arrays, zero counts)
- Validate entity types and IDs before querying

---

## Dependencies

### Prerequisites (Must Complete First)
- **REQ-259**: Content Translation Module Structure and Type Definitions
  - Provides `EntityType`, `TranslationStatusResult`, and related types
- **Epic 1 (Plan-110)**: Foundation infrastructure
  - Translation database tables must exist
  - Job queue infrastructure must be operational

### Related Tasks (Same Phase)
- **REQ-263 (Task 1.5)**: Translation Storage Utilities
  - Provides functions for storing translations (status utilities query these tables)

---

## Acceptance Criteria

- [ ] A `getEntityTranslationStatus` function accepts entity type and entity identifier parameters
- [ ] The function queries the translation job queue to identify pending or in-progress translation jobs for the entity
- [ ] The function queries the appropriate translation storage table to identify completed translations for the entity
- [ ] The function returns a `TranslationStatusResult` indicating completed languages, pending languages, and missing languages
- [ ] The `TranslationStatusResult` includes timestamp metadata for when translations were last updated
- [ ] A `getBatchTranslationStatus` function accepts an array of entity type and identifier pairs
- [ ] The batch function returns an array of `TranslationStatusResult` objects maintaining input order
- [ ] The batch function optimizes database queries to minimize round trips when retrieving status for multiple entities
- [ ] Both functions handle database query errors gracefully and provide meaningful error messages
- [ ] The implementation is located at `/src/lib/content-translation/storage/translation-status.ts`
- [ ] All status utility functions are properly exported and importable by other application modules
- [ ] The utilities integrate with both the translation job queue and translation storage schemas

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/storage/translation-status.ts` | Translation status utility functions |

### Functions to Implement

| Function | Signature | Description |
|----------|-----------|-------------|
| `getEntityTranslationStatus` | `(entityType: EntityType, entityId: string) => Promise<TranslationStatusResult>` | Get translation status for a single entity |
| `getBatchTranslationStatus` | `(entities: {type: EntityType, id: string}[]) => Promise<TranslationStatusResult[]>` | Get translation status for multiple entities |

### Supporting Internal Functions (Private)

| Function | Purpose |
|----------|---------|
| `queryTranslationJobs` | Query translation_jobs table for entity |
| `queryItemTranslations` | Query item_translations table |
| `queryArticleTranslations` | Query article_translations table |
| `queryLinkTranslations` | Query link_translations table |
| `queryTagTranslations` | Query tag_translations table |
| `aggregateTranslationStatus` | Combine job and translation data into status result |
| `calculateOverallStatus` | Determine overall status from language statuses |
| `getTargetLanguages` | Return list of target languages (all except source) |

### Files to Modify

| File Path | Change Description |
|-----------|-------------------|
| `/src/lib/content-translation/index.ts` | Export status utility functions |

### Database Tables Accessed (Read Only)

| Table | Operation |
|-------|-----------|
| `translation_jobs` | SELECT - Query job status |
| `item_translations` | SELECT - Query stored translations |
| `article_translations` | SELECT - Query stored translations |
| `link_translations` | SELECT - Query stored translations |
| `tag_translations` | SELECT - Query stored translations |

---

## Implementation Notes

### Coding Patterns to Follow

Based on existing codebase analysis:

1. **Supabase Client Usage** (from `src/lib/analytics.ts`):
   ```typescript
   import { supabase } from '@/lib/supabase';

   const { data, error } = await supabase
     .from('table_name')
     .select('columns')
     .eq('column', value);

   if (error) {
     console.error('Error message:', error);
     throw new Error('User-friendly error message');
   }
   ```

2. **Type Exports** (from `src/types/index.ts`):
   - Export all public types from module index
   - Use explicit interface definitions
   - Include JSDoc comments for public APIs

3. **Error Handling** (from `src/lib/analytics.ts`):
   - Wrap database operations in try-catch
   - Log errors with context
   - Return meaningful error messages

4. **Empty State Handling** (from `src/lib/analytics.ts`):
   ```typescript
   if (entityIds.length === 0) {
     return {
       // Return valid empty state
     };
   }
   ```

### Supported Languages Constant

```typescript
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
```

### Overall Status Calculation Logic

```typescript
function calculateOverallStatus(
  completedCount: number,
  pendingCount: number,
  failedCount: number,
  totalTargetLanguages: number
): 'complete' | 'partial' | 'pending' | 'failed' {
  if (completedCount === totalTargetLanguages) return 'complete';
  if (completedCount > 0) return 'partial';
  if (pendingCount > 0) return 'pending';
  if (failedCount > 0) return 'failed';
  return 'pending'; // No translations yet
}
```

---

## Testing Considerations

### Unit Tests
- Test `getEntityTranslationStatus` with various job/translation combinations
- Test `getBatchTranslationStatus` preserves input order
- Test error handling for invalid entity types
- Test empty result scenarios
- Test overall status calculation logic

### Integration Tests
- Verify correct table queries for each entity type
- Verify batch optimization reduces database calls
- Test with real database containing translation jobs and stored translations

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 tables don't exist | Medium | Critical | Verify Epic 1 completion before implementation |
| Batch query performance | Low | Medium | Implement pagination/chunking for large batches |
| Type mismatches with Epic 1 schema | Low | Medium | Coordinate type definitions with REQ-259 |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Request Definition:** `/docs/gen_requests_epic3.md` (REQ-264)
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Similar Patterns:** `/src/lib/analytics.ts`, `/src/lib/item-utils.ts`
