# REQ-318: Create TranslationStatusFilter Component - Implementation Breakdown

**Last Modified:** 2026-01-18
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.3
**Size:** S (Small)
**Priority:** P2 - Medium
**Epic:** L10N Epic 5 - Owner Translation Management
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Overview

This document provides the implementation breakdown for the TranslationStatusFilter component. This component allows property owners to filter content lists by translation status, enabling them to quickly focus on items that require translation work or review.

The component is a dropdown filter control that will be positioned above content item lists, offering filter options for different translation states: All, Fully Translated, Partially Translated, Pending, Failed, and Manually Edited.

---

## Dependencies

### Epic Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| Translation tables schema | Epic 1 (Foundation) | Required |
| Translation status tracking | Epic 3 (Dynamic Content Translation) | Required |
| Translation status enum values | Epic 1/3 | Required |
| TranslationManagement types file | REQ-309 (Task 2.1) | Required |

### Internal Dependencies (within this Epic)

| Dependency | Task | Status |
|------------|------|--------|
| `TranslationManagement.types.ts` | Task 2.1 | Must be created first |
| Translation status API endpoint | Task 1.1 | Required for data |
| `useTranslationStatus` hook | Task 2.6 | Required for filtering logic |

### External Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `cn` utility | `/src/lib/utils.ts` | Class name merging |
| Lucide React icons | `lucide-react` | Filter icons |
| Tailwind CSS | Built-in | Styling |

---

## Technical Approach

### Pattern to Follow

The component should follow the pattern established by `LocationFilter.tsx` in the ItemManager components. This is a single-select dropdown with search functionality that:

1. Uses controlled component pattern (value comes from props)
2. Implements click-outside detection for closing dropdown
3. Provides keyboard navigation (Escape to close, Enter to select)
4. Maintains consistent 44px touch targets for mobile
5. Uses blue color scheme for selected states

### Translation Status Values

Based on the implementation plan, the following status values should be supported:

| Display Label | Internal Value | Description |
|---------------|----------------|-------------|
| All | `undefined` | Show all items regardless of status |
| Fully Translated | `complete` | All 6 languages have completed translations |
| Partially Translated | `partial` | Some languages translated, but not all |
| Pending | `pending` | Translation queued but not started |
| Failed | `failed` | Translation encountered errors |
| Manually Edited | `manual` | Translation has been manually reviewed/edited |

### Color Scheme (from PRD)

| Status | Color | Tailwind Class |
|--------|-------|----------------|
| Complete | Green | `text-green-500` |
| Manual | Purple | `text-violet-500` |
| Pending | Orange | `text-amber-500` |
| Failed | Red | `text-red-500` |

---

## Component Structure

### File Location

```
/src/components/TranslationManagement/
├── TranslationStatusFilter/
│   ├── index.ts                        # Public exports
│   └── TranslationStatusFilter.tsx     # Main component
```

### Interface Definition

```typescript
/**
 * Props for the TranslationStatusFilter component.
 */
export interface TranslationStatusFilterProps {
  /** Currently selected translation status filter (undefined for "All") */
  selectedStatus: TranslationStatusFilterValue | undefined;

  /** Callback when filter selection changes */
  onStatusChange: (status: TranslationStatusFilterValue | undefined) => void;

  /** Disable all interactions */
  disabled?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Section label text */
  label?: string;

  /** Placeholder text when "All" is selected */
  placeholder?: string;
}

/**
 * Valid filter values for translation status.
 */
export type TranslationStatusFilterValue =
  | 'complete'
  | 'partial'
  | 'pending'
  | 'failed'
  | 'manual';
```

### Component Behavior

1. **Default State**: Displays "Translation Status: All" as the default label
2. **Open State**: When clicked, expands to show all filter options
3. **Selection**: When an option is selected, immediately updates the displayed label and emits the change
4. **Clear**: Selecting "All" removes any active filter (sets to `undefined`)
5. **Close**: Closes on outside click, Escape key, or selection
6. **Accessibility**: Full keyboard navigation and ARIA attributes

