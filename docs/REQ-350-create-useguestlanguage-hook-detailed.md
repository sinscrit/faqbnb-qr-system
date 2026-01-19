# REQ-350: Create useGuestLanguage Hook - Detailed Task Breakdown

**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 4 - Guest Language Hook
**Task ID:** 4.1
**Epic:** L10N Epic 4 - Guest Experience
**Status:** PENDING

---

## Overview

This document provides a detailed, step-by-step task breakdown for implementing the `useGuestLanguage` hook. This hook manages guest language preferences for public-facing item display pages, including language state management, cookie persistence, URL parameter synchronization, and "view original" toggle functionality.

---

## Prerequisites

Before starting implementation, verify the following dependencies are in place:

| Dependency | Location | Status Check |
|------------|----------|--------------|
| i18n config module | `/src/lib/i18n/config.ts` | Must export `SupportedLocale`, `isSupportedLocale()`, `locales` |
| TypeScript types | `/src/types/index.ts` | Available for extension |
| React hooks support | `package.json` | React 18+ installed |

---

## Task Breakdown

### Task 1: Create Hook File with Type Definitions

**File:** `/src/hooks/useGuestLanguage.ts`
**Estimated Effort:** 1 Story Point
**Dependencies:** None

#### 1.1 Create the hook file with header comments

Create a new file at `/src/hooks/useGuestLanguage.ts` with:

```typescript
/**
 * useGuestLanguage Hook
 *
 * Manages guest language preferences for public-facing item display pages.
 * Handles language state, cookie persistence, URL parameter synchronization,
 * and "view original" toggle functionality.
 *
 * REQ-350: Create useGuestLanguage Hook for Language State Management
 * Plan-111: L10N Epic 4 - Guest Experience, Phase 4, Task 4.1
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { isSupportedLocale, type SupportedLocale } from '@/lib/i18n/config';
```

#### 1.2 Define TypeScript interfaces

Add the following type definitions after the imports:

```typescript
// ============ Constants ============

/** Cookie name for guest language preference */
export const GUEST_COOKIE_NAME = 'FAQBNB_GUEST_LANG';

/** Cookie max age in seconds (1 year) */
export const GUEST_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// ============ Types ============

/**
 * Options for configuring the useGuestLanguage hook
 */
export interface UseGuestLanguageOptions {
  /** Initial language detected/passed from server component */
  initialLanguage?: SupportedLocale;
  /** Source/original language of the content being displayed */
  sourceLanguage: SupportedLocale;
  /** Array of languages that have translations available for this content */
  availableTranslations: SupportedLocale[];
}

/**
 * Return value from the useGuestLanguage hook
 */
export interface UseGuestLanguageReturn {
  /** Currently selected language preference */
  currentLanguage: SupportedLocale;
  /** Whether user toggled to show original content */
  showOriginal: boolean;
  /** Effective display language (sourceLanguage if showOriginal, else currentLanguage) */
  displayLanguage: SupportedLocale;
  /** Change the selected language, persists to cookie and updates URL */
  setLanguage: (language: SupportedLocale) => void;
  /** Toggle between translation and original content */
  toggleOriginal: () => void;
  /** Check if a specific language has translation available */
  hasTranslation: (language: SupportedLocale) => boolean;
}
```

#### Acceptance Criteria for Task 1:
- [ ] File created at `/src/hooks/useGuestLanguage.ts`
- [ ] File includes 'use client' directive
- [ ] All imports are valid and resolve correctly
- [ ] `UseGuestLanguageOptions` interface is defined with all required properties
- [ ] `UseGuestLanguageReturn` interface is defined with all required properties
- [ ] Constants `GUEST_COOKIE_NAME` and `GUEST_COOKIE_MAX_AGE` are exported
- [ ] JSDoc comments describe each interface and property

---

### Task 2: Implement Cookie Utilities

**File:** `/src/hooks/useGuestLanguage.ts`
**Estimated Effort:** 1 Story Point
**Dependencies:** Task 1

#### 2.1 Implement getGuestLanguageCookie function

Add after the type definitions:

