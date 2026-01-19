# REQ-339: Create Guest Language Utility Module - Implementation Overview

**Request ID:** REQ-339
**Type:** NEW FEATURE
**Size:** M
**Phase:** 1 - Types and Utilities
**Task ID:** 1.2
**Last Modified:** 2026-01-19

**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Request Source:** `/docs/gen_requests_epic4.md`

---

## Summary

Create a comprehensive utility module (`/src/lib/i18n/guest-language.ts`) that provides four core functions for detecting guest language preferences from multiple sources and persisting those preferences across browser sessions. This module differs from the existing `language-detection.ts` by focusing specifically on guest/unauthenticated user scenarios and the public item viewing experience.

---

## Current State Analysis

### Existing Infrastructure

The codebase already has substantial i18n infrastructure from Epic 1:

1. **`/src/lib/i18n/config.ts`** - Core configuration with:
   - `SupportedLocale` type (`'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`)
   - `LOCALE_COOKIE_NAME` constant (`'FAQBNB_LANG'`)
   - `LOCALE_COOKIE_MAX_AGE` constant (1 year in seconds)
   - `isSupportedLocale()` type guard
   - `normalizeLocale()` for mapping variants like `'en-US'` to `'en'`
   - `localeMetadata` record with display names and flags

2. **`/src/lib/i18n/language-detection.ts`** - Server-side detection with:
   - `detectUserLanguage(request, user?, options?)` - Full cascade detection
   - `setLocaleCookie(response, locale)` - Cookie setting on NextResponse
   - `parseAcceptLanguageHeader()` - Internal helper (not exported)

3. **`/src/middleware.ts`** - Currently handles authenticated routes only; does not include `/item/*` guest routes

4. **`/src/contexts/LocaleContext.tsx`** - Client-side locale management for authenticated users

### Gap Analysis

The existing infrastructure focuses on **authenticated users** with middleware interception. For **guest-facing pages** (public `/item/[publicId]` routes), we need:

1. **Different cookie name** - Guest preference should use `'FAQBNB_GUEST_LANG'` to distinguish from authenticated user preferences
2. **Client-side cookie functions** - Current `setLocaleCookie()` works with `NextResponse`, but guests need `document.cookie` access
3. **URL parameter priority** - Guest pages support `?lang=fr` for shareable links (highest priority)
4. **Exported parsing function** - `parseAcceptLanguage()` should be exported for reuse
5. **Mapping function** - `mapToSupportedLanguage()` for explicit regional variant handling

---

## Implementation Requirements

### File Location

**Path:** `/src/lib/i18n/guest-language.ts`

### Functions to Implement

#### 1. `detectGuestLanguage(request, urlParam?)`

Detect guest's preferred language from multiple sources in priority order.

**Signature:**
```typescript
function detectGuestLanguage(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale
```

**Priority Order:**
1. URL parameter (`urlParam` - passed explicitly from `searchParams.lang`)
2. Guest language cookie (`FAQBNB_GUEST_LANG`)
3. Accept-Language header (parsed and matched)
4. Default locale (`'en'`)

**Implementation Notes:**
- Reuse `isSupportedLocale()` from config for validation
- Reuse `normalizeLocale()` for variant handling
- Log detection source for debugging
- Return type-safe `SupportedLocale`

#### 2. `setGuestLanguageCookie(language)`

Persist guest language preference to browser cookie.

**Signature:**
```typescript
function setGuestLanguageCookie(language: SupportedLocale): void
```

**Cookie Attributes:**
- **Name:** `FAQBNB_GUEST_LANG`
- **Path:** `/`
- **Max-Age:** 365 days (1 year)
- **SameSite:** `Lax` (allows navigation scenarios)
- **Secure:** `true` in production
- **HttpOnly:** `false` (allows client-side access for language switcher)

**Implementation Notes:**
- Works with `document.cookie` for client-side usage
- Uses `NextResponse.cookies.set()` for server-side usage (overloaded or separate function)

#### 3. `parseAcceptLanguage(header)`

Parse Accept-Language header to extract language codes with quality weights.

**Signature:**
```typescript
function parseAcceptLanguage(header: string | null): string[]
```

**Returns:** Array of language codes sorted by quality weight (highest first)

**Example:**
```typescript
parseAcceptLanguage('fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7')
// Returns: ['fr', 'en', 'de']
```

