# REQ-310: Create Translation Utility Helpers - Implementation Overview

**Last Modified:** 2026-01-18 16:30:00 UTC
**Request ID:** REQ-310
**Type:** NEW FEATURE
**Size:** S (Small)
**Phase:** 2 - Translation Data Layer
**Task ID:** 2.4
**PRD Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## 1. Summary

Create utility functions for common translation operations including merging original content with translations, determining the best available language for display, and formatting language codes into human-readable names. These utilities will be used consistently across all features that work with translations, ensuring uniform behavior throughout the guest-facing localization experience.

---

## 2. Background

### Current State
- No standardized utilities exist for common translation operations
- Developers must implement translation merging logic repeatedly across components
- Language selection fallback behavior is not centralized
- Language code formatting varies between implementations

### Dependencies
- **REQ-304** (L10n Types): `SupportedLanguage` type and `SUPPORTED_LANGUAGES` constant
- **Epic 1 Foundation**: Basic i18n configuration and supported languages definition
- **REQ-307**: Translation fetch utilities that will consume these helpers

### Target State
- A centralized utility module providing typed helper functions for translation operations
- Consistent merging behavior that preserves untranslated fields while overlaying translations
- Predictable language fallback logic for best-available-language selection
- Professional, consistent language name formatting across all UI components

---

## 3. Technical Approach

### Architecture

```
/src/lib/translations/
├── index.ts                    # Barrel exports (already created or to be created)
├── fetch-translations.ts       # Translation fetch utilities (REQ-307)
└── translation-utils.ts        # Helper functions (THIS TASK)
```

### Design Principles

1. **Immutability**: Functions return new objects without mutating inputs
2. **Type Safety**: Full TypeScript typing for all parameters and return values
3. **Defensive Coding**: Handle edge cases gracefully (null, undefined, empty arrays)
4. **Pure Functions**: No side effects, same inputs produce same outputs
5. **JSDoc Documentation**: All exported functions include usage examples

---

## 4. Detailed Implementation

### 4.1 mergeTranslation(original, translation)

Merges original content with translation data, creating a unified object where translated fields override original fields while preserving untranslated content.

**Signature:**
```typescript
function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null | undefined
): T
```

**Parameters:**
- `original: T` - The original content object (item, article, link, etc.)
- `translation: Partial<T> | null | undefined` - Translation overlay object with same-shaped fields

**Returns:** `T` - New object with translations merged over original

**Behavior:**
- Returns a **new object** (never mutates inputs)
- For each key in original:
  - If translation has a non-null, non-undefined value for that key, use translation value
  - Otherwise, preserve original value
- Handles `null` or `undefined` translation gracefully (returns shallow copy of original)
- Works with nested objects when translation provides nested overrides

**Example:**
```typescript
const original = {
  name: 'Refrigerator',
  description: 'A kitchen appliance',
  tags: ['kitchen']
};

const translation = {
  name: 'Kühlschrank',
  description: 'Ein Küchengerät'
};

const merged = mergeTranslation(original, translation);
// Result:
// {
//   name: 'Kühlschrank',
//   description: 'Ein Küchengerät',
//   tags: ['kitchen']  // Preserved from original
// }
```

### 4.2 getDisplayLanguage(requested, available, source)

Determines the best language to display given a requested language, available translations, and the source language. Implements the fallback priority logic.

**Signature:**
```typescript
function getDisplayLanguage(
  requested: SupportedLanguage | null | undefined,
  available: SupportedLanguage[],
  source: SupportedLanguage
): SupportedLanguage
```

**Parameters:**
- `requested: SupportedLanguage | null | undefined` - The language requested by the user
- `available: SupportedLanguage[]` - Array of languages with available translations
- `source: SupportedLanguage` - The original/source language of the content

**Returns:** `SupportedLanguage` - The best language to display

**Fallback Priority:**
1. If `requested` is in `available` array → return `requested`
2. If `requested` equals `source` → return `source`
3. If `available` is empty → return `source`
4. If `requested` is null/undefined → return `source`
5. Otherwise → return `source` (graceful fallback)

**Example:**
```typescript
// Requested language is available
getDisplayLanguage('fr', ['fr', 'de', 'es'], 'en'); // → 'fr'

// Requested language is the source
getDisplayLanguage('en', ['fr', 'de'], 'en'); // → 'en'

// Requested language not available, fallback to source
getDisplayLanguage('it', ['fr', 'de'], 'en'); // → 'en'

// No request, return source
getDisplayLanguage(null, ['fr', 'de'], 'en'); // → 'en'

// Empty available array
getDisplayLanguage('fr', [], 'en'); // → 'en'
```

