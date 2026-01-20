# Detailed Task Breakdown: REQ-E03-012 - Update TypeScript Types for API Responses

**Request ID:** REQ-E03-012
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.6
**Type:** ENHANCEMENT
**Size:** S (Small)
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 20:15 UTC

---

## Document References

| Document | Path |
|----------|------|
| Overview Document | `/docs/REQ-E03-012-update-typescript-types-for-api-responses-overview.md` |
| Epic Requirements | `/docs/gen_requests_epic3.md` (REQ-E03-012) |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` |
| Target File | `/src/types/index.ts` |

---

## Summary

Update TypeScript type definitions in `/src/types/index.ts` to support the multilingual content translation infrastructure by:
1. Adding translation tracking fields (`translationJobIds`, `translationError`, `queuedLanguages`) to `ItemResponse` and `ArticleResponse`
2. Adding source language specification (`sourceLanguage`) to `CreateItemRequest` and `CreateArticleRequest`
3. Re-exporting content translation types from `@/lib/content-translation` module

All changes are backward-compatible (optional fields only), ensuring existing API consumers continue to function.

---

## Prerequisites

### Required Dependencies (Must Exist)

| Dependency | Location | Status Check |
|------------|----------|--------------|
| `SupportedLanguage` type | `/src/contexts/LocaleContext.tsx` | Already exported in `/src/types/index.ts` (lines 674-679) |
| Content translation module | `/src/lib/content-translation/index.ts` | REQ-E03-001 must be complete |
| Content translation types | `/src/lib/content-translation/content-translation.types.ts` | REQ-E03-001 must be complete |

### Pre-Implementation Verification

Before starting implementation, verify:

```bash
# 1. Check SupportedLanguage is exported (should return line ~674)
grep -n "SupportedLanguage" src/types/index.ts

# 2. Check content translation module exists
ls -la src/lib/content-translation/

# 3. Check content translation types file exists
ls -la src/lib/content-translation/content-translation.types.ts

# 4. Verify module exports
grep "export" src/lib/content-translation/index.ts
```

**CRITICAL:** If the content translation module does not exist, complete REQ-E03-001 first.

---

## Current State Analysis

### File: `/src/types/index.ts`

**File Statistics:**
- Total lines: 683
- Last significant section: Locale/i18n types (lines 673-681)

**Types to Modify:**

| Type | Current Location | Fields to Add |
|------|-----------------|---------------|
| `ItemResponse` | Lines 125-166 | `translationJobIds?`, `translationError?`, `queuedLanguages?` |
| `ArticleResponse` | Lines 289-297 | `translationJobIds?`, `translationError?`, `queuedLanguages?` |
| `CreateItemRequest` | Lines 310-342 | `sourceLanguage?` |
| `CreateArticleRequest` | Lines 243-262 | `sourceLanguage?` |

**Current Type Structures:**

```typescript
// ItemResponse (lines 125-166) - current state
export interface ItemResponse {
  success: boolean;
  data?: { /* item data */ };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

// ArticleResponse (lines 289-297) - current state
export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

// CreateItemRequest (lines 310-342) - current state
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  links: { /* ... */ }[];
  articles?: { /* ... */ }[];
}

// CreateArticleRequest (lines 243-262) - current state
export interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  title?: string;
  description?: string;
  displayOrder?: number;
  links?: { /* ... */ }[];
}
```

---

## Detailed Implementation Tasks

### Task 1: Add Translation Fields to ItemResponse (XS)

**Priority:** Required
**Dependencies:** None
**Estimated Size:** XS (2-3 lines)

**Location:** `/src/types/index.ts`, lines 162-165 (after `accountContext`, before closing brace)

**Implementation:**

Add the following fields before the closing brace of `ItemResponse`:

```typescript
// File: /src/types/index.ts
// Insert after line 165 (accountContext closing brace), before line 166 (ItemResponse closing brace)

  /**
   * Array of translation job IDs for status tracking.
   * Populated when translation jobs are queued during item creation or updates.
   * Empty array if translation queuing was skipped or failed.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationJobIds?: string[];

  /**
   * Translation error message if queuing failed.
   * Item creation/update succeeds even if translation fails.
   * Only present when there was an error during translation queuing.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationError?: string;

  /**
   * Languages queued for translation.
   * Contains the target languages (excludes source language).
   * @since Epic 3 - Dynamic Content Translation
   */
  queuedLanguages?: SupportedLanguage[];
