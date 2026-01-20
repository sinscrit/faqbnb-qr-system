# Detailed Task Breakdown: REQ-E04-007 - Create Translation Utility Helpers

**Document Created:** 2026-01-20 08:45 UTC
**Last Modified:** 2026-01-20 08:45 UTC
**Request ID:** REQ-E04-007
**Epic:** Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.4
**Size:** S (Small)
**Status:** Ready for Implementation

---

## 1. Overview

This document provides granular, implementation-ready tasks for creating translation utility helper functions. These pure utility functions will centralize translation logic used across guest-facing components for content merging, display language determination, and language name formatting.

**Parent Document:** [REQ-E04-007-create-translation-utility-helpers-overview.md](./REQ-E04-007-create-translation-utility-helpers-overview.md)

---

## 2. Prerequisites Checklist

Before starting implementation, verify:

- [ ] `/src/lib/i18n/config.ts` exists and exports:
  - `SupportedLocale` type
  - `localeMetadata` object
  - `isSupportedLocale` function
  - `defaultLocale` constant
  - `LOCALE_DISPLAY_NAMES` object
- [ ] Epic 1 Foundation is complete (i18n infrastructure)
- [ ] Directory `/src/lib/translations/` will be created (does not exist yet)

---

## 3. Implementation Tasks

### Task 1: Create translations directory structure

**Priority:** Required
**Estimated Effort:** 5 minutes
**File:** `/src/lib/translations/` (directory)

#### Description
Create the translations directory that will house all translation-related utilities.

#### Steps
1. Create directory `/src/lib/translations/`

#### Acceptance Criteria
- [ ] Directory `/src/lib/translations/` exists

#### Dependencies
- None

---

### Task 2: Create translation-utils.ts file with header

**Priority:** Required
**Estimated Effort:** 10 minutes
**File:** `/src/lib/translations/translation-utils.ts`

#### Description
Create the main translation utilities file with proper JSDoc header, imports, and module structure.

#### Steps
1. Create file `/src/lib/translations/translation-utils.ts`
2. Add JSDoc header with:
   - Module description
   - REQ-E04-007 reference
   - Created/LastModified timestamps
3. Add imports from `/src/lib/i18n/config.ts`:
   ```typescript
   import {
     SupportedLocale,
     localeMetadata,
     isSupportedLocale,
     defaultLocale,
   } from '@/lib/i18n/config';
   ```

#### Code Template
```typescript
/**
 * Translation Utility Functions
 *
 * Pure utility functions for common translation operations including
 * content merging, display language determination, and language name formatting.
 *
 * REQ-E04-007: Create Translation Utility Helpers for Content Display
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 2, Task 2.4
 *
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import {
  SupportedLocale,
  localeMetadata,
  isSupportedLocale,
  defaultLocale,
} from '@/lib/i18n/config';

// Functions will be added in subsequent tasks
```

#### Acceptance Criteria
- [ ] File exists at `/src/lib/translations/translation-utils.ts`
- [ ] JSDoc header includes REQ-E04-007 reference
- [ ] Imports compile without errors
- [ ] No runtime dependencies (pure utilities)

#### Dependencies
- Task 1 (directory exists)
- `/src/lib/i18n/config.ts` must exist

---

### Task 3: Implement mergeTranslation function

**Priority:** Required
**Estimated Effort:** 20 minutes
**File:** `/src/lib/translations/translation-utils.ts`

#### Description
Implement the generic `mergeTranslation` function that combines original content with translation data, preserving original values for fields without translations.

#### Steps
1. Add function signature with generics
2. Handle null/undefined translation input (return original)
3. Handle empty translation object (return original)
4. Filter out null/undefined values from translation
5. Merge using spread operator (translation overrides original)
6. Add comprehensive JSDoc documentation

#### Code Implementation
```typescript
/**
 * Merge original content with translation data.
 * Preserves original values for fields without translations.
 * Translation values override original values when present and non-null.
 *
 * @template T - Type of the content object
 * @param original - Original content object
 * @param translation - Translation data (can be null/undefined/partial)
 * @returns Merged content with translated fields where available
 *
 * @example
 * const item = { id: '1', name: 'Coffee Machine', description: 'How to use' };
 * const translation = { name: 'Machine a cafe' };
 * const merged = mergeTranslation(item, translation);
 * // Result: { id: '1', name: 'Machine a cafe', description: 'How to use' }
 */
export function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null | undefined
): T {
  // Return original unchanged if no translation data
  if (!translation) {
    return original;
  }

  // Filter out undefined/null values from translation
  // Only override original values with valid translation values
  const validTranslations = Object.entries(translation).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key as keyof T] = value as T[keyof T];
      }
      return acc;
    },
    {} as Partial<T>
  );

  // Return original if no valid translations after filtering
  if (Object.keys(validTranslations).length === 0) {
    return original;
  }

  // Merge with translation values overriding original
  return { ...original, ...validTranslations };
}
```

