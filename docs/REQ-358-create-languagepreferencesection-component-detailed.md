# REQ-358: Create LanguagePreferenceSection Component - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Reference:** REQ-358 (Epic 5 - Owner Translation Management)
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.1
**Overview Document:** `/docs/REQ-358-create-languagepreferencesection-component-overview.md`
**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Executive Summary

This document provides granular, actionable implementation tasks for REQ-358: Create LanguagePreferenceSection Component. The component enables property owners to select and save their preferred interface language through a dropdown selector with flag icons, native names, help text, and visual feedback. The component leverages existing infrastructure from Epic 1 (Foundation), specifically the `useLanguagePreference` hook and the `/api/user/language` API endpoint.

**Estimated Story Points:** 3-5 (M-sized feature)
**Dependencies:** Epic 1 Foundation complete (REQ-225, REQ-249, REQ-251)

---

## Pre-Implementation Checklist

Before starting implementation, verify the following dependencies exist:

| Dependency | File Location | Status |
|------------|---------------|--------|
| `useLanguagePreference` hook | `/src/hooks/useLanguagePreference.ts` | ✅ Exists |
| `SUPPORTED_LOCALES` constant | `/src/components/LanguageSwitcher/constants.ts` | ✅ Exists |
| `SupportedLanguage` type | `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | ✅ Exists |
| `/api/user/language` endpoint | `/src/app/api/user/language/route.ts` | ✅ Exists (REQ-251) |
| `preferred_language` column | `users` and `accounts` tables | ✅ Exists (REQ-225) |

---

## Task Breakdown

### Task 6.1.1: Create Directory Structure

**Priority:** 1 (Must complete first)
**Estimated Effort:** ~5 minutes
**Story Points:** 0.5

**Objective:** Create the LanguagePreference component directory under TranslationManagement.

**Action Steps:**

1. Create the parent directory `/src/components/TranslationManagement/` if it doesn't exist
2. Create the subdirectory `/src/components/TranslationManagement/LanguagePreference/`

**Shell Commands:**
```bash
mkdir -p src/components/TranslationManagement/LanguagePreference
```

**Verification:**
- [ ] Directory exists: `/src/components/TranslationManagement/LanguagePreference/`
- [ ] No existing files conflict with this structure

**Notes:**
- The `TranslationManagement` parent directory will house all translation-related components from Epic 5
- This task has no code dependencies

---

### Task 6.1.2: Create Component Index File (Barrel Export)

**Priority:** 2
**Estimated Effort:** ~5 minutes
**Story Points:** 0.5
**Depends On:** Task 6.1.1

**Objective:** Create the barrel export file for the LanguagePreference module.

**File to Create:** `/src/components/TranslationManagement/LanguagePreference/index.ts`

**Complete Implementation:**

```typescript
// /src/components/TranslationManagement/LanguagePreference/index.ts
// REQ-358: LanguagePreference barrel exports
// Created: 2026-01-19
// Last Modified: 2026-01-19

export { LanguagePreferenceSection } from './LanguagePreferenceSection';
export type { LanguagePreferenceSectionProps } from './LanguagePreferenceSection';
```

**Verification:**
- [ ] File exists at specified path
- [ ] No TypeScript compilation errors (exports will error until Task 6.1.3 completes)
- [ ] Export names follow PascalCase convention

---

### Task 6.1.3: Create LanguagePreferenceSection Component

**Priority:** 3 (Core implementation)
**Estimated Effort:** 45-60 minutes
**Story Points:** 3
**Depends On:** Task 6.1.1, Task 6.1.2

**Objective:** Implement the main LanguagePreferenceSection component with full functionality.

**File to Create:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`

#### 6.1.3.1: Import Statements

**Location:** Top of file (lines 1-15)

```typescript
// /src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx
// REQ-358: Language Preference Section Component
// Phase: 6 - Language Preference Setting
// Task ID: 6.1
// Created: 2026-01-19
// Last Modified: 2026-01-19

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Globe, Check, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { useLanguagePreference, type SupportedLanguage, LANGUAGE_OPTIONS } from '@/hooks/useLanguagePreference';
```

**Notes:**
- Uses `'use client'` directive as this is a client-side interactive component
- Imports from existing `useLanguagePreference` hook which already provides `LANGUAGE_OPTIONS`
- Lucide icons are already installed in the project

#### 6.1.3.2: Type Definitions

**Location:** After imports (lines 17-30)

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
  /** Whether to show the section header (default: true) */
  showHeader?: boolean;
}
```

**Notes:**
- Props are optional to allow flexible integration
- Callbacks enable parent components to respond to save events
- `showHeader` allows embedding in existing settings sections

#### 6.1.3.3: Component Function Signature

**Location:** After type definitions (lines 32-40)

```typescript
/**
 * LanguagePreferenceSection - Allows users to select and save their interface language preference.
 *
 * Features:
 * - Dropdown with all 6 supported languages (flags + native names)
 * - Pre-selects current saved preference
 * - Save button with loading state
 * - Help text explaining the setting
 * - Success/error feedback messages
 * - Full keyboard accessibility
 *
 * @see REQ-358 for acceptance criteria
 */
