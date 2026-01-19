# REQ-386: Update ItemManager Component Family for Localization - Detailed Task Breakdown

**Generated:** 2026-01-19 18:45:00 UTC
**Last Modified:** 2026-01-19 18:45:00 UTC
**Source Overview:** docs/REQ-386-update-itemmanager-component-family-overview.md
**Request Reference:** docs/gen_requests_epic2.md (REQ-386)
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Document Context

| Field | Value |
|-------|-------|
| **Request ID** | REQ-386 |
| **Title** | Update ItemManager Component Family for Localization |
| **Epic** | 2 - Static UI Translation |
| **Sub-Epic** | 2D - Item Management |
| **Task ID** | 2D.2 |
| **Size** | L (Large) |
| **Priority** | Seventh (per recommended order in Plan-111) |
| **Estimated Effort** | 15-22 hours |
| **Dependencies** | REQ-385 (items namespace structure), REQ-230 ✓, REQ-231 ✓ |

---

## Executive Summary

This document provides granular, actionable tasks for internationalizing the ItemManager component family (~50+ files) to support multilingual item management experiences. Each task is designed to be approximately 1 story point and can be executed independently or in parallel where dependencies allow.

---

## Prerequisites Checklist

Before starting implementation, verify these prerequisites:

- [ ] REQ-230: i18n configuration module exists at `/src/lib/i18n/config.ts`
- [ ] REQ-231: next.config.ts configured for i18n
- [ ] REQ-385: items namespace structure exists in `/messages/en.json`
- [ ] next-intl package installed and configured
- [ ] IntlProvider wrapper in place

---

## Task Breakdown

### Phase 1: Core Components (Highest Priority)

These components form the foundation of the ItemManager and should be updated first to establish patterns.

---

#### Task 1.1: Update ItemManager.tsx Main Component

**File:** `/src/components/ItemManager/ItemManager.tsx`
**Estimated Time:** 45-60 minutes
**Priority:** CRITICAL

**Description:**
Update the main ItemManager orchestrator component to use translation keys for all configurable labels and messages.

**Changes Required:**

1. Add import statement:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook call at component top:
```typescript
const t = useTranslations('items');
```

3. Update DEFAULT_CONFIG.labels to use translation keys:
```typescript
const DEFAULT_CONFIG = {
  labels: {
    searchPlaceholder: t('toolbar.searchPlaceholder'),
    emptyStateTitle: t('list.empty.title'),
    emptyStateDescription: t('list.empty.description'),
    deleteConfirmTitle: t('delete.title'),
    deleteConfirmMessage: t('delete.message'),
  }
};
```

4. Replace all hardcoded strings in JSX with translation calls
5. Update selection count formatting to use pluralization:
```typescript
t('bulk.selected', { count: selectedCount })
```

**Strings to Extract (~15):**
- Search placeholder
- Empty state title/description
- Delete confirmation title/message
- Selection count text
- Loading states
- Error messages

**Acceptance Criteria:**
- [ ] useTranslations hook imported and called
- [ ] DEFAULT_CONFIG uses translation keys
- [ ] All JSX text uses t() function
- [ ] Selection count uses ICU pluralization
- [ ] No hardcoded English strings remain
- [ ] Component renders correctly with translations

**Testing:**
- Verify component renders with English translations
- Test selection count with 0, 1, 2, many items
- Confirm empty state shows translated text

---

#### Task 1.2: Update BulkActionsBar.tsx

**File:** `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
**Estimated Time:** 30-45 minutes
**Priority:** HIGH

**Description:**
Internationalize the bulk actions toolbar with proper pluralization for selection counts.

**Changes Required:**

1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('items.bulk');
```

2. Update aria-label (line ~155):
```typescript
aria-label={t('toolbar.ariaLabel')}
```

3. Update selection display (lines ~182, 186):
```typescript
{t('selected', { count: selectedCount })}
```

4. Update processing state (line ~196):
```typescript
{t('processing')}
```

5. Update button labels (lines ~203, 212, 221, 231, 253, 267):
```typescript
{t('actions.delete')}
{t('actions.addTag')}
{t('actions.removeTag')}
{t('actions.move')}
```

**Strings to Extract (~12):**
- "X items selected" (with pluralization)
- "Delete", "Add Tag", "Remove Tag", "Move"
- "Processing..."
- ARIA labels for accessibility

**Acceptance Criteria:**
- [ ] All button labels translated
- [ ] Selection count uses ICU plural format
- [ ] ARIA labels translated
- [ ] Processing state translated
- [ ] No hardcoded strings remain

