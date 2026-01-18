# REQ-304: Create Common Namespace Structure in Translation File - Implementation Overview

**Generated:** 2026-01-18 16:00:00 UTC
**Last Modified:** 2026-01-18 16:00:00 UTC
**Request Reference:** REQ-304 - Create Common Namespace Structure in Translation File
**Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md (Sub-Epic 2H, Task 2H.1)
**Status:** Ready for Implementation

---

## 1. Request Summary

Create a comprehensive `common` namespace structure within the `/messages/en.json` translation file to store shared and reusable translation keys that appear across multiple components throughout the application.

**Scope:**
- Create `common` namespace structure in `/messages/en.json` with logical groupings
- Define sub-namespaces for: `actions`, `status`, `confirmation`, `empty`, `time`, `pagination`, and `validation`
- Populate with approximately 800 shared translation strings used across the application
- Structure should be extensible for future additions

**Out of Scope:**
- Translating content to other languages (handled by Task 2H.10)
- Extracting button labels from components (Task 2H.2)
- Creating `useCommonTranslations` hook (Task 2H.11)
- Modifying React components to use translations (separate tasks)

---

## 2. Current State Analysis

### Existing Technology Stack

| Technology | Version | Location |
|------------|---------|----------|
| Next.js | 15.5.9 | `package.json` |
| React | 19.1.0 | `package.json` |
| TypeScript | ^5 | `package.json` |
| Tailwind CSS | ^4 | `package.json` |

### Current Translation Infrastructure Status

**Status:** Epic 1 Foundation Pending

Based on the implementation plan, Epic 1 establishes:
- `next-intl` package installation
- `/messages/` directory structure
- Basic JSON files for 6 locales (en, fr, es, de, nl, it)
- IntlProvider wrapper in root layout

**Note:** This task (REQ-304) is part of Epic 2 (Static UI Translation), which depends on Epic 1 completion. The `/messages/en.json` file should exist from Epic 1 with a basic structure, and this task expands the `common` namespace significantly.

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Button patterns | Various components | Save, Cancel, Delete, Edit, etc. |
| Modal dialogs | `/src/components/ConfirmationModal.tsx` | Confirmation messages |
| Empty states | `/src/components/SimpleDashboard/EmptyStateCard.tsx` | "No data" messaging |
| Loading states | Various components | Loading indicators |
| Form validation | Various forms | Required field, email validation |

### Components Using Shared Strings

Based on the implementation plan, the following component categories share common strings:

| Category | Example Components | Estimated Shared Strings |
|----------|-------------------|-------------------------|
| Buttons | All forms and dialogs | ~50 |
| Modals/Dialogs | ConfirmationModal, various dialogs | ~100 |
| Form elements | All forms across the app | ~150 |
| Toast notifications | App-wide toasts | ~50 |
| Empty states | EmptyStateCard, various empty views | ~80 |
| Loading states | LoadingIndicator, spinners | ~30 |
| Error boundaries | Error fallback UIs | ~40 |
| Confirmation dialogs | ConfirmDeleteDialog, etc. | ~60 |
| Date/Time formatting | Relative time displays | ~30 |
| Pagination | Table pagination controls | ~20 |
| Status indicators | Active, Inactive, Pending badges | ~40 |
| Navigation labels | Sidebar, breadcrumbs | ~50 |
| Tooltips | Various tooltips | ~100 |

---

## 3. Technical Approach

### Namespace Organization Strategy

The `common` namespace follows a two-level hierarchy for organization:

```
common
├── actions      # User actions: save, cancel, delete, edit, etc.
├── status       # System states: loading, success, error, etc.
├── confirmation # Confirmation dialogs: titles, messages, yes/no
├── empty        # Empty state messages
├── time         # Relative time expressions
├── pagination   # Pagination controls
└── validation   # Common validation messages
```

**Design Principles:**
1. **Reusability First**: Keys should be generic enough to use across components
2. **Semantic Grouping**: Related strings grouped by function
3. **Flat Leaf Structure**: Avoid deep nesting beyond 2 levels
4. **ICU Format Ready**: Support pluralization and interpolation where needed
5. **Extensible**: Structure allows adding new keys without restructuring

