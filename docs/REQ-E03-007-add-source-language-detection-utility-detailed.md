# Detailed Task Breakdown: REQ-E03-007 - Add Source Language Detection Utility

**Request ID:** REQ-E03-007
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.1
**Type:** NEW FEATURE
**Size:** S (Small)
**Created:** 2026-01-20
**Last Modified:** 2026-01-21 03:36 UTC
**Status:** ✅ COMPLETE - All tasks verified and tested

---

## Document References

| Document | Path |
|----------|------|
| Request Definition | `/docs/gen_requests_epic3.md` (REQ-E03-007) |
| Overview Document | `/docs/REQ-E03-007-add-source-language-detection-utility-overview.md` |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 2.1) |
| Translation Service Types | `/src/lib/translation-service/translation-service.types.ts` |
| Database Types | `/src/lib/supabase.ts` |

---

## Summary

Create a utility function that determines the source language for content translation by evaluating multiple language sources in a defined priority order: explicit override > user preferred language > account preferred language > English default. This provides a standardized mechanism for all content APIs to determine the source language when triggering translations.

---

## Prerequisites

Before implementing this task, verify:

1. **Epic 1 Infrastructure Complete:**
   - [x] `SupportedLanguage` type exists at `/src/lib/translation-service/translation-service.types.ts:22`
   - [x] `isSupportedLanguage()` function exists at `/src/lib/translation-service/translation-service.types.ts:546`
   - [x] `DEFAULT_LANGUAGE` constant exists at `/src/lib/translation-service/translation-service.types.ts:529`

2. **Database Columns Present:**
   - [x] `users.preferred_language` column exists (REQ-225)
   - [x] `accounts.preferred_language` column exists (REQ-225)

3. **Module Directory:**
   - [x] `/src/lib/content-translation/` directory exists (or will be created)

---

## Task Breakdown

### Task 1: Create Source Language Detection Module File

**File:** `/src/lib/content-translation/source-language.ts`
**Action:** CREATE
**Size:** XS
**Priority:** Required

**Instructions:**

1. Create the file `/src/lib/content-translation/source-language.ts`
2. Add file header comment with module purpose
3. Add imports for dependencies from translation-service types

**Code to Implement:**

```typescript
/**
 * Source Language Detection Utility
 * Part of REQ-E03-007: Add Source Language Detection Utility
 *
 * Determines the source language for content translation by evaluating
 * multiple language sources in a defined priority order.
 *
 * @module content-translation/source-language
 * @created 2026-01-20
 */

import {
  SupportedLanguage,
  isSupportedLanguage,
  DEFAULT_LANGUAGE
} from '@/lib/translation-service/translation-service.types';
```

**Verification:**
- [x] File exists at `/src/lib/content-translation/source-language.ts`
- [x] Imports resolve without TypeScript errors

---implemented: Created module file with header, imports from translation-service.types including SupportedLanguage, isSupportedLanguage, DEFAULT_LANGUAGE--- -unit tested- ---ts-check: passed (0 errors in target)---

---

### Task 2: Define TypeScript Interfaces

**File:** `/src/lib/content-translation/source-language.ts`
**Action:** APPEND
**Size:** XS
**Priority:** Required

**Instructions:**

Add type definitions for input parameters. Use minimal interfaces that accept partial objects to avoid tight coupling with full User/Account types.

**Code to Implement:**

```typescript
// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Minimal User interface for source language detection.
 * Accepts the full User type or any object with preferred_language.
 * Intentionally minimal to avoid tight coupling with database types.
 */
export interface UserForLanguageDetection {
  preferred_language?: string | null;
}

/**
 * Minimal Account interface for source language detection.
 * Accepts the full Account type or any object with preferred_language.
 * Intentionally minimal to avoid tight coupling with database types.
 */
export interface AccountForLanguageDetection {
  preferred_language?: string | null;
}

/**
 * Options for source language detection.
 * All parameters are optional - function handles missing values gracefully.
 */
export interface DetectSourceLanguageOptions {
  /** User context with language preference */
  user?: UserForLanguageDetection | null;
  /** Account context with language preference */
  account?: AccountForLanguageDetection | null;
  /** Explicit language override (highest priority) */
  override?: string | null;
}
```

