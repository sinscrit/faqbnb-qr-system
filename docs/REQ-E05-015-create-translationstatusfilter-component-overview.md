# REQ-E05-015: Create TranslationStatusFilter Component - Implementation Overview

**Created**: 2026-01-22 19:36
**Last Modified**: 2026-01-22 19:36
**Status**: PENDING
**Epic**: 5 - Owner Translation Management
**Phase**: 3 - Dashboard Integration
**Task ID**: 3.3

---

## 1. Goal

Create a dropdown filter component to filter item lists by translation status. The component enables property owners to quickly identify items that need translation attention based on their translation state (fully translated, partially translated, pending, failed, or manually edited).

**Component File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Key Features**:
- Controlled dropdown select component
- 6 filter options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited
- Size variants (sm/md/lg) for different layout contexts
- Integration with existing item list filtering mechanisms
- Keyboard navigation and screen reader support
- i18n support via next-intl
- Consistent styling with existing filter components

---

## 2. Implementation Plan

### Step 1: Create Component Directory Structure
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/` (new directory)

Create the component directory following the established pattern from other TranslationManagement components.

**Actions**:
- Create directory: `/src/components/TranslationManagement/TranslationStatusFilter/`
- Will contain: `TranslationStatusFilter.tsx`, `index.ts`

### Step 2: Define TypeScript Interfaces and Types
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` (new)

Define props interfaces and filter status type.

**Pattern Reference**: `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` and `/src/components/ItemEditForm/RoomSelector.tsx`

**Implementation Details**:
```typescript
/**
 * Translation status filter options
 */
export type TranslationFilterStatus =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manually_edited';

/**
 * Props for TranslationStatusFilter component
 */
export interface TranslationStatusFilterProps {
  /** Currently selected filter value */
  value: TranslationFilterStatus;
  /** Callback when filter selection changes */
  onChange: (value: TranslationFilterStatus) => void;
  /** Disable the dropdown */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom placeholder text (overrides default) */
  placeholder?: string;
  /** Size variant (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Show label above dropdown (default: false) */
  showLabel?: boolean;
  /** Custom label text (overrides default i18n label) */
  label?: string;
}
```

**Actions**:
- Export `TranslationFilterStatus` type for use in parent components
- Define `TranslationStatusFilterProps` interface with JSDoc
- Add detailed prop documentation

### Step 3: Define Filter Options Constants
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Define constants for filter options with translation keys.

**Pattern Reference**: `/src/components/ItemEditForm/RoomSelector.tsx` (lines 11-33) - translation key mapping pattern

**Implementation Details**:
```typescript
/**
 * Filter option definitions with translation keys
 */
const FILTER_OPTIONS = [
  { value: 'all', labelKey: 'all' },
  { value: 'fully_translated', labelKey: 'fullyTranslated' },
  { value: 'partially_translated', labelKey: 'partiallyTranslated' },
  { value: 'pending', labelKey: 'pending' },
  { value: 'failed', labelKey: 'failed' },
  { value: 'manually_edited', labelKey: 'manuallyEdited' },
] as const;
```

**Actions**:
- Define FILTER_OPTIONS constant array
- Map each filter value to its translation key
- Use `as const` for type safety

### Step 4: Define Size Variant Configuration
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Define Tailwind classes for each size variant.

**Pattern Reference**: REQ-E05-015 specification (lines 2126-2132)

**Implementation Details**:
```typescript
/**
 * Size variant configurations
 */
const SIZE_CONFIG = {
  sm: {
    height: 'h-8',
    fontSize: 'text-sm',
    padding: 'px-3 py-1.5',
  },
  md: {
    height: 'h-9',
    fontSize: 'text-sm',
    padding: 'px-4 py-2',
  },
  lg: {
    height: 'h-10',
    fontSize: 'text-base',
    padding: 'px-4 py-2',
  },
} as const;
```

**Actions**:
- Define SIZE_CONFIG object with height, font size, and padding for each variant
- Match specification heights (sm: h-8, md: h-9, lg: h-10)
- Use as const for type safety

### Step 5: Implement Component Structure with i18n
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Build the component skeleton with proper client directive and imports.

**Pattern Reference**: `/src/components/ItemEditForm/RoomSelector.tsx` (lines 0-65)

**Actions**:
- Add `'use client'` directive at top of file
- Import necessary dependencies:
  - React: useId for accessibility
  - next-intl: useTranslations
  - @/lib/utils: cn utility
