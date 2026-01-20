# Detailed Task Breakdown: REQ-E02-079 - Update ItemManager Component Family for Internationalization

**Generated:** 2026-01-20 18:00 UTC
**Last Modified:** 2026-01-20 18:00 UTC
**Request Reference:** REQ-E02-079 (docs/gen_requests_epic2.md)
**Overview Document:** docs/REQ-E02-079-update-itemmanager-component-family-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task ID:** 2D.2
**Size:** M (Medium)
**Target Story Points per Task:** 1 SP (each task completable in ~1-2 hours)

---

## Executive Summary

This document breaks down the ItemManager component family internationalization into granular, actionable tasks. Each task is sized at approximately 1 story point, suitable for execution by an AI coding agent or junior developer. The implementation follows the established pattern from Epic 1: import translation hooks, replace hardcoded strings, and add translation keys to `/messages/*.json` files.

---

## Prerequisites

Before starting any task:
- [ ] Verify `next-intl` is installed and configured (Epic 1 dependency)
- [ ] Verify `/messages/en.json` exists with base structure
- [ ] Verify `useTranslations` hook is available from `next-intl`
- [ ] Confirm the `items` namespace exists or will be created in Task 1.1

---

## Phase 1: Translation Infrastructure Setup

### Task 1.1: Create Items Namespace Structure in English Translation File
**File:** `/messages/en.json`
**Type:** EXTEND
**Estimated Effort:** 1 SP

**Description:**
Add the complete `items` namespace structure to the English translation file with all ItemManager-related translation keys.

**Steps:**
1. Open `/messages/en.json`
2. Add the `items` namespace object with the following structure:
   ```json
   {
     "items": {
       "manager": {
         "title": "Items",
         "ariaLabel": "Item manager"
       },
       "search": {
         "placeholder": "Search items...",
         "clear": "Clear search",
         "ariaLabel": "Search items"
       },
       "filters": {
         "title": "Filters",
         "clearAll": "Clear All",
         "clearFilters": "Clear all filters",
         "contentType": "Content Type",
         "tags": "Tags",
         "location": "Location",
         "property": "Property",
         "applyFilters": "Apply Filters",
         "close": "Close",
         "room": "Room",
         "roomWithCount": "Room ({count})"
       },
       "sort": {
         "label": "Sort",
         "sortBy": "Sort by",
         "options": {
           "titleAsc": "Title (A-Z)",
           "titleDesc": "Title (Z-A)",
           "newestFirst": "Newest First",
           "oldestFirst": "Oldest First",
           "recentlyModified": "Recently Modified",
           "leastRecentlyModified": "Least Recently Modified",
           "locationAsc": "Location (A-Z)",
           "mostGuides": "Most Guides",
           "fewestGuides": "Fewest Guides"
         }
       },
       "empty": {
         "title": "No items yet",
         "description": "Create your first item to get started",
         "noResults": "No matching items",
         "noResultsDescription": "Try adjusting your search or filters"
       },
       "loading": {
         "text": "Loading items, please wait...",
         "label": "Loading items"
       },
       "selection": {
         "selected": "{count} selected",
         "currentlySelected": "Currently {count, plural, one {# item} other {# items}} selected",
         "selectAll": "Select all ({count})",
         "clearSelection": "Clear selection",
         "selectionCleared": "Selection cleared"
       },
       "bulkActions": {
         "ariaLabel": "Bulk actions for {count, plural, one {# selected item} other {# selected items}}",
         "delete": "Delete",
         "addTag": "Add Tag",
         "removeTag": "Remove Tag",
         "moveToProperty": "Move to Property",
         "cancel": "Cancel",
         "cancelSelection": "Cancel selection",
         "processing": "Processing..."
       },
       "delete": {
         "titleSingle": "Delete Item",
         "titlePlural": "Delete Items",
         "messageSingle": "Are you sure you want to delete this item? This action cannot be undone.",
         "messagePlural": "Are you sure you want to delete these {count} items? This action cannot be undone.",
         "confirmSingle": "Delete",
         "confirmPlural": "Delete {count} Items",
         "deleting": "Deleting...",
         "andMore": "and {count} more"
       },
       "card": {
         "enterTitle": "Enter title...",
         "addLocation": "Add location...",
         "addTags": "Add tags...",
         "moreCount": "+{count} more",
         "selectItem": "Select {title}",
         "editTitle": "Edit title for {title}",
         "editLocation": "Edit location for {title}",
         "editTags": "Edit tags for {title}",
         "noTitle": "Untitled Item"
       },
       "contentTypes": {
         "link": "LINK",
         "text": "TEXT",
         "pdf": "PDF",
         "mixed": "MIXED",
         "video": "VIDEO",
         "photo": "PHOTO",
         "media": "MEDIA"
       },
       "grid": {
         "ariaLabel": "{count, plural, one {# item} other {# items}}"
       },
       "list": {
         "ariaLabel": "Item list with {count, plural, one {# item} other {# items}}",
         "columns": {
           "select": "Select",
           "title": "Title",
           "location": "Location",
           "tags": "Tags",
           "content": "Content",
           "views": "Views",
           "modified": "Modified",
           "actions": "Actions"
         }
       },
       "toolbar": {
         "ariaLabel": "Item management controls",
         "clearFilters": "Clear all filters"
       },
       "viewMode": {
         "label": "View mode",
         "grid": "Grid view",
         "list": "List view"
       },
       "assetPanel": {
         "title": "Assets",
         "dropzone": {
           "title": "Drop files here",
           "subtitle": "or click to browse",
           "hint": "Supports images, videos, and PDFs"
         },
         "remove": {
           "title": "Remove Asset",
           "message": "Are you sure you want to remove this asset?",
           "confirm": "Remove",
           "cancel": "Cancel"
         },
         "reorder": "Drag to reorder",
         "empty": "No assets yet"
       },
       "preview": {
         "title": "Item Preview",
         "close": "Close preview",
         "analytics": {
           "title": "Analytics",
           "views": "Views",
           "uniqueVisitors": "Unique Visitors",
           "avgTimeOnPage": "Avg. Time on Page",
           "lastViewed": "Last Viewed"
         },
         "gallery": {
           "previous": "Previous",
           "next": "Next",
           "imageOf": "Image {current} of {total}"
         },
         "video": {
           "play": "Play",
           "pause": "Pause",
           "mute": "Mute",
           "unmute": "Unmute",
           "fullscreen": "Fullscreen",
           "exitFullscreen": "Exit fullscreen"
         },
         "instructions": {
           "title": "Instructions",
           "empty": "No instructions added yet"
         }
       },
       "columnSettings": {
         "title": "Column Settings",
         "show": "Show",
         "hide": "Hide",
         "reset": "Reset to default"
       },
       "tagDialog": {
         "addTitle": "Add Tags",
         "removeTitle": "Remove Tags",
         "selectTags": "Select tags to {action}",
         "noTags": "No tags available",
         "apply": "Apply",
         "cancel": "Cancel"
       },
       "moveDialog": {
         "title": "Move to Property",
         "selectProperty": "Select destination property",
         "noProperties": "No properties available",
         "move": "Move",
         "cancel": "Cancel",
         "moving": "Moving..."
       }
     }
   }
   ```
