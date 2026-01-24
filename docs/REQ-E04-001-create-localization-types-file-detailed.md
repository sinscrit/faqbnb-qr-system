# Create Localization Types File - Detailed Implementation Tasks

**Generated:** 2026-01-23 09:06
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #1)
- Overview: docs/REQ-E04-001-create-localization-types-file-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**Status:** COMPLETED

**Last Modified:** 2026-01-23 10:45

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Task Context

This task creates the foundational type definitions for guest-facing localization in Epic 4. The types file (`src/types/l10n.ts`) provides:
- Re-exported `SupportedLanguage` type from LocaleContext for consistency
- `LanguageInfo` interface with metadata for all 6 supported languages
- Translation metadata interfaces (`TranslatedContent`, `TranslatedItem`, `TranslatedArticle`, `TranslatedLink`, `TranslatedTag`)
- API response types (`GuestContentResponse`, `LanguageAvailabilityResponse`)
- Documented utility function signatures for later implementation

### Dependencies
- **Depends On:** Epic 1 (`LocaleContext.tsx`), Epic 3 (translation table schema)
- **Blocks:** REQ-E04-002 through REQ-E04-013 (all Epic 4 components and utilities)

---

## 1. Create Core Type Definitions File

**Context:** This task establishes the foundational type system for guest-facing localization. The types must be compatible with the existing `SupportedLanguage` type from `LocaleContext` (already implemented in Epic 1) to ensure consistency between admin UI (which uses next-intl) and guest-facing content (which uses these l10n types).

**Files to modify:**
- `src/types/l10n.ts` (create new file)

**Estimated effort:** 1 story point

- [x] **1.1** Create the file `src/types/l10n.ts` with proper TypeScript module structure ---implemented: Created src/types/l10n.ts with full module structure---
- [x] **1.2** Add file-level JSDoc comment with:
  - `@fileoverview` describing purpose (guest-facing localization types for Epic 4)
  - `@description` explaining the localization flow (QR codes → language detection → translated content)
  - `@relationship` documenting connection to Epic 1 (`LocaleContext`), Epic 3 (translation tables), and Epic 4 (guest API/components)
  - `@since Epic 4 - Guest Experience` tag
  - `@see` references to related files (`/src/contexts/LocaleContext.tsx`, implementation plan)
  - `@example` showing basic import and usage pattern
  - `Last Modified:` timestamp
  ---implemented: Comprehensive JSDoc block at lines 1-53 with all required tags---
- [x] **1.3** Import `SupportedLanguage` from `@/contexts/LocaleContext`:
  ```typescript
  import type { SupportedLanguage as LocaleContextSupportedLanguage } from '@/contexts/LocaleContext';
  ```
  ---implemented: Line 55---
- [x] **1.4** Re-export `SupportedLanguage` type with JSDoc documentation:
  ```typescript
  /**
   * Supported language codes for the application.
   * Re-exported from LocaleContext to ensure type compatibility.
   * @since Epic 4 - Guest Experience
   */
  export type SupportedLanguage = LocaleContextSupportedLanguage;
  ```
  ---implemented: Lines 61-71---
- [x] **1.5** Define `LanguageInfo` interface with JSDoc:
  ```typescript
  export interface LanguageInfo {
    /** ISO 639-1 language code */
    code: SupportedLanguage;
    /** Language name in English (e.g., "French") */
    name: string;
    /** Language name in the native language (e.g., "Français") */
    nativeName: string;
    /** Optional flag emoji for visual representation */
    flag?: string;
  }
  ```
  ---implemented: Lines 73-91---
- [x] **1.6** Export `SUPPORTED_LANGUAGES` constant array with all 6 languages:
  ```typescript
  export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  ];
  ```
  ---implemented: Lines 102-109---
- [x] **1.7** Run `npx tsc --noEmit` to verify the file compiles without errors ---ts-check: passed (0 errors in l10n.ts)---