**Translation Keys:**
```json
{
  "items.bulk.selected": "{count, plural, one {# item selected} other {# items selected}}",
  "items.bulk.processing": "Processing...",
  "items.bulk.actions.delete": "Delete",
  "items.bulk.actions.addTag": "Add Tags",
  "items.bulk.actions.removeTag": "Remove Tags",
  "items.bulk.actions.move": "Move to Property"
}
```

---

#### Task 1.3: Update ConfirmDeleteDialog.tsx

**File:** `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
**Estimated Time:** 30-40 minutes
**Priority:** HIGH

**Description:**
Update the delete confirmation dialog with translated titles, messages, and button labels.

**Changes Required:**

1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('items.delete');
```

2. Update title generation (lines ~62, 73, 75):
```typescript
// Single item
t('title.single')
// Multiple items
t('title.multiple', { count })
```

3. Update confirmation message:
```typescript
t('message', { name: item.name })
// or for bulk
t('messageBulk', { count })
```

4. Update button labels (lines ~86, 88):
```typescript
{t('confirm')}
{t('cancel')}
```

5. Update overflow text (line ~230):
```typescript
t('andMore', { count: overflowCount })
```

6. Update deleting state (line ~271):
```typescript
{t('deleting')}
```

**Strings to Extract (~10):**
- "Delete Item" / "Delete Items"
- "Are you sure you want to delete {name}?"
- "Confirm", "Cancel"
- "and X more"
- "Deleting..."

**Translation Keys:**
```json
{
  "items.delete.title.single": "Delete Item",
  "items.delete.title.multiple": "Delete {count, plural, one {# Item} other {# Items}}",
  "items.delete.message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
  "items.delete.messageBulk": "Are you sure you want to delete {count, plural, one {this item} other {these # items}}? This action cannot be undone.",
  "items.delete.confirm": "Delete",
  "items.delete.cancel": "Cancel",
  "items.delete.andMore": "and {count} more",
  "items.delete.deleting": "Deleting..."
}
```

**Acceptance Criteria:**
- [ ] Dialog title uses translation with pluralization
- [ ] Confirmation message interpolates item name
- [ ] Button labels translated
- [ ] Overflow text uses pluralization
- [ ] Deleting state translated

---

#### Task 1.4: Update ItemToolbar.tsx

**File:** `/src/components/ItemManager/components/ItemToolbar.tsx`
**Estimated Time:** 30-45 minutes
**Priority:** HIGH

**Description:**
Internationalize the toolbar with search, view toggles, and controls.

**Changes Required:**

1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('items.toolbar');
```

2. Update aria-labels (lines ~70, 90, 121, 392):
```typescript
aria-label={t('search.ariaLabel')}
aria-label={t('viewMode.grid')}
aria-label={t('viewMode.list')}
aria-label={t('filter.ariaLabel')}
```

3. Update button labels (lines ~134, 184, 212):
```typescript
{t('filter.button')}
{t('clear')}
{t('selectAll')}
```

4. Update default placeholder (line ~387):
```typescript
placeholder={t('search.placeholder')}
```

**Strings to Extract (~12):**
- "Search items..."
- "Grid view", "List view"
- "Filters", "Clear filters"
- "Select all"
- "X filters active"
- ARIA labels

**Translation Keys:**
```json
{
  "items.toolbar.search.placeholder": "Search items...",
  "items.toolbar.search.ariaLabel": "Search items",
  "items.toolbar.viewMode.grid": "Grid view",
  "items.toolbar.viewMode.list": "List view",
  "items.toolbar.filter.button": "Filters",
  "items.toolbar.filter.ariaLabel": "Open filters",
  "items.toolbar.filter.active": "{count, plural, one {# filter active} other {# filters active}}",
  "items.toolbar.clear": "Clear",
  "items.toolbar.selectAll": "Select all"
}
```

**Acceptance Criteria:**
- [ ] Search placeholder translated
- [ ] View mode toggles have translated ARIA labels
- [ ] Filter button and indicators translated
- [ ] Filter count uses pluralization
- [ ] All button text translated

---

#### Task 1.5: Update FilterPanel.tsx

**File:** `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
**Estimated Time:** 25-35 minutes
**Priority:** HIGH

**Description:**
Update the filter panel with translated category labels and controls.

**Changes Required:**

