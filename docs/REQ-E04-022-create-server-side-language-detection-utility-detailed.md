# REQ-E04-022: Create Server-Side Language Detection Utility - Detailed Task Breakdown

**Document Created:** 2026-01-20 23:58 UTC
**Last Modified:** 2026-01-20 23:58 UTC
**Request ID:** REQ-E04-022
**Epic:** Epic 4 - Guest Experience
**Phase:** 6 - Middleware & Language Detection
**Task ID:** 6.2
**Size:** M (Medium)
**Priority:** P1 - High

---

## 1. Document Purpose

This detailed task breakdown document provides granular, actionable implementation tasks for creating a server-side language detection utility function. Each task is designed to be approximately 1 story point, enabling step-by-step implementation by an AI coding agent or developer.

---

## 2. Summary

Create a dedicated server-side utility function `detectGuestLanguageFromRequest` that reads guest language preferences from `NextRequest` cookies and headers with defined priority logic. The function will be added to `/src/lib/i18n/guest-language.ts` and will implement the priority cascade: URL param > Cookie > Accept-Language header > default (English).

---

## 3. Prerequisites

### Required Files (Must Exist)

| File | Status | Contains |
|------|--------|----------|
| `/src/lib/i18n/config.ts` | ✅ Verified | `SupportedLocale`, `LOCALE_COOKIE_NAME`, `DEFAULT_LOCALE`, `isSupportedLocale`, `normalizeLocale` |
| `/src/lib/i18n/language-detection.ts` | ✅ Verified | `parseAcceptLanguageHeader` (currently private), `detectUserLanguage` |
| `/src/lib/i18n/index.ts` | ✅ Verified | Centralized exports |

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/i18n/guest-language.ts` | New file for guest-specific language detection utilities |

### Key Dependencies from Existing Code

From `/src/lib/i18n/config.ts`:
- `SupportedLocale` type (line 31)
- `LOCALE_COOKIE_NAME` constant (line 48): `'FAQBNB_LANG'`
- `DEFAULT_LOCALE` constant (line 42): `'en'`
- `isSupportedLocale()` function (line 158)
- `normalizeLocale()` function (line 168)

From `/src/lib/i18n/language-detection.ts`:
- `parseAcceptLanguageHeader()` function (line 85) - **Currently private, needs to be exported**

---

## 4. Detailed Implementation Tasks

### Task 1: Export parseAcceptLanguageHeader from language-detection.ts

**File:** `/src/lib/i18n/language-detection.ts`
**Estimated Effort:** 1 story point
**Dependencies:** None

#### Description
Modify the `parseAcceptLanguageHeader` function from private to exported so it can be reused by the guest language detection utility.

#### Current State (Line 85)
```typescript
function parseAcceptLanguageHeader(acceptLanguage: string | null): string[] {
```

#### Target State
```typescript
export function parseAcceptLanguageHeader(acceptLanguage: string | null): string[] {
```

#### Implementation Steps

1. **Locate the function** at line 85 in `/src/lib/i18n/language-detection.ts`
2. **Add `export` keyword** before `function` keyword
3. **Verify internal usage** - The function is used internally by `detectUserLanguage` at line 202. Adding export does not break this usage.
4. **No changes needed** to the function body or JSDoc

#### Verification
- Run TypeScript compilation: `npx tsc --noEmit`
- Verify function is now importable: `import { parseAcceptLanguageHeader } from './language-detection'`

#### Acceptance Criteria
- [ ] Function has `export` keyword
- [ ] No breaking changes to existing `detectUserLanguage` function
- [ ] TypeScript compiles without errors

---

### Task 2: Create guest-language.ts file with imports and types

**File:** `/src/lib/i18n/guest-language.ts` (NEW)
**Estimated Effort:** 1 story point
**Dependencies:** Task 1

#### Description
Create the new guest-language.ts file with the necessary imports, type definitions, and file header.

#### Implementation

```typescript
/**
 * Guest Language Detection Utilities
 *
 * Server-side utilities for detecting guest language preferences from NextRequest objects.
 * Implements a priority cascade: URL param > Cookie > Accept-Language header > default.
 *
 * REQ-E04-022: Create Server-Side Language Detection Utility Function
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 6, Task 6.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { NextRequest } from 'next/server';
import {
  SupportedLocale,
  LOCALE_COOKIE_NAME,
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
} from './config';
import { parseAcceptLanguageHeader } from './language-detection';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of server-side guest language detection with metadata.
 * Useful for debugging, analytics, and determining translation display logic.
 */
export interface ServerLanguageDetectionResult {
  /** The detected language code (always a valid SupportedLocale) */
  language: SupportedLocale;
  /** Source of the detection indicating which method yielded the result */
  source: 'url' | 'cookie' | 'header' | 'default';
  /** Raw value that was detected before validation/normalization (if applicable) */
  rawValue?: string;
}
```

#### Verification
- File exists at `/src/lib/i18n/guest-language.ts`
- TypeScript compiles without import errors

#### Acceptance Criteria
- [ ] File created with correct header and module documentation
- [ ] All imports resolve correctly
- [ ] `ServerLanguageDetectionResult` interface is defined and exported
- [ ] TypeScript compiles without errors

---

### Task 3: Implement detectGuestLanguageFromRequestWithMeta function

**File:** `/src/lib/i18n/guest-language.ts`
**Estimated Effort:** 2 story points
**Dependencies:** Task 2

#### Description
Implement the core detection function that returns both the detected language and metadata about the detection source.

#### Implementation

Add the following after the types section:

```typescript
// =============================================================================
// Core Detection Function
// =============================================================================

/**
 * Detects the guest's preferred language from a NextRequest object with metadata.
 *
 * This function examines the request to determine the guest's preferred language
 * using a strict priority cascade. It returns both the detected language and
 * metadata about which source yielded the result.
 *
 * Priority Order:
 * 1. URL query parameter (?lang=fr) - Enables shareable language-specific links
 * 2. Cookie (FAQBNB_LANG) - Persisted preference from previous visits
 * 3. Accept-Language header - Browser language preference
 * 4. Default ('en') - Fallback when no preference detected
 *
 * @param request - The NextRequest object from Next.js middleware/server
 * @returns Detection result including language, source, and optional raw value
 *
 * @example
 * // In API route handler
 * export async function GET(request: NextRequest) {
 *   const result = detectGuestLanguageFromRequestWithMeta(request);
 *   console.log(`Detected ${result.language} from ${result.source}`);
 *   // ... fetch content in detected language
 * }
 *
 * @example
 * // For analytics/debugging
 * const { language, source, rawValue } = detectGuestLanguageFromRequestWithMeta(request);
 * if (source === 'header' && rawValue !== language) {
 *   console.log(`Normalized ${rawValue} to ${language}`);
 * }
 */
export function detectGuestLanguageFromRequestWithMeta(
  request: NextRequest
): ServerLanguageDetectionResult {
  // Priority 1: URL query parameter (?lang=fr)
  const urlParam = request.nextUrl.searchParams.get('lang');
  if (urlParam) {
    const normalized = normalizeLocale(urlParam);
    if (isSupportedLocale(normalized)) {
      console.log('[i18n-guest] Language from URL param:', normalized);
      return { language: normalized, source: 'url', rawValue: urlParam };
    }
    console.log('[i18n-guest] Invalid URL param, continuing cascade:', urlParam);
  }

  // Priority 2: Cookie (FAQBNB_LANG)
  const cookieValue = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieValue) {
    if (isSupportedLocale(cookieValue)) {
      console.log('[i18n-guest] Language from cookie:', cookieValue);
      return { language: cookieValue, source: 'cookie', rawValue: cookieValue };
    }
    console.log('[i18n-guest] Invalid cookie value, continuing cascade:', cookieValue);
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const headerLanguages = parseAcceptLanguageHeader(acceptLanguage);
    for (const lang of headerLanguages) {
      const normalized = normalizeLocale(lang);
      if (isSupportedLocale(normalized)) {
        console.log('[i18n-guest] Language from Accept-Language header:', normalized);
        return { language: normalized, source: 'header', rawValue: lang };
      }
    }
    console.log('[i18n-guest] No supported language found in Accept-Language header');
  }

  // Priority 4: Default fallback
  console.log('[i18n-guest] Using default locale:', DEFAULT_LOCALE);
  return { language: DEFAULT_LOCALE, source: 'default' };
}
```

#### Key Implementation Details

1. **URL Parameter Check**
   - Uses `request.nextUrl.searchParams.get('lang')` to read the `lang` query parameter
   - Normalizes the value to handle case variations (e.g., `FR` -> `fr`)
   - Validates against supported locales before accepting

2. **Cookie Check**
   - Uses `request.cookies.get(LOCALE_COOKIE_NAME)?.value` for safe access
   - The cookie name `FAQBNB_LANG` is imported from config
   - No normalization needed since we control cookie values

3. **Accept-Language Header Check**
   - Uses the now-exported `parseAcceptLanguageHeader` function
   - Iterates through languages in preference order (sorted by q-value)
   - Each language is normalized to handle regional variants (e.g., `en-US` -> `en`)

4. **Logging**
   - Uses `[i18n-guest]` prefix to distinguish from authenticated user detection logs
   - Logs both success cases and fallthrough reasons for debugging

#### Verification
- Function compiles without TypeScript errors
- Console logging follows existing patterns

#### Acceptance Criteria
- [ ] Function implements all four priority levels correctly
- [ ] URL parameter takes highest priority
- [ ] Cookie takes second priority
- [ ] Accept-Language header takes third priority
- [ ] Falls back to `'en'` when no preference detected
- [ ] Returns `ServerLanguageDetectionResult` with correct types
- [ ] Includes appropriate console logging for debugging

---

### Task 4: Implement detectGuestLanguageFromRequest wrapper function

**File:** `/src/lib/i18n/guest-language.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 3

#### Description
Implement a convenience wrapper function that returns only the detected language code without metadata.

#### Implementation

Add after the `detectGuestLanguageFromRequestWithMeta` function:

```typescript
// =============================================================================
// Convenience Wrapper
// =============================================================================

/**
 * Detects the guest's preferred language from a NextRequest object.
 *
 * This is a convenience wrapper around `detectGuestLanguageFromRequestWithMeta`
 * that returns only the detected language code. Use this when you don't need
 * the detection metadata (source, raw value).
 *
 * Priority Order:
 * 1. URL query parameter (?lang=fr)
 * 2. Cookie (FAQBNB_LANG)
 * 3. Accept-Language header
 * 4. Default ('en')
 *
 * @param request - The NextRequest object from Next.js middleware/server
 * @returns The detected SupportedLocale (always valid, never throws)
 *
 * @example
 * // In middleware
 * import { detectGuestLanguageFromRequest } from '@/lib/i18n';
 *
 * export function middleware(request: NextRequest) {
 *   const guestLanguage = detectGuestLanguageFromRequest(request);
 *   // Set header for downstream components
 *   const response = NextResponse.next();
 *   response.headers.set('x-guest-language', guestLanguage);
 *   return response;
 * }
 *
 * @example
 * // In server component
 * import { detectGuestLanguageFromRequest } from '@/lib/i18n';
 *
 * export default async function ItemPage({ request }) {
 *   const language = detectGuestLanguageFromRequest(request);
 *   const item = await fetchTranslatedItem(publicId, language);
 *   // ...
 * }
 */
export function detectGuestLanguageFromRequest(
  request: NextRequest
): SupportedLocale {
  const result = detectGuestLanguageFromRequestWithMeta(request);
  return result.language;
}
```

#### Verification
- Function delegates to `detectGuestLanguageFromRequestWithMeta`
- Return type is `SupportedLocale`

#### Acceptance Criteria
- [ ] Function is exported
- [ ] Returns only the language code (no metadata)
- [ ] Return type is `SupportedLocale`
- [ ] JSDoc includes usage examples

---

### Task 5: Update index.ts with new exports

**File:** `/src/lib/i18n/index.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 4

#### Description
Add exports for the new guest language detection functions and types to the centralized i18n module exports.

#### Current State (Lines 42-48)
```typescript
// Language Detection exports (REQ-246)
export {
  detectUserLanguage,
  setLocaleCookie,
  type UserLocalePreference,
  type DetectLanguageOptions,
} from './language-detection';
```

#### Target State
```typescript
// Language Detection exports (REQ-246)
export {
  detectUserLanguage,
  setLocaleCookie,
  parseAcceptLanguageHeader,
  type UserLocalePreference,
  type DetectLanguageOptions,
} from './language-detection';

// Guest Language Detection exports (REQ-E04-022)
export {
  detectGuestLanguageFromRequest,
  detectGuestLanguageFromRequestWithMeta,
  type ServerLanguageDetectionResult,
} from './guest-language';
```

#### Implementation Steps

1. **Add `parseAcceptLanguageHeader` to language-detection exports** (since we exported it in Task 1)
2. **Add new export block for guest-language module**
3. **Maintain alphabetical ordering** where practical
4. **Update lastModified date in file header** (if present)

#### Verification
- All new functions can be imported from `@/lib/i18n`
- TypeScript compiles without errors

#### Acceptance Criteria
- [ ] `parseAcceptLanguageHeader` is exported from language-detection
- [ ] `detectGuestLanguageFromRequest` is exported
- [ ] `detectGuestLanguageFromRequestWithMeta` is exported
- [ ] `ServerLanguageDetectionResult` type is exported
- [ ] All exports can be imported via `import { ... } from '@/lib/i18n'`

---

### Task 6: Add inline documentation and examples

**File:** `/src/lib/i18n/guest-language.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 4

#### Description
Ensure all functions have comprehensive JSDoc documentation with examples, parameter descriptions, and return value documentation.

#### Verification Checklist

For `detectGuestLanguageFromRequestWithMeta`:
- [ ] Function description explaining purpose
- [ ] Priority order documented
- [ ] `@param request` documented
- [ ] `@returns` documented with full type description
- [ ] At least 2 `@example` blocks showing usage
- [ ] Edge case behavior documented

For `detectGuestLanguageFromRequest`:
- [ ] Function description explaining it's a convenience wrapper
- [ ] Priority order documented (or reference to other function)
- [ ] `@param request` documented
- [ ] `@returns` documented
- [ ] At least 2 `@example` blocks showing typical usage

For `ServerLanguageDetectionResult`:
- [ ] Interface description
- [ ] Each property documented with JSDoc
- [ ] Usage context explained

---

## 5. Complete File: guest-language.ts

For reference, here is the complete implementation:

```typescript
/**
 * Guest Language Detection Utilities
 *
 * Server-side utilities for detecting guest language preferences from NextRequest objects.
 * Implements a priority cascade: URL param > Cookie > Accept-Language header > default.
 *
 * REQ-E04-022: Create Server-Side Language Detection Utility Function
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 6, Task 6.2
 *
 * @module lib/i18n/guest-language
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { NextRequest } from 'next/server';
import {
  SupportedLocale,
  LOCALE_COOKIE_NAME,
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
} from './config';
import { parseAcceptLanguageHeader } from './language-detection';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of server-side guest language detection with metadata.
 * Useful for debugging, analytics, and determining translation display logic.
 */
export interface ServerLanguageDetectionResult {
  /** The detected language code (always a valid SupportedLocale) */
  language: SupportedLocale;
  /** Source of the detection indicating which method yielded the result */
  source: 'url' | 'cookie' | 'header' | 'default';
  /** Raw value that was detected before validation/normalization (if applicable) */
  rawValue?: string;
}

// =============================================================================
// Core Detection Function
// =============================================================================

/**
 * Detects the guest's preferred language from a NextRequest object with metadata.
 *
 * This function examines the request to determine the guest's preferred language
 * using a strict priority cascade. It returns both the detected language and
 * metadata about which source yielded the result.
 *
 * Priority Order:
 * 1. URL query parameter (?lang=fr) - Enables shareable language-specific links
 * 2. Cookie (FAQBNB_LANG) - Persisted preference from previous visits
 * 3. Accept-Language header - Browser language preference
 * 4. Default ('en') - Fallback when no preference detected
 *
 * @param request - The NextRequest object from Next.js middleware/server
 * @returns Detection result including language, source, and optional raw value
 *
 * @example
 * // In API route handler
 * export async function GET(request: NextRequest) {
 *   const result = detectGuestLanguageFromRequestWithMeta(request);
 *   console.log(`Detected ${result.language} from ${result.source}`);
 *   // ... fetch content in detected language
 * }
 *
 * @example
 * // For analytics/debugging
 * const { language, source, rawValue } = detectGuestLanguageFromRequestWithMeta(request);
 * if (source === 'header' && rawValue !== language) {
 *   console.log(`Normalized ${rawValue} to ${language}`);
 * }
 */
export function detectGuestLanguageFromRequestWithMeta(
  request: NextRequest
): ServerLanguageDetectionResult {
  // Priority 1: URL query parameter (?lang=fr)
  const urlParam = request.nextUrl.searchParams.get('lang');
  if (urlParam) {
    const normalized = normalizeLocale(urlParam);
    if (isSupportedLocale(normalized)) {
      console.log('[i18n-guest] Language from URL param:', normalized);
      return { language: normalized, source: 'url', rawValue: urlParam };
    }
    console.log('[i18n-guest] Invalid URL param, continuing cascade:', urlParam);
  }

  // Priority 2: Cookie (FAQBNB_LANG)
  const cookieValue = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieValue) {
    if (isSupportedLocale(cookieValue)) {
      console.log('[i18n-guest] Language from cookie:', cookieValue);
      return { language: cookieValue, source: 'cookie', rawValue: cookieValue };
    }
    console.log('[i18n-guest] Invalid cookie value, continuing cascade:', cookieValue);
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const headerLanguages = parseAcceptLanguageHeader(acceptLanguage);
    for (const lang of headerLanguages) {
      const normalized = normalizeLocale(lang);
      if (isSupportedLocale(normalized)) {
        console.log('[i18n-guest] Language from Accept-Language header:', normalized);
        return { language: normalized, source: 'header', rawValue: lang };
      }
    }
    console.log('[i18n-guest] No supported language found in Accept-Language header');
  }

  // Priority 4: Default fallback
  console.log('[i18n-guest] Using default locale:', DEFAULT_LOCALE);
  return { language: DEFAULT_LOCALE, source: 'default' };
}

// =============================================================================
// Convenience Wrapper
// =============================================================================

/**
 * Detects the guest's preferred language from a NextRequest object.
 *
 * This is a convenience wrapper around `detectGuestLanguageFromRequestWithMeta`
 * that returns only the detected language code. Use this when you don't need
 * the detection metadata (source, raw value).
 *
 * Priority Order:
 * 1. URL query parameter (?lang=fr)
 * 2. Cookie (FAQBNB_LANG)
 * 3. Accept-Language header
 * 4. Default ('en')
 *
 * @param request - The NextRequest object from Next.js middleware/server
 * @returns The detected SupportedLocale (always valid, never throws)
 *
 * @example
 * // In middleware
 * import { detectGuestLanguageFromRequest } from '@/lib/i18n';
 *
 * export function middleware(request: NextRequest) {
 *   const guestLanguage = detectGuestLanguageFromRequest(request);
 *   // Set header for downstream components
 *   const response = NextResponse.next();
 *   response.headers.set('x-guest-language', guestLanguage);
 *   return response;
 * }
 *
 * @example
 * // In API route
 * import { detectGuestLanguageFromRequest } from '@/lib/i18n';
 *
 * export async function GET(request: NextRequest) {
 *   const language = detectGuestLanguageFromRequest(request);
 *   const item = await fetchTranslatedItem(publicId, language);
 *   return NextResponse.json(item);
 * }
 */
export function detectGuestLanguageFromRequest(
  request: NextRequest
): SupportedLocale {
  const result = detectGuestLanguageFromRequestWithMeta(request);
  return result.language;
}
```

---

## 6. Testing Considerations

### Unit Test Cases

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Valid URL param `?lang=fr` | URL with `lang=fr` | `{ language: 'fr', source: 'url', rawValue: 'fr' }` |
| Invalid URL param `?lang=xyz` | URL with `lang=xyz` | Falls through to cookie/header |
| URL param with regional variant `?lang=en-US` | URL with `lang=en-US` | `{ language: 'en', source: 'url', rawValue: 'en-US' }` |
| URL param case insensitive `?lang=FR` | URL with `lang=FR` | `{ language: 'fr', source: 'url', rawValue: 'FR' }` |
| Valid cookie, no URL param | Cookie `FAQBNB_LANG=es` | `{ language: 'es', source: 'cookie', rawValue: 'es' }` |
| Invalid cookie value | Cookie `FAQBNB_LANG=invalid` | Falls through to header |
| Valid Accept-Language header | Header `Accept-Language: de,en;q=0.8` | `{ language: 'de', source: 'header', rawValue: 'de' }` |
| Accept-Language with regional variant | Header `Accept-Language: nl-BE` | `{ language: 'nl', source: 'header', rawValue: 'nl' }` |
| Accept-Language unsupported only | Header `Accept-Language: ja,ko` | `{ language: 'en', source: 'default' }` |
| No sources available | Empty request | `{ language: 'en', source: 'default' }` |
| Malformed Accept-Language | Header `Accept-Language: ;;malformed` | Graceful handling, falls to default |

### Edge Cases

- Empty string URL parameter `?lang=`
- Whitespace-only URL parameter `?lang=%20`
- Cookie present but empty value
- Accept-Language with wildcard `*`
- Accept-Language with malformed q-values `fr;q=invalid`
- Mixed valid and invalid (URL invalid, cookie valid)

---

## 7. Implementation Checklist

### Pre-Implementation Verification
- [ ] `/src/lib/i18n/config.ts` exists with required exports
- [ ] `/src/lib/i18n/language-detection.ts` exists with `parseAcceptLanguageHeader`
- [ ] `/src/lib/i18n/index.ts` exists for centralized exports

### Task Completion Checklist
- [ ] Task 1: Export `parseAcceptLanguageHeader` from language-detection.ts
- [ ] Task 2: Create guest-language.ts with imports and types
- [ ] Task 3: Implement `detectGuestLanguageFromRequestWithMeta` function
- [ ] Task 4: Implement `detectGuestLanguageFromRequest` wrapper function
- [ ] Task 5: Update index.ts with new exports
- [ ] Task 6: Verify all inline documentation is complete

### Post-Implementation Verification
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] All new exports are accessible via `import { ... } from '@/lib/i18n'`
- [ ] Console logging uses `[i18n-guest]` prefix
- [ ] Functions are pure (no side effects on request object)

