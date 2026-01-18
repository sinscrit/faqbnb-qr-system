# Implementation Breakdown: REQ-248 - Create LanguageSwitcher Component

**Generated:** 2026-01-18 18:30:00 UTC
**Last Modified:** 2026-01-18 18:30:00 UTC
**Request Reference:** REQ-248 - Language Selection Dropdown
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 5, Task 5.3)
**Epic:** L10N Epic 1 - Foundation
**Size:** M (Medium)

---

## Overview

This document provides a detailed implementation breakdown for creating the LanguageSwitcher component, which enables users to select their preferred display language from a dropdown menu. The component will support all 6 languages (English, French, Spanish, German, Dutch, Italian) with native language names, and persist preferences using database storage for authenticated users and cookies for guests.

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Dropdown Component | `/src/components/PropertySelector.tsx` | Reference for dropdown UI patterns, keyboard navigation, accessibility |
| Selector Component | `/src/components/AccountSelector.tsx` | Reference for dropdown with icons, selection state, click-outside handling |
| Context Usage | `/src/contexts/AuthContext.tsx` | Reference for accessing user state and persistence patterns |
| Custom Hooks | `/src/hooks/useActiveProperty.ts` | Reference for hook structure and localStorage patterns |
| Cookie Handling | `/src/middleware.ts` | Reference for server-side cookie patterns with Supabase |
| API Routes | `/src/app/api/user/properties/route.ts` | Reference for user-specific API endpoint patterns |

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| `next-intl` | NPM Package | Must be installed (Phase 2 task) |
| `useLanguagePreference` hook | Custom Hook | To be created (Task 5.4 - can be done in parallel) |
| Language preference API endpoint | API Route | To be created (Task 5.6 - can be done in parallel) |
| i18n configuration | Config | Should exist from Phase 2 (`/src/lib/i18n/config.ts`) |
| `preferred_language` DB column | Database | Must exist (Phase 1 task) |

---

## Requirements

### Functional Requirements

From REQ-248:
1. A dropdown control displays all six supported languages
2. Each language is shown using its native name (not English translations)
3. Selecting a language immediately updates the application's display language
4. For authenticated users, language preference is saved to their user account
5. For guest users, language preference is saved to browser storage
6. The user's last selected language is automatically applied when they return
7. The language selector is accessible from all major pages in the application

### Supported Languages

| Code | English Name | Native Name |
|------|--------------|-------------|
| `en` | English | English |
| `fr` | French | Français |
| `es` | Spanish | Español |
| `de` | German | Deutsch |
| `nl` | Dutch | Nederlands |
| `it` | Italian | Italiano |

---

## Architecture

### Component Structure

```
/src/components/LanguageSwitcher/
├── index.ts                         # Barrel export
├── LanguageSwitcher.tsx             # Main component
└── LanguageSwitcher.types.ts        # TypeScript interfaces
```

### Data Flow

```
User selects language
       │
       ▼
LanguageSwitcher.onChange()
       │
       ├── If authenticated → Call API to save to DB
       │                      └── /api/user/language (PUT)
       │                             └── Updates users.preferred_language
       │
       └── For all users → Set cookie (FAQBNB_LANG)
                          └── next-intl reads cookie on next request
       │
       ▼
Trigger locale change in next-intl
       │
       ▼
UI re-renders with new language
```

### State Management

The component will integrate with:
1. **next-intl** - For the actual locale switching via `useRouter` from `next-intl/navigation`
2. **AuthContext** - To access authenticated user state
3. **localStorage/cookies** - For preference persistence

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/LanguageSwitcher/index.ts` | Barrel export for clean imports |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Main component implementation |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | TypeScript interfaces |

### Existing Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/DashboardLayout.tsx` | Add LanguageSwitcher to header (lines ~275-291, right side section) |
| `/src/types/index.ts` | Add L10N-related type exports if needed |

### Files for Reference Only (Do Not Modify)

| File Path | Purpose |
|-----------|---------|
| `/src/components/PropertySelector.tsx` | Reference for dropdown pattern |
| `/src/components/AccountSelector.tsx` | Reference for selector pattern |
| `/src/contexts/AuthContext.tsx` | Reference for context usage |

---

## Implementation Tasks

### Task 1: Create Type Definitions

**File:** `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts`

