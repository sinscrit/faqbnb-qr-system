# REQ-073: Implement BulkMoveDialog - Detailed Task Breakdown

**Document Created:** 2026-01-03T04:58:15
**Last Modified:** 2026-01-03T17:10:00
**Request Reference:** REQ-073 (Bulk Move Items Between Properties)
**Overview Document:** `docs/REQ-073-implement-bulkmovedialog-overview.md`
**Implementation Plan Reference:** `docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.6
**Implementation Status:** ✅ COMPLETE

---

## Implementation Summary

All tasks have been implemented successfully. The BulkMoveDialog component is now fully functional with:
- Custom accessible PropertyDropdown with keyboard navigation
- Item preview list showing source properties
- Full integration with ItemManager component
- Focus trapping and body scroll lock for accessibility
- Comprehensive unit and integration tests

### Files Created
- `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
- `src/components/ItemManager/components/BulkActions/__tests__/BulkMoveDialog.test.tsx`
- `src/components/ItemManager/__tests__/BulkMoveFlow.test.tsx`

### Files Modified
- `src/components/ItemManager/components/BulkActions/index.ts`
- `src/components/ItemManager/ItemManager.tsx`
- `src/components/ItemManager/ItemManager.types.ts`

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for implementing the `BulkMoveDialog` component. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes explicit verification steps to ensure correct implementation.

The `BulkMoveDialog` enables users to move multiple selected items from their current properties to a different property in multi-property mode. This dialog is triggered from the BulkActionsBar when items are selected and multi-property mode is active.

---

## Prerequisites

Before starting implementation, verify the following dependencies are in place:

| Dependency | Status | File Location |
|------------|--------|---------------|
| Task 1.1: Component Directory & Types | Required | `src/components/ItemManager/ItemManager.types.ts` |
| Task 3.1: useItemSelection hook | Required | `src/components/ItemManager/hooks/useItemSelection.ts` |
| Task 3.2: Selection UI Integration | Required | Selection checkboxes in ItemCard/ItemRow |
| Task 3.3: BulkActionsBar component | Required | `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` |

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Main bulk move dialog component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/BulkActions/index.ts` | Add export for BulkMoveDialog |
| `src/components/ItemManager/ItemManager.tsx` | Add move dialog state and handlers |
| `src/components/ItemManager/ItemManager.types.ts` | Add BulkMoveDialogProps interface if not present |

---

## Detailed Task Breakdown

### Task 3.6.1: Create BulkMoveDialog Component File Structure

**Objective:** Set up the component file with imports, type definitions, and component skeleton.

**Estimated Effort:** ~30 minutes

#### Steps

1. **Create the component file**
   - Create `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
   - Add `'use client'` directive at top

2. **Add file header documentation**
   ```typescript
   /**
    * BulkMoveDialog Component
    *
    * Modal dialog for moving multiple selected items to a different property.
    * Only available when operating in multi-property mode.
    *
    * @module ItemManager/components/BulkActions/BulkMoveDialog
    * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.6)
    * @lastModified 2026-01-03 (REQ-073)
    */
   ```

3. **Add required imports**
   - Import React hooks: `useState`, `useMemo`, `useCallback`, `useRef`, `useEffect`, `useId`
   - Import Lucide icons: `X`, `FolderInput`, `Building`, `ChevronDown`, `Check`, `Loader2`
   - Import `cn` utility from `@/lib/utils`
   - Import `ItemRecord` type from `@/components/ItemCapture/ItemCapture.types`

4. **Define type interfaces**
   - Define `Property` interface with fields: `id`, `name?`, `nickname?`, `address?`, `property_types?`
   - Define `ItemRecordExtended` interface extending `ItemRecord` with `propertyId?` field
   - Define `BulkMoveDialogProps` interface with:
     - `selectedItems: ItemRecord[]`
     - `properties: Property[]`
     - `currentPropertyId?: string`
     - `onConfirm: (destinationPropertyId: string) => void`
     - `onCancel: () => void`
     - `loading?: boolean`
     - `className?: string`

