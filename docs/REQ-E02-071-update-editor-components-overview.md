# REQ-E02-071: Update Editor Components for i18n

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-071
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task Reference:** 2E.2
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-22 16:17
**Last Modified:** 2026-01-22 16:17

---

## 1. Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-071 (Task 2E.2) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | 2026-01-17 |
| Breakdown Created | 2026-01-22 16:17 |
| T-shirt Size | M (Medium) |
| Estimated Effort | 4-6 hours |
| Status | PENDING |

---

## 2. Summary

This document provides the implementation breakdown for updating editor components to use the `articles` namespace translations. These components include the MarkdownEditor, InstructionEditor, and related content editing components used in article/guide management.

The editor components contain approximately 90-120 hardcoded UI strings that need to be replaced with translation function calls using the `articles.editor.*` namespace keys created in Task 2E.1.

---

## 3. Goals

### 3.1 Functional Requirements

1. Replace all hardcoded strings in MarkdownEditor with translation calls
2. Replace all hardcoded strings in InstructionEditor and sub-components
3. Replace all hardcoded strings in ContentEditSection
4. Replace all hardcoded strings in AddContentModal
5. Use `useTranslations` hook from next-intl for client components
6. Maintain existing functionality while adding i18n support

### 3.2 Assumptions & Clarifications

- Task 2E.1 (`articles` namespace structure) is completed and keys are available
- Components will continue to use client-side rendering (`'use client'` directive)
- Translation functions should use the established `useTranslations('articles')` pattern
- Accessibility labels (aria-*) must also be translated
- Placeholder text and title attributes must be translated

---

## 4. Requirements Analysis

### 4.1 Components to Update

| Component | File | Hardcoded Strings | Current i18n Status |
|-----------|------|-------------------|---------------------|
| MarkdownEditor | `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | ~40 | None - all hardcoded |
| InstructionEditor | `/src/components/InstructionEditor/InstructionEditor.tsx` | ~15 | Partial - uses `tLoading` only |
| ContentEditSection | `/src/components/InstructionEditor/components/ContentEditSection.tsx` | ~15 | None - all hardcoded |
| AddContentModal | `/src/components/InstructionEditor/components/AddContentModal.tsx` | ~15 | Unknown |
| ReadOnlyContextSection | `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | ~10 | Unknown |

### 4.2 String Inventory by Component

#### MarkdownEditor (~40 strings)
- Tab labels: "Editor", "Preview"
- Toolbar button labels: "Bold (Ctrl+B)", "Italic (Ctrl+I)", "Heading 1", "Heading 2", "Heading 3", "Bullet List", "Numbered List", "Insert Link (Ctrl+K)"
- Character counter: "{current} / {max} characters"
- Error message: "Content exceeds the maximum character limit. Please shorten your text."
- Placeholder: "Write your content here using markdown formatting..."
- Preview placeholder: "Start typing to see a preview of your formatted content..."
- Accessibility: "Editor view mode", "Text formatting", "Markdown editor"

#### InstructionEditor (~15 strings)
- Labels: "Article Title", "Tags"
- Placeholder: "Enter article title"
- Buttons: "Cancel", "Save Changes"
- Confirmation: "You have unsaved changes. Are you sure you want to cancel?"
- Status: "Saving..." (currently uses `tLoading('status.saving')`)

#### ContentEditSection (~15 strings)
- Header: "Content", "({count} piece/pieces)"
- Button: "Add Content"
- Dialog title: "Remove Last Content?"
- Dialog message: "This is the only piece of content. Removing it will leave this guide empty. Are you sure you want to remove it?"
- Dialog buttons: "Cancel", "Remove"
- Accessibility: "Content pieces - drag to reorder", "Picked up...", "Over position...", "Dropped..."

#### AddContentModal (~15 strings)
- Modal title, content type options, buttons, validation messages

---

## 5. Technical Approach

### 5.1 Translation Pattern

```typescript
// Before
<button>Editor</button>
<span>{current} / {max} characters</span>

// After
import { useTranslations } from 'next-intl';

function MarkdownEditor() {
  const t = useTranslations('articles.editor');

  return (
    <>
      <button>{t('tabs.edit')}</button>
      <span>{t('characterCount', { current, max })}</span>
    </>
  );
}
```

### 5.2 Translation Keys Structure

