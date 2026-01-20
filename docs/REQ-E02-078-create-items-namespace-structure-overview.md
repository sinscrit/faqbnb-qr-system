# Implementation Overview: REQ-E02-078 - Create Items Namespace Structure in Messages File

**Document Created:** 2026-01-20 15:30:00 UTC
**Last Modified:** 2026-01-20 15:30:00 UTC

**Request ID:** REQ-E02-078
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task ID:** 2D.1
**Size:** S (Small)
**Priority:** P1

---

## 1. Summary

Create a comprehensive and well-organized `items` namespace structure within the localization messages files (`/messages/*.json`) containing all UI strings related to item management functionality. This namespace will serve as the foundation for internationalizing the ItemManager component family, enabling property owners to manage their QR code items in their native language (English, Spanish, French, German, Dutch, Italian).

The items namespace must include categorized subcategories for list views, detail views, edit forms, filters and search, bulk actions, confirmation dialogs, validation messages, empty states, and content type labels. This task establishes the translation key structure that subsequent tasks (2D.2-2D.7) will use when updating components to use the `useTranslations` hook.

---

## 2. Current State Analysis

### 2.1 Existing Items Namespace

The `/messages/en.json` file already contains a basic `items` namespace with 26 keys:

```json
{
  "items": {
    "createNew": "New QR Code Item",
    "noItems": "No items yet",
    "name": "Item Name",
    "description": "Description",
    "property": "Property",
    "qrCode": "QR Code",
    "articles": "Articles",
    "addArticle": "Add Article",
    "editItem": "Edit Item",
    "deleteItem": "Delete Item",
    "viewItem": "View Item",
    "printQrCode": "Print QR Code",
    "downloadQrCode": "Download QR Code",
    "scanCount": "Scan Count",
    "lastScanned": "Last Scanned",
    "createdAt": "Created At",
    "updatedAt": "Updated At",
    "selectProperty": "Select Property",
    "itemDetails": "Item Details",
    "noArticles": "No articles yet",
    "addFirstArticle": "Add your first article",
    "room": "Room",
    "tags": "Tags",
    "addTag": "Add Tag",
    "removeTag": "Remove Tag"
  }
}
```

### 2.2 ItemManager Component Inventory

The ItemManager component family contains 40+ production files (excluding tests) with hardcoded strings:

| Component Category | Files | Estimated Strings |
|-------------------|-------|-------------------|
| Main Components | ItemManager.tsx, ItemCard.tsx, ItemRow.tsx, ItemGrid.tsx, ItemList.tsx | ~80 |
| Filter Components | FilterPanel.tsx, ContentTypeFilter.tsx, TagFilter.tsx, LocationFilter.tsx, PropertyFilter.tsx | ~60 |
| Sort Components | SortMenu.tsx | ~20 |
| Bulk Action Components | BulkActionsBar.tsx, BulkTagDialog.tsx, BulkMoveDialog.tsx | ~50 |
| Dialog Components | ConfirmDeleteDialog.tsx, ColumnSettingsPopup.tsx | ~30 |
| Shared Components | EmptyState.tsx, LoadingState.tsx, InlineEdit.tsx, TagsInlineEdit.tsx, TagChip.tsx, ViewModeToggle.tsx | ~40 |
| Search Components | SearchInput.tsx | ~10 |
| Preview Components | ItemPreviewModal.tsx, MediaGallery.tsx, AnalyticsSection.tsx | ~40 |
| Asset Components | AssetPanel.tsx, AssetDropZone.tsx, AssetItem.tsx, SortableAssetList.tsx, AssetRemoveConfirmDialog.tsx | ~30 |
| **Total** | **40+ files** | **~360 strings** |

### 2.3 Hardcoded Strings Identified in Key Components

#### ItemManager.tsx (Lines 55-61)
```typescript
labels: {
  searchPlaceholder: 'Search items...',
  emptyStateTitle: 'No items yet',
  emptyStateDescription: 'Create your first item to get started',
  deleteConfirmTitle: 'Delete Item',
  deleteConfirmMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
}
```

