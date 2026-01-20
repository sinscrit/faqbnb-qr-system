# Implementation Breakdown: REQ-E02-079 - Update ItemManager Component Family for Internationalization

**Generated:** 2026-01-20 17:30 UTC
**Last Modified:** 2026-01-20 17:30 UTC
**Request Reference:** REQ-E02-079 (docs/gen_requests_epic2.md)
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task ID:** 2D.2
**Size:** M (Medium)

---

## 1. Summary

Update all ItemManager components and related child components to use `next-intl` translation hooks, replacing hardcoded English strings with localized translations from the `items` namespace. This enables users to manage their item inventory in their preferred language (English, French, Spanish, German, Dutch, Italian).

---

## 2. Current State Analysis

### 2.1 Component Inventory

The ItemManager component family consists of **40+ components** across multiple directories:

| Category | Component Count | Location |
|----------|----------------|----------|
| Main Component | 1 | `/src/components/ItemManager/ItemManager.tsx` |
| Grid/List Components | 4 | `/src/components/ItemManager/components/` |
| Dialog Components | 6 | `/src/components/ItemManager/components/dialogs/` |
| Shared Components | 11 | `/src/components/ItemManager/components/shared/` |
| Bulk Action Components | 3 | `/src/components/ItemManager/components/BulkActions/` |
| Asset Panel Components | 4 | `/src/components/ItemManager/components/AssetPanel/` |
| Item Preview Components | 5 | `/src/components/ItemManager/components/ItemPreview/` |
| Utility Files | 4 | `/src/components/ItemManager/utils/` |

### 2.2 Hardcoded String Locations

Identified hardcoded strings requiring translation:

1. **ItemManager.tsx** (lines 55-61): Default labels configuration
   - `searchPlaceholder: 'Search items...'`
   - `emptyStateTitle: 'No items yet'`
   - `emptyStateDescription: 'Create your first item to get started'`
   - `deleteConfirmTitle: 'Delete Item'`
   - `deleteConfirmMessage: 'Are you sure you want to delete this item?...'`

2. **ItemToolbar.tsx** (lines 134, 184, 212, 301, etc.):
   - `Clear filters`
   - `{selectedCount} selected`
   - `Select all ({totalCount})`
   - `Room` / `Room ({count})`

3. **FilterPanel.tsx** (lines 89-98): Default labels
   - `title: 'Filters'`
   - `clearAll: 'Clear All'`
   - `contentType: 'Content Type'`
   - `tags: 'Tags'`
   - `location: 'Location'`
   - `property: 'Property'`
   - `applyFilters: 'Apply Filters'`
   - `close: 'Close'`

4. **SortMenu.tsx** (lines 125-128): Default labels
   - `sortLabel: 'Sort'`
   - `sortByLabel: 'Sort by'`

5. **constants.ts** (lines 31-41): Sort option labels
   - `'Title (A-Z)'`, `'Title (Z-A)'`
   - `'Newest First'`, `'Oldest First'`
   - `'Recently Modified'`, `'Least Recently Modified'`
   - `'Location (A-Z)'`
   - `'Most Guides'`, `'Fewest Guides'`

6. **BulkActionsBar.tsx** (lines 182, 186, 197, 203, 214, 220, 230, 254, 266):
   - `{selectedCount} selected`
   - `Currently {selectedCount} item(s) selected`
   - `Processing...`
   - `Delete`, `Add Tag`, `Remove Tag`, `Move to Property`, `Cancel`

7. **ConfirmDeleteDialog.tsx** (lines 62-88, 230, 252, 271):
   - `Delete Item` / `Delete Items`
   - `Are you sure you want to delete...`
   - `and {count} more`
   - `Cancel`, `Delete {count} Items`, `Deleting...`

8. **EmptyState.tsx** (lines 23-24):
   - `No items yet`
   - `Create your first item to get started`

9. **LoadingState.tsx** (lines 116, 138):
   - `Loading items, please wait...`

