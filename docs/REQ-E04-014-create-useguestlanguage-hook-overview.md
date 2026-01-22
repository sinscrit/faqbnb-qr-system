# Implementation Breakdown: REQ-E04-014 - Create useGuestLanguage Hook

| **Field** | **Value** |
|-----------|-----------|
| **Request Reference** | REQ-E04-014 |
| **Source File** | `/docs/gen_requests_epic4.md` - Request #14 |
| **Original Request Date** | 2026-01-22 17:00 |
| **Breakdown Created** | 2026-01-22 19:22 |
| **T-shirt Size** | M |
| **Estimated Effort** | 4-6 hours |
| **Status** | PENDING |

---

## Goals

Create a custom React hook for managing guest user language state on the client side. This hook handles language preference persistence via cookies, supports toggling between translated and original content, and synchronizes with URL parameters for shareable links.

**Key Objectives**:
1. Manage language state: `currentLanguage`, `showOriginal`
2. Persist guest language preference to cookie (FAQBNB_GUEST_LANG)
3. Handle language changes with cookie updates
4. Toggle between translation and original content (client-side)
5. Sync with URL parameter `?lang=` for shareable links
6. Initialize from: URL param > Cookie > Accept-Language header > default
7. Separate from authenticated user language management (useLanguagePreference)

---

## Implementation Plan

### 1. Create useGuestLanguage Hook File

**File**: `/src/hooks/useGuestLanguage.ts`

**Approach**: Create a new React custom hook that follows the pattern established by `useLanguagePreference` but tailored for guest users. Key differences: no database persistence, simpler state management, URL parameter synchronization, and toggle functionality for viewing original content.

**Implementation Details**:

```typescript
'use client';

/**
 * useGuestLanguage Hook
 *
 * Manages language state for unauthenticated guest users viewing translated content.
 * Provides language selection, original content toggle, and URL parameter synchronization.
 *
 * Key Features:
 * - Cookie-based persistence (FAQBNB_GUEST_LANG)
 * - URL parameter sync for shareable links (?lang=xx)
 * - Toggle between translated and original content
 * - Priority cascade: URL param > Cookie > Accept-Language > default
 *
 * @example
 * ```tsx
 * function GuestItemPage() {
 *   const {
 *     currentLanguage,
 *     showOriginal,
 *     setLanguage,
 *     toggleOriginal,
 *     isLoading
 *   } = useGuestLanguage();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       <GuestLanguageSwitcher
 *         currentLanguage={currentLanguage}
 *         onLanguageChange={setLanguage}
 *       />
 *       <ViewOriginalToggle
 *         isViewingOriginal={showOriginal}
 *         onToggle={toggleOriginal}
 *       />
 *       {/* Content */}
 *     </div>
 *   );
 * }
 * ```
 *
 * @module hooks/useGuestLanguage
 * @lastModified 2026-01-22
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { SupportedLanguage } from '@/types';
import {
  detectGuestLanguage,
  setGuestLanguageCookie,
  GUEST_LANGUAGE_COOKIE_NAME,
} from '@/lib/i18n/guest-language';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
const LANG_URL_PARAM = 'lang';

// =============================================================================
// Hook Return Interface
// =============================================================================

export interface UseGuestLanguageReturn {
  /** Current selected language for display */
  currentLanguage: SupportedLanguage;

  /** Whether currently viewing original content (not translation) */
  showOriginal: boolean;

  /** Update the language preference (updates cookie and URL) */
  setLanguage: (language: SupportedLanguage) => void;

  /** Toggle between viewing translation and original content */
  toggleOriginal: () => void;

  /** Loading state during initial language detection */
  isLoading: boolean;

  /** Available languages for this content (set by parent) */
  availableLanguages?: SupportedLanguage[];

  /** Set available languages for this content */
  setAvailableLanguages: (languages: SupportedLanguage[]) => void;
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook for managing guest user language state.
 *
 * Priority cascade for language detection:
 * 1. URL parameter (?lang=xx)
 * 2. Cookie (FAQBNB_GUEST_LANG)
 * 3. Accept-Language header (via detectGuestLanguage)
 * 4. Default (en)
 *
 * Language changes update both cookie and URL for shareability.
 */
export function useGuestLanguage(): UseGuestLanguageReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState<SupportedLanguage[] | undefined>(undefined);

  // =============================================================================
  // Initialize Language on Mount
  // =============================================================================

  useEffect(() => {
    const initializeLanguage = () => {
      setIsLoading(true);

      try {
        // Priority 1: URL parameter
        const urlLang = searchParams?.get(LANG_URL_PARAM);
        if (urlLang) {
          const detectedLang = detectGuestLanguage(urlLang);
          setCurrentLanguage(detectedLang);
          // Ensure cookie matches URL parameter
          setGuestLanguageCookie(detectedLang);
        }
        // Priority 2-4: Cookie > Accept-Language > default
        else {
          const detectedLang = detectGuestLanguage();
          setCurrentLanguage(detectedLang);
        }
      } catch (error) {
        console.error('[useGuestLanguage] Initialization error:', error);
        setCurrentLanguage(DEFAULT_LANGUAGE);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [searchParams]);

  // =============================================================================
  // Set Language Function
  // =============================================================================

  /**
   * Update the current language preference.
   * Updates both cookie and URL parameter for shareability.
   */
  const setLanguage = useCallback((newLanguage: SupportedLanguage) => {
    // Update state
    setCurrentLanguage(newLanguage);

    // Reset showOriginal when changing languages
    setShowOriginal(false);

    // Update cookie
    setGuestLanguageCookie(newLanguage);

    // Update URL parameter for shareable links
    if (pathname) {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set(LANG_URL_PARAM, newLanguage);

      // Use router.replace to update URL without navigation
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    console.log('[useGuestLanguage] Language changed to:', newLanguage);
  }, [pathname, searchParams, router]);

  // =============================================================================
  // Toggle Original Function
  // =============================================================================

  /**
   * Toggle between viewing translated content and original content.
   * This is a client-side toggle that doesn't refetch data.
   */
  const toggleOriginal = useCallback(() => {
    setShowOriginal(prev => {
      const newValue = !prev;
      console.log('[useGuestLanguage] Toggle original:', newValue);
      return newValue;
    });
  }, []);

  // =============================================================================
  // Return Hook Value
  // =============================================================================

  return {
    currentLanguage,
    showOriginal,
    setLanguage,
    toggleOriginal,
    isLoading,
    availableLanguages,
    setAvailableLanguages,
  };
}

export default useGuestLanguage;
```

**Steps**:
1. Create file: `/src/hooks/useGuestLanguage.ts`
2. Import dependencies:
   - React hooks (useState, useEffect, useCallback)
   - Next.js navigation (useSearchParams, useRouter, usePathname)
   - Types from @/types (SupportedLanguage)
   - Guest language utilities from REQ-E04-002
3. Define hook return interface (UseGuestLanguageReturn)
4. Implement hook with:
   - State: currentLanguage, showOriginal, isLoading, availableLanguages
   - Initialize language from URL > Cookie > default
   - setLanguage function (updates cookie + URL)
   - toggleOriginal function (client-side toggle)
   - setAvailableLanguages function (for parent to set)
5. Follow useLanguagePreference pattern but simplified for guests

### 2. Update Hooks Barrel Export

**File**: `/src/hooks/index.ts`

**Modification**: Add export for the new useGuestLanguage hook.

```typescript
// Existing exports...

// Epic 4: Guest Experience Hooks
export { useGuestLanguage } from './useGuestLanguage';
export type { UseGuestLanguageReturn } from './useGuestLanguage';
```

**Steps**:
1. Read existing `/src/hooks/index.ts`
2. Add new exports at the end with Epic 4 comment
3. Export both hook and type interface

### 3. Integration with guest-language Utilities

**Integration Points**:

The hook depends on utilities from REQ-E04-002:
- `detectGuestLanguage()` - Priority cascade for language detection
- `setGuestLanguageCookie()` - Cookie persistence
- `GUEST_LANGUAGE_COOKIE_NAME` - Cookie name constant

**Pattern**:
```typescript
import {
  detectGuestLanguage,
  setGuestLanguageCookie,
  GUEST_LANGUAGE_COOKIE_NAME,
} from '@/lib/i18n/guest-language';

// Use in hook:
const detectedLang = detectGuestLanguage(urlParam); // With URL param
const detectedLang = detectGuestLanguage();          // Without URL param
setGuestLanguageCookie(newLanguage);
```

### 4. URL Parameter Synchronization

**Pattern** (from existing codebase):

```typescript
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// Read URL parameter
const urlLang = searchParams?.get('lang');

// Update URL parameter (without navigation)
const params = new URLSearchParams(searchParams?.toString() || '');
params.set('lang', newLanguage);
router.replace(`${pathname}?${params.toString()}`, { scroll: false });
```

**Features**:
- URL updates without page reload (`router.replace` with `scroll: false`)
- Preserves other URL parameters
- Enables shareable links with language preference

### 5. State Management Pattern

**Two-State System**:

1. **`currentLanguage`**: Which language to display
   - Controls which translation to show
   - Synced with URL parameter and cookie
   - Changes trigger potential refetch (handled by parent)

2. **`showOriginal`**: Whether to show original instead of translation
   - Client-side toggle (no refetch)
   - Resets to `false` when changing languages
   - Used by parent to switch between original and translated content

**State Interaction**:
```typescript
// User selects French
setLanguage('fr') → currentLanguage='fr', showOriginal=false

// User toggles to view original
toggleOriginal() → currentLanguage='fr', showOriginal=true

// User switches to Spanish
setLanguage('es') → currentLanguage='es', showOriginal=false (reset)
```

### 6. Testing Considerations

**Hook Testing**:
- Initialize with URL parameter
- Initialize with cookie (no URL param)
- Initialize with default (no URL param, no cookie)
- setLanguage updates currentLanguage
- setLanguage updates cookie
- setLanguage updates URL parameter
- setLanguage resets showOriginal to false
- toggleOriginal toggles state correctly
- setAvailableLanguages updates state
- Hook works in SSR (no window crashes)

---

## Authorized Files and Functions for Modification

### New Files to Create

1. **`/src/hooks/useGuestLanguage.ts`**
   - New custom React hook file
   - Exports: `useGuestLanguage` hook, `UseGuestLanguageReturn` interface

### Files to Modify

1. **`/src/hooks/index.ts`**
   - Target: Barrel export file
   - Type: Add export
   - Changes: Add `useGuestLanguage` and `UseGuestLanguageReturn` exports

### Files to Reference (Read-Only)

1. **`/src/hooks/useLanguagePreference.ts`**
   - Reference: Hook pattern, state management, cookie utilities
   - Usage: Template for hook structure and patterns

2. **`/src/lib/i18n/guest-language.ts`** (from REQ-E04-002)
   - Reference: `detectGuestLanguage()`, `setGuestLanguageCookie()`
   - Usage: Language detection and cookie persistence utilities

3. **`/src/types/l10n.ts`** (from REQ-E04-001)
   - Reference: `SupportedLanguage` type
   - Usage: Type for currentLanguage state

4. **`/src/app/dashboard/items/page.tsx`**
   - Reference: useSearchParams and URL parameter pattern
   - Usage: Example of URL parameter handling with Next.js

### Dependencies

**NPM Packages**:
- `react` (already installed) - useState, useEffect, useCallback
- `next/navigation` (already installed) - useSearchParams, useRouter, usePathname
- `@/types` (from REQ-E04-001) - SupportedLanguage type
- `@/lib/i18n/guest-language` (from REQ-E04-002) - Guest language utilities

---

## Dependencies

### Depends On (Must Be Completed First)

- **REQ-E04-001**: Create Localization Types File
  - Provides: `SupportedLanguage` type
  - Required: Hook state typing

