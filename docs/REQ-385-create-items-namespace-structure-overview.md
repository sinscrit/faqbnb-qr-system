# REQ-385: Create Items Namespace Structure in Translation Files - Implementation Overview
*Generated: 2026-01-19 00:00:00 UTC*
*Last Modified: 2026-01-19 00:00:00 UTC*

## Reference
- **Request**: REQ-385 (Create Items Namespace Structure)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature (Namespace Setup)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2D - Item Management
- **Task ID**: 2D.1
- **Size**: S
- **Priority**: Seventh (after Common, Errors, Auth, Dashboard, Settings, Properties)

## Goals
1. Create a comprehensive `items` namespace in all 6 translation files (`/messages/*.json`)
2. Organize keys into logical sub-categories covering all item management UI operations
3. Support the estimated ~400 strings across 40+ ItemManager components
4. Follow the established translation key convention: `{namespace}.{component/area}.{element}.{variant?}`
5. Provide a scalable foundation for subsequent item component translations (Tasks 2D.2-2D.7)

## Context from Implementation Plan

### Sub-Epic 2D Scope (Per Plan-111)
Sub-Epic 2D focuses on Item Management components including:
- **Estimated Strings**: ~400
- **Priority**: Seventh in recommended order (after foundation and core navigation)
- **Components**: ItemManager family, ItemGrid, ItemCard, FilterPanel, SortMenu, BulkActions, Item pages

### Current State Analysis

The current `/messages/en.json` has a basic flat `items` namespace:
```json
{
  "items": {
    "createNew": "New QR Code Item",
    "noItems": "No items yet",
    "name": "Item Name",
    "description": "Description",
    // ... ~25 flat keys
  }
}
```

### Target State (Per Plan-111 Specification)

The `items` namespace needs to be expanded with nested sub-categories:
```json
{
  "items": {
    "title": "Items",
    "subtitle": "Manage your QR code items",
    "list": { ... },      // Empty states, no results
    "card": { ... },      // Item card display strings
    "actions": { ... },   // Create, edit, delete, etc.
    "filters": { ... },   // Filter panel labels
    "sort": { ... },      // Sort menu options
    "bulk": { ... },      // Bulk actions bar strings
    "detail": { ... },    // Item detail view
    "delete": { ... }     // Delete confirmation dialog
  }
}
```

### Dependencies
- **Prerequisite**: Epic 1 complete (next-intl installed and configured) - VERIFIED
- **Prerequisite**: Common namespace (Task 2H.1) should ideally be complete for shared strings
- **Verified**: `/src/lib/i18n/config.ts` exists with locale configuration
- **Verified**: `/messages/en.json` exists with basic items namespace
- **This Task**: Creates namespace structure foundation for subsequent component updates

## Codebase Analysis

### ItemManager Component Family (40+ files)

#### Main Components
| Component | Location | Hardcoded Strings Found |
|-----------|----------|------------------------|
| ItemManager.tsx | `/src/components/ItemManager/ItemManager.tsx` | ~15 (labels, empty states, error messages) |
| ItemGrid.tsx | `.../components/ItemGrid.tsx` | ~5 (aria labels) |
| ItemCard.tsx | `.../components/ItemCard.tsx` | ~10 (tooltips, status labels) |
| ItemList.tsx | `.../components/ItemList.tsx` | ~8 (column headers, actions) |
| ItemRow.tsx | `.../components/ItemRow.tsx` | ~8 (actions, tooltips) |
| ItemToolbar.tsx | `.../components/ItemToolbar.tsx` | ~12 (search placeholder, labels) |

#### Dialog Components
| Component | Location | Hardcoded Strings Found |
|-----------|----------|------------------------|
| FilterPanel.tsx | `.../dialogs/FilterPanel.tsx` | ~12 (labels: Filters, Clear All, etc.) |
| SortMenu.tsx | `.../dialogs/SortMenu.tsx` | ~8 (Sort by, sort options) |
| ConfirmDeleteDialog.tsx | `.../dialogs/ConfirmDeleteDialog.tsx` | ~10 (titles, messages) |
| PropertyFilter.tsx | `.../dialogs/PropertyFilter.tsx` | ~5 (labels) |
| TagFilter.tsx | `.../dialogs/TagFilter.tsx` | ~5 (labels) |
| LocationFilter.tsx | `.../dialogs/LocationFilter.tsx` | ~5 (labels) |
| ContentTypeFilter.tsx | `.../dialogs/ContentTypeFilter.tsx` | ~5 (labels) |
| ColumnSettingsPopup.tsx | `.../dialogs/ColumnSettingsPopup.tsx` | ~8 (column names) |