5. **Define constants**
   - `MAX_PREVIEW_ITEMS = 5` (maximum items shown in preview list)

6. **Create component skeleton**
   - Export named function `BulkMoveDialog` with props destructuring
   - Export default `BulkMoveDialog`
   - Return placeholder `null` initially

#### Verification

- [ ] File exists at `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
- [ ] File starts with `'use client'` directive
- [ ] All imports resolve without errors (run `npm run build` or TypeScript check)
- [ ] `BulkMoveDialogProps` interface includes all required properties
- [ ] Component exports both named and default exports

---

### Task 3.6.2: Implement PropertyDropdown Internal Component

**Objective:** Create the property selection dropdown with keyboard navigation support.

**Estimated Effort:** ~1.5 hours

#### Steps

1. **Define PropertyDropdown props interface**
   ```typescript
   interface PropertyDropdownProps {
     properties: Property[];
     selectedPropertyId: string;
     onSelect: (propertyId: string) => void;
     disabled?: boolean;
     placeholder?: string;
   }
   ```

2. **Implement component state**
   - `isOpen: boolean` - dropdown open state
   - `focusedIndex: number` - keyboard navigation index (-1 when none focused)
   - Create refs: `dropdownRef` for container, `buttonRef` for trigger button

3. **Implement click-outside handler**
   - Add `useEffect` with `mousedown` event listener
   - Check if click target is outside `dropdownRef.current`
   - Close dropdown and reset focus index when clicking outside
   - Clean up listener on unmount

4. **Implement keyboard navigation handler**
   - Handle `ArrowDown`: Open dropdown if closed, move focus down if open (wrap around)
   - Handle `ArrowUp`: Open dropdown if closed, move focus up if open (wrap around)
   - Handle `Enter` / `Space`: Open dropdown if closed, select focused option if open
   - Handle `Escape`: Close dropdown, reset focus index, return focus to button
   - Handle `Tab`: Close dropdown, reset focus index (allow default tab behavior)

5. **Render trigger button**
   - Full-width button with left-aligned content
   - Show `Building` icon and selected property name or placeholder
   - Show `ChevronDown` icon that rotates when open
   - Apply focus ring styles when open
   - Handle disabled state with opacity and cursor changes
   - Add ARIA attributes: `aria-expanded`, `aria-haspopup="listbox"`, `aria-label`

6. **Render dropdown options**
   - Absolute positioned container below button
   - Max height with overflow scroll (`max-h-60 overflow-y-auto`)
   - Map over properties to render options
   - Show `Building` icon, property nickname/name, optional address/type
   - Show `Check` icon for selected option
   - Apply focused and selected state styles
   - Handle click to select option and close dropdown
   - Add `role="listbox"` to container, `role="option"` to each option
   - Add `aria-selected` to each option

7. **Handle empty state**
   - Show "No properties available" message when properties array is empty

#### Verification

- [ ] Dropdown opens on button click
- [ ] Dropdown closes when clicking outside
- [ ] Arrow keys navigate through options
- [ ] Enter/Space selects focused option
- [ ] Escape closes dropdown
- [ ] Selected property displays in button
- [ ] Focus styles are visible
- [ ] Disabled state prevents interaction
- [ ] Screen reader can navigate options

---

### Task 3.6.3: Implement ItemPreviewList Internal Component

**Objective:** Create the component showing items that will be moved with source property info.

**Estimated Effort:** ~45 minutes

#### Steps

1. **Define ItemPreviewList props interface**
   ```typescript
   interface ItemPreviewListProps {
     items: ItemRecord[];
     properties: Property[];
     maxDisplay?: number;
   }
   ```

2. **Calculate display items and overflow count**
   - Slice items to `maxDisplay` (default: `MAX_PREVIEW_ITEMS`)
   - Calculate `remainingCount = items.length - displayItems.length`

3. **Create helper function to get property name**
   - Extract `propertyId` from item (cast to `ItemRecordExtended`)
   - Find matching property from properties array
   - Return `property.nickname || property.name || 'Unknown'`

4. **Render list structure**
   - Container div with top margin
   - Label: "Items to move:" (medium gray text)
   - Unordered list with max height and overflow scroll (`max-h-40 overflow-y-auto`)

5. **Render each item**
   - Bullet point (small gray circle)
   - Item title (truncate with ellipsis)
   - Source property label: "from: {propertyName}" (smaller, lighter text)

6. **Render overflow message**
   - If `remainingCount > 0`, show "(and X more...)" in italic gray text
   - Properly indent to align with item list

#### Verification

- [ ] Shows up to 5 items by default
- [ ] Each item shows title and source property
- [ ] Overflow message appears when more than 5 items
- [ ] List scrolls if content exceeds max height
- [ ] Text truncates properly for long titles

---

### Task 3.6.4: Implement Modal Container and Layout

**Objective:** Build the main dialog container with header, body, and footer sections.

**Estimated Effort:** ~1 hour

#### Steps

1. **Set up component state**
   - `destinationPropertyId: string` - selected destination property ID (initial: '')
   - Generate unique IDs using `useId()` for accessibility: `titleId`, `selectLabelId`

2. **Compute available properties**
   - Use `useMemo` to filter out `currentPropertyId` from properties array
   - Only show properties that items can be moved TO

3. **Implement Escape key handler**
   - Add `useEffect` with document-level keydown listener
   - Call `onCancel` when Escape is pressed
   - Clean up listener on unmount

4. **Implement body scroll lock**
   - Add `useEffect` to set `document.body.style.overflow = 'hidden'` on mount
   - Reset to empty string on unmount

5. **Implement backdrop click handler**
   - Check if click target equals current target (backdrop only)
   - Call `onCancel` when backdrop is clicked

6. **Render modal backdrop**
   - Fixed positioning covering entire viewport
   - Semi-transparent black background (`bg-black bg-opacity-50`)
   - Center content with flexbox
   - High z-index (`z-50`)
   - Padding for edge spacing on small screens

7. **Render modal container**
   - White background with rounded corners and shadow
   - Max width (`max-w-lg`) and max height (`max-h-[90vh]`)
   - Flex column layout with overflow hidden
   - Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby={titleId}`