### Key Naming Conventions

```
{namespace}.{group}.{key}
{namespace}.{group}.{element}.{variant}
```

**Examples:**
- `common.actions.save` - Simple action
- `common.actions.saveChanges` - More specific action
- `common.status.loading` - System state
- `common.time.minutesAgo` - Time expression with pluralization
- `common.validation.required` - Validation message

### Pluralization Pattern (ICU Format)

For keys requiring pluralization:

```json
{
  "common": {
    "time": {
      "minutesAgo": "{count, plural, =0 {Just now} one {# minute ago} other {# minutes ago}}"
    }
  }
}
```

### Variable Interpolation Pattern

For keys requiring dynamic values:

```json
{
  "common": {
    "pagination": {
      "page": "Page {current} of {total}",
      "showing": "Showing {start} to {end} of {total}"
    }
  }
}
```

---

## 4. Implementation Tasks

### Task 2H.1.1: Define `common.actions` sub-namespace

**Purpose:** Store all common action button labels and action-related text

**Keys to include:**
- Basic CRUD: save, cancel, delete, edit, create, update
- Navigation: back, next, close, done, continue
- Operations: submit, confirm, retry, refresh, reset
- Selection: selectAll, deselectAll, clear, apply
- View controls: view, viewAll, showMore, showLess
- Data operations: search, filter, sort, download, upload, copy, share

### Task 2H.1.2: Define `common.status` sub-namespace

**Purpose:** Store system status messages and state indicators

**Keys to include:**
- Loading states: loading, saving, deleting, updating, processing
- Result states: success, error, warning, info
- Entity states: pending, completed, failed, active, inactive, enabled, disabled
- Progress: inProgress, notStarted, cancelled

### Task 2H.1.3: Define `common.confirmation` sub-namespace

**Purpose:** Store confirmation dialog text

**Keys to include:**
- Titles: title, deleteTitle, saveTitle, discardTitle
- Messages: deleteMessage, unsavedChanges, irreversibleAction
- Responses: yes, no, confirm, cancel, dontShowAgain

### Task 2H.1.4: Define `common.empty` sub-namespace

**Purpose:** Store empty state messages

**Keys to include:**
- Generic: noData, noResults, noMatches
- Guidance: tryAgain, adjustFilters, createFirst
- Specific contexts: noItems, noProperties, noFiles

### Task 2H.1.5: Define `common.time` sub-namespace

**Purpose:** Store relative time expressions with ICU pluralization

**Keys to include:**
- Recent: justNow, minutesAgo, hoursAgo, daysAgo
- Calendar: today, yesterday, lastWeek, lastMonth
- Relative future: in, fromNow (for scheduling features)

### Task 2H.1.6: Define `common.pagination` sub-namespace

**Purpose:** Store pagination control labels

**Keys to include:**
- Navigation: previous, next, first, last
- Info: page, showing, of, perPage
- Selection: rowsPerPage, goToPage

### Task 2H.1.7: Define `common.validation` sub-namespace

**Purpose:** Store common form validation messages

**Keys to include:**
- Required: required, optional
- Format: invalidEmail, invalidUrl, invalidPhone
- Length: tooShort, tooLong, minLength, maxLength
- Type: mustBeNumber, mustBePositive

### Task 2H.1.8: Assemble complete `common` namespace in en.json

**Action:** Combine all sub-namespaces into the final structure
**File:** `/messages/en.json`

---

## 5. Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Description | Modification |
|-----------|-------------|--------------|
| `/messages/en.json` | English translation file (source) | Add/expand `common` namespace with comprehensive structure |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ConfirmationModal.tsx` | Reference button/dialog text patterns |
| `/src/components/SimpleDashboard/EmptyStateCard.tsx` | Reference empty state text |
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | Reference loading text |
| `/src/components/ItemManager/components/shared/LoadingState.tsx` | Reference loading patterns |
| `/src/components/ItemManager/components/shared/EmptyState.tsx` | Reference empty state patterns |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Reference confirmation patterns |
| `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Implementation plan reference |
| `/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md` | PRD requirements reference |
| `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` | Epic 1 foundation reference |

