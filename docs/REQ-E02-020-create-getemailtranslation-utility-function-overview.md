# Implementation Overview: Create `getEmailTranslation` Utility Function

**Document Created:** 2026-01-22 23:37
**Last Modified:** 2026-01-22 23:37

---

## Header

| Field | Value |
|-------|-------|
| Task Reference | Task 2I.2 (Sub-Epic 2I: Email Templates) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Implementation Plan | Epic 2 - L10N Static UI Translation |
| Original Plan Date | Not specified |
| Breakdown Created | 2026-01-22 23:37 |
| T-shirt Size | Small |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

---

## Executive Summary

This task creates a server-side utility function for translating email content using the `emails` namespace structure created in Task 2I.1. Unlike client-side components that use next-intl's `useTranslations()` hook, email templates require a custom translation mechanism because they are generated server-side and need to support sending emails in the recipient's preferred language.

**Key Deliverable:** A production-ready `getEmailTranslation()` utility function in `/src/lib/email-translations.ts` that loads translations from JSON files, supports variable interpolation, provides fallback to English, and includes comprehensive error handling and testing.

**Function Signature:**
```typescript
export function getEmailTranslation(
  key: string,
  language: SupportedLanguage,
  variables?: Record<string, string | number>
): string
```

---

## Goals

### Primary Objectives

1. **Create email translation utility module** at `/src/lib/email-translations.ts`
2. **Implement `getEmailTranslation()` function** with variable interpolation support
3. **Support all 6 languages** (en, fr, es, de, nl, it) with dynamic JSON loading
4. **Provide robust fallback mechanism** (requested language → English → return key)
5. **Include comprehensive error handling** for missing keys, invalid languages, malformed variables
6. **Create TypeScript types** for type-safe email translation usage
7. **Write unit tests** covering happy path, edge cases, and error conditions

### Success Criteria

- [ ] `/src/lib/email-translations.ts` created with complete implementation
- [ ] Function loads translations from `/messages/{locale}.json` files dynamically
- [ ] Variable interpolation supports `{variableName}` format
- [ ] Fallback chain works: requested language → en → key
- [ ] Type definitions exported for consuming code
- [ ] Unit tests achieve 100% code coverage
- [ ] Function handles malformed translation keys gracefully
- [ ] Performance validated for typical email generation scenarios
- [ ] Documentation includes usage examples

### Assumptions & Clarifications

- **Assumption 1:** Translation files use nested structure `emails.accessApproval.subject` matching Task 2I.1 design
- **Assumption 2:** Variable interpolation uses simple string replacement, not full ICU MessageFormat (no pluralization needed in emails)
- **Assumption 3:** Function runs server-side only (Node.js environment, not browser)
- **Assumption 4:** Translation files are statically available at build time (not dynamically fetched)
- **Assumption 5:** Numeric variables (e.g., `{days}`) should be converted to strings during interpolation
- **Clarification Needed:** Should missing translation keys log warnings to help identify incomplete translations?

---

## Technical Context

### Current State

**Email System:**
- Email templates: `/src/lib/email-templates.ts` (546 lines)
- 4 email generation functions with hardcoded English strings
- Functions: `generateAccessApprovalEmail`, `generateAccessDenialEmail`, `generateBetaAccessApprovalEmail`, `generateRegistrationReminderEmail`

**Translation Infrastructure:**
- Framework: next-intl (Epic 1 - REQ-250)
- Translation files: `/messages/{locale}.json` (6 languages)
- Client-side usage: `useTranslations('namespace')` hook
- Server-side loading: Dynamic imports in `i18n.ts` (line 71)

**Type System:**
- `SupportedLanguage` type: `/src/contexts/LocaleContext.tsx` (line 24)
  ```typescript
  export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
  ```
- Exported from `/src/types/index.ts` for global access

### Architecture Patterns

**Server-Side Translation Loading Pattern:**
```typescript
// From i18n.ts (line 71)
messages: (await import(`./messages/${locale}.json`)).default
```

**Translation Access Pattern (client-side):**
```typescript
const t = useTranslations('namespace');
const text = t('key.path', { variable: 'value' });
```

