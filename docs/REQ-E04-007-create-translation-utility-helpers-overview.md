# Implementation Overview: REQ-E04-007 - Create Translation Utility Helpers

**Document Created:** 2026-01-19 22:30 UTC
**Last Modified:** 2026-01-19 22:30 UTC
**Request ID:** REQ-E04-007
**Epic:** Epic 4 - Guest Experience
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.4
**Size:** S (Small)
**Status:** Ready for Implementation

---

## 1. Summary

Create utility helper functions for translation operations including content merging, display language determination, and language name formatting. These pure utility functions centralize translation logic used across guest-facing components, ensuring consistent behavior when handling translated content, selecting optimal display languages, and presenting language names in user interfaces.

---

## 2. Current Behavior

No centralized utilities exist for common translation operations. Components must manually implement:
- Logic for merging translated content with originals, leading to inconsistent field handling
- Rules for determining which language to display when requested translations are unavailable
- Formatting of language codes into human-readable names (English or native)

This results in code duplication, inconsistent fallback behavior, and maintenance overhead across guest-facing components.

---

## 3. Expected Behavior

Three pure utility functions are available from a dedicated module:

### 3.1 `mergeTranslation(original, translation)`
- Accepts original content object and translation data
- Returns merged content with translated values where available
- Preserves original values for fields without translations
- Handles null/undefined translation data gracefully (returns original unchanged)
- Works with any translatable entity type (items, articles, links, tags)

### 3.2 `getDisplayLanguage(requested, available, source)`
- Accepts requested language, array of available translations, and source language
- Returns the optimal language to display following priority:
  1. Requested language (if available in translations)
  2. Source language (if different from requested)
  3. English as final fallback
- Handles edge cases: empty available array, invalid codes

### 3.3 `formatLanguageName(code, native?)`
- Accepts a language code and optional native flag
- Returns human-readable language name
- When `native=false` (default): Returns English name (e.g., "Spanish")
- When `native=true`: Returns native name (e.g., "Espanol")
- Returns the code itself for invalid/unsupported codes

---

## 4. Technical Approach

### 4.1 Architecture Pattern

Follow the existing utility pattern from `/src/lib/item-utils.ts`:
- Pure functions with no side effects
- Single responsibility per function
- JSDoc comments with `@param` and `@returns`
- TypeScript generics where applicable for content merging
- Named exports (no default export)

### 4.2 Type Integration

Leverage existing types from the codebase:
- Import `SupportedLocale` from `/src/lib/i18n/config.ts` (or alias as `SupportedLanguage`)
- Import `localeMetadata`, `LOCALE_DISPLAY_NAMES` for language name lookups
- Import `isSupportedLocale` for validation
- Define generic `TranslatableContent<T>` type for merge function

### 4.3 Module Structure

```
/src/lib/translations/
  index.ts                    # Barrel exports (NEW)
  translation-utils.ts        # Utility functions (NEW - this task)
  fetch-translations.ts       # Data fetching (Task 2.1 - separate)
```

### 4.4 Function Signatures

```typescript
/**
 * Merge original content with translation data.
 * Preserves original values for fields without translations.
 *
 * @param original - Original content object
 * @param translation - Translation data (can be null/undefined)
 * @returns Merged content with translated fields where available
 */
export function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null | undefined
): T;

/**
 * Determine the best display language based on availability.
 * Priority: requested -> source -> 'en' fallback
 *
 * @param requested - Language the user requested
 * @param available - Languages with available translations
 * @param source - Source language of the original content
 * @returns The optimal language code to display
 */
export function getDisplayLanguage(
  requested: SupportedLocale,
  available: SupportedLocale[],
  source: SupportedLocale
): SupportedLocale;

/**
 * Format a language code into a human-readable name.
 *
 * @param code - ISO 639-1 language code
 * @param native - If true, returns name in that language (e.g., "Deutsch")
 * @returns Human-readable language name
 */
export function formatLanguageName(
  code: string,
  native?: boolean
): string;
```

---

## 5. Acceptance Criteria

From REQ-E04-007:

- [ ] A merge function accepts original content and translation data, returning merged content with all fields
- [ ] The merge function preserves original values for fields without translations
- [ ] The merge function handles null or undefined translation data gracefully
- [ ] A display language function accepts a requested language, available languages, and source language
- [ ] The display language function returns the requested language if it is available
- [ ] The display language function returns the source language if the requested language is not available
- [ ] The display language function returns English as the final fallback if neither requested nor source languages are available
- [ ] A format function accepts a language code and returns a human-readable language name
- [ ] The format function accepts an optional native flag to return names in the language itself
- [ ] All functions are properly typed with TypeScript interfaces
- [ ] All functions handle edge cases such as invalid language codes, missing data, and malformed inputs
- [ ] Functions are exported from a dedicated translation utilities module
- [ ] Functions are pure and do not have side effects

