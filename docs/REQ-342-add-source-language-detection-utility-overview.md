# REQ-342: Add Source Language Detection Utility - Implementation Overview

**Document Type:** Technical Implementation Breakdown
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-342
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Phase:** 2 - Modify Existing Content APIs
**Task ID:** 2.1
**Size:** S (Small)

---

## 1. Summary

This document outlines the implementation plan for creating a source language detection utility that determines what language content is being created in when translation workflows are triggered. The utility follows a priority-based cascade: explicit override → user's preferred language → account's preferred language → English fallback.

**Key Deliverable:** A utility function `detectSourceLanguage()` located at `/src/lib/content-translation/source-language.ts`

---

## 2. Request Details

### Original Request (from gen_requests_epic3.md)

**Type:** NEW FEATURE
**Summary:** The system must automatically determine the source language for content translation by evaluating multiple priority inputs.

### Expected Behavior

When content is created or modified, the system determines the source language by checking (in priority order):
1. An explicit language override if provided
2. The content creator's preferred language setting
3. The account's default language setting
4. English as the ultimate fallback

The detected language is then used as the source for translating content into other supported languages.

### Business Value

Enables multilingual content creation workflows by providing a reliable, predictable method for determining source language, supporting the platform's goal of serving international audiences.

---

## 3. Technical Context

### Related Implementation Plan

**Reference:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
**Task:** Phase 2, Task 2.1

From the implementation plan:
> **Task 2.1:** Add source language detection utility
> - File: `/src/lib/content-translation/source-language.ts`
> - `detectSourceLanguage(user: User, account: Account, override?: string): SupportedLanguage`
> - Priority: override > user.preferred_language > account.preferred_language > 'en'

### Existing Infrastructure (Epic 1 Dependencies)

| Component | Location | Status |
|-----------|----------|--------|
| SupportedLanguage type | `/src/lib/translation-service/translation-service.types.ts` | ✅ Available |
| isSupportedLanguage() guard | `/src/lib/translation-service/translation-service.types.ts` | ✅ Available |
| DEFAULT_LANGUAGE constant | `/src/lib/translation-service/translation-service.types.ts` | ✅ Available |
| User.preferred_language column | Database `users` table | ✅ Available |
| Account.preferred_language column | Database `accounts` table | ✅ Available |
| Language detection for middleware | `/src/lib/i18n/language-detection.ts` | ✅ Available (reference pattern) |

### Existing Type Definitions

**User type** (from `/src/types/index.ts`):
```typescript
interface User {
  id: string;
  email: string;
  // ... other fields
  // Note: preferred_language accessed via database type
}
```

**Database User Row** (from `/src/lib/supabase.ts`):
```typescript
users: {
  Row: {
    id: string
    email: string
    preferred_language: string | null  // REQ-225
    // ...
  }
}
```

**Database Account Row** (from `/src/lib/supabase.ts`):
```typescript
accounts: {
  Row: {
    id: string
    name: string
    preferred_language: string | null  // REQ-225
    // ...
  }
}
```

**SupportedLanguage** (from `/src/lib/translation-service/translation-service.types.ts`):
```typescript
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

---

## 4. Implementation Approach

### 4.1 File Structure

This task creates the first file in the new `content-translation` module:

```
/src/lib/content-translation/
├── source-language.ts     # NEW - This task
├── index.ts               # NEW - Module exports (created here or Task 1.1)
├── content-translation.ts # Future (Task 1.2)
└── ...
```

### 4.2 Function Signature

```typescript
/**
 * Detects the source language for content translation.
 *
 * Priority cascade:
 * 1. Explicit override (if provided and valid)
 * 2. User's preferred_language
 * 3. Account's preferred_language
 * 4. Default: 'en'
 *
 * @param user - User object (may have preferred_language)
 * @param account - Account object (may have preferred_language)
 * @param override - Optional explicit language override
 * @returns A valid SupportedLanguage code
 */
