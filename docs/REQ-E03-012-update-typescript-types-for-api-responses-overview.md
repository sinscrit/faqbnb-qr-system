# Implementation Overview: REQ-E03-012 - Update TypeScript Types for API Responses

**Request ID:** REQ-E03-012
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.6
**Type:** ENHANCEMENT
**Size:** S
**Created:** 2026-01-20
**Last Modified:** 2026-01-20 18:45 UTC

---

## Summary

Update the TypeScript type definitions in `/src/types/index.ts` to include translation-related fields that support the multilingual content infrastructure. This includes adding `translationJobIds?: string[]` to response types (`ItemResponse`, `ArticleResponse`) and `sourceLanguage?: string` to request types (`CreateItemRequest`, `CreateArticleRequest`). Additionally, export all translation-related types from the content translation module to make them available through the central types file.

---

## Background & Context

### Current State

The TypeScript type definitions in `/src/types/index.ts` define API request and response structures without translation-related fields:

**ItemResponse (lines 125-166)**
- Contains standard fields: `success`, `data`, `error`, `accountContext`
- `data` includes: `id`, `publicId`, `name`, `description`, `qrCodeUrl`, `qrCodeUploadedAt`, `links`, `articles`
- No translation job tracking fields

**ArticleResponse (lines 289-297)**
- Contains: `success`, `data`, `error`, `accountContext`
- `data` typed as `ItemArticle`
- No translation job tracking fields

**CreateItemRequest (lines 310-342)**
- Contains: `publicId`, `name`, `description`, `propertyId`, `tags`, `qrCodeUrl`, `links`, `articles`
- No source language specification field

**CreateArticleRequest (lines 243-262)**
- Contains: `itemId`, `purpose`, `title`, `description`, `displayOrder`, `links`
- No source language specification field

**Locale/i18n Exports (lines 673-681)**
- Currently exports `SupportedLanguage`, `LocaleOption`, `LocaleChangeResult`, `LocaleContextValue` from `@/contexts/LocaleContext`
- Does NOT export content translation types from `@/lib/content-translation`

### Problem Statement

1. API response types don't include translation job tracking fields (`translationJobIds`, `translationError`, `queuedLanguages`)
2. API request types don't include source language specification (`sourceLanguage`)
3. Translation-related types from the content translation module are not exported through the central types file
4. API consumers cannot access translation status information through strongly-typed interfaces
5. TypeScript IntelliSense doesn't show translation fields when working with API responses

### Solution Approach

Extend existing type definitions with backward-compatible optional fields:

1. **ItemResponse Extension:**
   - Add `translationJobIds?: string[]` - Array of job IDs for status tracking
   - Add `translationError?: string` - Error message if translation queuing failed
   - Add `queuedLanguages?: SupportedLanguage[]` - Languages queued for translation

2. **ArticleResponse Extension:**
   - Add same three fields as ItemResponse

3. **CreateItemRequest Extension:**
   - Add `sourceLanguage?: SupportedLanguage` - Optional source language override

4. **CreateArticleRequest Extension:**
   - Add `sourceLanguage?: SupportedLanguage` - Optional source language override

5. **Type Exports:**
   - Re-export content translation types from `@/lib/content-translation`

---

## Technical Design

### Architecture Position

```
/src/types/
└── index.ts                         # MODIFY: Add translation fields to existing types

/src/lib/content-translation/        # Dependencies (from prior tasks)
├── index.ts                         # Module exports
└── content-translation.types.ts     # Type definitions to re-export

/src/contexts/
└── LocaleContext.tsx                # Existing SupportedLanguage type
```

### Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `SupportedLanguage` | `/src/contexts/LocaleContext.tsx` | Language code type (already exported in index.ts) |
| `EntityType` | `/src/lib/content-translation/content-translation.types.ts` | Translatable entity type |
| `TranslationTrigger` | `/src/lib/content-translation/content-translation.types.ts` | Trigger type |
| `ContentToTranslate` | `/src/lib/content-translation/content-translation.types.ts` | Content structure |
| `TranslatableField` | `/src/lib/content-translation/content-translation.types.ts` | Field definition |
| `QueueTranslationOptions` | `/src/lib/content-translation/content-translation.types.ts` | Queue options |
| `QueueTranslationResult` | `/src/lib/content-translation/content-translation.types.ts` | Queue result |
| `LanguageTranslationStatus` | `/src/lib/content-translation/content-translation.types.ts` | Per-language status |
| `TranslationStatusResult` | `/src/lib/content-translation/content-translation.types.ts` | Entity status |
| `EntityTranslationStatus` | `/src/lib/content-translation/content-translation.types.ts` | UI status display |
| `TRANSLATION_CONTEXTS` | `/src/lib/content-translation/content-translation.types.ts` | Context templates |

