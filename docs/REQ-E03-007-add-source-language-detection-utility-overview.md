# Implementation Overview: REQ-E03-007 - Add Source Language Detection Utility

**Request ID:** REQ-E03-007
**Epic:** Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.1
**Type:** NEW FEATURE
**Size:** S
**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Summary

Implement a utility function that determines the source language for content translation by evaluating multiple language sources in a defined priority order: explicit override > user preferred language > account preferred language > English default. This function provides a single source of truth for source language detection across all content creation and update flows.

---

## Background & Context

### Current State

The codebase has implemented language preference infrastructure in Epic 1:
- Users have a `preferred_language` column in the `users` table (REQ-225)
- Accounts have a `preferred_language` column in the `accounts` table (REQ-225)
- Language detection utilities exist in `/src/lib/i18n/language-detection.ts` for guest/UI language detection
- The `SupportedLanguage` type is defined in the translation service types

However, there is no standardized mechanism for determining which language should be used as the **source** when initiating content translations. Content APIs lack a consistent way to identify the original language of user-created content.

### Existing Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| `SupportedLanguage` type | `/src/lib/translation-service/translation-service.types.ts:22` | Implemented |
| `isSupportedLanguage()` guard | `/src/lib/translation-service/translation-service.types.ts:546` | Implemented |
| `DEFAULT_LANGUAGE` constant | `/src/lib/translation-service/translation-service.types.ts:529` | Implemented (`'en'`) |
| User `preferred_language` | `/src/lib/supabase.ts:197` (Database types) | Implemented |
| Account `preferred_language` | `/src/lib/supabase.ts:59` (Database types) | Implemented |
| Guest language detection | `/src/lib/i18n/language-detection.ts` | Implemented (different purpose) |

### Problem Statement

1. When content is created or updated, there is no consistent way to determine the source language
2. Content APIs need to record the source language for translation jobs, but lack a standard utility
3. Different API endpoints might implement inconsistent logic for determining source language
4. The priority order (override > user > account > default) needs to be implemented consistently

### Solution Approach

Create a dedicated source language detection utility in `/src/lib/content-translation/source-language.ts` that:
- Accepts user context, account context, and optional override parameter
- Evaluates sources in strict priority order
- Returns a validated `SupportedLanguage` code
- Handles null/undefined values gracefully
- Provides a single source of truth for all content APIs

---

## Technical Design

### Architecture Position

```
/src/lib/content-translation/
├── index.ts                          # Module exports (UPDATE)
├── content-translation.types.ts      # Types (existing)
├── content-translation.ts            # Orchestrator (existing)
├── source-language.ts                # NEW - This task
├── triggers/                         # Entity triggers
│   ├── item-trigger.ts
│   ├── article-trigger.ts
│   ├── link-trigger.ts
│   └── tag-trigger.ts
└── storage/
    ├── translation-storage.ts
    └── translation-status.ts
```

### Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `SupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` | Return type |
| `isSupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` | Validation |
| `DEFAULT_LANGUAGE` | `/src/lib/translation-service/translation-service.types.ts` | Fallback constant |

### Database Schema Reference

**Users Table (`users`):**
```sql
preferred_language: string | null  -- ISO 639-1 language code (e.g., 'en', 'fr', 'es')
```

**Accounts Table (`accounts`):**
```sql
preferred_language: string | null  -- ISO 639-1 language code
```

---

## Interface Contracts

### Input Types

```typescript
/**
 * Minimal User interface for source language detection.
 * Accepts the full User type or any object with preferred_language.
 */
export interface UserForLanguageDetection {
  preferred_language?: string | null;
}

/**
 * Minimal Account interface for source language detection.
 * Accepts the full Account type or any object with preferred_language.
 */
export interface AccountForLanguageDetection {
  preferred_language?: string | null;
}

/**
 * Options for source language detection.
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

### Function Signature

```typescript
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
 * @param options - Object containing user, account, and optional override
 * @returns A validated SupportedLanguage code
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
 * // Invalid override falls through
 * detectSourceLanguage({
 *   override: 'invalid',
 *   user: { preferred_language: 'fr' }
 * }); // Returns 'fr'
 */
export function detectSourceLanguage(
  options: DetectSourceLanguageOptions = {}
): SupportedLanguage;
```

### Alternative Function Signature (Direct Parameters)

For backward compatibility with the implementation plan specification:

```typescript
/**
 * Alternative signature matching Plan-111 specification.
 * Wraps the options-based function for API consistency.
 *
 * @param user - User object with preferred_language
 * @param account - Account object with preferred_language
 * @param override - Explicit language override
 * @returns A validated SupportedLanguage code
 */
export function detectSourceLanguageFromContext(
  user: UserForLanguageDetection | null | undefined,
  account: AccountForLanguageDetection | null | undefined,
  override?: string
): SupportedLanguage;
```

---

## Implementation Details

### Priority Logic Implementation

```typescript
import {
  SupportedLanguage,
  isSupportedLanguage,
  DEFAULT_LANGUAGE
} from '@/lib/translation-service/translation-service.types';