export function LanguagePreferenceSection({
  className = '',
  onSave,
  onError,
  showHeader = true,
}: LanguagePreferenceSectionProps) {
```

#### 6.1.3.4: Hook Integration and State

**Location:** Inside component function (lines 42-70)

```typescript
  // Use existing hook for language preference management
  const {
    language: savedLanguage,
    setLanguage: persistLanguage,
    isLoading,
    isSaving,
    error: hookError,
    clearError,
    supportedLanguages,
  } = useLanguagePreference();

  // Local state for selection before save
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(savedLanguage);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Refs for DOM elements
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Computed state
  const isDirty = selectedLanguage !== savedLanguage;
```

**Notes:**
- Separates `selectedLanguage` (local) from `savedLanguage` (persisted) to enable dirty checking
- `focusedIndex` tracks keyboard navigation position
- `isDirty` determines if save button should be enabled

#### 6.1.3.5: Effect Hooks

**Location:** After state declarations (lines 72-115)

```typescript
  // Sync local state with saved language when it changes
  useEffect(() => {
    setSelectedLanguage(savedLanguage);
  }, [savedLanguage]);

  // Sync hook error to local error state
  useEffect(() => {
    if (hookError) {
      setErrorMessage(hookError);
    }
  }, [hookError]);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, clearError]);

  // Click outside handler to close dropdown
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
```

**Notes:**
- Auto-dismiss timers match Airbnb UX patterns
- Click-outside handler prevents dropdown from staying open accidentally
- Cleanup functions prevent memory leaks

#### 6.1.3.6: Event Handlers

**Location:** After effect hooks (lines 117-185)

```typescript
  // Handle save action
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

  // Handle option selection
  const handleSelectOption = useCallback((languageCode: SupportedLanguage) => {
    setSelectedLanguage(languageCode);
    setIsDropdownOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const totalOptions = supportedLanguages.length;

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
          const currentIndex = supportedLanguages.findIndex(l => l.code === selectedLanguage);
          setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
        } else if (focusedIndex >= 0 && focusedIndex < totalOptions) {
          const selected = supportedLanguages[focusedIndex];
          if (selected) {
            handleSelectOption(selected.code);
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
  }, [isDropdownOpen, focusedIndex, selectedLanguage, supportedLanguages, handleSelectOption]);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (isSaving) return;

    setIsDropdownOpen(prev => {
      if (!prev) {
        const currentIndex = supportedLanguages.findIndex(l => l.code === selectedLanguage);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return !prev;
    });
  }, [isSaving, selectedLanguage, supportedLanguages]);
```

**Notes:**
- `handleKeyDown` provides full keyboard navigation per WCAG requirements
- Arrow keys wrap around at list boundaries for better UX
- Space and Enter both toggle/select per native select behavior

#### 6.1.3.7: Derived Values

**Location:** Before return statement (lines 187-190)

```typescript
  // Get current language display data
  const currentLanguageOption = supportedLanguages.find(l => l.code === selectedLanguage) || supportedLanguages[0];
```

#### 6.1.3.8: Loading State Render

**Location:** Early return in render (lines 192-202)

```typescript
  // Loading state
  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 text-[#717171]">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span className="text-sm">Loading language preference...</span>
        </div>
      </div>
    );
  }
