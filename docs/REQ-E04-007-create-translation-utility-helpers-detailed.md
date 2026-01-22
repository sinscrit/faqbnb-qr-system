# Create Translation Utility Helpers - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:42
**Reference Documents:**
- Requirements: docs/gen_requests_epic4.md (Request #7)
- Overview: docs/REQ-E04-007-create-translation-utility-helpers-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Create Module File and Import Dependencies

**Context:** This task creates the foundation for translation utility functions. The module must work in both server-side (API routes, server components) and client-side (React components) contexts, so it cannot have environment-specific dependencies. Import types from REQ-E04-001 (`SupportedLanguage`) and the `SUPPORTED_LOCALES` constant from Epic 1's LocaleContext for language metadata (names, native names, flags).

**Files to modify:**
- `/src/lib/translations/translation-utils.ts` (create new file)

**Estimated effort:** 1 story point

- [ ] **1.1** Create file `/src/lib/translations/translation-utils.ts`
- [ ] **1.2** Add module-level JSDoc comment: "Translation Utility Helpers (Epic 4 - Guest Experience)"
- [ ] **1.3** Add JSDoc description: "Pure utility functions for translation operations: merging content, determining display language, and formatting language names. Works in both server and client contexts."
- [ ] **1.4** Add JSDoc tags: `@module lib/translations/translation-utils`, `@since Epic 4 - Guest Experience`
- [ ] **1.5** Add import statement: `import type { SupportedLanguage } from '@/types/l10n';` from REQ-E04-001
- [ ] **1.6** Add import statement: `import { SUPPORTED_LOCALES } from '@/contexts/LocaleContext';` for language metadata
- [ ] **1.7** Add JSDoc note: "All functions are pure (no side effects) and type-safe"
- [ ] **1.8** Run `npx tsc --noEmit` to verify imports resolve correctly

---

## 2. Implement mergeTranslation Function - Core Logic

**Context:** The `mergeTranslation` function performs field-by-field overlay of translated content onto original content. It uses TypeScript generics to work with any content type (items, articles, links). The merge semantics: if translation is null, return original unchanged; for each field, use translated value if non-null/undefined, otherwise preserve original. This is a shallow merge - we don't recursively merge nested objects since translation data is flat.

**Files to modify:**
- `/src/lib/translations/translation-utils.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **2.1** Create function signature: `export function mergeTranslation<T extends Record<string, unknown>>(original: T, translation: Partial<T> | null): T`
- [ ] **2.2** Add comprehensive JSDoc with description: "Merge original content with translation data. Translated fields override original when present. Original preserved when translation field is null/undefined."
- [ ] **2.3** Add JSDoc `@param original` - Original content object
- [ ] **2.4** Add JSDoc `@param translation` - Translation data (partial or null)
- [ ] **2.5** Add JSDoc `@returns` - Merged content with translations applied
- [ ] **2.6** Add JSDoc `@template T` - Content type parameter
- [ ] **2.7** Implement early return: if `translation === null || translation === undefined`, return `original` unchanged
- [ ] **2.8** Create result object starting with original: `const result = { ...original };`
- [ ] **2.9** Iterate through translation keys: `for (const key in translation)`
- [ ] **2.10** For each key, check if value is not null and not undefined: `if (translation[key] !== null && translation[key] !== undefined)`
- [ ] **2.11** If condition met, assign translated value: `result[key] = translation[key];`
- [ ] **2.12** Return merged result object
- [ ] **2.13** Run `npx tsc --noEmit` to verify generic type parameter and function signature

---

## 3. Add mergeTranslation Examples and Edge Cases

**Context:** Comprehensive JSDoc examples help developers understand how the function behaves in different scenarios. The examples should cover: full translation (all fields), partial translation (some fields), null translation, null fields within translation, and array handling. These examples serve as both documentation and specification for testing.

**Files to modify:**
- `/src/lib/translations/translation-utils.ts` (enhance JSDoc for mergeTranslation)

**Estimated effort:** 1 story point

- [ ] **3.1** Add JSDoc `@example` block showing full translation scenario with all fields translated
- [ ] **3.2** Add JSDoc `@example` block showing partial translation: translated `name` but null `description`
- [ ] **3.3** Add JSDoc `@example` block showing null translation input returning original unchanged
- [ ] **3.4** Add JSDoc `@example` block showing empty translation object `{}` returning original
- [ ] **3.5** Add JSDoc `@example` block showing array field replacement (arrays not merged element-wise)
- [ ] **3.6** Add JSDoc note: "This is a shallow merge. Arrays are replaced, not merged. Nested objects are replaced, not deep-merged."
- [ ] **3.7** Add JSDoc note: "Null/undefined translation fields preserve original field values (explicit fallback)"
- [ ] **3.8** Add inline comment in code: `// Shallow merge: replace fields, don't deep merge nested objects`

---

## 4. Implement getDisplayLanguage Function - Priority Cascade

**Context:** The `getDisplayLanguage` function determines which language to display based on user preference, availability, and source content. It implements a priority cascade: (1) requested if available, (2) requested if it's the source (original always available), (3) source if in available list, (4) first available language, (5) source as last resort. This ensures users see their preferred language when possible, with graceful fallback to original content.

**Files to modify:**
- `/src/lib/translations/translation-utils.ts` (add new function)

**Estimated effort:** 1 story point

- [ ] **4.1** Create function signature: `export function getDisplayLanguage(requested: SupportedLanguage, available: SupportedLanguage[], source: SupportedLanguage): SupportedLanguage`
- [ ] **4.2** Add comprehensive JSDoc with description: "Determine best language to display based on user preference and availability. Priority: requested (if available) → source → first available → source (fallback)"
- [ ] **4.3** Add JSDoc `@param requested` - User's requested language
- [ ] **4.4** Add JSDoc `@param available` - Array of available translated languages
- [ ] **4.5** Add JSDoc `@param source` - Source/original content language
- [ ] **4.6** Add JSDoc `@returns` - Best language to display
- [ ] **4.7** Implement Priority 1: if `available.includes(requested)`, return `requested`
- [ ] **4.8** Implement Priority 2: if `requested === source`, return `source` (original content always available)
- [ ] **4.9** Implement Priority 3: if `available.includes(source)`, return `source` (prefer source over random language)
- [ ] **4.10** Implement Priority 4: if `available.length > 0`, return `available[0]` (first available language)
- [ ] **4.11** Implement Priority 5: return `source` (last resort fallback)
- [ ] **4.12** Add inline comments explaining each priority level
- [ ] **4.13** Run `npx tsc --noEmit` to verify function compiles

---

## 5. Add getDisplayLanguage Examples and Decision Tree

**Context:** The language selection logic can be complex to understand. Provide multiple examples showing different scenarios: requested available, requested unavailable, requested is source, empty available array. Include a decision tree in comments explaining the logic flow. These examples help developers understand when fallbacks occur and why.

**Files to modify:**
- `/src/lib/translations/translation-utils.ts` (enhance JSDoc for getDisplayLanguage)

**Estimated effort:** 1 story point

- [ ] **5.1** Add JSDoc `@example` showing scenario: requested language is available (returns requested)
- [ ] **5.2** Add JSDoc `@example` showing scenario: requested language not available (returns source)
- [ ] **5.3** Add JSDoc `@example` showing scenario: requested is source language (returns source)
- [ ] **5.4** Add JSDoc `@example` showing scenario: empty available array (returns source)
- [ ] **5.5** Add JSDoc `@example` showing scenario: source not in available list (returns first available or source)
- [ ] **5.6** Add JSDoc note: "Original content (source language) is always 'available' since no translation needed"
- [ ] **5.7** Add JSDoc note: "Priority cascade balances user preference with content availability"
- [ ] **5.8** Add inline comment: `// Decision tree: requested available? → requested is source? → source available? → any available? → source`

---

## 6. Implement formatLanguageName Function

**Context:** The `formatLanguageName` function converts language codes ('en', 'fr') into human-readable names for UI display. It supports both English names ("French") and native names ("Français"). Optional flag emoji inclusion provides visual recognition. The function looks up metadata from the `SUPPORTED_LOCALES` constant and handles invalid codes gracefully by returning the code itself as a fallback.

**Files to modify:**
- `/src/lib/translations/translation-utils.ts` (add new function)

**Estimated effort:** 1 story point

- [ ] **6.1** Create function signature: `export function formatLanguageName(code: SupportedLanguage, native = false, includeFlag = false): string`
- [ ] **6.2** Add comprehensive JSDoc with description: "Format language code into human-readable name. Returns English name by default, or native name when specified. Optionally includes flag emoji."
- [ ] **6.3** Add JSDoc `@param code` - Language code to format
- [ ] **6.4** Add JSDoc `@param native` - Return native name if true, English name if false (default: false)
- [ ] **6.5** Add JSDoc `@param includeFlag` - Include flag emoji in output (default: false)
- [ ] **6.6** Add JSDoc `@returns` - Formatted language name
- [ ] **6.7** Look up language in SUPPORTED_LOCALES: `const language = SUPPORTED_LOCALES.find(loc => loc.code === code);`
- [ ] **6.8** Handle not found case: if `!language`, return `code` as fallback
- [ ] **6.9** Select name: `const name = native ? language.nativeName : language.name;`
- [ ] **6.10** Add flag if requested: `const result = includeFlag && language.flag ? \`${language.flag} ${name}\` : name;`
- [ ] **6.11** Return formatted result
- [ ] **6.12** Add inline comment: `// Graceful fallback: return code itself if language metadata not found`
- [ ] **6.13** Run `npx tsc --noEmit` to verify optional parameters and return type

---

## 7. Add formatLanguageName Examples

**Context:** The `formatLanguageName` function has three parameters affecting output format. Provide examples showing all combinations: English names, native names, with/without flags, and invalid code handling. These examples demonstrate the flexibility of the function for different UI contexts (dropdowns, labels, badges).

**Files to modify:**
- `/src/lib/translations/translation-utils.ts` (enhance JSDoc for formatLanguageName)

**Estimated effort:** 1 story point

- [ ] **7.1** Add JSDoc `@example` showing default (English name): `formatLanguageName('fr')` → "French"
- [ ] **7.2** Add JSDoc `@example` showing native name: `formatLanguageName('fr', true)` → "Français"
- [ ] **7.3** Add JSDoc `@example` showing English with flag: `formatLanguageName('fr', false, true)` → "🇫🇷 French"
- [ ] **7.4** Add JSDoc `@example` showing native with flag: `formatLanguageName('fr', true, true)` → "🇫🇷 Français"
- [ ] **7.5** Add JSDoc `@example` showing invalid code fallback: `formatLanguageName('xx' as SupportedLanguage)` → "xx"
- [ ] **7.6** Add JSDoc note: "Useful for language switchers, labels, and badges in UI components"
- [ ] **7.7** Add JSDoc note: "Flag emoji may not display correctly on all platforms/fonts"

---

## 8. Implement Optional Helper Functions

**Context:** Additional helper functions provide convenience utilities for common translation operations. `isTranslationComplete` checks if all fields have translations (useful for UI badges). `getTranslatedFields` returns which fields are translated (useful for debugging). `validateLanguageCode` is a type guard for runtime validation. These are optional enhancements but increase developer productivity.

**Files to modify:**
- `/src/lib/translations/translation-utils.ts` (add helper functions)

**Estimated effort:** 1 story point

- [ ] **8.1** Create function: `export function isTranslationComplete<T extends Record<string, unknown>>(original: T, translation: Partial<T> | null): boolean`
- [ ] **8.2** In `isTranslationComplete`: if translation is null, return false
- [ ] **8.3** In `isTranslationComplete`: check if all keys in original exist in translation and are non-null
- [ ] **8.4** In `isTranslationComplete`: return true only if all fields translated
- [ ] **8.5** Add JSDoc to `isTranslationComplete`: "Check if all translatable fields have values in translation. Useful for UI indicators (partial translation badge)."
- [ ] **8.6** Create function: `export function getTranslatedFields<T extends Record<string, unknown>>(translation: Partial<T> | null): (keyof T)[]`
- [ ] **8.7** In `getTranslatedFields`: if translation is null, return empty array
- [ ] **8.8** In `getTranslatedFields`: return array of keys where value is non-null/undefined
- [ ] **8.9** Add JSDoc to `getTranslatedFields`: "Return array of field names that have translations. Useful for debugging and analytics."
- [ ] **8.10** Create function: `export function validateLanguageCode(code: string): code is SupportedLanguage`
- [ ] **8.11** In `validateLanguageCode`: check if code is in SUPPORTED_LOCALES array
- [ ] **8.12** Add JSDoc to `validateLanguageCode`: "Type guard for validating language codes at runtime. Useful for API input validation."
- [ ] **8.13** Run `npx tsc --noEmit` to verify all helper functions compile

---

## 9. Add Module-Level Documentation and Cross-References

**Context:** Module-level documentation provides an overview of all functions, their purposes, and how they work together. Cross-references between related functions and types help developers navigate the codebase. Include usage examples showing how utilities combine in real-world scenarios (e.g., fetch → merge → display flow).

**Files to modify:**
- `/src/lib/translations/translation-utils.ts` (enhance module documentation)

**Estimated effort:** 1 story point

- [ ] **9.1** Enhance module-level JSDoc with comprehensive overview of all functions
- [ ] **9.2** Add JSDoc section listing all exported functions with one-line descriptions
- [ ] **9.3** Add JSDoc usage example showing utilities used together: fetch translation → merge → determine display language → format name
- [ ] **9.4** Add JSDoc `@see` tags cross-referencing related types from `@/types/l10n`
- [ ] **9.5** Add JSDoc `@see` tag referencing `fetchTranslatedItem` from REQ-E04-004
- [ ] **9.6** Add JSDoc note: "All functions are pure (no side effects, no state, deterministic)"
- [ ] **9.7** Add JSDoc note: "Functions work in both server-side (API routes) and client-side (React components) contexts"
- [ ] **9.8** Add inline code example in JSDoc showing complete flow from request to display

---

## 10. Update Barrel Export File

**Context:** Following the modular structure pattern, the translations module uses a barrel export file (`index.ts`) to provide clean import paths. Add the utility functions to the barrel export so they can be imported via `@/lib/translations` instead of the full file path. Verify no circular dependencies are introduced.

**Files to modify:**
- `/src/lib/translations/index.ts` (modify existing or create if doesn't exist)

**Estimated effort:** 1 story point

- [ ] **10.1** Check if `/src/lib/translations/index.ts` exists; if not, create it
- [ ] **10.2** Add export statement: `export * from './translation-utils';` to export all utility functions
- [ ] **10.3** Add comment above export: `// Translation utility helpers (Epic 4 - Guest Experience)`
- [ ] **10.4** If file already exists with fetch-translations exports (from REQ-E04-004), ensure both exports coexist
- [ ] **10.5** Verify module-level JSDoc exists explaining the translations module purpose
- [ ] **10.6** Run `npx tsc --noEmit` to check for circular dependency errors
- [ ] **10.7** Create temporary test file to verify imports work: `import { mergeTranslation, getDisplayLanguage, formatLanguageName } from '@/lib/translations';`
- [ ] **10.8** Verify test file compiles with `npx tsc --noEmit`
- [ ] **10.9** Delete temporary test file after verification

---

## 11. Write Unit Tests - Setup and mergeTranslation Tests

**Context:** Unit tests validate that utilities work correctly across all scenarios. Start with test file setup and comprehensive tests for `mergeTranslation`. Test cases should cover: full translation, partial translation, null translation, null fields, empty objects, array handling. Use descriptive test names following the pattern "should [expected behavior] when [condition]".

**Files to modify:**
- `/src/lib/translations/__tests__/translation-utils.test.ts` (create new file)

**Estimated effort:** 1 story point

- [ ] **11.1** Create test file: `/src/lib/translations/__tests__/translation-utils.test.ts`
- [ ] **11.2** Add imports: `import { mergeTranslation, getDisplayLanguage, formatLanguageName } from '../translation-utils';`
- [ ] **11.3** Add import for types: `import type { SupportedLanguage } from '@/types/l10n';`
- [ ] **11.4** Create describe block: `describe('mergeTranslation', () => { ... });`
- [ ] **11.5** Test: "should return merged content when all fields are translated"
- [ ] **11.6** Test: "should preserve original fields when translation field is null"
- [ ] **11.7** Test: "should preserve original fields when translation field is undefined"
- [ ] **11.8** Test: "should return original unchanged when translation is null"
- [ ] **11.9** Test: "should return original unchanged when translation is empty object"
- [ ] **11.10** Test: "should replace arrays completely (not merge elements)"
- [ ] **11.11** Test: "should handle mixed scenario with some translated, some original fields"
- [ ] **11.12** Test: "should work with different content types (items, articles, links)"
- [ ] **11.13** Run tests: `npm test` and verify all mergeTranslation tests pass

---

## 12. Write Unit Tests - getDisplayLanguage Tests

**Context:** The `getDisplayLanguage` function has a priority cascade with multiple branches. Test each priority level independently: requested available, requested is source, source in available, first available, fallback to source. Also test edge cases like empty arrays and invalid inputs. These tests ensure the language selection logic works correctly in all scenarios.

**Files to modify:**
- `/src/lib/translations/__tests__/translation-utils.test.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **12.1** Create describe block: `describe('getDisplayLanguage', () => { ... });`
- [ ] **12.2** Test: "should return requested language when it is available"
- [ ] **12.3** Test: "should return source language when requested is not available"
- [ ] **12.4** Test: "should return source language when requested IS the source"
- [ ] **12.5** Test: "should return source language when available array is empty"
- [ ] **12.6** Test: "should return source when it's in available list but requested is not"
- [ ] **12.7** Test: "should return first available language when requested and source not in list"
- [ ] **12.8** Test: "should handle all 6 supported languages correctly"
- [ ] **12.9** Test: "should prioritize requested over source when both available"
- [ ] **12.10** Run tests: `npm test` and verify all getDisplayLanguage tests pass

---

## 13. Write Unit Tests - formatLanguageName and Helper Tests

**Context:** Complete the test suite with tests for `formatLanguageName` and optional helper functions. Test all parameter combinations for formatting (English/native, with/without flags), invalid code handling, and all 6 supported languages. Test optional helpers if implemented. Aim for 90%+ code coverage since these are pure functions with no external dependencies.

**Files to modify:**
- `/src/lib/translations/__tests__/translation-utils.test.ts` (continue in same file)

**Estimated effort:** 1 story point

- [ ] **13.1** Create describe block: `describe('formatLanguageName', () => { ... });`
- [ ] **13.2** Test: "should return English name by default for all 6 languages"
- [ ] **13.3** Test: "should return native name when native parameter is true"
- [ ] **13.4** Test: "should include flag emoji when includeFlag is true"
- [ ] **13.5** Test: "should return code itself when language not found (invalid code)"
- [ ] **13.6** Test: "should handle all parameter combinations (English, native, with/without flag)"
- [ ] **13.7** If `isTranslationComplete` implemented: create describe block and add tests for complete, partial, and null translations
- [ ] **13.8** If `getTranslatedFields` implemented: create describe block and add tests returning field names correctly
- [ ] **13.9** If `validateLanguageCode` implemented: create describe block and add tests for valid codes (return true) and invalid codes (return false)
- [ ] **13.10** Run full test suite: `npm test` and verify 90%+ code coverage
- [ ] **13.11** Check for any untested branches and add tests if needed
- [ ] **13.12** Verify all tests pass and output is clean

---

## 14. Verify TypeScript Compilation and Type Safety

**Context:** Before considering the module complete, verify that TypeScript compilation succeeds, all types are correctly inferred, and type safety is enforced. Check that generic type parameters work correctly, optional parameters have correct defaults, and return types match expectations. This ensures the utilities provide strong type checking for consumers.

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **14.1** Run `npx tsc --noEmit` to verify entire module compiles without errors
- [ ] **14.2** Verify generic type parameter `<T>` in `mergeTranslation` works with different content types
- [ ] **14.3** Verify return type of `mergeTranslation` is correctly inferred as `T`
- [ ] **14.4** Verify `getDisplayLanguage` always returns `SupportedLanguage` type (never null/undefined)
- [ ] **14.5** Verify optional parameters in `formatLanguageName` have correct defaults (native=false, includeFlag=false)
- [ ] **14.6** Verify `validateLanguageCode` acts as type guard (narrows type from `string` to `SupportedLanguage`)
- [ ] **14.7** Check that imports from `@/types/l10n` and `@/contexts/LocaleContext` resolve correctly
- [ ] **14.8** Verify no type errors in test file
- [ ] **14.9** Check for any `any` types that should be more specific
- [ ] **14.10** Verify JSDoc types match TypeScript types

---

## 15. Run Full Build and Integration Verification

**Context:** The full Next.js build process validates that the utilities integrate correctly with the rest of the application. This catches issues like missing dependencies, incompatible types, or import problems that might not show up in type checking alone. Also verify the utilities work in both server and client contexts by checking bundle splits.

**Files to modify:**
- None (verification only)

**Estimated effort:** 1 story point

- [ ] **15.1** Run full production build: `npm run build`
- [ ] **15.2** Verify build completes successfully without errors or warnings
- [ ] **15.3** Check build output for the new utility module
- [ ] **15.4** Verify utilities are tree-shakeable (only imported functions included in bundle)
- [ ] **15.5** Check that utilities work in server context (API routes can import and use)
- [ ] **15.6** Check that utilities work in client context (React components can import and use)
- [ ] **15.7** Verify no circular dependency warnings
- [ ] **15.8** Run linter: `npm run lint` to ensure code style compliance
- [ ] **15.9** Fix any linting errors (prefer-const, unused variables, etc.)
- [ ] **15.10** Re-run build after fixing lint errors to confirm clean build
- [ ] **15.11** Verify test suite still passes after any fixes: `npm test`

---

## Verification Checklist

After completing all tasks, verify the following acceptance criteria:

- [ ] File `/src/lib/translations/translation-utils.ts` exists with all utility functions implemented
- [ ] `mergeTranslation<T>(original, translation)` correctly overlays translated fields onto original content
- [ ] `mergeTranslation` preserves original fields when translation field is null/undefined
- [ ] `mergeTranslation` returns original unchanged when translation is null
- [ ] `mergeTranslation` uses shallow merge (doesn't deep merge nested objects)
- [ ] `getDisplayLanguage(requested, available, source)` implements correct priority cascade
- [ ] `getDisplayLanguage` returns requested when available
- [ ] `getDisplayLanguage` returns source when requested unavailable
- [ ] `getDisplayLanguage` always returns a valid `SupportedLanguage` (never null/undefined)
- [ ] `formatLanguageName(code, native?, includeFlag?)` returns English name by default
- [ ] `formatLanguageName(code, true)` returns native name (e.g., "Français")
- [ ] `formatLanguageName` handles invalid codes gracefully (returns code itself)
- [ ] Optional flag parameter includes emoji when true
- [ ] Optional helper functions implemented (if included): `isTranslationComplete`, `getTranslatedFields`, `validateLanguageCode`
- [ ] All functions use types from `/src/types/l10n.ts` (from REQ-E04-001)
- [ ] All functions are pure (no side effects, deterministic)
- [ ] Functions work in both server-side and client-side contexts
- [ ] Comprehensive JSDoc with examples for all functions
- [ ] Module exports through `/src/lib/translations/index.ts` barrel file
- [ ] Unit tests cover all functions with 90%+ code coverage
- [ ] Tests cover edge cases: null values, empty arrays, invalid codes, partial translations
- [ ] `npx tsc --noEmit` runs without errors
- [ ] `npm test` passes all tests
- [ ] `npm run build` completes successfully
- [ ] `npm run lint` passes without errors

---

## Notes for Implementation Agent

**Pure Functions Philosophy:**
All utilities must be pure functions:
- No side effects (don't modify inputs, don't access external state)
- Deterministic (same inputs always produce same outputs)
- No environment dependencies (work in server and client contexts)

This ensures utilities are predictable, testable, and can be used anywhere.

**Shallow vs Deep Merge:**
The overview explicitly states to use shallow merge for `mergeTranslation`. Translation objects are flat (no deep nesting), so shallow merge is sufficient and keeps logic simple. Don't implement deep merge logic - it adds complexity without benefit.

**Type Generics:**
The `mergeTranslation<T>` function uses a generic type parameter so it works with any content type (items, articles, links, tags). The generic constraint `T extends Record<string, unknown>` ensures T is an object type. This provides type safety while maintaining flexibility.

**Language Selection Priority:**
The `getDisplayLanguage` priority cascade:
1. Requested available? → requested
2. Requested is source? → source (original always available)
3. Source in available? → source (prefer original over random language)
4. Any available? → first available
5. Fallback → source

This balances user preference with practical availability.

**SUPPORTED_LOCALES Structure:**
From Epic 1's LocaleContext, the structure is:
```typescript
[
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  // ... more languages
]
```

Use `.find(loc => loc.code === code)` to look up language metadata.

**Testing Strategy:**
Pure functions are easy to test - no mocking required. Test inputs and outputs directly. Cover these scenarios:
- Happy path (typical usage)
- Edge cases (null, undefined, empty)
- Invalid inputs (graceful fallback)
- All branches (if/else paths)
- Type safety (TypeScript catches type errors)

Aim for 90%+ coverage since there are no external dependencies to complicate testing.

**Performance Considerations:**
- `mergeTranslation`: O(n) where n = number of fields (typically <10)
- `getDisplayLanguage`: O(1) array lookups with small arrays (n=6 max)
- `formatLanguageName`: O(n) lookup in SUPPORTED_LOCALES (n=6)

All operations are fast enough that memoization is unnecessary (premature optimization).

**Error Handling:**
Functions never throw errors - they handle invalid inputs gracefully:
- `mergeTranslation(original, null)` → return original
- `getDisplayLanguage(requested, [], source)` → return source
- `formatLanguageName('invalid')` → return 'invalid'

This prevents UI crashes from bad data.

**Usage in Other Tasks:**
These utilities will be used by:
- REQ-E04-004 (fetch-translations.ts) - may use mergeTranslation
- REQ-E04-016 (guest item page) - may use getDisplayLanguage
- REQ-E04-017 (ItemDisplay component) - will use formatLanguageName
- All guest components - various utilities

Ensure utilities are general-purpose and reusable.

**Commit Message Suggestion:**
```
[REQ-E04-007] Create translation utility helpers

- Implement mergeTranslation for content overlay
- Implement getDisplayLanguage with priority cascade
- Implement formatLanguageName for UI display
- Add optional helpers: isTranslationComplete, getTranslatedFields, validateLanguageCode
- Comprehensive unit tests (90%+ coverage)
- Pure functions, work in server and client contexts
```

---

*Document generated: 2026-01-22 22:42*
*Epic: 4 - Guest Experience*
*Task: Phase 2, Task 2.4 - Create translation utility helpers*
