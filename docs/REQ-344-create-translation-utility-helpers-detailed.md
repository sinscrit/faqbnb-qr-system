# REQ-344: Create Translation Utility Helpers - Detailed Task Breakdown

**Document Created:** 2026-01-19 16:45:00
**Last Modified:** 2026-01-19 16:45:00
**Request Reference:** REQ-344 (Translation Utility Helpers for Content Merging and Language Selection)
**Overview Document:** `/docs/REQ-344-create-translation-utility-helpers-overview.md`
**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.4

---

## 1. Document Purpose

This detailed task breakdown provides granular, actionable implementation steps for REQ-344. Each task is designed to be approximately 1 story point (15-30 minutes of work) and includes specific file paths, code snippets, and verification steps.

---

## 2. Prerequisites

### 2.1 Required Completions
- [x] Epic 1 Foundation complete - i18n configuration exists at `/src/lib/i18n/config.ts`
- [x] `SupportedLocale` type defined in `/src/lib/i18n/config.ts`
- [x] `localeMetadata` constant available with language names
- [x] `isValidLocale` type guard function available

### 2.2 Dependencies
| Dependency | Location | Status |
|------------|----------|--------|
| SupportedLocale type | `/src/lib/i18n/config.ts` | Available |
| localeMetadata | `/src/lib/i18n/config.ts` | Available |
| isValidLocale | `/src/lib/i18n/config.ts` | Available |
| DEFAULT_LOCALE | `/src/lib/i18n/config.ts` | Available |

---

## 3. Task Breakdown

### Task 2.4.1: Create translations directory and barrel export file

**Priority:** High (Foundation)
**Estimated Effort:** 1 story point

**Description:**
Create the `/src/lib/translations/` directory structure and the barrel export file that will export all translation utilities.

**Files to Create:**
- `/src/lib/translations/index.ts`

**Implementation Steps:**

1. Create the directory `/src/lib/translations/` if it doesn't exist

2. Create `/src/lib/translations/index.ts` with the following content:

```typescript
/**
 * Translations Module Exports
 *
 * Centralized exports for translation utilities used in guest-facing
 * localization features.
 *
 * REQ-344: Create Translation Utility Helpers for Content Merging and Language Selection
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 2, Task 2.4
 *
 * @module lib/translations
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// Translation utility functions - will be populated by Task 2.4.2
export {
  // Content merging
  mergeTranslation,
  hasTranslationContent,
  isTranslationComplete,
  getTranslationStatus,
  // Language selection
  getDisplayLanguage,
  // Language display
  formatLanguageName,
  getLanguageNames,
  // Metadata creation
  createTranslationMeta,
  isShowingTranslation,
  // Constants
  TRANSLATION_FIELDS_ITEM,
  TRANSLATION_FIELDS_ARTICLE,
  TRANSLATION_FIELDS_LINK,
  TRANSLATION_FIELDS_TAG,
} from './translation-utils';

// Types
export type {
  TranslationMeta,
  TranslationStatus,
  MergeableContent,
} from './translation-utils';
```

**Verification:**
- [ ] Directory `/src/lib/translations/` exists
- [ ] File `/src/lib/translations/index.ts` exists
- [ ] File has proper module documentation header

---

### Task 2.4.2: Create translation-utils.ts with types and constants

**Priority:** High (Foundation)
**Estimated Effort:** 2 story points

**Description:**
Create the main translation utilities file with all type definitions, interfaces, and constants.

**File to Create:**
- `/src/lib/translations/translation-utils.ts`

**Implementation Steps:**

1. Create the file with header documentation and imports:

```typescript
/**
 * Translation Utilities for Guest Experience
 *
 * Pure utility functions for translation operations including
 * content merging, language selection, and display formatting.
 * All functions are side-effect free and easily testable.
 *
 * REQ-344: Create Translation Utility Helpers for Content Merging and Language Selection
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 2, Task 2.4
 *
 * @module lib/translations/translation-utils
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import {
  type SupportedLocale,
  localeMetadata,
  isValidLocale,
  DEFAULT_LOCALE,
} from '@/lib/i18n/config';
```

2. Add type definitions:

```typescript
// =============================================================================
// Types
// =============================================================================

/**
 * Translation status indicating completeness level.
 */
export type TranslationStatus = 'complete' | 'partial' | 'missing';

/**
 * Metadata about translation state for API responses.
 * Used by GuestContentResponse to communicate translation context.
 */
export interface TranslationMeta {
  /** Language that was requested by the guest */
  requestedLanguage: SupportedLocale;
  /** Language actually being displayed */
  displayLanguage: SupportedLocale;
  /** Original/source language of the content */
  sourceLanguage: SupportedLocale;
  /** Languages that have translations available */
  availableTranslations: SupportedLocale[];
  /** Whether content is showing a translation vs original */
  isShowingTranslation: boolean;
  /** Completeness status of the translation */
  translationStatus?: TranslationStatus;
}

/**
 * Generic constraint for objects that can be merged with translations.
 */
export type MergeableContent = Record<string, unknown>;
```

3. Add constants:

```typescript
// =============================================================================
// Constants
// =============================================================================

/**
 * Translatable field names for items.
 */
export const TRANSLATION_FIELDS_ITEM = ['name', 'description'] as const;

/**
 * Translatable field names for articles.
 */
export const TRANSLATION_FIELDS_ARTICLE = ['title', 'description'] as const;

/**
 * Translatable field names for links.
 */
export const TRANSLATION_FIELDS_LINK = ['title'] as const;

/**
 * Translatable field names for tags.
 */
export const TRANSLATION_FIELDS_TAG = ['displayValue'] as const;
```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] Types can be imported from the file
- [ ] Constants are properly typed as readonly arrays

---

### Task 2.4.3: Implement mergeTranslation function

**Priority:** High (Core Functionality)
**Estimated Effort:** 2 story points

**Description:**
Implement the `mergeTranslation` function that merges original content with translation data.

**File to Modify:**
- `/src/lib/translations/translation-utils.ts`

**Implementation Steps:**

1. Add the mergeTranslation function after the constants section:

```typescript
// =============================================================================
// Content Merging Functions
// =============================================================================

/**
 * Merge original content with translation data.
 * Translation values override original values for non-null/undefined fields.
 * Creates a new object without mutating inputs.
 *
 * @param original - Original content object
 * @param translation - Translation overlay (can be null/undefined)
 * @returns Merged object with translations applied
 *
 * @example
 * const original = { name: 'Coffee Machine', description: 'Makes coffee' };
 * const translation = { name: 'Kaffeemaschine', description: null };
 * const merged = mergeTranslation(original, translation);
 * // Result: { name: 'Kaffeemaschine', description: 'Makes coffee' }
 *
 * @example
 * // Handles null translation gracefully
 * const result = mergeTranslation(original, null);
 * // Result: returns original unchanged
 */
export function mergeTranslation<T extends MergeableContent>(
  original: T,
  translation: Partial<T> | null | undefined
): T {
  // Return original unchanged if no translation provided
  if (!translation) {
    return original;
  }

  // Create shallow copy to avoid mutation
  const merged = { ...original };

  // Iterate through translation keys and apply non-null values
  for (const key of Object.keys(translation) as Array<keyof T>) {
    const translatedValue = translation[key];

    // Only override if translation value is meaningful
    // (not null, undefined, or empty string)
    if (
      translatedValue !== null &&
      translatedValue !== undefined &&
      translatedValue !== ''
    ) {
      merged[key] = translatedValue as T[keyof T];
    }
  }

  return merged;
}
```

**Verification:**
- [ ] Function compiles without errors
- [ ] Function handles null translation input
- [ ] Function handles undefined translation input
- [ ] Function preserves original values for null/undefined/empty translation fields
- [ ] Function does not mutate original object

---

### Task 2.4.4: Implement hasTranslationContent function

**Priority:** High (Core Functionality)
**Estimated Effort:** 1 story point

**Description:**
Implement the `hasTranslationContent` function that checks if a translation object contains meaningful content.

**File to Modify:**
- `/src/lib/translations/translation-utils.ts`

**Implementation Steps:**

1. Add the function after `mergeTranslation`:

```typescript
/**
 * Check if a translation object contains meaningful (non-empty) content.
 *
 * @param translation - Translation object to check
 * @returns true if translation has at least one non-empty field
 *
 * @example
 * hasTranslationContent({ name: 'Kaffeemaschine' }) // true
 * hasTranslationContent({ name: null, description: '' }) // false
 * hasTranslationContent(null) // false
 */
export function hasTranslationContent(
  translation: MergeableContent | null | undefined
): boolean {
  if (!translation) {
    return false;
  }

  return Object.values(translation).some(
    (value) => value !== null && value !== undefined && value !== ''
  );
}
```

**Verification:**
- [ ] Function returns false for null input
- [ ] Function returns false for undefined input
- [ ] Function returns false when all fields are null/empty
- [ ] Function returns true when at least one field has content

---

### Task 2.4.5: Implement isTranslationComplete function

**Priority:** Medium
**Estimated Effort:** 1 story point

**Description:**
Implement the `isTranslationComplete` function that checks if all required fields are populated.

**File to Modify:**
- `/src/lib/translations/translation-utils.ts`

**Implementation Steps:**

1. Add the function after `hasTranslationContent`:

```typescript
/**
 * Check if a translation has all required fields populated.
 *
 * @param translation - Translation object to check
 * @param requiredFields - Array of field names that must be present
 * @returns true if all required fields have non-empty values
 *
 * @example
 * isTranslationComplete({ name: 'Test', description: 'Desc' }, ['name', 'description']) // true
 * isTranslationComplete({ name: 'Test', description: null }, ['name', 'description']) // false
 */
export function isTranslationComplete(
  translation: MergeableContent | null | undefined,
  requiredFields: readonly string[]
): boolean {
  if (!translation) {
    return false;
  }

  return requiredFields.every((field) => {
    const value = translation[field];
    return value !== null && value !== undefined && value !== '';
  });
}
```

**Verification:**
- [ ] Function returns false for null translation
- [ ] Function returns true when all required fields have content
- [ ] Function returns false when any required field is missing/empty
- [ ] Function handles empty requiredFields array correctly

---

### Task 2.4.6: Implement getTranslationStatus function

**Priority:** Medium
**Estimated Effort:** 1 story point

**Description:**
Implement the `getTranslationStatus` function that determines translation completeness status.

**File to Modify:**
- `/src/lib/translations/translation-utils.ts`

**Implementation Steps:**

1. Add the function after `isTranslationComplete`:

```typescript
/**
 * Determine translation completeness status.
 *
 * @param translation - Translation object to check
 * @param requiredFields - Array of field names that should be translated
 * @returns Translation status: 'complete', 'partial', or 'missing'
 *
 * @example
 * getTranslationStatus({ name: 'Test', description: 'Desc' }, ['name', 'description']) // 'complete'
 * getTranslationStatus({ name: 'Test', description: null }, ['name', 'description']) // 'partial'
 * getTranslationStatus(null, ['name', 'description']) // 'missing'
 */
export function getTranslationStatus(
  translation: MergeableContent | null | undefined,
  requiredFields: readonly string[]
): TranslationStatus {
  if (!translation || !hasTranslationContent(translation)) {
    return 'missing';
  }

  const populatedCount = requiredFields.filter((field) => {
    const value = translation[field];
    return value !== null && value !== undefined && value !== '';
  }).length;

  if (populatedCount === 0) {
    return 'missing';
  }

  if (populatedCount === requiredFields.length) {
    return 'complete';
  }

  return 'partial';
}
```

**Verification:**
- [ ] Function returns 'missing' for null translation
- [ ] Function returns 'complete' when all fields populated
- [ ] Function returns 'partial' when some fields populated
- [ ] Function returns 'missing' when no required fields populated

---

### Task 2.4.7: Implement getDisplayLanguage function

**Priority:** High (Core Functionality)
**Estimated Effort:** 2 story points

**Description:**
Implement the `getDisplayLanguage` function that determines the best language to display.

**File to Modify:**
- `/src/lib/translations/translation-utils.ts`

**Implementation Steps:**

1. Add a new section after the content merging functions:

```typescript
// =============================================================================
// Language Selection Functions
// =============================================================================

/**
 * Determine the best language to display based on availability.
 * Returns requested language if available, otherwise falls back to source.
 *
 * @param requested - Language requested by the guest
 * @param available - Languages that have translations available
 * @param source - Original/source language of the content
 * @returns Best language to display
 *
 * @example
 * getDisplayLanguage('fr', ['en', 'fr', 'de'], 'en') // 'fr' (requested is available)
 * getDisplayLanguage('es', ['en', 'fr', 'de'], 'en') // 'en' (fallback to source)
 * getDisplayLanguage('fr', [], 'en') // 'en' (no translations, use source)
 *
 * @example
 * // Edge case handling
 * getDisplayLanguage(null as any, ['en', 'fr'], 'en') // 'en' (invalid requested)
 * getDisplayLanguage('fr', null as any, 'en') // 'en' (invalid available)
 */
export function getDisplayLanguage(
  requested: SupportedLocale | string | null | undefined,
  available: SupportedLocale[] | null | undefined,
  source: SupportedLocale
): SupportedLocale {
  // Handle invalid inputs with sensible defaults
  if (!requested) {
    return source;
  }

  if (!available || !Array.isArray(available) || available.length === 0) {
    return source;
  }

  // Validate requested is a supported locale
  if (!isValidLocale(requested)) {
    return source;
  }

  // Check if requested language is available
  if (available.includes(requested as SupportedLocale)) {
    return requested as SupportedLocale;
  }

  // Fallback to source language
  return source;
}
```

**Verification:**
- [ ] Function returns requested language when available
- [ ] Function returns source language when requested unavailable
- [ ] Function handles null/undefined requested gracefully
- [ ] Function handles empty available array
- [ ] Function validates requested is a supported locale

---

### Task 2.4.8: Implement formatLanguageName function

**Priority:** High (Core Functionality)
**Estimated Effort:** 2 story points

**Description:**
Implement the `formatLanguageName` function that formats language codes into display names.

**File to Modify:**
- `/src/lib/translations/translation-utils.ts`

**Implementation Steps:**

1. Add a new section for language display functions:

```typescript
// =============================================================================
// Language Display Functions
// =============================================================================

/**
 * Format a language code into a human-readable display name.
 * Supports both English and native language name formats.
 *
 * @param code - Language code to format (e.g., 'en', 'fr', 'de')
 * @param native - Whether to return native language name (default: false)
 * @returns Formatted language name, or the code itself if unrecognized
 *
 * @example
 * formatLanguageName('de') // 'German'
 * formatLanguageName('de', false) // 'German'
 * formatLanguageName('de', true) // 'Deutsch'
 * formatLanguageName('unknown') // 'unknown' (fallback)
 * formatLanguageName('EN') // 'English' (case handled via validation)
 */
export function formatLanguageName(
  code: string | null | undefined,
  native = false
): string {
  // Handle null/undefined
  if (!code) {
    return DEFAULT_LOCALE;
  }

  // Normalize to lowercase for lookup
  const normalizedCode = code.toLowerCase();

  // Validate and lookup locale metadata
  if (!isValidLocale(normalizedCode)) {
    // Return original code as fallback for unrecognized codes
    return code;
  }

  const metadata = localeMetadata[normalizedCode as SupportedLocale];
  if (!metadata) {
    return code;
  }

  return native ? metadata.nativeName : metadata.name;
}
```

**Verification:**
- [ ] Function returns English name by default
- [ ] Function returns native name when native=true
- [ ] Function handles null/undefined input
- [ ] Function returns code for unrecognized codes
- [ ] Function works for all 6 supported languages

---

### Task 2.4.9: Implement getLanguageNames function