10. **ItemCard.tsx** (lines 32-57, 218-219, 336-337, etc.):
    - Content type labels: `LINK`, `TEXT`, `PDF`, `MIXED`, `VIDEO`, `PHOTO`, `MEDIA`
    - `Enter title...`, `Add location...`, `Add tags...`
    - `+{count} more`
    - Aria labels with dynamic context

11. **ItemGrid.tsx** (line 38):
    - `{count} item(s)` (aria-label)

12. **SearchInput.tsx** (lines 56, 216):
    - `Search items...`
    - `Clear search`

---

## 3. Implementation Approach

### 3.1 Translation Pattern

Following the established pattern from `LogoutButton.tsx`:

```typescript
// Client components
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('items');
  const tCommon = useTranslations('common');

  return <button>{t('delete.confirm')}</button>;
}
```

### 3.2 Namespace Organization

All ItemManager translations will use the `items` namespace with the following structure:

```json
{
  "items": {
    "manager": {
      "title": "Items",
      "ariaLabel": "Item manager"
    },
    "search": {
      "placeholder": "Search items...",
      "clear": "Clear search"
    },
    "filters": {
      "title": "Filters",
      "clearAll": "Clear All",
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
      "editTags": "Edit tags for {title}"
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
    "toolbar": {
      "ariaLabel": "Item management controls",
      "clearFilters": "Clear all filters"
    },
    "viewMode": {
      "label": "View mode",
      "grid": "Grid view",
      "list": "List view"
    }
  }
}
```

---

## 4. Ordered Task List

### Phase 1: Translation Infrastructure (~2 hours)

| Task | Description | File(s) |
|------|-------------|---------|
| 1.1 | Extend `items` namespace in `/messages/en.json` with all ItemManager strings | `/messages/en.json` |
| 1.2 | Replicate structure to other language files (fr, es, de, nl, it) with English placeholders | `/messages/*.json` |
| 1.3 | Create helper function for pluralized strings | `/src/components/ItemManager/utils/i18nUtils.ts` (new) |

### Phase 2: Core Components (~3 hours)

| Task | Description | File(s) |
|------|-------------|---------|
| 2.1 | Update ItemManager.tsx to use translations for default labels | `ItemManager.tsx` |
| 2.2 | Update ItemToolbar.tsx with translation hooks | `ItemToolbar.tsx` |
| 2.3 | Update SearchInput.tsx placeholder and aria-labels | `SearchInput.tsx` |
| 2.4 | Update constants.ts to export translation keys instead of hardcoded labels | `utils/constants.ts` |

### Phase 3: Filter & Sort Components (~2 hours)

| Task | Description | File(s) |
|------|-------------|---------|
| 3.1 | Update FilterPanel.tsx with translation hooks | `dialogs/FilterPanel.tsx` |
| 3.2 | Update ContentTypeFilter.tsx | `dialogs/ContentTypeFilter.tsx` |
| 3.3 | Update TagFilter.tsx | `dialogs/TagFilter.tsx` |
| 3.4 | Update LocationFilter.tsx | `dialogs/LocationFilter.tsx` |
| 3.5 | Update PropertyFilter.tsx | `dialogs/PropertyFilter.tsx` |
| 3.6 | Update SortMenu.tsx with translation hooks | `dialogs/SortMenu.tsx` |

### Phase 4: Item Display Components (~2 hours)

| Task | Description | File(s) |
|------|-------------|---------|
| 4.1 | Update ItemCard.tsx with content type labels and aria strings | `ItemCard.tsx` |
| 4.2 | Update ItemGrid.tsx aria-label | `ItemGrid.tsx` |
| 4.3 | Update ItemList.tsx | `ItemList.tsx` |
| 4.4 | Update ItemRow.tsx | `ItemRow.tsx` |

### Phase 5: Shared Components (~1.5 hours)

