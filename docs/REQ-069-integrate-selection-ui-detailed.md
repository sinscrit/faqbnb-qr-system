# REQ-069: Integrate Selection UI - Detailed Task Breakdown

**Document Created:** 2026-01-03T15:45:00
**Last Modified:** 2026-01-03T15:45:00
**Request Reference:** REQ-069 (Selection Mode UI Integration with Visual Feedback)
**Overview Document:** `/docs/REQ-069-integrate-selection-ui-overview.md`
**Implementation Plan:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.2

---

## Executive Summary

This document provides the detailed, step-by-step task breakdown for integrating selection UI into the ItemCard and ItemRow components. This task connects the `useItemSelection` hook (Task 3.1) to the visual components, enabling users to select items via checkboxes, long-press gestures on mobile, and providing clear visual feedback for selected items.

Each task is scoped to approximately 1 story point (a few hours of focused work) to enable efficient implementation and verification.

---

## Prerequisites

Before starting these tasks, ensure the following are complete:

- [ ] Task 1.4: ItemCard component exists at `src/components/ItemManager/components/ItemCard.tsx`
- [ ] Task 1.5: ItemRow component exists at `src/components/ItemManager/components/ItemRow.tsx`
- [ ] Task 3.1: useItemSelection hook exists at `src/components/ItemManager/hooks/useItemSelection.ts`
- [ ] Task 2.2: ItemToolbar component exists at `src/components/ItemManager/components/ItemToolbar.tsx`

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/hooks/useLongPress.ts` | Reusable long-press gesture hook for mobile selection mode entry |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/ItemCard.tsx` | Add checkbox overlay, selection styling, long-press handlers |
| `src/components/ItemManager/components/ItemRow.tsx` | Add checkbox column, selection styling, long-press handlers |
| `src/components/ItemManager/ItemManager.tsx` | Wire selection hook to child components |
| `src/components/ItemManager/components/ItemToolbar.tsx` | Add selection count indicator |
| `src/components/ItemManager/ItemManager.types.ts` | Update props interfaces for selection support |
| `src/components/ItemManager/hooks/index.ts` | Export useLongPress hook |

---

## Detailed Task Breakdown

### Task 3.2.1: Create useLongPress Hook

**Estimated Effort:** 1-2 hours
**File:** `src/components/ItemManager/hooks/useLongPress.ts`

#### 3.2.1.1: Create useLongPress Hook File with Interface Definitions

**Description:** Create the useLongPress hook file with TypeScript interfaces for options and return values.

**Implementation Steps:**

1. Create file `src/components/ItemManager/hooks/useLongPress.ts`
2. Add `'use client'` directive at the top
3. Define `UseLongPressOptions` interface:
   - `onLongPress: () => void` - Required callback when long-press detected
   - `delay?: number` - Optional delay in ms (default: 500)
   - `enabled?: boolean` - Optional enable/disable flag (default: true)
   - `hapticFeedback?: boolean` - Optional haptic feedback (default: true)
4. Define `UseLongPressReturn` interface:
   - `handlers` object with touch event handlers
   - `isLongPress: () => boolean` - Function to check if long-press occurred
   - `reset: () => void` - Function to reset long-press state

**Verification:**
- [ ] File exists at correct path
- [ ] Interfaces are properly typed
- [ ] No TypeScript errors

#### 3.2.1.2: Implement useLongPress Core Logic

**Description:** Implement the hook's core timer-based long-press detection logic.

**Implementation Steps:**

1. Import `useRef`, `useCallback`, `useEffect` from React
2. Create refs for timer (`NodeJS.Timeout | null`) and long-press state (`boolean`)
3. Implement `start` callback:
   - Return early if not enabled
   - Reset `isLongPressRef` to false
   - Set timeout with configured delay
   - On timeout trigger: set `isLongPressRef` to true, call haptic feedback if enabled, call `onLongPress`
4. Implement `cancel` callback:
   - Clear timeout if exists
   - Set timer ref to null
5. Implement `reset` callback:
   - Call cancel
   - Reset `isLongPressRef` to false
6. Add cleanup effect to clear timer on unmount

**Verification:**
- [ ] Timer starts on touch/mouse down
- [ ] Timer cancels on touch/mouse up
- [ ] Long-press triggers after delay
- [ ] Cleanup runs on unmount

