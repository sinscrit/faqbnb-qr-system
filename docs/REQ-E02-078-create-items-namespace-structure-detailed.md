# REQ-E02-078: Create Items Namespace Structure in Messages File - Detailed Task Breakdown

*Generated: 2026-01-20 16:00:00 UTC*
*Last Modified: 2026-01-20 16:00:00 UTC*

## Reference

- **Request**: REQ-E02-078 (Create Items Namespace Structure in Messages File)
- **Source**: docs/gen_requests_epic2.md
- **Overview Document**: docs/REQ-E02-078-create-items-namespace-structure-overview.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2D (Item Management)
- **Task ID**: 2D.1
- **Size**: S (Small)
- **Priority**: P1
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

---

## Summary

Expand the existing flat `items` namespace in `/messages/en.json` (currently 26 keys) into a comprehensive, well-organized hierarchical structure (~150-200 keys) containing all UI strings for item management. This namespace will support subsequent tasks (2D.2-2D.7) when updating ItemManager component family to use the `useTranslations` hook.

---

## Current State Analysis

### Existing Items Namespace (26 keys, flat structure)

The current `/messages/en.json` contains these `items` keys:
```
createNew, noItems, name, description, property, qrCode, articles, addArticle,
editItem, deleteItem, viewItem, printQrCode, downloadQrCode, scanCount, lastScanned,
createdAt, updatedAt, selectProperty, itemDetails, noArticles, addFirstArticle,
room, tags, addTag, removeTag
```

### Target State (~150-200 keys, categorized structure)

Transform into 17 subcategories:
- `items.title/subtitle` (root level context)
- `items.list` (~8 keys) - List view strings
- `items.card` (~15 keys) - Card component strings
- `items.actions` (~12 keys) - Action buttons
- `items.filters` (~30 keys) - Filter panel
- `items.sort` (~10 keys) - Sort menu
- `items.search` (~5 keys) - Search input
- `items.bulk` (~15 keys) - Bulk selection
- `items.bulkTag` (~8 keys) - Bulk tag dialog
- `items.bulkMove` (~6 keys) - Bulk move dialog
- `items.delete` (~12 keys) - Delete confirmation
- `items.detail` (~6 keys) - Item detail view
- `items.preview` (~6 keys) - Preview modal
- `items.assets` (~15 keys) - Asset management
- `items.inline` (~10 keys) - Inline editing
- `items.analytics` (~8 keys) - Analytics display
- `items.view` (~3 keys) - View mode toggle
- `items.validation` (~4 keys) - Validation messages

### ItemManager Component Inventory

Based on the Overview Document analysis, the ItemManager family contains 40+ production files with ~360 hardcoded strings requiring translation.

---

## Detailed Tasks

### Task 1: Analyze and Map Existing Keys
**Estimate**: 1 story point
**Priority**: P0 - Must do first

#### Description
Review the current flat `items` namespace and create a mapping showing where each existing key should move in the new categorized structure to ensure backward compatibility and prevent data loss.

#### Acceptance Criteria
- [ ] All 26 existing keys are mapped to their new subcategory location
- [ ] Identify keys that will be preserved at root level vs moved
- [ ] Document migration path for existing keys

#### Implementation Details

**Key Mapping (Current -> New Location)**:

| Current Key | New Location | Notes |
|-------------|--------------|-------|
| `createNew` | `actions.createQR` | Rename for clarity |
| `noItems` | `list.empty.title` | Move and keep alias |
| `name` | *keep at root* | Common label |
| `description` | *keep at root* | Common label |
| `property` | *keep at root* | Common label |
| `qrCode` | *keep at root* | Common label |
| `articles` | *keep at root* | Common label |
| `addArticle` | `actions.addArticle` | Move to actions |
| `editItem` | `actions.edit` | Simplify and move |
| `deleteItem` | `actions.delete` | Simplify and move |
| `viewItem` | `actions.view` | Simplify and move |
| `printQrCode` | `actions.printQR` | Rename and move |
| `downloadQrCode` | `actions.downloadQR` | Rename and move |
| `scanCount` | `card.scanCount` | Move to card |
| `lastScanned` | `card.lastScanned` | Move to card |
| `createdAt` | `card.createdAt` | Move to card |
| `updatedAt` | `card.updatedAt` | Move to card |
| `selectProperty` | `filters.property.placeholder` | Move to filters |
| `itemDetails` | `detail.title` | Move to detail |
| `noArticles` | `list.noArticles` | Move to list |
| `addFirstArticle` | `list.addFirstArticle` | Move to list |
| `room` | *keep at root* | Common label |
| `tags` | *keep at root* | Common label |
| `addTag` | `inline.tags.add` | Move to inline |
| `removeTag` | `inline.tags.remove` | Move to inline |

