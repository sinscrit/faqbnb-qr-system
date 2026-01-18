# REQ-324: Create Server-Side Language Detection Utility - Implementation Overview

**Document Created:** 2026-01-18 19:45 UTC
**Last Modified:** 2026-01-18 19:45 UTC
**Request ID:** REQ-324
**Phase:** 6 - Middleware & Language Detection
**Task ID:** 6.2
**Type:** NEW FEATURE
**Size:** M (Medium)
**Priority:** P1 - High

---

## 1. Summary

Create a server-side utility function for detecting guest language preferences from Next.js request objects. The utility will examine URL parameters, cookies, and Accept-Language headers in a prioritized order to determine the most appropriate language for displaying content. This server-side implementation complements the client-side language detection and ensures consistent language handling across middleware, server components, and API routes.

---

## 2. Background & Context

### Current State
- Language detection logic is not yet implemented in the server-side context
- Server components and middleware lack a standardized utility for determining guest language preferences
- No centralized function exists to parse Accept-Language headers and map browser codes to supported languages

### Dependencies
- **Epic 1 (Foundation):** Requires localization types from `/src/types/l10n.ts`
- **Task 6.1:** This utility will be consumed by the middleware integration (Task 6.1)
- **Task 4.2:** Shares the same file location as the cookie utility for language persistence

### Business Value
- Eliminates code duplication between client and server language detection
- Creates a single source of truth for server-side language detection
- Enables consistent language preference handling across all server-rendered content

---

## 3. Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Accept NextRequest object as primary parameter for middleware contexts | Must |
| FR-2 | Extract language from URL query parameters using `lang` parameter name | Must |
| FR-3 | Validate URL parameter language codes against supported languages | Must |
| FR-4 | Read guest language preference cookie (`FAQBNB_GUEST_LANG`) when no URL param | Must |
| FR-5 | Validate cookie language codes against supported languages | Must |
| FR-6 | Parse Accept-Language header as fallback when URL/cookie not available | Must |
| FR-7 | Extract language codes with quality weights from Accept-Language header | Should |
| FR-8 | Map browser language variants (e.g., `fr-CA`) to supported languages | Must |
| FR-9 | Return application default language (`en`) when all detection sources fail | Must |
| FR-10 | Handle missing or undefined request properties gracefully | Must |
| FR-11 | Export constants for cookie name and default language | Must |

### Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-1 | Process quickly without blocking request handling (<10ms) | Must |
| NFR-2 | Include proper TypeScript type definitions | Must |
| NFR-3 | Include JSDoc documentation with usage examples | Should |
| NFR-4 | Handle edge cases (empty strings, whitespace, case sensitivity) | Must |

---

## 4. Technical Design

### 4.1 File Location

**Primary File:** `/src/lib/i18n/guest-language.ts`

This file will contain both server-side and shared utilities for guest language handling. The server-side detection function will be specifically designed for use with NextRequest objects.

### 4.2 Detection Priority Order

```
1. URL Query Parameter (?lang=fr) → Highest priority (shareable links)
2. Cookie (FAQBNB_GUEST_LANG)     → Persisted preference
3. Accept-Language Header         → Browser auto-detection
4. Default Language (en)          → Fallback
```

### 4.3 Function Signatures

```typescript
/**
 * Detect guest language preference from a NextRequest object.
 * Follows priority order: URL param > Cookie > Accept-Language > default
 *
 * @param request - NextRequest object from middleware or server context
 * @returns The detected language code (one of SupportedLanguage)
 *
 * @example
 * ```typescript
 * // In middleware.ts
 * import { detectGuestLanguageFromRequest } from '@/lib/i18n/guest-language'
 *
 * export async function middleware(req: NextRequest) {
 *   const language = detectGuestLanguageFromRequest(req)
 *   // Use language for routing or response headers
 * }
 * ```
 */
export function detectGuestLanguageFromRequest(request: NextRequest): SupportedLanguage

/**
 * Parse the Accept-Language header and return the best matching supported language.
 * Handles quality weights (e.g., "fr-CA,fr;q=0.9,en;q=0.8")
 *
 * @param acceptLanguageHeader - The Accept-Language header value (may be null)
 * @returns The best matching supported language or null if none match
 */
export function parseAcceptLanguageHeader(
  acceptLanguageHeader: string | null
): SupportedLanguage | null

/**
 * Map a browser language code to a supported language.
 * Handles variants like 'fr-CA' → 'fr', 'en-GB' → 'en'
 *
 * @param browserCode - The language code from browser (e.g., 'fr-CA')
 * @returns The matching supported language or null if not supported
 */
export function mapToSupportedLanguage(browserCode: string): SupportedLanguage | null

/**
 * Validate if a language code is supported.
 *
 * @param code - The language code to validate
 * @returns True if the code is a supported language
 */
export function isSupportedLanguage(code: string | undefined | null): code is SupportedLanguage
```