#### 3.2.1.3: Implement Touch Event Handlers

**Description:** Add touch event handlers for mobile long-press detection.

**Implementation Steps:**

1. Create `handleContextMenu` callback to prevent context menu when long-press detected
2. Create handlers object with:
   - `onTouchStart: start`
   - `onTouchEnd: cancel`
   - `onTouchCancel: cancel`
   - `onTouchMove: cancel` - Cancel if user moves finger
   - `onContextMenu: handleContextMenu`
3. Return object with `handlers`, `isLongPress` function, and `reset` function
4. Add haptic feedback using `navigator.vibrate(50)` if available

**Verification:**
- [ ] Touch start initiates timer
- [ ] Touch end/cancel clears timer
- [ ] Touch move cancels long-press
- [ ] Context menu prevented during long-press
- [ ] Haptic feedback works on supported devices

#### 3.2.1.4: Export useLongPress Hook

**Description:** Export the hook from the hooks index file.

**Implementation Steps:**

1. Add `export { useLongPress } from './useLongPress';` to `src/components/ItemManager/hooks/index.ts`
2. Add default export in `useLongPress.ts`

**Verification:**
- [ ] Hook is importable from `@/components/ItemManager/hooks`
- [ ] No circular dependency warnings

---

### Task 3.2.2: Update ItemCard with Selection Props

**Estimated Effort:** 2-3 hours
**File:** `src/components/ItemManager/components/ItemCard.tsx`

#### 3.2.2.1: Update ItemCardProps Interface

**Description:** Add selection-related props to the ItemCard component interface.

**Implementation Steps:**

1. Open `src/components/ItemManager/ItemManager.types.ts` or the ItemCard file
2. Add to `ItemCardProps` interface:
   - `isSelected: boolean` - Whether the card is currently selected
   - `isSelectionMode: boolean` - Whether selection mode is active
   - `onToggleSelection: (id: string) => void` - Toggle selection callback
   - `onLongPressSelect: (id: string) => void` - Long-press selection callback

**Verification:**
- [ ] Props interface updated with all selection props
- [ ] All props are properly typed
- [ ] No TypeScript errors in interface definition

#### 3.2.2.2: Integrate useLongPress Hook in ItemCard

**Description:** Add long-press detection to ItemCard for mobile selection mode entry.

**Implementation Steps:**

1. Import `useLongPress` from `../hooks/useLongPress`
2. Add useLongPress hook call with:
   - `onLongPress`: callback that calls `onLongPressSelect(item.id)`
   - `enabled`: `!isSelectionMode` (only trigger when not already in selection mode)
3. Spread `handlers` from useLongPress onto the card container element
4. Use `isLongPress()` in click handler to prevent click action after long-press

**Verification:**
- [ ] Long-press on card triggers selection mode (on mobile/touch)
- [ ] Long-press is disabled when already in selection mode
- [ ] Regular clicks still work after long-press is cancelled

#### 3.2.2.3: Add Checkbox Overlay to ItemCard

**Description:** Add a checkbox in the thumbnail area that appears when selection mode is active.

**Implementation Steps:**

1. Add conditional rendering: `{isSelectionMode && (...)}` wrapping checkbox
2. Position checkbox container absolutely at top-left: `absolute top-2 left-2 z-10`
3. Add background container: `bg-white/90 backdrop-blur-sm rounded p-1 shadow-sm`
4. Add checkbox input:
   - `type="checkbox"`
   - `checked={isSelected}`
   - `onChange={() => onToggleSelection(item.id)}`
   - `onClick={(e) => e.stopPropagation()}` - Prevent card click
   - `className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"`
   - `aria-label={`Select ${item.title}`}`
5. Wrap checkbox container with `onClick={(e) => e.stopPropagation()}` to prevent bubbling

**Verification:**
- [ ] Checkbox visible only when isSelectionMode is true
- [ ] Checkbox reflects isSelected state
- [ ] Clicking checkbox toggles selection
- [ ] Checkbox click does not trigger card click
- [ ] Checkbox has accessible label

#### 3.2.2.4: Update ItemCard Click Behavior for Selection Mode

**Description:** Modify click handler to toggle selection instead of preview when in selection mode.