- Create component function with props destructuring
- Set up translation hook: `const t = useTranslations('translationManagement.statusFilter');`
- Generate unique ID for select element using `useId()`

### Step 6: Create Translation Label Helper
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Create helper function to get translated label for each filter option.

**Pattern Reference**: `/src/components/ItemEditForm/RoomSelector.tsx` (lines 18-33)

**Implementation Details**:
```typescript
/**
 * Get translated label for a filter option
 */
const getFilterLabel = (filterValue: TranslationFilterStatus): string => {
  const option = FILTER_OPTIONS.find(opt => opt.value === filterValue);
  return option ? t(`options.${option.labelKey}`) : '';
};
```

**Actions**:
- Create helper function using translation namespace
- Use options namespace for filter labels
- Handle missing values gracefully

### Step 7: Implement onChange Handler
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Create change handler that converts select value to typed TranslationFilterStatus.

**Pattern Reference**: `/src/components/ItemEditForm/RoomSelector.tsx` (lines 35-38)

**Implementation Details**:
```typescript
const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedValue = e.target.value as TranslationFilterStatus;
  onChange(selectedValue);
};
```

**Actions**:
- Extract value from select change event
- Cast to TranslationFilterStatus type
- Call onChange callback with typed value

### Step 8: Render Optional Label
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Conditionally render label above the dropdown when showLabel is true.

**Pattern Reference**: `/src/components/ItemEditForm/RoomSelector.tsx` (lines 42-47)

**Implementation Details**:
```typescript
const resolvedLabel = label ?? t('label');
const selectId = useId();

// In JSX:
{showLabel && (
  <label
    htmlFor={selectId}
    className="block text-sm font-medium text-gray-700 mb-2"
  >
    {resolvedLabel}
  </label>
)}
```

**Actions**:
- Use provided label or fallback to translated label
- Generate unique ID for htmlFor association
- Only render when showLabel prop is true
- Apply consistent label styling

### Step 9: Render Select Element with Size Variants
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Render the select dropdown with size-specific styling.

**Pattern Reference**: `/src/components/ItemEditForm/RoomSelector.tsx` (lines 48-62)

**Implementation Details**:
```typescript
const sizeConfig = SIZE_CONFIG[size || 'md'];
const resolvedPlaceholder = placeholder ?? t('placeholder');

return (
  <div className={className}>
    {/* Optional label rendered here */}

    <select
      id={selectId}
      aria-label={!showLabel ? resolvedLabel : undefined}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        'w-full border border-gray-300 rounded-lg',
        'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors',
        sizeConfig.height,
        sizeConfig.fontSize,
        sizeConfig.padding,
      )}
    >
      {FILTER_OPTIONS.map(({ value: optionValue, labelKey }) => (
        <option key={optionValue} value={optionValue}>
          {t(`options.${labelKey}`)}
        </option>
      ))}
    </select>
  </div>
);
```

**Actions**:
- Apply size-specific height, font size, and padding
- Use consistent border and focus ring styling
- Map over FILTER_OPTIONS to render option elements
- Translate each option label
- Include aria-label when label is hidden
- Handle disabled state with opacity and cursor

### Step 10: Add Visual Selection Indicator (Optional Enhancement)
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Consider adding a visual indicator (checkmark or icon) for the selected option.

**Note**: Native `<select>` elements don't support custom option content in most browsers. This would require switching to a custom dropdown component (Radix Select or headlessUI).

**Decision**:
- Keep native select for simplicity and consistency with existing patterns
- Note as future enhancement if richer UI is needed
- Document in "Out of Scope" section

**Actions**:
- Document decision to use native select
- Note limitations in component JSDoc
- Suggest Radix Select as future enhancement if needed

### Step 11: Add Comprehensive JSDoc Documentation
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Add comprehensive JSDoc with usage examples.

**Implementation Details**:
```typescript
/**
 * TranslationStatusFilter Component
 *
 * Dropdown filter for filtering item lists by translation status.
 * Provides 6 filter options: All, Fully Translated, Partially Translated,
 * Pending, Failed, and Manually Edited.
 *
 * @example
 * // Basic usage
 * const [filter, setFilter] = useState<TranslationFilterStatus>('all');
 * <TranslationStatusFilter value={filter} onChange={setFilter} />
 *
 * @example
 * // With label and custom size
 * <TranslationStatusFilter
 *   value={statusFilter}
 *   onChange={setStatusFilter}
 *   showLabel={true}
 *   size="sm"
 *   className="w-48"
 * />
 *
 * @example
 * // In a filter bar
 * <div className="flex gap-2">
 *   <PropertyFilter value={property} onChange={setProperty} />
 *   <TranslationStatusFilter value={status} onChange={setStatus} />
 * </div>
 *
 * @module TranslationManagement/TranslationStatusFilter
 * @see docs/REQ-E05-015-create-translationstatusfilter-component-overview.md
 * @lastModified 2026-01-22
 */
```