**Priority:** Medium
**Estimated Effort:** 1 story point

**Description:**
Implement the `getLanguageNames` function that returns both English and native names.

**File to Modify:**
- `/src/lib/translations/translation-utils.ts`

**Implementation Steps:**

1. Add the function after `formatLanguageName`:

```typescript
/**
 * Get both English and native names for a language code.
 *
 * @param code - Language code to format
 * @returns Object with both name formats, or null if unrecognized
 *
 * @example
 * getLanguageNames('de')
 * // { english: 'German', native: 'Deutsch', flag: '🇩🇪' }
 */
export function getLanguageNames(code: string): {
  english: string;
  native: string;
  flag?: string;
} | null {
  if (!isValidLocale(code)) {
    return null;
  }

  const metadata = localeMetadata[code as SupportedLocale];
  if (!metadata) {
    return null;
  }

  return {
    english: metadata.name,
    native: metadata.nativeName,
    flag: metadata.flag,
  };
}
```

**Verification:**
- [ ] Function returns object with english, native, and flag for valid codes
- [ ] Function returns null for invalid codes
- [ ] Function works for all 6 supported languages

---

### Task 2.4.10: Implement createTranslationMeta function

**Priority:** High (Core Functionality)
**Estimated Effort:** 1 story point

**Description:**
Implement the `createTranslationMeta` function that creates translation metadata for API responses.

**File to Modify:**
- `/src/lib/translations/translation-utils.ts`

**Implementation Steps:**

1. Add a new section for metadata creation:

```typescript
// =============================================================================
// Metadata Creation Functions
// =============================================================================

/**
 * Create a standardized translation metadata object for API responses.
 *
 * @param requestedLanguage - Language requested by the guest
 * @param displayLanguage - Language actually being displayed
 * @param sourceLanguage - Original language of the content
 * @param availableTranslations - Languages with available translations
 * @param translationStatus - Optional status of translation completeness
 * @returns TranslationMeta object for API response
 *
 * @example
 * createTranslationMeta('fr', 'fr', 'en', ['en', 'fr', 'de'])
 * // Returns full metadata object for guest content response
 */
export function createTranslationMeta(
  requestedLanguage: SupportedLocale,
  displayLanguage: SupportedLocale,
  sourceLanguage: SupportedLocale,
  availableTranslations: SupportedLocale[],
  translationStatus?: TranslationStatus
): TranslationMeta {
  const isShowingTranslationFlag =
    displayLanguage !== sourceLanguage && availableTranslations.includes(displayLanguage);

  return {
    requestedLanguage,
    displayLanguage,
    sourceLanguage,
    availableTranslations,
    isShowingTranslation: isShowingTranslationFlag,
    translationStatus,
  };
}
```

**Verification:**
- [ ] Function creates valid TranslationMeta object
- [ ] isShowingTranslation is true when display differs from source
- [ ] isShowingTranslation is false when display equals source
- [ ] translationStatus is included when provided

---

### Task 2.4.11: Implement isShowingTranslation helper function

**Priority:** Medium
**Estimated Effort:** 1 story point

**Description:**
Implement the `isShowingTranslation` helper function for simple translation status checks.

**File to Modify:**
- `/src/lib/translations/translation-utils.ts`

**Implementation Steps:**

1. Add the function after `createTranslationMeta`:

```typescript
/**
 * Determine if content should be shown as translated based on languages.
 *
 * @param displayLanguage - Language being displayed
 * @param sourceLanguage - Original content language
 * @returns true if displaying a translation, false if showing original
 */
export function isShowingTranslation(
  displayLanguage: SupportedLocale,
  sourceLanguage: SupportedLocale
): boolean {
  return displayLanguage !== sourceLanguage;
}
```

**Verification:**
- [ ] Function returns true when languages differ
- [ ] Function returns false when languages match

---

### Task 2.4.12: Create unit test file structure

**Priority:** High (Quality Assurance)
**Estimated Effort:** 1 story point

**Description:**
Create the test directory and test file with proper setup.

**File to Create:**
- `/src/lib/translations/__tests__/translation-utils.test.ts`

**Implementation Steps:**

1. Create the `__tests__` directory under `/src/lib/translations/`

2. Create the test file with imports and describe block:

```typescript
/**
 * Unit tests for translation-utils
 *
 * REQ-344: Create Translation Utility Helpers
 *
 * @module lib/translations/__tests__/translation-utils.test
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { describe, it, expect } from 'vitest';
import {
  mergeTranslation,
  hasTranslationContent,
  isTranslationComplete,
  getTranslationStatus,
  getDisplayLanguage,
  formatLanguageName,
  getLanguageNames,
  createTranslationMeta,
  isShowingTranslation,
  TRANSLATION_FIELDS_ITEM,
  TRANSLATION_FIELDS_ARTICLE,
  TRANSLATION_FIELDS_LINK,
  TRANSLATION_FIELDS_TAG,
} from '../translation-utils';

describe('translation-utils', () => {
  // Test suites will be added in subsequent tasks
});
```

**Verification:**
- [ ] Test file compiles without errors
- [ ] Test file can import all exports from translation-utils

---

### Task 2.4.13: Write unit tests for mergeTranslation

**Priority:** High (Quality Assurance)
**Estimated Effort:** 2 story points

**Description:**
Write comprehensive unit tests for the `mergeTranslation` function.

