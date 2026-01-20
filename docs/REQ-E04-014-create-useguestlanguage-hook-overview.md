# REQ-E04-014: Create useGuestLanguage Hook - Implementation Overview

**Request ID:** REQ-E04-014
**Title:** Create Guest Language State Management Hook
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** Epic 4 - Guest Experience, Phase 4 - Guest Language Hook
**Task ID:** 4.1

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Summary

Create a React hook (`useGuestLanguage`) that provides centralized state management for guest language preferences. The hook synchronizes language state between cookies, URL parameters, and the displayed content version, enabling seamless multilingual experiences for unauthenticated guest users viewing translated content.

---

## Context and Dependencies

### Implementation Plan Reference
- **Document:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Task Reference:** Phase 4: Guest Language Hook, Task 4.1

### Dependencies from Previous Tasks (Epic 4)
| Dependency | Location | Status |
|------------|----------|--------|
| Localization Types | `/src/types/l10n.ts` | Required (REQ-E04-001) |
| Guest Language Utilities | `/src/lib/i18n/guest-language.ts` | Required (REQ-E04-002) |
| i18n Configuration | `/src/lib/i18n/config.ts` | Available (Epic 1) |

### Dependencies from Epic 1 (Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| Language Detection Utility | `/src/lib/i18n/language-detection.ts` | Available |
| Supported Languages Config | `/src/lib/i18n/config.ts` | Available |
| Cookie Constants | `LOCALE_COOKIE_NAME`, `LOCALE_COOKIE_MAX_AGE` | Available |

### Existing Patterns to Follow
| Pattern | Location | Relevance |
|---------|----------|-----------|
| `useLanguagePreference` hook | `/src/hooks/useLanguagePreference.ts` | Primary reference - authenticated user language management |
| `useActiveProperty` hook | `/src/hooks/useActiveProperty.ts` | localStorage-based state pattern |
| Cookie utilities | `/src/hooks/useLanguagePreference.ts` | Cookie read/write patterns |

---

## Technical Specification

### Hook Interface

```typescript
// /src/hooks/useGuestLanguage.ts

export interface UseGuestLanguageOptions {
  /** Initial language from server-side detection */
  initialLanguage?: SupportedLanguage;
  /** Source language of the original content */
  sourceLanguage: SupportedLanguage;
  /** Languages that have translations available for this content */
  availableTranslations: SupportedLanguage[];
  /** Cookie name for persistence (optional, defaults to GUEST_LANGUAGE_COOKIE_NAME) */
  cookieName?: string;
  /** Cookie expiration in seconds (optional, defaults to 1 year) */
  cookieMaxAge?: number;
}

export interface UseGuestLanguageReturn {
  /** Currently selected language code */
  currentLanguage: SupportedLanguage;
  /** Whether currently showing original content instead of translation */
  showOriginal: boolean;
  /** Effective display language (considering showOriginal toggle) */
  displayLanguage: SupportedLanguage;
  /** Change the selected language (persists to cookie) */
  setLanguage: (language: SupportedLanguage) => void;
  /** Toggle between translation and original content view */
  toggleOriginal: () => void;
  /** Check if a specific language has a translation available */
  hasTranslation: (language: SupportedLanguage) => boolean;
  /** Whether the hook is still initializing */
  isLoading: boolean;
  /** List of all supported languages with metadata */
  supportedLanguages: readonly LanguageOption[];
}
```

### State Management

```typescript
// Internal state structure
interface GuestLanguageState {
  currentLanguage: SupportedLanguage;  // User's selected language
  showOriginal: boolean;               // Toggle state (client-side only)
  isInitialized: boolean;              // Hydration complete flag
}
```

### Detection Priority (Read)
1. URL parameter `?lang=xx` (highest priority - enables shareable links)
2. Cookie `FAQBNB_GUEST_LANG` (persisted preference)
3. Browser `Accept-Language` header (auto-detection)
4. Default to `'en'` (fallback)

### Persistence Strategy (Write)
- Language changes update the cookie immediately
- Toggle state (`showOriginal`) is client-side only, not persisted
- No localStorage fallback needed for guest hook (unlike authenticated users)

---

## Implementation Tasks

### Task 1: Create Hook File Structure
**File:** `/src/hooks/useGuestLanguage.ts`

Create the hook file with:
- `'use client'` directive
- Header comments with REQ number and date
- Constants section for default values
- Import statements from i18n config

### Task 2: Implement Cookie Utilities (Guest-Specific)
Implement within the hook file:
- `getGuestLanguageFromCookie(): SupportedLanguage | null`
- `setGuestLanguageCookie(language: SupportedLanguage): void`