#### Bulk Action Components
| Component | Location | Hardcoded Strings Found |
|-----------|----------|------------------------|
| BulkActionsBar.tsx | `.../BulkActions/BulkActionsBar.tsx` | ~12 (selected, Delete, Add Tag, etc.) |
| BulkTagDialog.tsx | `.../BulkActions/BulkTagDialog.tsx` | ~8 (Add/Remove tags) |
| BulkMoveDialog.tsx | `.../BulkActions/BulkMoveDialog.tsx` | ~8 (Move to property) |

#### Shared Components
| Component | Location | Hardcoded Strings Found |
|-----------|----------|------------------------|
| EmptyState.tsx | `.../shared/EmptyState.tsx` | ~4 (default title/description) |
| LoadingState.tsx | `.../shared/LoadingState.tsx` | ~4 (loading messages) |
| ViewModeToggle.tsx | `.../shared/ViewModeToggle.tsx` | ~4 (Grid view, List view) |
| InlineEdit.tsx | `.../shared/InlineEdit.tsx` | ~6 (placeholders, tooltips) |
| TagsInlineEdit.tsx | `.../shared/TagsInlineEdit.tsx` | ~6 (Add tag, tooltips) |
| EngagementIndicator.tsx | `.../shared/EngagementIndicator.tsx` | ~4 (views, reactions) |

#### Preview/Detail Components
| Component | Location | Hardcoded Strings Found |
|-----------|----------|------------------------|
| ItemPreviewModal.tsx | `.../ItemPreview/ItemPreviewModal.tsx` | ~10 (tabs, actions) |
| MediaGallery.tsx | `.../ItemPreview/MediaGallery.tsx` | ~6 (navigation, captions) |
| AnalyticsSection.tsx | `.../ItemPreview/AnalyticsSection.tsx` | ~8 (metrics labels) |
| InstructionsViewer.tsx | `.../ItemPreview/InstructionsViewer.tsx` | ~4 (section headers) |

### Observed Hardcoded String Patterns

From component analysis, the following string categories were identified:

1. **Action Labels**: "Delete", "Add Tag", "Remove Tag", "Move to Property", "Cancel"
2. **Status Indicators**: "selected", "Processing...", "Deleting..."
3. **Empty States**: "No items yet", "No matching items", "No results found"
4. **Filter Labels**: "Filters", "Clear All", "Content Type", "Tags", "Location", "Property"
5. **Sort Options**: "Sort", "Sort by", "Newest First", "Oldest First", "Name (A-Z)", "Name (Z-A)"
6. **View Modes**: "Grid view", "List view"
7. **Confirmation Messages**: "Delete Item", "Are you sure you want to delete..."
8. **Metadata Labels**: "views", "pieces of content", "Last Scanned", "Created At"
9. **ARIA Labels**: "Item manager", "Bulk actions for X selected items"

## Implementation Order

### Step 1: Review Existing Items Keys
Audit current flat keys in `/messages/en.json` items namespace and plan reorganization.

**Current keys to preserve and reorganize:**
- `createNew`, `noItems`, `name`, `description` → appropriate sub-categories
- `property`, `qrCode`, `articles`, `room`, `tags` → `items.metadata.*`
- `addArticle`, `editItem`, `deleteItem`, `viewItem` → `items.actions.*`
- `printQrCode`, `downloadQrCode` → `items.actions.*`
- `scanCount`, `lastScanned`, `createdAt`, `updatedAt` → `items.metadata.*`

### Step 2: Create Nested Structure with Sub-Categories

#### `items.title` & `items.subtitle`
Page-level title strings.

#### `items.list` (~5 keys)
List-level empty states and no-results messages.

#### `items.card` (~6 keys)
Item card display strings (views count, content pieces, status).

#### `items.actions` (~12 keys)
Action buttons: create, edit, delete, duplicate, print, share, QR actions.

#### `items.filters` (~10 keys)
Filter panel: title, labels, clear all.

#### `items.sort` (~8 keys)
Sort menu: title, sort options.

#### `items.bulk` (~8 keys)
Bulk actions bar: selected count, action labels.