```

**Verification:**
```bash
# After edit, verify fields are added
grep -A 5 "translationJobIds" src/types/index.ts
```

---

### Task 2: Add Translation Fields to ArticleResponse (XS)

**Priority:** Required
**Dependencies:** None
**Estimated Size:** XS (2-3 lines)

**Location:** `/src/types/index.ts`, lines 294-296 (after `accountContext`, before closing brace)

**Implementation:**

Add the following fields before the closing brace of `ArticleResponse`:

```typescript
// File: /src/types/index.ts
// Insert after line 296 (accountContext closing brace), before line 297 (ArticleResponse closing brace)

  /**
   * Array of translation job IDs for status tracking.
   * Populated when translation jobs are queued during article creation or updates.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationJobIds?: string[];

  /**
   * Translation error message if queuing failed.
   * Article creation/update succeeds even if translation fails.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationError?: string;

  /**
   * Languages queued for translation.
   * @since Epic 3 - Dynamic Content Translation
   */
  queuedLanguages?: SupportedLanguage[];
```

**Verification:**
```bash
# After edit, verify ArticleResponse has translation fields
grep -B 2 -A 10 "interface ArticleResponse" src/types/index.ts
```

---

### Task 3: Add sourceLanguage to CreateArticleRequest (XS)

**Priority:** Required
**Dependencies:** None
**Estimated Size:** XS (1-2 lines)

**Location:** `/src/types/index.ts`, lines 260-261 (after `links` field, before closing brace)

**Implementation:**

Add the following field before the closing brace of `CreateArticleRequest`:

```typescript
// File: /src/types/index.ts
// Insert after line 261 (links field closing brace + semicolon), before line 262 (CreateArticleRequest closing brace)

  /**
   * Optional source language override for translations.
   * If not provided, source language is detected from user/account preferences.
   * @see detectSourceLanguage() in @/lib/content-translation
   * @since Epic 3 - Dynamic Content Translation
   */
  sourceLanguage?: SupportedLanguage;
```

**Verification:**
```bash
# After edit, verify CreateArticleRequest has sourceLanguage
grep -B 5 -A 15 "interface CreateArticleRequest" src/types/index.ts
```

---

### Task 4: Add sourceLanguage to CreateItemRequest (XS)

**Priority:** Required
**Dependencies:** None
**Estimated Size:** XS (1-2 lines)

**Location:** `/src/types/index.ts`, lines 340-341 (after `articles` field, before closing brace)

**Implementation:**

Add the following field before the closing brace of `CreateItemRequest`:

```typescript
// File: /src/types/index.ts
// Insert after line 341 (articles field closing brace + semicolon), before line 342 (CreateItemRequest closing brace)

  /**
   * Optional source language override for translations.
   * If not provided, source language is detected from user/account preferences.
   * @see detectSourceLanguage() in @/lib/content-translation
   * @since Epic 3 - Dynamic Content Translation
   */
  sourceLanguage?: SupportedLanguage;
```

**Verification:**
```bash
# After edit, verify CreateItemRequest has sourceLanguage
grep -B 5 -A 5 "sourceLanguage" src/types/index.ts
```

---

### Task 5: Add Content Translation Type Re-exports (S)

**Priority:** Required
**Dependencies:** REQ-E03-001 (content translation module must exist)
**Estimated Size:** S (5-10 lines)

**Location:** `/src/types/index.ts`, after line 681 (after existing locale exports)

**Implementation:**

Add a new section at the end of the file for content translation type exports:

```typescript
// File: /src/types/index.ts
// Insert after line 681 (after SUPPORTED_LOCALES export)