### 4.3 formatLanguageName(code, native?)

Formats a language code into a human-readable display name, with optional native language display.

**Signature:**
```typescript
function formatLanguageName(
  code: SupportedLanguage | string,
  native?: boolean
): string
```

**Parameters:**
- `code: SupportedLanguage | string` - The language code to format (e.g., 'en', 'fr')
- `native?: boolean` - If true, returns the native name (default: false)

**Returns:** `string` - Human-readable language name

**Behavior:**
- Uses `SUPPORTED_LANGUAGES` constant to look up language metadata
- If `native` is false (default): returns English name (e.g., "German")
- If `native` is true: returns native name (e.g., "Deutsch")
- If code not found in supported languages: returns the code itself as fallback

**Language Mapping (from Plan-111):**
| Code | English Name | Native Name |
|------|--------------|-------------|
| en | English | English |
| fr | French | Français |
| es | Spanish | Español |
| de | German | Deutsch |
| nl | Dutch | Nederlands |
| it | Italian | Italiano |

**Example:**
```typescript
formatLanguageName('de');           // → 'German'
formatLanguageName('de', false);    // → 'German'
formatLanguageName('de', true);     // → 'Deutsch'
formatLanguageName('fr', true);     // → 'Français'
formatLanguageName('unknown');      // → 'unknown' (fallback)
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File | Purpose |
|------|---------|
| `/src/lib/translations/translation-utils.ts` | Translation utility helper functions |

### Files to MODIFY

| File | Modification |
|------|--------------|
| `/src/lib/translations/index.ts` | Add exports for new utility functions (if file exists) |

**Note:** If `/src/lib/translations/index.ts` does not exist yet (depends on REQ-307 completion), create it with exports for these utilities.

### Functions to IMPLEMENT

| Function | Signature | Purpose |
|----------|-----------|---------|
| `mergeTranslation` | `<T>(original: T, translation: Partial<T> \| null) => T` | Merge content with translation overlay |
| `getDisplayLanguage` | `(requested, available, source) => SupportedLanguage` | Determine best display language |
| `formatLanguageName` | `(code: string, native?: boolean) => string` | Format language code for display |

### Types Required (from `/src/types/l10n.ts`)

| Type | Usage |
|------|-------|
| `SupportedLanguage` | Language code union type |
| `SUPPORTED_LANGUAGES` | Language metadata constant array |
| `LanguageInfo` | Language metadata interface |

---

## 6. Implementation Pattern Reference

### Existing Utility Pattern (from `/src/lib/item-utils.ts`)

```typescript
/**
 * Item Utility Functions
 *
 * Helper functions for item management including
 * cascading deletion and media cleanup.
 *
 * REQ-142: Enhanced Item Management
 * @created 2026-01-08
 */

import { ItemWithDetails, ItemLink } from '@/types';

/**
 * Count media files associated with an item
 * Media files are links of type 'image' or stored in Supabase storage
 * @param item - Item to check
 * @returns Number of media files
 */
export function countItemMedia(item: ItemWithDetails): number {
  // Implementation...
}
```

### New Utility Pattern

```typescript
/**
 * Translation Utility Functions
 *
 * Helper functions for common translation operations including
 * merging content, language selection, and name formatting.
 *
 * REQ-310: Create Translation Utility Helpers
 * @created 2026-01-18
 */

import type { SupportedLanguage, LanguageInfo } from '@/types/l10n';
import { SUPPORTED_LANGUAGES } from '@/types/l10n';

/**
 * Merge original content with translation overlay
 *
 * Creates a new object combining original content with translation values.
 * Translation values override original values when present and non-null.
 * Original values are preserved when no translation exists for a field.
 *
 * @typeParam T - The content object type
 * @param original - The original content object
 * @param translation - Translation overlay object (may be null/undefined)
 * @returns New merged object (never mutates inputs)
 *
 * @example
 * ```typescript
 * const merged = mergeTranslation(
 *   { name: 'Refrigerator', description: 'A kitchen appliance' },
 *   { name: 'Kühlschrank' }
 * );
 * // Result: { name: 'Kühlschrank', description: 'A kitchen appliance' }
 * ```
 */
export function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null | undefined
): T {
  // Handle null/undefined translation
  if (!translation) {
    return { ...original };
  }

  // Create merged object
  const merged = { ...original };

  // Override with translation values where present
  for (const key of Object.keys(translation) as Array<keyof T>) {
    const translationValue = translation[key];
    if (translationValue !== null && translationValue !== undefined) {
      merged[key] = translationValue as T[keyof T];
    }
  }

  return merged;
}