```

#### 6.1.3.9: Main Component Render

**Location:** Return statement (lines 204-340)

```typescript
  return (
    <div className={`p-4 ${className}`}>
      {/* Section Header */}
      {showHeader && (
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-[#222222]" aria-hidden="true" />
          <h3 className="text-base font-semibold text-[#222222]">
            Interface Language
          </h3>
        </div>
      )}

      {/* Language Dropdown */}
      <div className="relative mb-3" ref={dropdownRef}>
        {/* Dropdown Trigger Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-[#DDDDDD] rounded-lg text-left hover:border-[#222222] focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          aria-label={`Select interface language. Currently selected: ${currentLanguageOption.name}`}
          id="language-preference-button"
        >
          <span className="flex items-center gap-3">
            {currentLanguageOption.flag && (
              <span className="text-xl" role="img" aria-label={`${currentLanguageOption.name} flag`}>
                {currentLanguageOption.flag}
              </span>
            )}
            <span className="text-[#222222]">
              {currentLanguageOption.nativeName}
              <span className="text-[#717171] ml-1">
                ({currentLanguageOption.name})
              </span>
            </span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#717171] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown Options Menu */}
        {isDropdownOpen && (
          <div
            className="absolute z-50 mt-1 w-full bg-white border border-[#DDDDDD] rounded-lg shadow-lg max-h-64 overflow-y-auto"
            role="listbox"
            aria-labelledby="language-preference-button"
            aria-activedescendant={focusedIndex >= 0 ? `language-option-${supportedLanguages[focusedIndex]?.code}` : undefined}
          >
            {supportedLanguages.map((locale, index) => {
              const isSelected = selectedLanguage === locale.code;
              const isFocused = focusedIndex === index;

              return (
                <button
                  key={locale.code}
                  ref={(el) => { optionsRef.current[index] = el; }}
                  type="button"
                  id={`language-option-${locale.code}`}
                  onClick={() => handleSelectOption(locale.code)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                    isFocused ? 'bg-[#FFEEEF]' : ''
                  } ${
                    isSelected && !isFocused ? 'bg-[#F7F7F7]' : ''
                  } ${
                    !isFocused && !isSelected ? 'hover:bg-[#F7F7F7]' : ''
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="flex items-center gap-3">
                    {locale.flag && (
                      <span className="text-xl" role="img" aria-label={`${locale.name} flag`}>
                        {locale.flag}
                      </span>
                    )}
                    <span className="text-[#222222]">
                      {locale.nativeName}
                      <span className="text-[#717171] ml-1">
                        ({locale.name})
                      </span>
                    </span>
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#FF385C] flex-shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-sm text-[#717171] mb-4" id="language-preference-help">
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
        aria-describedby="language-preference-help"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Saving...</span>
          </>
        ) : (
          <span>Save Preference</span>
        )}
      </button>

      {/* Success Message */}
      {successMessage && (
        <div
          className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm text-red-700">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

export default LanguagePreferenceSection;
```

**Verification for Task 6.1.3:**
- [ ] File created at `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
- [ ] No TypeScript compilation errors
- [ ] All 6 languages display correctly in dropdown
- [ ] Flag emojis render properly
- [ ] Save button disabled when no changes
- [ ] Save button shows loading spinner during save
- [ ] Success message appears and auto-dismisses
- [ ] Error message appears on failure and auto-dismisses
- [ ] Keyboard navigation works (Arrow keys, Enter, Escape)
- [ ] Screen reader announces current selection
- [ ] Focus management works correctly

---

### Task 6.1.4: Create/Update TranslationManagement Module Export

**Priority:** 4
**Estimated Effort:** ~5 minutes
**Story Points:** 0.5
**Depends On:** Task 6.1.3

**Objective:** Create the main TranslationManagement module export file.

**File to Create:** `/src/components/TranslationManagement/index.ts`

**Complete Implementation:**

```typescript
// /src/components/TranslationManagement/index.ts
// REQ-358: TranslationManagement module barrel exports
// Created: 2026-01-19
// Last Modified: 2026-01-19

// LanguagePreference exports (REQ-358)
export * from './LanguagePreference';

// Future Epic 5 component exports will be added here:
// export * from './TranslationPreviewPanel';
// export * from './TranslationEditor';
// export * from './TranslationStatusWidget';
// etc.
```

**Verification:**
- [ ] File exists at `/src/components/TranslationManagement/index.ts`
- [ ] Imports work: `import { LanguagePreferenceSection } from '@/components/TranslationManagement'`
- [ ] No circular dependency warnings

---

### Task 6.1.5: Verify Build and Type Checking

**Priority:** 5
**Estimated Effort:** ~10 minutes
**Story Points:** 0.5
**Depends On:** Tasks 6.1.1-6.1.4

**Objective:** Ensure the component builds without errors and passes TypeScript checks.

**Action Steps:**

1. Run TypeScript compilation check:
   ```bash
   npx tsc --noEmit
   ```

2. Run the build:
   ```bash
   npm run build
   ```

3. Verify no ESLint errors:
   ```bash
   npm run lint
   ```

**Verification:**
- [ ] `tsc --noEmit` completes with no errors
- [ ] `npm run build` succeeds
- [ ] `npm run lint` shows no errors in new files

---

## Complete File Reference

### Files to Create (Ordered)

| Order | File Path | Purpose |
|-------|-----------|---------|
| 1 | `/src/components/TranslationManagement/LanguagePreference/index.ts` | Barrel export |
| 2 | `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Main component |
| 3 | `/src/components/TranslationManagement/index.ts` | Module export |

### Files NOT to Modify (Use as Dependencies)

| File | Usage |
|------|-------|
| `/src/hooks/useLanguagePreference.ts` | Import hook and types |
| `/src/components/LanguageSwitcher/constants.ts` | Reference only (hook re-exports needed values) |
| `/src/app/api/user/language/route.ts` | API endpoint (called by hook) |

---

## Acceptance Criteria Verification Matrix

| Criteria | Task | Test Method |
|----------|------|-------------|
| Component file exists at specified path | 6.1.3 | File system check |
| Dropdown displays all supported languages | 6.1.3 | Visual inspection |
| Each option shows flag icon and native name | 6.1.3 | Visual inspection |
| Dropdown pre-selects current preference | 6.1.3 | Load component, verify selection |
| Save button appears | 6.1.3 | Visual inspection |
| Save button disabled when no changes | 6.1.3 | Don't change selection, verify disabled |
| Save button shows loading during save | 6.1.3 | Click save, observe spinner |
| Help text appears and explains setting | 6.1.3 | Visual inspection |
| Help text clarifies scope | 6.1.3 | Read help text content |
| Successful save shows confirmation | 6.1.3 | Save preference, observe success message |
| Failed save shows error, preserves selection | 6.1.3 | Simulate API failure, verify behavior |
| Keyboard accessible | 6.1.3 | Test with keyboard only |
| ARIA labels present | 6.1.3 | Inspect DOM, use screen reader |
| Consistent styling | 6.1.3 | Visual comparison with design system |
| Responsive design | 6.1.3 | Test on tablet/desktop viewports |

---

## Testing Strategy

### Manual Testing Checklist

**Initial Load:**
- [ ] Loading spinner shows while fetching preference
- [ ] Current preference pre-selected after load
- [ ] Help text visible
- [ ] Save button disabled (no changes yet)

**Dropdown Interaction:**
- [ ] Click opens dropdown
- [ ] All 6 languages visible with flags
- [ ] Current selection shows checkmark
- [ ] Clicking option selects it and closes dropdown
- [ ] Click outside closes dropdown

**Keyboard Navigation:**
- [ ] Tab reaches dropdown button
- [ ] Space/Enter opens dropdown
- [ ] ArrowDown moves focus down
- [ ] ArrowUp moves focus up
- [ ] Enter selects focused option
- [ ] Escape closes without selecting
- [ ] Arrow keys wrap at boundaries

**Save Flow:**
- [ ] Selecting different language enables Save button
- [ ] Click Save shows loading spinner
- [ ] Successful save shows green success message
- [ ] Success message auto-dismisses after ~3 seconds
- [ ] Failed save shows red error message
- [ ] Error message auto-dismisses after ~5 seconds
- [ ] Failed save preserves user's selection

**Accessibility:**
- [ ] Screen reader announces current selection
- [ ] Screen reader announces dropdown state (open/closed)
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets WCAG AA

### Unit Test Cases (for future testing task)

```typescript
// Suggested test cases for LanguagePreferenceSection
describe('LanguagePreferenceSection', () => {
  it('renders loading state initially');
  it('displays current preference after load');
  it('handles null preference with default to "en"');
  it('enables save button when selection changes');
  it('disables save button when no changes');
  it('shows loading state during save');
  it('displays success message after save');
  it('displays error message on save failure');
  it('preserves selection on save failure');
  it('handles keyboard navigation correctly');
  it('closes dropdown on Escape key');
  it('closes dropdown on click outside');
  it('calls onSave callback with language on success');
  it('calls onError callback with message on failure');
});
```

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `useLanguagePreference` hook behavior differs from expected | Low | Medium | Hook exists and is tested; review hook implementation before starting |
| Missing Lucide icons | Very Low | Low | Icons confirmed available in package.json |
| Tailwind classes not working | Low | Medium | Use existing color values from DashboardSettingsPopover pattern |
| API endpoint unavailable | Low | High | Hook handles API errors gracefully; component shows error state |

---

## Integration Notes

This component (Task 6.1) creates the `LanguagePreferenceSection` as a standalone component. Task 6.3 (Integrate into account settings or profile) will handle integrating this component into the actual settings page.

**Example Integration (for Task 6.3):**

```tsx
// Example usage in account settings page
import { LanguagePreferenceSection } from '@/components/TranslationManagement';

export default function AccountSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-[#222222] mb-6">Account Settings</h1>

      <section className="bg-white rounded-xl border border-[#DDDDDD] mb-6">
        <LanguagePreferenceSection
          onSave={(lang) => console.log('Saved:', lang)}
          onError={(err) => console.error('Error:', err)}
        />
      </section>
    </div>
  );
}
```

---

## References

- **Overview Document:** `/docs/REQ-358-create-languagepreferencesection-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Definition:** `/docs/gen_requests_epic5.md` (REQ-358)
- **Hook Reference:** `/src/hooks/useLanguagePreference.ts`
- **Design Patterns:** `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx`
- **LanguageSwitcher:** `/src/components/LanguageSwitcher/`

---

*Document generated for FAQBNB Localization Epic 5 - Task 6.1: Create LanguagePreferenceSection Component*
*Generated: 2026-01-19*
