# REQ-317: Create useGuestLanguage Hook for Language State Management

**Document Type:** Technical Implementation Overview
**Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 4 - Guest Language Hook
**Task ID:** 4.1
**Size:** M (Medium)
**Priority:** P1 - High

---

## 1. Summary

Create a custom React hook (`useGuestLanguage`) that centralizes all guest language preference state management within client components. The hook manages current language selection, toggle state for viewing original vs translated content, cookie persistence, URL parameter synchronization for shareable links, and provides callback functions for language changes.

---

## 2. Background & Context

### Current State
- No centralized hook exists for managing guest language state in client components
- Components needing language preference handling must implement their own:
  - State management
  - Cookie handling
  - URL parameter synchronization
- This leads to duplicated logic and inconsistent behavior across different parts of the application

### Dependencies
- **Epic 1 (Foundation):** Language detection utility, i18n configuration, supported languages config
- **Epic 3 (Dynamic Content Translation):** Translation tables must be populated for content display
- **Task 3.6:** Guest component barrel exports should be complete
- **REQ-304:** Localization types file (`/src/types/l10n.ts`) must exist with `SupportedLanguage` type

### Related Files
- `/src/types/l10n.ts` - Localization type definitions (from REQ-304)
- `/src/lib/i18n/guest-language.ts` - Guest language utilities (from Task 4.2)
- `/src/components/guest/` - Guest UI components that will consume this hook

---

## 3. Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Hook exports a function named `useGuestLanguage` callable from any React component | Must Have |
| FR-2 | Hook manages `currentLanguage` state representing the guest's selected language preference | Must Have |
| FR-3 | Hook manages `showOriginal` state representing whether original or translated content is displayed | Must Have |
| FR-4 | Hook reads initial language preference from URL query parameters on mount | Must Have |
| FR-5 | Hook reads language preference from cookies when no URL parameter present | Must Have |
| FR-6 | Hook falls back to browser language detection when no URL parameter or cookie exists | Must Have |
| FR-7 | Hook provides `changeLanguage` callback that updates cookie with new preference | Must Have |
| FR-8 | `changeLanguage` optionally triggers a refetch callback when provided | Should Have |
| FR-9 | Hook provides `toggleOriginal` callback that switches between translation and original views | Must Have |
| FR-10 | `toggleOriginal` operates purely client-side without triggering data refetch | Must Have |
| FR-11 | Hook synchronizes language state with URL parameters for shareable link support | Should Have |
| FR-12 | Cookie persistence includes proper path, domain, and expiration attributes (1-year expiry) | Must Have |
| FR-13 | Hook handles edge cases: unsupported language codes, malformed URL parameters | Must Have |
| FR-14 | Hook returns typed object containing all state values and callback functions | Must Have |

### Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-1 | TypeScript types properly defined for hook parameters and return values | Must Have |
| NFR-2 | Hook follows React hooks conventions and works with React Strict Mode | Must Have |
| NFR-3 | SSR-safe: checks for `window` before accessing browser APIs | Must Have |
| NFR-4 | Language switch response time < 100ms (client-side operation) | Should Have |
| NFR-5 | Cookie operations fail gracefully in private browsing mode | Must Have |

---

## 4. Technical Design

### 4.1 Hook Interface

```typescript
// /src/hooks/useGuestLanguage.ts

import { SupportedLanguage } from '@/types/l10n';

/**
 * Options for initializing the useGuestLanguage hook
 */
export interface UseGuestLanguageOptions {
  /** Initial language from server-side detection */
  initialLanguage?: SupportedLanguage;
  /** Source/original language of the content being viewed */
  sourceLanguage: SupportedLanguage;
  /** Languages that have translations available for current content */
  availableTranslations: SupportedLanguage[];
  /** Optional callback triggered when language changes (for data refetch) */
  onLanguageChange?: (language: SupportedLanguage) => void;
}

/**
 * Return type for the useGuestLanguage hook
 */
export interface UseGuestLanguageReturn {
  /** Currently selected language preference */
  currentLanguage: SupportedLanguage;
  /** Whether currently showing original content instead of translation */
  showOriginal: boolean;
  /** Effective display language (sourceLanguage if showOriginal, else currentLanguage) */
  displayLanguage: SupportedLanguage;
  /** Whether the requested language has a translation available */
  isTranslated: boolean;
  /** Change the selected language preference */
  changeLanguage: (language: SupportedLanguage) => void;
  /** Toggle between translation and original content views */
  toggleOriginal: () => void;
  /** Check if a specific language has a translation available */
  hasTranslation: (language: SupportedLanguage) => boolean;
  /** Whether hook has finished initializing from storage/URL */
  isInitialized: boolean;
}
```

