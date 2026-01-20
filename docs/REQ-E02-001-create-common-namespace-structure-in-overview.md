# REQ-E02-001: Create Common Namespace Structure in Messages File - Implementation Overview

*Generated: 2026-01-19 08:30:00 UTC*
*Last Modified: 2026-01-19 08:30:00 UTC*

## Reference

- **Request**: REQ-E02-001 (Create Common Namespace Structure in Messages File)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.1
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

## Summary

Create a well-organized `common` namespace within the `/messages/en.json` file containing shared UI strings used across multiple components throughout the application. This serves as the foundation for all Epic 2 sub-epics by providing reusable translation keys for buttons, status indicators, confirmations, pagination, and validation messages.

## Goals

1. Expand the existing `common` namespace in `/messages/en.json` with comprehensive, categorized UI strings
2. Organize strings into logical subcategories (actions, status, confirmation, empty, time, pagination, validation)
3. Implement ICU format for pluralization and variable interpolation where appropriate
4. Follow the naming conventions established in Epic 1 and Plan-111
5. Ensure all strings are properly structured and accessible via `useTranslations('common')`
6. Enable consistent terminology across the application to reduce translation costs

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 is already in place:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |

### Existing Common Namespace

The current `/messages/en.json` already contains a basic `common` namespace with ~35 keys:
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    ...
  }
}
```

### Target Structure (from Plan-111)

The implementation plan specifies expanding `common` to include:

```json
{
  "common": {
    "actions": { ... },      // ~26 action buttons/labels
    "status": { ... },       // ~12 status indicators
    "confirmation": { ... }, // ~6 confirmation dialogs
    "empty": { ... },        // ~3 empty state messages
    "time": { ... },         // ~6 relative time patterns
    "pagination": { ... },   // ~4 pagination labels
    "validation": { ... }    // ~4 basic validation messages
  }
}
```

### Estimated String Count

- **Current**: ~35 strings (flat structure)
- **Target**: ~60-70 strings (categorized structure)
- **New strings to add**: ~35
- **Restructure existing**: ~35

## Implementation Order

### Step 1: Analyze Existing Common Namespace

Review the current `/messages/en.json` to identify:
- Which strings already exist and can be kept
- Which strings need to be moved into subcategories
- Which new strings need to be added

### Step 2: Create Categorized Structure

Transform the flat `common` namespace into a hierarchical structure:

```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      ...
    },
    "status": {
      "loading": "Loading...",
      ...
    },
    ...
  }
}
```

### Step 3: Add New Strings

Add missing strings specified in Plan-111:
- Relative time patterns with ICU pluralization
- Pagination patterns with variables
- Additional action verbs
- Status indicators

### Step 4: Validate JSON Structure

- Ensure valid JSON syntax
- Verify all ICU message format patterns are correct
- Check for duplicate keys

### Step 5: Update Other Language Files

Apply the same structure to all 5 non-English language files:
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

Note: Translations will be generated in a separate task (2H.10).

## Authorized Files and Functions for Modification

### Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file (source of truth)
- **Current State**: Contains basic `common`, `auth`, `dashboard`, `items`, `errors`, `language` namespaces
- **Modification Required**: Expand `common` namespace with categorized subcategories
- **Changes**:
  - Restructure existing flat `common` keys into `common.actions`, `common.status`, etc.
  - Add new keys for time formatting, pagination, confirmation dialogs
  - Implement ICU message format for pluralization patterns

**Example Transformation:**

```json
// BEFORE (current)
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading...",
    ...
  }
}

// AFTER (target)
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
      "deselectAll": "Deselect All"
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
      "minutesAgo": "{count, plural, one {# minute ago} other {# minutes ago}}",
      "hoursAgo": "{count, plural, one {# hour ago} other {# hours ago}}",
      "daysAgo": "{count, plural, one {# day ago} other {# days ago}}",
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
    }
  }
}
```

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification Required**: Apply same structure (English placeholders initially)
- **Note**: Actual translations will be generated in Task 2H.10

### Files NOT to Modify

- `/src/lib/i18n/config.ts` - No changes needed
- `/src/lib/i18n/index.ts` - No changes needed
- `/src/app/layout.tsx` - IntlProvider already configured
- Any component files - Components will be updated in subsequent tasks

## Technical Specifications

### ICU Message Format Patterns

The following patterns use ICU message format for pluralization:

```json
{
  "time": {
    "minutesAgo": "{count, plural, one {# minute ago} other {# minutes ago}}",
    "hoursAgo": "{count, plural, one {# hour ago} other {# hours ago}}",
    "daysAgo": "{count, plural, one {# day ago} other {# days ago}}"
  }
}
```

**Usage in Components:**
```typescript
const t = useTranslations('common.time');
t('minutesAgo', { count: 5 }); // "5 minutes ago"
t('minutesAgo', { count: 1 }); // "1 minute ago"
```

### Variable Interpolation Patterns

```json
{
  "pagination": {
    "page": "Page {current} of {total}",
    "showing": "Showing {start} to {end} of {total}"
  },
  "validation": {
    "tooShort": "Must be at least {min} characters",
    "tooLong": "Must be less than {max} characters"
  }
}
```

**Usage in Components:**
```typescript
const t = useTranslations('common.pagination');
t('page', { current: 1, total: 10 }); // "Page 1 of 10"
t('showing', { start: 1, end: 20, total: 100 }); // "Showing 1 to 20 of 100"
```

### Translation Key Naming Convention

Following Plan-111 convention:
```
{namespace}.{category}.{element}.{variant?}
```

Examples:
- `common.actions.save` - Save action button
- `common.status.loading` - Loading status indicator
- `common.time.minutesAgo` - Relative time format
- `common.confirmation.deleteTitle` - Delete confirmation dialog title

## Usage Patterns

### Client Component Usage

```typescript
'use client';
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');

  return (
    <div>
      <button>{t('actions.save')}</button>
      <button>{t('actions.cancel')}</button>
      <span>{t('status.loading')}</span>
    </div>
  );
}
```

### Convenience Pattern (Optional - Task 2H.11)

A convenience hook may be created later in Task 2H.11:

```typescript
// Potential useCommonTranslations hook
import { useTranslations } from 'next-intl';