### Database Schema Reference

No database changes required. This task only modifies TypeScript type definitions.

---

## Interface Contracts

### Extended ItemResponse Type

```typescript
// File: /src/types/index.ts (lines 125-166, extended)

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
  /**
   * Array of translation job IDs for status tracking.
   * Populated when translation jobs are queued during item creation or updates.
   * Empty array if translation queuing was skipped or failed.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationJobIds?: string[];  // NEW

  /**
   * Translation error message if queuing failed.
   * Item creation/update succeeds even if translation fails.
   * Only present when there was an error during translation queuing.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationError?: string;  // NEW

  /**
   * Languages queued for translation.
   * Contains the target languages (excludes source language).
   * @since Epic 3 - Dynamic Content Translation
   */
  queuedLanguages?: SupportedLanguage[];  // NEW
}
```

### Extended ArticleResponse Type

```typescript
// File: /src/types/index.ts (lines 289-297, extended)

export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  /**
   * Array of translation job IDs for status tracking.
   * Populated when translation jobs are queued during article creation or updates.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationJobIds?: string[];  // NEW

  /**
   * Translation error message if queuing failed.
   * Article creation/update succeeds even if translation fails.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationError?: string;  // NEW

  /**
   * Languages queued for translation.
   * @since Epic 3 - Dynamic Content Translation
   */
  queuedLanguages?: SupportedLanguage[];  // NEW
}
```

### Extended CreateItemRequest Type

```typescript
// File: /src/types/index.ts (lines 310-342, extended)

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
  /**
   * Optional source language override for translations.
   * If not provided, source language is detected from user/account preferences.
   * @see detectSourceLanguage() in @/lib/content-translation
   * @since Epic 3 - Dynamic Content Translation
   */
  sourceLanguage?: SupportedLanguage;  // NEW
}
```

### Extended CreateArticleRequest Type

```typescript
// File: /src/types/index.ts (lines 243-262, extended)

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
  /**
   * Optional source language override for translations.
   * If not provided, source language is detected from user/account preferences.
   * @see detectSourceLanguage() in @/lib/content-translation
   * @since Epic 3 - Dynamic Content Translation
   */
  sourceLanguage?: SupportedLanguage;  // NEW
}
```

### Translation Type Re-exports

```typescript
// File: /src/types/index.ts (new section after line 681)

// Content Translation types (Epic 3)
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

## Implementation Details

### Step 1: Import SupportedLanguage Reference Check

**Location:** `/src/types/index.ts` (lines 673-681)

Verify that `SupportedLanguage` is already exported. It is currently exported from `@/contexts/LocaleContext`:

```typescript
// Locale/i18n types (REQ-250)
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';
```

This export is already in place - no changes needed for the import.

### Step 2: Extend ItemResponse Type

**Location:** `/src/types/index.ts` (around line 165, before the closing brace)

Add translation fields to the existing `ItemResponse` interface:

```typescript
// After line 164 (accountContext field), before the closing brace
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

### Step 3: Extend ArticleResponse Type

**Location:** `/src/types/index.ts` (around line 296, before the closing brace)

Add translation fields to the existing `ArticleResponse` interface:

```typescript
// After line 295 (accountContext field), before the closing brace
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

### Step 4: Extend CreateItemRequest Type

**Location:** `/src/types/index.ts` (around line 341, before the closing brace)

Add source language field to the existing `CreateItemRequest` interface:

```typescript
// After line 340 (articles field), before the closing brace
  /**
   * Optional source language override for translations.
   * If not provided, source language is detected from user/account preferences.
   * @see detectSourceLanguage() in @/lib/content-translation
   * @since Epic 3 - Dynamic Content Translation
   */
  sourceLanguage?: SupportedLanguage;
