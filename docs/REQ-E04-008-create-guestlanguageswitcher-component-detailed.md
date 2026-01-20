# Detailed Task Breakdown: REQ-E04-008 - Create GuestLanguageSwitcher Component

**Request ID:** REQ-E04-008
**Title:** Create Guest Language Switcher Component
**Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 3 - Guest UI Components
**Task ID:** 3.1

**Overview Document:** `/docs/REQ-E04-008-create-guestlanguageswitcher-component-overview.md`
**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Source Request:** `/docs/gen_requests_epic4.md` - Request #8

**Last Modified:** 2026-01-20 15:30 UTC

---

## Document Purpose

This document provides granular, actionable implementation tasks for creating the GuestLanguageSwitcher component. Each task is scoped to approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

---

## Prerequisites

Before starting implementation, verify the following:

| Prerequisite | Location | Verification |
|--------------|----------|--------------|
| Radix UI dropdown installed | `package.json` | `@radix-ui/react-dropdown-menu` v2.1.15+ |
| LanguageSwitcher constants | `/src/components/LanguageSwitcher/constants.ts` | `SUPPORTED_LOCALES` array exists |
| SupportedLanguage type | `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | Type exported |
| Lucide icons installed | `package.json` | `lucide-react` installed |
| cn utility exists | `/src/lib/utils.ts` | `cn()` function for class merging |

---

## Task Summary

| Task # | Title | Effort | Dependencies |
|--------|-------|--------|--------------|
| 1 | Create component directory structure | XS | None |
| 2 | Create TypeScript types file | XS | Task 1 |
| 3 | Create main GuestLanguageSwitcher component | M | Task 1, 2 |
| 4 | Add loading and error state handling | S | Task 3 |
| 5 | Create barrel exports | XS | Task 3 |
| 6 | Update guest components barrel export | XS | Task 5 |
| 7 | Verify build and TypeScript compilation | XS | Task 6 |

**Total Estimated Effort:** M (Medium)

---

## Detailed Tasks

### Task 1: Create Component Directory Structure

**Effort:** XS (Extra Small)
**File Operations:** Create directories

#### Description
Create the directory structure for the GuestLanguageSwitcher component following the project's component organization pattern.

#### Steps

1. Create the guest components directory if it doesn't exist:
   ```
   /src/components/guest/
   ```

2. Create the GuestLanguageSwitcher component directory:
   ```
   /src/components/guest/GuestLanguageSwitcher/
   ```

#### Expected Result
```
/src/components/guest/
  └── GuestLanguageSwitcher/
```

#### Verification
- Directory `/src/components/guest/GuestLanguageSwitcher/` exists

---

### Task 2: Create TypeScript Types File

**Effort:** XS (Extra Small)
**File:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts`

#### Description
Define the TypeScript interfaces for the GuestLanguageSwitcher component props and internal state.

#### Implementation Details

Create the file with the following content:

```typescript
// /src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts
// REQ-E04-008: GuestLanguageSwitcher component types
// Last Modified: 2026-01-20

import type { SupportedLanguage } from '@/components/LanguageSwitcher/LanguageSwitcher.types';

/**
 * Props for GuestLanguageSwitcher component
 *
 * This component provides a language selection dropdown for guest users
 * viewing translated content. It displays all supported languages with
 * visual indicators for translation availability.
 */
export interface GuestLanguageSwitcherProps {
  /** Currently selected language */
  currentLanguage: SupportedLanguage;

  /** Languages that have translations available for the current content */
  availableTranslations: SupportedLanguage[];

  /** Source/original language of the content */
  sourceLanguage: SupportedLanguage;

  /** Callback when language is changed */
  onLanguageChange: (language: SupportedLanguage) => void;

  /** Compact mode for mobile or constrained spaces (default: false) */
  compact?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Loading state while fetching translation availability */
  isLoading?: boolean;

  /** Error state if translation availability cannot be determined */
  hasError?: boolean;

  /** Disable the component */
  disabled?: boolean;
}

/**
 * Internal state for language option rendering
 * Used to compute display properties for each dropdown option
 */
export interface LanguageOptionState {
  /** ISO 639-1 language code */
  code: SupportedLanguage;
  /** English name of the language */
  name: string;
  /** Native name of the language (e.g., "Deutsch" for German) */
  nativeName: string;
  /** Flag emoji for visual identification */
  flag: string;
  /** Whether this language has a translation available */
  hasTranslation: boolean;
  /** Whether this is the source/original language */
  isSource: boolean;
  /** Whether this is the currently selected language */
  isSelected: boolean;
}
```