export function detectSourceLanguage(
  options: DetectSourceLanguageOptions = {}
): SupportedLanguage {
  const { user, account, override } = options;

  // Priority 1: Explicit override (highest priority)
  if (override && isSupportedLanguage(override)) {
    return override;
  }

  // Priority 2: User preferred language
  const userLang = user?.preferred_language;
  if (userLang && isSupportedLanguage(userLang)) {
    return userLang;
  }

  // Priority 3: Account preferred language
  const accountLang = account?.preferred_language;
  if (accountLang && isSupportedLanguage(accountLang)) {
    return accountLang;
  }

  // Priority 4: Default fallback (English)
  return DEFAULT_LANGUAGE;
}
```

### Wrapper Function for Plan Compatibility

```typescript
/**
 * Wrapper function matching the Plan-111 specification.
 * detectSourceLanguage(user: User, account: Account, override?: string)
 */
export function detectSourceLanguageFromContext(
  user: UserForLanguageDetection | null | undefined,
  account: AccountForLanguageDetection | null | undefined,
  override?: string
): SupportedLanguage {
  return detectSourceLanguage({ user, account, override });
}
```

### Usage in Content APIs

```typescript
// In /src/app/api/admin/items/route.ts POST handler
import { detectSourceLanguage } from '@/lib/content-translation';

// After authentication and getting user/account context
const sourceLanguage = detectSourceLanguage({
  user: currentUser,
  account: currentAccount,
  override: body.sourceLanguage, // Optional override from request body
});

// Use sourceLanguage when:
// 1. Storing in items.source_language column
// 2. Triggering translation jobs
const translationResult = await queueContentTranslations({
  content: {
    entityType: 'item',
    entityId: newItem.id,
    sourceLanguage, // <-- From detectSourceLanguage
    fields: [/* ... */]
  },
  trigger: 'create'
});
```

---

## Authorized Files and Functions for Modification

### New Files (CREATE)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/source-language.ts` | Main source language detection module |

### Files to Modify (UPDATE)

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/src/lib/content-translation/index.ts` | Add exports | Export `detectSourceLanguage` and related types |

### Functions to Create

| Function Name | File | Purpose |
|--------------|------|---------|
| `detectSourceLanguage` | source-language.ts | Main detection function (options-based) |
| `detectSourceLanguageFromContext` | source-language.ts | Alternative signature for Plan-111 compatibility |

### Types to Create

| Type Name | File | Purpose |
|-----------|------|---------|
| `UserForLanguageDetection` | source-language.ts | Minimal user interface |
| `AccountForLanguageDetection` | source-language.ts | Minimal account interface |
| `DetectSourceLanguageOptions` | source-language.ts | Options object interface |

### Reference Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/translation-service.types.ts` | Import `SupportedLanguage`, `isSupportedLanguage`, `DEFAULT_LANGUAGE` |
| `/src/lib/supabase.ts` | Reference for database types (User, Account structure) |
| `/src/types/index.ts` | Reference for User and Account application types |

---

## Implementation Tasks

### Task Breakdown

| # | Task | Size | Priority |
|---|------|------|----------|
| 1 | Create source-language.ts file with imports | XS | Required |
| 2 | Define TypeScript interfaces (`UserForLanguageDetection`, etc.) | XS | Required |
| 3 | Implement `detectSourceLanguage()` function | S | Required |
| 4 | Implement `detectSourceLanguageFromContext()` wrapper | XS | Required |
| 5 | Add JSDoc documentation with examples | XS | Required |
| 6 | Update barrel exports in `/src/lib/content-translation/index.ts` | XS | Required |
| 7 | Verify TypeScript compilation | XS | Required |

### Implementation Order

1. **Step 1**: Create file, add imports from translation-service types
2. **Step 2**: Define input type interfaces
3. **Step 3**: Implement main `detectSourceLanguage()` function with priority logic
4. **Step 4**: Implement `detectSourceLanguageFromContext()` wrapper
5. **Step 5**: Add comprehensive JSDoc documentation
6. **Step 6**: Update index.ts barrel exports
7. **Step 7**: Verify build passes with `npm run build`

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Function exists with signature accepting user object, account object, and optional override | `detectSourceLanguageFromContext(user, account, override?)` |
| Function returns a supported language code type (not a freeform string) | Return type is `SupportedLanguage` |
| Function evaluates override parameter first and returns immediately if valid | Priority 1 check in implementation |
| Function evaluates user preferred language second if override is not provided | Priority 2 check in implementation |
| Function evaluates account preferred language third | Priority 3 check in implementation |
| Function returns English ('en') as default if no preferences are set | Priority 4 fallback to `DEFAULT_LANGUAGE` |
| Function validates that returned language code is in supported languages list | Uses `isSupportedLanguage()` type guard |
| Function handles null or undefined user/account objects gracefully | Optional chaining (`user?.preferred_language`) |
| Function handles invalid override values by falling back to next priority level | Invalid values don't pass `isSupportedLanguage()` check |
| TypeScript types are properly defined for all parameters and return values | All interfaces and types defined |
| Function is exported from the content translation module | Exported via index.ts barrel |