**Edge Cases:**
- Null/empty header returns `[]`
- Malformed entries are skipped
- Wildcard (`*`) is filtered out
- Duplicate codes are deduplicated

#### 4. `mapToSupportedLanguage(code)`

Map browser language codes to supported languages.

**Signature:**
```typescript
function mapToSupportedLanguage(code: string): SupportedLocale
```

**Mapping Logic:**
1. Exact match: `'en'` -> `'en'`
2. Regional variant: `'en-US'` -> `'en'`, `'fr-CA'` -> `'fr'`
3. No match: Return default locale (`'en'`)

**Implementation Notes:**
- Case-insensitive matching
- Leverages `normalizeLocale()` internally
- Always returns a valid `SupportedLocale`

### Constants to Export

```typescript
/** Cookie name for guest language preference (distinct from authenticated user cookie) */
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/** Cookie expiry in seconds (1 year) */
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
```

---

## Authorized Files and Functions for Modification

### New File (Create)

| File | Purpose |
|------|---------|
| `/src/lib/i18n/guest-language.ts` | Guest language utility module |

### Files to Modify

| File | Modification |
|------|-------------|
| `/src/lib/i18n/index.ts` | Add exports for guest-language utilities |

### Functions to Create

| Function | Location | Purpose |
|----------|----------|---------|
| `detectGuestLanguage` | `guest-language.ts` | Detect language from request context |
| `setGuestLanguageCookie` | `guest-language.ts` | Persist preference to cookie |
| `parseAcceptLanguage` | `guest-language.ts` | Parse Accept-Language header |
| `mapToSupportedLanguage` | `guest-language.ts` | Map codes to supported locales |

### Existing Functions to Reuse (Do Not Modify)

| Function | Location | Purpose |
|----------|----------|---------|
| `isSupportedLocale` | `config.ts` | Validate locale codes |
| `normalizeLocale` | `config.ts` | Handle regional variants |
| `DEFAULT_LOCALE` | `config.ts` | Default fallback value |
| `SupportedLocale` | `config.ts` | Type definition |

---

## Integration Points

### Downstream Consumers

1. **Guest Item Page** (`/src/app/item/[publicId]/page.tsx`)
   - Will call `detectGuestLanguage(request, searchParams.lang)`
   - Server-side detection during page render

2. **useGuestLanguage Hook** (`/src/hooks/useGuestLanguage.ts`)
   - Will call `setGuestLanguageCookie()` when language changes
   - Client-side persistence

3. **Middleware** (`/src/middleware.ts`)
   - Future task will add `/item/*` routes
   - Will call `detectGuestLanguage()` for early detection

4. **GuestLanguageSwitcher Component** (`/src/components/guest/GuestLanguageSwitcher/`)
   - Will read/write cookie via `setGuestLanguageCookie()`

### Upstream Dependencies

- `/src/lib/i18n/config.ts` - Type definitions and validation functions
- `next/server` - `NextRequest` type for server-side detection

---

## Implementation Approach

### Phase 1: Core Implementation

1. Create `/src/lib/i18n/guest-language.ts` with header documentation
2. Import dependencies from `./config` and `next/server`
3. Define and export constants (`GUEST_LANGUAGE_COOKIE_NAME`, `GUEST_LANGUAGE_COOKIE_MAX_AGE`)
4. Implement `parseAcceptLanguage()` function
5. Implement `mapToSupportedLanguage()` function
6. Implement `detectGuestLanguage()` function
7. Implement `setGuestLanguageCookie()` function (server-side version)
8. Implement client-side cookie utility (if separate or combined)

### Phase 2: Export Integration

1. Update `/src/lib/i18n/index.ts` with new exports
2. Verify all exports compile correctly

### Phase 3: Documentation

1. Add JSDoc comments to all functions
2. Add inline examples in comments
3. Document edge case handling

---

## Code Structure Template

