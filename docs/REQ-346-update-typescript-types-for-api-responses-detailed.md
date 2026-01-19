# REQ-346: Update TypeScript Types for Content Translation API Responses - Detailed Task Breakdown

**Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.6
**Estimated Effort:** ~45 minutes

---

## Overview

This document provides granular, implementation-ready tasks for extending API response and request types to include translation job metadata and source language information. The implementation adds `translationJobIds?: string[]` to ItemResponse and ArticleResponse types, adds `sourceLanguage?: string` to CreateItemRequest and CreateArticleRequest types, and ensures all translation-related types are properly exported from the central types module.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 translation infrastructure is complete
- [ ] Translation service types exist at `/src/lib/translation-service/translation-service.types.ts`
- [ ] Job queue types exist at `/src/lib/job-queue/translation-jobs.types.ts`
- [ ] LocaleContext types are already exported in `/src/types/index.ts` (lines 673-681)

---

## Task Breakdown

### Task 1: Add `translationJobIds` field to ItemResponse.data

**File:** `/src/types/index.ts`
**Location:** Lines 125-166 (ItemResponse interface)
**Effort:** 5 minutes

**Current Code (lines 125-166):**
```typescript
export interface ItemResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description: string;
    qrCodeUrl?: string;
    qrCodeUploadedAt?: string;
    links: {
      id: string;
      articleId?: string;
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
    articles?: {
      id: string;
      purpose: PurposeType;
      title: string;
      description?: string;
      displayOrder: number;
      links: {
        id: string;
        title: string;
        linkType: LinkType;
        url: string;
        thumbnailUrl?: string;
        displayOrder: number;
      }[];
    }[];
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

**Required Change:**
Add `translationJobIds` field after the `articles` array (line ~159), before the closing brace of `data`:

```typescript
    articles?: {
      // ... existing fields
    }[];
    /** IDs of queued translation jobs returned after content creation/update (L10N Epic 3) */
    translationJobIds?: string[];
  };
```

**Acceptance Criteria:**
- [ ] `ItemResponse.data` includes optional `translationJobIds?: string[]` field
- [ ] JSDoc comment documents the field purpose
- [ ] Field is optional (using `?:`) for backward compatibility

---

### Task 2: Add `translationJobIds` field to ArticleResponse.data

**File:** `/src/types/index.ts`
**Location:** Lines 289-297 (ArticleResponse interface)
**Effort:** 5 minutes

**Current Code (lines 289-297):**
```typescript
export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

**Required Change:**
Extend the `data` type to include translation job IDs. Change `data?: ItemArticle` to use intersection type:

```typescript
export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle & {
    /** IDs of queued translation jobs returned after article creation/update (L10N Epic 3) */
    translationJobIds?: string[];
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

**Acceptance Criteria:**
- [ ] `ArticleResponse.data` extends `ItemArticle` with optional `translationJobIds?: string[]`
- [ ] JSDoc comment documents the field purpose
- [ ] `ItemArticle` properties remain accessible on `data`
- [ ] Field is optional for backward compatibility

---

### Task 3: Add `sourceLanguage` field to CreateItemRequest

**File:** `/src/types/index.ts`
**Location:** Lines 310-342 (CreateItemRequest interface)
**Effort:** 5 minutes

**Current Code (lines 310-342):**
```typescript
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  links: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
  articles?: {
    purpose: PurposeType;
    title: string;
    description?: string;
    displayOrder: number;
    links?: {
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
  }[];
}
```

**Required Change:**
Add `sourceLanguage` field after `tags` field (around line 315):

```typescript
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  /** Source language for translation (L10N Epic 3). Defaults to user/account preferred_language if not specified */
  sourceLanguage?: string;
  qrCodeUrl?: string;
  // ... rest of interface
}
```

**Acceptance Criteria:**
- [ ] `CreateItemRequest` includes optional `sourceLanguage?: string` field
- [ ] JSDoc comment explains the default behavior
- [ ] Field is optional for backward compatibility
- [ ] Placed logically with other optional metadata fields

---

### Task 4: Add `sourceLanguage` field to CreateArticleRequest

**File:** `/src/types/index.ts`
**Location:** Lines 243-262 (CreateArticleRequest interface)
**Effort:** 5 minutes

**Current Code (lines 243-262):**
```typescript
export interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  title?: string;
  description?: string;
  displayOrder?: number;
  links?: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
}
```

**Required Change:**
Add `sourceLanguage` field after `displayOrder` (around line 260):

```typescript
export interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  title?: string;
  description?: string;
  displayOrder?: number;
  /** Source language for translation (L10N Epic 3). Defaults to user/account preferred_language if not specified */
  sourceLanguage?: string;
  links?: {
    // ... existing link fields
  }[];
}
```

**Acceptance Criteria:**
- [ ] `CreateArticleRequest` includes optional `sourceLanguage?: string` field
- [ ] JSDoc comment explains the default behavior
- [ ] Field is optional for backward compatibility

---

### Task 5: Export translation-related types from central module

**File:** `/src/types/index.ts`
**Location:** End of file (after line 682)
**Effort:** 15 minutes

**Current End of File (lines 670-683):**
```typescript
// Admin types
export * from './admin';

