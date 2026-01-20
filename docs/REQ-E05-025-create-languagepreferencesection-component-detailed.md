# REQ-E05-025: Create LanguagePreferenceSection Component - Detailed Task Breakdown

**Request ID:** REQ-E05-025
**Title:** Language Preference Section Component
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.1
**Priority:** P2
**Size:** M (Medium)
**Type:** NEW FEATURE

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20 22:15

---

## Executive Summary

This document provides the granular, step-by-step implementation tasks for creating the `LanguagePreferenceSection` component. This component allows property owners to select and save their preferred interface language from within translation management settings. It integrates with the existing `useLanguagePreference` hook (REQ-249) and follows the styling patterns established in `PropertyForm.tsx`.

---

## Prerequisites Verification

Before beginning implementation, verify the following dependencies are in place:

| Dependency | Location | Status | Verification Command |
|------------|----------|--------|---------------------|
| `useLanguagePreference` hook | `/src/hooks/useLanguagePreference.ts` | Complete (REQ-249) | Check file exists with exported hook |
| `LANGUAGE_OPTIONS` array | `/src/hooks/useLanguagePreference.ts` | Complete | Check for exported array with 6 languages |
| `SupportedLanguage` type | `/src/hooks/useLanguagePreference.ts` | Complete | Check for exported type |
| `/api/user/language` endpoint | `/src/app/api/user/language/route.ts` | Complete (REQ-251) | Test PUT request |
| AuthContext | `/src/contexts/AuthContext.ts` | Complete | Check for exported context |

---

## File Structure

```
/src/components/TranslationManagement/
└── LanguagePreference/
    ├── index.ts                          # Barrel export (TASK 1)
    └── LanguagePreferenceSection.tsx     # Main component (TASKS 2-8)

/src/components/TranslationManagement/
└── index.ts                              # Update with export (TASK 9)
```

---

## Detailed Implementation Tasks

### TASK 1: Create Barrel Export File
**File:** `/src/components/TranslationManagement/LanguagePreference/index.ts`
**Estimated Effort:** 5 minutes
**Dependencies:** None

#### Description
Create the barrel export file that will export the LanguagePreferenceSection component and its types.

#### Implementation Steps

1. Create the directory `/src/components/TranslationManagement/LanguagePreference/` if it doesn't exist
2. Create `index.ts` with the following content:

```typescript
// src/components/TranslationManagement/LanguagePreference/index.ts
// REQ-E05-025: LanguagePreference component barrel export
// Created: 2026-01-20

export { LanguagePreferenceSection } from './LanguagePreferenceSection';
export type { LanguagePreferenceSectionProps } from './LanguagePreferenceSection';
```

#### Acceptance Criteria
- [ ] File created at correct path
- [ ] Exports component and props type
- [ ] No TypeScript errors after component is created

---

### TASK 2: Create Component File with Imports and Types
**File:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
**Estimated Effort:** 10 minutes
**Dependencies:** TASK 1

#### Description
Set up the component file structure with necessary imports and TypeScript interface definitions.

#### Implementation Steps

1. Create the file with the following header and imports:

```typescript
// src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx
// REQ-E05-025: Language Preference Section Component
// Created: 2026-01-20
// Last Modified: 2026-01-20

'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import {
  useLanguagePreference,
  SupportedLanguage,
  LANGUAGE_OPTIONS,
} from '@/hooks/useLanguagePreference';
```

2. Define the props interface:

```typescript
/**
 * Props for the LanguagePreferenceSection component
 */
export interface LanguagePreferenceSectionProps {
  /** Optional CSS class name for styling customization */
  className?: string;
  /** Optional callback when language preference is successfully saved */
  onSaveSuccess?: (language: SupportedLanguage) => void;
  /** Optional callback when save fails */
  onSaveError?: (error: string) => void;
}
```

#### Acceptance Criteria
- [ ] File created with 'use client' directive
- [ ] All required imports present
- [ ] Props interface exported with JSDoc comments
- [ ] TypeScript compiles without errors

---

### TASK 3: Implement Component Skeleton with Hook Integration
**File:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
**Estimated Effort:** 15 minutes
**Dependencies:** TASK 2

#### Description
Create the basic component structure integrating with the `useLanguagePreference` hook and managing local state for dirty tracking.

#### Implementation Steps

1. Add the component function with state management:

```typescript
/**
 * LanguagePreferenceSection - A self-contained settings section for selecting
 * and saving the user's preferred interface language.
 *
 * Uses the useLanguagePreference hook for persistence and displays a dropdown
 * selector with all supported languages, a save button with loading states,
 * and help text explaining the setting's purpose.
 *
 * @example
 * ```tsx
 * <LanguagePreferenceSection
 *   onSaveSuccess={(lang) => console.log('Saved:', lang)}
 * />
 * ```
 */
export function LanguagePreferenceSection({
  className = '',
  onSaveSuccess,
  onSaveError,
}: LanguagePreferenceSectionProps): React.JSX.Element {
  // Generate unique IDs for accessibility
  const selectId = useId();
  const helpTextId = useId();
  const errorId = useId();

  // Get language preference state from hook
  const {
    language: savedLanguage,
    setLanguage,
    isLoading,
    isSaving,
    error: hookError,
    clearError,
    supportedLanguages,
  } = useLanguagePreference();

  // Local state for tracking selected value (before save)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(savedLanguage);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync selected language when saved language changes (e.g., on initial load)
  useEffect(() => {
    setSelectedLanguage(savedLanguage);
  }, [savedLanguage]);

  // Clear success message after delay
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Check if there are unsaved changes (dirty state)
  const isDirty = selectedLanguage !== savedLanguage;
  const isDisabled = isLoading || isSaving;

  // ... rest of component
  return <div>Placeholder</div>;
}
```

#### Acceptance Criteria
- [ ] Component function created with proper TypeScript types
- [ ] Hook integration complete with destructured values
- [ ] Local state for selectedLanguage with initial sync
- [ ] Dirty state calculation implemented
- [ ] Success message auto-clear timer implemented

---

### TASK 4: Implement Event Handlers
**File:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
**Estimated Effort:** 15 minutes
**Dependencies:** TASK 3

#### Description
Add event handler functions for dropdown change and save button click.

#### Implementation Steps

1. Add the selection change handler:

```typescript
  /**
   * Handle dropdown selection change
   */
  const handleSelectionChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = event.target.value as SupportedLanguage;
      setSelectedLanguage(newValue);
      // Clear any previous error when user makes a new selection
      if (hookError) {
        clearError();
      }
      // Clear success message when user makes a new selection
      setShowSuccess(false);
    },
    [hookError, clearError]
  );
```

2. Add the save handler:

```typescript
  /**
   * Handle save button click
   */
  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return;

    try {
      await setLanguage(selectedLanguage);
      setShowSuccess(true);
      onSaveSuccess?.(selectedLanguage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preference';
      onSaveError?.(errorMessage);
    }
  }, [isDirty, isSaving, selectedLanguage, setLanguage, onSaveSuccess, onSaveError]);
```

#### Acceptance Criteria
- [ ] handleSelectionChange updates local state and clears errors
- [ ] handleSave calls hook's setLanguage function
- [ ] handleSave triggers onSaveSuccess callback on success
- [ ] handleSave handles errors and triggers onSaveError callback
- [ ] Both handlers wrapped in useCallback for performance

---

### TASK 5: Implement Loading Skeleton State
**File:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
**Estimated Effort:** 10 minutes
**Dependencies:** TASK 4

#### Description
Add the loading skeleton UI that displays during initial preference fetch.

#### Implementation Steps

1. Add the loading state check and skeleton JSX:

```typescript
  // Show loading skeleton during initial fetch
  if (isLoading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
        <div className="animate-pulse">
          {/* Section header skeleton */}
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          {/* Label skeleton */}
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          {/* Select dropdown skeleton */}
          <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
          {/* Help text skeleton */}
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          {/* Button skeleton */}
          <div className="flex justify-end">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }
```

#### Acceptance Criteria
- [ ] Loading skeleton matches the component layout structure
- [ ] Uses animate-pulse Tailwind class for shimmer effect
- [ ] Skeleton shows during isLoading state
- [ ] Passes className prop to container

---

### TASK 6: Implement Main Component JSX Structure
**File:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
**Estimated Effort:** 25 minutes
**Dependencies:** TASK 5

#### Description
Build the main component UI with section header, dropdown selector, help text, and save button following PropertyForm styling patterns.

#### Implementation Steps

1. Replace the placeholder return with the full JSX:

```typescript
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      {/* Section Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Language Preference
      </h3>

      {/* Language Selector */}
      <div className="mb-4">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Interface Language
        </label>
        <select
          id={selectId}
          value={selectedLanguage}
          onChange={handleSelectionChange}
          disabled={isDisabled}
          aria-describedby={`${helpTextId} ${hookError ? errorId : ''}`}
          aria-busy={isSaving}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${hookError ? 'border-red-300' : 'border-gray-300'}`}
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name} ({lang.nativeName})
            </option>
          ))}
        </select>

        {/* Help Text */}
        <p id={helpTextId} className="mt-2 text-sm text-gray-500">
          This setting controls the language of your dashboard interface.
          Guest-facing content translations are managed separately.
        </p>
      </div>

      {/* Error Message */}
      {hookError && (
        <div
          id={errorId}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center justify-between"
          role="alert"
        >
          <p className="text-sm text-red-600">{hookError}</p>
          <button
            type="button"
            onClick={clearError}
            className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-green-600">
            Language preference saved successfully.
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isDisabled}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!isDirty || isDisabled
              ? 'bg-blue-400'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            'Save Preference'
          )}
        </button>
      </div>
    </div>
  );
```

#### Acceptance Criteria
- [ ] Section container uses bg-white p-6 rounded-lg shadow-sm border styling
- [ ] Section header uses text-lg font-semibold text-gray-900 mb-4
- [ ] Label properly associated with select via htmlFor and id
- [ ] Select shows all 6 languages with flag, name, and native name
- [ ] Help text displayed below dropdown with muted styling
- [ ] Error message displays with red styling and dismiss button
- [ ] Success message displays with green styling and auto-dismisses
- [ ] Save button disabled when no changes or during save
- [ ] Loading spinner shown in button during save operation

---

### TASK 7: Add Accessibility Attributes
**File:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
**Estimated Effort:** 10 minutes
**Dependencies:** TASK 6

#### Description
Ensure all accessibility requirements are met with proper ARIA attributes and semantic HTML.

#### Implementation Steps

1. Verify the following accessibility features are in place (from TASK 6):
   - `htmlFor` attribute on label matches `id` on select
   - `aria-describedby` links select to help text and error message
   - `aria-busy` on select indicates saving state
   - `role="alert"` on error message for screen reader announcement
   - `role="status"` and `aria-live="polite"` on success message
   - `aria-label` on dismiss button
   - `aria-hidden="true"` on decorative spinner SVG

2. Add additional semantic improvements if needed:

```typescript
// In the select element, add:
aria-invalid={!!hookError}

// In the save button, consider adding:
aria-disabled={!isDirty || isDisabled}
```

#### Acceptance Criteria
- [ ] Label properly linked to select with htmlFor/id pair
- [ ] Help text associated via aria-describedby
- [ ] Error state announced via role="alert"
- [ ] Success message uses aria-live="polite"
- [ ] Keyboard navigation works correctly (native select behavior)
- [ ] Focus visible on all interactive elements

---

### TASK 8: Add Default Export and Final Cleanup
**File:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
**Estimated Effort:** 5 minutes
**Dependencies:** TASK 7

#### Description
Add default export and perform final code cleanup and documentation.

#### Implementation Steps

1. Add default export at end of file:

```typescript
export default LanguagePreferenceSection;
```

2. Ensure file has complete JSDoc comments on the component function

3. Verify all imports are used (remove any unused imports)

4. Run TypeScript compiler to verify no errors

#### Acceptance Criteria
- [ ] Default export present
- [ ] No unused imports
- [ ] All TypeScript types properly defined
- [ ] Component compiles without errors

---

### TASK 9: Update TranslationManagement Barrel Export
**File:** `/src/components/TranslationManagement/index.ts`
**Estimated Effort:** 5 minutes
**Dependencies:** TASK 8

#### Description
Update the TranslationManagement barrel export to include the new LanguagePreference component.

#### Implementation Steps

1. Check if `/src/components/TranslationManagement/index.ts` exists

2. If it exists, add the export line:

```typescript
export * from './LanguagePreference';
```

3. If it doesn't exist, create it with all necessary exports:

```typescript
// src/components/TranslationManagement/index.ts
// TranslationManagement component barrel exports
// Last Modified: 2026-01-20

export * from './LanguagePreference';
// Future exports will be added here as components are created
```

#### Acceptance Criteria
- [ ] LanguagePreference exported from TranslationManagement barrel
- [ ] Import `{ LanguagePreferenceSection } from '@/components/TranslationManagement'` works
- [ ] No circular dependency errors

---

### TASK 10: Create Unit Test File
**File:** `/src/components/TranslationManagement/LanguagePreference/__tests__/LanguagePreferenceSection.test.tsx`
**Estimated Effort:** 30 minutes
**Dependencies:** TASK 9
**Optional:** Yes (can be deferred)

#### Description
Create unit tests for the LanguagePreferenceSection component covering rendering, interactions, and edge cases.

#### Implementation Steps

1. Create test file with the following test cases:

```typescript
// src/components/TranslationManagement/LanguagePreference/__tests__/LanguagePreferenceSection.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguagePreferenceSection } from '../LanguagePreferenceSection';