8. **Render header section**
   - Flex row with space-between alignment
   - Blue circle icon container with `FolderInput` icon
   - Title: "Move X Item(s) to Another Property" (pluralize based on count)
   - Close button with `X` icon, hover state, disabled when loading
   - Bottom border separator

9. **Render body section**
   - Padding and flex-grow to fill available space
   - Overflow-y auto for scrolling content

10. **Render footer section**
    - Top border, gray background (`bg-gray-50`)
    - Right-aligned buttons with gap
    - Cancel button: gray text, white background, gray border
    - Confirm button: blue background, white text, disabled when no property selected

#### Verification

- [ ] Modal appears centered on screen
- [ ] Clicking backdrop closes modal
- [ ] Escape key closes modal
- [ ] Background does not scroll when modal is open
- [ ] Header shows correct item count
- [ ] Close button works
- [ ] Modal has proper ARIA attributes

---

### Task 3.6.5: Wire Up Internal Components and Confirm Handler

**Objective:** Integrate PropertyDropdown and ItemPreviewList, implement confirmation logic.

**Estimated Effort:** ~45 minutes

#### Steps

1. **Add property selector to body**
   - Render label "Destination property" with proper ID reference
   - Conditionally render:
     - If `availableProperties.length === 0`: Show "No other properties available" message
     - Otherwise: Render `PropertyDropdown` component

2. **Add items preview to body**
   - Render `ItemPreviewList` with `selectedItems` and `properties`

3. **Create confirm click handler**
   - Use `useCallback` with dependencies: `destinationPropertyId`, `onConfirm`
   - Only call `onConfirm` if `destinationPropertyId` is truthy
   - Pass `destinationPropertyId` to `onConfirm`

4. **Calculate confirm button disabled state**
   - Disabled when `loading` is true OR `destinationPropertyId` is empty

