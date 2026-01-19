# REQ-338: Create Common Namespace Structure in Translation File - Implementation Overview
*Generated: 2026-01-19 00:00:00 UTC*
*Last Modified: 2026-01-19 00:00:00 UTC*

## Reference
- **Request**: REQ-304 (Create Common Namespace Structure in Translation File)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature (Foundation Setup)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2H - Common & Shared Components
- **Task ID**: 2H.1
- **Size**: S
- **Priority**: FIRST - Foundation for all other sub-epics

## Goals
1. Expand the existing `common` namespace in `/messages/en.json` to include all shared translation keys per Plan-111 specification
2. Organize keys into logical sub-categories (actions, status, confirmation, empty, time, pagination, validation)
3. Ensure the structure supports the ~800 estimated shared strings across 275+ components
4. Maintain backward compatibility with existing translation keys already in use
5. Follow the established translation key convention: `{namespace}.{component/area}.{element}.{variant?}`

## Context from Implementation Plan

### Sub-Epic 2H Priority
Per Plan-111, Sub-Epic 2H (Common & Shared Components) is designated as **FIRST** in the recommended implementation order because:
- It provides the foundation for all other sub-epics
- Shared keys enable consistent terminology across the application
- Centralizing common strings reduces translation duplication
- All other sub-epics (2A-2J) will reference these common keys

### Current State Analysis

The current `/messages/en.json` already has a basic `common` namespace with flat structure:
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    // ... ~33 flat keys
  }
}
```

### Target State (Per Plan-111 Specification)

The `common` namespace needs to be expanded with nested sub-categories:
```json
{
  "common": {
    "actions": { ... },      // ~26 action-related strings
    "status": { ... },       // ~12 status indicators
    "confirmation": { ... }, // ~6 confirmation dialog strings
    "empty": { ... },        // ~3 empty state strings
    "time": { ... },         // ~6 relative time strings (with ICU pluralization)
    "pagination": { ... },   // ~4 pagination strings
    "validation": { ... }    // ~4 common validation messages
  }
}
```

### Dependencies
- **Prerequisite**: Epic 1 complete (next-intl installed and configured)
- **Verified**: `/src/lib/i18n/config.ts` exists with locale configuration
- **Verified**: `/messages/en.json` exists with basic common namespace
- **This Task**: No blocking dependencies - can proceed immediately

## Implementation Order

### Step 1: Audit Existing Common Keys
Review the current flat keys in `/messages/en.json` common namespace and map them to the new nested structure to ensure no regressions.

**Current keys to preserve and reorganize:**
- `save`, `cancel`, `delete`, `edit`, `create` → `common.actions.*`
- `loading`, `error`, `success`, `confirm` → `common.status.*`
- `back`, `next`, `close`, `submit`, `reset`, `clear` → `common.actions.*`
- `search`, `filter`, `sort`, `view`, `download`, `upload`, `copy`, `share` → `common.actions.*`
- `more`, `less`, `all`, `none` → `common.actions.*`
- `yes`, `no` → `common.confirmation.*`
- `optional`, `required` → `common.validation.*`

### Step 2: Create Nested Structure with Sub-Categories
Reorganize existing keys and add new keys per Plan-111 specification.

**Sub-categories to create:**

#### `common.actions` (~26 keys)
Primary action buttons and interactive elements used across multiple components.

#### `common.status` (~12 keys)
Loading, saving, success, error, and other status indicators.

#### `common.confirmation` (~6 keys)
Generic confirmation dialog content.

#### `common.empty` (~3 keys)
Empty state placeholders.

#### `common.time` (~6 keys)
Relative time strings with ICU pluralization format.

#### `common.pagination` (~4 keys)
Pagination controls and indicators.

#### `common.validation` (~4 keys)
Common form validation messages.

### Step 3: Apply ICU Message Format for Pluralization
Ensure time and count-based strings use proper ICU format:
```json
{
  "minutesAgo": "{count} {count, plural, one {minute} other {minutes}} ago"
}
```

### Step 4: Propagate Changes to Other Language Files
After updating `en.json`, the same structure must be applied to:
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

### Step 5: Verification
- Verify JSON syntax is valid
- Run application to ensure translations load correctly
- Check that existing components using common keys still work

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/en.json`
- **Purpose**: Primary English translation file (source of truth)
- **Changes**:
  - Restructure existing flat `common` namespace into nested sub-categories
  - Add new translation keys per Plan-111 specification
  - Preserve all existing keys (reorganized into appropriate categories)