// Mock the useLanguagePreference hook
jest.mock('@/hooks/useLanguagePreference', () => ({
  useLanguagePreference: jest.fn(),
  LANGUAGE_OPTIONS: [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    // ... other languages
  ],
}));

describe('LanguagePreferenceSection', () => {
  // Test: renders loading skeleton
  // Test: renders with initial language from hook
  // Test: dropdown displays all 6 languages
  // Test: save button disabled when no changes
  // Test: save button enabled when selection changes
  // Test: save button shows loading state during save
  // Test: error message displays on save failure
  // Test: success message displays after successful save
  // Test: error clears when dismissed
  // Test: onSaveSuccess callback fires on success
  // Test: onSaveError callback fires on error
});
```

#### Acceptance Criteria
- [ ] Test file created with proper mocking
- [ ] Tests cover loading state
- [ ] Tests cover dropdown rendering with all languages
- [ ] Tests cover save button state management
- [ ] Tests cover error and success message display
- [ ] Tests cover callback invocation

---

## Complete Code Listing

### Final LanguagePreferenceSection.tsx

```typescript
// src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx
// REQ-E05-025: Language Preference Section Component
// Created: 2026-01-20
// Last Modified: 2026-01-20

'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import {
  useLanguagePreference,
  SupportedLanguage,
} from '@/hooks/useLanguagePreference';

/**
 * Props for the LanguagePreferenceSection component
 */
export interface LanguagePreferenceSectionProps {
  /** Optional CSS class name for styling customization */
  className?: string;
  /** Optional callback when language preference is successfully saved */
  onSaveSuccess?: (language: SupportedLanguage) => void;
  /** Optional callback when save fails */
  onSaveError?: (error: string) => void;
}

/**
 * LanguagePreferenceSection - A self-contained settings section for selecting
 * and saving the user's preferred interface language.
 *
 * Uses the useLanguagePreference hook for persistence and displays a dropdown
 * selector with all supported languages, a save button with loading states,
 * and help text explaining the setting's purpose.
 *
 * @example
 * ```tsx
 * <LanguagePreferenceSection
 *   onSaveSuccess={(lang) => console.log('Saved:', lang)}
 * />
 * ```
 */