**Implementation Steps:**

1. Update the card's onClick handler:
   ```typescript
   const handleCardClick = (e: React.MouseEvent) => {
     // Ignore checkbox clicks (handled separately)
     if ((e.target as HTMLElement).tagName === 'INPUT') return;

     // Ignore if this was a long-press
     if (isLongPress()) return;

     // In selection mode, toggle selection
     if (isSelectionMode) {
       onToggleSelection(item.id);
       return;
     }

     // Normal mode: open preview
     onPreviewClick(item);
   };
   ```
2. Ensure keyboard handler (Enter/Space) also respects selection mode

**Verification:**
- [ ] Click toggles selection when in selection mode
- [ ] Click opens preview when not in selection mode
- [ ] Long-press doesn't trigger click action
- [ ] Keyboard activation works in both modes

#### 3.2.2.5: Apply Selected State Styling to ItemCard

**Description:** Add visual styling to indicate when a card is selected.

**Implementation Steps:**

1. Update card container className to use `cn()` with conditional classes:
   ```typescript
   className={cn(
     "group cursor-pointer bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden",
     "hover:shadow-lg hover:border-gray-300",
     "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
     // Selected state
     isSelected
       ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
       : "border-gray-200",
     // Selection mode hover indicator (when not selected)
     isSelectionMode && !isSelected && "hover:ring-1 hover:ring-blue-300",
     className
   )}
   ```
2. Add `aria-selected={isSelected}` to the card container
3. Optionally add a subtle overlay for selected items: `{isSelected && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none rounded-xl" />}`

**Verification:**
- [ ] Selected cards have blue border and ring
- [ ] Selected cards have blue background tint
- [ ] Unselected cards in selection mode show blue ring on hover
- [ ] aria-selected attribute reflects selection state
- [ ] Transitions are smooth (200ms)

---

### Task 3.2.3: Update ItemRow with Selection Props

**Estimated Effort:** 2-3 hours
**File:** `src/components/ItemManager/components/ItemRow.tsx`

#### 3.2.3.1: Update ItemRowProps Interface

**Description:** Add selection-related props to the ItemRow component interface.

**Implementation Steps:**

1. Open `src/components/ItemManager/ItemManager.types.ts` or the ItemRow file
2. Add to `ItemRowProps` interface:
   - `isSelected: boolean` - Whether the row is currently selected
   - `isSelectionMode: boolean` - Whether selection mode is active
   - `onToggleSelection: (id: string) => void` - Toggle selection callback
   - `onLongPressSelect: (id: string) => void` - Long-press selection callback

**Verification:**
- [ ] Props interface updated with all selection props
- [ ] All props are properly typed
- [ ] No TypeScript errors in interface definition

#### 3.2.3.2: Integrate useLongPress Hook in ItemRow

**Description:** Add long-press detection to ItemRow for mobile selection mode entry.

**Implementation Steps:**

1. Import `useLongPress` from `../hooks/useLongPress`
2. Add useLongPress hook call with:
   - `onLongPress`: callback that calls `onLongPressSelect(item.id)`
   - `enabled`: `!isSelectionMode`
3. Spread `handlers` from useLongPress onto the row container element
4. Use `isLongPress()` in click handler to prevent click action after long-press

**Verification:**
- [ ] Long-press on row triggers selection mode (on mobile/touch)
- [ ] Long-press is disabled when already in selection mode
- [ ] Regular clicks still work after long-press is cancelled

#### 3.2.3.3: Add Checkbox Column to ItemRow

**Description:** Add a checkbox column on the left when selection mode is active.

**Implementation Steps:**

1. Add conditional checkbox column at the start of the row content:
   ```typescript
   {isSelectionMode && (
     <div className="flex-shrink-0 w-10 flex items-center justify-center">
       <input
         type="checkbox"
         checked={isSelected}
         onChange={() => onToggleSelection(item.id)}
         onClick={(e) => e.stopPropagation()}
         className="w-5 h-5 rounded border-gray-300 text-blue-600
                    focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
         aria-label={`Select ${item.title}`}
       />
     </div>
   )}
   ```
2. Ensure checkbox column doesn't affect other column widths (use flex-shrink-0)

