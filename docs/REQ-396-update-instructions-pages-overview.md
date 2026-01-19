# REQ-396: Update Instructions Pages for Localization - Implementation Overview

**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-396
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.5
**Size:** M (Medium)
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Summary

Instructions pages and their associated components must display all interface elements, table headers, labels, and feedback messages in the user's selected language by retrieving text from translation files rather than using hardcoded English strings. This task covers the main Instructions page (`/dashboard2/instructions`), the InstructionsTable component family, InstructionsViewer, and related components.

---

## Current Behavior

The Instructions pages and components currently display hardcoded English strings:
- Column headers: "Title", "Item", "Room", "Property", "Purpose", "Created", "Actions"
- Page headers: "Guides", "Manage guide articles for your items"
- Empty states: "No guides yet", "No guides available", "No guides found"
- Loading states: "Loading guides...", "Loading article data..."
- Sort aria-labels: "Sort by {column}", "Ascending", "Descending"
- Purpose badge labels: "How To Use", "Troubleshooting", "How To Clean", "Safety Info", "Maintenance", "Features"
- Action buttons: "Edit", "Create Your First Item", "Learn More", "Retry"
- Column settings popup: "Show Columns", "Room", "Purpose", "Property"
- Toolbar elements: "Search guides...", "Purpose", "Clear filters", "Showing X of Y guides"
- Date formatting uses hardcoded 'en-US' locale

---

## Expected Behavior

After implementation:
- All UI strings retrieve values from the `instructions` namespace in translation files
- Column headers adapt to the user's selected language
- Purpose badge labels use translation keys from `articles.purposes.*` namespace
- Date formatting adapts to locale-specific conventions
- Empty states, loading states, and error messages display in the selected language
- Sort indicator aria-labels use translation keys
- All components implement `useTranslations` hook from `next-intl`
- Components render correctly in all 6 supported languages (en, de, es, fr, it, nl)

---

## Technical Context

### Dependencies from Epic 1 Foundation
| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Installed |
| i18n config | `/src/lib/i18n/config.ts` | Complete |
| IntlProvider | `/src/app/layout.tsx` | Configured |
| Translation files | `/messages/*.json` | Available |
| useTranslations hook | next-intl | Available |

### Existing Translation Structure
The `messages/en.json` file already has namespaces for `common`, `auth`, `dashboard`, `items`, `errors`, and `language`. The `articles` namespace exists per the implementation plan but needs to be extended with `instructions`-specific keys.

---

## Implementation Tasks

### Task 1: Add `instructions` namespace to translation files
Add translation keys under the `articles` namespace (per implementation plan convention) for all Instructions page strings.