---

## 8. Integration Points

### Task REQ-E04-020 (Middleware Guest Language Detection)

```typescript
// In middleware.ts
import { detectGuestLanguageFromRequest } from '@/lib/i18n';

// Inside middleware function for /item/* routes
const guestLanguage = detectGuestLanguageFromRequest(req);
res.headers.set('x-guest-language', guestLanguage);
```

### Task REQ-E04-016 (Guest Item Page Server Component)

```typescript
// In /src/app/item/[publicId]/page.tsx
import { headers } from 'next/headers';

// Can read from middleware-set header
const headersList = await headers();
const guestLanguage = headersList.get('x-guest-language') || 'en';
```

### Task REQ-E04-005 (Public Item API Endpoint)

```typescript
// In /src/app/api/public/items/[publicId]/route.ts
import { detectGuestLanguageFromRequest } from '@/lib/i18n';

export async function GET(request: NextRequest) {
  const language = detectGuestLanguageFromRequest(request);
  // Fetch item with translations for detected language
}
```

---

## 9. Acceptance Criteria Verification

| Acceptance Criteria | Task | Verification |
|--------------------|------|--------------|
| Function in `/src/lib/i18n/guest-language.ts` | Task 2, 3, 4 | File exists with both functions |
| Accept NextRequest object | Task 3 | Parameter type is `NextRequest` |
| Return supported language code | Task 3, 4 | Return type is `SupportedLocale` |
| URL param priority highest | Task 3 | First check in cascade |
| Cookie priority second | Task 3 | Second check in cascade |
| Accept-Language priority third | Task 3 | Third check in cascade |
| Default to English | Task 3 | Final fallback is `DEFAULT_LOCALE` |
| Validate language codes | Task 3 | Uses `isSupportedLocale()` and `normalizeLocale()` |
| Handle malformed headers | Task 3 | Try/catch not needed; parseAcceptLanguageHeader handles gracefully |
| Handle corrupted cookies | Task 3 | Validation before use |
| Pure function, no side effects | Task 3, 4 | No cookie/header modification |
| Export from guest-language module | Task 5 | Export statement in index.ts |

---

## 10. References

- **Overview Document:** `/docs/REQ-E04-022-create-server-side-language-detection-utility-overview.md`
- **Request Document:** `/docs/gen_requests_epic4.md` - REQ-E04-022
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Existing i18n Module:** `/src/lib/i18n/`
- **Config File:** `/src/lib/i18n/config.ts`
- **Language Detection:** `/src/lib/i18n/language-detection.ts`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 6, Task 6.2*