**Note:** These may differ from `useLanguagePreference` cookie utilities in cookie name or behavior.

### Task 3: Implement URL Parameter Detection
- Read `lang` parameter from URL on initialization
- Use `URLSearchParams` for client-side reading
- Validate against `isSupportedLocale()` type guard

### Task 4: Implement Browser Language Detection
- Reuse pattern from `/src/hooks/useLanguagePreference.ts`
- Extract primary language code from `navigator.language`
- Map to supported language using `normalizeLocale()`

### Task 5: Implement Language Initialization Effect
Create `useEffect` that:
1. Checks SSR safety (`typeof window === 'undefined'`)
2. Applies detection priority (URL → Cookie → Browser → Default)
3. Sets initial state
4. Marks initialization complete

### Task 6: Implement setLanguage Function
- Validate language with `isSupportedLocale()`
- Update state immediately (optimistic)
- Persist to cookie
- Optionally dispatch `languageChange` custom event

### Task 7: Implement toggleOriginal Function
- Simple boolean toggle of `showOriginal` state
- No persistence (session-only toggle)
- No cookie or URL update

### Task 8: Implement displayLanguage Computed Value
Calculate effective display language:
```typescript
const displayLanguage = showOriginal ? sourceLanguage : currentLanguage;
```

### Task 9: Implement hasTranslation Helper
```typescript
const hasTranslation = useCallback(
  (language: SupportedLanguage) => availableTranslations.includes(language),
  [availableTranslations]
);
```

### Task 10: Export Hook and Types
- Named export `useGuestLanguage`
- Default export `useGuestLanguage`
- Export interface types for consumers

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useGuestLanguage.ts` | Guest language state management hook |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/hooks/index.ts` | Add export for `useGuestLanguage` (if barrel export exists) |

### Functions/Exports to Add

| Location | Function/Export |
|----------|-----------------|
| `/src/hooks/useGuestLanguage.ts` | `useGuestLanguage()` - main hook |
| `/src/hooks/useGuestLanguage.ts` | `UseGuestLanguageOptions` - options interface |
| `/src/hooks/useGuestLanguage.ts` | `UseGuestLanguageReturn` - return type interface |
| `/src/hooks/useGuestLanguage.ts` | `GUEST_LANGUAGE_COOKIE_NAME` - constant (if different from authenticated) |

### External Dependencies to Import

| Import | From | Purpose |
|--------|------|---------|
| `useState`, `useEffect`, `useCallback`, `useMemo` | `react` | React hooks |
| `SupportedLocale`, `DEFAULT_LOCALE`, `isSupportedLocale`, `normalizeLocale` | `@/lib/i18n/config` | Type and validation |
| `localeMetadata`, `getAllLocales` | `@/lib/i18n/config` | Language metadata |
| `LOCALE_COOKIE_NAME`, `LOCALE_COOKIE_MAX_AGE` | `@/lib/i18n/config` | Cookie constants |

---

## Code Structure Reference

Based on existing patterns in `/src/hooks/useLanguagePreference.ts`:

```typescript
// /src/hooks/useGuestLanguage.ts
// REQ-E04-014: Guest Language State Management Hook
// Created: 2026-01-20
// Last Modified: 2026-01-20

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SupportedLocale,
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  localeMetadata,
  getAllLocales,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
} from '@/lib/i18n/config';

// ============ Constants ============
export const GUEST_LANGUAGE_COOKIE_NAME = LOCALE_COOKIE_NAME;
export const GUEST_LANGUAGE_COOKIE_MAX_AGE = LOCALE_COOKIE_MAX_AGE;

// ============ Types ============
export type SupportedLanguage = SupportedLocale;

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface UseGuestLanguageOptions { ... }
export interface UseGuestLanguageReturn { ... }

// ============ Cookie Utilities ============
function getGuestLanguageFromCookie(): SupportedLanguage | null { ... }
function setGuestLanguageCookie(language: SupportedLanguage): void { ... }

// ============ URL Parameter Utility ============
function getLanguageFromURL(): SupportedLanguage | null { ... }

// ============ Browser Detection ============
function detectBrowserLanguage(): SupportedLanguage { ... }

// ============ Main Hook ============
export function useGuestLanguage(options: UseGuestLanguageOptions): UseGuestLanguageReturn {
  const { initialLanguage, sourceLanguage, availableTranslations } = options;

  // State
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(
    initialLanguage || DEFAULT_LOCALE
  );
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialization effect
  useEffect(() => { ... }, [initialLanguage]);

  // Computed values
  const displayLanguage = useMemo(() =>
    showOriginal ? sourceLanguage : currentLanguage,
    [showOriginal, sourceLanguage, currentLanguage]
  );

  // Actions
  const setLanguage = useCallback((language: SupportedLanguage) => { ... }, []);
  const toggleOriginal = useCallback(() => setShowOriginal(prev => !prev), []);
  const hasTranslation = useCallback(
    (language: SupportedLanguage) => availableTranslations.includes(language),
    [availableTranslations]
  );

  // Language options
  const supportedLanguages = useMemo(() => getAllLocales(), []);

  return {
    currentLanguage,
    showOriginal,
    displayLanguage,
    setLanguage,
    toggleOriginal,
    hasTranslation,
    isLoading,
    supportedLanguages,
  };
}

export default useGuestLanguage;
```

