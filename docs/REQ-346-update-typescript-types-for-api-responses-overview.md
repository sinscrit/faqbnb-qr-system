# REQ-346: Update TypeScript Types for Content Translation API Responses - Implementation Overview

**Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.6

---

## Summary

Extend API response and request types to include translation job metadata and source language information. This task adds `translationJobIds?: string[]` to ItemResponse and ArticleResponse types, adds `sourceLanguage?: string` to CreateItemRequest and CreateArticleRequest types, and ensures all translation-related types are properly exported from the central types module.

---

## Current Behavior

API response types for items, articles, and links (`ItemResponse`, `ArticleResponse`, `CreateItemRequest`, `CreateArticleRequest` in `/src/types/index.ts`) do not expose translation job identifiers or source language metadata. Client applications cannot:
- Track translation status after content creation/update
- Determine the original language of content
- Access translation job IDs returned from content APIs

---

## Expected Behavior

1. **Response types include translation job tracking:**
   - `ItemResponse.data` includes optional `translationJobIds?: string[]`
   - `ArticleResponse.data` includes optional `translationJobIds?: string[]`

2. **Request types allow source language specification:**
   - `CreateItemRequest` includes optional `sourceLanguage?: string`
   - `CreateArticleRequest` includes optional `sourceLanguage?: string`

3. **Translation types are centrally exported:**
   - All content-translation related types exported from `/src/types/index.ts`
   - Types imported from existing translation service modules

4. **Backward compatibility maintained:**
   - All new fields are optional
   - Existing API consumers continue to work without modification

---

## Technical Approach

### Pattern Analysis

The project follows consistent patterns for type definitions:

1. **Type files location:** `/src/types/index.ts` is the central type barrel file
2. **Type structure:** Types use camelCase for optional fields with JSDoc comments
3. **Re-exports pattern:** Types from other modules are re-exported using `export type {...} from '...'`
4. **Existing translation types:** Already defined in:
   - `/src/lib/translation-service/translation-service.types.ts` - Core translation types
   - `/src/lib/job-queue/translation-jobs.types.ts` - Job queue types
   - `/src/contexts/LocaleContext.tsx` - Locale types (already exported from index.ts)

### Implementation Steps

1. **Add `translationJobIds` to ItemResponse.data:**
   - Location: Line ~125-166 in `/src/types/index.ts`
   - Add optional field: `translationJobIds?: string[];`

2. **Add `translationJobIds` to ArticleResponse:**
   - Location: Line ~289-297 in `/src/types/index.ts`
   - Add to the `ArticleResponse.data` type (ItemArticle includes optional fields)

3. **Add `sourceLanguage` to CreateItemRequest:**
   - Location: Line ~310-342 in `/src/types/index.ts`
   - Add optional field: `sourceLanguage?: string;`

4. **Add `sourceLanguage` to CreateArticleRequest:**
   - Location: Line ~243-262 in `/src/types/index.ts`
   - Add optional field: `sourceLanguage?: string;`

5. **Export translation-related types:**
   - Add re-exports from translation-service module
   - Export key types: `SupportedLanguage`, `TranslatableEntityType`, `TranslationStatus`, etc.

---

## Authorized Files and Functions for Modification

### Files to Modify

| File | Purpose | Changes Required |
|------|---------|------------------|
| `/src/types/index.ts` | Central type definitions | Add translation fields to response/request types, add translation type exports |

### Specific Modifications

#### 1. `/src/types/index.ts`

**Add to `ItemResponse.data` interface (around line 125-166):**
```typescript
export interface ItemResponse {
  success: boolean;
  data?: {
    // ... existing fields ...
    /** IDs of queued translation jobs (L10N Epic 3) */
    translationJobIds?: string[];
  };
  // ... rest of interface
}
```

**Add to `ArticleResponse` interface (around line 289-297):**
```typescript
export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle & {
    /** IDs of queued translation jobs (L10N Epic 3) */
    translationJobIds?: string[];
  };
  // ... rest of interface
}
```

