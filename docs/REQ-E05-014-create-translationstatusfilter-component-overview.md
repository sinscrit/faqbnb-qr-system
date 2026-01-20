# Implementation Overview: REQ-E05-014 - Create TranslationStatusFilter Component

**Document Created:** 2026-01-20 17:00 UTC
**Last Modified:** 2026-01-20 17:00 UTC
**Request ID:** REQ-E05-014
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.3
**Size:** S (Small)
**Priority:** P2 - Medium

---

## Summary

Create a TranslationStatusFilter dropdown component that allows property owners to filter content lists by translation status. The dropdown provides six filter options (All Items, Fully Translated, Partially Translated, Pending, Failed, Manually Edited) and integrates with ItemManager, ArticleList, and other list container components to narrow displayed content based on translation coverage.

---

## Dependencies

### Epic Dependencies
| Dependency | Status | Description |
|------------|--------|-------------|
| Epic 1 - Foundation | Required | Translation tables, language types, translation service |
| Epic 3 - Dynamic Content Translation | Required | Translation trigger system, status tracking |
| REQ-E05-005 | Required | TranslationManagement.types.ts shared type definitions |
| REQ-E05-011 | Recommended | useTranslationStatus hook for data fetching integration |

### Package Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-dropdown-menu` | ^2.1.15 | Accessible dropdown menu primitive |
| `lucide-react` | ^0.525.0 | Filter and check icons |
| `tailwindcss` | ^4.x | Styling classes |

---

## Technical Context

### Existing Patterns to Follow

1. **SortMenu Component** (`/src/components/ItemManager/components/dialogs/SortMenu.tsx`)
   - Primary pattern reference for single-select Radix UI dropdown
   - Uses `DropdownMenu.Root`, `DropdownMenu.Trigger`, `DropdownMenu.Portal`, `DropdownMenu.Content`
   - `RadioGroup` for single selection with automatic state management
   - Checkmark indicators for active selection
   - Touch targets: 44px minimum trigger, 48px dropdown items
   - Labels with JSDoc comments and i18n support via `labels` prop
   - `align` and `side` positioning props

2. **FilterPanel Component** (`/src/components/ItemManager/components/dialogs/FilterPanel.tsx`)
   - Orchestrates multiple filter types
   - Active filter count badge pattern
   - "Clear All" functionality
   - Desktop inline panel and mobile drawer modes

3. **TagFilter Component** (`/src/components/ItemManager/components/dialogs/TagFilter.tsx`)
   - Custom dropdown with click-outside detection
   - Search input inside dropdown (not needed for 6 static options)
   - Focus management on open
   - Keyboard support (Escape, Enter)

4. **LocationFilter Component** (`/src/components/ItemManager/components/dialogs/LocationFilter.tsx`)
   - Single-select dropdown pattern
   - Clear button outside main button to avoid nesting
   - Check icon indicator for selected item

### Translation Service Types
From `/src/lib/translation-service/translation-service.types.ts`:
- `SupportedLanguage`: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
- `TranslationStatus`: `'pending' | 'processing' | 'completed' | 'failed' | 'manual'`
- 6 languages total for "Fully Translated" logic

### TranslationManagement Types
From `/src/components/TranslationManagement/TranslationManagement.types.ts` (REQ-E05-005):
```typescript
export type TranslationFilterValue =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manually_edited';

export interface TranslationStatusFilterProps {
  /** Currently selected filter value */
  value: TranslationFilterValue;
  /** Change handler */
  onChange: (value: TranslationFilterValue) => void;
  /** Optional CSS class */
  className?: string;
}
```

---

## Component Architecture

### File Structure
```
/src/components/TranslationManagement/
├── TranslationStatusFilter/
│   ├── index.ts                           # Barrel exports
│   ├── TranslationStatusFilter.tsx        # Main component
│   └── TranslationStatusFilter.types.ts   # Component-specific types (optional)
```

### Props Interface
```typescript
import type { TranslationFilterValue } from '../TranslationManagement.types';

/**
 * Props for TranslationStatusFilter component.
 * Dropdown filter for filtering content lists by translation status.
 */
export interface TranslationStatusFilterProps {
  /** Currently selected filter value */
  value: TranslationFilterValue;

  /** Change handler when filter selection changes */
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

  /** Alignment of dropdown (default: 'end') */
  align?: 'start' | 'center' | 'end';

  /** Side of trigger to show dropdown (default: 'bottom') */
  side?: 'top' | 'bottom';
}
```

