# REQ-072: Implement BulkTagDialog - Detailed Task Breakdown

**Document Created:** 2026-01-03T20:15:00
**Last Modified:** 2026-01-03T16:50:00
**Implementation Status:** COMPLETE
**Request Reference:** REQ-072 (Bulk Tag Management Dialog)
**Overview Document:** `/docs/REQ-072-implement-bulktagdialog-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.5

---

## Table of Contents

1. [Summary](#1-summary)
2. [Prerequisites](#2-prerequisites)
3. [Authorized Files and Functions](#3-authorized-files-and-functions)
4. [Task Breakdown](#4-task-breakdown)
5. [Testing Tasks](#5-testing-tasks)
6. [Verification Checklist](#6-verification-checklist)
7. [Rollback Plan](#7-rollback-plan)

---

## 1. Summary

This document provides granular, actionable implementation tasks for the `BulkTagDialog` component. Each task is designed to be completable within a few hours of focused work (≤1 story point).

The `BulkTagDialog` enables users to add or remove tags from multiple selected items simultaneously through a modal dialog interface with tag autocomplete and item preview.

---

## 2. Prerequisites

Before starting implementation, ensure the following are complete:

| Prerequisite | File/Component | Status Check |
|--------------|----------------|--------------|
| ItemManager types defined | `src/components/ItemManager/ItemManager.types.ts` | File exists with `ItemRecord` type |
| useItemSelection hook | `src/components/ItemManager/hooks/useItemSelection.ts` | Hook exports `selectedIds`, `getSelectedItems` |
| BulkActionsBar component | `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Component exists with `onAddTag` and `onRemoveTag` props |
| ItemRecord type accessible | `src/components/ItemCapture/ItemCapture.types.ts` | `ItemRecord` type with `tags?: string[]` |

---

## 3. Authorized Files and Functions

### 3.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Main bulk tag dialog component |

### 3.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/BulkActions/index.ts` | Add export for BulkTagDialog |
| `src/components/ItemManager/ItemManager.tsx` | Add tag dialog state, handlers, and render logic |
| `src/components/ItemManager/ItemManager.types.ts` | Add BulkTagDialogProps interface (if not present) |

### 3.3 Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `BulkTagDialog` | `BulkTagDialog.tsx` | Main component function |
| `TagInput` (internal) | `BulkTagDialog.tsx` | Pill-based tag input for add mode |
| `TagCheckboxList` (internal) | `BulkTagDialog.tsx` | Checkbox list for remove mode |
| `ItemPreviewList` (internal) | `BulkTagDialog.tsx` | Shows affected items preview |
| `handleBulkTagConfirm` | `ItemManager.tsx` | Process tag additions/removals |
| `collectExistingTags` | `ItemManager.tsx` | Gather all unique tags from items |

---

## 4. Task Breakdown

### Task 3.5.1: Create BulkTagDialog File Structure and Types

**Objective:** Set up the component file with imports, type definitions, and skeleton structure.

**File:** `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

**Steps:**

1. Create the file at the specified path
2. Add the `'use client'` directive at the top
3. Add file header comment with module reference and last modified date
4. Import required dependencies:
   - `React`, `useState`, `useMemo`, `useCallback`, `useRef`, `useEffect`, `useId` from 'react'
   - `X`, `Tag`, `Minus`, `Loader2`, `Check` from 'lucide-react'
   - `cn` from '@/lib/utils'
   - `ItemRecord` type from '@/components/ItemCapture/ItemCapture.types'
5. Define the `BulkTagDialogProps` interface:
   ```typescript
   export interface BulkTagDialogProps {
     mode: 'add' | 'remove';
     selectedItems: ItemRecord[];
     existingTags: string[];
     onConfirm: (tags: string[]) => void;
     onCancel: () => void;
     loading?: boolean;
     className?: string;
   }
   ```
6. Define constants:
   - `MAX_PREVIEW_ITEMS = 5`
   - `MAX_TAG_LENGTH = 30`
   - `MAX_TAGS_TO_ADD = 10`
   - `MAX_SUGGESTIONS = 8`
7. Create empty `BulkTagDialog` function component that returns `null`
8. Export the component as both named and default export

**Verification:**
- [x] File compiles without TypeScript errors
- [x] Imports resolve correctly
- [x] `BulkTagDialogProps` interface is exported

**Implementation Notes (2026-01-03):** Created `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` with all required imports, constants (MAX_PREVIEW_ITEMS=5, MAX_TAG_LENGTH=30, MAX_TAGS_TO_ADD=10, MAX_SUGGESTIONS=8), and exported BulkTagDialogProps interface.

**Estimated Effort:** 30 minutes

---

### Task 3.5.2: Implement Modal Container and Header

**Objective:** Build the modal backdrop, container, and header with close button.

**File:** `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