#### Test Scenarios
| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Full translation | `{name:'A', desc:'B'}` + `{name:'X', desc:'Y'}` | `{name:'X', desc:'Y'}` |
| Partial translation | `{name:'A', desc:'B'}` + `{name:'X'}` | `{name:'X', desc:'B'}` |
| Null translation | `{name:'A'}` + `null` | `{name:'A'}` |
| Undefined translation | `{name:'A'}` + `undefined` | `{name:'A'}` |
| Empty translation | `{name:'A'}` + `{}` | `{name:'A'}` |
| Translation with null value | `{name:'A'}` + `{name:null}` | `{name:'A'}` |
| Translation with empty string | `{name:'A'}` + `{name:''}` | `{name:'A'}` |
| Preserves non-translated fields | `{id:'1', name:'A'}` + `{name:'X'}` | `{id:'1', name:'X'}` |

#### Acceptance Criteria
- [ ] Function accepts any object type with generics
- [ ] Returns original unchanged when translation is null
- [ ] Returns original unchanged when translation is undefined
- [ ] Returns original unchanged when translation is empty object
- [ ] Filters out null values from translation
- [ ] Filters out undefined values from translation
- [ ] Filters out empty string values from translation
- [ ] Preserves original values for fields not in translation
- [ ] Correctly overrides original values with valid translation values
- [ ] JSDoc includes @template, @param, @returns, @example
- [ ] Function is exported (named export)
- [ ] Function is pure (no side effects)

#### Dependencies
- Task 2 (file created)

---

### Task 4: Implement getDisplayLanguage function

**Priority:** Required
**Estimated Effort:** 15 minutes
**File:** `/src/lib/translations/translation-utils.ts`

#### Description
Implement the `getDisplayLanguage` function that determines the optimal language to display based on requested language, available translations, and source language.

#### Steps
1. Add function signature
2. Implement priority check: requested > source > 'en' fallback
3. Handle empty available array
4. Validate inputs with type guard
5. Add comprehensive JSDoc documentation

#### Code Implementation
```typescript
/**
 * Determine the best display language based on availability.
 * Follows priority order: requested -> source -> English fallback.
 *
 * @param requested - Language the user/guest requested
 * @param available - Languages with available translations
 * @param source - Source language of the original content
 * @returns The optimal language code to display
 *
 * @example
 * // User requested French, French is available
 * getDisplayLanguage('fr', ['en', 'fr', 'de'], 'en'); // 'fr'
 *
 * @example
 * // User requested Spanish, not available, source is German
 * getDisplayLanguage('es', ['en', 'fr'], 'de'); // 'de'
 *
 * @example
 * // User requested Spanish, not available, source not in available
 * getDisplayLanguage('es', ['en', 'fr'], 'en'); // 'en'
 */
export function getDisplayLanguage(
  requested: SupportedLocale,
  available: SupportedLocale[],
  source: SupportedLocale
): SupportedLocale {
  // Priority 1: Return requested if it's available in translations
  if (available.includes(requested)) {
    return requested;
  }

  // Priority 2: Return source language (original content is always available)
  // Source language represents the original content, not a translation
  if (isSupportedLocale(source)) {
    return source;
  }

  // Priority 3: English as final fallback
  return defaultLocale;
}
```

#### Test Scenarios
| Scenario | requested | available | source | Expected |
|----------|-----------|-----------|--------|----------|
| Requested available | `'fr'` | `['en','fr']` | `'en'` | `'fr'` |
| Requested unavailable, source fallback | `'de'` | `['en','fr']` | `'es'` | `'es'` |
| Requested unavailable, source same as default | `'de'` | `['en','fr']` | `'en'` | `'en'` |
| Empty available array | `'fr'` | `[]` | `'en'` | `'en'` |
| Requested same as source | `'en'` | `['en','fr']` | `'en'` | `'en'` |
| All parameters same | `'fr'` | `['fr']` | `'fr'` | `'fr'` |