#### Acceptance Criteria
- [ ] File exists at specified path
- [ ] `GuestLanguageSwitcherProps` interface is exported
- [ ] `LanguageOptionState` interface is exported
- [ ] All properties have JSDoc comments
- [ ] Import from LanguageSwitcher types is correct
- [ ] TypeScript compiles without errors

---

### Task 3: Create Main GuestLanguageSwitcher Component

**Effort:** M (Medium)
**File:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`

#### Description
Implement the main GuestLanguageSwitcher component using Radix UI DropdownMenu primitives. This component displays a dropdown with all six supported languages, shows translation availability indicators, and handles language selection.

#### Implementation Details

Create the file with the following structure:

```typescript
// /src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx
// REQ-E04-008: Guest Language Switcher Component
// Last Modified: 2026-01-20

'use client';

import { useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_LOCALES, getLocaleByCode } from '@/components/LanguageSwitcher/constants';
import type { GuestLanguageSwitcherProps, LanguageOptionState } from './GuestLanguageSwitcher.types';
import type { SupportedLanguage } from '@/components/LanguageSwitcher/LanguageSwitcher.types';

/**
 * GuestLanguageSwitcher - Dropdown for guest language selection
 *
 * Features:
 * - Displays all 6 supported languages with flag emojis and native names
 * - Shows checkmark indicator for languages with available translations
 * - Grays out languages without translations (but keeps them selectable)
 * - Uses Radix UI for full accessibility (keyboard nav, ARIA)
 * - Handles loading and error states
 * - No database persistence - uses callback for state management
 */
