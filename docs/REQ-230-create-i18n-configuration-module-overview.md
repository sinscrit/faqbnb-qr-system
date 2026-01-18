# REQ-230: Create i18n Configuration Module - Implementation Overview

**Generated:** 2026-01-17 17:45:00 UTC
**Last Modified:** 2026-01-17 17:45:00 UTC
**Request Reference:** REQ-230 - Centralized Locale Configuration and Server-Side Locale Detection
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 2, Task 2.2)
**Status:** Ready for Implementation

---

## 1. Request Summary

Create a centralized i18n configuration module that defines all supported locales and implements server-side logic to automatically detect the appropriate language for each user request. This module provides a single source of truth for locale configuration and enables automatic language detection based on user preferences, cookies, and browser settings.

**Scope:**
- Create `/src/lib/i18n/config.ts` with locale constants and configuration
- Create `/src/lib/i18n/request.ts` for server-side locale detection
- Create `/src/lib/i18n/index.ts` as a barrel export file
- Define TypeScript types for supported locales and locale configuration
- Implement locale detection priority: user preference > cookie > Accept-Language header > default

**Out of Scope:**
- Middleware integration (Task 5.2)
- IntlProvider wrapper in layout.tsx (Task 2.4)
- LanguageSwitcher component (Task 5.3)
- User preference persistence to database (Task 5.6)
- Translation message file content (Task 2.5)

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| next-intl | (to be installed by Task 2.1) | `package.json` |
| @supabase/ssr | ^0.6.1 | `package.json` |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Configuration module | `/src/lib/config.ts` | Domain configuration with `getServerBaseUrl()` function |
| Server utilities | `/src/lib/supabase-server.ts` | Server-side Supabase client creation |
| Auth server utilities | `/src/lib/auth-server.ts` | Server-side auth utilities |
| Middleware | `/src/middleware.ts` | Request interception with cookie handling |
| Type definitions | `/src/types/index.ts` | Centralized type exports |

### Existing Config Module Pattern

From `/src/lib/config.ts`:
```typescript
// Follows pattern of:
// 1. Priority-based fallback logic
// 2. Environment variable integration
// 3. Server/client compatibility checks
// 4. Clear JSDoc documentation
// 5. Named exports for specific functions
```

### Middleware Cookie Pattern

From `/src/middleware.ts`:
```typescript
// Existing cookie handling pattern:
cookies: {
  get(name: string) {
    return req.cookies.get(name)?.value;
  },
  set(name: string, value: string, options: CookieOptions) {
    req.cookies.set({ name, value, ...options });
    res.cookies.set({ name, value, ...options });
  },
}
```

### i18n Directory Structure

- **Status:** Does not exist
- **Target location:** `/src/lib/i18n/`
- **Convention:** Follows next-intl recommended structure for App Router

---

## 3. Technical Approach

### Supported Locales

Per PRD and Plan requirements:

| Code | Language | Native Name | Status |
|------|----------|-------------|--------|
| `en` | English | English | Default (source) |
| `fr` | French | Francais | Supported |
| `es` | Spanish | Espanol | Supported |
| `de` | German | Deutsch | Supported |
| `nl` | Dutch | Nederlands | Supported |
| `it` | Italian | Italiano | Supported |

### Locale Detection Priority

The system detects the appropriate locale in the following order:

1. **User Database Preference** (authenticated users) - stored in `users.preferred_language`
2. **Cookie** (`FAQBNB_LANG`) - for guest persistence and SSR hydration
3. **Accept-Language Header** - browser language preference
4. **Default Locale** (`en`) - fallback when no preference detected

### Configuration Module Structure

```
/src/lib/i18n/
├── index.ts           # Barrel exports
├── config.ts          # Locale constants and configuration
├── request.ts         # Server-side locale detection (getRequestConfig)
└── types.ts           # TypeScript type definitions (optional, can be in config.ts)
```

### next-intl Integration

The configuration follows next-intl's App Router pattern:

```typescript
// next-intl requires a getRequestConfig function for server-side locale detection
// This is imported by the next-intl/plugin in next.config.ts
```

---

## 4. Implementation Tasks

### Task 2.2.1: Create i18n directory structure

**Action:** Create directory
**Path:** `/src/lib/i18n/`

**Verification:**
- Directory exists at `/src/lib/i18n/`
- Directory is initially empty

---

### Task 2.2.2: Create i18n configuration module (config.ts)

**Action:** Create new file
**File:** `/src/lib/i18n/config.ts`