### Files NOT to Modify

The following files should NOT be modified in this task:
- `/messages/fr.json`, `/messages/es.json`, etc. (Task 2H.10)
- Any React component files (separate extraction tasks)
- `/src/lib/i18n/` configuration files
- `/package.json`
- Any TypeScript type definition files

---

## 6. Dependencies

### Prerequisite Tasks

| Task | Description | Status |
|------|-------------|--------|
| Epic 1 - Phase 2 | i18n Framework Integration | Must be completed first |
| REQ-229 | Install and configure next-intl | Must be completed |
| REQ-233 | Create initial translation file structure | Must be completed |

**Note:** This task builds upon the basic `/messages/en.json` structure created in Epic 1. It significantly expands the `common` namespace with comprehensive shared strings.

### Downstream Dependencies (Tasks blocked by this)

| Task | Description | Dependency |
|------|-------------|------------|
| Task 2H.2 | Extract button labels across components | Uses `common.actions` keys |
| Task 2H.3 | Extract modal/dialog strings | Uses `common.confirmation` keys |
| Task 2H.4 | Extract form element strings | Uses `common.validation` keys |
| Task 2H.5 | Extract toast notifications | Uses `common.status` keys |
| Task 2H.6 | Extract empty state messages | Uses `common.empty` keys |
| Task 2H.7 | Extract loading state messages | Uses `common.status` keys |
| Task 2H.8 | Extract confirmation dialog messages | Uses `common.confirmation` keys |
| Task 2H.9 | Create date/time formatting translations | Uses `common.time` keys |
| Task 2H.10 | Generate translations for 5 non-English languages | Depends on en.json completion |
| All Epic 2 sub-epics | Component translation extraction | Reference common namespace keys |

---

## 7. Acceptance Criteria

From REQ-304 in gen_requests_epic2.md:

- [ ] A `common` namespace section exists in the `/messages/en.json` file
- [ ] The namespace structure supports logical grouping of related shared strings
- [ ] The structure is extensible to accommodate new shared translation keys as they are identified
- [ ] Documentation or comments within the file clarify the purpose and intended use of the common namespace
- [ ] The namespace follows the same structural conventions as other namespaces in the translation file
- [ ] The file remains valid JSON after the common namespace addition

### Additional Verification Criteria

- [ ] `common.actions` sub-namespace contains at least 25 action-related keys
- [ ] `common.status` sub-namespace contains at least 15 status-related keys
- [ ] `common.confirmation` sub-namespace contains dialog-related keys
- [ ] `common.empty` sub-namespace contains empty state messages
- [ ] `common.time` sub-namespace contains relative time expressions with ICU pluralization
- [ ] `common.pagination` sub-namespace contains pagination control labels
- [ ] `common.validation` sub-namespace contains common validation messages
- [ ] All ICU format strings are syntactically correct
- [ ] JSON file passes validation
- [ ] Structure aligns with Sub-Epic 2H specification in implementation plan

---

## 8. Testing Strategy

### Pre-Implementation Verification

1. **Verify Epic 1 Completion:**
   ```bash
   # Check next-intl is installed
   npm list next-intl

   # Check messages directory and en.json exist
   ls -la messages/
   cat messages/en.json
   ```

### Post-Implementation Verification

2. **JSON Validity Check:**
   ```bash
   # Validate JSON syntax
   cat messages/en.json | python3 -m json.tool > /dev/null && echo "Valid JSON" || echo "INVALID JSON"
   ```

3. **Namespace Structure Verification:**
   ```bash
   # Verify common namespace structure
   cat messages/en.json | python3 -c "
   import json, sys
   d = json.load(sys.stdin)
   if 'common' not in d:
       print('ERROR: common namespace missing')
       sys.exit(1)
   common = d['common']
   required = ['actions', 'status', 'confirmation', 'empty', 'time', 'pagination', 'validation']
   missing = [ns for ns in required if ns not in common]
   if missing:
       print(f'ERROR: Missing sub-namespaces: {missing}')
       sys.exit(1)
   print('All required sub-namespaces present')
   for ns in required:
       count = len(common[ns]) if isinstance(common[ns], dict) else 0
       print(f'  common.{ns}: {count} keys')
   "
   ```