// Content Translation types (Epic 3 - Dynamic Content Translation)
export type {
  EntityType as ContentEntityType,
  TranslationTrigger,
  ContentToTranslate,
  TranslatableField,
  QueueTranslationOptions,
  QueueTranslationResult,
  LanguageTranslationStatus,
  TranslationStatusResult,
  EntityTranslationStatus,
  TranslationContextKey,
} from '@/lib/content-translation';

export { TRANSLATION_CONTEXTS } from '@/lib/content-translation';
```

**Note:** `EntityType` is aliased to `ContentEntityType` to avoid potential naming conflicts with other entity type definitions in the codebase.

**Verification:**
```bash
# After edit, verify exports are added
grep -A 15 "Content Translation types" src/types/index.ts
```

---

### Task 6: Verify TypeScript Compilation (XS)

**Priority:** Required
**Dependencies:** Tasks 1-5 complete
**Estimated Size:** XS

**Actions:**

1. Run TypeScript build to verify no compilation errors:
```bash
npm run build
```

2. Expected outcomes:
   - No TypeScript errors related to translation fields
   - No duplicate identifier errors
   - No import errors for content translation module
   - Build completes successfully

3. If errors occur:
   - Check that `SupportedLanguage` is properly exported from LocaleContext
   - Verify content translation module exists and exports all required types
   - Ensure no typos in field names or type references

---

### Task 7: Verify Type Imports (XS - Recommended)

**Priority:** Recommended (for validation)
**Dependencies:** Task 6 complete
**Estimated Size:** XS

**Actions:**

Create a temporary verification file to ensure types are importable:

```typescript
// Temporary file: /src/tests/type-verification-e03-012.ts
// DELETE after verification

import type {
  // Response types with new fields
  ItemResponse,
  ArticleResponse,
  // Request types with new fields
  CreateItemRequest,
  CreateArticleRequest,
  // Re-exported content translation types
  ContentEntityType,
  TranslationTrigger,
  ContentToTranslate,
  TranslatableField,
  QueueTranslationOptions,
  QueueTranslationResult,
  LanguageTranslationStatus,
  TranslationStatusResult,
  EntityTranslationStatus,
  TranslationContextKey,
  SupportedLanguage,
} from '@/types';

import { TRANSLATION_CONTEXTS } from '@/types';

// Verify ItemResponse has translation fields
const testItemResponse: ItemResponse = {
  success: true,
  translationJobIds: ['job-1', 'job-2'],
  translationError: undefined,
  queuedLanguages: ['fr', 'es', 'de'],
};

// Verify ArticleResponse has translation fields
const testArticleResponse: ArticleResponse = {
  success: true,
  translationJobIds: ['job-3'],
  queuedLanguages: ['nl', 'it'],
};

// Verify CreateItemRequest has sourceLanguage
const testCreateItemRequest: CreateItemRequest = {
  publicId: 'test-123',
  name: 'Test Item',
  description: 'Test description',
  propertyId: 'prop-123',
  links: [],
  sourceLanguage: 'en',
};

// Verify CreateArticleRequest has sourceLanguage
const testCreateArticleRequest: CreateArticleRequest = {
  itemId: 'item-123',
  purpose: 'how-to-use',
  sourceLanguage: 'fr',
};

// Verify ContentEntityType is available
const testEntityType: ContentEntityType = 'item';

// Verify TRANSLATION_CONTEXTS is available
const context = TRANSLATION_CONTEXTS.item_name;

// If this file compiles without errors, types are correctly defined
console.log('Type verification passed');
```

**Verification Commands:**
```bash
# Run TypeScript check on verification file
npx tsc --noEmit src/tests/type-verification-e03-012.ts

# Delete verification file after success
rm src/tests/type-verification-e03-012.ts
```

---

## Code Changes Summary

### Before Implementation

```typescript
// /src/types/index.ts (relevant sections)

export interface ItemResponse {
  success: boolean;
  data?: { /* ... */ };
  error?: string;
  accountContext?: { /* ... */ };
}

export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: { /* ... */ };
}

export interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  // ... other fields ...
  links?: { /* ... */ }[];
}

export interface CreateItemRequest {
  publicId: string;
  name: string;
  // ... other fields ...
  articles?: { /* ... */ }[];
}