**File to Modify:**
- `/src/lib/translations/__tests__/translation-utils.test.ts`

**Implementation Steps:**

1. Add the test suite for mergeTranslation:

```typescript
  // ==========================================================================
  // mergeTranslation tests
  // ==========================================================================
  describe('mergeTranslation', () => {
    it('should return original unchanged when translation is null', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const result = mergeTranslation(original, null);
      expect(result).toEqual(original);
    });

    it('should return original unchanged when translation is undefined', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const result = mergeTranslation(original, undefined);
      expect(result).toEqual(original);
    });

    it('should override fields with non-null translation values', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const translation = { name: 'Kaffeemaschine' };
      const result = mergeTranslation(original, translation);
      expect(result).toEqual({ name: 'Kaffeemaschine', description: 'Makes coffee' });
    });

    it('should preserve original fields when translation values are null', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const translation = { name: 'Kaffeemaschine', description: null };
      const result = mergeTranslation(original, translation);
      expect(result.description).toBe('Makes coffee');
    });

    it('should preserve original fields when translation values are empty string', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const translation = { name: 'Kaffeemaschine', description: '' };
      const result = mergeTranslation(original, translation);
      expect(result.description).toBe('Makes coffee');
    });

    it('should not mutate the original object', () => {
      const original = { name: 'Coffee Machine', description: 'Makes coffee' };
      const translation = { name: 'Kaffeemaschine' };
      mergeTranslation(original, translation);
      expect(original.name).toBe('Coffee Machine');
    });

    it('should handle objects with nested properties (shallow merge)', () => {
      const original = { name: 'Test', meta: { id: 1 } };
      const translation = { name: 'Translated' };
      const result = mergeTranslation(original, translation);
      expect(result.meta).toBe(original.meta); // Same reference (shallow)
    });
  });
```

**Verification:**
- [ ] All tests pass
- [ ] Tests cover null input
- [ ] Tests cover undefined input
- [ ] Tests cover partial translation
- [ ] Tests verify no mutation

---

### Task 2.4.14: Write unit tests for hasTranslationContent and isTranslationComplete

**Priority:** High (Quality Assurance)
**Estimated Effort:** 1 story point

**Description:**
Write unit tests for the content checking functions.

**File to Modify:**
- `/src/lib/translations/__tests__/translation-utils.test.ts`

**Implementation Steps:**

1. Add test suites:

```typescript
  // ==========================================================================
  // hasTranslationContent tests
  // ==========================================================================
  describe('hasTranslationContent', () => {
    it('should return false for null translation', () => {
      expect(hasTranslationContent(null)).toBe(false);
    });

    it('should return false for undefined translation', () => {
      expect(hasTranslationContent(undefined)).toBe(false);
    });

    it('should return false when all fields are null', () => {
      expect(hasTranslationContent({ name: null, description: null })).toBe(false);
    });

    it('should return false when all fields are empty strings', () => {
      expect(hasTranslationContent({ name: '', description: '' })).toBe(false);
    });

    it('should return true when at least one field has content', () => {
      expect(hasTranslationContent({ name: 'Test', description: null })).toBe(true);
    });

    it('should return true when all fields have content', () => {
      expect(hasTranslationContent({ name: 'Test', description: 'Desc' })).toBe(true);
    });
  });

  // ==========================================================================
  // isTranslationComplete tests
  // ==========================================================================
  describe('isTranslationComplete', () => {
    it('should return false for null translation', () => {
      expect(isTranslationComplete(null, ['name', 'description'])).toBe(false);
    });

    it('should return true when all required fields are populated', () => {
      const translation = { name: 'Test', description: 'Desc' };
      expect(isTranslationComplete(translation, ['name', 'description'])).toBe(true);
    });

    it('should return false when any required field is null', () => {
      const translation = { name: 'Test', description: null };
      expect(isTranslationComplete(translation, ['name', 'description'])).toBe(false);
    });

    it('should return false when any required field is empty string', () => {
      const translation = { name: 'Test', description: '' };
      expect(isTranslationComplete(translation, ['name', 'description'])).toBe(false);
    });

    it('should return true with empty required fields array', () => {
      expect(isTranslationComplete({ name: 'Test' }, [])).toBe(true);
    });
  });
```

**Verification:**
- [ ] All tests pass
- [ ] hasTranslationContent tests cover all edge cases
- [ ] isTranslationComplete tests cover all edge cases

---

### Task 2.4.15: Write unit tests for getTranslationStatus

**Priority:** High (Quality Assurance)
**Estimated Effort:** 1 story point

**Description:**
Write unit tests for the `getTranslationStatus` function.

**File to Modify:**
- `/src/lib/translations/__tests__/translation-utils.test.ts`

**Implementation Steps:**

1. Add test suite:

```typescript
  // ==========================================================================
  // getTranslationStatus tests
  // ==========================================================================
  describe('getTranslationStatus', () => {
    it('should return "missing" for null translation', () => {
      expect(getTranslationStatus(null, ['name', 'description'])).toBe('missing');
    });

    it('should return "missing" when no fields have content', () => {
      expect(getTranslationStatus({ name: null, description: '' }, ['name', 'description'])).toBe('missing');
    });

    it('should return "complete" when all fields have content', () => {
      expect(getTranslationStatus({ name: 'Test', description: 'Desc' }, ['name', 'description'])).toBe('complete');
    });

    it('should return "partial" when some but not all fields have content', () => {
      expect(getTranslationStatus({ name: 'Test', description: null }, ['name', 'description'])).toBe('partial');
    });

    it('should handle empty required fields array as complete', () => {
      expect(getTranslationStatus({ name: 'Test' }, [])).toBe('missing');
    });
  });
```