**Email Translation Pattern (NEW - server-side):**
```typescript
const text = getEmailTranslation('emails.accessApproval.subject', 'fr', {
  accountName: 'MyAccount'
});
```

### Key Design Decisions

1. **Synchronous vs Asynchronous:**
   - **Decision:** Synchronous function using `require()` or cached imports
   - **Rationale:** Email generation functions are already synchronous; async would complicate call sites

2. **Caching Strategy:**
   - **Decision:** Load and cache all translations on first use per language
   - **Rationale:** Translations don't change at runtime; caching improves performance

3. **Variable Interpolation:**
   - **Decision:** Simple regex-based `{key}` replacement
   - **Rationale:** Emails don't need pluralization; simple approach is sufficient and predictable

4. **Error Handling:**
   - **Decision:** Return fallback values (English or key) rather than throwing errors
   - **Rationale:** Email generation should never fail due to missing translation; partial content better than no email

---

## Implementation Plan

### Step 1: Create Email Translation Module Structure
**Description:** Create `/src/lib/email-translations.ts` with imports, types, and module structure
**Rationale:** Establish foundation before implementing logic
**Estimated Effort:** 15 minutes (Small)

**File Structure:**
```typescript
/**
 * Email Translation Utility
 * Server-side translation support for email templates
 * REQ-E02-020: Task 2I.2
 * Last Modified: 2026-01-22 23:37
 */

import { SupportedLanguage } from '@/types';
import type { Messages } from '@/types/i18n';

// Type definitions
// Implementation functions
// Export public API
```

**Imports Required:**
- `SupportedLanguage` from `/src/types` (or `/src/contexts/LocaleContext`)
- Node.js `fs` module for reading JSON files (if not using dynamic imports)
- `path` module for constructing file paths

### Step 2: Define TypeScript Types
**Description:** Create type definitions for email translations and function parameters
**Rationale:** Type safety prevents errors and improves developer experience
**Estimated Effort:** 15 minutes (Small)

**Type Definitions:**
```typescript
/**
 * Email translation variables
 * Supports both string and number values (numbers converted to strings)
 */
export type EmailTranslationVariables = Record<string, string | number>;

/**
 * Email translation result with metadata
 */
export interface EmailTranslationResult {
  text: string;
  language: SupportedLanguage;
  fallback: boolean; // true if English fallback was used
  keyFound: boolean; // true if translation key exists
}

/**
 * Internal cache structure for loaded translations
 */
type TranslationCache = {
  [lang in SupportedLanguage]?: {
    emails: Record<string, any>;
  };
};
```

**Design Decision:** Include metadata in result type (optional - can be simplified to return string only)

### Step 3: Implement Translation Cache System
**Description:** Create in-memory cache for loaded translation files
**Rationale:** Avoid repeated file I/O; translations are static after load
**Estimated Effort:** 20 minutes (Small)

**Cache Implementation:**
```typescript
// Module-level cache (persists across function calls)
const translationCache: TranslationCache = {};

/**
 * Load translations for a specific language
 * Caches result for subsequent calls
 */
function loadTranslations(language: SupportedLanguage): Record<string, any> | null {
  // Check cache first
  if (translationCache[language]) {
    return translationCache[language]!.emails;
  }

  try {
    // Dynamic import approach
    const messages = require(`@/messages/${language}.json`);

    // Cache the emails namespace
    translationCache[language] = {
      emails: messages.emails || {}
    };

    return translationCache[language]!.emails;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    return null;
  }
}
```

**Alternative Approach:** Use dynamic `import()` if async is acceptable
**Performance:** First call loads file (~5-10ms), subsequent calls use cache (~0.1ms)

### Step 4: Implement Key Resolution Function
**Description:** Create helper to resolve nested translation keys (e.g., `accessApproval.subject`)
**Rationale:** Translation namespace is hierarchical; need safe nested object access
**Estimated Effort:** 20 minutes (Small)

**Key Resolution Implementation:**
```typescript
/**
 * Resolve nested translation key
 * Example: 'accessApproval.subject' → translations.accessApproval.subject
 */
function resolveTranslationKey(
  translations: Record<string, any>,
  key: string
): string | null {
  const parts = key.split('.');
  let current: any = translations;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null; // Key not found
    }
  }

  return typeof current === 'string' ? current : null;
}
```