1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('items.filters');
```

2. Update DEFAULT_LABELS object (lines ~90-97):
```typescript
const DEFAULT_LABELS = {
  title: t('title'),
  clearAll: t('clearAll'),
  contentType: t('contentType'),
  tags: t('tags'),
  location: t('location'),
  property: t('property'),
  applyFilters: t('apply'),
  close: t('close')
};
```

3. Update aria-label (line ~305):
```typescript
aria-label={t('panel.ariaLabel')}
```

**Strings to Extract (~12):**
- "Filters", "Clear All", "Apply Filters", "Close"
- "Content Type", "Tags", "Location", "Property"
- Panel ARIA labels

**Translation Keys:**
```json
{
  "items.filters.title": "Filters",
  "items.filters.clearAll": "Clear All",
  "items.filters.apply": "Apply Filters",
  "items.filters.close": "Close",
  "items.filters.contentType": "Content Type",
  "items.filters.tags": "Tags",
  "items.filters.location": "Location",
  "items.filters.property": "Property",
  "items.filters.panel.ariaLabel": "Filter items panel"
}
```

**Acceptance Criteria:**
- [ ] All filter category labels translated
- [ ] Action buttons translated
- [ ] ARIA labels translated
- [ ] DEFAULT_LABELS uses translation calls

---

### Phase 2: Display Components

---

#### Task 2.1: Update EmptyState.tsx

**File:** `/src/components/ItemManager/components/shared/EmptyState.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** HIGH

**Description:**
Update the empty state component with translated title and description.

**Changes Required:**

1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('items.list.empty');
```

2. Update DEFAULT_TITLE (line ~23):
```typescript
const DEFAULT_TITLE = t('title');
```

3. Update DEFAULT_DESCRIPTION (line ~24):
```typescript
const DEFAULT_DESCRIPTION = t('description');
```

**Strings to Extract (~4):**
- "No items yet"
- "Create your first item to get started"
- "No matching items"
- "Try adjusting your search or filters"

**Translation Keys:**
```json
{
  "items.list.empty.title": "No items yet",
  "items.list.empty.description": "Create your first item to get started",
  "items.list.empty.noResults.title": "No matching items",
  "items.list.empty.noResults.description": "Try adjusting your search or filters"
}
```

**Acceptance Criteria:**
- [ ] Default title/description translated
- [ ] Component accepts translated props
- [ ] No hardcoded strings remain

---

#### Task 2.2: Update LoadingState.tsx

**File:** `/src/components/ItemManager/components/shared/LoadingState.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update loading state with translated screen reader text.

**Changes Required:**

1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('items.loading');
```

2. Update screen reader text (lines ~116, 138):
```typescript
<span className="sr-only">{t('message')}</span>
```

**Strings to Extract (~3):**
- "Loading items, please wait..."
- "Loading..."
- Screen reader text

**Translation Keys:**
```json
{
  "items.loading.message": "Loading items, please wait...",
  "items.loading.short": "Loading..."
}
```

**Acceptance Criteria:**
- [ ] Screen reader text translated
- [ ] Loading message translated

---

#### Task 2.3: Update ItemCard.tsx

**File:** `/src/components/ItemManager/components/ItemCard.tsx`
**Estimated Time:** 25-35 minutes
**Priority:** HIGH

**Description:**
Update item card with translated tooltips, badges, and labels.

**Changes Required:**

1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('items.card');
```

2. Update content type labels
3. Update tooltips
4. Update action labels
5. Update status badges

**Strings to Extract (~10):**
- Content type labels (Photo, Video, PDF, Link, Text)
- Tooltip text
- Action labels
- Status indicators

**Translation Keys:**
```json
{
  "items.card.contentType.photo": "Photo",
  "items.card.contentType.video": "Video",
  "items.card.contentType.pdf": "PDF",
  "items.card.contentType.link": "Link",
  "items.card.contentType.text": "Text",
  "items.card.actions.edit": "Edit",
  "items.card.actions.delete": "Delete",
  "items.card.actions.preview": "Preview"
}
```

**Acceptance Criteria:**
- [ ] Content type labels translated
- [ ] Action buttons translated
- [ ] Tooltips translated
- [ ] Status badges translated

---

#### Task 2.4: Update ItemRow.tsx

**File:** `/src/components/ItemManager/components/ItemRow.tsx`
**Estimated Time:** 25-30 minutes
**Priority:** HIGH

**Description:**
Update list row with translated column headers and actions.

**Changes Required:**

1. Add import and hook
2. Update column headers
3. Update action labels
4. Update tooltips and status indicators

**Strings to Extract (~8):**
- Column headers
- Action buttons
- Tooltips
- Status indicators

**Acceptance Criteria:**
- [ ] Column headers translated
- [ ] Action labels translated
- [ ] Tooltips translated

---

#### Task 2.5: Update ItemGrid.tsx