#### Acceptance Criteria
- [ ] Returns requested language when it's in available array
- [ ] Returns source language when requested is not available
- [ ] Returns English ('en') as final fallback
- [ ] Handles empty available array gracefully
- [ ] Validates source language with isSupportedLocale
- [ ] JSDoc includes @param, @returns, @example
- [ ] Function is exported (named export)
- [ ] Function is pure (no side effects)

#### Dependencies
- Task 2 (file created)
- `isSupportedLocale` from config
- `defaultLocale` from config

---

### Task 5: Implement formatLanguageName function

**Priority:** Required
**Estimated Effort:** 15 minutes
**File:** `/src/lib/translations/translation-utils.ts`

#### Description
Implement the `formatLanguageName` function that converts language codes into human-readable names, supporting both English and native name formats.

#### Steps
1. Add function signature with optional native parameter
2. Handle null/undefined/empty string inputs
3. Check if language code is supported
4. Return appropriate name from localeMetadata
5. Return input code for unsupported languages
6. Add comprehensive JSDoc documentation

#### Code Implementation
```typescript
/**
 * Format a language code into a human-readable name.
 * Supports both English names and native language names.
 *
 * @param code - ISO 639-1 language code (e.g., 'en', 'fr', 'de')
 * @param native - If true, returns the name in that language (e.g., "Deutsch" for 'de')
 *                 If false/undefined, returns the English name (e.g., "German" for 'de')
 * @returns Human-readable language name, or the code itself if unsupported
 *
 * @example
 * formatLanguageName('es');        // "Spanish"
 * formatLanguageName('es', false); // "Spanish"
 * formatLanguageName('es', true);  // "Espanol"
 * formatLanguageName('de', true);  // "Deutsch"
 * formatLanguageName('xyz');       // "xyz" (unsupported, returns as-is)
 */
export function formatLanguageName(
  code: string,
  native: boolean = false
): string {
  // Handle null/undefined/empty string
  if (!code || typeof code !== 'string') {
    return '';
  }

  // Trim and lowercase for consistent lookup
  const normalizedCode = code.trim().toLowerCase();

  // Return empty string for empty input after trim
  if (normalizedCode === '') {
    return '';
  }

  // Check if the code is a supported locale
  if (!isSupportedLocale(normalizedCode)) {
    // Return the original code for unsupported languages
    return code;
  }

  // Get metadata for the supported locale
  const metadata = localeMetadata[normalizedCode];

  // Return native name or English name based on parameter
  return native ? metadata.nativeName : metadata.name;
}
```

#### Test Scenarios
| Input code | native | Expected |
|------------|--------|----------|
| `'en'` | `false` | `'English'` |
| `'en'` | `true` | `'English'` |
| `'fr'` | `false` | `'French'` |
| `'fr'` | `true` | `'Francais'` |
| `'es'` | `false` | `'Spanish'` |
| `'es'` | `true` | `'Espanol'` |
| `'de'` | `false` | `'German'` |
| `'de'` | `true` | `'Deutsch'` |
| `'nl'` | `false` | `'Dutch'` |
| `'nl'` | `true` | `'Nederlands'` |
| `'it'` | `false` | `'Italian'` |
| `'it'` | `true` | `'Italiano'` |
| `'xyz'` | `false` | `'xyz'` |
| `''` | `false` | `''` |
| `null` (as any) | `false` | `''` |
| `undefined` (as any) | `false` | `''` |
| `'  fr  '` | `false` | `'French'` |
| `'FR'` | `false` | `'French'` |

#### Acceptance Criteria
- [ ] Returns English name when native=false or not provided
- [ ] Returns native name when native=true
- [ ] Returns empty string for null input
- [ ] Returns empty string for undefined input
- [ ] Returns empty string for empty string input
- [ ] Returns the input code for unsupported language codes
- [ ] Handles whitespace in input (trims)
- [ ] Handles uppercase input (normalizes)
- [ ] JSDoc includes @param, @returns, @example
- [ ] Function is exported (named export)
- [ ] Function is pure (no side effects)

#### Dependencies
- Task 2 (file created)
- `isSupportedLocale` from config
- `localeMetadata` from config

---

### Task 6: Create barrel export file

**Priority:** Required
**Estimated Effort:** 10 minutes
**File:** `/src/lib/translations/index.ts`

#### Description
Create the barrel export file for the translations module to provide a clean public API.

#### Steps
1. Create file `/src/lib/translations/index.ts`
2. Add JSDoc header
3. Export all functions from translation-utils.ts
4. Add section comments for organization

