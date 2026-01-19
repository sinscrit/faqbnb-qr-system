# REQ-382: Update All Dialog Components in Item Creation Workflow for Internationalization

**Created:** 2026-01-19 18:00 UTC
**Last Modified:** 2026-01-19 18:00 UTC
**Type:** ENHANCEMENT
**Size:** L (Large)
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.12
**Status:** Not Started

---

## 1. Summary

Update all dialog components within the Item Creation Workflow to support internationalization (i18n) by replacing hardcoded English strings with translation function calls using the next-intl system. This task is part of Epic 2 (Static UI Translation) and specifically addresses the dialog/confirmation UI components that appear during the item creation flow.

---

## 2. Implementation Plan Reference

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **PRD Reference:** PRD_L10N_Epic2_Static_UI_Translation.md
- **Epic 1 Foundation:** Plan-110-L10N-Epic1-Foundation.md

---

## 3. Background & Context

### 3.1 Current State

The Item Creation Workflow contains **4 primary dialog components** in the shared components folder:

| Dialog Component | Location | Hardcoded Strings (Est.) |
|------------------|----------|--------------------------|
| `ConfirmExitDialog` | `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | ~8 strings |
| `RemoveItemDialog` | `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | ~6 strings |
| `EmptySessionDialog` | `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | ~8 strings |
| `PDFExportDialog` | `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | ~12 strings |

All dialogs currently display hardcoded English strings for:
- Dialog titles
- Body/message text
- Button labels (Cancel, Confirm, Exit, etc.)
- Status/progress messages
- Accessibility labels (aria-label, aria-describedby)
- Error messages

### 3.2 Target State

Each dialog component will:
1. Import `useTranslations` from `next-intl`
2. Use the `workflow.dialogs` namespace for translation keys
3. Replace all hardcoded strings with `t()` function calls
4. Support variable interpolation for dynamic content (item names, counts)
5. Maintain existing accessibility, focus management, and styling

---

## 4. Existing Patterns to Follow

### 4.1 Translation Pattern (from LogoutButton.tsx)

```typescript
import { useTranslations } from 'next-intl';

function DialogComponent() {
  const t = useTranslations('workflow.dialogs');
  const tCommon = useTranslations('common');

  return (
    <div>
      <h3>{t('confirmExit.title')}</h3>
      <p>{t('confirmExit.message')}</p>
      <button>{tCommon('cancel')}</button>
      <button>{t('confirmExit.confirmButton')}</button>
    </div>
  );
}
```

### 4.2 Variable Interpolation Pattern

```typescript
// For dynamic content like item names
t('removeItem.message', { itemName: displayName })

// For pluralization
t('exitWithItems.message', { count: itemCount })
```

### 4.3 Translation Key Naming Convention

Following the Plan-111 specification:
```
workflow.dialogs.[dialogName].[element]
```

Examples:
- `workflow.dialogs.confirmExit.title`
- `workflow.dialogs.confirmExit.message`
- `workflow.dialogs.confirmExit.confirmButton`
- `workflow.dialogs.confirmExit.cancelButton`

---

## 5. Dialog Components Analysis

### 5.1 ConfirmExitDialog

