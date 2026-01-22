# REQ-E02-074: Update Instructions Pages for i18n

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-074
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task Reference:** 2E.5
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-22 18:03
**Last Modified:** 2026-01-22 18:03

---

## 1. Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-074 (Task 2E.5) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | 2026-01-17 |
| Breakdown Created | 2026-01-22 18:03 |
| T-shirt Size | M (Medium) |
| Estimated Effort | 4-6 hours |
| Status | PENDING |

---

## 2. Summary

This document provides the implementation breakdown for updating instructions/guides pages to use the `articles.*` namespace translations. These pages include the instructions list page, edit page, and related components like InstructionsTable, GuideGrid, GuideCard, and GuideToolbar.

The instructions pages contain approximately 50-70 hardcoded UI strings that need to be replaced with translation function calls.

---

## 3. Goals

### 3.1 Functional Requirements

1. Replace all hardcoded strings in instructions list page (`/dashboard2/instructions/page.tsx`)
2. Replace all hardcoded strings in edit page (`/dashboard2/instructions/[articleId]/edit/page.tsx`)
3. Replace all hardcoded strings in InstructionsTable component
4. Replace all hardcoded strings in GuideGrid component
5. Replace all hardcoded strings in GuideCard component
6. Replace all hardcoded strings in GuideToolbar component
7. Replace all hardcoded strings in GuideColumnSettingsPopup component
8. Use `useTranslations` hook for client components and `getTranslations` for server components
9. Maintain existing functionality while adding i18n support

### 3.2 Assumptions & Clarifications

- `articles.list.*` and `articles.edit.*` namespace keys available from Task 2E.1
- Pages and components currently use `common.*` namespaces partially
- InstructionEditor and ContentEditSection already have i18n from Task 2E.2 (confirmed by system reminders)
- All components are client-side (`'use client'` directive)
- Instructions page at line 52 uses `useTranslations('common.notifications')` and `useTranslations('common.emptyStates')`

---

## 4. Requirements Analysis

### 4.1 Components to Update

| Component | File | Current i18n Status | Estimated Strings |
|-----------|------|---------------------|-------------------|
| InstructionsPage | `/src/app/dashboard2/instructions/page.tsx` | Partial - uses `common.*` | ~15 |
| EditArticlePage | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | None | ~15 |
| InstructionsTable | `/src/components/InstructionsTable/InstructionsTable.tsx` | Partial - uses `common.*` | ~10 |
| GuideGrid | `/src/components/InstructionsTable/GuideGrid.tsx` | Partial - uses `common.*` | ~5 |
| GuideCard | `/src/components/InstructionsTable/GuideCard.tsx` | Unknown | ~10 |
| GuideToolbar | `/src/components/InstructionsTable/GuideToolbar.tsx` | None | ~15 |
| GuideColumnSettingsPopup | `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | Unknown | ~10 |

### 4.2 String Inventory by Component

#### InstructionsPage (~15 strings)
- **Current i18n:** Uses `useTranslations('common.notifications')`, `useTranslations('common.emptyStates')`, `useTranslations('common.actions')`
- Page title/header
- Create button label
- Loading states
- Error messages
- Empty state (already uses `common.emptyStates`)
- Success messages
- Column visibility labels

#### EditArticlePage (~15 strings)
- **Current i18n:** None
- Page title: "Edit Guide"
- Back button: "Back to Guides"
- Loading state: "Loading guide..."
- Error states: "Guide not found", "Failed to load guide"
- Save success/failure messages
- Authentication required message

#### InstructionsTable (~10 strings)
- Table headers
- Sort indicators
- Row selection labels
- Empty state messages
- Accessibility labels

#### GuideGrid (~5 strings)
- Grid layout labels
- Empty state
- Loading state
- Accessibility labels

#### GuideCard (~10 strings)
- Card title
- Metadata labels
- Action buttons
- Badge labels
- Accessibility labels

#### GuideToolbar (~15 strings)
- View toggle labels: "Grid view", "List view"
- Search placeholder
- Filter labels
- Clear filters button
- Purpose filter dropdown
- Result count display

#### GuideColumnSettingsPopup (~10 strings)
- Popup title
- Column labels
- Show/hide toggle text
- Apply/Cancel buttons

---

## 5. Technical Approach

### 5.1 Translation Pattern

Following established patterns from previous tasks:

```typescript
// Page component
'use client';
import { useTranslations } from 'next-intl';