**Translation Keys to Add:**
```json
{
  "articles": {
    "instructions": {
      "title": "Guides",
      "subtitle": "Manage guide articles for your items",
      "table": {
        "columns": {
          "title": "Title",
          "item": "Item",
          "room": "Room",
          "property": "Property",
          "purpose": "Purpose",
          "created": "Created",
          "actions": "Actions"
        },
        "sort": {
          "sortBy": "Sort by {column}",
          "ascending": "Ascending",
          "descending": "Descending",
          "unsorted": "Click to sort"
        },
        "empty": "No guides available",
        "edit": "Edit",
        "editAriaLabel": "Edit {title}"
      },
      "settings": {
        "showColumns": "Show Columns",
        "columnSettings": "Column settings"
      },
      "toolbar": {
        "searchPlaceholder": "Search guides...",
        "purpose": "Purpose",
        "purposeWithCount": "Purpose ({count})",
        "clearFilters": "Clear filters",
        "resultCount": "Showing {count} of {total} guides",
        "viewMode": "View mode",
        "gridView": "Grid view",
        "listView": "List view"
      },
      "grid": {
        "ariaLabel": "{count, plural, one {# guide} other {# guides}}",
        "loading": "Loading guides",
        "empty": {
          "title": "No guides found",
          "subtitle": "Try adjusting your search or filters"
        },
        "pressEnterToEdit": "Press Enter to edit."
      },
      "page": {
        "loading": "Loading guides...",
        "loadingArticle": "Loading article data...",
        "redirectingToLogin": "Redirecting to login...",
        "authRequired": "Authentication Required",
        "authRequiredMessage": "Please log in to access guides.",
        "goToLogin": "Go to Login",
        "errorLoading": "Error Loading Guides",
        "errorLoadingArticle": "Error Loading Article",
        "retry": "Retry",
        "backToGuides": "Back to Guides",
        "successMessage": "Guide updated successfully",
        "dismissSuccess": "Dismiss success message"
      },
      "empty": {
        "title": "No guides yet",
        "description": "Create items and add guide articles to get started. Guides help guests understand how to use items in your property.",
        "createFirst": "Create Your First Item",
        "learnMore": "Learn More"
      },
      "viewer": {
        "ariaLabel": "Item guides",
        "header": "Guides",
        "empty": "No guides provided."
      },
      "itemList": {
        "header": "Guides",
        "subtitle": "Content associated with this item",
        "empty": {
          "title": "No guides yet",
          "description": "Guides for this item will appear here"
        }
      }
    },
    "purposes": {
      "how_to_use": "How To Use",
      "how-to-use": "How To Use",
      "troubleshooting": "Troubleshooting",
      "how_to_clean": "How To Clean",
      "how-to-clean": "How To Clean",
      "safety_info": "Safety Info",
      "safety-info": "Safety Info",
      "maintenance": "Maintenance",
      "features": "Features",
      "other": "Other"
    }
  }
}
```

### Task 2: Update InstructionsTable component
Replace hardcoded strings with translation keys using `useTranslations('articles.instructions')`.

**Changes Required:**
- Import `useTranslations` from 'next-intl'
- Replace column header strings: "Title", "Item", "Room", "Property", "Purpose", "Created", "Actions"
- Replace sort aria-labels in SortableColumnHeader
- Replace empty state message "No guides available"
- Replace "Edit" button label
- Update `formatDate` function to use locale-aware formatting via `useFormatter` or pass locale
- Update `formatPurposeLabel` to use translation keys

### Task 3: Update InstructionsViewer component
Replace hardcoded strings with translation keys.

**Changes Required:**
- Import `useTranslations` from 'next-intl'
- Replace default `ariaLabel` value "Item guides"
- Replace default `headerText` value "Guides"
- Replace empty state message "No guides provided."

### Task 4: Update GuideColumnSettingsPopup component
Replace hardcoded strings with translation keys.

**Changes Required:**
- Import `useTranslations` from 'next-intl'
- Replace "Show Columns" header
- Replace column option labels: "Room", "Purpose", "Property"
- Replace "Column settings" aria-label

### Task 5: Update GuideToolbar component
Replace hardcoded strings with translation keys.

**Changes Required:**
- Import `useTranslations` from 'next-intl'
- Replace "Search guides..." placeholder
- Replace "Purpose" button label and dynamic count version
- Replace "Clear filters" button label and aria-label
- Replace "Showing X of Y guides" result count
- Replace "View mode" aria-label
- Replace "Grid view" and "List view" aria-labels
- Update `formatPurposeLabel` to use translation keys

### Task 6: Update GuideCard component
Replace hardcoded strings with translation keys.

**Changes Required:**
- Import `useTranslations` from 'next-intl'
- Replace "Edit" button label
- Update aria-label to use translations with interpolation
- Update `formatPurposeLabel` to use translation keys
- Update `formatDate` to use locale-aware formatting

### Task 7: Update GuideGrid component
Replace hardcoded strings with translation keys.

**Changes Required:**
- Import `useTranslations` from 'next-intl'
- Replace "Loading guides" aria-label
- Replace empty state: "No guides found", "Try adjusting your search or filters"
- Replace grid aria-label with pluralized translation