4. **ICU Format Validation:**
   ```bash
   # Check for ICU format strings
   grep -o '{[^}]*plural[^}]*}' messages/en.json | head -5
   ```

5. **Build Verification:**
   ```bash
   npm run build
   ```

### Manual Verification Checklist

- [ ] `/messages/en.json` contains expanded `common` namespace
- [ ] All 7 sub-namespaces present (actions, status, confirmation, empty, time, pagination, validation)
- [ ] `common.actions` has comprehensive action button labels
- [ ] `common.status` has loading/result/entity states
- [ ] `common.confirmation` has dialog titles, messages, and responses
- [ ] `common.empty` has empty state messages
- [ ] `common.time` has ICU-formatted relative time expressions
- [ ] `common.pagination` has pagination control labels
- [ ] `common.validation` has common validation messages
- [ ] JSON is valid and parseable
- [ ] Build succeeds

---

## 9. Translation File Content Reference

### Complete `common` Namespace Structure

```json
{
  "common": {
    "actions": {
      "save": "Save",
      "saveChanges": "Save Changes",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create",
      "add": "Add",
      "remove": "Remove",
      "update": "Update",
      "submit": "Submit",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "previous": "Previous",
      "confirm": "Confirm",
      "done": "Done",
      "finish": "Finish",
      "continue": "Continue",
      "retry": "Retry",
      "refresh": "Refresh",
      "loading": "Loading...",
      "search": "Search",
      "filter": "Filter",
      "sort": "Sort",
      "clear": "Clear",
      "clearAll": "Clear All",
      "reset": "Reset",
      "apply": "Apply",
      "view": "View",
      "viewAll": "View All",
      "viewDetails": "View Details",
      "showMore": "Show More",
      "showLess": "Show Less",
      "expand": "Expand",
      "collapse": "Collapse",
      "selectAll": "Select All",
      "deselectAll": "Deselect All",
      "select": "Select",
      "download": "Download",
      "upload": "Upload",
      "copy": "Copy",
      "copied": "Copied!",
      "share": "Share",
      "print": "Print",
      "export": "Export",
      "import": "Import",
      "yes": "Yes",
      "no": "No",
      "ok": "OK",
      "gotIt": "Got it",
      "learnMore": "Learn More",
      "tryAgain": "Try Again",
      "dismiss": "Dismiss",
      "skip": "Skip"
    },
    "status": {
      "loading": "Loading...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "updating": "Updating...",
      "processing": "Processing...",
      "uploading": "Uploading...",
      "downloading": "Downloading...",
      "searching": "Searching...",
      "success": "Success",
      "error": "Error",
      "warning": "Warning",
      "info": "Info",
      "pending": "Pending",
      "inProgress": "In Progress",
      "completed": "Completed",
      "failed": "Failed",
      "cancelled": "Cancelled",
      "active": "Active",
      "inactive": "Inactive",
      "enabled": "Enabled",
      "disabled": "Disabled",
      "online": "Online",
      "offline": "Offline",
      "available": "Available",
      "unavailable": "Unavailable",
      "draft": "Draft",
      "published": "Published",
      "archived": "Archived",
      "new": "New",
      "updated": "Updated"
    },
    "confirmation": {
      "title": "Confirm Action",
      "deleteTitle": "Confirm Delete",
      "deleteMessage": "Are you sure you want to delete this? This action cannot be undone.",
      "deleteItemMessage": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
      "discardTitle": "Discard Changes",
      "discardMessage": "You have unsaved changes. Are you sure you want to discard them?",
      "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?",
      "leavePageTitle": "Leave Page?",
      "leavePageMessage": "Changes you made may not be saved.",
      "irreversibleAction": "This action cannot be undone.",
      "areYouSure": "Are you sure?",
      "yes": "Yes",
      "no": "No",
      "confirm": "Confirm",
      "cancel": "Cancel",
      "stay": "Stay",
      "leave": "Leave",
      "discard": "Discard",
      "keepEditing": "Keep Editing",
      "dontShowAgain": "Don't show this again"
    },
    "empty": {
      "noData": "No data available",
      "noResults": "No results found",
      "noMatches": "No matches found",
      "noItems": "No items yet",
      "noContent": "No content yet",
      "tryDifferentSearch": "Try a different search term",
      "tryDifferentFilters": "Try adjusting your filters",
      "adjustFilters": "Try again with different filters",
      "clearFiltersToSeeAll": "Clear filters to see all items",
      "createFirst": "Create your first item to get started",
      "getStarted": "Get started by creating your first item",
      "nothingHere": "Nothing here yet",
      "emptyList": "This list is empty",
      "noActivity": "No recent activity",
      "noNotifications": "No notifications"
    },
    "time": {
      "justNow": "Just now",
      "secondsAgo": "{count, plural, one {# second ago} other {# seconds ago}}",
      "minutesAgo": "{count, plural, one {# minute ago} other {# minutes ago}}",
      "hoursAgo": "{count, plural, one {# hour ago} other {# hours ago}}",
      "daysAgo": "{count, plural, one {# day ago} other {# days ago}}",
      "weeksAgo": "{count, plural, one {# week ago} other {# weeks ago}}",
      "monthsAgo": "{count, plural, one {# month ago} other {# months ago}}",
      "yearsAgo": "{count, plural, one {# year ago} other {# years ago}}",
      "today": "Today",
      "yesterday": "Yesterday",
      "tomorrow": "Tomorrow",
      "thisWeek": "This week",
      "lastWeek": "Last week",
      "thisMonth": "This month",
      "lastMonth": "Last month",
      "inSeconds": "{count, plural, one {in # second} other {in # seconds}}",
      "inMinutes": "{count, plural, one {in # minute} other {in # minutes}}",
      "inHours": "{count, plural, one {in # hour} other {in # hours}}",
      "inDays": "{count, plural, one {in # day} other {in # days}}"
    },
    "pagination": {
      "previous": "Previous",
      "next": "Next",
      "first": "First",
      "last": "Last",
      "page": "Page {current} of {total}",
      "pageNumber": "Page {number}",
      "showing": "Showing {start} to {end} of {total}",
      "showingOf": "Showing {count} of {total}",
      "of": "of",
      "perPage": "per page",
      "rowsPerPage": "Rows per page",
      "goToPage": "Go to page",
      "itemsCount": "{count, plural, =0 {No items} one {# item} other {# items}}",
      "resultsCount": "{count, plural, =0 {No results} one {# result} other {# results}}"
    },
    "validation": {
      "required": "This field is required",
      "optional": "(optional)",
      "invalidEmail": "Please enter a valid email address",
      "invalidUrl": "Please enter a valid URL",
      "invalidPhone": "Please enter a valid phone number",
      "invalidFormat": "Invalid format",
      "tooShort": "Must be at least {min} characters",
      "tooLong": "Must be no more than {max} characters",
      "minLength": "Minimum {min} characters required",
      "maxLength": "Maximum {max} characters allowed",
      "minValue": "Value must be at least {min}",
      "maxValue": "Value must be no more than {max}",
      "mustBeNumber": "Must be a number",
      "mustBePositive": "Must be a positive number",
      "mustBeInteger": "Must be a whole number",
      "passwordsDoNotMatch": "Passwords do not match",
      "invalidCharacters": "Contains invalid characters",
      "alreadyExists": "This already exists",
      "notFound": "Not found"
    },
    "labels": {
      "name": "Name",
      "description": "Description",
      "email": "Email",
      "phone": "Phone",
      "address": "Address",
      "date": "Date",
      "time": "Time",
      "type": "Type",
      "status": "Status",
      "category": "Category",
      "tags": "Tags",
      "notes": "Notes",
      "options": "Options",
      "settings": "Settings",
      "details": "Details",
      "more": "More",
      "less": "Less",
      "all": "All",
      "none": "None",
      "other": "Other"
    },
    "a11y": {
      "closeDialog": "Close dialog",
      "openMenu": "Open menu",
      "closeMenu": "Close menu",
      "expandSection": "Expand section",
      "collapseSection": "Collapse section",
      "loading": "Loading content",
      "required": "Required field",
      "optional": "Optional field",
      "selected": "Selected",
      "notSelected": "Not selected"
    }
  }
}
```