- **Key Additions**:
  | Category | New Keys to Add |
  |----------|-----------------|
  | `common.actions` | `done`, `continue`, `retry`, `refresh`, `apply`, `viewAll`, `showMore`, `showLess`, `selectAll`, `deselectAll` |
  | `common.status` | `saving`, `deleting`, `pending`, `completed`, `failed`, `active`, `inactive`, `enabled`, `disabled` |
  | `common.confirmation` | `title`, `deleteTitle`, `deleteMessage`, `unsavedChanges` |
  | `common.empty` | `noData`, `noResults`, `tryAgain` |
  | `common.time` | `justNow`, `minutesAgo`, `hoursAgo`, `daysAgo`, `today`, `yesterday` |
  | `common.pagination` | `previous`, `next`, `page`, `showing` |
  | `common.validation` | `required`, `invalidEmail`, `tooShort`, `tooLong` |

#### `/messages/fr.json`
- **Purpose**: French translation file
- **Changes**: Apply same nested structure, translate new keys to French
- **Scope**: Maintain parity with en.json structure

#### `/messages/es.json`
- **Purpose**: Spanish translation file
- **Changes**: Apply same nested structure, translate new keys to Spanish
- **Scope**: Maintain parity with en.json structure

#### `/messages/de.json`
- **Purpose**: German translation file
- **Changes**: Apply same nested structure, translate new keys to German
- **Scope**: Maintain parity with en.json structure

#### `/messages/nl.json`
- **Purpose**: Dutch translation file
- **Changes**: Apply same nested structure, translate new keys to Dutch
- **Scope**: Maintain parity with en.json structure

#### `/messages/it.json`
- **Purpose**: Italian translation file
- **Changes**: Apply same nested structure, translate new keys to Italian
- **Scope**: Maintain parity with en.json structure

### Files Referenced (Read-Only)

#### `/src/lib/i18n/config.ts`
- **Purpose**: Locale configuration (verify supported locales)
- **Verified**: Supports `en`, `fr`, `es`, `de`, `nl`, `it`

#### `/src/components/ConfirmationModal.tsx`
- **Purpose**: Reference for confirmation dialog strings
- **Observed hardcoded strings**: "Confirm", "Cancel" (line 19-20)

#### `/src/components/ItemManager/components/shared/LoadingState.tsx`
- **Purpose**: Reference for loading state strings
- **Observed hardcoded strings**: "Loading items", "Loading items, please wait..." (lines 111-116)

#### `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- **Purpose**: Reference for delete confirmation strings
- **Observed hardcoded strings**: "Delete Item", "Delete Items", "Cancel", "Deleting..." (lines 62-88, 252, 271)

## Technical Specifications

### Translation Key Convention (From Plan-111)
```
{namespace}.{component/area}.{element}.{variant?}
```

### Target Common Namespace Structure

```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create",
      "submit": "Submit",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "confirm": "Confirm",
      "done": "Done",
      "continue": "Continue",
      "retry": "Retry",
      "refresh": "Refresh",
      "loading": "Loading...",
      "search": "Search",
      "filter": "Filter",
      "sort": "Sort",
      "clear": "Clear",
      "reset": "Reset",
      "apply": "Apply",
      "view": "View",
      "viewAll": "View All",
      "showMore": "Show More",
      "showLess": "Show Less",
      "selectAll": "Select All",
      "deselectAll": "Deselect All",
      "download": "Download",
      "upload": "Upload",
      "copy": "Copy",
      "share": "Share"
    },
    "status": {
      "loading": "Loading...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "success": "Success",
      "error": "Error",
      "pending": "Pending",
      "completed": "Completed",
      "failed": "Failed",
      "active": "Active",
      "inactive": "Inactive",
      "enabled": "Enabled",
      "disabled": "Disabled"
    },
    "confirmation": {
      "title": "Confirm Action",
      "deleteTitle": "Confirm Delete",
      "deleteMessage": "Are you sure you want to delete this? This action cannot be undone.",
      "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?",
      "yes": "Yes",
      "no": "No"
    },
    "empty": {
      "noData": "No data available",
      "noResults": "No results found",
      "tryAgain": "Try again with different filters"
    },
    "time": {
      "justNow": "Just now",
      "minutesAgo": "{count} {count, plural, one {minute} other {minutes}} ago",
      "hoursAgo": "{count} {count, plural, one {hour} other {hours}} ago",
      "daysAgo": "{count} {count, plural, one {day} other {days}} ago",
      "today": "Today",
      "yesterday": "Yesterday"
    },
    "pagination": {
      "previous": "Previous",
      "next": "Next",
      "page": "Page {current} of {total}",
      "showing": "Showing {start} to {end} of {total}"
    },
    "validation": {
      "required": "This field is required",
      "invalidEmail": "Please enter a valid email address",
      "tooShort": "Must be at least {min} characters",
      "tooLong": "Must be less than {max} characters"
    },
    "labels": {
      "actions": "Actions",
      "optional": "Optional",
      "required": "Required",
      "all": "All",
      "none": "None",
      "more": "More",
      "less": "Less",
      "select": "Select"
    }
  }
}
```