export function detectSourceLanguage(
  user: SourceLanguageUser | null,
  account: SourceLanguageAccount | null,
  override?: string
): SupportedLanguage
```

### 4.3 Type Definitions for Input

To keep the function flexible and avoid tight coupling to specific type definitions, we define minimal interfaces:

```typescript
/**
 * Minimal user interface for source language detection.
 * Accepts any object with optional preferred_language field.
 */
export interface SourceLanguageUser {
  id?: string;
  preferred_language?: string | null;
}

/**
 * Minimal account interface for source language detection.
 * Accepts any object with optional preferred_language field.
 */
export interface SourceLanguageAccount {
  id?: string;
  preferred_language?: string | null;
}
```

### 4.4 Implementation Logic

```
detectSourceLanguage(user, account, override)
    │
    ├─► Is override provided and valid? ─────► YES ─► return override
    │
    │   NO
    │
    ├─► Is user.preferred_language valid? ──► YES ─► return user.preferred_language
    │
    │   NO
    │
    ├─► Is account.preferred_language valid? ► YES ─► return account.preferred_language
    │
    │   NO
    │
    └─► return DEFAULT_LANGUAGE ('en')
```

### 4.5 Validation

Each language value is validated using the existing `isSupportedLanguage()` type guard from `/src/lib/translation-service/translation-service.types.ts`.

---

## 5. Acceptance Criteria Mapping

| Acceptance Criterion | Implementation |
|---------------------|----------------|
| Utility accepts user object, account object, and optional override | Function signature with all three parameters |
| Returns a valid supported language code | Return type `SupportedLanguage`, validated by type guard |
| Override parameter takes highest priority | First check in priority cascade |
| User preferred language used if no override | Second check in priority cascade |
| Account preferred language used if neither override nor user pref | Third check in priority cascade |
| English ('en') returned when no other source | Default fallback at end of cascade |
| Handles missing or null values gracefully | Null checks at each priority level |

---

## 6. Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/content-translation/source-language.ts` | Source language detection utility |
| `/src/lib/content-translation/index.ts` | Module exports (if not created by Task 1.1) |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| None | This is a new utility with no modifications to existing files |

### Functions to Create

| Function | File | Description |
|----------|------|-------------|
| `detectSourceLanguage()` | `source-language.ts` | Main detection function |

### Dependencies (Read-Only)

| File Path | Usage |
|-----------|-------|
| `/src/lib/translation-service/translation-service.types.ts` | Import `SupportedLanguage`, `isSupportedLanguage`, `DEFAULT_LANGUAGE` |

---

## 7. Implementation Tasks

### Task 1: Create source-language.ts file structure
- Create `/src/lib/content-translation/` directory if not exists
- Create `source-language.ts` with file header documentation
- Add import statements for translation service types

### Task 2: Define input type interfaces
- Create `SourceLanguageUser` interface
- Create `SourceLanguageAccount` interface
- Add JSDoc documentation for each

### Task 3: Implement detectSourceLanguage function
- Implement priority cascade logic
- Use `isSupportedLanguage()` for validation at each level
- Add comprehensive JSDoc documentation with examples

### Task 4: Create/Update module index
- Create or update `/src/lib/content-translation/index.ts`
- Export `detectSourceLanguage` function
- Export type interfaces

### Task 5: Add unit tests
- Test override priority
- Test user preference priority
- Test account preference priority
- Test default fallback
- Test null/undefined handling at each level
- Test invalid language codes

---

## 8. Code Template