---

## 2. Define Translation Metadata Interfaces

**Context:** These interfaces establish the structure for how translated content is represented throughout the application. The base `TranslatedContent` interface provides common fields that all content types share (display language, source language, translation status), while specific interfaces extend it for each entity type (items, articles, links, tags). These types must align with the Epic 3 database schema (item_translations, article_translations, link_translations, tag_translations tables).

**Files to modify:**
- `src/types/l10n.ts` (continue in same file)

**Estimated effort:** 1 story point

- [x] **2.1** Add section comment: `// Section 2: Translation Metadata Interfaces` ---implemented: Lines 111-113---
- [x] **2.2** Define `TranslatedContent` base interface with JSDoc:
  ```typescript
  /**
   * Base interface for all translated content.
   * @since Epic 4 - Guest Experience
   */
  export interface TranslatedContent {
    /** The language the content is currently displayed in */
    displayLanguage: SupportedLanguage;
    /** The original language the content was authored in */
    sourceLanguage: SupportedLanguage;
    /** Whether the displayed content is a translation (true) or original (false) */
    isTranslated: boolean;
    /** Current status of the translation for this content */
    translationStatus?: 'completed' | 'pending' | 'failed';
  }
  ```
  ---implemented: Lines 115-142---
- [x] **2.3** Define `TranslatedItem` interface extending `TranslatedContent`:
  ```typescript
  /**
   * Translated item content with translation metadata.
   * Corresponds to the `item_translations` database table from Epic 3.
   * @since Epic 4 - Guest Experience
   */
  export interface TranslatedItem extends TranslatedContent {
    /** Unique database identifier */
    id: string;
    /** Public-facing identifier used in URLs */
    publicId: string;
    /** Translated or original item name */
    name: string;
    /** Translated or original item description */
    description: string | null;
    /** Original item name in source language */
    originalName?: string;
    /** Original item description in source language */
    originalDescription?: string | null;
  }
  ```
  ---implemented: Lines 144-174---
- [x] **2.4** Define `TranslatedArticle` interface extending `TranslatedContent`:
  ```typescript
  /**
   * Translated article content with translation metadata.
   * Corresponds to the `article_translations` database table from Epic 3.
   * @since Epic 4 - Guest Experience
   */
  export interface TranslatedArticle extends TranslatedContent {
    /** Unique database identifier */
    id: string;
    /** Translated or original article title */
    title: string;
    /** Translated or original article description */
    description: string | null;
    /** Original article title in source language */
    originalTitle?: string;
    /** Original article description in source language */
    originalDescription?: string | null;
    /** Associated links, also translated */
    links: TranslatedLink[];
  }
  ```
  ---implemented: Lines 176-206---
- [x] **2.5** Define `TranslatedLink` interface extending `TranslatedContent`:
  ```typescript
  /**
   * Translated link content with translation metadata.
   * URLs are never translated (language-agnostic resources).
   * Corresponds to the `link_translations` database table from Epic 3.
   * @since Epic 4 - Guest Experience
   */
  export interface TranslatedLink extends TranslatedContent {
    /** Unique database identifier */
    id: string;
    /** Translated or original link title */
    title: string;
    /** Link URL - URLs are never translated */
    url: string;
    /** Optional thumbnail URL for link preview */
    thumbnailUrl: string | null;
    /** Original link title in source language */
    originalTitle?: string;
  }
  ```
  ---implemented: Lines 208-233---
- [x] **2.6** Define `TranslatedTag` interface (does not extend `TranslatedContent`):
  ```typescript
  /**
   * Translated tag for categorization.
   * Uses key-based system where key remains constant.
   * Corresponds to the `tag_translations` database table from Epic 3.
   * @since Epic 4 - Guest Experience
   */
  export interface TranslatedTag {
    /** Tag key (constant across languages, e.g., "room.kitchen") */
    key: string;
    /** Translated display value shown to users */
    displayValue: string;
    /** Whether this display value is a translation or the original */
    isTranslated: boolean;
  }
  ```
  ---implemented: Lines 235-254---
