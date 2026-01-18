# REQ-246: Create Language Detection Utility - Implementation Overview

**Generated:** 2026-01-18 12:00:00 UTC
**Last Modified:** 2026-01-18 12:00:00 UTC
**Request Reference:** Task 5.1 from Plan-110-L10N-Epic1-Foundation.md (Phase 5: Language Switching Infrastructure)
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Status:** Ready for Implementation

---

## 1. Request Summary

Create a language detection utility module that determines the appropriate locale for a user based on a prioritized cascade of sources. The utility will be used by middleware and server-side components to detect and set the user's preferred language.

**Primary Function:** `detectUserLanguage(request, user?): string`

**Priority Order:**
1. User preference (from authenticated user's database record)
2. Cookie (FAQBNB_LANG cookie)
3. Accept-Language HTTP header
4. Default locale ('en')

This utility is the foundation for the language switching infrastructure and will be integrated into the Next.js middleware for request-level language detection.

---

## 2. Current State Analysis

### Existing Related Files and Patterns

| File Path | Relevance |
|-----------|-----------|
| `/src/middleware.ts` | **Integration Target** - Current middleware handles auth; language detection will be added |
| `/src/lib/session.ts` | Cookie handling patterns |
| `/src/lib/supabase-server.ts` | Server-side Supabase client creation pattern |
| `/src/lib/auth-server.ts` | Request authentication pattern using `createSupabaseServer` |
| `/src/contexts/AuthContext.tsx` | User/Account state management patterns |
| `/src/types/index.ts` | Centralized type definitions pattern |

### Authentication Pattern (from middleware.ts)

The current middleware uses Supabase SSR for authentication:
```typescript
const supabase = createServerClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) { return req.cookies.get(name)?.value; },
      set(name: string, value: string, options: CookieOptions) { ... },
      remove(name: string, options: CookieOptions) { ... },
    },
  }
)
```

### Existing Cookie Pattern

From middleware.ts cookie handling:
```typescript
req.cookies.get(name)?.value  // Read cookie
res.cookies.set({ name, value, ...options })  // Set cookie
```

### Database Schema (Per Plan-110)

The `users` table will have a `preferred_language` column added (Task 1.3 from Phase 1):
```sql
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
```

**Note:** This utility depends on Phase 1 (Task 1.3) completion for user preference storage.

---

## 3. Technical Approach

### Module Structure

```
/src/lib/i18n/
├── index.ts                     # i18n module barrel exports
├── config.ts                    # Locale configuration (constants)
├── language-detection.ts        # Language detection utility (this task)
└── request.ts                   # Server-side locale request helpers
```

### Constants and Configuration

```typescript
// /src/lib/i18n/config.ts
export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
```

### Detection Function Signature

```typescript
// /src/lib/i18n/language-detection.ts

import { NextRequest } from 'next/server';

interface UserLocalePreference {
  id: string;
  preferred_language?: string | null;
}

interface DetectLanguageOptions {
  /** Skip database lookup even if user is provided */
  skipDbLookup?: boolean;
  /** Custom cookie name override */
  cookieName?: string;
}

/**
 * Detects the user's preferred language using a prioritized cascade:
 * 1. User database preference (if user provided and has preference)
 * 2. Cookie value (FAQBNB_LANG)
 * 3. Accept-Language header (first supported match)
 * 4. Default locale ('en')
 *
 * @param request - The incoming Next.js request object
 * @param user - Optional user object with potential language preference
 * @param options - Detection options
 * @returns The detected locale code (always a supported locale)
 */
export function detectUserLanguage(
  request: NextRequest,
  user?: UserLocalePreference | null,
  options?: DetectLanguageOptions
): SupportedLocale;
```

### Accept-Language Header Parsing

The Accept-Language header follows RFC 7231 format:
```
Accept-Language: fr-FR, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
```

Parsing strategy:
1. Split by comma
2. Extract language code and quality value
3. Sort by quality (descending)
4. Return first matching supported locale

---

## 4. Implementation Tasks

### Task 5.1.1: Create i18n Configuration Module

**Action:** Create new file with locale constants
**File:** `/src/lib/i18n/config.ts`

```typescript
/**
 * i18n Configuration
 * Defines supported locales and language-related constants
 */

export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

/**
 * Locale display names for UI
 */
export const LOCALE_DISPLAY_NAMES: Record<SupportedLocale, { english: string; native: string }> = {
  en: { english: 'English', native: 'English' },
  fr: { english: 'French', native: 'Francais' },
  es: { english: 'Spanish', native: 'Espanol' },
  de: { english: 'German', native: 'Deutsch' },
  nl: { english: 'Dutch', native: 'Nederlands' },
  it: { english: 'Italian', native: 'Italiano' },
};

/**
 * Type guard to check if a string is a supported locale
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
```

### Task 5.1.2: Create Language Detection Utility

**Action:** Create new file with detection logic
**File:** `/src/lib/i18n/language-detection.ts`

Subtasks:
- [ ] Create type definitions for function parameters
- [ ] Implement `detectUserLanguage` main function
- [ ] Implement `parseAcceptLanguageHeader` helper function
- [ ] Implement `getLocaleFromCookie` helper function
- [ ] Add comprehensive logging for debugging
- [ ] Add JSDoc documentation

### Task 5.1.3: Create Accept-Language Parser

**Action:** Implement Accept-Language header parsing
**File:** `/src/lib/i18n/language-detection.ts`

```typescript
interface LanguageQuality {
  locale: string;
  quality: number;
}

/**
 * Parses the Accept-Language header and returns sorted language preferences
 * @param acceptLanguage - The Accept-Language header value
 * @returns Array of language codes sorted by quality (highest first)
 */
function parseAcceptLanguageHeader(acceptLanguage: string | null): string[] {
  if (!acceptLanguage) return [];

  const languages: LanguageQuality[] = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        locale: code.split('-')[0].toLowerCase(), // Extract primary language tag
        quality: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .filter(lang => lang.locale && !isNaN(lang.quality));

  // Sort by quality descending
  languages.sort((a, b) => b.quality - a.quality);

  // Return unique locales in order
  return [...new Set(languages.map(l => l.locale))];
}
```

### Task 5.1.4: Implement Cookie Reading Helper

**Action:** Add cookie reading function
**File:** `/src/lib/i18n/language-detection.ts`

```typescript
import { NextRequest } from 'next/server';
import { LOCALE_COOKIE_NAME, isSupportedLocale, SupportedLocale } from './config';

/**
 * Reads the locale preference from cookie
 * @param request - The incoming request
 * @param cookieName - Optional override for cookie name
 * @returns The locale from cookie if valid, or null
 */
function getLocaleFromCookie(
  request: NextRequest,
  cookieName: string = LOCALE_COOKIE_NAME
): SupportedLocale | null {
  const cookieValue = request.cookies.get(cookieName)?.value;

  if (cookieValue && isSupportedLocale(cookieValue)) {
    return cookieValue;
  }

  return null;
}
```

### Task 5.1.5: Implement Main Detection Function

**Action:** Implement the complete detection cascade
**File:** `/src/lib/i18n/language-detection.ts`

```typescript
/**
 * Detects the user's preferred language using a prioritized cascade
 */
export function detectUserLanguage(
  request: NextRequest,
  user?: UserLocalePreference | null,
  options?: DetectLanguageOptions
): SupportedLocale {
  const cookieName = options?.cookieName ?? LOCALE_COOKIE_NAME;

  // Priority 1: User database preference
  if (user?.preferred_language && isSupportedLocale(user.preferred_language)) {
    console.log('[i18n] Language detected from user preference:', user.preferred_language);
    return user.preferred_language;
  }

  // Priority 2: Cookie value
  const cookieLocale = getLocaleFromCookie(request, cookieName);
  if (cookieLocale) {
    console.log('[i18n] Language detected from cookie:', cookieLocale);
    return cookieLocale;
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  const headerLocales = parseAcceptLanguageHeader(acceptLanguage);

  for (const locale of headerLocales) {
    if (isSupportedLocale(locale)) {
      console.log('[i18n] Language detected from Accept-Language header:', locale);
      return locale;
    }
  }

  // Priority 4: Default locale
  console.log('[i18n] Using default locale:', DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
}
```

### Task 5.1.6: Create i18n Module Barrel Export

**Action:** Create index.ts for clean imports
**File:** `/src/lib/i18n/index.ts`

```typescript
/**
 * i18n Module Exports
 * Centralized exports for internationalization utilities
 */

// Configuration
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_DISPLAY_NAMES,
  isSupportedLocale,
  type SupportedLocale,
} from './config';

// Language Detection
export {
  detectUserLanguage,
  type UserLocalePreference,
  type DetectLanguageOptions,
} from './language-detection';
```

### Task 5.1.7: Add Cookie Setting Utility

**Action:** Add helper function for setting locale cookie
**File:** `/src/lib/i18n/language-detection.ts`

```typescript
import { NextResponse } from 'next/server';

/**
 * Sets the locale cookie on a response
 * @param response - The Next.js response to modify
 * @param locale - The locale to set
 * @param cookieName - Optional override for cookie name
 */
export function setLocaleCookie(
  response: NextResponse,
  locale: SupportedLocale,
  cookieName: string = LOCALE_COOKIE_NAME
): void {
  response.cookies.set({
    name: cookieName,
    value: locale,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false, // Allow client-side access for language switcher
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/lib/i18n/config.ts` | Locale configuration constants and type guards |
| `/src/lib/i18n/language-detection.ts` | Language detection utility functions |
| `/src/lib/i18n/index.ts` | Module barrel exports |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/middleware.ts` | Understanding request/cookie patterns |
| `/src/lib/auth-server.ts` | Authentication pattern reference |
| `/src/lib/supabase-server.ts` | Server client pattern |
| `/src/types/index.ts` | Type definition patterns |

### No Modifications Required

The following files should NOT be modified in this task:
- `/src/middleware.ts` (Task 5.2 - separate task)
- `/src/lib/supabase.ts` (Phase 1 task)
- Database schema (Phase 1 task)

---

## 6. Dependencies

### Internal Dependencies

| Dependency | Import Path | Usage |
|------------|-------------|-------|
| `NextRequest` | `next/server` | Request type for cookie/header access |
| `NextResponse` | `next/server` | Response type for cookie setting |

### External Dependencies

No new external dependencies required. This task uses only Next.js built-in types.

### Database Dependencies

**Note:** This task has a soft dependency on Phase 1, Task 1.3 (Add preferred_language column to users table). The utility will gracefully handle cases where:
- The user object doesn't have `preferred_language` property
- The `preferred_language` value is null/undefined

---

## 7. Acceptance Criteria

From Plan-110 Task 5.1:

- [ ] `detectUserLanguage` function exists and is exported
- [ ] Function accepts `NextRequest` and optional user object
- [ ] Priority 1: User database preference is checked first (when user is provided)
- [ ] Priority 2: Cookie (FAQBNB_LANG) is checked second
- [ ] Priority 3: Accept-Language header is parsed and first supported match is used
- [ ] Priority 4: Default locale ('en') is returned if no other source matches
- [ ] Only supported locales ('en', 'fr', 'es', 'de', 'nl', 'it') are returned
- [ ] Invalid/unsupported locales from any source are ignored
- [ ] Function is type-safe with TypeScript
- [ ] Console logging helps debug detection source

### Additional Verification

- [ ] Accept-Language header with quality values is parsed correctly
- [ ] Accept-Language with regional variants (e.g., 'fr-FR') extracts primary language
- [ ] Cookie with invalid locale value falls through to next priority
- [ ] User with null preferred_language falls through to cookie check
- [ ] Empty Accept-Language header falls through to default
- [ ] `setLocaleCookie` utility correctly sets cookie with proper options

---

## 8. Testing Strategy

### Manual Testing

1. **Test user preference priority:**
   ```typescript
   // Mock request with cookie and Accept-Language
   // User has preferred_language: 'fr'
   // Should return 'fr' (user preference)
   ```

2. **Test cookie fallback:**
   ```typescript
   // Mock request with FAQBNB_LANG cookie = 'de'
   // No user provided
   // Should return 'de' (cookie)
   ```

3. **Test Accept-Language fallback:**
   ```typescript
   // Mock request with Accept-Language: 'es-MX, es;q=0.9, en;q=0.8'
   // No user, no cookie
   // Should return 'es' (first supported from header)
   ```

4. **Test default fallback:**
   ```typescript
   // Mock request with Accept-Language: 'zh-CN, ja;q=0.9'
   // No user, no cookie
   // Should return 'en' (default - no supported locales in header)
   ```

### Edge Cases

- User with `preferred_language: null`
- Cookie with value not in supported locales
- Accept-Language header with only unsupported languages
- Accept-Language with wildcard (`*`)
- Empty or malformed Accept-Language header
- Quality values out of range (handled gracefully)

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Phase 1 not complete (no preferred_language column) | Low | Low | Function gracefully handles missing property |
| Accept-Language parsing edge cases | Medium | Low | Use defensive parsing with fallbacks |
| Cookie manipulation by users | Medium | Low | Validate against supported locales only |
| Performance impact in middleware | Low | Medium | Simple in-memory operations, no DB calls |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Create config.ts with constants | 15 min |
| Implement Accept-Language parser | 20 min |
| Implement cookie helper | 10 min |
| Implement main detection function | 20 min |
| Create barrel exports | 5 min |
| Add cookie setting utility | 10 min |
| Testing and verification | 20 min |
| **Total** | **~100 min (1.5 hours)** |

---

## 11. Next Steps After Implementation

After completing Task 5.1 (this task):

1. **Task 5.2:** Update middleware for language handling (`/src/middleware.ts`)
2. **Task 5.3:** Create LanguageSwitcher component
3. **Task 5.4:** Create useLanguagePreference hook
4. **Task 5.5:** Create LocaleContext (optional enhancement)
5. **Task 5.6:** Add language preference API endpoint

---

## 12. Integration Notes

### Middleware Integration (Task 5.2)

The language detection utility will be integrated into middleware like this:

```typescript
// /src/middleware.ts (Task 5.2 - DO NOT MODIFY IN THIS TASK)
import { detectUserLanguage, setLocaleCookie } from '@/lib/i18n';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Get user if authenticated (existing pattern)
  const { data: { user } } = await supabase.auth.getUser();

  // Detect language
  const locale = detectUserLanguage(req, user ? { id: user.id, preferred_language: user.user_metadata?.preferred_language } : null);

  // Set/refresh cookie
  setLocaleCookie(res, locale);

  // Store locale in request header for server components
  res.headers.set('x-locale', locale);

  return res;
}
```

### next-intl Integration

The detected locale will be used by next-intl's `getRequestConfig`:

```typescript
// /src/lib/i18n/request.ts (Phase 2 task)
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default
  };
});
```

---

## References

- [Plan-110-L10N-Epic1-Foundation.md](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - Full implementation plan
- [PRD_L10N_Epic1_Foundation.md](/docs/prd/PRD_L10N_Epic1_Foundation.md) - Product requirements
- [RFC 7231 - Accept-Language](https://tools.ietf.org/html/rfc7231#section-5.3.5) - HTTP header specification
- [next-intl Documentation](https://next-intl-docs.vercel.app/) - i18n framework reference

---

*Implementation overview generated for FAQBNB Localization Epic 1 - Foundation (Phase 5, Task 5.1)*