| Task | Description | File(s) |
|------|-------------|---------|
| 5.1 | Update EmptyState.tsx | `shared/EmptyState.tsx` |
| 5.2 | Update LoadingState.tsx | `shared/LoadingState.tsx` |
| 5.3 | Update ViewModeToggle.tsx | `shared/ViewModeToggle.tsx` |
| 5.4 | Update InlineEdit.tsx placeholder strings | `shared/InlineEdit.tsx` |
| 5.5 | Update TagsInlineEdit.tsx | `shared/TagsInlineEdit.tsx` |
| 5.6 | Update TagChip.tsx (if any labels) | `shared/TagChip.tsx` |

### Phase 6: Bulk Actions Components (~1.5 hours)

| Task | Description | File(s) |
|------|-------------|---------|
| 6.1 | Update BulkActionsBar.tsx with all action labels | `BulkActions/BulkActionsBar.tsx` |
| 6.2 | Update BulkTagDialog.tsx | `BulkActions/BulkTagDialog.tsx` |
| 6.3 | Update BulkMoveDialog.tsx | `BulkActions/BulkMoveDialog.tsx` |

### Phase 7: Dialog Components (~1.5 hours)

| Task | Description | File(s) |
|------|-------------|---------|
| 7.1 | Update ConfirmDeleteDialog.tsx with all messages | `dialogs/ConfirmDeleteDialog.tsx` |
| 7.2 | Update ColumnSettingsPopup.tsx | `dialogs/ColumnSettingsPopup.tsx` |

### Phase 8: Asset Panel Components (~1 hour)

| Task | Description | File(s) |
|------|-------------|---------|
| 8.1 | Update AssetPanel.tsx | `AssetPanel/AssetPanel.tsx` |
| 8.2 | Update AssetDropZone.tsx | `AssetPanel/AssetDropZone.tsx` |
| 8.3 | Update AssetRemoveConfirmDialog.tsx | `AssetPanel/AssetRemoveConfirmDialog.tsx` |
| 8.4 | Update SortableAssetList.tsx | `AssetPanel/SortableAssetList.tsx` |

### Phase 9: Item Preview Components (~1 hour)

| Task | Description | File(s) |
|------|-------------|---------|
| 9.1 | Update ItemPreviewModal.tsx | `ItemPreview/ItemPreviewModal.tsx` |
| 9.2 | Update MediaGallery.tsx | `ItemPreview/MediaGallery.tsx` |
| 9.3 | Update AnalyticsSection.tsx | `ItemPreview/AnalyticsSection.tsx` |
| 9.4 | Update InstructionsViewer.tsx | `ItemPreview/InstructionsViewer.tsx` |
| 9.5 | Update VideoPlayer.tsx | `ItemPreview/VideoPlayer.tsx` |

### Phase 10: Translations & Verification (~2 hours)

| Task | Description | File(s) |
|------|-------------|---------|
| 10.1 | Generate French translations for `items` namespace | `/messages/fr.json` |
| 10.2 | Generate Spanish translations for `items` namespace | `/messages/es.json` |
| 10.3 | Generate German translations for `items` namespace | `/messages/de.json` |
| 10.4 | Generate Dutch translations for `items` namespace | `/messages/nl.json` |
| 10.5 | Generate Italian translations for `items` namespace | `/messages/it.json` |
| 10.6 | Verify all components render correctly in each language | - |
| 10.7 | Test language switching without page reload | - |

---

## 5. Authorized Files and Functions for Modification

### 5.1 Translation Files

| File | Modification Type |
|------|------------------|
| `/messages/en.json` | EXTEND - Add `items` namespace with ~80 new keys |
| `/messages/fr.json` | EXTEND - Add translated `items` namespace |
| `/messages/es.json` | EXTEND - Add translated `items` namespace |
| `/messages/de.json` | EXTEND - Add translated `items` namespace |
| `/messages/nl.json` | EXTEND - Add translated `items` namespace |
| `/messages/it.json` | EXTEND - Add translated `items` namespace |

### 5.2 New Files

| File | Purpose |
|------|---------|
| `/src/components/ItemManager/utils/i18nUtils.ts` | Helper functions for ItemManager i18n |

### 5.3 Core Components