```

### Step 5: Extend CreateArticleRequest Type

**Location:** `/src/types/index.ts` (around line 261, before the closing brace)

Add source language field to the existing `CreateArticleRequest` interface:

```typescript
// After line 260 (links field), before the closing brace
  /**
   * Optional source language override for translations.
   * If not provided, source language is detected from user/account preferences.
   * @see detectSourceLanguage() in @/lib/content-translation
   * @since Epic 3 - Dynamic Content Translation
   */
  sourceLanguage?: SupportedLanguage;
```

### Step 6: Add Content Translation Type Exports

**Location:** `/src/types/index.ts` (after line 681, after existing locale exports)

Add re-exports for content translation types:

```typescript
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

**Note:** `EntityType` is renamed to `ContentEntityType` in the re-export to avoid potential naming conflicts with other entity type definitions in the codebase.

---

## Authorized Files and Functions for Modification

### Files to Modify (UPDATE)

| File Path | Change Type | Lines Affected | Description |
|-----------|-------------|----------------|-------------|
| `/src/types/index.ts` | Modify | ~125-166 | Add translation fields to `ItemResponse` |
| `/src/types/index.ts` | Modify | ~243-262 | Add `sourceLanguage` to `CreateArticleRequest` |
| `/src/types/index.ts` | Modify | ~289-297 | Add translation fields to `ArticleResponse` |
| `/src/types/index.ts` | Modify | ~310-342 | Add `sourceLanguage` to `CreateItemRequest` |
| `/src/types/index.ts` | Add | After line 681 | Add content translation type re-exports |

### Types to Modify

| Type | File | Lines | Changes |
|------|------|-------|---------|
| `ItemResponse` | `/src/types/index.ts` | 125-166 | Add `translationJobIds?`, `translationError?`, `queuedLanguages?` |
| `ArticleResponse` | `/src/types/index.ts` | 289-297 | Add `translationJobIds?`, `translationError?`, `queuedLanguages?` |
| `CreateItemRequest` | `/src/types/index.ts` | 310-342 | Add `sourceLanguage?: SupportedLanguage` |
| `CreateArticleRequest` | `/src/types/index.ts` | 243-262 | Add `sourceLanguage?: SupportedLanguage` |

### New Exports to Add

| Export Name | Source Module | Type |
|-------------|---------------|------|
| `ContentEntityType` | `@/lib/content-translation` | Type alias for `EntityType` |
| `TranslationTrigger` | `@/lib/content-translation` | Type |
| `ContentToTranslate` | `@/lib/content-translation` | Interface |
| `TranslatableField` | `@/lib/content-translation` | Interface |
| `QueueTranslationOptions` | `@/lib/content-translation` | Interface |
| `QueueTranslationResult` | `@/lib/content-translation` | Interface |
| `LanguageTranslationStatus` | `@/lib/content-translation` | Interface |
| `TranslationStatusResult` | `@/lib/content-translation` | Interface |
| `EntityTranslationStatus` | `@/lib/content-translation` | Interface |
| `TranslationContextKey` | `@/lib/content-translation` | Type |
| `TRANSLATION_CONTEXTS` | `@/lib/content-translation` | Constant |

### Reference Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/index.ts` | Source of type re-exports |
| `/src/lib/content-translation/content-translation.types.ts` | Type definitions reference |
| `/src/contexts/LocaleContext.tsx` | `SupportedLanguage` type definition |

---

## Implementation Tasks

### Task Breakdown

| # | Task | Size | Priority | Dependencies |
|---|------|------|----------|--------------|
| 1 | Add translation fields to `ItemResponse` interface | XS | Required | None |
| 2 | Add translation fields to `ArticleResponse` interface | XS | Required | None |
| 3 | Add `sourceLanguage` field to `CreateItemRequest` interface | XS | Required | None |
| 4 | Add `sourceLanguage` field to `CreateArticleRequest` interface | XS | Required | None |
| 5 | Add content translation type re-exports section | S | Required | REQ-E03-001 complete |
| 6 | Add JSDoc comments to all new fields | XS | Required | Tasks 1-5 |
| 7 | Verify TypeScript compilation with `npm run build` | XS | Required | Tasks 1-6 |
| 8 | Verify imports work from consuming files | XS | Recommended | Task 7 |

### Implementation Order

1. **Phase 1 - Response Type Extensions:**
   - Tasks 1, 2: Add translation fields to response types

2. **Phase 2 - Request Type Extensions:**
   - Tasks 3, 4: Add sourceLanguage to request types

