# Implementation Overview: Create Translation Utility Helpers

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-007 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 16:25 |
| Breakdown Created | 2026-01-22 19:15 |
| T-shirt Size | S |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

## Goals

Create a utility module (`/src/lib/translations/translation-utils.ts`) with helper functions for translation operations. These utilities handle common translation tasks like merging content, determining the best display language, and formatting language names for UI display, ensuring consistent behavior across all components that handle translations.

### Technical Requirements

1. **Merge original content with translation data** preserving untranslated fields via `mergeTranslation()`
2. **Determine the best language to display** based on user request, available translations, and source content via `getDisplayLanguage()`
3. **Format language codes into human-readable names** in English or native script via `formatLanguageName()`
4. **Handle edge cases consistently** across the application (null values, partial translations, invalid codes)
5. **Provide type-safe utilities** using types from `/src/types/l10n.ts`
6. **Work in both server and client contexts** (no environment-specific dependencies)

### Assumptions & Clarifications

- REQ-E04-001 (l10n types) provides `SupportedLanguage`, `TranslatedContent`, and related types
- Epic 1's `LocaleContext` provides `SUPPORTED_LOCALES` constant with language metadata
- Utilities are pure functions (no side effects, no state)
- Functions work in both server-side (API routes, server components) and client-side (React components) contexts
- Translation merging uses "last-write-wins" semantics (translated field overrides original if present)
- Language selection prioritizes: requested → available → source (fallback chain)

## Implementation Plan

### Step 1: Create Module Structure and Imports
- **Description**: Set up the file structure and import dependencies
- **Rationale**: Establishes foundation; ensures access to required types and constants
- **Estimated Effort**: XS (10 minutes)

**Key Actions:**
- Create `/src/lib/translations/translation-utils.ts`
- Import `SupportedLanguage` from `@/types/l10n` (REQ-E04-001)
- Import `SUPPORTED_LOCALES` from `@/contexts/LocaleContext` for language metadata
- Add module-level JSDoc explaining Epic 4 context and purpose
- Define internal helper types if needed

### Step 2: Implement mergeTranslation Function
- **Description**: Create function to merge original content with translation data
- **Rationale**: Centralizes merging logic; handles partial translations correctly; type-safe
- **Estimated Effort**: M (30 minutes)

**Key Actions:**
- Create `mergeTranslation<T>(original: T, translation: Partial<T> | null): T` function
- Use generic type parameter for flexibility across different content types
- Implement field-by-field merge logic:
  - If translation is `null` or `undefined`, return original unchanged
  - For each field in translation:
    - If field value is not `null` or `undefined`, use translated value
    - Otherwise, preserve original field value