```typescript
// ============ Cookie Utilities ============

/**
 * Read guest language preference from cookie
 * @returns The stored language or null if not found/invalid
 */
function getGuestLanguageCookie(): SupportedLocale | null {
  if (typeof document === 'undefined') return null;

  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === GUEST_COOKIE_NAME) {
        const decodedValue = decodeURIComponent(value);
        if (isSupportedLocale(decodedValue)) {
          return decodedValue;
        }
      }
    }
  } catch (error) {
    console.warn('[useGuestLanguage] Failed to read cookie:', error);
  }
  return null;
}
```

#### 2.2 Implement setGuestLanguageCookie function

```typescript
/**
 * Set guest language preference cookie
 * @param language - The language code to persist
 */
function setGuestLanguageCookie(language: SupportedLocale): void {
  if (typeof document === 'undefined') return;

  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + GUEST_COOKIE_MAX_AGE * 1000);

    // Set cookie with security attributes
    document.cookie = [
      `${GUEST_COOKIE_NAME}=${encodeURIComponent(language)}`,
      `path=/`,
      `expires=${expires.toUTCString()}`,
      `SameSite=Lax`
    ].join(';');
  } catch (error) {
    console.warn('[useGuestLanguage] Failed to set cookie:', error);
  }
}
```

#### Acceptance Criteria for Task 2:
- [ ] `getGuestLanguageCookie` function reads cookie correctly
- [ ] `getGuestLanguageCookie` returns null during SSR (typeof document === 'undefined')
- [ ] `getGuestLanguageCookie` validates language using `isSupportedLocale`
- [ ] `getGuestLanguageCookie` handles malformed cookies gracefully
- [ ] `setGuestLanguageCookie` sets cookie with correct name
- [ ] `setGuestLanguageCookie` sets 1-year expiration
- [ ] `setGuestLanguageCookie` includes `path=/` attribute
- [ ] `setGuestLanguageCookie` includes `SameSite=Lax` attribute
- [ ] Both functions handle errors without throwing

---

### Task 3: Implement URL Parameter Handling

**File:** `/src/hooks/useGuestLanguage.ts`
**Estimated Effort:** 1 Story Point
**Dependencies:** Task 1

#### 3.1 Implement getLanguageFromURL function

Add after the cookie utilities:

```typescript
// ============ URL Parameter Utilities ============

/**
 * Read language preference from URL query parameter
 * @returns The language from ?lang= parameter or null if not found/invalid
 */
function getLanguageFromURL(): SupportedLocale | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');

    if (langParam && isSupportedLocale(langParam)) {
      return langParam;
    }
  } catch (error) {
    console.warn('[useGuestLanguage] Failed to read URL parameter:', error);
  }
  return null;
}
```

#### 3.2 Implement updateURLParameter function

```typescript
/**
 * Update URL query parameter with selected language
 * Uses replaceState to avoid adding history entries
 * @param language - The language code to set in URL
 */
function updateURLParameter(language: SupportedLocale): void {
  if (typeof window === 'undefined') return;

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);

    // Update URL without page reload or history entry
    window.history.replaceState(
      window.history.state,
      '',
      url.toString()
    );
  } catch (error) {
    console.warn('[useGuestLanguage] Failed to update URL:', error);
  }
}
```

#### Acceptance Criteria for Task 3:
- [ ] `getLanguageFromURL` reads `?lang=` parameter correctly
- [ ] `getLanguageFromURL` returns null during SSR
- [ ] `getLanguageFromURL` validates language using `isSupportedLocale`
- [ ] `getLanguageFromURL` handles malformed URLs gracefully
- [ ] `updateURLParameter` sets `?lang=` parameter correctly
- [ ] `updateURLParameter` uses `replaceState` (not `pushState`) to avoid history pollution
- [ ] `updateURLParameter` preserves existing URL parameters
- [ ] Both functions handle errors without throwing

---

### Task 4: Implement Browser Language Detection

**File:** `/src/hooks/useGuestLanguage.ts`
**Estimated Effort:** 0.5 Story Points
**Dependencies:** Task 1