#### FilterPanel.tsx (Lines 89-98)
```typescript
const DEFAULT_LABELS: Required<FilterPanelLabels> = {
  title: 'Filters',
  clearAll: 'Clear All',
  contentType: 'Content Type',
  tags: 'Tags',
  location: 'Location',
  property: 'Property',
  applyFilters: 'Apply Filters',
  close: 'Close',
};
```

#### SortMenu.tsx (Lines 124-128)
```typescript
const mergedLabels = {
  sortLabel: 'Sort',
  sortByLabel: 'Sort by',
  ...labels,
};
```

#### ConfirmDeleteDialog.tsx (Lines 59-88)
```typescript
'Delete Item' / 'Delete Items'
'Are you sure you want to delete this item? This action cannot be undone.'
'Are you sure you want to delete these ${count} items? This action cannot be undone.'
'Delete' / 'Delete ${count} Items'
'Deleting...'
'and {overflowCount} more'
'Cancel'
```

#### BulkActionsBar.tsx (Lines 181-268)
```typescript
'{selectedCount} selected'
'Currently {selectedCount} item{s} selected'
'Processing...'
'Delete'
'Add Tag'
'Remove Tag'
'Move to Property'
'Cancel selection'
```

#### EmptyState.tsx (Lines 24-25)
```typescript
const DEFAULT_TITLE = 'No items yet';
const DEFAULT_DESCRIPTION = 'Create your first item to get started';
```

#### SearchInput.tsx (Line 57)
```typescript
placeholder = 'Search items...'
```

#### ItemCard.tsx (Lines 31-57) - Content type labels
```typescript
{ label: 'LINK', ... }
{ label: 'TEXT', ... }
{ label: 'PDF', ... }
{ label: 'MIXED', ... }
{ label: 'VIDEO', ... }
{ label: 'PHOTO', ... }
{ label: 'MEDIA', ... }
```

### 2.4 Translation Key Convention

Per the Implementation Plan, the translation key convention is:
```
{namespace}.{component/area}.{element}.{variant?}
```

Examples:
- `items.list.empty.title`
- `items.card.contentType.video`
- `items.filters.contentType`
- `items.bulk.selected`
- `items.delete.title`

---

## 3. Technical Approach

### 3.1 Namespace Structure Design

The expanded `items` namespace should be organized into logical subcategories matching the component structure:

```json
{
  "items": {
    "title": "Items",
    "subtitle": "Manage your QR code items",

    "list": { ... },      // List view strings (empty state, no results)
    "card": { ... },      // Card component strings (badges, labels)
    "actions": { ... },   // Action buttons (create, edit, delete, etc.)
    "filters": { ... },   // Filter panel strings
    "sort": { ... },      // Sort menu strings
    "search": { ... },    // Search input strings
    "bulk": { ... },      // Bulk action strings
    "delete": { ... },    // Delete confirmation strings
    "detail": { ... },    // Item detail view strings
    "preview": { ... },   // Preview modal strings
    "assets": { ... },    // Asset management strings
    "inline": { ... },    // Inline edit strings
    "analytics": { ... }, // Analytics display strings
    "validation": { ... } // Validation messages
  }
}
```

### 3.2 Key Naming Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| `items.list.*` | List/grid view UI | `items.list.empty.title` |
| `items.card.*` | Individual card UI | `items.card.contentType.video` |
| `items.actions.*` | Action buttons | `items.actions.create` |
| `items.filters.*` | Filter panel | `items.filters.title` |
| `items.sort.*` | Sort menu | `items.sort.newest` |
| `items.bulk.*` | Bulk operations | `items.bulk.selected` |
| `items.delete.*` | Delete dialogs | `items.delete.title` |
| `items.preview.*` | Preview modal | `items.preview.title` |