export function LanguagePreferenceSection({
  className = '',
  onSaveSuccess,
  onSaveError,
}: LanguagePreferenceSectionProps): React.JSX.Element {
  // Generate unique IDs for accessibility
  const selectId = useId();
  const helpTextId = useId();
  const errorId = useId();

  // Get language preference state from hook
  const {
    language: savedLanguage,
    setLanguage,
    isLoading,
    isSaving,
    error: hookError,
    clearError,
    supportedLanguages,
  } = useLanguagePreference();

  // Local state for tracking selected value (before save)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(savedLanguage);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync selected language when saved language changes (e.g., on initial load)
  useEffect(() => {
    setSelectedLanguage(savedLanguage);
  }, [savedLanguage]);

  // Clear success message after delay
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Check if there are unsaved changes (dirty state)
  const isDirty = selectedLanguage !== savedLanguage;
  const isDisabled = isLoading || isSaving;

  /**
   * Handle dropdown selection change
   */
  const handleSelectionChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = event.target.value as SupportedLanguage;
      setSelectedLanguage(newValue);
      // Clear any previous error when user makes a new selection
      if (hookError) {
        clearError();
      }
      // Clear success message when user makes a new selection
      setShowSuccess(false);
    },
    [hookError, clearError]
  );

  /**
   * Handle save button click
   */
  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return;

    try {
      await setLanguage(selectedLanguage);
      setShowSuccess(true);
      onSaveSuccess?.(selectedLanguage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preference';
      onSaveError?.(errorMessage);
    }
  }, [isDirty, isSaving, selectedLanguage, setLanguage, onSaveSuccess, onSaveError]);

  // Show loading skeleton during initial fetch
  if (isLoading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
        <div className="animate-pulse">
          {/* Section header skeleton */}
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          {/* Label skeleton */}
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          {/* Select dropdown skeleton */}
          <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
          {/* Help text skeleton */}
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          {/* Button skeleton */}
          <div className="flex justify-end">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      {/* Section Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Language Preference
      </h3>

      {/* Language Selector */}
      <div className="mb-4">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Interface Language
        </label>
        <select
          id={selectId}
          value={selectedLanguage}
          onChange={handleSelectionChange}
          disabled={isDisabled}
          aria-describedby={`${helpTextId}${hookError ? ` ${errorId}` : ''}`}
          aria-busy={isSaving}
          aria-invalid={!!hookError}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${hookError ? 'border-red-300' : 'border-gray-300'}`}
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name} ({lang.nativeName})
            </option>
          ))}
        </select>

        {/* Help Text */}
        <p id={helpTextId} className="mt-2 text-sm text-gray-500">
          This setting controls the language of your dashboard interface.
          Guest-facing content translations are managed separately.
        </p>
      </div>

      {/* Error Message */}
      {hookError && (
        <div
          id={errorId}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center justify-between"
          role="alert"
        >
          <p className="text-sm text-red-600">{hookError}</p>
          <button
            type="button"
            onClick={clearError}
            className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-green-600">
            Language preference saved successfully.
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isDisabled}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!isDirty || isDisabled
              ? 'bg-blue-400'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            'Save Preference'
          )}
        </button>
      </div>
    </div>
  );
}

export default LanguagePreferenceSection;
```

---

## Verification Checklist

After completing all tasks, verify the following:

### Build Verification
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run lint` - no linting errors
- [ ] Run `npm run type-check` - no TypeScript errors

### Visual Verification
- [ ] Component renders with correct styling matching PropertyForm pattern
- [ ] Loading skeleton displays during initial load
- [ ] Dropdown shows all 6 languages with flags
- [ ] Save button disabled when no changes
- [ ] Save button shows spinner during save
- [ ] Error message displays with dismiss button
- [ ] Success message displays and auto-dismisses

### Functional Verification
- [ ] Selecting a new language updates local state
- [ ] Save button enables after selection change
- [ ] Clicking Save calls API and persists preference
- [ ] Language change takes effect immediately after save
- [ ] Error handling works on API failure
- [ ] Error clears when dismissed or on retry

### Accessibility Verification
- [ ] Tab key navigates through controls
- [ ] Screen reader announces labels and help text
- [ ] Error messages announced via role="alert"
- [ ] Focus visible on all interactive elements

---

## Acceptance Criteria Traceability

| Acceptance Criteria (from REQ-E05-026) | Task | Implementation |
|---------------------------------------|------|----------------|
| Component renders as a self-contained settings section | TASK 6 | Container div with border, padding, shadow matching design system |
| Section header displays descriptive title | TASK 6 | "Language Preference" h3 header |
| Dropdown displays all six supported languages | TASK 6 | Uses supportedLanguages from hook (EN, FR, ES, DE, NL, IT) |
| Each dropdown option displays language name with flag | TASK 6 | Option format: `🇫🇷 French (Français)` |
| Dropdown selection persists until saved | TASK 3 | Local selectedLanguage state |
| Save button shows loading state during save | TASK 6 | Spinner and "Saving..." text when isSaving |
| Save button disabled during operation | TASK 6 | `disabled={!isDirty \|\| isDisabled}` |
| Save button disabled when no changes | TASK 6 | isDirty check |
| Success notification displays after save | TASK 6 | Green success message with auto-dismiss |
| Error notification displays with actionable message | TASK 6 | Red error message with dismiss button |
| Help text explains setting purpose | TASK 6 | Static help text below dropdown |
| Component fetches current preference on mount | TASK 3 | useLanguagePreference hook handles this |
| Loading skeleton during initial fetch | TASK 5 | Skeleton shown when isLoading is true |
| Handles invalid stored preferences | TASK 3 | Hook provides fallback to DEFAULT_LANGUAGE |
| Integrates with account preferences API | TASK 3 | Hook calls `/api/user/language` PUT endpoint |
| Language change takes effect immediately | TASK 4 | Hook dispatches `languageChange` event |
| Fully keyboard accessible | TASK 7 | Native select + button keyboard support |
| Includes ARIA labels | TASK 7 | Proper aria-* attributes |
| Responsive for mobile viewports | TASK 6 | Tailwind responsive classes (w-full) |
| Matches design system | TASK 6 | Follows PropertyForm styling patterns |
| Can be integrated into account settings | TASK 9 | Exported as standalone component |

---

## References

- Overview Document: `/docs/REQ-E05-025-create-languagepreferencesection-component-overview.md`
- Request Document: `/docs/gen_requests_epic5.md` (REQ-E05-026)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Hook Reference: `/src/hooks/useLanguagePreference.ts`
- Styling Pattern Reference: `/src/components/PropertyForm.tsx`
- API Endpoint: `/src/app/api/user/language/route.ts`

---

*Document generated for FAQBNB L10N Epic 5 - Phase 6, Task 6.1*