#### 4.1 Implement detectBrowserLanguage function

Add after URL utilities:

```typescript
// ============ Browser Detection ============

/**
 * Detect browser's preferred language from navigator
 * @returns The first supported language matching browser preference, or 'en' as fallback
 */
function detectBrowserLanguage(): SupportedLocale {
  if (typeof navigator === 'undefined') return 'en';

  try {
    // Try navigator.language first (modern browsers)
    const browserLang = navigator.language ||
      (navigator as { userLanguage?: string }).userLanguage;

    if (!browserLang) return 'en';

    // Extract primary language code (e.g., 'en-US' -> 'en')
    const primaryLang = browserLang.split('-')[0].toLowerCase();

    if (isSupportedLocale(primaryLang)) {
      return primaryLang;
    }

    // Try navigator.languages array for additional preferences
    if (navigator.languages && navigator.languages.length > 0) {
      for (const lang of navigator.languages) {
        const primary = lang.split('-')[0].toLowerCase();
        if (isSupportedLocale(primary)) {
          return primary;
        }
      }
    }
  } catch (error) {
    console.warn('[useGuestLanguage] Browser detection failed:', error);
  }

  return 'en'; // Default fallback
}
```

#### Acceptance Criteria for Task 4:
- [ ] `detectBrowserLanguage` returns 'en' during SSR
- [ ] Function reads `navigator.language` for primary language
- [ ] Function extracts primary language code from full code (e.g., 'en-US' -> 'en')
- [ ] Function validates against supported locales
- [ ] Function tries `navigator.languages` array as fallback
- [ ] Function returns 'en' as final fallback
- [ ] Function handles errors gracefully

---

### Task 5: Implement Main Hook Logic

**File:** `/src/hooks/useGuestLanguage.ts`
**Estimated Effort:** 2 Story Points
**Dependencies:** Tasks 1-4

#### 5.1 Implement the useGuestLanguage hook

Add after all utility functions:

```typescript
// ============ Main Hook ============

/**
 * Hook for managing guest language preferences on public-facing pages.
 *
 * Priority for initial language:
 * 1. URL parameter (?lang=)
 * 2. Cookie (FAQBNB_GUEST_LANG)
 * 3. Browser language detection
 * 4. initialLanguage from server
 * 5. sourceLanguage as final fallback
 *
 * @param options - Configuration options for the hook
 * @returns Language state and control functions
 *
 * @example
 * ```tsx
 * const {
 *   currentLanguage,
 *   showOriginal,
 *   displayLanguage,
 *   setLanguage,
 *   toggleOriginal,
 *   hasTranslation,
 * } = useGuestLanguage({
 *   sourceLanguage: 'en',
 *   availableTranslations: ['fr', 'es', 'de'],
 * });
 * ```
 */
export function useGuestLanguage(options: UseGuestLanguageOptions): UseGuestLanguageReturn {
  const { initialLanguage, sourceLanguage, availableTranslations } = options;

  // ============ State Initialization ============

  // Initialize language with priority: URL > Cookie > Browser > Initial > Source
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
    if (browserLang !== 'en' || !initialLanguage) return browserLang;

    // Priority 4: Initial language from server or source
    return initialLanguage || sourceLanguage;
  });

  // Track whether user wants to see original content
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // ============ Effects ============

  // Sync URL parameter on client mount (handles SSR hydration)
  useEffect(() => {
    const urlLang = getLanguageFromURL();
    if (urlLang && urlLang !== currentLanguage) {
      setCurrentLanguageState(urlLang);
      setGuestLanguageCookie(urlLang);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ Derived State ============

  // Compute effective display language
  const displayLanguage = useMemo((): SupportedLocale => {
    return showOriginal ? sourceLanguage : currentLanguage;
  }, [showOriginal, sourceLanguage, currentLanguage]);

  // ============ Callbacks ============

  // Change language handler
  const setLanguage = useCallback((language: SupportedLocale): void => {
    if (!isSupportedLocale(language)) {
      console.warn('[useGuestLanguage] Invalid language code:', language);
      return;
    }

    setCurrentLanguageState(language);
    setShowOriginal(false); // Reset toggle when changing language
    setGuestLanguageCookie(language);
    updateURLParameter(language);
  }, []);

  // Toggle between original and translated content
  const toggleOriginal = useCallback((): void => {
    setShowOriginal(prev => !prev);
  }, []);

  // Check if translation is available for a language
  const hasTranslation = useCallback((language: SupportedLocale): boolean => {
    // Original content is always "available"
    if (language === sourceLanguage) return true;
    return availableTranslations.includes(language);
  }, [sourceLanguage, availableTranslations]);

  // ============ Return ============

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

#### Acceptance Criteria for Task 5:
- [ ] Hook accepts `UseGuestLanguageOptions` parameter
- [ ] Hook returns `UseGuestLanguageReturn` object
- [ ] `currentLanguage` initializes with correct priority (URL > Cookie > Browser > Initial > Source)
- [ ] `showOriginal` initializes to `false`
- [ ] `displayLanguage` correctly computes based on `showOriginal` and `currentLanguage`
- [ ] `setLanguage` validates input using `isSupportedLocale`
- [ ] `setLanguage` updates state, cookie, and URL
- [ ] `setLanguage` resets `showOriginal` to false
- [ ] `toggleOriginal` toggles the `showOriginal` state
- [ ] `hasTranslation` returns true for source language
- [ ] `hasTranslation` correctly checks `availableTranslations` array
- [ ] Hook handles SSR hydration without mismatch errors
- [ ] All callbacks are memoized with `useCallback`
- [ ] `displayLanguage` is memoized with `useMemo`

---

### Task 6: Add Type Exports to types/index.ts

**File:** `/src/types/index.ts`
**Estimated Effort:** 0.5 Story Points
**Dependencies:** Task 5

#### 6.1 Add exports for hook types

At the end of `/src/types/index.ts`, add:

```typescript
// Guest Language Hook types (REQ-350)
export type {
  UseGuestLanguageOptions,
  UseGuestLanguageReturn,
} from '@/hooks/useGuestLanguage';

