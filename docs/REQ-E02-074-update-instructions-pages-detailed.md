# REQ-E02-074: Update Instructions Pages - Detailed Task Breakdown

**Document Created:** 2026-01-20 23:55:00 UTC
**Last Modified:** 2026-01-20 23:55:00 UTC
**Request ID:** REQ-E02-074
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.5
**Size:** M (Medium)
**Priority:** P1 - High
**Overview Document:** REQ-E02-074-update-instructions-pages-overview.md

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Prerequisites Checklist](#2-prerequisites-checklist)
3. [Task Breakdown](#3-task-breakdown)
4. [Implementation Details](#4-implementation-details)
5. [Translation Keys Reference](#5-translation-keys-reference)
6. [Testing Checklist](#6-testing-checklist)
7. [Acceptance Criteria Verification](#7-acceptance-criteria-verification)

---

## 1. Executive Summary

This document provides granular, step-by-step implementation tasks for updating all instructions pages to use the next-intl translation system. The work involves:

- **14 files** to modify
- **~149 hardcoded strings** to replace
- **6 languages** to support (en, fr, es, de, nl, it)

### Files Affected

| # | File Path | Est. Strings | Complexity |
|---|-----------|--------------|------------|
| 1 | `/src/app/dashboard2/instructions/page.tsx` | ~35 | High |
| 2 | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | ~15 | Medium |
| 3 | `/src/components/InstructionsTable/InstructionsTable.tsx` | ~15 | Medium |
| 4 | `/src/components/InstructionsTable/GuideToolbar.tsx` | ~12 | Medium |
| 5 | `/src/components/InstructionsTable/GuideCard.tsx` | ~5 | Low |
| 6 | `/src/components/InstructionsTable/GuideGrid.tsx` | ~5 | Low |
| 7 | `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | ~8 | Low |
| 8 | `/src/components/InstructionEditor/InstructionEditor.tsx` | ~12 | Medium |
| 9 | `/src/components/InstructionEditor/components/AddContentModal.tsx` | ~22 | Medium |
| 10 | `/src/components/InstructionEditor/components/ContentEditSection.tsx` | ~12 | Medium |
| 11 | `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | ~8 | Low |

---

## 2. Prerequisites Checklist

Before starting implementation, verify the following:

- [ ] **Epic 1 Complete**: next-intl is installed and configured
- [ ] **IntlProvider Active**: `/src/app/layout.tsx` wraps app with provider
- [ ] **Translation Files Exist**: `/messages/en.json` and other language files exist
- [ ] **Articles Namespace Exists**: `articles` namespace created (REQ-E02-070)
- [ ] **Common Namespace Available**: `common.actions.*` keys exist for reuse (Cancel, Retry, Edit, etc.)

---

## 3. Task Breakdown

### Task 1: Add Translation Keys to English File (1 SP)

**File:** `/messages/en.json`

**Description:** Add the `articles.instructions` namespace with all required translation keys.

**Steps:**

1.1. Open `/messages/en.json`

1.2. Add the `articles.instructions` namespace structure under the existing `articles` namespace:

```json
{
  "articles": {
    "instructions": {
      "pageTitle": "Guides",
      "pageSubtitle": "Manage guide articles for your items",

      "auth": {
        "required": "Authentication Required",
        "loginPrompt": "Please log in to access guides.",
        "goToLogin": "Go to Login"
      },

      "loading": {
        "guides": "Loading guides...",
        "article": "Loading article data...",
        "redirecting": "Redirecting to login..."
      },

      "errors": {
        "loadingGuides": "Error Loading Guides",
        "loadingArticle": "Error Loading Article",
        "retry": "Retry",
        "backToGuides": "Back to Guides"
      },

      "empty": {
        "title": "No guides yet",
        "description": "Create items and add guide articles to get started. Guides help guests understand how to use items in your property.",
        "createFirst": "Create Your First Item",
        "learnMore": "Learn More",
        "noResults": "No guides found",
        "noResultsHint": "Try adjusting your search or filters",
        "tableEmpty": "No guides available"
      },

      "success": {
        "updated": "Guide updated successfully",
        "dismiss": "Dismiss success message"
      },

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
          "descending": "Descending"
        },
        "actions": {
          "edit": "Edit",
          "editGuide": "Edit {title}"
        },
        "columnSettings": {
          "title": "Show Columns"
        }
      },

      "toolbar": {
        "viewMode": "View mode",
        "gridView": "Grid view",
        "listView": "List view",
        "searchPlaceholder": "Search guides...",
        "purpose": "Purpose",
        "purposeWithCount": "Purpose ({count})",
        "selectPurposes": "Select purpose types",
        "clearFilters": "Clear filters",
        "clearAllFilters": "Clear all filters",
        "controls": "Guide management controls",
        "showing": "Showing {count} of {total} guides"
      },

      "card": {
        "ariaLabel": "{title} - {item} - {purpose}. Press Enter to edit.",
        "loadingGrid": "Loading guides",
        "guideCount": "{count, plural, =1 {# guide} other {# guides}}"
      },

      "edit": {
        "pageTitle": "Editing Guide For: {title}",
        "articleTitle": "Article Title",
        "articleTitlePlaceholder": "Enter article title",
        "tags": "Tags",
        "unsavedChanges": "You have unsaved changes. Are you sure you want to cancel?",
        "cancel": "Cancel",
        "saving": "Saving...",
        "saveChanges": "Save Changes",

        "context": {
          "room": "Room",
          "itemType": "Item Type",
          "itemName": "Item Name",
          "unknownRoom": "Unknown Room",
          "itemTypes": {
            "appliance": "Appliance",
            "roomItem": "Room Item",
            "generalInfo": "General Info"
          }
        }
      },

      "content": {
        "title": "Content",
        "pieceCount": "({count} {count, plural, =1 {piece} other {pieces}})",
        "addContent": "Add Content",
        "dragToReorder": "Content pieces - drag to reorder",

        "modal": {
          "addTitle": "Add Content",
          "createTitle": "Create Content",
          "close": "Close modal",

          "types": {
            "text": "Write Text",
            "link": "Add Link",
            "file": "Upload File",
            "fileHint": "Video, Image, PDF"
          },

          "text": {
            "titleLabel": "Title (Optional)",
            "titlePlaceholder": "Enter a title for this content",
            "contentLabel": "Text Content *",
            "contentPlaceholder": "Enter your text content here...",
            "charCount": "{count} / 5000 characters"
          },

          "url": {
            "urlLabel": "URL *",
            "urlPlaceholder": "https://example.com",
            "titleLabel": "Link Title (Optional)",
            "titlePlaceholder": "Enter a title for this link"
          },

          "file": {
            "label": "Select File *",
            "selected": "Selected: {filename} ({size} MB)"
          },

          "actions": {
            "back": "Back",
            "cancel": "Cancel",
            "add": "Add Content"
          }
        },

        "remove": {
          "title": "Remove Last Content?",
          "message": "This is the only piece of content. Removing it will leave this guide empty. Are you sure you want to remove it?",
          "cancel": "Cancel",
          "confirm": "Remove"
        },

        "drag": {
          "pickedUp": "Picked up {type} content. Current position: {position} of {total}. Use arrow keys to move.",
          "overPosition": "Over position {position}",
          "dropped": "Dropped {type} content. New position: {position} of {total}",
          "unchanged": "Position unchanged.",
          "cancelled": "Drag cancelled. Content returned to original position."
        }
      }
    }
  }
}
```

1.3. Verify JSON syntax is valid (no trailing commas, proper escaping)

**Verification:**
- [ ] JSON file parses without errors
- [ ] All nested keys are properly structured
- [ ] Pluralization syntax is correct (`{count, plural, =1 {...} other {...}}`)

---

### Task 2: Update Instructions Page (1 SP)

**File:** `/src/app/dashboard2/instructions/page.tsx`

**Description:** Replace all hardcoded strings with translation calls.

**Steps:**

2.1. Add import at the top of the file:
```typescript
import { useTranslations } from 'next-intl';
```

2.2. Add translation hook inside the component:
```typescript
export default function InstructionsPage() {
  const t = useTranslations('articles.instructions');
  // ... rest of component
```

2.3. Replace Authentication State section (lines ~239-250):
```typescript
// BEFORE:
<h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
<p className="text-gray-600 mb-6">Please log in to access guides.</p>
<button ...>Go to Login</button>

// AFTER:
<h2 className="text-xl font-semibold text-gray-900 mb-4">{t('auth.required')}</h2>
<p className="text-gray-600 mb-6">{t('auth.loginPrompt')}</p>
<button ...>{t('auth.goToLogin')}</button>
```

2.4. Replace Loading State (lines ~254-262):
```typescript
// BEFORE:
<p className="text-gray-600">Loading guides...</p>

// AFTER:
<p className="text-gray-600">{t('loading.guides')}</p>
```

2.5. Replace Error State (lines ~265-280):
```typescript
// BEFORE:
<h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Guides</h2>
<button ...>Retry</button>

// AFTER:
<h2 className="text-xl font-semibold text-red-900 mb-2">{t('errors.loadingGuides')}</h2>
<button ...>{t('errors.retry')}</button>
```

2.6. Replace Empty State (lines ~283-310):
```typescript
// BEFORE:
<h2 className="text-2xl font-bold text-gray-900 mb-3">No guides yet</h2>
<p className="text-gray-600 mb-8 max-w-md mx-auto">
  Create items and add guide articles to get started. Guides help guests
  understand how to use items in your property.
</p>
<Link href="/dashboard2/create" ...>Create Your First Item</Link>
<Link href="/dashboard2/help" ...>Learn More</Link>

// AFTER:
<h2 className="text-2xl font-bold text-gray-900 mb-3">{t('empty.title')}</h2>
<p className="text-gray-600 mb-8 max-w-md mx-auto">{t('empty.description')}</p>
<Link href="/dashboard2/create" ...>{t('empty.createFirst')}</Link>
<Link href="/dashboard2/help" ...>{t('empty.learnMore')}</Link>
```

2.7. Replace Success Banner (lines ~316-345):
```typescript
// BEFORE:
<p className="text-sm font-medium text-green-800">Guide updated successfully</p>
<button ... aria-label="Dismiss success message">

// AFTER:
<p className="text-sm font-medium text-green-800">{t('success.updated')}</p>
<button ... aria-label={t('success.dismiss')}>
```

2.8. Replace Page Header (lines ~348-363):
```typescript
// BEFORE:
<h1 id="instructions-title" className="text-2xl font-bold text-gray-900">Guides</h1>
<p className="text-gray-600 mt-1">Manage guide articles for your items</p>

// AFTER:
<h1 id="instructions-title" className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
<p className="text-gray-600 mt-1">{t('pageSubtitle')}</p>
```

**Verification:**
- [ ] No TypeScript errors
- [ ] All hardcoded strings replaced
- [ ] Page renders correctly with English translations

---

### Task 3: Update Edit Article Page (1 SP)

**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Description:** Replace hardcoded strings in the edit page.

**Steps:**

3.1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';

export default function EditArticlePage() {
  const t = useTranslations('articles.instructions');
```

3.2. Replace Auth Redirect text (lines ~192-200):
```typescript
// BEFORE:
<p className="text-gray-600">Redirecting to login...</p>

// AFTER:
<p className="text-gray-600">{t('loading.redirecting')}</p>
```

3.3. Replace Loading State (lines ~203-213):
```typescript
// BEFORE:
<p className="text-gray-600">Loading article data...</p>

// AFTER:
<p className="text-gray-600">{t('loading.article')}</p>
```

3.4. Replace Error State (lines ~215-238):
```typescript
// BEFORE:
<h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Article</h2>
<button ...>Retry</button>
<button ...>Back to Guides</button>

// AFTER:
<h2 className="text-xl font-semibold text-red-900 mb-2">{t('errors.loadingArticle')}</h2>
<button ...>{t('errors.retry')}</button>
<button ...>{t('errors.backToGuides')}</button>
```

**Verification:**
- [ ] All auth, loading, and error states use translations
- [ ] Page navigates and loads correctly

---

### Task 4: Update InstructionsTable Component (1 SP)

**File:** `/src/components/InstructionsTable/InstructionsTable.tsx`

**Description:** Replace column headers, sort labels, and action buttons.

**Steps:**

4.1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';

export function InstructionsTable({ ... }: InstructionsTableProps) {
  const t = useTranslations('articles.instructions.table');
```

4.2. Update SortableColumnHeader component to accept translations:
```typescript
// Option A: Pass t function as prop
// Option B: Use hook inside SortableColumnHeader

// Replace aria-label pattern (line ~61):
// BEFORE:
aria-label={`Sort by ${label}`}

// AFTER (if using hook in parent):
aria-label={t('sort.sortBy', { column: label })}
```

4.3. Replace all column header labels:
```typescript
// Replace all instances of:
label="Title" -> label={t('columns.title')}
label="Item" -> label={t('columns.item')}
label="Room" -> label={t('columns.room')}
label="Property" -> label={t('columns.property')}
label="Purpose" -> label={t('columns.purpose')}
label="Created" -> label={t('columns.created')}

// And static text spans:
<span className="...">Title</span> -> <span className="...">{t('columns.title')}</span>
<span className="...">Actions</span> -> <span className="...">{t('columns.actions')}</span>
```

4.4. Replace sort direction labels (lines ~66-68):
```typescript
// BEFORE:
<ArrowUp className="h-3 w-3" aria-label="Ascending" />
<ArrowDown className="h-3 w-3" aria-label="Descending" />

// AFTER:
<ArrowUp className="h-3 w-3" aria-label={t('sort.ascending')} />
<ArrowDown className="h-3 w-3" aria-label={t('sort.descending')} />
```

4.5. Replace empty state (line ~331):
```typescript
// BEFORE:
No guides available

// AFTER:
{t('columns.empty') || 'No guides available'}
```
Note: Use key from parent namespace: `t('empty.tableEmpty')` after adjusting namespace

4.6. Replace edit button (lines ~411-414):
```typescript
// BEFORE:
aria-label={`Edit ${instruction.articleTitle}`}
<span>Edit</span>

// AFTER:
aria-label={t('actions.editGuide', { title: instruction.articleTitle })}
<span>{t('actions.edit')}</span>
```

**Verification:**
- [ ] All column headers display translated text
- [ ] Sort indicators have translated aria-labels
- [ ] Edit buttons use translated labels

---

### Task 5: Update GuideToolbar Component (1 SP)

**File:** `/src/components/InstructionsTable/GuideToolbar.tsx`

**Description:** Replace toolbar labels, aria-labels, and filter text.

**Steps:**

5.1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';

export function GuideToolbar({ ... }: GuideToolbarProps) {
  const t = useTranslations('articles.instructions.toolbar');
```

5.2. Update ViewToggle aria-labels (lines ~77, 96, 117):
```typescript
// BEFORE:
aria-label="View mode"
aria-label="Grid view"
aria-label="List view"

// AFTER:
aria-label={t('viewMode')}
aria-label={t('gridView')}
aria-label={t('listView')}
```

5.3. Update PurposeFilterDropdown labels (lines ~196-207):
```typescript
// BEFORE:
{selectedPurposes.length > 0
  ? `Purpose (${selectedPurposes.length})`
  : 'Purpose'}
aria-label="Select purpose types"

// AFTER:
{selectedPurposes.length > 0
  ? t('purposeWithCount', { count: selectedPurposes.length })
  : t('purpose')}
aria-label={t('selectPurposes')}
```

5.4. Update ClearFiltersButton (lines ~263, 275):
```typescript
// BEFORE:
aria-label="Clear all filters"
<span>Clear filters</span>

// AFTER:
aria-label={t('clearAllFilters')}
<span>{t('clearFilters')}</span>
```

5.5. Update toolbar aria-label (line ~300):
```typescript
// BEFORE:
aria-label="Guide management controls"

// AFTER:
aria-label={t('controls')}
```

5.6. Update SearchInput placeholder (line ~318):
```typescript
// BEFORE:
placeholder="Search guides..."

// AFTER:
placeholder={t('searchPlaceholder')}
```

5.7. Update result count text (line ~340):
```typescript
// BEFORE:
Showing {resultCount} of {totalCount} guides

// AFTER:
{t('showing', { count: resultCount, total: totalCount })}
```

**Verification:**
- [ ] All toolbar controls have translated text
- [ ] Search placeholder is translated
- [ ] Result count displays correctly

---

### Task 6: Update GuideCard Component (1 SP)

**File:** `/src/components/InstructionsTable/GuideCard.tsx`

**Description:** Replace card aria-labels and button text.

**Steps:**

6.1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';

export function GuideCard({ guide, onEdit, className }: GuideCardProps) {
  const t = useTranslations('articles.instructions');
```

6.2. Update card aria-label (line ~115):
```typescript
// BEFORE:
aria-label={`${guide.articleTitle} - ${guide.itemName} - ${formattedPurpose}. Press Enter to edit.`}

// AFTER:
aria-label={t('card.ariaLabel', {
  title: guide.articleTitle,
  item: guide.itemName,
  purpose: formattedPurpose
})}
```

6.3. Update edit button (lines ~189, 192):
```typescript
// BEFORE:
aria-label={`Edit ${guide.articleTitle}`}
<span>Edit</span>

// AFTER:
aria-label={t('table.actions.editGuide', { title: guide.articleTitle })}
<span>{t('table.actions.edit')}</span>
```

**Verification:**
- [ ] Card has descriptive translated aria-label
- [ ] Edit button displays translated text

---

### Task 7: Update GuideGrid Component (1 SP)

**File:** `/src/components/InstructionsTable/GuideGrid.tsx`

**Description:** Replace loading, empty, and grid aria-labels.

**Steps:**

7.1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';

export function GuideGrid({ ... }: GuideGridProps) {
  const t = useTranslations('articles.instructions');
```

7.2. Update loading grid aria-label (line ~76):
```typescript
// BEFORE:
aria-label="Loading guides"

// AFTER:
aria-label={t('card.loadingGrid')}
```

7.3. Update empty state (lines ~100-101):
```typescript
// BEFORE:
<p className="text-lg font-medium text-gray-900">No guides found</p>
<p className="text-sm mt-1">Try adjusting your search or filters</p>

// AFTER:
<p className="text-lg font-medium text-gray-900">{t('empty.noResults')}</p>
<p className="text-sm mt-1">{t('empty.noResultsHint')}</p>
```

7.4. Update grid aria-label (line ~115):
```typescript
// BEFORE:
aria-label={`${guides.length} guide${guides.length !== 1 ? 's' : ''}`}

// AFTER:
aria-label={t('card.guideCount', { count: guides.length })}
```

**Verification:**
- [ ] Loading state has translated aria-label
- [ ] Empty state shows translated messages
- [ ] Grid announces correct count in user's language

---

### Task 8: Update GuideColumnSettingsPopup (1 SP)

**File:** `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx`

**Description:** Replace column visibility toggle labels.

**Steps:**

8.1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';

export function GuideColumnSettingsPopup({ ... }: GuideColumnSettingsPopupProps) {
  const t = useTranslations('articles.instructions.table');
```

8.2. Update header text (line ~92-93):
```typescript
// BEFORE:
<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
  Show Columns
</p>

// AFTER:
<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
  {t('columnSettings.title')}
</p>
```

8.3. Update column labels dynamically:
```typescript
// Update COLUMN_OPTIONS to use translation keys:
// Instead of hardcoded labels, either:
// Option A: Map translation keys
const getColumnLabel = (key: string) => t(`columns.${key}`);

// Or modify the rendering:
<span>{t(`columns.${option.key}`)}</span>
```

**Verification:**
- [ ] Popup header displays translated text
- [ ] Column option labels are translated

---

### Task 9: Update InstructionEditor Component (1 SP)

**File:** `/src/components/InstructionEditor/InstructionEditor.tsx`

**Description:** Replace form labels, placeholders, and button text.

**Steps:**

9.1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';

export function InstructionEditor({ ... }: InstructionEditorProps) {
  const t = useTranslations('articles.instructions.edit');
```

9.2. Update Article Title label (lines ~172-177):
```typescript
// BEFORE:
<label ... className="block text-sm font-medium text-[#717171] mb-2">
  Article Title
</label>

// AFTER:
<label ... className="block text-sm font-medium text-[#717171] mb-2">
  {t('articleTitle')}
</label>
```

9.3. Update placeholder (line ~197):
```typescript
// BEFORE:
placeholder="Enter article title"

// AFTER:
placeholder={t('articleTitlePlaceholder')}
```

9.4. Update Tags label (line ~204):
```typescript
// BEFORE:
<label className="...">Tags</label>

// AFTER:
<label className="...">{t('tags')}</label>
```

9.5. Update confirmation dialog (line ~150):
```typescript
// BEFORE:
const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');

// AFTER:
const confirmed = window.confirm(t('unsavedChanges'));
```

9.6. Update action buttons (lines ~241, 258):
```typescript
// BEFORE:
>Cancel</button>
{isSaving ? 'Saving...' : 'Save Changes'}

// AFTER:
>{t('cancel')}</button>
{isSaving ? t('saving') : t('saveChanges')}
```

**Verification:**
- [ ] All form labels are translated
- [ ] Confirmation dialog uses translated text
- [ ] Button states display correctly

---

### Task 10: Update AddContentModal Component (1 SP)

**File:** `/src/components/InstructionEditor/components/AddContentModal.tsx`

**Description:** Replace modal titles, labels, placeholders, and buttons.

**Steps:**

10.1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';

export function AddContentModal({ ... }: AddContentModalProps) {
  const t = useTranslations('articles.instructions.content.modal');
```

10.2. Update modal title (line ~148):
```typescript
// BEFORE:
{step === 'select' ? 'Add Content' : 'Create Content'}

// AFTER:
{step === 'select' ? t('addTitle') : t('createTitle')}
```

10.3. Update close button aria-label (line ~154):
```typescript
// BEFORE:
aria-label="Close modal"

// AFTER:
aria-label={t('close')}
```

10.4. Update content type buttons (lines ~171, 181, 191-192):
```typescript
// BEFORE:
<span className="font-medium text-[#222222]">Write Text</span>
<span className="font-medium text-[#222222]">Add Link</span>
<span className="font-medium text-[#222222]">Upload File</span>
<span className="text-sm text-[#717171]">Video, Image, PDF</span>

// AFTER:
<span className="font-medium text-[#222222]">{t('types.text')}</span>
<span className="font-medium text-[#222222]">{t('types.link')}</span>
<span className="font-medium text-[#222222]">{t('types.file')}</span>
<span className="text-sm text-[#717171]">{t('types.fileHint')}</span>
```

10.5. Update text form labels (lines ~200-227):
```typescript
// BEFORE:
<label ...>Title (Optional)</label>
placeholder="Enter a title for this content"
<label ...>Text Content *</label>
placeholder="Enter your text content here..."
<p ...>{textContent.length} / 5000 characters</p>

// AFTER:
<label ...>{t('text.titleLabel')}</label>
placeholder={t('text.titlePlaceholder')}
<label ...>{t('text.contentLabel')}</label>
placeholder={t('text.contentPlaceholder')}
<p ...>{t('text.charCount', { count: textContent.length })}</p>
```

10.6. Update URL form labels (lines ~235-259):
```typescript
// BEFORE:
<label ...>URL *</label>
placeholder="https://example.com"
<label ...>Link Title (Optional)</label>
placeholder="Enter a title for this link"

// AFTER:
<label ...>{t('url.urlLabel')}</label>
placeholder={t('url.urlPlaceholder')}
<label ...>{t('url.titleLabel')}</label>
placeholder={t('url.titlePlaceholder')}
```

10.7. Update file form (lines ~267-279):
```typescript
// BEFORE:
<label ...>Select File *</label>
<p ...>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>

// AFTER:
<label ...>{t('file.label')}</label>
<p ...>{t('file.selected', {
  filename: selectedFile.name,
  size: (selectedFile.size / 1024 / 1024).toFixed(2)
})}</p>
```

10.8. Update action buttons (lines ~294, 303, 317):
```typescript
// BEFORE:
>Back</button>
>Cancel</button>
>Add Content</button>

// AFTER:
>{t('actions.back')}</button>
>{t('actions.cancel')}</button>
>{t('actions.add')}</button>
```

**Verification:**
- [ ] Modal title changes based on step
- [ ] All form labels and placeholders are translated
- [ ] Character count displays correctly
- [ ] All buttons show translated text

---

### Task 11: Update ContentEditSection Component (1 SP)

**File:** `/src/components/InstructionEditor/components/ContentEditSection.tsx`

**Description:** Replace section title, drag announcements, and confirmation dialog.

**Steps:**

11.1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';

export function ContentEditSection({ ... }: ContentEditSectionProps) {
  const t = useTranslations('articles.instructions.content');
```

11.2. Update section header (lines ~211-215):
```typescript
// BEFORE:
<h2 className="text-lg font-semibold text-[#222222]">
  Content
  <span className="ml-2 text-sm font-normal text-[#717171]">
    ({content.length} piece{content.length !== 1 ? 's' : ''})
  </span>
</h2>

// AFTER:
<h2 className="text-lg font-semibold text-[#222222]">
  {t('title')}
  <span className="ml-2 text-sm font-normal text-[#717171]">
    {t('pieceCount', { count: content.length })}
  </span>
</h2>
```

11.3. Update drag announcements (lines ~154-179):
```typescript
// BEFORE:
return `Picked up ${typeName}. Current position: ${position} of ${content.length}. Use arrow keys to move.`;
return `Over position ${position}`;
return `Dropped ${typeName}. New position: ${newPosition} of ${content.length}`;
return 'Position unchanged.';
return 'Drag cancelled. Content returned to original position.';

// AFTER:
return t('drag.pickedUp', { type: typeName, position, total: content.length });
return t('drag.overPosition', { position });
return t('drag.dropped', { type: typeName, position: newPosition, total: content.length });
return t('drag.unchanged');
return t('drag.cancelled');
```

11.4. Update list aria-label (line ~236):
```typescript
// BEFORE:
aria-label="Content pieces - drag to reorder"

// AFTER:
aria-label={t('dragToReorder')}
```

11.5. Update add button (line ~269):
```typescript
// BEFORE:
<span>Add Content</span>

// AFTER:
<span>{t('addContent')}</span>
```

11.6. Update confirmation dialog (lines ~285-306):
```typescript
// BEFORE:
<h3 ...>Remove Last Content?</h3>
<p ...>This is the only piece of content. Removing it will leave this guide empty.
Are you sure you want to remove it?</p>
>Cancel</button>
>Remove</button>

// AFTER:
<h3 ...>{t('remove.title')}</h3>
<p ...>{t('remove.message')}</p>
>{t('remove.cancel')}</button>
>{t('remove.confirm')}</button>
```

**Verification:**
- [ ] Section header shows translated title and count
- [ ] All drag announcements work with screen readers
- [ ] Confirmation dialog is fully translated

---

### Task 12: Update ReadOnlyContextSection Component (1 SP)

**File:** `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx`

**Description:** Replace labels and fallback values.

**Steps:**

12.1. Add import and hook:
```typescript
import { useTranslations } from 'next-intl';

export function ReadOnlyContextSection({ articleData }: ReadOnlyContextSectionProps) {
  const t = useTranslations('articles.instructions.edit.context');
```

12.2. Update item type extraction function (lines ~13-18):
```typescript
// BEFORE:
function extractItemTypeFromTags(tags: string[]): string {
  if (tags.some(t => t.startsWith('#appliance'))) return 'Appliance';
  if (tags.some(t => t.startsWith('#room-item'))) return 'Room Item';
  if (tags.some(t => t.startsWith('#general-info'))) return 'General Info';
  return 'Appliance'; // Default
}

// AFTER: Pass translation function or use keys
// Option A: Return keys and translate in component
function extractItemTypeKey(tags: string[]): string {
  if (tags.some(t => t.startsWith('#appliance'))) return 'appliance';
  if (tags.some(t => t.startsWith('#room-item'))) return 'roomItem';
  if (tags.some(t => t.startsWith('#general-info'))) return 'generalInfo';
  return 'appliance';
}

// Then in component:
const itemTypeKey = extractItemTypeKey(articleData.item.tags);
const itemType = t(`itemTypes.${itemTypeKey}`);
```

12.3. Update fallback room name (line ~25):
```typescript
// BEFORE:
const roomName = extractRoomFromTags(articleData.item.tags) || 'Unknown Room';

// AFTER:
const roomName = extractRoomFromTags(articleData.item.tags) || t('unknownRoom');
```

12.4. Update page heading (lines ~32-34):
```typescript
// BEFORE:
<h1 className="text-2xl font-semibold text-[#222222]">
  Editing Guide For: {articleData.title}
</h1>

// AFTER:
// Note: Need to use parent namespace for this
const tEdit = useTranslations('articles.instructions.edit');
<h1 className="text-2xl font-semibold text-[#222222]">
  {tEdit('pageTitle', { title: articleData.title })}
</h1>
```

12.5. Update field labels (lines ~41, 49, 57):
```typescript
// BEFORE:
<dt className="text-sm font-medium text-[#717171]">Room</dt>
<dt className="text-sm font-medium text-[#717171]">Item Type</dt>
<dt className="text-sm font-medium text-[#717171]">Item Name</dt>

// AFTER:
<dt className="text-sm font-medium text-[#717171]">{t('room')}</dt>
<dt className="text-sm font-medium text-[#717171]">{t('itemType')}</dt>
<dt className="text-sm font-medium text-[#717171]">{t('itemName')}</dt>
```

**Verification:**
- [ ] All field labels are translated
- [ ] Item types display in user's language
- [ ] Fallback room name uses translation

---

### Task 13: Generate Translations for 5 Non-English Languages (1 SP)

**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

**Description:** Add translations for all new keys to the 5 non-English language files.

**Steps:**

13.1. Copy the entire `articles.instructions` namespace structure to each language file

13.2. Translate all values for French (fr.json):
```json
{
  "articles": {
    "instructions": {
      "pageTitle": "Guides",
      "pageSubtitle": "Gerez les articles de guide pour vos objets",
      "auth": {
        "required": "Authentification requise",
        "loginPrompt": "Veuillez vous connecter pour acceder aux guides.",
        "goToLogin": "Aller a la connexion"
      },
      // ... continue for all keys
    }
  }
}
```

13.3. Translate all values for Spanish (es.json)

13.4. Translate all values for German (de.json)

13.5. Translate all values for Dutch (nl.json)

13.6. Translate all values for Italian (it.json)

**Important Notes:**
- Preserve ICU pluralization syntax
- Preserve variable placeholders (`{count}`, `{title}`, etc.)
- Test German translations for text expansion (typically 30-40% longer)
- Ensure proper character escaping for special characters

**Verification:**
- [ ] All 6 language files have identical key structures
- [ ] Pluralization works correctly in all languages
- [ ] Variable interpolation renders correctly
- [ ] No JSON syntax errors

---

### Task 14: Integration Testing (1 SP)

**Description:** Verify all translations work correctly across the instructions pages.

**Steps:**

14.1. **English verification:**
- [ ] Navigate to `/dashboard2/instructions` in English
- [ ] Verify page title and subtitle
- [ ] Test loading, error, and empty states
- [ ] Test search, filter, and view toggle functionality
- [ ] Click edit on a guide and verify edit page
- [ ] Test all modal dialogs
- [ ] Test drag-and-drop accessibility announcements

14.2. **Multi-language verification:**
- [ ] Switch to each language and repeat above tests
- [ ] Verify no hardcoded English text appears
- [ ] Check for layout issues with longer translations (German)
- [ ] Verify pluralization works (1 guide vs 2 guides)

14.3. **Accessibility verification:**
- [ ] Test with screen reader in multiple languages
- [ ] Verify all aria-labels are translated
- [ ] Test keyboard navigation

14.4. **Build verification:**
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run lint` - no warnings about missing translations

---

## 4. Implementation Details

### Import Pattern for Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function ComponentName() {
  const t = useTranslations('articles.instructions');
  // Use t('key') or t('nested.key')
  // Use t('key', { variable: value }) for interpolation
}
```

### Pluralization Pattern

```json
{
  "pieceCount": "({count} {count, plural, =1 {piece} other {pieces}})"
}
```

```typescript
t('pieceCount', { count: 3 }) // "(3 pieces)"
t('pieceCount', { count: 1 }) // "(1 piece)"
```

### Variable Interpolation Pattern

```json
{
  "editGuide": "Edit {title}"
}
```

```typescript
t('editGuide', { title: 'Coffee Machine Guide' }) // "Edit Coffee Machine Guide"
```

---

## 5. Translation Keys Reference

| Key Path | English Value | Usage Location |
|----------|---------------|----------------|
| `articles.instructions.pageTitle` | Guides | page.tsx header |
| `articles.instructions.pageSubtitle` | Manage guide articles for your items | page.tsx header |
| `articles.instructions.auth.required` | Authentication Required | page.tsx auth state |
| `articles.instructions.auth.loginPrompt` | Please log in to access guides. | page.tsx auth state |
| `articles.instructions.auth.goToLogin` | Go to Login | page.tsx auth button |
| `articles.instructions.loading.guides` | Loading guides... | page.tsx loading |
| `articles.instructions.loading.article` | Loading article data... | edit/page.tsx |
| `articles.instructions.loading.redirecting` | Redirecting to login... | edit/page.tsx |
| `articles.instructions.errors.loadingGuides` | Error Loading Guides | page.tsx error |
| `articles.instructions.errors.loadingArticle` | Error Loading Article | edit/page.tsx |
| `articles.instructions.errors.retry` | Retry | error buttons |
| `articles.instructions.errors.backToGuides` | Back to Guides | edit/page.tsx |
| `articles.instructions.empty.title` | No guides yet | page.tsx empty |
| `articles.instructions.empty.description` | Create items and add guide articles... | page.tsx empty |
| `articles.instructions.empty.createFirst` | Create Your First Item | page.tsx empty CTA |
| `articles.instructions.empty.learnMore` | Learn More | page.tsx empty |
| `articles.instructions.empty.noResults` | No guides found | GuideGrid empty |
| `articles.instructions.empty.noResultsHint` | Try adjusting your search or filters | GuideGrid empty |
| `articles.instructions.empty.tableEmpty` | No guides available | InstructionsTable |
| `articles.instructions.success.updated` | Guide updated successfully | page.tsx success |
| `articles.instructions.success.dismiss` | Dismiss success message | page.tsx success |
| `articles.instructions.table.columns.title` | Title | InstructionsTable |
| `articles.instructions.table.columns.item` | Item | InstructionsTable |
| `articles.instructions.table.columns.room` | Room | InstructionsTable |
| `articles.instructions.table.columns.property` | Property | InstructionsTable |
| `articles.instructions.table.columns.purpose` | Purpose | InstructionsTable |
| `articles.instructions.table.columns.created` | Created | InstructionsTable |
| `articles.instructions.table.columns.actions` | Actions | InstructionsTable |
| `articles.instructions.table.sort.sortBy` | Sort by {column} | SortableColumnHeader |
| `articles.instructions.table.sort.ascending` | Ascending | SortableColumnHeader |
| `articles.instructions.table.sort.descending` | Descending | SortableColumnHeader |
| `articles.instructions.table.actions.edit` | Edit | edit buttons |
| `articles.instructions.table.actions.editGuide` | Edit {title} | edit button aria |
| `articles.instructions.table.columnSettings.title` | Show Columns | GuideColumnSettingsPopup |
| `articles.instructions.toolbar.viewMode` | View mode | GuideToolbar |
| `articles.instructions.toolbar.gridView` | Grid view | GuideToolbar |
| `articles.instructions.toolbar.listView` | List view | GuideToolbar |
| `articles.instructions.toolbar.searchPlaceholder` | Search guides... | GuideToolbar |
| `articles.instructions.toolbar.purpose` | Purpose | GuideToolbar filter |
| `articles.instructions.toolbar.purposeWithCount` | Purpose ({count}) | GuideToolbar filter |
| `articles.instructions.toolbar.selectPurposes` | Select purpose types | GuideToolbar filter |
| `articles.instructions.toolbar.clearFilters` | Clear filters | GuideToolbar |
| `articles.instructions.toolbar.clearAllFilters` | Clear all filters | GuideToolbar aria |
| `articles.instructions.toolbar.controls` | Guide management controls | GuideToolbar aria |
| `articles.instructions.toolbar.showing` | Showing {count} of {total} guides | GuideToolbar |
| `articles.instructions.card.ariaLabel` | {title} - {item} - {purpose}. Press Enter to edit. | GuideCard |
| `articles.instructions.card.loadingGrid` | Loading guides | GuideGrid loading |
| `articles.instructions.card.guideCount` | {count} guide(s) | GuideGrid aria |
| `articles.instructions.edit.pageTitle` | Editing Guide For: {title} | ReadOnlyContextSection |
| `articles.instructions.edit.articleTitle` | Article Title | InstructionEditor |
| `articles.instructions.edit.articleTitlePlaceholder` | Enter article title | InstructionEditor |
| `articles.instructions.edit.tags` | Tags | InstructionEditor |
| `articles.instructions.edit.unsavedChanges` | You have unsaved changes... | InstructionEditor |
| `articles.instructions.edit.cancel` | Cancel | InstructionEditor |
| `articles.instructions.edit.saving` | Saving... | InstructionEditor |
| `articles.instructions.edit.saveChanges` | Save Changes | InstructionEditor |
| `articles.instructions.edit.context.room` | Room | ReadOnlyContextSection |
| `articles.instructions.edit.context.itemType` | Item Type | ReadOnlyContextSection |
| `articles.instructions.edit.context.itemName` | Item Name | ReadOnlyContextSection |
| `articles.instructions.edit.context.unknownRoom` | Unknown Room | ReadOnlyContextSection |
| `articles.instructions.edit.context.itemTypes.appliance` | Appliance | ReadOnlyContextSection |
| `articles.instructions.edit.context.itemTypes.roomItem` | Room Item | ReadOnlyContextSection |
| `articles.instructions.edit.context.itemTypes.generalInfo` | General Info | ReadOnlyContextSection |
| `articles.instructions.content.title` | Content | ContentEditSection |
| `articles.instructions.content.pieceCount` | ({count} piece(s)) | ContentEditSection |
| `articles.instructions.content.addContent` | Add Content | ContentEditSection |
| `articles.instructions.content.dragToReorder` | Content pieces - drag to reorder | ContentEditSection |
| `articles.instructions.content.modal.addTitle` | Add Content | AddContentModal |
| `articles.instructions.content.modal.createTitle` | Create Content | AddContentModal |
| `articles.instructions.content.modal.close` | Close modal | AddContentModal |
| `articles.instructions.content.modal.types.text` | Write Text | AddContentModal |
| `articles.instructions.content.modal.types.link` | Add Link | AddContentModal |
| `articles.instructions.content.modal.types.file` | Upload File | AddContentModal |
| `articles.instructions.content.modal.types.fileHint` | Video, Image, PDF | AddContentModal |
| `articles.instructions.content.modal.text.titleLabel` | Title (Optional) | AddContentModal |
| `articles.instructions.content.modal.text.titlePlaceholder` | Enter a title for this content | AddContentModal |
| `articles.instructions.content.modal.text.contentLabel` | Text Content * | AddContentModal |
| `articles.instructions.content.modal.text.contentPlaceholder` | Enter your text content here... | AddContentModal |
| `articles.instructions.content.modal.text.charCount` | {count} / 5000 characters | AddContentModal |
| `articles.instructions.content.modal.url.urlLabel` | URL * | AddContentModal |
| `articles.instructions.content.modal.url.urlPlaceholder` | https://example.com | AddContentModal |
| `articles.instructions.content.modal.url.titleLabel` | Link Title (Optional) | AddContentModal |
| `articles.instructions.content.modal.url.titlePlaceholder` | Enter a title for this link | AddContentModal |
| `articles.instructions.content.modal.file.label` | Select File * | AddContentModal |
| `articles.instructions.content.modal.file.selected` | Selected: {filename} ({size} MB) | AddContentModal |
| `articles.instructions.content.modal.actions.back` | Back | AddContentModal |
| `articles.instructions.content.modal.actions.cancel` | Cancel | AddContentModal |
| `articles.instructions.content.modal.actions.add` | Add Content | AddContentModal |
| `articles.instructions.content.remove.title` | Remove Last Content? | ContentEditSection |
| `articles.instructions.content.remove.message` | This is the only piece of content... | ContentEditSection |
| `articles.instructions.content.remove.cancel` | Cancel | ContentEditSection |
| `articles.instructions.content.remove.confirm` | Remove | ContentEditSection |
| `articles.instructions.content.drag.pickedUp` | Picked up {type} content... | ContentEditSection |
| `articles.instructions.content.drag.overPosition` | Over position {position} | ContentEditSection |
| `articles.instructions.content.drag.dropped` | Dropped {type} content... | ContentEditSection |
| `articles.instructions.content.drag.unchanged` | Position unchanged. | ContentEditSection |
| `articles.instructions.content.drag.cancelled` | Drag cancelled... | ContentEditSection |

---

## 6. Testing Checklist

### Functional Testing

- [ ] Instructions list page loads in all 6 languages
- [ ] Search functionality works with translated placeholder
- [ ] Filter dropdown shows translated labels
- [ ] View toggle (grid/list) has translated aria-labels
- [ ] Empty state shows translated messages
- [ ] Loading state shows translated text
- [ ] Error state shows translated messages with retry button
- [ ] Success banner shows translated text
- [ ] Edit page loads with translated labels
- [ ] Form fields have translated labels and placeholders
- [ ] Add content modal is fully translated
- [ ] Content type selection shows translated options
- [ ] Confirmation dialogs show translated text
- [ ] All buttons show translated labels

### Accessibility Testing

- [ ] Screen reader correctly announces all translated aria-labels
- [ ] Drag-and-drop announcements work in all languages
- [ ] Keyboard navigation works with translated content
- [ ] Focus management maintains accessibility

### Visual Testing

- [ ] No text truncation in German (longest translations)
- [ ] Modal dialogs don't overflow with long text
- [ ] Button widths accommodate all translations
- [ ] Table column headers fit properly
- [ ] Card layouts maintain integrity

### Build Testing

- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes
- [ ] No console errors about missing translations
- [ ] Type checking passes

---

## 7. Acceptance Criteria Verification

| Criteria | Task(s) | Verification |
|----------|---------|--------------|
| All instructions page titles replaced with translation hooks | Task 2, 3 | Manual review of code |
| Page metadata use translated strings for SEO | Task 2 | Check page head elements |
| Section headings/subheadings fully translated | Tasks 2-12 | Visual inspection in all languages |
| Instructional body text uses translation keys | Tasks 9-12 | Code review |
| Navigation buttons appear in selected language | Tasks 2, 3, 9, 10 | Test button labels |
| Breadcrumb trails use translated names | N/A (no breadcrumbs in current impl) | Skip |
| Search functionality labels translated | Task 5 | Test search input |
| Table of contents displays translated names | Task 4 | Test column headers |
| Help icons/tooltips use localized strings | Tasks 4-8 | Test aria-labels |
| Empty state messages translated | Tasks 2, 7 | Test empty states |
| Error messages appear in selected language | Tasks 2, 3 | Test error states |
| No hardcoded English strings | All tasks | Full code review |
| Translation keys follow naming conventions | Task 1 | Review namespace structure |
| Language switching works without page reload | Built-in | Test language switch |
| Content length adjustments for longer translations | Visual testing | Test German layout |

---

## Summary

This detailed breakdown provides 14 actionable tasks to complete REQ-E02-074. Each task is designed to be completable independently while contributing to the overall localization of the instructions pages. The tasks progress logically from translation key creation through component updates to final integration testing.

**Total Estimated Story Points:** 14 SP (1 SP per task)

**Dependencies:**
- REQ-E02-070 (Articles namespace structure) should be complete before starting
- Epic 1 foundation must be in place

**Risk Mitigation:**
- Start with Task 1 (translation keys) to establish the structure
- Update pages before components to catch integration issues early
- Leave translation generation (Task 13) and testing (Task 14) for the end
