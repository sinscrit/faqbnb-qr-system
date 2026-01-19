# REQ-356: Create Server-Side Language Detection Utility - Implementation Overview

**Request ID:** REQ-356
**Type:** ENHANCEMENT
**Size:** M
**Phase:** 6 - Middleware & Language Detection
**Task ID:** 6.2
**Last Modified:** 2026-01-19

**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Request Source:** `/docs/gen_requests_epic4.md`

---

## Summary

Create a server-side language detection utility within `/src/lib/i18n/guest-language.ts` that reads guest language preferences from `NextRequest` cookies and headers. This utility implements the priority cascade: URL parameter (highest) > Cookie > Accept-Language header > default fallback. The utility enables consistent language detection for guest-facing item routes processed through middleware.

---

## Current State Analysis

### Existing Infrastructure

The codebase has existing i18n infrastructure from Epic 1:

1. **`/src/lib/i18n/config.ts`** - Core configuration with:
   - `SupportedLocale` type (`'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`)
   - `LOCALE_COOKIE_NAME` constant (`'FAQBNB_LANG'`)
   - `LOCALE_COOKIE_MAX_AGE` constant (1 year in seconds)
   - `isSupportedLocale()` type guard
   - `normalizeLocale()` for mapping variants like `'en-US'` to `'en'`
   - `DEFAULT_LOCALE` constant (`'en'`)

2. **`/src/lib/i18n/language-detection.ts`** - Server-side detection for authenticated users:
   - `detectUserLanguage(request, user?, options?)` - Full cascade detection
   - `setLocaleCookie(response, locale)` - Cookie setting on `NextResponse`
   - Priority: User DB preference > Cookie > Accept-Language > default
   - Designed for authenticated routes with user object

3. **`/src/middleware.ts`** - Currently handles authenticated routes only:
   - Matcher pattern: `/admin/*`, `/user/*`, `/dashboard/*`, `/login`, `/register/*`
   - Does NOT include `/item/*` guest routes
   - Uses `detectUserLanguage()` for authenticated requests

4. **REQ-339 Guest Language Utilities** - Client-side focused utilities (may already exist or in progress):
   - `GUEST_LANGUAGE_COOKIE_NAME` = `'FAQBNB_GUEST_LANG'`
   - `detectGuestLanguage()` for page-level detection
   - `setGuestLanguageCookie()` for client-side persistence

### Gap Analysis

The existing `detectUserLanguage()` function in `language-detection.ts` is designed for **authenticated users** with database lookup capability. For **middleware-level guest detection**, we need:

1. **URL parameter priority** - Guests may arrive via shareable links with `?lang=fr`
2. **Guest-specific cookie** - Use `FAQBNB_GUEST_LANG` instead of `FAQBNB_LANG`
3. **No database lookup** - Guest users have no user record
4. **Header-based detection** - Set `x-locale` response header for downstream components
5. **Middleware integration** - Function signature compatible with middleware usage

---

## Implementation Requirements

### File Location

**Path:** `/src/lib/i18n/guest-language.ts` (server-side additions to existing module)

This task adds/modifies server-side detection capabilities within the guest-language module. If REQ-339 has already created this file, we extend it. If not, we create it with the server-side focus.

### Function to Implement

#### `detectGuestLanguageFromRequest(request, urlParam?)`

Server-side language detection specifically for middleware usage with `NextRequest`.

**Signature:**
```typescript
function detectGuestLanguageFromRequest(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale
```

**Priority Order:**
1. **URL parameter** (`urlParam` - passed explicitly from `request.nextUrl.searchParams.get('lang')`)
2. **Guest language cookie** (`FAQBNB_GUEST_LANG`)
3. **Accept-Language header** (parsed from `request.headers.get('Accept-Language')`)
4. **Default locale** (`'en'`)

**Implementation Notes:**
- Reads cookies via `request.cookies.get()` - NextRequest cookies API
- Reads headers via `request.headers.get()` - NextRequest headers API
- Validates all values with `isSupportedLocale()`
- Normalizes regional variants with `normalizeLocale()`
- Returns type-safe `SupportedLocale`
- Logs detection source for debugging