5. **Wire up confirm button**
   - Add `onClick` with confirm handler
   - Add `disabled` with calculated state
   - Show `Loader2` spinner icon when `loading` is true
   - Button text: "Move X Item(s)" with proper pluralization

6. **Wire up cancel button**
   - Add `onClick` calling `onCancel`
   - Disable when `loading` is true

7. **Pass loading state to PropertyDropdown**
   - Disable dropdown when `loading` is true

#### Verification

- [ ] Property dropdown renders in body
- [ ] Items preview renders below dropdown
- [ ] Selecting a property enables confirm button
- [ ] Confirm button is disabled when no property selected
- [ ] Confirm button is disabled during loading
- [ ] Loading spinner appears on confirm button when loading
- [ ] Cancel button works correctly
- [ ] Empty property list shows appropriate message

---

### Task 3.6.6: Update BulkActions Barrel Export

**Objective:** Export BulkMoveDialog from the BulkActions index file.

**Estimated Effort:** ~15 minutes

#### Steps

1. **Open or create index file**
   - Open `src/components/ItemManager/components/BulkActions/index.ts`
   - Create it if it doesn't exist

2. **Add BulkMoveDialog exports**
   ```typescript
   export { BulkMoveDialog } from './BulkMoveDialog';
   export type { BulkMoveDialogProps, Property as BulkMoveProperty } from './BulkMoveDialog';
   ```

3. **Verify existing exports are preserved**
   - Ensure `BulkActionsBar` export remains
   - Ensure `BulkTagDialog` export remains (if it exists)

4. **Update file header documentation**
   - Add `@lastModified` comment with current date

#### Verification

- [ ] Import from `'./components/BulkActions'` includes `BulkMoveDialog`
- [ ] TypeScript types are exported correctly
- [ ] No import/export errors in build

---

### Task 3.6.7: Add Types to ItemManager.types.ts (if needed)

**Objective:** Ensure ItemRecordExtended and Property types exist in the main types file.

**Estimated Effort:** ~20 minutes

#### Steps

1. **Open types file**
   - Open `src/components/ItemManager/ItemManager.types.ts`

2. **Check for ItemRecordExtended**
   - If not present, add:
   ```typescript
   /**
    * Extended ItemRecord with property assignment support.
    * Used when operating in multi-property mode.
    */
   export interface ItemRecordExtended extends ItemRecord {
     /** Property ID for multi-property mode */
     propertyId?: string;
   }
   ```

3. **Check for Property interface**
   - If not present or different, ensure it includes:
   ```typescript
   /**
    * Property definition for multi-property mode.
    */
   export interface Property {
     id: string;
     name?: string;
     nickname?: string;
     address?: string;
     property_types?: {
       display_name: string;
     };
   }
   ```

4. **Check for BulkMoveDialogProps**
   - If not present, add:
   ```typescript
   /**
    * Props for BulkMoveDialog component.
    */
   export interface BulkMoveDialogProps {
     selectedItems: ItemRecord[];
     properties: Property[];
     currentPropertyId?: string;
     onConfirm: (destinationPropertyId: string) => void;
     onCancel: () => void;
     loading?: boolean;
     className?: string;
   }
   ```

5. **Update file header**
   - Update `@lastModified` comment

#### Verification

- [ ] `ItemRecordExtended` type is available for import
- [ ] `Property` type is available for import
- [ ] `BulkMoveDialogProps` type is available for import
- [ ] No TypeScript errors in types file

---

### Task 3.6.8: Integrate BulkMoveDialog into ItemManager

**Objective:** Add dialog state management and wire up to BulkActionsBar.

**Estimated Effort:** ~1 hour

#### Steps

1. **Import BulkMoveDialog**
   - Add import from `'./components/BulkActions'`

2. **Add dialog state**
   - Add `showMoveDialog: boolean` state (initial: false)
   - Add `bulkMoveLoading: boolean` state (initial: false)

3. **Determine multi-property mode**
   - Create computed value: `isMultiPropertyMode`
   - True if `config?.multiPropertyMode` OR `properties?.length > 1`