```json
{
  "articles": {
    "editor": {
      "tabs": {
        "edit": "Editor",
        "preview": "Preview"
      },
      "toolbar": {
        "bold": "Bold",
        "boldShortcut": "Bold (Ctrl+B)",
        "italic": "Italic",
        "italicShortcut": "Italic (Ctrl+I)",
        "heading1": "Heading 1",
        "heading2": "Heading 2",
        "heading3": "Heading 3",
        "bulletList": "Bullet List",
        "numberedList": "Numbered List",
        "link": "Insert Link",
        "linkShortcut": "Insert Link (Ctrl+K)"
      },
      "characterCount": "{current, number} / {max, number} characters",
      "characterWarning": "Approaching character limit",
      "characterError": "Content exceeds the maximum character limit. Please shorten your text.",
      "placeholder": "Write your content here using markdown formatting...",
      "previewPlaceholder": "Start typing to see a preview of your formatted content...",
      "aria": {
        "viewMode": "Editor view mode",
        "toolbar": "Text formatting",
        "editor": "Markdown editor"
      }
    },
    "instructionEditor": {
      "articleTitle": "Article Title",
      "articleTitlePlaceholder": "Enter article title",
      "tags": "Tags",
      "buttons": {
        "cancel": "Cancel",
        "save": "Save Changes"
      },
      "unsavedChanges": "You have unsaved changes. Are you sure you want to cancel?"
    },
    "content": {
      "title": "Content",
      "count": "({count, plural, one {# piece} other {# pieces}})",
      "addContent": "Add Content",
      "removeDialog": {
        "title": "Remove Last Content?",
        "message": "This is the only piece of content. Removing it will leave this guide empty. Are you sure you want to remove it?",
        "cancel": "Cancel",
        "remove": "Remove"
      },
      "aria": {
        "dragToReorder": "Content pieces - drag to reorder",
        "pickedUp": "Picked up {type} content. Current position: {position} of {total}. Use arrow keys to move.",
        "overPosition": "Over position {position}",
        "dropped": "Dropped {type} content. New position: {position} of {total}",
        "cancelled": "Drag cancelled. Content returned to original position.",
        "unchanged": "Position unchanged."
      }
    }
  }
}
```

---

## 6. Implementation Tasks

### Task 1: Update MarkdownEditor component (Priority: High)

**Description:** Replace all hardcoded strings in MarkdownEditor with translation calls.

**File:** `/src/components/ItemCapture/editors/MarkdownEditor.tsx`

**Changes Required:**
1. Add `useTranslations('articles.editor')` hook
2. Update `TOOLBAR_BUTTONS` array to use translation keys for `ariaLabel`
3. Update `MobileTabSwitcher` button labels
4. Update `CharacterCounter` text
5. Update error message text
6. Update placeholder text
7. Update preview placeholder text
8. Update aria-label attributes

**Acceptance Criteria:**
- [ ] All 40+ hardcoded strings replaced
- [ ] ICU format used for character count (`{current, number} / {max, number}`)
- [ ] Toolbar buttons use translated labels
- [ ] Tab labels translated
- [ ] Accessibility labels translated
- [ ] Component renders correctly with translations

---

### Task 2: Update InstructionEditor component (Priority: High)

**Description:** Replace all hardcoded strings in InstructionEditor with translation calls.

**File:** `/src/components/InstructionEditor/InstructionEditor.tsx`

**Changes Required:**
1. Add `useTranslations('articles.instructionEditor')` hook
2. Update form labels: "Article Title", "Tags"
3. Update placeholder text
4. Update button labels: "Cancel", "Save Changes"
5. Update confirmation dialog text

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] Form labels translated
- [ ] Button labels translated
- [ ] Confirmation dialog text translated
- [ ] Existing `tLoading` usage maintained

---

### Task 3: Update ContentEditSection component (Priority: High)

**Description:** Replace all hardcoded strings in ContentEditSection with translation calls.

**File:** `/src/components/InstructionEditor/components/ContentEditSection.tsx`

**Changes Required:**
1. Add `useTranslations('articles.content')` hook
2. Update section header text
3. Update piece count text (ICU plural format)
4. Update "Add Content" button label
5. Update confirmation dialog title, message, and buttons
6. Update accessibility announcements for drag-and-drop

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] ICU plural format for count
- [ ] Drag-and-drop announcements use translations with variable interpolation
- [ ] Dialog text translated
- [ ] Button labels translated

---

### Task 4: Update AddContentModal component (Priority: High)