**Edge Cases Handled:**
- Invalid key format (returns null)
- Partial path exists but not terminal value (returns null)
- Non-string terminal value (returns null)

### Step 5: Implement Variable Interpolation Function
**Description:** Create helper to replace `{variableName}` placeholders with actual values
**Rationale:** All email translations contain dynamic content (names, codes, dates)
**Estimated Effort:** 25 minutes (Small)

**Interpolation Implementation:**
```typescript
/**
 * Interpolate variables into translation string
 * Replaces {variableName} with provided values
 * Supports both string and number values
 */
function interpolateVariables(
  template: string,
  variables?: EmailTranslationVariables
): string {
  if (!variables || Object.keys(variables).length === 0) {
    return template;
  }

  return Object.entries(variables).reduce((text, [key, value]) => {
    // Convert numbers to strings
    const stringValue = typeof value === 'number' ? value.toString() : value;

    // Replace all occurrences of {key}
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    return text.replace(regex, stringValue);
  }, template);
}
```

**Test Cases:**
- No variables provided → return template unchanged
- Single variable → replace all occurrences
- Multiple variables → replace all
- Number variables → convert to string
- Unused variables → ignore (no error)
- Missing variables in template → leave placeholder (graceful degradation)

### Step 6: Implement Main `getEmailTranslation` Function
**Description:** Create public API function combining cache, key resolution, and interpolation
**Rationale:** This is the primary deliverable used by email generation functions
**Estimated Effort:** 30 minutes (Medium)

**Main Function Implementation:**
```typescript
/**
 * Get translated email text with variable interpolation
 *
 * @param key - Translation key path (e.g., 'accessApproval.subject')
 * @param language - Target language code
 * @param variables - Optional variables for interpolation
 * @returns Translated and interpolated text
 *
 * @example
 * ```typescript
 * const subject = getEmailTranslation(
 *   'accessApproval.subject',
 *   'fr',
 *   { accountName: 'MyAccount' }
 * );
 * // Returns: "Accès Accordé: MyAccount - Votre Code d'Accès"
 * ```
 */
export function getEmailTranslation(
  key: string,
  language: SupportedLanguage,
  variables?: EmailTranslationVariables
): string {
  // Validate inputs
  if (!key || typeof key !== 'string') {
    console.warn('[getEmailTranslation] Invalid key provided:', key);
    return key || '';
  }

  // Try requested language
  const translations = loadTranslations(language);
  let template = translations ? resolveTranslationKey(translations, key) : null;

  // Fallback to English if not found
  if (!template && language !== 'en') {
    const englishTranslations = loadTranslations('en');
    template = englishTranslations ? resolveTranslationKey(englishTranslations, key) : null;
  }

  // Last resort: return key itself
  if (!template) {
    console.warn(`[getEmailTranslation] Translation not found for key: ${key} (lang: ${language})`);
    return key;
  }

  // Interpolate variables
  return interpolateVariables(template, variables);
}
```