**File:** `/src/components/ItemManager/components/ItemGrid.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update grid container with translated ARIA labels.

**Changes Required:**

1. Add import and hook
2. Update aria-labels for grid container

**Strings to Extract (~5):**
- Grid ARIA labels
- Container labels

**Acceptance Criteria:**
- [ ] ARIA labels translated
- [ ] Container accessible with translations

---

#### Task 2.6: Update ItemList.tsx

**File:** `/src/components/ItemManager/components/ItemList.tsx`
**Estimated Time:** 20-25 minutes
**Priority:** MEDIUM

**Description:**
Update list container with translated headers and labels.

**Changes Required:**

1. Add import and hook
2. Update column header labels
3. Update ARIA labels

**Strings to Extract (~8):**
- Column headers
- ARIA labels

**Acceptance Criteria:**
- [ ] Column headers translated
- [ ] ARIA labels translated

---

### Phase 3: Dialog Components

---

#### Task 3.1: Update BulkTagDialog.tsx

**File:** `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
**Estimated Time:** 30-40 minutes
**Priority:** HIGH

**Description:**
Update bulk tag dialog for add/remove tag operations.

**Changes Required:**

1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('items.bulk.tag');
```

2. Update title (lines ~321-322):
```typescript
{mode === 'add' ? t('add.title') : t('remove.title')}
```

3. Update aria-label (line ~334)
4. Update form labels (lines ~347, 382, 384, 400, 427, 432)
5. Update button labels (lines ~493, 510)

**Strings to Extract (~10):**
- "Add Tags to Items" / "Remove Tags from Items"
- "Select tags to add/remove"
- "Items to update: X"
- "Add Tags" / "Remove Tags"
- "Cancel"

**Translation Keys:**
```json
{
  "items.bulk.tag.add.title": "Add Tags to Items",
  "items.bulk.tag.add.button": "Add Tags",
  "items.bulk.tag.remove.title": "Remove Tags from Items",
  "items.bulk.tag.remove.button": "Remove Tags",
  "items.bulk.tag.selectTags": "Select tags",
  "items.bulk.tag.itemsToUpdate": "{count, plural, one {# item} other {# items}} to update",
  "items.bulk.tag.cancel": "Cancel"
}
```

**Acceptance Criteria:**
- [ ] Add/remove modes have correct translated titles
- [ ] Item count uses pluralization
- [ ] All form labels translated
- [ ] Button labels translated

---

#### Task 3.2: Update BulkMoveDialog.tsx

**File:** `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
**Estimated Time:** 30-40 minutes
**Priority:** HIGH

**Description:**
Update bulk move to property dialog.

**Changes Required:**

1. Add import and hook
2. Update placeholder (line ~100)
3. Update empty state (line ~197)
4. Update aria-label (line ~214)
5. Update labels (lines ~334, 344, 352, 487, 500, 514, 518, 526, 552, 567)

**Strings to Extract (~10):**
- "Move Items to Property"
- "Select a property"
- "No properties available"
- Item count display
- "Move" / "Cancel" buttons

**Translation Keys:**
```json
{
  "items.bulk.move.title": "Move Items to Property",
  "items.bulk.move.selectProperty": "Select a property",
  "items.bulk.move.noProperties": "No properties available",
  "items.bulk.move.itemsToMove": "{count, plural, one {# item} other {# items}} to move",
  "items.bulk.move.button": "Move Items",
  "items.bulk.move.cancel": "Cancel"
}
```

**Acceptance Criteria:**
- [ ] Dialog title translated
- [ ] Property selection labels translated
- [ ] Empty state translated
- [ ] Item count uses pluralization
- [ ] Buttons translated

---

#### Task 3.3: Update SortMenu.tsx

**File:** `/src/components/ItemManager/components/dialogs/SortMenu.tsx`
**Estimated Time:** 20-25 minutes
**Priority:** MEDIUM

**Description:**
Update sort dropdown with translated options.

**Changes Required:**

1. Add import and hook
2. Update default labels (lines ~69, 125-126)
3. Update aria-label (line ~164)

**Strings to Extract (~8):**
- "Sort", "Sort by"
- "Newest First", "Oldest First"
- "Name (A-Z)", "Name (Z-A)"
- "Most Viewed"

**Translation Keys:**
```json
{
  "items.sort.title": "Sort by",
  "items.sort.options.newest": "Newest First",
  "items.sort.options.oldest": "Oldest First",
  "items.sort.options.nameAsc": "Name (A-Z)",
  "items.sort.options.nameDesc": "Name (Z-A)",
  "items.sort.options.mostViewed": "Most Viewed"
}
```

**Acceptance Criteria:**
- [ ] Sort options translated
- [ ] Title translated
- [ ] ARIA labels translated

---

#### Task 3.4: Update ContentTypeFilter.tsx

**File:** `/src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update content type filter labels.

**Changes Required:**

1. Add import and hook
2. Update filter labels for content types

**Strings to Extract (~5):**
- Content type names

**Acceptance Criteria:**
- [ ] All content type labels translated

---

#### Task 3.5: Update TagFilter.tsx

**File:** `/src/components/ItemManager/components/dialogs/TagFilter.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update tag filter labels.

**Changes Required:**

1. Add import and hook
2. Update filter labels