### 4.4 Constants

```typescript
/** Cookie name for storing guest language preference */
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG'

/** Default language when no preference can be detected */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

/** URL query parameter name for language override */
export const LANGUAGE_URL_PARAM = 'lang'

/** Supported language codes */
export const SUPPORTED_LANGUAGE_CODES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it']
```

### 4.5 Type Definitions

The utility relies on types from `/src/types/l10n.ts` (created in Phase 1):

```typescript
// Expected types (from l10n.ts)
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'
```

### 4.6 Algorithm Details

#### Accept-Language Parsing

```
Input: "fr-CA,fr;q=0.9,en-US;q=0.8,en;q=0.7"

Step 1: Split by comma → ["fr-CA", "fr;q=0.9", "en-US;q=0.8", "en;q=0.7"]
Step 2: Parse each entry:
  - "fr-CA" → { code: "fr-CA", quality: 1.0 }
  - "fr;q=0.9" → { code: "fr", quality: 0.9 }
  - "en-US;q=0.8" → { code: "en-US", quality: 0.8 }
  - "en;q=0.7" → { code: "en", quality: 0.7 }
Step 3: Sort by quality (descending)
Step 4: For each, map to supported language:
  - "fr-CA" → "fr" ✓ (supported)
  - Return "fr"
```

#### Language Variant Mapping

| Browser Code | Base Language | Supported? | Maps To |
|--------------|---------------|------------|---------|
| `fr-CA`      | `fr`          | Yes        | `fr`    |
| `en-US`      | `en`          | Yes        | `en`    |
| `en-GB`      | `en`          | Yes        | `en`    |
| `de-AT`      | `de`          | Yes        | `de`    |
| `pt-BR`      | `pt`          | No         | `null`  |
| `zh-CN`      | `zh`          | No         | `null`  |

---

## 5. Implementation Tasks

### Task 1: Create Guest Language Constants
**Estimated Size:** XS

Create and export constants for cookie name, default language, and URL parameter name.

**Acceptance Criteria:**
- [ ] `GUEST_LANGUAGE_COOKIE_NAME` constant exported with value `'FAQBNB_GUEST_LANG'`
- [ ] `DEFAULT_LANGUAGE` constant exported with value `'en'`
- [ ] `LANGUAGE_URL_PARAM` constant exported with value `'lang'`
- [ ] `SUPPORTED_LANGUAGE_CODES` array exported with all six supported languages

---

### Task 2: Implement `isSupportedLanguage` Validation Function
**Estimated Size:** XS

Create a type guard function that validates whether a string is a supported language code.

**Acceptance Criteria:**
- [ ] Function accepts string, undefined, or null parameter
- [ ] Returns `true` for valid supported language codes ('en', 'fr', 'es', 'de', 'nl', 'it')
- [ ] Returns `false` for unsupported codes
- [ ] Returns `false` for null/undefined/empty string
- [ ] Case-insensitive comparison (normalizes to lowercase)
- [ ] TypeScript type guard narrows type to `SupportedLanguage`

---

### Task 3: Implement `mapToSupportedLanguage` Function
**Estimated Size:** S

Create a function that maps browser language codes (including variants) to supported languages.