export function useCommonTranslations() {
  const t = useTranslations('common');

  return {
    actions: (key: string) => t(`actions.${key}`),
    status: (key: string) => t(`status.${key}`),
    confirmation: (key: string) => t(`confirmation.${key}`),
    // ... etc
  };
}
```

## Migration Considerations

### Backward Compatibility

The existing LogoutButton component uses:
```typescript
const tCommon = useTranslations('common');
tCommon('cancel'); // Currently works with flat structure
```

After this change, the access pattern changes:
```typescript
tCommon('actions.cancel'); // New nested path
```

**Important**: Components using the old flat `common` keys will need to be updated to use the new nested paths. This is expected as part of Epic 2's component updates.

### Temporary Approach

To maintain backward compatibility during the transition, consider:
1. Keep both old and new keys temporarily
2. Deprecate old keys with comments
3. Remove old keys after all components are updated

```json
{
  "common": {
    "cancel": "Cancel",  // DEPRECATED: Use common.actions.cancel
    "actions": {
      "cancel": "Cancel"
    }
  }
}
```

## Success Validation Checklist

### Structure Validation
- [ ] `common.actions` subcategory exists with ~26 action strings
- [ ] `common.status` subcategory exists with ~12 status strings
- [ ] `common.confirmation` subcategory exists with ~6 confirmation strings
- [ ] `common.empty` subcategory exists with ~3 empty state strings
- [ ] `common.time` subcategory exists with ~6 time-related strings
- [ ] `common.pagination` subcategory exists with ~4 pagination strings
- [ ] `common.validation` subcategory exists with ~4 validation strings

### ICU Format Validation
- [ ] Pluralization patterns are syntactically correct
- [ ] Variable interpolation patterns use correct `{variable}` syntax
- [ ] No unterminated brackets or braces

### JSON Validation
- [ ] `/messages/en.json` is valid JSON
- [ ] All 6 language files maintain consistent structure
- [ ] No duplicate keys within namespaces

### Integration Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Sample usage works: `useTranslations('common.actions')` returns correct strings
- [ ] ICU patterns work: `t('time.minutesAgo', { count: 5 })` returns "5 minutes ago"

## Dependencies

### Required (Already Installed)
- `next-intl` - i18n framework (installed in Epic 1)
- TypeScript 5.x - Type checking

### No New Dependencies Required
This task only modifies JSON translation files.

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Changes are additive (expanding existing namespace)
  - JSON files have no runtime execution risk
  - Easy to validate with JSON linting
  - Rollback is straightforward (restore previous JSON)

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Malformed ICU syntax | Medium | Low | Validate with next-intl's built-in checking |
| Missing keys in non-English files | Medium | Low | Use English as fallback, structure will be synced |
| Component breakage from path changes | Medium | Medium | Update components in subsequent tasks |

## Future Integration Points

This namespace structure will be consumed by:

1. **Task 2H.2-2H.9**: Component updates will import from `common` namespace
2. **Task 2H.10**: Translation generation for non-English languages
3. **Task 2H.11**: Optional `useCommonTranslations` convenience hook
4. **All other Epic 2 sub-epics**: Reference common strings instead of duplicating

## Notes

### Alignment with Plan-111

This implementation follows the exact structure specified in Plan-111, Section "Sub-Epic 2H: Common & Shared Components", including:
- Same key names and hierarchy
- Same ICU message format patterns
- Same categorization approach

### String Reusability

The `common` namespace is designed for maximum reusability:
- Action buttons used in 50+ components
- Status indicators used in 30+ components
- Confirmation patterns used in 20+ dialogs
- Pagination used in all list views

Centralizing these reduces:
- Total translation entries needed
- Risk of inconsistent terminology
- Translation costs (fewer unique strings)

---

*End of Implementation Overview*