| File | Functions to Modify |
|------|---------------------|
| `ItemManager.tsx` | Add `useTranslations`, update `DEFAULT_CONFIG.labels`, update aria-labels |
| `ItemToolbar.tsx` | Add `useTranslations`, update `ViewToggle`, `ClearFiltersButton`, `SelectionIndicator`, `RoomFilterDropdown` |
| `SearchInput.tsx` | Add `useTranslations`, update placeholder and aria-label |

### 5.4 Dialog Components

| File | Functions to Modify |
|------|---------------------|
| `dialogs/FilterPanel.tsx` | Add `useTranslations`, update `DEFAULT_LABELS`, `renderHeader`, `renderFilters` |
| `dialogs/SortMenu.tsx` | Add `useTranslations`, update `mergedLabels`, label rendering |
| `dialogs/ConfirmDeleteDialog.tsx` | Add `useTranslations`, update `getDeleteTitle`, `getDeleteMessage`, `getConfirmButtonText`, button labels |
| `dialogs/ContentTypeFilter.tsx` | Add `useTranslations` for filter labels |
| `dialogs/TagFilter.tsx` | Add `useTranslations` for filter labels |
| `dialogs/LocationFilter.tsx` | Add `useTranslations` for filter labels |
| `dialogs/PropertyFilter.tsx` | Add `useTranslations` for filter labels |
| `dialogs/ColumnSettingsPopup.tsx` | Add `useTranslations` for column labels |

### 5.5 Shared Components

| File | Functions to Modify |
|------|---------------------|
| `shared/EmptyState.tsx` | Add `useTranslations`, update `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION` |
| `shared/LoadingState.tsx` | Add `useTranslations`, update sr-only text and aria-label |
| `shared/ViewModeToggle.tsx` | Add `useTranslations`, update aria-labels |
| `shared/InlineEdit.tsx` | Add `useTranslations` for placeholder if needed |
| `shared/TagsInlineEdit.tsx` | Add `useTranslations` for placeholder |

### 5.6 Bulk Action Components

| File | Functions to Modify |
|------|---------------------|
| `BulkActions/BulkActionsBar.tsx` | Add `useTranslations`, update `ActionButton` labels, selection count, processing text |
| `BulkActions/BulkTagDialog.tsx` | Add `useTranslations`, update dialog content |
| `BulkActions/BulkMoveDialog.tsx` | Add `useTranslations`, update dialog content |

### 5.7 Item Display Components

| File | Functions to Modify |
|------|---------------------|
| `ItemCard.tsx` | Add `useTranslations`, update `getContentTypeBadge`, inline edit placeholders, aria-labels |
| `ItemGrid.tsx` | Add `useTranslations`, update aria-label |
| `ItemList.tsx` | Add `useTranslations`, update column headers and labels |
| `ItemRow.tsx` | Add `useTranslations`, update labels and tooltips |

### 5.8 Asset Panel Components

| File | Functions to Modify |
|------|---------------------|
| `AssetPanel/AssetPanel.tsx` | Add `useTranslations`, update section headers |
| `AssetPanel/AssetDropZone.tsx` | Add `useTranslations`, update drop zone text |
| `AssetPanel/AssetRemoveConfirmDialog.tsx` | Add `useTranslations`, update confirmation messages |
| `AssetPanel/SortableAssetList.tsx` | Add `useTranslations`, update labels |

### 5.9 Item Preview Components

| File | Functions to Modify |
|------|---------------------|
| `ItemPreview/ItemPreviewModal.tsx` | Add `useTranslations`, update modal labels |
| `ItemPreview/MediaGallery.tsx` | Add `useTranslations`, update gallery labels |
| `ItemPreview/AnalyticsSection.tsx` | Add `useTranslations`, update metric labels |
| `ItemPreview/InstructionsViewer.tsx` | Add `useTranslations`, update viewer labels |
| `ItemPreview/VideoPlayer.tsx` | Add `useTranslations`, update player controls |

### 5.10 Utility Files

| File | Functions to Modify |
|------|---------------------|
| `utils/constants.ts` | Update `SORT_OPTIONS` to use translation keys |