**Verification:**
- [ ] Checkbox column visible only when isSelectionMode is true
- [ ] Checkbox reflects isSelected state
- [ ] Clicking checkbox toggles selection
- [ ] Checkbox click does not trigger row click
- [ ] Checkbox has accessible label
- [ ] Row layout adjusts properly with checkbox column

#### 3.2.3.4: Update ItemRow Click Behavior for Selection Mode

**Description:** Modify click handler to toggle selection instead of preview when in selection mode.

**Implementation Steps:**

1. Update the row's onClick handler:
   ```typescript
   const handleRowClick = (e: React.MouseEvent) => {
     const target = e.target as HTMLElement;
     // Ignore clicks on interactive elements
     if (
       target.tagName === 'INPUT' ||
       target.tagName === 'BUTTON' ||
       target.closest('button') ||
       target.closest('[role="menu"]')
     ) {
       return;
     }

     // Ignore if this was a long-press
     if (isLongPress()) return;

     // In selection mode, toggle selection
     if (isSelectionMode) {
       onToggleSelection(item.id);
       return;
     }

     // Normal mode: open preview
     onPreviewClick(item);
   };
   ```
2. Ensure keyboard handler (Enter/Space) also respects selection mode

**Verification:**
- [ ] Click toggles selection when in selection mode
- [ ] Click opens preview when not in selection mode
- [ ] Button/menu clicks are not intercepted
- [ ] Long-press doesn't trigger click action
- [ ] Keyboard activation works in both modes

#### 3.2.3.5: Apply Selected State Styling to ItemRow

**Description:** Add visual styling to indicate when a row is selected.

**Implementation Steps:**

1. Update row container className to use `cn()` with conditional classes:
   ```typescript
   className={cn(
     "flex items-center gap-4 px-4 py-3 bg-white border-b transition-colors cursor-pointer",
     "hover:bg-gray-50",
     "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
     // Selected state
     isSelected
       ? "bg-blue-50 border-l-4 border-l-blue-500 border-b-gray-200"
       : "border-gray-200",
     // Selection mode hover indicator
     isSelectionMode && !isSelected && "hover:bg-blue-50/50",
     className
   )}
   ```
2. Add `role="row"` and `aria-selected={isSelected}` to the row container

**Verification:**
- [ ] Selected rows have blue background tint
- [ ] Selected rows have left blue border indicator
- [ ] Unselected rows in selection mode show blue background on hover
- [ ] aria-selected attribute reflects selection state
- [ ] Transitions are smooth

---

### Task 3.2.4: Add Selection Count Display to ItemToolbar

**Estimated Effort:** 1-2 hours
**File:** `src/components/ItemManager/components/ItemToolbar.tsx`

#### 3.2.4.1: Create SelectionIndicator Sub-component

**Description:** Create a selection count badge component for the toolbar.

**Implementation Steps:**

1. Import `X` and `CheckSquare` icons from `lucide-react`
2. Create `SelectionIndicatorProps` interface:
   - `selectedCount: number`
   - `onClearSelection: () => void`
   - `onSelectAll?: () => void`
   - `totalCount?: number`
3. Create `SelectionIndicator` component:
   - Return null if `selectedCount === 0`
   - Display badge with `CheckSquare` icon and count text
   - Add clear button with `X` icon
   - Optionally show "Select all" link if not all items selected
   - Add `role="status"` and `aria-live="polite"` for accessibility

**Verification:**
- [ ] Component renders nothing when count is 0
- [ ] Badge shows correct count
- [ ] Clear button triggers callback
- [ ] Screen readers announce count changes

#### 3.2.4.2: Style SelectionIndicator Badge

**Description:** Apply proper styling to the selection indicator.

**Implementation Steps:**

1. Style the badge container:
   - `flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full`
2. Style the count text:
   - `text-sm font-medium`
   - Format: "{count} selected"
3. Style the clear button:
   - `ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors`
   - Include accessible label: `aria-label="Clear selection"`
4. Style "Select all" link (if shown):
   - `text-sm text-blue-600 hover:text-blue-800 font-medium`

**Verification:**
- [ ] Badge has blue background/text colors
- [ ] Clear button has hover state
- [ ] All buttons have accessible labels
- [ ] Layout is visually balanced

#### 3.2.4.3: Integrate SelectionIndicator into ItemToolbar

