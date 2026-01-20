# REQ-E04-022: Create Server-Side Language Detection Utility - Implementation Overview

**Document Created:** 2026-01-20 23:45 UTC
**Last Modified:** 2026-01-20 23:45 UTC
**Request ID:** REQ-E04-022
**Epic:** Epic 4 - Guest Experience
**Phase:** 6 - Middleware & Language Detection
**Task ID:** 6.2
**Size:** M (Medium)
**Priority:** P1 - High

---

## 1. Summary

Create a dedicated server-side utility function that reads guest language preferences from `NextRequest` cookies and headers with defined priority logic. The function will be added to `/src/lib/i18n/guest-language.ts` (server-side version) and will implement the priority cascade: URL param > Cookie > Accept-Language header > default (English).

This utility enables consistent, centralized language detection across all server-side code paths including server components, API routes, and middleware, eliminating code duplication and ensuring reliable guest language handling.

---

## 2. Requirements Reference

### From Request REQ-E04-022

- Create a server-side utility function in `/src/lib/i18n/guest-language.ts`
- Accept `NextRequest` object as input parameter
- Return a valid supported language code
- Implement priority order: URL param > Cookie > Accept-Language header > default (English)
- Validate all detected language codes against supported languages
- Handle malformed headers and corrupted cookies gracefully without throwing errors
- Be a pure function with no side effects (does not modify request state)

### From Implementation Plan (Plan-111, Phase 6, Task 6.2)

**File:** `/src/lib/i18n/guest-language.ts` (server-side version)

**Key Requirements:**
- Read from NextRequest cookies and headers
- Priority: URL param > Cookie > Accept-Language > default
- Parse Accept-Language header according to HTTP standards
- Map regional language variants (e.g., en-US, zh-CN) to supported base languages
- Validate against supported languages before returning

---

## 3. Existing Codebase Analysis

### Existing Infrastructure (from Epic 1 Foundation)

The i18n module at `/src/lib/i18n/` provides substantial infrastructure:

| File | Relevant Exports | Usage |
|------|-----------------|-------|
| `config.ts` | `SupportedLocale`, `locales`, `DEFAULT_LOCALE`, `LOCALE_COOKIE_NAME`, `isSupportedLocale`, `normalizeLocale` | Type definitions, constants, validation |
| `language-detection.ts` | `detectUserLanguage()`, `setLocaleCookie()`, `parseAcceptLanguageHeader()` (private) | Server-side detection for authenticated users |
| `index.ts` | Centralized exports | Public API |

### Key Existing Functions to Leverage

1. **`isSupportedLocale(locale: string)`** - Type guard for validating locale codes (from `config.ts:158`)
2. **`normalizeLocale(locale: string | null | undefined)`** - Maps regional codes to supported languages (from `config.ts:168`)
3. **`parseAcceptLanguageHeader(acceptLanguage: string | null)`** - Parses Accept-Language header with quality values (private function in `language-detection.ts:85`)

### Existing Authenticated User Detection

From `/src/lib/i18n/language-detection.ts`, the `detectUserLanguage` function implements a similar cascade for authenticated users:

```typescript
// Priority Order:
// 1. User database preference (if user provided and has preference)
// 2. Cookie value (FAQBNB_LANG)
// 3. Accept-Language header (first supported match)
// 4. Default locale ('en')
```

**Gap:** The existing `detectUserLanguage` requires a user object and performs database lookup. Guest detection needs a simplified cascade without database dependency.

### Cookie Configuration (from `config.ts:48-53`)

```typescript
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year
```

### Middleware Pattern (from `middleware.ts`)

The middleware already performs language detection for authenticated users at line 141:
```typescript
const detectedLocale = detectUserLanguage(req, userLocalePreference);
```

The middleware also:
- Sets `x-locale` header for server components (line 144)
- Updates the locale cookie when changed (lines 147-154)
- Currently does NOT match `/item/*` routes (line 286-299)

---

## 4. Implementation Approach

### 4.1 Detection Priority Cascade

```
URL Parameter (?lang=fr) → Cookie (FAQBNB_LANG) → Accept-Language Header → Default ('en')
```

This is the guest-specific cascade that differs from the authenticated user cascade (which includes database preference).

### 4.2 Function Specification

#### `detectGuestLanguageFromRequest(request: NextRequest)`

```typescript
/**
 * Detects the guest's preferred language from a NextRequest object.
 * Uses a server-side priority cascade for unauthenticated guests.
 *
 * Priority Order:
 * 1. URL query parameter (?lang=fr)
 * 2. Cookie (FAQBNB_LANG)
 * 3. Accept-Language header
 * 4. Default ('en')
 *
 * @param request - The NextRequest object from Next.js middleware/server
 * @returns The detected SupportedLocale (always valid)
 */
export function detectGuestLanguageFromRequest(
  request: NextRequest
): SupportedLocale;
```

