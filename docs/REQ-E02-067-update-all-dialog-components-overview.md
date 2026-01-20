# REQ-E02-067: Update All Dialog Components - Implementation Breakdown

**Generated:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-067
**Epic:** Localization Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.12
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Estimated Strings:** ~60

---

## Overview

This task involves updating all dialog components in the Item Creation Workflow to use internationalized strings via next-intl instead of hardcoded English text. Dialog components are critical UI elements that appear during workflow interactions for confirmations, warnings, validations, and export operations.

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation (next-intl setup) | Required | Must be complete before starting |
| Task 2H.1 (Common namespace) | Required | `common` namespace for shared actions |
| Task 2C.1 (Workflow namespace) | Required | `workflow` namespace structure needed |
| Task 2C.11 (Shared components) | Related | Dialogs are part of shared components |

### Business Impact

- **User Impact:** Non-English users see fully localized dialogs during workflow interactions including confirmations, warnings, and export operations
- **Technical Impact:** Centralizes ~60 strings across 4 dialog components into translation files
- **UX Improvement:** Users make better-informed decisions when confirmation prompts, warnings, and error states appear in their native language

---

## Current State Analysis

### Dialog Components Inventory (4 Files)

All dialog components are located in:
`/src/components/ItemCreationWorkflow/components/shared/`

| # | Component File | Purpose | Estimated Strings | Priority |
|---|----------------|---------|-------------------|----------|
| 1 | ConfirmExitDialog.tsx | Warns when exiting workflow with unsaved items | ~12 | High |
| 2 | EmptySessionDialog.tsx | Prompts when session has no items | ~8 | High |
| 3 | RemoveItemDialog.tsx | Confirms item removal from session | ~6 | High |
| 4 | PDFExportDialog.tsx | Configures PDF export settings | ~15 | High |

### Hardcoded String Categories

Based on component analysis, strings fall into these categories:

1. **Dialog Titles** (~4 strings)
   - "Exit Workflow?", "Remove Item?", "No Items Added", "Export QR Codes as PDF"

2. **Dialog Body Messages** (~12 strings)
   - Dynamic messages with variable interpolation
   - "Are you sure you want to remove..."
   - "You have unsaved changes..."

3. **Button Labels** (~10 strings)
   - "Cancel", "Exit Workflow", "Remove", "Add Items", "Exit Session"
   - "Export PDF", "Generating..."

4. **Accessibility Labels** (~6 strings)
   - "Close dialog", aria-labels for dialog elements

5. **Error/Status Messages** (~8 strings)
   - "PDF generation failed", error descriptions

---

## Implementation Tasks

### Task 1: Add/Update Translation Keys in `workflow.dialogs` Namespace

**File:** `/messages/en.json`

Add/update the following structure under the `workflow` namespace. Note that some keys may already exist from Task 2C.11 (shared components); this task ensures completeness for dialog-specific content.

```json
{
  "workflow": {
    "dialogs": {
      "confirmExit": {
        "title": "Exit Workflow?",
        "messageWithUnsavedAndItems": "You have unsaved changes and {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
        "messageWithUnsaved": "You have unsaved changes. Are you sure you want to exit?",
        "messageWithItems": "You have created {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
        "messageDefault": "Are you sure you want to exit the workflow?",
        "cancelButton": "Cancel",
        "exitButton": "Exit Workflow",
        "ariaLabelledBy": "exit-dialog-title",
        "ariaDescribedBy": "exit-dialog-description"
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "No items added yet. Add items or exit session?",
        "addItemsButton": "Add Items",
        "exitSessionButton": "Exit Session",
        "closeAriaLabel": "Close dialog"
      },
      "removeItem": {
        "title": "Remove Item?",
        "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone.",
        "cancelButton": "Cancel",
        "removeButton": "Remove"
      },
      "pdfExport": {
        "title": "Export QR Codes as PDF",
        "itemCount": "{count, plural, one {# item} other {# items}}",
        "description": "Configure PDF export settings for your QR codes and download them as a printable PDF document.",
        "generationFailed": "PDF generation failed",
        "cancelButton": "Cancel",
        "exportButton": "Export PDF",
        "generatingButton": "Generating...",
        "closeAriaLabel": "Close dialog",
        "dismissErrorAriaLabel": "Dismiss error"
      }
    }
  }
}
```

