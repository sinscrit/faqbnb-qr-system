# REQ-358: Create LanguagePreferenceSection Component - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Reference:** REQ-358 (Epic 5 - Owner Translation Management)
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.1
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## 1. Summary

This document provides the implementation breakdown for creating the `LanguagePreferenceSection` component, which enables property owners to select and save their preferred interface language. The component displays a dropdown selector with all six supported languages (with flag icons and native names), a save button with loading state, and help text explaining the setting's purpose. This component integrates into account settings or profile areas and leverages existing infrastructure from Epic 1 (Foundation).

---

## 2. Dependencies

### 2.1 Epic Dependencies

| Epic | Dependency | Status | Notes |
|------|------------|--------|-------|
| Epic 1 (Foundation) | `preferred_language` columns in `users` and `accounts` tables | **Complete** | Added by REQ-225 |
| Epic 1 (Foundation) | i18n framework (`next-intl`) | **Complete** | REQ-229 |
| Epic 1 (Foundation) | Language preference API (`/api/user/language`) | **Complete** | REQ-251 |
| Epic 1 (Foundation) | LanguageSwitcher component | **Complete** | REQ-248 - Provides reusable patterns |
| Epic 1 (Foundation) | useLanguagePreference hook | **Complete** | REQ-249 - Provides persistence logic |

### 2.2 Codebase Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| AuthContext | `/src/contexts/AuthContext.tsx` | Get current user/account data |
| useAuth hook | `/src/contexts/AuthContext.tsx` | Access user authentication state |
| useLanguagePreference | `/src/hooks/useLanguagePreference.ts` | Language preference management |
| Database types | `/src/lib/supabase.ts` | `preferred_language` field types |
| LanguageSwitcher constants | `/src/components/LanguageSwitcher/constants.ts` | `SUPPORTED_LOCALES`, language utilities |
| Lucide React icons | `lucide-react` | Icons (Globe, Check, Loader2, AlertCircle) |

### 2.3 Related Files to Reference