export function GuestLanguageSwitcher({
  currentLanguage,
  availableTranslations,
  sourceLanguage,
  onLanguageChange,
  compact = false,
  className = '',
  isLoading = false,
  hasError = false,
  disabled = false,
}: GuestLanguageSwitcherProps) {
  // Get current locale data for display
  const currentLocaleData = getLocaleByCode(currentLanguage);

  /**
   * Compute option state for each language in the dropdown
   */
  const languageOptions: LanguageOptionState[] = useMemo(() => {
    return SUPPORTED_LOCALES.map((locale) => ({
      code: locale.code,
      name: locale.name,
      nativeName: locale.nativeName,
      flag: locale.flag || '',
      hasTranslation:
        availableTranslations.includes(locale.code) || locale.code === sourceLanguage,
      isSource: locale.code === sourceLanguage,
      isSelected: locale.code === currentLanguage,
    }));
  }, [availableTranslations, sourceLanguage, currentLanguage]);

  /**
   * Handle language selection
   */
  const handleValueChange = (value: string) => {
    if (value !== currentLanguage) {
      onLanguageChange(value as SupportedLanguage);
    }
  };

  // Disabled state combines explicit disable, loading, and error
  const isDisabled = disabled || isLoading;

  return (
    <DropdownMenu.Root>
      {/* Trigger Button */}
      <DropdownMenu.Trigger asChild disabled={isDisabled}>
        <button
          type="button"
          className={cn(
            // Base styles
            'inline-flex items-center gap-2',
            'px-3 py-2 rounded-lg',
            'text-sm font-medium',
            // Border and background
            'border border-gray-300 bg-white',
            'hover:bg-gray-50 hover:border-gray-400',
            // Focus states
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
            // Transition
            'transition-colors duration-150',
            // Mobile touch target (44px minimum)
            'min-h-[44px]',
            // Touch optimization
            'touch-manipulation [-webkit-tap-highlight-color:transparent]',
            // Disabled state
            isDisabled && 'opacity-50 cursor-not-allowed',
            // Error state
            hasError && 'border-red-300',
            // Compact mode adjustments
            compact && 'px-2 py-1.5 min-h-[36px] text-xs',
            // Custom classes
            className
          )}
          aria-label={`Select language. Current: ${currentLocaleData?.name || 'English'}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" aria-hidden="true" />
              <span className="text-gray-500">Loading...</span>
            </>
          ) : (
            <>
              {!compact && (
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
              )}
              {currentLocaleData?.flag && (
                <span className={cn('flex-shrink-0', compact ? 'text-sm' : 'text-base')}>
                  {currentLocaleData.flag}
                </span>
              )}
              <span className="text-gray-900">
                {compact
                  ? currentLocaleData?.code.toUpperCase()
                  : currentLocaleData?.nativeName || 'Select Language'}
              </span>
              <ChevronDown
                className={cn(
                  'text-gray-400 transition-transform duration-200 flex-shrink-0',
                  compact ? 'w-3 h-3' : 'w-4 h-4'
                )}
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </DropdownMenu.Trigger>

      {/* Dropdown Portal */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            // Positioning and sizing
            'z-50 min-w-[200px] max-w-[280px]',
            // Visual styling
            'bg-white rounded-lg shadow-lg',
            'border border-gray-200',
            'py-1',
            // Animation
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=top]:slide-in-from-bottom-2'
          )}
          align="end"
          side="bottom"
          sideOffset={4}
        >
          {/* Radio Group for single selection */}
          <DropdownMenu.RadioGroup
            value={currentLanguage}
            onValueChange={handleValueChange}
          >
            {languageOptions.map((option) => (
              <DropdownMenu.RadioItem
                key={option.code}
                value={option.code}
                className={cn(
                  // Layout
                  'relative flex items-center gap-3',
                  'px-3 py-2.5 min-h-[44px]', // 44px touch target
                  // Typography
                  'text-sm cursor-pointer select-none',
                  // Focus
                  'outline-none',
                  // Transitions
                  'transition-colors duration-100',
                  // Focus/hover states
                  'focus:bg-gray-50',
                  // Selected state
                  option.isSelected && 'bg-[#FFEEEF]',
                  // Hover when not selected
                  !option.isSelected && 'hover:bg-gray-50',
                  // Unavailable translation styling (grayed but still selectable)
                  !option.hasTranslation && 'opacity-50'
                )}
                aria-label={`${option.name}${option.hasTranslation ? ', translation available' : ', no translation'}`}
              >
                {/* Flag */}
                <span className="text-base flex-shrink-0" aria-hidden="true">
                  {option.flag}
                </span>

                {/* Language Name */}
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      'block font-medium',
                      option.isSelected ? 'text-[#222222]' : 'text-gray-700',
                      !option.hasTranslation && 'text-gray-400'
                    )}
                  >
                    {option.nativeName}
                  </span>
                  {!compact && (
                    <span className="block text-xs text-gray-500">{option.name}</span>
                  )}
                </div>

                {/* Translation Available Indicator (checkmark for languages with translations) */}
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {option.hasTranslation && (
                    <Check
                      className={cn(
                        'w-4 h-4',
                        option.isSelected ? 'text-[#FF385C]' : 'text-green-500'
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default GuestLanguageSwitcher;
```

#### Key Implementation Notes

1. **Radix UI DropdownMenu**: Uses the full Radix UI pattern with `Root`, `Trigger`, `Portal`, `Content`, `RadioGroup`, and `RadioItem` for proper accessibility.

2. **Translation Availability**: Languages with available translations (in `availableTranslations` array or matching `sourceLanguage`) show a green checkmark. Languages without translations are grayed out (opacity-50) but remain selectable.

3. **No Page Reload**: Unlike the owner-facing LanguageSwitcher, this component does NOT reload the page. It calls the `onLanguageChange` callback, allowing the parent to handle state updates client-side.

4. **Styling**: Uses the project's brand colors (`#FF385C` for focus ring and selection, `#FFEEEF` for selected background).

5. **Touch Targets**: Minimum 44px height for mobile accessibility compliance.

#### Acceptance Criteria
- [ ] Component renders dropdown trigger with current language flag and name
- [ ] Clicking trigger opens dropdown with all 6 supported languages
- [ ] Each language shows flag emoji and native name
- [ ] Languages with translations show checkmark indicator
- [ ] Languages without translations appear dimmed but are selectable
- [ ] Currently selected language has highlighted background
- [ ] Selecting a language calls `onLanguageChange` callback
- [ ] Keyboard navigation works (arrow keys, enter, escape)
- [ ] Loading state shows spinner and "Loading..." text
- [ ] Disabled state prevents interaction
- [ ] Component has proper ARIA attributes

---

### Task 4: Add Loading and Error State Handling

**Effort:** S (Small)
**File:** `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` (modification)

#### Description
This task is integrated into Task 3. The loading and error states are already implemented in the main component. This task serves as a verification checkpoint.

#### Verification Checklist

1. **Loading State:**
   - [ ] When `isLoading={true}`, trigger shows spinner icon
   - [ ] When `isLoading={true}`, trigger shows "Loading..." text
   - [ ] When `isLoading={true}`, dropdown cannot be opened
   - [ ] Spinner uses `animate-spin` class

2. **Error State:**
   - [ ] When `hasError={true}`, trigger border changes to red
   - [ ] Component remains functional despite error state
   - [ ] Error state is visual-only (doesn't block usage)

3. **Disabled State:**
   - [ ] When `disabled={true}`, trigger has reduced opacity
   - [ ] When `disabled={true}`, cursor shows not-allowed
   - [ ] When `disabled={true}`, dropdown cannot be opened

#### Acceptance Criteria
- [ ] Loading state displays correctly
- [ ] Error state displays correctly
- [ ] Disabled state prevents interaction
- [ ] States can be combined (e.g., loading + error)

---

### Task 5: Create Barrel Exports

**Effort:** XS (Extra Small)
**File:** `/src/components/guest/GuestLanguageSwitcher/index.ts`

#### Description
Create the barrel export file for the GuestLanguageSwitcher component to enable clean imports.

#### Implementation Details

```typescript
// /src/components/guest/GuestLanguageSwitcher/index.ts
// REQ-E04-008: GuestLanguageSwitcher barrel exports
// Last Modified: 2026-01-20

export { GuestLanguageSwitcher, default } from './GuestLanguageSwitcher';
export type {
  GuestLanguageSwitcherProps,
  LanguageOptionState,
} from './GuestLanguageSwitcher.types';
```

#### Acceptance Criteria
- [ ] File exports `GuestLanguageSwitcher` component
- [ ] File exports types
- [ ] Default export is available
- [ ] Import `{ GuestLanguageSwitcher }` from component directory works

---

### Task 6: Update Guest Components Barrel Export

**Effort:** XS (Extra Small)
**File:** `/src/components/guest/index.ts`

#### Description
Create or update the guest components barrel export to include GuestLanguageSwitcher, enabling imports like `import { GuestLanguageSwitcher } from '@/components/guest'`.

#### Implementation Details

**If file doesn't exist, create it:**

```typescript
// /src/components/guest/index.ts
// Guest-facing components barrel exports
// Last Modified: 2026-01-20

// GuestLanguageSwitcher - REQ-E04-008
export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type {
  GuestLanguageSwitcherProps,
  LanguageOptionState,
} from './GuestLanguageSwitcher';
```

**If file exists, add the exports:**

```typescript
// Add to existing exports
export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type {
  GuestLanguageSwitcherProps,
  LanguageOptionState,
} from './GuestLanguageSwitcher';
```

#### Acceptance Criteria
- [ ] File `/src/components/guest/index.ts` exists
- [ ] GuestLanguageSwitcher is exported
- [ ] Types are exported
- [ ] Import from `@/components/guest` works

---

### Task 7: Verify Build and TypeScript Compilation

**Effort:** XS (Extra Small)
**File Operations:** None (verification only)

#### Description
Run TypeScript compilation and Next.js build to verify the component integrates correctly with the codebase.

#### Steps

1. **Run TypeScript check:**
   ```bash
   npx tsc --noEmit
   ```

2. **Run Next.js build:**
   ```bash
   npm run build
   ```

3. **Verify no errors related to:**
   - GuestLanguageSwitcher imports
   - Radix UI dropdown imports
   - Type mismatches
   - Missing dependencies

#### Acceptance Criteria
- [ ] TypeScript compiles without errors
- [ ] Next.js build completes successfully
- [ ] No import resolution errors
- [ ] No type errors in new files

---

## File Summary

### Files to Create

| File Path | Task |
|-----------|------|
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.types.ts` | Task 2 |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Task 3 |
| `/src/components/guest/GuestLanguageSwitcher/index.ts` | Task 5 |
| `/src/components/guest/index.ts` | Task 6 (create if not exists) |

### Files to Reference (Read-Only)

| File Path | Usage |
|-----------|-------|
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Pattern reference |
| `/src/components/LanguageSwitcher/constants.ts` | `SUPPORTED_LOCALES`, `getLocaleByCode` |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | `SupportedLanguage` type |
| `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | Radix UI dropdown pattern |
| `/src/lib/utils.ts` | `cn()` utility function |

---

## Testing Checklist

### Manual Testing

1. **Visual Verification:**
   - [ ] Dropdown trigger displays correctly with flag and native name
   - [ ] Dropdown opens on click with all 6 languages
   - [ ] Flags render correctly for each language
   - [ ] Native names display correctly (Francais, Deutsch, etc.)
   - [ ] Available translations show green checkmark
   - [ ] Unavailable translations appear dimmed
   - [ ] Selected language has pink background (#FFEEEF)

2. **Interaction Testing:**
   - [ ] Clicking a language calls onLanguageChange with correct code
   - [ ] Clicking outside closes dropdown
   - [ ] Clicking unavailable language still triggers callback
   - [ ] Disabled state prevents all interaction

3. **Keyboard Testing:**
   - [ ] Arrow down opens dropdown and focuses first item
   - [ ] Arrow keys navigate between options
   - [ ] Enter/Space selects focused option
   - [ ] Escape closes dropdown
   - [ ] Tab closes dropdown and moves focus

4. **Accessibility Testing:**
   - [ ] Screen reader announces "Select language" on trigger
   - [ ] Screen reader announces language names and availability
   - [ ] Focus indicator is visible during keyboard navigation

5. **Responsive Testing:**
   - [ ] Touch targets are at least 44px on mobile
   - [ ] Compact mode works correctly
   - [ ] Dropdown doesn't overflow viewport

---

## Integration Example

After implementation, the component can be used in ItemDisplay.tsx:

```tsx
// In /src/components/ItemDisplay.tsx
import { GuestLanguageSwitcher } from '@/components/guest';

function ItemDisplay({ item, translationMeta }) {
  const { currentLanguage, setLanguage, availableTranslations, sourceLanguage } = useGuestLanguage({
    initialLanguage: translationMeta.displayLanguage,
    sourceLanguage: translationMeta.sourceLanguage,
    availableTranslations: translationMeta.availableTranslations,
  });

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-sm">
      <Logo />
      <GuestLanguageSwitcher
        currentLanguage={currentLanguage}
        availableTranslations={availableTranslations}
        sourceLanguage={sourceLanguage}
        onLanguageChange={setLanguage}
      />
    </header>
  );
}
```

---

## Dependencies Diagram

```
Task 1 (Directory Structure)
    │
    ├──> Task 2 (Types File)
    │         │
    │         └──> Task 3 (Main Component)
    │                   │
    │                   └──> Task 4 (Verify States)
    │                              │
    └──────────────────────────────┴──> Task 5 (Component Barrel)
                                              │
                                              └──> Task 6 (Guest Barrel)
                                                         │
                                                         └──> Task 7 (Build Verification)
```

---

## Success Criteria (From Overview)

- [x] Component renders dropdown with all 6 supported languages (Task 3)
- [x] Each option shows flag emoji and native name (Task 3)
- [x] Languages with translations show checkmark indicator (Task 3)
- [x] Languages without translations appear visually dimmed but remain selectable (Task 3)
- [x] Keyboard navigation works (arrow keys, enter, escape) (Task 3 - Radix UI)
- [x] Screen readers announce options correctly (Task 3 - ARIA attributes)
- [x] Selection triggers onLanguageChange callback with correct language code (Task 3)
- [x] Currently selected language is visually highlighted (Task 3)
- [x] Loading and error states render appropriately (Task 3, 4)
- [x] Component follows existing codebase patterns and styling (Task 3)
- [x] TypeScript compilation succeeds without errors (Task 7)

---

## References

- Overview Document: `/docs/REQ-E04-008-create-guestlanguageswitcher-component-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Phase 3, Task 3.1)
- Request Source: `/docs/gen_requests_epic4.md` (REQ-E04-008)
- Existing Pattern: `/src/components/LanguageSwitcher/` (full implementation reference)
- Radix UI Pattern: `/src/components/ItemManager/components/dialogs/SortMenu.tsx`
- Radix UI Docs: https://www.radix-ui.com/primitives/docs/components/dropdown-menu