**File:** `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

**Hardcoded Strings to Extract:**

| String | Current Value | Translation Key |
|--------|---------------|-----------------|
| Dialog Title | "Exit Workflow?" | `workflow.dialogs.confirmExit.title` |
| Message (unsaved + items) | "You have unsaved changes and {count} items in this session. Are you sure you want to exit?" | `workflow.dialogs.confirmExit.messageUnsavedWithItems` |
| Message (unsaved only) | "You have unsaved changes. Are you sure you want to exit?" | `workflow.dialogs.confirmExit.messageUnsaved` |
| Message (items only) | "You have created {count} items in this session. Are you sure you want to exit?" | `workflow.dialogs.confirmExit.messageWithItems` |
| Message (default) | "Are you sure you want to exit the workflow?" | `workflow.dialogs.confirmExit.messageDefault` |
| Cancel Button | "Cancel" | `common.cancel` |
| Confirm Button | "Exit Workflow" | `workflow.dialogs.confirmExit.confirmButton` |

**Complexity:** The `getExitMessage()` helper function needs refactoring to accept a translation function parameter.

### 5.2 RemoveItemDialog

**File:** `src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`

**Hardcoded Strings to Extract:**

| String | Current Value | Translation Key |
|--------|---------------|-----------------|
| Dialog Title | "Remove Item?" | `workflow.dialogs.removeItem.title` |
| Message | 'Are you sure you want to remove "{itemName}"? This action cannot be undone.' | `workflow.dialogs.removeItem.message` |
| Cancel Button | "Cancel" | `common.cancel` |
| Confirm Button | "Remove" | `workflow.dialogs.removeItem.confirmButton` |

### 5.3 EmptySessionDialog

**File:** `src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`

**Hardcoded Strings to Extract:**

| String | Current Value | Translation Key |
|--------|---------------|-----------------|
| Dialog Title | "No Items Added" | `workflow.dialogs.emptySession.title` |
| Message | "No items added yet. Add items or exit session?" | `workflow.dialogs.emptySession.message` |
| Close Button aria-label | "Close dialog" | `workflow.dialogs.emptySession.closeAriaLabel` |
| Add Items Button | "Add Items" | `workflow.dialogs.emptySession.addItemsButton` |
| Exit Session Button | "Exit Session" | `workflow.dialogs.emptySession.exitSessionButton` |

### 5.4 PDFExportDialog

**File:** `src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`

**Hardcoded Strings to Extract:**

| String | Current Value | Translation Key |
|--------|---------------|-----------------|
| Dialog Title | "Export QR Codes as PDF" | `workflow.dialogs.pdfExport.title` |
| Item Count Badge | "{count} item(s)" | `workflow.dialogs.pdfExport.itemCount` |
| Close Button aria-label | "Close dialog" | `workflow.dialogs.pdfExport.closeAriaLabel` |
| SR-only Description | "Configure PDF export settings..." | `workflow.dialogs.pdfExport.description` |
| Error Title | "PDF generation failed" | `workflow.dialogs.pdfExport.errorTitle` |
| Error Dismiss aria-label | "Dismiss error" | `workflow.dialogs.pdfExport.errorDismissAriaLabel` |
| Cancel Button | "Cancel" | `common.cancel` |
| Export Button | "Export PDF" | `workflow.dialogs.pdfExport.exportButton` |
| Generating State | "Generating..." | `workflow.dialogs.pdfExport.generating` |

---

## 6. Translation Keys Structure

Add to `/messages/en.json` under the `workflow` namespace:

```json
{
  "workflow": {
    "dialogs": {
      "confirmExit": {
        "title": "Exit Workflow?",
        "messageDefault": "Are you sure you want to exit the workflow?",
        "messageUnsaved": "You have unsaved changes. Are you sure you want to exit?",
        "messageWithItems": "You have created {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
        "messageUnsavedWithItems": "You have unsaved changes and {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
        "confirmButton": "Exit Workflow"
      },
      "removeItem": {
        "title": "Remove Item?",
        "message": "Are you sure you want to remove \"{itemName}\"? This action cannot be undone.",
        "confirmButton": "Remove"
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "No items added yet. Add items or exit session?",
        "closeAriaLabel": "Close dialog",
        "addItemsButton": "Add Items",
        "exitSessionButton": "Exit Session"
      },
      "pdfExport": {
        "title": "Export QR Codes as PDF",
        "itemCount": "{count, plural, one {# item} other {# items}}",
        "closeAriaLabel": "Close dialog",
        "description": "Configure PDF export settings for your QR codes and download them as a printable PDF document.",
        "errorTitle": "PDF generation failed",
        "errorDismissAriaLabel": "Dismiss error",
        "exportButton": "Export PDF",
        "generating": "Generating..."
      }
    }
  }
}
```

---

## 7. Authorized Files and Functions for Modification

### 7.1 Primary Dialog Component Files

| File Path | Functions/Exports to Modify |
|-----------|----------------------------|
| `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | `ConfirmExitDialog` component, `getExitMessage` helper function |
| `src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | `RemoveItemDialog` component |
| `src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | `EmptySessionDialog` component |
| `src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | `PDFExportDialog` component |

### 7.2 Translation Files

| File Path | Sections to Modify |
|-----------|-------------------|
| `messages/en.json` | Add `workflow.dialogs` namespace |
| `messages/fr.json` | Add `workflow.dialogs` namespace (French translations) |
| `messages/es.json` | Add `workflow.dialogs` namespace (Spanish translations) |
| `messages/de.json` | Add `workflow.dialogs` namespace (German translations) |
| `messages/nl.json` | Add `workflow.dialogs` namespace (Dutch translations) |
| `messages/it.json` | Add `workflow.dialogs` namespace (Italian translations) |

### 7.3 Test Files (Update Expectations)

| File Path | Modifications Needed |
|-----------|---------------------|
| `src/components/ItemCreationWorkflow/components/shared/__tests__/ConfirmExitDialog.test.tsx` | Mock `useTranslations`, update text expectations |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/RemoveItemDialog.test.tsx` | Mock `useTranslations`, update text expectations |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/EmptySessionDialog.test.tsx` | Mock `useTranslations`, update text expectations |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/PDFExportDialog.test.tsx` | Mock `useTranslations`, update text expectations |