**Implementation:**
```typescript
// Supported language codes matching i18n config
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

// Individual language option
export interface LocaleOption {
  code: SupportedLanguage;
  name: string;           // English name for accessibility
  nativeName: string;     // Native name displayed in dropdown
  flag?: string;          // Optional flag emoji
}

// Component props
export interface LanguageSwitcherProps {
  /** Current locale code (optional - defaults to detected locale) */
  currentLocale?: SupportedLanguage;
  /** Callback when locale changes */
  onLocaleChange?: (locale: SupportedLanguage) => void;
  /** Display variant */
  variant?: 'dropdown' | 'compact';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show native language names (default: true) */
  showNativeNames?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

// Locale persistence result
export interface LocalePersistenceResult {
  success: boolean;
  error?: string;
  persistedTo: 'database' | 'cookie' | 'both';
}
```

**Acceptance Criteria:**
- [ ] All supported language codes are defined as a union type
- [ ] LocaleOption interface includes code, name, nativeName, and optional flag
- [ ] LanguageSwitcherProps includes all required configuration options
- [ ] Types are exported and can be imported by other modules

---

### Task 2: Create Locale Configuration Constants

**File:** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` (top section)

**Implementation:**
```typescript
import { LocaleOption, SupportedLanguage } from './LanguageSwitcher.types';

// Supported locales with native names
export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

export const DEFAULT_LOCALE: SupportedLanguage = 'en';
export const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds
```

**Acceptance Criteria:**
- [ ] All 6 languages are defined with correct native names
- [ ] Constants for cookie name and max age are defined
- [ ] Default locale is set to 'en'

---

### Task 3: Implement LanguageSwitcher Component

**File:** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`

**Implementation Approach:**
1. Use useState for dropdown open/close state
2. Use useRef for click-outside detection
3. Get current locale from next-intl useLocale hook
4. Get user authentication state from AuthContext
5. Implement keyboard navigation (Arrow keys, Enter, Escape)
6. Handle locale change with persistence logic

**Key Functions:**
- `handleLocaleChange(locale: SupportedLanguage)` - Main handler
- `persistLocalePreference(locale)` - Save to DB for auth users, cookie for all
- `setLocaleCookie(locale)` - Set browser cookie

**Styling Pattern:**
Follow the existing patterns from PropertySelector.tsx:
- Use Tailwind CSS classes
- Airbnb DLS colors: `#FF385C` for accent, `#222222` for text
- Rounded corners with `rounded-lg`
- Focus ring with `focus:ring-2 focus:ring-[#FF385C]`

**Accessibility:**
- `aria-expanded` on button
- `aria-haspopup="listbox"` on button
- `role="listbox"` on dropdown
- `role="option"` on each item
- `aria-selected` on selected item
- `aria-label` for screen readers

**Acceptance Criteria:**
- [ ] Dropdown shows all 6 languages with native names
- [ ] Current language is highlighted/indicated
- [ ] Click on option changes language and closes dropdown
- [ ] Click outside closes dropdown
- [ ] Keyboard navigation works (ArrowUp, ArrowDown, Enter, Escape)
- [ ] Loading state shown during language change
- [ ] Accessible with proper ARIA attributes

---

### Task 4: Implement Locale Persistence Logic

**File:** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`

**Implementation:**
```typescript
const persistLocalePreference = async (locale: SupportedLanguage): Promise<LocalePersistenceResult> => {
  // Always set cookie for immediate persistence
  setLocaleCookie(locale);

  // If user is authenticated, also save to database
  if (user) {
    try {
      const response = await fetch('/api/user/language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: locale }),
      });

      if (!response.ok) {
        console.warn('Failed to persist language to database, cookie still set');
        return { success: true, persistedTo: 'cookie' };
      }

      return { success: true, persistedTo: 'both' };
    } catch (error) {
      console.error('Error persisting language preference:', error);
      return { success: true, persistedTo: 'cookie' };
    }
  }

  return { success: true, persistedTo: 'cookie' };
};

const setLocaleCookie = (locale: SupportedLanguage) => {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
};
```

**Acceptance Criteria:**
- [ ] Cookie is always set regardless of auth state
- [ ] Authenticated users have preference saved to database
- [ ] Database save failure doesn't block the UI update
- [ ] Cookie has appropriate path, max-age, and SameSite settings

---

### Task 5: Create Barrel Export

**File:** `/src/components/LanguageSwitcher/index.ts`

**Implementation:**
```typescript
export { LanguageSwitcher } from './LanguageSwitcher';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from './LanguageSwitcher';
export type {
  LanguageSwitcherProps,
  LocaleOption,
  SupportedLanguage,
  LocalePersistenceResult,
} from './LanguageSwitcher.types';
```

**Acceptance Criteria:**
- [ ] Component can be imported as `import { LanguageSwitcher } from '@/components/LanguageSwitcher'`
- [ ] Types can be imported for use in other components
- [ ] Constants (SUPPORTED_LOCALES) are exported for reuse

---

### Task 6: Integrate into DashboardLayout

**File:** `/src/components/DashboardLayout.tsx`

**Modification Location:** Lines ~275-291 (right side of header, before Logout button)

**Implementation:**
```typescript
// Add import at top of file
import { LanguageSwitcher } from './LanguageSwitcher';