---

## Integration Points

### Usage in ItemDisplay Component
```tsx
// /src/components/ItemDisplay.tsx
import { useGuestLanguage } from '@/hooks/useGuestLanguage';

export default function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
  const {
    currentLanguage,
    showOriginal,
    displayLanguage,
    setLanguage,
    toggleOriginal,
    hasTranslation,
  } = useGuestLanguage({
    initialLanguage: translationMeta.displayLanguage,
    sourceLanguage: translationMeta.sourceLanguage,
    availableTranslations: translationMeta.availableTranslations,
  });

  return (
    <>
      {/* Language Switcher */}
      <GuestLanguageSwitcher
        currentLanguage={currentLanguage}
        availableTranslations={translationMeta.availableTranslations}
        sourceLanguage={translationMeta.sourceLanguage}
        onLanguageChange={setLanguage}
      />

      {/* Translation Banner with Toggle */}
      {translationMeta.isShowingTranslation && !showOriginal && (
        <TranslationBanner
          sourceLanguage={translationMeta.sourceLanguage}
          displayLanguage={displayLanguage}
          onViewOriginal={toggleOriginal}
        />
      )}

      {/* Content Display */}
      <h1>{showOriginal ? item.originalName : item.name}</h1>
    </>
  );
}
```

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Hook exports state for current display language | `currentLanguage` in return object |
| Hook exports showOriginal flag | `showOriginal` in return object |
| Initial load checks URL parameter | `getLanguageFromURL()` in init effect |
| Fallback to cookie when no URL param | `getGuestLanguageFromCookie()` in init effect |
| Fallback to browser language | `detectBrowserLanguage()` in init effect |
| Default to English | `DEFAULT_LOCALE = 'en'` constant |
| Language change persists to cookie | `setGuestLanguageCookie()` in `setLanguage` |
| Toggle affects only showOriginal state | `toggleOriginal` only updates local state |
| URL parameter sync for shareable links | Read on init; consumer handles URL updates |
| Edge case handling | Type guards, SSR checks, validation |
| SSR compatibility | `typeof window === 'undefined'` checks |
| No unnecessary re-renders | `useMemo` and `useCallback` optimization |
| Optional configuration params | `cookieName`, `cookieMaxAge` in options |
| Export from hooks module | Named and default exports |

---

## Testing Considerations

### Unit Test Scenarios
1. **Initialization with URL param:** Hook reads `?lang=fr` and sets French
2. **Initialization with cookie:** Hook reads cookie preference when no URL param
3. **Initialization with browser detection:** Hook detects from navigator when no cookie
4. **Default fallback:** Hook defaults to English when all detection fails
5. **Language change:** `setLanguage('es')` updates state and cookie
6. **Toggle original:** `toggleOriginal()` flips `showOriginal` without cookie change
7. **Display language calculation:** Returns source language when `showOriginal=true`
8. **hasTranslation helper:** Returns true only for languages in `availableTranslations`
9. **Invalid language handling:** Rejects languages not in supported list
10. **SSR safety:** No errors when window/document undefined

### Integration Test Scenarios
1. Language switcher updates when `setLanguage` called
2. Content display switches when `toggleOriginal` called
3. Cookie persists across page navigation
4. URL parameter overrides cookie on initial load

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hydration mismatch (SSR vs client) | Medium | Medium | Use `isLoading` state, defer URL/cookie reads to effect |
| Cookie blocked by browser | Low | Low | Show language selector, re-detect each visit |
| URL param tampering with invalid codes | Low | Low | Validate with `isSupportedLocale()` |
| Race condition on rapid language changes | Low | Low | State updates are synchronous |

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-014
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Existing Hook Pattern:** `/src/hooks/useLanguagePreference.ts`
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Related Components:** GuestLanguageSwitcher (REQ-E04-008), TranslationBanner (REQ-E04-009), ViewOriginalToggle (REQ-E04-011)