4. **Create handleBulkMove trigger**
   - Use `useCallback`
   - Set `showMoveDialog` to true

5. **Create handleMoveConfirm handler**
   - Use `useCallback` with async function
   - Get selected items using `getSelectedItems(items)` from useItemSelection
   - Early return if no selected items or empty destinationPropertyId
   - Set `bulkMoveLoading` to true
   - Loop through selected items:
     - Call `onUpdateItem` for each item with updated `propertyId`
   - After loop: close dialog, clear selection
   - Use try/finally to ensure `bulkMoveLoading` is reset

6. **Create handleMoveCancel handler**
   - Set `showMoveDialog` to false

7. **Wire up to BulkActionsBar**
   - Pass `onMoveToProperty={isMultiPropertyMode ? handleBulkMove : undefined}`
   - Pass `multiPropertyMode={isMultiPropertyMode}`

8. **Render BulkMoveDialog conditionally**
   - Only render when: `showMoveDialog && isMultiPropertyMode && properties`
   - Pass all required props:
     - `selectedItems={getSelectedItems(items)}`
     - `properties={properties}`
     - `currentPropertyId` if available from state
     - `onConfirm={handleMoveConfirm}`
     - `onCancel={handleMoveCancel}`
     - `loading={bulkMoveLoading}`

#### Verification

- [ ] "Move to..." button appears in BulkActionsBar in multi-property mode
- [ ] "Move to..." button does NOT appear in single-property mode
- [ ] Clicking "Move to..." opens BulkMoveDialog
- [ ] Dialog shows correct selected items
- [ ] Dialog shows available properties
- [ ] Confirming move calls onUpdateItem for each item
- [ ] Selection is cleared after move
- [ ] Dialog closes after move completes

---

### Task 3.6.9: Write Unit Tests for BulkMoveDialog

**Objective:** Create comprehensive unit tests for the BulkMoveDialog component.

**Estimated Effort:** ~1.5 hours

#### Steps

1. **Create test file**
   - Create `src/components/ItemManager/components/BulkActions/__tests__/BulkMoveDialog.test.tsx`
   - Add test setup with mock data

2. **Define mock data**
   ```typescript
   const mockItems = [
     { id: '1', title: 'Coffee Maker', propertyId: 'prop-1', contentType: 'media', media: [], createdAt: new Date() },
     { id: '2', title: 'Dishwasher', propertyId: 'prop-1', contentType: 'media', media: [], createdAt: new Date() },
     { id: '3', title: 'Thermostat', propertyId: 'prop-2', contentType: 'media', media: [], createdAt: new Date() },
   ];

   const mockProperties = [
     { id: 'prop-1', nickname: 'Mountain Cabin', address: '123 Mountain Rd' },
     { id: 'prop-2', nickname: 'Beach House', address: '456 Ocean Ave' },
     { id: 'prop-3', nickname: 'Downtown Loft', address: '789 Main St' },
   ];
   ```

3. **Test: Renders with property selector**
   - Render component with default props
   - Assert dialog role is present
   - Assert "Move X Items" text is visible
   - Assert "Destination property" label is visible

4. **Test: Shows item preview list**
   - Render with mock items
   - Assert item titles are visible
   - Assert source property names are shown

5. **Test: Filters out current property**
   - Render with `currentPropertyId="prop-1"`
   - Open dropdown
   - Assert "Mountain Cabin" is NOT in options
   - Assert other properties ARE in options

6. **Test: Property dropdown opens on click**
   - Render component
   - Click dropdown button
   - Assert listbox is visible

7. **Test: Property selection updates display**
   - Render component
   - Open dropdown, click "Beach House"
   - Assert "Beach House" is shown in button

8. **Test: Confirm disabled without selection**
   - Render component
   - Assert confirm button is disabled
   - Select a property
   - Assert confirm button is NOT disabled

9. **Test: Calls onConfirm with property ID**
   - Create mock `onConfirm` function
   - Render with mock
   - Select property, click confirm
   - Assert `onConfirm` called with correct property ID