3. Save the file

**Verification:**
- JSON is valid (no syntax errors)
- All keys follow the `namespace.component.element.variant` pattern
- ICU format is correct for pluralization strings

**Acceptance Criteria:**
- [ ] `items` namespace added to `/messages/en.json`
- [ ] All ~80 translation keys present
- [ ] Pluralization uses ICU format
- [ ] File parses without errors

---

### Task 1.2: Replicate Items Namespace to Other Language Files
**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Type:** EXTEND
**Estimated Effort:** 1 SP

**Description:**
Copy the `items` namespace structure to all other language files with English placeholder text. Actual translations will be generated in Phase 10.

**Steps:**
1. For each language file (fr, es, de, nl, it):
   - Open the file
   - Add the same `items` namespace structure from Task 1.1
   - Keep English text as placeholders (will be translated in Phase 10)
   - Save the file

**Verification:**
- All 5 language files have identical key structure
- No syntax errors in any file

**Acceptance Criteria:**
- [ ] All 6 language files have identical `items` namespace structure
- [ ] Files parse without errors

---

## Phase 2: Core Components

### Task 2.1: Update ItemManager.tsx with Translation Hooks
**File:** `/src/components/ItemManager/ItemManager.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add `useTranslations` hook to the main ItemManager component and replace hardcoded default labels with translated strings.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Inside component, add: `const t = useTranslations('items');`
3. Replace `DEFAULT_CONFIG.labels` object to use translations:
   - `searchPlaceholder: t('search.placeholder')`
   - `emptyStateTitle: t('empty.title')`
   - `emptyStateDescription: t('empty.description')`
   - `deleteConfirmTitle: t('delete.titleSingle')`
   - `deleteConfirmMessage: t('delete.messageSingle')`
4. Update any aria-labels to use `t('manager.ariaLabel')`

**Code Pattern:**
```typescript
import { useTranslations } from 'next-intl';