**Description:** Add the selection indicator to the toolbar layout.

**Implementation Steps:**

1. Update `ItemToolbarProps` to include:
   - `selectedCount?: number`
   - `onClearSelection?: () => void`
   - `onSelectAll?: () => void`
   - `totalCount?: number`
2. Add `SelectionIndicator` to toolbar layout:
   - Position in toolbar (e.g., before or after search)
   - Only render when selection-related props are provided
3. Ensure proper spacing with other toolbar elements

**Verification:**
- [ ] Selection indicator appears when items selected
- [ ] Indicator disappears when selection cleared
- [ ] Toolbar layout remains balanced
- [ ] Works in both mobile and desktop views

---

### Task 3.2.5: Wire Selection in ItemManager

**Estimated Effort:** 2-3 hours
**File:** `src/components/ItemManager/ItemManager.tsx`

#### 3.2.5.1: Import and Initialize useItemSelection Hook

**Description:** Add the useItemSelection hook to the main ItemManager component.

**Implementation Steps:**

1. Import `useItemSelection` from `./hooks/useItemSelection`
2. Add hook call with appropriate options:
   ```typescript
   const {
     selectedIds,
     selectedCount,
     isSelectionMode,
     selectItem,
     toggleItem,
     selectAll,
     clearSelection,
     isSelected,
     enterSelectionMode,
   } = useItemSelection({
     maxSelection: config?.maxBulkSelection ?? 100,
     onSelectionChange: props.onSelectionChange,
   });
   ```

**Verification:**
- [ ] Hook initializes without errors
- [ ] Selection state is accessible in component
- [ ] maxSelection respects config

#### 3.2.5.2: Create Long-Press Selection Handler

**Description:** Implement the handler that enters selection mode and selects the first item on long-press.

**Implementation Steps:**

1. Create `handleLongPressSelect` callback:
   ```typescript
   const handleLongPressSelect = useCallback((id: string) => {
     if (!isSelectionMode) {
       enterSelectionMode();
     }
     selectItem(id);
   }, [isSelectionMode, enterSelectionMode, selectItem]);
   ```
2. Wrap with `useCallback` for performance

**Verification:**
- [ ] Long-press enters selection mode if not active
- [ ] Long-press selects the item
- [ ] Callback is memoized properly

#### 3.2.5.3: Create Select All Handler

**Description:** Implement the handler that selects all currently filtered/visible items.

**Implementation Steps:**

1. Create `handleSelectAll` callback:
   ```typescript
   const handleSelectAll = useCallback(() => {
     const ids = filteredItems.map(item => item.id);
     selectAll(ids);
   }, [selectAll, filteredItems]);
   ```
2. Ensure it uses the filtered/visible items list, not all items

**Verification:**
- [ ] Select all selects only visible/filtered items
- [ ] Works correctly after filter changes
- [ ] Callback is memoized properly

#### 3.2.5.4: Pass Selection Props to ItemToolbar

**Description:** Wire selection state and callbacks to the ItemToolbar component.

**Implementation Steps:**

1. Add selection props to ItemToolbar:
   ```typescript
   <ItemToolbar
     // ... existing props
     selectedCount={selectedCount}
     onClearSelection={clearSelection}
     onSelectAll={handleSelectAll}
     totalCount={filteredItems.length}
   />
   ```

**Verification:**
- [ ] Toolbar shows selection count when items selected
- [ ] Clear selection button works
- [ ] Select all button works
- [ ] Total count is accurate

#### 3.2.5.5: Pass Selection Props to ItemGrid/ItemCard

**Description:** Wire selection state and callbacks to ItemGrid and ItemCard components.

**Implementation Steps:**

1. Update ItemGrid to accept and pass selection props:
   ```typescript
   <ItemGrid
     items={filteredItems}
     isSelectionMode={isSelectionMode}
     isSelected={isSelected}
     onToggleSelection={toggleItem}
     onLongPressSelect={handleLongPressSelect}
     onPreviewClick={handlePreviewClick}
   />
   ```
2. Ensure ItemGrid passes props to individual ItemCard components:
   ```typescript
   <ItemCard
     key={item.id}
     item={item}
     isSelected={isSelected(item.id)}
     isSelectionMode={isSelectionMode}
     onToggleSelection={onToggleSelection}
     onLongPressSelect={onLongPressSelect}
     onPreviewClick={onPreviewClick}
   />
   ```