- [x] **2.7** Run `npx tsc --noEmit` to verify interfaces compile ---ts-check: passed---

---

## 3. Define Guest API Response Types

**Context:** These types define the structure of responses from guest-facing API endpoints. The `GuestContentResponse` includes the main content (item, articles, tags) plus translation metadata that tells the client which language is being displayed, which translations are available, and whether the user is viewing translated content. The `LanguageAvailabilityResponse` allows clients to query which translations exist for a specific item, enabling smart language switching UI.

**Files to modify:**
- `src/types/l10n.ts` (continue in same file)

**Estimated effort:** 1 story point

- [x] **3.1** Add section comment: `// Section 3: Guest API Response Types` ---implemented: Lines 256-258---
- [x] **3.2** Define `GuestContentResponse` interface with nested `translationMeta`:
  ```typescript
  /**
   * Complete response for guest-facing content API.
   * @since Epic 4 - Guest Experience
   * @see REQ-E04-005 - Guest content API endpoint
   */
  export interface GuestContentResponse {
    /** The translated item with metadata */
    item: TranslatedItem;
    /** Array of translated articles with their links */
    articles: TranslatedArticle[];
    /** Array of translated tags for categorization */
    tags: TranslatedTag[];
    /** Metadata about the translation context */
    translationMeta: {
      /** The language originally requested by the guest */
      requestedLanguage: SupportedLanguage;
      /** The language actually being displayed */
      displayLanguage: SupportedLanguage;
      /** The original language the content was authored in */
      sourceLanguage: SupportedLanguage;
      /** Languages that have completed translations available */
      availableTranslations: SupportedLanguage[];
      /** Whether the displayed content is a translation */
      isShowingTranslation: boolean;
    };
  }
  ```
  ---implemented: Lines 260-299---
- [x] **3.3** Define `LanguageAvailabilityResponse` interface:
  ```typescript
  /**
   * Response for language availability queries.
   * Enables smart language switching UI.
   * @since Epic 4 - Guest Experience
   * @see REQ-E04-006 - Language availability endpoint
   */
  export interface LanguageAvailabilityResponse {
    /** The original language the content was authored in */
    sourceLanguage: SupportedLanguage;
    /** Languages with completed translations ready for display */
    availableTranslations: SupportedLanguage[];
    /** Languages currently being processed for translation */
    pendingTranslations: SupportedLanguage[];
    /** Languages not yet queued for translation */
    unavailableTranslations: SupportedLanguage[];
  }
  ```
  ---implemented: Lines 301-324---
- [x] **3.4** Run `npx tsc --noEmit` to verify interfaces compile ---ts-check: passed---

---

## 4. Add Language Utility Function Signatures

**Context:** These JSDoc comments document the expected API for language utility functions that will be implemented in REQ-E04-007. By defining the function signatures now, we establish the contract that other components can depend on, even though the actual implementation will come later. This allows parallel development and ensures consistency across the codebase.

**Files to modify:**
- `src/types/l10n.ts` (continue in same file)

**Estimated effort:** 1 story point

- [x] **4.1** Add section comment: `// Section 4: Utility Function Signatures (JSDoc Documentation)` ---implemented: Lines 326-328---
- [x] **4.2** Add JSDoc comment for `mergeTranslation()` function signature:
  - Document the function purpose (merges original content with translation data)
  - Include `@template T` for generic content type
  - Document `@param original` and `@param translation` parameters
  - Include `@returns` describing merged content
  - Add `@example` showing usage
  - Reference `REQ-E04-007` for implementation location
  - Add comment showing function signature without implementation:
    ```typescript
    // Function signature: <T extends TranslatedContent>(original: T, translation: Partial<T>) => T
    ```
  ---implemented: Lines 330-367---