**Actions**:
- Add comprehensive component description
- Include 3-4 usage examples
- Reference this overview document
- Add module and lastModified tags

### Step 12: Create Barrel Export
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/index.ts` (new)

Create index file for clean imports.

**Actions**:
- Export TranslationStatusFilter as default and named export
- Export TranslationStatusFilterProps type
- Export TranslationFilterStatus type

### Step 13: Update Parent Barrel Export
**File**: `/src/components/TranslationManagement/index.ts`

Add TranslationStatusFilter to parent namespace exports.

**Note**: This file may not exist yet (entire TranslationManagement namespace is new in Epic 5).

**Actions**:
- Create `/src/components/TranslationManagement/index.ts` if it doesn't exist
- Add export statement for TranslationStatusFilter
- Add export statement for TranslationStatusFilterProps and TranslationFilterStatus types
- Maintain alphabetical or logical ordering with other Epic 5 components

### Step 14: Add Translation Keys to Message Files
**Files**:
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

Add required translation keys for the filter component.

**English Template** (`/messages/en.json`):
```json
{
  "translationManagement": {
    "statusFilter": {
      "label": "Translation Status",
      "placeholder": "Filter by status",
      "options": {
        "all": "All",
        "fullyTranslated": "Fully Translated",
        "partiallyTranslated": "Partially Translated",
        "pending": "Pending",
        "failed": "Failed",
        "manuallyEdited": "Manually Edited"
      }
    }
  }
}
```

**Actions**:
- Add keys to English file first (source language)
- Copy structure to all target language files (fr, es, de, nl, it)
- Translate text appropriately for each language
- Ensure consistent key structure across all files
- Validate JSON syntax

### Step 15: Integration Testing with ItemManager
**Context**: ItemManager table filter bar integration

Test the component in actual ItemManager context.

**Test Scenarios**:
1. Component renders as dropdown with all 6 filter options
2. Default value of 'all' is selected initially
3. Changing selection calls onChange callback with correct value
4. Disabled state prevents interaction
5. Size variants (sm/md/lg) render with correct dimensions
6. Label displays correctly when showLabel is true
7. Label is hidden when showLabel is false
8. aria-label is present when label is hidden
9. Keyboard navigation works (Tab to focus, Arrow keys to navigate, Enter to select)
10. Focus ring is visible on keyboard focus
11. i18n works for all languages (option labels are translated)
12. Component integrates cleanly in ItemToolbar filter bar
13. Filtering logic works correctly when integrated with useFilteredItems

**Actions**:
- Import TranslationStatusFilter in ItemToolbar or ItemManager
- Add to filter bar alongside existing filters
- Create state management for filter value
- Integrate with item filtering logic
- Test all size variants in different contexts
- Verify keyboard navigation
- Test accessibility with screen reader
- Validate all i18n strings display correctly

### Step 16: Document Integration Pattern
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Add integration notes in JSDoc for developers.

**Implementation Details**:
```typescript
/**
 * Integration Notes:
 *
 * This component is a controlled component - the parent must manage the filter state.
 * To integrate with item list filtering:
 *
 * 1. Add filter state:
 *    const [statusFilter, setStatusFilter] = useState<TranslationFilterStatus>('all');
 *
 * 2. Pass to filtering logic:
 *    const filteredItems = items.filter(item => {
 *      if (statusFilter === 'all') return true;
 *      // Apply status-specific filtering logic
 *      return matchesStatusFilter(item, statusFilter);
 *    });
 *
 * 3. Render in filter bar:
 *    <TranslationStatusFilter value={statusFilter} onChange={setStatusFilter} />
 */