**Implementation Steps:**

1. **URL Parameter Check:**
   - Read `request.nextUrl.searchParams.get('lang')`
   - Validate with `isSupportedLocale()`
   - If valid, return immediately

2. **Cookie Check:**
   - Read `request.cookies.get(LOCALE_COOKIE_NAME)?.value`
   - Validate with `isSupportedLocale()`
   - If valid, return immediately

3. **Accept-Language Header Check:**
   - Read `request.headers.get('Accept-Language')`
   - Parse with `parseAcceptLanguage()` function
   - Iterate through parsed languages
   - Map each to supported language using `normalizeLocale()`
   - Return first supported match

4. **Default Fallback:**
   - Return `DEFAULT_LOCALE` ('en')

### 4.3 Helper Function: parseAcceptLanguage

Either:
- Export the existing private `parseAcceptLanguageHeader` from `language-detection.ts`, OR
- Create a public wrapper in `guest-language.ts`

```typescript
/**
 * Parses the Accept-Language header and returns language codes sorted by preference.
 *
 * @param header - The Accept-Language header value (may be null)
 * @returns Array of language codes sorted by quality value (highest first)
 *
 * @example
 * parseAcceptLanguage('fr-FR, fr;q=0.9, en;q=0.8')
 * // Returns: ['fr', 'en']
 */
export function parseAcceptLanguage(header: string | null): string[];
```

### 4.4 Type Definitions

```typescript
/**
 * Result of server-side guest language detection with metadata.
 * Useful for debugging and analytics.
 */
export interface ServerLanguageDetectionResult {
  /** The detected language */
  language: SupportedLocale;
  /** Source of the detection */
  source: 'url' | 'cookie' | 'header' | 'default';
  /** Raw value that was detected (before validation) */
  rawValue?: string;
}
```

---

## 5. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| None | Function will be added to existing `guest-language.ts` file |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/lib/i18n/guest-language.ts` | Add `detectGuestLanguageFromRequest` function |
| `/src/lib/i18n/language-detection.ts` | Export `parseAcceptLanguageHeader` function (currently private) |
| `/src/lib/i18n/index.ts` | Add exports for new function |

### Functions to Create

| Function | Signature | Location |
|----------|-----------|----------|
| `detectGuestLanguageFromRequest` | `(request: NextRequest) => SupportedLocale` | `guest-language.ts` |
| `detectGuestLanguageFromRequestWithMeta` | `(request: NextRequest) => ServerLanguageDetectionResult` | `guest-language.ts` |

### Functions to Modify

| Function | File | Change |
|----------|------|--------|
| `parseAcceptLanguageHeader` | `language-detection.ts` | Change from private to exported function |

### Exports to Add

In `/src/lib/i18n/index.ts`:
```typescript
export {
  // Existing exports...
  detectGuestLanguageFromRequest,
  detectGuestLanguageFromRequestWithMeta,
  type ServerLanguageDetectionResult,
} from './guest-language';
```

---

## 6. Implementation Tasks

### Task 1: Export parseAcceptLanguageHeader from language-detection.ts
- Change `function parseAcceptLanguageHeader` to `export function parseAcceptLanguageHeader`
- Update the module's exports section if needed
- Ensure no breaking changes to existing internal usage

### Task 2: Add detectGuestLanguageFromRequest to guest-language.ts
- Add JSDoc documentation with @created, @lastModified, reference to REQ-E04-022
- Import `NextRequest` from `next/server`
- Import required utilities from `./config` and `./language-detection`
- Implement priority cascade: URL param → Cookie → Header → Default
- Add console logging for debugging (following existing pattern)

### Task 3: Add detectGuestLanguageFromRequestWithMeta function
- Extended version that returns detection metadata
- Include source information ('url', 'cookie', 'header', 'default')
- Include raw detected value before normalization

### Task 4: Add type definition for ServerLanguageDetectionResult
- Add to `guest-language.ts` or appropriate types file
- Export from index.ts

### Task 5: Update index.ts with new exports
- Add `detectGuestLanguageFromRequest`
- Add `detectGuestLanguageFromRequestWithMeta`
- Add `ServerLanguageDetectionResult` type
- Maintain alphabetical ordering of exports

### Task 6: Add inline documentation
- Document the priority order in function JSDoc
- Document return behavior for each priority level
- Include usage examples

---

## 7. Code Example

