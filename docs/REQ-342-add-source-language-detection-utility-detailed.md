# REQ-342: Add Source Language Detection Utility - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-342
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.1
**Size:** S (Small)
**Overview Document:** `/docs/REQ-342-add-source-language-detection-utility-overview.md`

---

## Executive Summary

This document provides granular, actionable implementation tasks for creating a source language detection utility. The utility determines what language content is being created in when translation workflows are triggered, using a priority cascade: explicit override > user's preferred language > account's preferred language > English fallback.

**Primary Deliverable:** `/src/lib/content-translation/source-language.ts`

---

## Prerequisites Checklist

Before starting implementation, verify:

- [x] `SupportedLanguage` type exists in `/src/lib/translation-service/translation-service.types.ts`
- [x] `isSupportedLanguage()` type guard exists in `/src/lib/translation-service/translation-service.types.ts`
- [x] `DEFAULT_LANGUAGE` constant ('en') exists in `/src/lib/translation-service/translation-service.types.ts`
- [x] `users.preferred_language` column exists in database (REQ-225)
- [x] `accounts.preferred_language` column exists in database (REQ-225)
- [x] Database types reflect `preferred_language` fields in `/src/lib/supabase.ts`

---

## Task Breakdown

### Task 1: Create content-translation directory structure
**Estimate:** 5 minutes
**Status:** Not Started

#### Description
Create the content-translation module directory if it doesn't exist. This is the first file in this new module.

#### Implementation Steps

1.1. Check if `/src/lib/content-translation/` directory exists
```bash
ls -la src/lib/content-translation/
```

1.2. If directory does not exist, create it
```bash
mkdir -p src/lib/content-translation
```

#### Verification
- Directory `/src/lib/content-translation/` exists

---

### Task 2: Create source-language.ts file with header
**Estimate:** 10 minutes
**Status:** Not Started

#### Description
Create the main source language detection utility file with proper documentation header and imports.

#### File to Create
`/src/lib/content-translation/source-language.ts`

#### Implementation Steps

2.1. Create the file with the following structure:

```typescript
/**
 * Source Language Detection Utility
 *
 * Determines the source language for content translation using a
 * prioritized cascade of language preference sources.
 *
 * Priority cascade:
 * 1. Explicit override (highest priority)
 * 2. User's preferred_language
 * 3. Account's preferred_language
 * 4. Default language ('en') as fallback
 *
 * REQ-342: Create Source Language Detection Utility
 * Plan-111: L10N Epic 3, Phase 2, Task 2.1
 *
 * @module lib/content-translation/source-language
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import {
  SupportedLanguage,
  isSupportedLanguage,
  DEFAULT_LANGUAGE,
} from '@/lib/translation-service/translation-service.types';
```

#### Verification
- File exists at `/src/lib/content-translation/source-language.ts`
- Imports compile without errors
- TypeScript recognizes the imported types

---

### Task 3: Define input type interfaces
**Estimate:** 10 minutes
**Status:** Not Started

#### Description
Create minimal interfaces for user and account inputs. These interfaces are intentionally minimal to avoid tight coupling to specific type definitions, allowing flexibility in what objects can be passed.

#### Implementation Steps

3.1. Add the following type definitions after the imports in `source-language.ts`:

```typescript
// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Minimal user interface for source language detection.
 * Accepts any object with optional preferred_language field.
 *
 * @remarks
 * Uses a minimal interface pattern to avoid tight coupling to the full
 * User type from the database. Any object with a preferred_language
 * property will work.
 */
export interface SourceLanguageUser {
  /** Optional user identifier for logging/debugging */
  id?: string;
  /** User's preferred language setting (from users.preferred_language) */
  preferred_language?: string | null;
}

/**
 * Minimal account interface for source language detection.
 * Accepts any object with optional preferred_language field.
 *
 * @remarks
 * Uses a minimal interface pattern to avoid tight coupling to the full
 * Account type from the database. Any object with a preferred_language
 * property will work.
 */
export interface SourceLanguageAccount {
  /** Optional account identifier for logging/debugging */
  id?: string;
  /** Account's default preferred language setting (from accounts.preferred_language) */
  preferred_language?: string | null;
}

/**
 * Result type for source language detection with metadata.
 * Includes the detected language and which source it came from.
 */
export interface SourceLanguageResult {
  /** The detected source language */
  language: SupportedLanguage;
  /** Where the language was determined from */
  source: 'override' | 'user' | 'account' | 'default';
}
```