/**
 * Determine the best language to display
 *
 * Implements fallback logic to select the optimal display language based on
 * user preference, available translations, and source language.
 *
 * Priority:
 * 1. Requested language if available in translations
 * 2. Requested language if it matches source language
 * 3. Source language as fallback
 *
 * @param requested - User's requested language (may be null)
 * @param available - Array of languages with available translations
 * @param source - Original source language of the content
 * @returns The best language to display
 *
 * @example
 * ```typescript
 * // Requested available
 * getDisplayLanguage('fr', ['fr', 'de'], 'en'); // → 'fr'
 *
 * // Requested not available, fallback to source
 * getDisplayLanguage('it', ['fr', 'de'], 'en'); // → 'en'
 * ```
 */
export function getDisplayLanguage(
  requested: SupportedLanguage | null | undefined,
  available: SupportedLanguage[],
  source: SupportedLanguage
): SupportedLanguage {
  // No request, return source
  if (!requested) {
    return source;
  }

  // Requested is the source language
  if (requested === source) {
    return source;
  }

  // Check if requested is available
  if (available.includes(requested)) {
    return requested;
  }

  // Fallback to source
  return source;
}

/**
 * Format a language code into a human-readable display name
 *
 * Converts ISO language codes to full names, with optional native language display.
 * Falls back to returning the code itself if not found in supported languages.
 *
 * @param code - The language code to format (e.g., 'en', 'fr')
 * @param native - If true, returns native name (e.g., 'Deutsch' instead of 'German')
 * @returns Human-readable language name
 *
 * @example
 * ```typescript
 * formatLanguageName('de');        // → 'German'
 * formatLanguageName('de', true);  // → 'Deutsch'
 * formatLanguageName('unknown');   // → 'unknown'
 * ```
 */