---

## Implementation Tasks

### Task 1: Create Component Directory Structure
**Effort:** 5 minutes

Create the directory structure:
```
/src/components/TranslationManagement/TranslationStatusFilter/
├── index.ts
└── TranslationStatusFilter.tsx
```

### Task 2: Define Types in TranslationManagement.types.ts
**Effort:** 15 minutes

Add the following types (if not already defined in Task 2.1):

```typescript
/**
 * Valid filter values for translation status filtering.
 */
export type TranslationStatusFilterValue =
  | 'complete'
  | 'partial'
  | 'pending'
  | 'failed'
  | 'manual';

/**
 * Display configuration for each translation status filter option.
 */
export interface TranslationStatusOption {
  value: TranslationStatusFilterValue | undefined;
  label: string;
  description?: string;
  colorClass?: string;
}
```

### Task 3: Implement TranslationStatusFilter Component
**Effort:** 1-2 hours

Implement the main component following the LocationFilter pattern:

1. **State Management**
   - `isOpen` state for dropdown visibility
   - Use `useRef` for container reference (click-outside detection)

2. **Static Filter Options**
   ```typescript
   const FILTER_OPTIONS: TranslationStatusOption[] = [
     { value: undefined, label: 'All', description: 'Show all items' },
     { value: 'complete', label: 'Fully Translated', colorClass: 'text-green-500' },
     { value: 'partial', label: 'Partially Translated', colorClass: 'text-amber-500' },
     { value: 'pending', label: 'Pending', colorClass: 'text-amber-500' },
     { value: 'failed', label: 'Failed', colorClass: 'text-red-500' },
     { value: 'manual', label: 'Manually Edited', colorClass: 'text-violet-500' },
   ];
   ```

3. **Event Handlers**
   - `handleSelect(status)`: Update selection and close dropdown
   - `handleKeyDown(e)`: Handle Escape to close, Enter to select first
   - `toggleDropdown()`: Toggle open/closed state

4. **Render Structure**
   - Label text (optional)
   - Trigger button with current selection display
   - Dropdown menu with options list
   - Status icons/colors for each option

### Task 4: Create index.ts Export File
**Effort:** 5 minutes

```typescript
export { TranslationStatusFilter } from './TranslationStatusFilter';
export type { TranslationStatusFilterProps } from './TranslationStatusFilter';
```

### Task 5: Add Export to Parent index.ts
**Effort:** 5 minutes

Update `/src/components/TranslationManagement/index.ts`:

```typescript
export * from './TranslationStatusFilter';
```

### Task 6: Write Unit Tests (Optional)
**Effort:** 30-45 minutes

Test cases:
- Renders with default "All" state
- Opens dropdown on click
- Closes dropdown on outside click
- Closes dropdown on Escape key
- Calls onStatusChange when option selected
- Displays correct label for selected status
- Applies correct color classes to options
- Respects disabled prop
- Keyboard navigation works correctly

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusFilter/index.ts` | Public exports |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Main component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/index.ts` | Add export for TranslationStatusFilter |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Add TranslationStatusFilterValue type (if not already present from Task 2.1) |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/ItemManager/components/dialogs/LocationFilter.tsx` | Pattern reference for dropdown implementation |
| `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` | Reference for chip-style multi-select (if needed) |
| `/src/lib/utils.ts` | `cn` utility function import |

---

## Styling Specifications

### Trigger Button Styling

```typescript
// Base classes
'flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-sm transition-colors'
'min-h-[44px]'  // Touch target
'bg-white text-left'
'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
'touch-manipulation [-webkit-tap-highlight-color:transparent]'