**Steps:**

1. Inside `BulkTagDialog`, generate unique IDs using `useId()`:
   ```typescript
   const uniqueId = useId();
   const titleId = `bulk-tag-title-${uniqueId}`;
   ```

2. Add `useEffect` to prevent body scroll when dialog is open:
   ```typescript
   useEffect(() => {
     document.body.style.overflow = 'hidden';
     return () => { document.body.style.overflow = ''; };
   }, []);
   ```

3. Add `useEffect` for Escape key handling:
   ```typescript
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'Escape') onCancel();
     };
     document.addEventListener('keydown', handleKeyDown);
     return () => document.removeEventListener('keydown', handleKeyDown);
   }, [onCancel]);
   ```

4. Render the modal backdrop:
   ```typescript
   <div
     className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
     onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
   >
   ```

5. Render the modal container with ARIA attributes:
   ```typescript
   <div
     role="dialog"
     aria-modal="true"
     aria-labelledby={titleId}
     className={cn(
       'bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden',
       'flex flex-col',
       className
     )}
   >
   ```

6. Render the header with mode-specific icon and title:
   - Blue `Tag` icon for add mode, orange `Minus` icon for remove mode
   - Title: "Add Tags" or "Remove Tags" followed by " from {count} Item(s)"
   - Close button with `X` icon that calls `onCancel`

**Verification:**
- [x] Modal appears centered with dark backdrop
- [x] Clicking backdrop closes modal
- [x] Clicking X button closes modal
- [x] Pressing Escape closes modal
- [x] Body scroll is disabled when modal is open
- [x] Header shows correct icon and title based on mode

**Implementation Notes (2026-01-03):** Modal container implemented with useId() for accessibility, useEffect for body scroll lock and Escape key handling, backdrop click detection, ARIA attributes (role="dialog", aria-modal="true", aria-labelledby). Blue Tag icon for add mode, orange Minus icon for remove mode.

**Estimated Effort:** 45 minutes

---

### Task 3.5.3: Implement Add Mode Tag Input with Pills

**Objective:** Create the tag input field with pill-based display for add mode.

**File:** `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

**Steps:**

1. Add state for add mode:
   ```typescript
   const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
   const [tagInputValue, setTagInputValue] = useState('');
   const tagInputRef = useRef<HTMLInputElement>(null);
   ```

2. Create `handleAddTag` callback:
   - Trim the input
   - Check for case-insensitive duplicates in `tagsToAdd`
   - Check `MAX_TAGS_TO_ADD` limit
   - Check `MAX_TAG_LENGTH` limit
   - Add tag to `tagsToAdd` array
   - Clear input and refocus

3. Create `handleRemoveTagFromList` callback:
   - Filter out the specified tag from `tagsToAdd`

4. Create `handleTagInputKeyDown` callback:
   - On Enter: if input has value, call `handleAddTag`
   - On Backspace: if input empty and tags exist, remove last tag

5. Add `useEffect` to focus input on mount for add mode:
   ```typescript
   useEffect(() => {
     if (mode === 'add' && tagInputRef.current) {
       tagInputRef.current.focus();
     }
   }, [mode]);
   ```

6. Render the tag input UI for add mode:
   - Container `div` with border, flex-wrap, and focus ring
   - Map over `tagsToAdd` to render pills with X button
   - Input field with placeholder and disabled state
   - Each pill has: tag text, X button with `handleRemoveTagFromList`

**Verification:**
- [x] Input field is focused when dialog opens in add mode
- [x] Typing and pressing Enter adds a tag pill
- [x] Tag pills display correctly with X button
- [x] Clicking X removes the tag from the list
- [x] Backspace removes last tag when input is empty
- [x] Duplicate tags are prevented (case-insensitive)
- [x] Cannot add more than MAX_TAGS_TO_ADD tags
- [x] Cannot add tags longer than MAX_TAG_LENGTH

**Implementation Notes (2026-01-03):** Tag input implemented with handleAddTag, handleRemoveTagFromList, handleTagInputKeyDown callbacks. Pills styled with blue background, X button for removal. Input auto-focuses on mount via useEffect.

**Estimated Effort:** 1 hour

---

### Task 3.5.4: Implement Tag Suggestions for Add Mode

**Objective:** Display filtered tag suggestions from existing tags.

**File:** `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