**Difference from `detectUserLanguage()`:**
- No `user` parameter (guests have no DB record)
- Uses `GUEST_LANGUAGE_COOKIE_NAME` instead of `LOCALE_COOKIE_NAME`
- URL parameter has highest priority (not present in user detection)
- Simpler cascade with no database lookup

### Helper Functions (if not already exported)

#### `parseAcceptLanguageHeader(header)`

Parse Accept-Language header to extract language codes sorted by quality weight.

**Signature:**
```typescript
function parseAcceptLanguageHeader(header: string | null): string[]
```

**Note:** This function exists internally in `language-detection.ts` but is not exported. We can either:
1. Export it from `language-detection.ts` and reuse
2. Duplicate the implementation in `guest-language.ts` for isolation

Recommendation: Implement a shared version or duplicate for module isolation.

### Constants

```typescript
/** Cookie name for guest language preference */
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/** Cookie max age in seconds (1 year) */
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
```

---

## Authorized Files and Functions for Modification

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `/src/lib/i18n/guest-language.ts` | Create/Modify | Server-side guest language detection utility |
| `/src/lib/i18n/index.ts` | Modify | Export new functions and constants |

### Functions to Implement

| Function | Location | Purpose |
|----------|----------|---------|
| `detectGuestLanguageFromRequest` | `guest-language.ts` | Server-side detection from NextRequest |
| `parseAcceptLanguageHeader` | `guest-language.ts` | Parse Accept-Language header (if not shared) |

### Existing Functions to Reuse (Do Not Modify)

| Function | Location | Purpose |
|----------|----------|---------|
| `isSupportedLocale` | `config.ts` | Validate locale codes |
| `normalizeLocale` | `config.ts` | Handle regional variants |
| `DEFAULT_LOCALE` | `config.ts` | Default fallback value |
| `SupportedLocale` | `config.ts` | Type definition |

---

## Integration Points

### Upstream Dependency (Task 6.1)

**REQ-356 Task 6.1:** Add Guest Language Detection to Middleware
- Adds `/item/*` routes to middleware matcher
- Calls `detectGuestLanguageFromRequest()` for guest requests
- Sets `x-locale` response header with detected language
- Updates `FAQBNB_GUEST_LANG` cookie if language changed

### Downstream Consumers

1. **Middleware** (`/src/middleware.ts`)
   ```typescript
   // Example usage in middleware
   import { detectGuestLanguageFromRequest } from '@/lib/i18n/guest-language';

   // For item routes
   if (req.nextUrl.pathname.startsWith('/item/')) {
     const urlLang = req.nextUrl.searchParams.get('lang');
     const detectedLocale = detectGuestLanguageFromRequest(req, urlLang);
     res.headers.set('x-locale', detectedLocale);
   }
   ```

2. **Guest Item Page** (`/src/app/item/[publicId]/page.tsx`)
   - Can read `x-locale` header set by middleware
   - Or call `detectGuestLanguageFromRequest()` directly if middleware not used

3. **Server Components**
   - Access detected language from `headers().get('x-locale')`
   - Consistent language across all server-rendered content

---

## Implementation Approach

### Phase 1: Core Implementation

1. Create or update `/src/lib/i18n/guest-language.ts`
2. Add constants if not present (`GUEST_LANGUAGE_COOKIE_NAME`, `GUEST_LANGUAGE_COOKIE_MAX_AGE`)
3. Implement `parseAcceptLanguageHeader()` helper (if not shared)
4. Implement `detectGuestLanguageFromRequest()` function
5. Add comprehensive JSDoc documentation
6. Add inline code examples

### Phase 2: Export Integration

1. Update `/src/lib/i18n/index.ts` with new exports:
   ```typescript
   export {
     detectGuestLanguageFromRequest,
     GUEST_LANGUAGE_COOKIE_NAME,
     GUEST_LANGUAGE_COOKIE_MAX_AGE,
   } from './guest-language';
   ```
2. Verify all exports compile correctly

### Phase 3: Verification

1. Verify function handles all priority levels correctly
2. Verify edge cases (null headers, invalid cookies, malformed Accept-Language)
3. Ensure type safety throughout

---

## Code Structure Template

