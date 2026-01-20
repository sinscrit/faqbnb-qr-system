# REQ-E04-001: Create Localization Types File - Detailed Task Breakdown

**Created:** 2026-01-19 22:15 UTC
**Last Modified:** 2026-01-19 22:15 UTC
**Request Reference:** REQ-E04-001 (docs/gen_requests_epic4.md)
**Overview Document:** docs/REQ-E04-001-create-localization-types-file-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
**Phase:** 1 - Types and Utilities
**Task ID:** 1.1

---

## Executive Summary

This document provides a granular, step-by-step breakdown of Task 1.1: Create Localization Types File. The task creates a centralized TypeScript file (`src/types/l10n.ts`) that provides type definitions, constants, and utility functions for the guest-facing translation experience in Epic 4.

**Total Estimated Effort:** 6 subtasks (~80 minutes total)

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete (check `src/lib/i18n/config.ts` exists)
- [ ] `src/types/` directory exists
- [ ] `src/types/index.ts` exists and follows current export patterns
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`

---

## Task Breakdown

### Task 1.1.1: Create File with Base Type Definitions

**Effort:** 15 minutes
**Priority:** Required (Blocking)
**Dependencies:** None

#### Description
Create the new `src/types/l10n.ts` file with the file header and foundational language types.

#### Implementation Steps

1. **Create the file** at `src/types/l10n.ts`

2. **Add file header with module documentation:**
   ```typescript
   /**
    * Localization Type Definitions for Guest Experience
    *
    * Provides TypeScript types for translated content display,
    * language selection, and translation status tracking.
    *
    * @module types/l10n
    * @see docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
    * @created 2026-01-19
    * @lastModified 2026-01-19 (REQ-E04-001)
    */
   ```

3. **Add the Language Types section:**
   ```typescript
   // =============================================================================
   // Language Types
   // =============================================================================

   /**
    * Supported language codes for the application.
    * Uses ISO 639-1 two-letter codes.
    * Must match codes in src/lib/i18n/config.ts
    */
   export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

   /**
    * Language metadata including display names and optional flag.
    */
   export interface LanguageInfo {
     /** ISO 639-1 language code */
     code: SupportedLanguage;
     /** English name of the language */
     name: string;
     /** Native name of the language (e.g., "Deutsch" for German) */
     nativeName: string;
     /** Optional flag emoji for visual display */
     flag?: string;
   }

   /**
    * Text direction for a language.
    * All currently supported languages are LTR.
    * Included for future RTL language support.
    */
   export type TextDirection = 'ltr' | 'rtl';
   ```

#### Acceptance Criteria
- [ ] File `src/types/l10n.ts` exists
- [ ] File header includes module documentation with @see reference
- [ ] `SupportedLanguage` type defined with all 6 language codes
- [ ] `LanguageInfo` interface includes code, name, nativeName, flag properties
- [ ] `TextDirection` type defined
- [ ] All types have JSDoc comments

#### Verification Commands
```bash
# Verify file exists
ls -la src/types/l10n.ts