**Fallback Chain:**
1. Try requested language
2. Fall back to English
3. Return key as-is (developer can see what's missing)

### Step 7: Add Helper Functions for Common Patterns
**Description:** Create convenience functions for frequently used email translation patterns
**Rationale:** Simplifies common use cases and reduces repetition
**Estimated Effort:** 20 minutes (Small)

**Helper Functions:**
```typescript
/**
 * Get email subject line
 * Convenience wrapper for subject translations
 */
export function getEmailSubject(
  emailType: 'accessApproval' | 'accessDenial' | 'betaAccess' | 'registrationReminder',
  language: SupportedLanguage,
  variables?: EmailTranslationVariables
): string {
  return getEmailTranslation(`${emailType}.subject`, language, variables);
}

/**
 * Get email greeting
 * Returns standardized greeting with name
 */
export function getEmailGreeting(
  emailType: 'accessApproval' | 'accessDenial' | 'betaAccess' | 'registrationReminder',
  language: SupportedLanguage,
  name: string
): string {
  return getEmailTranslation(`${emailType}.greeting`, language, { name });
}

/**
 * Get common email footer
 */
export function getEmailFooter(
  language: SupportedLanguage
): string {
  return getEmailTranslation('common.footer', language);
}
```

**Usage Example:**
```typescript
const subject = getEmailSubject('accessApproval', 'fr', { accountName: 'Test' });
const greeting = getEmailGreeting('accessApproval', 'fr', 'Jean');
const footer = getEmailFooter('fr');
```

### Step 8: Add Translation Preloading Function (Optional)
**Description:** Create function to preload all translations at application startup
**Rationale:** Reduce first-request latency by loading translations proactively
**Estimated Effort:** 15 minutes (Small)

**Preload Implementation:**
```typescript
/**
 * Preload translations for all languages
 * Useful for warming cache at application startup
 */
export function preloadEmailTranslations(): void {
  const languages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

  languages.forEach(lang => {
    try {
      loadTranslations(lang);
    } catch (error) {
      console.error(`Failed to preload ${lang} translations:`, error);
    }
  });
}
```

**Usage in Application Bootstrap:**
```typescript
// In server startup or API route initialization
if (process.env.NODE_ENV === 'production') {
  preloadEmailTranslations();
}
```

### Step 9: Create Unit Tests
**Description:** Implement comprehensive test suite for email translation utility
**Rationale:** Critical infrastructure requires thorough testing for reliability
**Estimated Effort:** 45 minutes (Medium)

**Test File:** `/src/lib/__tests__/email-translations.test.ts`

**Test Coverage:**
```typescript
describe('getEmailTranslation', () => {
  describe('Basic functionality', () => {
    it('should return English translation for valid key');
    it('should return French translation for valid key');
    it('should handle all 6 supported languages');
  });

  describe('Variable interpolation', () => {
    it('should replace single variable');
    it('should replace multiple variables');
    it('should handle numeric variables');
    it('should handle missing variables gracefully');
    it('should handle unused variables');
    it('should replace multiple occurrences of same variable');
  });

  describe('Fallback behavior', () => {
    it('should fall back to English for missing translation');
    it('should return key for completely missing key');
    it('should handle invalid language code');
  });

  describe('Edge cases', () => {
    it('should handle empty key');
    it('should handle malformed key path');
    it('should handle null/undefined variables');
    it('should handle special characters in variables');
    it('should handle nested keys correctly');
  });

  describe('Performance', () => {
    it('should use cached translations on subsequent calls');
    it('should handle 1000+ rapid calls efficiently');
  });
});

describe('Helper functions', () => {
  describe('getEmailSubject', () => {
    it('should return correct subject for each email type');
  });

  describe('getEmailGreeting', () => {
    it('should format greeting with name');
  });

  describe('getEmailFooter', () => {
    it('should return common footer in all languages');
  });
});
```

**Test Data Setup:**
```typescript
// Mock translation data for testing
const mockTranslations = {
  emails: {
    accessApproval: {
      subject: 'Access Granted: {accountName}',
      greeting: 'Hello {name},'
    },
    common: {
      footer: 'Automated message'
    }
  }
};
```

### Step 10: Add Documentation and Usage Examples
**Description:** Document the utility function with JSDoc comments and README examples
**Rationale:** Enables other developers (and Tasks 2I.3-2I.6) to use the utility correctly
**Estimated Effort:** 20 minutes (Small)

**Documentation Sections:**
1. **Module Overview:** Purpose and architecture
2. **Function Reference:** All exported functions with parameters and return types
3. **Usage Examples:** Common patterns for email generation
4. **Error Handling:** What happens when things go wrong
5. **Performance Notes:** Caching behavior and optimization tips

**Example Documentation:**
```typescript
/**
 * Email Translation Utility
 *
 * Provides server-side translation support for email templates.
 * Uses translation files from /messages/{locale}.json.
 *
 * ## Usage
 *
 * ```typescript
 * import { getEmailTranslation } from '@/lib/email-translations';
 *
 * const subject = getEmailTranslation(
 *   'accessApproval.subject',
 *   'fr',
 *   { accountName: 'MyAccount' }
 * );
 * ```
 *
 * ## Fallback Behavior
 *
 * 1. Try requested language
 * 2. Fall back to English
 * 3. Return translation key as-is
 *
 * ## Performance
 *
 * Translations are cached after first load. Typical performance:
 * - First call: ~5-10ms (file load)
 * - Cached calls: ~0.1ms
 *
 * @module email-translations
 */
```

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (CREATE)

| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `/src/lib/email-translations.ts` | Main utility module | ~200-250 lines |
| `/src/lib/__tests__/email-translations.test.ts` | Unit tests | ~300-400 lines |

### Existing Files (UPDATE - minimal)

| File | Target | Type | Purpose |
|------|--------|------|---------|
| `/src/types/index.ts` | Module exports | Extend | Export `EmailTranslationVariables` type if needed |

### Files NOT Modified (Future Tasks)

| File | Future Task |
|------|-------------|
| `/src/lib/email-templates.ts` | Task 2I.3-2I.6 will update these |
| `/messages/*.json` | Already updated by Task 2I.1 |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-019** (Task 2I.1): Create `emails` namespace and translation structure
  - **What it provides:** Translation files with `emails` namespace structure
  - **Why critical:** This task reads from translation files; they must exist first
  - **Specific dependency:** `/messages/{locale}.json` files must contain `emails.*` keys

- **REQ-250** (Epic 1): Application-Specific Locale Context Wrapper
  - **What it provides:** `SupportedLanguage` type definition
  - **Why critical:** Function signature uses this type

### Blocks (Requires This First)

- **REQ-E02-021** (Task 2I.3): Update `generateAccessApprovalEmail` function
  - **What we provide:** `getEmailTranslation()` function to call
  - **Blocking reason:** Cannot update email functions without translation utility

- **REQ-E02-022** (Task 2I.4): Update `generateAccessDenialEmail` function
  - **What we provide:** Translation utility API
  - **Blocking reason:** Same as above

- **REQ-E02-023** (Task 2I.5): Update `generateBetaAccessApprovalEmail` function
  - **What we provide:** Translation utility API
  - **Blocking reason:** Same as above

- **REQ-E02-024** (Task 2I.6): Update `generateRegistrationReminderEmail` function
  - **What we provide:** Translation utility API
  - **Blocking reason:** Same as above

- **REQ-E02-025** (Task 2I.7): Add language parameter to all email generation functions
  - **What we provide:** Multi-language translation support
  - **Blocking reason:** No point adding language parameter without translation backend

### Parallel Safety

**Files touched by this task:**
- `/src/lib/email-translations.ts` (new file)
- `/src/lib/__tests__/email-translations.test.ts` (new file)
- Potentially `/src/types/index.ts` (minor export addition)

**Conflicts with:**
- **No conflicts:** This task creates entirely new files
- **No other task modifies** these specific files in Sub-Epic 2I

**Safe to parallelize with:**
- **Task 2I.1** (if it's still running) - Different files
- **Any other Sub-Epic 2I tasks** - This task creates foundation they depend on
- **Any Epic 2 tasks from other sub-epics** - No file overlap

**Sequential requirement:**
- **Must run AFTER Task 2I.1** (needs translation files to exist)
- **Must run BEFORE Tasks 2I.3-2I.7** (they depend on this utility)

### External Dependencies

**Node.js Built-ins:**
- `path` module for file path construction
- `fs` module (if using synchronous file reading instead of `require`)

**TypeScript:**
- Compiler support for dynamic `require()` or `import()`
- Type inference for translation object structure

**Translation Files:**
- `/messages/en.json` (mandatory - fallback language)
- `/messages/fr.json` through `/messages/it.json` (loaded on demand)

**Runtime Environment:**
- Node.js server-side execution (not browser)
- File system access to `/messages` directory

---

## Risks and Considerations

### Potential Side Effects

1. **Module Cache Pollution:**
   - **Risk:** Translation cache grows unbounded in long-running processes
   - **Mitigation:** Cache is small (~5-10KB per language × 6 languages = ~30-60KB max)
   - **Severity:** Low

2. **Synchronous File I/O:**
   - **Risk:** First translation load blocks event loop briefly
   - **Mitigation:** Use `require()` which caches; consider `preloadEmailTranslations()` at startup
   - **Severity:** Low (5-10ms one-time cost per language)

3. **Missing Translation Keys:**
   - **Risk:** Emails sent with untranslated placeholders or English fallback
   - **Mitigation:** Comprehensive testing, logging warnings for missing keys
   - **Severity:** Medium (user-facing impact)

4. **Variable Interpolation Errors:**
   - **Risk:** Missing variables leave `{placeholder}` in email text
   - **Mitigation:** Graceful degradation; log warnings but don't throw errors
   - **Severity:** Medium

5. **Type Safety Limitations:**
   - **Risk:** Translation keys are strings, not type-checked
   - **Mitigation:** Document all valid keys; consider generating types from translation files (future improvement)
   - **Severity:** Low

### Testing Requirements

**Unit Tests (Step 9):**
- 100% code coverage target
- All branches tested (fallbacks, error cases)
- Performance benchmarks for caching

**Integration Tests (Task 2I.9):**
- Email generation in all languages
- Variable interpolation in real email templates
- Fallback behavior validation

**Manual Testing:**
- Generate sample emails in all 6 languages
- Verify special characters render correctly (accents, umlauts)
- Test with missing translation keys
- Test with invalid language codes

**QA Checklist:**
- [ ] All unit tests pass
- [ ] Function handles invalid inputs gracefully
- [ ] Cache works correctly (performance test)
- [ ] Fallback chain verified for all languages
- [ ] Variable interpolation tested with edge cases
- [ ] TypeScript types compile without errors
- [ ] No console errors in normal operation
- [ ] Warnings logged for missing keys

### Open Questions

- [ ] **Q1:** Should the function log warnings for missing translation keys?
  - **Options:**
    - A) Always log warnings (helps identify incomplete translations)
    - B) Only log in development mode (reduce production noise)
    - C) No logging (silent fallback)
  - **Recommendation:** Option B - Log in development, silent in production
  - **Implementation:** Check `process.env.NODE_ENV`

