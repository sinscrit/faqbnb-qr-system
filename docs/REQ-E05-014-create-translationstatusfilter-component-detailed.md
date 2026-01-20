# Detailed Task Breakdown: REQ-E05-014 - Create TranslationStatusFilter Component

**Document Created:** 2026-01-20 18:30 UTC
**Last Modified:** 2026-01-20 18:30 UTC
**Request ID:** REQ-E05-014
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.3
**Size:** S (Small)
**Priority:** P2 - Medium
**Overview Document:** REQ-E05-014-create-translationstatusfilter-component-overview.md

---

## Summary

Create a `TranslationStatusFilter` dropdown component that allows property owners to filter content lists by translation status. The component provides six filter options using Radix UI DropdownMenu for accessibility and consistent UX with the existing `SortMenu` pattern.

---

## Prerequisites

Before starting implementation, verify the following:

### Required Dependencies (Should Exist)
- [ ] `@radix-ui/react-dropdown-menu` installed (^2.1.15)
- [ ] `lucide-react` installed (^0.525.0)
- [ ] `tailwindcss` configured (^4.x)
- [ ] `/src/lib/utils.ts` with `cn()` utility function

### Required Files from Previous Tasks
- [ ] `/src/lib/translation-service/translation-service.types.ts` exists with `TranslationStatus` type
- [ ] `/src/components/TranslationManagement/TranslationManagement.types.ts` exists with `TranslationFilterValue` type (from REQ-E05-006)

### If TranslationManagement.types.ts Does Not Exist
Create inline types within the component until REQ-E05-006 is complete, then refactor.

---

## Implementation Tasks

### Task 1: Create Component Types File [1 Story Point]

**File:** `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.types.ts`

**Objective:** Define all TypeScript interfaces, types, and constants for the TranslationStatusFilter component.

**Implementation Steps:**

1.1. Create the types file with proper header documentation:
```typescript
/**
 * TranslationStatusFilter Type Definitions
 * Part of REQ-E05-014: Create TranslationStatusFilter Component
 * Epic 5 - Owner Translation Management, Phase 3.3
 *
 * @module TranslationManagement/TranslationStatusFilter/types
 * @created 2026-01-20
 */
```

1.2. Define the `TranslationFilterValue` type (if not importing from shared types):
```typescript
/**
 * Filter values for translation status filtering.
 * Used by list components to filter content by translation coverage.
 */
export type TranslationFilterValue =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manually_edited';
```

1.3. Define the `FilterOptionItem` interface:
```typescript
/**
 * Configuration for a single filter option in the dropdown.
 */
export interface FilterOptionItem {
  /** Filter value used in state and API queries */
  value: TranslationFilterValue;
  /** Display label shown in dropdown */
  label: string;
  /** Optional description for tooltip or help text */
  description?: string;
  /** Tailwind color class for status indicator dot */
  iconColorClass?: string;
}
```

1.4. Define the `TRANSLATION_FILTER_OPTIONS` constant:
```typescript
/**
 * Available filter options with display configuration.
 * Order determines display order in dropdown.
 */
export const TRANSLATION_FILTER_OPTIONS: FilterOptionItem[] = [
  {
    value: 'all',
    label: 'All Items',
    description: 'Show all content regardless of translation status',
  },
  {
    value: 'fully_translated',
    label: 'Fully Translated',
    description: 'Items with translations for all 6 languages',
    iconColorClass: 'bg-green-500',
  },
  {
    value: 'partially_translated',
    label: 'Partially Translated',
    description: 'Items with some but not all languages translated',
    iconColorClass: 'bg-amber-500',
  },
  {
    value: 'pending',
    label: 'Pending',
    description: 'Items with translation jobs queued or in progress',
    iconColorClass: 'bg-orange-500',
  },
  {
    value: 'failed',
    label: 'Failed',
    description: 'Items with translation errors requiring attention',
    iconColorClass: 'bg-red-500',
  },
  {
    value: 'manually_edited',
    label: 'Manually Edited',
    description: 'Items with human-reviewed translations',
    iconColorClass: 'bg-violet-500',
  },
];
```