### Filter Options Configuration
```typescript
/**
 * Filter option definition for the dropdown.
 */
export interface FilterOptionItem {
  /** Filter value used in state/API */
  value: TranslationFilterValue;
  /** Display label */
  label: string;
  /** Optional description for tooltip/help */
  description?: string;
  /** Optional icon color class */
  iconColorClass?: string;
}

/**
 * Available filter options with their display configuration.
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
    iconColorClass: 'text-green-500',
  },
  {
    value: 'partially_translated',
    label: 'Partially Translated',
    description: 'Items with some but not all languages translated',
    iconColorClass: 'text-amber-500',
  },
  {
    value: 'pending',
    label: 'Pending',
    description: 'Items with translation jobs queued or in progress',
    iconColorClass: 'text-orange-500',
  },
  {
    value: 'failed',
    label: 'Failed',
    description: 'Items with translation errors requiring attention',
    iconColorClass: 'text-red-500',
  },
  {
    value: 'manually_edited',
    label: 'Manually Edited',
    description: 'Items with human-reviewed translations',
    iconColorClass: 'text-violet-500',
  },
];
```

### Component Behavior

1. **Visual Display**
   - Renders as a Radix UI DropdownMenu trigger button
   - Shows filter icon (Lucide `Filter` or `ListFilter`)
   - Displays current selection label: "Translation: All Items"
   - ChevronDown indicator for dropdown affordance
   - 44px minimum touch target for trigger button

2. **Dropdown Content**
   - 6 radio items in RadioGroup for single selection
   - Checkmark indicator for currently selected option
   - Optional colored dot/icon per option matching status colors
   - 48px touch targets for dropdown items
   - Smooth animation on open/close (`animate-fade-in`)

3. **Selection Behavior**
   - Single-select only (radio group)
   - Immediately fires `onChange` callback with selected value
   - Dropdown auto-closes after selection
   - Selection persists in component state during session

4. **Accessibility**
   - Full keyboard navigation via Radix UI
   - `aria-label` on trigger: "Filter by translation status, currently showing: All Items"
   - Proper `role="option"` on items
   - Focus management with visible focus ring

5. **Integration**
   - Works with parent list components (ItemManager, ArticleList)
   - Parent applies filter value to data fetching or client-side filtering
   - Optional integration with URL query parameters for shareable filters

---

## Implementation Tasks

### Task 1: Create Component Types (Optional)
**File:** `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.types.ts`
- Define `TranslationStatusFilterProps` interface (extends shared types)
- Define `FilterOptionItem` interface
- Export `TRANSLATION_FILTER_OPTIONS` constant array

### Task 2: Create Main Component
**File:** `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Key implementation steps:
1. Import Radix UI DropdownMenu and Lucide icons
2. Import shared types from `TranslationManagement.types.ts`
3. Define default labels object for i18n
4. Implement trigger button with filter icon and current selection label
5. Implement dropdown content with RadioGroup
6. Map `TRANSLATION_FILTER_OPTIONS` to RadioItem components
7. Add checkmark indicator for active selection
8. Handle `onChange` callback in `onValueChange`
9. Apply proper styling classes matching SortMenu pattern
10. Add accessibility attributes

```typescript
// Component structure outline
'use client';

import { useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Filter, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranslationFilterValue } from '../TranslationManagement.types';
import { TRANSLATION_FILTER_OPTIONS, type FilterOptionItem } from './TranslationStatusFilter.types';

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
  // Merge default labels
  const mergedLabels = {
    filterLabel: 'Filter by Translation Status',
    allItems: 'All Items',
    fullyTranslated: 'Fully Translated',
    partiallyTranslated: 'Partially Translated',
    pending: 'Pending',
    failed: 'Failed',
    manuallyEdited: 'Manually Edited',
    ...labels,
  };

  // Get current filter display label
  const currentLabel = useMemo(() => {
    const option = TRANSLATION_FILTER_OPTIONS.find((o) => o.value === value);
    return option?.label ?? mergedLabels.allItems;
  }, [value, mergedLabels.allItems]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        {/* Trigger button with Filter icon and current selection */}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align={align} side={side} sideOffset={4}>
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
            {TRANSLATION_FILTER_OPTIONS.map((option) => (
              <DropdownMenu.RadioItem key={option.value} value={option.value}>
                {/* Checkmark, label, optional status color indicator */}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

### Task 3: Create Barrel Export
**File:** `/src/components/TranslationManagement/TranslationStatusFilter/index.ts`
```typescript
export { TranslationStatusFilter } from './TranslationStatusFilter';
export type { TranslationStatusFilterProps } from './TranslationStatusFilter.types';
export { TRANSLATION_FILTER_OPTIONS } from './TranslationStatusFilter.types';
```

### Task 4: Update TranslationManagement Index
**File:** `/src/components/TranslationManagement/index.ts`
- Add export for TranslationStatusFilter module:
```typescript
export * from './TranslationStatusFilter';
```

---

## Visual Specification

### Trigger Button
```
┌────────────────────────────────────────┐
│  🔍  Translation: All Items     ▼     │  (44px height, border, rounded)
└────────────────────────────────────────┘
```

### Dropdown Content
```
┌────────────────────────────────────────┐
│ FILTER BY TRANSLATION STATUS            │  (header, gray text)
├────────────────────────────────────────┤
│ ✓  All Items                            │  (48px, active state)
│    Fully Translated          ●          │  (green dot)
│    Partially Translated      ●          │  (amber dot)
│    Pending                   ●          │  (orange dot)
│    Failed                    ●          │  (red dot)
│    Manually Edited           ●          │  (purple dot)
└────────────────────────────────────────┘
```

### Status Color Indicators
| Filter Value | Color | Tailwind Class | Hex |
|--------------|-------|----------------|-----|
| Fully Translated | Green | `bg-green-500` | #10b981 |
| Partially Translated | Amber | `bg-amber-500` | #f59e0b |
| Pending | Orange | `bg-orange-500` | #f97316 |
| Failed | Red | `bg-red-500` | #ef4444 |
| Manually Edited | Purple | `bg-violet-500` | #a855f7 |

---

## Integration Points

### With ItemManager
```tsx
// In ItemManager or its filter controls
import { TranslationStatusFilter } from '@/components/TranslationManagement';

function ItemListFilters() {
  const [translationFilter, setTranslationFilter] = useState<TranslationFilterValue>('all');

  return (
    <div className="flex items-center gap-3">
      {/* Existing filters: search, tags, etc. */}
      <TranslationStatusFilter
        value={translationFilter}
        onChange={setTranslationFilter}
      />
      <SortMenu currentSort={sortBy} onSortChange={setSortBy} />
    </div>
  );
}
```

### With Data Fetching
```tsx
// Filter integration with useTranslationStatus or API queries
const { items } = useTranslationStatus({
  propertyId,
  status: translationFilter !== 'all' ? translationFilter : undefined,
});
```

### With URL Query Parameters (Optional Enhancement)
```tsx
// Shareable filtered views
import { useSearchParams, useRouter } from 'next/navigation';

function ItemListWithFilterURL() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const translationFilter = (searchParams.get('translation') as TranslationFilterValue) || 'all';

  const handleFilterChange = (value: TranslationFilterValue) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete('translation');
    } else {
      params.set('translation', value);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <TranslationStatusFilter
      value={translationFilter}
      onChange={handleFilterChange}
    />
  );
}
```

---

## Authorized Files and Functions for Modification

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusFilter/index.ts` | Barrel export |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Main component |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.types.ts` | Component types and constants |

### Files to Modify
| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/index.ts` | Add TranslationStatusFilter export |

### Files for Reference Only (Do Not Modify)
| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | Radix UI dropdown pattern |
| `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Filter orchestration pattern |
| `/src/components/ItemManager/components/dialogs/TagFilter.tsx` | Custom dropdown pattern |
| `/src/components/ItemManager/components/dialogs/LocationFilter.tsx` | Single-select pattern |
| `/src/lib/translation-service/translation-service.types.ts` | Translation status types |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared type definitions |

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Dropdown renders as select input with clear label | Task 2 - trigger button with "Filter by Translation Status" |
| Displays six options: All, Fully, Partially, Pending, Failed, Manually Edited | Task 1/2 - TRANSLATION_FILTER_OPTIONS constant |
| "All Items" shows all content regardless of status (default) | Task 2 - default value handling |
| "Fully Translated" shows items with all 6 languages complete | API/parent filtering logic |
| "Partially Translated" shows items with some languages complete | API/parent filtering logic |
| "Pending" shows items with queued or in-progress jobs | API/parent filtering logic |
| "Failed" shows items with translation errors | API/parent filtering logic |
| "Manually Edited" shows items with human-reviewed translations | API/parent filtering logic |
| Selection triggers immediate re-filtering without page reload | Task 2 - onChange callback |
| Filtered item count displays (e.g., "Showing 12 of 45 items") | Parent component responsibility |
| Filter persists during session | Task 2 - controlled via props from parent |
| Filter resets to "All Items" when navigating away | Parent component responsibility |
| Component accepts onChange callback | Task 1/2 - Props interface |
| Component accepts optional currentFilter prop (controlled) | Task 1/2 - value prop |
| Dropdown is keyboard accessible | Task 2 - Radix UI RadioGroup |
| Proper ARIA labels and roles | Task 2 - aria-label, role="option" |
| Styling matches application design system | Task 2 - Tailwind classes from SortMenu |
| Displays correctly in ItemManager and other list containers | Integration section |
| Responsive for mobile viewports | Task 2 - min-h-[44px], touch optimization |
| Loading state during filter application | Parent component responsibility |
| Empty state message when filter produces zero results | Parent component responsibility |
| Positioning aligns with other list controls | Task 2 - flex layout integration |
| URL query parameters for shareable filtered views (optional) | Integration section - enhancement |
| Works with other active filters | Parent component responsibility |

---

## Testing Considerations

### Unit Tests
- Renders with all six filter options
- Default selection is "All Items" when value prop is 'all'
- Checkmark indicator shows on currently selected option
- onChange callback fires with correct value when option selected
- Keyboard navigation (ArrowDown, ArrowUp, Enter) works
- Disabled state prevents interaction
- Custom labels override defaults

### Integration Tests
- Filter integrates correctly with ItemManager
- Selection updates parent state
- Combined with other filters (search, tags) works correctly
- URL query parameter sync (if implemented)

### Accessibility Tests
- Screen reader announces filter label and options
- Focus management on dropdown open/close
- Escape key closes dropdown
- Tab navigation works correctly

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationManagement types file not ready | Medium | Medium | Inline types in component, refactor later |
| Parent filtering logic complex | Low | Medium | Component only handles UI; parent handles data filtering |
| Performance with many items | Low | Low | Filter is instant; actual filtering handled by parent |
| Mobile dropdown positioning | Low | Low | Radix UI handles positioning automatically |

---

## Notes

1. **Component Responsibility:** This component is purely a UI filter selector. The actual filtering logic (checking language counts, status values) is the responsibility of the parent component or data-fetching layer.

2. **Filter Value Semantics:**
   - `'all'` - No filtering applied
   - `'fully_translated'` - All 6 supported languages have `status: 'completed'`
   - `'partially_translated'` - At least 1 but fewer than 6 languages have `status: 'completed'`
   - `'pending'` - At least 1 language has `status: 'pending'` or `status: 'processing'`
   - `'failed'` - At least 1 language has `status: 'failed'`
   - `'manually_edited'` - At least 1 language has `status: 'manual'`

3. **Radix UI Choice:** Using Radix UI DropdownMenu instead of a custom dropdown provides:
   - Built-in accessibility (ARIA, keyboard navigation)
   - Portal-based rendering (no overflow issues)
   - Automatic positioning and collision detection
   - Focus management

4. **i18n Support:** The `labels` prop allows full customization of all text strings for internationalization, matching the pattern used in SortMenu.

---

## References

- Request: `/docs/gen_requests_epic5.md` - REQ-E05-015
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Translation Types: `/src/lib/translation-service/translation-service.types.ts`
- SortMenu Pattern: `/src/components/ItemManager/components/dialogs/SortMenu.tsx`
- Radix UI DropdownMenu: https://www.radix-ui.com/primitives/docs/components/dropdown-menu
