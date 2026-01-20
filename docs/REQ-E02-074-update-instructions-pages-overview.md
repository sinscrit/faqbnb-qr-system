# REQ-E02-074: Update Instructions Pages for Article and Content Management - Implementation Overview

**Document Created:** 2026-01-20 23:45:00 UTC
**Last Modified:** 2026-01-20 23:45:00 UTC
**Request ID:** REQ-E02-074
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.5
**Size:** M (Medium)
**Priority:** P1 - High

---

## 1. Executive Summary

This task involves updating all instructions pages and related components to replace hardcoded English strings with the next-intl translation system. The instructions pages include the main list page (`/dashboard2/instructions/page.tsx`), the edit page (`/dashboard2/instructions/[articleId]/edit/page.tsx`), and all supporting components within `InstructionsTable/` and `InstructionEditor/` directories. This enables property owners to manage guides and instruction articles with fully localized interfaces including page titles, navigation, table headers, empty states, error messages, action buttons, and all form labels in all 6 supported languages.

**Estimated Strings:** ~120
**Components Affected:** 14 files

---

## 2. Current State Analysis

### 2.1 Components Requiring Localization

| Component | Location | Estimated Strings | Complexity |
|-----------|----------|-------------------|------------|
| **Instructions Page** | `/src/app/dashboard2/instructions/page.tsx` | ~35 | High |
| **Edit Article Page** | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | ~15 | Medium |
| **InstructionsTable** | `/src/components/InstructionsTable/InstructionsTable.tsx` | ~15 | Medium |
| **GuideToolbar** | `/src/components/InstructionsTable/GuideToolbar.tsx` | ~12 | Medium |
| **GuideCard** | `/src/components/InstructionsTable/GuideCard.tsx` | ~5 | Low |
| **GuideGrid** | `/src/components/InstructionsTable/GuideGrid.tsx` | ~5 | Low |
| **GuideColumnSettingsPopup** | `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | ~8 | Low |
| **InstructionEditor** | `/src/components/InstructionEditor/InstructionEditor.tsx` | ~12 | Medium |
| **AddContentModal** | `/src/components/InstructionEditor/components/AddContentModal.tsx` | ~22 | Medium |
| **ContentEditSection** | `/src/components/InstructionEditor/components/ContentEditSection.tsx` | ~12 | Medium |
| **ReadOnlyContextSection** | `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | ~8 | Low |
| **Total** | | **~149** | |

### 2.2 Hardcoded Strings Identified

#### Instructions Page (page.tsx) - Lines with Hardcoded Strings

**Authentication/Loading/Error States:**
- Line 241: `"Authentication Required"` - Page heading
- Line 242: `"Please log in to access guides."` - Auth message
- Line 244: `"Go to Login"` - Button label
- Line 259: `"Loading guides..."` - Loading state message
- Line 270: `"Error Loading Guides"` - Error heading
- Line 274: `"Retry"` - Button label

**Empty States:**
- Line 289: `"No guides yet"` - Empty state heading
- Line 290-293: `"Create items and add guide articles to get started..."` - Empty state description
- Line 298: `"Create Your First Item"` - CTA button
- Line 303: `"Learn More"` - Secondary button

**Page Header:**
- Line 354: `"Guides"` - Page title
- Line 358: `"Manage guide articles for your items"` - Page subtitle

**Success Message:**
- Line 332: `"Guide updated successfully"` - Toast message
- Line 339: `"Dismiss success message"` - Aria-label

#### Edit Article Page ([articleId]/edit/page.tsx)

**Loading/Error States:**
- Line 196: `"Redirecting to login..."` - Auth redirect message
- Line 209: `"Loading article data..."` - Loading state
- Line 220: `"Error Loading Article"` - Error heading
- Line 224: `"Retry"` - Retry button
- Line 231: `"Back to Guides"` - Back button

#### InstructionsTable.tsx

**Column Headers:**
- Line 152, 160: `"Title"` - Column header
- Line 169, 177: `"Item"` - Column header
- Line 185: `"Room"` - Column header
- Line 194: `"Property"` - Column header
- Line 205, 212: `"Purpose"` - Column header
- Line 223, 230: `"Created"` - Column header
- Line 239: `"Actions"` - Column header