```typescript
/**
 * Guest Language Utility Module
 *
 * Provides language detection and preference persistence for
 * unauthenticated guest users viewing public content.
 *
 * REQ-339: Create Guest Language Utility Module
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 1, Task 1.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  type SupportedLocale,
} from './config';

// =============================================================================
// Constants
// =============================================================================

/** Cookie name for guest language preference */
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/** Cookie max age in seconds (1 year) */
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// =============================================================================
// Accept-Language Parser
// =============================================================================

/**
 * Parse Accept-Language header and return language codes sorted by preference.
 * ...
 */
export function parseAcceptLanguage(header: string | null): string[] {
  // Implementation
}

// =============================================================================
// Language Code Mapping
// =============================================================================

/**
 * Map a browser language code to a supported locale.
 * ...
 */
export function mapToSupportedLanguage(code: string): SupportedLocale {
  // Implementation
}

// =============================================================================
// Language Detection
// =============================================================================

/**
 * Detect guest's preferred language from request context.
 * ...
 */
export function detectGuestLanguage(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale {
  // Implementation
}

// =============================================================================
// Cookie Persistence
// =============================================================================

/**
 * Set the guest language preference cookie (client-side).
 * ...
 */
export function setGuestLanguageCookie(language: SupportedLocale): void {
  // Implementation
}

/**
 * Get the guest language preference from cookie (client-side).
 * ...
 */
export function getGuestLanguageCookie(): SupportedLocale | null {
  // Implementation
}
```

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| `detectGuestLanguage` accepts request and optional URL param | Function signature with `NextRequest` and optional `string` |
| Detection examines URL parameter first | Priority check in `detectGuestLanguage()` |
| Detection reads cookie when no URL param | Check `GUEST_LANGUAGE_COOKIE_NAME` cookie |
| Detection parses Accept-Language header | Call `parseAcceptLanguage()` |
| Detection returns default when all fail | Return `DEFAULT_LOCALE` |
| `setGuestLanguageCookie` accepts language code | Function signature |
| Cookie set with 1-year expiration | `max-age=${GUEST_LANGUAGE_COOKIE_MAX_AGE}` |
| Cookie includes security attributes | `Secure; SameSite=Lax` |
| Cookie path is "/" | `path=/` |
| `parseAcceptLanguage` accepts header string | Function signature |
| Parsing extracts codes with quality weights | Weight parsing and sorting |
| Parsing returns sorted by quality | Descending sort by quality |
| Parsing handles malformed headers | Try-catch and skip invalid entries |
| `mapToSupportedLanguage` accepts any code | Function signature with `string` |
| Mapping returns exact match | Direct lookup |
| Mapping handles regional variants | Split on `-` and check base code |
| Mapping returns default when no match | Return `DEFAULT_LOCALE` |
| Functions have TypeScript types | All params and returns typed |
| Functions have JSDoc comments | Comprehensive documentation |
| Module exports cookie name constant | `GUEST_LANGUAGE_COOKIE_NAME` exported |
| Functions handle null/empty/undefined | Defensive programming throughout |

---

## Testing Considerations

### Unit Tests to Create

1. **`parseAcceptLanguage()`**
   - Empty/null header returns `[]`
   - Single language without quality
   - Multiple languages with qualities
   - Malformed entries skipped
   - Wildcard filtered
   - Regional variants extracted to base code

2. **`mapToSupportedLanguage()`**
   - Exact match supported codes
   - Regional variants mapped
   - Unsupported codes return default
   - Case insensitivity

3. **`detectGuestLanguage()`**
   - URL param takes priority
   - Cookie used when no URL param
   - Header used when no URL/cookie
   - Default returned when all fail
   - Invalid values in each source handled

4. **`setGuestLanguageCookie()`**
   - Cookie set with correct attributes
   - Invalid locale handled

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cookie conflicts with existing `FAQBNB_LANG` | Low | Medium | Use separate cookie name `FAQBNB_GUEST_LANG` |
| Browser cookie access blocked | Low | Low | Graceful fallback to header detection |
| Accept-Language parsing edge cases | Medium | Low | Comprehensive error handling, fallback to default |
| Type safety with string inputs | Medium | Low | Validate all inputs with `isSupportedLocale()` |

---

## Dependencies

### Blocking Dependencies (Must Complete First)

- **REQ-338**: Create Localization Types File - Provides `SupportedLanguage` type and related interfaces (though existing `SupportedLocale` from config.ts can be used)

### Non-Blocking Dependencies

- Epic 1 Foundation (already complete) - Provides core i18n infrastructure

---

## Estimated Effort

**Complexity:** Low-Medium
**Estimated Time:** 2-3 hours

- Core implementation: 1-1.5 hours
- JSDoc documentation: 30 minutes
- Export integration: 15 minutes
- Testing verification: 30-45 minutes

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md` (REQ-339)
- Existing i18n Config: `/src/lib/i18n/config.ts`
- Existing Language Detection: `/src/lib/i18n/language-detection.ts`
- LocaleContext Pattern: `/src/contexts/LocaleContext.tsx`