**Content:**
```typescript
/**
 * i18n Configuration Module
 *
 * Centralized locale configuration for the FAQBNB application.
 * Provides type-safe locale definitions and configuration constants.
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-17
 */

/**
 * Supported locale codes
 * These are the language codes supported by the application.
 */
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

/**
 * Type representing a valid supported locale
 */
export type SupportedLocale = (typeof locales)[number];

/**
 * Default locale used when no preference is detected
 */
export const defaultLocale: SupportedLocale = 'en';

/**
 * Cookie name for storing language preference
 */
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';

/**
 * Cookie max age in seconds (1 year)
 */
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * Locale metadata including native names and optional flags
 */
export interface LocaleMetadata {
  /** ISO locale code */
  code: SupportedLocale;
  /** English name of the language */
  name: string;
  /** Native name of the language */
  nativeName: string;
  /** Optional flag emoji */
  flag?: string;
}

/**
 * Complete locale metadata for all supported languages
 */
export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Francais',
    flag: '🇫🇷',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Espanol',
    flag: '🇪🇸',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
  },
};

/**
 * Get locale metadata for a specific locale
 * @param locale - The locale code to get metadata for
 * @returns Locale metadata or undefined if not found
 */
export function getLocaleMetadata(locale: string): LocaleMetadata | undefined {
  if (isValidLocale(locale)) {
    return localeMetadata[locale];
  }
  return undefined;
}

/**
 * Type guard to check if a string is a valid supported locale
 * @param locale - The string to check
 * @returns True if the locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return locales.includes(locale as SupportedLocale);
}

/**
 * Normalize a locale code to a supported locale
 * Handles variations like 'en-US' -> 'en', 'fr-CA' -> 'fr'
 * @param locale - The locale string to normalize
 * @returns The normalized supported locale or default locale if not found
 */
export function normalizeLocale(locale: string | null | undefined): SupportedLocale {
  if (!locale) {
    return defaultLocale;
  }

  // Direct match
  if (isValidLocale(locale)) {
    return locale;
  }

  // Try extracting the language code (e.g., 'en-US' -> 'en')
  const languageCode = locale.split('-')[0]?.toLowerCase();
  if (languageCode && isValidLocale(languageCode)) {
    return languageCode;
  }

  return defaultLocale;
}

/**
 * Get all supported locales as an array of LocaleMetadata
 * Useful for rendering language selectors
 * @returns Array of locale metadata
 */
export function getAllLocales(): LocaleMetadata[] {
  return locales.map((code) => localeMetadata[code]);
}

/**
 * i18n configuration object for next-intl
 * Used by getRequestConfig and IntlProvider
 */
export const i18nConfig = {
  locales,
  defaultLocale,
  localePrefix: 'as-needed' as const,
} as const;
```

---

### Task 2.2.3: Create server-side locale detection (request.ts)

**Action:** Create new file
**File:** `/src/lib/i18n/request.ts`

**Content:**
```typescript
/**
 * Server-Side Locale Detection
 *
 * Provides the getRequestConfig function required by next-intl for
 * server-side locale detection and message loading.
 *
 * Detection Priority:
 * 1. User database preference (authenticated users)
 * 2. FAQBNB_LANG cookie (guest persistence)
 * 3. Accept-Language header (browser preference)
 * 4. Default locale ('en')
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-17
 */

import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import {
  defaultLocale,
  isValidLocale,
  normalizeLocale,
  LOCALE_COOKIE_NAME,
  type SupportedLocale,
} from './config';

/**
 * Parse Accept-Language header and find the best matching locale
 * @param acceptLanguage - The Accept-Language header value
 * @returns The best matching supported locale or null
 */
function parseAcceptLanguage(acceptLanguage: string | null): SupportedLocale | null {
  if (!acceptLanguage) {
    return null;
  }

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,fr;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.trim(),
        quality: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find the first matching supported locale
  for (const { code } of languages) {
    const normalized = normalizeLocale(code);
    if (normalized !== defaultLocale || isValidLocale(code.split('-')[0])) {
      return normalized;
    }
  }

  return null;
}

/**
 * Detect the locale from the current request
 *
 * Priority order:
 * 1. Cookie (FAQBNB_LANG) - persisted preference
 * 2. Accept-Language header - browser preference
 * 3. Default locale - fallback
 *
 * Note: User database preference is not checked here as it requires
 * database access. The middleware (Task 5.2) will handle syncing
 * the user's database preference to the cookie.
 *
 * @returns The detected locale
 */
async function detectLocale(): Promise<SupportedLocale> {
  // Priority 1: Check cookie for stored preference
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // Priority 2: Parse Accept-Language header
  const headerStore = await headers();
  const acceptLanguage = headerStore.get('Accept-Language');
  const browserLocale = parseAcceptLanguage(acceptLanguage);

  if (browserLocale) {
    return browserLocale;
  }

  // Priority 3: Return default locale
  return defaultLocale;
}

/**
 * next-intl request configuration
 *
 * This function is called by next-intl on each request to determine
 * the locale and load the appropriate messages.
 *
 * @see https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#i18nts
 */
export default getRequestConfig(async () => {
  const locale = await detectLocale();

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});

/**
 * Export detectLocale for use in other server components
 * This allows components to access the detected locale without
 * going through the full getRequestConfig flow.
 */
export { detectLocale };

/**
 * Get the current locale from the request
 * Alias for detectLocale for semantic clarity
 */
export async function getCurrentLocale(): Promise<SupportedLocale> {
  return detectLocale();
}
```