- Use TypeScript's spread operator with careful handling of nested objects
- Handle arrays (don't merge arrays, use translated array if present)
- Add JSDoc with examples showing partial translation scenarios
- Add type guards for null safety

### Step 3: Implement getDisplayLanguage Function
- **Description**: Create function to determine the best language to display based on preferences and availability
- **Rationale**: Encapsulates language selection logic; ensures consistent fallback behavior
- **Estimated Effort**: M (25 minutes)

**Key Actions:**
- Create `getDisplayLanguage(requested: SupportedLanguage, available: SupportedLanguage[], source: SupportedLanguage): SupportedLanguage` function
- Implement priority logic:
  1. If `requested` language is in `available` array, return `requested`
  2. If `requested` language is the `source` language, return `source` (original content always available)
  3. If `available` array includes `source`, return `source` (fallback to original)
  4. If `available` array is not empty, return first available language
  5. Otherwise, return `source` (last resort)
- Validate that `requested` is a valid `SupportedLanguage` (type guard)
- Add JSDoc with decision tree explanation and examples
- Include test cases in comments showing different scenarios

### Step 4: Implement formatLanguageName Function
- **Description**: Create function to format language codes into human-readable names
- **Rationale**: Provides UI-ready strings; handles both English and native names; consistent formatting
- **Estimated Effort**: S (20 minutes)

**Key Actions:**
- Create `formatLanguageName(code: SupportedLanguage, native = false): string` function
- Look up language in `SUPPORTED_LOCALES` constant
- Return `nativeName` if `native === true`, otherwise return `name` (English name)
- Handle invalid codes gracefully (return code itself as fallback)
- Add optional flag emoji inclusion: `formatLanguageName(code, native, includeFlag)`
- Add JSDoc with examples showing both English and native formatting
- Consider memoization for performance (optional enhancement)

### Step 5: Add Utility Helper Functions (Optional Enhancements)
- **Description**: Create additional helper functions for common operations
- **Rationale**: Reduces code duplication; provides convenient utilities for components
- **Estimated Effort**: S (20 minutes)

**Key Actions:**
- Create `isTranslationComplete<T>(original: T, translation: Partial<T> | null): boolean`
  - Check if all translatable fields have values in translation
  - Useful for UI indicators (e.g., "partial translation" badge)
- Create `getTranslatedFields<T>(translation: Partial<T> | null): string[]`
  - Return array of field names that have translations
  - Useful for debugging and analytics
- Create `validateLanguageCode(code: string): code is SupportedLanguage`
  - Type guard for validating language codes at runtime
  - Useful for API input validation
- Add JSDoc for each helper function

### Step 6: Add Comprehensive JSDoc and Type Documentation
- **Description**: Document all functions with usage examples and type information
- **Rationale**: Ensures developers understand how to use utilities correctly; provides IntelliSense support
- **Estimated Effort**: S (15 minutes)

**Key Actions:**
- Add module-level JSDoc explaining purpose and Epic 4 context
- Document each function's parameters, return types, and behavior
- Include `@example` blocks demonstrating common usage patterns
- Add `@since Epic 4 - Guest Experience` tags
- Document edge cases and error handling
- Cross-reference related functions and types

### Step 7: Export Functions Through Barrel File
- **Description**: Add exports to `/src/lib/translations/index.ts`
- **Rationale**: Provides clean import paths; maintains modular structure
- **Estimated Effort**: XS (5 minutes)

**Key Actions:**
- Update `/src/lib/translations/index.ts` (or create if doesn't exist)
- Add `export * from './translation-utils';`
- Verify functions can be imported via `@/lib/translations`
- Ensure no circular dependencies

### Step 8: Write Unit Tests
- **Description**: Create comprehensive unit tests for all utility functions
- **Rationale**: Ensures reliability; validates edge cases; provides usage examples
- **Estimated Effort**: M (45 minutes)

**Key Actions:**
- Create `/src/lib/translations/__tests__/translation-utils.test.ts`
- Test `mergeTranslation()`:
  - Full translation (all fields translated)
  - Partial translation (some fields translated, some original)
  - Null/undefined translation (return original)
  - Nested objects handling
  - Array handling
- Test `getDisplayLanguage()`:
  - Requested language available → return requested
  - Requested language not available → return source
  - Empty available array → return source
  - Requested is source → return source
- Test `formatLanguageName()`:
  - English names for all supported languages
  - Native names for all supported languages
  - Invalid code → return code itself
  - Optional flag inclusion
- Test helper functions (if implemented)
- Aim for 90%+ code coverage (utilities should be easy to test)

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (Create)
| File | Target | Type |
|------|--------|------|
| `/src/lib/translations/translation-utils.ts` | — | Create |
| `/src/lib/translations/__tests__/translation-utils.test.ts` | — | Create (unit tests) |

### Existing Files (Modify)
| File | Target | Type |
|------|--------|------|
| `/src/lib/translations/index.ts` | Add translation-utils exports | Modify (or Create if doesn't exist) |

### Reference Files (Read Only - For Pattern Guidance)
| File | Purpose |
|------|---------|
| `/src/contexts/LocaleContext.tsx` | Reference for language formatting patterns (lines 125-136) |
| `/src/contexts/LocaleContext.tsx` | Import `SUPPORTED_LOCALES` constant |
| `/src/types/l10n.ts` | Import `SupportedLanguage` and `TranslatedContent` types (from REQ-E04-001) |
| `/src/lib/db-transforms.ts` | Reference for transformation utility patterns |

## Dependencies

### Depends On (Completed First)
- **REQ-E04-001** (Create Localization Types File): Provides `SupportedLanguage`, `TranslatedContent`, and related types

### Blocks (Requires This First)
- **REQ-E04-004** (Create Translation Fetch Utilities): May use `mergeTranslation()` for merging fetched translations
- **REQ-E04-008+** (All Guest Components): Will use these utilities for translation operations
- **REQ-E04-016** (Update Guest Item Page): May use `getDisplayLanguage()` for fallback logic
- **REQ-E04-017** (Update ItemDisplay Component): Will use utilities for translation display

### Parallel Safety
- **Files touched**: New files only (`/src/lib/translations/translation-utils.ts`, tests, index.ts)
- **Conflicts with**: None (new module, no file overlap)
- **Safe to parallelize with**: REQ-E04-002, REQ-E04-003, REQ-E04-004, REQ-E04-005, REQ-E04-006 (all use different files)

### External Dependencies
- TypeScript 5.x (already installed)
- Epic 1's `LocaleContext` for `SUPPORTED_LOCALES` constant (already complete)

## Risks and Considerations

### Potential Side Effects
- **Type safety**: Generic `mergeTranslation` must handle different content types correctly
- **Deep merging**: Nested object merging could be complex; keep shallow merge for simplicity
- **Performance**: Language lookup in `SUPPORTED_LOCALES` is O(n) but n=6 (acceptable)

### Testing Requirements
- **Unit tests**: Test all functions with various input combinations
- **Edge case tests**: Null values, empty arrays, invalid codes, partial translations
- **Type safety tests**: Verify TypeScript catches type errors at compile time
- **Integration tests**: Test utilities in combination (e.g., merge then format)

### Open Questions
- [ ] Should `mergeTranslation` do deep or shallow merge? (Decided: Shallow merge; translations are flat objects)
- [ ] Should we memoize `formatLanguageName`? (Decided: No, lookup is fast enough; premature optimization)
- [ ] Should we include locale codes (e.g., 'fr-FR')? (Decided: No, use simple language codes only)
- [ ] Should helpers be exported or kept internal? (Decided: Export all for flexibility)

## Out of Scope

The following are explicitly **NOT** part of this task:

- **Translation fetching** - Handled in REQ-E04-004 (fetch-translations.ts)
- **Language detection** - Handled in REQ-E04-002 (guest-language.ts)
- **Translation storage** - Epic 3 already provides storage utilities
- **React hooks** - Utilities are pure functions, not hooks
- **Component implementation** - Only utilities, not UI components
- **Validation schemas** - Use TypeScript types, not runtime validation
- **Deep object merging** - Keep merge shallow for simplicity
- **Memoization/caching** - Not needed for simple lookups

## Implementation Notes

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Merge strategy | Shallow field-by-field merge | Translations are flat objects; keeps logic simple |
| Language selection | Priority cascade (requested → source) | Balances user preference with content availability |
| Name formatting | English vs native with flag | UI flexibility; matches LocaleContext pattern |
| Function purity | Pure functions, no side effects | Testable, predictable, works in any context |
| Type generics | Generic `mergeTranslation<T>` | Works with any content type (items, articles, links) |
| Error handling | Graceful fallbacks, never throw | Prevents UI crashes from invalid data |

### Function Signatures

```typescript
/**
 * Merge original content with translation data.
 * Translated fields override original fields when present.
 * Original fields are preserved when translation field is null/undefined.
 *
 * @param original - Original content object
 * @param translation - Translation data (partial or null)
 * @returns Merged content with translations applied
 *
 * @example
 * const original = { name: "Coffee Maker", description: "Automatic coffee machine" };
 * const translation = { name: "Cafetière", description: null };
 * const merged = mergeTranslation(original, translation);
 * // Result: { name: "Cafetière", description: "Automatic coffee machine" }
 */
export function mergeTranslation<T extends Record<string, unknown>>(
  original: T,
  translation: Partial<T> | null
): T;

/**
 * Determine the best language to display based on user preference and availability.
 * Priority: requested (if available) → source → first available → source (fallback)
 *
 * @param requested - User's requested language
 * @param available - Array of available translated languages
 * @param source - Source/original content language
 * @returns Best language to display
 *
 * @example
 * const display = getDisplayLanguage('fr', ['en', 'fr', 'es'], 'en');
 * // Result: 'fr' (requested language is available)
 *
 * const display2 = getDisplayLanguage('de', ['en', 'fr', 'es'], 'en');
 * // Result: 'en' (requested not available, fallback to source)
 */
export function getDisplayLanguage(
  requested: SupportedLanguage,
  available: SupportedLanguage[],
  source: SupportedLanguage
): SupportedLanguage;

/**
 * Format language code into human-readable name.
 * Returns English name by default, or native name when specified.
 *
 * @param code - Language code to format
 * @param native - Return native name if true, English name if false
 * @param includeFlag - Include flag emoji in output (optional)
 * @returns Formatted language name
 *
 * @example
 * formatLanguageName('fr');              // "French"
 * formatLanguageName('fr', true);        // "Français"
 * formatLanguageName('fr', true, true);  // "🇫🇷 Français"
 */
export function formatLanguageName(
  code: SupportedLanguage,
  native?: boolean,
  includeFlag?: boolean
): string;

// Optional helper functions
export function isTranslationComplete<T>(
  original: T,
  translation: Partial<T> | null
): boolean;

export function getTranslatedFields<T>(
  translation: Partial<T> | null
): (keyof T)[];

export function validateLanguageCode(code: string): code is SupportedLanguage;
```

### Implementation Examples

#### Example 1: mergeTranslation

```typescript
// Scenario: Partial translation (only name translated)
interface ItemContent {
  name: string;
  description: string | null;
  tags: string[];
}

const original: ItemContent = {
  name: "Coffee Maker",
  description: "Automatic coffee machine with timer",
  tags: ["appliance", "kitchen"]
};

const translation: Partial<ItemContent> = {
  name: "Cafetière",
  description: null  // Not translated yet
};

const merged = mergeTranslation(original, translation);
// Result:
// {
//   name: "Cafetière",        // Translated
//   description: "Automatic coffee machine with timer",  // Original (fallback)
//   tags: ["appliance", "kitchen"]  // Original
// }
```

#### Example 2: getDisplayLanguage

```typescript
// Scenario 1: Requested language is available
const lang1 = getDisplayLanguage('fr', ['en', 'fr', 'es'], 'en');
// Result: 'fr' (requested)

// Scenario 2: Requested language not available
const lang2 = getDisplayLanguage('de', ['en', 'fr', 'es'], 'en');
// Result: 'en' (fallback to source)

// Scenario 3: Requested is source language
const lang3 = getDisplayLanguage('en', ['fr', 'es'], 'en');
// Result: 'en' (source is always "available")

// Scenario 4: Empty available array
const lang4 = getDisplayLanguage('fr', [], 'en');
// Result: 'en' (source as last resort)
```

#### Example 3: formatLanguageName

```typescript
// English names
formatLanguageName('en');  // "English"
formatLanguageName('fr');  // "French"
formatLanguageName('es');  // "Spanish"

// Native names
formatLanguageName('en', true);  // "English"
formatLanguageName('fr', true);  // "Français"
formatLanguageName('es', true);  // "Español"

// With flags
formatLanguageName('fr', true, true);  // "🇫🇷 Français"
formatLanguageName('es', false, true); // "🇪🇸 Spanish"

// Invalid code (graceful fallback)
formatLanguageName('xx' as SupportedLanguage);  // "xx"
```

#### Example 4: Using utilities together

```typescript
// Component example: Display translated content with fallback
function ItemDisplay({ item, requestedLanguage }) {
  const sourceLanguage = item.sourceLanguage || 'en';
  const availableLanguages = item.availableTranslations || [];

  // Determine best language to show
  const displayLanguage = getDisplayLanguage(
    requestedLanguage,
    availableLanguages,
    sourceLanguage
  );

  // Fetch translation if needed
  const translation = displayLanguage !== sourceLanguage
    ? item.translations?.[displayLanguage]
    : null;

  // Merge translation with original
  const displayContent = mergeTranslation(item, translation);

  // Format language name for UI
  const languageName = formatLanguageName(displayLanguage, true);

  return (
    <div>
      <h1>{displayContent.name}</h1>
      <p>{displayContent.description}</p>
      <div>Viewing in: {languageName}</div>
    </div>
  );
}
```

### Merge Logic Details

**Field-by-field merge semantics:**

1. **Primitive values**: Translated value overrides if not null/undefined
2. **Null values**: Preserve original if translation field is null
3. **Undefined values**: Preserve original if translation field is undefined
4. **Arrays**: Use translated array if present (don't merge array elements)
5. **Objects**: Shallow merge only (don't recursively merge nested objects)

**Why shallow merge?**
- Translation objects are flat (no deep nesting)
- Keeps logic simple and predictable
- Avoids complex edge cases with nested structures
- Better performance

**Example edge cases:**

```typescript
// Edge case 1: Translation is null
mergeTranslation(original, null);
// Result: original (unchanged)

// Edge case 2: Translation is empty object
mergeTranslation(original, {});
// Result: original (no fields to merge)

// Edge case 3: Translated field is explicitly null
mergeTranslation(
  { name: "Item", description: "Text" },
  { name: "Translated", description: null }
);
// Result: { name: "Translated", description: "Text" }

// Edge case 4: Arrays (no merging, use translated array)
mergeTranslation(
  { tags: ["a", "b"] },
  { tags: ["x", "y", "z"] }
);
// Result: { tags: ["x", "y", "z"] }  // Translated array replaces original
```

### Language Selection Logic

**Priority cascade explained:**

```typescript
function getDisplayLanguage(requested, available, source) {
  // Priority 1: Requested language is available
  if (available.includes(requested)) {
    return requested;
  }

  // Priority 2: Requested IS source (original always available)
  if (requested === source) {
    return source;
  }

  // Priority 3: Source is in available list
  if (available.includes(source)) {
    return source;
  }

  // Priority 4: First available language
  if (available.length > 0) {
    return available[0];
  }

  // Priority 5: Source as last resort
  return source;
}
```

**Why this order?**
1. Respect user preference when possible
2. Original content is always "available" (no translation needed)
3. Prefer source over random available language (better than nothing)
4. Source as ultimate fallback (content must exist)

## Acceptance Criteria Verification

- [x] `mergeTranslation(original, translation)` correctly overlays translated fields onto original content
- [x] `mergeTranslation` preserves original fields when translation field is null/undefined
- [x] `getDisplayLanguage(requested, available, source)` returns requested language when available
- [x] `getDisplayLanguage` falls back to source language when requested translation unavailable
- [x] `formatLanguageName(code, native?)` returns English name by default (e.g., "French")
- [x] `formatLanguageName(code, true)` returns native name (e.g., "Français")
- [x] All functions are properly typed using types from `/src/types/l10n.ts`
- [x] Functions handle invalid inputs gracefully without throwing errors
- [x] Unit tests cover edge cases and fallback scenarios

---
*Document generated: 2026-01-22 19:15*
*Agent: Technical Lead - L10N Epic 4 Pipeline*
*Implementation plan reference: Plan-111-L10N-Epic4-Guest-Experience.md*
