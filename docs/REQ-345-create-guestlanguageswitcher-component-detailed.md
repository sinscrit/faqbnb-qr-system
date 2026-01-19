# REQ-345: Create GuestLanguageSwitcher Component - Detailed Task Breakdown

**Document Created:** 2026-01-19 07:45 UTC
**Last Modified:** 2026-01-19 07:45 UTC
**Request ID:** REQ-345
**Type:** NEW FEATURE
**Size:** M
**Phase:** 3 - Guest UI Components (Task 3.1)
**Epic:** L10N Epic 4 - Guest Experience
**Overview Document:** `/docs/REQ-345-create-guestlanguageswitcher-component-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Document Purpose

This document provides a granular, actionable task breakdown for implementing the GuestLanguageSwitcher component. Each task is designed to be approximately 1 story point (completable in a single focused coding session) and can be executed by an AI coding agent or junior developer with minimal ambiguity.

---

## Prerequisites

Before starting implementation, verify the following dependencies are in place:

| Dependency | Location | Verification Command |
|------------|----------|---------------------|
| i18n Configuration | `/src/lib/i18n/config.ts` | `grep -l "locales" src/lib/i18n/config.ts` |
| `locales` export | `/src/lib/i18n/config.ts` | Must export `['en', 'fr', 'es', 'de', 'nl', 'it']` |
| `localeMetadata` export | `/src/lib/i18n/config.ts` | Must export metadata with flags and nativeNames |
| `SupportedLocale` type | `/src/lib/i18n/config.ts` | Must export type definition |
| Radix UI Dropdown | `package.json` | `npm list @radix-ui/react-dropdown-menu` |
| Lucide React Icons | `package.json` | `npm list lucide-react` |
| `cn` utility | `/src/lib/utils.ts` | Must export Tailwind class merge utility |

---

## Implementation Tasks

### Task 1: Create Directory Structure

**Objective:** Create the folder structure for the GuestLanguageSwitcher component.

**Files to Create:**
```
/src/components/guest/
/src/components/guest/GuestLanguageSwitcher/
```

**Detailed Steps:**

1.1. Create the parent guest components directory:
```bash
mkdir -p src/components/guest/GuestLanguageSwitcher
```

1.2. Verify directories were created:
```bash
ls -la src/components/guest/
```

**Verification Criteria:**
- [ ] Directory `/src/components/guest/` exists
- [ ] Directory `/src/components/guest/GuestLanguageSwitcher/` exists
- [ ] No errors during directory creation

**Estimated Effort:** 5 minutes

---

### Task 2: Create Type Definitions File

**Objective:** Create TypeScript interfaces for the GuestLanguageSwitcher component props.

**File to Create:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts`

**Implementation:**

```typescript
/**
 * GuestLanguageSwitcher Component Types
 *
 * Type definitions for the guest-facing language selection dropdown.
 *
 * REQ-345: Create GuestLanguageSwitcher Component
 * Phase 3.1 - Guest UI Components
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import type { SupportedLocale } from '@/lib/i18n/config';

/**
 * Props interface for the GuestLanguageSwitcher component.
 *
 * @example
 * <GuestLanguageSwitcher
 *   currentLanguage="en"
 *   availableTranslations={['en', 'fr', 'es']}
 *   sourceLanguage="en"
 *   onLanguageChange={(lang) => setLanguage(lang)}
 * />
 */
export interface GuestLanguageSwitcherProps {
  /**
   * Currently selected language code.
   * This language is highlighted in the dropdown.
   */
  currentLanguage: SupportedLocale;

  /**
   * Array of language codes that have translations available
   * for the current content. These will show checkmarks.
   */
  availableTranslations: SupportedLocale[];

  /**
   * The original/source language of the content.
   * Always considered "available" even if not in availableTranslations.
   */
  sourceLanguage: SupportedLocale;

  /**
   * Callback function invoked when the user selects a language.
   * Receives the selected language code.
   */
  onLanguageChange: (language: SupportedLocale) => void;

  /**
   * Optional compact variant for space-constrained layouts.
   * When true, renders a smaller trigger button.
   * @default false
   */
  compact?: boolean;

  /**
   * Optional additional CSS classes to apply to the root element.
   */
  className?: string;

  /**
   * Optional disabled state for the dropdown.
   * When true, the dropdown cannot be opened.
   * @default false
   */
  disabled?: boolean;
}
```

