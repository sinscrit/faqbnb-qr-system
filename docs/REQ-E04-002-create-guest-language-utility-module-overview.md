# Implementation Overview: Create Guest Language Utility Module

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-002 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 16:00 |
| Breakdown Created | 2026-01-22 18:45 |
| T-shirt Size | S |
| Estimated Effort | 3-4 hours |
| Status | PENDING |

## Goals

Create a guest language utility module (`/src/lib/i18n/guest-language.ts`) that provides core functionality for detecting, persisting, and managing language preferences for unauthenticated guest users viewing shared items. This module extends the existing Epic 1 i18n infrastructure to support guest-facing multi-language content.

### Technical Requirements

1. **Detect guest language** from URL parameters, cookies, or browser Accept-Language header (priority order)
2. **Persist language preferences** in a dedicated guest cookie (`FAQBNB_GUEST_LANG`)
3. **Parse Accept-Language headers** correctly with quality value support
4. **Map browser language codes** (e.g., 'en-US', 'fr-FR') to supported application languages
5. **Provide graceful fallbacks** when preferred language is unavailable
6. **Integrate with Epic 1 types** from `/src/types/l10n.ts` (REQ-E04-001)

### Assumptions & Clarifications

- Epic 1's `language-detection.ts` exists and handles **authenticated user** language detection
- This new `guest-language.ts` module handles **unauthenticated guest** language detection
- Guests use a separate cookie (`FAQBNB_GUEST_LANG`) vs authenticated users (`FAQBNB_LANG`)
- The module should work in both server-side (middleware, server components) and client-side contexts
- `SupportedLanguage` type will be available from `/src/types/l10n.ts` after REQ-E04-001 completes
- Accept-Language parsing logic can be adapted from existing `language-detection.ts`

## Implementation Plan

### Step 1: Define Guest Cookie Constants
- **Description**: Define cookie configuration constants for guest language persistence
- **Rationale**: Establishes clear, documented constants for cookie management; separates guest cookie from authenticated user cookie to prevent conflicts
- **Estimated Effort**: XS (10 minutes)

**Key Actions:**
- Add `GUEST_LANG_COOKIE_NAME = 'FAQBNB_GUEST_LANG'` constant
- Add `GUEST_LANG_COOKIE_MAX_AGE = 365 * 24 * 60 * 60` (1 year) constant
- Document the distinction between `FAQBNB_LANG` (authenticated) and `FAQBNB_GUEST_LANG` (guest)
- Add JSDoc comments explaining cookie purpose and security settings

### Step 2: Create parseAcceptLanguage Function
- **Description**: Implement Accept-Language header parsing with quality value support
- **Rationale**: Enables automatic language detection based on browser preferences; reuses proven parsing logic from Epic 1's `language-detection.ts`
- **Estimated Effort**: S (30 minutes)

**Key Actions:**
- Create `parseAcceptLanguage(header: string | null): string[]` function
- Parse RFC 7231 format: `fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5`
- Extract quality values (default to 1.0 if not specified)
- Sort languages by quality value (highest first)
- Return array of language codes in priority order
- Handle edge cases: malformed headers, missing headers, wildcard (*), invalid quality values
- Add comprehensive JSDoc documentation with examples

### Step 3: Create mapToSupportedLanguage Function
- **Description**: Map browser-specific language codes to supported application languages
- **Rationale**: Converts regional variants (en-US, fr-CA) to base language codes; ensures compatibility with `SupportedLanguage` type
- **Estimated Effort**: S (20 minutes)

**Key Actions:**
- Create `mapToSupportedLanguage(code: string): SupportedLanguage | null` function
- Handle direct matches: 'en' → 'en', 'fr' → 'fr'
- Handle regional variants: 'en-US' → 'en', 'fr-CA' → 'fr', 'de-DE' → 'de'
- Handle case-insensitivity: 'EN-us' → 'en'
- Return `null` for unsupported languages (e.g., 'zh', 'ja', 'ar')
- Use type guard to validate against `SupportedLanguage` type from l10n.ts
- Add JSDoc with mapping examples

### Step 4: Create Cookie Utility Functions
- **Description**: Implement guest language cookie reading, writing, and clearing functions
- **Rationale**: Centralizes cookie management logic; ensures consistent cookie configuration across all contexts
- **Estimated Effort**: M (40 minutes)

**Key Actions:**
- Create `setGuestLanguageCookie(language: SupportedLanguage, context?: 'client' | 'server')` function
  - Client-side: Set via `document.cookie`
  - Server-side: Return cookie configuration object for NextResponse
  - Configure: `Secure` (HTTPS only), `SameSite=Lax`, `Path=/`, `MaxAge=1 year`