### 4.2 State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INITIALIZATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. URL Parameter (?lang=fr)                                    │
│        ↓ (highest priority)                                     │
│  2. Cookie (FAQBNB_GUEST_LANG)                                  │
│        ↓ (persisted preference)                                 │
│  3. Browser Accept-Language (navigator.language)                │
│        ↓ (auto-detection)                                       │
│  4. Default to sourceLanguage                                   │
│        ↓ (fallback)                                             │
│  └──→ Set currentLanguage state                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LANGUAGE CHANGE FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User calls changeLanguage(newLang)                             │
│        ↓                                                        │
│  1. Update currentLanguage state                                │
│  2. Persist to cookie (FAQBNB_GUEST_LANG, 1-year expiry)        │
│  3. Update URL parameter for shareable link                     │
│  4. Reset showOriginal to false                                 │
│  5. Call onLanguageChange callback if provided                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    TOGGLE ORIGINAL FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User calls toggleOriginal()                                    │
│        ↓                                                        │
│  1. Toggle showOriginal state (true ↔ false)                    │
│  2. NO cookie update (toggle is session-only)                   │
│  3. NO data refetch (content already loaded)                    │
│  4. displayLanguage computed: showOriginal ? source : current   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Cookie Specification

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Name | `FAQBNB_GUEST_LANG` | Consistent with Epic 1 naming |
| Value | Language code (e.g., `fr`, `es`) | Simple, predictable format |
| Expiry | 1 year | Long-term preference retention |
| Path | `/` | Available across all routes |
| SameSite | `Lax` | CSRF protection with link following |
| Secure | `true` (production) | HTTPS enforcement |

### 4.4 URL Parameter Handling

- **Read:** `?lang=fr` - Parsed on mount, highest priority
- **Write:** Update URL when language changes using `window.history.replaceState`
- **Canonical:** Language parameter should NOT appear in canonical URLs (SEO)
- **Shareable:** Users can share URLs like `/item/abc123?lang=fr` to share localized links

### 4.5 Browser Language Detection

```typescript
// Map browser language codes to supported languages
function mapBrowserLanguage(browserLang: string): SupportedLanguage | null {
  // Direct matches: 'en', 'fr', 'es', 'de', 'nl', 'it'
  // Prefix matches: 'en-US' → 'en', 'fr-CA' → 'fr'
  // Fallback to null if no supported language found
}
```

---

## 5. Implementation Approach

### 5.1 Recommended Implementation Pattern

Follow established patterns from existing hooks in the codebase:

1. **File Structure:** Single file at `/src/hooks/useGuestLanguage.ts`
2. **Directive:** `'use client';` at top
3. **Imports:** React hooks from 'react', types from '@/types'
4. **Constants:** Cookie name, default language at module level
5. **Helper Functions:** SSR-safe localStorage/cookie access
6. **Main Hook Function:** With JSDoc documentation
7. **Exports:** Named export + default export

### 5.2 Reference Implementations

| Hook | Pattern to Follow |
|------|-------------------|
| `useActiveProperty.ts` | localStorage persistence with SSR handling |
| `useDashboardPreferences.ts` | localStorage with type validation and defaults |

### 5.3 Key Implementation Considerations

1. **SSR Safety:**
   ```typescript
   if (typeof window === 'undefined') {
     return DEFAULT_LANGUAGE;
   }
   ```

2. **Cookie Access:** Client-side cookie access via `document.cookie`

3. **URL Parameter Access:** Use `useSearchParams` from `next/navigation` or direct `window.location.search` parsing

4. **Memoization:** Use `useCallback` for stable function references

5. **Effect Cleanup:** Handle component unmount during async operations

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useGuestLanguage.ts` | Main hook implementation |

### 6.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/hooks/index.ts` | Add export for `useGuestLanguage` (if barrel file exists) |

### 6.3 Dependencies Required (Must Exist Before Implementation)

| File Path | Dependency |
|-----------|------------|
| `/src/types/l10n.ts` | `SupportedLanguage` type, `SUPPORTED_LANGUAGES` constant |
| `/src/lib/i18n/guest-language.ts` | Cookie utilities (from Task 4.2, can be created in parallel) |

---

## 7. Testing Considerations

### 7.1 Unit Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Mount without URL param or cookie | Falls back to browser language or default |
| Mount with URL param `?lang=fr` | Uses URL parameter value |
| Mount with cookie but no URL param | Uses cookie value |
| URL param overrides cookie | URL takes precedence |
| `changeLanguage('es')` called | Updates state, cookie, and URL |
| `toggleOriginal()` called | Toggles `showOriginal` state |
| Unsupported language code in URL | Falls back to default |
| Cookie blocked (private mode) | Degrades gracefully, uses defaults |
| `hasTranslation('de')` called | Returns boolean based on availableTranslations |