**Accessibility/Sort Labels:**
- Line 62: `"Sort by {label}"` - Aria-label pattern
- Line 66: `"Ascending"` - Sort direction
- Line 68: `"Descending"` - Sort direction

**Empty State:**
- Line 331: `"No guides available"` - Empty table message

**Action Buttons:**
- Line 411: `"Edit {title}"` - Edit button aria-label
- Line 414: `"Edit"` - Edit button text

#### GuideToolbar.tsx

**Labels:**
- Line 77: `"View mode"` - Aria-label for view toggle
- Line 96: `"Grid view"` - Aria-label
- Line 117: `"List view"` - Aria-label
- Line 196-199: `"Purpose ({count})"` / `"Purpose"` - Filter button label
- Line 207: `"Select purpose types"` - Aria-label
- Line 263: `"Clear all filters"` - Aria-label
- Line 275: `"Clear filters"` - Button text
- Line 300: `"Guide management controls"` - Aria-label
- Line 318: `"Search guides..."` - Placeholder
- Line 340: `"Showing {count} of {total} guides"` - Result count

#### GuideCard.tsx

**Action Buttons:**
- Line 115: `"{title} - {item} - {purpose}. Press Enter to edit."` - Aria-label
- Line 189: `"Edit {title}"` - Aria-label
- Line 192: `"Edit"` - Button text

#### GuideGrid.tsx

**States:**
- Line 76: `"Loading guides"` - Aria-label
- Line 100: `"No guides found"` - Empty state heading
- Line 101: `"Try adjusting your search or filters"` - Empty state message
- Line 115: `"{count} guide(s)"` - Grid aria-label

#### InstructionEditor.tsx

**Labels:**
- Line 175-177: `"Article Title"` - Form label
- Line 197: `"Enter article title"` - Placeholder
- Line 204: `"Tags"` - Section label
- Line 150: `"You have unsaved changes. Are you sure you want to cancel?"` - Confirmation dialog

**Action Buttons:**
- Line 241: `"Cancel"` - Button label
- Line 258: `"Saving..."` / `"Save Changes"` - Submit button

#### AddContentModal.tsx

**Modal Headers:**
- Line 148: `"Add Content"` / `"Create Content"` - Modal titles
- Line 154: `"Close modal"` - Aria-label

**Content Type Selection:**
- Line 171: `"Write Text"` - Option label
- Line 181: `"Add Link"` - Option label
- Line 191: `"Upload File"` - Option label
- Line 192: `"Video, Image, PDF"` - Option description

**Form Labels:**
- Line 200-201: `"Title (Optional)"` - Label
- Line 208: `"Enter a title for this content"` - Placeholder
- Line 214-215: `"Text Content *"` - Label
- Line 221: `"Enter your text content here..."` - Placeholder
- Line 225-226: `"{count} / 5000 characters"` - Character count
- Line 235-236: `"URL *"` - Label
- Line 243: `"https://example.com"` - Placeholder
- Line 248-249: `"Link Title (Optional)"` - Label
- Line 256: `"Enter a title for this link"` - Placeholder
- Line 267-268: `"Select File *"` - Label
- Line 278-279: `"Selected: {filename} ({size} MB)"` - File info

**Action Buttons:**
- Line 294: `"Back"` - Button label
- Line 303: `"Cancel"` - Button label
- Line 317: `"Add Content"` - Button label

#### ContentEditSection.tsx

**Section Header:**
- Line 211-215: `"Content"` + `"({count} piece(s))"` - Section title

**Accessibility Announcements:**
- Line 159: `"Picked up {type} content. Current position: {pos} of {total}. Use arrow keys to move."` - Drag announcement
- Line 164: `"Over position {pos}"` - Drag over announcement
- Line 173: `"Dropped {type} content. New position: {pos} of {total}"` - Drop announcement
- Line 175: `"Position unchanged."` - Cancel announcement
- Line 178: `"Drag cancelled. Content returned to original position."` - Cancel announcement

**Aria Labels:**
- Line 237: `"Content pieces - drag to reorder"` - List aria-label
- Line 269: `"Add Content"` - Button label

**Confirmation Dialog:**
- Line 285-286: `"Remove Last Content?"` - Dialog title
- Line 288-290: `"This is the only piece of content. Removing it will leave this guide empty. Are you sure you want to remove it?"` - Confirmation message
- Line 298: `"Cancel"` - Button label
- Line 304: `"Remove"` - Button label