### 3.3 ICU Format for Pluralization

Per the Implementation Plan, pluralization uses ICU format:

```json
{
  "items.bulk.selected": "{count, plural, =0 {No items selected} one {# item selected} other {# items selected}}",
  "items.card.views": "{count, plural, one {# view} other {# views}}",
  "items.card.pieces": "{count, plural, one {# piece} other {# pieces}} of content"
}
```

### 3.4 Variable Interpolation

Dynamic values use curly brace interpolation:

```json
{
  "items.delete.message.single": "Are you sure you want to delete \"{itemName}\"? This action cannot be undone.",
  "items.delete.overflow": "and {count} more"
}
```

---

## 4. Implementation Tasks

### Task 1: Define Complete Namespace Structure in en.json

Expand the existing `items` namespace in `/messages/en.json` with all required keys organized by subcategory. The structure should include approximately 150-200 translation keys covering all ItemManager functionality.

### Task 2: Add List View Strings

```json
{
  "items": {
    "list": {
      "empty": {
        "title": "No items yet",
        "description": "Create your first QR code item to get started",
        "action": "Create Item"
      },
      "noResults": {
        "title": "No matching items",
        "description": "Try adjusting your search or filters"
      },
      "loading": "Loading items..."
    }
  }
}
```

### Task 3: Add Card Component Strings

```json
{
  "items": {
    "card": {
      "contentType": {
        "link": "LINK",
        "text": "TEXT",
        "pdf": "PDF",
        "mixed": "MIXED",
        "video": "VIDEO",
        "photo": "PHOTO",
        "media": "MEDIA"
      },
      "views": "{count, plural, one {# view} other {# views}}",
      "pieces": "{count, plural, one {# piece} other {# pieces}} of content",
      "noContent": "No content yet",
      "more": "+{count} more",
      "select": "Select {title}",
      "thumbnail": "{title} thumbnail"
    }
  }
}
```

### Task 4: Add Action Strings

```json
{
  "items": {
    "actions": {
      "create": "New Item",
      "createQR": "New QR Code Item",
      "edit": "Edit",
      "delete": "Delete",
      "duplicate": "Duplicate",
      "viewQR": "View QR Code",
      "print": "Print",
      "printQR": "Print QR Code",
      "downloadQR": "Download QR Code",
      "share": "Share",
      "manageAssets": "Manage Assets"
    }
  }
}
```

### Task 5: Add Filter Strings

```json
{
  "items": {
    "filters": {
      "title": "Filters",
      "clearAll": "Clear All",
      "applyFilters": "Apply Filters",
      "close": "Close",
      "sections": {
        "contentType": "Content Type",
        "tags": "Tags",
        "location": "Location",
        "property": "Property"
      },
      "contentTypes": {
        "all": "All Types",
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF",
        "text": "Text",
        "link": "Link",
        "mixed": "Mixed"
      },
      "tags": {
        "placeholder": "Select tags...",
        "noTags": "No tags available",
        "selected": "{count} selected"
      },
      "location": {
        "placeholder": "Select location...",
        "all": "All Locations"
      },
      "property": {
        "placeholder": "Select properties...",
        "all": "All Properties"
      }
    }
  }
}
```

### Task 6: Add Sort Strings

```json
{
  "items": {
    "sort": {
      "label": "Sort",
      "sortBy": "Sort by",
      "options": {
        "newest": "Newest First",
        "oldest": "Oldest First",
        "nameAZ": "Name (A-Z)",
        "nameZA": "Name (Z-A)",
        "mostViewed": "Most Viewed",
        "recentlyViewed": "Recently Viewed"
      }
    }
  }
}
```

### Task 7: Add Search Strings

```json
{
  "items": {
    "search": {
      "placeholder": "Search items...",
      "clear": "Clear search",
      "results": "{count, plural, =0 {No results} one {# result} other {# results}}",
      "showing": "Showing {start} to {end} of {total}"
    }
  }
}
```