**Add to `CreateItemRequest` interface (around line 310-342):**
```typescript
export interface CreateItemRequest {
  // ... existing fields ...
  /** Source language for translation (L10N Epic 3). Defaults to user/account preference if not specified */
  sourceLanguage?: string;
}
```

**Add to `CreateArticleRequest` interface (around line 243-262):**
```typescript
export interface CreateArticleRequest {
  // ... existing fields ...
  /** Source language for translation (L10N Epic 3). Defaults to user/account preference if not specified */
  sourceLanguage?: string;
}
```

**Add translation type exports (at end of file):**
```typescript
// Translation service types (REQ-346)
export type {
  SupportedLanguage as TranslationSupportedLanguage,
  TranslationStatus,
  TranslatableEntityType,
  TranslationContext,
  TranslationJob,
  TranslationJobStatus,
} from '@/lib/translation-service/translation-service.types';

// Job queue types (REQ-346)
export type {
  EntityType as TranslationEntityType,
  JobStatus as TranslationJobStatus,
  CreateJobParams,
  CreateBatchJobsParams,
} from '@/lib/job-queue/translation-jobs.types';
```

---

## Dependencies

### Prerequisites
- Epic 1 translation infrastructure complete (translation-service module, job-queue module)
- Translation type definitions exist in:
  - `/src/lib/translation-service/translation-service.types.ts`
  - `/src/lib/job-queue/translation-jobs.types.ts`

### Downstream Impact
- API handlers in Tasks 2.2-2.5 will use these extended types
- Frontend components displaying translation status will consume these types
- Epic 4 (Guest Experience) and Epic 5 (Owner Translation Management) depend on these types

---

## Acceptance Criteria

- [ ] `ItemResponse.data` type includes optional `translationJobIds` field (string array)
- [ ] `ArticleResponse.data` type includes optional `translationJobIds` field (string array)
- [ ] `CreateItemRequest` type includes optional `sourceLanguage` field (string)
- [ ] `CreateArticleRequest` type includes optional `sourceLanguage` field (string)
- [ ] Translation-related types are exported from `/src/types/index.ts`
- [ ] Existing API contracts remain backward compatible (all new fields optional)
- [ ] TypeScript compilation succeeds without errors after type updates
- [ ] No breaking changes to existing type consumers

---

## Testing Requirements

1. **TypeScript Compilation:**
   - Run `npx tsc --noEmit` to verify no type errors
   - Verify existing code continues to compile

2. **Type Inference:**
   - Verify response types properly infer optional fields
   - Verify imports work from both direct paths and barrel exports

3. **Backward Compatibility:**
   - Existing API handlers compile without modification
   - Existing frontend components compile without modification

---

## Implementation Notes

1. **Type aliasing for disambiguation:**
   - `SupportedLanguage` is already exported from `LocaleContext`
   - Use `TranslationSupportedLanguage` alias to avoid conflicts
   - Similarly use `TranslationEntityType` and `TranslationJobStatus` aliases

2. **Optional fields pattern:**
   - All new fields use `?:` optional modifier
   - Follows existing codebase conventions

3. **JSDoc comments:**
   - Include brief description with (L10N Epic 3) reference
   - Follows existing documentation style in types file

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type name conflicts | Low | Low | Use aliased exports where conflicts exist |
| Circular import issues | Low | Medium | Import from specific type files, not barrel exports |
| Breaking existing consumers | Very Low | High | All new fields are optional; verify compilation |

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Modify response types | 10 min |
| Modify request types | 10 min |
| Add type exports | 15 min |
| Verify compilation | 10 min |
| **Total** | ~45 min |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 2.6)
- Request: `/docs/gen_requests_epic3.md` (REQ-346)
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
- Existing Type Definitions: `/src/types/index.ts`