---

## 6. Dependencies

### 6.1 Required from Epic 1

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl package | ✅ Installed | `package.json` |
| IntlProvider wrapper | ✅ Configured | `/src/app/layout.tsx` |
| Translation files | ✅ Created | `/messages/*.json` |
| useTranslations hook | ✅ Available | `next-intl` |

### 6.2 Internal Dependencies

| Task | Depends On |
|------|------------|
| All Phase 2-9 tasks | Phase 1 (translation file setup) |
| Phase 10 (verification) | All prior phases |

---

## 7. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Namespace | `items` | Follows Epic 2 namespace convention for feature areas |
| Pluralization | ICU format | Industry standard, native next-intl support |
| Dynamic labels | Pass translation key, not translated string | Allows components to handle translations internally |
| Default labels | Fallback to translation key | Prevents blank UI if translation missing |
| Aria labels | Translate with context variables | Maintains accessibility across languages |

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Text length variations break layouts | Medium | Low | Design components to handle 40% text expansion |
| Missing translations at runtime | Low | Medium | Use English fallback, console warning in dev |
| Performance impact from many hooks | Low | Low | React memoization handles re-renders |
| Inconsistent key naming | Medium | Medium | Follow established naming convention strictly |

---

## 9. Acceptance Criteria Mapping

| Requirement | Implementation Task |
|-------------|---------------------|
| ItemManager root component uses translation hooks | Task 2.1 |
| Item list headers display translated text | Tasks 2.2, 4.1-4.4 |
| Sort controls display in selected language | Tasks 2.4, 3.6 |
| Search placeholder is translated | Task 2.3 |
| Filter controls display translated labels | Tasks 3.1-3.5 |
| Action buttons show translated labels | Tasks 6.1-6.3 |
| Bulk action controls translated | Tasks 6.1-6.3 |
| Status indicators translated | Task 4.1 (content type badges) |
| Empty state messages translated | Task 5.1 |
| Loading state messages translated | Task 5.2 |
| Confirmation dialogs translated | Task 7.1 |
| Toast notifications translated | Part of existing toast system |
| Item count uses locale formatting | Task 2.1 (use ICU pluralization) |
| Date/time uses locale formatting | Handled by next-intl DateTimeFormat |
| Pagination controls translated | Existing pagination components |
| Error messages translated | Uses `errors` namespace from Epic 1 |
| All hardcoded strings removed | All tasks |
| Language switching works without reload | Native next-intl behavior |
| Accessibility labels reflect language | All tasks with aria-labels |
| Component handles text length variations | CSS design consideration |

---

## 10. Estimated Effort

| Phase | Duration | Confidence |
|-------|----------|------------|
| Phase 1: Translation Infrastructure | 2 hours | High |
| Phase 2: Core Components | 3 hours | High |
| Phase 3: Filter & Sort | 2 hours | High |
| Phase 4: Item Display | 2 hours | High |
| Phase 5: Shared Components | 1.5 hours | High |
| Phase 6: Bulk Actions | 1.5 hours | High |
| Phase 7: Dialogs | 1.5 hours | High |
| Phase 8: Asset Panel | 1 hour | High |
| Phase 9: Item Preview | 1 hour | High |
| Phase 10: Translations & Verification | 2 hours | Medium |
| **Total** | **17.5 hours** | Medium |

---

## 11. Files Summary

### New Files (1)
- `/src/components/ItemManager/utils/i18nUtils.ts`

### Modified Files (40+)
- `/messages/en.json` (extend)
- `/messages/fr.json` (extend)
- `/messages/es.json` (extend)
- `/messages/de.json` (extend)
- `/messages/nl.json` (extend)
- `/messages/it.json` (extend)
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

## 12. References

- [Request REQ-E02-079](/docs/gen_requests_epic2.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Existing i18n Pattern Example](/src/components/LogoutButton.tsx)

---

*Implementation breakdown generated for FAQBNB L10N Epic 2, Sub-Epic 2D, Task 2D.2*