```typescript
// /src/lib/i18n/guest-language.ts (additions)

import { NextRequest } from 'next/server';
import {
  SupportedLocale,
  LOCALE_COOKIE_NAME,
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
} from './config';
import { parseAcceptLanguageHeader } from './language-detection';

/**
 * Result of server-side guest language detection with metadata.
 */
export interface ServerLanguageDetectionResult {
  language: SupportedLocale;
  source: 'url' | 'cookie' | 'header' | 'default';
  rawValue?: string;
}

/**
 * Detects the guest's preferred language from a NextRequest object.
 * Uses a server-side priority cascade for unauthenticated guests.
 *
 * Priority Order:
 * 1. URL query parameter (?lang=fr)
 * 2. Cookie (FAQBNB_LANG)
 * 3. Accept-Language header
 * 4. Default ('en')
 *
 * @param request - The NextRequest object from Next.js middleware/server
 * @returns The detected SupportedLocale (always valid)
 *
 * @example
 * // In middleware or server component
 * const language = detectGuestLanguageFromRequest(request);
 *
 * @example
 * // In API route
 * export async function GET(request: NextRequest) {
 *   const language = detectGuestLanguageFromRequest(request);
 *   // ... fetch translated content
 * }
 */
export function detectGuestLanguageFromRequest(
  request: NextRequest
): SupportedLocale {
  const result = detectGuestLanguageFromRequestWithMeta(request);
  return result.language;
}

/**
 * Detects the guest's preferred language with metadata about the detection source.
 *
 * @param request - The NextRequest object from Next.js middleware/server
 * @returns Detection result including language, source, and raw value
 */
export function detectGuestLanguageFromRequestWithMeta(
  request: NextRequest
): ServerLanguageDetectionResult {
  // Priority 1: URL query parameter
  const urlParam = request.nextUrl.searchParams.get('lang');
  if (urlParam) {
    const normalized = normalizeLocale(urlParam);
    if (isSupportedLocale(normalized)) {
      console.log('[i18n-guest] Language from URL param:', normalized);
      return { language: normalized, source: 'url', rawValue: urlParam };
    }
    console.log('[i18n-guest] Invalid URL param, continuing:', urlParam);
  }

  // Priority 2: Cookie
  const cookieValue = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieValue && isSupportedLocale(cookieValue)) {
    console.log('[i18n-guest] Language from cookie:', cookieValue);
    return { language: cookieValue, source: 'cookie', rawValue: cookieValue };
  }
  if (cookieValue) {
    console.log('[i18n-guest] Invalid cookie value, continuing:', cookieValue);
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const headerLanguages = parseAcceptLanguageHeader(acceptLanguage);
    for (const lang of headerLanguages) {
      const normalized = normalizeLocale(lang);
      if (isSupportedLocale(normalized)) {
        console.log('[i18n-guest] Language from header:', normalized);
        return { language: normalized, source: 'header', rawValue: lang };
      }
    }
    console.log('[i18n-guest] No supported language in header');
  }

  // Priority 4: Default
  console.log('[i18n-guest] Using default:', DEFAULT_LOCALE);
  return { language: DEFAULT_LOCALE, source: 'default' };
}
```

---

## 8. Dependencies

### Internal Dependencies (from Epic 1)

| Dependency | Status | Location |
|------------|--------|----------|
| `SupportedLocale` type | ✅ Available | `/src/lib/i18n/config.ts` |
| `LOCALE_COOKIE_NAME` constant | ✅ Available | `/src/lib/i18n/config.ts` |
| `DEFAULT_LOCALE` constant | ✅ Available | `/src/lib/i18n/config.ts` |
| `isSupportedLocale` function | ✅ Available | `/src/lib/i18n/config.ts` |
| `normalizeLocale` function | ✅ Available | `/src/lib/i18n/config.ts` |
| `parseAcceptLanguageHeader` function | ⚠️ Private | `/src/lib/i18n/language-detection.ts` (needs export) |

### External Dependencies

| Package | Usage | Status |
|---------|-------|--------|
| `next/server` | `NextRequest` type | ✅ Already installed |

### Related Epic 4 Dependencies

| Task | Description | Status |
|------|-------------|--------|
| REQ-E04-002 | Guest language utility module | Required (provides base structure) |
| REQ-E04-020 | Add guest language detection to middleware | Uses this function |

---

## 9. Testing Considerations

### Unit Test Cases