**Strings to Extract (~5):**
- "Tags", "Select tags"
- Empty state text

**Acceptance Criteria:**
- [ ] Filter labels translated
- [ ] Empty state translated

---

#### Task 3.6: Update LocationFilter.tsx

**File:** `/src/components/ItemManager/components/dialogs/LocationFilter.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update location filter labels.

**Changes Required:**

1. Add import and hook
2. Update filter labels

**Strings to Extract (~5):**
- "Location", "Select location"
- Empty state text

**Acceptance Criteria:**
- [ ] Filter labels translated

---

#### Task 3.7: Update PropertyFilter.tsx

**File:** `/src/components/ItemManager/components/dialogs/PropertyFilter.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update property filter labels.

**Changes Required:**

1. Add import and hook
2. Update filter labels

**Strings to Extract (~5):**
- "Property", "Select property"
- Empty state text

**Acceptance Criteria:**
- [ ] Filter labels translated

---

#### Task 3.8: Update ColumnSettingsPopup.tsx

**File:** `/src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx`
**Estimated Time:** 20-25 minutes
**Priority:** LOW

**Description:**
Update column visibility configuration labels.

**Changes Required:**

1. Add import and hook
2. Update column names
3. Update control labels

**Strings to Extract (~8):**
- Column names
- "Show/Hide Columns"
- Toggle labels

**Acceptance Criteria:**
- [ ] Column names translated
- [ ] Control labels translated

---

### Phase 4: Shared Components

---

#### Task 4.1: Update ViewModeToggle.tsx

**File:** `/src/components/ItemManager/components/shared/ViewModeToggle.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update view mode toggle ARIA labels.

**Changes Required:**

1. Add import and hook
2. Update aria-labels for toggle buttons

**Strings to Extract (~4):**
- "Grid view", "List view"
- Toggle ARIA labels

**Acceptance Criteria:**
- [ ] ARIA labels translated

---

#### Task 4.2: Update InlineEdit.tsx

**File:** `/src/components/ItemManager/components/shared/InlineEdit.tsx`
**Estimated Time:** 20-25 minutes
**Priority:** MEDIUM

**Description:**
Update inline text editing placeholders and tooltips.

**Changes Required:**

1. Add import and hook
2. Update placeholders
3. Update tooltips

**Strings to Extract (~6):**
- "Enter title..."
- "Click to edit"
- "Press Enter to save"
- "Press Escape to cancel"

**Translation Keys:**
```json
{
  "items.editing.inline.placeholder": "Enter title...",
  "items.editing.inline.clickToEdit": "Click to edit",
  "items.editing.inline.enterToSave": "Press Enter to save",
  "items.editing.inline.escapeToCancel": "Press Escape to cancel"
}
```

**Acceptance Criteria:**
- [ ] Placeholders translated
- [ ] Tooltips translated
- [ ] Instructions translated

---

#### Task 4.3: Update TagsInlineEdit.tsx

**File:** `/src/components/ItemManager/components/shared/TagsInlineEdit.tsx`
**Estimated Time:** 20-25 minutes
**Priority:** MEDIUM

**Description:**
Update tag editing placeholders and tooltips.

**Changes Required:**

1. Add import and hook
2. Update placeholders
3. Update tooltips

**Strings to Extract (~6):**
- "Add tags..."
- Editing instructions
- Action prompts

**Acceptance Criteria:**
- [ ] Placeholders translated
- [ ] Tooltips translated

---

#### Task 4.4: Update VisitCountBadge.tsx

**File:** `/src/components/ItemManager/components/shared/VisitCountBadge.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update visit count labels with pluralization.

**Changes Required:**

1. Add import and hook
2. Update count labels with pluralization

**Strings to Extract (~4):**
- "X views" (with pluralization)
- Tooltip text

**Translation Keys:**
```json
{
  "items.analytics.views": "{count, plural, one {# view} other {# views}}"
}
```

**Acceptance Criteria:**
- [ ] Count uses ICU pluralization
- [ ] Tooltip translated

---

#### Task 4.5: Update ReactionSummary.tsx

**File:** `/src/components/ItemManager/components/shared/ReactionSummary.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update reaction summary labels.

**Changes Required:**

1. Add import and hook
2. Update labels

**Strings to Extract (~4):**
- Reaction type labels
- Count labels

**Acceptance Criteria:**
- [ ] Labels translated

---

#### Task 4.6: Update EngagementIndicator.tsx

**File:** `/src/components/ItemManager/components/shared/EngagementIndicator.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update engagement metrics labels.

**Changes Required:**

1. Add import and hook
2. Update metric labels

**Strings to Extract (~4):**
- Metric labels
- Tooltips

**Acceptance Criteria:**
- [ ] Metric labels translated
- [ ] Tooltips translated