function InstructionsPage() {
  const t = useTranslations('articles.list');
  const tCommon = useTranslations('common.actions');

  return (
    <>
      <h1>{t('title')}</h1>
      <button>{t('createNew')}</button>
    </>
  );
}
```

### 5.2 Translation Keys Structure

Based on Task 2E.1 and investigation:

```json
{
  "articles": {
    "list": {
      "title": "Instructions",
      "subtitle": "Manage your guides and instructions",
      "count": "{count, plural, =0 {No guides} one {# guide} other {# guides}}",
      "createNew": "Create New Guide",
      "loading": "Loading guides...",
      "loginRequired": "Please log in to view guides",
      "returnToItems": "Return to Items",
      "search": {
        "placeholder": "Search guides...",
        "noResults": "No guides found matching your search",
        "clear": "Clear search"
      },
      "columns": {
        "title": "Title",
        "item": "Item",
        "room": "Room",
        "purpose": "Purpose",
        "created": "Created",
        "updated": "Updated",
        "actions": "Actions"
      },
      "sort": {
        "label": "Sort by",
        "newestFirst": "Newest First",
        "oldestFirst": "Oldest First",
        "titleAZ": "Title A-Z",
        "titleZA": "Title Z-A",
        "itemAZ": "Item A-Z",
        "recentlyModified": "Recently Modified"
      },
      "viewMode": {
        "grid": "Grid view",
        "list": "List view",
        "label": "View mode"
      },
      "filters": {
        "purpose": "Filter by purpose",
        "clear": "Clear filters",
        "showing": "Showing {count} of {total}"
      },
      "empty": {
        "title": "No guides yet",
        "description": "Create your first guide to help guests with instructions for your items.",
        "action": "Create Guide"
      }
    },
    "edit": {
      "pageTitle": "Edit Guide",
      "backToList": "Back to Guides",
      "loading": "Loading guide...",
      "notFound": "Guide not found",
      "loadError": "Failed to load guide",
      "saveSuccess": "Guide saved successfully",
      "saveFailed": "Failed to save guide",
      "loginRequired": "Please log in to edit guides"
    },
    "table": {
      "ariaLabel": "Guides table",
      "selectRow": "Select this guide",
      "actions": "Actions",
      "noGuides": "No guides to display",
      "columnSettings": {
        "title": "Column Settings",
        "show": "Show",
        "hide": "Hide",
        "apply": "Apply",
        "cancel": "Cancel"
      }
    },
    "grid": {
      "ariaLabel": "Guides grid",
      "viewItem": "View guide details",
      "editItem": "Edit guide",
      "deleteItem": "Delete guide",
      "empty": "No guides to display"
    },
    "card": {
      "createdAt": "Created {date}",
      "updatedAt": "Updated {date}",
      "viewDetails": "View details",
      "edit": "Edit",
      "delete": "Delete"
    }
  }
}
```

---

## 6. Implementation Tasks

### Task 1: Update InstructionsPage (Priority: High)

**Description:** Replace hardcoded strings in the instructions list page with translation calls.

**File:** `/src/app/dashboard2/instructions/page.tsx`

**Investigation Notes:**
- Line 52: Already uses `useTranslations('common.notifications')`
- Line 53: Already uses `useTranslations('common.emptyStates')`
- Line 54: Already uses `useTranslations('common.actions')`

**Changes Required:**
1. Add `useTranslations('articles.list')` hook
2. Replace page title/header text
3. Update create button label
4. Update loading/error messages
5. Keep `common.*` usage for shared strings where appropriate
6. Update view mode labels
7. Update filter/search labels

**Acceptance Criteria:**
- [ ] All page-specific strings use `articles.list`
- [ ] Shared strings continue using `common.*`
- [ ] Page renders correctly with translations
- [ ] No console warnings for missing keys

---

### Task 2: Update EditArticlePage (Priority: High)

**Description:** Add i18n support to the edit article page.

**File:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Investigation Notes:**
- Currently has NO i18n implementation
- Uses InstructionEditor component (which already has i18n from Task 2E.2)

**Changes Required:**
1. Add `useTranslations('articles.edit')` hook
2. Update page title
3. Update back button label
4. Update loading state text
5. Update error messages (not found, load error, login required)
6. Update success/failure toast messages
7. Add `@lastModified` comment with REQ-E02-074

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] Loading states use translations
- [ ] Error messages use translations
- [ ] Success/failure messages use translations
- [ ] Page renders correctly

---

### Task 3: Update InstructionsTable component (Priority: High)

**Description:** Replace hardcoded strings in InstructionsTable with translation calls.

**File:** `/src/components/InstructionsTable/InstructionsTable.tsx`

**Changes Required:**
1. Add `useTranslations('articles.table')` hook
2. Update table headers
3. Update sort indicators
4. Update row selection labels
5. Update empty state messages
6. Update accessibility labels

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] Table headers use translations
- [ ] Accessibility labels translated
- [ ] Component renders correctly

---

### Task 4: Update GuideGrid component (Priority: High)

**Description:** Replace hardcoded strings in GuideGrid with translation calls.

**File:** `/src/components/InstructionsTable/GuideGrid.tsx`

**Changes Required:**
1. Add `useTranslations('articles.grid')` hook
2. Update grid layout labels
3. Update empty state message
4. Update loading state
5. Update accessibility labels

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] Grid labels use translations
- [ ] Empty state uses translations
- [ ] Component renders correctly

---

### Task 5: Update GuideCard component (Priority: High)

**Description:** Replace hardcoded strings in GuideCard with translation calls.

**File:** `/src/components/InstructionsTable/GuideCard.tsx`

**Changes Required:**
1. Add `useTranslations('articles.card')` hook
2. Update card metadata labels
3. Update action button labels
4. Update badge labels
5. Update accessibility labels

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] Metadata labels use translations
- [ ] Action buttons use translations
- [ ] Component renders correctly

---

### Task 6: Update GuideToolbar component (Priority: High)

**Description:** Replace hardcoded strings in GuideToolbar with translation calls.

**File:** `/src/components/InstructionsTable/GuideToolbar.tsx`

**Investigation Notes:**
- Line 78: Already has aria-label "View mode" (needs translation)
- Line 96: Already has aria-label "Grid view" (needs translation)

**Changes Required:**
1. Add `useTranslations('articles.list')` hook
2. Update view toggle labels (Grid view, List view)
3. Update search placeholder
4. Update filter labels
5. Update clear filters button
6. Update result count display
7. Update purpose filter dropdown

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] View toggle labels use translations
- [ ] Search/filter UI uses translations
- [ ] Component renders correctly

---

### Task 7: Update GuideColumnSettingsPopup component (Priority: Medium)

**Description:** Replace hardcoded strings in GuideColumnSettingsPopup with translation calls.

**File:** `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx`

**Changes Required:**
1. Add `useTranslations('articles.table.columnSettings')` hook
2. Update popup title
3. Update column labels
4. Update show/hide toggle text
5. Update apply/cancel buttons

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] Popup labels use translations
- [ ] Button labels use translations
- [ ] Component renders correctly

---

### Task 8: Verify translation keys exist (Priority: High)

**Description:** Verify that all required translation keys from Task 2E.1 exist in `/messages/en.json`.

**File:** `/messages/en.json`

**Verification Steps:**
1. Check for `articles.list.*` keys
2. Check for `articles.edit.*` keys
3. Check for `articles.table.*` keys
4. Check for `articles.grid.*` keys
5. Check for `articles.card.*` keys
6. Add any missing keys if needed

**Acceptance Criteria:**
- [ ] All required keys exist in en.json
- [ ] Keys follow naming conventions
- [ ] ICU syntax correct where used
- [ ] JSON validates

---

## 7. Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### 7.1 Page Components (Modify)

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/src/app/dashboard2/instructions/page.tsx` | Full component | Modify | Add `articles.list` translations |
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Full component | Modify | Add `articles.edit` translations |