**Verification Criteria:**
- [ ] File exists at correct path
- [ ] Imports `SupportedLocale` from i18n config
- [ ] All 7 props are defined with JSDoc comments
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts`
- [ ] No linting errors

**Estimated Effort:** 15 minutes

---

### Task 3: Create Component Barrel Export

**Objective:** Create the index.ts file for re-exporting the component.

**File to Create:** `/src/components/guest/GuestLanguageSwitcher/index.ts`

**Implementation:**

```typescript
/**
 * GuestLanguageSwitcher Component Exports
 *
 * Barrel export file for the GuestLanguageSwitcher component.
 *
 * REQ-345: Create GuestLanguageSwitcher Component
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export { default } from './GuestLanguageSwitcher';
export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher.types';
```

**Note:** This file will have import errors until Task 4 is complete. That is expected.

**Verification Criteria:**
- [ ] File exists at correct path
- [ ] Exports named export `GuestLanguageSwitcher`
- [ ] Exports default export
- [ ] Exports type `GuestLanguageSwitcherProps`

**Estimated Effort:** 5 minutes

---

### Task 4: Implement Main Component - Part 1 (Imports and Setup)

**Objective:** Create the main component file with imports, constants, and helper functions.

**File to Create:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Implementation (Part 1 - Imports and Helpers):**

```typescript
/**
 * GuestLanguageSwitcher Component
 *
 * A dropdown component for guest-facing pages that displays all supported
 * languages with visual indicators showing translation availability.
 *
 * Features:
 * - Displays all 6 supported languages with flags and native names
 * - Checkmark indicators for languages with available translations
 * - Reduced opacity styling for unavailable translations (still selectable)
 * - Built on Radix UI dropdown for full keyboard/screen reader accessibility
 * - Compact variant for mobile/header use
 *
 * REQ-345: Create GuestLanguageSwitcher Component
 * Phase 3.1 - Guest UI Components
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { locales, localeMetadata, type SupportedLocale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher.types';

/**
 * Check if a language has translation available.
 * A language is considered available if:
 * 1. It is the source language (original content), OR
 * 2. It exists in the availableTranslations array
 *
 * @param language - The language code to check
 * @param sourceLanguage - The source/original language of the content
 * @param availableTranslations - Array of languages with available translations
 * @returns True if the language has content available
 */
function hasTranslation(
  language: SupportedLocale,
  sourceLanguage: SupportedLocale,
  availableTranslations: SupportedLocale[]
): boolean {
  return language === sourceLanguage || availableTranslations.includes(language);
}
```

**Verification Criteria:**
- [ ] File exists at correct path
- [ ] Has `'use client'` directive at top
- [ ] All imports resolve correctly
- [ ] `hasTranslation` helper function implemented
- [ ] JSDoc header comment present

**Estimated Effort:** 10 minutes

---

### Task 5: Implement Main Component - Part 2 (Component Function and Trigger)

**Objective:** Add the main component function with the dropdown trigger button.

**File to Modify:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Implementation (Continue after Part 1):**

```typescript
/**
 * GuestLanguageSwitcher - Guest-facing language selection dropdown.
 *
 * @param props - Component props
 * @returns React element
 */