// Locale/i18n types (REQ-250)
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';

```

**Required Change:**
Add translation service and job queue type exports after the existing locale exports:

```typescript
// Admin types
export * from './admin';

// Locale/i18n types (REQ-250)
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';

// Translation service types (REQ-346 - L10N Epic 3)
export type {
  TranslationStatus,
  TranslatableEntityType,
  TranslationContext,
  TranslationRequest,
  TranslationResponse,
  TranslationJob as TranslationServiceJob,
  TranslationJobStatus as TranslationServiceJobStatus,
  TranslationResult,
  LanguageInfo,
} from '@/lib/translation-service/translation-service.types';

export {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  getLanguageInfo,
  getOtherLanguages,
} from '@/lib/translation-service/translation-service.types';

// Job queue types (REQ-346 - L10N Epic 3)
export type {
  EntityType as TranslationEntityType,
  JobStatus as TranslationJobQueueStatus,
  TranslationJob as QueuedTranslationJob,
  CreateJobParams,
  CreateBatchJobsParams,
  JobQueueResult,
} from '@/lib/job-queue/translation-jobs.types';
```

**Note on Type Aliasing:**
- `SupportedLanguage` is already exported from `LocaleContext` - the translation-service version is compatible
- `TranslationJob` exists in both modules - use aliases to disambiguate:
  - `TranslationServiceJob` for the translation service version
  - `QueuedTranslationJob` for the job queue version
- `JobStatus` uses alias `TranslationJobQueueStatus` to avoid confusion with other status types
- `EntityType` uses alias `TranslationEntityType` for clarity

**Acceptance Criteria:**
- [ ] Core translation types exported: `TranslationStatus`, `TranslatableEntityType`, `TranslationContext`
- [ ] Translation request/response types exported: `TranslationRequest`, `TranslationResponse`, `TranslationResult`
- [ ] Job types exported with aliases to avoid conflicts
- [ ] Utility types and constants exported: `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE`, `LanguageInfo`
- [ ] Helper functions exported: `isSupportedLanguage`, `getLanguageInfo`, `getOtherLanguages`
- [ ] No naming conflicts with existing exports (LocaleContext types)
- [ ] Imports resolve correctly (no circular dependencies)

---

### Task 6: Verify TypeScript compilation

**Effort:** 10 minutes

**Commands to Run:**
```bash
# From project root
npx tsc --noEmit
```

**Verification Steps:**
1. Run TypeScript compilation with no emit
2. Verify no type errors in `/src/types/index.ts`
3. Verify no errors in files that import from `@/types`
4. Verify translation service types are accessible via central import

**Test Import Pattern:**
```typescript
// This import pattern should work after changes
import {
  ItemResponse,
  ArticleResponse,
  CreateItemRequest,
  CreateArticleRequest,
  TranslationStatus,
  TranslatableEntityType,
  TranslationEntityType,
  CreateJobParams,
  isSupportedLanguage,
  SUPPORTED_LANGUAGES,
} from '@/types';
```

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` completes without errors
- [ ] All existing type consumers continue to compile
- [ ] New type exports are accessible from `@/types`
- [ ] No circular dependency warnings

---

## Complete Code Changes Summary

### File: `/src/types/index.ts`

**Change 1:** Add to ItemResponse.data (around line 159)
```typescript
    /** IDs of queued translation jobs returned after content creation/update (L10N Epic 3) */
    translationJobIds?: string[];
```

**Change 2:** Modify ArticleResponse.data (lines 289-297)
```typescript
export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle & {
    /** IDs of queued translation jobs returned after article creation/update (L10N Epic 3) */
    translationJobIds?: string[];
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}
```