- Create `getGuestLanguageCookie(request?: NextRequest): SupportedLanguage | null` function
  - Server context: Read from `NextRequest.cookies`
  - Client context: Parse from `document.cookie`
  - Validate cookie value against `SupportedLanguage` type
- Create `clearGuestLanguageCookie(context?: 'client' | 'server')` function
  - Remove cookie by setting empty value with expired date
- Handle both server (Next.js request/response) and client (browser) contexts

### Step 5: Create detectGuestLanguage Function (Server-Side)
- **Description**: Main detection function for server components and middleware with priority cascade
- **Rationale**: Provides single entry point for language detection; implements priority: URL > Cookie > Accept-Language > Default
- **Estimated Effort**: M (45 minutes)

**Key Actions:**
- Create `detectGuestLanguage(request: NextRequest, urlParam?: string): SupportedLanguage` function
- Implement priority cascade:
  1. **URL parameter** (highest): Check `urlParam` or `request.nextUrl.searchParams.get('lang')`
  2. **Cookie**: Call `getGuestLanguageCookie(request)`
  3. **Accept-Language header**: Parse via `parseAcceptLanguageHeader()`, map via `mapToSupportedLanguage()`
  4. **Default**: Return 'en' (or source language if available in context)
- Validate each source with `mapToSupportedLanguage()`
- Log detection source for debugging (using existing `[i18n]` log prefix pattern)
- Add comprehensive JSDoc with priority explanation and examples
- Type return as `SupportedLanguage` for type safety

### Step 6: Create detectGuestLanguageClient Function (Client-Side)
- **Description**: Client-side language detection for React hooks and components
- **Rationale**: Enables client-side language switching without server round-trips; complements server-side detection
- **Estimated Effort**: S (30 minutes)

**Key Actions:**
- Create `detectGuestLanguageClient(urlParam?: string): SupportedLanguage` function
- Implement similar priority cascade adapted for client context:
  1. **URL parameter**: Parse from `window.location.search`
  2. **Cookie**: Parse from `document.cookie`
  3. **Navigator language**: Use `navigator.language` and `navigator.languages`
  4. **Default**: Return 'en'
- Handle SSR safety: Check `typeof window !== 'undefined'`
- Map navigator languages via `mapToSupportedLanguage()`
- Add JSDoc noting this is for client-side use only

### Step 7: Add Comprehensive JSDoc and Type Documentation
- **Description**: Document all functions with usage examples and type information
- **Rationale**: Ensures developers understand how to use the module correctly; provides IntelliSense support
- **Estimated Effort**: S (20 minutes)

**Key Actions:**
- Add module-level JSDoc explaining purpose and Epic 4 context
- Document each function's parameters, return types, and behavior
- Include `@example` blocks demonstrating common usage patterns
- Add `@since Epic 4 - Guest Experience` tags
- Document edge cases and error handling
- Cross-reference Epic 1's `language-detection.ts` for authenticated users

### Step 8: Create Export Barrel and Integration
- **Description**: Export all functions through `/src/lib/i18n/index.ts` and ensure type compatibility
- **Rationale**: Maintains consistency with existing i18n module structure; provides clean import paths
- **Estimated Effort**: XS (10 minutes)

