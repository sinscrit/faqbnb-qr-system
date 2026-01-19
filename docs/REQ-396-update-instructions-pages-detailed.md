# REQ-396: Update Instructions Pages for Localization - Detailed Task Breakdown

**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-396
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.5
**Size:** M (Medium)
**Overview Document:** REQ-396-update-instructions-pages-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Executive Summary

This document provides granular, implementation-ready tasks for localizing the Instructions pages and related components. The work involves updating 10 component files plus 6 translation files, adding the `articles.instructions` and `articles.purposes` namespaces, and creating a shared utility for purpose label translations. Total estimated changes: ~910 lines across 16 files.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation complete (next-intl installed)
- [ ] `/messages/en.json` exists with base structure
- [ ] `/messages/{fr,es,de,nl,it}.json` files exist
- [ ] `useTranslations` hook available from next-intl
- [ ] `useFormatter` hook available from next-intl
- [ ] IntlProvider configured in layout

---

## Task Breakdown

### Task 1: Add `articles.instructions` and `articles.purposes` Translation Keys

**Estimated Effort:** 1 story point
**File:** `/messages/en.json`
**Type:** Translation keys addition

#### 1.1 Add `articles.instructions` Namespace

Add the following structure to `/messages/en.json` under an `articles` key:

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
        "listView": "List view",
        "controls": "Guide management controls"
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
      "card": {
        "editAriaLabel": "{title} - {itemName} - {purpose}. Press Enter to edit."
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

#### 1.2 Verification Steps

1. Validate JSON syntax: `npx jsonlint messages/en.json`
2. Verify key structure matches namespace pattern
3. Ensure all keys from overview document are included

#### 1.3 Acceptance Criteria

- [ ] `articles.instructions` namespace exists with all specified keys
- [ ] `articles.purposes` namespace contains all purpose type translations
- [ ] JSON is valid and properly formatted
- [ ] Keys follow `namespace.component.element.variant` convention

---

### Task 2: Update InstructionsTable Component

**Estimated Effort:** 2 story points
**File:** `/src/components/InstructionsTable/InstructionsTable.tsx`
**Type:** Component localization

#### 2.1 Add Imports

At the top of the file, add:

```typescript
import { useTranslations, useFormatter } from 'next-intl';
```

#### 2.2 Update SortableColumnHeader

Replace hardcoded aria-labels with translations:

**Current (line ~61-62):**
```typescript
aria-label={`Sort by ${label}`}
```

**Updated:**
```typescript
const t = useTranslations('articles.instructions.table.sort');
// ...
aria-label={t('sortBy', { column: label })}
```

**Current (line ~66-68):**
```typescript
<ArrowUp className="h-3 w-3" aria-label="Ascending" />
<ArrowDown className="h-3 w-3" aria-label="Descending" />
```

**Updated:**
```typescript
<ArrowUp className="h-3 w-3" aria-label={t('ascending')} />
<ArrowDown className="h-3 w-3" aria-label={t('descending')} />
```

#### 2.3 Update InstructionsTable Main Component

**Add hooks at component start:**
```typescript
export function InstructionsTable({ ... }) {
  const t = useTranslations('articles.instructions.table');
  const tPurposes = useTranslations('articles.purposes');
  const format = useFormatter();
```

#### 2.4 Replace Column Headers

**Replace all hardcoded column labels (lines ~152-241):**

| Current | Updated |
|---------|---------|
| `"Title"` | `{t('columns.title')}` |
| `"Item"` | `{t('columns.item')}` |
| `"Room"` | `{t('columns.room')}` |
| `"Property"` | `{t('columns.property')}` |
| `"Purpose"` | `{t('columns.purpose')}` |
| `"Created"` | `{t('columns.created')}` |
| `"Actions"` | `{t('columns.actions')}` |

#### 2.5 Update formatPurposeLabel Function

**Replace current implementation (lines ~109-116):**
```typescript
// Remove the old formatPurposeLabel function

// Inside component, create localized version:
const formatPurposeLabel = (purpose: string): string => {
  try {
    return tPurposes(purpose);
  } catch {
    // Fallback for unknown purpose types
    return purpose
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};
```

#### 2.6 Update formatDate Function

**Replace current implementation (lines ~265-276):**
```typescript
const formatDate = (dateString: string) => {
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
```

#### 2.7 Update Empty State Message

**Current (line ~331):**
```typescript
No guides available
```

**Updated:**
```typescript
{t('empty')}
```

#### 2.8 Update Edit Button

**Current (line ~414):**
```typescript
<span>Edit</span>
```

**Updated:**
```typescript
<span>{t('edit')}</span>
```

**Current aria-label (line ~411):**
```typescript
aria-label={`Edit ${instruction.articleTitle}`}
```

**Updated:**
```typescript
aria-label={t('editAriaLabel', { title: instruction.articleTitle })}
```

#### 2.9 Acceptance Criteria

- [ ] All column headers use translation keys
- [ ] Sort aria-labels use translation keys with interpolation
- [ ] Purpose badges display translated labels
- [ ] Date formatting uses useFormatter and adapts to locale
- [ ] Empty state uses translation key
- [ ] Edit button and aria-label use translation keys
- [ ] Component compiles without TypeScript errors

---

### Task 3: Update InstructionsViewer Component

**Estimated Effort:** 1 story point
**File:** `/src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`
**Type:** Component localization

#### 3.1 Add Import

```typescript
import { useTranslations } from 'next-intl';
```

#### 3.2 Update Component Props Default Values

The component accepts optional `ariaLabel` and `headerText` props with English defaults. These need to use translations.

**Add hook and update defaults (lines ~71-79):**
```typescript
export function InstructionsViewer({
  instructions,
  maxHeight = '400px',
  minHeight = '100px',
  className,
  ariaLabel,
  showHeader = false,
  headerText,
}: InstructionsViewerProps) {
  const t = useTranslations('articles.instructions.viewer');

  // Use translations for default values
  const resolvedAriaLabel = ariaLabel ?? t('ariaLabel');
  const resolvedHeaderText = headerText ?? t('header');
```

#### 3.3 Update Empty State Message

**Current (line ~114):**
```typescript
<p className="text-gray-400 italic">No guides provided.</p>
```

**Updated:**
```typescript
<p className="text-gray-400 italic">{t('empty')}</p>
```

#### 3.4 Update Section and Header

**Update aria-label usage (line ~86):**
```typescript
aria-label={resolvedAriaLabel}
```

**Update header text (line ~93):**
```typescript
<h4 className="text-sm font-medium text-gray-700">{resolvedHeaderText}</h4>
```

#### 3.5 Acceptance Criteria

- [ ] Default aria-label uses translation key
- [ ] Default header text uses translation key
- [ ] Empty state message uses translation key
- [ ] Props can still override with custom values
- [ ] Markdown rendering continues to work

---

### Task 4: Update GuideColumnSettingsPopup Component

**Estimated Effort:** 1 story point
**File:** `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx`
**Type:** Component localization

#### 4.1 Add Import

```typescript
import { useTranslations } from 'next-intl';
```

#### 4.2 Update COLUMN_OPTIONS

The `COLUMN_OPTIONS` array contains hardcoded labels. These need to be dynamic based on translations.

**Current (lines ~41-45):**
```typescript
const COLUMN_OPTIONS: ColumnOption[] = [
  { key: 'room', label: 'Room' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'property', label: 'Property' },
];
```

**Updated approach - move inside component and use hook:**
```typescript
export function GuideColumnSettingsPopup({ ... }) {
  const t = useTranslations('articles.instructions');
  const tTable = useTranslations('articles.instructions.table.columns');

  const COLUMN_OPTIONS: ColumnOption[] = [
    { key: 'room', label: tTable('room') },
    { key: 'purpose', label: tTable('purpose') },
    { key: 'property', label: tTable('property') },
  ];
```

#### 4.3 Update Header Text

**Current (line ~93):**
```typescript
Show Columns
```

**Updated:**
```typescript
{t('settings.showColumns')}
```

#### 4.4 Update Aria-Label

**Current (line ~70):**
```typescript
aria-label="Column settings"
```

**Updated:**
```typescript
aria-label={t('settings.columnSettings')}
```

#### 4.5 Acceptance Criteria

- [ ] "Show Columns" header uses translation key
- [ ] Column option labels (Room, Purpose, Property) use translation keys
- [ ] "Column settings" aria-label uses translation key
- [ ] Component functions correctly with translations

---

### Task 5: Update GuideToolbar Component

**Estimated Effort:** 2 story points
**File:** `/src/components/InstructionsTable/GuideToolbar.tsx`
**Type:** Component localization

#### 5.1 Add Import

```typescript
import { useTranslations } from 'next-intl';
```

#### 5.2 Update ViewToggle Sub-component

**Add hook and update aria-labels (inside ViewToggle function):**
```typescript
function ViewToggle({ viewMode, onViewModeChange, className }: ViewToggleProps) {
  const t = useTranslations('articles.instructions.toolbar');
  // ...
```

**Update aria-labels (lines ~77, ~96, ~117):**
```typescript
aria-label={t('viewMode')}    // line ~77 (radiogroup)
aria-label={t('gridView')}    // line ~96
aria-label={t('listView')}    // line ~117
```

#### 5.3 Update PurposeFilterDropdown Sub-component

**Add hook inside function:**
```typescript
function PurposeFilterDropdown({ ... }) {
  const t = useTranslations('articles.instructions.toolbar');
  const tPurposes = useTranslations('articles.purposes');
  // ...
```

**Replace formatPurposeLabel usage with translations (line ~238):**
```typescript
const formatPurposeLabel = (purpose: string): string => {
  try {
    return tPurposes(purpose);
  } catch {
    return purpose
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};
```

**Update button label (lines ~196-200):**
```typescript
<span>
  {selectedPurposes.length > 0
    ? t('purposeWithCount', { count: selectedPurposes.length })
    : t('purpose')}
</span>
```

#### 5.4 Update ClearFiltersButton Sub-component

**Add hook and update text (inside ClearFiltersButton function):**
```typescript
function ClearFiltersButton({ onClick, className }: ClearFiltersButtonProps) {
  const t = useTranslations('articles.instructions.toolbar');
  // ...
  aria-label={t('clearFilters')}
  // ...
  <span>{t('clearFilters')}</span>
```

#### 5.5 Update Main GuideToolbar Component

**Add hook:**
```typescript
export function GuideToolbar({ ... }) {
  const t = useTranslations('articles.instructions.toolbar');
```

**Update search placeholder (line ~318):**
```typescript
placeholder={t('searchPlaceholder')}
```

**Update result count (line ~340):**
```typescript
{t('resultCount', { count: resultCount, total: totalCount })}
```

**Update toolbar aria-label (line ~301):**
```typescript
aria-label={t('controls')}
```

#### 5.6 Acceptance Criteria

- [ ] Search placeholder uses translation key
- [ ] "Purpose" button label uses translation key with count interpolation
- [ ] "Clear filters" button uses translation key
- [ ] Result count message uses translation key with interpolation
- [ ] View mode aria-labels use translation keys
- [ ] Purpose dropdown options show translated labels

---

### Task 6: Update GuideCard Component

**Estimated Effort:** 1 story point
**File:** `/src/components/InstructionsTable/GuideCard.tsx`
**Type:** Component localization

#### 6.1 Add Imports

```typescript
import { useTranslations, useFormatter } from 'next-intl';
```

#### 6.2 Add Hooks

**Inside GuideCard function:**
```typescript
export function GuideCard({ guide, onEdit, className }: GuideCardProps) {
  const t = useTranslations('articles.instructions');
  const tPurposes = useTranslations('articles.purposes');
  const format = useFormatter();
```

#### 6.3 Update formatPurposeLabel

**Replace function (lines ~63-70) with inline translation:**
```typescript
const formattedPurpose = (() => {
  try {
    return tPurposes(guide.purpose);
  } catch {
    return guide.purpose
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
})();
```

#### 6.4 Update formatDate

**Replace function (lines ~75-85) with useFormatter:**
```typescript
const formattedDate = (() => {
  try {
    return format.dateTime(new Date(guide.createdAt), {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
})();
```

#### 6.5 Update Card Aria-Label

**Current (line ~115):**
```typescript
aria-label={`${guide.articleTitle} - ${guide.itemName} - ${formattedPurpose}. Press Enter to edit.`}
```

**Updated:**
```typescript
aria-label={t('card.editAriaLabel', {
  title: guide.articleTitle,
  itemName: guide.itemName,
  purpose: formattedPurpose
})}
```

#### 6.6 Update Edit Button

**Current (lines ~191-192):**
```typescript
<span>Edit</span>
```

**Updated:**
```typescript
<span>{t('table.edit')}</span>
```

**Update aria-label (line ~189):**
```typescript
aria-label={t('table.editAriaLabel', { title: guide.articleTitle })}
```

#### 6.7 Acceptance Criteria

- [ ] Purpose badge displays translated label
- [ ] Date formats according to locale
- [ ] Card aria-label uses translation with interpolation
- [ ] Edit button uses translation key

---

### Task 7: Update GuideGrid Component

**Estimated Effort:** 1 story point
**File:** `/src/components/InstructionsTable/GuideGrid.tsx`
**Type:** Component localization

#### 7.1 Add Import

```typescript
import { useTranslations } from 'next-intl';
```

#### 7.2 Add Hook

**Inside GuideGrid function:**
```typescript
export function GuideGrid({ guides, onEdit, loading = false, className }: GuideGridProps) {
  const t = useTranslations('articles.instructions.grid');
```

#### 7.3 Update Loading State

**Current (lines ~76-77):**
```typescript
aria-label="Loading guides"
```

**Updated:**
```typescript
aria-label={t('loading')}
```

#### 7.4 Update Empty State

**Current (lines ~100-101):**
```typescript
<p className="text-lg font-medium text-gray-900">No guides found</p>
<p className="text-sm mt-1">Try adjusting your search or filters</p>
```

**Updated:**
```typescript
<p className="text-lg font-medium text-gray-900">{t('empty.title')}</p>
<p className="text-sm mt-1">{t('empty.subtitle')}</p>
```

#### 7.5 Update Grid Aria-Label

**Current (line ~115):**
```typescript
aria-label={`${guides.length} guide${guides.length !== 1 ? 's' : ''}`}
```

**Updated:**
```typescript
aria-label={t('ariaLabel', { count: guides.length })}
```

#### 7.6 Acceptance Criteria

- [ ] Loading aria-label uses translation key
- [ ] Empty state title uses translation key
- [ ] Empty state subtitle uses translation key
- [ ] Grid aria-label uses ICU pluralization

---

### Task 8: Update Instructions Page (page.tsx)

**Estimated Effort:** 2 story points
**File:** `/src/app/dashboard2/instructions/page.tsx`
**Type:** Page localization

#### 8.1 Add Import

```typescript
import { useTranslations } from 'next-intl';
```

#### 8.2 Add Hook

**At the start of InstructionsPage component:**
```typescript
export default function InstructionsPage() {
  const t = useTranslations('articles.instructions');
  // ... existing hooks
```

#### 8.3 Update Authentication Required State

**Current (lines ~241-250):**
```typescript
<h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
<p className="text-gray-600 mb-6">Please log in to access guides.</p>
// ...
Go to Login
```

**Updated:**
```typescript
<h2 className="text-xl font-semibold text-gray-900 mb-4">{t('page.authRequired')}</h2>
<p className="text-gray-600 mb-6">{t('page.authRequiredMessage')}</p>
// ...
{t('page.goToLogin')}
```

#### 8.4 Update Loading State

**Current (line ~259):**
```typescript
<p className="text-gray-600">Loading guides...</p>
```

**Updated:**
```typescript
<p className="text-gray-600">{t('page.loading')}</p>
```

#### 8.5 Update Error State

**Current (lines ~270-277):**
```typescript
<h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Guides</h2>
// ...
Retry
```

**Updated:**
```typescript
<h2 className="text-xl font-semibold text-red-900 mb-2">{t('page.errorLoading')}</h2>
// ...
{t('page.retry')}
```

#### 8.6 Update Empty State (No Guides)

**Current (lines ~289-307):**
```typescript
<h2 className="text-2xl font-bold text-gray-900 mb-3">No guides yet</h2>
<p className="text-gray-600 mb-8 max-w-md mx-auto">
  Create items and add guide articles to get started. Guides help guests
  understand how to use items in your property.
</p>
// ...
Create Your First Item
// ...
Learn More
```

**Updated:**
```typescript
<h2 className="text-2xl font-bold text-gray-900 mb-3">{t('empty.title')}</h2>
<p className="text-gray-600 mb-8 max-w-md mx-auto">
  {t('empty.description')}
</p>
// ...
{t('empty.createFirst')}
// ...
{t('empty.learnMore')}
```

#### 8.7 Update Success Message

**Current (lines ~332-333):**
```typescript
Guide updated successfully
// ...
aria-label="Dismiss success message"
```

**Updated:**
```typescript
{t('page.successMessage')}
// ...
aria-label={t('page.dismissSuccess')}
```

#### 8.8 Update Page Header

**Current (lines ~354-360):**
```typescript
<h1 id="instructions-title" className="text-2xl font-bold text-gray-900">
  Guides
</h1>
// ...
<p className="text-gray-600 mt-1">
  Manage guide articles for your items
</p>
```

**Updated:**
```typescript
<h1 id="instructions-title" className="text-2xl font-bold text-gray-900">
  {t('title')}
</h1>
// ...
<p className="text-gray-600 mt-1">
  {t('subtitle')}
</p>
```

#### 8.9 Acceptance Criteria

- [ ] Page title and subtitle use translation keys
- [ ] Auth required state uses translation keys
- [ ] Loading message uses translation key
- [ ] Error state uses translation keys
- [ ] Empty state uses translation keys
- [ ] Success message uses translation key
- [ ] Button labels use translation keys

---

### Task 9: Update Edit Article Page

**Estimated Effort:** 1 story point
**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
**Type:** Page localization

#### 9.1 Add Import

```typescript
import { useTranslations } from 'next-intl';
```

#### 9.2 Add Hook

**At the start of EditArticlePage component:**
```typescript
export default function EditArticlePage() {
  const t = useTranslations('articles.instructions.page');
  // ... existing hooks
```

#### 9.3 Update Redirecting to Login State

**Current (line ~197):**
```typescript
<p className="text-gray-600">Redirecting to login...</p>
```

**Updated:**
```typescript
<p className="text-gray-600">{t('redirectingToLogin')}</p>
```

#### 9.4 Update Loading State

**Current (line ~209):**
```typescript
<p className="text-gray-600">Loading article data...</p>
```

**Updated:**
```typescript
<p className="text-gray-600">{t('loadingArticle')}</p>
```

#### 9.5 Update Error State

**Current (lines ~220-234):**
```typescript
<h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Article</h2>
// ...
Retry
// ...
Back to Guides
```

**Updated:**
```typescript
<h2 className="text-xl font-semibold text-red-900 mb-2">{t('errorLoadingArticle')}</h2>
// ...
{t('retry')}
// ...
{t('backToGuides')}
```

#### 9.6 Acceptance Criteria

- [ ] Redirect message uses translation key
- [ ] Loading message uses translation key
- [ ] Error heading uses translation key
- [ ] Retry button uses translation key
- [ ] Back to Guides button uses translation key

---

### Task 10: Update ItemInstructionsList Component

**Estimated Effort:** 1 story point
**File:** `/src/components/ItemEditForm/ItemInstructionsList.tsx`
**Type:** Component localization

#### 10.1 Add Imports

```typescript
import { useTranslations } from 'next-intl';
```

#### 10.2 Add Hook

**Note:** This component doesn't have 'use client' directive and may be a server component or need to verify. If client component, add:

```typescript
export function ItemInstructionsList({ ... }) {
  const t = useTranslations('articles.instructions.itemList');
  const tPurposes = useTranslations('articles.purposes');
```

#### 10.3 Update formatPurposeLabel

**Replace function (lines ~43-50) with translation-based version:**
```typescript
const formatPurposeLabel = (purpose: string): string => {
  try {
    return tPurposes(purpose);
  } catch {
    return purpose
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};
```

#### 10.4 Update Loading Skeleton

**Current (lines ~62-63):**
```typescript
<h3 className="text-lg font-medium text-gray-900 mb-4">Guides</h3>
<p className="text-sm text-gray-500 mb-4">Content associated with this item</p>
```

**Updated:**
```typescript
<h3 className="text-lg font-medium text-gray-900 mb-4">{t('header')}</h3>
<p className="text-sm text-gray-500 mb-4">{t('subtitle')}</p>
```

#### 10.5 Update Empty State

**Current (lines ~82-88):**
```typescript
<h3 className="text-lg font-medium text-gray-900 mb-4">Guides</h3>
<p className="text-sm text-gray-500 mb-4">Content associated with this item</p>
// ...
<p className="text-gray-500 font-medium">No guides yet</p>
<p className="text-sm text-gray-400 mt-1">Guides for this item will appear here</p>
```

**Updated:**
```typescript
<h3 className="text-lg font-medium text-gray-900 mb-4">{t('header')}</h3>
<p className="text-sm text-gray-500 mb-4">{t('subtitle')}</p>
// ...
<p className="text-gray-500 font-medium">{t('empty.title')}</p>
<p className="text-sm text-gray-400 mt-1">{t('empty.description')}</p>
```

#### 10.6 Update List Header

**Current (lines ~97-98):**
```typescript
<h3 className="text-lg font-medium text-gray-900 mb-4">Guides</h3>
<p className="text-sm text-gray-500 mb-4">Content associated with this item</p>
```

**Updated:**
```typescript
<h3 className="text-lg font-medium text-gray-900 mb-4">{t('header')}</h3>
<p className="text-sm text-gray-500 mb-4">{t('subtitle')}</p>
```

#### 10.7 Update Edit Button

**Current (line ~123):**
```typescript
<span>Edit</span>
```

**Updated:**
```typescript
<span>{t('edit', undefined, { namespace: 'articles.instructions.table' })}</span>
```

**Alternative - use common namespace:**
```typescript
const tTable = useTranslations('articles.instructions.table');
// ...
<span>{tTable('edit')}</span>
```

#### 10.8 Acceptance Criteria

- [ ] "Guides" header uses translation key
- [ ] "Content associated with this item" subtitle uses translation key
- [ ] Empty state title uses translation key
- [ ] Empty state description uses translation key
- [ ] Purpose badges display translated labels
- [ ] Edit button uses translation key

---

### Task 11: Generate Translations for 5 Non-English Languages

**Estimated Effort:** 2 story points
**Files:** `/messages/{fr,es,de,nl,it}.json`
**Type:** Translation generation

#### 11.1 French (fr.json)

Add the following under `articles`:

```json
{
  "articles": {
    "instructions": {
      "title": "Guides",
      "subtitle": "Gérer les articles de guide pour vos objets",
      "table": {
        "columns": {
          "title": "Titre",
          "item": "Objet",
          "room": "Pièce",
          "property": "Propriété",
          "purpose": "Objectif",
          "created": "Créé",
          "actions": "Actions"
        },
        "sort": {
          "sortBy": "Trier par {column}",
          "ascending": "Croissant",
          "descending": "Décroissant",
          "unsorted": "Cliquez pour trier"
        },
        "empty": "Aucun guide disponible",
        "edit": "Modifier",
        "editAriaLabel": "Modifier {title}"
      },
      "settings": {
        "showColumns": "Afficher les colonnes",
        "columnSettings": "Paramètres des colonnes"
      },
      "toolbar": {
        "searchPlaceholder": "Rechercher des guides...",
        "purpose": "Objectif",
        "purposeWithCount": "Objectif ({count})",
        "clearFilters": "Effacer les filtres",
        "resultCount": "Affichage de {count} sur {total} guides",
        "viewMode": "Mode d'affichage",
        "gridView": "Vue en grille",
        "listView": "Vue en liste",
        "controls": "Contrôles de gestion des guides"
      },
      "grid": {
        "ariaLabel": "{count, plural, one {# guide} other {# guides}}",
        "loading": "Chargement des guides",
        "empty": {
          "title": "Aucun guide trouvé",
          "subtitle": "Essayez d'ajuster votre recherche ou vos filtres"
        },
        "pressEnterToEdit": "Appuyez sur Entrée pour modifier."
      },
      "card": {
        "editAriaLabel": "{title} - {itemName} - {purpose}. Appuyez sur Entrée pour modifier."
      },
      "page": {
        "loading": "Chargement des guides...",
        "loadingArticle": "Chargement des données de l'article...",
        "redirectingToLogin": "Redirection vers la connexion...",
        "authRequired": "Authentification requise",
        "authRequiredMessage": "Veuillez vous connecter pour accéder aux guides.",
        "goToLogin": "Aller à la connexion",
        "errorLoading": "Erreur lors du chargement des guides",
        "errorLoadingArticle": "Erreur lors du chargement de l'article",
        "retry": "Réessayer",
        "backToGuides": "Retour aux guides",
        "successMessage": "Guide mis à jour avec succès",
        "dismissSuccess": "Fermer le message de succès"
      },
      "empty": {
        "title": "Aucun guide pour le moment",
        "description": "Créez des objets et ajoutez des articles de guide pour commencer. Les guides aident les invités à comprendre comment utiliser les objets de votre propriété.",
        "createFirst": "Créer votre premier objet",
        "learnMore": "En savoir plus"
      },
      "viewer": {
        "ariaLabel": "Guides de l'objet",
        "header": "Guides",
        "empty": "Aucun guide fourni."
      },
      "itemList": {
        "header": "Guides",
        "subtitle": "Contenu associé à cet objet",
        "empty": {
          "title": "Aucun guide pour le moment",
          "description": "Les guides pour cet objet apparaîtront ici"
        }
      }
    },
    "purposes": {
      "how_to_use": "Comment utiliser",
      "how-to-use": "Comment utiliser",
      "troubleshooting": "Dépannage",
      "how_to_clean": "Comment nettoyer",
      "how-to-clean": "Comment nettoyer",
      "safety_info": "Info sécurité",
      "safety-info": "Info sécurité",
      "maintenance": "Entretien",
      "features": "Fonctionnalités",
      "other": "Autre"
    }
  }
}
```

#### 11.2 Spanish (es.json)

```json
{
  "articles": {
    "instructions": {
      "title": "Guías",
      "subtitle": "Gestionar artículos de guía para tus objetos",
      "table": {
        "columns": {
          "title": "Título",
          "item": "Objeto",
          "room": "Habitación",
          "property": "Propiedad",
          "purpose": "Propósito",
          "created": "Creado",
          "actions": "Acciones"
        },
        "sort": {
          "sortBy": "Ordenar por {column}",
          "ascending": "Ascendente",
          "descending": "Descendente",
          "unsorted": "Clic para ordenar"
        },
        "empty": "No hay guías disponibles",
        "edit": "Editar",
        "editAriaLabel": "Editar {title}"
      },
      "settings": {
        "showColumns": "Mostrar columnas",
        "columnSettings": "Configuración de columnas"
      },
      "toolbar": {
        "searchPlaceholder": "Buscar guías...",
        "purpose": "Propósito",
        "purposeWithCount": "Propósito ({count})",
        "clearFilters": "Limpiar filtros",
        "resultCount": "Mostrando {count} de {total} guías",
        "viewMode": "Modo de vista",
        "gridView": "Vista de cuadrícula",
        "listView": "Vista de lista",
        "controls": "Controles de gestión de guías"
      },
      "grid": {
        "ariaLabel": "{count, plural, one {# guía} other {# guías}}",
        "loading": "Cargando guías",
        "empty": {
          "title": "No se encontraron guías",
          "subtitle": "Intenta ajustar tu búsqueda o filtros"
        },
        "pressEnterToEdit": "Presiona Enter para editar."
      },
      "card": {
        "editAriaLabel": "{title} - {itemName} - {purpose}. Presiona Enter para editar."
      },
      "page": {
        "loading": "Cargando guías...",
        "loadingArticle": "Cargando datos del artículo...",
        "redirectingToLogin": "Redirigiendo al inicio de sesión...",
        "authRequired": "Autenticación requerida",
        "authRequiredMessage": "Por favor, inicia sesión para acceder a las guías.",
        "goToLogin": "Ir a iniciar sesión",
        "errorLoading": "Error al cargar las guías",
        "errorLoadingArticle": "Error al cargar el artículo",
        "retry": "Reintentar",
        "backToGuides": "Volver a las guías",
        "successMessage": "Guía actualizada correctamente",
        "dismissSuccess": "Cerrar mensaje de éxito"
      },
      "empty": {
        "title": "Aún no hay guías",
        "description": "Crea objetos y añade artículos de guía para comenzar. Las guías ayudan a los huéspedes a entender cómo usar los objetos de tu propiedad.",
        "createFirst": "Crear tu primer objeto",
        "learnMore": "Más información"
      },
      "viewer": {
        "ariaLabel": "Guías del objeto",
        "header": "Guías",
        "empty": "No se proporcionaron guías."
      },
      "itemList": {
        "header": "Guías",
        "subtitle": "Contenido asociado a este objeto",
        "empty": {
          "title": "Aún no hay guías",
          "description": "Las guías para este objeto aparecerán aquí"
        }
      }
    },
    "purposes": {
      "how_to_use": "Cómo usar",
      "how-to-use": "Cómo usar",
      "troubleshooting": "Solución de problemas",
      "how_to_clean": "Cómo limpiar",
      "how-to-clean": "Cómo limpiar",
      "safety_info": "Info de seguridad",
      "safety-info": "Info de seguridad",
      "maintenance": "Mantenimiento",
      "features": "Características",
      "other": "Otro"
    }
  }
}
```

#### 11.3 German (de.json)

```json
{
  "articles": {
    "instructions": {
      "title": "Anleitungen",
      "subtitle": "Anleitungsartikel für Ihre Objekte verwalten",
      "table": {
        "columns": {
          "title": "Titel",
          "item": "Objekt",
          "room": "Raum",
          "property": "Unterkunft",
          "purpose": "Zweck",
          "created": "Erstellt",
          "actions": "Aktionen"
        },
        "sort": {
          "sortBy": "Sortieren nach {column}",
          "ascending": "Aufsteigend",
          "descending": "Absteigend",
          "unsorted": "Klicken zum Sortieren"
        },
        "empty": "Keine Anleitungen verfügbar",
        "edit": "Bearbeiten",
        "editAriaLabel": "{title} bearbeiten"
      },
      "settings": {
        "showColumns": "Spalten anzeigen",
        "columnSettings": "Spalteneinstellungen"
      },
      "toolbar": {
        "searchPlaceholder": "Anleitungen suchen...",
        "purpose": "Zweck",
        "purposeWithCount": "Zweck ({count})",
        "clearFilters": "Filter löschen",
        "resultCount": "Zeige {count} von {total} Anleitungen",
        "viewMode": "Ansichtsmodus",
        "gridView": "Rasteransicht",
        "listView": "Listenansicht",
        "controls": "Anleitungsverwaltung"
      },
      "grid": {
        "ariaLabel": "{count, plural, one {# Anleitung} other {# Anleitungen}}",
        "loading": "Anleitungen werden geladen",
        "empty": {
          "title": "Keine Anleitungen gefunden",
          "subtitle": "Versuchen Sie, Ihre Suche oder Filter anzupassen"
        },
        "pressEnterToEdit": "Drücken Sie Enter zum Bearbeiten."
      },
      "card": {
        "editAriaLabel": "{title} - {itemName} - {purpose}. Drücken Sie Enter zum Bearbeiten."
      },
      "page": {
        "loading": "Anleitungen werden geladen...",
        "loadingArticle": "Artikeldaten werden geladen...",
        "redirectingToLogin": "Weiterleitung zur Anmeldung...",
        "authRequired": "Authentifizierung erforderlich",
        "authRequiredMessage": "Bitte melden Sie sich an, um auf Anleitungen zuzugreifen.",
        "goToLogin": "Zur Anmeldung",
        "errorLoading": "Fehler beim Laden der Anleitungen",
        "errorLoadingArticle": "Fehler beim Laden des Artikels",
        "retry": "Erneut versuchen",
        "backToGuides": "Zurück zu Anleitungen",
        "successMessage": "Anleitung erfolgreich aktualisiert",
        "dismissSuccess": "Erfolgsmeldung schließen"
      },
      "empty": {
        "title": "Noch keine Anleitungen",
        "description": "Erstellen Sie Objekte und fügen Sie Anleitungsartikel hinzu, um zu beginnen. Anleitungen helfen Gästen zu verstehen, wie sie Objekte in Ihrer Unterkunft nutzen können.",
        "createFirst": "Erstes Objekt erstellen",
        "learnMore": "Mehr erfahren"
      },
      "viewer": {
        "ariaLabel": "Objektanleitungen",
        "header": "Anleitungen",
        "empty": "Keine Anleitungen vorhanden."
      },
      "itemList": {
        "header": "Anleitungen",
        "subtitle": "Mit diesem Objekt verknüpfter Inhalt",
        "empty": {
          "title": "Noch keine Anleitungen",
          "description": "Anleitungen für dieses Objekt werden hier angezeigt"
        }
      }
    },
    "purposes": {
      "how_to_use": "Bedienung",
      "how-to-use": "Bedienung",
      "troubleshooting": "Fehlerbehebung",
      "how_to_clean": "Reinigung",
      "how-to-clean": "Reinigung",
      "safety_info": "Sicherheitsinfo",
      "safety-info": "Sicherheitsinfo",
      "maintenance": "Wartung",
      "features": "Funktionen",
      "other": "Sonstiges"
    }
  }
}
```

#### 11.4 Dutch (nl.json)

```json
{
  "articles": {
    "instructions": {
      "title": "Handleidingen",
      "subtitle": "Beheer handleidingartikelen voor uw objecten",
      "table": {
        "columns": {
          "title": "Titel",
          "item": "Object",
          "room": "Kamer",
          "property": "Accommodatie",
          "purpose": "Doel",
          "created": "Aangemaakt",
          "actions": "Acties"
        },
        "sort": {
          "sortBy": "Sorteren op {column}",
          "ascending": "Oplopend",
          "descending": "Aflopend",
          "unsorted": "Klik om te sorteren"
        },
        "empty": "Geen handleidingen beschikbaar",
        "edit": "Bewerken",
        "editAriaLabel": "{title} bewerken"
      },
      "settings": {
        "showColumns": "Kolommen tonen",
        "columnSettings": "Kolominstellingen"
      },
      "toolbar": {
        "searchPlaceholder": "Handleidingen zoeken...",
        "purpose": "Doel",
        "purposeWithCount": "Doel ({count})",
        "clearFilters": "Filters wissen",
        "resultCount": "{count} van {total} handleidingen worden getoond",
        "viewMode": "Weergavemodus",
        "gridView": "Rasterweergave",
        "listView": "Lijstweergave",
        "controls": "Handleidingenbeheer"
      },
      "grid": {
        "ariaLabel": "{count, plural, one {# handleiding} other {# handleidingen}}",
        "loading": "Handleidingen laden",
        "empty": {
          "title": "Geen handleidingen gevonden",
          "subtitle": "Probeer uw zoekopdracht of filters aan te passen"
        },
        "pressEnterToEdit": "Druk op Enter om te bewerken."
      },
      "card": {
        "editAriaLabel": "{title} - {itemName} - {purpose}. Druk op Enter om te bewerken."
      },
      "page": {
        "loading": "Handleidingen laden...",
        "loadingArticle": "Artikelgegevens laden...",
        "redirectingToLogin": "Doorverwijzen naar inloggen...",
        "authRequired": "Authenticatie vereist",
        "authRequiredMessage": "Log in om toegang te krijgen tot handleidingen.",
        "goToLogin": "Naar inloggen",
        "errorLoading": "Fout bij laden handleidingen",
        "errorLoadingArticle": "Fout bij laden artikel",
        "retry": "Opnieuw proberen",
        "backToGuides": "Terug naar handleidingen",
        "successMessage": "Handleiding succesvol bijgewerkt",
        "dismissSuccess": "Succesbericht sluiten"
      },
      "empty": {
        "title": "Nog geen handleidingen",
        "description": "Maak objecten aan en voeg handleidingartikelen toe om te beginnen. Handleidingen helpen gasten te begrijpen hoe ze objecten in uw accommodatie kunnen gebruiken.",
        "createFirst": "Maak uw eerste object",
        "learnMore": "Meer informatie"
      },
      "viewer": {
        "ariaLabel": "Objecthandleidingen",
        "header": "Handleidingen",
        "empty": "Geen handleidingen beschikbaar."
      },
      "itemList": {
        "header": "Handleidingen",
        "subtitle": "Inhoud gekoppeld aan dit object",
        "empty": {
          "title": "Nog geen handleidingen",
          "description": "Handleidingen voor dit object verschijnen hier"
        }
      }
    },
    "purposes": {
      "how_to_use": "Gebruiksaanwijzing",
      "how-to-use": "Gebruiksaanwijzing",
      "troubleshooting": "Probleemoplossing",
      "how_to_clean": "Schoonmaken",
      "how-to-clean": "Schoonmaken",
      "safety_info": "Veiligheidsinformatie",
      "safety-info": "Veiligheidsinformatie",
      "maintenance": "Onderhoud",
      "features": "Functies",
      "other": "Overig"
    }
  }
}
```

#### 11.5 Italian (it.json)

```json
{
  "articles": {
    "instructions": {
      "title": "Guide",
      "subtitle": "Gestisci gli articoli guida per i tuoi oggetti",
      "table": {
        "columns": {
          "title": "Titolo",
          "item": "Oggetto",
          "room": "Stanza",
          "property": "Proprietà",
          "purpose": "Scopo",
          "created": "Creato",
          "actions": "Azioni"
        },
        "sort": {
          "sortBy": "Ordina per {column}",
          "ascending": "Crescente",
          "descending": "Decrescente",
          "unsorted": "Clicca per ordinare"
        },
        "empty": "Nessuna guida disponibile",
        "edit": "Modifica",
        "editAriaLabel": "Modifica {title}"
      },
      "settings": {
        "showColumns": "Mostra colonne",
        "columnSettings": "Impostazioni colonne"
      },
      "toolbar": {
        "searchPlaceholder": "Cerca guide...",
        "purpose": "Scopo",
        "purposeWithCount": "Scopo ({count})",
        "clearFilters": "Cancella filtri",
        "resultCount": "Visualizzazione di {count} su {total} guide",
        "viewMode": "Modalità visualizzazione",
        "gridView": "Vista griglia",
        "listView": "Vista elenco",
        "controls": "Controlli gestione guide"
      },
      "grid": {
        "ariaLabel": "{count, plural, one {# guida} other {# guide}}",
        "loading": "Caricamento guide",
        "empty": {
          "title": "Nessuna guida trovata",
          "subtitle": "Prova a modificare la ricerca o i filtri"
        },
        "pressEnterToEdit": "Premi Invio per modificare."
      },
      "card": {
        "editAriaLabel": "{title} - {itemName} - {purpose}. Premi Invio per modificare."
      },
      "page": {
        "loading": "Caricamento guide...",
        "loadingArticle": "Caricamento dati articolo...",
        "redirectingToLogin": "Reindirizzamento al login...",
        "authRequired": "Autenticazione richiesta",
        "authRequiredMessage": "Effettua l'accesso per visualizzare le guide.",
        "goToLogin": "Vai al login",
        "errorLoading": "Errore nel caricamento delle guide",
        "errorLoadingArticle": "Errore nel caricamento dell'articolo",
        "retry": "Riprova",
        "backToGuides": "Torna alle guide",
        "successMessage": "Guida aggiornata con successo",
        "dismissSuccess": "Chiudi messaggio di successo"
      },
      "empty": {
        "title": "Nessuna guida ancora",
        "description": "Crea oggetti e aggiungi articoli guida per iniziare. Le guide aiutano gli ospiti a capire come usare gli oggetti nella tua proprietà.",
        "createFirst": "Crea il tuo primo oggetto",
        "learnMore": "Scopri di più"
      },
      "viewer": {
        "ariaLabel": "Guide dell'oggetto",
        "header": "Guide",
        "empty": "Nessuna guida fornita."
      },
      "itemList": {
        "header": "Guide",
        "subtitle": "Contenuto associato a questo oggetto",
        "empty": {
          "title": "Nessuna guida ancora",
          "description": "Le guide per questo oggetto appariranno qui"
        }
      }
    },
    "purposes": {
      "how_to_use": "Come usare",
      "how-to-use": "Come usare",
      "troubleshooting": "Risoluzione problemi",
      "how_to_clean": "Come pulire",
      "how-to-clean": "Come pulire",
      "safety_info": "Info sicurezza",
      "safety-info": "Info sicurezza",
      "maintenance": "Manutenzione",
      "features": "Caratteristiche",
      "other": "Altro"
    }
  }
}
```

#### 11.6 Acceptance Criteria

- [ ] All 5 non-English language files contain `articles.instructions` namespace
- [ ] All 5 non-English language files contain `articles.purposes` namespace
- [ ] Key structure is identical across all language files
- [ ] Translations are contextually appropriate for property management domain
- [ ] ICU pluralization format is correctly applied where needed

---

### Task 12: Create Shared `formatPurposeLabel` Utility (Optional Enhancement)

**Estimated Effort:** 1 story point
**File:** `/src/lib/i18n/purpose-translations.ts` (new file)
**Type:** Utility creation

#### 12.1 Create New File

**Path:** `/src/lib/i18n/purpose-translations.ts`

```typescript
/**
 * Purpose Translation Utility
 * Created: 2026-01-19
 * REQ-396: Shared utility for translating purpose labels
 *
 * Provides a hook for translating purpose types across Instructions components.
 * Eliminates duplication of formatPurposeLabel function.
 */

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

/**
 * Valid purpose types that have translation keys
 */
export type PurposeType =
  | 'how_to_use'
  | 'how-to-use'
  | 'troubleshooting'
  | 'how_to_clean'
  | 'how-to-clean'
  | 'safety_info'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';

/**
 * Hook for translating purpose labels
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const formatPurpose = usePurposeLabel();
 *   return <span>{formatPurpose('how_to_use')}</span>; // "How To Use"
 * }
 * ```
 */
export function usePurposeLabel() {
  const t = useTranslations('articles.purposes');

  return useCallback(
    (purpose: string): string => {
      try {
        return t(purpose as PurposeType);
      } catch {
        // Fallback for unknown purpose types
        return purpose
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    },
    [t]
  );
}

/**
 * Get badge color for purpose type (non-i18n utility)
 * Kept separate as colors don't need translation
 */
export function getPurposeBadgeColor(purpose: string): string {
  switch (purpose) {
    case 'how_to_use':
    case 'how-to-use':
      return 'bg-blue-100 text-blue-800';
    case 'troubleshooting':
      return 'bg-orange-100 text-orange-800';
    case 'how_to_clean':
    case 'how-to-clean':
      return 'bg-green-100 text-green-800';
    case 'safety_info':
    case 'safety-info':
      return 'bg-red-100 text-red-800';
    case 'maintenance':
      return 'bg-purple-100 text-purple-800';
    case 'features':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
```

#### 12.2 Export from Index

**Update:** `/src/lib/i18n/index.ts`

```typescript
// Add export
export { usePurposeLabel, getPurposeBadgeColor } from './purpose-translations';
export type { PurposeType } from './purpose-translations';
```

#### 12.3 Update Components to Use Shared Utility

Components can optionally be refactored to use this shared utility instead of inline implementations:

```typescript
// Import in components
import { usePurposeLabel, getPurposeBadgeColor } from '@/lib/i18n';

// Use in component
const formatPurposeLabel = usePurposeLabel();
```

#### 12.4 Acceptance Criteria

- [ ] Utility file created at specified path
- [ ] `usePurposeLabel` hook works correctly with all purpose types
- [ ] Fallback works for unknown purpose types
- [ ] `getPurposeBadgeColor` centralized for consistency
- [ ] Exported from index file

---

## Implementation Order

The recommended implementation order is:

1. **Task 1** - Add translation keys to en.json (foundation)
2. **Task 12** - Create shared utility (optional, can be deferred)
3. **Task 2** - InstructionsTable (most complex component)
4. **Task 3** - InstructionsViewer
5. **Task 4** - GuideColumnSettingsPopup
6. **Task 5** - GuideToolbar
7. **Task 6** - GuideCard
8. **Task 7** - GuideGrid
9. **Task 8** - Instructions page
10. **Task 9** - Edit Article page
11. **Task 10** - ItemInstructionsList
12. **Task 11** - Generate non-English translations (can run in parallel with Tasks 3-10)

---

## Testing Verification Checklist

After implementation, verify:

### Functional Testing

- [ ] Instructions page loads correctly in all 6 languages
- [ ] Table columns display translated headers
- [ ] Sort functionality works with translated aria-labels
- [ ] Purpose badges show translated labels
- [ ] Date formatting adapts to locale (e.g., "Jan 19, 2026" vs "19 Jan 2026")
- [ ] Empty states display translated messages
- [ ] Loading states display translated messages
- [ ] Error states display translated messages
- [ ] Grid view shows translated aria-labels
- [ ] Search placeholder is translated
- [ ] Filter button shows translated text with count
- [ ] Clear filters button is translated

### Visual QA

- [ ] German translations don't break table column widths
- [ ] French translations fit within card layouts
- [ ] Purpose badges accommodate longer translations
- [ ] Button labels don't overflow their containers

### Accessibility Testing

- [ ] Screen readers announce translated aria-labels
- [ ] Sort state announcements are translated
- [ ] Grid/list count announcements use ICU pluralization correctly

---

## Rollback Plan

If issues arise after deployment:

1. Revert component changes using git
2. Translation files can remain (no functional impact if not used)
3. No database changes involved

---

## Dependencies

### This Task Requires

- Epic 1 complete (next-intl installed and configured)
- `articles` namespace may exist from earlier 2E tasks

### Tasks That Depend on This

- None - this task completes Sub-Epic 2E

---

## Summary of Changes

| File | Type | Lines Changed (Est.) |
|------|------|---------------------|
| `/messages/en.json` | Translation keys | ~100 |
| `/messages/fr.json` | Translation keys | ~100 |
| `/messages/es.json` | Translation keys | ~100 |
| `/messages/de.json` | Translation keys | ~100 |
| `/messages/nl.json` | Translation keys | ~100 |
| `/messages/it.json` | Translation keys | ~100 |
| `InstructionsTable.tsx` | Component update | ~50 |
| `InstructionsViewer.tsx` | Component update | ~15 |
| `GuideColumnSettingsPopup.tsx` | Component update | ~20 |
| `GuideToolbar.tsx` | Component update | ~40 |
| `GuideCard.tsx` | Component update | ~25 |
| `GuideGrid.tsx` | Component update | ~15 |
| `instructions/page.tsx` | Page update | ~60 |
| `instructions/[articleId]/edit/page.tsx` | Page update | ~30 |
| `ItemInstructionsList.tsx` | Component update | ~25 |
| `purpose-translations.ts` | New utility | ~30 |
| **Total** | | **~910** |

---

## References

- [Overview Document: REQ-396-update-instructions-pages-overview.md](/docs/REQ-396-update-instructions-pages-overview.md)
- [Implementation Plan: Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
