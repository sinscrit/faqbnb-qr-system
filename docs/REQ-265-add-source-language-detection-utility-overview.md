# REQ-265: Implement Source Language Detection Utility - Implementation Overview

**Generated:** 2026-01-18 03:45:00 UTC
**Last Modified:** 2026-01-18 03:45:00 UTC
**Request Reference:** REQ-265 in `/docs/gen_requests_epic3.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.1
**Size:** XS (Extra Small)

---

## Summary

Implement a source language detection utility that determines the appropriate source language for content translation operations. The utility follows a priority chain: explicit override > user's preferred language > account's preferred language > default ('en'). This function serves as the foundational language resolution mechanism used by all content translation triggers when determining which language the original content was written in.

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Type System** | Strict null checks enabled |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Type Definitions | `/src/types/index.ts` | User, Account interfaces |
| Room Utilities | `/src/lib/room-utils.ts` | Object input pattern, null-safe returns |
| Title Generator | `/src/lib/titleGenerator.ts` | Constant maps with type guards |
| Item Type Utils | `/src/lib/item-type-utils.ts` | Value extraction with fallback logic |
| Translation Service Types | `/src/lib/translation-service/translation-service.types.ts` | SupportedLanguage type |

### Dependencies (From Epic 1 - Must Be Complete)

| Dependency | Location | Purpose |
|------------|----------|---------|
| SupportedLanguage type | `/src/lib/translation-service/translation-service.types.ts` | Type for valid language codes |
| User.preferred_language | Database schema | User's language preference column |
| Account.preferred_language | Database schema | Account's language preference column |

---

## Architecture

### Module Structure

```
/src/lib/content-translation/
├── index.ts                           # Barrel exports (update to export source-language)
├── content-translation.ts             # Content translation orchestrator
├── content-translation.types.ts       # Type definitions
├── source-language.ts                 # NEW: Source language detection utility (this task)
├── triggers/
│   ├── item-trigger.ts
│   ├── article-trigger.ts
│   ├── link-trigger.ts
│   └── tag-trigger.ts
└── storage/
    ├── translation-storage.ts
    └── translation-status.ts
```

### Data Flow

```
detectSourceLanguage() called
        │
        ├── 1. Check override parameter
        │       └── If provided and valid → return override
        │
        ├── 2. Check user.preferred_language
        │       └── If user exists and has preference → return user.preferred_language
        │
        ├── 3. Check account.preferred_language
        │       └── If account exists and has preference → return account.preferred_language
        │
        └── 4. Return default: 'en'
```

---

## Core Interfaces

```typescript
// /src/lib/content-translation/source-language.ts

import { SupportedLanguage, SUPPORTED_LANGUAGES } from '@/lib/translation-service';

/**
 * Extended User type with optional preferred_language field
 * This aligns with the database schema from Epic 1
 */
export interface UserWithLanguage {
  id: string;
  email?: string;
  preferred_language?: string | null;
  // Other fields optional for this utility
  [key: string]: unknown;
}

/**
 * Extended Account type with optional preferred_language field
 * This aligns with the database schema from Epic 1
 */
export interface AccountWithLanguage {
  id: string;
  name?: string;
  preferred_language?: string | null;
  // Other fields optional for this utility
  [key: string]: unknown;
}

/**
 * Input parameters for source language detection
 */
export interface SourceLanguageInput {
  /** User object (may be null if not authenticated) */
  user: UserWithLanguage | null;
  /** Account object (may be null if no account context) */
  account: AccountWithLanguage | null;
  /** Explicit language override (highest priority) */
  override?: string | null;
}

/**
 * Default language when no preference is available
 */