**Verification:**
- [x] All three interfaces are defined
- [x] TypeScript compilation succeeds
- [x] Interfaces are exported

---implemented: Defined UserForLanguageDetection, AccountForLanguageDetection, DetectSourceLanguageOptions interfaces with proper JSDoc comments--- -unit tested- ---ts-check: passed (0 errors in target)---

---

### Task 3: Implement Main Detection Function

**File:** `/src/lib/content-translation/source-language.ts`
**Action:** APPEND
**Size:** S
**Priority:** Required

**Instructions:**

Implement the main `detectSourceLanguage()` function with options-based signature. This is the primary function that implements the priority logic.

**Code to Implement:**

```typescript
// ============================================================================
// Main Detection Function
// ============================================================================

/**
 * Determines the source language for content translation by evaluating
 * multiple language sources in priority order.
 *
 * Priority Order:
 * 1. override parameter (if valid supported language)
 * 2. user.preferred_language (if valid supported language)
 * 3. account.preferred_language (if valid supported language)
 * 4. DEFAULT_LANGUAGE ('en') as ultimate fallback
 *
 * Invalid or unsupported language values are silently ignored and
 * evaluation continues to the next priority level.
 *
 * @param options - Object containing user, account, and optional override
 * @returns A validated SupportedLanguage code (guaranteed to be valid)
 *
 * @example
 * // With explicit override
 * detectSourceLanguage({ override: 'fr' }); // Returns 'fr'
 *
 * @example
 * // With user preference
 * detectSourceLanguage({ user: { preferred_language: 'es' } }); // Returns 'es'
 *
 * @example
 * // With account fallback
 * detectSourceLanguage({
 *   user: { preferred_language: null },
 *   account: { preferred_language: 'de' }
 * }); // Returns 'de'
 *
 * @example
 * // Default fallback
 * detectSourceLanguage({}); // Returns 'en'
 *
 * @example
 * // Invalid override falls through to next priority
 * detectSourceLanguage({
 *   override: 'invalid',
 *   user: { preferred_language: 'fr' }
 * }); // Returns 'fr'
 */
export function detectSourceLanguage(
  options: DetectSourceLanguageOptions = {}
): SupportedLanguage {
  const { user, account, override } = options;

  // Priority 1: Explicit override (highest priority)
  // Only use if provided and is a valid supported language
  if (override && isSupportedLanguage(override)) {
    return override;
  }

  // Priority 2: User preferred language
  // Use optional chaining to handle null/undefined user objects
  const userLang = user?.preferred_language;
  if (userLang && isSupportedLanguage(userLang)) {
    return userLang;
  }

  // Priority 3: Account preferred language
  // Use optional chaining to handle null/undefined account objects
  const accountLang = account?.preferred_language;
  if (accountLang && isSupportedLanguage(accountLang)) {
    return accountLang;
  }

  // Priority 4: Default fallback (English)
  // This ensures we always return a valid SupportedLanguage
  return DEFAULT_LANGUAGE;
}
```

**Verification:**
- [x] Function is exported
- [x] Return type is `SupportedLanguage`
- [x] All four priority levels are implemented
- [x] Function handles null/undefined gracefully
- [x] JSDoc documentation is complete with examples

---implemented: detectSourceLanguage() function with options-based signature, implements priority cascade (override > user > account > default)--- -unit tested- ---ts-check: passed (0 errors in target)---

---

### Task 4: Implement Alternative Signature Wrapper

**File:** `/src/lib/content-translation/source-language.ts`
**Action:** APPEND
**Size:** XS
**Priority:** Required

**Instructions:**

Implement the alternative `detectSourceLanguageFromContext()` function that matches the signature specified in Plan-111. This provides backward compatibility and a more explicit API for content APIs.

**Code to Implement:**