**Verification:**
- [ ] All tests pass
- [ ] Tests cover 'missing', 'partial', and 'complete' statuses

---

### Task 2.4.16: Write unit tests for getDisplayLanguage

**Priority:** High (Quality Assurance)
**Estimated Effort:** 2 story points

**Description:**
Write comprehensive unit tests for the `getDisplayLanguage` function.

**File to Modify:**
- `/src/lib/translations/__tests__/translation-utils.test.ts`

**Implementation Steps:**

1. Add test suite:

```typescript
  // ==========================================================================
  // getDisplayLanguage tests
  // ==========================================================================
  describe('getDisplayLanguage', () => {
    it('should return requested language when available', () => {
      expect(getDisplayLanguage('fr', ['en', 'fr', 'de'], 'en')).toBe('fr');
    });

    it('should return source language when requested is not available', () => {
      expect(getDisplayLanguage('es', ['en', 'fr', 'de'], 'en')).toBe('en');
    });

    it('should return source language when available array is empty', () => {
      expect(getDisplayLanguage('fr', [], 'en')).toBe('en');
    });

    it('should return source language when requested is null', () => {
      expect(getDisplayLanguage(null as unknown as string, ['en', 'fr'], 'en')).toBe('en');
    });

    it('should return source language when available is null', () => {
      expect(getDisplayLanguage('fr', null as unknown as string[], 'en')).toBe('en');
    });

    it('should return source language when requested is not a valid locale', () => {
      expect(getDisplayLanguage('xyz', ['en', 'fr'], 'en')).toBe('en');
    });

    it('should handle case where requested equals source and is available', () => {
      expect(getDisplayLanguage('en', ['en', 'fr'], 'en')).toBe('en');
    });
  });
```

**Verification:**
- [ ] All tests pass
- [ ] Tests cover available language scenario
- [ ] Tests cover unavailable language fallback
- [ ] Tests cover edge cases (null, empty array, invalid locale)

---

### Task 2.4.17: Write unit tests for formatLanguageName

**Priority:** High (Quality Assurance)
**Estimated Effort:** 2 story points

**Description:**
Write comprehensive unit tests for the `formatLanguageName` function.

**File to Modify:**
- `/src/lib/translations/__tests__/translation-utils.test.ts`

**Implementation Steps:**

1. Add test suite:

```typescript
  // ==========================================================================
  // formatLanguageName tests
  // ==========================================================================
  describe('formatLanguageName', () => {
    it('should return English name by default', () => {
      expect(formatLanguageName('de')).toBe('German');
    });

    it('should return English name when native is false', () => {
      expect(formatLanguageName('de', false)).toBe('German');
    });

    it('should return native name when native is true', () => {
      expect(formatLanguageName('de', true)).toBe('Deutsch');
    });

    it('should return the code itself for unrecognized codes', () => {
      expect(formatLanguageName('unknown')).toBe('unknown');
    });

    it('should handle null input', () => {
      expect(formatLanguageName(null)).toBe('en'); // DEFAULT_LOCALE
    });

    it('should handle undefined input', () => {
      expect(formatLanguageName(undefined)).toBe('en'); // DEFAULT_LOCALE
    });

    it('should handle all supported languages', () => {
      expect(formatLanguageName('en')).toBe('English');
      expect(formatLanguageName('fr')).toBe('French');
      expect(formatLanguageName('es')).toBe('Spanish');
      expect(formatLanguageName('de')).toBe('German');
      expect(formatLanguageName('nl')).toBe('Dutch');
      expect(formatLanguageName('it')).toBe('Italian');
    });

    it('should handle all supported languages with native flag', () => {
      expect(formatLanguageName('en', true)).toBe('English');
      expect(formatLanguageName('fr', true)).toBe('Français');
      expect(formatLanguageName('es', true)).toBe('Español');
      expect(formatLanguageName('de', true)).toBe('Deutsch');
      expect(formatLanguageName('nl', true)).toBe('Nederlands');
      expect(formatLanguageName('it', true)).toBe('Italiano');
    });
  });
```

**Verification:**
- [ ] All tests pass
- [ ] Tests cover all 6 languages (English and native)
- [ ] Tests cover null/undefined input
- [ ] Tests cover unrecognized codes

---

### Task 2.4.18: Write unit tests for getLanguageNames, createTranslationMeta, and isShowingTranslation

**Priority:** High (Quality Assurance)
**Estimated Effort:** 2 story points

**Description:**
Write unit tests for the remaining utility functions.

**File to Modify:**
- `/src/lib/translations/__tests__/translation-utils.test.ts`

**Implementation Steps:**

1. Add test suites:

```typescript
  // ==========================================================================
  // getLanguageNames tests
  // ==========================================================================
  describe('getLanguageNames', () => {
    it('should return both English and native names for valid code', () => {
      const result = getLanguageNames('de');
      expect(result).toEqual({
        english: 'German',
        native: 'Deutsch',
        flag: '🇩🇪',
      });
    });

    it('should return null for invalid code', () => {
      expect(getLanguageNames('invalid')).toBeNull();
    });
  });

  // ==========================================================================
  // createTranslationMeta tests
  // ==========================================================================
  describe('createTranslationMeta', () => {
    it('should create metadata with isShowingTranslation true when displaying translation', () => {
      const meta = createTranslationMeta('fr', 'fr', 'en', ['en', 'fr', 'de']);
      expect(meta.isShowingTranslation).toBe(true);
      expect(meta.requestedLanguage).toBe('fr');
      expect(meta.displayLanguage).toBe('fr');
      expect(meta.sourceLanguage).toBe('en');
    });

    it('should create metadata with isShowingTranslation false when displaying source', () => {
      const meta = createTranslationMeta('es', 'en', 'en', ['en', 'fr', 'de']);
      expect(meta.isShowingTranslation).toBe(false);
    });

    it('should include translation status when provided', () => {
      const meta = createTranslationMeta('fr', 'fr', 'en', ['en', 'fr'], 'complete');
      expect(meta.translationStatus).toBe('complete');
    });

    it('should set isShowingTranslation false when display equals source even if in available', () => {
      const meta = createTranslationMeta('en', 'en', 'en', ['en', 'fr', 'de']);
      expect(meta.isShowingTranslation).toBe(false);
    });
  });

  // ==========================================================================
  // isShowingTranslation tests
  // ==========================================================================
  describe('isShowingTranslation', () => {
    it('should return true when display differs from source', () => {
      expect(isShowingTranslation('fr', 'en')).toBe(true);
    });

    it('should return false when display equals source', () => {
      expect(isShowingTranslation('en', 'en')).toBe(false);
    });
  });
```

**Verification:**
- [ ] All tests pass
- [ ] getLanguageNames tests cover valid and invalid codes
- [ ] createTranslationMeta tests cover all scenarios
- [ ] isShowingTranslation tests cover both cases

---

### Task 2.4.19: Write tests for constants

**Priority:** Medium
**Estimated Effort:** 1 story point

**Description:**
Write unit tests verifying the constants are properly defined.

**File to Modify:**
- `/src/lib/translations/__tests__/translation-utils.test.ts`

**Implementation Steps:**

1. Add test suite at the beginning of the describe block:

```typescript
  // ==========================================================================
  // Constants tests
  // ==========================================================================
  describe('constants', () => {
    it('should export TRANSLATION_FIELDS_ITEM with correct fields', () => {
      expect(TRANSLATION_FIELDS_ITEM).toEqual(['name', 'description']);
    });

    it('should export TRANSLATION_FIELDS_ARTICLE with correct fields', () => {
      expect(TRANSLATION_FIELDS_ARTICLE).toEqual(['title', 'description']);
    });

    it('should export TRANSLATION_FIELDS_LINK with correct fields', () => {
      expect(TRANSLATION_FIELDS_LINK).toEqual(['title']);
    });

    it('should export TRANSLATION_FIELDS_TAG with correct fields', () => {
      expect(TRANSLATION_FIELDS_TAG).toEqual(['displayValue']);
    });
  });
```

**Verification:**
- [ ] All tests pass
- [ ] Constants have expected values

---

### Task 2.4.20: Run tests and verify full coverage

**Priority:** High (Quality Assurance)
**Estimated Effort:** 1 story point

**Description:**
Run all tests and ensure they pass with adequate coverage.

**Commands to Execute:**
```bash
npx vitest run src/lib/translations/__tests__/translation-utils.test.ts
npx vitest run src/lib/translations/__tests__/translation-utils.test.ts --coverage
```

**Verification:**
- [ ] All unit tests pass
- [ ] Coverage meets 95%+ threshold
- [ ] No TypeScript compilation errors

---

### Task 2.4.21: Verify barrel exports work correctly

**Priority:** High (Integration)
**Estimated Effort:** 1 story point

**Description:**
Verify that all exports from the barrel file work correctly.

**Verification Steps:**

1. Create a temporary test import in any file:
```typescript
import {
  mergeTranslation,
  hasTranslationContent,
  isTranslationComplete,
  getTranslationStatus,
  getDisplayLanguage,
  formatLanguageName,
  getLanguageNames,
  createTranslationMeta,
  isShowingTranslation,
  TRANSLATION_FIELDS_ITEM,
  TRANSLATION_FIELDS_ARTICLE,
  TRANSLATION_FIELDS_LINK,
  TRANSLATION_FIELDS_TAG,
  type TranslationMeta,
  type TranslationStatus,
  type MergeableContent,
} from '@/lib/translations';
```

2. Verify TypeScript compiles without errors

**Verification:**
- [ ] All named exports accessible from `@/lib/translations`
- [ ] All type exports accessible
- [ ] TypeScript compilation succeeds

---

### Task 2.4.22: Build verification and final cleanup

**Priority:** High (Final Check)
**Estimated Effort:** 1 story point

**Description:**
Run the full build to ensure no issues and perform final code cleanup.

**Commands to Execute:**
```bash
npm run build
npm run lint
```

**Verification:**
- [ ] Build completes without errors
- [ ] Lint passes without errors
- [ ] All JSDoc comments are complete
- [ ] No unused imports
- [ ] Code follows project conventions

---

## 4. Task Summary Table

