# REQ-E05-025: Create LanguagePreferenceSection Component - Implementation Breakdown

**Request ID**: REQ-E05-025
**Epic**: Epic 5 - Owner Translation Management
**Phase**: Phase 6 - Language Preference Setting
**Task**: Task 6.1 - Create LanguagePreferenceSection component
**Created**: 2026-01-22 20:21
**Status**: PENDING

---

## Goal

Create a reusable UI component that enables property owners to select and save their preferred language for content display and translation management. The component provides a dropdown selector for all supported languages, a save button with loading state, contextual help text, and success/error feedback.

---

## Implementation Plan

### Step 1: Create Component Types File

**File**: `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.types.ts` (NEW)

**Rationale**: Define TypeScript interfaces for props and state before implementation to ensure type safety.

**Implementation**:

```typescript
/**
 * LanguagePreferenceSection Component Types
 *
 * REQ-E05-025: Create LanguagePreferenceSection Component
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.1
 *
 * @created 2026-01-22 20:21
 */

export interface LanguageOption {
  /** ISO language code (e.g., 'en', 'fr', 'de') */
  code: string;
  /** Display name (e.g., 'English', 'French', 'German') */
  name: string;
  /** Native name (e.g., 'English', 'Français', 'Deutsch') */
  nativeName?: string;
}

export interface LanguagePreferenceSectionProps {
  /** Currently saved language preference code */
  currentLanguage: string | null;
  /** List of available languages to choose from */
  availableLanguages: LanguageOption[];
  /** Callback when preference is saved successfully */
  onSave: (languageCode: string) => Promise<void>;
  /** Optional: Disable interaction (e.g., during page load) */
  disabled?: boolean;
  /** Optional: Additional CSS classes */
  className?: string;
}

export interface LanguagePreferenceSectionState {
  /** Currently selected language in dropdown (may differ from saved) */
  selectedLanguage: string;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Error message if save failed */
  error: string | null;
  /** Success message after save */
  successMessage: string | null;
}
```

**Estimated Effort**: 15 minutes

---

### Step 2: Create Component Implementation

**File**: `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` (NEW)

**Rationale**: Main component implementation following existing patterns from ReadOnlyContextSection and other section components.

**Implementation**:

```typescript
'use client';

/**
 * LanguagePreferenceSection Component
 *
 * REQ-E05-025: Create LanguagePreferenceSection Component
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.1
 *
 * Allows property owners to select and save their preferred language
 * for content display and translation management.
 *
 * @created 2026-01-22 20:21
 */

import { useState, useCallback, useEffect } from 'react';
import { Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LanguagePreferenceSectionProps } from './LanguagePreferenceSection.types';

export function LanguagePreferenceSection({
  currentLanguage,
  availableLanguages,
  onSave,
  disabled = false,
  className,
}: LanguagePreferenceSectionProps) {
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    currentLanguage || availableLanguages[0]?.code || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync selected language when currentLanguage prop changes
  useEffect(() => {
    if (currentLanguage) {
      setSelectedLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!selectedLanguage || isSaving || disabled) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onSave(selectedLanguage);
      setSuccessMessage('Language preference saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preference');
    } finally {
      setIsSaving(false);
    }
  }, [selectedLanguage, isSaving, disabled, onSave]);

  // Detect if changes have been made
  const hasChanges = selectedLanguage !== currentLanguage;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Language Preference</h3>
      </div>

      {/* Help Text */}
      <p className="text-sm text-gray-600">
        Select your preferred language for viewing and managing content.
        This setting determines the default language displayed when viewing
        translations and which language is prioritized in translation workflows.
      </p>

      {/* Language Selector and Save Button */}
      <div className="flex items-center gap-3">
        <select
          value={selectedLanguage}
          onChange={(e) => {
            setSelectedLanguage(e.target.value);
            setError(null);
            setSuccessMessage(null);
          }}
          disabled={disabled || isSaving}
          className={cn(
            'flex-1 max-w-xs px-3 py-2 border rounded-md',
            'text-gray-900 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent',
            'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
          )}
          aria-label="Select language preference"
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
              {lang.nativeName && lang.nativeName !== lang.name && ` (${lang.nativeName})`}
            </option>
          ))}
        </select>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={disabled || isSaving || !hasChanges}
          className={cn(
            'px-4 py-2 rounded-md font-medium text-sm',
            'transition-colors duration-200',
            hasChanges && !disabled && !isSaving
              ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          )}
          aria-label={isSaving ? 'Saving preference' : 'Save language preference'}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Save'
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600" role="alert">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 text-sm text-green-600" role="status">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default LanguagePreferenceSection;
```