// Locale/i18n types (REQ-250)
export type { SupportedLanguage, /* ... */ } from '@/contexts/LocaleContext';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';
```

### After Implementation

```typescript
// /src/types/index.ts (relevant sections)

export interface ItemResponse {
  success: boolean;
  data?: { /* ... */ };
  error?: string;
  accountContext?: { /* ... */ };
  translationJobIds?: string[];           // NEW
  translationError?: string;              // NEW
  queuedLanguages?: SupportedLanguage[];  // NEW
}

export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: { /* ... */ };
  translationJobIds?: string[];           // NEW
  translationError?: string;              // NEW
  queuedLanguages?: SupportedLanguage[];  // NEW
}

export interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  // ... other fields ...
  links?: { /* ... */ }[];
  sourceLanguage?: SupportedLanguage;     // NEW
}

export interface CreateItemRequest {
  publicId: string;
  name: string;
  // ... other fields ...
  articles?: { /* ... */ }[];
  sourceLanguage?: SupportedLanguage;     // NEW
}

// Locale/i18n types (REQ-250)
export type { SupportedLanguage, /* ... */ } from '@/contexts/LocaleContext';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';

// Content Translation types (Epic 3 - Dynamic Content Translation)  // NEW SECTION
export type {
  EntityType as ContentEntityType,
  TranslationTrigger,
  ContentToTranslate,
  TranslatableField,
  QueueTranslationOptions,
  QueueTranslationResult,
  LanguageTranslationStatus,
  TranslationStatusResult,
  EntityTranslationStatus,
  TranslationContextKey,
} from '@/lib/content-translation';