**Change 3:** Add to CreateItemRequest (around line 315)
```typescript
  /** Source language for translation (L10N Epic 3). Defaults to user/account preferred_language if not specified */
  sourceLanguage?: string;
```

**Change 4:** Add to CreateArticleRequest (around line 260)
```typescript
  /** Source language for translation (L10N Epic 3). Defaults to user/account preferred_language if not specified */
  sourceLanguage?: string;
```

**Change 5:** Add exports at end of file (after line 682)
```typescript
// Translation service types (REQ-346 - L10N Epic 3)
export type {
  TranslationStatus,
  TranslatableEntityType,
  TranslationContext,
  TranslationRequest,
  TranslationResponse,
  TranslationJob as TranslationServiceJob,
  TranslationJobStatus as TranslationServiceJobStatus,
  TranslationResult,
  LanguageInfo,
} from '@/lib/translation-service/translation-service.types';

export {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  getLanguageInfo,
  getOtherLanguages,
} from '@/lib/translation-service/translation-service.types';

// Job queue types (REQ-346 - L10N Epic 3)
export type {
  EntityType as TranslationEntityType,
  JobStatus as TranslationJobQueueStatus,
  TranslationJob as QueuedTranslationJob,
  CreateJobParams,
  CreateBatchJobsParams,
  JobQueueResult,
} from '@/lib/job-queue/translation-jobs.types';
```

---

## Acceptance Criteria Checklist

- [ ] `ItemResponse.data` type includes optional `translationJobIds` field (string array)
- [ ] `ArticleResponse.data` type includes optional `translationJobIds` field (string array)
- [ ] `CreateItemRequest` type includes optional `sourceLanguage` field (string)
- [ ] `CreateArticleRequest` type includes optional `sourceLanguage` field (string)
- [ ] Translation-related types are exported from `/src/types/index.ts`
- [ ] Existing API contracts remain backward compatible (all new fields optional)
- [ ] TypeScript compilation succeeds without errors after type updates
- [ ] No breaking changes to existing type consumers
- [ ] JSDoc comments document all new fields

---

## Testing Verification

### Manual Type Checking
After implementation, create a temporary test file to verify types work correctly:

```typescript
// test-types.ts (temporary - delete after verification)
import {
  ItemResponse,
  ArticleResponse,
  CreateItemRequest,
  CreateArticleRequest,
  TranslationStatus,
  isSupportedLanguage,
} from '@/types';

// Test ItemResponse with translation job IDs
const itemResponse: ItemResponse = {
  success: true,
  data: {
    id: '123',
    publicId: 'test-item',
    name: 'Test Item',
    description: 'Test description',
    links: [],
    translationJobIds: ['job-1', 'job-2'], // New field
  },
};

// Test CreateItemRequest with source language
const createItemRequest: CreateItemRequest = {
  publicId: 'new-item',
  name: 'New Item',
  description: 'Description',
  propertyId: 'prop-123',
  sourceLanguage: 'fr', // New field
  links: [],
};

// Test translation status type
const status: TranslationStatus = 'completed';

// Test type guard
if (isSupportedLanguage('fr')) {
  console.log('French is supported');
}
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type name conflicts with existing exports | Low | Low | Use aliased exports where conflicts exist |
| Circular import issues | Low | Medium | Import from specific type files, verify with tsc |
| Breaking existing consumers | Very Low | High | All new fields are optional; verify compilation |
| Translation types not yet available | Low | Medium | Verify Epic 1 completion before starting |

---

## Dependencies

### Upstream (Required Before This Task)
- Epic 1 translation infrastructure complete
- `/src/lib/translation-service/translation-service.types.ts` exists
- `/src/lib/job-queue/translation-jobs.types.ts` exists

### Downstream (Depends on This Task)
- Task 2.2: Modify Items API to trigger translations
- Task 2.3: Modify Articles API to trigger translations
- Task 2.4: Modify Links API to trigger translations
- Epic 4: Guest Experience (consume translation types)
- Epic 5: Owner Translation Management (consume translation types)

---

## References

- Overview Document: `/docs/REQ-346-update-typescript-types-for-api-responses-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 2.6)
- Request: `/docs/gen_requests_epic3.md` (REQ-346)
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
- Job Queue Types: `/src/lib/job-queue/translation-jobs.types.ts`
- Existing Type Definitions: `/src/types/index.ts`