- **REQ-E04-002**: Create Guest Language Utility Module
  - Provides: `detectGuestLanguage()`, `setGuestLanguageCookie()`, constants
  - Required: Core functionality for language detection and persistence

### Blocks (Cannot Start Until This Completes)

- **REQ-E04-017**: Update ItemDisplay Component (Client Component)
  - Requires: useGuestLanguage hook for state management
  - Impact: ItemDisplay uses this hook to manage language state

- **Any future guest page implementations**
  - Requires: Standard hook for guest language management
  - Impact: Consistent language state across guest experience

### Parallel Safety

✅ **Can be implemented in parallel with**:
- REQ-E04-008 through REQ-E04-013 (Guest UI components)
- Components use this hook but don't depend on it during development

**Files Touched**:
- `/src/hooks/useGuestLanguage.ts` (new file, no conflicts)
- `/src/hooks/index.ts` (modify, low conflict risk - just adding export)

### External Dependencies

- Next.js 15.x navigation hooks (useSearchParams, useRouter, usePathname)
- Browser Cookie API (via guest-language utilities)

---

## Risks and Considerations

### Technical Risks

1. **URL Parameter Persistence**
   - **Risk**: URL parameter might be lost during navigation
   - **Mitigation**: Use `router.replace` with `{ scroll: false }` to preserve URL
   - **Testing**: Verify URL parameter persists across soft navigations

2. **SSR/Client Hydration Mismatch**
   - **Risk**: Cookie/URL values available only on client, causing hydration errors
   - **Mitigation**: Use `useState` with default value, update in `useEffect`
   - **Pattern**: Same pattern as useLanguagePreference initialization
   - **Testing**: Verify no hydration warnings in console

3. **Cookie Synchronization**
   - **Risk**: Cookie and URL parameter might become out of sync
   - **Mitigation**: setLanguage updates both atomically
   - **Edge Case**: If user manually edits URL, next useEffect will sync cookie

4. **State Reset Timing**
   - **Risk**: showOriginal might not reset properly when changing languages
   - **Mitigation**: Explicitly set `setShowOriginal(false)` in setLanguage
   - **Testing**: Verify toggle resets when language changes

### Integration Risks

1. **Refetch Coordination**
   - **Risk**: Hook doesn't know when to refetch translated content
   - **Mitigation**: Parent component watches `currentLanguage` and refetches
   - **Pattern**: Hook provides state, parent handles side effects
   - **Documentation**: Clear example of parent refetch pattern

2. **Available Languages Management**
   - **Risk**: Hook doesn't know which languages are actually available
   - **Mitigation**: Provide `setAvailableLanguages` for parent to set
   - **Usage**: Parent fetches language availability and informs hook
   - **Optional**: Hook works without this (all languages assumed available)

3. **Coordination with GuestLanguageSwitcher**
   - **Risk**: Dropdown might show unavailable languages
   - **Mitigation**: Pass `availableLanguages` to GuestLanguageSwitcher
   - **Filter**: Switcher grays out unavailable languages

### State Management Risks

1. **Two-State Complexity**
   - **Risk**: `currentLanguage` + `showOriginal` might be confusing
   - **Mitigation**: Clear documentation and examples
   - **Rationale**: Two separate concerns: which translation + whether to show it

2. **Client-Side Only Toggle**
   - **Risk**: showOriginal doesn't refetch original content
   - **Mitigation**: Document that parent provides both original and translated data
   - **Usage**: Hook only controls display state, parent provides content

### URL Parameter Risks

1. **Invalid Language in URL**
   - **Risk**: User manually sets `?lang=invalid`
   - **Mitigation**: detectGuestLanguage validates and falls back to default
   - **Behavior**: Invalid language → default language (en)

2. **Shareable Link Expectations**
   - **Risk**: Users expect shared link to persist showOriginal state
   - **Mitigation**: Only persist language in URL, not showOriginal toggle
   - **Rationale**: showOriginal is transient UI state, not shareable preference

---

## Out of Scope

The following are **explicitly not included** in this task:

1. ❌ **Translation fetching** - Handled by REQ-E04-004 (Translation Fetch Utilities)
2. ❌ **Language detection utilities** - Handled by REQ-E04-002 (Guest Language Utility Module)
3. ❌ **UI components** - Handled by REQ-E04-008 through REQ-E04-012
4. ❌ **ItemDisplay integration** - Handled by REQ-E04-017 (Update ItemDisplay Component)
5. ❌ **Database persistence** - Guest preferences are cookie-only (no DB)
6. ❌ **Authenticated user language** - Handled by useLanguagePreference hook
7. ❌ **Analytics tracking** - Can be added later if needed
8. ❌ **Accept-Language header parsing** - Handled by guest-language utilities
9. ❌ **Language availability detection** - Parent component fetches and provides
10. ❌ **Automatic refetch on language change** - Parent component handles
11. ❌ **Unit tests** - Will be created as separate testing task or during implementation

---

## Implementation Notes

### Hook Design Pattern

This hook follows the **Custom Hook** pattern:
- Encapsulates related state and logic
- Returns interface with state and actions
- No direct DOM manipulation
- Composable in React components

**Similar to**:
- `useLanguagePreference` (authenticated users)
- `useState` + `useEffect` composition
- Next.js navigation hooks

### Separation from useLanguagePreference

**Why Two Hooks?**

| Aspect | useLanguagePreference | useGuestLanguage |
|--------|----------------------|------------------|
| **User Type** | Authenticated | Guest (unauthenticated) |
| **Persistence** | Database + Cookie | Cookie only |
| **URL Sync** | No | Yes (shareable links) |
| **Toggle Original** | No | Yes |
| **Available Languages** | All 6 | Varies by content |
| **Complexity** | Higher (API calls) | Lower (client-only) |

**Rationale**:
- Different persistence strategies
- Different use cases (dashboard vs public view)
- Simpler guest hook without API complexity
- Easier to maintain separately

### Priority Cascade Rationale

**Detection Order**:
1. **URL parameter** (`?lang=fr`) - Highest priority for shareable links
2. **Cookie** (FAQBNB_GUEST_LANG) - Persistent preference
3. **Accept-Language header** - Browser preference
4. **Default** (en) - Fallback

**Why This Order**:
- URL parameter enables shareable links (explicit intent)
- Cookie preserves user preference across sessions
- Accept-Language respects browser/OS settings
- Default ensures always-working experience

### Two-State System Rationale

**Why `currentLanguage` + `showOriginal`?**

**Scenario 1: French translation available**
```typescript
currentLanguage: 'fr'
showOriginal: false  → Show French translation
showOriginal: true   → Show English original
```

**Scenario 2: Spanish translation NOT available (fallback to English)**
```typescript
currentLanguage: 'es'  (user's preference)
showOriginal: false    → Show English (fallback)
// showOriginal: true would show the same English content
```

**Rationale**:
- `currentLanguage` = user's preferred language
- `showOriginal` = override to show original regardless
- Two separate concerns, two separate states
- Parent component uses both to determine what to display

### URL Parameter Synchronization

**Why Sync URL**:
- Shareable links with language preference
- Browser back/forward button works
- Bookmark preserves language choice
- Deep linking support

**How to Sync**:
```typescript
// Read URL
const urlLang = searchParams?.get('lang');

// Write URL (without navigation)
const params = new URLSearchParams(searchParams?.toString() || '');
params.set('lang', newLanguage);
router.replace(`${pathname}?${params.toString()}`, { scroll: false });
```

**Options**:
- `router.replace` (not `router.push`) - don't add history entry
- `{ scroll: false }` - don't scroll to top
- Preserve other URL parameters

### State Reset Rationale

**Why Reset `showOriginal` on Language Change**:

```typescript
// User viewing French translation
currentLanguage: 'fr', showOriginal: false

// User clicks "View original"
currentLanguage: 'fr', showOriginal: true

// User switches to Spanish
// What should showOriginal be?
// Answer: false (show the new translation)
currentLanguage: 'es', showOriginal: false ✅

// If we didn't reset:
currentLanguage: 'es', showOriginal: true ❌
// User would see original immediately, confusing!
```