- [ ] **Q2:** Should we support nested variable interpolation (e.g., `{user.name}`)?
  - **Current:** Only flat variables (`{name}`)
  - **Recommendation:** No - Keep it simple; flatten variables at call site

- [ ] **Q3:** Should the cache be clearable (e.g., for hot-reloading in development)?
  - **Options:**
    - A) Add `clearTranslationCache()` export
    - B) No cache clearing (production-focused)
  - **Recommendation:** Option A - Useful for development

- [ ] **Q4:** Should numeric values be formatted by locale (e.g., `1.234,56` vs `1,234.56`)?
  - **Current:** Numbers converted to string as-is
  - **Recommendation:** No - Email content doesn't need locale-specific number formatting

---

## Out of Scope

**Explicitly NOT included in this task:**

1. **Updating email generation functions** to use the utility - Tasks 2I.3-2I.6
2. **Adding language parameter** to email functions - Task 2I.7
3. **Translating email content** to non-English languages - Task 2I.8 (translation files)
4. **Testing email generation** with translations - Task 2I.9
5. **HTML email template translation** - Only text content is translated
6. **Pluralization support** - Emails don't require ICU plural rules
7. **Date/time formatting by locale** - Out of scope for email translations
8. **Real-time translation updates** - Translations are static after load
9. **Translation validation at build time** - Could be future improvement
10. **Generating TypeScript types** from translation files - Future enhancement
11. **Supporting additional languages** beyond the 6 in Epic 2
12. **Email preview with translations** - UI task, not utility task