#### Verification Steps
1. Count existing keys (should be 26)
2. Verify each key has a mapping destination
3. Confirm no keys are accidentally lost

---

### Task 2: Create Root-Level Context Keys
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Add page-level context strings for the items section including title, subtitle, and preserve common field labels at root level.

#### Target Content

```json
{
  "items": {
    "title": "Items",
    "subtitle": "Manage your QR code items",
    "name": "Item Name",
    "description": "Description",
    "property": "Property",
    "qrCode": "QR Code",
    "articles": "Articles",
    "room": "Room",
    "tags": "Tags"
  }
}
```

#### Acceptance Criteria
- [ ] Title and subtitle added for page header
- [ ] Common field labels preserved at root level
- [ ] No breaking changes to existing implementations

---

### Task 3: Create `items.list` Subcategory
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Create the `list` subcategory containing list view strings including empty states and no-results messages.

#### Target Content (~8 keys)

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
      "loading": "Loading items...",
      "noArticles": "No articles yet",
      "addFirstArticle": "Add your first article"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 8 list view keys are present
- [ ] Empty state includes title, description, and action
- [ ] No-results state provides helpful guidance
- [ ] Loading state message included

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `items.list` (should be ~8)

---

### Task 4: Create `items.card` Subcategory with ICU Format
**Estimate**: 2 story points
**Priority**: P0 - Critical

#### Description
Create the `card` subcategory containing card component strings including content type labels and pluralized metrics.

#### Target Content (~15 keys)

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
      "thumbnail": "{title} thumbnail",
      "scanCount": "Scan Count",
      "lastScanned": "Last Scanned",
      "createdAt": "Created At",
      "updatedAt": "Updated At"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 7 content type labels present (LINK, TEXT, PDF, MIXED, VIDEO, PHOTO, MEDIA)
- [ ] ICU plural syntax correct for views and pieces
- [ ] Metadata labels migrated from root level
- [ ] Variable interpolation for dynamic content ({count}, {title})

#### Technical Notes
- ICU format: `{variable, plural, one {singular} other {plural}}`
- Verify with: `t('views', { count: 5 })` should return "5 views"

#### Verification Steps
1. Verify JSON is valid after edit
2. Test ICU patterns don't cause parse errors

---

### Task 5: Create `items.actions` Subcategory
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Create the `actions` subcategory containing all action button labels for item management.

#### Target Content (~12 keys)

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
      "manageAssets": "Manage Assets",
      "addArticle": "Add Article"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 12 action keys are present
- [ ] Key names follow camelCase convention
- [ ] Existing keys migrated (editItem -> edit, deleteItem -> delete)

---

### Task 6: Create `items.filters` Subcategory
**Estimate**: 2 story points
**Priority**: P1 - High

#### Description
Create the `filters` subcategory containing all filter panel strings including section headers and filter options.

#### Target Content (~30 keys)

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

#### Acceptance Criteria
- [ ] Filter panel title and action buttons included
- [ ] Section headers for all 4 filter categories
- [ ] Content type options match card content types
- [ ] Placeholder text for all filter inputs
- [ ] Variable interpolation for selected count

---

### Task 7: Create `items.sort` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `sort` subcategory containing sort menu labels and options.

#### Target Content (~10 keys)

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

#### Acceptance Criteria
- [ ] Sort menu labels included
- [ ] All 6 sort options present
- [ ] Options use consistent naming pattern

---

### Task 8: Create `items.search` Subcategory with Variables
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `search` subcategory containing search input strings with variable interpolation.

#### Target Content (~5 keys)

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

#### Acceptance Criteria
- [ ] Search placeholder matches component default
- [ ] ICU plural format for results count
- [ ] Pagination showing text with variable interpolation

---

### Task 9: Create `items.bulk` and Related Subcategories
**Estimate**: 2 story points
**Priority**: P1 - High