### 7.2 Integration Test Scenarios

| Scenario | Verification |
|----------|--------------|
| Language preference persists across page refreshes | Cookie is set and read correctly |
| Shareable link with language param works | New visitor sees correct language |
| Toggle original works without network requests | No API calls triggered |
| Language change triggers content update | onLanguageChange callback invoked |

---

## 8. Usage Examples

### 8.1 Basic Usage in ItemDisplay Component

```tsx
'use client';

import { useGuestLanguage } from '@/hooks/useGuestLanguage';
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
import { TranslationBanner } from '@/components/guest/TranslationBanner';

export function ItemDisplay({ item, translationMeta }: ItemDisplayProps) {
  const {
    currentLanguage,
    showOriginal,
    displayLanguage,
    isTranslated,
    changeLanguage,
    toggleOriginal,
    hasTranslation,
  } = useGuestLanguage({
    initialLanguage: translationMeta.displayLanguage,
    sourceLanguage: translationMeta.sourceLanguage,
    availableTranslations: translationMeta.availableTranslations,
    onLanguageChange: (lang) => {
      // Optionally trigger data refetch for new language
      router.refresh();
    },
  });

  return (
    <div>
      {/* Language Switcher */}
      <GuestLanguageSwitcher
        currentLanguage={currentLanguage}
        availableTranslations={translationMeta.availableTranslations}
        sourceLanguage={translationMeta.sourceLanguage}
        onLanguageChange={changeLanguage}
      />

      {/* Translation Banner */}
      {isTranslated && !showOriginal && (
        <TranslationBanner
          sourceLanguage={translationMeta.sourceLanguage}
          displayLanguage={displayLanguage}
          onViewOriginal={toggleOriginal}
        />
      )}

      {/* Content - switches based on showOriginal */}
      <h1>{showOriginal ? item.originalName : item.name}</h1>
      <p>{showOriginal ? item.originalDescription : item.description}</p>
    </div>
  );
}
```

### 8.2 Shareable Link Generation

```tsx
function ShareButton({ publicId }: { publicId: string }) {
  const { currentLanguage } = useGuestLanguage({ /* options */ });

  const shareUrl = `${window.location.origin}/item/${publicId}?lang=${currentLanguage}`;

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl);
    toast('Link copied!');
  };

  return <button onClick={handleShare}>Share</button>;
}
```

---

## 9. Acceptance Criteria

- [ ] Hook exports a function named `useGuestLanguage` that can be called from any React component
- [ ] Hook manages `currentLanguage` state representing the guest's selected language preference
- [ ] Hook manages `showOriginal` state representing whether the original or translated content is displayed
- [ ] Hook reads initial language preference from URL query parameters when component mounts
- [ ] Hook reads language preference from cookies when no URL parameter is present
- [ ] Hook falls back to browser language detection when no URL parameter or cookie exists
- [ ] Hook provides a `changeLanguage` callback function that accepts a new language code
- [ ] `changeLanguage` function updates the cookie with the new preference and appropriate expiration
- [ ] `changeLanguage` function optionally triggers a refetch callback when provided
- [ ] Hook provides a `toggleOriginal` callback function that switches between translation and original views
- [ ] `toggleOriginal` operates purely client-side without triggering data refetch
- [ ] Hook synchronizes language state with URL parameters for shareable link support
- [ ] Cookie persistence includes proper path, domain, and expiration attributes
- [ ] Hook properly handles edge cases such as unsupported language codes and malformed URL parameters
- [ ] Hook returns a typed object containing all state values and callback functions
- [ ] TypeScript types are properly defined for hook parameters and return values
- [ ] Hook follows React hooks conventions and can be used with React Strict Mode

---

## 10. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request:** `/docs/gen_requests_epic4.md` - REQ-317
- **Related Hooks:**
  - `/src/hooks/useActiveProperty.ts` - localStorage persistence pattern
  - `/src/hooks/useDashboardPreferences.ts` - preferences with validation pattern
- **Related Types:** `/src/types/l10n.ts` (REQ-304)
- **Cookie Utility:** `/src/lib/i18n/guest-language.ts` (Task 4.2)

---

## 11. Open Questions

1. **Cookie Domain:** Should cookie be set on `.faqbnb.com` or current hostname?
   - *Recommendation:* Use current hostname for development flexibility, `.faqbnb.com` for production

2. **URL Parameter Removal:** Should language param be removed from URL after reading?
   - *Recommendation:* Keep in URL for shareable links, but don't include in canonical URLs

3. **Default Language:** When no preference detected, should we default to source language or 'en'?
   - *Recommendation:* Default to source language (content's original language)

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience*
