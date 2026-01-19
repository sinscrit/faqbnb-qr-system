# REQ-338: Create Localization Types File - Detailed Task Breakdown

**Document Created:** 2026-01-19 14:15:00 UTC
**Last Modified:** 2026-01-19 14:15:00 UTC
**Request Reference:** docs/gen_requests_epic4.md - REQ-338
**Overview Document:** docs/REQ-338-create-localization-types-file-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
**Phase:** 1 - Types and Utilities
**Task ID:** 1.1
**Size:** S (Small)
**Priority:** P1 - High (Foundation for Epic 4)
**Estimated Story Points:** 1

---

## Executive Summary

This document provides granular, actionable tasks for creating a centralized TypeScript types file at `/src/types/l10n.ts`. This file establishes type contracts for all guest-facing localization features in Epic 4 (Guest Experience).

**Key Deliverables:**
1. New file: `/src/types/l10n.ts` (~150-180 lines)
2. Modified file: `/src/types/index.ts` (add export)

**Dependencies:**
- **Upstream (Required):** Epic 1 Foundation complete - `/src/contexts/LocaleContext.tsx` must exist with `SupportedLanguage` type
- **Downstream (Blocks):** Tasks 1.2, 2.1, 3.1, 5.2, and all other Epic 4 tasks

---

## Pre-Implementation Checklist

Before starting implementation, verify the following:

| Check | File/Command | Expected Result |
|-------|--------------|-----------------|
| LocaleContext exists | `/src/contexts/LocaleContext.tsx` | File exists with `SupportedLanguage` export |
| Types index exists | `/src/types/index.ts` | File exists and exports other types |
| No existing l10n.ts | `/src/types/l10n.ts` | File does NOT exist (will be created) |
| TypeScript compiles | `npx tsc --noEmit` | No errors |

---

## Task Breakdown

### Task 1.1.1: Create l10n.ts File with Header and Imports

**File:** `/src/types/l10n.ts`
**Action:** CREATE
**Lines:** 1-35
**Estimated Effort:** 5 minutes

Create the new file with:
1. JSDoc header with file purpose, creation date, and references
2. Import statement for `SupportedLanguage` from LocaleContext (if needed for type extension)
3. Re-export of `SupportedLanguage` for convenience

```typescript
/**
 * Localization Types - Guest Experience (Epic 4)
 *
 * Centralized type definitions for all guest-facing localization features.
 * This file provides type contracts for:
 * - Supported language codes
 * - Language metadata with display names
 * - Translated content structures
 * - Guest content response formats
 * - Language availability information
 *
 * @module l10n
 * @see docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
 * @see docs/gen_requests_epic4.md REQ-338
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// =============================================================================
// Re-exports from Existing Infrastructure
// =============================================================================

/**
 * Re-export SupportedLanguage from LocaleContext for convenience.
 * This is the canonical type for language codes throughout the application.
 */
export type { SupportedLanguage } from '@/contexts/LocaleContext';

// Import for use in this file's type definitions
import type { SupportedLanguage } from '@/contexts/LocaleContext';
```

**Verification:**
- File created at correct path
- No TypeScript import errors
- `SupportedLanguage` is available as a type

---

### Task 1.1.2: Define LanguageInfo Interface and SUPPORTED_LANGUAGES Constant

**File:** `/src/types/l10n.ts`
**Action:** ADD
**Lines:** 36-70
**Estimated Effort:** 10 minutes

Add the `LanguageInfo` interface and `SUPPORTED_LANGUAGES` constant array as specified in Plan-111:

```typescript
// =============================================================================
// Language Metadata Types
// =============================================================================

/**
 * Complete metadata for a supported language.
 * Used for rendering language selectors and display names.
 */
export interface LanguageInfo {
  /** ISO 639-1 language code */
  code: SupportedLanguage;
  /** English name of the language */
  name: string;
  /** Name in the language itself (e.g., "Deutsch" for German) */
  nativeName: string;
  /** Optional flag emoji for visual identification */
  flag?: string;
}

/**
 * Complete list of supported languages with metadata.
 * Order determines display order in UI components.
 *
 * @example
 * // Render a language selector
 * SUPPORTED_LANGUAGES.map(lang => (
 *   <option key={lang.code} value={lang.code}>
 *     {lang.flag} {lang.nativeName}
 *   </option>
 * ))
 */
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
] as const;
```