**Verification:**
- [ ] ItemCards receive selection props
- [ ] Selection state displays correctly in grid
- [ ] Toggle/long-press callbacks work

#### 3.2.5.6: Pass Selection Props to ItemList/ItemRow

**Description:** Wire selection state and callbacks to ItemList and ItemRow components.

**Implementation Steps:**

1. Update ItemList to accept and pass selection props:
   ```typescript
   <ItemList
     items={filteredItems}
     isSelectionMode={isSelectionMode}
     isSelected={isSelected}
     onToggleSelection={toggleItem}
     onLongPressSelect={handleLongPressSelect}
     onPreviewClick={handlePreviewClick}
     onEdit={handleEditItem}
     onDelete={handleDeleteItem}
   />
   ```
2. Ensure ItemList passes props to individual ItemRow components

**Verification:**
- [ ] ItemRows receive selection props
- [ ] Selection state displays correctly in list
- [ ] Toggle/long-press callbacks work

---

### Task 3.2.6: Testing and Verification

**Estimated Effort:** 2-3 hours

#### 3.2.6.1: Unit Test useLongPress Hook

**Description:** Write unit tests for the useLongPress hook.

**Implementation Steps:**

1. Create test file `src/components/ItemManager/hooks/__tests__/useLongPress.test.ts`
2. Test cases:
   - Long-press triggers callback after delay
   - Touch end cancels long-press before trigger
   - Touch move cancels long-press
   - `isLongPress()` returns true after trigger
   - Reset clears long-press state
   - Disabled hook doesn't trigger callback
   - Cleanup clears timer on unmount

**Verification:**
- [ ] All unit tests pass
- [ ] Code coverage is adequate

#### 3.2.6.2: Test Selection UI in ItemCard

**Description:** Verify selection UI behavior in ItemCard component.

**Test Cases:**

- [ ] Checkbox appears only when `isSelectionMode=true`
- [ ] Checkbox reflects `isSelected` state correctly
- [ ] Clicking checkbox toggles selection (calls `onToggleSelection`)
- [ ] Clicking checkbox does not trigger card click
- [ ] Card click toggles selection when in selection mode
- [ ] Card click opens preview when not in selection mode
- [ ] Long-press triggers `onLongPressSelect` callback
- [ ] Selected card has blue border/ring/background
- [ ] Focus states are visible and accessible

#### 3.2.6.3: Test Selection UI in ItemRow

**Description:** Verify selection UI behavior in ItemRow component.

**Test Cases:**

- [ ] Checkbox column appears only when `isSelectionMode=true`
- [ ] Checkbox reflects `isSelected` state correctly
- [ ] Clicking checkbox toggles selection
- [ ] Clicking checkbox does not trigger row click
- [ ] Row click toggles selection when in selection mode
- [ ] Row click opens preview when not in selection mode
- [ ] Long-press triggers `onLongPressSelect` callback
- [ ] Selected row has blue background and left border
- [ ] Action buttons still work when in selection mode

#### 3.2.6.4: Test Selection Count Display

**Description:** Verify selection count indicator behavior.

**Test Cases:**

- [ ] Count badge hidden when no items selected
- [ ] Count badge shows correct number
- [ ] Clear button clears all selections
- [ ] "Select all" shows correct total
- [ ] Screen reader announces count changes (aria-live)

#### 3.2.6.5: Mobile/Touch Testing

**Description:** Verify selection behavior on touch devices.

**Test Cases:**

- [ ] Long-press (500ms) on iOS Safari triggers selection
- [ ] Long-press on Android Chrome triggers selection
- [ ] Touch scroll does not trigger selection
- [ ] Context menu is prevented during long-press
- [ ] Haptic feedback works (where supported)
- [ ] Checkbox touch targets are at least 44x44px

#### 3.2.6.6: Accessibility Testing

**Description:** Verify accessibility compliance.

**Test Cases:**

- [ ] Checkboxes are keyboard accessible (Tab to focus, Space to toggle)
- [ ] All checkboxes have aria-labels
- [ ] Cards/rows have aria-selected attribute
- [ ] Selection count announced by screen readers
- [ ] Focus indicators are visible
- [ ] Touch targets meet WCAG AA minimum (44x44px)