#### Code Implementation
```typescript
/**
 * Translation Module - Public API
 *
 * Exports utilities for translation operations in guest-facing components.
 *
 * REQ-E04-007: Create Translation Utility Helpers
 * REQ-E04-004: Create Translation Fetch Utilities (future)
 *
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

// =============================================================================
// Translation Utility Functions
// =============================================================================
export {
  mergeTranslation,
  getDisplayLanguage,
  formatLanguageName,
} from './translation-utils';

// =============================================================================
// Translation Fetch Utilities (Task 2.1 - separate implementation)
// =============================================================================
// export { ... } from './fetch-translations';
```

#### Acceptance Criteria
- [ ] File exists at `/src/lib/translations/index.ts`
- [ ] All three utility functions are exported
- [ ] Imports work correctly (no circular dependencies)
- [ ] JSDoc header present with REQ reference
- [ ] Placeholder comment for future fetch utilities

#### Dependencies
- Task 2-5 (functions implemented)

---

### Task 7: Verify build and type checking

**Priority:** Required
**Estimated Effort:** 5 minutes
**File:** N/A (verification)

#### Description
Run TypeScript compiler and verify no type errors exist in the new module.

#### Steps
1. Run `npx tsc --noEmit` to check for type errors
2. Verify no import errors
3. Verify no export errors
4. Test imports from other files work correctly

#### Verification Commands
```bash
# Type check
npx tsc --noEmit

# Verify module imports work
# Create a temporary test file or check in existing component
```

#### Acceptance Criteria
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] Imports from `@/lib/translations` resolve correctly
- [ ] All types infer correctly

#### Dependencies
- Task 6 (exports created)

---

## 4. File Summary

### Files to Create

| File Path | Purpose | Task |
|-----------|---------|------|
| `/src/lib/translations/` | Directory for translation utilities | Task 1 |
| `/src/lib/translations/translation-utils.ts` | Main utility functions | Task 2-5 |
| `/src/lib/translations/index.ts` | Barrel exports | Task 6 |

### Files to Modify

| File Path | Modification | Task |
|-----------|--------------|------|
| None | This task creates new files only | - |

### Functions to Implement

| Function | Description | Task |
|----------|-------------|------|
| `mergeTranslation<T>` | Merge original content with translation data | Task 3 |
| `getDisplayLanguage` | Determine optimal display language | Task 4 |
| `formatLanguageName` | Format language code to readable name | Task 5 |

---

## 5. Complete Implementation Reference

Below is the complete expected implementation for `/src/lib/translations/translation-utils.ts`:

```typescript
/**
 * Translation Utility Functions
 *
 * Pure utility functions for common translation operations including
 * content merging, display language determination, and language name formatting.
 *
 * REQ-E04-007: Create Translation Utility Helpers for Content Display
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 2, Task 2.4
 *
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import {
  SupportedLocale,
  localeMetadata,
  isSupportedLocale,
  defaultLocale,
} from '@/lib/i18n/config';

/**
 * Merge original content with translation data.
 * Preserves original values for fields without translations.
 * Translation values override original values when present and non-null.
 *
 * @template T - Type of the content object
 * @param original - Original content object
 * @param translation - Translation data (can be null/undefined/partial)
 * @returns Merged content with translated fields where available
 *
 * @example
 * const item = { id: '1', name: 'Coffee Machine', description: 'How to use' };
 * const translation = { name: 'Machine a cafe' };
 * const merged = mergeTranslation(item, translation);
 * // Result: { id: '1', name: 'Machine a cafe', description: 'How to use' }
 */
export function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null | undefined
): T {
  // Return original unchanged if no translation data
  if (!translation) {
    return original;
  }

  // Filter out undefined/null values from translation
  // Only override original values with valid translation values
  const validTranslations = Object.entries(translation).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key as keyof T] = value as T[keyof T];
      }
      return acc;
    },
    {} as Partial<T>
  );

  // Return original if no valid translations after filtering
  if (Object.keys(validTranslations).length === 0) {
    return original;
  }

  // Merge with translation values overriding original
  return { ...original, ...validTranslations };
}

/**
 * Determine the best display language based on availability.
 * Follows priority order: requested -> source -> English fallback.
 *
 * @param requested - Language the user/guest requested
 * @param available - Languages with available translations
 * @param source - Source language of the original content
 * @returns The optimal language code to display
 *
 * @example
 * // User requested French, French is available
 * getDisplayLanguage('fr', ['en', 'fr', 'de'], 'en'); // 'fr'
 *
 * @example
 * // User requested Spanish, not available, source is German
 * getDisplayLanguage('es', ['en', 'fr'], 'de'); // 'de'
 *
 * @example
 * // User requested Spanish, not available, source not in available
 * getDisplayLanguage('es', ['en', 'fr'], 'en'); // 'en'
 */
export function getDisplayLanguage(
  requested: SupportedLocale,
  available: SupportedLocale[],
  source: SupportedLocale
): SupportedLocale {
  // Priority 1: Return requested if it's available in translations
  if (available.includes(requested)) {
    return requested;
  }

  // Priority 2: Return source language (original content is always available)
  // Source language represents the original content, not a translation
  if (isSupportedLocale(source)) {
    return source;
  }

  // Priority 3: English as final fallback
  return defaultLocale;
}

/**
 * Format a language code into a human-readable name.
 * Supports both English names and native language names.
 *
 * @param code - ISO 639-1 language code (e.g., 'en', 'fr', 'de')
 * @param native - If true, returns the name in that language (e.g., "Deutsch" for 'de')
 *                 If false/undefined, returns the English name (e.g., "German" for 'de')
 * @returns Human-readable language name, or the code itself if unsupported
 *
 * @example
 * formatLanguageName('es');        // "Spanish"
 * formatLanguageName('es', false); // "Spanish"
 * formatLanguageName('es', true);  // "Espanol"
 * formatLanguageName('de', true);  // "Deutsch"
 * formatLanguageName('xyz');       // "xyz" (unsupported, returns as-is)
 */
export function formatLanguageName(
  code: string,
  native: boolean = false
): string {
  // Handle null/undefined/empty string
  if (!code || typeof code !== 'string') {
    return '';
  }

  // Trim and lowercase for consistent lookup
  const normalizedCode = code.trim().toLowerCase();

  // Return empty string for empty input after trim
  if (normalizedCode === '') {
    return '';
  }

  // Check if the code is a supported locale
  if (!isSupportedLocale(normalizedCode)) {
    // Return the original code for unsupported languages
    return code;
  }

  // Get metadata for the supported locale
  const metadata = localeMetadata[normalizedCode];

  // Return native name or English name based on parameter
  return native ? metadata.nativeName : metadata.name;
}
```