### Task 8: Add Bulk Action Strings

```json
{
  "items": {
    "bulk": {
      "selected": "{count, plural, one {# selected} other {# selected}}",
      "selectedAria": "{count, plural, one {Currently # item selected} other {Currently # items selected}}",
      "processing": "Processing...",
      "actions": {
        "delete": "Delete",
        "addTag": "Add Tag",
        "removeTag": "Remove Tag",
        "moveToProperty": "Move to Property"
      },
      "cancel": "Cancel",
      "cancelSelection": "Cancel selection",
      "selectAll": "Select All",
      "deselectAll": "Deselect All"
    },
    "bulkTag": {
      "addTitle": "Add Tags to Items",
      "removeTitle": "Remove Tags from Items",
      "addDescription": "Select tags to add to {count} selected {count, plural, one {item} other {items}}",
      "removeDescription": "Select tags to remove from {count} selected {count, plural, one {item} other {items}}",
      "selectTags": "Select tags",
      "noTagsAvailable": "No tags available",
      "confirm": "Confirm",
      "cancel": "Cancel"
    },
    "bulkMove": {
      "title": "Move Items to Property",
      "description": "Select a property to move {count} selected {count, plural, one {item} other {items}} to",
      "selectProperty": "Select property",
      "confirm": "Move Items",
      "cancel": "Cancel"
    }
  }
}
```

### Task 9: Add Delete Dialog Strings

```json
{
  "items": {
    "delete": {
      "title": "Delete Item",
      "titlePlural": "Delete Items",
      "message": {
        "single": "Are you sure you want to delete this item? This action cannot be undone.",
        "plural": "Are you sure you want to delete these {count} items? This action cannot be undone.",
        "named": "Are you sure you want to delete \"{itemName}\"? This action cannot be undone."
      },
      "confirm": "Delete",
      "confirmPlural": "Delete {count} Items",
      "cancel": "Cancel",
      "deleting": "Deleting...",
      "overflow": "and {count} more",
      "itemsToDelete": "Items to be deleted"
    }
  }
}
```

### Task 10: Add Preview/Detail Strings

```json
{
  "items": {
    "detail": {
      "title": "Item Details",
      "tabs": {
        "content": "Content",
        "qrCode": "QR Code",
        "analytics": "Analytics",
        "settings": "Settings"
      }
    },
    "preview": {
      "title": "Item Preview",
      "close": "Close preview",
      "edit": "Edit Item",
      "mediaGallery": "Media Gallery",
      "noMedia": "No media available"
    }
  }
}
```

### Task 11: Add Asset Management Strings

```json
{
  "items": {
    "assets": {
      "title": "Manage Assets",
      "panel": {
        "title": "Assets",
        "close": "Close"
      },
      "dropzone": {
        "title": "Upload files",
        "description": "Drag and drop files here, or click to select",
        "or": "or",
        "browse": "Browse files",
        "supportedFormats": "Supported: {formats}",
        "maxSize": "Max file size: {size}MB"
      },
      "item": {
        "remove": "Remove",
        "reorder": "Drag to reorder"
      },
      "removeConfirm": {
        "title": "Remove Asset",
        "message": "Are you sure you want to remove this asset?",
        "confirm": "Remove",
        "cancel": "Cancel"
      }
    }
  }
}
```

### Task 12: Add Inline Edit Strings

```json
{
  "items": {
    "inline": {
      "title": {
        "placeholder": "Enter title...",
        "ariaLabel": "Edit title for {itemName}"
      },
      "location": {
        "placeholder": "Add location...",
        "ariaLabel": "Edit location for {itemName}"
      },
      "tags": {
        "placeholder": "Add tags...",
        "ariaLabel": "Edit tags for {itemName}"
      },
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Click to edit"
    }
  }
}
```

### Task 13: Add Analytics Strings