```typescript
// ============================================================================
// Alternative Signature (Plan-111 Compatibility)
// ============================================================================

/**
 * Alternative signature matching the Plan-111 specification.
 * Wraps the options-based function for API consistency with positional parameters.
 *
 * This function provides the signature:
 * `detectSourceLanguage(user: User, account: Account, override?: string)`
 * as specified in the implementation plan.
 *
 * @param user - User object with preferred_language (or null/undefined)
 * @param account - Account object with preferred_language (or null/undefined)
 * @param override - Explicit language override (optional)
 * @returns A validated SupportedLanguage code
 *
 * @example
 * // From API route with full context
 * const sourceLanguage = detectSourceLanguageFromContext(
 *   currentUser,
 *   currentAccount,
 *   body.sourceLanguage
 * );
 *
 * @example
 * // With only user context
 * const sourceLanguage = detectSourceLanguageFromContext(user, null);
 *
 * @example
 * // With override only
 * const sourceLanguage = detectSourceLanguageFromContext(null, null, 'fr');
 */
export function detectSourceLanguageFromContext(
  user: UserForLanguageDetection | null | undefined,
  account: AccountForLanguageDetection | null | undefined,
  override?: string
): SupportedLanguage {
  return detectSourceLanguage({ user, account, override });
}
```

**Verification:**
- [x] Function is exported
- [x] Function accepts positional parameters matching Plan-111 spec
- [x] Function delegates to main `detectSourceLanguage()` function
- [x] JSDoc documentation includes usage examples

---implemented: detectSourceLanguageFromContext() wrapper function with positional parameters (user, account, override) for Plan-111 compatibility--- -unit tested- ---ts-check: passed (0 errors in target)---

---

### Task 5: Create or Update Module Barrel Exports

**File:** `/src/lib/content-translation/index.ts`
**Action:** CREATE or UPDATE
**Size:** XS
**Priority:** Required

**Instructions:**

Create the barrel export file if it doesn't exist, or update it to include exports from the new source-language module.

**Code to Implement (if creating new file):**

```typescript
/**
 * Content Translation Module
 * Exports all content translation utilities for FAQBNB.
 *
 * @module content-translation
 * @created 2026-01-20
 */

// Source language detection
export {
  detectSourceLanguage,
  detectSourceLanguageFromContext,
  type UserForLanguageDetection,
  type AccountForLanguageDetection,
  type DetectSourceLanguageOptions,
} from './source-language';
```

**Code to Add (if updating existing file):**

```typescript
// Source language detection (REQ-E03-007)
export {
  detectSourceLanguage,
  detectSourceLanguageFromContext,
  type UserForLanguageDetection,
  type AccountForLanguageDetection,
  type DetectSourceLanguageOptions,
} from './source-language';
```

**Verification:**
- [x] File exists at `/src/lib/content-translation/index.ts`
- [x] All exports are properly listed
- [x] Types are exported with `type` keyword for clarity
- [x] Import from `@/lib/content-translation` works

---implemented: Updated existing index.ts barrel exports to include detectSourceLanguage, detectSourceLanguageFromContext functions and type exports--- -unit tested- ---ts-check: passed (0 errors in target)---

---

### Task 6: Verify TypeScript Compilation

**Action:** VERIFICATION
**Size:** XS
**Priority:** Required

**Instructions:**

Run TypeScript compilation to ensure no type errors exist.

**Commands to Run:**

```bash
# From project root
npm run build

# Or for TypeScript check only
npx tsc --noEmit
```

**Verification:**
- [x] No TypeScript errors related to source-language.ts
- [x] No TypeScript errors related to index.ts exports
- [x] Imports from `@/lib/content-translation` resolve correctly

---implemented: TypeScript compilation verified - 0 errors in source-language.ts and content-translation/index.ts. Build passes successfully.--- -unit tested- ---ts-check: passed (0 errors in target, baseline 16 errors in unrelated .next/types/)---

---

### Task 7: Create Unit Tests (Optional but Recommended)

**File:** `/src/lib/content-translation/__tests__/source-language.test.ts`
**Action:** CREATE (Optional)
**Size:** S
**Priority:** Optional (defer to Phase 7)

**Instructions:**

If tests are being created now, implement the following test cases. Otherwise, this task can be deferred to Phase 7 (Testing & Validation).

**Test Cases to Cover:**