**Verification:**
- `LanguageInfo` interface has all required fields
- `SUPPORTED_LANGUAGES` array contains all 6 languages
- Each language has code, name, nativeName, and flag
- Order matches Plan-111 specification

---

### Task 1.1.3: Define Translation Status Type and TranslatedContent Base Interface

**File:** `/src/types/l10n.ts`
**Action:** ADD
**Lines:** 71-100
**Estimated Effort:** 10 minutes

Add the `TranslationStatus` type and `TranslatedContent` base interface:

```typescript
// =============================================================================
// Translation Status Types
// =============================================================================

/**
 * Status of a translation for a piece of content.
 * - completed: Translation is finished and reviewed
 * - pending: Translation is in progress or queued
 * - failed: Translation attempt failed
 * - outdated: Source content changed after translation
 */
export type TranslationStatus = 'completed' | 'pending' | 'failed' | 'outdated';

// =============================================================================
// Translated Content Base Types
// =============================================================================

/**
 * Base interface for all translated content.
 * Extended by specific content types (items, articles, links).
 */
export interface TranslatedContent {
  /** Language currently being displayed to the user */
  displayLanguage: SupportedLanguage;
  /** Original language the content was authored in */
  sourceLanguage: SupportedLanguage;
  /** Whether the displayed content is a translation (vs original) */
  isTranslated: boolean;
  /** Status of the translation, if applicable */
  translationStatus?: TranslationStatus;
}
```

**Verification:**
- `TranslationStatus` includes all four statuses
- `TranslatedContent` has displayLanguage, sourceLanguage, isTranslated
- Optional translationStatus field is present

---

### Task 1.1.4: Define Content-Specific Translation Interfaces

**File:** `/src/types/l10n.ts`
**Action:** ADD
**Lines:** 101-175
**Estimated Effort:** 15 minutes

Add interfaces for `TranslatedItem`, `TranslatedArticle`, `TranslatedLink`, and `TranslatedTag`:

```typescript
// =============================================================================
// Content-Specific Translation Interfaces
// =============================================================================

/**
 * Item content with translation data.
 * Used when displaying items to guests.
 */
export interface TranslatedItem extends TranslatedContent {
  /** Internal database ID */
  id: string;
  /** Public-facing identifier (used in URLs) */
  publicId: string;
  /** Item name (translated if available) */
  name: string;
  /** Item description (translated if available) */
  description: string | null;
  /** Original name (included when showing translation for comparison) */
  originalName?: string;
  /** Original description (included when showing translation) */
  originalDescription?: string;
}

/**
 * Article content with translation data.
 * Articles group related links under a purpose/category.
 */
export interface TranslatedArticle extends TranslatedContent {
  /** Internal database ID */
  id: string;
  /** Article title (translated if available) */
  title: string;
  /** Article description (translated if available) */
  description: string | null;
  /** Original title (for comparison) */
  originalTitle?: string;
  /** Original description (for comparison) */
  originalDescription?: string;
  /** Links within this article (with translations) */
  links: TranslatedLink[];
}

/**
 * Link content with translation data.
 * Note: URLs are never translated, only titles.
 */
export interface TranslatedLink extends TranslatedContent {
  /** Internal database ID */
  id: string;
  /** Link title (translated if available) */
  title: string;
  /** Link URL (never translated) */
  url: string;
  /** Optional thumbnail image URL */
  thumbnailUrl: string | null;
  /** Original title (for comparison) */
  originalTitle?: string;
}

/**
 * Tag with translation data.
 * Tags are simple key-value pairs with localized display values.
 */
export interface TranslatedTag {
  /** Tag key (e.g., "room.bedroom", "category.appliance") */
  key: string;
  /** Localized display value for the tag */
  displayValue: string;
  /** Whether the display value is translated */
  isTranslated: boolean;
}
```