export { GUEST_COOKIE_NAME, GUEST_COOKIE_MAX_AGE } from '@/hooks/useGuestLanguage';
```

#### Acceptance Criteria for Task 6:
- [ ] `UseGuestLanguageOptions` type is exported from `/src/types/index.ts`
- [ ] `UseGuestLanguageReturn` type is exported from `/src/types/index.ts`
- [ ] `GUEST_COOKIE_NAME` constant is exported
- [ ] `GUEST_COOKIE_MAX_AGE` constant is exported
- [ ] TypeScript compilation succeeds with no errors
- [ ] External files can import types from `@/types`

---

### Task 7: Write Unit Tests

**File:** `/src/hooks/__tests__/useGuestLanguage.test.ts`
**Estimated Effort:** 2 Story Points
**Dependencies:** Task 5

#### 7.1 Create test file with setup

```typescript
/**
 * Unit tests for useGuestLanguage hook
 * REQ-350: Create useGuestLanguage Hook
 * @created 2026-01-19
 */

import { renderHook, act } from '@testing-library/react';
import { useGuestLanguage } from '../useGuestLanguage';

// Mock document.cookie
let mockCookie = '';
Object.defineProperty(document, 'cookie', {
  get: () => mockCookie,
  set: (value: string) => {
    const [cookiePart] = value.split(';');
    const [name] = cookiePart.split('=');
    // Simple mock: just store the latest value
    mockCookie = cookiePart;
  },
});