---

### Task 2: Update ConfirmExitDialog Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

**Current Hardcoded Strings:**

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 67-77 | `getExitMessage()` function variants | Use 4 message keys with ICU pluralization |
| 155 | "Exit Workflow?" | `workflow.dialogs.confirmExit.title` |
| 181 | "Cancel" | `workflow.dialogs.confirmExit.cancelButton` |
| 196 | "Exit Workflow" | `workflow.dialogs.confirmExit.exitButton` |

**Changes Required:**

```tsx
// Add import at top of file
import { useTranslations } from 'next-intl';

// Inside component, add hook
const t = useTranslations('workflow.dialogs.confirmExit');

// Update getExitMessage helper function to accept translations
function getExitMessage(
  itemCount: number,
  hasUnsavedChanges: boolean,
  t: ReturnType<typeof useTranslations>
): string {
  if (hasUnsavedChanges && itemCount > 0) {
    return t('messageWithUnsavedAndItems', { count: itemCount });
  }
  if (hasUnsavedChanges) {
    return t('messageWithUnsaved');
  }
  if (itemCount > 0) {
    return t('messageWithItems', { count: itemCount });
  }
  return t('messageDefault');
}

// In JSX:
// Line 155: Replace "Exit Workflow?" with {t('title')}
// Line 161: Pass t to getExitMessage: {getExitMessage(itemCount, hasUnsavedChanges, t)}
// Line 181: Replace "Cancel" with {t('cancelButton')}
// Line 196: Replace "Exit Workflow" with {t('exitButton')}
```

---

### Task 3: Update EmptySessionDialog Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`

**Current Hardcoded Strings:**

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 131 | "Close dialog" | `workflow.dialogs.emptySession.closeAriaLabel` |
| 150 | "No Items Added" | `workflow.dialogs.emptySession.title` |
| 158 | "No items added yet. Add items or exit session?" | `workflow.dialogs.emptySession.message` |
| 179 | "Add Items" | `workflow.dialogs.emptySession.addItemsButton` |
| 198 | "Exit Session" | `workflow.dialogs.emptySession.exitSessionButton` |

**Changes Required:**

```tsx
// Add import at top of file
import { useTranslations } from 'next-intl';

// Inside component, add hook
const t = useTranslations('workflow.dialogs.emptySession');

// In JSX:
// Line 131: Replace "Close dialog" with {t('closeAriaLabel')}
<button aria-label={t('closeAriaLabel')}>

// Line 150: Replace "No Items Added" with {t('title')}
<h2 id="empty-session-title">{t('title')}</h2>

// Line 158: Replace message with {t('message')}
<p id="empty-session-description">{t('message')}</p>

// Line 179: Replace "Add Items" with {t('addItemsButton')}
<button>{t('addItemsButton')}</button>

// Line 198: Replace "Exit Session" with {t('exitSessionButton')}
<button>{t('exitSessionButton')}</button>
```

---

### Task 4: Update RemoveItemDialog Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`

**Current Hardcoded Strings:**

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 123 | "Remove Item?" | `workflow.dialogs.removeItem.title` |
| 129 | "Are you sure you want to remove \"{displayName}\"? This action cannot be undone." | `workflow.dialogs.removeItem.message` |
| 150 | "Cancel" | `workflow.dialogs.removeItem.cancelButton` |
| 167 | "Remove" | `workflow.dialogs.removeItem.removeButton` |

**Changes Required:**