#### ReadOnlyContextSection.tsx

**Labels:**
- Line 14: `"Appliance"` - Item type default
- Line 15: `"Room Item"` - Item type
- Line 16: `"General Info"` - Item type
- Line 25: `"Unknown Room"` - Fallback room name
- Line 32-33: `"Editing Guide For: {title}"` - Page heading
- Line 41: `"Room"` - Field label
- Line 49: `"Item Type"` - Field label
- Line 57: `"Item Name"` - Field label

---

## 3. Implementation Approach

### 3.1 Translation Namespace Structure

All instructions page strings will be added to the `articles` namespace within the existing `/messages/en.json` structure, coordinating with other 2E sub-epic tasks:

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

### 3.2 Component Update Pattern

#### For Page Components (Server or Client)

```tsx
// Before (hardcoded string)
<h1>Guides</h1>
<p>Manage guide articles for your items</p>

// After (translated)
import { useTranslations } from 'next-intl';

export default function InstructionsPage() {
  const t = useTranslations('articles.instructions');

  return (
    <>
      <h1>{t('pageTitle')}</h1>
      <p>{t('pageSubtitle')}</p>
    </>
  );
}
```

#### For Table Components with Dynamic Data

```tsx
// Before
<th>Title</th>
<button aria-label={`Edit ${instruction.articleTitle}`}>Edit</button>

// After
const t = useTranslations('articles.instructions.table');
<th>{t('columns.title')}</th>
<button aria-label={t('actions.editGuide', { title: instruction.articleTitle })}>
  {t('actions.edit')}
</button>
```

#### For Accessibility Announcements

```tsx
// Before
return `Picked up ${piece.type} content. Current position: ${position} of ${total}.`;

// After
const t = useTranslations('articles.instructions.content.drag');
return t('pickedUp', { type: piece.type, position, total });
```

### 3.3 Implementation Order

1. **Add translation keys to `/messages/en.json`** - Add `articles.instructions` namespace
2. **Update Instructions Page** (`page.tsx`) - Highest priority, main entry point
3. **Update Edit Page** (`[articleId]/edit/page.tsx`) - Edit functionality
4. **Update InstructionsTable** - Table display with all column headers
5. **Update GuideToolbar** - Search, filters, view toggle
6. **Update GuideCard and GuideGrid** - Card view display
7. **Update GuideColumnSettingsPopup** - Column visibility settings
8. **Update InstructionEditor** - Main editor container
9. **Update AddContentModal** - Add content functionality
10. **Update ContentEditSection** - Content management and drag-and-drop
11. **Update ReadOnlyContextSection** - Context display labels
12. **Generate translations for 5 non-English languages**

---

## 4. Authorized Files and Functions for Modification

### 4.1 Translation Files

| File | Modification Type | Description |
|------|-------------------|-------------|
| `/messages/en.json` | MODIFY | Add `articles.instructions` namespace |
| `/messages/fr.json` | MODIFY | Add French translations for all new keys |
| `/messages/es.json` | MODIFY | Add Spanish translations for all new keys |
| `/messages/de.json` | MODIFY | Add German translations for all new keys |
| `/messages/nl.json` | MODIFY | Add Dutch translations for all new keys |
| `/messages/it.json` | MODIFY | Add Italian translations for all new keys |

### 4.2 Page Files

| File | Functions/Sections to Modify |
|------|------------------------------|
| `/src/app/dashboard2/instructions/page.tsx` | Authentication message (239-250), loading state (254-262), error state (265-280), empty state (283-310), page header (348-363), success message (316-345) |
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Auth redirect (192-200), loading state (203-213), error state (215-238), error message display |

### 4.3 Component Files

