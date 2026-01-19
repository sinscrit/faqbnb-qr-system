# REQ-327: Create LanguagePreferenceSection Component - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Reference:** REQ-327 (Epic 5 - Owner Translation Management)
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.1

---

## 1. Summary

This document provides the implementation breakdown for creating the `LanguagePreferenceSection` component, which enables property owners to select and save their preferred interface language. The component displays a dropdown selector with all six supported languages (with flag icons and native names), a save button with loading state, and help text explaining the setting's purpose.

---

## 2. Dependencies

### 2.1 Epic Dependencies

| Epic | Dependency | Status | Notes |
|------|------------|--------|-------|
| Epic 1 (Foundation) | `preferred_language` columns in `users` and `accounts` tables | **Required** | Added by REQ-225 |
| Epic 1 (Foundation) | i18n framework (`next-intl`) | Required | For UI strings |
| Epic 3 (Dynamic Content) | Translation tables structure | Reference | Pattern guidance |

### 2.2 Codebase Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| AuthContext | `/src/contexts/AuthContext.tsx` | Get current user/account data |
| useAuth hook | `/src/contexts/AuthContext.tsx` | Access user authentication state |
| Database types | `/src/lib/supabase.ts` | `preferred_language` field types |
| Radix UI | `@radix-ui/react-select` | Dropdown selector (if available) |
| Lucide React icons | `lucide-react` | Icons (Globe, Check, Loader2) |

### 2.3 Related Files to Reference

| File | Pattern to Follow |
|------|-------------------|
| `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | Settings UI pattern, Airbnb styling |
| `/src/hooks/useDashboardPreferences.ts` | Preference hook pattern |
| `/src/components/AccountSelector.tsx` | Dropdown menu pattern |
| `/src/components/LoginForm.tsx` | Loading button state pattern |

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

### 3.3 Supported Languages

Based on REQ-327 and cross-referenced documentation:

| Code | Language Name | Native Name | Flag Emoji |
|------|---------------|-------------|------------|
| `en` | English | English | 🇬🇧 or 🇺🇸 |
| `fr` | French | Français | 🇫🇷 |
| `es` | Spanish | Español | 🇪🇸 |
| `de` | German | Deutsch | 🇩🇪 |
| `nl` | Dutch | Nederlands | 🇳🇱 |
| `it` | Italian | Italiano | 🇮🇹 |

### 3.4 Database Schema Reference

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
  /** Optional CSS class for styling */
  className?: string;
  /** Callback when preference is successfully saved */
  onSave?: (language: SupportedLanguage) => void;
  /** Callback when save fails */
  onError?: (error: string) => void;
}
```

### 4.3 Supported Language Type

```typescript
/**
 * Supported language codes
 * Should be placed in /src/types/l10n.ts or TranslationManagement.types.ts
 */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Language option for dropdown
 */
export interface LanguageOption {
  code: SupportedLanguage;
  name: string;        // English name
  nativeName: string;  // Native language name
  flag: string;        // Flag emoji
}

/**
 * Supported languages constant
 */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
```

### 4.4 State Management

```typescript
interface LanguagePreferenceSectionState {
  // Current selection (may differ from saved value)
  selectedLanguage: SupportedLanguage;
  // Original saved value for comparison
  savedLanguage: SupportedLanguage;
  // Loading states
  isLoading: boolean;           // Initial load
  isSaving: boolean;            // Save in progress
  // Feedback
  successMessage: string | null;
  errorMessage: string | null;
  // Dirty state
  isDirty: boolean;             // Has unsaved changes
}
```

---

## 5. Implementation Tasks

### Task 6.1.1: Create Language Types (if not existing)

**File:** `/src/types/l10n.ts` (new file)

**Description:** Create localization type definitions if they don't already exist.

**Content:**
```typescript
// /src/types/l10n.ts
// REQ-327: Language types for localization

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export function isValidLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}
```

### Task 6.1.2: Create Directory Structure

**Action:** Create the LanguagePreference component directory structure:

```bash
mkdir -p src/components/TranslationManagement/LanguagePreference
```

### Task 6.1.3: Create Component Index File