```typescript
/**
 * Source Language Detection Utility
 *
 * Determines the source language for content translation using a
 * prioritized cascade of language preference sources.
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
 */
export interface SourceLanguageUser {
  id?: string;
  preferred_language?: string | null;
}

/**
 * Minimal account interface for source language detection.
 */
export interface SourceLanguageAccount {
  id?: string;
  preferred_language?: string | null;
}

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
 * @param user - User object with optional preferred_language
 * @param account - Account object with optional preferred_language
 * @param override - Optional explicit language override
 * @returns A valid SupportedLanguage code
 *
 * @example
 * // With explicit override
 * detectSourceLanguage(user, account, 'fr'); // Returns 'fr'
 *
 * @example
 * // User preference takes effect
 * const user = { preferred_language: 'de' };
 * detectSourceLanguage(user, null); // Returns 'de'
 *
 * @example
 * // Account fallback
 * const account = { preferred_language: 'es' };
 * detectSourceLanguage(null, account); // Returns 'es'
 *
 * @example
 * // Default fallback
 * detectSourceLanguage(null, null); // Returns 'en'
 */
export function detectSourceLanguage(
  user: SourceLanguageUser | null,
  account: SourceLanguageAccount | null,
  override?: string
): SupportedLanguage {
  // Priority 1: Explicit override
  if (override && isSupportedLanguage(override)) {
    return override;
  }

  // Priority 2: User's preferred language
  if (user?.preferred_language && isSupportedLanguage(user.preferred_language)) {
    return user.preferred_language;
  }

  // Priority 3: Account's preferred language
  if (account?.preferred_language && isSupportedLanguage(account.preferred_language)) {
    return account.preferred_language;
  }

  // Priority 4: Default fallback
  return DEFAULT_LANGUAGE;
}
```

---

## 9. Testing Strategy

### Unit Test Cases

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Override takes priority | `user={lang:'de'}`, `account={lang:'es'}`, `override='fr'` | `'fr'` |
| User pref when no override | `user={lang:'de'}`, `account={lang:'es'}` | `'de'` |
| Account pref when no user pref | `user=null`, `account={lang:'es'}` | `'es'` |
| Default when nothing set | `user=null`, `account=null` | `'en'` |
| Invalid override falls through | `user={lang:'de'}`, `override='xx'` | `'de'` |
| Invalid user pref falls through | `user={lang:'xx'}`, `account={lang:'es'}` | `'es'` |
| Null user, null account | `user=null`, `account=null` | `'en'` |
| Empty user object | `user={}`, `account=null` | `'en'` |
| User with null preference | `user={preferred_language:null}`, `account={lang:'es'}` | `'es'` |

### Test File Location

`/src/lib/content-translation/__tests__/source-language.test.ts`

---

## 10. Integration Points

### Upstream (Consumers of this utility)

| Component | Usage |
|-----------|-------|
| Items API POST handler | Detect source language when creating items |
| Items API PUT handler | Detect source language when updating items |
| Articles API POST handler | Detect source language when creating articles |
| Articles API PUT handler | Detect source language when updating articles |
| Links API POST/PUT handlers | Detect source language for link translations |

### Downstream (Dependencies)

| Component | Usage |
|-----------|-------|
| `translation-service.types.ts` | Types and validation functions |

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Invalid language codes passed | Low | Low | Type guard validation at each level |
| Database columns not populated | Medium | Low | Graceful fallback to default |
| Type mismatch with actual User/Account types | Low | Low | Minimal interface design |

---

## 12. Effort Estimate

| Task | Estimate |
|------|----------|
| Create file structure and types | 15 min |
| Implement detectSourceLanguage | 15 min |
| Create module exports | 5 min |
| Write unit tests | 30 min |
| Documentation | 10 min |
| **Total** | **~1.25 hours** |

---

## 13. Dependencies

### Prerequisites

- [x] SupportedLanguage type exists in translation-service
- [x] isSupportedLanguage() type guard exists
- [x] DEFAULT_LANGUAGE constant exists
- [x] Database columns for preferred_language exist on users and accounts

### Blocking Issues

None identified.

---

## 14. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md`
- **Request Document:** `/docs/gen_requests_epic3.md` (REQ-342)
- **Translation Service Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Existing Language Detection Pattern:** `/src/lib/i18n/language-detection.ts`
- **Database Types:** `/src/lib/supabase.ts`

---

*Document generated for FAQBNB L10N Epic 3 - Dynamic Content Translation*