### Task 8: Update Instructions page (page.tsx)
Replace hardcoded strings with translation keys.

**Changes Required:**
- Import `useTranslations` from 'next-intl'
- Replace page header: "Guides", "Manage guide articles for your items"
- Replace auth required state strings
- Replace loading state "Loading guides..."
- Replace error state strings
- Replace empty state strings
- Replace success message "Guide updated successfully"
- Replace button labels

### Task 9: Update Edit Article page
Replace hardcoded strings with translation keys.

**Changes Required:**
- Import `useTranslations` from 'next-intl'
- Replace "Redirecting to login..."
- Replace "Loading article data..."
- Replace error messages
- Replace "Retry", "Back to Guides" buttons

### Task 10: Update ItemInstructionsList component
Replace hardcoded strings with translation keys.

**Changes Required:**
- Import `useTranslations` from 'next-intl'
- Replace "Guides" header
- Replace "Content associated with this item" subtitle
- Replace empty state: "No guides yet", "Guides for this item will appear here"
- Replace "Edit" button label
- Update `formatPurposeLabel` to use translation keys

### Task 11: Generate translations for 5 non-English languages
Generate translations for fr, es, de, nl, it in the `articles.instructions` and `articles.purposes` namespaces.

### Task 12: Create shared `formatPurposeLabel` utility with i18n support
Create a shared utility function that uses translation keys for purpose labels to eliminate code duplication.

**Location:** `/src/lib/i18n/purpose-translations.ts`

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Functions/Components | Modification Type |
|-----------|---------------------|-------------------|
| `/messages/en.json` | N/A | Add `articles.instructions` and `articles.purposes` keys |
| `/messages/fr.json` | N/A | Add translated keys |
| `/messages/es.json` | N/A | Add translated keys |
| `/messages/de.json` | N/A | Add translated keys |
| `/messages/nl.json` | N/A | Add translated keys |
| `/messages/it.json` | N/A | Add translated keys |
| `/src/components/InstructionsTable/InstructionsTable.tsx` | `InstructionsTable`, `SortableColumnHeader`, `formatPurposeLabel`, `formatDate` | Add useTranslations, replace hardcoded strings |
| `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | `GuideColumnSettingsPopup`, `COLUMN_OPTIONS` | Add useTranslations, replace hardcoded strings |
| `/src/components/InstructionsTable/GuideToolbar.tsx` | `GuideToolbar`, `ViewToggle`, `PurposeFilterDropdown`, `ClearFiltersButton`, `formatPurposeLabel` | Add useTranslations, replace hardcoded strings |
| `/src/components/InstructionsTable/GuideCard.tsx` | `GuideCard`, `formatPurposeLabel`, `formatDate` | Add useTranslations, replace hardcoded strings |
| `/src/components/InstructionsTable/GuideGrid.tsx` | `GuideGrid` | Add useTranslations, replace hardcoded strings |
| `/src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx` | `InstructionsViewer` | Add useTranslations, replace default prop values |
| `/src/components/ItemEditForm/ItemInstructionsList.tsx` | `ItemInstructionsList`, `formatPurposeLabel` | Add useTranslations, replace hardcoded strings |
| `/src/app/dashboard2/instructions/page.tsx` | `InstructionsPage` | Add useTranslations, replace hardcoded strings |
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | `EditArticlePage` | Add useTranslations, replace hardcoded strings |

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/purpose-translations.ts` | Shared utility for translated purpose labels |

---

## Integration Contract

### Component Update Pattern

```typescript
// Before (hardcoded strings)
function InstructionsTable({ ... }) {
  return (
    <th>Title</th>
    <td>No guides available</td>
    <button>Edit</button>
  );
}

// After (translated)
import { useTranslations } from 'next-intl';

function InstructionsTable({ ... }) {
  const t = useTranslations('articles.instructions');

  return (
    <th>{t('table.columns.title')}</th>
    <td>{t('table.empty')}</td>
    <button>{t('table.edit')}</button>
  );
}
```