1.5. Define the `TranslationStatusFilterProps` interface:
```typescript
/**
 * Props for the TranslationStatusFilter component.
 */
export interface TranslationStatusFilterProps {
  /** Currently selected filter value */
  value: TranslationFilterValue;

  /** Callback when filter selection changes */
  onChange: (value: TranslationFilterValue) => void;

  /** Whether the filter is disabled */
  disabled?: boolean;

  /** Custom class name for the root element */
  className?: string;

  /** Custom class names for internal elements */
  classNames?: {
    trigger?: string;
    content?: string;
    item?: string;
    activeItem?: string;
  };

  /** Custom labels for i18n support */
  labels?: {
    filterLabel?: string;        // Default: "Filter by Translation Status"
    allItems?: string;           // Default: "All Items"
    fullyTranslated?: string;    // Default: "Fully Translated"
    partiallyTranslated?: string;// Default: "Partially Translated"
    pending?: string;            // Default: "Pending"
    failed?: string;             // Default: "Failed"
    manuallyEdited?: string;     // Default: "Manually Edited"
  };

  /** Dropdown alignment (default: 'end') */
  align?: 'start' | 'center' | 'end';

  /** Side of trigger to show dropdown (default: 'bottom') */
  side?: 'top' | 'bottom';
}
```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] All types are properly exported
- [ ] JSDoc comments are complete

---

### Task 2: Create Main Component [3 Story Points]

**File:** `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Objective:** Implement the TranslationStatusFilter dropdown component following the SortMenu pattern.

**Implementation Steps:**

2.1. Create file with header documentation:
```typescript
/**
 * TranslationStatusFilter Component
 *
 * Dropdown filter for filtering content lists by translation status.
 * Uses Radix UI DropdownMenu for accessible, keyboard-navigable menu.
 * Follows the pattern established in SortMenu.tsx.
 *
 * @module TranslationManagement/TranslationStatusFilter
 * @see docs/REQ-E05-014-create-translationstatusfilter-component-overview.md
 * @see src/components/ItemManager/components/dialogs/SortMenu.tsx (pattern reference)
 * @created 2026-01-20
 */

'use client';
```

2.2. Add imports:
```typescript
import { useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Filter, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TRANSLATION_FILTER_OPTIONS,
  type TranslationFilterValue,
  type TranslationStatusFilterProps,
} from './TranslationStatusFilter.types';
```

2.3. Implement helper function for getting current label:
```typescript
/**
 * Get display label for the current filter value.
 */
function getFilterLabel(value: TranslationFilterValue, labels: Record<string, string>): string {
  const labelMap: Record<TranslationFilterValue, string> = {
    all: labels.allItems ?? 'All Items',
    fully_translated: labels.fullyTranslated ?? 'Fully Translated',
    partially_translated: labels.partiallyTranslated ?? 'Partially Translated',
    pending: labels.pending ?? 'Pending',
    failed: labels.failed ?? 'Failed',
    manually_edited: labels.manuallyEdited ?? 'Manually Edited',
  };
  return labelMap[value] ?? 'All Items';
}
```

2.4. Implement default labels constant:
```typescript
const DEFAULT_LABELS = {
  filterLabel: 'Filter by Translation Status',
  allItems: 'All Items',
  fullyTranslated: 'Fully Translated',
  partiallyTranslated: 'Partially Translated',
  pending: 'Pending',
  failed: 'Failed',
  manuallyEdited: 'Manually Edited',
};
```

2.5. Implement the main component:
```typescript
/**
 * TranslationStatusFilter - Dropdown for filtering by translation status.
 *
 * Features:
 * - Accessible dropdown using Radix UI
 * - Visual indicator for current selection
 * - Colored dots for status categories
 * - Mobile-friendly touch targets (min 44px trigger, 48px items)
 * - Keyboard navigation support
 * - Auto-closes after selection
 * - i18n support via labels prop
 *
 * @example
 * <TranslationStatusFilter
 *   value={translationFilter}
 *   onChange={(value) => setTranslationFilter(value)}
 * />
 */