**Key Design Decisions**:
- Follows existing section component pattern (see ReadOnlyContextSection.tsx)
- Uses Tailwind utility classes via `cn()` helper
- Save button disabled when no changes (UX best practice)
- Auto-clears success message after 3 seconds
- Lucide React icons for consistency with existing components
- ARIA labels for accessibility

**Estimated Effort**: 2-3 hours

---

### Step 3: Create Component Index File

**File**: `/src/components/TranslationManagement/LanguagePreference/index.ts` (NEW)

**Rationale**: Export component and types for clean imports elsewhere in the codebase.

**Implementation**:

```typescript
/**
 * LanguagePreference Module Exports
 *
 * REQ-E05-025: Create LanguagePreferenceSection Component
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.1
 *
 * @created 2026-01-22 20:21
 */

export { LanguagePreferenceSection } from './LanguagePreferenceSection';
export type {
  LanguagePreferenceSectionProps,
  LanguageOption,
  LanguagePreferenceSectionState,
} from './LanguagePreferenceSection.types';
```

**Estimated Effort**: 5 minutes

---

### Step 4: Create Language Configuration Helper

**File**: `/src/lib/i18n/language-options.ts` (NEW)

**Rationale**: Centralized helper to convert existing locale metadata to LanguageOption format for the component.

**Implementation**:

```typescript
/**
 * Language Options Helper
 *
 * REQ-E05-025: Create LanguagePreferenceSection Component
 * Converts localeMetadata to LanguageOption format for UI components.
 *
 * @created 2026-01-22 20:21
 */

import { localeMetadata, type SupportedLocale } from './config';
import type { LanguageOption } from '@/components/TranslationManagement/LanguagePreference';

/**
 * Get all supported languages as LanguageOption array
 * Suitable for use in language selection dropdowns
 *
 * @returns Array of LanguageOption objects
 */
export function getLanguageOptions(): LanguageOption[] {
  return Object.values(localeMetadata).map((meta) => ({
    code: meta.code,
    name: meta.name,
    nativeName: meta.nativeName,
  }));
}

/**
 * Get a single LanguageOption by locale code
 *
 * @param code - ISO language code (e.g., 'en', 'fr')
 * @returns LanguageOption or null if not found
 */
export function getLanguageOption(code: string): LanguageOption | null {
  const meta = localeMetadata[code as SupportedLocale];
  if (!meta) return null;

  return {
    code: meta.code,
    name: meta.name,
    nativeName: meta.nativeName,
  };
}
```

**Estimated Effort**: 30 minutes

---

### Step 5: Update i18n Module Index

**File**: `/src/lib/i18n/index.ts`

**Rationale**: Export new helper functions for easy access throughout the codebase.

**Implementation**:

Add to existing exports:

```typescript
// Existing exports...
export * from './config';
export * from './language-detection';
export * from './datetime-formatting';
export * from './error-translations';

// NEW: Language options helper
export * from './language-options';
```

**Estimated Effort**: 5 minutes

---

### Step 6: Add Unit Tests

**File**: `/src/components/TranslationManagement/LanguagePreference/__tests__/LanguagePreferenceSection.test.tsx` (NEW)

**Rationale**: Ensure component behavior matches requirements and handles edge cases.

**Test Cases**:
1. Renders with initial language selected from `currentLanguage` prop
2. Renders with first language if `currentLanguage` is null
3. Save button disabled when no changes made
4. Save button enabled when language selection changes
5. Save button disabled during save operation
6. Shows loading spinner during save operation
7. Calls `onSave` with selected language code when Save clicked
8. Displays success message after successful save
9. Clears success message after 3 seconds
10. Displays error message when save fails
11. Save button disabled when `disabled` prop is true
12. Handles empty `availableLanguages` array gracefully
13. Language selector shows both name and native name correctly
14. Dropdown changes clear previous error/success messages
15. Component respects ARIA labels for accessibility