export function formatLanguageName(
  code: SupportedLanguage | string,
  native: boolean = false
): string {
  const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === code);

  if (!languageInfo) {
    // Return code as fallback for unknown languages
    return code;
  }

  return native ? languageInfo.nativeName : languageInfo.name;
}
```

---

## 7. Type Interface Requirements

### Required Types (from `/src/types/l10n.ts`)

These types should exist from REQ-304:

```typescript
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;           // English name
  nativeName: string;     // Native name (e.g., "Deutsch")
  flag?: string;          // Flag emoji (optional)
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];
```

### Module Exports

```typescript
// /src/lib/translations/index.ts
export { mergeTranslation, getDisplayLanguage, formatLanguageName } from './translation-utils';
// ... exports from fetch-translations.ts if REQ-307 is complete
```

---

## 8. Testing Considerations

### Test Scenarios for mergeTranslation

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Full translation | `{a: 1, b: 2}`, `{a: 10, b: 20}` | `{a: 10, b: 20}` |
| Partial translation | `{a: 1, b: 2}`, `{a: 10}` | `{a: 10, b: 2}` |
| Null translation | `{a: 1}`, `null` | `{a: 1}` (copy) |
| Undefined translation | `{a: 1}`, `undefined` | `{a: 1}` (copy) |
| Translation with null field | `{a: 1}`, `{a: null}` | `{a: 1}` (preserved) |
| Empty original | `{}`, `{a: 1}` | `{a: 1}` |
| Nested objects | `{nested: {x: 1}}`, `{nested: {x: 2}}` | `{nested: {x: 2}}` |

### Test Scenarios for getDisplayLanguage

| Scenario | Requested | Available | Source | Expected |
|----------|-----------|-----------|--------|----------|
| Requested available | `'fr'` | `['fr', 'de']` | `'en'` | `'fr'` |
| Requested is source | `'en'` | `['fr', 'de']` | `'en'` | `'en'` |
| Requested unavailable | `'it'` | `['fr', 'de']` | `'en'` | `'en'` |
| Null requested | `null` | `['fr', 'de']` | `'en'` | `'en'` |
| Undefined requested | `undefined` | `['fr']` | `'en'` | `'en'` |
| Empty available | `'fr'` | `[]` | `'en'` | `'en'` |

### Test Scenarios for formatLanguageName

| Scenario | Code | Native | Expected |
|----------|------|--------|----------|
| English name | `'de'` | `false` | `'German'` |
| Native name | `'de'` | `true` | `'Deutsch'` |
| Default (no native flag) | `'fr'` | undefined | `'French'` |
| Unknown code | `'zz'` | `false` | `'zz'` |
| Empty string | `''` | `false` | `''` |

---

## 9. Dependencies

### Required Before Implementation

| Dependency | Source | Status |
|------------|--------|--------|
| `SupportedLanguage` type | `/src/types/l10n.ts` (REQ-304) | Must verify |
| `SUPPORTED_LANGUAGES` constant | `/src/types/l10n.ts` (REQ-304) | Must verify |
| `LanguageInfo` interface | `/src/types/l10n.ts` (REQ-304) | Must verify |

### Verification Steps

Before implementing, verify:
1. `/src/types/l10n.ts` exists and exports `SupportedLanguage`
2. `SUPPORTED_LANGUAGES` constant is exported with proper structure
3. Directory `/src/lib/translations/` exists or can be created

### Fallback Strategy

If REQ-304 is not complete:
1. Define types locally in `translation-utils.ts` with a TODO comment
2. Plan to refactor imports once REQ-304 is implemented
3. Use the same type definitions as specified in Plan-111

---

## 10. Acceptance Criteria

From REQ-310:

- [ ] `mergeTranslation` function accepts an original content object and a translation object as parameters
- [ ] `mergeTranslation` returns a new object combining both inputs without mutating the originals
- [ ] `mergeTranslation` preserves all fields from the original object when corresponding translation fields are null or undefined
- [ ] `mergeTranslation` overrides original fields with translation values when translation fields contain content
- [ ] `getDisplayLanguage` function accepts requested language, available languages array, and source language as parameters
- [ ] `getDisplayLanguage` returns the requested language when it exists in the available languages
- [ ] `getDisplayLanguage` returns the source language when the requested language is unavailable
- [ ] `getDisplayLanguage` handles edge cases like empty available languages arrays and null inputs gracefully
- [ ] `formatLanguageName` function accepts a language code and optional native flag parameter
- [ ] `formatLanguageName` returns properly formatted display names for all supported language codes
- [ ] `formatLanguageName` returns the native language name when the native flag is true
- [ ] `formatLanguageName` handles unknown language codes by returning the code itself as a fallback
- [ ] All utility functions include proper TypeScript type definitions for parameters and return values
- [ ] Functions include JSDoc comments explaining parameters, return values, and usage examples

---

## 11. Implementation Checklist

### Pre-Implementation
- [ ] Verify `/src/types/l10n.ts` exists with required types (REQ-304)
- [ ] Verify or create `/src/lib/translations/` directory
- [ ] Check if `/src/lib/translations/index.ts` exists

### Implementation
- [ ] Create `/src/lib/translations/translation-utils.ts`
- [ ] Implement `mergeTranslation` function with generics
- [ ] Implement `getDisplayLanguage` function with fallback logic
- [ ] Implement `formatLanguageName` function with native support
- [ ] Add JSDoc comments with examples to all exported functions
- [ ] Update or create `/src/lib/translations/index.ts` with exports

### Post-Implementation
- [ ] Verify TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Build passes: `npm run build`
- [ ] Test each function with edge cases
- [ ] Verify functions are properly exported from module

---

## 12. Usage Examples

### In ItemDisplay Component

```typescript
import { mergeTranslation, getDisplayLanguage, formatLanguageName } from '@/lib/translations';

// Determine which language to show
const displayLang = getDisplayLanguage(
  userRequestedLang,
  item.availableTranslations,
  item.sourceLanguage
);

// Merge item with its translation
const displayItem = mergeTranslation(item, itemTranslation);

// Format for UI display
const languageLabel = formatLanguageName(displayLang, true);
// Shows "Deutsch" in the language switcher
```

### In Translation Banner

```typescript
import { formatLanguageName } from '@/lib/translations';

<div className="translation-banner">
  Translated from {formatLanguageName(sourceLanguage)} -
  <button onClick={onViewOriginal}>View original</button>
</div>
```

### In API Response Building

```typescript
import { mergeTranslation, getDisplayLanguage } from '@/lib/translations';

// Build response with merged content
const displayLanguage = getDisplayLanguage(
  requestedLang,
  availableTranslations,
  item.source_language
);

const response = {
  item: mergeTranslation(item, translation),
  translationMeta: {
    requestedLanguage: requestedLang,
    displayLanguage,
    sourceLanguage: item.source_language,
    isShowingTranslation: displayLanguage !== item.source_language
  }
};
```

---

## 13. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Document: `/docs/gen_requests_epic4.md` (REQ-310)
- Related Task: REQ-307 (Translation Fetch Utilities)
- Related Task: REQ-304 (L10n Types File)
- Existing Utility Pattern: `/src/lib/item-utils.ts`
- Existing Types Pattern: `/src/types/index.ts`
- Translation Types Reference: Plan-111 Integration Contract section

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