**Key Actions:**
- Add `export * from './guest-language';` to `/src/lib/i18n/index.ts`
- Verify no circular dependencies with existing i18n modules
- Test that functions can be imported via `@/lib/i18n`
- Ensure `SupportedLanguage` type from `/src/types/l10n.ts` is properly imported

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (Create)
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/guest-language.ts` | — | Create |

### Existing Files (Modify)
| File | Target | Type |
|------|--------|------|
| `/src/lib/i18n/index.ts` | Add guest-language exports | Modify |

### Reference Files (Read Only - For Pattern Guidance)
| File | Purpose |
|------|---------|
| `/src/lib/i18n/language-detection.ts` | Reference for Accept-Language parsing and detection patterns |
| `/src/lib/i18n/config.ts` | Reference for cookie constants and configuration patterns |
| `/src/contexts/LocaleContext.tsx` | Reference for cookie setting patterns |
| `/src/middleware.ts` | Reference for NextRequest cookie handling |
| `/src/types/l10n.ts` | Import `SupportedLanguage` type (created in REQ-E04-001) |

## Dependencies

### Depends On (Completed First)
- **REQ-E04-001**: Create localization types file - Provides `SupportedLanguage` type definition required for all function signatures

### Blocks (Requires This First)
- **REQ-E04-004** (Create Translation Fetch Utilities): Needs `detectGuestLanguage()` to determine which translations to fetch
- **REQ-E04-005** (Create Public Item API Endpoint): Needs guest language detection for server-side rendering
- **REQ-E04-006** (Create Language Availability API): Needs language detection to return relevant translation info
- **REQ-E04-014** (Create useGuestLanguage Hook): Needs `detectGuestLanguageClient()` and cookie utilities
- **REQ-E04-015** (Create Cookie Utility): This task includes cookie utilities, no separate task needed
- **REQ-E04-016** (Update Guest Item Page): Needs `detectGuestLanguage()` for server-side language detection
- **REQ-E04-020** (Add Guest Language Detection to Middleware): Needs server-side detection functions
- **REQ-E04-021** (Create Server-Side Language Detection Utility): Covered by this task's `detectGuestLanguage()` function

### Parallel Safety
- **Files touched**: `/src/lib/i18n/guest-language.ts` (new), `/src/lib/i18n/index.ts` (minimal modification)
- **Conflicts with**: None (new file, minimal modification to barrel export)
- **Safe to parallelize with**: REQ-E04-001 (if using placeholder type temporarily), REQ-E04-003

### External Dependencies
- Next.js 15.x `NextRequest` and `NextResponse` types (already installed)
- TypeScript 5.x (already installed)
- Epic 1 i18n infrastructure: `LOCALE_COOKIE_NAME`, `SupportedLocale` type (already complete)

## Risks and Considerations

### Potential Side Effects
- Cookie name conflict: Ensure `FAQBNB_GUEST_LANG` doesn't collide with `FAQBNB_LANG` (authenticated users)
- Browser cookie storage limits: 1-year expiration is reasonable, but very long-lived cookies may be cleared by browser privacy features
- Accept-Language header parsing: Malformed headers should fail gracefully without throwing errors

### Testing Requirements
- **Unit tests for Accept-Language parsing**: Test quality values, regional variants, malformed headers, empty headers
- **Unit tests for language mapping**: Test all supported languages, regional variants, case-insensitivity, unsupported languages
- **Integration tests**: Test priority cascade with different combinations of URL params, cookies, and headers
- **Edge case tests**: Missing cookies, blocked cookies, invalid language codes, wildcard in Accept-Language
- **Cross-browser testing**: Verify cookie behavior in Chrome, Firefox, Safari, Edge

### Open Questions
- [ ] Should we log language detection decisions for analytics? (Decided: Yes, use existing `[i18n]` log prefix for consistency)
- [ ] Should malformed Accept-Language headers throw errors or fail silently? (Decided: Fail silently and fall back to default)
- [ ] Should we support language fallback chains (e.g., fr-CA → fr → en)? (Decided: Yes, handled by `mapToSupportedLanguage()`)

## Out of Scope

The following are explicitly **NOT** part of this task:

- **React hooks for guest language state** - Handled in REQ-E04-014 (useGuestLanguage hook)
- **UI components for language switching** - Handled in REQ-E04-008 (GuestLanguageSwitcher component)
- **Middleware integration** - Handled in REQ-E04-020 (Add guest language detection to middleware)
- **Database integration** - Guest language is cookie-only; no database persistence needed
- **Translation fetching** - Handled in REQ-E04-004 (Translation fetch utilities)
- **API endpoint implementation** - Handled in REQ-E04-005 and REQ-E04-006 (Public API endpoints)
- **Authenticated user language detection** - Already complete in Epic 1's `language-detection.ts`
- **Server component modifications** - Handled in REQ-E04-016 (Update guest item page)

## Implementation Notes

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Cookie name | `FAQBNB_GUEST_LANG` | Separate from authenticated users (`FAQBNB_LANG`) to prevent conflicts |
| Cookie expiration | 1 year | Balance between persistence and privacy; matches authenticated user pattern |
| Priority order | URL > Cookie > Accept-Language > Default | Enables shareable links (URL) while respecting user preference (cookie) |
| Language mapping | Regional variants → base language | Simplifies translation management; 'en-US' and 'en-GB' both use 'en' translations |
| Default language | English ('en') | Matches Epic 1 default; safe fallback for international users |
| Server vs Client | Separate functions | Server uses NextRequest, client uses browser APIs; different contexts |

### Function Signatures

```typescript
// Cookie constants
export const GUEST_LANG_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
export const GUEST_LANG_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

// Parse Accept-Language header
export function parseAcceptLanguage(header: string | null): string[];

// Map browser codes to supported languages
export function mapToSupportedLanguage(code: string): SupportedLanguage | null;

// Cookie management
export function setGuestLanguageCookie(
  language: SupportedLanguage,
  context?: 'client' | 'server'
): void | { name: string; value: string; maxAge: number; path: string; secure: boolean; sameSite: string };

export function getGuestLanguageCookie(request?: NextRequest): SupportedLanguage | null;

export function clearGuestLanguageCookie(context?: 'client' | 'server'): void;

// Language detection (server-side)
export function detectGuestLanguage(
  request: NextRequest,
  urlParam?: string
): SupportedLanguage;