---

## Success Metrics

### Quantitative Metrics

1. **Code Coverage:** ≥95% for `email-translations.ts` (target: 100%)
2. **Test Count:** ≥20 unit tests covering all functions
3. **Performance:** Cache hits <1ms, cache misses <10ms
4. **Type Safety:** 0 TypeScript compilation errors
5. **Function Count:** 4-6 exported functions (main + helpers)
6. **Lines of Code:** ~200-250 lines implementation, ~300-400 lines tests

### Qualitative Metrics

1. **Code Review Approval:** Technical lead approves implementation design
2. **API Usability:** Email function updates (Tasks 2I.3-2I.6) proceed smoothly
3. **Error Handling:** Graceful degradation in all error scenarios
4. **Documentation Quality:** Future developers can use utility without asking questions
5. **Maintainability:** Code is clear and easy to modify

### Acceptance Criteria

**Task is complete when:**
- ✅ `/src/lib/email-translations.ts` created with complete implementation
- ✅ All exported functions have JSDoc documentation
- ✅ Unit test suite created with ≥95% coverage
- ✅ All tests pass in CI/CD pipeline
- ✅ Function successfully loads translations from all 6 language files
- ✅ Variable interpolation works correctly for string and number values
- ✅ Fallback chain verified (requested → English → key)
- ✅ TypeScript types exported and documented
- ✅ No ESLint warnings or errors
- ✅ Code review approved by technical lead
- ✅ Git commit created: "[REQ-E02-020] Create getEmailTranslation utility function"