```typescript
/**
 * Guest Language Utility Module - Server-Side Functions
 *
 * Provides server-side language detection for unauthenticated guest users
 * viewing public content via middleware and server components.
 *
 * Priority Order:
 * 1. URL parameter (?lang=fr)
 * 2. Cookie (FAQBNB_GUEST_LANG)
 * 3. Accept-Language header
 * 4. Default locale ('en')
 *
 * REQ-356: Create Server-Side Language Detection Utility
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 6, Task 6.2
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
 * Internal language preference type for parsing
 */
interface LanguageQuality {
  locale: string;
  quality: number;
}

/**
 * Parse Accept-Language header and return language codes sorted by preference.
 *
 * The Accept-Language header follows RFC 7231 format:
 * Accept-Language: fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
 *
 * @param header - The Accept-Language header value (may be null)
 * @returns Array of language codes sorted by quality value (highest first)
 *
 * @example
 * parseAcceptLanguageHeader('fr-FR, fr;q=0.9, en;q=0.8')
 * // Returns: ['fr', 'en']
 *
 * @example
 * parseAcceptLanguageHeader(null)
 * // Returns: []
 */
function parseAcceptLanguageHeader(header: string | null): string[] {
  if (!header) {
    return [];
  }

  const languages: LanguageQuality[] = header
    .split(',')
    .map((lang) => {
      const trimmed = lang.trim();
      const [code, qValue] = trimmed.split(';q=');

      // Extract primary language tag (e.g., 'fr' from 'fr-FR')
      const primaryCode = code.split('-')[0].toLowerCase();

      // Parse quality value, default to 1.0 if not specified
      const quality = qValue ? parseFloat(qValue) : 1.0;

      return {
        locale: primaryCode,
        quality: isNaN(quality) ? 0 : quality,
      };
    })
    // Filter out invalid entries (empty locale or wildcard)
    .filter((lang) => lang.locale && lang.locale !== '*' && lang.quality > 0);

  // Sort by quality descending
  languages.sort((a, b) => b.quality - a.quality);

  // Return unique locales in preference order
  const seen = new Set<string>();
  return languages
    .map((l) => l.locale)
    .filter((locale) => {
      if (seen.has(locale)) return false;
      seen.add(locale);
      return true;
    });
}

// =============================================================================
// Server-Side Language Detection
// =============================================================================

/**
 * Detect guest's preferred language from NextRequest for middleware usage.
 *
 * Priority Order:
 * 1. URL parameter (urlParam) - highest priority for shareable links
 * 2. Guest language cookie (FAQBNB_GUEST_LANG) - persistence
 * 3. Accept-Language header - browser detection
 * 4. Default locale ('en') - fallback
 *
 * @param request - The incoming Next.js request object
 * @param urlParam - Optional URL lang parameter from searchParams
 * @returns The detected locale code (always a supported locale)
 *
 * @example
 * // In middleware
 * const urlLang = req.nextUrl.searchParams.get('lang');
 * const locale = detectGuestLanguageFromRequest(req, urlLang);
 * res.headers.set('x-locale', locale);
 *
 * @example
 * // Without URL parameter
 * const locale = detectGuestLanguageFromRequest(req);
 */
export function detectGuestLanguageFromRequest(
  request: NextRequest,
  urlParam?: string | null
): SupportedLocale {
  // Priority 1: URL parameter
  if (urlParam) {
    const normalizedParam = normalizeLocale(urlParam);
    if (isSupportedLocale(normalizedParam)) {
      console.log('[i18n-guest] Language detected from URL param:', normalizedParam);
      return normalizedParam;
    }
    console.log('[i18n-guest] Invalid URL param, falling through:', urlParam);
  }

  // Priority 2: Guest language cookie
  const cookieLocale = request.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value;
  if (cookieLocale) {
    const normalizedCookie = normalizeLocale(cookieLocale);
    if (isSupportedLocale(normalizedCookie)) {
      console.log('[i18n-guest] Language detected from cookie:', normalizedCookie);
      return normalizedCookie;
    }
    console.log('[i18n-guest] Invalid cookie value, falling through:', cookieLocale);
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLocales = parseAcceptLanguageHeader(acceptLanguage);

  for (const locale of headerLocales) {
    const normalized = normalizeLocale(locale);
    if (isSupportedLocale(normalized)) {
      console.log('[i18n-guest] Language detected from Accept-Language:', normalized);
      return normalized;
    }
  }

  // Priority 4: Default locale
  console.log('[i18n-guest] Using default locale:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}
```

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Middleware reads language from URL query parameter with highest priority | `detectGuestLanguageFromRequest()` checks `urlParam` first |
| Middleware reads language preference from cookie when query parameter is absent | Checks `GUEST_LANGUAGE_COOKIE_NAME` after URL param |
| Middleware parses Accept-Language header as fallback when cookie is not present | Calls `parseAcceptLanguageHeader()` when no cookie |
| Middleware uses default language when no other preference indicators exist | Returns `DEFAULT_LOCALE` as final fallback |
| Detected language is validated against supported language codes list | Uses `isSupportedLocale()` for all validations |
| Invalid language codes trigger fallback to default language | Falls through cascade when validation fails |
| Page components can access detected language from request headers | Middleware sets `x-locale` header (Task 6.1 integration) |
| Solution works correctly for both initial page loads and client-side navigation | Server-side detection works on all requests |