**Description:** Replace all hardcoded strings in AddContentModal with translation calls.

**File:** `/src/components/InstructionEditor/components/AddContentModal.tsx`

**Changes Required:**
1. Add `useTranslations('articles.content')` hook
2. Update modal title
3. Update content type labels
4. Update button labels
5. Update validation messages

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] Modal title translated
- [ ] Content type options translated
- [ ] Button labels translated

---

### Task 5: Update ReadOnlyContextSection component (Priority: Medium)

**Description:** Replace any hardcoded strings in ReadOnlyContextSection with translation calls.

**File:** `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx`

**Changes Required:**
1. Add `useTranslations('articles')` hook if needed
2. Update any hardcoded labels

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] Labels translated

---

### Task 6: Verify translations in test files (Priority: Medium)

**Description:** Update test files to work with i18n changes if needed.

**Files:**
- `/src/components/ItemCapture/editors/__tests__/MarkdownEditor.test.tsx`

**Changes Required:**
1. Add mock translation provider if needed
2. Update test assertions for translated text

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Tests verify correct translation key usage

---

## 7. Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### 7.1 Editor Components (Modify)

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | Full component | Modify | Add i18n hooks, replace strings |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | Full component | Modify | Add i18n hooks, replace strings |
| `/src/components/InstructionEditor/components/ContentEditSection.tsx` | Full component | Modify | Add i18n hooks, replace strings |
| `/src/components/InstructionEditor/components/AddContentModal.tsx` | Full component | Modify | Add i18n hooks, replace strings |
| `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | Full component | Modify | Add i18n hooks if needed |

### 7.2 Test Files (Modify)

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/src/components/ItemCapture/editors/__tests__/MarkdownEditor.test.tsx` | Tests | Modify | Add i18n mock |

### 7.3 Translation Files (Reference - Modified by Task 2E.1)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source of translation keys |

---

## 8. Dependencies

### 8.1 Depends On (Completed First)

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| Epic 1 Foundation | next-intl setup, useTranslations hook | Complete |
| **REQ-E02-070** (Task 2E.1) | `articles.editor.*` translation keys | Must complete first |

### 8.2 Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-075** (Task 2E.6) | Editor strings ready for translation generation |

### 8.3 Parallel Safety

- **Files touched**: 5 component files in `/src/components/`
- **Conflicts with**: None - editor components are isolated
- **Safe to parallelize with**: Tasks 2E.3, 2E.4, 2E.5 (different component sets)

### 8.4 External Dependencies

- `next-intl` package (from Epic 1)

---

## 9. Risks and Considerations

### 9.1 Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| Toolbar button array refactoring | Medium | Test all toolbar buttons render correctly |
| Accessibility announcement changes | Medium | Test with screen reader |
| Character count display | Low | Verify ICU format renders correctly |

### 9.2 Testing Requirements

- Manual testing of all editor components
- Verify markdown toolbar functionality
- Test drag-and-drop announcements
- Verify character counter displays correctly
- Test confirmation dialogs
- Run existing unit tests

### 9.3 Open Questions

- [ ] Should keyboard shortcuts in aria-labels be platform-aware (Cmd vs Ctrl)?
- [ ] Are there additional strings in AddContentModal not discovered?

---

## 10. Out of Scope

- Creating new translation keys (handled by Task 2E.1)
- Actual translations (handled by Task 2E.6)
- ImageCropper/VideoTrimmer updates (handled by Task 2E.4)
- Instructions page updates (handled by Task 2E.5)
- Media handling components (handled by Task 2E.3)

---

## 11. Verification Checklist

### Pre-Implementation
- [ ] Verify `articles.editor.*` keys exist in en.json
- [ ] Verify `useTranslations` hook is available

### Implementation
- [ ] MarkdownEditor strings replaced
- [ ] InstructionEditor strings replaced
- [ ] ContentEditSection strings replaced
- [ ] AddContentModal strings replaced
- [ ] ReadOnlyContextSection strings replaced (if needed)
- [ ] All components render correctly

### Post-Implementation
- [ ] TypeScript compilation succeeds
- [ ] Build completes without errors
- [ ] All unit tests pass
- [ ] Manual testing in browser confirms translations display
- [ ] Add `@lastModified` comment to each file with REQ-E02-071

---

## 12. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Namespace Task:** `/docs/REQ-E02-070-create-articles-namespace-structure-overview.md`
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages

---

*Document generated: 2026-01-22 16:17*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