**File:** `/src/components/TranslationManagement/LanguagePreference/index.ts`

**Content:**
```typescript
// /src/components/TranslationManagement/LanguagePreference/index.ts
// REQ-327: LanguagePreference exports

export { LanguagePreferenceSection } from './LanguagePreferenceSection';
export type { LanguagePreferenceSectionProps } from './LanguagePreferenceSection';
```

### Task 6.1.4: Create LanguagePreferenceSection Component

**File:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`

**Implementation Requirements:**

1. **Dropdown Selector:**
   - Show all 6 supported languages
   - Each option displays: flag emoji, native name, English name (in parentheses)
   - Pre-select current user's `preferred_language` value
   - Handle null/undefined preference with fallback to 'en'

2. **Save Button:**
   - Disabled when no changes made (isDirty = false)
   - Show loading spinner during save (Loader2 icon with animate-spin)
   - Text changes: "Save" → "Saving..." during operation

3. **Help Text:**
   - Appears below the dropdown
   - Explains that this preference controls the application interface language

4. **Feedback Messages:**
   - Success: "Language preference saved successfully"
   - Error: "Failed to save language preference. Please try again."
   - Messages auto-dismiss after 3 seconds

5. **Styling:**
   - Follow Airbnb Design Language (colors, spacing, rounded corners)
   - Match `DashboardSettingsPopover.tsx` patterns

**Component Skeleton:**

```typescript
// /src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx
// REQ-327: Language Preference Section Component
// Created: 2026-01-18
// Last Modified: 2026-01-18

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Globe, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  isValidLanguage,
  type SupportedLanguage
} from '@/types/l10n';

export interface LanguagePreferenceSectionProps {
  className?: string;
  onSave?: (language: SupportedLanguage) => void;
  onError?: (error: string) => void;
}