### Purpose Label Pattern

```typescript
// Before
function formatPurposeLabel(purpose: string): string {
  return purpose.replace(/_/g, ' ').split(' ').map(...).join(' ');
}

// After
import { useTranslations } from 'next-intl';

function usePurposeLabel() {
  const t = useTranslations('articles.purposes');

  return (purpose: string) => {
    try {
      return t(purpose);
    } catch {
      // Fallback for unknown purpose types
      return purpose.replace(/_/g, ' ').split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  };
}
```

### Date Formatting Pattern

```typescript
// Before
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// After
import { useFormatter } from 'next-intl';

function useDateFormatter() {
  const format = useFormatter();

  return (dateString: string) => {
    try {
      return format.dateTime(new Date(dateString), {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };
}
```

---

## Acceptance Criteria Verification

| Criteria | Task |
|----------|------|
| InstructionsTable displays translated column headers | Task 2 |
| Sort indicator aria labels use translation keys | Task 2 |
| Edit action button uses translation keys | Tasks 2, 6, 10 |
| Column visibility settings popup uses translated labels | Task 4 |
| Empty state "No guides available" uses translation key | Task 2 |
| Loading skeleton has translated aria labels | Tasks 2, 7 |
| Purpose badge labels use translation keys | Tasks 2, 5, 6, 10 |
| Date formatting adapts to locale conventions | Tasks 2, 6 |
| InstructionsViewer uses translation keys | Task 3 |
| All components implement useTranslations hook | All tasks |
| Translation keys follow namespace conventions | Task 1 |
| Long translated text does not break layouts | Visual QA |
| Sort functionality works after i18n | Task 2 |
| Markdown rendering works with all languages | Task 3 |
| Components render in all 6 supported languages | Task 11 |

---

## Dependencies

### Upstream Dependencies
- Epic 1 Foundation complete (next-intl installed and configured)
- `articles` namespace may already have partial translations from Task 2E.1-2E.4

### Downstream Dependencies
- None - this task completes Sub-Epic 2E (Article & Content Management)

---

## Estimated Effort

| Task | Complexity | Estimated Lines |
|------|------------|-----------------|
| Task 1 (Translation keys) | Low | ~100 |
| Task 2 (InstructionsTable) | Medium | ~50 |
| Task 3 (InstructionsViewer) | Low | ~15 |
| Task 4 (GuideColumnSettingsPopup) | Low | ~20 |
| Task 5 (GuideToolbar) | Medium | ~40 |
| Task 6 (GuideCard) | Low | ~25 |
| Task 7 (GuideGrid) | Low | ~15 |
| Task 8 (Instructions page) | Medium | ~60 |
| Task 9 (Edit page) | Low | ~30 |
| Task 10 (ItemInstructionsList) | Low | ~25 |
| Task 11 (Generate translations) | Medium | ~500 (5 language files) |
| Task 12 (Shared utility) | Low | ~30 |
| **Total** | **Medium** | **~910** |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Long German/French translations break table layout | Medium | Low | Use CSS truncation, test all languages |
| Purpose types not in translation keys | Low | Low | Fallback to formatted string |
| Date format inconsistent across languages | Low | Medium | Use useFormatter from next-intl |
| Missing translations at runtime | Low | Medium | Configure fallback to English |

---

## Testing Requirements

1. **Unit Tests**: Verify translation keys are called correctly
2. **Visual QA**: Check all 6 languages for layout issues
3. **Functional Tests**: Verify sorting, filtering, and navigation work with i18n
4. **Accessibility Tests**: Verify aria-labels are correctly translated

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Sub-Epic 2E: Article & Content Management](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md#sub-epic-2e-article--content-management)