| Function | Test Case | Expected Result |
|----------|-----------|-----------------|
| `detectGuestLanguageFromRequest` | Valid URL param `?lang=fr` | `'fr'` |
| `detectGuestLanguageFromRequest` | Invalid URL param `?lang=xyz` | Falls through to cookie/header |
| `detectGuestLanguageFromRequest` | URL param with regional variant `?lang=en-US` | `'en'` |
| `detectGuestLanguageFromRequest` | URL param case insensitive `?lang=FR` | `'fr'` |
| `detectGuestLanguageFromRequest` | Valid cookie, no URL param | Cookie value |
| `detectGuestLanguageFromRequest` | Invalid cookie value | Falls through to header |
| `detectGuestLanguageFromRequest` | Valid Accept-Language, no cookie | First supported language |
| `detectGuestLanguageFromRequest` | Accept-Language with quality values | Highest quality supported |
| `detectGuestLanguageFromRequest` | Accept-Language regional variants | Mapped to supported |
| `detectGuestLanguageFromRequest` | No sources available | `'en'` (default) |
| `detectGuestLanguageFromRequest` | Malformed Accept-Language header | Graceful handling, default |
| `detectGuestLanguageFromRequest` | null request values | Graceful handling, default |
| `detectGuestLanguageFromRequestWithMeta` | URL param present | `{ language: 'fr', source: 'url' }` |
| `detectGuestLanguageFromRequestWithMeta` | Cookie present | `{ language: 'es', source: 'cookie' }` |
| `detectGuestLanguageFromRequestWithMeta` | Header only | `{ language: 'de', source: 'header' }` |
| `detectGuestLanguageFromRequestWithMeta` | Default | `{ language: 'en', source: 'default' }` |

### Edge Cases to Test

- Empty string URL parameter `?lang=`
- Whitespace-only URL parameter `?lang=%20`
- Cookie present but empty
- Accept-Language with only unsupported languages
- Accept-Language with wildcard `*`
- Accept-Language with malformed quality values
- Mixed valid and invalid sources (URL invalid, cookie valid)

### Integration Test Cases

- Full detection cascade in middleware context
- Detection in API route handler
- Detection in server component

---

## 10. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| Function in `/src/lib/i18n/guest-language.ts` | `detectGuestLanguageFromRequest` function |
| Accept NextRequest object | Function parameter type |
| Return supported language code | Return type `SupportedLocale` |
| URL param priority highest | First check in cascade |
| Cookie priority second | Second check in cascade |
| Accept-Language priority third | Third check in cascade |
| Default to English | Final fallback `DEFAULT_LOCALE` |
| Validate language codes | Use `isSupportedLocale()` and `normalizeLocale()` |
| Handle malformed headers | Try/catch and graceful fallback |
| Handle corrupted cookies | Validation before use |
| Pure function, no side effects | No cookie/header modification |
| Export from guest-language module | Export statement added |

---

## 11. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| `parseAcceptLanguageHeader` not exported | High | Low | Create local copy if export changes are problematic |
| Circular imports between modules | Medium | Low | Import only from config.ts, not index.ts |
| Inconsistent behavior with `detectUserLanguage` | Medium | Low | Follow same patterns, share parsing logic |
| Performance impact from header parsing | Low | Low | Parsing is lightweight; cache if needed |
| Regional language mapping issues | Low | Medium | Use existing `normalizeLocale()` which handles this |

---

## 12. Integration with Other Tasks

### Task REQ-E04-020 (Middleware Guest Language Detection)

The middleware will use this function:

```typescript
// In middleware.ts (Task 6.1)
import { detectGuestLanguageFromRequest } from '@/lib/i18n';

// Inside middleware function for /item/* routes
const guestLanguage = detectGuestLanguageFromRequest(req);
res.headers.set('x-guest-language', guestLanguage);
```

### Task REQ-E04-016 (Guest Item Page Server Component)

Server components will use this function:

```typescript
// In /src/app/item/[publicId]/page.tsx (Task 5.1)
import { detectGuestLanguageFromRequest } from '@/lib/i18n';
import { headers } from 'next/headers';

// Can read from middleware-set header or detect directly
const headersList = await headers();
const guestLanguage = headersList.get('x-guest-language') || 'en';
```

### Task REQ-E04-005 (Public Item API Endpoint)

API routes will use this function:

```typescript
// In /src/app/api/public/items/[publicId]/route.ts (Task 2.2)
import { detectGuestLanguageFromRequest } from '@/lib/i18n';

export async function GET(request: NextRequest) {
  const language = detectGuestLanguageFromRequest(request);
  // Fetch item with translations for detected language
}
```

---

## 13. References

- **Request Document:** `/docs/gen_requests_epic4.md` - REQ-E04-022
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Related Task REQ-E04-002:** `/docs/REQ-E04-002-create-guest-language-utility-module-overview.md`
- **Existing i18n Module:** `/src/lib/i18n/`
- **Epic 1 Language Detection:** `/src/lib/i18n/language-detection.ts`
- **Epic 1 Config:** `/src/lib/i18n/config.ts`
- **Middleware:** `/src/middleware.ts`
- **Guest Item Page:** `/src/app/item/[publicId]/page.tsx`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 6, Task 6.2*