---

#### Task 4.7: Update TagChip.tsx

**File:** `/src/components/ItemManager/components/shared/TagChip.tsx`
**Estimated Time:** 10-15 minutes
**Priority:** LOW

**Description:**
Update tag chip action tooltips if any.

**Changes Required:**

1. Check for tooltips/ARIA labels
2. Add translations if needed

**Strings to Extract (~2):**
- Action tooltips (if any)

**Acceptance Criteria:**
- [ ] Any tooltips translated

---

#### Task 4.8: Update BottomSheet.tsx

**File:** `/src/components/ItemManager/components/shared/BottomSheet.tsx`
**Estimated Time:** 10-15 minutes
**Priority:** LOW

**Description:**
Update mobile bottom sheet close labels if any.

**Changes Required:**

1. Check for close button labels
2. Add translations if needed

**Strings to Extract (~2):**
- Close label
- ARIA labels

**Acceptance Criteria:**
- [ ] Close labels translated (if any)

---

#### Task 4.9: Update SearchInput.tsx

**File:** `/src/components/ItemManager/components/SearchInput.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update search input placeholder and ARIA labels.

**Changes Required:**

1. Add import and hook
2. Update default placeholder (line ~55)
3. Update aria-label (line ~215)

**Strings to Extract (~3):**
- "Search items..."
- Clear button ARIA label
- Search ARIA label

**Acceptance Criteria:**
- [ ] Placeholder translated
- [ ] ARIA labels translated

---

### Phase 5: Asset & Preview Components

---

#### Task 5.1: Update AssetPanel.tsx

**File:** `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`
**Estimated Time:** 20-25 minutes
**Priority:** MEDIUM

**Description:**
Update asset management panel labels.

**Changes Required:**

1. Add import and hook
2. Update panel title
3. Update action labels

**Strings to Extract (~8):**
- "Manage Assets"
- "Upload", "Remove"
- Panel instructions

**Acceptance Criteria:**
- [ ] Panel title translated
- [ ] Action labels translated

---

#### Task 5.2: Update AssetDropZone.tsx

**File:** `/src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx`
**Estimated Time:** 20-25 minutes
**Priority:** MEDIUM

**Description:**
Update file upload drop zone prompts.

**Changes Required:**

1. Add import and hook
2. Update upload prompts

**Strings to Extract (~6):**
- "Drag and drop files here"
- "or click to browse"
- "Upload files"
- File type hints

**Translation Keys:**
```json
{
  "items.assets.dropZone.drag": "Drag and drop files here",
  "items.assets.dropZone.or": "or",
  "items.assets.dropZone.browse": "click to browse",
  "items.assets.dropZone.fileTypes": "Supported: {types}"
}
```

**Acceptance Criteria:**
- [ ] Upload prompts translated
- [ ] File type hints translated

---

#### Task 5.3: Update AssetItem.tsx

**File:** `/src/components/ItemManager/components/AssetPanel/AssetItem.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update individual asset item labels.

**Changes Required:**

1. Add import and hook
2. Update action labels
3. Update tooltips

**Strings to Extract (~4):**
- Action labels
- Tooltips

**Acceptance Criteria:**
- [ ] Action labels translated
- [ ] Tooltips translated

---

#### Task 5.4: Update SortableAssetList.tsx

**File:** `/src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`
**Estimated Time:** 10-15 minutes
**Priority:** LOW

**Description:**
Update sortable asset list labels if any.

**Changes Required:**

1. Check for labels/ARIA attributes
2. Add translations if needed

**Strings to Extract (~2):**
- Reorder instructions (if any)

**Acceptance Criteria:**
- [ ] Any labels translated

---

#### Task 5.5: Update AssetRemoveConfirmDialog.tsx

**File:** `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update asset removal confirmation dialog.

**Changes Required:**

1. Add import and hook
2. Update confirmation dialog strings

**Strings to Extract (~6):**
- "Remove Asset"
- Confirmation message
- "Remove" / "Cancel"

**Acceptance Criteria:**
- [ ] Title translated
- [ ] Confirmation message translated
- [ ] Button labels translated

---

#### Task 5.6: Update ItemPreviewModal.tsx

**File:** `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
**Estimated Time:** 25-35 minutes
**Priority:** HIGH

**Description:**
Update item preview modal interface.

**Changes Required:**

1. Add import and hook
2. Update tab labels
3. Update action buttons

**Strings to Extract (~10):**
- Tab labels: "Content", "QR Code", "Analytics", "Settings"
- Navigation: "Previous", "Next"
- Actions: "Close", "Edit", "Delete"