### ICU Message Format Examples

**Pluralization:**
```json
"minutesAgo": "{count} {count, plural, one {minute} other {minutes}} ago"
```

**Variable Interpolation:**
```json
"page": "Page {current} of {total}"
```

## Migration Strategy

### Backward Compatibility
The existing flat keys like `common.save`, `common.cancel` will be restructured to `common.actions.save`, `common.actions.cancel`. This requires:

1. **No immediate component updates** - Components can continue using existing keys until Task 2H.2+ explicitly updates them
2. **Parallel structure option** - Temporarily keep flat keys alongside nested keys if needed for gradual migration
3. **Recommended approach** - Update all keys to nested structure and update components in subsequent tasks (2H.2-2H.10)

### Key Mapping Reference

| Old Key (Flat) | New Key (Nested) |
|----------------|------------------|
| `common.save` | `common.actions.save` |
| `common.cancel` | `common.actions.cancel` |
| `common.delete` | `common.actions.delete` |
| `common.edit` | `common.actions.edit` |
| `common.create` | `common.actions.create` |
| `common.loading` | `common.status.loading` |
| `common.error` | `common.status.error` |
| `common.success` | `common.status.success` |
| `common.confirm` | `common.actions.confirm` |
| `common.back` | `common.actions.back` |
| `common.next` | `common.actions.next` |
| `common.close` | `common.actions.close` |
| `common.search` | `common.actions.search` |
| `common.filter` | `common.actions.filter` |
| `common.sort` | `common.actions.sort` |
| `common.yes` | `common.confirmation.yes` |
| `common.no` | `common.confirmation.no` |
| `common.submit` | `common.actions.submit` |
| `common.reset` | `common.actions.reset` |
| `common.clear` | `common.actions.clear` |
| `common.select` | `common.labels.select` |
| `common.view` | `common.actions.view` |
| `common.download` | `common.actions.download` |
| `common.upload` | `common.actions.upload` |
| `common.copy` | `common.actions.copy` |
| `common.share` | `common.actions.share` |
| `common.more` | `common.labels.more` |
| `common.less` | `common.labels.less` |
| `common.all` | `common.labels.all` |
| `common.none` | `common.labels.none` |
| `common.optional` | `common.labels.optional` |
| `common.required` | `common.validation.required` |
| `common.actions` | `common.labels.actions` |

## Success Validation Checklist

### Structure Verification
- [ ] `/messages/en.json` contains nested `common` namespace with all sub-categories
- [ ] `common.actions` sub-category contains all action-related keys
- [ ] `common.status` sub-category contains all status indicator keys
- [ ] `common.confirmation` sub-category contains confirmation dialog keys
- [ ] `common.empty` sub-category contains empty state keys
- [ ] `common.time` sub-category contains relative time keys with ICU format
- [ ] `common.pagination` sub-category contains pagination keys
- [ ] `common.validation` sub-category contains common validation keys
- [ ] `common.labels` sub-category contains general label keys

### JSON Validity
- [ ] All 6 translation files (`en`, `fr`, `es`, `de`, `nl`, `it`) are valid JSON
- [ ] All 6 files have identical key structures
- [ ] ICU pluralization syntax is correct in all files

### Functional Verification
- [ ] Application starts without i18n errors
- [ ] next-intl loads translation files correctly
- [ ] No missing translation warnings in console

### Translation Completeness
- [ ] French translations complete for all new keys
- [ ] Spanish translations complete for all new keys
- [ ] German translations complete for all new keys
- [ ] Dutch translations complete for all new keys
- [ ] Italian translations complete for all new keys

## Notes

### Pattern Alignment
- Follow ICU message format for pluralization (standard supported by next-intl)
- Use camelCase for translation keys (matching existing codebase convention)
- Maintain alphabetical ordering within each sub-category for maintainability

### Future Integration Points
- Task 2H.2-2H.10 will update components to use these new translation keys
- Components like `ConfirmationModal.tsx` will use `t('common.confirmation.yes')` etc.
- Convenience hook `useCommonTranslations` may be created in Task 2H.11

### Extensibility
The structure is designed to be extensible:
- New action types can be added to `common.actions`
- Additional validation messages can be added to `common.validation`
- Domain-specific common strings can be added as new sub-categories

## Dependencies
- next-intl package (already installed via Epic 1)
- Valid `/messages/*.json` files (already exist via Epic 1)
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
- **Estimated Time**: 2-4 hours
- **Breakdown**:
  - Restructure en.json: 30 minutes
  - Generate translations for 5 other languages: 1-2 hours
  - Verification and testing: 30 minutes