#### Verification
- Types export correctly
- Types can be imported from the module
- No TypeScript errors

---

### Task 4: Implement detectSourceLanguage function
**Estimate:** 15 minutes
**Status:** Not Started

#### Description
Implement the main detection function with the priority cascade logic.

#### Implementation Steps

4.1. Add the main function after the type definitions:

```typescript
// =============================================================================
// Main Function
// =============================================================================

/**
 * Detects the source language for content translation.
 *
 * Uses a priority cascade to determine the appropriate source language:
 * 1. Explicit override (highest priority)
 * 2. User's preferred_language
 * 3. Account's preferred_language
 * 4. Default language ('en') as fallback
 *
 * Each candidate language is validated using isSupportedLanguage() to ensure
 * only valid language codes are returned.
 *
 * @param user - User object with optional preferred_language field, or null
 * @param account - Account object with optional preferred_language field, or null
 * @param override - Optional explicit language override string
 * @returns A valid SupportedLanguage code
 *
 * @example
 * // With explicit override
 * const lang = detectSourceLanguage(user, account, 'fr');
 * // Returns 'fr'
 *
 * @example
 * // User preference takes effect
 * const user = { id: '123', preferred_language: 'de' };
 * const lang = detectSourceLanguage(user, null);
 * // Returns 'de'
 *
 * @example
 * // Account fallback
 * const account = { id: 'acc-1', preferred_language: 'es' };
 * const lang = detectSourceLanguage(null, account);
 * // Returns 'es'
 *
 * @example
 * // Default fallback when nothing set
 * const lang = detectSourceLanguage(null, null);
 * // Returns 'en'
 *
 * @example
 * // Invalid override falls through to user preference
 * const user = { preferred_language: 'de' };
 * const lang = detectSourceLanguage(user, null, 'invalid');
 * // Returns 'de' (override was invalid, so user pref is used)
 */
export function detectSourceLanguage(
  user: SourceLanguageUser | null,
  account: SourceLanguageAccount | null,
  override?: string
): SupportedLanguage {
  // Priority 1: Explicit override (if provided and valid)
  if (override && isSupportedLanguage(override)) {
    return override;
  }

  // Priority 2: User's preferred language (if set and valid)
  if (user?.preferred_language && isSupportedLanguage(user.preferred_language)) {
    return user.preferred_language;
  }

  // Priority 3: Account's preferred language (if set and valid)
  if (account?.preferred_language && isSupportedLanguage(account.preferred_language)) {
    return account.preferred_language;
  }

  // Priority 4: Default fallback
  return DEFAULT_LANGUAGE;
}
```

#### Verification
- Function compiles without errors
- Return type is `SupportedLanguage`
- All code paths return a valid supported language

---

### Task 5: Implement detectSourceLanguageWithMetadata function (optional enhancement)
**Estimate:** 10 minutes
**Status:** Not Started

#### Description
Implement an enhanced version that returns metadata about where the language was detected from. Useful for debugging and logging.

#### Implementation Steps

5.1. Add the enhanced function after `detectSourceLanguage`:

```typescript
/**
 * Detects the source language with metadata about the detection source.
 *
 * Same priority cascade as detectSourceLanguage(), but returns additional
 * information about which source the language was determined from.
 * Useful for debugging and audit logging.
 *
 * @param user - User object with optional preferred_language field, or null
 * @param account - Account object with optional preferred_language field, or null
 * @param override - Optional explicit language override string
 * @returns Object containing the language and its source
 *
 * @example
 * const result = detectSourceLanguageWithMetadata(user, account, 'fr');
 * // Returns { language: 'fr', source: 'override' }
 *
 * @example
 * const result = detectSourceLanguageWithMetadata(null, null);
 * // Returns { language: 'en', source: 'default' }
 */
export function detectSourceLanguageWithMetadata(
  user: SourceLanguageUser | null,
  account: SourceLanguageAccount | null,
  override?: string
): SourceLanguageResult {
  // Priority 1: Explicit override (if provided and valid)
  if (override && isSupportedLanguage(override)) {
    return { language: override, source: 'override' };
  }

  // Priority 2: User's preferred language (if set and valid)
  if (user?.preferred_language && isSupportedLanguage(user.preferred_language)) {
    return { language: user.preferred_language, source: 'user' };
  }

  // Priority 3: Account's preferred language (if set and valid)
  if (account?.preferred_language && isSupportedLanguage(account.preferred_language)) {
    return { language: account.preferred_language, source: 'account' };
  }

  // Priority 4: Default fallback
  return { language: DEFAULT_LANGUAGE, source: 'default' };
}
```