---

## Testing Considerations

### Unit Tests to Create

1. **`detectGuestLanguageFromRequest()`**
   - URL param takes highest priority
   - Cookie used when no URL param
   - Accept-Language header used when no URL/cookie
   - Default returned when all fail
   - Invalid URL param falls through
   - Invalid cookie falls through
   - Regional variants normalized (`fr-CA` -> `fr`)
   - Unsupported languages fall to next priority

2. **`parseAcceptLanguageHeader()`**
   - Empty/null header returns `[]`
   - Single language without quality
   - Multiple languages with qualities
   - Malformed entries skipped
   - Wildcard (`*`) filtered
   - Regional variants extracted to base code
   - Duplicate codes deduplicated

### Test Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| URL `?lang=fr`, cookie `de`, header `es` | Returns `'fr'` |
| URL `?lang=invalid`, cookie `de`, header `es` | Returns `'de'` |
| No URL, cookie `de`, header `es` | Returns `'de'` |
| No URL, no cookie, header `es-MX, en;q=0.8` | Returns `'es'` |
| No URL, no cookie, header `zh-CN, ko;q=0.8` | Returns `'en'` (default) |
| No URL, no cookie, no header | Returns `'en'` (default) |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Conflict with existing `language-detection.ts` patterns | Low | Medium | Use distinct function name `detectGuestLanguageFromRequest` |
| Cookie name confusion (`FAQBNB_LANG` vs `FAQBNB_GUEST_LANG`) | Low | Low | Clear documentation, distinct constant names |
| Accept-Language parsing edge cases | Medium | Low | Comprehensive error handling, fallback to default |
| Performance impact from logging | Low | Low | Log statements can be removed for production |
| Type safety with string inputs | Medium | Low | Validate all inputs with `isSupportedLocale()` |

---

## Dependencies

### Blocking Dependencies (Must Complete First)

- **REQ-339**: Create Guest Language Utility Module - Provides guest-specific constants and potentially some shared functions (if not already completed, this task can proceed independently)

### Non-Blocking Dependencies

- **Epic 1 Foundation** (already complete) - Provides core i18n infrastructure (`config.ts`, types)

### Dependent Tasks (Will Use This)

- **REQ-356 Task 6.1**: Add Guest Language Detection to Middleware - Will call `detectGuestLanguageFromRequest()` from middleware

---

## Estimated Effort

**Complexity:** Low
**Estimated Time:** 1-2 hours

- Core implementation: 45-60 minutes
- JSDoc documentation: 15-20 minutes
- Export integration: 10 minutes
- Testing verification: 15-20 minutes

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md` (REQ-356)
- Existing i18n Config: `/src/lib/i18n/config.ts`
- Existing Language Detection: `/src/lib/i18n/language-detection.ts`
- Related Guest Utilities: `/src/lib/i18n/guest-language.ts` (if exists from REQ-339)
- Middleware: `/src/middleware.ts`
- Guest Item Page: `/src/app/item/[publicId]/page.tsx`