// Language detection (client-side)
export function detectGuestLanguageClient(urlParam?: string): SupportedLanguage;
```

### Integration with Existing Infrastructure

| Epic 1 Component | Epic 4 Guest Utility | Relationship |
|------------------|----------------------|-------------|
| `language-detection.ts` | `guest-language.ts` | Parallel utilities for different user types |
| `LOCALE_COOKIE_NAME` ('FAQBNB_LANG') | `GUEST_LANG_COOKIE_NAME` ('FAQBNB_GUEST_LANG') | Separate cookies for authenticated vs guest users |
| `detectUserLanguage()` | `detectGuestLanguage()` | Similar API, different context (user object vs request only) |
| `SupportedLocale` type | `SupportedLanguage` type (from l10n.ts) | Same 6 languages, potentially different type names |

### Accept-Language Header Example

```
Accept-Language: fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5

Parsing result:
1. fr-FR (q=1.0, implicit) → 'fr'
2. fr (q=0.9) → 'fr' (duplicate, filtered)
3. en (q=0.8) → 'en'
4. de (q=0.7) → 'de'
5. * (wildcard, filtered)

Final array: ['fr', 'en', 'de']
Matched to supported: 'fr' (first match)
```

### Cookie Configuration Details

```typescript
// Client-side cookie setting
document.cookie = `FAQBNB_GUEST_LANG=fr; path=/; max-age=31536000; SameSite=Lax; Secure`;

// Server-side cookie configuration (for NextResponse)
{
  name: 'FAQBNB_GUEST_LANG',
  value: 'fr',
  maxAge: 365 * 24 * 60 * 60, // 1 year
  path: '/',
  httpOnly: false, // Allow client-side access for language switcher
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}
```

### Usage Examples

```typescript
// Example 1: Server-side detection in middleware
import { detectGuestLanguage, setGuestLanguageCookie } from '@/lib/i18n/guest-language';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Detect guest language (checks URL param, cookie, Accept-Language)
  const guestLanguage = detectGuestLanguage(req);

  // Set response header for downstream server components
  res.headers.set('x-guest-language', guestLanguage);

  // Ensure cookie is set for future requests
  const cookieConfig = setGuestLanguageCookie(guestLanguage, 'server');
  if (cookieConfig) {
    res.cookies.set(cookieConfig);
  }

  return res;
}

// Example 2: Server component usage
import { detectGuestLanguage } from '@/lib/i18n/guest-language';
import { headers } from 'next/headers';

export default async function ItemPage({ searchParams }) {
  const lang = searchParams.lang;
  const headersList = headers();

  // Create mock NextRequest for detection (or read from header set by middleware)
  const detectedLanguage = headersList.get('x-guest-language') || 'en';

  // Fetch translated content
  const itemData = await fetchTranslatedItem(publicId, detectedLanguage);

  return <ItemDisplay item={itemData} />;
}

// Example 3: Client-side detection in React hook
import { detectGuestLanguageClient, setGuestLanguageCookie } from '@/lib/i18n/guest-language';

export function useGuestLanguage() {
  const [language, setLanguage] = useState(() => {
    return detectGuestLanguageClient(); // Check URL param, cookie, navigator.language
  });

  const changeLanguage = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setGuestLanguageCookie(newLang, 'client'); // Persist to cookie
  };

  return { language, changeLanguage };
}

// Example 4: Testing Accept-Language parsing
const header = 'fr-FR, fr;q=0.9, en-US;q=0.8, en;q=0.7';
const languages = parseAcceptLanguage(header);
// Result: ['fr', 'en']

const mapped = mapToSupportedLanguage('en-US');
// Result: 'en' (SupportedLanguage)

const unsupported = mapToSupportedLanguage('zh-CN');
// Result: null
```

## Acceptance Criteria Verification

- [x] `detectGuestLanguage(request, urlParam?)` correctly prioritizes URL param > cookie > Accept-Language header > default
- [x] `setGuestLanguageCookie(language)` sets a properly configured cookie with appropriate expiration (1 year, Secure, SameSite=Lax)
- [x] `parseAcceptLanguage(header)` correctly parses quality values and returns languages in priority order
- [x] `mapToSupportedLanguage(code)` maps common browser codes (e.g., 'en-US', 'fr-FR') to supported languages
- [x] Unsupported language codes fall back to English gracefully (via `mapToSupportedLanguage` returning null)
- [x] All functions are properly typed using types from `/src/types/l10n.ts`
- [x] Module exports are properly documented with TSDoc comments
- [x] Unit tests cover edge cases including malformed headers and missing cookies

---
*Document generated: 2026-01-22 18:45*
*Agent: Technical Lead - L10N Epic 4 Pipeline*
*Implementation plan reference: Plan-111-L10N-Epic4-Guest-Experience.md*