#### Description
Create bulk action subcategories including main bulk bar, tag dialog, and move dialog.

#### Target Content - items.bulk (~15 keys)

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
    }
  }
}
```

#### Target Content - items.bulkTag (~8 keys)

```json
{
  "items": {
    "bulkTag": {
      "addTitle": "Add Tags to Items",
      "removeTitle": "Remove Tags from Items",
      "addDescription": "Select tags to add to {count} selected {count, plural, one {item} other {items}}",
      "removeDescription": "Select tags to remove from {count} selected {count, plural, one {item} other {items}}",
      "selectTags": "Select tags",
      "noTagsAvailable": "No tags available",
      "confirm": "Confirm",
      "cancel": "Cancel"
    }
  }
}
```

#### Target Content - items.bulkMove (~6 keys)

```json
{
  "items": {
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

#### Acceptance Criteria
- [ ] Bulk selection count with ICU plural format
- [ ] Aria-label for accessibility included
- [ ] All bulk action buttons labeled
- [ ] Tag dialog strings for add and remove modes
- [ ] Move dialog strings complete

---

### Task 10: Create `items.delete` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `delete` subcategory containing delete confirmation dialog strings.

#### Target Content (~12 keys)

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

#### Acceptance Criteria
- [ ] Separate titles for single and plural delete
- [ ] Three message variants (single, plural, named)
- [ ] Variable interpolation for item name and count
- [ ] Loading state for delete action

---

### Task 11: Create `items.detail` and `items.preview` Subcategories
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create subcategories for item detail view and preview modal.

#### Target Content - items.detail (~6 keys)

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
    }
  }
}
```

#### Target Content - items.preview (~6 keys)

```json
{
  "items": {
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

#### Acceptance Criteria
- [ ] Detail view tabs labeled
- [ ] Preview modal controls included
- [ ] Empty state for no media

---

### Task 12: Create `items.assets` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `assets` subcategory containing asset management panel strings.

#### Target Content (~15 keys)

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

#### Acceptance Criteria
- [ ] Dropzone instructions complete
- [ ] Variable interpolation for formats and size
- [ ] Asset item actions labeled
- [ ] Remove confirmation dialog included

---

### Task 13: Create `items.inline` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `inline` subcategory containing inline edit component strings.

#### Target Content (~10 keys)

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
        "ariaLabel": "Edit tags for {itemName}",
        "add": "Add Tag",
        "remove": "Remove Tag"
      },
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Click to edit"
    }
  }
}
```

#### Acceptance Criteria
- [ ] Placeholders for all inline edit fields
- [ ] Aria labels with variable interpolation for accessibility
- [ ] Common edit actions (save, cancel, edit)

---

### Task 14: Create `items.analytics` and `items.view` Subcategories
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create subcategories for analytics display and view mode toggle.

#### Target Content - items.analytics (~8 keys)

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

#### Target Content - items.view (~3 keys)

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

#### Acceptance Criteria
- [ ] Analytics time period filters labeled
- [ ] ICU plural format for view count
- [ ] View mode toggle options included

---

### Task 15: Create `items.validation` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `validation` subcategory containing item-specific validation messages.

#### Target Content (~4 keys)

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

#### Acceptance Criteria
- [ ] All validation messages present
- [ ] Variable interpolation for max length
- [ ] Messages are user-friendly and specific

---

### Task 16: Copy Structure to Other Language Files
**Estimate**: 1 story point
**Priority**: P2 - Required but separate

#### Description
Apply the same hierarchical structure to all 5 non-English language files using English placeholders. Actual translations will be generated in Task 2D.7.

#### Files to Update
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

#### Acceptance Criteria
- [ ] All 5 files have identical structure to `en.json` items namespace
- [ ] All keys present in `en.json` exist in other files
- [ ] Values are English placeholders (will be translated later)
- [ ] All files are valid JSON

---

### Task 17: Validate Complete Implementation
**Estimate**: 1 story point
**Priority**: P0 - Must do last

#### Description
Final validation to ensure all acceptance criteria are met and the implementation is complete.

#### Checklist

**Structure Validation**
- [ ] `items.list` exists with ~8 keys
- [ ] `items.card` exists with ~15 keys (ICU format)
- [ ] `items.actions` exists with ~12 keys
- [ ] `items.filters` exists with ~30 keys
- [ ] `items.sort` exists with ~10 keys
- [ ] `items.search` exists with ~5 keys (ICU format)
- [ ] `items.bulk` exists with ~15 keys (ICU format)
- [ ] `items.bulkTag` exists with ~8 keys (ICU format)
- [ ] `items.bulkMove` exists with ~6 keys (ICU format)
- [ ] `items.delete` exists with ~12 keys
- [ ] `items.detail` exists with ~6 keys
- [ ] `items.preview` exists with ~6 keys
- [ ] `items.assets` exists with ~15 keys
- [ ] `items.inline` exists with ~10 keys
- [ ] `items.analytics` exists with ~8 keys (ICU format)
- [ ] `items.view` exists with ~3 keys
- [ ] `items.validation` exists with ~4 keys

**ICU Format Validation**
- [ ] `items.card.views` pluralization works
- [ ] `items.card.pieces` pluralization works
- [ ] `items.bulk.selected` pluralization works
- [ ] `items.search.results` pluralization works

**Variable Interpolation Validation**
- [ ] `items.card.select` with {title} works
- [ ] `items.delete.message.named` with {itemName} works
- [ ] `items.assets.dropzone.supportedFormats` with {formats} works

**Coverage Validation**
- [ ] All strings from ItemManager.DEFAULT_CONFIG.labels covered
- [ ] All strings from FilterPanel.DEFAULT_LABELS covered
- [ ] All strings from SortMenu covered
- [ ] All strings from ConfirmDeleteDialog covered
- [ ] All strings from BulkActionsBar covered

**JSON Validation**
- [ ] `/messages/en.json` is valid JSON
- [ ] All 6 language files have consistent items structure
- [ ] No duplicate keys within items namespace

**Build Validation**
- [ ] `npm run build` succeeds without errors
- [ ] Application starts without i18n errors

#### Verification Commands
```bash
# Validate JSON files
npx jsonlint messages/en.json
npx jsonlint messages/fr.json
npx jsonlint messages/es.json
npx jsonlint messages/de.json
npx jsonlint messages/nl.json
npx jsonlint messages/it.json