3. **Phase 3 - Type Exports:**
   - Task 5: Add content translation type re-exports

4. **Phase 4 - Documentation:**
   - Task 6: Ensure all JSDoc comments are complete

5. **Phase 5 - Verification:**
   - Tasks 7, 8: Build and verify imports

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| ItemResponse type includes optional translationJobIds field typed as string array | `translationJobIds?: string[]` added to `ItemResponse` |
| ArticleResponse type includes optional translationJobIds field typed as string array | `translationJobIds?: string[]` added to `ArticleResponse` |
| CreateItemRequest type includes optional sourceLanguage field typed as string | `sourceLanguage?: SupportedLanguage` added to `CreateItemRequest` |
| CreateArticleRequest type includes optional sourceLanguage field typed as string | `sourceLanguage?: SupportedLanguage` added to `CreateArticleRequest` |
| All translation-related types from the content translation module are exported | Re-export section added with all types from `@/lib/content-translation` |
| Exported types include at minimum: translation status enumerations, language code types, translation metadata interfaces | `TranslationStatusResult`, `LanguageTranslationStatus`, `EntityTranslationStatus`, etc. exported |
| TypeScript compilation succeeds with no type errors after changes | `npm run build` passes |
| Existing API handlers that use these types compile successfully without modification | No breaking changes to existing type consumers |
| Type definitions are properly documented with TSDoc comments explaining translation fields | JSDoc comments with `@since Epic 3` tags |
| All exports from the types file maintain consistent naming conventions | `ContentEntityType` alias to avoid conflicts |
| No breaking changes are introduced to existing type definitions | All new fields are optional (`?` suffix) |

---

## Error Handling Strategy

This task only modifies type definitions and has no runtime error scenarios. However, the following considerations apply:

### TypeScript Compilation Errors

| Error Scenario | Resolution |
|---------------|------------|
| `SupportedLanguage` not found | Verify export from `@/contexts/LocaleContext` exists |
| Content translation module not found | Verify REQ-E03-001 is complete and module exists |
| Duplicate type name conflict | Use alias (e.g., `ContentEntityType` instead of `EntityType`) |
| Missing re-exported type | Add missing type to `@/lib/content-translation/index.ts` |

### Build Verification

```bash
# Verify TypeScript compilation
npm run build

# Expected: No type errors related to translation fields
# If errors occur, check:
# 1. Content translation module is complete (REQ-E03-001)
# 2. All types are properly exported from module
# 3. Import paths are correct
```

---

## Testing Considerations

### Type-Level Verification

Since this task only modifies type definitions, testing focuses on TypeScript compilation:

1. **Compilation Test:**
   - Run `npm run build` to verify no TypeScript errors
   - Verify no unused export warnings

2. **Import Verification:**
   - Create a test file that imports new types
   - Verify IntelliSense shows new fields

### Test Import File (for verification)

```typescript
// Temporary verification file (delete after testing)
// /src/tests/type-verification.ts

import type {
  ItemResponse,
  ArticleResponse,
  CreateItemRequest,
  CreateArticleRequest,
  ContentEntityType,
  TranslationTrigger,
  QueueTranslationResult,
  TranslationStatusResult,
  EntityTranslationStatus,
} from '@/types';

// Verify ItemResponse has translation fields
const testItemResponse: ItemResponse = {
  success: true,
  translationJobIds: ['job-1', 'job-2'],
  translationError: undefined,
  queuedLanguages: ['fr', 'es', 'de'],
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

// Verify ContentEntityType is available
const testEntityType: ContentEntityType = 'item';

// If this file compiles without errors, types are correctly defined
```

---

## Related Documentation

- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-E03-012)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Phase 2, Task 2.6)
- **Content Translation Module Structure:** `/docs/REQ-E03-001-create-content-translation-module-structure-overview.md`
- **Items API Modifications:** `/docs/REQ-E03-008-modify-items-api-to-trigger-translations-overview.md`
- **Articles API Modifications:** `/docs/REQ-E03-009-modify-articles-api-to-trigger-translations-overview.md`
- **Type Definitions File:** `/src/types/index.ts`
- **Content Translation Types:** `/src/lib/content-translation/content-translation.types.ts`

---

## Notes

1. **Backward Compatibility:** All new fields are optional, ensuring existing code that uses these types continues to compile and function correctly. Existing API consumers will not break.