// In the header right side section (around line 275)
<div className="flex items-center space-x-3">
  {/* Language Switcher */}
  <LanguageSwitcher
    variant="compact"
    size="sm"
    className="min-w-[120px]"
  />

  {/* Account Selector */}
  {showAccountSelector && (
    <CompactAccountSelector
      onAccountChange={handleAccountChange}
      className="w-64"
    />
  )}

  {/* Logout Button */}
  <button
    onClick={() => signOut()}
    // ... existing button code
  >
    Logout
  </button>
</div>
```

**Acceptance Criteria:**
- [ ] LanguageSwitcher appears in header between title area and Account Selector
- [ ] Component uses compact variant to fit in header
- [ ] Does not break existing header layout
- [ ] Visible on all dashboard pages

---

## Component Variants

### Standard Dropdown Variant
- Full dropdown with flag, native name, and English name
- Suitable for settings pages or larger UI areas

### Compact Variant
- Shows only current language code or native name
- Dropdown shows native names when expanded
- Suitable for headers and navigation bars

---

## Keyboard Navigation Implementation

| Key | Action |
|-----|--------|
| `Enter` or `Space` | Open dropdown (if closed) or select focused option |
| `ArrowDown` | Move focus to next option (or first if closed) |
| `ArrowUp` | Move focus to previous option |
| `Escape` | Close dropdown without changing |
| `Tab` | Move to next focusable element, close dropdown |

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Database save fails | Log warning, continue with cookie-only persistence |
| next-intl locale change fails | Show error toast, revert to previous locale |
| Invalid locale code | Fall back to default locale ('en') |
| Cookie blocked by browser | Locale will still work for current session |

---

## Testing Considerations

### Unit Tests
- Render with different props combinations
- Keyboard navigation
- Click outside closes dropdown
- Locale selection calls onChange

### Integration Tests
- Authenticated user: preference saved to DB
- Guest user: preference saved to cookie only
- Language change triggers re-render with new translations
- Persistence across page navigation

### Manual Testing
- Test all 6 language selections
- Test dropdown in different viewport sizes
- Test with screen reader
- Test keyboard-only navigation

---

## Dependencies on Other Tasks

| Task | Dependency Type | Notes |
|------|-----------------|-------|
| Task 5.4 (useLanguagePreference hook) | Optional | Component can work without hook, but hook would simplify state management |
| Task 5.6 (Language preference API) | Required | `/api/user/language` endpoint must exist for DB persistence |
| Task 1.3 (preferred_language column) | Required | Database column must exist |
| Task 2.1 (next-intl setup) | Required | i18n framework must be configured |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Type definitions | 0.5 hours |
| Locale constants | 0.5 hours |
| Main component | 3-4 hours |
| Persistence logic | 1-2 hours |
| Barrel export | 0.25 hours |
| DashboardLayout integration | 0.5 hours |
| Testing & fixes | 1-2 hours |
| **Total** | **6-9 hours** |

---

## Notes

1. **next-intl Integration:** The actual locale change will use `useRouter` from `next-intl/navigation` with `router.replace(pathname, { locale: newLocale })`. This may require the i18n routing configuration to be complete first.

2. **Cookie vs Router:** If next-intl is configured to read locale from cookie, setting the cookie and refreshing may be sufficient. If using URL-based locales, router navigation is needed.

3. **Fallback Strategy:** If next-intl is not yet fully configured, the component should still work for cookie persistence and be ready for full i18n integration.

4. **Public Pages:** While this task focuses on dashboard integration, the component is designed to be reusable on public-facing pages as well.

---

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Radix UI Select](https://www.radix-ui.com/docs/primitives/components/select) - Alternative pattern reference
- [WAI-ARIA Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- Plan-110-L10N-Epic1-Foundation.md - Parent implementation plan
- PRD_L10N_Epic1_Foundation.md - Product requirements

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Task 5.3*