// Mock window.location
const mockLocation = {
  search: '',
  href: 'http://localhost:3000/item/test123',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock window.history.replaceState
const mockReplaceState = jest.fn();
window.history.replaceState = mockReplaceState;

describe('useGuestLanguage', () => {
  beforeEach(() => {
    mockCookie = '';
    mockLocation.search = '';
    mockLocation.href = 'http://localhost:3000/item/test123';
    mockReplaceState.mockClear();
  });

  const defaultOptions = {
    sourceLanguage: 'en' as const,
    availableTranslations: ['fr', 'es', 'de'] as const,
  };

  describe('initialization', () => {
    it('initializes with source language when no preference exists', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.currentLanguage).toBe('en');
      expect(result.current.showOriginal).toBe(false);
      expect(result.current.displayLanguage).toBe('en');
    });

    it('initializes from URL parameter', () => {
      mockLocation.search = '?lang=fr';
      mockLocation.href = 'http://localhost:3000/item/test123?lang=fr';

      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.currentLanguage).toBe('fr');
    });

    it('initializes from cookie when no URL parameter', () => {
      mockCookie = 'FAQBNB_GUEST_LANG=es';

      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.currentLanguage).toBe('es');
    });

    it('URL parameter takes priority over cookie', () => {
      mockLocation.search = '?lang=de';
      mockLocation.href = 'http://localhost:3000/item/test123?lang=de';
      mockCookie = 'FAQBNB_GUEST_LANG=fr';

      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.currentLanguage).toBe('de');
    });

    it('ignores invalid language in URL', () => {
      mockLocation.search = '?lang=invalid';
      mockLocation.href = 'http://localhost:3000/item/test123?lang=invalid';

      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.currentLanguage).toBe('en');
    });
  });

  describe('setLanguage', () => {
    it('updates currentLanguage state', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.setLanguage('fr');
      });

      expect(result.current.currentLanguage).toBe('fr');
    });

    it('resets showOriginal when language changes', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.toggleOriginal();
      });
      expect(result.current.showOriginal).toBe(true);

      act(() => {
        result.current.setLanguage('es');
      });
      expect(result.current.showOriginal).toBe(false);
    });

    it('updates URL parameter', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.setLanguage('de');
      });

      expect(mockReplaceState).toHaveBeenCalled();
    });

    it('rejects invalid language codes', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      act(() => {
        result.current.setLanguage('invalid' as any);
      });

      expect(result.current.currentLanguage).toBe('en');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('toggleOriginal', () => {
    it('toggles showOriginal state', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.showOriginal).toBe(false);

      act(() => {
        result.current.toggleOriginal();
      });
      expect(result.current.showOriginal).toBe(true);

      act(() => {
        result.current.toggleOriginal();
      });
      expect(result.current.showOriginal).toBe(false);
    });

    it('updates displayLanguage when toggled', () => {
      const { result } = renderHook(() => useGuestLanguage({
        sourceLanguage: 'en',
        availableTranslations: ['fr'],
        initialLanguage: 'fr',
      }));

      // Set to French
      act(() => {
        result.current.setLanguage('fr');
      });
      expect(result.current.displayLanguage).toBe('fr');

      // Toggle to original
      act(() => {
        result.current.toggleOriginal();
      });
      expect(result.current.displayLanguage).toBe('en');
    });
  });

  describe('hasTranslation', () => {
    it('returns true for source language', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.hasTranslation('en')).toBe(true);
    });

    it('returns true for available translations', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.hasTranslation('fr')).toBe(true);
      expect(result.current.hasTranslation('es')).toBe(true);
      expect(result.current.hasTranslation('de')).toBe(true);
    });

    it('returns false for unavailable translations', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.hasTranslation('nl')).toBe(false);
      expect(result.current.hasTranslation('it')).toBe(false);
    });
  });

  describe('displayLanguage computation', () => {
    it('returns currentLanguage when showOriginal is false', () => {
      const { result } = renderHook(() => useGuestLanguage({
        sourceLanguage: 'en',
        availableTranslations: ['fr'],
      }));

      act(() => {
        result.current.setLanguage('fr');
      });

      expect(result.current.displayLanguage).toBe('fr');
    });

    it('returns sourceLanguage when showOriginal is true', () => {
      const { result } = renderHook(() => useGuestLanguage({
        sourceLanguage: 'en',
        availableTranslations: ['fr'],
      }));

      act(() => {
        result.current.setLanguage('fr');
        result.current.toggleOriginal();
      });

      expect(result.current.displayLanguage).toBe('en');
    });
  });
});
```

#### Acceptance Criteria for Task 7:
- [ ] Test file created at `/src/hooks/__tests__/useGuestLanguage.test.ts`
- [ ] Tests cover initialization from URL parameter
- [ ] Tests cover initialization from cookie
- [ ] Tests cover browser language detection fallback
- [ ] Tests cover priority ordering (URL > Cookie > Browser > Source)
- [ ] Tests cover `setLanguage` function
- [ ] Tests cover `toggleOriginal` function
- [ ] Tests cover `hasTranslation` function
- [ ] Tests cover `displayLanguage` computation
- [ ] Tests cover invalid language code handling
- [ ] All tests pass with `npm test`

---

## Verification Checklist

After completing all tasks, verify the following:

### Functional Requirements
- [ ] Hook exports a function named `useGuestLanguage`
- [ ] Hook can be called from any React client component
- [ ] Hook manages `currentLanguage` state for guest's selected preference
- [ ] Hook manages `showOriginal` state for toggle between translated/original
- [ ] Hook reads initial language from URL query parameter `?lang=` on mount
- [ ] Hook reads from cookie when no URL parameter present
- [ ] Hook falls back to browser detection when no cookie exists
- [ ] Hook provides `setLanguage` callback that updates cookie and URL
- [ ] Hook provides `toggleOriginal` callback for instant client-side toggle
- [ ] Hook synchronizes language with URL for shareable links

### Technical Requirements
- [ ] TypeScript types are properly defined for parameters and return values
- [ ] Cookie includes proper path, expiration, and SameSite attributes
- [ ] Hook handles edge cases (unsupported codes, malformed params)
- [ ] Hook follows React hooks conventions
- [ ] Hook works with React Strict Mode
- [ ] `displayLanguage` correctly computes effective language considering toggle state
- [ ] No hydration mismatches between SSR and client

### Code Quality
- [ ] All functions have JSDoc comments
- [ ] File includes header comments with REQ reference
- [ ] Console warnings are used for non-critical errors
- [ ] All callbacks are properly memoized
- [ ] No eslint errors or warnings

---

## Manual Testing Scenarios

After implementation, manually test these scenarios:

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| URL Parameter | Visit `/item/ABC123?lang=fr` | Content displays in French |
| Cookie Persistence | 1. Visit page and select Spanish<br>2. Close browser<br>3. Reopen and visit page | Spanish is preserved |
| Browser Detection | 1. Clear cookies<br>2. Set browser language to German<br>3. Visit page | German is detected |
| View Original Toggle | 1. Visit with `?lang=fr`<br>2. Click "View Original" | Content switches to English instantly |
| Shareable Links | 1. Select Spanish<br>2. Copy URL<br>3. Open in new incognito window | Spanish is shown via URL param |
| Invalid Language | Visit `/item/ABC123?lang=invalid` | Falls back to browser/default |

---

## Files Summary

### Files to Create
| File | Purpose |
|------|---------|
| `/src/hooks/useGuestLanguage.ts` | Main hook implementation |
| `/src/hooks/__tests__/useGuestLanguage.test.ts` | Unit tests |

### Files to Modify
| File | Changes |
|------|---------|
| `/src/types/index.ts` | Add exports for hook types and constants |

---

## Dependencies

### Upstream (Required Before This Task)
- **Epic 1 - Task 2.2**: i18n configuration (`/src/lib/i18n/config.ts`) with `SupportedLocale` type

### Downstream (Depends on This Task)
- **Task 5.2**: Update ItemDisplay component to integrate this hook
- **Task 3.1-3.5**: Guest UI components (GuestLanguageSwitcher, TranslationBanner, etc.)
- **Task 5.1**: Update guest item page to pass translation props

---

## References

- **Overview Document**: `/docs/REQ-350-create-useguestlanguage-hook-overview.md`
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Phase 4, Task 4.1)
- **PRD**: `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Request**: REQ-317 in `/docs/gen_requests_epic4.md`
- **Existing Hook Pattern**: `/src/hooks/useLanguagePreference.ts`
- **i18n Config**: `/src/lib/i18n/config.ts`

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience implementation*
*Last Modified: 2026-01-19*