#### `items.detail` (~6 keys)
Item detail/preview: tab labels, section headers.

#### `items.delete` (~4 keys)
Delete confirmation: title, message, button.

#### `items.metadata` (~10 keys)
Field labels: name, description, property, room, tags, timestamps.

#### `items.validation` (~4 keys)
Item-specific validation messages.

### Step 3: Propagate Changes to Other Language Files
After updating `en.json`, apply same structure to:
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

Initially copy English values, to be translated in Task 2D.7.

### Step 4: Verification
- Validate JSON syntax
- Run application to ensure translations load
- Verify no console errors

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/en.json`
- **Purpose**: Primary English translation file (source of truth)
- **Changes**:
  - Restructure existing flat `items` namespace into nested sub-categories
  - Add new translation keys per Plan-111 specification
  - Preserve all existing keys (reorganized into appropriate categories)
- **Sections to Add/Modify**:
  | Category | Keys to Include |
  |----------|-----------------|
  | `items.title` | Page title |
  | `items.subtitle` | Page subtitle |
  | `items.list` | `empty.title`, `empty.description`, `empty.action`, `noResults` |
  | `items.card` | `views`, `pieces`, `noContent` |
  | `items.actions` | `create`, `edit`, `delete`, `duplicate`, `viewQR`, `print`, `share` |
  | `items.filters` | `title`, `property`, `room`, `tag`, `contentType`, `status`, `clearAll` |
  | `items.sort` | `title`, `newest`, `oldest`, `nameAZ`, `nameZA`, `mostViewed` |
  | `items.bulk` | `selected`, `delete`, `move`, `addTags`, `print` |
  | `items.detail` | `title`, `qrCode`, `analytics`, `content`, `settings` |
  | `items.delete` | `title`, `message`, `confirm` |
  | `items.metadata` | `name`, `description`, `property`, `room`, `tags`, `scanCount`, `lastScanned`, `createdAt`, `updatedAt` |
  | `items.validation` | `nameRequired`, `descriptionTooLong` |

#### `/messages/fr.json`
- **Purpose**: French translation file
- **Changes**: Apply same nested structure, initially with English values (translated in Task 2D.7)
- **Scope**: Maintain parity with en.json structure

#### `/messages/es.json`
- **Purpose**: Spanish translation file
- **Changes**: Apply same nested structure, initially with English values
- **Scope**: Maintain parity with en.json structure

#### `/messages/de.json`
- **Purpose**: German translation file
- **Changes**: Apply same nested structure, initially with English values
- **Scope**: Maintain parity with en.json structure

#### `/messages/nl.json`
- **Purpose**: Dutch translation file
- **Changes**: Apply same nested structure, initially with English values
- **Scope**: Maintain parity with en.json structure

#### `/messages/it.json`
- **Purpose**: Italian translation file
- **Changes**: Apply same nested structure, initially with English values
- **Scope**: Maintain parity with en.json structure

### Files Referenced (Read-Only)

#### `/src/lib/i18n/config.ts`
- **Purpose**: Verify locale configuration supports all 6 languages
- **Reference**: Confirm locale list matches translation files

#### `/src/components/ItemManager/ItemManager.tsx`
- **Purpose**: Reference for default labels and string patterns
- **Observed**: `DEFAULT_CONFIG.labels` contains hardcoded strings (lines 55-61)

#### `/src/components/ItemManager/components/shared/EmptyState.tsx`
- **Purpose**: Reference for empty state default strings
- **Observed**: `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION` constants (lines 23-24)

#### `/src/components/ItemManager/components/dialogs/FilterPanel.tsx`
- **Purpose**: Reference for filter label strings
- **Observed**: `DEFAULT_LABELS` object with hardcoded strings (lines 89-98)

#### `/src/components/ItemManager/components/dialogs/SortMenu.tsx`
- **Purpose**: Reference for sort option labels
- **Observed**: `mergedLabels` default values (lines 124-128)

#### `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
- **Purpose**: Reference for bulk action labels
- **Observed**: Hardcoded: "selected", "Delete", "Add Tag", "Remove Tag", "Move to Property", "Cancel", "Processing..." (lines 181-267)

#### `/src/components/ItemManager/utils/constants.ts`
- **Purpose**: Reference for sort option constants
- **Observed**: `SORT_OPTIONS` array with label strings

## Technical Specifications

### Translation Key Convention (From Plan-111)
```
{namespace}.{component/area}.{element}.{variant?}
```