#### Verification
- Function compiles without errors
- Return type is `SourceLanguageResult`
- All code paths return valid result objects

---

### Task 6: Create module index file
**Estimate:** 5 minutes
**Status:** Not Started

#### Description
Create or update the module index file to export all public functions and types.

#### File to Create
`/src/lib/content-translation/index.ts`

#### Implementation Steps

6.1. Create the index file with exports:

```typescript
/**
 * Content Translation Module
 *
 * Provides utilities for managing dynamic content translation in FAQBNB.
 * Part of L10N Epic 3 - Dynamic Content Translation.
 *
 * @module lib/content-translation
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// Source language detection (REQ-342)
export {
  detectSourceLanguage,
  detectSourceLanguageWithMetadata,
  type SourceLanguageUser,
  type SourceLanguageAccount,
  type SourceLanguageResult,
} from './source-language';
```

#### Verification
- Exports are accessible via `import { detectSourceLanguage } from '@/lib/content-translation'`
- All types are properly exported
- No circular dependency issues

---

### Task 7: Write unit tests
**Estimate:** 30 minutes
**Status:** Not Started

#### Description
Create comprehensive unit tests covering all scenarios in the priority cascade and edge cases.

#### File to Create
`/src/lib/content-translation/__tests__/source-language.test.ts`

#### Implementation Steps

7.1. Create the test file:

```typescript
/**
 * Unit tests for Source Language Detection Utility
 * REQ-342: Create Source Language Detection Utility
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { describe, it, expect } from 'vitest';
import {
  detectSourceLanguage,
  detectSourceLanguageWithMetadata,
  SourceLanguageUser,
  SourceLanguageAccount,
} from '../source-language';

describe('detectSourceLanguage', () => {
  describe('Priority 1: Override', () => {
    it('should return override when valid language is provided', () => {
      const user: SourceLanguageUser = { preferred_language: 'de' };
      const account: SourceLanguageAccount = { preferred_language: 'es' };

      expect(detectSourceLanguage(user, account, 'fr')).toBe('fr');
    });

    it('should skip override when invalid language is provided', () => {
      const user: SourceLanguageUser = { preferred_language: 'de' };

      expect(detectSourceLanguage(user, null, 'invalid')).toBe('de');
    });

    it('should skip override when empty string is provided', () => {
      const user: SourceLanguageUser = { preferred_language: 'de' };

      expect(detectSourceLanguage(user, null, '')).toBe('de');
    });

    it('should skip override when unsupported language code is provided', () => {
      const user: SourceLanguageUser = { preferred_language: 'de' };

      // 'ja' is Japanese, not in our supported list
      expect(detectSourceLanguage(user, null, 'ja')).toBe('de');
    });
  });

  describe('Priority 2: User preferred language', () => {
    it('should return user preferred language when no override', () => {
      const user: SourceLanguageUser = { id: 'user-1', preferred_language: 'de' };
      const account: SourceLanguageAccount = { preferred_language: 'es' };

      expect(detectSourceLanguage(user, account)).toBe('de');
    });

    it('should skip user preference when invalid', () => {
      const user: SourceLanguageUser = { preferred_language: 'invalid' };
      const account: SourceLanguageAccount = { preferred_language: 'es' };

      expect(detectSourceLanguage(user, account)).toBe('es');
    });

    it('should skip user preference when null', () => {
      const user: SourceLanguageUser = { preferred_language: null };
      const account: SourceLanguageAccount = { preferred_language: 'es' };

      expect(detectSourceLanguage(user, account)).toBe('es');
    });

    it('should skip user preference when undefined', () => {
      const user: SourceLanguageUser = {};
      const account: SourceLanguageAccount = { preferred_language: 'es' };

      expect(detectSourceLanguage(user, account)).toBe('es');
    });
  });

  describe('Priority 3: Account preferred language', () => {
    it('should return account preferred language when no user preference', () => {
      const account: SourceLanguageAccount = { id: 'acc-1', preferred_language: 'es' };

      expect(detectSourceLanguage(null, account)).toBe('es');
    });

    it('should skip account preference when invalid', () => {
      const account: SourceLanguageAccount = { preferred_language: 'invalid' };

      expect(detectSourceLanguage(null, account)).toBe('en');
    });

    it('should skip account preference when null', () => {
      const account: SourceLanguageAccount = { preferred_language: null };

      expect(detectSourceLanguage(null, account)).toBe('en');
    });

    it('should skip account preference when undefined', () => {
      const account: SourceLanguageAccount = {};

      expect(detectSourceLanguage(null, account)).toBe('en');
    });
  });

  describe('Priority 4: Default fallback', () => {
    it('should return en when nothing is set', () => {
      expect(detectSourceLanguage(null, null)).toBe('en');
    });

    it('should return en when user and account are empty objects', () => {
      expect(detectSourceLanguage({}, {})).toBe('en');
    });

    it('should return en when all preferences are invalid', () => {
      const user: SourceLanguageUser = { preferred_language: 'xyz' };
      const account: SourceLanguageAccount = { preferred_language: 'abc' };

      expect(detectSourceLanguage(user, account, 'invalid')).toBe('en');
    });
  });

  describe('All supported languages', () => {
    const supportedLanguages = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

    it.each(supportedLanguages)('should accept %s as valid override', (lang) => {
      expect(detectSourceLanguage(null, null, lang)).toBe(lang);
    });

    it.each(supportedLanguages)('should accept %s as valid user preference', (lang) => {
      const user: SourceLanguageUser = { preferred_language: lang };
      expect(detectSourceLanguage(user, null)).toBe(lang);
    });

    it.each(supportedLanguages)('should accept %s as valid account preference', (lang) => {
      const account: SourceLanguageAccount = { preferred_language: lang };
      expect(detectSourceLanguage(null, account)).toBe(lang);
    });
  });
});

describe('detectSourceLanguageWithMetadata', () => {
  it('should return override source when override is used', () => {
    const result = detectSourceLanguageWithMetadata(null, null, 'fr');

    expect(result).toEqual({ language: 'fr', source: 'override' });
  });

  it('should return user source when user preference is used', () => {
    const user: SourceLanguageUser = { preferred_language: 'de' };
    const result = detectSourceLanguageWithMetadata(user, null);

    expect(result).toEqual({ language: 'de', source: 'user' });
  });

  it('should return account source when account preference is used', () => {
    const account: SourceLanguageAccount = { preferred_language: 'es' };
    const result = detectSourceLanguageWithMetadata(null, account);

    expect(result).toEqual({ language: 'es', source: 'account' });
  });

  it('should return default source when no preference is set', () => {
    const result = detectSourceLanguageWithMetadata(null, null);

    expect(result).toEqual({ language: 'en', source: 'default' });
  });

  it('should fall through correctly with invalid values', () => {
    const user: SourceLanguageUser = { preferred_language: 'invalid' };
    const account: SourceLanguageAccount = { preferred_language: 'es' };

    const result = detectSourceLanguageWithMetadata(user, account, 'also-invalid');

    expect(result).toEqual({ language: 'es', source: 'account' });
  });
});
```

#### Verification
- All tests pass: `npm test -- src/lib/content-translation/__tests__/source-language.test.ts`
- Test coverage is comprehensive (all code paths covered)
- Tests are isolated and don't depend on external state

---

### Task 8: Verify build and types
**Estimate:** 5 minutes
**Status:** Not Started

#### Description
Ensure the implementation compiles correctly and types are exported properly.

#### Implementation Steps

8.1. Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

8.2. Verify imports work from another file (manual check or add temporary test):
```typescript
// Test import from module
import { detectSourceLanguage, SourceLanguageUser } from '@/lib/content-translation';
```

8.3. Run the full build:
```bash
npm run build
```

#### Verification
- No TypeScript errors
- Build completes successfully
- Module can be imported from `@/lib/content-translation`

---

## Complete Implementation Code

For reference, here is the complete implementation for `/src/lib/content-translation/source-language.ts`:

```typescript
/**
 * Source Language Detection Utility
 *
 * Determines the source language for content translation using a
 * prioritized cascade of language preference sources.
 *
 * Priority cascade:
 * 1. Explicit override (highest priority)
 * 2. User's preferred_language
 * 3. Account's preferred_language
 * 4. Default language ('en') as fallback
 *
 * REQ-342: Create Source Language Detection Utility
 * Plan-111: L10N Epic 3, Phase 2, Task 2.1
 *
 * @module lib/content-translation/source-language
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import {
  SupportedLanguage,
  isSupportedLanguage,
  DEFAULT_LANGUAGE,
} from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Minimal user interface for source language detection.
 * Accepts any object with optional preferred_language field.
 *
 * @remarks
 * Uses a minimal interface pattern to avoid tight coupling to the full
 * User type from the database. Any object with a preferred_language
 * property will work.
 */
export interface SourceLanguageUser {
  /** Optional user identifier for logging/debugging */
  id?: string;
  /** User's preferred language setting (from users.preferred_language) */
  preferred_language?: string | null;
}

/**
 * Minimal account interface for source language detection.
 * Accepts any object with optional preferred_language field.
 *
 * @remarks
 * Uses a minimal interface pattern to avoid tight coupling to the full
 * Account type from the database. Any object with a preferred_language
 * property will work.
 */
export interface SourceLanguageAccount {
  /** Optional account identifier for logging/debugging */
  id?: string;
  /** Account's default preferred language setting (from accounts.preferred_language) */
  preferred_language?: string | null;
}

/**
 * Result type for source language detection with metadata.
 * Includes the detected language and which source it came from.
 */
export interface SourceLanguageResult {
  /** The detected source language */
  language: SupportedLanguage;
  /** Where the language was determined from */
  source: 'override' | 'user' | 'account' | 'default';
}

// =============================================================================
// Main Functions
// =============================================================================

/**
 * Detects the source language for content translation.
 *
 * Uses a priority cascade to determine the appropriate source language:
 * 1. Explicit override (highest priority)
 * 2. User's preferred_language
 * 3. Account's preferred_language
 * 4. Default language ('en') as fallback
 *
 * Each candidate language is validated using isSupportedLanguage() to ensure
 * only valid language codes are returned.
 *
 * @param user - User object with optional preferred_language field, or null
 * @param account - Account object with optional preferred_language field, or null
 * @param override - Optional explicit language override string
 * @returns A valid SupportedLanguage code
 *
 * @example
 * // With explicit override
 * const lang = detectSourceLanguage(user, account, 'fr');
 * // Returns 'fr'
 *
 * @example
 * // User preference takes effect
 * const user = { id: '123', preferred_language: 'de' };
 * const lang = detectSourceLanguage(user, null);
 * // Returns 'de'
 *
 * @example
 * // Account fallback
 * const account = { id: 'acc-1', preferred_language: 'es' };
 * const lang = detectSourceLanguage(null, account);
 * // Returns 'es'
 *
 * @example
 * // Default fallback when nothing set
 * const lang = detectSourceLanguage(null, null);
 * // Returns 'en'
 */
export function detectSourceLanguage(
  user: SourceLanguageUser | null,
  account: SourceLanguageAccount | null,
  override?: string
): SupportedLanguage {
  // Priority 1: Explicit override (if provided and valid)
  if (override && isSupportedLanguage(override)) {
    return override;
  }

  // Priority 2: User's preferred language (if set and valid)
  if (user?.preferred_language && isSupportedLanguage(user.preferred_language)) {
    return user.preferred_language;
  }

  // Priority 3: Account's preferred language (if set and valid)
  if (account?.preferred_language && isSupportedLanguage(account.preferred_language)) {
    return account.preferred_language;
  }

  // Priority 4: Default fallback
  return DEFAULT_LANGUAGE;
}

/**
 * Detects the source language with metadata about the detection source.
 *
 * Same priority cascade as detectSourceLanguage(), but returns additional
 * information about which source the language was determined from.
 * Useful for debugging and audit logging.
 *
 * @param user - User object with optional preferred_language field, or null
 * @param account - Account object with optional preferred_language field, or null
 * @param override - Optional explicit language override string
 * @returns Object containing the language and its source
 *
 * @example
 * const result = detectSourceLanguageWithMetadata(user, account, 'fr');
 * // Returns { language: 'fr', source: 'override' }
 *
 * @example
 * const result = detectSourceLanguageWithMetadata(null, null);
 * // Returns { language: 'en', source: 'default' }
 */
export function detectSourceLanguageWithMetadata(
  user: SourceLanguageUser | null,
  account: SourceLanguageAccount | null,
  override?: string
): SourceLanguageResult {
  // Priority 1: Explicit override (if provided and valid)
  if (override && isSupportedLanguage(override)) {
    return { language: override, source: 'override' };
  }

  // Priority 2: User's preferred language (if set and valid)
  if (user?.preferred_language && isSupportedLanguage(user.preferred_language)) {
    return { language: user.preferred_language, source: 'user' };
  }

  // Priority 3: Account's preferred language (if set and valid)
  if (account?.preferred_language && isSupportedLanguage(account.preferred_language)) {
    return { language: account.preferred_language, source: 'account' };
  }

  // Priority 4: Default fallback
  return { language: DEFAULT_LANGUAGE, source: 'default' };
}
```