---

## Testing Considerations

### Unit Test Cases

1. **Override Priority Tests**
   - Valid override returns override: `detectSourceLanguage({ override: 'fr' })` → `'fr'`
   - Valid override beats user preference: `detectSourceLanguage({ override: 'fr', user: { preferred_language: 'es' } })` → `'fr'`
   - Invalid override falls through: `detectSourceLanguage({ override: 'invalid', user: { preferred_language: 'es' } })` → `'es'`

2. **User Preference Tests**
   - User preference used when no override: `detectSourceLanguage({ user: { preferred_language: 'de' } })` → `'de'`
   - User preference beats account: `detectSourceLanguage({ user: { preferred_language: 'de' }, account: { preferred_language: 'fr' } })` → `'de'`
   - Invalid user preference falls through: `detectSourceLanguage({ user: { preferred_language: 'invalid' }, account: { preferred_language: 'fr' } })` → `'fr'`

3. **Account Preference Tests**
   - Account preference used when no user preference: `detectSourceLanguage({ account: { preferred_language: 'nl' } })` → `'nl'`
   - Null user falls through to account: `detectSourceLanguage({ user: null, account: { preferred_language: 'it' } })` → `'it'`

4. **Default Fallback Tests**
   - Empty options returns English: `detectSourceLanguage({})` → `'en'`
   - All null values returns English: `detectSourceLanguage({ user: null, account: null, override: null })` → `'en'`
   - Undefined preferred_language returns English: `detectSourceLanguage({ user: {}, account: {} })` → `'en'`

5. **Edge Cases**
   - All six supported languages work as override: `['en', 'fr', 'es', 'de', 'nl', 'it'].forEach(lang => expect(detectSourceLanguage({ override: lang })).toBe(lang))`
   - Empty string override falls through: `detectSourceLanguage({ override: '' })` → `'en'`
   - Whitespace override falls through: `detectSourceLanguage({ override: '  ' })` → `'en'`

### Test File Location

Tests should be created at: `/src/lib/content-translation/__tests__/source-language.test.ts`

---

## Related Documentation

- **Request Document**: `/docs/gen_requests_epic3.md` (REQ-E03-007)
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md` (Task 2.1)
- **Translation Service Types**: `/src/lib/translation-service/translation-service.types.ts`
- **Epic 1 Language Preferences**: REQ-225 (database columns)
- **Guest Language Detection**: `/src/lib/i18n/language-detection.ts` (different purpose, but similar pattern)

---

## Notes

1. **Distinction from Guest Language Detection**: The `/src/lib/i18n/language-detection.ts` module handles UI language detection for guests using Accept-Language headers, cookies, and URL parameters. This source language detection utility is specifically for determining the **source language of content** when creating/updating items, articles, links, and tags.

2. **Minimal Interface Design**: The `UserForLanguageDetection` and `AccountForLanguageDetection` interfaces are intentionally minimal (only `preferred_language` field) to avoid tight coupling with the full User/Account types. This allows the function to work with partial objects from various contexts.

3. **Type Guard Usage**: The `isSupportedLanguage()` function from translation-service types ensures only valid language codes are returned. This provides compile-time and runtime safety.

4. **Future Enhancement**: If additional language sources are needed (e.g., property-level language preference), the priority logic can be extended by adding new priority levels between existing ones.

5. **Integration with Content APIs**: This utility will be called by the modified Items API (Task 2.2), Articles API (Task 2.3), and Links API (Task 2.4) when triggering translations.

---

## File Structure After Implementation

```typescript
// /src/lib/content-translation/source-language.ts
import {
  SupportedLanguage,
  isSupportedLanguage,
  DEFAULT_LANGUAGE
} from '@/lib/translation-service/translation-service.types';

// Interfaces
export interface UserForLanguageDetection { /* ... */ }
export interface AccountForLanguageDetection { /* ... */ }
export interface DetectSourceLanguageOptions { /* ... */ }

// Functions
export function detectSourceLanguage(options?: DetectSourceLanguageOptions): SupportedLanguage;
export function detectSourceLanguageFromContext(user, account, override?): SupportedLanguage;
```

```typescript
// /src/lib/content-translation/index.ts (updated)
export * from './content-translation.types';
export * from './content-translation';
export * from './source-language'; // NEW export
export * from './triggers/item-trigger';
export * from './triggers/article-trigger';
export * from './triggers/link-trigger';
export * from './triggers/tag-trigger';
export * from './storage/translation-storage';
export * from './storage/translation-status';
```