10. **Test: Calls onCancel on cancel click**
    - Create mock `onCancel` function
    - Render with mock
    - Click cancel button
    - Assert `onCancel` called

11. **Test: Calls onCancel on X button click**
    - Create mock `onCancel` function
    - Render with mock
    - Click close (X) button
    - Assert `onCancel` called

12. **Test: Calls onCancel on Escape key**
    - Create mock `onCancel` function
    - Render with mock
    - Fire Escape keydown event
    - Assert `onCancel` called

13. **Test: Loading state disables controls**
    - Render with `loading={true}`
    - Assert dropdown is disabled
    - Assert confirm button is disabled

14. **Test: Shows overflow message for many items**
    - Create 10 mock items
    - Render with large item array
    - Assert "(and 5 more...)" text is visible

15. **Test: Empty properties shows message**
    - Render with `properties={[]}`
    - Assert "No other properties available" is visible

16. **Test: Accessibility - dialog has correct role**
    - Render component
    - Assert `role="dialog"` and `aria-modal="true"` are present

17. **Test: Accessibility - dropdown has ARIA attributes**
    - Render component
    - Assert button has `aria-haspopup` and `aria-expanded`
    - Open dropdown
    - Assert `aria-expanded="true"`

#### Verification

- [ ] All tests pass with `npm test`
- [ ] Tests cover rendering, interactions, and accessibility
- [ ] No console errors during test runs
- [ ] Test coverage meets minimum threshold

---

### Task 3.6.10: Write Integration Tests for Move Flow

**Objective:** Test the end-to-end flow of opening dialog, selecting property, and confirming move.

**Estimated Effort:** ~1 hour

#### Steps

1. **Create or update integration test file**
   - Create `src/components/ItemManager/__tests__/BulkMoveFlow.test.tsx`

2. **Test: Complete move flow end-to-end**
   - Render ItemManager with multi-property setup
   - Select multiple items
   - Click "Move to..." in BulkActionsBar
   - Assert dialog opens
   - Select destination property
   - Click confirm
   - Assert onUpdateItem called for each item
   - Assert dialog closes
   - Assert selection is cleared

3. **Test: Dialog only shows in multi-property mode**
   - Render ItemManager with single property
   - Select items
   - Assert "Move to..." button is NOT visible

4. **Test: Items reflect new property after move**
   - Track onUpdateItem calls
   - Complete move flow
   - Assert each item was updated with new propertyId

5. **Test: Selection cleared after move**
   - Complete move flow
   - Assert no items are selected

6. **Test: Focus returns to trigger button on close**
   - Open dialog
   - Cancel dialog
   - Assert focus is on "Move to..." button (or appropriate element)

#### Verification

- [ ] Integration tests pass
- [ ] Flow works correctly from start to finish
- [ ] State is properly cleaned up after operations

---

### Task 3.6.11: Accessibility Audit and Fixes

**Objective:** Ensure the BulkMoveDialog meets accessibility requirements.

**Estimated Effort:** ~30 minutes

#### Steps

1. **Keyboard navigation audit**
   - Tab through all interactive elements
   - Verify focus order is logical
   - Verify all controls are reachable via keyboard

2. **Screen reader testing**
   - Test with VoiceOver (macOS) or NVDA (Windows)
   - Verify dialog announcement on open
   - Verify property options are read correctly
   - Verify item preview list is navigable

3. **ARIA attribute verification**
   - Verify `role="dialog"` and `aria-modal="true"` on modal
   - Verify `aria-labelledby` points to title
   - Verify dropdown has `aria-expanded`, `aria-haspopup`
   - Verify options have `role="option"` and `aria-selected`

4. **Focus management verification**
   - Verify focus moves to dialog on open
   - Verify focus is trapped within dialog
   - Verify focus returns to trigger on close

5. **Fix any identified issues**
   - Add missing ARIA labels
   - Correct focus management if needed
   - Ensure color contrast meets AA standards

#### Verification

- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader correctly announces dialog and content
- [ ] Focus is properly managed
- [ ] No accessibility errors in automated testing