export { TRANSLATION_CONTEXTS } from '@/lib/content-translation';
```

---

## Acceptance Criteria Checklist

### Type Extensions

| Criteria | Task | Status |
|----------|------|--------|
| ItemResponse includes `translationJobIds?: string[]` | Task 1 | [x] |
| ItemResponse includes `translationError?: string` | Task 1 | [x] |
| ItemResponse includes `queuedLanguages?: SupportedLanguage[]` | Task 1 | [x] |
| ArticleResponse includes `translationJobIds?: string[]` | Task 2 | [x] |
| ArticleResponse includes `translationError?: string` | Task 2 | [x] |
| ArticleResponse includes `queuedLanguages?: SupportedLanguage[]` | Task 2 | [x] |
| CreateArticleRequest includes `sourceLanguage?: SupportedLanguage` | Task 3 | [x] |
| CreateItemRequest includes `sourceLanguage?: SupportedLanguage` | Task 4 | [x] |

### Type Re-exports

| Criteria | Task | Status |
|----------|------|--------|
| `ContentEntityType` is exported | Task 5 | [x] |
| `TranslationTrigger` is exported | Task 5 | [x] |
| `ContentToTranslate` is exported | Task 5 | [x] |
| `TranslatableField` is exported | Task 5 | [x] |
| `QueueTranslationOptions` is exported | Task 5 | [x] |
| `QueueTranslationResult` is exported | Task 5 | [x] |
| `LanguageTranslationStatus` is exported | Task 5 | [x] |
| `TranslationStatusResult` is exported | Task 5 | [x] |
| `EntityTranslationStatus` is exported | Task 5 | [x] |
| `TranslationContextKey` is exported | Task 5 | [x] |
| `TRANSLATION_CONTEXTS` constant is exported | Task 5 | [x] |

### Documentation

| Criteria | Task | Status |
|----------|------|--------|
| All new fields have JSDoc comments | Tasks 1-4 | [x] |
| `@since Epic 3` tags are present | Tasks 1-5 | [x] |
| `@see` references point to correct locations | Tasks 3-4 | [x] |

### Compilation

| Criteria | Task | Status |
|----------|------|--------|
| `npm run build` completes without TypeScript errors | Task 6 | [ ] |
| No unused export warnings | Task 6 | [ ] |
| Existing code compiles without modification | Task 6 | [ ] |
| Type imports work from consuming files | Task 7 | [ ] |

---

## Error Handling

### Common Issues and Resolutions

| Issue | Cause | Resolution |
|-------|-------|------------|
| `Cannot find name 'SupportedLanguage'` | Missing import | Verify line 674-679 exports SupportedLanguage from LocaleContext |
| `Module '@/lib/content-translation' not found` | REQ-E03-001 not complete | Complete content translation module first |
| `Duplicate identifier 'EntityType'` | Name collision | Use alias `ContentEntityType` (already in plan) |
| `has no exported member 'TranslationContextKey'` | Type not exported from module | Add export to `/src/lib/content-translation/index.ts` |

### Build Failure Recovery

If `npm run build` fails:

1. Check error message for specific type/import issues
2. Verify content translation module exports all required types
3. Ensure no syntax errors in added code (semicolons, braces)
4. Check for circular import issues

---

## Implementation Order

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | Tasks 1, 2 | Add translation fields to response types |
| 2 | Tasks 3, 4 | Add sourceLanguage to request types |
| 3 | Task 5 | Add content translation type re-exports |
| 4 | Task 6 | Verify TypeScript compilation |
| 5 | Task 7 | Verify type imports (optional validation) |

**Parallel Execution:** Tasks 1-4 can be executed in parallel as they modify different type definitions with no interdependencies.

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Breaking existing API consumers | Very Low | All new fields are optional |
| Compilation failures | Low | Standard TypeScript patterns, clear verification steps |
| Missing dependency (content translation module) | Medium | Verify REQ-E03-001 complete before starting Task 5 |
| Type naming conflicts | Low | Using `ContentEntityType` alias |

**Overall Risk:** Very Low

---

## Testing Strategy

This task modifies only TypeScript type definitions with no runtime behavior changes. Testing focuses on compilation:

1. **Build Verification:** `npm run build` succeeds
2. **Import Verification:** Types can be imported from `@/types`
3. **IntelliSense Check:** IDE shows new fields on response/request types
4. **No Regressions:** Existing files using these types compile without changes

---

## Downstream Impact

### Files That Use Modified Types

These files may access the new fields but require no changes (all fields are optional):

| File | Type Used | Impact |
|------|-----------|--------|
| `/src/app/api/admin/items/route.ts` | `ItemResponse`, `CreateItemRequest` | Can optionally include translation fields in response |
| `/src/app/api/admin/articles/route.ts` | `ArticleResponse`, `CreateArticleRequest` | Can optionally include translation fields in response |
| Item-related components | `ItemResponse` | Will see new fields via IntelliSense |
| Article-related components | `ArticleResponse` | Will see new fields via IntelliSense |

### Epic Dependencies

| Epic | Dependency Type | Description |
|------|-----------------|-------------|
| Epic 3 (Current) | Consumer | API routes will use new fields when implementing REQ-E03-008, REQ-E03-009 |
| Epic 4 | Consumer | Guest experience components may check translation status |
| Epic 5 | Consumer | Owner translation management will use status types |

---

## References

- **Overview Document:** `/docs/REQ-E03-012-update-typescript-types-for-api-responses-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Content Translation Types Source:** `/src/lib/content-translation/content-translation.types.ts`
- **Existing Type Definitions:** `/src/types/index.ts`
- **Locale Context Types:** `/src/contexts/LocaleContext.tsx`
- **Items API (consumer):** `/src/app/api/admin/items/route.ts`
- **Articles API (consumer):** `/src/app/api/admin/articles/route.ts`

---

## Notes

1. **Backward Compatibility:** All new fields are optional (`?` suffix), ensuring zero breaking changes for existing API consumers.

2. **Naming Convention:** `EntityType` is aliased to `ContentEntityType` to prevent conflicts with other entity type definitions that may exist in the codebase.

3. **Epic 3 Dependency:** Task 5 (type re-exports) requires REQ-E03-001 to be complete. Tasks 1-4 can proceed independently.

4. **SupportedLanguage Reuse:** Uses existing `SupportedLanguage` type from LocaleContext (Epic 1) for consistency.

5. **JSDoc Standards:** All new fields include JSDoc comments with `@since Epic 3` tags per project documentation standards.

6. **No Runtime Changes:** This task only modifies TypeScript definitions. No runtime behavior is affected.