**Rationale**:
- User switching languages expects to see new translation
- showOriginal is transient UI toggle, not sticky preference
- Clearer user experience

### Integration Pattern

**Parent Component Usage**:

```typescript
function GuestItemPage({ item, translatedContent, translationMeta }) {
  const {
    currentLanguage,
    showOriginal,
    setLanguage,
    toggleOriginal,
    isLoading,
    setAvailableLanguages,
  } = useGuestLanguage();

  // Set available languages when data loaded
  useEffect(() => {
    if (translationMeta?.availableLanguages) {
      setAvailableLanguages(translationMeta.availableLanguages);
    }
  }, [translationMeta?.availableLanguages, setAvailableLanguages]);

  // Determine what content to display
  const displayContent = showOriginal
    ? item.originalContent
    : (translatedContent[currentLanguage] || item.originalContent);

  const isShowingFallback = !translatedContent[currentLanguage] && !showOriginal;

  return (
    <div>
      {/* Language switcher */}
      <GuestLanguageSwitcher
        currentLanguage={currentLanguage}
        availableLanguages={availableLanguages}
        onLanguageChange={setLanguage}
      />

      {/* Banners */}
      {!showOriginal && translatedContent[currentLanguage] && (
        <TranslationBanner
          sourceLanguage={item.originalLanguage}
          onViewOriginal={() => toggleOriginal()}
        />
      )}

      {isShowingFallback && (
        <MissingTranslationBanner
          requestedLanguage={currentLanguage}
          fallbackLanguage={item.originalLanguage}
        />
      )}

      {/* Toggle button */}
      <ViewOriginalToggle
        isViewingOriginal={showOriginal}
        originalLanguage={item.originalLanguage}
        onToggle={toggleOriginal}
      />

      {/* Content */}
      <div dangerouslySetInnerHTML={{ __html: displayContent }} />
    </div>
  );
}
```

### Testing Strategy

**Unit Tests** (to be created):

```typescript
import { renderHook, act } from '@testing-library/react';
import { useGuestLanguage } from './useGuestLanguage';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('useGuestLanguage', () => {
  it('initializes with default language', () => {
    const { result } = renderHook(() => useGuestLanguage());
    expect(result.current.currentLanguage).toBe('en');
    expect(result.current.showOriginal).toBe(false);
  });

  it('initializes with URL parameter', () => {
    // Mock URL parameter
    useSearchParams.mockReturnValue({
      get: (key) => key === 'lang' ? 'fr' : null
    });

    const { result } = renderHook(() => useGuestLanguage());
    expect(result.current.currentLanguage).toBe('fr');
  });

  it('setLanguage updates currentLanguage', () => {
    const { result } = renderHook(() => useGuestLanguage());

    act(() => {
      result.current.setLanguage('es');
    });

    expect(result.current.currentLanguage).toBe('es');
  });

  it('setLanguage resets showOriginal', () => {
    const { result } = renderHook(() => useGuestLanguage());

    act(() => {
      result.current.toggleOriginal();
    });
    expect(result.current.showOriginal).toBe(true);

    act(() => {
      result.current.setLanguage('de');
    });
    expect(result.current.showOriginal).toBe(false);
  });

  it('toggleOriginal toggles state', () => {
    const { result } = renderHook(() => useGuestLanguage());

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

  it('setAvailableLanguages updates state', () => {
    const { result } = renderHook(() => useGuestLanguage());

    expect(result.current.availableLanguages).toBeUndefined();

    act(() => {
      result.current.setAvailableLanguages(['en', 'fr', 'es']);
    });

    expect(result.current.availableLanguages).toEqual(['en', 'fr', 'es']);
  });
});
```

**Integration Tests**:
- Test with GuestLanguageSwitcher component
- Test with ViewOriginalToggle component
- Test URL parameter updates in browser
- Test cookie persistence across page reloads

---

**Last Modified**: 2026-01-22 19:22