**Acceptance Criteria:**
- [ ] Maps exact matches (e.g., `'fr'` → `'fr'`)
- [ ] Maps regional variants (e.g., `'fr-CA'` → `'fr'`, `'en-GB'` → `'en'`)
- [ ] Returns `null` for unsupported base languages (e.g., `'pt-BR'` → `null`)
- [ ] Handles case-insensitively (e.g., `'FR'` → `'fr'`)
- [ ] Handles empty strings gracefully → `null`
- [ ] Includes JSDoc documentation

---

### Task 4: Implement `parseAcceptLanguageHeader` Function
**Estimated Size:** M

Create a function that parses the Accept-Language header and returns the best matching supported language.

**Acceptance Criteria:**
- [ ] Correctly parses comma-separated language entries
- [ ] Extracts quality weights (e.g., `'fr;q=0.9'` → quality 0.9)
- [ ] Defaults quality to 1.0 when not specified
- [ ] Sorts languages by quality weight (highest first)
- [ ] Iterates through sorted list to find first supported language
- [ ] Returns `null` when no supported languages found in header
- [ ] Handles `null` input gracefully → returns `null`
- [ ] Handles malformed header entries gracefully (skips them)
- [ ] Handles whitespace around entries correctly
- [ ] Includes JSDoc documentation with examples

---

### Task 5: Implement `detectGuestLanguageFromRequest` Main Function
**Estimated Size:** M

Create the main detection function that accepts a NextRequest and returns the detected language.

**Acceptance Criteria:**
- [ ] Accepts `NextRequest` object as parameter
- [ ] Checks URL query parameter first (`request.nextUrl.searchParams.get('lang')`)
- [ ] Validates URL parameter against supported languages before using
- [ ] Reads cookie value when no valid URL parameter (`request.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value`)
- [ ] Validates cookie value against supported languages before using
- [ ] Parses Accept-Language header as fallback (`request.headers.get('accept-language')`)
- [ ] Returns `DEFAULT_LANGUAGE` when all detection methods fail
- [ ] Handles missing searchParams gracefully
- [ ] Handles missing cookies gracefully
- [ ] Handles missing headers gracefully
- [ ] Returns typed `SupportedLanguage` value
- [ ] Includes JSDoc documentation with usage example
- [ ] Processes within 10ms performance target

---

### Task 6: Add Unit Tests for Language Detection
**Estimated Size:** M

Create comprehensive unit tests for all language detection functions.

**Test Scenarios:**
- [ ] URL parameter detection with valid language
- [ ] URL parameter detection with invalid language (falls through)
- [ ] Cookie detection with valid language
- [ ] Cookie detection with invalid/expired language
- [ ] Accept-Language parsing with single language
- [ ] Accept-Language parsing with multiple languages and quality weights
- [ ] Accept-Language parsing with regional variants
- [ ] Accept-Language parsing with malformed header
- [ ] Accept-Language parsing with unsupported languages only
- [ ] Full detection priority chain (URL > Cookie > Header > Default)
- [ ] Edge cases: null/undefined/empty values
- [ ] Edge cases: case sensitivity handling

---

## 6. Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/guest-language.ts` | Server-side language detection utility module |

### Files to Potentially Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `/src/lib/i18n/index.ts` | Add barrel export for guest-language module | Consistent export pattern |
| `/src/types/l10n.ts` | Verify SupportedLanguage type exists | Dependency verification |

### Functions to Create

| Function Name | Location | Purpose |
|---------------|----------|---------|
| `detectGuestLanguageFromRequest` | `/src/lib/i18n/guest-language.ts` | Main detection function for NextRequest |
| `parseAcceptLanguageHeader` | `/src/lib/i18n/guest-language.ts` | Parse Accept-Language header |
| `mapToSupportedLanguage` | `/src/lib/i18n/guest-language.ts` | Map browser codes to supported languages |
| `isSupportedLanguage` | `/src/lib/i18n/guest-language.ts` | Type guard for supported language validation |

### Exports to Create

| Export Name | Type | Value/Purpose |
|-------------|------|---------------|
| `GUEST_LANGUAGE_COOKIE_NAME` | const string | `'FAQBNB_GUEST_LANG'` |
| `DEFAULT_LANGUAGE` | const SupportedLanguage | `'en'` |
| `LANGUAGE_URL_PARAM` | const string | `'lang'` |
| `SUPPORTED_LANGUAGE_CODES` | const array | `['en', 'fr', 'es', 'de', 'nl', 'it']` |