export function GuestLanguageSwitcher({
  currentLanguage,
  availableTranslations,
  sourceLanguage,
  onLanguageChange,
  compact = false,
  className,
  disabled = false,
}: GuestLanguageSwitcherProps) {
  // Get metadata for the currently selected language
  const currentLocale = localeMetadata[currentLanguage];

  // Trigger button styling classes
  const triggerClasses = cn(
    // Base layout
    'inline-flex items-center justify-between gap-2',
    // Sizing based on compact mode
    compact ? 'min-w-[100px] px-2 py-1.5' : 'min-w-[140px] px-3 py-2',
    // Visual styling
    'bg-white border border-gray-300 rounded-lg',
    // Typography
    compact ? 'text-xs' : 'text-sm',
    'font-medium text-gray-700',
    // Interaction states
    'hover:bg-gray-50',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
    // Disabled state
    'disabled:opacity-50 disabled:cursor-not-allowed',
    // Transition
    'transition-colors duration-150',
    // Touch optimization (minimum 44px touch target)
    'min-h-[44px]',
    'touch-manipulation [-webkit-tap-highlight-color:transparent]',
    // Custom classes
    className
  );

  return (
    <DropdownMenu.Root>
      {/* Trigger Button */}
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={triggerClasses}
          aria-label={`Select language. Current: ${currentLocale?.nativeName || 'English'}`}
        >
          <div className="flex items-center gap-2">
            {/* Globe icon */}
            <Globe
              className={cn(
                'text-gray-400 flex-shrink-0',
                compact ? 'w-3.5 h-3.5' : 'w-4 h-4'
              )}
              aria-hidden="true"
            />
            {/* Flag and language name */}
            {currentLocale?.flag && (
              <span className={compact ? 'text-sm' : 'text-base'} aria-hidden="true">
                {currentLocale.flag}
              </span>
            )}
            {!compact && (
              <span className="truncate">{currentLocale?.nativeName || 'English'}</span>
            )}
          </div>
          {/* Chevron indicator */}
          <ChevronDown
            className={cn(
              'text-gray-400 flex-shrink-0 transition-transform duration-200',
              compact ? 'w-3 h-3' : 'w-4 h-4',
              'group-data-[state=open]:rotate-180'
            )}
            aria-hidden="true"
          />
        </button>
      </DropdownMenu.Trigger>

      {/* Content will be added in Part 3 */}
    </DropdownMenu.Root>
  );
}