**Steps:**

1. Create `filteredSuggestions` memoized value:
   ```typescript
   const filteredSuggestions = useMemo(() => {
     const lowerInput = tagInputValue.toLowerCase();
     return existingTags
       .filter(tag => {
         const lowerTag = tag.toLowerCase();
         return !tagsToAdd.some(t => t.toLowerCase() === lowerTag) &&
                lowerTag.includes(lowerInput);
       })
       .slice(0, MAX_SUGGESTIONS);
   }, [existingTags, tagsToAdd, tagInputValue]);
   ```

2. Render suggestions section (only when suggestions exist and under limit):
   - Container with "Suggested tags:" label
   - Flex-wrap container for suggestion buttons
   - Each button shows "+ {tag}" and calls `handleAddTag(tag)` on click
   - Styling: rounded-full, border, hover effect

**Verification:**
- [x] Suggestions appear below input field
- [x] Suggestions filter as user types
- [x] Clicking a suggestion adds it to the tag list
- [x] Added tags are excluded from suggestions
- [x] Maximum of 8 suggestions shown
- [x] Suggestions section hidden when tagsToAdd reaches MAX_TAGS_TO_ADD

**Implementation Notes (2026-01-03):** filteredSuggestions useMemo filters existingTags against already-added tags and input value. Rendered as clickable buttons with "+ {tag}" format.

**Estimated Effort:** 30 minutes

---

### Task 3.5.5: Implement Remove Mode Checkbox List

**Objective:** Create the checkbox-based tag selection for remove mode.

**File:** `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

**Steps:**

1. Add state for remove mode:
   ```typescript
   const [tagsToRemove, setTagsToRemove] = useState<Set<string>>(new Set());
   ```

2. Create `allTagsOnSelectedItems` memoized value:
   ```typescript
   const allTagsOnSelectedItems = useMemo(() => {
     const tagMap = new Map<string, number>();
     selectedItems.forEach(item => {
       (item.tags || []).forEach(tag => {
         tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
       });
     });
     return Array.from(tagMap.entries())
       .map(([tag, count]) => ({ tag, count }))
       .sort((a, b) => a.tag.localeCompare(b.tag));
   }, [selectedItems]);
   ```

3. Create `handleToggleTagForRemoval` callback:
   ```typescript
   const handleToggleTagForRemoval = useCallback((tag: string) => {
     setTagsToRemove(prev => {
       const next = new Set(prev);
       if (next.has(tag)) next.delete(tag);
       else next.add(tag);
       return next;
     });
   }, []);
   ```

4. Render remove mode UI:
   - If no tags on selected items: show "No tags found on selected items." message
   - Otherwise render "Select tags to remove:" label
   - Flex-wrap container for tag checkboxes
   - Each checkbox label shows:
     - Custom checkbox with Check icon when selected
     - Tag name
     - Count in parentheses
   - Styling: red tones when selected, gray when not

**Verification:**
- [x] All tags from selected items are displayed
- [x] Each tag shows the count of items that have it
- [x] Clicking a tag toggles its selection
- [x] Selected tags have red styling
- [x] Empty state message shows when no tags exist

**Implementation Notes (2026-01-03):** allTagsOnSelectedItems useMemo builds Map<string, count> and converts to sorted array. handleToggleTagForRemoval toggles Set membership. Custom checkbox indicator with Check icon when selected, red styling for selected tags.

**Estimated Effort:** 45 minutes

---

### Task 3.5.6: Implement Items Preview List

**Objective:** Create the internal component that shows affected items.

**File:** `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