export const DEFAULT_SOURCE_LANGUAGE: SupportedLanguage = 'en';
```

### Module Functions

```typescript
/**
 * Determine the source language for content translation based on priority chain.
 *
 * Priority order:
 * 1. Explicit override parameter (if provided and valid)
 * 2. User's preferred_language (if user exists and has preference)
 * 3. Account's preferred_language (if account exists and has preference)
 * 4. Default: 'en' (English)
 *
 * @param input - Object containing user, account, and optional override
 * @returns A valid SupportedLanguage code
 *
 * @example
 * // With explicit override
 * detectSourceLanguage({ user, account, override: 'fr' }); // Returns 'fr'
 *
 * @example
 * // With user preference (no override)
 * const user = { id: '123', preferred_language: 'es' };
 * detectSourceLanguage({ user, account: null }); // Returns 'es'
 *
 * @example
 * // With account preference (no user pref)
 * const account = { id: '456', preferred_language: 'de' };
 * detectSourceLanguage({ user: null, account }); // Returns 'de'
 *
 * @example
 * // Fallback to default
 * detectSourceLanguage({ user: null, account: null }); // Returns 'en'
 */
export function detectSourceLanguage(input: SourceLanguageInput): SupportedLanguage;

/**
 * Type guard to check if a string is a valid SupportedLanguage
 *
 * @param value - String to validate
 * @returns True if the value is a valid language code
 */
export function isValidLanguage(value: string | null | undefined): value is SupportedLanguage;
```

---

## Integration Contract

### Usage Examples

```typescript
// In items API route - using with auth context
import { detectSourceLanguage } from '@/lib/content-translation';

export async function POST(request: NextRequest) {
  const { user, account } = await getAccountContext(request);
  const body = await request.json();

  // Detect source language with optional request override
  const sourceLanguage = detectSourceLanguage({
    user,
    account,
    override: body.sourceLanguage
  });

  // Use in item creation
  const newItem = await createItem({
    ...body,
    source_language: sourceLanguage
  });

  // Queue translations using detected source language
  await queueContentTranslations({
    content: {
      entityType: 'item',
      entityId: newItem.id,
      sourceLanguage, // <-- detected source language
      fields: [...]
    },
    trigger: 'create'
  });
}
```

```typescript
// In article trigger - simplified usage
import { detectSourceLanguage } from '@/lib/content-translation';

export async function triggerArticleTranslation(
  articleId: string,
  user: UserWithLanguage | null,
  account: AccountWithLanguage | null,
  overrideLanguage?: string
): Promise<QueueTranslationResult> {
  const sourceLanguage = detectSourceLanguage({
    user,
    account,
    override: overrideLanguage
  });

  return await queueContentTranslations({
    content: {
      entityType: 'article',
      entityId: articleId,
      sourceLanguage,
      fields: extractArticleFields(articleId)
    },
    trigger: 'create'
  });
}
```

```typescript
// With validation logging
import { detectSourceLanguage, isValidLanguage } from '@/lib/content-translation';

const requestedLanguage = body.sourceLanguage;
if (requestedLanguage && !isValidLanguage(requestedLanguage)) {
  console.warn(`Invalid language code requested: ${requestedLanguage}, will use fallback`);
}

const sourceLanguage = detectSourceLanguage({ user, account, override: requestedLanguage });
```

---

## Implementation Details

### File: `/src/lib/content-translation/source-language.ts`

```typescript
/**
 * Source Language Detection Utility
 *
 * Determines the appropriate source language for content translation
 * by evaluating multiple sources in priority order.
 *
 * @module content-translation/source-language
 */

import { SupportedLanguage, SUPPORTED_LANGUAGES } from '@/lib/translation-service';

// Types
export interface UserWithLanguage {
  id: string;
  email?: string;
  preferred_language?: string | null;
  [key: string]: unknown;
}

export interface AccountWithLanguage {
  id: string;
  name?: string;
  preferred_language?: string | null;
  [key: string]: unknown;
}

export interface SourceLanguageInput {
  user: UserWithLanguage | null;
  account: AccountWithLanguage | null;
  override?: string | null;
}

// Constants
export const DEFAULT_SOURCE_LANGUAGE: SupportedLanguage = 'en';

/**
 * Type guard to validate a language code
 */