export function ItemManager({ ... }) {
  const t = useTranslations('items');

  const defaultLabels = {
    searchPlaceholder: t('search.placeholder'),
    emptyStateTitle: t('empty.title'),
    emptyStateDescription: t('empty.description'),
    deleteConfirmTitle: t('delete.titleSingle'),
    deleteConfirmMessage: t('delete.messageSingle'),
  };
  // ...
}
```

**Verification:**
- Component renders without errors
- Labels display translated text (English for now)
- No TypeScript errors

**Acceptance Criteria:**
- [ ] `useTranslations` imported and used
- [ ] All hardcoded labels replaced with `t()` calls
- [ ] Component compiles without errors
- [ ] Component renders correctly

---

### Task 2.2: Update ItemToolbar.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/ItemToolbar.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the ItemToolbar component for view toggle, clear filters button, selection indicator, and room filter dropdown.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace hardcoded strings:
   - `'Clear filters'` → `t('filters.clearFilters')`
   - `'{selectedCount} selected'` → `t('selection.selected', { count: selectedCount })`
   - `'Select all ({totalCount})'` → `t('selection.selectAll', { count: totalCount })`
   - `'Room'` → `t('filters.room')`
   - `'Room ({count})'` → `t('filters.roomWithCount', { count })`
4. Update aria-labels for toolbar elements

**Verification:**
- Toolbar renders correctly
- Selection count displays with pluralization
- Filter labels are translated

**Acceptance Criteria:**
- [ ] All toolbar labels use translation hooks
- [ ] Selection count uses ICU pluralization
- [ ] Room filter dropdown labels translated

---

### Task 2.3: Update SearchInput.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/SearchInput.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the SearchInput component for placeholder text and aria-labels.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - `placeholder="Search items..."` → `placeholder={t('search.placeholder')}`
   - `aria-label="Clear search"` → `aria-label={t('search.clear')}`
   - Any other hardcoded strings

**Verification:**
- Search input displays translated placeholder
- Clear button has translated aria-label

**Acceptance Criteria:**
- [ ] Placeholder text uses translation
- [ ] Aria-labels use translations
- [ ] Component renders correctly

---

### Task 2.4: Update constants.ts Sort Options to Use Translation Keys
**File:** `/src/components/ItemManager/utils/constants.ts`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Update the `SORT_OPTIONS` constant to use translation keys instead of hardcoded labels. Components using these options will translate them at render time.

**Steps:**
1. Modify `SORT_OPTIONS` array to include translation keys:
   ```typescript
   export const SORT_OPTIONS = [
     { value: 'title-asc', labelKey: 'sort.options.titleAsc' },
     { value: 'title-desc', labelKey: 'sort.options.titleDesc' },
     { value: 'created-desc', labelKey: 'sort.options.newestFirst' },
     { value: 'created-asc', labelKey: 'sort.options.oldestFirst' },
     { value: 'modified-desc', labelKey: 'sort.options.recentlyModified' },
     { value: 'modified-asc', labelKey: 'sort.options.leastRecentlyModified' },
     { value: 'location-asc', labelKey: 'sort.options.locationAsc' },
     { value: 'guides-desc', labelKey: 'sort.options.mostGuides' },
     { value: 'guides-asc', labelKey: 'sort.options.fewestGuides' },
   ];
   ```
2. Update the TypeScript type definition if needed

**Note:** Components using `SORT_OPTIONS` will need to translate the `labelKey` at render time using `t(option.labelKey)`.

**Verification:**
- Constants file exports correctly
- No TypeScript errors

**Acceptance Criteria:**
- [ ] `SORT_OPTIONS` uses translation keys instead of hardcoded labels
- [ ] Type definitions updated if needed

---

## Phase 3: Filter & Sort Components

### Task 3.1: Update FilterPanel.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the FilterPanel component for all filter-related labels.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace `DEFAULT_LABELS` object:
   - `title: t('filters.title')`
   - `clearAll: t('filters.clearAll')`
   - `contentType: t('filters.contentType')`
   - `tags: t('filters.tags')`
   - `location: t('filters.location')`
   - `property: t('filters.property')`
   - `applyFilters: t('filters.applyFilters')`
   - `close: t('filters.close')`
4. Update `renderHeader` and `renderFilters` functions

**Verification:**
- Filter panel displays translated labels
- All filter sections have translated headers

**Acceptance Criteria:**
- [ ] All filter labels translated
- [ ] Panel header translated
- [ ] Action buttons translated

---

### Task 3.2: Update ContentTypeFilter.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the ContentTypeFilter component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace content type labels:
   - Use `t('contentTypes.link')`, `t('contentTypes.text')`, etc.
4. Update any filter labels

**Verification:**
- Content type filter displays translated type names
- Filter works correctly with translated labels

**Acceptance Criteria:**
- [ ] All content type names translated
- [ ] Filter functionality preserved

---

### Task 3.3: Update TagFilter.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/dialogs/TagFilter.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the TagFilter component for filter labels.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace any hardcoded strings with translations

**Verification:**
- Tag filter displays translated labels
- Filter works correctly

**Acceptance Criteria:**
- [ ] Filter labels translated
- [ ] Component renders correctly

---

### Task 3.4: Update LocationFilter.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/dialogs/LocationFilter.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the LocationFilter component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace hardcoded strings with translations

**Verification:**
- Location filter displays translated labels

**Acceptance Criteria:**
- [ ] Filter labels translated
- [ ] Component renders correctly

---

### Task 3.5: Update PropertyFilter.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/dialogs/PropertyFilter.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the PropertyFilter component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace hardcoded strings with translations

**Verification:**
- Property filter displays translated labels

**Acceptance Criteria:**
- [ ] Filter labels translated
- [ ] Component renders correctly

---

### Task 3.6: Update SortMenu.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/dialogs/SortMenu.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the SortMenu component for sort labels and options.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace `mergedLabels`:
   - `sortLabel: t('sort.label')`
   - `sortByLabel: t('sort.sortBy')`
4. When rendering sort options, translate the `labelKey`:
   ```typescript
   {SORT_OPTIONS.map(option => (
     <option key={option.value} value={option.value}>
       {t(option.labelKey)}
     </option>
   ))}
   ```

**Verification:**
- Sort menu displays translated labels
- All sort options show translated text

**Acceptance Criteria:**
- [ ] Sort label translated
- [ ] All sort options translated
- [ ] Menu functions correctly

---

## Phase 4: Item Display Components

### Task 4.1: Update ItemCard.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the ItemCard component for content type badges, inline edit placeholders, and aria-labels.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace content type badge labels:
   - Use `t('contentTypes.link')`, `t('contentTypes.text')`, etc.
4. Replace inline edit placeholders:
   - `'Enter title...'` → `t('card.enterTitle')`
   - `'Add location...'` → `t('card.addLocation')`
   - `'Add tags...'` → `t('card.addTags')`
5. Replace `'+{count} more'` → `t('card.moreCount', { count })`
6. Update aria-labels:
   - `'Select {title}'` → `t('card.selectItem', { title })`

**Verification:**
- Item cards display translated content type badges
- Placeholders are translated
- Aria-labels are translated

**Acceptance Criteria:**
- [ ] Content type badges translated
- [ ] Inline edit placeholders translated
- [ ] Aria-labels translated with dynamic values

---

### Task 4.2: Update ItemGrid.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/ItemGrid.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the ItemGrid component for the aria-label.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace `aria-label="{count} item(s)"` with:
   ```typescript
   aria-label={t('grid.ariaLabel', { count: items.length })}
   ```

**Verification:**
- Grid has translated aria-label
- Pluralization works correctly

**Acceptance Criteria:**
- [ ] Aria-label translated with ICU pluralization

---

### Task 4.3: Update ItemList.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/ItemList.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the ItemList component for column headers and labels.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace column header labels:
   - `'Title'` → `t('list.columns.title')`
   - `'Location'` → `t('list.columns.location')`
   - `'Tags'` → `t('list.columns.tags')`
   - etc.
4. Update aria-label for the list

**Verification:**
- List column headers display translated text
- List has translated aria-label

**Acceptance Criteria:**
- [ ] All column headers translated
- [ ] Aria-label translated

---

### Task 4.4: Update ItemRow.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/ItemRow.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the ItemRow component for labels and tooltips.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace any hardcoded strings with translations

**Verification:**
- Row labels and tooltips are translated

**Acceptance Criteria:**
- [ ] All labels translated
- [ ] Tooltips translated

---

## Phase 5: Shared Components

### Task 5.1: Update EmptyState.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/shared/EmptyState.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the EmptyState component for default title and description.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace defaults:
   - `DEFAULT_TITLE` → `t('empty.title')`
   - `DEFAULT_DESCRIPTION` → `t('empty.description')`

**Verification:**
- Empty state displays translated message

**Acceptance Criteria:**
- [ ] Title and description translated

---

### Task 5.2: Update LoadingState.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/shared/LoadingState.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the LoadingState component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - `'Loading items, please wait...'` → `t('loading.text')`
   - `aria-label` → `t('loading.label')`

**Verification:**
- Loading state displays translated message

**Acceptance Criteria:**
- [ ] Loading text translated
- [ ] Aria-label translated

---

### Task 5.3: Update ViewModeToggle.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/shared/ViewModeToggle.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the ViewModeToggle component for aria-labels.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace aria-labels:
   - `'View mode'` → `t('viewMode.label')`
   - `'Grid view'` → `t('viewMode.grid')`
   - `'List view'` → `t('viewMode.list')`

**Verification:**
- Toggle buttons have translated aria-labels

**Acceptance Criteria:**
- [ ] All aria-labels translated

---

### Task 5.4: Update InlineEdit.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/shared/InlineEdit.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the InlineEdit component for placeholder strings if needed.

**Steps:**
1. Check if component has hardcoded placeholder text
2. If yes, add `useTranslations` and replace with translations
3. If placeholder is passed as prop, no changes needed

**Verification:**
- Component renders correctly
- Any hardcoded strings are translated

**Acceptance Criteria:**
- [ ] Hardcoded strings replaced (if any)

---

### Task 5.5: Update TagsInlineEdit.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the TagsInlineEdit component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace placeholder text if hardcoded

**Verification:**
- Component displays translated placeholder

**Acceptance Criteria:**
- [ ] Placeholder translated (if applicable)

---

### Task 5.6: Review TagChip.tsx for Translation Needs
**File:** `/src/components/ItemManager/components/shared/TagChip.tsx`
**Type:** REVIEW/MODIFY
**Estimated Effort:** 0.5 SP

**Description:**
Review TagChip component for any hardcoded labels that need translation.

**Steps:**
1. Open and review the component
2. If hardcoded strings found, add translations
3. If no hardcoded strings, mark task as complete

**Verification:**
- Component reviewed
- Any hardcoded strings translated

**Acceptance Criteria:**
- [ ] Component reviewed
- [ ] Hardcoded strings translated (if any)

---

## Phase 6: Bulk Actions Components

### Task 6.1: Update BulkActionsBar.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the BulkActionsBar component for all action labels and selection count.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - `'{selectedCount} selected'` → `t('selection.selected', { count: selectedCount })`
   - `'Currently {selectedCount} item(s) selected'` → `t('selection.currentlySelected', { count: selectedCount })`
   - `'Processing...'` → `t('bulkActions.processing')`
   - `'Delete'` → `t('bulkActions.delete')`
   - `'Add Tag'` → `t('bulkActions.addTag')`
   - `'Remove Tag'` → `t('bulkActions.removeTag')`
   - `'Move to Property'` → `t('bulkActions.moveToProperty')`
   - `'Cancel'` → `t('bulkActions.cancel')`
4. Update aria-label: `t('bulkActions.ariaLabel', { count: selectedCount })`

**Verification:**
- Bulk actions bar displays translated labels
- Selection count uses ICU pluralization

**Acceptance Criteria:**
- [ ] All action button labels translated
- [ ] Selection count translated with pluralization
- [ ] Aria-labels translated

---

### Task 6.2: Update BulkTagDialog.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the BulkTagDialog component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace dialog content:
   - Title: `t('tagDialog.addTitle')` or `t('tagDialog.removeTitle')`
   - Instructions: `t('tagDialog.selectTags', { action: 'add' })`
   - Buttons: `t('tagDialog.apply')`, `t('tagDialog.cancel')`

**Verification:**
- Dialog displays translated content
- Buttons have translated labels

**Acceptance Criteria:**
- [ ] Dialog title translated
- [ ] Instructions translated
- [ ] Buttons translated

---

### Task 6.3: Update BulkMoveDialog.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the BulkMoveDialog component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace dialog content:
   - Title: `t('moveDialog.title')`
   - Instructions: `t('moveDialog.selectProperty')`
   - Buttons: `t('moveDialog.move')`, `t('moveDialog.cancel')`
   - Loading: `t('moveDialog.moving')`

**Verification:**
- Dialog displays translated content

**Acceptance Criteria:**
- [ ] All dialog text translated

---

## Phase 7: Dialog Components

### Task 7.1: Update ConfirmDeleteDialog.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the ConfirmDeleteDialog component for all confirmation messages.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - `'Delete Item'` / `'Delete Items'` → conditional `t('delete.titleSingle')` / `t('delete.titlePlural')`
   - Confirmation message → `t('delete.messageSingle')` / `t('delete.messagePlural', { count })`
   - `'and {count} more'` → `t('delete.andMore', { count })`
   - `'Cancel'` → use from `common` namespace or `t('bulkActions.cancel')`
   - `'Delete {count} Items'` → `t('delete.confirmPlural', { count })`
   - `'Deleting...'` → `t('delete.deleting')`
4. Update `getDeleteTitle`, `getDeleteMessage`, `getConfirmButtonText` functions

**Verification:**
- Dialog displays correct messages for single/multiple items
- Pluralization works correctly
- Buttons have translated labels

**Acceptance Criteria:**
- [ ] Title translated with single/plural handling
- [ ] Message translated with pluralization
- [ ] Button labels translated

---

### Task 7.2: Update ColumnSettingsPopup.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the ColumnSettingsPopup component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - Title: `t('columnSettings.title')`
   - Column names: use `t('list.columns.title')`, etc.
   - Actions: `t('columnSettings.show')`, `t('columnSettings.hide')`, `t('columnSettings.reset')`

**Verification:**
- Popup displays translated labels

**Acceptance Criteria:**
- [ ] All column settings labels translated

---

## Phase 8: Asset Panel Components

### Task 8.1: Update AssetPanel.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the AssetPanel component for section headers.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - Panel title: `t('assetPanel.title')`
   - Empty state: `t('assetPanel.empty')`

**Verification:**
- Asset panel displays translated headers

**Acceptance Criteria:**
- [ ] Panel title translated
- [ ] Empty state translated

---

### Task 8.2: Update AssetDropZone.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the AssetDropZone component for drop zone text.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - `'Drop files here'` → `t('assetPanel.dropzone.title')`
   - `'or click to browse'` → `t('assetPanel.dropzone.subtitle')`
   - Hint text → `t('assetPanel.dropzone.hint')`

**Verification:**
- Drop zone displays translated text

**Acceptance Criteria:**
- [ ] All drop zone text translated

---

### Task 8.3: Update AssetRemoveConfirmDialog.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the AssetRemoveConfirmDialog component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - Title: `t('assetPanel.remove.title')`
   - Message: `t('assetPanel.remove.message')`
   - Buttons: `t('assetPanel.remove.confirm')`, `t('assetPanel.remove.cancel')`

**Verification:**
- Confirmation dialog displays translated content

**Acceptance Criteria:**
- [ ] Dialog fully translated

---

### Task 8.4: Update SortableAssetList.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the SortableAssetList component for reorder instructions.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - Reorder hint: `t('assetPanel.reorder')`

**Verification:**
- Reorder instructions translated

**Acceptance Criteria:**
- [ ] Reorder text translated

---

## Phase 9: Item Preview Components

### Task 9.1: Update ItemPreviewModal.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the ItemPreviewModal component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - Title: `t('preview.title')`
   - Close button aria-label: `t('preview.close')`

**Verification:**
- Modal displays translated content

**Acceptance Criteria:**
- [ ] Modal title translated
- [ ] Close button aria-label translated

---

### Task 9.2: Update MediaGallery.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the MediaGallery component for navigation labels.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - `'Previous'` → `t('preview.gallery.previous')`
   - `'Next'` → `t('preview.gallery.next')`
   - `'Image {current} of {total}'` → `t('preview.gallery.imageOf', { current, total })`

**Verification:**
- Gallery navigation has translated labels

**Acceptance Criteria:**
- [ ] Navigation buttons translated
- [ ] Image counter translated

---

### Task 9.3: Update AnalyticsSection.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the AnalyticsSection component for metric labels.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace metric labels:
   - `'Analytics'` → `t('preview.analytics.title')`
   - `'Views'` → `t('preview.analytics.views')`
   - `'Unique Visitors'` → `t('preview.analytics.uniqueVisitors')`
   - `'Avg. Time on Page'` → `t('preview.analytics.avgTimeOnPage')`
   - `'Last Viewed'` → `t('preview.analytics.lastViewed')`

**Verification:**
- Analytics section displays translated labels

**Acceptance Criteria:**
- [ ] All analytics labels translated

---

### Task 9.4: Update InstructionsViewer.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the InstructionsViewer component.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace:
   - Title: `t('preview.instructions.title')`
   - Empty state: `t('preview.instructions.empty')`

**Verification:**
- Instructions viewer displays translated content

**Acceptance Criteria:**
- [ ] Section title translated
- [ ] Empty state translated

---

### Task 9.5: Update VideoPlayer.tsx with Translation Hooks
**File:** `/src/components/ItemManager/components/ItemPreview/VideoPlayer.tsx`
**Type:** MODIFY
**Estimated Effort:** 1 SP

**Description:**
Add translations to the VideoPlayer component for control labels.

**Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook: `const t = useTranslations('items');`
3. Replace aria-labels/titles for controls:
   - Play: `t('preview.video.play')`
   - Pause: `t('preview.video.pause')`
   - Mute: `t('preview.video.mute')`
   - Unmute: `t('preview.video.unmute')`
   - Fullscreen: `t('preview.video.fullscreen')`
   - Exit fullscreen: `t('preview.video.exitFullscreen')`

**Verification:**
- Video player controls have translated labels

**Acceptance Criteria:**
- [ ] All control labels/aria-labels translated

---

## Phase 10: Translation Generation & Verification

### Task 10.1: Generate French Translations for Items Namespace
**File:** `/messages/fr.json`
**Type:** TRANSLATE
**Estimated Effort:** 1 SP

**Description:**
Generate French translations for all keys in the `items` namespace.

**Steps:**
1. Review all English strings in `items` namespace
2. Generate accurate French translations
3. Pay special attention to:
   - ICU pluralization rules for French
   - Gender agreement where applicable
   - UI terminology conventions
4. Update `/messages/fr.json` with translations

**Verification:**
- All keys translated
- Pluralization correct for French
- No missing keys

**Acceptance Criteria:**
- [ ] All `items` namespace keys have French translations
- [ ] Pluralization rules correct

---

### Task 10.2: Generate Spanish Translations for Items Namespace
**File:** `/messages/es.json`
**Type:** TRANSLATE
**Estimated Effort:** 1 SP

**Description:**
Generate Spanish translations for all keys in the `items` namespace.

**Steps:**
1. Review all English strings in `items` namespace
2. Generate accurate Spanish translations
3. Pay special attention to ICU pluralization rules for Spanish
4. Update `/messages/es.json` with translations

**Acceptance Criteria:**
- [ ] All `items` namespace keys have Spanish translations

---

### Task 10.3: Generate German Translations for Items Namespace
**File:** `/messages/de.json`
**Type:** TRANSLATE
**Estimated Effort:** 1 SP

**Description:**
Generate German translations for all keys in the `items` namespace.

**Steps:**
1. Generate accurate German translations
2. Pay attention to compound words and capitalization
3. Update `/messages/de.json` with translations

**Acceptance Criteria:**
- [ ] All `items` namespace keys have German translations

---

### Task 10.4: Generate Dutch Translations for Items Namespace
**File:** `/messages/nl.json`
**Type:** TRANSLATE
**Estimated Effort:** 1 SP

**Description:**
Generate Dutch translations for all keys in the `items` namespace.

**Steps:**
1. Generate accurate Dutch translations
2. Update `/messages/nl.json` with translations

**Acceptance Criteria:**
- [ ] All `items` namespace keys have Dutch translations

---

### Task 10.5: Generate Italian Translations for Items Namespace
**File:** `/messages/it.json`
**Type:** TRANSLATE
**Estimated Effort:** 1 SP

**Description:**
Generate Italian translations for all keys in the `items` namespace.

**Steps:**
1. Generate accurate Italian translations
2. Pay attention to gender agreement
3. Update `/messages/it.json` with translations

**Acceptance Criteria:**
- [ ] All `items` namespace keys have Italian translations

---

### Task 10.6: Verify All Components Render Correctly in Each Language
**Type:** VERIFICATION
**Estimated Effort:** 1 SP

**Description:**
Manual verification that all ItemManager components render correctly in each supported language.

**Steps:**
1. Set locale to each language (en, fr, es, de, nl, it)
2. Navigate to ItemManager
3. Verify:
   - All text is translated
   - No missing translation placeholders visible
   - Layout doesn't break with longer text
   - Pluralization works correctly
4. Test key interactions:
   - Search
   - Filtering
   - Sorting
   - Bulk actions
   - Delete confirmation

**Acceptance Criteria:**
- [ ] All 6 languages render correctly
- [ ] No layout breaks
- [ ] Pluralization works

---

### Task 10.7: Test Language Switching Without Page Reload
**Type:** VERIFICATION
**Estimated Effort:** 0.5 SP

**Description:**
Verify that language switching updates all ItemManager text without requiring a page reload.

**Steps:**
1. Load ItemManager in English
2. Switch language to French (or any other)
3. Verify all text updates immediately
4. Switch between multiple languages
5. Verify no stale text remains

**Acceptance Criteria:**
- [ ] Language switching is seamless
- [ ] No page reload required
- [ ] All text updates correctly

---

## Task Summary

| Phase | Tasks | Total Effort |
|-------|-------|--------------|
| Phase 1: Translation Infrastructure | 2 tasks | 2 SP |
| Phase 2: Core Components | 4 tasks | 4 SP |
| Phase 3: Filter & Sort Components | 6 tasks | 6 SP |
| Phase 4: Item Display Components | 4 tasks | 4 SP |
| Phase 5: Shared Components | 6 tasks | 5.5 SP |
| Phase 6: Bulk Actions Components | 3 tasks | 3 SP |
| Phase 7: Dialog Components | 2 tasks | 2 SP |
| Phase 8: Asset Panel Components | 4 tasks | 4 SP |
| Phase 9: Item Preview Components | 5 tasks | 5 SP |
| Phase 10: Translation & Verification | 7 tasks | 6.5 SP |
| **Total** | **43 tasks** | **42 SP** |

---

## Files Summary

### New Files (0)
None - all translations go into existing `/messages/*.json` files

### Modified Files (40+)
- `/messages/en.json` (extend with `items` namespace)
- `/messages/fr.json` (extend with `items` namespace)
- `/messages/es.json` (extend with `items` namespace)
- `/messages/de.json` (extend with `items` namespace)
- `/messages/nl.json` (extend with `items` namespace)
- `/messages/it.json` (extend with `items` namespace)
- `/src/components/ItemManager/ItemManager.tsx`
- `/src/components/ItemManager/components/ItemToolbar.tsx`
- `/src/components/ItemManager/components/SearchInput.tsx`
- `/src/components/ItemManager/components/ItemCard.tsx`
- `/src/components/ItemManager/components/ItemGrid.tsx`
- `/src/components/ItemManager/components/ItemList.tsx`
- `/src/components/ItemManager/components/ItemRow.tsx`
- `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
- `/src/components/ItemManager/components/dialogs/SortMenu.tsx`
- `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`
- `/src/components/ItemManager/components/dialogs/TagFilter.tsx`
- `/src/components/ItemManager/components/dialogs/LocationFilter.tsx`
- `/src/components/ItemManager/components/dialogs/PropertyFilter.tsx`
- `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx`
- `/src/components/ItemManager/components/shared/EmptyState.tsx`
- `/src/components/ItemManager/components/shared/LoadingState.tsx`
- `/src/components/ItemManager/components/shared/ViewModeToggle.tsx`
- `/src/components/ItemManager/components/shared/InlineEdit.tsx`
- `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx`
- `/src/components/ItemManager/components/shared/TagChip.tsx`
- `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
- `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
- `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
- `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`
- `/src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx`
- `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
- `/src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`
- `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`
- `/src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx`
- `/src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`
- `/src/components/ItemManager/components/ItemPreview/VideoPlayer.tsx`
- `/src/components/ItemManager/utils/constants.ts`

---

## Dependencies

| Task | Depends On |
|------|------------|
| All Phase 2-9 tasks | Task 1.1 (translation keys must exist) |
| Task 10.1-10.5 (translations) | All Phase 2-9 tasks complete |
| Task 10.6-10.7 (verification) | Tasks 10.1-10.5 complete |

---

## Execution Notes

1. **Parallelization:** Tasks within each phase can be executed in parallel if they don't share file dependencies.

2. **Code Pattern:** All component updates follow the same pattern:
   ```typescript
   import { useTranslations } from 'next-intl';

   function MyComponent() {
     const t = useTranslations('items');
     return <div>{t('key.path')}</div>;
   }
   ```

3. **Testing:** After each task, run:
   - `npm run typecheck` - Verify no TypeScript errors
   - `npm run build` - Verify build succeeds
   - Manual render test - Verify component displays correctly

4. **Commit Strategy:** Commit after completing each phase to enable easy rollback if issues arise.

---

## Acceptance Criteria Checklist (From REQ-E02-079)

- [ ] ItemManager root component imports and uses appropriate translation hooks
- [ ] Item list headers and column labels display translated text from the items namespace
- [ ] Sort controls and sorting options display in the selected language
- [ ] Search placeholder text and search-related labels are translated
- [ ] Filter controls display category names and filter options in the selected language
- [ ] Action buttons for creating, editing, and deleting items show translated labels
- [ ] Bulk action controls display translated operation names
- [ ] Item status indicators and badges show translated status text
- [ ] Empty state messages display appropriate translated content when no items exist
- [ ] Loading state indicators show translated loading messages
- [ ] Confirmation dialogs for item deletion display translated prompts and button labels
- [ ] Toast notifications for successful and failed operations appear in the selected language
- [ ] Item count displays use locale-appropriate number formatting
- [ ] Date and time values in item metadata use locale-specific formatting
- [ ] Pagination controls show translated labels for navigation
- [ ] Error messages for failed operations display translated content
- [ ] All hardcoded English strings are removed from component code
- [ ] Components properly handle language switching without requiring page reload
- [ ] Accessibility labels and ARIA attributes reflect the selected language where applicable
- [ ] Component rendering correctly handles text length variations across different languages

---

*Detailed task breakdown generated for FAQBNB L10N Epic 2, Sub-Epic 2D, Task 2D.2*
*Document ready for execution by AI coding agent or developer*