**Translation Keys:**
```json
{
  "items.preview.tabs.content": "Content",
  "items.preview.tabs.qrCode": "QR Code",
  "items.preview.tabs.analytics": "Analytics",
  "items.preview.tabs.settings": "Settings",
  "items.preview.nav.previous": "Previous",
  "items.preview.nav.next": "Next",
  "items.preview.actions.close": "Close",
  "items.preview.actions.edit": "Edit",
  "items.preview.actions.delete": "Delete"
}
```

**Acceptance Criteria:**
- [ ] Tab labels translated
- [ ] Navigation labels translated
- [ ] Action buttons translated

---

#### Task 5.7: Update MediaGallery.tsx

**File:** `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update media gallery navigation labels.

**Changes Required:**

1. Add import and hook
2. Update navigation labels

**Strings to Extract (~6):**
- Navigation labels
- Image/video counters

**Acceptance Criteria:**
- [ ] Navigation labels translated

---

#### Task 5.8: Update AnalyticsSection.tsx

**File:** `/src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx`
**Estimated Time:** 20-25 minutes
**Priority:** MEDIUM

**Description:**
Update analytics display labels.

**Changes Required:**

1. Add import and hook
2. Update metric labels

**Strings to Extract (~8):**
- Metric labels
- Time period labels
- Chart labels

**Acceptance Criteria:**
- [ ] Metric labels translated
- [ ] Time labels translated

---

#### Task 5.9: Update InstructionsViewer.tsx

**File:** `/src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** MEDIUM

**Description:**
Update instructions section headers.

**Changes Required:**

1. Add import and hook
2. Update section headers

**Strings to Extract (~4):**
- Section headers
- Empty state

**Acceptance Criteria:**
- [ ] Section headers translated
- [ ] Empty state translated

---

#### Task 5.10: Update VideoPlayer.tsx

**File:** `/src/components/ItemManager/components/ItemPreview/VideoPlayer.tsx`
**Estimated Time:** 15-20 minutes
**Priority:** LOW

**Description:**
Update video player control labels.

**Changes Required:**

1. Add import and hook
2. Update player control labels

**Strings to Extract (~4):**
- Play/pause labels
- ARIA labels

**Acceptance Criteria:**
- [ ] Control labels translated

---

#### Task 5.11: Update PhotoViewer.tsx

**File:** `/src/components/ItemManager/components/ItemPreview/viewers/PhotoViewer.tsx`
**Estimated Time:** 10-15 minutes
**Priority:** LOW

**Description:**
Update photo viewer labels if any.

**Changes Required:**

1. Check for labels/ARIA attributes
2. Add translations if needed

**Strings to Extract (~2):**
- Viewer labels (if any)

**Acceptance Criteria:**
- [ ] Any labels translated

---

#### Task 5.12: Update PDFViewer.tsx

**File:** `/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx`
**Estimated Time:** 10-15 minutes
**Priority:** LOW

**Description:**
Update PDF viewer labels if any.

**Changes Required:**

1. Check for labels/ARIA attributes
2. Add translations if needed

**Strings to Extract (~2):**
- Viewer labels (if any)

**Acceptance Criteria:**
- [ ] Any labels translated

---

### Phase 6: Utilities & Constants

---

#### Task 6.1: Update constants.ts for SORT_OPTIONS

**File:** `/src/components/ItemManager/utils/constants.ts`
**Estimated Time:** 20-30 minutes
**Priority:** HIGH

**Description:**
Refactor SORT_OPTIONS to support translation. Labels should NOT be stored in constants.ts; components using sort options should translate labels.

**Changes Required:**

1. Export raw sort option values only (without labels):
```typescript
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  NAME_ASC: 'nameAsc',
  NAME_DESC: 'nameDesc',
  MOST_VIEWED: 'mostViewed',
} as const;
```

2. Create a utility function or mapping for sort labels (used by components):
```typescript
// Components will use this pattern
const getSortLabel = (key: string) => t(`sort.options.${key}`);
```

**Strings Affected (~9):**
- All SORT_OPTIONS labels

**Acceptance Criteria:**
- [ ] Constants export values only
- [ ] Labels moved to translation files
- [ ] Components using SORT_OPTIONS translate labels

---

### Phase 7: Testing & Validation

---

#### Task 7.1: Unit Test Updates

**Estimated Time:** 60-90 minutes
**Priority:** HIGH

**Description:**
Update existing unit tests to work with translation mocks.

**Changes Required:**

1. Create translation mock for tests:
```typescript
// __mocks__/next-intl.ts
export const useTranslations = (namespace: string) => (key: string) => `${namespace}.${key}`;
```

2. Update test assertions for translated text
3. Add translation provider wrapper for integration tests

**Files to Update:**
- All `__tests__` directories under ItemManager
- Test utilities/helpers

**Acceptance Criteria:**
- [ ] All existing tests pass
- [ ] Translation mock in place
- [ ] Integration tests have provider wrapper