export function isValidLanguage(value: string | null | undefined): value is SupportedLanguage {
  if (!value) return false;
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

/**
 * Detect the source language based on priority chain
 */
export function detectSourceLanguage(input: SourceLanguageInput): SupportedLanguage {
  const { user, account, override } = input;

  // Priority 1: Explicit override
  if (override && isValidLanguage(override)) {
    return override;
  }

  // Priority 2: User's preferred language
  if (user?.preferred_language && isValidLanguage(user.preferred_language)) {
    return user.preferred_language;
  }

  // Priority 3: Account's preferred language
  if (account?.preferred_language && isValidLanguage(account.preferred_language)) {
    return account.preferred_language;
  }

  // Priority 4: Default fallback
  return DEFAULT_SOURCE_LANGUAGE;
}
```

### Update: `/src/lib/content-translation/index.ts`

Add export for the new utility:

```typescript
// Existing exports...
export * from './content-translation';
export * from './content-translation.types';

// New export for source language detection
export {
  detectSourceLanguage,
  isValidLanguage,
  DEFAULT_SOURCE_LANGUAGE,
  type UserWithLanguage,
  type AccountWithLanguage,
  type SourceLanguageInput
} from './source-language';
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose | Priority |
|-----------|---------|----------|
| `/src/lib/content-translation/source-language.ts` | Main source language detection module | **Required** |

### Files to Modify

| File Path | Modification | Priority |
|-----------|--------------|----------|
| `/src/lib/content-translation/index.ts` | Add exports for source-language module | **Required** |

### Functions to Implement

| Function | File | Signature |
|----------|------|-----------|
| `detectSourceLanguage` | `source-language.ts` | `(input: SourceLanguageInput) => SupportedLanguage` |
| `isValidLanguage` | `source-language.ts` | `(value: string \| null \| undefined) => value is SupportedLanguage` |

### Types to Define

| Type | File | Description |
|------|------|-------------|
| `UserWithLanguage` | `source-language.ts` | User interface with preferred_language field |
| `AccountWithLanguage` | `source-language.ts` | Account interface with preferred_language field |
| `SourceLanguageInput` | `source-language.ts` | Input parameters for detectSourceLanguage |

### Constants to Define

| Constant | File | Value |
|----------|------|-------|
| `DEFAULT_SOURCE_LANGUAGE` | `source-language.ts` | `'en'` |

---

## Dependencies

### Internal Dependencies

| Module | Import | Purpose |
|--------|--------|---------|
| Translation Service | `@/lib/translation-service` | `SupportedLanguage`, `SUPPORTED_LANGUAGES` |

### External Dependencies

None - this is a pure utility function with no external dependencies.

---

## Acceptance Criteria Checklist

Based on REQ-265 acceptance criteria:

- [ ] A `detectSourceLanguage` function accepts user object, account object, and optional override parameters
- [ ] The function returns a `SupportedLanguage` type representing a valid language code
- [ ] When override parameter is provided and valid, the function returns the override value regardless of other settings
- [ ] When no override is provided, the function checks `user.preferred_language` and returns it if set and valid
- [ ] When no override or user preference exists, the function checks `account.preferred_language` and returns it if set and valid
- [ ] When none of the above are available, the function returns `'en'` as the default language
- [ ] The implementation is located at `/src/lib/content-translation/source-language.ts`
- [ ] The function is properly exported and importable by other application modules
- [ ] The function handles missing or null user/account objects gracefully by falling back appropriately
- [ ] The function validates that returned language codes are valid `SupportedLanguage` values

---

## Testing Strategy

### Unit Tests

```typescript
// /src/lib/content-translation/__tests__/source-language.test.ts

import { detectSourceLanguage, isValidLanguage, DEFAULT_SOURCE_LANGUAGE } from '../source-language';

describe('detectSourceLanguage', () => {
  describe('priority 1: override parameter', () => {
    it('should return override when valid language is provided', () => {
      const result = detectSourceLanguage({
        user: { id: '1', preferred_language: 'es' },
        account: { id: '2', preferred_language: 'de' },
        override: 'fr'
      });
      expect(result).toBe('fr');
    });

    it('should ignore invalid override and fall through', () => {
      const result = detectSourceLanguage({
        user: { id: '1', preferred_language: 'es' },
        account: null,
        override: 'invalid-lang'
      });
      expect(result).toBe('es'); // Falls through to user preference
    });

    it('should ignore null override', () => {
      const result = detectSourceLanguage({
        user: { id: '1', preferred_language: 'es' },
        account: null,
        override: null
      });
      expect(result).toBe('es');
    });
  });

  describe('priority 2: user preferred_language', () => {
    it('should return user language when valid and no override', () => {
      const result = detectSourceLanguage({
        user: { id: '1', preferred_language: 'es' },
        account: { id: '2', preferred_language: 'de' },
        override: undefined
      });
      expect(result).toBe('es');
    });

    it('should skip invalid user language', () => {
      const result = detectSourceLanguage({
        user: { id: '1', preferred_language: 'invalid' },
        account: { id: '2', preferred_language: 'de' }
      });
      expect(result).toBe('de'); // Falls through to account
    });

    it('should skip null user language', () => {
      const result = detectSourceLanguage({
        user: { id: '1', preferred_language: null },
        account: { id: '2', preferred_language: 'de' }
      });
      expect(result).toBe('de');
    });
  });

  describe('priority 3: account preferred_language', () => {
    it('should return account language when user has no preference', () => {
      const result = detectSourceLanguage({
        user: { id: '1' },
        account: { id: '2', preferred_language: 'de' }
      });
      expect(result).toBe('de');
    });

    it('should return account language when user is null', () => {
      const result = detectSourceLanguage({
        user: null,
        account: { id: '2', preferred_language: 'nl' }
      });
      expect(result).toBe('nl');
    });
  });

  describe('priority 4: default fallback', () => {
    it('should return default when all sources are null', () => {
      const result = detectSourceLanguage({
        user: null,
        account: null
      });
      expect(result).toBe(DEFAULT_SOURCE_LANGUAGE);
    });

    it('should return default when all preferences are missing', () => {
      const result = detectSourceLanguage({
        user: { id: '1' },
        account: { id: '2' }
      });
      expect(result).toBe('en');
    });

    it('should return default when all values are invalid', () => {
      const result = detectSourceLanguage({
        user: { id: '1', preferred_language: 'xyz' },
        account: { id: '2', preferred_language: 'abc' },
        override: 'invalid'
      });
      expect(result).toBe('en');
    });
  });
});

describe('isValidLanguage', () => {
  it('should return true for valid language codes', () => {
    expect(isValidLanguage('en')).toBe(true);
    expect(isValidLanguage('fr')).toBe(true);
    expect(isValidLanguage('es')).toBe(true);
    expect(isValidLanguage('de')).toBe(true);
    expect(isValidLanguage('nl')).toBe(true);
    expect(isValidLanguage('it')).toBe(true);
  });

  it('should return false for invalid language codes', () => {
    expect(isValidLanguage('xyz')).toBe(false);
    expect(isValidLanguage('english')).toBe(false);
    expect(isValidLanguage('')).toBe(false);
  });

  it('should return false for null and undefined', () => {
    expect(isValidLanguage(null)).toBe(false);
    expect(isValidLanguage(undefined)).toBe(false);
  });
});
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 types not available | Low | Medium | Validate translation-service module exists before implementation |
| Invalid language codes in database | Low | Low | Validation function handles gracefully, falls back to default |
| User/Account type mismatch | Low | Low | Use flexible interfaces with index signatures |
| Missing preferred_language columns | Medium | Medium | Verify Epic 1 database migrations are complete |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| Implement source-language.ts | 30 minutes | High |
| Update index.ts exports | 5 minutes | High |
| Write unit tests | 30 minutes | High |
| Integration testing | 15 minutes | High |
| **Total** | **~1.5 hours** | High |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 2.1)
- Request: REQ-265 in `/docs/gen_requests_epic3.md`
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
- Existing Utility Patterns: `/src/lib/room-utils.ts`, `/src/lib/titleGenerator.ts`

---

*Document generated for FAQBNB Localization Epic 3 - Dynamic Content Translation*
*Phase 2, Task 2.1: Add source language detection utility*