export default GuestLanguageSwitcher;
```

**Verification Criteria:**
- [ ] Component function accepts all props from types file
- [ ] Trigger button has proper ARIA label
- [ ] Globe icon displays
- [ ] Flag emoji displays for current language
- [ ] Native name displays (when not in compact mode)
- [ ] Chevron down icon present
- [ ] Touch target minimum 44px height
- [ ] Disabled state handled

**Estimated Effort:** 20 minutes

---

### Task 6: Implement Main Component - Part 3 (Dropdown Content)

**Objective:** Add the dropdown menu content with all language options.

**File to Modify:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

**Implementation (Replace the comment "Content will be added in Part 3"):**

```typescript
      {/* Dropdown Portal and Content */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            // Positioning and sizing
            'z-50 min-w-[180px]',
            // Visual styling
            'bg-white rounded-md shadow-lg',
            'border border-gray-200',
            'py-1',
            // Animation
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            // Animation direction based on side
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=top]:slide-in-from-bottom-2'
          )}
          align="end"
          sideOffset={4}
        >
          {/* Language Options as RadioGroup */}
          <DropdownMenu.RadioGroup
            value={currentLanguage}
            onValueChange={(value) => onLanguageChange(value as SupportedLocale)}
          >
            {locales.map((langCode) => {
              const locale = localeMetadata[langCode];
              const isSelected = currentLanguage === langCode;
              const isAvailable = hasTranslation(langCode, sourceLanguage, availableTranslations);

              return (
                <DropdownMenu.RadioItem
                  key={langCode}
                  value={langCode}
                  className={cn(
                    // Layout
                    'relative flex items-center justify-between gap-2',
                    'px-3 py-2',
                    // Touch target (minimum 44px height)
                    'min-h-[44px]',
                    // Typography
                    'text-sm cursor-pointer',
                    // Focus styling
                    'outline-none',
                    'focus:bg-gray-100',
                    // Hover styling
                    'hover:bg-gray-100',
                    // Selected state
                    isSelected && 'bg-gray-50',
                    // Unavailable styling (reduced opacity but still selectable)
                    !isAvailable && 'opacity-50'
                  )}
                >
                  {/* Left side: Flag and Language Name */}
                  <div className="flex items-center gap-3">
                    {/* Flag emoji */}
                    {locale?.flag && (
                      <span className="text-base flex-shrink-0" aria-hidden="true">
                        {locale.flag}
                      </span>
                    )}
                    {/* Language names */}
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {locale?.nativeName || langCode}
                      </span>
                      <span className="text-xs text-gray-500">
                        {locale?.name || langCode}
                      </span>
                    </div>
                  </div>

                  {/* Right side: Availability indicator (checkmark) */}
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isAvailable && (
                      <Check
                        className={cn(
                          'w-4 h-4',
                          isSelected ? 'text-blue-600' : 'text-green-500'
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
```

**Verification Criteria:**
- [ ] Dropdown renders inside a Portal
- [ ] All 6 languages are displayed
- [ ] Each language shows flag and native name
- [ ] English name shown as subtitle
- [ ] Checkmark appears for available translations
- [ ] Unavailable languages have reduced opacity (50%)
- [ ] All languages are selectable (including unavailable)
- [ ] Selected language triggers `onLanguageChange` callback
- [ ] Touch targets are at least 44px height

**Estimated Effort:** 30 minutes

---

### Task 7: Create Guest Components Barrel Export

**Objective:** Create the main barrel export file for all guest components.

**File to Create:** `/src/components/guest/index.ts`

**Implementation:**

```typescript
/**
 * Guest Components Barrel Exports
 *
 * Re-exports all guest-facing components for clean imports.
 *
 * Usage:
 *   import { GuestLanguageSwitcher } from '@/components/guest';
 *
 * REQ-316: Create Barrel Exports for Guest Components
 * REQ-345: Create GuestLanguageSwitcher Component
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// GuestLanguageSwitcher Component
export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher';

// Future guest components will be exported here:
// export { TranslationBanner } from './TranslationBanner';
// export { MissingTranslationBanner } from './MissingTranslationBanner';
// export { ViewOriginalToggle } from './ViewOriginalToggle';
// export { LanguageIndicator } from './LanguageIndicator';
```

**Verification Criteria:**
- [ ] File exists at `/src/components/guest/index.ts`
- [ ] Exports `GuestLanguageSwitcher` component
- [ ] Exports `GuestLanguageSwitcherProps` type
- [ ] Comments indicate where future components will be added
- [ ] Import statement works: `import { GuestLanguageSwitcher } from '@/components/guest'`

**Estimated Effort:** 5 minutes

---

### Task 8: Verify Component Compilation

**Objective:** Ensure the component compiles without TypeScript errors.

**Steps:**

8.1. Run TypeScript compiler:
```bash
npx tsc --noEmit
```

8.2. Run ESLint on new files:
```bash
npx eslint src/components/guest/ --ext .ts,.tsx
```

8.3. Run the build:
```bash
npm run build
```

**Verification Criteria:**
- [ ] TypeScript compilation succeeds with no errors
- [ ] ESLint shows no errors or warnings
- [ ] Build completes successfully

**Estimated Effort:** 10 minutes

---

### Task 9: Add Keyboard Navigation Test Verification

**Objective:** Manually verify keyboard navigation works correctly.

**Test Scenarios:**

| Scenario | Action | Expected Result |
|----------|--------|-----------------|
| Open with keyboard | Press Enter or Space on trigger | Dropdown opens, first item focused |
| Navigate down | Press ArrowDown | Focus moves to next item |
| Navigate up | Press ArrowUp | Focus moves to previous item |
| Select item | Press Enter on focused item | Item selected, dropdown closes, callback fires |
| Close dropdown | Press Escape | Dropdown closes, focus returns to trigger |
| Tab away | Press Tab | Dropdown closes |

**Note:** Radix UI provides these behaviors automatically. This task verifies they work as expected.

**Verification Criteria:**
- [ ] All keyboard navigation scenarios pass
- [ ] Focus is visible on active menu items
- [ ] Screen reader announces current selection

**Estimated Effort:** 15 minutes

---

### Task 10: Add ARIA and Accessibility Verification

**Objective:** Verify the component meets accessibility requirements.

**Accessibility Checklist:**

| Requirement | Verification |
|-------------|--------------|
| Trigger has `aria-label` | Describes current selection |
| Trigger has `aria-expanded` | Reflects open/closed state |
| Trigger has `aria-haspopup` | Set to `"menu"` or `"listbox"` |
| Menu items are announced | Screen reader reads flag + language name |
| Checkmarks are decorative | Have `aria-hidden="true"` |
| Icons are decorative | Have `aria-hidden="true"` |
| Focus trap inside dropdown | When open, tab cycles through menu items |

**Tool Verification:**
```bash
# Run Axe accessibility audit on a page containing the component
# (Requires component to be rendered on a test page)
```

**Verification Criteria:**
- [ ] All ARIA attributes present and correct
- [ ] Screen reader announces languages correctly
- [ ] No accessibility errors from automated tools

**Estimated Effort:** 20 minutes

---

### Task 11: Test Mobile Responsiveness

**Objective:** Verify the component works correctly on mobile viewports.

**Test Scenarios:**

| Viewport | Scenario | Expected Result |
|----------|----------|-----------------|
| 320px width | Trigger renders | No horizontal overflow |
| 320px width | Dropdown opens | Dropdown visible within viewport |
| 375px width | Touch trigger | Dropdown opens |
| 375px width | Touch menu item | Item selected |
| 414px width | Compact mode | Smaller trigger renders correctly |

**Touch Target Verification:**
- [ ] Trigger button minimum 44x44px
- [ ] Each menu item minimum 44px height

**Verification Criteria:**
- [ ] Component works on 320px viewport
- [ ] No horizontal scrolling
- [ ] Touch interactions work smoothly
- [ ] Dropdown doesn't overflow viewport

**Estimated Effort:** 15 minutes

---

### Task 12: Create Simple Integration Test (Optional)

**Objective:** Write a basic test to verify the component renders and responds to clicks.

**File to Create:** `/src/components/guest/GuestLanguageSwitcher/__tests__/GuestLanguageSwitcher.test.tsx`

**Implementation:**

```typescript
/**
 * GuestLanguageSwitcher Component Tests
 *
 * Basic tests for the GuestLanguageSwitcher component.
 *
 * REQ-345: Create GuestLanguageSwitcher Component
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GuestLanguageSwitcher } from '../GuestLanguageSwitcher';

describe('GuestLanguageSwitcher', () => {
  const defaultProps = {
    currentLanguage: 'en' as const,
    availableTranslations: ['en', 'fr', 'es'] as const,
    sourceLanguage: 'en' as const,
    onLanguageChange: vi.fn(),
  };

  it('renders with current language displayed', () => {
    render(<GuestLanguageSwitcher {...defaultProps} />);

    // Should show English native name
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('shows all 6 languages when dropdown opens', async () => {
    render(<GuestLanguageSwitcher {...defaultProps} />);

    // Click to open dropdown
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Should show all 6 languages
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.getByText('Nederlands')).toBeInTheDocument();
    expect(screen.getByText('Italiano')).toBeInTheDocument();
  });

  it('calls onLanguageChange when a language is selected', async () => {
    const onLanguageChange = vi.fn();
    render(
      <GuestLanguageSwitcher
        {...defaultProps}
        onLanguageChange={onLanguageChange}
      />
    );

    // Open dropdown
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Click on French
    const frenchOption = screen.getByText('Français');
    fireEvent.click(frenchOption);

    // Should call callback with 'fr'
    expect(onLanguageChange).toHaveBeenCalledWith('fr');
  });

  it('renders in compact mode', () => {
    render(<GuestLanguageSwitcher {...defaultProps} compact />);

    // In compact mode, should not show the full language name
    // (Only flag and globe icon visible)
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('min-w-[100px]');
  });

  it('handles disabled state', () => {
    render(<GuestLanguageSwitcher {...defaultProps} disabled />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
  });
});
```

**Verification Criteria:**
- [ ] Test file created at correct path
- [ ] All tests pass: `npm test src/components/guest/GuestLanguageSwitcher`
- [ ] No test errors or warnings

**Estimated Effort:** 30 minutes

---

## Complete Implementation Summary

### Files Created

| File Path | Purpose | Task |
|-----------|---------|------|
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts` | TypeScript interfaces | Task 2 |
| `/src/components/guest/GuestLanguageSwitcher/index.ts` | Component barrel export | Task 3 |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Main component | Tasks 4-6 |
| `/src/components/guest/index.ts` | Guest components barrel | Task 7 |
| `/src/components/guest/GuestLanguageSwitcher/__tests__/GuestLanguageSwitcher.test.tsx` | Unit tests | Task 12 |

### Imports Required

```typescript
// From @radix-ui/react-dropdown-menu (already installed)
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

// From lucide-react (already installed)
import { ChevronDown, Check, Globe } from 'lucide-react';

// From project i18n config (Epic 1)
import { locales, localeMetadata, type SupportedLocale } from '@/lib/i18n/config';

// From project utils
import { cn } from '@/lib/utils';
```

### Usage Example

```tsx
import { GuestLanguageSwitcher } from '@/components/guest';

function ItemPage({ translationMeta }) {
  const [currentLanguage, setCurrentLanguage] = useState(translationMeta.displayLanguage);

  return (
    <GuestLanguageSwitcher
      currentLanguage={currentLanguage}
      availableTranslations={translationMeta.availableTranslations}
      sourceLanguage={translationMeta.sourceLanguage}
      onLanguageChange={setCurrentLanguage}
    />
  );
}
```

---

## Acceptance Criteria Verification Checklist

| # | Acceptance Criteria | Verification Method | Status |
|---|---------------------|---------------------|--------|
| 1 | Component displays a Radix UI dropdown trigger showing current language with flag and native name | Visual inspection | [ ] |
| 2 | Dropdown opens to show all six supported languages (English, Spanish, French, German, Italian, Dutch) | Click trigger, count options | [ ] |
| 3 | Each language entry displays a flag emoji and the language's native name | Visual inspection | [ ] |
| 4 | Visual checkmark indicator appears next to languages that have translations available | Check availableTranslations languages | [ ] |
| 5 | Languages without available translations are styled with reduced opacity (50%) but remain clickable | Click unavailable language | [ ] |
| 6 | Selecting any language (available or unavailable) triggers the onLanguageChange callback | Click and verify callback | [ ] |
| 7 | Component is fully keyboard navigable (Arrow keys, Enter, Escape) | Keyboard testing | [ ] |
| 8 | Screen readers announce the current selection and available options | Screen reader test | [ ] |
| 9 | Compact variant renders smaller for mobile/header use | Test with `compact={true}` | [ ] |
| 10 | Component follows project design system (Tailwind CSS, Airbnb DLS patterns) | Code review | [ ] |
| 11 | Component is responsive and works on viewports as small as 320px | Mobile viewport test | [ ] |
| 12 | Touch targets are minimum 44x44px for mobile accessibility | Measure touch targets | [ ] |
| 13 | TypeScript types are properly defined and exported | TypeScript compilation | [ ] |
| 14 | Barrel exports enable clean imports from `@/components/guest` | Import statement test | [ ] |

---

## Dependencies on Other Tasks

| This Task | Depends On | Notes |
|-----------|-----------|-------|
| REQ-345 (this) | Epic 1 - i18n Config | Requires `locales`, `localeMetadata`, `SupportedLocale` |
| Task 4.1 (useGuestLanguage) | REQ-345 (this) | Hook will use this component |
| Task 5.2 (ItemDisplay update) | REQ-345 (this) | Page will integrate this component |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Radix UI not installed | Verify with `npm list @radix-ui/react-dropdown-menu` |
| i18n config missing | Check Epic 1 completion, verify file exists |
| Tailwind classes not working | Verify Tailwind config includes component paths |
| Z-index conflicts | Use z-50 for dropdown, test with modals |
| Mobile dropdown position | Test with sideOffset and collision detection |

---

## References

- **Overview Document:** `/docs/REQ-345-create-guestlanguageswitcher-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-345)
- **i18n Configuration:** `/src/lib/i18n/config.ts`
- **Existing LanguageSwitcher (reference):** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
- **Radix UI Dropdown Pattern (reference):** `/src/components/ItemManager/components/dialogs/SortMenu.tsx`
- **Radix UI Dropdown Docs:** https://www.radix-ui.com/primitives/docs/components/dropdown-menu

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience implementation*
*Task 3.1 - Create GuestLanguageSwitcher Component*