```json
{
  "items": {
    "analytics": {
      "title": "Analytics",
      "views": "{count, plural, one {# view} other {# views}}",
      "allTime": "All time",
      "thisWeek": "This week",
      "thisMonth": "This month",
      "reactions": "Reactions",
      "engagement": "Engagement",
      "noData": "No analytics data yet"
    }
  }
}
```

### Task 14: Add View Mode Strings

```json
{
  "items": {
    "view": {
      "grid": "Grid view",
      "list": "List view",
      "toggle": "Toggle view mode"
    }
  }
}
```

### Task 15: Add Validation Strings

```json
{
  "items": {
    "validation": {
      "nameRequired": "Item name is required",
      "nameTooLong": "Item name must be less than {max} characters",
      "duplicateName": "An item with this name already exists"
    }
  }
}
```

### Task 16: Copy Structure to Other Language Files

After completing the English namespace structure, copy the same key structure to all other language files (fr.json, es.json, de.json, nl.json, it.json) with placeholder English values. These will be translated in Task 2D.7.

### Task 17: Verify Namespace Completeness

- Verify all keys from DEFAULT_CONFIG.labels in ItemManager.tsx are covered
- Verify all keys from FilterPanel DEFAULT_LABELS are covered
- Verify all keys from SortMenu are covered
- Verify all helper function strings in ConfirmDeleteDialog are covered
- Verify all BulkActionsBar strings are covered
- Verify all component hardcoded strings are covered
- Cross-reference with component inventory to ensure no gaps

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Modify

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/messages/en.json` | English translations (source) | Expand items namespace |
| `/messages/fr.json` | French translations | Add items namespace keys (English placeholders) |
| `/messages/es.json` | Spanish translations | Add items namespace keys (English placeholders) |
| `/messages/de.json` | German translations | Add items namespace keys (English placeholders) |
| `/messages/nl.json` | Dutch translations | Add items namespace keys (English placeholders) |
| `/messages/it.json` | Italian translations | Add items namespace keys (English placeholders) |

### 5.2 Sections to Modify in en.json

| Section | Current Keys | Target Keys | Action |
|---------|-------------|-------------|--------|
| `items` | 26 keys (flat) | ~150 keys (nested) | Replace flat structure with nested |
| `items.list` | N/A | ~8 keys | Add new section |
| `items.card` | N/A | ~15 keys | Add new section |
| `items.actions` | 4 keys scattered | ~12 keys grouped | Consolidate and add |
| `items.filters` | N/A | ~30 keys | Add new section |
| `items.sort` | N/A | ~10 keys | Add new section |
| `items.search` | N/A | ~5 keys | Add new section |
| `items.bulk` | N/A | ~20 keys | Add new section |
| `items.bulkTag` | N/A | ~8 keys | Add new section |
| `items.bulkMove` | N/A | ~6 keys | Add new section |
| `items.delete` | N/A | ~12 keys | Add new section |
| `items.detail` | N/A | ~6 keys | Add new section |
| `items.preview` | N/A | ~6 keys | Add new section |
| `items.assets` | N/A | ~15 keys | Add new section |
| `items.inline` | N/A | ~10 keys | Add new section |
| `items.analytics` | N/A | ~8 keys | Add new section |
| `items.view` | N/A | ~3 keys | Add new section |
| `items.validation` | N/A | ~4 keys | Add new section |

### 5.3 Files to Read (Reference Only)

| File | Purpose |
|------|---------|
| `/src/components/ItemManager/ItemManager.tsx` | Identify DEFAULT_CONFIG.labels |
| `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Identify DEFAULT_LABELS |
| `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | Identify sort labels |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Identify delete strings |
| `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Identify bulk action strings |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Identify tag dialog strings |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Identify move dialog strings |
| `/src/components/ItemManager/components/shared/EmptyState.tsx` | Identify empty state strings |
| `/src/components/ItemManager/components/shared/LoadingState.tsx` | Identify loading strings |
| `/src/components/ItemManager/components/SearchInput.tsx` | Identify search strings |
| `/src/components/ItemManager/components/ItemCard.tsx` | Identify card strings |
| `/src/components/ItemManager/components/AssetPanel/*.tsx` | Identify asset strings |