---

## Implementation Notes

### Key Design Decisions

1. **Synchronous API:**
   - **Decision:** Use synchronous `require()` instead of async `import()`
   - **Rationale:** Email generation functions are synchronous; async would complicate call sites
   - **Trade-off:** Slight first-call delay vs simpler API

2. **Module-Level Cache:**
   - **Decision:** Cache translations at module scope, not per-function
   - **Rationale:** Translations don't change at runtime; share cache across all calls
   - **Trade-off:** Small memory overhead vs significant performance gain

3. **Graceful Fallback:**
   - **Decision:** Never throw errors; always return string (fallback or key)
   - **Rationale:** Email generation should never fail due to missing translation
   - **Trade-off:** Potential untranslated content vs guaranteed email delivery

4. **Simple Variable Interpolation:**
   - **Decision:** Use regex replacement instead of ICU MessageFormat
   - **Rationale:** Emails don't need pluralization or complex formatting
   - **Trade-off:** Less powerful vs simpler, more predictable

5. **Helper Functions:**
   - **Decision:** Include convenience functions for common patterns
   - **Rationale:** Reduce repetition in email generation code (Tasks 2I.3-2I.6)
   - **Trade-off:** Slightly larger API surface vs improved DX

### Alternative Approaches Considered

**Alternative 1: Use next-intl server-side APIs**
- **Pros:** Reuse existing infrastructure, consistent API
- **Cons:** next-intl server APIs are designed for request context, awkward for utility functions
- **Decision:** Rejected - Custom utility is cleaner for this use case

**Alternative 2: Async function with dynamic imports**
- **Pros:** Non-blocking file I/O, modern approach
- **Cons:** Complicates all call sites, email functions would need to become async
- **Decision:** Rejected - Synchronous API is simpler and sufficient

**Alternative 3: Load all translations into memory at startup**
- **Pros:** Zero runtime lookup cost
- **Cons:** Increased memory usage, slower startup
- **Decision:** Partial adoption - Offer optional `preloadEmailTranslations()` but don't require it

**Alternative 4: Use template literal tag function**
- **Example:** ``email`accessApproval.subject ${{accountName: 'Test'}}` ``
- **Pros:** More JavaScript-idiomatic, type-safe variables
- **Cons:** Unusual syntax, harder to understand for non-experts
- **Decision:** Rejected - Function call syntax is clearer

---

## Appendix A: Function API Reference

### `getEmailTranslation()`

**Signature:**
```typescript
function getEmailTranslation(
  key: string,
  language: SupportedLanguage,
  variables?: EmailTranslationVariables
): string
```

**Parameters:**
- `key` (string): Translation key path, e.g., `'accessApproval.subject'`
- `language` (SupportedLanguage): Target language code (`'en'` | `'fr'` | `'es'` | `'de'` | `'nl'` | `'it'`)
- `variables` (optional): Object with variable values for interpolation

**Returns:** Translated and interpolated string

**Throws:** Never throws; returns fallback values on error

**Example:**
```typescript
const subject = getEmailTranslation(
  'accessApproval.subject',
  'fr',
  { accountName: 'Mon Compte' }
);
// Returns: "Accès Accordé: Mon Compte - Votre Code d'Accès"
```

---

### `getEmailSubject()`

**Signature:**
```typescript
function getEmailSubject(
  emailType: 'accessApproval' | 'accessDenial' | 'betaAccess' | 'registrationReminder',
  language: SupportedLanguage,
  variables?: EmailTranslationVariables
): string
```

**Parameters:**
- `emailType`: Email template type (type-safe enum)
- `language`: Target language code
- `variables`: Variables for subject line interpolation

**Returns:** Translated email subject