---

## 6. Dependencies

### 6.1 Existing Infrastructure (Required)

| Dependency | Location | Purpose |
|------------|----------|---------|
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Language code type definition |
| `localeMetadata` | `/src/lib/i18n/config.ts` | Language name lookups |
| `LOCALE_DISPLAY_NAMES` | `/src/lib/i18n/config.ts` | English/native name pairs |
| `isSupportedLocale` | `/src/lib/i18n/config.ts` | Type guard for validation |
| `defaultLocale` | `/src/lib/i18n/config.ts` | Fallback language constant |

### 6.2 Epic Dependencies

| Epic | Status | Impact |
|------|--------|--------|
| Epic 1 (Foundation) | Required | Provides i18n config types and constants |
| Epic 3 (Dynamic Content) | Not required | Functions are pure utilities |

---

## 7. Implementation Tasks

### Task 7.1: Create translation-utils.ts file
**File:** `/src/lib/translations/translation-utils.ts`
**Effort:** 30 min

- Create new file with standard JSDoc header
- Add REQ reference and timestamps
- Import required types from i18n/config

### Task 7.2: Implement mergeTranslation function
**Effort:** 30 min

- Generic function accepting any object type
- Shallow merge with translation overriding original
- Handle null/undefined translation (return original)
- Handle empty translation object (return original)
- Preserve non-translatable fields (ids, timestamps, etc.)

### Task 7.3: Implement getDisplayLanguage function
**Effort:** 20 min

- Check if requested is in available array
- Fallback to source if available
- Final fallback to 'en'
- Handle empty available array
- Validate inputs with type guard

### Task 7.4: Implement formatLanguageName function
**Effort:** 20 min

- Use `localeMetadata` for supported languages
- Return `nativeName` when native=true
- Return `name` when native=false/undefined
- Return input code for unsupported languages
- Handle null/undefined/empty string inputs

### Task 7.5: Create barrel export file
**File:** `/src/lib/translations/index.ts`
**Effort:** 10 min

- Create index.ts if not exists
- Export all functions from translation-utils
- Add section comment for utility exports

### Task 7.6: Write unit tests (if test infrastructure exists)
**Effort:** 30 min (optional)

- Test mergeTranslation with various scenarios
- Test getDisplayLanguage priority logic
- Test formatLanguageName with all supported languages
- Test edge cases and error conditions

---

## 8. Authorized Files and Functions for Modification

### 8.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translations/translation-utils.ts` | Main utility functions |
| `/src/lib/translations/index.ts` | Barrel exports (if not exists) |

### 8.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| None | This task creates new files only |

### 8.3 Functions to Implement

| Function | File | Description |
|----------|------|-------------|
| `mergeTranslation<T>` | translation-utils.ts | Merge original content with translation |
| `getDisplayLanguage` | translation-utils.ts | Determine optimal display language |
| `formatLanguageName` | translation-utils.ts | Format language code to name |

---

## 9. Example Implementation

```typescript
// /src/lib/translations/translation-utils.ts

import {
  SupportedLocale,
  localeMetadata,
  isSupportedLocale,
  defaultLocale,
} from '@/lib/i18n/config';

/**
 * Merge original content with translation data.
 * Preserves original values for fields without translations.
 */
export function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null | undefined
): T {
  if (!translation) {
    return original;
  }

  // Filter out undefined/null values from translation
  const validTranslations = Object.entries(translation).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key as keyof T] = value as T[keyof T];
      }
      return acc;
    },
    {} as Partial<T>
  );

  return { ...original, ...validTranslations };
}

/**
 * Determine the best display language based on availability.
 */
export function getDisplayLanguage(
  requested: SupportedLocale,
  available: SupportedLocale[],
  source: SupportedLocale
): SupportedLocale {
  // Priority 1: Return requested if available
  if (available.includes(requested)) {
    return requested;
  }

  // Priority 2: Return source language
  if (isSupportedLocale(source)) {
    return source;
  }

  // Priority 3: English fallback
  return defaultLocale;
}

/**
 * Format a language code into a human-readable name.
 */
export function formatLanguageName(
  code: string,
  native: boolean = false
): string {
  if (!code) {
    return '';
  }

  if (!isSupportedLocale(code)) {
    return code;
  }

  const metadata = localeMetadata[code];
  return native ? metadata.nativeName : metadata.name;
}
```