---

## 7. Dependencies

### Import Dependencies

```typescript
// Next.js
import { NextRequest } from 'next/server'

// Internal types (from Epic 1, Phase 1)
import type { SupportedLanguage } from '@/types/l10n'
```

### Depends On (Tasks)

| Task | Description | Status |
|------|-------------|--------|
| Task 1.1 | Create localization types file (`/src/types/l10n.ts`) | Required |
| Task 1.3 | Update types/index.ts with L10N exports | Required |

### Blocks (Tasks)

| Task | Description |
|------|-------------|
| Task 6.1 | Add guest language detection to middleware |
| Task 5.1 | Update guest item page server component |

---

## 8. Testing Strategy

### Unit Tests

**File:** `/src/lib/i18n/__tests__/guest-language.test.ts`

```typescript
describe('detectGuestLanguageFromRequest', () => {
  it('returns URL parameter language when valid')
  it('ignores invalid URL parameter and checks cookie')
  it('returns cookie language when URL param missing')
  it('ignores invalid cookie and parses Accept-Language')
  it('returns Accept-Language preference when cookie missing')
  it('returns default language when all sources fail')
  it('handles missing request properties gracefully')
})

describe('parseAcceptLanguageHeader', () => {
  it('parses single language without quality')
  it('parses multiple languages with quality weights')
  it('sorts by quality (highest first)')
  it('maps regional variants to base language')
  it('returns null for unsupported languages only')
  it('handles null input')
  it('handles malformed entries gracefully')
})

describe('mapToSupportedLanguage', () => {
  it('returns exact match for supported language')
  it('extracts base language from regional variant')
  it('returns null for unsupported base language')
  it('handles case-insensitively')
})

describe('isSupportedLanguage', () => {
  it('returns true for each supported language')
  it('returns false for unsupported language')
  it('returns false for null/undefined')
})
```

### Integration Tests (Manual)

1. Middleware integration with language detection
2. Server component reading detected language
3. Full request cycle: browser → middleware → page → response

---

## 9. Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Middleware execution time | Keep detection logic simple, no async operations |
| Accept-Language parsing | Use regex and simple string operations, no external libs |
| Cookie reading | Single read operation, no database lookups |
| Memory allocation | Reuse constants, avoid creating objects in hot path |

**Target Performance:** < 10ms for complete detection cycle

---

## 10. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Empty string URL parameter | Treat as invalid, fall through to cookie |
| Whitespace-only values | Trim and treat empty as invalid |
| Mixed case language codes | Normalize to lowercase for comparison |
| Malformed Accept-Language | Skip invalid entries, continue with valid ones |
| Very long Accept-Language header | Process entries until first supported match |
| No cookies object on request | Return early with default language |
| No headers object on request | Return early with default language |
| Non-string cookie value | Type check and treat non-strings as invalid |

---

## 11. Code Example