| File | Functions/Sections to Modify |
|------|------------------------------|
| `/src/components/InstructionsTable/InstructionsTable.tsx` | `SortableColumnHeader` aria-labels (61-62), all column header labels (152-249), empty state (330-331), edit button (411-414) |
| `/src/components/InstructionsTable/GuideToolbar.tsx` | `ViewToggle` aria-labels (77, 96, 117), `PurposeFilterDropdown` labels (196-207), `ClearFiltersButton` (263, 275), toolbar aria-label (300), search placeholder (318), result count (340) |
| `/src/components/InstructionsTable/GuideCard.tsx` | Card aria-label (115), edit button aria-label (189), edit button text (192) |
| `/src/components/InstructionsTable/GuideGrid.tsx` | Loading aria-label (76), empty state (100-101), grid aria-label (115) |
| `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | All column setting labels |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | Form labels (175-177, 204), placeholder (197), confirmation dialog (150), action buttons (241, 258) |
| `/src/components/InstructionEditor/components/AddContentModal.tsx` | Modal titles (148), close aria-label (154), content type labels (171, 181, 191-192), all form labels and placeholders (200-279), action buttons (294, 303, 317) |
| `/src/components/InstructionEditor/components/ContentEditSection.tsx` | Section title (211-215), drag announcements (154-180), aria-label (237), button (269), confirmation dialog (285-306) |
| `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | Item type extraction (14-16), fallback room (25), page heading (32-33), field labels (41, 49, 57) |

### 4.4 Functions Requiring Modification (Detailed)

#### InstructionsTable/page.tsx

| Section | Lines | Modification |
|---------|-------|--------------|
| Authentication state | 239-250 | Replace all strings with `t('auth.*')` |
| Loading state | 254-262 | Replace with `t('loading.guides')` |
| Error state | 265-280 | Replace with `t('errors.*')` |
| Empty state | 283-310 | Replace with `t('empty.*')` |
| Success banner | 316-345 | Replace with `t('success.*')` |
| Page header | 348-363 | Replace with `t('pageTitle')`, `t('pageSubtitle')` |

#### InstructionsTable.tsx

| Function/Section | Lines | Modification |
|-----------------|-------|--------------|
| `SortableColumnHeader` | 61-62 | Add `t` parameter or useTranslations, replace aria-label |
| Sort direction labels | 66, 68 | Replace with `t('table.sort.ascending/descending')` |
| Column headers | 152-249 | Replace all labels with `t('table.columns.*')` |
| Empty state | 330-331 | Replace with `t('empty.tableEmpty')` |
| Edit button | 411-414 | Replace with `t('table.actions.edit/editGuide')` |

#### AddContentModal.tsx

| Section | Lines | Modification |
|---------|-------|--------------|
| Modal title | 148 | Replace with `t('modal.addTitle/createTitle')` |
| Type selection buttons | 164-194 | Replace labels with `t('modal.types.*')` |
| Text form | 197-229 | Replace labels/placeholders with `t('modal.text.*')` |
| URL form | 232-261 | Replace labels/placeholders with `t('modal.url.*')` |
| File form | 264-284 | Replace labels with `t('modal.file.*')` |
| Action buttons | 287-319 | Replace with `t('modal.actions.*')` |

#### ContentEditSection.tsx

| Function/Section | Lines | Modification |
|-----------------|-------|--------------|
| `announcements` object | 154-180 | Replace all announcement strings with `t('content.drag.*')` |
| Section header | 211-215 | Replace with `t('content.title')`, `t('content.pieceCount')` |
| Drag list aria-label | 237 | Replace with `t('content.dragToReorder')` |
| Add button | 269 | Replace with `t('content.addContent')` |
| Confirmation dialog | 274-310 | Replace all strings with `t('content.remove.*')` |

---

## 5. Dependencies

### 5.1 Epic 1 Dependencies (Must Be Complete)

| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package installed | `package.json` | Required |
| IntlProvider configured | `/src/app/layout.tsx` | Required |
| Translation files exist | `/messages/*.json` | Required |
| `useTranslations` hook available | `next-intl` | Required |

### 5.2 Cross-Task Dependencies

| Dependency | Task | Description |
|------------|------|-------------|
| Articles namespace exists | 2E.1 (REQ-E02-070) | The `articles` namespace should exist |
| Common actions reuse | 2H.1 | May share `common.actions.cancel`, `common.actions.retry` etc. |
| Editor components | 2E.2 (REQ-E02-071) | May share patterns with MarkdownEditor, MediaGallery |

### 5.3 Shared Strings with Common Namespace

The following strings may already exist in the `common` namespace and should be reused:
- Cancel
- Retry
- Edit
- Remove
- Back
- Close