# Verify TypeScript compiles
npx tsc --noEmit src/types/l10n.ts
```

---

### Task 1.1.2: Add Language Constants

**Effort:** 10 minutes
**Priority:** Required (Blocking)
**Dependencies:** Task 1.1.1

#### Description
Add the `SUPPORTED_LANGUAGES` constant array, `LANGUAGE_MAP` for O(1) lookup, and cookie-related constants.

#### Implementation Steps

1. **Add the Language Constants section** after the Language Types section:
   ```typescript
   // =============================================================================
   // Language Constants
   // =============================================================================

   /**
    * Array of all supported languages with complete metadata.
    * Order determines display order in UI components.
    */
   export const SUPPORTED_LANGUAGES: readonly LanguageInfo[] = [
     { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
     { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
     { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
     { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
     { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
     { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
   ] as const;

   /**
    * Map of language code to language info for O(1) lookup.
    * Use this for direct access by code instead of array search.
    */
   export const LANGUAGE_MAP: Record<SupportedLanguage, LanguageInfo> = {
     en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
     fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
     es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
     de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
     nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
     it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
   };

   /**
    * Default language for the application.
    * Used when no preference is detected or language is unsupported.
    */
   export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

   /**
    * Cookie name for storing guest language preference.
    * Separate from owner FAQBNB_LANG cookie.
    */
   export const GUEST_LANGUAGE_COOKIE = 'FAQBNB_GUEST_LANG';

   /**
    * Cookie max age in seconds (1 year).
    */
   export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
   ```

#### Acceptance Criteria
- [ ] `SUPPORTED_LANGUAGES` array exported with all 6 languages
- [ ] Languages match exactly: en, fr, es, de, nl, it
- [ ] `LANGUAGE_MAP` record exported for O(1) lookup
- [ ] `DEFAULT_LANGUAGE` constant set to 'en'
- [ ] `GUEST_LANGUAGE_COOKIE` name is 'FAQBNB_GUEST_LANG'
- [ ] `GUEST_LANGUAGE_COOKIE_MAX_AGE` equals 31,536,000 (1 year)
- [ ] Language metadata matches `src/lib/i18n/config.ts`

#### Verification Commands
```bash
# Verify constants match i18n config
grep -E "code:" src/types/l10n.ts | wc -l  # Should be 12 (6 in array + 6 in map)
grep -E "'en'|'fr'|'es'|'de'|'nl'|'it'" src/lib/i18n/config.ts
```

---

### Task 1.1.3: Add Translated Content Types

**Effort:** 20 minutes
**Priority:** Required (Blocking)
**Dependencies:** Task 1.1.1

#### Description
Create interfaces for translated content structures including base `TranslatedContent` and entity-specific variants.

#### Implementation Steps

1. **Add the Translation Status Types section:**
   ```typescript
   // =============================================================================
   // Translation Status Types
   // =============================================================================

   /**
    * Status of a translation record.
    * - pending: Translation job queued but not completed
    * - completed: Translation available and ready to display
    * - failed: Translation attempt failed
    */
   export type TranslationStatus = 'pending' | 'completed' | 'failed';
   ```

2. **Add the Translated Content Types section:**
   ```typescript
   // =============================================================================
   // Translated Content Types
   // =============================================================================

   /**
    * Base interface for translated content metadata.
    * Extended by entity-specific translated types.
    */
   export interface TranslatedContent {
     /** Language the content is being displayed in */
     displayLanguage: SupportedLanguage;
     /** Original language of the content */
     sourceLanguage: SupportedLanguage;
     /** Whether this content is a translation (vs original) */
     isTranslated: boolean;
     /** Current status of the translation */
     translationStatus?: TranslationStatus;
   }

   /**
    * Translated item (e.g., appliance, room item).
    * Includes original values for "View Original" toggle.
    */
   export interface TranslatedItem extends TranslatedContent {
     /** Database UUID */
     id: string;
     /** Public identifier for QR codes and URLs */
     publicId: string;
     /** Item name (translated or original) */
     name: string;
     /** Item description (translated or original) */
     description: string | null;
     /** Original name if showing translation */
     originalName?: string;
     /** Original description if showing translation */
     originalDescription?: string;
   }

   /**
    * Translated article (grouped content by purpose).
    * Contains nested translated links.
    */
   export interface TranslatedArticle extends TranslatedContent {
     /** Database UUID */
     id: string;
     /** Article title (translated or original) */
     title: string;
     /** Article description (translated or original) */
     description: string | null;
     /** Original title if showing translation */
     originalTitle?: string;
     /** Original description if showing translation */
     originalDescription?: string;
     /** Links within this article */
     links: TranslatedLink[];
   }

   /**
    * Translated link within an article.
    * Note: URL is never translated, only title.
    */
   export interface TranslatedLink extends TranslatedContent {
     /** Database UUID */
     id: string;
     /** Link title (translated or original) */
     title: string;
     /** URL is never translated */
     url: string;
     /** Thumbnail URL (never translated) */
     thumbnailUrl: string | null;
     /** Original title if showing translation */
     originalTitle?: string;
   }

   /**
    * Translated tag for categorization.
    * Tags are standalone values, not extending TranslatedContent.
    */
   export interface TranslatedTag {
     /** Tag key identifier (e.g., "#room.kitchen") */
     key: string;
     /** Translated or original display value */
     displayValue: string;
     /** Whether this tag value is translated */
     isTranslated: boolean;
   }
   ```

#### Acceptance Criteria
- [ ] `TranslationStatus` type defined with 'pending', 'completed', 'failed'
- [ ] `TranslatedContent` base interface has all 4 required fields
- [ ] `TranslatedItem` extends `TranslatedContent` with item-specific fields
- [ ] `TranslatedArticle` extends `TranslatedContent` with links array
- [ ] `TranslatedLink` extends `TranslatedContent` with url (never translated)
- [ ] `TranslatedTag` interface is standalone (not extending base)
- [ ] All interfaces have JSDoc documentation
- [ ] Original value fields (originalName, originalTitle, etc.) are optional

#### Verification
```bash
# Type check passes
npx tsc --noEmit src/types/l10n.ts
```

---

### Task 1.1.4: Add API Response Types

**Effort:** 15 minutes
**Priority:** Required (Blocking)
**Dependencies:** Task 1.1.3

#### Description
Add types for API response contracts including `GuestContentResponse` and `LanguageAvailabilityResponse`.

#### Implementation Steps

1. **Add the API Response Types section:**
   ```typescript
   // =============================================================================
   // API Response Types
   // =============================================================================

   /**
    * Translation metadata included in guest content responses.
    * Provides context about the translation state for UI components.
    */
   export interface TranslationMeta {
     /** Language that was requested by the guest */
     requestedLanguage: SupportedLanguage;
     /** Language actually being displayed (may differ if translation unavailable) */
     displayLanguage: SupportedLanguage;
     /** Original language of the source content */
     sourceLanguage: SupportedLanguage;
     /** List of languages with completed translations */
     availableTranslations: SupportedLanguage[];
     /** Whether the displayed content is a translation (vs original) */
     isShowingTranslation: boolean;
   }

   /**
    * Complete response for guest item page.
    * Includes item, articles, tags, and translation metadata.
    * Returned by GET /api/public/items/[publicId]
    */
   export interface GuestContentResponse {
     /** Translated item data */
     item: TranslatedItem;
     /** Translated articles with nested links */
     articles: TranslatedArticle[];
     /** Translated tags */
     tags: TranslatedTag[];
     /** Translation context for UI components */
     translationMeta: TranslationMeta;
   }

   /**
    * Response for language availability query.
    * Used by language switcher to show available translations.
    * Returned by GET /api/public/items/[publicId]/languages
    */
   export interface LanguageAvailabilityResponse {
     /** Original language of the content */
     sourceLanguage: SupportedLanguage;
     /** Languages with completed translations (ready to display) */
     availableTranslations: SupportedLanguage[];
     /** Languages with translations in progress */
     pendingTranslations: SupportedLanguage[];
     /** Languages without any translation (not started) */
     unavailableTranslations: SupportedLanguage[];
   }
   ```

#### Acceptance Criteria
- [ ] `TranslationMeta` interface has all 5 required fields
- [ ] `GuestContentResponse` includes item, articles, tags, translationMeta
- [ ] `LanguageAvailabilityResponse` categorizes all translation states
- [ ] JSDoc includes API endpoint references
- [ ] Types match Implementation Plan specification

#### Verification
```bash
# Verify interface structure
grep -A 10 "interface GuestContentResponse" src/types/l10n.ts
grep -A 10 "interface LanguageAvailabilityResponse" src/types/l10n.ts
```

---

### Task 1.1.5: Add Utility Functions

**Effort:** 15 minutes
**Priority:** Required (Blocking)
**Dependencies:** Task 1.1.2

#### Description
Add language utility functions for validation, lookup, normalization, and display formatting.

#### Implementation Steps

1. **Add the Utility Functions section:**
   ```typescript
   // =============================================================================
   // Utility Functions
   // =============================================================================

   /**
    * Type guard to check if a string is a valid supported language code.
    *
    * @param code - The string to check
    * @returns True if code is a valid SupportedLanguage
    *
    * @example
    * if (isSupportedLanguage(userInput)) {
    *   // TypeScript knows userInput is SupportedLanguage
    *   setLanguage(userInput);
    * }
    */
   export function isSupportedLanguage(code: string): code is SupportedLanguage {
     return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
   }

   /**
    * Get language info for a given language code.
    * Overloaded to return correct type based on input.
    *
    * @param code - The language code to look up
    * @returns LanguageInfo if found, undefined otherwise
    *
    * @example
    * const info = getLanguageInfo('fr');
    * console.log(info?.nativeName); // "Français"
    */
   export function getLanguageInfo(code: SupportedLanguage): LanguageInfo;
   export function getLanguageInfo(code: string): LanguageInfo | undefined;
   export function getLanguageInfo(code: string): LanguageInfo | undefined {
     return LANGUAGE_MAP[code as SupportedLanguage];
   }

   /**
    * Get the native name for a language code.
    *
    * @param code - The language code
    * @returns Native language name or the code if not found
    *
    * @example
    * getLanguageNativeName('de'); // "Deutsch"
    * getLanguageNativeName('zh'); // "zh" (not found)
    */
   export function getLanguageNativeName(code: string): string {
     return getLanguageInfo(code)?.nativeName ?? code;
   }

   /**
    * Get the English name for a language code.
    *
    * @param code - The language code
    * @returns English language name or the code if not found
    *
    * @example
    * getLanguageName('de'); // "German"
    */
   export function getLanguageName(code: string): string {
     return getLanguageInfo(code)?.name ?? code;
   }

   /**
    * Get the flag emoji for a language code.
    *
    * @param code - The language code
    * @returns Flag emoji or empty string if not found
    *
    * @example
    * getLanguageFlag('fr'); // "🇫🇷"
    */
   export function getLanguageFlag(code: string): string {
     return getLanguageInfo(code)?.flag ?? '';
   }

   /**
    * Normalize a locale code to a supported language.
    * Handles browser locale variations like 'en-US' -> 'en', 'fr-CA' -> 'fr'.
    *
    * @param locale - The locale string to normalize
    * @returns The normalized supported language or default if not found
    *
    * @example
    * normalizeToSupportedLanguage('en-US'); // 'en'
    * normalizeToSupportedLanguage('fr-CA'); // 'fr'
    * normalizeToSupportedLanguage('zh'); // 'en' (default, not supported)
    * normalizeToSupportedLanguage(null); // 'en' (default)
    */
   export function normalizeToSupportedLanguage(locale: string | null | undefined): SupportedLanguage {
     if (!locale) {
       return DEFAULT_LANGUAGE;
     }

     // Direct match
     if (isSupportedLanguage(locale)) {
       return locale;
     }

     // Try extracting the language code (e.g., 'en-US' -> 'en')
     const languageCode = locale.split('-')[0]?.toLowerCase();
     if (languageCode && isSupportedLanguage(languageCode)) {
       return languageCode;
     }

     return DEFAULT_LANGUAGE;
   }

   /**
    * Format a language for display with optional flag.
    *
    * @param code - The language code
    * @param options - Formatting options
    * @returns Formatted string for display
    *
    * @example
    * formatLanguageDisplay('fr'); // "🇫🇷 Français"
    * formatLanguageDisplay('de', { useEnglishName: true }); // "🇩🇪 German"
    * formatLanguageDisplay('fr', { includeFlag: false }); // "Français"
    */
   export function formatLanguageDisplay(
     code: string,
     options: {
       /** Use English name instead of native name */
       useEnglishName?: boolean;
       /** Include flag emoji (default: true) */
       includeFlag?: boolean;
     } = {}
   ): string {
     const { useEnglishName = false, includeFlag = true } = options;
     const info = getLanguageInfo(code);

     if (!info) {
       return code;
     }

     const name = useEnglishName ? info.name : info.nativeName;
     return includeFlag && info.flag ? `${info.flag} ${name}` : name;
   }
   ```

#### Acceptance Criteria
- [ ] `isSupportedLanguage` is a type guard function
- [ ] `getLanguageInfo` has function overloads for type safety
- [ ] `getLanguageNativeName` returns native name or code
- [ ] `getLanguageName` returns English name or code
- [ ] `getLanguageFlag` returns flag emoji or empty string
- [ ] `normalizeToSupportedLanguage` handles null/undefined and locale codes
- [ ] `formatLanguageDisplay` has options for English name and flag
- [ ] All functions have JSDoc with @example

#### Verification
```bash
# TypeScript compile check
npx tsc --noEmit src/types/l10n.ts

# Count utility functions
grep -c "export function" src/types/l10n.ts  # Should be 7
```

---

### Task 1.1.6: Update types/index.ts with Exports

**Effort:** 5 minutes
**Priority:** Required (Blocking)
**Dependencies:** Tasks 1.1.1-1.1.5

#### Description
Add exports for all l10n types, constants, and utility functions to `src/types/index.ts`.

#### Implementation Steps

1. **Locate the correct position** in `src/types/index.ts` (after existing locale exports around line 673)

2. **Add the l10n exports** at the end of the file, after the existing locale exports:
   ```typescript
   // Guest localization types for translated content (REQ-E04-001)
   export type {
     SupportedLanguage as GuestSupportedLanguage,
     LanguageInfo,
     TextDirection,
     TranslationStatus,
     TranslatedContent,
     TranslatedItem,
     TranslatedArticle,
     TranslatedLink,
     TranslatedTag,
     TranslationMeta,
     GuestContentResponse,
     LanguageAvailabilityResponse,
   } from './l10n';

   export {
     SUPPORTED_LANGUAGES,
     LANGUAGE_MAP,
     DEFAULT_LANGUAGE,
     GUEST_LANGUAGE_COOKIE,
     GUEST_LANGUAGE_COOKIE_MAX_AGE,
     isSupportedLanguage,
     getLanguageInfo,
     getLanguageNativeName,
     getLanguageName,
     getLanguageFlag,
     normalizeToSupportedLanguage,
     formatLanguageDisplay,
   } from './l10n';
   ```

   > **Note:** We export `SupportedLanguage` as `GuestSupportedLanguage` to avoid conflict with the existing `SupportedLanguage` export from `LocaleContext`. Consumers can import either alias.

3. **Alternative approach** - if no conflict desired, just export types from l10n directly:
   ```typescript
   // Guest localization types and utilities (REQ-E04-001)
   export * from './l10n';
   ```

#### Acceptance Criteria
- [ ] All types from l10n.ts are exported
- [ ] All constants from l10n.ts are exported
- [ ] All utility functions from l10n.ts are exported
- [ ] Comment with REQ-E04-001 reference added
- [ ] No TypeScript compilation errors
- [ ] No naming conflicts with existing exports

#### Verification Commands
```bash
# Full TypeScript compilation check
npx tsc --noEmit

# Verify exports work (create temp test file)
echo "import { SUPPORTED_LANGUAGES, isSupportedLanguage, GuestContentResponse } from '@/types';" > /tmp/test-imports.ts
npx tsc --noEmit /tmp/test-imports.ts
rm /tmp/test-imports.ts
```

---

## Complete File Reference

After completing all tasks, `src/types/l10n.ts` should contain:

```typescript
/**
 * Localization Type Definitions for Guest Experience
 *
 * Provides TypeScript types for translated content display,
 * language selection, and translation status tracking.
 *
 * @module types/l10n
 * @see docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md
 * @created 2026-01-19
 * @lastModified 2026-01-19 (REQ-E04-001)
 */

// =============================================================================
// Language Types
// =============================================================================

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag?: string;
}

export type TextDirection = 'ltr' | 'rtl';

// =============================================================================
// Language Constants
// =============================================================================

export const SUPPORTED_LANGUAGES: readonly LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
] as const;

export const LANGUAGE_MAP: Record<SupportedLanguage, LanguageInfo> = { ... };
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const GUEST_LANGUAGE_COOKIE = 'FAQBNB_GUEST_LANG';
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// =============================================================================
// Translation Status Types
// =============================================================================

export type TranslationStatus = 'pending' | 'completed' | 'failed';

// =============================================================================
// Translated Content Types
// =============================================================================

export interface TranslatedContent { ... }
export interface TranslatedItem extends TranslatedContent { ... }
export interface TranslatedArticle extends TranslatedContent { ... }
export interface TranslatedLink extends TranslatedContent { ... }
export interface TranslatedTag { ... }

// =============================================================================
// API Response Types
// =============================================================================

export interface TranslationMeta { ... }
export interface GuestContentResponse { ... }
export interface LanguageAvailabilityResponse { ... }

// =============================================================================
// Utility Functions
// =============================================================================

export function isSupportedLanguage(code: string): code is SupportedLanguage { ... }
export function getLanguageInfo(code: string): LanguageInfo | undefined { ... }
export function getLanguageNativeName(code: string): string { ... }
export function getLanguageName(code: string): string { ... }
export function getLanguageFlag(code: string): string { ... }
export function normalizeToSupportedLanguage(locale: string | null | undefined): SupportedLanguage { ... }
export function formatLanguageDisplay(code: string, options?: {...}): string { ... }
```

---

## Testing Checklist

### Unit Test Cases

```typescript
// Test file: src/types/__tests__/l10n.test.ts

import {
  isSupportedLanguage,
  getLanguageInfo,
  getLanguageNativeName,
  getLanguageName,
  getLanguageFlag,
  normalizeToSupportedLanguage,
  formatLanguageDisplay,
  SUPPORTED_LANGUAGES,
  LANGUAGE_MAP,
  DEFAULT_LANGUAGE,
} from '../l10n';

describe('l10n types', () => {
  describe('isSupportedLanguage', () => {
    it('returns true for supported languages', () => {
      expect(isSupportedLanguage('en')).toBe(true);
      expect(isSupportedLanguage('fr')).toBe(true);
      expect(isSupportedLanguage('de')).toBe(true);
    });

    it('returns false for unsupported languages', () => {
      expect(isSupportedLanguage('zh')).toBe(false);
      expect(isSupportedLanguage('ja')).toBe(false);
      expect(isSupportedLanguage('')).toBe(false);
    });
  });

  describe('normalizeToSupportedLanguage', () => {
    it('normalizes browser locale codes', () => {
      expect(normalizeToSupportedLanguage('en-US')).toBe('en');
      expect(normalizeToSupportedLanguage('fr-CA')).toBe('fr');
      expect(normalizeToSupportedLanguage('de-AT')).toBe('de');
    });

    it('returns default for unsupported locales', () => {
      expect(normalizeToSupportedLanguage('zh')).toBe('en');
      expect(normalizeToSupportedLanguage('zh-CN')).toBe('en');
    });

    it('handles null/undefined', () => {
      expect(normalizeToSupportedLanguage(null)).toBe('en');
      expect(normalizeToSupportedLanguage(undefined)).toBe('en');
    });
  });

  describe('formatLanguageDisplay', () => {
    it('formats with flag and native name by default', () => {
      expect(formatLanguageDisplay('fr')).toBe('🇫🇷 Français');
      expect(formatLanguageDisplay('de')).toBe('🇩🇪 Deutsch');
    });

    it('uses English name when requested', () => {
      expect(formatLanguageDisplay('fr', { useEnglishName: true })).toBe('🇫🇷 French');
    });

    it('omits flag when requested', () => {
      expect(formatLanguageDisplay('fr', { includeFlag: false })).toBe('Français');
    });

    it('returns code for unknown languages', () => {
      expect(formatLanguageDisplay('zh')).toBe('zh');
    });
  });

  describe('constants', () => {
    it('has 6 supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(6);
    });

    it('default language is English', () => {
      expect(DEFAULT_LANGUAGE).toBe('en');
    });

    it('LANGUAGE_MAP has all languages', () => {
      expect(Object.keys(LANGUAGE_MAP)).toEqual(['en', 'fr', 'es', 'de', 'nl', 'it']);
    });
  });
});
```

### Integration Test - Import Verification

```typescript
// Verify imports work from @/types
import {
  SupportedLanguage,
  LanguageInfo,
  TranslatedItem,
  GuestContentResponse,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  getLanguageInfo,
  formatLanguageDisplay,
} from '@/types';

// Type check - these should compile without errors
const lang: SupportedLanguage = 'fr';
const isValid: boolean = isSupportedLanguage('de');
const info: LanguageInfo | undefined = getLanguageInfo('es');
const display: string = formatLanguageDisplay('it');
```

---

## Definition of Done

- [ ] `src/types/l10n.ts` file created with all sections
- [ ] All 6 subtasks completed and verified
- [ ] `src/types/index.ts` updated with exports
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Imports work from `@/types`
- [ ] Language codes match `src/lib/i18n/config.ts`
- [ ] All types have JSDoc documentation
- [ ] All utility functions have @example in JSDoc
- [ ] No naming conflicts with existing exports

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [Overview Document](docs/REQ-E04-001-create-localization-types-file-overview.md) | High-level task overview |
| [Implementation Plan](docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md) | Epic 4 implementation plan |
| [Request](docs/gen_requests_epic4.md#req-e04-001) | Original feature request |
| [i18n Config](src/lib/i18n/config.ts) | Existing locale configuration |
| [LocaleContext](src/contexts/LocaleContext.tsx) | Existing owner locale context |
| [Types Index](src/types/index.ts) | Central type exports |

---

*Document generated: 2026-01-19 22:15 UTC*
*Detailed breakdown for Task 1.1 of Phase 1 - Types and Utilities*
