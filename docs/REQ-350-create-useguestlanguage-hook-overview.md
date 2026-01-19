# REQ-350: Create useGuestLanguage Hook - Implementation Overview

**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 4 - Guest Language Hook
**Task ID:** 4.1
**Epic:** L10N Epic 4 - Guest Experience

---

## Summary

Create a custom React hook `useGuestLanguage` that manages guest language preferences for the public-facing item display pages. This hook centralizes all guest language state logic including current language selection, "view original" toggle state, cookie persistence, URL parameter synchronization for shareable links, and browser language detection fallback.

---

## Current Behavior

- The codebase has `useLanguagePreference` hook (`/src/hooks/useLanguagePreference.ts`) for authenticated user language preferences
- The `LocaleContext` (`/src/contexts/LocaleContext.tsx`) provides application-wide locale management but is tightly coupled with authentication
- Guest-facing item pages (`/src/app/item/[publicId]/page.tsx`) have no dedicated language state management
- The `ItemDisplay` component (`/src/components/ItemDisplay.tsx`) displays content without translation support
- Language detection utilities exist in `/src/lib/i18n/language-detection.ts` and `/src/lib/i18n/config.ts`
- No mechanism exists to toggle between translated and original content on guest pages

---

## Expected Behavior

The `useGuestLanguage` hook will:

1. **Manage language state**: Track `currentLanguage` and `showOriginal` state values
2. **Initialize from multiple sources** with priority: URL param `?lang=` > Cookie `FAQBNB_GUEST_LANG` > Browser Accept-Language > Source language
3. **Persist preference to cookie**: 1-year expiry with proper security attributes (path=/, SameSite=Lax)
4. **Handle language changes**: Update cookie, compute effective display language, optionally trigger content refetch callback
5. **Toggle original/translated**: Client-side state swap without network request
6. **Sync with URL**: Support shareable links with `?lang=` parameter
7. **Provide derived state**: Compute `displayLanguage` considering both `currentLanguage` and `showOriginal` states

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| `useLanguagePreference` | `/src/hooks/useLanguagePreference.ts` | Cookie handling, localStorage fallback, browser detection |
| `LocaleContext` | `/src/contexts/LocaleContext.tsx` | State management pattern, supported locales constant |
| `i18n/config.ts` | `/src/lib/i18n/config.ts` | `SupportedLocale` type, `isSupportedLocale()` validation |
| `language-detection.ts` | `/src/lib/i18n/language-detection.ts` | Server-side detection pattern (reference only) |

### Key Constants from Existing Code

```typescript
// From /src/lib/i18n/config.ts
export const locales = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
export type SupportedLocale = (typeof locales)[number];
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

// For guests, we may use a distinct cookie name
export const GUEST_COOKIE_NAME = 'FAQBNB_GUEST_LANG'; // As per Plan-111
```

### Dependencies

- Epic 1 Foundation must be complete (i18n config, supported locales)
- Types from `/src/types/index.ts` may need extension for L10N types
- No new npm packages required

---

## Implementation Tasks

### Task 1: Define Hook Types and Interfaces

**File:** `/src/hooks/useGuestLanguage.ts`

Define TypeScript interfaces following the plan contract:

```typescript
import { SupportedLocale } from '@/lib/i18n/config';

export interface UseGuestLanguageOptions {
  /** Initial language detected/passed from server component */
  initialLanguage?: SupportedLocale;
  /** Source/original language of the content being displayed */
  sourceLanguage: SupportedLocale;
  /** Array of languages that have translations available for this content */
  availableTranslations: SupportedLocale[];
}

export interface UseGuestLanguageReturn {
  /** Currently selected language preference */
  currentLanguage: SupportedLocale;
  /** Whether user toggled to show original content */
  showOriginal: boolean;
  /** Effective display language (sourceLanguage if showOriginal, else currentLanguage) */
  displayLanguage: SupportedLocale;
  /** Change the selected language, persists to cookie */
  setLanguage: (language: SupportedLocale) => void;
  /** Toggle between translation and original */
  toggleOriginal: () => void;
  /** Check if a specific language has translation available */
  hasTranslation: (language: SupportedLocale) => boolean;
}
```

---

### Task 2: Implement Cookie Utilities

**File:** `/src/hooks/useGuestLanguage.ts`