# Build project
npm run build

# Start dev server and check console
npm run dev
```

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `/messages/en.json` | Modify | Expand `items` namespace from 26 to ~150-200 keys |
| `/messages/fr.json` | Modify | Mirror structure with English placeholders |
| `/messages/es.json` | Modify | Mirror structure with English placeholders |
| `/messages/de.json` | Modify | Mirror structure with English placeholders |
| `/messages/nl.json` | Modify | Mirror structure with English placeholders |
| `/messages/it.json` | Modify | Mirror structure with English placeholders |

---

## Files NOT to Modify

- Any ItemManager component files - Components will be updated in Tasks 2D.2-2D.6
- `/src/lib/i18n/config.ts` - No changes needed
- Database migrations
- API routes
- Test files

---

## Final Target Structure

```json
{
  "items": {
    "title": "Items",
    "subtitle": "Manage your QR code items",
    "name": "Item Name",
    "description": "Description",
    "property": "Property",
    "qrCode": "QR Code",
    "articles": "Articles",
    "room": "Room",
    "tags": "Tags",

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
      "loading": "Loading items...",
      "noArticles": "No articles yet",
      "addFirstArticle": "Add your first article"
    },

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
      "thumbnail": "{title} thumbnail",
      "scanCount": "Scan Count",
      "lastScanned": "Last Scanned",
      "createdAt": "Created At",
      "updatedAt": "Updated At"
    },

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
      "manageAssets": "Manage Assets",
      "addArticle": "Add Article"
    },

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
    },

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
    },

    "search": {
      "placeholder": "Search items...",
      "clear": "Clear search",
      "results": "{count, plural, =0 {No results} one {# result} other {# results}}",
      "showing": "Showing {start} to {end} of {total}"
    },

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
    },

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
    },

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
    },

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
    },

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
        "ariaLabel": "Edit tags for {itemName}",
        "add": "Add Tag",
        "remove": "Remove Tag"
      },
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Click to edit"
    },

    "analytics": {
      "title": "Analytics",
      "views": "{count, plural, one {# view} other {# views}}",
      "allTime": "All time",
      "thisWeek": "This week",
      "thisMonth": "This month",
      "reactions": "Reactions",
      "engagement": "Engagement",
      "noData": "No analytics data yet"
    },

    "view": {
      "grid": "Grid view",
      "list": "List view",
      "toggle": "Toggle view mode"
    },

    "validation": {
      "nameRequired": "Item name is required",
      "nameTooLong": "Item name must be less than {max} characters",
      "duplicateName": "An item with this name already exists"
    }
  }
}
```

---

## Usage Examples After Implementation

### Client Component - Basic
```typescript
'use client';
import { useTranslations } from 'next-intl';