2. **Naming Convention:** `EntityType` is re-exported as `ContentEntityType` to avoid potential conflicts with other entity type definitions in the codebase (e.g., from analytics or other modules).

3. **Dependency on REQ-E03-001:** The type re-exports depend on the content translation module being created in REQ-E03-001. If that task is not complete, the re-export section will cause compilation errors. The implementation should verify the module exists before adding re-exports.

4. **SupportedLanguage Type:** The type uses `SupportedLanguage` from `@/contexts/LocaleContext` rather than defining a new type. This ensures consistency with the existing locale system from Epic 1.

5. **JSDoc Documentation:** All new fields include JSDoc comments with `@since Epic 3` tags to help developers understand when these fields were added and their purpose.

6. **Field Consistency:** Both `ItemResponse` and `ArticleResponse` receive the same three translation fields to maintain consistent API behavior across entity types.

7. **Links API:** The `LinkResponse` type is not explicitly modified as it follows the same pattern and would be updated similarly if a dedicated response type exists. Currently, links are typically returned as part of item/article responses.

---

## File Changes Summary

### Before Implementation

```typescript
// /src/types/index.ts (partial)

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

export interface CreateItemRequest {
  publicId: string;
  name: string;
  // ... other fields ...
  articles?: { /* ... */ }[];
}

export interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  // ... other fields ...
  links?: { /* ... */ }[];
}

// Locale/i18n types (REQ-250)
export type { SupportedLanguage, /* ... */ } from '@/contexts/LocaleContext';
```

### After Implementation

```typescript
// /src/types/index.ts (partial)

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

export interface CreateItemRequest {
  publicId: string;
  name: string;
  // ... other fields ...
  articles?: { /* ... */ }[];
  sourceLanguage?: SupportedLanguage;     // NEW
}

export interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  // ... other fields ...
  links?: { /* ... */ }[];
  sourceLanguage?: SupportedLanguage;     // NEW
}

// Locale/i18n types (REQ-250)
export type { SupportedLanguage, /* ... */ } from '@/contexts/LocaleContext';

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

## Success Validation Checklist

### Type Extensions
- [ ] `ItemResponse` includes `translationJobIds?: string[]`
- [ ] `ItemResponse` includes `translationError?: string`
- [ ] `ItemResponse` includes `queuedLanguages?: SupportedLanguage[]`
- [ ] `ArticleResponse` includes `translationJobIds?: string[]`
- [ ] `ArticleResponse` includes `translationError?: string`
- [ ] `ArticleResponse` includes `queuedLanguages?: SupportedLanguage[]`
- [ ] `CreateItemRequest` includes `sourceLanguage?: SupportedLanguage`
- [ ] `CreateArticleRequest` includes `sourceLanguage?: SupportedLanguage`

### Type Re-exports
- [ ] `ContentEntityType` is exported
- [ ] `TranslationTrigger` is exported
- [ ] `ContentToTranslate` is exported
- [ ] `TranslatableField` is exported
- [ ] `QueueTranslationOptions` is exported
- [ ] `QueueTranslationResult` is exported
- [ ] `LanguageTranslationStatus` is exported
- [ ] `TranslationStatusResult` is exported
- [ ] `EntityTranslationStatus` is exported
- [ ] `TranslationContextKey` is exported
- [ ] `TRANSLATION_CONTEXTS` constant is exported

### Documentation
- [ ] All new fields have JSDoc comments
- [ ] `@since Epic 3` tags are present
- [ ] `@see` references point to correct locations

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No unused export warnings
- [ ] Existing code compiles without modification

---

## Risk Assessment

- **Risk Level:** Very Low
- **Rationale:**
  - All changes are additive (optional fields only)
  - No existing type consumers are affected
  - No runtime code changes
  - Standard TypeScript extension pattern
  - Follows established project conventions
  - Type re-exports depend on REQ-E03-001 completion

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- Content Translation Types Source: `/src/lib/content-translation/content-translation.types.ts`
- Existing Type Definitions: `/src/types/index.ts`
- Locale Context Types: `/src/contexts/LocaleContext.tsx`
- Items API Overview: `/docs/REQ-E03-008-modify-items-api-to-trigger-translations-overview.md`
- Articles API Overview: `/docs/REQ-E03-009-modify-articles-api-to-trigger-translations-overview.md`