Implement cookie read/write utilities specific to guest language preference:

```typescript
const GUEST_COOKIE_NAME = 'FAQBNB_GUEST_LANG';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function getGuestLanguageCookie(): SupportedLocale | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === GUEST_COOKIE_NAME && isSupportedLocale(value)) {
      return value as SupportedLocale;
    }
  }
  return null;
}

function setGuestLanguageCookie(language: SupportedLocale): void {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_MAX_AGE * 1000);
  document.cookie = `${GUEST_COOKIE_NAME}=${language};path=/;expires=${expires.toUTCString()};SameSite=Lax`;
}
```

---

### Task 3: Implement URL Parameter Handling

**File:** `/src/hooks/useGuestLanguage.ts`

Handle URL query parameter `?lang=` for shareable links:

```typescript
function getLanguageFromURL(): SupportedLocale | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');

  if (langParam && isSupportedLocale(langParam)) {
    return langParam as SupportedLocale;
  }
  return null;
}

function updateURLParameter(language: SupportedLocale): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.set('lang', language);

  // Update URL without page reload
  window.history.replaceState({}, '', url.toString());
}
```

---

### Task 4: Implement Browser Language Detection Fallback

**File:** `/src/hooks/useGuestLanguage.ts`

Fallback to browser's preferred language:

```typescript
function detectBrowserLanguage(): SupportedLocale {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (!browserLang) return 'en';

  // Extract primary language (e.g., 'en-US' -> 'en')
  const primary = browserLang.split('-')[0].toLowerCase();

  if (isSupportedLocale(primary)) {
    return primary as SupportedLocale;
  }

  return 'en'; // Default fallback
}
```

---

### Task 5: Implement Main Hook Logic

**File:** `/src/hooks/useGuestLanguage.ts`

Implement the hook with state management and callbacks:

```typescript
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';

export function useGuestLanguage(options: UseGuestLanguageOptions): UseGuestLanguageReturn {
  const { initialLanguage, sourceLanguage, availableTranslations } = options;

  // Initialize language with priority: initialLanguage (from server) > URL > Cookie > Browser > Source
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLocale>(() => {
    // During SSR, use initialLanguage or source
    if (typeof window === 'undefined') {
      return initialLanguage || sourceLanguage;
    }

    // Priority 1: URL parameter
    const urlLang = getLanguageFromURL();
    if (urlLang) return urlLang;

    // Priority 2: Cookie
    const cookieLang = getGuestLanguageCookie();
    if (cookieLang) return cookieLang;

    // Priority 3: Browser detection
    const browserLang = detectBrowserLanguage();
    if (browserLang !== sourceLanguage) return browserLang;

    // Priority 4: Initial language from server or source
    return initialLanguage || sourceLanguage;
  });

  const [showOriginal, setShowOriginal] = useState(false);

  // Sync URL on mount if language differs
  useEffect(() => {
    const urlLang = getLanguageFromURL();
    if (urlLang && urlLang !== currentLanguage) {
      setCurrentLanguageState(urlLang);
    }
  }, []);

  // Compute effective display language
  const displayLanguage = useMemo(() => {
    return showOriginal ? sourceLanguage : currentLanguage;
  }, [showOriginal, sourceLanguage, currentLanguage]);

  // Change language handler
  const setLanguage = useCallback((language: SupportedLocale) => {
    if (!isSupportedLocale(language)) return;

    setCurrentLanguageState(language);
    setShowOriginal(false); // Reset toggle when changing language
    setGuestLanguageCookie(language);
    updateURLParameter(language);
  }, []);

  // Toggle original/translated
  const toggleOriginal = useCallback(() => {
    setShowOriginal(prev => !prev);
  }, []);

  // Check if translation is available
  const hasTranslation = useCallback((language: SupportedLocale): boolean => {
    if (language === sourceLanguage) return true; // Original always available
    return availableTranslations.includes(language);
  }, [sourceLanguage, availableTranslations]);

  return {
    currentLanguage,
    showOriginal,
    displayLanguage,
    setLanguage,
    toggleOriginal,
    hasTranslation,
  };
}

export default useGuestLanguage;
```

---

### Task 6: Add Type Exports

**File:** `/src/types/index.ts`

Export the hook types for external use:

```typescript
// Add to existing exports
export type {
  UseGuestLanguageOptions,
  UseGuestLanguageReturn,
} from '@/hooks/useGuestLanguage';
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useGuestLanguage.ts` | Main hook implementation |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/types/index.ts` | Add exports for hook types |

### Functions/Components to Create

| Function | File | Purpose |
|----------|------|---------|
| `useGuestLanguage` | `/src/hooks/useGuestLanguage.ts` | Main hook function |
| `getGuestLanguageCookie` | `/src/hooks/useGuestLanguage.ts` | Read cookie utility |
| `setGuestLanguageCookie` | `/src/hooks/useGuestLanguage.ts` | Write cookie utility |
| `getLanguageFromURL` | `/src/hooks/useGuestLanguage.ts` | URL param reader |
| `updateURLParameter` | `/src/hooks/useGuestLanguage.ts` | URL param updater |
| `detectBrowserLanguage` | `/src/hooks/useGuestLanguage.ts` | Browser detection fallback |

### Existing Functions to Reference (Read-Only)

| Function | File | Purpose |
|----------|------|---------|
| `isSupportedLocale` | `/src/lib/i18n/config.ts` | Validate locale codes |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Type for locale codes |
| `LOCALE_COOKIE_MAX_AGE` | `/src/lib/i18n/config.ts` | Cookie expiry constant |

---

## Acceptance Criteria Checklist

- [ ] Hook exports a function named `useGuestLanguage` callable from any React component
- [ ] Hook manages `currentLanguage` state for guest's selected preference
- [ ] Hook manages `showOriginal` state for toggle between translated/original
- [ ] Hook reads initial language from URL query parameter `?lang=` on mount
- [ ] Hook reads from cookie when no URL parameter present
- [ ] Hook falls back to browser detection when no cookie exists
- [ ] Hook provides `setLanguage` callback that updates cookie and URL
- [ ] Hook provides `toggleOriginal` callback for instant client-side toggle
- [ ] Hook synchronizes language with URL for shareable links
- [ ] Cookie includes proper path, expiration, and SameSite attributes
- [ ] Hook handles edge cases (unsupported codes, malformed params)
- [ ] TypeScript types are properly defined for parameters and return values
- [ ] Hook follows React hooks conventions and works with Strict Mode
- [ ] `displayLanguage` correctly computes effective language considering toggle state

---

## Dependencies

### Upstream (Required Before This Task)

- **Epic 1 - Task 2.2**: i18n configuration (`/src/lib/i18n/config.ts`) with `SupportedLocale` type
- **REQ-230**: Centralized locale configuration

### Downstream (Depends on This Task)

- **Task 5.2**: Update ItemDisplay component to integrate this hook
- **Task 3.1-3.5**: Guest UI components (GuestLanguageSwitcher, TranslationBanner, etc.)
- **Task 5.1**: Update guest item page to pass translation props

---

## Testing Considerations

### Unit Tests to Write

1. Test initialization from URL parameter
2. Test initialization from cookie when no URL param
3. Test browser detection fallback
4. Test `setLanguage` updates both state and cookie
5. Test `toggleOriginal` toggles `showOriginal` state
6. Test `displayLanguage` computation
7. Test `hasTranslation` returns correct boolean
8. Test handling of invalid/unsupported language codes

### Manual Testing Scenarios

1. Visit `/item/ABC123?lang=fr` - should display French
2. Remove URL param, refresh - should remember French from cookie
3. Clear cookies, visit page - should detect browser language
4. Toggle "View Original" - should switch display instantly
5. Share link with `?lang=es` - recipient should see Spanish

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cookie blocked by browser | Low | Low | Graceful fallback to URL param or browser detection |
| URL param conflicts with existing params | Low | Low | Use standard `lang` parameter name |
| SSR hydration mismatch | Medium | Medium | Initialize with server-provided `initialLanguage` |
| Race condition between URL and cookie | Low | Low | URL takes priority; state initialized once on mount |

---

## References

- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Phase 4, Task 4.1)
- **PRD**: `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Existing Hook Pattern**: `/src/hooks/useLanguagePreference.ts`
- **i18n Config**: `/src/lib/i18n/config.ts`
- **Request**: REQ-317 in `/docs/gen_requests_epic4.md` (useGuestLanguage Hook)

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience implementation*