```typescript
// /src/lib/i18n/guest-language.ts

import { NextRequest } from 'next/server'
import type { SupportedLanguage } from '@/types/l10n'

/** Cookie name for storing guest language preference */
export const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG'

/** Default language when no preference can be detected */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

/** URL query parameter name for language override */
export const LANGUAGE_URL_PARAM = 'lang'

/** Supported language codes */
export const SUPPORTED_LANGUAGE_CODES: readonly SupportedLanguage[] =
  ['en', 'fr', 'es', 'de', 'nl', 'it'] as const

/**
 * Validate if a language code is supported.
 */
export function isSupportedLanguage(
  code: string | undefined | null
): code is SupportedLanguage {
  if (!code) return false
  const normalized = code.toLowerCase().trim()
  return SUPPORTED_LANGUAGE_CODES.includes(normalized as SupportedLanguage)
}

/**
 * Map a browser language code to a supported language.
 */
export function mapToSupportedLanguage(
  browserCode: string
): SupportedLanguage | null {
  if (!browserCode) return null

  const normalized = browserCode.toLowerCase().trim()

  // Check for exact match first
  if (isSupportedLanguage(normalized)) {
    return normalized
  }

  // Extract base language from regional variant (e.g., 'fr-CA' → 'fr')
  const baseLang = normalized.split('-')[0]
  if (isSupportedLanguage(baseLang)) {
    return baseLang
  }

  return null
}

/**
 * Parse the Accept-Language header and return the best matching supported language.
 */
export function parseAcceptLanguageHeader(
  acceptLanguageHeader: string | null
): SupportedLanguage | null {
  if (!acceptLanguageHeader) return null

  // Parse entries like "fr-CA,fr;q=0.9,en;q=0.8"
  const entries = acceptLanguageHeader.split(',').map(entry => {
    const [code, qualityPart] = entry.trim().split(';')
    const quality = qualityPart
      ? parseFloat(qualityPart.replace('q=', '').trim())
      : 1.0
    return { code: code.trim(), quality: isNaN(quality) ? 1.0 : quality }
  })

  // Sort by quality (highest first)
  entries.sort((a, b) => b.quality - a.quality)

  // Find first supported language
  for (const { code } of entries) {
    const supported = mapToSupportedLanguage(code)
    if (supported) return supported
  }

  return null
}

/**
 * Detect guest language preference from a NextRequest object.
 * Priority: URL param > Cookie > Accept-Language > default
 */
export function detectGuestLanguageFromRequest(
  request: NextRequest
): SupportedLanguage {
  // 1. Check URL parameter (highest priority for shareable links)
  const urlParam = request.nextUrl.searchParams.get(LANGUAGE_URL_PARAM)
  if (urlParam && isSupportedLanguage(urlParam)) {
    return urlParam.toLowerCase() as SupportedLanguage
  }

  // 2. Check cookie (persisted preference)
  const cookieValue = request.cookies.get(GUEST_LANGUAGE_COOKIE_NAME)?.value
  if (cookieValue && isSupportedLanguage(cookieValue)) {
    return cookieValue.toLowerCase() as SupportedLanguage
  }

  // 3. Parse Accept-Language header (browser preference)
  const acceptLanguage = request.headers.get('accept-language')
  const headerLanguage = parseAcceptLanguageHeader(acceptLanguage)
  if (headerLanguage) {
    return headerLanguage
  }

  // 4. Return default language
  return DEFAULT_LANGUAGE
}
```

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Types from Task 1.1 not complete | Low | High | Create local type definition as fallback |
| Middleware performance degradation | Low | Medium | Keep detection logic synchronous and simple |
| Accept-Language header edge cases | Medium | Low | Comprehensive parsing with fallback to default |
| Cookie not available in some contexts | Low | Low | Always check for undefined before accessing |

---

## 13. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Definition:** `/docs/gen_requests_epic4.md` - REQ-324
- **Type Definitions:** `/src/types/l10n.ts` (from Task 1.1)
- **Middleware:** `/src/middleware.ts` (integration point)
- **Next.js NextRequest API:** https://nextjs.org/docs/app/api-reference/functions/next-request

---

## 14. Checklist for Implementation

- [ ] Verify `/src/types/l10n.ts` exists with `SupportedLanguage` type
- [ ] Create `/src/lib/i18n/guest-language.ts` file
- [ ] Implement constants (`GUEST_LANGUAGE_COOKIE_NAME`, `DEFAULT_LANGUAGE`, etc.)
- [ ] Implement `isSupportedLanguage` type guard
- [ ] Implement `mapToSupportedLanguage` function
- [ ] Implement `parseAcceptLanguageHeader` function
- [ ] Implement `detectGuestLanguageFromRequest` main function
- [ ] Add JSDoc documentation to all exported functions
- [ ] Update `/src/lib/i18n/index.ts` barrel export (if exists)
- [ ] Create unit tests in `/src/lib/i18n/__tests__/guest-language.test.ts`
- [ ] Test edge cases (null, empty, malformed inputs)
- [ ] Verify performance is within 10ms target
- [ ] Run TypeScript compiler to verify type safety

---

*Document generated for FAQBNB L10N Epic 4 - Phase 6, Task 6.2*