| Task ID | Description | Priority | Effort | Dependencies |
|---------|-------------|----------|--------|--------------|
| 2.4.1 | Create translations directory and barrel export | High | 1 SP | None |
| 2.4.2 | Create translation-utils.ts with types and constants | High | 2 SP | 2.4.1 |
| 2.4.3 | Implement mergeTranslation function | High | 2 SP | 2.4.2 |
| 2.4.4 | Implement hasTranslationContent function | High | 1 SP | 2.4.2 |
| 2.4.5 | Implement isTranslationComplete function | Medium | 1 SP | 2.4.4 |
| 2.4.6 | Implement getTranslationStatus function | Medium | 1 SP | 2.4.4, 2.4.5 |
| 2.4.7 | Implement getDisplayLanguage function | High | 2 SP | 2.4.2 |
| 2.4.8 | Implement formatLanguageName function | High | 2 SP | 2.4.2 |
| 2.4.9 | Implement getLanguageNames function | Medium | 1 SP | 2.4.8 |
| 2.4.10 | Implement createTranslationMeta function | High | 1 SP | 2.4.2 |
| 2.4.11 | Implement isShowingTranslation helper | Medium | 1 SP | 2.4.2 |
| 2.4.12 | Create unit test file structure | High | 1 SP | 2.4.11 |
| 2.4.13 | Write tests for mergeTranslation | High | 2 SP | 2.4.3, 2.4.12 |
| 2.4.14 | Write tests for hasTranslationContent and isTranslationComplete | High | 1 SP | 2.4.5, 2.4.12 |
| 2.4.15 | Write tests for getTranslationStatus | High | 1 SP | 2.4.6, 2.4.12 |
| 2.4.16 | Write tests for getDisplayLanguage | High | 2 SP | 2.4.7, 2.4.12 |
| 2.4.17 | Write tests for formatLanguageName | High | 2 SP | 2.4.8, 2.4.12 |
| 2.4.18 | Write tests for remaining functions | High | 2 SP | 2.4.9-2.4.11, 2.4.12 |
| 2.4.19 | Write tests for constants | Medium | 1 SP | 2.4.2, 2.4.12 |
| 2.4.20 | Run tests and verify coverage | High | 1 SP | 2.4.13-2.4.19 |
| 2.4.21 | Verify barrel exports | High | 1 SP | 2.4.1-2.4.11 |
| 2.4.22 | Build verification and cleanup | High | 1 SP | All |

**Total Estimated Effort:** 28 story points

---

## 5. Acceptance Criteria Checklist

### Functional Requirements

- [ ] `mergeTranslation` function accepts original and translation objects as parameters
- [ ] `mergeTranslation` creates a new merged object without mutating inputs
- [ ] `mergeTranslation` preserves original fields when translation fields are null/undefined/empty
- [ ] `mergeTranslation` overrides original fields with translation values when present
- [ ] `mergeTranslation` handles edge cases (empty objects, null inputs) gracefully
- [ ] `getDisplayLanguage` returns requested language when available in array
- [ ] `getDisplayLanguage` returns source language when requested is unavailable
- [ ] `getDisplayLanguage` handles edge cases (empty arrays, null values, undefined)
- [ ] `getDisplayLanguage` returns predictable default for invalid inputs
- [ ] `formatLanguageName` returns English display name by default
- [ ] `formatLanguageName` returns native language name when native flag is true
- [ ] `formatLanguageName` handles all six supported language codes correctly
- [ ] `formatLanguageName` returns the code itself for unrecognized codes

### Technical Requirements

- [ ] All functions are pure (no side effects)
- [ ] TypeScript strict mode passes without errors
- [ ] All functions include proper TypeScript type definitions
- [ ] All functions include comprehensive JSDoc comments with examples
- [ ] Functions are exported as named exports from barrel file
- [ ] Module follows project's established coding conventions
- [ ] Unit tests achieve 95%+ coverage

---

## 6. Files Created/Modified Summary

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translations/index.ts` | Barrel exports for translations module |
| `/src/lib/translations/translation-utils.ts` | Translation utility helper functions |
| `/src/lib/translations/__tests__/translation-utils.test.ts` | Unit tests for translation utilities |

### Files to Modify

None - this is a new module creation.

---

## 7. Integration Points

### Usage by Other Tasks

| Task | How It Uses These Utilities |
|------|----------------------------|
| Task 2.1 (fetch-translations.ts) | Uses `mergeTranslation` to combine fetched translations with original content |
| Task 2.2 (Public Item API) | Uses `mergeTranslation`, `getDisplayLanguage`, `createTranslationMeta` |
| Task 2.3 (Language Availability API) | Uses `formatLanguageName` for response formatting |
| Phase 3 Components | Use `formatLanguageName`, `isShowingTranslation` for UI display |

### Import Pattern
```typescript
import {
  mergeTranslation,
  getDisplayLanguage,
  formatLanguageName,
  createTranslationMeta,
  getTranslationStatus,
  TRANSLATION_FIELDS_ITEM,
  type TranslationMeta,
  type TranslationStatus,
} from '@/lib/translations';
```

---

## 8. References

- [Overview Document](/docs/REQ-344-create-translation-utility-helpers-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md) - Phase 2, Task 2.4
- [Epic 4 Requests](/docs/gen_requests_epic4.md) - REQ-344 specification
- [i18n Configuration](/src/lib/i18n/config.ts) - Locale metadata and type definitions

---

**Document Version:** 1.0
**Status:** Ready for Implementation