### Target Items Namespace Structure

```json
{
  "items": {
    "title": "Items",
    "subtitle": "Manage your QR code items",
    "list": {
      "empty": {
        "title": "No items yet",
        "description": "Create your first QR code item to get started",
        "action": "Create Item"
      },
      "noResults": "No items match your filters"
    },
    "card": {
      "views": "{count, plural, one {# view} other {# views}}",
      "pieces": "{count, plural, one {# piece} other {# pieces}} of content",
      "noContent": "No content yet"
    },
    "actions": {
      "create": "New Item",
      "edit": "Edit",
      "delete": "Delete",
      "duplicate": "Duplicate",
      "viewQR": "View QR Code",
      "print": "Print",
      "share": "Share",
      "printQrCode": "Print QR Code",
      "downloadQrCode": "Download QR Code",
      "manageAssets": "Manage Assets"
    },
    "filters": {
      "title": "Filters",
      "property": "Property",
      "room": "Room",
      "tag": "Tag",
      "contentType": "Content Type",
      "status": "Status",
      "location": "Location",
      "clearAll": "Clear All",
      "applyFilters": "Apply Filters"
    },
    "sort": {
      "title": "Sort By",
      "sortLabel": "Sort",
      "newest": "Newest First",
      "oldest": "Oldest First",
      "nameAZ": "Name (A-Z)",
      "nameZA": "Name (Z-A)",
      "mostViewed": "Most Viewed"
    },
    "bulk": {
      "selected": "{count} selected",
      "delete": "Delete Selected",
      "move": "Move to Property",
      "addTags": "Add Tags",
      "removeTags": "Remove Tags",
      "print": "Print Selected",
      "cancel": "Cancel",
      "processing": "Processing..."
    },
    "detail": {
      "title": "Item Details",
      "qrCode": "QR Code",
      "analytics": "Analytics",
      "content": "Content",
      "settings": "Settings"
    },
    "delete": {
      "title": "Delete Item",
      "titlePlural": "Delete Items",
      "message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
      "messagePlural": "Are you sure you want to delete {count} items? This action cannot be undone.",
      "confirm": "Delete Item",
      "confirmPlural": "Delete Items"
    },
    "metadata": {
      "name": "Item Name",
      "description": "Description",
      "property": "Property",
      "room": "Room",
      "tags": "Tags",
      "qrCode": "QR Code",
      "articles": "Articles",
      "scanCount": "Scan Count",
      "lastScanned": "Last Scanned",
      "createdAt": "Created At",
      "updatedAt": "Updated At"
    },
    "validation": {
      "nameRequired": "Item name is required",
      "descriptionTooLong": "Description must be less than {max} characters"
    },
    "view": {
      "grid": "Grid view",
      "list": "List view"
    },
    "search": {
      "placeholder": "Search items...",
      "resultsCount": "{count} of {total} items"
    },
    "empty": {
      "title": "No items yet",
      "description": "Create your first item to get started"
    }
  }
}
```

### ICU Message Format Examples

**Pluralization:**
```json
"views": "{count, plural, one {# view} other {# views}}"
```

**Variable Interpolation:**
```json
"message": "Are you sure you want to delete \"{name}\"?"
```

**Count with Plural:**
```json
"selected": "{count} selected"
```

## Migration Strategy

### Backward Compatibility
The existing flat keys like `items.createNew`, `items.noItems` will be restructured to nested keys. This requires:

1. **Structure reorganization** - Move existing keys to appropriate nested locations
2. **Key mapping** - Document old → new key paths for component updates
3. **Parallel structure option** - Can temporarily keep flat keys alongside nested if needed

### Key Mapping Reference