---

## 8. Implementation Tasks

### Task 8.1: Add Translation Keys to messages/en.json
- Add `workflow.dialogs` namespace with all required keys
- Follow ICU message format for pluralization
- Include variable placeholders for dynamic content

### Task 8.2: Update ConfirmExitDialog.tsx
- Import `useTranslations` from 'next-intl'
- Refactor `getExitMessage()` to use translation function
- Replace all hardcoded strings with `t()` calls
- Ensure proper variable interpolation for item count

### Task 8.3: Update RemoveItemDialog.tsx
- Import `useTranslations` from 'next-intl'
- Replace all hardcoded strings with `t()` calls
- Pass `itemName` as interpolation variable

### Task 8.4: Update EmptySessionDialog.tsx
- Import `useTranslations` from 'next-intl'
- Replace all hardcoded strings with `t()` calls
- Update aria-label attributes with translations

### Task 8.5: Update PDFExportDialog.tsx
- Import `useTranslations` from 'next-intl'
- Replace all hardcoded strings with `t()` calls
- Update pluralization for item count badge
- Translate accessibility attributes

### Task 8.6: Update Test Files
- Add `useTranslations` mock setup to test files
- Update test assertions to match translation keys or mock values
- Verify tests pass with mocked translations

### Task 8.7: Generate Translations for Non-English Languages
- Add French translations to `messages/fr.json`
- Add Spanish translations to `messages/es.json`
- Add German translations to `messages/de.json`
- Add Dutch translations to `messages/nl.json`
- Add Italian translations to `messages/it.json`

### Task 8.8: Manual Testing & Validation
- Test each dialog in all 6 supported languages
- Verify text displays correctly without overflow
- Verify button alignment with varying text lengths
- Test accessibility with screen reader
- Verify keyboard navigation works correctly

---

## 9. Dependencies

### 9.1 Epic 1 Dependencies (Must be Complete)

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl package installed | Complete | `package.json` |
| i18n config module | Complete | `/src/lib/i18n/config.ts` |
| IntlProvider wrapper | Complete | `/src/app/layout.tsx` |
| Base translation files | Complete | `/messages/*.json` |

### 9.2 Internal Dependencies

| Dependency | Description |
|------------|-------------|
| Task 2C.11 (Shared Components) | Some shared components may have their own dialog/alert patterns |
| Task 2H (Common namespace) | Common buttons like "Cancel" should use `common.cancel` |

---

## 10. Acceptance Criteria

- [ ] All 4 dialog components import and use `useTranslations` hook
- [ ] All hardcoded strings replaced with translation function calls
- [ ] Translation keys follow `workflow.dialogs.[dialogName].[element]` pattern
- [ ] Variable interpolation works for dynamic content (item names, counts)
- [ ] Pluralization uses ICU format for item counts
- [ ] All aria-label and aria-describedby attributes are translated
- [ ] Dialogs maintain existing styling, layout, and behavior
- [ ] Focus management and keyboard navigation unchanged
- [ ] All test files updated and passing
- [ ] Translations added to all 6 language files (en, fr, es, de, nl, it)
- [ ] No console warnings for missing translation keys
- [ ] Dialogs display correctly in all supported languages
- [ ] No text overflow or truncation issues in any language

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation text length varies significantly | High | Medium | Design with 40% text expansion buffer; test button layouts in German/French |
| Dynamic message construction complexity | Medium | Low | Refactor helper functions to accept `t` function; use ICU format |
| Test maintenance overhead | Low | Low | Create shared mock utilities for translation functions |
| Missing translations at runtime | Low | High | Ensure fallback to English; add build-time validation |

---

## 12. Testing Strategy

### 12.1 Unit Tests
- Mock `useTranslations` hook in test setup
- Verify correct translation keys are called
- Test dynamic interpolation with various values

### 12.2 Integration Tests
- Test dialogs within actual workflow context
- Verify dialog open/close behavior unchanged

### 12.3 Manual Testing
- Visual inspection in all 6 languages
- Screen reader testing for accessibility
- Keyboard navigation testing
- Mobile responsiveness verification

---

## 13. Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 0.5h |
| Update ConfirmExitDialog | 0.5h |
| Update RemoveItemDialog | 0.25h |
| Update EmptySessionDialog | 0.25h |
| Update PDFExportDialog | 0.5h |
| Update test files | 1h |
| Generate non-English translations | 0.5h |
| Manual testing | 1h |
| **Total** | **4.5h** |

---

## 14. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- Epic 1 Foundation: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- i18n Config: `/src/lib/i18n/config.ts`
- Translation Pattern Reference: `/src/components/LogoutButton.tsx`
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