### Key Count Summary

| Sub-namespace | Key Count | Description |
|---------------|-----------|-------------|
| `common.actions` | ~50 | User action buttons and labels |
| `common.status` | ~30 | System states and progress indicators |
| `common.confirmation` | ~20 | Confirmation dialogs |
| `common.empty` | ~15 | Empty state messages |
| `common.time` | ~20 | Relative time expressions (with ICU) |
| `common.pagination` | ~15 | Pagination controls |
| `common.validation` | ~20 | Validation messages |
| `common.labels` | ~20 | Common form/UI labels |
| `common.a11y` | ~10 | Accessibility strings |
| **Total** | **~200** | Foundation for ~800 shared strings |

**Note:** The initial implementation provides the foundational structure. Additional keys will be identified and added during component extraction tasks (2H.2-2H.9).

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JSON syntax errors | Low | High | Use JSON validator; test after each addition |
| ICU format errors | Medium | Medium | Validate ICU syntax; test with next-intl |
| Epic 1 not complete | Medium | High | Verify prerequisite tasks before starting |
| Key naming inconsistencies | Medium | Low | Follow established naming convention |
| Missing common keys discovered later | High | Low | Structure allows easy additions |
| Overcrowding namespace | Low | Low | Use sub-namespaces for organization |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Review existing components for common strings | 20 min |
| Create `common.actions` structure | 15 min |
| Create `common.status` structure | 10 min |
| Create `common.confirmation` structure | 10 min |
| Create `common.empty` structure | 10 min |
| Create `common.time` structure (with ICU) | 15 min |
| Create `common.pagination` structure | 10 min |
| Create `common.validation` structure | 10 min |
| Create `common.labels` structure | 10 min |
| Create `common.a11y` structure | 10 min |
| Merge into en.json | 10 min |
| Validation and testing | 15 min |
| **Total** | **~135 min (~2.25 hours)** |