**Verification:**
- `TranslatedItem` extends `TranslatedContent` and has id, publicId, name, description
- `TranslatedArticle` extends `TranslatedContent` and includes links array
- `TranslatedLink` extends `TranslatedContent` with url field that is never translated
- `TranslatedTag` is standalone (not extending TranslatedContent since it's simpler)
- All interfaces have JSDoc comments

---

### Task 1.1.5: Define API Response Types

**File:** `/src/types/l10n.ts`
**Action:** ADD
**Lines:** 176-240
**Estimated Effort:** 15 minutes

Add `TranslationMeta`, `GuestContentResponse`, and `LanguageAvailabilityResponse` interfaces:

```typescript
// =============================================================================
// API Response Types
// =============================================================================

/**
 * Metadata about translation state for an API response.
 * Included in all guest content responses.
 */
export interface TranslationMeta {
  /** Language that the guest requested */
  requestedLanguage: SupportedLanguage;
  /** Language actually being displayed (may differ if translation unavailable) */
  displayLanguage: SupportedLanguage;
  /** Original source language of the content */
  sourceLanguage: SupportedLanguage;
  /** List of languages that have available translations */
  availableTranslations: SupportedLanguage[];
  /** Whether the response contains translated content (vs original) */
  isShowingTranslation: boolean;
}

/**
 * Complete guest content response format.
 * Returned by the public item API with translation support.
 *
 * @see /src/app/api/public/items/[publicId]/route.ts
 */
export interface GuestContentResponse {
  /** The item with its translation data */
  item: TranslatedItem;
  /** Articles associated with the item */
  articles: TranslatedArticle[];
  /** Tags with localized display values */
  tags: TranslatedTag[];
  /** Translation metadata */
  translationMeta: TranslationMeta;
}

/**
 * Response format for the language availability endpoint.
 * Used by the GuestLanguageSwitcher to show available translations.
 *
 * @see /src/app/api/public/items/[publicId]/languages/route.ts
 */
export interface LanguageAvailabilityResponse {
  /** Source/original language of the item */
  sourceLanguage: SupportedLanguage;
  /** Languages with completed translations */
  availableTranslations: SupportedLanguage[];
  /** Languages with translations in progress */
  pendingTranslations: SupportedLanguage[];
  /** Languages without any translation started */
  unavailableTranslations: SupportedLanguage[];
}
```

**Verification:**
- `TranslationMeta` has all five required fields
- `GuestContentResponse` includes item, articles, tags, and translationMeta
- `LanguageAvailabilityResponse` separates translations by status
- All interfaces have JSDoc with @see references

---

### Task 1.1.6: Define Utility Types

**File:** `/src/types/l10n.ts`
**Action:** ADD
**Lines:** 241-300
**Estimated Effort:** 10 minutes

Add utility types for translation keys, language detection, and preference storage:

```typescript
// =============================================================================
// Utility Types
// =============================================================================

/**
 * Type alias for translation keys.
 * Used for type-safe translation lookups with next-intl.
 */
export type TranslationKey = string;

/**
 * Result of automatic language detection.
 * Indicates where the language preference came from.
 */
export interface LanguageDetectionResult {
  /** The detected or selected language */
  language: SupportedLanguage;
  /** Source of the language detection */
  source: 'url' | 'cookie' | 'header' | 'default';
  /** Confidence level of the detection */
  confidence: 'explicit' | 'inferred' | 'fallback';
}

/**
 * Stored language preference information.
 * Tracks where and when a preference was saved.
 */
export interface LanguagePreference {
  /** The preferred language code */
  language: SupportedLanguage;
  /** ISO timestamp when preference was set */
  setAt: string;
  /** Storage mechanism used */
  storage: 'cookie' | 'database' | 'session';
}

/**
 * Guest language state for client components.
 * Used by useGuestLanguage hook.
 */
export interface GuestLanguageState {
  /** Currently displaying language */
  displayLanguage: SupportedLanguage;
  /** Original content language */
  sourceLanguage: SupportedLanguage;
  /** Whether showing translated content */
  isTranslated: boolean;
  /** User toggled to view original */
  showOriginal: boolean;
  /** Languages with available translations */
  availableTranslations: SupportedLanguage[];
}
```

**Verification:**
- `TranslationKey` is a type alias for string
- `LanguageDetectionResult` has language, source, and confidence fields
- `LanguagePreference` tracks storage location and timestamp
- `GuestLanguageState` matches the state shape in Plan-111

---

### Task 1.1.7: Add Utility Functions

**File:** `/src/types/l10n.ts`
**Action:** ADD
**Lines:** 301-365
**Estimated Effort:** 10 minutes

Add utility functions for type guards and language lookups:

```typescript
// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Type guard to check if a string is a supported language code.
 *
 * @param code - The string to check
 * @returns True if the code is a valid SupportedLanguage
 *
 * @example
 * const userLang = 'fr';
 * if (isSupportedLanguage(userLang)) {
 *   // TypeScript knows userLang is SupportedLanguage here
 *   setLanguage(userLang);
 * }
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}

/**
 * Get language info by code.
 *
 * @param code - Language code to look up
 * @returns LanguageInfo object or undefined if not found
 *
 * @example
 * const info = getLanguageInfo('de');
 * console.log(info?.nativeName); // "Deutsch"
 */
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Get a language's display name.
 *
 * @param code - Language code
 * @param native - If true, return the native name (default); if false, return English name
 * @returns Display name string, or the code itself if not found
 *
 * @example
 * getLanguageName('de', true);   // "Deutsch"
 * getLanguageName('de', false);  // "German"
 */
export function getLanguageName(code: SupportedLanguage, native = true): string {
  const info = getLanguageInfo(code);
  return native ? (info?.nativeName ?? code) : (info?.name ?? code);
}

/**
 * Get flag emoji for a language.
 *
 * @param code - Language code
 * @returns Flag emoji or empty string if not found
 */
export function getLanguageFlag(code: SupportedLanguage): string {
  const info = getLanguageInfo(code);
  return info?.flag ?? '';
}

/**
 * Default language when no preference is detected.
 * Re-exported for convenience alongside the types.
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Cookie name for guest language preference.
 * Must match the constant in LocaleContext and middleware.
 */
export const GUEST_LANGUAGE_COOKIE = 'FAQBNB_GUEST_LANG';
```

**Verification:**
- `isSupportedLanguage` is a proper type guard
- `getLanguageInfo` returns `LanguageInfo | undefined`
- `getLanguageName` supports both native and English names
- `getLanguageFlag` returns string (not undefined)
- Constants match those in LocaleContext

---

### Task 1.1.8: Update types/index.ts to Export l10n Types

**File:** `/src/types/index.ts`
**Action:** MODIFY
**Lines:** End of file (after line 682)
**Estimated Effort:** 5 minutes

Add export statement for l10n types:

```typescript
// L10N types (Epic 4 - Guest Experience)
export * from './l10n';
```

**Verification:**
- Export statement added at the end of `/src/types/index.ts`
- No duplicate exports (l10n types don't conflict with existing exports)
- Can import l10n types from `@/types`

---

### Task 1.1.9: Verify TypeScript Compilation

**Action:** VERIFY
**Command:** `npx tsc --noEmit`
**Estimated Effort:** 5 minutes

Run TypeScript compiler to verify:
1. No circular dependency issues between l10n.ts and LocaleContext
2. All type exports resolve correctly
3. No type conflicts with existing exports

**Expected Result:** No errors

**If errors occur:**
- Check import path for LocaleContext
- Verify SupportedLanguage type is exported from LocaleContext
- Check for naming conflicts with existing types

---

### Task 1.1.10: Create Import Test File (Optional)

**File:** `/src/types/__tests__/l10n.test.ts` or inline verification
**Action:** CREATE (optional) or manual verification
**Estimated Effort:** 5 minutes

Verify types can be imported and used correctly:

```typescript
// Manual verification - can be run in any component file temporarily
import {
  SupportedLanguage,
  LanguageInfo,
  SUPPORTED_LANGUAGES,
  TranslationStatus,
  TranslatedContent,
  TranslatedItem,
  TranslatedArticle,
  TranslatedLink,
  TranslatedTag,
  TranslationMeta,
  GuestContentResponse,
  LanguageAvailabilityResponse,
  LanguageDetectionResult,
  LanguagePreference,
  GuestLanguageState,
  isSupportedLanguage,
  getLanguageInfo,
  getLanguageName,
  getLanguageFlag,
  DEFAULT_LANGUAGE,
  GUEST_LANGUAGE_COOKIE,
} from '@/types';

// Verify utility function types
const testLang = 'fr';
if (isSupportedLanguage(testLang)) {
  const info: LanguageInfo | undefined = getLanguageInfo(testLang);
  const name: string = getLanguageName(testLang);
  console.log(info, name);
}
```

**Verification:**
- All imports resolve without errors
- Type inference works correctly
- Utility functions return expected types

---

## Acceptance Criteria Checklist

| # | Criterion | Task(s) | Verification Method |
|---|-----------|---------|---------------------|
| AC-1 | Type file exists at `/src/types/l10n.ts` | 1.1.1 | File exists |
| AC-2 | `SupportedLanguage` type defined (as re-export) | 1.1.1 | TypeScript compiles |
| AC-3 | `LanguageInfo` interface includes code, name, nativeName, flag | 1.1.2 | Code review |
| AC-4 | `TranslatedContent` types support string translations | 1.1.3, 1.1.4 | Code review |
| AC-5 | `SUPPORTED_LANGUAGES` constant exports all 6 languages | 1.1.2 | Code review |
| AC-6 | Utility type definitions exist (TranslationStatus, etc.) | 1.1.3, 1.1.6 | Code review |
| AC-7 | All types properly exported via index.ts | 1.1.8 | Import test |
| AC-8 | JSDoc comments explain purpose | All tasks | Code review |
| AC-9 | TypeScript compilation succeeds | 1.1.9 | `npx tsc --noEmit` |

---

## File Summary

### New Files

| File Path | Lines | Purpose |
|-----------|-------|---------|
| `/src/types/l10n.ts` | ~150-180 | Localization types and constants |

### Modified Files

| File Path | Change | Lines Affected |
|-----------|--------|----------------|
| `/src/types/index.ts` | Add l10n export | +2 |

---

## Testing Strategy

### Build-Time Verification

1. **TypeScript Compilation:**
   ```bash
   npx tsc --noEmit
   ```
   Expected: No errors

2. **Lint Check:**
   ```bash
   npm run lint
   ```
   Expected: No new errors related to l10n.ts

### Integration Verification

1. **Import from types index:**
   ```typescript
   import { SupportedLanguage, SUPPORTED_LANGUAGES } from '@/types';
   ```
   Expected: No import errors

2. **Use in component (manual test):**
   Create a temporary test in any component to verify types work correctly.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Circular import with LocaleContext | Low | Medium | Use `import type` for re-export |
| Naming conflict with existing types | Low | Low | Check index.ts before adding export |
| Breaking build due to missing dependency | Low | High | Verify Epic 1 complete first |

---

## Dependencies Summary

### Required Before Starting

| Dependency | Location | How to Verify |
|------------|----------|---------------|
| LocaleContext with SupportedLanguage | `/src/contexts/LocaleContext.tsx` | File exists, exports SupportedLanguage |
| Types index file | `/src/types/index.ts` | File exists |

### Blocked Until This Completes

| Task/File | Reason |
|-----------|--------|
| Task 1.2: Guest language utility | Uses SupportedLanguage, LanguageInfo |
| Task 2.1: Translation fetch utilities | Uses TranslatedItem, TranslatedArticle |
| Task 3.1: GuestLanguageSwitcher | Uses LanguageInfo, SUPPORTED_LANGUAGES |
| Task 4.1: useGuestLanguage hook | Uses GuestLanguageState |
| Task 5.2: ItemDisplay updates | Uses TranslationMeta |

---

## Implementation Order

Execute tasks in this order:

1. **Task 1.1.1** - Create file with header and imports
2. **Task 1.1.2** - Add LanguageInfo and SUPPORTED_LANGUAGES
3. **Task 1.1.3** - Add TranslationStatus and TranslatedContent
4. **Task 1.1.4** - Add content-specific interfaces
5. **Task 1.1.5** - Add API response types
6. **Task 1.1.6** - Add utility types
7. **Task 1.1.7** - Add utility functions
8. **Task 1.1.8** - Update types/index.ts
9. **Task 1.1.9** - Verify TypeScript compilation
10. **Task 1.1.10** - Verify imports work (optional)

---

## Commit Message Template

```
feat(L10N): Create localization types file (REQ-338)

- Add /src/types/l10n.ts with guest-facing l10n types
- Define LanguageInfo interface and SUPPORTED_LANGUAGES constant
- Add TranslatedContent, TranslatedItem, TranslatedArticle, TranslatedLink
- Add TranslationMeta, GuestContentResponse, LanguageAvailabilityResponse
- Add utility types: TranslationStatus, LanguageDetectionResult, etc.
- Add utility functions: isSupportedLanguage, getLanguageInfo, etc.
- Export all l10n types from /src/types/index.ts

Part of L10N Epic 4 - Guest Experience
Phase 1, Task 1.1
```

---

*Detailed task breakdown generated for FAQBNB Localization Epic 4 - Task 1.1*