export function LanguagePreferenceSection({
  className = '',
  onSave,
  onError,
}: LanguagePreferenceSectionProps) {
  const { user, currentAccount } = useAuth();

  // State
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [savedLanguage, setSavedLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isDirty = selectedLanguage !== savedLanguage;

  // Load current preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Determine preference source: user or account
        const preference = user.preferred_language || currentAccount?.preferred_language;

        if (preference && isValidLanguage(preference)) {
          setSelectedLanguage(preference);
          setSavedLanguage(preference);
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, [user, currentAccount]);

  // Auto-dismiss messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!user || !isDirty) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/preferences/language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_language: selectedLanguage }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preference');
      }

      setSavedLanguage(selectedLanguage);
      setSuccessMessage('Language preference saved successfully');
      onSave?.(selectedLanguage);

    } catch (error) {
      const errorMsg = 'Failed to save language preference. Please try again.';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsSaving(false);
    }
  }, [user, isDirty, selectedLanguage, onSave, onError]);

  // Get current language option
  const currentLanguageOption = SUPPORTED_LANGUAGES.find(
    lang => lang.code === selectedLanguage
  ) || SUPPORTED_LANGUAGES[0];

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
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-[#222222]" />
        <h3 className="text-base font-semibold text-[#222222]">
          Interface Language
        </h3>
      </div>

      {/* Language Selector */}
      <div className="relative mb-3">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isSaving}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-[#DDDDDD] rounded-lg text-left hover:border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          <span className="flex items-center gap-3">
            <span className="text-xl">{currentLanguageOption.flag}</span>
            <span className="text-[#222222]">
              {currentLanguageOption.nativeName}
              <span className="text-[#717171] ml-1">
                ({currentLanguageOption.name})
              </span>
            </span>
          </span>
          <svg
            className={`w-4 h-4 text-[#717171] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className="absolute z-50 mt-1 w-full bg-white border border-[#DDDDDD] rounded-lg shadow-lg max-h-64 overflow-y-auto"
            role="listbox"
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => {
                  setSelectedLanguage(language.code);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#F7F7F7] transition-colors ${
                  selectedLanguage === language.code ? 'bg-[#F7F7F7]' : ''
                }`}
                role="option"
                aria-selected={selectedLanguage === language.code}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">{language.flag}</span>
                  <span className="text-[#222222]">
                    {language.nativeName}
                    <span className="text-[#717171] ml-1">
                      ({language.name})
                    </span>
                  </span>
                </span>
                {selectedLanguage === language.code && (
                  <Check className="w-4 h-4 text-[#FF385C]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-sm text-[#717171] mb-4">
        This preference controls which language you see throughout the application
        interface, including menus, labels, and system messages.
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

      {/* Feedback Messages */}
      {successMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

export default LanguagePreferenceSection;
```

### Task 6.1.5: Create/Update TranslationManagement Index Export

**File:** `/src/components/TranslationManagement/index.ts`

**Action:** Create or update the main TranslationManagement exports to include LanguagePreferenceSection.

```typescript
// /src/components/TranslationManagement/index.ts
// REQ-327: TranslationManagement exports

export * from './LanguagePreference';
```

---

## 6. API Endpoint (Prerequisite for Task 6.2)

**Note:** Task 6.2 creates the preference API endpoint. However, for Task 6.1 to function, it needs this API. If implementing Task 6.1 first, create a stub or coordinate with Task 6.2.

**Expected Endpoint:** `PUT /api/user/preferences/language`

**Request Body:**
```json
{
  "preferred_language": "fr"
}
```

**Response (Success):**
```json
{
  "success": true,
  "preferred_language": "fr"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Failed to update language preference"
}
```

---

## 7. Authorized Files and Functions for Modification

### 7.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/types/l10n.ts` | Localization type definitions (if not existing) |
| `/src/components/TranslationManagement/LanguagePreference/index.ts` | Component exports |
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Main component |
| `/src/components/TranslationManagement/index.ts` | TranslationManagement module exports |

### 7.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/types/index.ts` | Export l10n types (optional) |

### 7.3 Functions/Components to Create

| Component/Function | Location | Purpose |
|--------------------|----------|---------|
| `LanguagePreferenceSection` | `LanguagePreferenceSection.tsx` | Main preference UI component |
| `SUPPORTED_LANGUAGES` | `/src/types/l10n.ts` | Language configuration constant |
| `isValidLanguage` | `/src/types/l10n.ts` | Type guard for language validation |

---

## 8. Acceptance Criteria Checklist

From REQ-327:

- [ ] Settings section displays language selector dropdown showing all six supported languages
- [ ] Each language option displays flag icon, native language name, and localized label
- [ ] Dropdown shows user's currently saved preferred language when section loads
- [ ] Changing dropdown selection enables the save button
- [ ] Save button displays loading state during save operation
- [ ] Successful save updates user's preferred_language value in the database
- [ ] Successful save displays confirmation message to user
- [ ] Failed save displays error message without losing user's selection
- [ ] Save button returns to disabled state after successful save completes
- [ ] Help text explains that preference controls application interface language
- [ ] Component loads current preference from authenticated user's profile data
- [ ] Component handles missing or invalid preference data gracefully with fallback to default language
- [ ] Component is keyboard accessible with proper focus management for dropdown and button
- [ ] Component provides appropriate ARIA labels for screen readers
- [ ] Component is responsive and usable on tablet and desktop viewports
- [ ] Component styling is consistent with overall settings design system

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
| Keyboard navigation works | Tab, Enter, Escape function |

### 9.2 Integration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| API saves preference correctly | Database updated |
| Preference persists after page reload | Value maintained |
| Works with different user roles | All authenticated users can change |

---

## 10. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API endpoint not ready | Medium | High | Create mock API or coordinate with Task 6.2 |
| l10n types file doesn't exist | Medium | Medium | Create types file as prerequisite task |
| TranslationManagement directory doesn't exist | Medium | Low | Create directory structure first |
| AuthContext doesn't expose preferred_language | Low | Medium | Verify AuthContext has user.preferred_language |

---

## 11. References

- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-327)
- **Related Components:** `DashboardSettingsPopover.tsx`, `AccountSelector.tsx`
- **Database Types:** `/src/lib/supabase.ts`

---

*Document generated for FAQBNB Localization Epic 5 - Task 6.1: Create LanguagePreferenceSection Component*