function ItemsHeader() {
  const t = useTranslations('items');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}
```

### Client Component - With Subcategory Scope
```typescript
'use client';
import { useTranslations } from 'next-intl';

function EmptyState() {
  const t = useTranslations('items.list.empty');

  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
      <button>{t('action')}</button>
    </div>
  );
}
```

### With ICU Pluralization
```typescript
'use client';
import { useTranslations } from 'next-intl';

function ItemCardBadge({ viewCount }: { viewCount: number }) {
  const t = useTranslations('items.card');

  return <span>{t('views', { count: viewCount })}</span>;
}
```

### With Variable Interpolation
```typescript
'use client';
import { useTranslations } from 'next-intl';

function DeleteConfirmation({ itemName }: { itemName: string }) {
  const t = useTranslations('items.delete');

  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('message.named', { itemName })}</p>
    </div>
  );
}
```

### Bulk Actions with Pluralization
```typescript
'use client';
import { useTranslations } from 'next-intl';

function BulkActionsBar({ selectedCount }: { selectedCount: number }) {
  const t = useTranslations('items.bulk');

  return (
    <div role="status" aria-label={t('selectedAria', { count: selectedCount })}>
      <span>{t('selected', { count: selectedCount })}</span>
      <button>{t('actions.delete')}</button>
      <button>{t('cancelSelection')}</button>
    </div>
  );
}
```

---

## Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing strings discovered in component update tasks | Medium | Low | Design with extensibility, add keys as needed |
| ICU syntax errors | Medium | Low | Validate with next-intl before committing |
| Breaking existing items namespace usage | Low | Medium | Preserve root-level common labels |
| JSON parse errors | Low | High | Use jsonlint validation before committing |
| Key naming inconsistencies | Medium | Medium | Follow established conventions strictly |

---

## Dependencies

### Required (Already Available)
- `next-intl` package installed (Epic 1)
- Translation files exist at `/messages/*.json` (Epic 1)
- IntlProvider configured in layout (Epic 1)
- Existing `items` namespace with 26 keys

### This Task Enables
- Task 2D.2: Update ItemManager component family
- Task 2D.3: Update ItemGrid and ItemCard
- Task 2D.4: Update filter and sort components
- Task 2D.5: Update bulk action dialogs
- Task 2D.6: Update item detail/edit pages
- Task 2D.7: Generate translations for 5 non-English languages

---

## Story Points Summary

| Task | Story Points |
|------|--------------|
| Task 1: Analyze and Map Existing Keys | 1 |
| Task 2: Create Root-Level Context Keys | 1 |
| Task 3: Create `items.list` | 1 |
| Task 4: Create `items.card` (ICU) | 2 |
| Task 5: Create `items.actions` | 1 |
| Task 6: Create `items.filters` | 2 |
| Task 7: Create `items.sort` | 1 |
| Task 8: Create `items.search` (ICU) | 1 |
| Task 9: Create `items.bulk*` (ICU) | 2 |
| Task 10: Create `items.delete` | 1 |
| Task 11: Create `items.detail` and `items.preview` | 1 |
| Task 12: Create `items.assets` | 1 |
| Task 13: Create `items.inline` | 1 |
| Task 14: Create `items.analytics` and `items.view` | 1 |
| Task 15: Create `items.validation` | 1 |
| Task 16: Copy Structure to Other Language Files | 1 |
| Task 17: Validate Complete Implementation | 1 |
| **Total** | **20 SP** |

**Estimated Completion**: 1-2 days (tasks can be completed in a single editing session)

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2D: Item Management
- [Overview Document](/docs/REQ-E02-078-create-items-namespace-structure-overview.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-078
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*End of Detailed Task Breakdown*