```tsx
// Add import at top of file
import { useTranslations } from 'next-intl';

// Inside component, add hook
const t = useTranslations('workflow.dialogs.removeItem');

// In JSX:
// Line 123: Replace "Remove Item?" with {t('title')}
<h3 id="remove-dialog-title">{t('title')}</h3>

// Line 129: Replace message with variable interpolation
<p id="remove-dialog-description">
  {t('message', { name: displayName })}
</p>

// Line 150: Replace "Cancel" with {t('cancelButton')}
<button>{t('cancelButton')}</button>

// Line 167: Replace "Remove" with {t('removeButton')}
<button>{t('removeButton')}</button>
```

---

### Task 5: Update PDFExportDialog Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`

**Current Hardcoded Strings:**

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 173 | "Export QR Codes as PDF" | `workflow.dialogs.pdfExport.title` |
| 180 | "{itemCount} item(s)" | `workflow.dialogs.pdfExport.itemCount` |
| 199 | "Close dialog" | `workflow.dialogs.pdfExport.closeAriaLabel` |
| 206-208 | Hidden description | `workflow.dialogs.pdfExport.description` |
| 227 | "PDF generation failed" | `workflow.dialogs.pdfExport.generationFailed` |
| 239 | "Dismiss error" | `workflow.dialogs.pdfExport.dismissErrorAriaLabel` |
| 270 | "Cancel" | `workflow.dialogs.pdfExport.cancelButton` |
| 294 | "Generating..." | `workflow.dialogs.pdfExport.generatingButton` |
| 299 | "Export PDF" | `workflow.dialogs.pdfExport.exportButton` |

**Changes Required:**

```tsx
// Add import at top of file
import { useTranslations } from 'next-intl';

// Inside component, add hook
const t = useTranslations('workflow.dialogs.pdfExport');

// In JSX:
// Line 173: Replace title
<h2 id="pdf-export-dialog-title">{t('title')}</h2>

// Line 180: Replace item count with ICU pluralization
<span>{t('itemCount', { count: itemCount })}</span>

// Line 199: Replace aria-label
<button aria-label={t('closeAriaLabel')}>

// Lines 206-208: Replace hidden description
<p id="pdf-export-dialog-description" className="sr-only">
  {t('description')}
</p>

// Line 227: Replace error title
<p>{t('generationFailed')}</p>

// Line 239: Replace dismiss aria-label
<button aria-label={t('dismissErrorAriaLabel')}>

// Line 270: Replace Cancel
<button>{t('cancelButton')}</button>

// Lines 294, 299: Replace button states
{isGenerating ? (
  <>
    <Loader2 className={...} aria-hidden="true" />
    <span>{t('generatingButton')}</span>
  </>
) : (
  <>
    <FileDown className="w-4 h-4" aria-hidden="true" />
    <span>{t('exportButton')}</span>
  </>
)}
```

---

### Task 6: Generate Translations for 5 Non-English Languages

Generate translations for the dialog-specific keys in:
- `/messages/fr.json` (French)
- `/messages/es.json` (Spanish)
- `/messages/de.json` (German)
- `/messages/nl.json` (Dutch)
- `/messages/it.json` (Italian)

**Translation Guide for Dialog Strings:**

| English Key | French | Spanish | German | Dutch | Italian |
|-------------|--------|---------|--------|-------|---------|
| Exit Workflow? | Quitter le processus ? | ¿Salir del proceso? | Workflow beenden? | Werkstroom verlaten? | Uscire dal processo? |
| Remove Item? | Supprimer l'article ? | ¿Eliminar artículo? | Element entfernen? | Item verwijderen? | Rimuovere elemento? |
| No Items Added | Aucun article ajouté | Sin artículos añadidos | Keine Elemente hinzugefügt | Geen items toegevoegd | Nessun elemento aggiunto |
| Export QR Codes as PDF | Exporter les codes QR en PDF | Exportar códigos QR como PDF | QR-Codes als PDF exportieren | QR-codes exporteren als PDF | Esporta codici QR come PDF |
| Cancel | Annuler | Cancelar | Abbrechen | Annuleren | Annulla |
| Add Items | Ajouter des articles | Añadir artículos | Elemente hinzufügen | Items toevoegen | Aggiungi elementi |
| Exit Session | Quitter la session | Salir de sesión | Sitzung beenden | Sessie verlaten | Esci dalla sessione |
| Remove | Supprimer | Eliminar | Entfernen | Verwijderen | Rimuovi |
| Export PDF | Exporter PDF | Exportar PDF | PDF exportieren | PDF exporteren | Esporta PDF |
| Generating... | Génération... | Generando... | Wird generiert... | Genereren... | Generazione... |