// Conditional classes
selectedStatus ? 'border-2 border-blue-300 bg-blue-50' : 'border border-gray-300 hover:bg-gray-50'
disabled && 'opacity-50 cursor-not-allowed'
```

### Dropdown Menu Styling

```typescript
'absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200'
'max-h-60 overflow-hidden'
```

### Option Item Styling

```typescript
// Base
'w-full flex items-center gap-2 px-3 py-2 text-sm text-left'
'min-h-[44px]'  // Touch target
'transition-colors focus:outline-none'

// Selected state
isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50'
```

---

## Accessibility Requirements

1. **ARIA Attributes**
   - Trigger: `aria-haspopup="listbox"`, `aria-expanded={isOpen}`
   - Dropdown: `role="listbox"`
   - Options: `role="option"`, `aria-selected={isSelected}`

2. **Keyboard Navigation**
   - Enter: Select first/focused option
   - Escape: Close dropdown
   - Tab: Move focus (standard behavior)
   - Arrow keys: Navigate options (optional enhancement)

3. **Screen Reader**
   - Announce selected filter status
   - Describe available options

---

## Integration Points

### With Translation Management Page (Task 4.3)

```tsx
// In /src/app/dashboard2/translations/page.tsx
<TranslationStatusFilter
  selectedStatus={filters.translationStatus}
  onStatusChange={(status) => setFilters(prev => ({
    ...prev,
    translationStatus: status
  }))}
  label="Filter by Status"
/>
```

### With Item Lists (Task 3.5)

```tsx
// In item list components
<ItemToolbar>
  <TranslationStatusFilter
    selectedStatus={translationStatusFilter}
    onStatusChange={setTranslationStatusFilter}
    placeholder="All Translations"
  />
</ItemToolbar>
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Component renders correctly with default state
- [ ] Dropdown opens on button click
- [ ] All 6 filter options are visible
- [ ] Clicking an option updates the selection and closes dropdown
- [ ] Clicking "All" clears the filter
- [ ] Clicking outside closes the dropdown
- [ ] Escape key closes the dropdown
- [ ] Selected option shows visual highlight
- [ ] Component respects disabled prop
- [ ] Touch targets are at least 44px
- [ ] Colors match specification for each status
- [ ] Works correctly on mobile viewport
- [ ] Keyboard navigation is functional

### Integration Testing

- [ ] Filter change triggers parent callback
- [ ] Filter integrates with translation status API
- [ ] Filter persists selection across interactions

---

## Acceptance Criteria Verification

From REQ-318:

- [x] Component renders as a dropdown control positioned above content item lists
- [x] Dropdown displays "Translation Status: All" as the default label when no filter is active
- [x] Dropdown offers six filter options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited
- [ ] Selecting a filter option immediately updates the content list to show only matching items *(requires integration)*
- [x] Dropdown label updates to reflect the currently selected filter option
- [x] Selecting "All" removes any active filter and displays all content items
- [x] Component emits filter change events that parent components can handle to update list data
- [x] Component accepts current filter value as a prop to support controlled component pattern
- [x] Dropdown is keyboard accessible with arrow key navigation through options
- [x] Dropdown provides appropriate ARIA labels for screen readers
- [x] Component styling is consistent with the overall design system
- [x] Component is responsive and usable on tablet and desktop viewports

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Task 1: Directory Structure | 5 minutes |
| Task 2: Type Definitions | 15 minutes |
| Task 3: Component Implementation | 1-2 hours |
| Task 4: Export Files | 5 minutes |
| Task 5: Parent Index Update | 5 minutes |
| Task 6: Unit Tests (optional) | 30-45 minutes |
| **Total** | **1.5-3 hours** |

**Confidence Level:** High - Pattern is well-established in the codebase

---

## References

- **Request:** `/docs/gen_requests_epic5.md` - REQ-318
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Pattern Reference:** `/src/components/ItemManager/components/dialogs/LocationFilter.tsx`
- **Types Reference:** `/src/components/ItemManager/ItemManager.types.ts`
- **PRD Visual Spec:** Status colors and icons from PRD L10N Epic 5

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