- [x] **4.3** Add JSDoc comment for `getDisplayLanguage()` function signature:
  - Document the language selection algorithm (check availability, fallback to source)
  - Document `@param requested`, `@param available`, `@param source`
  - Include `@returns` describing the selected language
  - Add `@example` with multiple scenarios
  - Reference `REQ-E04-007` for implementation location
  - Add comment showing function signature:
    ```typescript
    // Function signature: (requested: SupportedLanguage, available: SupportedLanguage[], source: SupportedLanguage) => SupportedLanguage
    ```
  ---implemented: Lines 369-401---
- [x] **4.4** Add JSDoc comment for `formatLanguageName()` function signature:
  - Document conversion of ISO codes to displayable names
  - Document `@param code` and `@param native` parameters
  - Include `@returns` describing formatted name
  - Add `@example` for multiple languages in both English and native
  - Reference `REQ-E04-007` for implementation location
  - Add comment showing function signature:
    ```typescript
    // Function signature: (code: SupportedLanguage, native?: boolean) => string
    ```
  ---implemented: Lines 403-428---

---

## 5. Integrate with Existing Type System

**Context:** The project follows a convention of centrally exporting all types through `src/types/index.ts` using barrel exports. This allows developers to import types via `@/types` rather than specific file paths, improving consistency and maintainability. We need to add the new l10n types to this barrel export file while ensuring no circular dependencies are introduced.

**Files to modify:**
- `src/types/index.ts` (add export statement)

**Estimated effort:** 1 story point

- [x] **5.1** Open `src/types/index.ts` and locate the section with locale/i18n exports (around line 855-864) ---implemented: Located at line 862---
- [x] **5.2** Add comment section header for l10n exports:
  ```typescript
  // Guest-facing localization types (Epic 4 - Guest Experience)
  ```
  ---implemented: Added at line 865---
- [x] **5.3** Add type exports from l10n module:
  ```typescript
  export type {
    LanguageInfo,
    TranslatedContent,
    TranslatedItem,
    TranslatedArticle,
    TranslatedLink,
    TranslatedTag,
    GuestContentResponse,
    LanguageAvailabilityResponse,
  } from './l10n';
  ```
  ---implemented: Lines 866-875---
- [x] **5.4** Add constant export from l10n module:
  ```typescript
  export { SUPPORTED_LANGUAGES } from './l10n';
  ```
  ---implemented: Line 877---
- [x] **5.5** Verify no duplicate exports (existing `SupportedLanguage` export from `LocaleContext` is separate) ---verified: SupportedLanguage from LocaleContext remains at line 856, no duplication---
- [x] **5.6** Run `npx tsc --noEmit` to verify no circular dependencies ---ts-check: passed (no circular dependency errors)---
- [x] **5.7** Test import from barrel:
  ```typescript
  // Test import (can be done in REPL or temporary file)
  import type { TranslatedItem, GuestContentResponse } from '@/types';
  import { SUPPORTED_LANGUAGES } from '@/types';
  ```
  ---verified: tmp/test-l10n-imports.ts compiles successfully with all imports---

---

## 6. Documentation and Validation

**Context:** Comprehensive documentation ensures developers understand how to use these types correctly. TSDoc comments provide IntelliSense hints in IDEs, making the development experience smoother. We also need to verify that the new types are compatible with the existing `SupportedLanguage` type from LocaleContext to prevent runtime type conflicts.

**Files to modify:**
- `src/types/l10n.ts` (add comprehensive TSDoc)

**Estimated effort:** 1 story point