---

## Authorized Files and Functions for Modification

### Translation Files

| File Path | Action |
|-----------|--------|
| `/messages/en.json` | ADD/UPDATE `workflow.dialogs` namespace (~45 keys) |
| `/messages/fr.json` | ADD translations for `workflow.dialogs` |
| `/messages/es.json` | ADD translations for `workflow.dialogs` |
| `/messages/de.json` | ADD translations for `workflow.dialogs` |
| `/messages/nl.json` | ADD translations for `workflow.dialogs` |
| `/messages/it.json` | ADD translations for `workflow.dialogs` |

### Component Files

| File Path | Functions/Elements to Modify |
|-----------|------------------------------|
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | `ConfirmExitDialog` component, `getExitMessage` helper function |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | `EmptySessionDialog` component |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | `RemoveItemDialog` component |
| `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | `PDFExportDialog` component |

### Modifications Per File

#### ConfirmExitDialog.tsx
- **Add Import:** `import { useTranslations } from 'next-intl';`
- **Add Hook Call:** `const t = useTranslations('workflow.dialogs.confirmExit');`
- **Modify Function:** `getExitMessage` - add `t` parameter
- **Replace Strings:** Lines 155, 161, 181, 196

#### EmptySessionDialog.tsx
- **Add Import:** `import { useTranslations } from 'next-intl';`
- **Add Hook Call:** `const t = useTranslations('workflow.dialogs.emptySession');`
- **Replace Strings:** Lines 131, 150, 158, 179, 198

#### RemoveItemDialog.tsx
- **Add Import:** `import { useTranslations } from 'next-intl';`
- **Add Hook Call:** `const t = useTranslations('workflow.dialogs.removeItem');`
- **Replace Strings:** Lines 123, 129, 150, 167

#### PDFExportDialog.tsx
- **Add Import:** `import { useTranslations } from 'next-intl';`
- **Add Hook Call:** `const t = useTranslations('workflow.dialogs.pdfExport');`
- **Replace Strings:** Lines 173, 180, 199, 206-208, 227, 239, 270, 294, 299

---

## Verification Checklist

### Per-Component Verification

For each dialog component, verify:

- [ ] Import `useTranslations` from 'next-intl' added
- [ ] Hook called at top of component with correct namespace
- [ ] All dialog title text uses translation keys
- [ ] All dialog body content and descriptions use translated text
- [ ] Confirmation button labels render in selected language
- [ ] Cancellation and dismissal button text uses translations
- [ ] Warning and error message text appears translated
- [ ] All ARIA labels use translated strings
- [ ] Variable interpolation works correctly with `{variable}` syntax
- [ ] Pluralization uses ICU format where applicable
- [ ] No hardcoded English strings remain
- [ ] No TypeScript errors
- [ ] Component renders correctly in English

### Integration Verification

- [ ] Build completes without errors: `npm run build`
- [ ] All translation keys exist in en.json
- [ ] All translation keys exist in all 5 other language files
- [ ] No runtime warnings about missing translations
- [ ] Dialogs function correctly end-to-end
- [ ] Language switching displays translated dialog content

### Visual Verification

- [ ] ConfirmExitDialog displays correctly with all message variants
- [ ] EmptySessionDialog buttons and text fit properly
- [ ] RemoveItemDialog shows item name correctly with interpolation
- [ ] PDFExportDialog maintains layout in all languages
- [ ] No text overflow or truncation in any language
- [ ] Button widths accommodate longer translations

### Accessibility Verification

- [ ] All aria-labels are translated
- [ ] Screen readers announce translated content correctly
- [ ] Dialog focus management works correctly
- [ ] Escape key behavior unchanged

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| All dialog title text uses translation keys from workflow namespace | Tasks 2, 3, 4, 5 |
| All dialog body content and descriptions display translated text | Tasks 2, 3, 4, 5 |
| Confirmation button labels render in selected language | Tasks 2, 3, 4, 5 |
| Cancellation and dismissal button text uses translations | Tasks 2, 3, 4, 5 |
| Warning and error message text appears in user's language | Tasks 2, 5 |
| Success notification dialogs display translated content | N/A (no success dialogs in scope) |
| Unsaved changes warning dialogs show localized messages | Task 2 |
| Navigation confirmation dialogs present translated prompts | Task 2 |
| Deletion confirmation dialogs use translated warning text | Task 4 |
| Validation error dialogs display localized error descriptions | Task 5 |
| All ARIA labels and accessibility attributes use translated strings | Tasks 2, 3, 4, 5 |
| Dialog components integrate with next-intl using useTranslations hook | All tasks |
| Translation keys follow consistent naming patterns | Task 1 |
| No hardcoded English strings remain in any workflow dialog | All tasks |
| Dialogs render correctly without layout issues in all languages | Verification |
| Dynamic content (item names, counts) correctly interpolates | Tasks 2, 4 |
| Dialog components maintain existing functionality | Verification |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys at runtime | Low | Medium | Build-time validation, comprehensive testing |
| ICU pluralization format errors | Low | Medium | Thorough testing of all count variations |
| Layout breaks with longer translations | Medium | Low | Design dialogs with 40% text expansion buffer |
| Breaking existing tests | Medium | Medium | Update test expectations for translated strings |
| Focus management issues after changes | Low | Medium | Test accessibility after each modification |
| Variable interpolation errors | Low | High | Test with edge cases (empty names, special chars) |

---

## Test Cases

### ConfirmExitDialog Tests
1. Displays correct message when hasUnsavedChanges=true, itemCount=0
2. Displays correct message when hasUnsavedChanges=false, itemCount=5
3. Displays correct message when hasUnsavedChanges=true, itemCount=3
4. Displays correct message when hasUnsavedChanges=false, itemCount=0
5. Pluralization works for "1 item" vs "2 items"

### EmptySessionDialog Tests
1. All text elements display translated content
2. Button labels change with language switch

### RemoveItemDialog Tests
1. Item name interpolates correctly in message
2. Special characters in item names display properly
3. Long item names truncate correctly

### PDFExportDialog Tests
1. Item count displays correct pluralization
2. Error message displays when generation fails
3. Button states (generating vs export) show correct text

---

## Notes

- All dialog components use `'use client'` directive, making them client components that use `useTranslations` hook
- The `workflow.dialogs` namespace organizes all dialog-related translations logically
- Variable interpolation in messages (e.g., item names, counts) must preserve the `{variable}` syntax
- ICU pluralization format (`{count, plural, one {...} other {...}}`) handles singular/plural forms
- Consider overlap with Task 2C.11 (shared components) - some keys may already be defined
- Existing test files may need updates to mock translations or expect translated strings

---

## Related Tasks

- **Task 2C.11 (REQ-E02-066):** Update all shared components - includes dialogs as part of larger scope
- **Task 2C.13:** Generate translations for all 5 non-English languages for workflow namespace
- **Task 2H.3:** Extract modal/dialog strings - common namespace patterns

---

*Document generated for FAQBNB Localization Epic 2 - Task 2C.12*