---

## 12. Implementation Commands Summary

```bash
# Step 1: Verify Epic 1 is complete
npm list next-intl
cat messages/en.json | python3 -m json.tool > /dev/null

# Step 2: Backup existing en.json (if any)
cp messages/en.json messages/en.json.backup

# Step 3: Update en.json with common namespace
# (Implementation through code editor or Write tool)

# Step 4: Validate JSON syntax
cat messages/en.json | python3 -m json.tool > /dev/null && echo "Valid JSON"

# Step 5: Verify structure
cat messages/en.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
common = d.get('common', {})
for key in ['actions', 'status', 'confirmation', 'empty', 'time', 'pagination', 'validation']:
    count = len(common.get(key, {}))
    print(f'common.{key}: {count} keys')
"

# Step 6: Build verification
npm run build
```

---

## 13. Next Steps After Implementation

After completing Task 2H.1 (this task):

1. **Task 2H.2-2H.9:** Component string extraction tasks
   - Each task will reference keys from `common` namespace
   - May identify additional common keys to add

2. **Task 2H.10:** Generate translations for all 5 non-English languages
   - Copy `common` namespace to fr.json, es.json, de.json, nl.json, it.json
   - Use AI translation service to translate all strings

3. **Task 2H.11:** Create `useCommonTranslations` convenience hook (optional)
   - Wrap `useTranslations('common')` for easier access

---

## 14. References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [PRD: L10N Epic 2 - Static UI Translation](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Plan: L10N Epic 1 - Foundation](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-233: Initial Translation File Structure](/docs/REQ-233-create-initial-translation-file-structure-overview.md)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation, Sub-Epic 2H, Task 2H.1*