| File | Pattern to Follow |
|------|-------------------|
| `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | Settings UI pattern, Airbnb styling, popover structure |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Dropdown selector with flags, keyboard navigation, persistence |
| `/src/hooks/useLanguagePreference.ts` | Language preference state management and API calls |
| `/src/components/ItemManager/components/shared/InlineEdit.tsx` | Loading states, error handling, accessibility |

---

## 3. Technical Context

### 3.1 Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x with Airbnb Design Language |
| **UI Components** | Radix UI primitives, Lucide React icons |
| **State Management** | React hooks + AuthContext |
| **Backend** | Supabase (PostgreSQL with RLS) |

### 3.2 Airbnb Design Language Colors

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Primary text | #222222 | `text-[#222222]` |
| Secondary text | #717171 | `text-[#717171]` |
| Light background | #F7F7F7 | `bg-[#F7F7F7]` |
| Border | #DDDDDD | `border-[#DDDDDD]` |
| Accent (Airbnb red) | #FF385C | `text-[#FF385C]` or `bg-[#FF385C]` |
| Focus ring | #FF385C | `focus:ring-[#FF385C]` |

### 3.3 Supported Languages (from `/src/components/LanguageSwitcher/constants.ts`)

| Code | Language Name | Native Name | Flag Emoji |
|------|---------------|-------------|------------|
| `en` | English | English | 🇬🇧 |
| `nl` | Dutch | Nederlands | 🇳🇱 |
| `fr` | French | Français | 🇫🇷 |
| `de` | German | Deutsch | 🇩🇪 |
| `it` | Italian | Italiano | 🇮🇹 |
| `es` | Spanish | Español | 🇪🇸 |

### 3.4 Existing API Endpoint

**Endpoint:** `PUT /api/user/language`

**Location:** `/src/app/api/user/language/route.ts`

**Request Body:**
```json
{
  "language": "fr"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "language": "fr",
    "updatedAt": "2026-01-19T14:30:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Language \"xx\" is not supported",
  "code": "INVALID_LANGUAGE",
  "supportedLanguages": ["en", "fr", "es", "de", "nl", "it"]
}
```

### 3.5 Database Schema Reference

From `/src/lib/supabase.ts`:

```typescript
// Users table
interface User {
  // ... other fields
  preferred_language: string | null;  // REQ-225
}

// Accounts table
interface Account {
  // ... other fields
  preferred_language: string | null;  // REQ-225
}
```

---

## 4. Component Architecture

### 4.1 Component Structure

```
/src/components/TranslationManagement/LanguagePreference/
├── index.ts                          # Public exports
├── LanguagePreferenceSection.tsx     # Main component
└── LanguagePreferenceSection.types.ts # Type definitions (optional)
```

### 4.2 Component Props Interface

```typescript
/**
 * Props for LanguagePreferenceSection component
 */
export interface LanguagePreferenceSectionProps {
  /** Optional CSS class for container styling */
  className?: string;
  /** Callback when preference is successfully saved */
  onSave?: (language: SupportedLanguage) => void;
  /** Callback when save fails */
  onError?: (error: string) => void;
  /** Whether to show the section header */
  showHeader?: boolean;
}
```

### 4.3 State Management

The component should leverage the existing `useLanguagePreference` hook from REQ-249, which already provides:

```typescript
interface UseLanguagePreferenceReturn {
  language: SupportedLanguage;           // Current preference
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  isLoading: boolean;                    // Initial load
  isSaving: boolean;                     // Save in progress
  error: string | null;                  // Error message
  clearError: () => void;
  supportedLanguages: readonly LanguageOption[];
  isAuthenticated: boolean;
}
```

### 4.4 Component Local State (if not using hook directly)

```typescript
interface LanguagePreferenceSectionState {
  selectedLanguage: SupportedLanguage;   // Current selection (may differ from saved)
  savedLanguage: SupportedLanguage;      // Original saved value for comparison
  isLoading: boolean;                    // Initial load
  isSaving: boolean;                     // Save in progress
  successMessage: string | null;         // Success feedback
  errorMessage: string | null;           // Error feedback
  isDropdownOpen: boolean;               // Dropdown visibility
}

// Computed
const isDirty = selectedLanguage !== savedLanguage;
```

---

## 5. Implementation Tasks

### Task 6.1.1: Create Directory Structure

**Action:** Create the LanguagePreference component directory structure under TranslationManagement:

```bash
mkdir -p src/components/TranslationManagement/LanguagePreference
```

**Note:** The parent `/src/components/TranslationManagement/` directory may already exist or need to be created.

---

### Task 6.1.2: Create Component Index File

**File:** `/src/components/TranslationManagement/LanguagePreference/index.ts`

**Content:**
```typescript
// /src/components/TranslationManagement/LanguagePreference/index.ts
// REQ-358: LanguagePreference barrel exports
// Last Modified: 2026-01-19

export { LanguagePreferenceSection } from './LanguagePreferenceSection';
export type { LanguagePreferenceSectionProps } from './LanguagePreferenceSection';
```

---

### Task 6.1.3: Create LanguagePreferenceSection Component

**File:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`

**Implementation Requirements:**

1. **Dropdown Selector:**
   - Display all 6 supported languages from existing `SUPPORTED_LOCALES` constant
   - Each option shows: flag emoji, native name, English name (in parentheses)
   - Pre-select current user's `preferred_language` value from `useLanguagePreference` hook
   - Handle null/undefined preference with fallback to 'en'
   - Full keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)

2. **Save Button:**
   - Disabled when no changes made (isDirty = false)
   - Show loading spinner during save (`Loader2` icon with `animate-spin`)
   - Text changes: "Save" → "Saving..." during operation
   - Primary button style consistent with Airbnb DLS

3. **Help Text:**
   - Appears below the dropdown
   - Explains: "This preference controls which language you see throughout the application interface, including menus, labels, and system messages."
   - Clarifies this setting affects the interface, not guest-facing content

4. **Feedback Messages:**
   - Success: Green banner with "Language preference saved successfully"
   - Error: Red banner with error message
   - Messages auto-dismiss after 3-5 seconds

5. **Accessibility:**
   - ARIA labels on dropdown button and options
   - `role="listbox"` and `role="option"` for dropdown
   - `aria-selected`, `aria-expanded`, `aria-haspopup` attributes
   - Focus management when dropdown opens/closes
   - Keyboard navigation support

6. **Styling:**
   - Follow Airbnb Design Language (colors, spacing, rounded corners)
   - Match `DashboardSettingsPopover.tsx` patterns
   - Responsive design for tablet and desktop viewports

**Component Skeleton:**

```typescript
// /src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx
// REQ-358: Language Preference Section Component
// Phase: 6 - Language Preference Setting
// Task ID: 6.1
// Last Modified: 2026-01-19

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Globe, Check, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';
import {
  SUPPORTED_LOCALES,
  getLocaleByCode,
  type SupportedLanguage
} from '@/components/LanguageSwitcher/constants';

export interface LanguagePreferenceSectionProps {
  className?: string;
  onSave?: (language: SupportedLanguage) => void;
  onError?: (error: string) => void;
  showHeader?: boolean;
}

export function LanguagePreferenceSection({
  className = '',
  onSave,
  onError,
  showHeader = true,
}: LanguagePreferenceSectionProps) {
  // Use existing hook for language preference management
  const {
    language: savedLanguage,
    setLanguage: persistLanguage,
    isLoading,
    isSaving,
    error: hookError,
    clearError,
  } = useLanguagePreference();

  // Local state for selection before save
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(savedLanguage);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const isDirty = selectedLanguage !== savedLanguage;

  // Sync local state with saved language
  useEffect(() => {
    setSelectedLanguage(savedLanguage);
  }, [savedLanguage]);

  // Sync hook error to local error state
  useEffect(() => {
    if (hookError) {
      setErrorMessage(hookError);
    }
  }, [hookError]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-dismiss error message
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, clearError]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await persistLanguage(selectedLanguage);
      setSuccessMessage('Language preference saved successfully');
      onSave?.(selectedLanguage);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save language preference';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    }
  }, [isDirty, isSaving, persistLanguage, selectedLanguage, onSave, onError]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const totalOptions = SUPPORTED_LOCALES.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev + 1) % totalOptions);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
          setFocusedIndex(totalOptions - 1);
        } else {
          setFocusedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
          const currentIndex = SUPPORTED_LOCALES.findIndex(l => l.code === selectedLanguage);
          setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
        } else if (focusedIndex >= 0) {
          const selected = SUPPORTED_LOCALES[focusedIndex];
          if (selected) {
            setSelectedLanguage(selected.code);
            setIsDropdownOpen(false);
            setFocusedIndex(-1);
            buttonRef.current?.focus();
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
        break;
    }
  }, [isDropdownOpen, focusedIndex, selectedLanguage]);

  // Get current language option
  const currentLanguageOption = getLocaleByCode(selectedLanguage) || SUPPORTED_LOCALES[0];

  // Loading state
  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 text-[#717171]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading language preference...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-[#222222]" />
          <h3 className="text-base font-semibold text-[#222222]">
            Interface Language
          </h3>
        </div>
      )}

      {/* Language Selector */}
      <div className="relative mb-3" ref={dropdownRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            if (!isSaving) {
              setIsDropdownOpen(!isDropdownOpen);
              if (!isDropdownOpen) {
                const currentIndex = SUPPORTED_LOCALES.findIndex(l => l.code === selectedLanguage);
                setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
              }
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-[#DDDDDD] rounded-lg text-left hover:border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          aria-label={`Select language. Current language: ${currentLanguageOption?.name || 'English'}`}
        >
          <span className="flex items-center gap-3">
            {currentLanguageOption?.flag && (
              <span className="text-xl">{currentLanguageOption.flag}</span>
            )}
            <span className="text-[#222222]">
              {currentLanguageOption?.nativeName}
              <span className="text-[#717171] ml-1">
                ({currentLanguageOption?.name})
              </span>
            </span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#717171] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className="absolute z-50 mt-1 w-full bg-white border border-[#DDDDDD] rounded-lg shadow-lg max-h-64 overflow-y-auto"
            role="listbox"
            aria-label="Language options"
          >
            {SUPPORTED_LOCALES.map((locale, index) => {
              const isSelected = selectedLanguage === locale.code;
              const isFocused = focusedIndex === index;

              return (
                <button
                  key={locale.code}
                  ref={(el) => { optionsRef.current[index] = el; }}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(locale.code);
                    setIsDropdownOpen(false);
                    setFocusedIndex(-1);
                    buttonRef.current?.focus();
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                    isFocused ? 'bg-[#FFEEEF] text-[#222222]' : ''
                  } ${
                    isSelected && !isFocused ? 'bg-[#F7F7F7]' : ''
                  } ${
                    !isFocused && !isSelected ? 'hover:bg-[#F7F7F7]' : ''
                  }`}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`${locale.name}, ${locale.nativeName}`}
                >
                  <span className="flex items-center gap-3">
                    {locale.flag && (
                      <span className="text-xl">{locale.flag}</span>
                    )}
                    <span className="text-[#222222]">
                      {locale.nativeName}
                      <span className="text-[#717171] ml-1">
                        ({locale.name})
                      </span>
                    </span>
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#FF385C] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-sm text-[#717171] mb-4">
        This preference controls which language you see throughout the application
        interface, including menus, labels, and system messages. It does not affect
        guest-facing content translations.
      </p>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty || isSaving}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#222222] text-white rounded-lg font-medium hover:bg-[#000000] focus:outline-none focus:ring-2 focus:ring-[#222222] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Preference'
        )}
      </button>

      {/* Success Message */}
      {successMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

export default LanguagePreferenceSection;
```

---

### Task 6.1.4: Create/Update TranslationManagement Index Export

**File:** `/src/components/TranslationManagement/index.ts`

**Action:** Create or update the main TranslationManagement exports to include LanguagePreferenceSection.

```typescript
// /src/components/TranslationManagement/index.ts
// REQ-358: TranslationManagement barrel exports
// Last Modified: 2026-01-19

export * from './LanguagePreference';
```

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/LanguagePreference/index.ts` | Component barrel exports |
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Main component |
| `/src/components/TranslationManagement/index.ts` | TranslationManagement module exports (if not existing) |

### 6.2 Files to Potentially Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/index.ts` | Add LanguagePreference export (if file already exists) |

### 6.3 Functions/Components to Create

| Component/Function | Location | Purpose |
|--------------------|----------|---------|
| `LanguagePreferenceSection` | `LanguagePreferenceSection.tsx` | Main preference UI component |

### 6.4 Existing Dependencies to Import (DO NOT MODIFY)

| Dependency | Location | Usage |
|------------|----------|-------|
| `useLanguagePreference` | `/src/hooks/useLanguagePreference.ts` | Language state and persistence |
| `SUPPORTED_LOCALES` | `/src/components/LanguageSwitcher/constants.ts` | Language list with metadata |
| `getLocaleByCode` | `/src/components/LanguageSwitcher/constants.ts` | Lookup language by code |
| `SupportedLanguage` type | `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | Type definition |

---

## 7. Acceptance Criteria Checklist

From REQ-358:

- [ ] Component file exists at `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
- [ ] Component renders a language dropdown selector displaying all supported languages
- [ ] Each language option shows a flag icon and native language name
- [ ] Dropdown pre-selects the currently saved language preference when component mounts
- [ ] Save button appears below or adjacent to the dropdown selector
- [ ] Save button is disabled until user selects a different language from current preference
- [ ] Save button displays loading state (spinner or loading text) during save operation
- [ ] Help text appears near the dropdown explaining the setting's purpose and scope
- [ ] Help text clarifies that this setting affects the application interface, not guest-facing content
- [ ] Component handles successful save by displaying confirmation feedback
- [ ] Component handles failed save by displaying error message without losing user's selection
- [ ] Component is keyboard accessible with proper focus management
- [ ] Component provides appropriate ARIA labels for screen readers
- [ ] Component styling is consistent with the application's design system
- [ ] Component is responsive and usable on both tablet and desktop viewports

---

## 8. Integration Notes

### 8.1 Where to Use This Component

The `LanguagePreferenceSection` component is designed to be integrated into:

1. **Account Settings Page** - Primary location for user preferences
2. **Profile Settings** - If a dedicated profile page exists
3. **Dashboard Settings Modal** - Could be added to `DashboardSettingsPopover` or similar

### 8.2 Example Usage

```tsx
// In account settings page
import { LanguagePreferenceSection } from '@/components/TranslationManagement';

export default function AccountSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <section className="bg-white rounded-xl border border-[#DDDDDD] mb-6">
        <LanguagePreferenceSection
          onSave={(lang) => console.log('Language saved:', lang)}
          onError={(err) => console.error('Save failed:', err)}
        />
      </section>

      {/* Other settings sections... */}
    </div>
  );
}
```

### 8.3 Task 6.3 Integration

Task 6.3 (Integrate into account settings or profile) will handle the actual integration of this component into the appropriate settings location. This task (6.1) focuses only on creating the component itself.

---

## 9. Testing Strategy

### 9.1 Unit Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Renders with loading state initially | Shows loading spinner |
| Loads saved preference on mount | Dropdown shows saved language |
| Handles null/missing preference | Falls back to 'en' |
| Save button disabled when no changes | Button is disabled |
| Save button enabled after selection change | Button becomes enabled |
| Shows loading state during save | Spinner and "Saving..." text |
| Shows success message after save | Green success banner |
| Shows error message on failure | Red error banner |
| Dropdown opens/closes correctly | Menu visibility toggles |
| ArrowDown opens dropdown and navigates | Focus moves through options |
| ArrowUp navigates in reverse | Focus moves up through options |
| Enter selects focused option | Option is selected, dropdown closes |
| Escape closes dropdown | Dropdown closes, focus returns to button |
| Tab closes dropdown | Dropdown closes |
| Screen reader announces current selection | Proper ARIA attributes |

### 9.2 Integration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| API saves preference correctly | Database updated via `/api/user/language` |
| Preference persists after page reload | Value maintained |
| Works with useLanguagePreference hook | Hook state reflects component changes |
| Error from API displayed in component | Error message shows |

---

## 10. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationManagement directory doesn't exist | Medium | Low | Create directory structure first |
| useLanguagePreference hook not available | Low | High | Hook exists (REQ-249), verify import path |
| LanguageSwitcher constants not exported | Low | Medium | Constants are exported, verify import path |
| Conflicting styles with parent container | Low | Medium | Use scoped classes, test in context |

---

## 11. References

- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-358)
- **Related Components:**
  - `DashboardSettingsPopover.tsx` - Settings UI pattern
  - `LanguageSwitcher.tsx` - Dropdown with flags pattern
- **Related Hooks:**
  - `useLanguagePreference.ts` - Language state management
- **API Endpoint:** `/src/app/api/user/language/route.ts`
- **Database Types:** `/src/lib/supabase.ts`

---

*Document generated for FAQBNB Localization Epic 5 - Task 6.1: Create LanguagePreferenceSection Component*