---

#### Task 7.2: Manual Language Testing

**Estimated Time:** 60-90 minutes
**Priority:** HIGH

**Description:**
Manual testing in all 6 supported languages.

**Testing Checklist:**

- [ ] English (en) - baseline
- [ ] French (fr)
- [ ] Spanish (es)
- [ ] German (de) - test long text
- [ ] Dutch (nl) - test long text
- [ ] Italian (it)

**Test Scenarios:**

1. **Toolbar functionality:**
   - [ ] Search placeholder shows correct language
   - [ ] View mode toggles show correct ARIA labels
   - [ ] Filter button and indicators show correct text

2. **Bulk actions:**
   - [ ] Selection count updates correctly with pluralization
   - [ ] All action buttons show correct labels
   - [ ] Dialog titles and messages show correct text

3. **Delete operations:**
   - [ ] Single item delete shows correct title/message
   - [ ] Bulk delete shows correct pluralized text
   - [ ] Button labels correct

4. **Filters and sort:**
   - [ ] All filter labels correct
   - [ ] Sort options show correct text

5. **Empty and loading states:**
   - [ ] Empty state title/description correct
   - [ ] Loading message correct

6. **Text overflow:**
   - [ ] German/Dutch text doesn't break layouts
   - [ ] Buttons don't truncate unexpectedly

**Acceptance Criteria:**
- [ ] All languages render correctly
- [ ] Pluralization works for 0, 1, 2, many
- [ ] No layout breaks
- [ ] All ARIA labels translated

---

#### Task 7.3: Accessibility Verification

**Estimated Time:** 30-45 minutes
**Priority:** MEDIUM

**Description:**
Verify all ARIA labels and screen reader text are properly translated.

**Testing Checklist:**

- [ ] Run screen reader through item management flow
- [ ] Verify all ARIA labels read correctly in each language
- [ ] Check focus announcements
- [ ] Test keyboard navigation with translations

**Acceptance Criteria:**
- [ ] All ARIA labels translated
- [ ] Screen reader announcements correct
- [ ] No accessibility regressions

---

## Implementation Summary

### Total Tasks: 38

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Core Components | 5 | 2.5-4 hours |
| Phase 2: Display Components | 6 | 2-3 hours |
| Phase 3: Dialog Components | 8 | 2.5-3.5 hours |
| Phase 4: Shared Components | 9 | 2-3 hours |
| Phase 5: Asset & Preview | 12 | 3-4 hours |
| Phase 6: Utilities | 1 | 20-30 minutes |
| Phase 7: Testing | 3 | 2.5-4 hours |
| **Total** | **44 subtasks** | **15-22 hours** |

### Parallelization Opportunities

- Phase 2 (Display) and Phase 4 (Shared) can run in parallel
- Phase 3 (Dialogs) and Phase 5 (Asset/Preview) can run in parallel
- Phase 1 must complete first (establishes patterns)
- Phase 6 can run any time after Phase 3
- Phase 7 must run after all other phases

### Critical Path

1. Task 1.1 (ItemManager.tsx) - establishes patterns
2. Tasks 1.2-1.5 (Core components)
3. Task 7.1 (Test updates)
4. Task 7.2 (Manual testing)

---

## Translation Key Summary

### Estimated Total Keys: ~170

| Namespace | Estimated Keys |
|-----------|----------------|
| items.toolbar | ~15 |
| items.list | ~10 |
| items.card | ~10 |
| items.bulk | ~25 |
| items.delete | ~10 |
| items.filters | ~15 |
| items.sort | ~8 |
| items.editing | ~12 |
| items.assets | ~15 |
| items.preview | ~25 |
| items.analytics | ~10 |
| items.loading | ~5 |
| items.accessibility | ~10 |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing translations cause UI breaks | Use fallback to English, build-time validation |
| Pluralization edge cases | Test with 0, 1, 2, many counts |
| Long translations break layouts | Test German/Dutch, use text-overflow CSS |
| Test file updates needed | Update test assertions, create mocks |
| Type errors from translation keys | Use TypeScript path autocomplete |

---

## Definition of Done

- [ ] All 38+ tasks completed
- [ ] All 50+ component files updated with useTranslations
- [ ] No hardcoded English strings remain in any component
- [ ] All ARIA labels translated
- [ ] All placeholders translated
- [ ] All tooltips translated
- [ ] All button labels translated
- [ ] All dialog titles and messages translated
- [ ] Pluralization uses ICU format correctly
- [ ] Variable interpolation uses proper format
- [ ] All unit tests pass
- [ ] Manual testing in all 6 languages completed
- [ ] No layout breaks in any language
- [ ] Accessibility verification passed

---

*Document generated for REQ-386 implementation guidance*