```

**Actions**:
- Document controlled component pattern
- Provide integration code examples
- Note filtering logic considerations
- Reference related components

### Step 17: Create Unit Tests (Future)
**File**: `/src/components/TranslationManagement/TranslationStatusFilter/__tests__/TranslationStatusFilter.test.tsx` (future)

Plan for future unit tests.

**Test Cases to Cover**:
- Renders with all filter options
- Calls onChange when selection changes
- Respects disabled prop
- Applies size variants correctly
- Shows/hides label based on showLabel prop
- Uses custom placeholder when provided
- Applies custom className
- Has proper ARIA attributes

**Actions**:
- Document test requirements
- Note for future implementation
- Follow existing test patterns from ContentTypeFilter tests

---

## 3. Authorized Files for Modification

### New Files to Create:
1. `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`
   - Main filter component
   - Lines: ~180-220 (estimated)

2. `/src/components/TranslationManagement/TranslationStatusFilter/index.ts`
   - Barrel export file
   - Lines: ~5-10

### Existing Files to Modify:
3. `/src/components/TranslationManagement/index.ts`
   - Add TranslationStatusFilter exports
   - Modification: Add 2-3 export lines
   - Note: File may not exist yet; create if needed

4. `/messages/en.json`
   - Add statusFilter translation keys
   - Modification: Add `translationManagement.statusFilter` namespace

5. `/messages/fr.json`
   - Add statusFilter translation keys
   - Modification: Add `translationManagement.statusFilter` namespace

6. `/messages/es.json`
   - Add statusFilter translation keys
   - Modification: Add `translationManagement.statusFilter` namespace

7. `/messages/de.json`
   - Add statusFilter translation keys
   - Modification: Add `translationManagement.statusFilter` namespace

8. `/messages/nl.json`
   - Add statusFilter translation keys
   - Modification: Add `translationManagement.statusFilter` namespace

9. `/messages/it.json`
   - Add statusFilter translation keys
   - Modification: Add `translationManagement.statusFilter` namespace

### Integration Files (Future):
10. `/src/components/ItemManager/components/ItemToolbar.tsx` (future integration)
    - Add TranslationStatusFilter to filter bar
    - Modification: Import and render component

11. `/src/components/ItemManager/ItemManager.tsx` (future integration)
    - Add filter state management
    - Modification: useState hook and filter logic

---

## 4. Dependencies

### Internal Dependencies (Must Exist First):
- **REQ-E05-006**: TranslationManagement types file
  - Required for: Shared `TranslationFilterStatus` type (may be defined in component if not shared)
  - Import: `@/components/TranslationManagement/TranslationManagement.types`

- **REQ-E05-014**: TranslationStatusColumn component
  - Reference for: Same status definitions and color scheme
  - Note: Not a direct import, but shares status concept

### External Dependencies (Existing):
- **next-intl**: Internationalization
  - Usage: `useTranslations` hook for option labels

- **React**: Core framework (v18+)
  - Usage: useId for accessibility, ChangeEvent types

- **Tailwind CSS**: Styling utility classes

- **@/lib/utils**: Utility functions
  - Usage: `cn()` for className merging

### Integration Dependencies (Future):
- **ItemManager**: Target integration point
  - ItemToolbar.tsx will import and use this component
  - ItemManager.tsx will manage filter state

---

## 5. Key Technical Decisions

### 5.1 Native Select vs Custom Dropdown Component
**Decision**: Use native HTML `<select>` element instead of custom dropdown (Radix Select, headlessUI).

**Rationale**:
- Existing filter components use native select (RoomSelector.tsx)
- @radix-ui/react-select is not currently installed
- Native select is simpler, more accessible by default
- Avoids adding new dependencies
- Consistent with existing codebase patterns

**Trade-offs**:
- Limited customization (no icons in options, checkmarks, etc.)
- Basic styling options only
- Future: Could upgrade to Radix Select if richer UI needed

**Implementation**: Follow RoomSelector.tsx pattern.

### 5.2 Controlled Component Pattern
**Decision**: Implement as fully controlled component with value/onChange props.

**Rationale**:
- Matches React best practices for form inputs
- Allows parent component to manage filter state
- Enables integration with complex filtering logic
- Consistent with existing filter components (ContentTypeFilter, PropertyFilter)

**Implementation**: No internal state; all state managed by parent.

### 5.3 Filter Value Type
**Decision**: Use string literal union type `TranslationFilterStatus` instead of enum.

**Rationale**:
- More idiomatic TypeScript pattern
- Better type inference
- Easier to work with in JSX
- Consistent with modern TypeScript practices

**Type Definition**:
```typescript
type TranslationFilterStatus =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manually_edited';
```

### 5.4 Size Variant Implementation
**Decision**: Three predefined size variants (sm/md/lg) matching specification.

**Sizes**:
- sm: h-8 (compact filter bars)
- md: h-9 (standard, default)
- lg: h-10 (spacious layouts)

**Rationale**:
- Matches REQ-E05-015 specification exactly
- Provides flexibility for different contexts
- Prevents inconsistent sizing across the application

**Implementation**: SIZE_CONFIG object with Tailwind classes for each variant.

### 5.5 Label Display Strategy
**Decision**: Optional label controlled by `showLabel` prop (default: false).

**Rationale**:
- Flexibility for different layout contexts
- Some filter bars need labels, others don't
- When label is hidden, aria-label provides accessibility
- Matches existing filter component patterns

**Implementation**: Conditional render with aria-label fallback.

### 5.6 Translation Namespace Structure
**Decision**: Use nested namespace `translationManagement.statusFilter.options.*`.

**Rationale**:
- Clear organization of translation keys
- Prevents key collisions
- Consistent with Epic 5 translation structure
- Easy to locate and maintain translations

**Structure**:
- `translationManagement.statusFilter.label`
- `translationManagement.statusFilter.placeholder`
- `translationManagement.statusFilter.options.all`
- `translationManagement.statusFilter.options.fullyTranslated`
- etc.

---

## 6. Risks and Mitigations

### Risk 1: Filter Logic Integration Complexity
**Risk**: Integrating filter with existing ItemManager filtering logic may be complex.

**Impact**: Medium - Could require significant refactoring of ItemList filtering

**Mitigation**:
- Component is simple dropdown; complexity is in integration
- Document clear integration pattern in JSDoc
- Provide code examples for filtering logic
- Test with ItemManager early
- Consider creating helper function for status matching logic

**Likelihood**: Low (component is straightforward)

### Risk 2: Translation Status Data Availability
**Risk**: Item objects may not have translation status data readily available.

**Impact**: High - Filter won't work if data isn't present

**Mitigation**:
- Coordinate with backend/API team to ensure status data is included
- Add translation status to Item type definition
- Ensure API endpoints return status data
- Document data requirements clearly

**Likelihood**: Medium (depends on API implementation)

### Risk 3: Filter Performance with Large Item Lists
**Risk**: Filtering large item lists client-side may be slow.

**Impact**: Low - Native select is fast; filtering is the bottleneck

**Mitigation**:
- Use useMemo for filtered results
- Consider server-side filtering for very large lists
- Add loading state during filtering if needed
- Profile performance with realistic data volumes

**Likelihood**: Low (client-side filtering usually adequate)

### Risk 4: Confusion Between Filter Options
**Risk**: Users may not understand difference between "Partially Translated" and "Pending".

**Impact**: Low - UX clarity issue, not technical

**Mitigation**:
- Use clear, descriptive option labels
- Add tooltips or help text explaining each option (future enhancement)
- Document option meanings in user-facing docs
- Get feedback from user testing

**Likelihood**: Medium (terminology can be confusing)

### Risk 5: Inconsistent Filter Behavior Across Tables
**Risk**: Filter may behave differently when integrated in different contexts.

**Impact**: Low - Component behavior is consistent; integration varies

**Mitigation**:
- Document clear integration contract
- Provide consistent helper functions for filtering logic
- Standardize filter state management pattern
- Create shared filtering utilities if needed

**Likelihood**: Low (component is simple)

---

## 7. Out of Scope

### 7.1 Custom Dropdown UI with Icons
- Native select doesn't support icons or custom content in options
- Rationale: Would require custom dropdown component (Radix Select)
- Future Enhancement: Upgrade to Radix Select for richer UI

### 7.2 Multi-Select Filtering
- Component supports single selection only (not checkbox-based multi-select)
- Rationale: Spec defines single-selection dropdown
- Use Case: User can only filter by one status at a time

### 7.3 Search/Filter Option Text
- No search input to filter the dropdown options
- Rationale: Only 6 options; search not needed
- Future Enhancement: Could add if option list grows

### 7.4 Custom Filter Logic
- Component doesn't include filtering logic itself
- Rationale: Filtering logic belongs in parent component/hook
- Out of Scope: Component is presentation only (controlled component)

### 7.5 Badges/Counts Next to Options
- No counts showing number of items per status (e.g., "Pending (24)")
- Rationale: Would require passing counts data to component
- Future Enhancement: Could add counts prop if valuable

### 7.6 Save Filter Preferences
- No persistence of selected filter to localStorage/URL
- Rationale: State management belongs to parent
- Future Enhancement: Parent can implement persistence if desired

### 7.7 Reset/Clear Filter Button
- No built-in reset button to clear filter back to 'all'
- Rationale: Parent controls value; parent can reset
- Use Case: Parent can add separate reset button if needed

### 7.8 Accessibility Enhancements Beyond Basic
- No advanced ARIA live regions announcing filter changes
- Rationale: Native select has good default accessibility
- Future Enhancement: Could add announcements for dynamic content updates

---

## 8. Testing Considerations

### Unit Tests (Future):
- Component renders with all 6 filter options
- onChange callback is called with correct value when selection changes
- Disabled prop prevents interaction
- Size variants apply correct height classes
- Label renders when showLabel is true
- Label is hidden when showLabel is false
- aria-label is present when label is hidden
- Custom placeholder is used when provided
- Custom className is applied to root element
- All options are translated correctly

### Integration Tests (Future):
- Filter integrates with ItemManager filter bar
- Changing filter updates item list correctly
- Filter state persists during navigation (if implemented)
- Filter works with other filters (property, content type, etc.)

### Manual Testing (Required):
- Visual verification in ItemManager context
- All filter options display correctly
- Selection triggers proper filtering behavior
- Keyboard navigation works (Tab, Arrow keys, Enter)
- Focus ring is visible
- Test all size variants (sm, md, lg)
- Test with/without label
- Verify accessibility with screen reader
- Test in all supported languages
- Verify disabled state

---

## 9. Estimated Effort

**Total Effort**: 3-4 hours

**Breakdown**:
- Component structure and interfaces: 0.5 hours
- Select element with size variants: 1 hour
- Translation integration and i18n: 0.5 hours
- Label and ARIA attributes: 0.5 hours
- Documentation and JSDoc: 0.5 hours
- Testing and refinement: 1 hour

**Complexity**: Low-Medium
- Simple controlled dropdown component
- Straightforward translation integration
- Most complexity is in future integration work
- Well-defined existing patterns to follow

---

## 10. Success Criteria

This task is complete when:

1. ✅ TranslationStatusFilter component renders as dropdown select
2. ✅ Dropdown includes all 6 filter options (All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited)
3. ✅ Component is controlled via value/onChange props
4. ✅ onChange callback is called with correct TranslationFilterStatus value
5. ✅ Size variants (sm/md/lg) render with correct heights (h-8/h-9/h-10)
6. ✅ Disabled prop prevents interaction
7. ✅ Placeholder prop customizes placeholder text
8. ✅ showLabel prop controls label visibility
9. ✅ Label prop allows custom label text
10. ✅ aria-label is present when label is hidden
11. ✅ Keyboard navigation works (Tab, Arrow keys, Enter)
12. ✅ Focus ring is visible on keyboard focus
13. ✅ All option labels are internationalized
14. ✅ className prop is applied to root element
15. ✅ Component exports are added to parent namespace
16. ✅ TypeScript types are properly defined and exported
17. ✅ JSDoc documentation is comprehensive with examples

---

## 11. Related Documentation

- **Epic 5 Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Source Request**: `/docs/gen_requests_epic5.md` (Request #15, lines 2050-2232)
- **REQ-E05-006**: TranslationManagement types file (dependency)
- **REQ-E05-014**: TranslationStatusColumn component (related status definitions)
- **Pattern Reference - RoomSelector**: `/src/components/ItemEditForm/RoomSelector.tsx` (native select pattern)
- **Pattern Reference - ContentTypeFilter**: `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` (filter component pattern)
- **ItemManager Integration**: `/src/components/ItemManager/` (future integration point)

---

## 12. Notes

- This component uses native HTML `<select>` to match existing patterns in the codebase
- The component is intentionally simple and delegates filtering logic to the parent
- Future enhancement: Could upgrade to Radix Select (@radix-ui/react-select) for richer UI with icons and custom styling
- The filter options match the translation status types but are simplified for user-facing labels
- Integration with ItemManager will be handled in a separate task (REQ-E05-016 or similar)
- The component should be tested with ItemList to ensure filtering logic works correctly
- Consider adding a helper function `matchesTranslationStatusFilter(item, status)` for reusable filtering logic

---

**Document Status**: Ready for Implementation
**Next Step**: Begin implementation starting with Step 1 (directory structure)