---

### Task 2.2.4: Create barrel export file (index.ts)

**Action:** Create new file
**File:** `/src/lib/i18n/index.ts`

**Content:**
```typescript
/**
 * i18n Module Barrel Export
 *
 * Provides clean import paths for i18n utilities and configuration.
 *
 * Usage:
 *   import { locales, defaultLocale, isValidLocale } from '@/lib/i18n';
 *   import { detectLocale, getCurrentLocale } from '@/lib/i18n';
 *
 * REQ-230: Centralized Locale Configuration and Server-Side Locale Detection
 * Plan-110: L10N Epic 1 - Foundation, Phase 2, Task 2.2
 *
 * @created 2026-01-17
 */

// Configuration exports
export {
  locales,
  defaultLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  localeMetadata,
  i18nConfig,
  getLocaleMetadata,
  isValidLocale,
  normalizeLocale,
  getAllLocales,
  type SupportedLocale,
  type LocaleMetadata,
} from './config';

// Server-side detection exports
// Note: These are async functions and should only be used in Server Components
export { detectLocale, getCurrentLocale } from './request';
```

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/lib/i18n/` | New i18n module directory |
| `/src/lib/i18n/index.ts` | Barrel export file |
| `/src/lib/i18n/config.ts` | Locale configuration and constants |
| `/src/lib/i18n/request.ts` | Server-side locale detection (getRequestConfig) |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/config.ts` | Reference for configuration module pattern |
| `/src/lib/supabase-server.ts` | Reference for server-side utility pattern |
| `/src/middleware.ts` | Reference for cookie handling pattern |
| `/src/types/index.ts` | Reference for type export pattern |
| `/messages/en.json` | Verify messages directory exists (from Task 2.1) |
| `/package.json` | Verify next-intl is installed (from Task 2.1) |
| `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` | Implementation plan reference |

### No Modifications Required

The following files should NOT be modified for this task:

- `/next.config.ts` - Task 2.3 will add the next-intl plugin configuration
- `/src/app/layout.tsx` - Task 2.4 will add IntlProvider wrapper
- `/src/middleware.ts` - Task 5.2 will add language detection and cookie sync
- `/src/types/index.ts` - Types are self-contained in the i18n module
- Any component files - Task 2.6 will verify component integration
- Database migrations - Task 1.3 handles preferred_language columns

---

## 6. Dependencies

### NPM Package Dependencies

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `next-intl` | latest | i18n framework, provides getRequestConfig | Must be installed by Task 2.1 |

### Upstream Dependencies (Tasks this depends on)

| Task | Dependency | Status |
|------|------------|--------|
| Task 2.1: Install and configure next-intl | next-intl package installed | Required |
| Task 2.1: Create messages directory | `/messages/` directory with locale files | Required |

### Downstream Dependencies (Tasks blocked by this)

| Task | Dependency |
|------|------------|
| Task 2.3: Update next.config.ts for i18n | Requires request.ts for plugin configuration |
| Task 2.4: Create IntlProvider wrapper | Requires config.ts for locale configuration |
| Task 5.1: Create language detection utility | Extends config.ts patterns |
| Task 5.2: Update middleware for language handling | Uses LOCALE_COOKIE_NAME from config.ts |
| Task 5.3: Create LanguageSwitcher component | Uses getAllLocales() from config.ts |

---

## 7. Acceptance Criteria

From REQ-230:

- [ ] A configuration module exists that lists all supported locale codes (`/src/lib/i18n/config.ts`)
- [ ] A default locale is explicitly defined in the configuration (`defaultLocale = 'en'`)
- [ ] Server-side request handling includes locale detection logic (`/src/lib/i18n/request.ts`)
- [ ] Locale detection considers user account preferences if authenticated (via cookie sync from middleware - Task 5.2)
- [ ] Locale detection falls back to browser Accept-Language headers for unauthenticated requests
- [ ] The detected locale is accessible throughout the server request processing pipeline (via `detectLocale()` export)
- [ ] Configuration can be imported and reused across different parts of the application (barrel export `/src/lib/i18n/index.ts`)

Additional Technical Criteria:

- [ ] `locales` array contains all 6 supported locales: 'en', 'fr', 'es', 'de', 'nl', 'it'
- [ ] `isValidLocale()` type guard correctly validates locale strings
- [ ] `normalizeLocale()` handles locale variations like 'en-US' -> 'en'
- [ ] `getRequestConfig()` correctly loads messages from `/messages/{locale}.json`
- [ ] Cookie name `FAQBNB_LANG` is defined as a constant
- [ ] All exports are TypeScript type-safe
- [ ] JSDoc comments document all public functions

---

## 8. Testing Strategy

### Pre-Implementation Verification

1. **Verify Task 2.1 Complete:**
   ```bash
   # Check next-intl is installed
   npm list next-intl
   # Expected: next-intl@x.x.x

   # Check messages directory exists
   ls messages/
   # Expected: en.json, fr.json, es.json, de.json, nl.json, it.json
   ```

### Post-Implementation Verification

2. **TypeScript Compilation Check:**
   ```bash
   # Verify no TypeScript errors
   npx tsc --noEmit
   # Expected: No errors
   ```

3. **Module Import Check:**
   ```bash
   # Create a test file to verify imports work
   cat > /tmp/test-i18n-imports.ts << 'EOF'
   import {
     locales,
     defaultLocale,
     isValidLocale,
     normalizeLocale,
     getAllLocales,
     LOCALE_COOKIE_NAME,
     type SupportedLocale,
   } from '@/lib/i18n';

   // Type checks
   const locale: SupportedLocale = 'en';
   const valid: boolean = isValidLocale('fr');
   const normalized: SupportedLocale = normalizeLocale('en-US');
   const all = getAllLocales();

   console.log({ locales, defaultLocale, locale, valid, normalized, all, LOCALE_COOKIE_NAME });
   EOF
   ```

4. **Configuration Values Check:**
   ```typescript
   // Verify configuration exports
   import { locales, defaultLocale, localeMetadata } from '@/lib/i18n';

   console.assert(locales.length === 6, 'Should have 6 locales');
   console.assert(locales.includes('en'), 'Should include en');
   console.assert(locales.includes('fr'), 'Should include fr');
   console.assert(locales.includes('es'), 'Should include es');
   console.assert(locales.includes('de'), 'Should include de');
   console.assert(locales.includes('nl'), 'Should include nl');
   console.assert(locales.includes('it'), 'Should include it');
   console.assert(defaultLocale === 'en', 'Default locale should be en');
   console.assert(Object.keys(localeMetadata).length === 6, 'Should have metadata for 6 locales');
   ```

5. **Type Guard Tests:**
   ```typescript
   import { isValidLocale, normalizeLocale } from '@/lib/i18n';

   // Valid locales
   console.assert(isValidLocale('en') === true);
   console.assert(isValidLocale('fr') === true);
   console.assert(isValidLocale('es') === true);

   // Invalid locales
   console.assert(isValidLocale('xx') === false);
   console.assert(isValidLocale('') === false);
   console.assert(isValidLocale('english') === false);

   // Normalization
   console.assert(normalizeLocale('en-US') === 'en');
   console.assert(normalizeLocale('fr-CA') === 'fr');
   console.assert(normalizeLocale('de-AT') === 'de');
   console.assert(normalizeLocale('xx-YY') === 'en'); // Falls back to default
   console.assert(normalizeLocale(null) === 'en');
   console.assert(normalizeLocale(undefined) === 'en');
   ```

6. **Build Verification:**
   ```bash
   # Ensure project still builds
   npm run build
   # Expected: Build completes successfully
   ```

### Manual Verification Checklist

- [ ] `/src/lib/i18n/` directory exists
- [ ] `/src/lib/i18n/index.ts` exports all required items
- [ ] `/src/lib/i18n/config.ts` contains locale configuration
- [ ] `/src/lib/i18n/request.ts` contains getRequestConfig
- [ ] TypeScript compilation passes
- [ ] All 6 locales are defined
- [ ] Default locale is 'en'
- [ ] Cookie name constant is defined
- [ ] JSDoc comments are present on all public exports

---

## 9. Architecture Notes