---

## 10. Usage Examples

### 10.1 Merging Item Translation

```typescript
import { mergeTranslation } from '@/lib/translations';

const originalItem = {
  id: '123',
  name: 'Coffee Machine',
  description: 'How to use the coffee machine',
  publicId: 'abc123',
};

const frenchTranslation = {
  name: 'Machine a cafe',
  description: 'Comment utiliser la machine a cafe',
};

const merged = mergeTranslation(originalItem, frenchTranslation);
// Result: { id: '123', name: 'Machine a cafe', description: '...', publicId: 'abc123' }
```

### 10.2 Determining Display Language

```typescript
import { getDisplayLanguage } from '@/lib/translations';

// User requested French, French is available
const lang1 = getDisplayLanguage('fr', ['en', 'fr', 'de'], 'en');
// Result: 'fr'

// User requested Spanish, not available, source is German
const lang2 = getDisplayLanguage('es', ['en', 'fr'], 'de');
// Result: 'de' (source language)

// User requested Spanish, not available, source not supported
const lang3 = getDisplayLanguage('es', ['en', 'fr'], 'en');
// Result: 'en' (fallback)
```

### 10.3 Formatting Language Names

```typescript
import { formatLanguageName } from '@/lib/translations';

formatLanguageName('es');           // "Spanish"
formatLanguageName('es', false);    // "Spanish"
formatLanguageName('es', true);     // "Espanol"
formatLanguageName('de', true);     // "Deutsch"
formatLanguageName('invalid');      // "invalid" (returned as-is)
```

---

## 11. Testing Scenarios

### 11.1 mergeTranslation

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Full translation | original + complete translation | All fields from translation |
| Partial translation | original + partial translation | Mixed fields |
| Null translation | original + null | Original unchanged |
| Undefined translation | original + undefined | Original unchanged |
| Empty translation | original + {} | Original unchanged |
| Translation with null values | original + {name: null} | Original name preserved |

### 11.2 getDisplayLanguage

| Scenario | requested | available | source | Expected |
|----------|-----------|-----------|--------|----------|
| Requested available | 'fr' | ['en','fr'] | 'en' | 'fr' |
| Requested unavailable | 'de' | ['en','fr'] | 'en' | 'en' |
| Empty available | 'fr' | [] | 'en' | 'en' |
| Source as fallback | 'de' | ['en','fr'] | 'fr' | 'fr' |

### 11.3 formatLanguageName

| Input | native | Expected |
|-------|--------|----------|
| 'en' | false | 'English' |
| 'fr' | true | 'Francais' |
| 'de' | true | 'Deutsch' |
| '' | false | '' |
| 'xyz' | false | 'xyz' |

---

## 12. Integration Points

### 12.1 Components Using These Utilities

| Component | Function Used | Purpose |
|-----------|---------------|---------|
| `ItemDisplay.tsx` | `mergeTranslation` | Merge item content with translation |
| `GuestLanguageSwitcher` | `formatLanguageName` | Display language options |
| `TranslationBanner` | `formatLanguageName` | Show source language name |
| `page.tsx (guest item)` | `getDisplayLanguage` | Determine content language |
| Public Items API | `mergeTranslation` | Prepare API response |

### 12.2 Related Tasks in Phase 2

| Task | Dependency Direction |
|------|---------------------|
| 2.1 (fetch-translations.ts) | Uses these utilities |
| 2.2 (Public Item API) | Uses these utilities |
| 2.3 (Language Availability API) | Independent |

---

## 13. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type incompatibility with existing types | Low | Low | Reuse existing SupportedLocale type |
| Edge case not covered | Low | Low | Comprehensive test scenarios |
| Performance overhead | Very Low | Low | Pure functions, no async operations |

---

## 14. References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-007
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Phase 2, Task 2.4
- **i18n Config:** `/src/lib/i18n/config.ts` - Type definitions and language metadata
- **Translation Service Types:** `/src/lib/translation-service/translation-service.types.ts` - Related type definitions
- **Pattern Reference:** `/src/lib/item-utils.ts` - Utility function patterns

---

## 15. Checklist Before Implementation

- [ ] Verify `/src/lib/i18n/config.ts` exists and exports required types
- [ ] Confirm `localeMetadata` contains all 6 supported languages
- [ ] Check if `/src/lib/translations/` directory exists (create if needed)
- [ ] Review existing barrel export pattern in similar modules

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience implementation.*