---

## Acceptance Criteria Verification

| Criterion | Task | How to Verify |
|-----------|------|---------------|
| Utility accepts user object, account object, and optional override | Task 4 | Function signature includes all three parameters |
| Returns a valid supported language code | Task 4 | Return type is `SupportedLanguage`, validated by `isSupportedLanguage()` |
| Override parameter takes highest priority | Task 4, Task 7 | Unit test: override beats user and account |
| User preferred language used if no override | Task 4, Task 7 | Unit test: user preference used when no override |
| Account preferred language used if neither override nor user pref | Task 4, Task 7 | Unit test: account preference used as fallback |
| English ('en') returned when no other source | Task 4, Task 7 | Unit test: returns 'en' with null inputs |
| Handles missing or null values gracefully | Task 4, Task 7 | Unit tests for null/undefined/empty at each level |

---

## Testing Commands

```bash
# Run unit tests for this module
npm test -- src/lib/content-translation/__tests__/source-language.test.ts

# Run tests with coverage
npm test -- --coverage src/lib/content-translation/

# Type check
npx tsc --noEmit

# Full build verification
npm run build
```

---

## Integration Notes

### Consumers of this Utility

After implementation, this utility will be used by:

| Consumer | File | Usage |
|----------|------|-------|
| Items API POST | `/src/app/api/admin/items/route.ts` | Detect source language when creating items |
| Items API PUT | `/src/app/api/admin/items/[id]/route.ts` | Detect source language when updating items |
| Articles API POST | `/src/app/api/admin/articles/route.ts` | Detect source language when creating articles |
| Articles API PUT | `/src/app/api/admin/articles/[id]/route.ts` | Detect source language when updating articles |
| Links API handlers | `/src/app/api/admin/items/[id]/links/route.ts` | Detect source language for link translations |

### Usage Pattern in API Routes

```typescript
import { detectSourceLanguage } from '@/lib/content-translation';
import { getUser, getAccount } from './helpers'; // hypothetical

// In POST handler:
const user = await getUser(userId);
const account = await getAccount(accountId);
const sourceLanguage = detectSourceLanguage(user, account, body.sourceLanguage);

// Use sourceLanguage when queueing translations
await queueContentTranslations({
  content: {
    entityType: 'item',
    entityId: newItem.id,
    sourceLanguage, // <-- detected language
    fields: [...]
  },
  trigger: 'create'
});
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Invalid language codes passed | Type guard `isSupportedLanguage()` validates at each priority level |
| Database columns not populated | Graceful fallback to default ('en') |
| Type mismatch with User/Account | Minimal interface pattern avoids tight coupling |
| Future language additions | Uses `SupportedLanguage` type from central types file |

---

## Files Changed Summary

| File | Action | Purpose |
|------|--------|---------|
| `/src/lib/content-translation/source-language.ts` | CREATE | Main utility file |
| `/src/lib/content-translation/index.ts` | CREATE | Module exports |
| `/src/lib/content-translation/__tests__/source-language.test.ts` | CREATE | Unit tests |

---

## References

- **Overview Document:** `/docs/REQ-342-add-source-language-detection-utility-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-342)
- **Translation Service Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Database Types:** `/src/lib/supabase.ts`

---

*Document generated for FAQBNB L10N Epic 3 - Dynamic Content Translation*
*Task: Phase 2.1 - Add Source Language Detection Utility*