export function TranslationStatusFilter({
  value,
  onChange,
  disabled = false,
  className,
  classNames,
  labels = {},
  align = 'end',
  side = 'bottom',
}: TranslationStatusFilterProps) {
  // Merge default labels with custom labels
  const mergedLabels = { ...DEFAULT_LABELS, ...labels };

  // Get current filter display label
  const currentLabel = useMemo(
    () => getFilterLabel(value, mergedLabels),
    [value, mergedLabels]
  );

  return (
    <DropdownMenu.Root>
      {/* Trigger Button */}
      <DropdownMenu.Trigger asChild disabled={disabled}>
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
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            // Transition
            'transition-colors duration-150',
            // Mobile touch target (44px minimum)
            'min-h-[44px]',
            // Touch optimization
            'touch-manipulation [-webkit-tap-highlight-color:transparent]',
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed',
            // Custom classes
            className,
            classNames?.trigger
          )}
          aria-label={`${mergedLabels.filterLabel}, currently showing: ${currentLabel}`}
        >
          <Filter className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <span className="hidden sm:inline text-gray-700">Translation:</span>
          <span className="text-gray-900">{currentLabel}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      {/* Dropdown Portal */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            // Positioning and sizing
            'z-50 min-w-[240px] max-w-[300px]',
            // Visual styling
            'bg-white rounded-lg shadow-lg',
            'border border-gray-200',
            'py-1',
            // Animation
            'animate-fade-in',
            // Custom class
            classNames?.content
          )}
          align={align}
          side={side}
          sideOffset={4}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {mergedLabels.filterLabel}
            </p>
          </div>

          {/* Filter Options */}
          <DropdownMenu.RadioGroup
            value={value}
            onValueChange={(newValue) => onChange(newValue as TranslationFilterValue)}
          >
            {TRANSLATION_FILTER_OPTIONS.map((option) => {
              const isActive = value === option.value;
              // Get the custom label if provided
              const optionLabel = getFilterLabel(option.value, mergedLabels);

              return (
                <DropdownMenu.RadioItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    // Layout
                    'relative flex items-center gap-3',
                    'px-3 py-3 min-h-[48px]', // 48px touch target
                    // Typography
                    'text-sm cursor-pointer',
                    // Focus
                    'outline-none',
                    // Transitions
                    'transition-colors duration-100',
                    'focus:bg-gray-50',
                    // Active/inactive states
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50',
                    // Custom classes
                    classNames?.item,
                    isActive && classNames?.activeItem
                  )}
                >
                  {/* Checkmark Indicator */}
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isActive && (
                      <Check className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    )}
                  </div>

                  {/* Label */}
                  <span className="flex-1">{optionLabel}</span>

                  {/* Status Color Indicator (not shown for 'all') */}
                  {option.iconColorClass && (
                    <span
                      className={cn(
                        'w-2.5 h-2.5 rounded-full flex-shrink-0',
                        option.iconColorClass
                      )}
                      aria-hidden="true"
                    />
                  )}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default TranslationStatusFilter;
```

**Verification:**
- [ ] Component renders without errors
- [ ] Dropdown opens on click
- [ ] All 6 filter options are visible
- [ ] Selection changes value and fires onChange
- [ ] Dropdown auto-closes after selection
- [ ] Keyboard navigation works (ArrowUp, ArrowDown, Enter, Escape)
- [ ] Focus ring visible on trigger button
- [ ] Colored dots display for each status option
- [ ] Checkmark appears on selected option
- [ ] Component is disabled when disabled prop is true

---

### Task 3: Create Barrel Export [0.5 Story Points]

**File:** `/src/components/TranslationManagement/TranslationStatusFilter/index.ts`

**Objective:** Create barrel export for clean imports.

**Implementation:**
```typescript
/**
 * TranslationStatusFilter Module Exports
 * @module TranslationManagement/TranslationStatusFilter
 * @created 2026-01-20
 */

export { TranslationStatusFilter, default } from './TranslationStatusFilter';
export type {
  TranslationStatusFilterProps,
  TranslationFilterValue,
  FilterOptionItem,
} from './TranslationStatusFilter.types';
export { TRANSLATION_FILTER_OPTIONS } from './TranslationStatusFilter.types';
```

**Verification:**
- [ ] Named export works: `import { TranslationStatusFilter } from './TranslationStatusFilter'`
- [ ] Default export works: `import TranslationStatusFilter from './TranslationStatusFilter'`
- [ ] Types export works: `import type { TranslationFilterValue } from './TranslationStatusFilter'`
- [ ] Constants export works: `import { TRANSLATION_FILTER_OPTIONS } from './TranslationStatusFilter'`

---

### Task 4: Update TranslationManagement Index [0.5 Story Points]

**File:** `/src/components/TranslationManagement/index.ts`

**Objective:** Add TranslationStatusFilter export to the TranslationManagement barrel.

**Implementation Steps:**

4.1. If file does not exist, create it:
```typescript
/**
 * TranslationManagement Module Exports
 * @module TranslationManagement
 * @created 2026-01-20
 */

// TranslationStatusFilter - Filter dropdown for translation status
export * from './TranslationStatusFilter';
```

4.2. If file exists, add the export:
```typescript
// Add to existing exports
export * from './TranslationStatusFilter';
```

**Verification:**
- [ ] Import from barrel works: `import { TranslationStatusFilter } from '@/components/TranslationManagement'`
- [ ] No duplicate exports or naming conflicts

---

### Task 5: Create Directory Structure [0.5 Story Points]

**Objective:** Ensure proper directory structure exists.

**Implementation Steps:**

5.1. Create directories if they don't exist:
```bash
mkdir -p src/components/TranslationManagement/TranslationStatusFilter
```

5.2. Verify directory structure:
```
/src/components/TranslationManagement/
├── index.ts                              # Module barrel (create/update)
├── TranslationManagement.types.ts        # Shared types (may exist from REQ-E05-006)
│
└── TranslationStatusFilter/
    ├── index.ts                          # Task 3
    ├── TranslationStatusFilter.tsx       # Task 2
    └── TranslationStatusFilter.types.ts  # Task 1
```

**Verification:**
- [ ] All directories exist
- [ ] All files are in correct locations

---

## File Changes Summary

### Files to Create

| File Path | Task | Purpose |
|-----------|------|---------|
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.types.ts` | Task 1 | Type definitions and constants |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Task 2 | Main component implementation |
| `/src/components/TranslationManagement/TranslationStatusFilter/index.ts` | Task 3 | Barrel export |

### Files to Modify

| File Path | Task | Modification |
|-----------|------|--------------|
| `/src/components/TranslationManagement/index.ts` | Task 4 | Add TranslationStatusFilter export |

### Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | Radix UI DropdownMenu pattern |
| `/src/lib/translation-service/translation-service.types.ts` | TranslationStatus type reference |
| `/src/lib/utils.ts` | cn() utility function |

---

## Testing Checklist

### Manual Testing

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Render default state | Mount component with value='all' | Shows "All Items" selected |
| Click trigger | Click the filter button | Dropdown opens with 6 options |
| Select option | Click "Fully Translated" | Dropdown closes, onChange fired with 'fully_translated' |
| Keyboard open | Focus trigger, press Enter/Space | Dropdown opens |
| Keyboard navigate | Arrow keys in open dropdown | Selection moves between options |
| Keyboard select | Press Enter on option | Option selected, dropdown closes |
| Keyboard close | Press Escape | Dropdown closes without changing value |
| Disabled state | Set disabled=true | Button grayed out, not clickable |
| Custom labels | Pass labels prop | Custom text displays in dropdown |
| Status indicators | Open dropdown | Colored dots visible next to each status option |
| Checkmark indicator | Select an option | Checkmark shows on selected option only |

### Accessibility Testing

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Screen reader | Navigate with VoiceOver/NVDA | Announces filter label and options |
| Focus visible | Tab to trigger button | Clear focus ring visible |
| ARIA labels | Inspect with DevTools | aria-label includes current selection |
| Keyboard-only | Complete selection without mouse | Fully operational via keyboard |

### Integration Testing (After Future Integration)

| Test Case | Parent Component | Expected Result |
|-----------|------------------|-----------------|
| ItemManager integration | ItemManager filters section | Filter changes update item list |
| URL sync (optional) | Page with query params | Filter value syncs to URL |
| Combined filters | Multiple active filters | Works with search, sort, other filters |

---

## Acceptance Criteria Mapping

| Acceptance Criteria (from REQ-E05-015) | Implementation Task |
|----------------------------------------|---------------------|
| Dropdown renders as select input with clear label | Task 2 - trigger button with "Filter by Translation Status" |
| Displays six options | Task 1 - TRANSLATION_FILTER_OPTIONS constant |
| "All Items" shows all content (default) | Task 2 - default value handling |
| "Fully Translated" option | Task 1 - filter options |
| "Partially Translated" option | Task 1 - filter options |
| "Pending" option | Task 1 - filter options |
| "Failed" option | Task 1 - filter options |
| "Manually Edited" option | Task 1 - filter options |
| Selection triggers immediate re-filtering | Task 2 - onChange callback |
| Keyboard accessible | Task 2 - Radix UI RadioGroup |
| Proper ARIA labels and roles | Task 2 - aria-label attribute |
| Styling matches design system | Task 2 - Tailwind classes from SortMenu |
| Responsive for mobile viewports | Task 2 - min-h-[44px], touch targets |

---

## Effort Estimate

| Task | Story Points | Confidence |
|------|--------------|------------|
| Task 1: Create Component Types | 1 | High |
| Task 2: Create Main Component | 3 | High |
| Task 3: Create Barrel Export | 0.5 | High |
| Task 4: Update TranslationManagement Index | 0.5 | High |
| Task 5: Create Directory Structure | 0.5 | High |
| **Total** | **5.5** | High |

**Estimated Time:** 2-3 hours for implementation + 30 minutes for testing

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationManagement.types.ts not ready | Medium | Low | Inline types in component, refactor later |
| Radix UI version mismatch | Low | Medium | Check package.json, use compatible API |
| Animation class not defined | Low | Low | Add `animate-fade-in` to Tailwind config or remove |
| cn() utility not available | Low | High | Verify `/src/lib/utils.ts` exists, use clsx directly if needed |

---

## Implementation Order

Execute tasks in this order:

1. **Task 5** - Create directory structure
2. **Task 1** - Create types file (no dependencies)
3. **Task 2** - Create main component (depends on Task 1)
4. **Task 3** - Create barrel export (depends on Tasks 1, 2)
5. **Task 4** - Update parent barrel (depends on Task 3)

---

## Post-Implementation Checklist

After all tasks are complete:

- [ ] Run `npm run build` - no TypeScript errors
- [ ] Run `npm run lint` - no linting errors
- [ ] Manually test component in Storybook or test page
- [ ] Verify all 6 filter options render correctly
- [ ] Verify keyboard navigation works
- [ ] Verify mobile touch targets (44px trigger, 48px items)
- [ ] Verify dropdown positioning (does not overflow viewport)
- [ ] Commit changes with message: `feat(l10n): add TranslationStatusFilter component (REQ-E05-014)`

---

## Usage Example

After implementation, the component can be used as follows:

```tsx
'use client';

import { useState } from 'react';
import { TranslationStatusFilter } from '@/components/TranslationManagement';
import type { TranslationFilterValue } from '@/components/TranslationManagement';

function ItemListFilters() {
  const [translationFilter, setTranslationFilter] = useState<TranslationFilterValue>('all');

  return (
    <div className="flex items-center gap-3">
      {/* Other filters... */}
      <TranslationStatusFilter
        value={translationFilter}
        onChange={setTranslationFilter}
      />
      {/* Sort menu... */}
    </div>
  );
}
```

---

## References

- Overview Document: `docs/REQ-E05-014-create-translationstatusfilter-component-overview.md`
- Request: `docs/gen_requests_epic5.md` - REQ-E05-015
- Implementation Plan: `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Pattern Reference: `src/components/ItemManager/components/dialogs/SortMenu.tsx`
- Translation Types: `src/lib/translation-service/translation-service.types.ts`
- [Radix UI DropdownMenu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)

---

*Detailed task breakdown generated for FAQBNB Localization Epic 5 - REQ-E05-014*
