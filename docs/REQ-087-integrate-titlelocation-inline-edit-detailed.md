# REQ-087: Integrate Title/Location Inline Edit - Detailed Task Breakdown

**Document Created:** 2026-01-03T14:22:00
**Last Modified:** 2026-01-03T14:22:00
**Request Reference:** `/docs/gen_requests.md` - REQ-087
**Overview Document:** `/docs/REQ-087-integrate-titlelocation-inline-edit-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 6 - Inline Edit & Polish
**Task ID:** 6.2
**Status:** PENDING

---

## Executive Summary

This document breaks down REQ-087 (Integrate Title/Location Inline Edit) into granular, actionable tasks suitable for implementation by an AI coding agent or junior developer. Each task is scoped to approximately 1 story point (a few hours of focused work).

### Prerequisite

**REQ-086 (InlineEdit Component)** must be complete before starting this task. The InlineEdit component at `src/components/ItemManager/components/shared/InlineEdit.tsx` provides the reusable click-to-edit functionality that this task integrates.

### Scope

This task integrates the InlineEdit component into ItemCard and ItemRow components to enable inline editing of item titles and locations. It does NOT create the InlineEdit component itself (that's REQ-086).

---

## Task Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TASK DEPENDENCIES                             │
└─────────────────────────────────────────────────────────────────────────┘

Task 1: Update Type Definitions
         │
         ├────────────────────────┬────────────────────────┐
         ▼                        ▼                        ▼
Task 2: ItemCard              Task 3: ItemRow          Task 4: ItemGrid
Integration                   Integration               Props Update
         │                        │                        │
         └────────────────────────┼────────────────────────┤
                                  ▼                        ▼
                           Task 5: ItemList           Task 6: ItemManager
                           Props Update               Main Component Update
                                  │                        │
                                  └────────────────────────┤
                                                           ▼
                                                    Task 7: Selection Mode
                                                    Conflict Handling
                                                           │
                                                           ▼
                                                    Task 8: Integration Testing
                                                    & Verification
```

---

## Authorized Files for Modification

Per the overview document, the following files are authorized for modification:

| File | Modification Type |
|------|-------------------|
| `src/components/ItemManager/ItemManager.types.ts` | Update interfaces |
| `src/components/ItemManager/components/ItemCard.tsx` | Add InlineEdit integration |
| `src/components/ItemManager/components/ItemRow.tsx` | Add InlineEdit integration |
| `src/components/ItemManager/components/ItemGrid.tsx` | Pass new props |
| `src/components/ItemManager/components/ItemList.tsx` | Pass new props |
| `src/components/ItemManager/ItemManager.tsx` | Propagate config and callbacks |