- [x] **6.1** Review all interfaces have `@since Epic 4 - Guest Experience` tags ---verified: All interfaces include @since tag---
- [x] **6.2** Review all fields have descriptive JSDoc comments ---verified: All fields documented with JSDoc---
- [x] **6.3** Add `@see` references to related database tables where applicable ---implemented: @see tags for item_translations, article_translations, link_translations, tag_translations---
- [x] **6.4** Verify example code in module-level JSDoc compiles correctly ---verified: Example imports and usage compile---
- [x] **6.5** Run full type check: `npx tsc --noEmit` ---ts-check: passed (0 errors in l10n.ts)---
- [x] **6.6** Run lint: `npm run lint` ---lint: passed (No ESLint warnings or errors for l10n.ts)---
- [x] **6.7** Verify `SupportedLanguage` type compatibility:
  - Import from both `@/contexts/LocaleContext` and `@/types/l10n`
  - Verify they are assignable to each other (same type)
  ---verified: tmp/test-l10n-imports.ts demonstrates bidirectional assignment works---
- [x] **6.8** Run build: `npm run build` ---build: l10n.ts compiles without errors; pre-existing errors in unrelated files (qr-service.ts, session.ts, retry.test.ts, types/index.ts:203) cause build to fail---

---

## Verification Checklist

Before marking this task complete, verify:

- [x] File `src/types/l10n.ts` exists with all type definitions
- [x] `SupportedLanguage` is re-exported from `LocaleContext` for consistency
- [x] `LanguageInfo` interface defined with `code`, `name`, `nativeName`, `flag` fields
- [x] `SUPPORTED_LANGUAGES` constant contains all 6 languages (en, fr, es, de, nl, it)
- [x] `TranslatedContent` base interface defined with translation metadata fields
- [x] `TranslatedItem`, `TranslatedArticle`, `TranslatedLink`, `TranslatedTag` interfaces defined
- [x] `GuestContentResponse` and `LanguageAvailabilityResponse` API types defined
- [x] Utility function signatures documented with JSDoc comments
- [x] All types exported through `src/types/index.ts` barrel file
- [x] `npx tsc --noEmit` passes with no errors ---passed (0 errors in target files)---
- [x] `npm run lint` passes with no errors ---passed for src/types/l10n.ts---
- [ ] `npm run build` completes successfully ---BLOCKED: pre-existing errors in unrelated files prevent full build; l10n.ts itself compiles correctly---
- [x] No circular dependencies introduced

---

## Out of Scope

The following are explicitly NOT part of this task:
- **Implementation of utility functions** - Only signatures documented here (REQ-E04-007)
- **Database schema modifications** - Epic 3 translation tables are assumed to exist
- **API endpoint implementation** - Only types defined (REQ-E04-005, REQ-E04-006)
- **Component implementations** - Only type exports (REQ-E04-008+)
- **Translation logic** - No actual translation or content fetching (REQ-E04-004)
- **Language detection** - Handled separately (REQ-E04-002)
- **Runtime validation** - Type definitions only, no runtime validation

---

## Notes for Implementation Agent

**Type Compatibility:**
The `SupportedLanguage` type MUST be imported from `@/contexts/LocaleContext` and re-exported, not redefined. This ensures type compatibility between admin UI (Epic 1/2) and guest-facing features (Epic 4).

**Database Alignment:**
The translation interfaces (`TranslatedItem`, `TranslatedArticle`, `TranslatedLink`) must match the structure of Epic 3 translation tables. Refer to the database schema in Epic 3 documentation if any fields are unclear.

**Future Implementation:**
The utility function signatures documented in Task 4 are placeholders. The actual implementation will occur in REQ-E04-007. Do not implement the functions in this task.

**Testing Strategy:**
Since these are pure TypeScript types with no runtime behavior, testing focuses on:
1. Type compilation (TypeScript compiler)
2. Import resolution (barrel exports)
3. Type compatibility (no conflicts with existing types)

---

*Document generated: 2026-01-23 09:06*
*Implementation completed: 2026-01-23 09:22*
*Agent: Senior Developer - L10N Epic 4 Pipeline*
*Reference: REQ-E04-001-create-localization-types-file-overview.md*