### Why Separate config.ts and request.ts?

1. **Separation of Concerns:**
   - `config.ts` contains pure configuration (no async, no server-only code)
   - `request.ts` contains server-specific detection logic (uses Next.js headers/cookies)

2. **Import Flexibility:**
   - `config.ts` can be imported in both client and server components
   - `request.ts` should only be imported in server components

3. **next-intl Requirements:**
   - The `getRequestConfig` function in `request.ts` is the entry point for next-intl's server-side locale detection
   - It will be referenced in `next.config.ts` (Task 2.3)

### Cookie vs Database Preference

The locale detection in `request.ts` only checks the cookie, not the database. This is intentional:

1. **Performance:** Checking the database on every request would add latency
2. **Separation:** The middleware (Task 5.2) is responsible for syncing database preferences to cookies
3. **Guest Support:** Cookies work for both authenticated and guest users

The sync flow will be:
```
User logs in → Middleware reads DB preference → Sets cookie → request.ts reads cookie
```

### Accept-Language Parsing

The implementation parses the full Accept-Language header with quality values:
```
Accept-Language: en-US,en;q=0.9,fr;q=0.8
```

This ensures proper fallback behavior when the user's preferred language isn't supported.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Message file not found at runtime | Medium | High | Verify messages directory exists before implementation |
| TypeScript path alias issues | Low | Medium | Use same path aliases as existing codebase (@/lib/...) |
| Server/client import confusion | Medium | Medium | Clear JSDoc documentation on which exports are server-only |
| Accept-Language parsing edge cases | Low | Low | Fallback to default locale on any parsing error |
| Cookie access fails | Low | Medium | Graceful fallback to Accept-Language or default |
| next-intl API changes | Low | Medium | Pin next-intl version in package.json |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Create i18n directory | 1 min |
| Create config.ts with types and constants | 15 min |
| Create request.ts with getRequestConfig | 20 min |
| Create index.ts barrel exports | 5 min |
| TypeScript verification | 5 min |
| Build verification | 5 min |
| **Total** | **~50 min** |

---

## 12. Implementation Commands Summary

```bash
# Step 1: Create i18n directory
mkdir -p src/lib/i18n

# Step 2: Create configuration files
# (Use file contents from Task sections 2.2.2 - 2.2.4)

# Step 3: Verify TypeScript compilation
npx tsc --noEmit

# Step 4: Verify imports work
# Create a simple test in a server component

# Step 5: Verify build
npm run build
```

---

## 13. Next Steps After Implementation

After completing Task 2.2 (this task):

1. **Task 2.3:** Update next.config.ts for i18n - add next-intl plugin referencing `request.ts`
2. **Task 2.4:** Create IntlProvider wrapper in `/src/app/layout.tsx`
3. **Task 2.5:** Expand translation file structure with more detailed content
4. **Task 2.6:** Verify sample component using `t()` function works correctly
5. **Task 5.1:** Create language detection utility (extends this module)
6. **Task 5.2:** Update middleware for language handling (uses LOCALE_COOKIE_NAME)

---

## 14. Code Examples for Downstream Tasks

### Usage in Server Components

```typescript
// In a Server Component
import { getCurrentLocale, getLocaleMetadata } from '@/lib/i18n';

export default async function Page() {
  const locale = await getCurrentLocale();
  const metadata = getLocaleMetadata(locale);

  return (
    <div>
      <p>Current language: {metadata?.nativeName}</p>
    </div>
  );
}
```

### Usage in Client Components

```typescript
// In a Client Component (config only, not request.ts)
'use client';

import { locales, getAllLocales, isValidLocale } from '@/lib/i18n';

export function LanguageSelector() {
  const allLocales = getAllLocales();

  return (
    <select>
      {allLocales.map((locale) => (
        <option key={locale.code} value={locale.code}>
          {locale.nativeName}
        </option>
      ))}
    </select>
  );
}
```

### Usage in Middleware (Task 5.2)

```typescript
// In middleware.ts
import { LOCALE_COOKIE_NAME, isValidLocale, defaultLocale } from '@/lib/i18n';

export async function middleware(req: NextRequest) {
  const localeCookie = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isValidLocale(localeCookie) ? localeCookie : defaultLocale;
  // ... use locale for response handling
}
```

---

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [next-intl App Router Server-Side Setup](https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing)
- [next-intl getRequestConfig](https://next-intl-docs.vercel.app/docs/usage/configuration#i18nts)
- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-229: Install and Configure next-intl](/docs/REQ-229-install-and-configure-next-intl-overview.md)

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 2, Task 2.2*