**Estimated Effort**: 2-3 hours

---

### Step 7: Create Integration Example (Optional Documentation)

**File**: `/src/components/TranslationManagement/LanguagePreference/README.md` (NEW)

**Rationale**: Document usage patterns for other developers.

**Content**:

```markdown
# LanguagePreferenceSection Component

REQ-E05-025: Owner language preference selector for translation management.

## Usage

```typescript
import { LanguagePreferenceSection } from '@/components/TranslationManagement/LanguagePreference';
import { getLanguageOptions } from '@/lib/i18n';

function SettingsPage() {
  const [userLanguage, setUserLanguage] = useState('en');

  const handleSave = async (languageCode: string) => {
    const response = await fetch('/api/accounts/[accountId]/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredLanguage: languageCode }),
    });

    if (!response.ok) {
      throw new Error('Failed to save preference');
    }

    setUserLanguage(languageCode);
  };

  return (
    <LanguagePreferenceSection
      currentLanguage={userLanguage}
      availableLanguages={getLanguageOptions()}
      onSave={handleSave}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentLanguage` | `string \| null` | Yes | Currently saved language code |
| `availableLanguages` | `LanguageOption[]` | Yes | List of available languages |
| `onSave` | `(code: string) => Promise<void>` | Yes | Save handler callback |
| `disabled` | `boolean` | No | Disable all interactions |
| `className` | `string` | No | Additional CSS classes |

## Features

- **Smart Save Button**: Only enabled when changes are made
- **Auto-clear Success**: Success message disappears after 3 seconds
- **Loading State**: Shows spinner during save operation
- **Error Handling**: Displays error messages from failed saves
- **Accessibility**: Proper ARIA labels for screen readers
```

**Estimated Effort**: 30 minutes

---

### Step 8: Manual QA Testing

**Rationale**: Verify all acceptance criteria before considering complete.

**Test Scenarios**:

1. **Initial Render**:
   - Component displays with language dropdown
   - Current language is pre-selected
   - Save button is disabled (no changes)
   - ✅ Help text is visible and clear

2. **Language Selection**:
   - Change dropdown to different language
   - ✅ Save button becomes enabled
   - ✅ No auto-save occurs (explicit save required)

3. **Save Operation - Success**:
   - Click Save button
   - ✅ Button shows "Saving..." with spinner
   - ✅ Button is disabled during save
   - ✅ Success message appears after save completes
   - ✅ Success message disappears after 3 seconds
   - ✅ Save button becomes disabled again (no changes)

4. **Save Operation - Failure**:
   - Simulate API error (e.g., network failure)
   - Click Save
   - ✅ Error message displays with clear text
   - ✅ Error persists until user makes another change

5. **Edge Cases**:
   - Pass `currentLanguage: null` (new user)
   - ✅ Component selects first available language
   - Pass empty `availableLanguages` array
   - ✅ Component handles gracefully (empty dropdown, disabled save)

6. **Disabled State**:
   - Pass `disabled: true` prop
   - ✅ Dropdown is disabled
   - ✅ Save button is disabled
   - ✅ Visual indication of disabled state

7. **Accessibility**:
   - Tab through component with keyboard
   - ✅ Dropdown is keyboard-navigable
   - ✅ Save button is keyboard-activatable
   - ✅ ARIA labels present for screen readers
   - ✅ Error/success messages have proper roles

8. **Responsive Design**:
   - View on mobile (< 640px)
   - ✅ Layout remains usable
   - ✅ Dropdown doesn't overflow
   - ✅ Button text visible

**Estimated Effort**: 1-2 hours

---

## Authorized Files for Modification

### New Files to Create
1. `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` - Main component
2. `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.types.ts` - TypeScript types
3. `/src/components/TranslationManagement/LanguagePreference/index.ts` - Module exports
4. `/src/lib/i18n/language-options.ts` - Helper to convert locale metadata to LanguageOption
5. `/src/components/TranslationManagement/LanguagePreference/__tests__/LanguagePreferenceSection.test.tsx` - Unit tests
6. `/src/components/TranslationManagement/LanguagePreference/README.md` - Usage documentation (optional)

### Existing Files to Modify
1. `/src/lib/i18n/index.ts` - Add export for `language-options` module

### Files to Reference (No Changes)
- `/src/lib/i18n/config.ts` - Source of truth for localeMetadata
- `/src/lib/utils.ts` - `cn()` utility for className merging
- `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` - Pattern reference for section components

---

## Dependencies

### Required (Must Exist First)
- **Epic 1 - L10N Foundation**: `/src/lib/i18n/config.ts` with localeMetadata ✅ (exists)
- **Lucide React**: Icons (Globe, Check, AlertCircle, Loader2) ✅ (installed)
- **Tailwind CSS**: Utility classes via `cn()` helper ✅ (configured)
- **React 18+**: Hooks (useState, useCallback, useEffect) ✅ (installed)

### Optional (Can Be Added Later)
- **REQ-E05-026**: Account Preference API Endpoint - Required for actual persistence (different task)
- **Translation Management Page**: Where this component will be integrated (different task)

### No External API Dependencies
This component is purely presentational and accepts `onSave` callback prop. The parent component is responsible for API communication.

---

## Technical Risks

### 1. Empty availableLanguages Array
**Risk**: Component may crash or display incorrectly if `availableLanguages` is empty.

**Mitigation**:
- Component sets `selectedLanguage` to empty string if array is empty
- Dropdown renders empty (no options)
- Save button remains disabled
- Unit tests cover this edge case

**Impact**: Low - Should never occur in production if `getLanguageOptions()` is used.

---

### 2. currentLanguage Not in availableLanguages
**Risk**: If `currentLanguage` is a code not present in `availableLanguages` (e.g., deprecated language), component may behave unexpectedly.

**Mitigation**:
- useEffect syncs `selectedLanguage` only if `currentLanguage` is truthy
- If mismatch occurs, dropdown will show the invalid code initially but user can change it
- Consider adding validation: `availableLanguages.some(lang => lang.code === currentLanguage)`

**Impact**: Low - Unlikely scenario, but worth handling in production code.

**Recommended Enhancement**:
```typescript
useEffect(() => {
  if (currentLanguage && availableLanguages.some(lang => lang.code === currentLanguage)) {
    setSelectedLanguage(currentLanguage);
  } else if (availableLanguages.length > 0) {
    setSelectedLanguage(availableLanguages[0].code);
  }
}, [currentLanguage, availableLanguages]);
```

---

### 3. Success Message Auto-Clear Timing
**Risk**: User may not see success message if they look away during the 3-second window.

**Mitigation**:
- 3 seconds is standard UX practice
- Message is prominent (green with checkmark icon)
- Consider adding subtle toast notification as alternative (future enhancement)

**Impact**: Very Low - Standard pattern across web applications.

---

### 4. Concurrent Save Attempts
**Risk**: User rapidly clicks Save multiple times, potentially causing race conditions.

**Mitigation**:
- `isSaving` state disables Save button during operation
- `handleSave` checks `isSaving` and returns early if true
- No async race conditions possible with current implementation

**Impact**: None - Properly handled.

---

## Out of Scope

### 1. API Endpoint Implementation
This task creates the UI component only. The actual API endpoint for persisting preferences is covered in **REQ-E05-026: Create Account Preference API Endpoint**.

**Rationale**: Separation of concerns - UI and API can be developed/tested independently.

---

### 2. Integration into Specific Pages
This component is reusable and can be integrated into various pages (Settings, Translation Management Dashboard, Profile). The integration points are out of scope for this task.

**Future Integration Points**:
- Translation Management Page (likely primary usage)
- User Settings/Profile Page
- Account Settings Page

---

### 3. Internationalization of Component Text
The component currently uses hardcoded English strings for labels, help text, and messages. i18n support is deferred.

**Current Hardcoded Strings**:
- "Language Preference" (heading)
- Help text paragraph
- "Save" button text
- "Saving..." loading text
- "Language preference saved" success message
- "Failed to save preference" error message

**Future Enhancement**: Add next-intl translation keys:
```json
{
  "translationManagement": {
    "languagePreference": {
      "heading": "Language Preference",
      "helpText": "Select your preferred language...",
      "save": "Save",
      "saving": "Saving...",
      "success": "Language preference saved",
      "error": "Failed to save preference"
    }
  }
}
```

**Rationale**: Postpone until Epic 5 is complete and i18n patterns for translation management are established.

---

### 4. Persistence to User vs Account
This component is agnostic to where the preference is stored (user settings vs account settings). The `onSave` callback determines the persistence strategy.

**Consideration**: Epic 5 spec mentions "account preferences" but may also apply to individual users. This decision is made by the parent component implementing `onSave`.

---

### 5. Language Preference Application Logic
This component does NOT implement logic to actually apply the language preference (e.g., filtering content, prioritizing translations). It only provides the UI for selection and saving.

**Application Logic** (out of scope):
- Using preference to filter Translation Management table
- Pre-selecting preferred language in bulk operations
- Displaying translated content in preferred language

These features are handled by other components that consume the saved preference.

---

### 6. Migration of Existing User Preferences
If users already have language preferences stored in a different format or location, data migration is out of scope.

**Rationale**: This is a database/infrastructure concern, not a UI component task.

---

## Notes

### Design Consistency
Component follows established patterns:
- **Section Layout**: Similar to ReadOnlyContextSection with `space-y-4` container
- **Icon + Heading**: Globe icon + "Language Preference" text
- **Airbnb Brand Colors**: `#FF385C` (primary red), `#E31C5F` (hover state)
- **Gray Palette**: text-gray-900, text-gray-600, bg-gray-50, border-gray-200
- **Status Colors**: red-600 (error), green-600 (success)

### Accessibility Compliance
- Semantic HTML: `<select>`, `<button>`, `<div>` with proper roles
- ARIA labels: `aria-label` on select and button for screen readers
- ARIA roles: `role="alert"` for errors, `role="status"` for success
- Keyboard navigation: All interactive elements are keyboard-accessible
- Color contrast: Meets WCAG AA standards

### Performance Considerations
- **Re-render Optimization**: `useCallback` for `handleSave` prevents unnecessary re-renders
- **Controlled Component**: Dropdown is controlled via `selectedLanguage` state
- **No Unnecessary API Calls**: Save only triggered on explicit button click

### Language Code Consistency
Codebase uses ISO 639-1 codes: `en`, `fr`, `es`, `de`, `nl`, `it` (Italian, NOT Portuguese).
Source of truth: `/src/lib/i18n/config.ts` line 19.

---

## Estimated Effort

**Total**: 6-9 hours

**Breakdown**:
- Step 1 (Types file): 15 minutes
- Step 2 (Component implementation): 2-3 hours
- Step 3 (Index file): 5 minutes
- Step 4 (Language options helper): 30 minutes
- Step 5 (Update i18n index): 5 minutes
- Step 6 (Unit tests): 2-3 hours
- Step 7 (Documentation): 30 minutes (optional)
- Step 8 (Manual QA): 1-2 hours

**Confidence Level**: High - Component is straightforward with clear requirements.

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ Component file created at specified path
2. ✅ Types file created with all interfaces
3. ✅ Index file exports component and types
4. ✅ Dropdown displays all available languages from `availableLanguages` prop
5. ✅ Currently saved language is pre-selected in dropdown
6. ✅ Changing dropdown does NOT auto-save (requires Save button)
7. ✅ Save button disabled when no changes made
8. ✅ Save button disabled during save operation
9. ✅ Loading spinner appears during save operation
10. ✅ Success message displays for 3 seconds after successful save
11. ✅ Error message displays when save fails
12. ✅ Help text explains purpose of language preference
13. ✅ Component respects `disabled` prop
14. ✅ Component uses consistent Tailwind styling
15. ✅ Component is accessible (ARIA labels, keyboard navigation)
16. ✅ No TypeScript compilation errors
17. ✅ No ESLint warnings
18. ✅ Component handles edge cases (empty array, null currentLanguage)
19. ✅ All unit tests pass
20. ✅ Manual QA scenarios complete successfully

---

**Document Status**: PENDING
**Last Updated**: 2026-01-22 20:21
**Author**: Technical Lead
**Review Status**: Awaiting Implementation