---

## Testing Summary

### Unit Test Cases

| Test Case | Component | Priority |
|-----------|-----------|----------|
| Renders dialog with property dropdown | BulkMoveDialog | High |
| Shows correct item count in header | BulkMoveDialog | High |
| Shows item preview list with source properties | ItemPreviewList | High |
| Property dropdown opens/closes correctly | PropertyDropdown | High |
| Keyboard navigation in dropdown | PropertyDropdown | Medium |
| Disables confirm when no property selected | BulkMoveDialog | High |
| Calls onConfirm with property ID | BulkMoveDialog | High |
| Calls onCancel when cancelled | BulkMoveDialog | High |
| Escape key closes dialog | BulkMoveDialog | Medium |
| Loading state disables controls | BulkMoveDialog | Medium |
| Filters out current property | PropertyDropdown | Medium |

### Integration Test Cases

| Test Case | Priority |
|-----------|----------|
| Move flow end-to-end | High |
| Dialog only shows in multi-property mode | High |
| Items updated with new propertyId | High |
| Selection cleared after move | Medium |
| Focus management on close | Medium |

### Accessibility Test Cases

| Test Case | Priority |
|-----------|----------|
| Dialog has correct role and modal attribute | High |
| Dropdown has correct ARIA attributes | High |
| Keyboard navigation works throughout | High |
| Screen reader announces content correctly | Medium |
| Focus trapped within dialog | Medium |

---

## Acceptance Criteria Mapping

| Acceptance Criteria (from REQ-073) | Task | Verification |
|-----------------------------------|------|--------------|
| Bulk move action available when items selected in multi-property mode | 3.6.8 | "Move to..." button visible in BulkActionsBar |
| Dialog opens with property selector | 3.6.2, 3.6.4 | PropertyDropdown renders in dialog body |
| Dialog displays preview of selected items | 3.6.3 | ItemPreviewList shows items with source property |
| Users can select destination property | 3.6.2 | Dropdown allows selection, updates display |
| Upon confirmation, items are transferred | 3.6.8 | onUpdateItem called with new propertyId |
| Bulk move not visible in single-property mode | 3.6.8 | Conditional rendering based on multiPropertyMode |
| Users can cancel without changes | 3.6.5 | Cancel/X buttons call onCancel |
| Confirmation shows item count | 3.6.4 | Button text: "Move X Items" |

---

## Implementation Sequence Summary

1. **Task 3.6.1** - Create file structure and types (~30 min)
2. **Task 3.6.2** - Implement PropertyDropdown (~1.5 hr)
3. **Task 3.6.3** - Implement ItemPreviewList (~45 min)
4. **Task 3.6.4** - Implement modal container (~1 hr)
5. **Task 3.6.5** - Wire up components (~45 min)
6. **Task 3.6.6** - Update barrel export (~15 min)
7. **Task 3.6.7** - Update types file (~20 min)
8. **Task 3.6.8** - Integrate into ItemManager (~1 hr)
9. **Task 3.6.9** - Write unit tests (~1.5 hr)
10. **Task 3.6.10** - Write integration tests (~1 hr)
11. **Task 3.6.11** - Accessibility audit (~30 min)

**Total Estimated Effort:** ~9 hours

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Properties array is empty | Show "No other properties available" message |
| User moves items to same property | Filter out current property from options |
| Large number of selected items | Limit preview to 5 items with overflow message |
| Focus management issues | Use useEffect for focus trapping, test manually |
| Bulk update performance | Process sequentially, show loading state |

---

## Related Documents

- [Overview Document](docs/REQ-073-implement-bulkmovedialog-overview.md)
- [Implementation Plan](docs/prd/item-capture-manager-implementation-plan.md) - Phase 3, Task 3.6
- [Request #073](docs/gen_requests.md#req-073-bulk-move-items-between-properties)
- [BulkActionsBar](docs/REQ-070-build-bulkactionsbar-component-overview.md)
- [BulkTagDialog](docs/REQ-072-implement-bulktagdialog-overview.md) - Similar pattern