---

## 6. Integration Points

### Components That Will Use These Utilities

| Component | Function | Purpose |
|-----------|----------|---------|
| `ItemDisplay.tsx` | `mergeTranslation` | Merge item content with translation |
| `GuestLanguageSwitcher` | `formatLanguageName` | Display language options |
| `TranslationBanner` | `formatLanguageName` | Show source language name |
| `page.tsx (guest item)` | `getDisplayLanguage` | Determine content language |
| Public Items API | `mergeTranslation` | Prepare API response |

### Import Example
```typescript
// Recommended import pattern
import {
  mergeTranslation,
  getDisplayLanguage,
  formatLanguageName,
} from '@/lib/translations';
```

---

## 7. Acceptance Criteria Summary

From REQ-E04-007, all criteria mapped to tasks:

| Acceptance Criteria | Task |
|---------------------|------|
| A merge function accepts original content and translation data, returning merged content with all fields | Task 3 |
| The merge function preserves original values for fields without translations | Task 3 |
| The merge function handles null or undefined translation data gracefully | Task 3 |
| A display language function accepts a requested language, available languages, and source language | Task 4 |
| The display language function returns the requested language if it is available | Task 4 |
| The display language function returns the source language if the requested language is not available | Task 4 |
| The display language function returns English as the final fallback | Task 4 |
| A format function accepts a language code and returns a human-readable language name | Task 5 |
| The format function accepts an optional native flag to return names in the language itself | Task 5 |
| All functions are properly typed with TypeScript interfaces | Tasks 3-5 |
| All functions handle edge cases such as invalid language codes, missing data, and malformed inputs | Tasks 3-5 |
| Functions are exported from a dedicated translation utilities module | Task 6 |
| Functions are pure and do not have side effects | Tasks 3-5 |

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type incompatibility with existing types | Low | Low | Reuse existing SupportedLocale type from config |
| Edge case not covered | Low | Low | Comprehensive test scenarios documented |
| Performance overhead | Very Low | Low | Pure functions, no async operations |
| Import path issues | Low | Low | Use standard @/ alias pattern |

---

## 9. References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-007
- **Overview:** `/docs/REQ-E04-007-create-translation-utility-helpers-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Phase 2, Task 2.4
- **i18n Config:** `/src/lib/i18n/config.ts` - Type definitions and language metadata
- **Pattern Reference:** `/src/lib/item-utils.ts` - Utility function patterns

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience implementation.*
*Total estimated implementation time: ~1-1.5 hours*