### 5.4 Files NOT to Modify

- TypeScript component source files (that's Task 2D.2-2D.6)
- Database migrations
- API routes
- Build configuration
- Test files

---

## 6. Dependencies

### 6.1 Required Before This Task

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1: i18n Foundation | Complete | next-intl installed, Provider configured |
| Messages folder structure | Complete | `/messages/*.json` files exist |
| Basic namespace structure | Complete | `common`, `auth`, `dashboard` namespaces exist |

### 6.2 This Task Enables

| Task | Purpose |
|------|---------|
| Task 2D.2: Update ItemManager component family | Uses `items` namespace translations |
| Task 2D.3: Update ItemGrid and ItemCard | Uses `items.card` translations |
| Task 2D.4: Update filter and sort components | Uses `items.filters` and `items.sort` translations |
| Task 2D.5: Update bulk action dialogs | Uses `items.bulk` translations |
| Task 2D.6: Update item detail/edit pages | Uses `items.detail` translations |
| Task 2D.7: Generate translations | Translates keys to other languages |

---

## 7. Acceptance Criteria

### 7.1 Structure Criteria

- [ ] Items namespace in en.json contains organized subcategories (list, card, actions, filters, sort, search, bulk, delete, detail, preview, assets, inline, analytics, view, validation)
- [ ] All translation keys follow the naming convention `items.{category}.{element}.{variant?}`
- [ ] Keys are grouped logically by feature area
- [ ] No duplicate keys exist within the namespace

### 7.2 Coverage Criteria

- [ ] All strings from ItemManager.DEFAULT_CONFIG.labels are covered
- [ ] All strings from FilterPanel.DEFAULT_LABELS are covered
- [ ] All strings from SortMenu are covered
- [ ] All strings from ConfirmDeleteDialog helper functions are covered
- [ ] All strings from BulkActionsBar are covered
- [ ] All strings from EmptyState and LoadingState are covered
- [ ] All content type badge labels from ItemCard are covered
- [ ] All search-related strings are covered
- [ ] All asset management strings are covered

### 7.3 Format Criteria

- [ ] Pluralization uses ICU format (`{count, plural, one {#} other {#}}`)
- [ ] Variable interpolation uses curly braces (`{variableName}`)
- [ ] No hardcoded values where variables should be used
- [ ] Consistent capitalization (sentence case for descriptions, title case for labels)

### 7.4 Cross-Language Criteria

- [ ] Same key structure exists in all 6 language files
- [ ] No missing keys in any language file
- [ ] Non-English files contain placeholder English text (actual translation is Task 2D.7)

### 7.5 Technical Criteria

- [ ] JSON is valid in all files (no syntax errors)
- [ ] No merge conflicts with existing keys
- [ ] Existing items keys are preserved or migrated (no breaking changes to existing functionality)

---

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing strings discovered later | Medium | Low | Design with extensibility, add keys as needed |
| Key naming inconsistencies | Medium | Medium | Follow established convention strictly |
| Breaking existing items namespace usage | Low | High | Preserve existing key paths or provide migration |
| JSON syntax errors | Low | Medium | Validate JSON before committing |
| Large file size | Low | Low | JSON is efficient, structure aids code-splitting |

---

## 9. Estimated Effort

| Task | Estimate |
|------|----------|
| Analyze ItemManager components for string inventory | 30 minutes |
| Design namespace structure | 20 minutes |
| Implement en.json expansion | 45 minutes |
| Copy structure to other language files | 15 minutes |
| Verify completeness and fix gaps | 20 minutes |
| JSON validation | 10 minutes |
| **Total** | **~2.5 hours** |

---

## 10. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2D: Item Management
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-078
- [ItemManager Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2D - Item Management*
