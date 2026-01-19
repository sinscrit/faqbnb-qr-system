# REQ-385: Create Items Namespace Structure - Detailed Task Breakdown

**Generated:** 2026-01-19 00:00:00 UTC
**Last Modified:** 2026-01-19 00:00:00 UTC

## Document References
- **Request ID:** REQ-385
- **Overview Document:** docs/REQ-385-create-items-namespace-structure-overview.md
- **Requirements:** docs/gen_requests_epic2.md (Request #385)
- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Epic:** 2 - Static UI Translation
- **Sub-Epic:** 2D - Item Management
- **Task ID:** 2D.1
- **Size:** S (Small)
- **Priority:** Seventh (after Common, Errors, Auth, Dashboard, Settings, Properties)

---

## Executive Summary

This task establishes the `items` namespace structure in all 6 translation files (`/messages/*.json`). The current flat `items` namespace (~25 keys) must be restructured into a comprehensive nested structure supporting the ~400 strings across 40+ ItemManager components. This is a foundational task that enables subsequent component translations (Tasks 2D.2-2D.7).

---

## Prerequisites

| Prerequisite | Status | Verification |
|--------------|--------|--------------|
| Epic 1 complete (next-intl installed) | VERIFIED | `/package.json` includes `next-intl` |
| i18n config exists | VERIFIED | `/src/lib/i18n/config.ts` exists |
| Translation files exist | VERIFIED | `/messages/*.json` files exist for all 6 locales |
| Common namespace ideally complete (Task 2H.1) | RECOMMENDED | Shared strings like "Delete", "Cancel" should come from common |

---

## Current State Analysis

### Existing Items Namespace (en.json)

The current `/messages/en.json` has a **flat** items namespace with ~25 keys:

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

### Issues with Current Structure
1. **Flat organization** - All keys at same level, no logical grouping
2. **Missing coverage** - No keys for filters, sort, bulk actions, delete confirmations
3. **No pluralization** - Missing ICU format for counts (views, selected items)
4. **Inconsistent naming** - Mix of `deleteItem` and `addTag` patterns

---

## Target State

### Nested Items Namespace Structure

The target structure organizes ~75+ keys into logical sub-categories:

```
items/
├── title                    # Page title
├── subtitle                 # Page subtitle
├── list/                    # List-level strings (~5 keys)
│   ├── empty/              # Empty states
│   └── noResults           # Filter no results
├── card/                    # Item card display (~6 keys)
├── actions/                 # Action buttons (~15 keys)
├── filters/                 # Filter panel (~10 keys)
├── sort/                    # Sort menu (~8 keys)
├── bulk/                    # Bulk actions (~10 keys)
├── detail/                  # Item detail view (~6 keys)
├── delete/                  # Delete confirmation (~6 keys)
├── metadata/                # Field labels (~12 keys)
├── validation/              # Validation messages (~4 keys)
├── view/                    # View mode toggle (~2 keys)
├── search/                  # Search-related (~3 keys)
└── empty/                   # Legacy/alternative empty state (~2 keys)
```

---

## Task Breakdown

### Task 1: Audit Current Items Keys and Plan Migration
**Estimated Time:** 20 minutes
**Story Points:** 0.5

#### Description
Review all existing flat keys in `/messages/en.json` items namespace and document the migration mapping to new nested locations.

#### Steps
1. Read current `/messages/en.json` items namespace
2. Create mapping table: old key → new nested key
3. Identify keys to preserve vs. deprecate
4. Document any keys that need renaming for consistency

#### Key Mapping Reference

| Old Key (Flat) | New Key (Nested) | Notes |
|----------------|------------------|-------|
| `items.createNew` | `items.actions.create` | Standardize action naming |
| `items.noItems` | `items.list.empty.title` | Move to empty state section |
| `items.name` | `items.metadata.name` | Move to metadata section |
| `items.description` | `items.metadata.description` | Move to metadata section |
| `items.property` | `items.metadata.property` | Move to metadata section |
| `items.qrCode` | `items.metadata.qrCode` | Move to metadata section |
| `items.articles` | `items.metadata.articles` | Move to metadata section |
| `items.addArticle` | `items.actions.addArticle` | Move to actions section |
| `items.editItem` | `items.actions.edit` | Simplify to `edit` |
| `items.deleteItem` | `items.actions.delete` | Simplify to `delete` |
| `items.viewItem` | `items.actions.view` | Simplify to `view` |
| `items.printQrCode` | `items.actions.printQrCode` | Keep verbose for clarity |
| `items.downloadQrCode` | `items.actions.downloadQrCode` | Keep verbose for clarity |
| `items.scanCount` | `items.metadata.scanCount` | Move to metadata |
| `items.lastScanned` | `items.metadata.lastScanned` | Move to metadata |
| `items.createdAt` | `items.metadata.createdAt` | Move to metadata |
| `items.updatedAt` | `items.metadata.updatedAt` | Move to metadata |
| `items.selectProperty` | `items.filters.property` | Move to filters with updated text |
| `items.itemDetails` | `items.detail.title` | Move to detail section |
| `items.noArticles` | `items.list.empty.noArticles` | Move to empty states |
| `items.addFirstArticle` | `items.list.empty.addFirstArticle` | Move to empty states |
| `items.room` | `items.metadata.room` | Move to metadata |
| `items.tags` | `items.metadata.tags` | Move to metadata |
| `items.addTag` | `items.actions.addTag` | Move to actions |
| `items.removeTag` | `items.actions.removeTag` | Move to actions |

#### Verification
- [ ] All 25 existing keys have migration mapping
- [ ] No keys will be lost in migration
- [ ] New key names follow camelCase convention

---

### Task 2: Create Nested Items Namespace in en.json
**Estimated Time:** 45 minutes
**Story Points:** 1

#### Description
Restructure the items namespace in `/messages/en.json` from flat to nested structure with all sub-categories and keys.

#### Steps
1. Back up current items namespace (copy to scratch file)
2. Replace flat items namespace with nested structure
3. Migrate all existing keys to new locations
4. Add new keys for uncovered functionality
5. Validate JSON syntax

#### Target Structure

```json
{
  "items": {
    "title": "Items",
    "subtitle": "Manage your QR code items",

    "list": {
      "empty": {
        "title": "No items yet",
        "description": "Create your first QR code item to get started",
        "action": "Create Item",
        "noArticles": "No articles yet",
        "addFirstArticle": "Add your first article"
      },
      "noResults": "No items match your filters"
    },

    "card": {
      "views": "{count, plural, =0 {No views} one {# view} other {# views}}",
      "pieces": "{count, plural, =0 {No content} one {# piece} other {# pieces}} of content",
      "noContent": "No content yet",
      "lastScanned": "Last scanned {date}",
      "neverScanned": "Never scanned",
      "contentCount": "{count} content pieces"
    },

    "actions": {
      "create": "New QR Code Item",
      "edit": "Edit",
      "delete": "Delete",
      "view": "View",
      "duplicate": "Duplicate",
      "viewQR": "View QR Code",
      "print": "Print",
      "share": "Share",
      "printQrCode": "Print QR Code",
      "downloadQrCode": "Download QR Code",
      "manageAssets": "Manage Assets",
      "addArticle": "Add Article",
      "addTag": "Add Tag",
      "removeTag": "Remove Tag",
      "move": "Move"
    },

    "filters": {
      "title": "Filters",
      "property": "Property",
      "room": "Room",
      "tag": "Tag",
      "tags": "Tags",
      "contentType": "Content Type",
      "status": "Status",
      "location": "Location",
      "clearAll": "Clear All",
      "applyFilters": "Apply Filters",
      "activeFilters": "{count} active {count, plural, one {filter} other {filters}}"
    },

    "sort": {
      "title": "Sort By",
      "sortLabel": "Sort",
      "newest": "Newest First",
      "oldest": "Oldest First",
      "nameAZ": "Name (A-Z)",
      "nameZA": "Name (Z-A)",
      "mostViewed": "Most Viewed",
      "recentlyScanned": "Recently Scanned"
    },

    "bulk": {
      "selected": "{count} selected",
      "selectAll": "Select All",
      "deselectAll": "Deselect All",
      "delete": "Delete Selected",
      "move": "Move to Property",
      "addTags": "Add Tags",
      "removeTags": "Remove Tags",
      "print": "Print Selected",
      "cancel": "Cancel",
      "processing": "Processing...",
      "confirmDelete": "Delete {count} {count, plural, one {item} other {items}}?"
    },

    "detail": {
      "title": "Item Details",
      "qrCode": "QR Code",
      "analytics": "Analytics",
      "content": "Content",
      "settings": "Settings",
      "instructions": "Instructions",
      "media": "Media"
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
      "updatedAt": "Updated At",
      "contentPieces": "Content Pieces"
    },

    "validation": {
      "nameRequired": "Item name is required",
      "nameTooLong": "Item name must be less than {max} characters",
      "descriptionTooLong": "Description must be less than {max} characters",
      "propertyRequired": "Please select a property"
    },

    "view": {
      "grid": "Grid view",
      "list": "List view",
      "toggle": "Toggle view mode"
    },

    "search": {
      "placeholder": "Search items...",
      "resultsCount": "{count} of {total} items",
      "noResults": "No items found for \"{query}\""
    },

    "empty": {
      "title": "No items yet",
      "description": "Create your first item to get started"
    },

    "toolbar": {
      "search": "Search",
      "filters": "Filters",
      "sort": "Sort",
      "viewMode": "View Mode",
      "columns": "Columns"
    },

    "columns": {
      "name": "Name",
      "property": "Property",
      "room": "Room",
      "tags": "Tags",
      "content": "Content",
      "scans": "Scans",
      "lastScanned": "Last Scanned",
      "created": "Created",
      "actions": "Actions",
      "settings": "Column Settings",
      "show": "Show Columns",
      "hide": "Hide Columns"
    },

    "aria": {
      "itemManager": "Item manager",
      "itemCard": "Item card for {name}",
      "itemRow": "Item row for {name}",
      "selectItem": "Select {name}",
      "editItem": "Edit {name}",
      "deleteItem": "Delete {name}",
      "viewQrCode": "View QR code for {name}",
      "bulkActionsBar": "Bulk actions for {count} selected items"
    }
  }
}
```

#### Verification
- [ ] JSON is valid (no syntax errors)
- [ ] All 25 original keys migrated to new locations
- [ ] All sub-categories present: list, card, actions, filters, sort, bulk, detail, delete, metadata, validation, view, search, empty, toolbar, columns, aria
- [ ] ICU pluralization syntax correct for count-based strings
- [ ] Variable interpolation syntax correct ({name}, {count}, {max})

---

### Task 3: Propagate Structure to French Translation File
**Estimated Time:** 10 minutes
**Story Points:** 0.5

#### Description
Apply the same nested structure to `/messages/fr.json`, initially with English values. Translations will be generated in Task 2D.7.

#### Steps
1. Read current fr.json file
2. Replace flat items namespace with nested structure (copy from en.json)
3. Keep English values as placeholders
4. Validate JSON syntax

#### File
`/messages/fr.json`

#### Verification
- [ ] JSON is valid
- [ ] Structure matches en.json exactly
- [ ] All keys present

---

### Task 4: Propagate Structure to Spanish Translation File
**Estimated Time:** 10 minutes
**Story Points:** 0.5

#### Description
Apply the same nested structure to `/messages/es.json`, initially with English values.

#### Steps
1. Read current es.json file
2. Replace flat items namespace with nested structure (copy from en.json)
3. Keep English values as placeholders
4. Validate JSON syntax

#### File
`/messages/es.json`

#### Verification
- [ ] JSON is valid
- [ ] Structure matches en.json exactly
- [ ] All keys present

---

### Task 5: Propagate Structure to German Translation File
**Estimated Time:** 10 minutes
**Story Points:** 0.5

#### Description
Apply the same nested structure to `/messages/de.json`, initially with English values.

#### Steps
1. Read current de.json file
2. Replace flat items namespace with nested structure (copy from en.json)
3. Keep English values as placeholders
4. Validate JSON syntax

#### File
`/messages/de.json`

#### Verification
- [ ] JSON is valid
- [ ] Structure matches en.json exactly
- [ ] All keys present

---

### Task 6: Propagate Structure to Dutch Translation File
**Estimated Time:** 10 minutes
**Story Points:** 0.5

#### Description
Apply the same nested structure to `/messages/nl.json`, initially with English values.

#### Steps
1. Read current nl.json file
2. Replace flat items namespace with nested structure (copy from en.json)
3. Keep English values as placeholders
4. Validate JSON syntax

#### File
`/messages/nl.json`

#### Verification
- [ ] JSON is valid
- [ ] Structure matches en.json exactly
- [ ] All keys present

---

### Task 7: Propagate Structure to Italian Translation File
**Estimated Time:** 10 minutes
**Story Points:** 0.5

#### Description
Apply the same nested structure to `/messages/it.json`, initially with English values.

#### Steps
1. Read current it.json file
2. Replace flat items namespace with nested structure (copy from en.json)
3. Keep English values as placeholders
4. Validate JSON syntax

#### File
`/messages/it.json`

#### Verification
- [ ] JSON is valid
- [ ] Structure matches en.json exactly
- [ ] All keys present

---

### Task 8: Verification and Testing
**Estimated Time:** 20 minutes
**Story Points:** 0.5

#### Description
Verify all translation files are valid and the application loads without i18n errors.

#### Steps
1. Run JSON linter on all 6 translation files
2. Start development server
3. Navigate to item management pages
4. Check browser console for i18n errors/warnings
5. Verify no missing translation warnings

#### Commands
```bash
# Validate JSON syntax
npx jsonlint messages/en.json
npx jsonlint messages/fr.json
npx jsonlint messages/es.json
npx jsonlint messages/de.json
npx jsonlint messages/nl.json
npx jsonlint messages/it.json

# Start dev server and test
npm run dev
```

#### Verification Checklist
- [ ] All 6 translation files pass JSON validation
- [ ] Development server starts without errors
- [ ] No i18n-related console errors
- [ ] No missing translation warnings in console
- [ ] Pages load correctly (items page, dashboard)

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `/messages/en.json` | MODIFY | Restructure items namespace from flat to nested |
| `/messages/fr.json` | MODIFY | Apply same nested structure with English placeholders |
| `/messages/es.json` | MODIFY | Apply same nested structure with English placeholders |
| `/messages/de.json` | MODIFY | Apply same nested structure with English placeholders |
| `/messages/nl.json` | MODIFY | Apply same nested structure with English placeholders |
| `/messages/it.json` | MODIFY | Apply same nested structure with English placeholders |

---

## Files Referenced (Read-Only)

| File | Purpose |
|------|---------|
| `/src/lib/i18n/config.ts` | Verify locale configuration |
| `/src/components/ItemManager/ItemManager.tsx` | Reference for hardcoded strings |
| `/src/components/ItemManager/components/dialogs/FilterPanel.tsx` | Reference for filter labels |
| `/src/components/ItemManager/components/dialogs/SortMenu.tsx` | Reference for sort options |
| `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | Reference for bulk action labels |
| `/src/components/ItemManager/components/shared/EmptyState.tsx` | Reference for empty state strings |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Reference for delete confirmation |

---

## Implementation Notes

### Translation Key Convention
```
{namespace}.{component/area}.{element}.{variant?}
```

Examples:
- `items.actions.create` - Create action button
- `items.filters.property` - Property filter label
- `items.delete.message` - Delete confirmation message
- `items.card.views` - View count with pluralization

### ICU Message Format

**Pluralization:**
```json
"views": "{count, plural, =0 {No views} one {# view} other {# views}}"
```

**Variable Interpolation:**
```json
"message": "Are you sure you want to delete \"{name}\"?"
```

**Combined:**
```json
"selected": "{count} selected"
```

### Backward Compatibility

The flat keys will be **replaced** by nested keys. Components using old keys like `t('createNew')` will need to update to `t('actions.create')` in subsequent tasks (2D.2-2D.6). This task only creates the structure; component updates are separate.

---

## Success Criteria

### Structure Verification
- [ ] `/messages/en.json` contains nested `items` namespace with all sub-categories
- [ ] `items.list` sub-category contains empty state keys
- [ ] `items.card` sub-category contains card display keys
- [ ] `items.actions` sub-category contains all action-related keys (15+ keys)
- [ ] `items.filters` sub-category contains filter panel keys (10+ keys)
- [ ] `items.sort` sub-category contains sort menu keys (7+ keys)
- [ ] `items.bulk` sub-category contains bulk actions keys (11+ keys)
- [ ] `items.detail` sub-category contains detail view keys (6+ keys)
- [ ] `items.delete` sub-category contains delete confirmation keys (6 keys)
- [ ] `items.metadata` sub-category contains field label keys (13+ keys)
- [ ] `items.validation` sub-category contains validation message keys (4+ keys)
- [ ] `items.view` sub-category contains view mode keys (3 keys)
- [ ] `items.search` sub-category contains search-related keys (3 keys)
- [ ] `items.toolbar` sub-category contains toolbar keys (5 keys)
- [ ] `items.columns` sub-category contains column settings keys (12+ keys)
- [ ] `items.aria` sub-category contains accessibility labels (8+ keys)

### JSON Validity
- [ ] All 6 translation files (`en`, `fr`, `es`, `de`, `nl`, `it`) are valid JSON
- [ ] All 6 files have identical key structures
- [ ] ICU pluralization syntax is correct in all files
- [ ] Variable interpolation syntax is correct in all files

### Functional Verification
- [ ] Application starts without i18n errors
- [ ] next-intl loads translation files correctly
- [ ] No missing translation warnings in browser console
- [ ] Item management pages render correctly

### Content Completeness
- [ ] All 25 existing flat `items.*` keys preserved in new structure
- [ ] New keys cover all identified hardcoded strings in ItemManager components
- [ ] Structure supports both single item and bulk item operations
- [ ] Accessibility (ARIA) labels included

---

## Effort Summary

| Task | Description | Est. Time | Story Points |
|------|-------------|-----------|--------------|
| Task 1 | Audit current keys and plan migration | 20 min | 0.5 |
| Task 2 | Create nested items namespace in en.json | 45 min | 1 |
| Task 3 | Propagate structure to fr.json | 10 min | 0.5 |
| Task 4 | Propagate structure to es.json | 10 min | 0.5 |
| Task 5 | Propagate structure to de.json | 10 min | 0.5 |
| Task 6 | Propagate structure to nl.json | 10 min | 0.5 |
| Task 7 | Propagate structure to it.json | 10 min | 0.5 |
| Task 8 | Verification and testing | 20 min | 0.5 |
| **Total** | | **~2.5 hours** | **4.5** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JSON syntax errors | Low | Medium | Use JSON linter before committing |
| Missing key migration | Low | Low | Use mapping table as checklist |
| ICU format errors | Medium | Low | Test pluralization in dev environment |
| Application fails to start | Low | High | Test after each file modification |

---

## Dependencies for Next Tasks

This task provides the foundation for:
- **Task 2D.2:** Update ItemManager component family (use `items.actions.*`, `items.filters.*`)
- **Task 2D.3:** Update ItemGrid and ItemCard (use `items.card.*`, `items.view.*`)
- **Task 2D.4:** Update filter and sort components (use `items.filters.*`, `items.sort.*`)
- **Task 2D.5:** Update bulk action dialogs (use `items.bulk.*`)
- **Task 2D.6:** Update item detail/edit pages (use `items.detail.*`, `items.metadata.*`)
- **Task 2D.7:** Generate translations for 5 non-English languages (translate all `items.*` keys)

---

## Component Update Priority (for subsequent tasks)

Based on hardcoded string count analysis from overview:

| Priority | Component | Strings | Uses Namespace |
|----------|-----------|---------|----------------|
| 1 | BulkActionsBar.tsx | ~12 | `items.bulk.*` |
| 2 | FilterPanel.tsx | ~12 | `items.filters.*` |
| 3 | ItemManager.tsx | ~15 | `items.actions.*`, `items.list.*` |
| 4 | ItemToolbar.tsx | ~12 | `items.toolbar.*`, `items.search.*` |
| 5 | ConfirmDeleteDialog.tsx | ~10 | `items.delete.*` |
| 6 | ItemCard.tsx / ItemRow.tsx | ~10 each | `items.card.*`, `items.metadata.*` |
| 7 | SortMenu.tsx | ~8 | `items.sort.*` |
| 8 | Remaining components | Various | Various |

---

## Notes

- All translation values in non-English files will initially be English placeholders
- Actual translations will be generated in Task 2D.7 using AI translation
- The structure is designed to be extensible for future item-related features
- Common action words (Save, Cancel, Delete) should reference `common.*` namespace when available
- ARIA labels are included for accessibility compliance

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D - Task 2D.1*