```typescript
import {
  detectSourceLanguage,
  detectSourceLanguageFromContext,
} from '../source-language';

describe('detectSourceLanguage', () => {
  describe('Override Priority Tests', () => {
    it('returns override when valid', () => {
      expect(detectSourceLanguage({ override: 'fr' })).toBe('fr');
    });

    it('override beats user preference', () => {
      expect(detectSourceLanguage({
        override: 'fr',
        user: { preferred_language: 'es' }
      })).toBe('fr');
    });

    it('invalid override falls through to user preference', () => {
      expect(detectSourceLanguage({
        override: 'invalid',
        user: { preferred_language: 'es' }
      })).toBe('es');
    });

    it('empty override falls through', () => {
      expect(detectSourceLanguage({
        override: '',
        user: { preferred_language: 'de' }
      })).toBe('de');
    });
  });

  describe('User Preference Tests', () => {
    it('returns user preference when no override', () => {
      expect(detectSourceLanguage({
        user: { preferred_language: 'de' }
      })).toBe('de');
    });

    it('user preference beats account preference', () => {
      expect(detectSourceLanguage({
        user: { preferred_language: 'de' },
        account: { preferred_language: 'fr' }
      })).toBe('de');
    });

    it('invalid user preference falls through to account', () => {
      expect(detectSourceLanguage({
        user: { preferred_language: 'invalid' },
        account: { preferred_language: 'fr' }
      })).toBe('fr');
    });
  });

  describe('Account Preference Tests', () => {
    it('returns account preference when no user preference', () => {
      expect(detectSourceLanguage({
        account: { preferred_language: 'nl' }
      })).toBe('nl');
    });

    it('null user falls through to account', () => {
      expect(detectSourceLanguage({
        user: null,
        account: { preferred_language: 'it' }
      })).toBe('it');
    });
  });

  describe('Default Fallback Tests', () => {
    it('returns English for empty options', () => {
      expect(detectSourceLanguage({})).toBe('en');
    });

    it('returns English when all values are null', () => {
      expect(detectSourceLanguage({
        user: null,
        account: null,
        override: null
      })).toBe('en');
    });

    it('returns English when preferred_language is undefined', () => {
      expect(detectSourceLanguage({
        user: {},
        account: {}
      })).toBe('en');
    });
  });

  describe('All Supported Languages', () => {
    it.each(['en', 'fr', 'es', 'de', 'nl', 'it'])('accepts %s as override', (lang) => {
      expect(detectSourceLanguage({ override: lang })).toBe(lang);
    });
  });
});

describe('detectSourceLanguageFromContext', () => {
  it('delegates to detectSourceLanguage', () => {
    expect(detectSourceLanguageFromContext(
      { preferred_language: 'fr' },
      null,
      undefined
    )).toBe('fr');
  });

  it('accepts null parameters', () => {
    expect(detectSourceLanguageFromContext(null, null)).toBe('en');
  });

  it('override takes priority', () => {
    expect(detectSourceLanguageFromContext(
      { preferred_language: 'fr' },
      { preferred_language: 'de' },
      'es'
    )).toBe('es');
  });
});
```

**Verification:**
- [x] All test cases pass (53 tests)
- [x] Coverage includes all priority levels
- [x] Edge cases are covered

---implemented: Created comprehensive test suite with 53 test cases covering: override priority, user preference, account preference, default fallback, all supported languages, edge cases, and alternative signature function--- -unit tested- ---ts-check: passed (0 errors in target)---

---

## Complete File Structure After Implementation

```
/src/lib/content-translation/
├── index.ts                    # Module barrel exports
└── source-language.ts          # Source language detection (this task)
```

**Note:** Additional files (content-translation.ts, triggers/, storage/) will be created by other tasks in Epic 3.

---

## Acceptance Criteria Checklist

| # | Criteria | Task |
|---|----------|------|
| 1 | Function exists with signature accepting user object, account object, and optional override | Task 3, Task 4 |
| 2 | Function returns a supported language code type (not a freeform string) | Task 3 |
| 3 | Function evaluates override parameter first and returns immediately if valid | Task 3 |
| 4 | Function evaluates user preferred language second if override is not provided | Task 3 |
| 5 | Function evaluates account preferred language third | Task 3 |
| 6 | Function returns English ('en') as default if no preferences are set | Task 3 |
| 7 | Function validates that returned language code is in supported languages list | Task 3 |
| 8 | Function handles null or undefined user/account objects gracefully | Task 3 |
| 9 | Function handles invalid override values by falling back to next priority level | Task 3 |
| 10 | TypeScript types are properly defined for all parameters and return values | Task 2 |
| 11 | Function is exported from the content translation module | Task 5 |