**Steps:**

1. Create `ItemPreviewListProps` interface:
   ```typescript
   interface ItemPreviewListProps {
     items: ItemRecord[];
     maxDisplay?: number;
   }
   ```

2. Create `ItemPreviewList` internal function component:
   - Slice items to `maxDisplay` (default: `MAX_PREVIEW_ITEMS`)
   - Calculate `remainingCount`
   - Render container with "Items to be updated:" label
   - Render `<ul>` with scrollable overflow (`max-h-32 overflow-y-auto`)
   - Each item shows bullet point and truncated title
   - If `remainingCount > 0`, show "(and X more...)" in italic

3. Place `ItemPreviewList` in the dialog body after the tag input/checkbox section:
   ```typescript
   <ItemPreviewList items={selectedItems} />
   ```

**Verification:**
- [x] Preview shows up to 5 item titles
- [x] Items beyond 5 show "(and X more...)" message
- [x] Item titles are truncated if too long
- [x] Preview list scrolls if needed

**Implementation Notes (2026-01-03):** ItemPreviewList internal component with ItemPreviewListProps interface. Displays up to maxDisplay items, shows remainingCount with italic message. Uses max-h-32 overflow-y-auto for scrolling.

**Estimated Effort:** 30 minutes

---

### Task 3.5.7: Implement Footer with Action Buttons

**Objective:** Add Cancel and Confirm buttons with loading and disabled states.