### 7.2 Table Components (Modify)

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/src/components/InstructionsTable/InstructionsTable.tsx` | Full component | Modify | Add `articles.table` translations |
| `/src/components/InstructionsTable/GuideGrid.tsx` | Full component | Modify | Add `articles.grid` translations |
| `/src/components/InstructionsTable/GuideCard.tsx` | Full component | Modify | Add `articles.card` translations |
| `/src/components/InstructionsTable/GuideToolbar.tsx` | Full component | Modify | Add `articles.list` translations |
| `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | Full component | Modify | Add `articles.table.columnSettings` translations |

### 7.3 Translation Files (Verify/Modify)

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/messages/en.json` | `articles.list.*`, `articles.edit.*`, `articles.table.*`, `articles.grid.*`, `articles.card.*` | Verify | Keys should exist from Task 2E.1 |

---

## 8. Dependencies

### 8.1 Depends On (Completed First)

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| Epic 1 Foundation | next-intl setup, useTranslations hook | Complete |
| **REQ-E02-070** (Task 2E.1) | `articles.*` namespace structure | Complete |
| **REQ-E02-071** (Task 2E.2) | InstructionEditor i18n (used by edit page) | Complete |

### 8.2 Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-075** (Task 2E.6) | Instructions page strings ready for translation generation |

### 8.3 Parallel Safety

- **Files touched**: 7 component/page files
- **Conflicts with**: None - instructions pages are isolated
- **Safe to parallelize with**: Tasks 2E.2, 2E.3, 2E.4 (different component sets)

### 8.4 External Dependencies

- `next-intl` package (from Epic 1)

---

## 9. Risks and Considerations

### 9.1 Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing `common.*` usage | Medium | Keep shared strings in `common` namespace |
| Search/filter functionality changes | Low | Test thoroughly after translation updates |
| View toggle state management | Low | Verify localStorage persistence still works |

### 9.2 Testing Requirements

- Manual testing of instructions list page
- Test create new guide flow
- Test edit guide page
- Verify table/grid view switching
- Test search and filter functionality
- Test column visibility settings
- Verify empty states
- Test accessibility with screen reader

### 9.3 Open Questions

- [ ] Should we keep using `common.emptyStates` or move to `articles.list.empty`?
- [ ] Should column settings be `articles.table.columnSettings` or separate namespace?
- [ ] Are there additional strings in GuideCard not yet identified?

---

## 10. Out of Scope

- Creating new translation keys beyond what's in Task 2E.1
- Actual translations to other languages (handled by Task 2E.6)
- Editor components (handled by Task 2E.2)
- Media handling components (handled by Task 2E.3)
- Crop/trim utilities (handled by Task 2E.4)
- Functional changes to instructions page behavior
- Layout or styling changes

---

## 11. Verification Checklist

### Pre-Implementation
- [ ] Verify `articles.list.*` keys exist in en.json
- [ ] Verify `articles.edit.*` keys exist in en.json
- [ ] Verify `articles.table.*` keys exist in en.json
- [ ] Verify `articles.grid.*` keys exist in en.json
- [ ] Verify `articles.card.*` keys exist in en.json

### Implementation
- [ ] InstructionsPage strings replaced
- [ ] EditArticlePage strings replaced
- [ ] InstructionsTable strings replaced
- [ ] GuideGrid strings replaced
- [ ] GuideCard strings replaced
- [ ] GuideToolbar strings replaced
- [ ] GuideColumnSettingsPopup strings replaced

### Post-Implementation
- [ ] TypeScript compilation succeeds
- [ ] Build completes without errors
- [ ] All pages/components render correctly with translations
- [ ] Search and filter functionality works
- [ ] View toggle works
- [ ] Column settings work
- [ ] No console warnings for missing translation keys
- [ ] Add `@lastModified` comments with REQ-E02-074

---

## 12. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Namespace Task:** `/docs/REQ-E02-070-create-articles-namespace-structure-overview.md`
- **Editor Components Task:** `/docs/REQ-E02-071-update-editor-components-overview.md`
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages

---

*Document generated: 2026-01-22 18:03*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
