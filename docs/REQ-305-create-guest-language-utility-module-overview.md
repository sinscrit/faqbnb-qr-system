# REQ-305: Create Guest Language Detection and Preference Utility Module - Implementation Overview

**Document Generated:** 2026-01-18 14:30:00 UTC
**Last Modified:** 2026-01-18 14:30:00 UTC
**Request ID:** REQ-305
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 1 - Types and Utilities
**Task ID:** 1.2

---

## 1. Summary

Create a guest language utility module that provides functions to automatically detect guest language preferences from multiple sources (URL parameters, cookies, Accept-Language headers) and persist those preferences across sessions. This module is foundational infrastructure for the guest localization experience in Epic 4.

---

## 2. Request Reference

**Source:** `/docs/gen_requests_epic4.md` - Request #305

**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` - Task 1.2

### Acceptance Criteria (from Request)

- [ ] Language detection function examines URL parameters first, then cookies, then Accept-Language headers
- [ ] Browser Accept-Language header is correctly parsed to extract preferred language codes with quality weights
- [ ] Language codes from browsers are mapped to the nearest supported language when no exact match exists
- [ ] Selected language preference is persisted in a cookie that survives browser sessions
- [ ] Cookie storage function sets appropriate expiration, path, and security attributes
- [ ] All utility functions handle edge cases such as malformed headers, unsupported codes, and missing values
- [ ] Functions return predictable defaults when no language preference can be determined
- [ ] The module exports clean, reusable functions that can be called from middleware or API routes

---

## 3. Technical Context

### Existing Patterns

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Cookie handling | `/src/middleware.ts` | Uses `@supabase/ssr` cookie pattern with get/set/remove |
| Header access | `/src/middleware.ts:19-20` | `req.headers.get('user-agent')`, `req.headers.get('referer')` |
| Query param access | `/src/middleware.ts:15-16` | `req.nextUrl.searchParams.get('code')` |
| Utility modules | `/src/lib/*.ts` | Named exports, interfaces at top, focused functions |
| Type definitions | `/src/types/index.ts` | Centralized exports, enums for fixed options |

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-304 (l10n types) | Prerequisite | Defines `SupportedLanguage`, `SUPPORTED_LANGUAGES` |
| Next.js 15 | Installed | Provides `NextRequest`, cookies API |
| @supabase/ssr | Installed | Cookie handling pattern reference |

### Technology Stack

- **Framework:** Next.js 15.5.9 with App Router
- **Language:** TypeScript 5.x (strict mode)
- **Runtime:** Server-side (middleware/API routes) and client-side (browser)

---

## 4. Implementation Approach

### 4.1 Module Structure

The module will provide both server-side and client-side utilities for language detection and persistence:

```
/src/lib/i18n/
├── guest-language.ts      # NEW: Main guest language utility module
└── index.ts               # NEW: Barrel exports for i18n module
```

### 4.2 Core Functions

#### `detectGuestLanguage(request?, urlParam?)`
Detects the guest's preferred language using priority-based detection:
1. **URL parameter** (`?lang=fr`) - Highest priority for shareable links
2. **Cookie** (`FAQBNB_GUEST_LANG`) - Persisted preference
3. **Accept-Language header** - Browser setting
4. **Default** (`'en'`) - Fallback

**Server-side variant:** Accepts `NextRequest` to read headers/cookies
**Client-side variant:** Uses `document.cookie` and `navigator.language`

#### `setGuestLanguageCookie(language)`
Persists the language preference in a cookie:
- Cookie name: `FAQBNB_GUEST_LANG`
- Expiration: 1 year
- Path: `/`
- SameSite: `Lax`
- Secure: `true` (production)

#### `parseAcceptLanguage(header)`
Parses the `Accept-Language` header according to RFC 7231:
- Extracts language codes with quality weights
- Sorts by quality (descending)
- Returns array of language codes

**Example input:** `fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7`
**Example output:** `['fr-FR', 'fr', 'en-US', 'en']`

#### `mapToSupportedLanguage(code)`
Maps browser/arbitrary language codes to supported languages:
- Exact match: `'fr'` → `'fr'`
- Variant match: `'fr-CA'` → `'fr'`
- Fallback: `'zh-CN'` → `'en'` (no match)

### 4.3 Cookie Configuration

```typescript
const GUEST_LANGUAGE_COOKIE = {
  name: 'FAQBNB_GUEST_LANG',
  maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};
```

### 4.4 Type Definitions

The module will import types from REQ-304's `/src/types/l10n.ts`:
- `SupportedLanguage`: Union type of supported language codes
- `SUPPORTED_LANGUAGES`: Array of language metadata
- `LanguageInfo`: Interface for language display information

---

## 5. Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/guest-language.ts` | Main guest language utility module |
| `/src/lib/i18n/index.ts` | Barrel exports for i18n utilities |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| None | This task creates new files only |

### Functions to Implement

| Function | Signature | Purpose |
|----------|-----------|---------|
| `detectGuestLanguage` | `(request?: NextRequest, urlParam?: string) => SupportedLanguage` | Server-side language detection |
| `detectGuestLanguageClient` | `(urlParam?: string) => SupportedLanguage` | Client-side language detection |
| `setGuestLanguageCookie` | `(language: SupportedLanguage) => void` | Client-side cookie persistence |
| `setGuestLanguageCookieServer` | `(response: NextResponse, language: SupportedLanguage) => void` | Server-side cookie setting |
| `getGuestLanguageCookie` | `() => SupportedLanguage \| null` | Client-side cookie reading |
| `parseAcceptLanguage` | `(header: string \| null) => string[]` | Parse Accept-Language header |
| `mapToSupportedLanguage` | `(code: string) => SupportedLanguage` | Map codes to supported languages |
| `isValidLanguageCode` | `(code: string) => code is SupportedLanguage` | Type guard for language codes |

---

## 6. Integration Points

### 6.1 Middleware Integration (Future - Task 6.1)

The middleware will use these utilities to detect guest language for `/item/*` routes:

```typescript
// In /src/middleware.ts (future modification)
import { detectGuestLanguage, setGuestLanguageCookieServer } from '@/lib/i18n/guest-language';

// For guest item pages
if (req.nextUrl.pathname.startsWith('/item/')) {
  const lang = req.nextUrl.searchParams.get('lang');
  const detectedLang = detectGuestLanguage(req, lang);
  // Set cookie for future visits
  setGuestLanguageCookieServer(res, detectedLang);
}
```

### 6.2 Server Component Integration (Future - Task 5.1)

```typescript
// In /src/app/item/[publicId]/page.tsx (future modification)
import { detectGuestLanguage } from '@/lib/i18n/guest-language';

export default async function ItemPage({ params, searchParams }) {
  const { lang } = await searchParams;
  const detectedLanguage = await detectGuestLanguage(undefined, lang);
  // Fetch translated content...
}
```

### 6.3 Client Hook Integration (Future - Task 4.1)

```typescript
// In /src/hooks/useGuestLanguage.ts (future creation)
import {
  detectGuestLanguageClient,
  setGuestLanguageCookie
} from '@/lib/i18n/guest-language';
```

---

## 7. Edge Cases and Error Handling

### 7.1 Malformed Accept-Language Header

**Input:** `"invalid,,;q=abc,en"`
**Handling:** Skip invalid entries, extract valid codes
**Output:** `['en']`

### 7.2 Unsupported Language Codes

**Input:** `'zh-CN'` (not in supported list)
**Handling:** Map to default language
**Output:** `'en'`

### 7.3 Empty/Null Values

**Input:** `null`, `undefined`, `''`
**Handling:** Return default language
**Output:** `'en'`

### 7.4 Cookie Blocked/Unavailable

**Handling:** Detection still works via Accept-Language
**Impact:** Preference won't persist across sessions

---

## 8. Testing Considerations

### 8.1 Unit Test Scenarios

1. **Priority Detection:**
   - URL param overrides cookie
   - Cookie overrides Accept-Language
   - Accept-Language works when no cookie

2. **Accept-Language Parsing:**
   - Standard format: `en-US,en;q=0.9,fr;q=0.8`
   - Single language: `fr`
   - With regions: `fr-FR,fr;q=0.9`
   - Malformed: `invalid;;q=,en`

3. **Language Mapping:**
   - Exact matches: `'fr'` → `'fr'`
   - Region variants: `'fr-CA'` → `'fr'`
   - Case insensitivity: `'FR'` → `'fr'`
   - Unsupported: `'zh'` → `'en'`

4. **Cookie Operations:**
   - Set and retrieve
   - Expiration attributes
   - Security attributes

### 8.2 Integration Test Scenarios

1. Middleware correctly sets language cookie
2. Server component reads detected language
3. Client hook updates cookie on change

---

## 9. Performance Considerations

- **Language detection:** < 1ms (synchronous operations)
- **Accept-Language parsing:** < 1ms (simple string operations)
- **Cookie operations:** Negligible overhead
- **No external API calls:** All local computation

---

## 10. Dependencies on Other Tasks

| Task | Dependency Type | Status |
|------|-----------------|--------|
| REQ-304 (l10n types) | Required | Must be implemented first |
| Task 1.3 (export types) | Downstream | Will export l10n types |
| Task 4.1 (useGuestLanguage hook) | Downstream | Will use these utilities |
| Task 6.1 (middleware update) | Downstream | Will integrate detection |

---

## 11. API Contract

### Input Types

```typescript
// Server-side detection
function detectGuestLanguage(
  request?: NextRequest,
  urlParam?: string | null
): SupportedLanguage;

// Client-side detection
function detectGuestLanguageClient(
  urlParam?: string | null
): SupportedLanguage;

// Cookie management
function setGuestLanguageCookie(language: SupportedLanguage): void;
function setGuestLanguageCookieServer(
  response: NextResponse,
  language: SupportedLanguage
): void;
function getGuestLanguageCookie(): SupportedLanguage | null;

// Parsing utilities
function parseAcceptLanguage(header: string | null): string[];
function mapToSupportedLanguage(code: string): SupportedLanguage;
function isValidLanguageCode(code: string): code is SupportedLanguage;
```

### Constants

```typescript
const GUEST_LANGUAGE_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
```

---

## 12. Implementation Checklist

- [ ] Create `/src/lib/i18n/` directory
- [ ] Implement `parseAcceptLanguage()` function
- [ ] Implement `mapToSupportedLanguage()` function
- [ ] Implement `isValidLanguageCode()` type guard
- [ ] Implement `detectGuestLanguage()` for server-side
- [ ] Implement `detectGuestLanguageClient()` for client-side
- [ ] Implement `setGuestLanguageCookie()` for client-side
- [ ] Implement `setGuestLanguageCookieServer()` for server-side
- [ ] Implement `getGuestLanguageCookie()` for client-side
- [ ] Create barrel exports in `/src/lib/i18n/index.ts`
- [ ] Add JSDoc documentation for all exported functions
- [ ] Verify TypeScript strict mode compliance
- [ ] Test edge cases (malformed headers, unsupported codes)

---

## 13. References

- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-305)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Existing Middleware:** `/src/middleware.ts`
- **Cookie Pattern Reference:** `/src/lib/supabase-server.ts`
- **RFC 7231 (Accept-Language):** https://tools.ietf.org/html/rfc7231#section-5.3.5

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