---

## Implementation Order

The recommended implementation order based on dependencies:

```
3.2.1.1 → 3.2.1.2 → 3.2.1.3 → 3.2.1.4  (useLongPress hook)
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
3.2.2.1 → 3.2.2.2 → 3.2.2.3 → 3.2.2.4 → 3.2.2.5  3.2.3.1 → 3.2.3.2 → 3.2.3.3 → 3.2.3.4 → 3.2.3.5
              (ItemCard updates)                         (ItemRow updates)
                    ↓                               ↓
                    └───────────────┬───────────────┘
                                    ↓
3.2.4.1 → 3.2.4.2 → 3.2.4.3  (SelectionIndicator in Toolbar)
                                    ↓
3.2.5.1 → 3.2.5.2 → 3.2.5.3 → 3.2.5.4 → 3.2.5.5 → 3.2.5.6  (Wire in ItemManager)
                                    ↓
            3.2.6.1 → 3.2.6.2 → 3.2.6.3 → 3.2.6.4 → 3.2.6.5 → 3.2.6.6  (Testing)
```

**Notes:**
- Tasks 3.2.2 (ItemCard) and 3.2.3 (ItemRow) can be worked on in parallel after useLongPress is complete
- Task 3.2.4 (SelectionIndicator) can be worked on in parallel with 3.2.2/3.2.3
- Task 3.2.5 (wiring) requires 3.2.2, 3.2.3, and 3.2.4 to be complete
- Task 3.2.6 (testing) requires all implementation tasks to be complete

---

## Acceptance Criteria Mapping

| Acceptance Criteria (REQ-069) | Task(s) |
|-------------------------------|---------|
| Checkboxes appear on item cards when selection mode is active | 3.2.2.3 |
| Checkboxes appear on item rows when selection mode is active | 3.2.3.3 |
| Long-press gesture on mobile activates selection mode | 3.2.1, 3.2.2.2, 3.2.3.2, 3.2.5.2 |
| Selected items display visually distinct appearance | 3.2.2.5, 3.2.3.5 |
| Selection count indicator shows current number | 3.2.4 |
| Visual state differentiates selection mode active/inactive | 3.2.2.5, 3.2.3.5 |
| Checkbox controls accessible (WCAG touch targets, keyboard) | 3.2.2.3, 3.2.3.3, 3.2.6.6 |
| Selection state updates immediately and smoothly | 3.2.2.5, 3.2.3.5 (transition classes) |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Long-press conflicts with scroll | useLongPress cancels on touchmove (3.2.1.3) |
| iOS Safari long-press quirks | handleContextMenu prevents native menu (3.2.1.3) |
| Performance with many items | Use React.memo on ItemCard/ItemRow, memoize callbacks |
| Accessibility gaps | Include accessibility testing tasks (3.2.6.6) |
| Complex state synchronization | Use single source of truth in useItemSelection |

---

## Related Documents

- [REQ-069 Overview](/docs/REQ-069-integrate-selection-ui-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 3, Task 3.2
- [useItemSelection Hook](/docs/REQ-068-create-useitemselection-hook-overview.md) - Prerequisite task
- [ItemCard Component](/docs/REQ-058-implement-itemcard-component-overview.md) - Component being modified
- [ItemRow Component](/docs/REQ-059-implement-itemrow-component-overview.md) - Component being modified

---

## Summary

This detailed breakdown contains **24 granular tasks** organized into 6 major task groups:

| Task Group | Sub-tasks | Estimated Effort |
|------------|-----------|------------------|
| 3.2.1: useLongPress Hook | 4 | 1-2 hours |
| 3.2.2: ItemCard Selection | 5 | 2-3 hours |
| 3.2.3: ItemRow Selection | 5 | 2-3 hours |
| 3.2.4: SelectionIndicator | 3 | 1-2 hours |
| 3.2.5: Wire in ItemManager | 6 | 2-3 hours |
| 3.2.6: Testing | 6 | 2-3 hours |
| **Total** | **29** | **10-16 hours** |

Each task is scoped to be completable in a focused work session and includes clear verification criteria to confirm completion.