**File:** `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

**Steps:**

1. Create `handleConfirmClick` callback:
   ```typescript
   const handleConfirmClick = useCallback(() => {
     const tags = mode === 'add' ? tagsToAdd : Array.from(tagsToRemove);
     onConfirm(tags);
   }, [mode, tagsToAdd, tagsToRemove, onConfirm]);
   ```

2. Create `confirmDisabled` computed value:
   ```typescript
   const confirmDisabled = mode === 'add'
     ? tagsToAdd.length === 0
     : tagsToRemove.size === 0;
   ```

3. Render footer section:
   - Container with border-top, bg-gray-50, flex justify-end, gap
   - Cancel button:
     - Text "Cancel", disabled when `loading`
     - Gray/white styling
   - Confirm button:
     - Show `Loader2` spinner when `loading`
     - Dynamic text: "Add X Tag(s)" or "Remove X Tag(s)"
     - Blue for add mode, red for remove mode
     - Disabled when `loading` or `confirmDisabled`

**Verification:**
- [x] Cancel button closes dialog
- [x] Cancel button disabled during loading
- [x] Confirm button shows correct tag count
- [x] Confirm button disabled when no tags selected
- [x] Confirm button shows spinner during loading
- [x] Button colors are mode-appropriate (blue/red)

**Implementation Notes (2026-01-03):** handleConfirmClick callback passes tags array to onConfirm. confirmDisabled computed based on mode. Loader2 spinner shown when loading. Blue bg for add mode, red bg for remove mode.

**Estimated Effort:** 30 minutes

---

### Task 3.5.8: Update BulkActions Index Export

**Objective:** Add BulkTagDialog to the barrel export file.

**File:** `src/components/ItemManager/components/BulkActions/index.ts`

**Steps:**

1. Open or create the index.ts file
2. Add export statement for BulkTagDialog:
   ```typescript
   export { BulkTagDialog } from './BulkTagDialog';
   export type { BulkTagDialogProps } from './BulkTagDialog';
   ```
3. Ensure file header has updated last modified date

**Verification:**
- [x] BulkTagDialog can be imported from '@/components/ItemManager/components/BulkActions'
- [x] BulkTagDialogProps type is also exported
- [x] No TypeScript errors in the barrel export

**Implementation Notes (2026-01-03):** Created `src/components/ItemManager/components/BulkActions/index.ts` with named and type exports for BulkTagDialog and BulkTagDialogProps.

**Estimated Effort:** 10 minutes

---

### Task 3.5.9: Add BulkTagDialogProps to ItemManager Types (if needed)

**Objective:** Ensure the BulkTagDialogProps interface is available in the types file.

**File:** `src/components/ItemManager/ItemManager.types.ts`

**Steps:**

1. Check if `BulkTagDialogProps` already exists in the types file
2. If not present, add the interface:
   ```typescript
   /**
    * Props for the BulkTagDialog component.
    */
   export interface BulkTagDialogProps {
     /** Dialog mode - determines add or remove operation */
     mode: 'add' | 'remove';
     /** Array of selected items to apply tag operation to */
     selectedItems: ItemRecord[];
     /** All existing tags in the system for autocomplete suggestions */
     existingTags: string[];
     /** Callback when tags are confirmed */
     onConfirm: (tags: string[]) => void;
     /** Callback when dialog is cancelled/closed */
     onCancel: () => void;
     /** Loading state during operation */
     loading?: boolean;
     /** Optional additional CSS classes */
     className?: string;
   }
   ```
3. Update the last modified comment in the file header

**Verification:**
- [x] BulkTagDialogProps is defined and exportable
- [x] No duplicate type definitions
- [x] TypeScript compiles without errors

**Implementation Notes (2026-01-03):** Added BulkTagDialogProps interface to ItemManager.types.ts under new "BulkActions Types (REQ-072)" section with full JSDoc documentation.

**Estimated Effort:** 15 minutes

---

### Task 3.5.10: Integrate BulkTagDialog into ItemManager

**Objective:** Wire up the dialog to ItemManager state and callbacks.

**File:** `src/components/ItemManager/ItemManager.tsx`

**Steps:**

1. Import BulkTagDialog:
   ```typescript
   import { BulkActionsBar, BulkTagDialog } from './components/BulkActions';
   ```

2. Add state for tag dialog:
   ```typescript
   const [tagDialogMode, setTagDialogMode] = useState<'add' | 'remove' | null>(null);
   const [bulkLoading, setBulkLoading] = useState(false);
   ```

3. Create `existingTags` memoized value:
   ```typescript
   const existingTags = useMemo(() => {
     const tagSet = new Set<string>();
     items.forEach(item => {
       (item.tags || []).forEach(tag => tagSet.add(tag));
     });
     return Array.from(tagSet).sort();
   }, [items]);
   ```

4. Create handlers for opening dialogs:
   ```typescript
   const handleBulkAddTag = useCallback(() => {
     setTagDialogMode('add');
   }, []);

   const handleBulkRemoveTag = useCallback(() => {
     setTagDialogMode('remove');
   }, []);
   ```

5. Create `handleTagConfirm` callback:
   ```typescript
   const handleTagConfirm = useCallback(async (tags: string[]) => {
     if (tags.length === 0) return;

     const selectedItemsList = getSelectedItems(items);
     setBulkLoading(true);

     try {
       for (const item of selectedItemsList) {
         let updatedTags: string[];

         if (tagDialogMode === 'add') {
           const currentTags = item.tags || [];
           const newTags = tags.filter(t => !currentTags.includes(t));
           updatedTags = [...currentTags, ...newTags];
         } else {
           updatedTags = (item.tags || []).filter(t => !tags.includes(t));
         }

         await onUpdateItem({ ...item, tags: updatedTags });
       }

       setTagDialogMode(null);
       clearSelection();
     } finally {
       setBulkLoading(false);
     }
   }, [tagDialogMode, getSelectedItems, items, onUpdateItem, clearSelection]);
   ```

6. Wire up BulkActionsBar callbacks:
   ```typescript
   <BulkActionsBar
     // ... existing props
     onAddTag={handleBulkAddTag}
     onRemoveTag={handleBulkRemoveTag}
     loading={bulkLoading}
   />
   ```

7. Render BulkTagDialog conditionally:
   ```typescript
   {tagDialogMode && (
     <BulkTagDialog
       mode={tagDialogMode}
       selectedItems={getSelectedItems(items)}
       existingTags={existingTags}
       onConfirm={handleTagConfirm}
       onCancel={() => setTagDialogMode(null)}
       loading={bulkLoading}
     />
   )}
   ```

**Verification:**
- [x] Clicking "Add Tag" in BulkActionsBar opens dialog in add mode
- [x] Clicking "Remove Tag" in BulkActionsBar opens dialog in remove mode
- [x] Confirming tags calls onUpdateItem for each selected item
- [x] Dialog closes after successful operation
- [x] Selection is cleared after successful operation
- [x] Loading state is shown during operation

**Implementation Notes (2026-01-03):**
- Added useState for tagDialogMode and bulkLoading
- Added existingTags useMemo to collect all unique tags from items
- Added getSelectedItems callback to get selected item objects
- Created handleBulkAddTag, handleBulkRemoveTag, handleTagConfirm, handleTagCancel callbacks
- Updated Bulk Actions Bar with "Add Tag" (blue) and "Remove Tag" (orange) buttons with icons
- Rendered BulkTagDialog conditionally when tagDialogMode is set
- handleTagConfirm iterates through selected items and calls onUpdateItem with updated tags
- Build verified successful with no TypeScript errors

**Estimated Effort:** 1.5 hours

---

## 5. Testing Tasks

### Task 3.5.T1: Unit Tests for BulkTagDialog Component

**Objective:** Create comprehensive unit tests for the component.

**File:** `src/components/ItemManager/components/BulkActions/__tests__/BulkTagDialog.test.tsx`

**Test Cases:**

1. **Rendering Tests:**
   - Renders in add mode with correct UI elements
   - Renders in remove mode with checkbox list
   - Shows correct item count in header
   - Shows item preview list

2. **Add Mode Tests:**
   - Adds tag on Enter key press
   - Adds tag from suggestion click
   - Removes tag when X clicked on pill
   - Prevents duplicate tags (case-insensitive)
   - Respects MAX_TAGS_TO_ADD limit
   - Filters suggestions based on input
   - Removes last tag on Backspace when input empty

3. **Remove Mode Tests:**
   - Displays all tags from selected items
   - Shows tag counts correctly
   - Toggles tag selection on click
   - Disables confirm when no tags selected

4. **Interaction Tests:**
   - Calls onCancel when Cancel button clicked
   - Calls onCancel when X button clicked
   - Calls onCancel on Escape key
   - Calls onConfirm with correct tags array
   - Shows loading spinner when loading=true

5. **Accessibility Tests:**
   - Dialog has correct role and aria-modal
   - Has aria-labelledby pointing to title
   - Keyboard navigation works

**Verification:**
- [ ] All test cases pass
- [ ] Test coverage > 80% for the component

**Estimated Effort:** 1.5 hours

---

### Task 3.5.T2: Integration Tests for Bulk Tag Flow

**Objective:** Test the complete flow from BulkActionsBar through to item updates.

**File:** `src/components/ItemManager/__tests__/ItemManager.bulkTag.test.tsx`

**Test Cases:**

1. **End-to-End Add Tag Flow:**
   - Select multiple items
   - Click "Add Tag" button
   - Enter new tag
   - Confirm operation
   - Verify items updated with new tag
   - Verify selection cleared

2. **End-to-End Remove Tag Flow:**
   - Select items with existing tags
   - Click "Remove Tag" button
   - Select tags to remove
   - Confirm operation
   - Verify tags removed from items

3. **Cancellation Flow:**
   - Open dialog, add tags, cancel
   - Verify no items were updated

4. **Loading State:**
   - Verify buttons disabled during operation
   - Verify spinner shown

**Verification:**
- [ ] All integration tests pass
- [ ] Flows work correctly with mock data

**Estimated Effort:** 1 hour

---

### Task 3.5.T3: Accessibility Testing

**Objective:** Verify component meets WCAG AA accessibility standards.

**File:** Manual testing + automated checks

**Test Cases:**

1. **Keyboard Navigation:**
   - Tab moves focus between interactive elements
   - Escape closes dialog
   - Enter adds tag (add mode) or confirms (on button)
   - Space toggles checkbox (remove mode)

2. **Screen Reader:**
   - Dialog announced as dialog
   - Title read correctly
   - Button actions announced
   - Tag additions/removals announced

3. **Focus Management:**
   - Focus moves to input on dialog open (add mode)
   - Focus trapped within dialog
   - Focus returns to trigger on close

**Verification:**
- [ ] All keyboard navigation works
- [ ] Screen reader announces elements correctly
- [ ] Focus management is correct

**Estimated Effort:** 30 minutes

---

## 6. Verification Checklist

### Acceptance Criteria Mapping

| Criteria (from REQ-072) | Task(s) | Verification |
|-------------------------|---------|--------------|
| Dialog can be opened when items selected | 3.5.10 | Click "Add Tag" or "Remove Tag" in BulkActionsBar |
| User can toggle between add/remove modes | 3.5.10 | Separate buttons trigger different modes |
| Tag input displays suggestions | 3.5.4 | Suggestions filter as user types |
| Dialog shows preview of affected items | 3.5.6 | ItemPreviewList shows selected items |
| User can confirm and items are updated | 3.5.7, 3.5.10 | onConfirm calls onUpdateItem for each item |

### Final Verification Steps

1. **Functional Verification:**
   - [ ] Add mode works: type tag, press Enter, confirm
   - [ ] Remove mode works: select tags, confirm
   - [ ] Suggestions filter correctly
   - [ ] Item preview shows correctly
   - [ ] Selection cleared after operation

2. **Visual Verification:**
   - [ ] Modal centered and styled correctly
   - [ ] Tag pills display with correct colors
   - [ ] Checkboxes style correctly on selection
   - [ ] Loading spinner appears during operation

3. **Edge Cases:**
   - [ ] Empty tag input prevented
   - [ ] Duplicate tags prevented
   - [ ] Long tag names truncated properly
   - [ ] Many selected items handled (10+)
   - [ ] No tags on selected items shows message

4. **Cross-Browser:**
   - [ ] Chrome desktop
   - [ ] Firefox desktop
   - [ ] Safari desktop
   - [ ] iOS Safari
   - [ ] Chrome Android

---

## 7. Rollback Plan

If issues are discovered after implementation:

1. **Immediate Rollback:**
   - Remove the BulkTagDialog render from ItemManager.tsx
   - Remove the state and handlers from ItemManager.tsx
   - BulkActionsBar will show buttons but they won't open dialog

2. **File-Level Rollback:**
   - Delete `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
   - Remove export from `src/components/ItemManager/components/BulkActions/index.ts`