### Read-Only References

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/shared/InlineEdit.tsx` | Import InlineEdit component |
| `src/lib/utils.ts` | Import `cn` utility |
| `src/components/ItemCapture/ItemCapture.types.ts` | Reference ItemRecord type |

---

## Detailed Task Breakdown

---

### Task 1: Update ItemCardProps and ItemRowProps Interfaces

**Estimated Effort:** 0.5 story points (30 minutes)
**Dependencies:** None (can start immediately after REQ-086 is complete)
**File:** `src/components/ItemManager/ItemManager.types.ts`

#### Objective

Add `enableInlineEdit` and `onUpdateItem` properties to the ItemCardProps and ItemRowProps interfaces to support inline editing functionality.

#### Implementation Steps

1. **Open the types file**
   - Navigate to `src/components/ItemManager/ItemManager.types.ts`

2. **Locate ItemCardProps interface**
   - Find the `ItemCardProps` interface definition
   - If it doesn't exist, it needs to be created based on the overview document

3. **Add inline edit props to ItemCardProps**
   ```typescript
   export interface ItemCardProps {
     // Existing props...
     item: ItemRecord;
     onPreviewClick: (item: ItemRecord) => void;
     onSelectionChange: (id: string, selected: boolean) => void;
     isSelected: boolean;
     isSelectionMode: boolean;
     className?: string;

     // NEW: Add these two properties
     /** Enable inline editing of title/location (controlled by config.enableInlineEdit) */
     enableInlineEdit?: boolean;

     /** Callback when item is updated via inline edit */
     onUpdateItem?: (item: ItemRecord) => Promise<void>;
   }
   ```

4. **Locate ItemRowProps interface**
   - Find the `ItemRowProps` interface definition

5. **Add inline edit props to ItemRowProps**
   ```typescript
   export interface ItemRowProps {
     // Existing props...
     item: ItemRecord;
     onPreviewClick: (item: ItemRecord) => void;
     onSelectionChange: (id: string, selected: boolean) => void;
     isSelected: boolean;
     isSelectionMode: boolean;
     onEdit: (item: ItemRecord) => void;
     onDelete: (item: ItemRecord) => void;
     onManageAssets?: (item: ItemRecord) => void;
     onDuplicate?: (item: ItemRecord) => void;
     className?: string;

     // NEW: Add these two properties
     /** Enable inline editing of title/location (controlled by config.enableInlineEdit) */
     enableInlineEdit?: boolean;

     /** Callback when item is updated via inline edit */
     onUpdateItem?: (item: ItemRecord) => Promise<void>;
   }
   ```

6. **Ensure ItemRecord import is present**
   - Verify that `ItemRecord` is imported from ItemCapture types or defined locally

#### Verification Checklist

- [ ] ItemCardProps interface includes `enableInlineEdit?: boolean`
- [ ] ItemCardProps interface includes `onUpdateItem?: (item: ItemRecord) => Promise<void>`
- [ ] ItemRowProps interface includes `enableInlineEdit?: boolean`
- [ ] ItemRowProps interface includes `onUpdateItem?: (item: ItemRecord) => Promise<void>`
- [ ] TypeScript compilation passes with no errors
- [ ] All existing type references remain valid

#### Acceptance Criteria

- Both interfaces are updated with the new optional properties
- Documentation comments are included for new properties
- No breaking changes to existing code using these interfaces

---

### Task 2: Integrate InlineEdit into ItemCard Component

**Estimated Effort:** 1 story point (2-3 hours)
**Dependencies:** Task 1 must be complete
**File:** `src/components/ItemManager/components/ItemCard.tsx`

#### Objective

Replace the static title and location text displays in ItemCard with conditional InlineEdit components that allow users to edit these values in place.

#### Implementation Steps

1. **Add InlineEdit import**
   ```typescript
   import { InlineEdit } from './shared/InlineEdit';
   ```

2. **Add new props to component signature**
   - Destructure `enableInlineEdit` and `onUpdateItem` from props
   ```typescript
   export function ItemCard({
     item,
     onPreviewClick,
     onSelectionChange,
     isSelected,
     isSelectionMode,
     className,
     enableInlineEdit,  // NEW
     onUpdateItem,      // NEW
   }: ItemCardProps) {
   ```

3. **Create title save handler**
   ```typescript
   const handleTitleSave = async (newTitle: string) => {
     if (!onUpdateItem) return;
     await onUpdateItem({ ...item, title: newTitle });
   };
   ```

4. **Create location save handler**
   ```typescript
   const handleLocationSave = async (newLocation: string) => {
     if (!onUpdateItem) return;
     await onUpdateItem({
       ...item,
       location: newLocation || undefined,
     });
   };
   ```

5. **Calculate effective inline edit state**
   - Disable inline edit when in selection mode
   ```typescript
   const effectiveEnableInlineEdit = enableInlineEdit && !isSelectionMode && !!onUpdateItem;
   ```

6. **Replace static title with conditional InlineEdit**
   - Find the current title display (likely an `<h3>` element)
   - Replace with conditional rendering:
   ```typescript
   {effectiveEnableInlineEdit ? (
     <InlineEdit
       value={item.title}
       onSave={handleTitleSave}
       placeholder="Enter title..."
       ariaLabel={`Edit title for ${item.title}`}
       maxLength={100}
       minLength={1}
       className="font-semibold text-gray-900 text-sm leading-tight"
       displayClassName="line-clamp-2 group-hover:text-blue-600 transition-colors"
     />
   ) : (
     <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
       {item.title}
     </h3>
   )}
   ```

7. **Replace static location with conditional InlineEdit**
   - Find the current location display
   - Replace with conditional rendering:
   ```typescript
   {effectiveEnableInlineEdit ? (
     <InlineEdit
       value={item.location || ''}
       onSave={handleLocationSave}
       placeholder="Add location..."
       ariaLabel={`Edit location for ${item.title}`}
       maxLength={100}
       allowEmpty
       className="text-xs text-gray-500 mt-1"
       displayClassName="truncate"
     />
   ) : (
     item.location && (
       <p className="text-xs text-gray-500 mt-1 truncate">
         {item.location}
       </p>
     )
   )}
   ```

8. **Prevent click propagation**
   - Ensure inline edit clicks don't trigger card preview
   - The InlineEdit component should use `e.stopPropagation()` internally
   - If not, wrap the InlineEdit in a div with `onClick={(e) => e.stopPropagation()}`

#### Verification Checklist

- [ ] InlineEdit is properly imported
- [ ] New props are destructured from the component props
- [ ] Title displays as editable when `enableInlineEdit` is true
- [ ] Location displays as editable when `enableInlineEdit` is true
- [ ] Inline edit is disabled when `isSelectionMode` is true
- [ ] Clicking on title/location doesn't trigger card preview when in edit mode
- [ ] Static display renders correctly when inline edit is disabled
- [ ] Empty location doesn't show when inline edit is disabled
- [ ] Empty location shows placeholder when inline edit is enabled
- [ ] TypeScript compilation passes

#### Acceptance Criteria

- Title can be clicked to edit when inline edit is enabled
- Location can be clicked to edit when inline edit is enabled
- Changes trigger the `onUpdateItem` callback with the updated item
- Inline editing is automatically disabled during selection mode
- Original styling is preserved in both edit and display modes

---

### Task 3: Integrate InlineEdit into ItemRow Component

**Estimated Effort:** 1 story point (2-3 hours)
**Dependencies:** Task 1 must be complete
**File:** `src/components/ItemManager/components/ItemRow.tsx`

#### Objective

Replace the static title and location text displays in ItemRow with conditional InlineEdit components that allow users to edit these values in place.

#### Implementation Steps

1. **Add InlineEdit import**
   ```typescript
   import { InlineEdit } from './shared/InlineEdit';
   ```

2. **Add new props to component signature**
   - Destructure `enableInlineEdit` and `onUpdateItem` from props
   ```typescript
   export function ItemRow({
     item,
     onPreviewClick,
     onSelectionChange,
     isSelected,
     isSelectionMode,
     onEdit,
     onDelete,
     onManageAssets,
     onDuplicate,
     className,
     enableInlineEdit,  // NEW
     onUpdateItem,      // NEW
   }: ItemRowProps) {
   ```

3. **Create title save handler**
   ```typescript
   const handleTitleSave = async (newTitle: string) => {
     if (!onUpdateItem) return;
     await onUpdateItem({ ...item, title: newTitle });
   };
   ```

4. **Create location save handler**
   ```typescript
   const handleLocationSave = async (newLocation: string) => {
     if (!onUpdateItem) return;
     await onUpdateItem({
       ...item,
       location: newLocation || undefined,
     });
   };
   ```

5. **Calculate effective inline edit state**
   ```typescript
   const effectiveEnableInlineEdit = enableInlineEdit && !isSelectionMode && !!onUpdateItem;
   ```

6. **Replace static title with conditional InlineEdit**
   - Find the current title display (likely an `<h3>` element)
   - Replace with conditional rendering:
   ```typescript
   {effectiveEnableInlineEdit ? (
     <InlineEdit
       value={item.title}
       onSave={handleTitleSave}
       placeholder="Enter title..."
       ariaLabel={`Edit title for ${item.title}`}
       maxLength={100}
       minLength={1}
       className="font-medium text-gray-900"
       displayClassName="truncate"
       inputClassName="text-base"
     />
   ) : (
     <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
   )}
   ```

7. **Replace static location with conditional InlineEdit**
   - Find the current location display (likely in a column div)
   - Replace with conditional rendering:
   ```typescript
   <div className="hidden md:flex w-24 items-center">
     {effectiveEnableInlineEdit ? (
       <InlineEdit
         value={item.location || ''}
         onSave={handleLocationSave}
         placeholder="Add location"
         ariaLabel={`Edit location for ${item.title}`}
         maxLength={100}
         allowEmpty
         className="text-sm text-gray-500 w-full"
         displayClassName="truncate"
       />
     ) : (
       <span className="text-sm text-gray-500 truncate">
         {item.location || '-'}
       </span>
     )}
   </div>
   ```

8. **Prevent click propagation on row**
   - Ensure inline edit clicks don't trigger row actions
   - Wrap InlineEdit sections in click-stopping containers if needed

#### Verification Checklist

- [ ] InlineEdit is properly imported
- [ ] New props are destructured from the component props
- [ ] Title displays as editable when `enableInlineEdit` is true
- [ ] Location column displays as editable when `enableInlineEdit` is true
- [ ] Inline edit is disabled when `isSelectionMode` is true
- [ ] Clicking on title/location doesn't trigger row selection/preview
- [ ] Static display renders correctly when inline edit is disabled
- [ ] Location shows "-" when empty and inline edit is disabled
- [ ] Location shows placeholder when empty and inline edit is enabled
- [ ] TypeScript compilation passes

#### Acceptance Criteria

- Title can be clicked to edit when inline edit is enabled
- Location can be clicked to edit when inline edit is enabled
- Changes trigger the `onUpdateItem` callback with the updated item
- Inline editing is automatically disabled during selection mode
- Row layout is preserved in both edit and display modes

---

### Task 4: Update ItemGrid to Pass Inline Edit Props

**Estimated Effort:** 0.5 story points (30 minutes)
**Dependencies:** Tasks 1 and 2 must be complete
**File:** `src/components/ItemManager/components/ItemGrid.tsx`

#### Objective

Update ItemGrid to accept and pass `enableInlineEdit` and `onUpdateItem` props to each ItemCard component.

#### Implementation Steps

1. **Add new props to ItemGridProps interface**
   - If the interface is in this file, update it
   - If it's in the types file, ensure it's already updated (from Task 1)
   ```typescript
   interface ItemGridProps {
     // Existing props...
     items: ItemRecord[];
     onPreviewClick: (item: ItemRecord) => void;
     onSelectionChange: (id: string, selected: boolean) => void;
     selectedIds: Set<string>;
     isSelectionMode: boolean;

     // NEW: Add these props
     enableInlineEdit?: boolean;
     onUpdateItem?: (item: ItemRecord) => Promise<void>;
   }
   ```

2. **Destructure new props in component**
   ```typescript
   export function ItemGrid({
     items,
     onPreviewClick,
     onSelectionChange,
     selectedIds,
     isSelectionMode,
     enableInlineEdit,   // NEW
     onUpdateItem,       // NEW
   }: ItemGridProps) {
   ```

3. **Pass props to ItemCard in the map**
   - Find the `items.map()` or similar iteration
   - Add the new props to each ItemCard:
   ```typescript
   {items.map((item) => (
     <ItemCard
       key={item.id}
       item={item}
       onPreviewClick={onPreviewClick}
       onSelectionChange={onSelectionChange}
       isSelected={selectedIds.has(item.id)}
       isSelectionMode={isSelectionMode}
       enableInlineEdit={enableInlineEdit}    // NEW
       onUpdateItem={onUpdateItem}            // NEW
     />
   ))}
   ```

#### Verification Checklist

- [ ] New props are added to ItemGridProps (if defined locally)
- [ ] New props are destructured in the component
- [ ] Props are passed to every ItemCard instance
- [ ] TypeScript compilation passes
- [ ] No runtime errors when rendering grid

#### Acceptance Criteria

- ItemGrid accepts `enableInlineEdit` and `onUpdateItem` props
- These props are correctly passed to all ItemCard instances
- Grid renders correctly with both inline edit enabled and disabled

---

### Task 5: Update ItemList to Pass Inline Edit Props

**Estimated Effort:** 0.5 story points (30 minutes)
**Dependencies:** Tasks 1 and 3 must be complete
**File:** `src/components/ItemManager/components/ItemList.tsx`

#### Objective

Update ItemList to accept and pass `enableInlineEdit` and `onUpdateItem` props to each ItemRow component.

#### Implementation Steps

1. **Add new props to ItemListProps interface**
   - If the interface is in this file, update it
   - If it's in the types file, ensure it's already updated
   ```typescript
   interface ItemListProps {
     // Existing props...
     items: ItemRecord[];
     onPreviewClick: (item: ItemRecord) => void;
     onSelectionChange: (id: string, selected: boolean) => void;
     selectedIds: Set<string>;
     isSelectionMode: boolean;
     onEdit: (item: ItemRecord) => void;
     onDelete: (item: ItemRecord) => void;
     onManageAssets?: (item: ItemRecord) => void;
     onDuplicate?: (item: ItemRecord) => void;

     // NEW: Add these props
     enableInlineEdit?: boolean;
     onUpdateItem?: (item: ItemRecord) => Promise<void>;
   }
   ```

2. **Destructure new props in component**
   ```typescript
   export function ItemList({
     items,
     onPreviewClick,
     onSelectionChange,
     selectedIds,
     isSelectionMode,
     onEdit,
     onDelete,
     onManageAssets,
     onDuplicate,
     enableInlineEdit,   // NEW
     onUpdateItem,       // NEW
   }: ItemListProps) {
   ```

3. **Pass props to ItemRow in the map**
   - Find the `items.map()` or similar iteration
   - Add the new props to each ItemRow:
   ```typescript
   {items.map((item) => (
     <ItemRow
       key={item.id}
       item={item}
       onPreviewClick={onPreviewClick}
       onSelectionChange={onSelectionChange}
       isSelected={selectedIds.has(item.id)}
       isSelectionMode={isSelectionMode}
       onEdit={onEdit}
       onDelete={onDelete}
       onManageAssets={onManageAssets}
       onDuplicate={onDuplicate}
       enableInlineEdit={enableInlineEdit}    // NEW
       onUpdateItem={onUpdateItem}            // NEW
     />
   ))}
   ```

#### Verification Checklist

- [ ] New props are added to ItemListProps (if defined locally)
- [ ] New props are destructured in the component
- [ ] Props are passed to every ItemRow instance
- [ ] TypeScript compilation passes
- [ ] No runtime errors when rendering list

#### Acceptance Criteria

- ItemList accepts `enableInlineEdit` and `onUpdateItem` props
- These props are correctly passed to all ItemRow instances
- List renders correctly with both inline edit enabled and disabled

---

### Task 6: Update ItemManager Main Component

**Estimated Effort:** 0.5 story points (45 minutes)
**Dependencies:** Tasks 4 and 5 must be complete
**File:** `src/components/ItemManager/ItemManager.tsx`

#### Objective

Update the main ItemManager component to read `enableInlineEdit` from configuration and pass it along with `onUpdateItem` to the ItemGrid and ItemList components.

#### Implementation Steps

1. **Ensure config defaults include enableInlineEdit**
   - Check the default config constant
   - If not present, add it:
   ```typescript
   const DEFAULT_CONFIG: ItemManagerConfig = {
     // ... existing defaults
     enableInlineEdit: true,  // Default to enabled
   };
   ```

2. **Merge config with defaults**
   - Ensure the component properly merges user config with defaults
   ```typescript
   const config = {
     ...DEFAULT_CONFIG,
     ...props.config,
   };
   ```

3. **Pass props to ItemGrid**
   - Find where ItemGrid is rendered
   - Add the inline edit props:
   ```typescript
   <ItemGrid
     items={filteredItems}
     onPreviewClick={handlePreviewClick}
     onSelectionChange={handleSelectionChange}
     selectedIds={selectedIds}
     isSelectionMode={isSelectionMode}
     enableInlineEdit={config.enableInlineEdit}   // NEW
     onUpdateItem={props.onUpdateItem}            // NEW
   />
   ```

4. **Pass props to ItemList**
   - Find where ItemList is rendered
   - Add the inline edit props:
   ```typescript
   <ItemList
     items={filteredItems}
     onPreviewClick={handlePreviewClick}
     onSelectionChange={handleSelectionChange}
     selectedIds={selectedIds}
     isSelectionMode={isSelectionMode}
     onEdit={handleEdit}
     onDelete={handleDelete}
     onManageAssets={handleManageAssets}
     onDuplicate={handleDuplicate}
     enableInlineEdit={config.enableInlineEdit}   // NEW
     onUpdateItem={props.onUpdateItem}            // NEW
   />
   ```

5. **Verify onUpdateItem prop exists on ItemManagerProps**
   - Check that the main props interface includes `onUpdateItem`
   - This should already exist per the implementation plan

#### Verification Checklist

- [ ] Default config includes `enableInlineEdit: true`
- [ ] Config is properly merged with defaults
- [ ] `enableInlineEdit` is passed to ItemGrid
- [ ] `enableInlineEdit` is passed to ItemList
- [ ] `onUpdateItem` is passed to ItemGrid
- [ ] `onUpdateItem` is passed to ItemList
- [ ] TypeScript compilation passes
- [ ] Component renders without errors

#### Acceptance Criteria

- Configuration `enableInlineEdit` flag controls inline edit behavior
- `onUpdateItem` callback is correctly propagated through the component tree
- Default behavior enables inline editing
- Setting `config.enableInlineEdit: false` disables inline editing

---

### Task 7: Selection Mode Conflict Handling

**Estimated Effort:** 0.5 story points (30 minutes)
**Dependencies:** Tasks 2 and 3 must be complete
**Files:** `src/components/ItemManager/components/ItemCard.tsx`, `src/components/ItemManager/components/ItemRow.tsx`

#### Objective

Ensure that inline editing is properly disabled when selection mode is active to prevent accidental edits during bulk operations.

#### Implementation Steps

1. **Verify ItemCard selection mode handling**
   - Open `ItemCard.tsx`
   - Confirm the `effectiveEnableInlineEdit` calculation exists:
   ```typescript
   const effectiveEnableInlineEdit = enableInlineEdit && !isSelectionMode && !!onUpdateItem;
   ```
   - Verify this variable is used in conditional rendering

2. **Verify ItemRow selection mode handling**
   - Open `ItemRow.tsx`
   - Confirm the same calculation exists:
   ```typescript
   const effectiveEnableInlineEdit = enableInlineEdit && !isSelectionMode && !!onUpdateItem;
   ```
   - Verify this variable is used in conditional rendering

3. **Add visual indicator for disabled state (optional enhancement)**
   - When in selection mode, fields should not show edit hover effects
   - The static display should render without the clickable appearance

4. **Test transition scenarios**
   - Enter selection mode while editing → Edit should save/cancel
   - InlineEdit component should handle this via blur event
   - Verify no orphaned edit states remain

#### Verification Checklist

- [ ] ItemCard disables inline edit when `isSelectionMode` is true
- [ ] ItemRow disables inline edit when `isSelectionMode` is true
- [ ] Static text displays when in selection mode
- [ ] No hover effects on text when in selection mode
- [ ] Entering selection mode doesn't break active edits

#### Acceptance Criteria

- Clicking on title/location in selection mode triggers selection, not edit
- Visual appearance clearly indicates non-editable state in selection mode
- Transition between selection mode and normal mode is smooth

---

### Task 8: Integration Testing and Verification

**Estimated Effort:** 1 story point (2 hours)
**Dependencies:** All previous tasks (1-7) must be complete
**Files:** Test harness page (e.g., `src/app/test/item-manager/page.tsx`)

#### Objective

Perform comprehensive integration testing of the inline edit functionality across both ItemCard and ItemRow components.

#### Implementation Steps

1. **Set up test environment**
   - Navigate to the test harness page
   - Ensure mock data includes items with and without locations

2. **Test ItemCard inline edit (Grid View)**

   a. **Title editing**
   - [ ] Click on item title → Edit mode activates
   - [ ] Type new title → Characters appear in input
   - [ ] Press Enter → Title saves, display mode resumes
   - [ ] Verify `onUpdateItem` was called with correct data

   b. **Title validation**
   - [ ] Clear title completely → Validation error appears
   - [ ] Title with only spaces → Validation error (after trim)
   - [ ] Very long title → Truncates at maxLength

   c. **Title cancellation**
   - [ ] Click title, modify, press Escape → Original value restored
   - [ ] Click title, click outside → Change saves (blur behavior)

   d. **Location editing**
   - [ ] Click on location → Edit mode activates
   - [ ] Add/change location → Saves correctly
   - [ ] Clear location → Saves as undefined (allowed)

   e. **Location placeholder**
   - [ ] Item with no location shows "Add location..." placeholder
   - [ ] Placeholder disappears when typing

3. **Test ItemRow inline edit (List View)**

   a. **Title editing**
   - [ ] Click on item title in list row → Edit mode activates
   - [ ] Type new title → Characters appear in input
   - [ ] Press Enter → Title saves, display mode resumes

   b. **Location editing in column**
   - [ ] Click on location column → Edit mode activates
   - [ ] Change location → Saves correctly
   - [ ] Clear location → Shows "-" in static display

4. **Test selection mode interaction**
   - [ ] Enter selection mode
   - [ ] Click on title → Selection toggles, no edit mode
   - [ ] Click on location → Selection toggles, no edit mode
   - [ ] Exit selection mode → Inline edit works again

5. **Test keyboard navigation**
   - [ ] Tab to title field → Focus indicator visible
   - [ ] Enter on focused field → Edit mode activates
   - [ ] Tab during edit → Saves and moves to next focusable
   - [ ] Escape during edit → Cancels edit

6. **Test error handling**
   - [ ] Simulate save failure (throw in onUpdateItem)
   - [ ] Error message displays
   - [ ] Can retry or cancel after error

7. **Test loading state**
   - [ ] Add delay to onUpdateItem
   - [ ] Spinner appears during save
   - [ ] Input is disabled during save

8. **Test mobile responsiveness**
   - [ ] Touch on title/location → Edit mode activates
   - [ ] Touch targets are adequate (48px minimum)
   - [ ] Keyboard appears on mobile for input

9. **Console verification**
   - [ ] All `onUpdateItem` calls logged correctly
   - [ ] No console errors during testing
   - [ ] No React warnings

#### Verification Checklist

- [ ] Grid view (ItemCard) inline edit works for title
- [ ] Grid view (ItemCard) inline edit works for location
- [ ] List view (ItemRow) inline edit works for title
- [ ] List view (ItemRow) inline edit works for location
- [ ] Selection mode correctly disables inline edit
- [ ] Keyboard navigation works fully
- [ ] Error states display correctly
- [ ] Loading states display correctly
- [ ] Mobile touch interactions work
- [ ] No console errors

#### Acceptance Criteria

- All inline edit functionality works as specified in the overview
- Selection mode and inline edit do not conflict
- All keyboard shortcuts work (Enter, Escape, Tab)
- Error and loading states provide appropriate feedback
- Mobile users can edit inline

---

## Testing Matrix

| Test Case | ItemCard | ItemRow | Expected Result |
|-----------|----------|---------|-----------------|
| Click title to edit | Yes | Yes | Edit mode activates |
| Enter key saves | Yes | Yes | Value saved, display mode |
| Escape key cancels | Yes | Yes | Original value restored |
| Blur saves | Yes | Yes | Value saved |
| Empty title rejected | Yes | Yes | Validation error shown |
| Empty location allowed | Yes | Yes | Saves as undefined |
| Selection mode blocks edit | Yes | Yes | Click triggers selection |
| Save error displays | Yes | Yes | Error message shown |
| Loading spinner shows | Yes | Yes | Spinner during async save |

---

## Edge Cases to Consider

1. **Rapid double-click**: Should not enter edit mode twice
2. **Very long titles**: Should truncate display, full text in edit
3. **Special characters**: Unicode, emojis should work correctly
4. **Concurrent edits**: Different items can be edited at same time
5. **Tab between fields**: Should save current, focus next
6. **Component unmount during save**: Should not cause errors

---

## Rollback Plan

If issues are discovered after implementation:

1. **Quick disable**: Set `enableInlineEdit: false` in config
2. **Component revert**: Restore static display in ItemCard/ItemRow
3. **Type revert**: Remove optional props (non-breaking)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| TypeScript errors | 0 |
| Console errors during testing | 0 |
| All acceptance criteria met | 100% |
| Mobile usability verified | Yes |
| Keyboard accessibility verified | Yes |

---

## References

- [Overview Document](/docs/REQ-087-integrate-titlelocation-inline-edit-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 6
- [REQ-086 InlineEdit Component](/docs/REQ-086-create-inlineedit-component-overview.md)
- [Request #087](/docs/gen_requests.md) - Original feature request
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - ItemRecord definition

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Senior Dev Agent | Initial detailed task breakdown |