---

## Integration Points

### Downstream Usage (Future Tasks)

This utility will be used by the following tasks:

1. **Task 2.2 - Modify Items API** (`/src/app/api/admin/items/route.ts`)
   ```typescript
   import { detectSourceLanguage } from '@/lib/content-translation';

   // In POST handler
   const sourceLanguage = detectSourceLanguage({
     user: currentUser,
     account: currentAccount,
     override: body.sourceLanguage
   });
   ```

2. **Task 2.3 - Modify Articles API** (`/src/app/api/admin/articles/route.ts`)
   ```typescript
   import { detectSourceLanguageFromContext } from '@/lib/content-translation';

   // In POST handler
   const sourceLanguage = detectSourceLanguageFromContext(
     currentUser,
     currentAccount,
     body.sourceLanguage
   );
   ```

3. **Task 2.4 - Create/Modify Links API** (`/src/app/api/admin/items/[id]/links/route.ts`)
   - Same pattern as Items and Articles APIs

---

## Dependencies

### Required Imports

| Import | Source | Purpose |
|--------|--------|---------|
| `SupportedLanguage` | `@/lib/translation-service/translation-service.types` | Return type |
| `isSupportedLanguage` | `@/lib/translation-service/translation-service.types` | Validation function |
| `DEFAULT_LANGUAGE` | `@/lib/translation-service/translation-service.types` | Fallback constant |

### Database Types Reference (Read Only)

| Type | Source | Fields Used |
|------|--------|-------------|
| User | `/src/lib/supabase.ts:194` | `preferred_language: string \| null` |
| Account | `/src/lib/supabase.ts:56` | `preferred_language: string \| null` |

---

## Notes

1. **Type Safety:** The function uses the `isSupportedLanguage()` type guard to ensure only valid language codes are returned. This provides both compile-time and runtime safety.

2. **Minimal Interfaces:** The `UserForLanguageDetection` and `AccountForLanguageDetection` interfaces are intentionally minimal, only requiring the `preferred_language` field. This allows the function to accept:
   - Full User/Account objects from the database
   - Partial objects from API requests
   - Simple test objects

3. **Error Handling:** The function never throws errors. Invalid inputs simply cause the evaluation to continue to the next priority level, ultimately falling back to `DEFAULT_LANGUAGE` ('en').

4. **Logging:** Consider adding debug logging in development to trace which priority level was used. This can help with debugging translation issues.

---

## Estimated Effort

| Task | Effort |
|------|--------|
| Task 1: Create module file | 5 min |
| Task 2: Define TypeScript interfaces | 10 min |
| Task 3: Implement main detection function | 15 min |
| Task 4: Implement alternative signature wrapper | 5 min |
| Task 5: Create/update barrel exports | 5 min |
| Task 6: Verify TypeScript compilation | 5 min |
| Task 7: Create unit tests (optional) | 30 min |
| **Total (without tests)** | **~45 min** |
| **Total (with tests)** | **~75 min** |

---

*Task breakdown generated for REQ-E03-007 - Add Source Language Detection Utility*
*Part of Epic 3: Dynamic Content Translation*

---

## Implementation Summary (2026-01-21)

### Final Verification Results

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript Compilation | ✅ PASSED | 0 errors in target modules |
| Build | ✅ PASSED | Next.js build completed successfully |
| Unit Tests | ✅ PASSED | 53/53 tests passing |
| Acceptance Criteria | ✅ ALL MET | All 11 criteria verified |

### Files Created/Modified

1. `/src/lib/content-translation/source-language.ts` - Main utility module
2. `/src/lib/content-translation/index.ts` - Updated barrel exports
3. `/src/lib/content-translation/__tests__/source-language.test.ts` - Unit tests

### Test Results

```
✓ src/lib/content-translation/__tests__/source-language.test.ts (53 tests) 41ms
Test Files  1 passed (1)
Tests       53 passed (53)
```

### Notes

- All pre-existing TypeScript errors (16-17) are in `.next/types/` auto-generated files, unrelated to this implementation
- Implementation follows existing code patterns and conventions
- Ready for downstream usage in Tasks 2.2, 2.3, and 2.4