3. **Git Rollback:**
   ```bash
   git revert <commit-hash>
   ```

---

## Appendix A: Complete Implementation Reference

See `/docs/REQ-072-implement-bulktagdialog-overview.md` Appendix A for complete component code reference.

---

## Appendix B: Dependencies Summary

```
BulkTagDialog.tsx
├── react (useState, useMemo, useCallback, useRef, useEffect, useId)
├── lucide-react (X, Tag, Minus, Loader2, Check)
├── @/lib/utils (cn)
└── @/components/ItemCapture/ItemCapture.types (ItemRecord)

ItemManager.tsx (additions)
├── ./components/BulkActions (BulkTagDialog)
└── existing hooks/state
```

---

## Appendix C: Task Dependency Graph

```
3.5.1 (File Structure & Types)
   │
   ├──► 3.5.2 (Modal Container & Header)
   │       │
   │       ├──► 3.5.3 (Add Mode Tag Input)
   │       │       │
   │       │       └──► 3.5.4 (Tag Suggestions)
   │       │
   │       ├──► 3.5.5 (Remove Mode Checkboxes)
   │       │
   │       └──► 3.5.6 (Items Preview)
   │               │
   │               └──► 3.5.7 (Footer Buttons)
   │
   ├──► 3.5.8 (Index Export) [can run parallel after 3.5.1]
   │
   └──► 3.5.9 (Types File) [can run parallel after 3.5.1]
           │
           └──► 3.5.10 (ItemManager Integration)
                   │
                   ├──► 3.5.T1 (Unit Tests)
                   ├──► 3.5.T2 (Integration Tests)
                   └──► 3.5.T3 (Accessibility Tests)
```

---

**Document End**