| Old Key (Flat) | New Key (Nested) |
|----------------|------------------|
| `items.createNew` | `items.actions.create` |
| `items.noItems` | `items.list.empty.title` or `items.empty.title` |
| `items.name` | `items.metadata.name` |
| `items.description` | `items.metadata.description` |
| `items.property` | `items.metadata.property` |
| `items.qrCode` | `items.metadata.qrCode` |
| `items.articles` | `items.metadata.articles` |
| `items.addArticle` | `items.actions.addArticle` |
| `items.editItem` | `items.actions.edit` |
| `items.deleteItem` | `items.actions.delete` |
| `items.viewItem` | `items.actions.view` |
| `items.printQrCode` | `items.actions.printQrCode` |
| `items.downloadQrCode` | `items.actions.downloadQrCode` |
| `items.scanCount` | `items.metadata.scanCount` |
| `items.lastScanned` | `items.metadata.lastScanned` |
| `items.createdAt` | `items.metadata.createdAt` |
| `items.updatedAt` | `items.metadata.updatedAt` |
| `items.selectProperty` | `items.filters.property` |
| `items.itemDetails` | `items.detail.title` |
| `items.noArticles` | `items.list.empty.noArticles` |
| `items.addFirstArticle` | `items.list.empty.addFirstArticle` |
| `items.room` | `items.metadata.room` |
| `items.tags` | `items.metadata.tags` |
| `items.addTag` | `items.actions.addTag` |
| `items.removeTag` | `items.actions.removeTag` |

## Success Validation Checklist

### Structure Verification
- [ ] `/messages/en.json` contains nested `items` namespace with all sub-categories
- [ ] `items.list` sub-category contains empty state keys
- [ ] `items.card` sub-category contains card display keys
- [ ] `items.actions` sub-category contains all action-related keys
- [ ] `items.filters` sub-category contains filter panel keys
- [ ] `items.sort` sub-category contains sort menu keys
- [ ] `items.bulk` sub-category contains bulk actions keys
- [ ] `items.detail` sub-category contains detail view keys
- [ ] `items.delete` sub-category contains delete confirmation keys
- [ ] `items.metadata` sub-category contains field label keys
- [ ] `items.validation` sub-category contains validation message keys
- [ ] `items.view` sub-category contains view mode keys
- [ ] `items.search` sub-category contains search-related keys

### JSON Validity
- [ ] All 6 translation files (`en`, `fr`, `es`, `de`, `nl`, `it`) are valid JSON
- [ ] All 6 files have identical key structures
- [ ] ICU pluralization syntax is correct in all files

### Functional Verification
- [ ] Application starts without i18n errors
- [ ] next-intl loads translation files correctly
- [ ] No missing translation warnings in console

### Content Completeness
- [ ] All existing flat `items.*` keys preserved in new structure
- [ ] New keys cover all identified hardcoded strings in ItemManager components
- [ ] Structure supports both single item and bulk item operations

## Notes

### Pattern Alignment
- Follow ICU message format for pluralization (standard supported by next-intl)
- Use camelCase for translation keys (matching existing codebase convention)
- Maintain alphabetical ordering within each sub-category for maintainability

### Future Integration Points
- Task 2D.2 will update ItemManager component family to use these keys
- Task 2D.3 will update ItemGrid and ItemCard components
- Task 2D.4 will update filter and sort components
- Task 2D.5 will update bulk action dialogs
- Task 2D.6 will update item detail/edit pages
- Task 2D.7 will generate translations for 5 non-English languages

### Component Update Priority
Based on string count analysis, recommended update order:
1. BulkActionsBar.tsx (~12 strings)
2. FilterPanel.tsx (~12 strings)
3. ItemManager.tsx (~15 strings, includes defaults)
4. ItemToolbar.tsx (~12 strings)
5. ConfirmDeleteDialog.tsx (~10 strings)
6. ItemCard/ItemRow (~10 strings each)
7. SortMenu.tsx (~8 strings)
8. Remaining components

### Extensibility
The structure is designed to be extensible:
- New action types can be added to `items.actions`
- Additional filter types can be added to `items.filters`
- New metadata fields can be added to `items.metadata`
- Domain-specific item strings can be added as new sub-categories

## Dependencies
- next-intl package (already installed via Epic 1)
- Valid `/messages/*.json` files (already exist via Epic 1)
- Common namespace (Task 2H.1) for shared strings (recommended but not blocking)
- No new npm packages required

## Risk Assessment
- **Risk Level**: Low
- **Rationale**:
  - Additive changes to existing files
  - No component code changes in this task
  - JSON structure changes are isolated
  - Easy rollback if issues arise
- **Mitigation**:
  - Validate JSON syntax before committing
  - Test translation loading in development
  - Keep backup of original files if needed

## Effort Estimate
- **Estimated Time**: 2-3 hours
- **Breakdown**:
  - Audit existing items keys and plan structure: 30 minutes
  - Restructure en.json with nested items namespace: 45 minutes
  - Propagate structure to 5 other language files: 45 minutes
  - Verification and testing: 30 minutes