Check if these exist and either:
1. Import from common namespace: `tCommon('actions.cancel')`
2. Or create local copies in the articles.instructions namespace

---

## 6. Testing Requirements

### 6.1 Unit Tests

- Verify all hardcoded strings are replaced with translation function calls
- Test that all translation keys exist and return expected values
- Test interpolation variables work correctly (`{title}`, `{count}`, `{position}`, etc.)
- Test pluralization for piece count and guide count
- Test drag-and-drop accessibility announcements in all languages

### 6.2 Integration Tests

- Test instructions list page loads correctly in all 6 languages
- Test edit page loads and displays translated labels
- Verify table column headers display in correct language
- Test search placeholder and filter labels
- Test empty states render with correct translations
- Verify error messages display in selected language
- Test success toast appears with localized message

### 6.3 Visual Testing

- Check text truncation in table cells for longer translations (German)
- Verify layout integrity with text expansion in toolbar
- Test mobile responsiveness with translated strings
- Verify modal dialogs don't overflow with longer text
- Check button widths accommodate translated labels

### 6.4 Accessibility Testing

- Verify screen reader announces correct translated text for:
  - View mode toggle
  - Sort direction indicators
  - Drag-and-drop operations
  - All interactive elements
- Test keyboard navigation with translated aria-labels
- Confirm all interactive elements have translated accessible names

---

## 7. Acceptance Criteria (From Request)

- [ ] All instructions page titles are replaced with translation hooks from the articles namespace
- [ ] Page metadata (descriptions, keywords) use translated strings for SEO in each language
- [ ] Section headings and subheadings throughout instruction pages are fully translated
- [ ] Instructional body text and paragraphs replace hardcoded strings with translation keys
- [ ] Navigation buttons within instructions (Next, Previous, Back to Guide, etc.) appear in the selected language
- [ ] Breadcrumb trails on instructions pages use translated category and page names
- [ ] Search functionality labels on instructions pages are translated
- [ ] Table of contents displays translated section names (column headers)
- [ ] Help icons and tooltips embedded in instructions use localized strings
- [ ] Empty state messages (No instructions available, Coming soon) are translated
- [ ] Error messages when instructions fail to load appear in the selected language
- [ ] No hardcoded English strings appear in any instructions page
- [ ] Translation keys follow established naming conventions in the appropriate namespace
- [ ] Instructions pages properly handle language switching without requiring page reload
- [ ] Content length adjustments accommodate longer translations without breaking layout

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Overlap with common namespace | Medium | Low | Check common namespace first, reuse where possible |
| Text overflow in table columns | Medium | Low | Test with German, use responsive truncation |
| Drag-and-drop announcement complexity | Low | Medium | Test with screen readers in multiple languages |
| Missing translation keys at runtime | Low | High | Build-time validation, console warnings in dev |
| Modal layout breaks with long text | Low | Medium | Test with German (longest translations), use flexible layouts |
| Too many nested translation keys | Low | Low | Keep namespace structure flat where practical |

---

## 9. Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 45 minutes |
| Update Instructions Page | 45 minutes |
| Update Edit Article Page | 30 minutes |
| Update InstructionsTable | 30 minutes |
| Update GuideToolbar | 30 minutes |
| Update GuideCard and GuideGrid | 20 minutes |
| Update GuideColumnSettingsPopup | 15 minutes |
| Update InstructionEditor | 30 minutes |
| Update AddContentModal | 30 minutes |
| Update ContentEditSection | 30 minutes |
| Update ReadOnlyContextSection | 15 minutes |
| Generate 5 language translations | 45 minutes |
| Testing and verification | 1 hour |
| **Total** | **~6.5-7 hours** |

---

## 10. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Request REQ-E02-070](/docs/REQ-E02-070-create-articles-namespace-structure-overview.md) - Articles namespace structure (prerequisite)
- [Request REQ-E02-071](/docs/REQ-E02-071-update-editor-components-overview.md) - Editor components (related task)
- [Request REQ-E02-072](/docs/REQ-E02-072-update-media-handling-components-overview.md) - Media handling components (related task)
- [Request REQ-E02-073](/docs/REQ-E02-073-update-croptrim-utilities-overview.md) - Crop/trim utilities (related task)