**Example:**
```typescript
const subject = getEmailSubject('betaAccess', 'es');
// Returns: "🚀 Bienvenido a FAQBNB Beta - ¡Acceso Concedido!"
```

---

### `getEmailGreeting()`

**Signature:**
```typescript
function getEmailGreeting(
  emailType: 'accessApproval' | 'accessDenial' | 'betaAccess' | 'registrationReminder',
  language: SupportedLanguage,
  name: string
): string
```

**Parameters:**
- `emailType`: Email template type
- `language`: Target language code
- `name`: Recipient's name

**Returns:** Translated greeting with name

**Example:**
```typescript
const greeting = getEmailGreeting('accessApproval', 'de', 'Hans');
// Returns: "Hallo Hans,"
```

---

### `getEmailFooter()`

**Signature:**
```typescript
function getEmailFooter(
  language: SupportedLanguage
): string
```

**Parameters:**
- `language`: Target language code

**Returns:** Common email footer in requested language

**Example:**
```typescript
const footer = getEmailFooter('nl');
// Returns: "Dit is een geautomatiseerd bericht. Gelieve niet te antwoorden op deze e-mail."
```

---

### `preloadEmailTranslations()`

**Signature:**
```typescript
function preloadEmailTranslations(): void
```

**Parameters:** None

**Returns:** Void

**Purpose:** Warm up translation cache at application startup

**Example:**
```typescript
// In server initialization
if (process.env.NODE_ENV === 'production') {
  preloadEmailTranslations();
}
```

---

## Appendix B: Usage Examples

### Basic Usage

```typescript
import { getEmailTranslation } from '@/lib/email-translations';

// Simple translation
const footer = getEmailTranslation('common.footer', 'fr');

// With variables
const subject = getEmailTranslation(
  'accessApproval.subject',
  'es',
  { accountName: 'Mi Cuenta' }
);

// Multiple variables
const intro = getEmailTranslation(
  'accessApproval.intro',
  'de',
  { accountName: 'Mein Konto' }
);
```

---

### Using Helper Functions

```typescript
import {
  getEmailSubject,
  getEmailGreeting,
  getEmailFooter
} from '@/lib/email-translations';

// Email generation
const language = 'fr';
const subject = getEmailSubject('accessApproval', language, { accountName: 'Test' });
const greeting = getEmailGreeting('accessApproval', language, 'Jean');
const footer = getEmailFooter(language);

const emailBody = `
${greeting}

${getEmailTranslation('accessApproval.intro', language, { accountName: 'Test' })}

${footer}
`;
```

---

### Integration with Email Templates (Future - Task 2I.3)

```typescript
// BEFORE (Task 2I.2 - current state)
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string
): EmailTemplate {
  return {
    subject: `Access Granted: ${accountName} - Your Access Code`,
    body: `Hello ${request.requester_name},\n\nGreat news!...`
  };
}

// AFTER (Task 2I.3 - future state)
export function generateAccessApprovalEmail(
  request: AccessRequest,
  accessCode: string,
  accountName?: string,
  language: SupportedLanguage = 'en'
): EmailTemplate {
  const t = (key: string, vars?: any) =>
    getEmailTranslation(`accessApproval.${key}`, language, vars);

  return {
    subject: t('subject', { accountName }),
    body: `${t('greeting', { name: request.requester_name })}\n\n${t('intro', { accountName })}`
  };
}
```

---

### Error Handling

```typescript
import { getEmailTranslation } from '@/lib/email-translations';

// Missing key - returns key itself
const text1 = getEmailTranslation('nonexistent.key', 'en');
// Returns: 'nonexistent.key'

// Missing translation in requested language - falls back to English
const text2 = getEmailTranslation('accessApproval.subject', 'fr');
// If French translation missing, returns English version

// Invalid language code - falls back to English
const text3 = getEmailTranslation('accessApproval.subject', 'xx' as any);
// Returns English version + logs warning

// Missing variable - leaves placeholder
const text4 = getEmailTranslation(
  'accessApproval.subject',
  'en',
  { /* accountName missing */ }
);
// Returns: "Access Granted: {accountName} - Your Access Code"
```

---

**End of Document**

*Generated by Technical Lead Agent 02 for Epic 2 L10N - Sub-Epic 2I: Email Templates*
