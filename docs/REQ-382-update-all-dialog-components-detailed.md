# REQ-382: Update All Dialog Components - Detailed Task Breakdown

**Created:** 2026-01-19 19:30 UTC
**Last Modified:** 2026-01-19 19:30 UTC
**Request ID:** REQ-382
**Type:** ENHANCEMENT
**Size:** L (Large)
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.12
**Status:** Not Started

---

## Executive Summary

This document provides a granular, implementation-ready task breakdown for internationalizing all dialog components within the Item Creation Workflow. The scope includes 4 dialog components with approximately 34 hardcoded strings to extract and translate into 6 languages.

**Target Dialog Components:**
1. `ConfirmExitDialog.tsx` - Exit workflow confirmation
2. `RemoveItemDialog.tsx` - Item removal confirmation
3. `EmptySessionDialog.tsx` - Empty session warning
4. `PDFExportDialog.tsx` - PDF export configuration

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Task 1: Add Translation Keys to messages/en.json](#task-1-add-translation-keys-to-messagesenjson)
3. [Task 2: Update ConfirmExitDialog.tsx](#task-2-update-confirmexitdialogtsx)
4. [Task 3: Update RemoveItemDialog.tsx](#task-3-update-removeitemdialogtsx)
5. [Task 4: Update EmptySessionDialog.tsx](#task-4-update-emptysessiondialogtsx)
6. [Task 5: Update PDFExportDialog.tsx](#task-5-update-pdfexportdialogtsx)
7. [Task 6: Update Test Files](#task-6-update-test-files)
8. [Task 7: Generate Non-English Translations](#task-7-generate-non-english-translations)
9. [Task 8: Manual Testing & Validation](#task-8-manual-testing--validation)
10. [Verification Checklist](#verification-checklist)

---

## 1. Prerequisites

### 1.1 Epic 1 Dependencies (Must Be Complete)

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl package installed | Complete | `package.json` |
| i18n config module | Complete | `/src/lib/i18n/config.ts` |
| IntlProvider wrapper | Complete | `/src/app/layout.tsx` |
| Base translation files | Complete | `/messages/*.json` |
| `useTranslations` hook available | Complete | `next-intl` |

### 1.2 Reference Implementation

**Pattern Reference:** `/src/components/LogoutButton.tsx` (lines 25-58)

```typescript
// Standard import pattern
import { useTranslations } from 'next-intl';

// Hook usage with namespace
const t = useTranslations('workflow.dialogs');
const tCommon = useTranslations('common');

// Translation call with interpolation
{t('confirmExit.message', { count: itemCount })}
```

### 1.3 Translation Key Convention

```
workflow.dialogs.[dialogName].[element]
```

Examples:
- `workflow.dialogs.confirmExit.title`
- `workflow.dialogs.confirmExit.message`
- `workflow.dialogs.confirmExit.confirmButton`

---

## Task 1: Add Translation Keys to messages/en.json

**File:** `/messages/en.json`
**Estimated Effort:** 0.5 hours
**Priority:** P0 - Required before all other tasks

### 1.1 Subtask: Create workflow.dialogs Namespace Structure

**Action:** Add the following JSON structure under a new `workflow` key in `/messages/en.json`:

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

### 1.2 Verification Steps

1. Run JSON linter to verify valid JSON syntax
2. Verify no duplicate keys exist
3. Verify ICU plural format is correct (`{count, plural, one {# item} other {# items}}`)
4. Verify variable placeholders use correct format (`{itemName}`, `{count}`)

### 1.3 Acceptance Criteria

- [ ] `workflow.dialogs` namespace added to `/messages/en.json`
- [ ] All 4 dialog namespaces present (confirmExit, removeItem, emptySession, pdfExport)
- [ ] ICU format used for pluralization
- [ ] Variable placeholders correctly formatted
- [ ] JSON passes lint validation

---

## Task 2: Update ConfirmExitDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
**Lines to Modify:** 31, 66-77, 155-161, 181, 196
**Estimated Effort:** 0.5 hours

### 2.1 Subtask: Add Imports

**Action:** Add `useTranslations` import at line 31:

```typescript
// Before (line 31)
import { useRef, useEffect } from 'react';

// After
import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
```

### 2.2 Subtask: Initialize Translation Hook

**Action:** Add hook initialization inside the component function (after line 93):

```typescript
export function ConfirmExitDialog({
  isOpen,
  onClose,
  onConfirmExit,
  itemCount = 0,
  hasUnsavedChanges = false,
  className,
}: ConfirmExitDialogProps) {
  // Add translation hooks
  const t = useTranslations('workflow.dialogs.confirmExit');
  const tCommon = useTranslations('common');

  // REQ-114: Focus trapping refs
  const dialogRef = useRef<HTMLDivElement>(null);
  // ... rest of component
```

### 2.3 Subtask: Refactor getExitMessage Helper Function

**Action:** Modify the `getExitMessage` function (lines 66-77) to accept translation function:

```typescript
/**
 * Generate appropriate exit message based on session state.
 *
 * @param itemCount - Number of items created in session
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @param t - Translation function from useTranslations hook
 * @returns Exit confirmation message
 */
function getExitMessage(
  itemCount: number,
  hasUnsavedChanges: boolean,
  t: (key: string, params?: Record<string, unknown>) => string
): string {
  if (hasUnsavedChanges && itemCount > 0) {
    return t('messageUnsavedWithItems', { count: itemCount });
  }
  if (hasUnsavedChanges) {
    return t('messageUnsaved');
  }
  if (itemCount > 0) {
    return t('messageWithItems', { count: itemCount });
  }
  return t('messageDefault');
}
```

**Note:** Move this function inside the component or pass `t` as parameter when calling.

### 2.4 Subtask: Replace Hardcoded Strings

**Action:** Replace each hardcoded string:

| Line | Current Value | Replacement |
|------|---------------|-------------|
| 155 | `"Exit Workflow?"` | `{t('title')}` |
| 161 | `{getExitMessage(itemCount, hasUnsavedChanges)}` | `{getExitMessage(itemCount, hasUnsavedChanges, t)}` |
| 181 | `"Cancel"` | `{tCommon('cancel')}` |
| 196 | `"Exit Workflow"` | `{t('confirmButton')}` |

### 2.5 Complete Modified Component Structure

```typescript
'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '../../utils/accessibility';

// ... type definitions remain unchanged ...

export function ConfirmExitDialog({
  isOpen,
  onClose,
  onConfirmExit,
  itemCount = 0,
  hasUnsavedChanges = false,
  className,
}: ConfirmExitDialogProps) {
  const t = useTranslations('workflow.dialogs.confirmExit');
  const tCommon = useTranslations('common');

  // Helper function moved inside to access t
  const getExitMessage = (): string => {
    if (hasUnsavedChanges && itemCount > 0) {
      return t('messageUnsavedWithItems', { count: itemCount });
    }
    if (hasUnsavedChanges) {
      return t('messageUnsaved');
    }
    if (itemCount > 0) {
      return t('messageWithItems', { count: itemCount });
    }
    return t('messageDefault');
  };

  // ... rest of hooks and handlers ...

  return (
    <div /* ... existing props ... */ >
      <div /* ... existing classes ... */ >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          {/* ... icon ... */}
          <div className="flex-1">
            <h3 id="exit-dialog-title" className="text-lg font-semibold text-[#222222]">
              {t('title')}
            </h3>
            <p id="exit-dialog-description" className="mt-2 text-sm text-[#717171]">
              {getExitMessage()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
          <button ref={cancelButtonRef} onClick={onClose} /* ... classes ... */ >
            {tCommon('cancel')}
          </button>
          <button onClick={onConfirmExit} /* ... classes ... */ >
            {t('confirmButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 2.6 Verification Steps

1. Component compiles without TypeScript errors
2. Dialog renders with English text when opened
3. Message changes correctly based on `itemCount` and `hasUnsavedChanges` props
4. Pluralization works (1 item vs 3 items)
5. Cancel and Exit buttons display translated text

### 2.7 Acceptance Criteria

- [ ] `useTranslations` hook imported and initialized
- [ ] All 4 hardcoded strings replaced with `t()` calls
- [ ] `getExitMessage` refactored to use translation function
- [ ] Pluralization works correctly with ICU format
- [ ] No console warnings for missing translation keys
- [ ] Component maintains existing functionality

---

## Task 3: Update RemoveItemDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
**Lines to Modify:** 15, 123, 129, 150, 167
**Estimated Effort:** 0.25 hours

### 3.1 Subtask: Add Imports

**Action:** Add import after line 15:

```typescript
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
```

### 3.2 Subtask: Initialize Translation Hook

**Action:** Add after line 47:

```typescript
export function RemoveItemDialog({
  isOpen,
  itemName,
  onClose,
  onConfirmRemove,
  className,
}: RemoveItemDialogProps) {
  const t = useTranslations('workflow.dialogs.removeItem');
  const tCommon = useTranslations('common');

  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  // ... rest of component
```

### 3.3 Subtask: Replace Hardcoded Strings

| Line | Current Value | Replacement |
|------|---------------|-------------|
| 123 | `"Remove Item?"` | `{t('title')}` |
| 129 | `Are you sure you want to remove &ldquo;{displayName}&rdquo;? This action cannot be undone.` | `{t('message', { itemName: displayName })}` |
| 150 | `"Cancel"` | `{tCommon('cancel')}` |
| 167 | `"Remove"` | `{t('confirmButton')}` |

### 3.4 Updated Message Line (129)

```tsx
<p id="remove-dialog-description" className="mt-2 text-sm text-[#717171]">
  {t('message', { itemName: displayName })}
</p>
```

**Note:** The translation key handles the quotes around itemName: `"Are you sure you want to remove \"{itemName}\"? This action cannot be undone."`

### 3.5 Acceptance Criteria

- [ ] `useTranslations` hook imported and initialized
- [ ] All 4 hardcoded strings replaced
- [ ] Variable interpolation works for `itemName`
- [ ] Truncated display names render correctly in translated text
- [ ] Component maintains existing functionality

---

## Task 4: Update EmptySessionDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
**Lines to Modify:** 15, 131, 150, 158, 179, 198
**Estimated Effort:** 0.25 hours

### 4.1 Subtask: Add Imports

```typescript
import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
```

### 4.2 Subtask: Initialize Translation Hook

**Action:** Add after line 51:

```typescript
export function EmptySessionDialog({
  isOpen,
  onClose,
  onAddItems,
  onExitSession,
  className,
}: EmptySessionDialogProps) {
  const t = useTranslations('workflow.dialogs.emptySession');

  const dialogRef = useRef<HTMLDivElement>(null);
  // ... rest of component
```

### 4.3 Subtask: Replace Hardcoded Strings

| Line | Current Value | Replacement |
|------|---------------|-------------|
| 131 | `aria-label="Close dialog"` | `aria-label={t('closeAriaLabel')}` |
| 150 | `"No Items Added"` | `{t('title')}` |
| 158 | `"No items added yet. Add items or exit session?"` | `{t('message')}` |
| 179 | `"Add Items"` | `{t('addItemsButton')}` |
| 198 | `"Exit Session"` | `{t('exitSessionButton')}` |

### 4.4 Updated aria-label (Line 131)

```tsx
<button
  type="button"
  onClick={onClose}
  className={cn(/* ... */)}
  aria-label={t('closeAriaLabel')}
>
  <X className="w-5 h-5" aria-hidden="true" />
</button>
```

### 4.5 Acceptance Criteria

- [ ] `useTranslations` hook imported and initialized
- [ ] All 5 hardcoded strings replaced
- [ ] `aria-label` attribute uses translated string
- [ ] All buttons display translated text
- [ ] Component maintains existing functionality

---

## Task 5: Update PDFExportDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`
**Lines to Modify:** 33, 173, 180, 199, 206-208, 226, 239, 270, 294, 299
**Estimated Effort:** 0.5 hours

### 5.1 Subtask: Add Imports

```typescript
import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
```

### 5.2 Subtask: Initialize Translation Hook

**Action:** Add after line 81:

```typescript
export function PDFExportDialog({
  isOpen,
  onClose,
  onExport,
  itemCount,
  settings,
  onSettingsChange,
  isGenerating = false,
  error = null,
  onClearError,
  className,
}: PDFExportDialogProps) {
  const t = useTranslations('workflow.dialogs.pdfExport');
  const tCommon = useTranslations('common');

  const dialogRef = useRef<HTMLDivElement>(null);
  // ... rest of component
```

### 5.3 Subtask: Replace Hardcoded Strings

| Line | Current Value | Replacement |
|------|---------------|-------------|
| 173 | `"Export QR Codes as PDF"` | `{t('title')}` |
| 180 | `{itemCount} item{itemCount !== 1 ? 's' : ''}` | `{t('itemCount', { count: itemCount })}` |
| 199 | `aria-label="Close dialog"` | `aria-label={t('closeAriaLabel')}` |
| 206-208 | SR-only description text | `{t('description')}` |
| 226 | `"PDF generation failed"` | `{t('errorTitle')}` |
| 239 | `aria-label="Dismiss error"` | `aria-label={t('errorDismissAriaLabel')}` |
| 270 | `"Cancel"` | `{tCommon('cancel')}` |
| 294 | `"Generating..."` | `{t('generating')}` |
| 299 | `"Export PDF"` | `{t('exportButton')}` |

### 5.4 Updated Item Count Badge (Lines 175-182)

```tsx
<p className="text-sm text-[#717171]">
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    style={{ backgroundColor: '#F7F7F7', color: '#222222' }}
  >
    {t('itemCount', { count: itemCount })}
  </span>
</p>
```

### 5.5 Updated Error Section (Lines 226-243)

```tsx
{error && (
  <div className="mb-4 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#FEE2E2' }} role="alert">
    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} aria-hidden="true" />
    <div className="flex-1">
      <p className="text-sm font-medium" style={{ color: '#DC2626' }}>
        {t('errorTitle')}
      </p>
      <p className="text-sm mt-1" style={{ color: '#7F1D1D' }}>
        {error}
      </p>
    </div>
    {onClearError && (
      <button
        type="button"
        onClick={onClearError}
        className="p-1 rounded-full hover:bg-red-200 transition-colors"
        aria-label={t('errorDismissAriaLabel')}
      >
        <X className="w-4 h-4" style={{ color: '#DC2626' }} />
      </button>
    )}
  </div>
)}
```

### 5.6 Updated Export Button (Lines 288-302)

```tsx
<button type="button" onClick={handleExport} disabled={isGenerating} className={cn(/* ... */)}>
  {isGenerating ? (
    <>
      <Loader2 className={cn('w-4 h-4', !prefersReducedMotion && 'animate-spin')} aria-hidden="true" />
      <span>{t('generating')}</span>
    </>
  ) : (
    <>
      <FileDown className="w-4 h-4" aria-hidden="true" />
      <span>{t('exportButton')}</span>
    </>
  )}
</button>
```

### 5.7 Acceptance Criteria

- [ ] `useTranslations` hook imported and initialized
- [ ] All 9 hardcoded strings replaced
- [ ] Pluralization works for item count badge
- [ ] All aria-label attributes use translated strings
- [ ] Error messages display with translated title
- [ ] Loading state shows translated "Generating..." text
- [ ] Component maintains existing functionality

---

## Task 6: Update Test Files

**Files:**
- `/src/components/ItemCreationWorkflow/components/shared/__tests__/ConfirmExitDialog.test.tsx`
- `/src/components/ItemCreationWorkflow/components/shared/__tests__/RemoveItemDialog.test.tsx`
- `/src/components/ItemCreationWorkflow/components/shared/__tests__/EmptySessionDialog.test.tsx`
- `/src/components/ItemCreationWorkflow/components/shared/__tests__/PDFExportDialog.test.tsx`

**Estimated Effort:** 1 hour

### 6.1 Subtask: Create Translation Mock Utility

**Action:** Create a shared mock utility file:

**File:** `/src/components/ItemCreationWorkflow/components/shared/__tests__/test-utils.ts`

```typescript
/**
 * Test utilities for dialog component testing with translations
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/test-utils
 * @lastModified 2026-01-19
 */

import { vi } from 'vitest';

/**
 * Mock translations for workflow.dialogs namespace
 */
export const mockWorkflowDialogTranslations: Record<string, string | ((params: Record<string, unknown>) => string)> = {
  // confirmExit
  'confirmExit.title': 'Exit Workflow?',
  'confirmExit.messageDefault': 'Are you sure you want to exit the workflow?',
  'confirmExit.messageUnsaved': 'You have unsaved changes. Are you sure you want to exit?',
  'confirmExit.messageWithItems': (params) =>
    `You have created ${params.count} item${params.count !== 1 ? 's' : ''} in this session. Are you sure you want to exit?`,
  'confirmExit.messageUnsavedWithItems': (params) =>
    `You have unsaved changes and ${params.count} item${params.count !== 1 ? 's' : ''} in this session. Are you sure you want to exit?`,
  'confirmExit.confirmButton': 'Exit Workflow',

  // removeItem
  'removeItem.title': 'Remove Item?',
  'removeItem.message': (params) =>
    `Are you sure you want to remove "${params.itemName}"? This action cannot be undone.`,
  'removeItem.confirmButton': 'Remove',

  // emptySession
  'emptySession.title': 'No Items Added',
  'emptySession.message': 'No items added yet. Add items or exit session?',
  'emptySession.closeAriaLabel': 'Close dialog',
  'emptySession.addItemsButton': 'Add Items',
  'emptySession.exitSessionButton': 'Exit Session',

  // pdfExport
  'pdfExport.title': 'Export QR Codes as PDF',
  'pdfExport.itemCount': (params) => `${params.count} item${params.count !== 1 ? 's' : ''}`,
  'pdfExport.closeAriaLabel': 'Close dialog',
  'pdfExport.description': 'Configure PDF export settings for your QR codes and download them as a printable PDF document.',
  'pdfExport.errorTitle': 'PDF generation failed',
  'pdfExport.errorDismissAriaLabel': 'Dismiss error',
  'pdfExport.exportButton': 'Export PDF',
  'pdfExport.generating': 'Generating...',
};

export const mockCommonTranslations: Record<string, string> = {
  'cancel': 'Cancel',
  'save': 'Save',
  'delete': 'Delete',
  'close': 'Close',
};

/**
 * Creates a mock translation function for testing
 */
export function createMockTranslation(translations: Record<string, string | ((params: Record<string, unknown>) => string)>) {
  return (key: string, params?: Record<string, unknown>) => {
    const translation = translations[key];
    if (typeof translation === 'function') {
      return translation(params || {});
    }
    return translation || key;
  };
}

/**
 * Sets up next-intl mock for component tests
 */
export function setupTranslationMocks() {
  vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => {
      if (namespace.startsWith('workflow.dialogs')) {
        const subNamespace = namespace.replace('workflow.dialogs.', '');
        return (key: string, params?: Record<string, unknown>) => {
          const fullKey = `${subNamespace}.${key}`;
          return createMockTranslation(mockWorkflowDialogTranslations)(fullKey, params);
        };
      }
      if (namespace === 'common') {
        return createMockTranslation(mockCommonTranslations);
      }
      return (key: string) => key;
    },
  }));
}
```

### 6.2 Subtask: Update ConfirmExitDialog.test.tsx

**Action:** Add mock setup at the top of the file:

```typescript
/**
 * ConfirmExitDialog Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/ConfirmExitDialog.test
 * @lastModified 2026-01-19 (REQ-382 i18n Updates)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ConfirmExitDialog } from '../ConfirmExitDialog';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, string | ((p: Record<string, unknown>) => string)> = {
      'title': 'Exit Workflow?',
      'messageDefault': 'Are you sure you want to exit the workflow?',
      'messageUnsaved': 'You have unsaved changes. Are you sure you want to exit?',
      'messageWithItems': (p) => `You have created ${p.count} item${p.count !== 1 ? 's' : ''} in this session. Are you sure you want to exit?`,
      'messageUnsavedWithItems': (p) => `You have unsaved changes and ${p.count} item${p.count !== 1 ? 's' : ''} in this session. Are you sure you want to exit?`,
      'confirmButton': 'Exit Workflow',
      'cancel': 'Cancel',
    };
    return (key: string, params?: Record<string, unknown>) => {
      const t = translations[key];
      return typeof t === 'function' ? t(params || {}) : (t || key);
    };
  },
}));

// ... rest of tests remain the same since they test for the same English text ...
```

### 6.3 Subtask: Update Other Test Files Similarly

Apply the same mock pattern to:
- `RemoveItemDialog.test.tsx`
- `EmptySessionDialog.test.tsx`
- `PDFExportDialog.test.tsx`

### 6.4 Acceptance Criteria

- [ ] Mock utility file created at `__tests__/test-utils.ts`
- [ ] All 4 test files updated with translation mocks
- [ ] All existing tests pass after mock addition
- [ ] Tests still validate correct text rendering
- [ ] No console warnings during test runs

---

## Task 7: Generate Non-English Translations

**Files:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Estimated Effort:** 0.5 hours

### 7.1 Subtask: Add French Translations

**File:** `/messages/fr.json`

```json
{
  "workflow": {
    "dialogs": {
      "confirmExit": {
        "title": "Quitter le workflow ?",
        "messageDefault": "Êtes-vous sûr de vouloir quitter le workflow ?",
        "messageUnsaved": "Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?",
        "messageWithItems": "Vous avez créé {count, plural, one {# article} other {# articles}} dans cette session. Êtes-vous sûr de vouloir quitter ?",
        "messageUnsavedWithItems": "Vous avez des modifications non enregistrées et {count, plural, one {# article} other {# articles}} dans cette session. Êtes-vous sûr de vouloir quitter ?",
        "confirmButton": "Quitter le workflow"
      },
      "removeItem": {
        "title": "Supprimer l'article ?",
        "message": "Êtes-vous sûr de vouloir supprimer « {itemName} » ? Cette action est irréversible.",
        "confirmButton": "Supprimer"
      },
      "emptySession": {
        "title": "Aucun article ajouté",
        "message": "Aucun article ajouté. Ajouter des articles ou quitter la session ?",
        "closeAriaLabel": "Fermer la boîte de dialogue",
        "addItemsButton": "Ajouter des articles",
        "exitSessionButton": "Quitter la session"
      },
      "pdfExport": {
        "title": "Exporter les codes QR en PDF",
        "itemCount": "{count, plural, one {# article} other {# articles}}",
        "closeAriaLabel": "Fermer la boîte de dialogue",
        "description": "Configurez les paramètres d'exportation PDF pour vos codes QR et téléchargez-les en document PDF imprimable.",
        "errorTitle": "Échec de la génération du PDF",
        "errorDismissAriaLabel": "Ignorer l'erreur",
        "exportButton": "Exporter en PDF",
        "generating": "Génération en cours..."
      }
    }
  }
}
```

### 7.2 Subtask: Add Spanish Translations

**File:** `/messages/es.json`

```json
{
  "workflow": {
    "dialogs": {
      "confirmExit": {
        "title": "¿Salir del flujo de trabajo?",
        "messageDefault": "¿Estás seguro de que quieres salir del flujo de trabajo?",
        "messageUnsaved": "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?",
        "messageWithItems": "Has creado {count, plural, one {# artículo} other {# artículos}} en esta sesión. ¿Estás seguro de que quieres salir?",
        "messageUnsavedWithItems": "Tienes cambios sin guardar y {count, plural, one {# artículo} other {# artículos}} en esta sesión. ¿Estás seguro de que quieres salir?",
        "confirmButton": "Salir del flujo de trabajo"
      },
      "removeItem": {
        "title": "¿Eliminar artículo?",
        "message": "¿Estás seguro de que quieres eliminar «{itemName}»? Esta acción no se puede deshacer.",
        "confirmButton": "Eliminar"
      },
      "emptySession": {
        "title": "Sin artículos añadidos",
        "message": "Aún no hay artículos añadidos. ¿Añadir artículos o salir de la sesión?",
        "closeAriaLabel": "Cerrar diálogo",
        "addItemsButton": "Añadir artículos",
        "exitSessionButton": "Salir de la sesión"
      },
      "pdfExport": {
        "title": "Exportar códigos QR como PDF",
        "itemCount": "{count, plural, one {# artículo} other {# artículos}}",
        "closeAriaLabel": "Cerrar diálogo",
        "description": "Configura los ajustes de exportación de PDF para tus códigos QR y descárgalos como documento PDF imprimible.",
        "errorTitle": "Error en la generación del PDF",
        "errorDismissAriaLabel": "Descartar error",
        "exportButton": "Exportar PDF",
        "generating": "Generando..."
      }
    }
  }
}
```

### 7.3 Subtask: Add German Translations

**File:** `/messages/de.json`

```json
{
  "workflow": {
    "dialogs": {
      "confirmExit": {
        "title": "Workflow beenden?",
        "messageDefault": "Sind Sie sicher, dass Sie den Workflow beenden möchten?",
        "messageUnsaved": "Sie haben nicht gespeicherte Änderungen. Sind Sie sicher, dass Sie beenden möchten?",
        "messageWithItems": "Sie haben {count, plural, one {# Artikel} other {# Artikel}} in dieser Sitzung erstellt. Sind Sie sicher, dass Sie beenden möchten?",
        "messageUnsavedWithItems": "Sie haben nicht gespeicherte Änderungen und {count, plural, one {# Artikel} other {# Artikel}} in dieser Sitzung. Sind Sie sicher, dass Sie beenden möchten?",
        "confirmButton": "Workflow beenden"
      },
      "removeItem": {
        "title": "Artikel entfernen?",
        "message": "Sind Sie sicher, dass Sie „{itemName}" entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
        "confirmButton": "Entfernen"
      },
      "emptySession": {
        "title": "Keine Artikel hinzugefügt",
        "message": "Noch keine Artikel hinzugefügt. Artikel hinzufügen oder Sitzung beenden?",
        "closeAriaLabel": "Dialog schließen",
        "addItemsButton": "Artikel hinzufügen",
        "exitSessionButton": "Sitzung beenden"
      },
      "pdfExport": {
        "title": "QR-Codes als PDF exportieren",
        "itemCount": "{count, plural, one {# Artikel} other {# Artikel}}",
        "closeAriaLabel": "Dialog schließen",
        "description": "Konfigurieren Sie die PDF-Exporteinstellungen für Ihre QR-Codes und laden Sie sie als druckbares PDF-Dokument herunter.",
        "errorTitle": "PDF-Generierung fehlgeschlagen",
        "errorDismissAriaLabel": "Fehler verwerfen",
        "exportButton": "PDF exportieren",
        "generating": "Wird generiert..."
      }
    }
  }
}
```

### 7.4 Subtask: Add Dutch Translations

**File:** `/messages/nl.json`

```json
{
  "workflow": {
    "dialogs": {
      "confirmExit": {
        "title": "Workflow afsluiten?",
        "messageDefault": "Weet je zeker dat je de workflow wilt afsluiten?",
        "messageUnsaved": "Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt afsluiten?",
        "messageWithItems": "Je hebt {count, plural, one {# artikel} other {# artikelen}} aangemaakt in deze sessie. Weet je zeker dat je wilt afsluiten?",
        "messageUnsavedWithItems": "Je hebt niet-opgeslagen wijzigingen en {count, plural, one {# artikel} other {# artikelen}} in deze sessie. Weet je zeker dat je wilt afsluiten?",
        "confirmButton": "Workflow afsluiten"
      },
      "removeItem": {
        "title": "Artikel verwijderen?",
        "message": "Weet je zeker dat je '{itemName}' wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
        "confirmButton": "Verwijderen"
      },
      "emptySession": {
        "title": "Geen artikelen toegevoegd",
        "message": "Nog geen artikelen toegevoegd. Artikelen toevoegen of sessie afsluiten?",
        "closeAriaLabel": "Dialoog sluiten",
        "addItemsButton": "Artikelen toevoegen",
        "exitSessionButton": "Sessie afsluiten"
      },
      "pdfExport": {
        "title": "QR-codes exporteren als PDF",
        "itemCount": "{count, plural, one {# artikel} other {# artikelen}}",
        "closeAriaLabel": "Dialoog sluiten",
        "description": "Configureer de PDF-exportinstellingen voor je QR-codes en download ze als een afdrukbaar PDF-document.",
        "errorTitle": "PDF-generatie mislukt",
        "errorDismissAriaLabel": "Fout negeren",
        "exportButton": "PDF exporteren",
        "generating": "Genereren..."
      }
    }
  }
}
```

### 7.5 Subtask: Add Italian Translations

**File:** `/messages/it.json`

```json
{
  "workflow": {
    "dialogs": {
      "confirmExit": {
        "title": "Uscire dal workflow?",
        "messageDefault": "Sei sicuro di voler uscire dal workflow?",
        "messageUnsaved": "Hai modifiche non salvate. Sei sicuro di voler uscire?",
        "messageWithItems": "Hai creato {count, plural, one {# articolo} other {# articoli}} in questa sessione. Sei sicuro di voler uscire?",
        "messageUnsavedWithItems": "Hai modifiche non salvate e {count, plural, one {# articolo} other {# articoli}} in questa sessione. Sei sicuro di voler uscire?",
        "confirmButton": "Esci dal workflow"
      },
      "removeItem": {
        "title": "Rimuovere l'articolo?",
        "message": "Sei sicuro di voler rimuovere \"{itemName}\"? Questa azione non può essere annullata.",
        "confirmButton": "Rimuovi"
      },
      "emptySession": {
        "title": "Nessun articolo aggiunto",
        "message": "Nessun articolo aggiunto. Aggiungere articoli o uscire dalla sessione?",
        "closeAriaLabel": "Chiudi finestra di dialogo",
        "addItemsButton": "Aggiungi articoli",
        "exitSessionButton": "Esci dalla sessione"
      },
      "pdfExport": {
        "title": "Esporta codici QR come PDF",
        "itemCount": "{count, plural, one {# articolo} other {# articoli}}",
        "closeAriaLabel": "Chiudi finestra di dialogo",
        "description": "Configura le impostazioni di esportazione PDF per i tuoi codici QR e scaricali come documento PDF stampabile.",
        "errorTitle": "Generazione PDF non riuscita",
        "errorDismissAriaLabel": "Ignora errore",
        "exportButton": "Esporta PDF",
        "generating": "Generazione in corso..."
      }
    }
  }
}
```

### 7.6 Acceptance Criteria

- [ ] All 5 non-English language files updated
- [ ] All translation keys match English structure exactly
- [ ] ICU plural format maintained in all languages
- [ ] Variable placeholders ({itemName}, {count}) preserved
- [ ] JSON files pass lint validation
- [ ] No missing keys compared to English

---

## Task 8: Manual Testing & Validation

**Estimated Effort:** 1 hour

### 8.1 Subtask: Visual Testing in All Languages

**Test Matrix:**

| Dialog | EN | FR | ES | DE | NL | IT |
|--------|----|----|----|----|----|----|
| ConfirmExitDialog (default) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| ConfirmExitDialog (unsaved) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| ConfirmExitDialog (with items) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| ConfirmExitDialog (both) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| RemoveItemDialog | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| EmptySessionDialog | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| PDFExportDialog | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| PDFExportDialog (error) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| PDFExportDialog (generating) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### 8.2 Subtask: Layout Verification

**Check for each language:**
- [ ] No text overflow or truncation in dialog titles
- [ ] Button labels fit without wrapping or overflow
- [ ] Dialog body text displays correctly with proper line breaks
- [ ] Buttons maintain consistent sizing and alignment
- [ ] Modal remains centered and properly sized
- [ ] No layout shifts when switching languages

### 8.3 Subtask: Accessibility Testing

**For each dialog:**
- [ ] Screen reader announces dialog title correctly
- [ ] Screen reader reads dialog description correctly
- [ ] aria-label attributes are announced correctly
- [ ] Focus management works correctly
- [ ] Keyboard navigation (Tab, Escape, Enter) functions properly

### 8.4 Subtask: Dynamic Content Testing

**ConfirmExitDialog:**
- [ ] Verify "1 item" displays (singular)
- [ ] Verify "3 items" displays (plural)
- [ ] Verify unsaved changes message displays
- [ ] Verify combined message displays correctly

**RemoveItemDialog:**
- [ ] Verify item name displays correctly in message
- [ ] Verify long item names are truncated properly
- [ ] Verify quotes render correctly around item name

**PDFExportDialog:**
- [ ] Verify item count badge displays correctly
- [ ] Verify "1 item" vs "5 items" pluralization
- [ ] Verify generating state displays loading text

### 8.5 Acceptance Criteria

- [ ] All dialogs display correctly in all 6 languages
- [ ] No text overflow or truncation issues
- [ ] Pluralization works correctly in all languages
- [ ] Variable interpolation produces correct output
- [ ] No console warnings for missing translations
- [ ] All accessibility tests pass
- [ ] Layout is consistent across all languages

---

## Verification Checklist

### Pre-Implementation
- [ ] Epic 1 dependencies verified complete
- [ ] Translation file structure reviewed
- [ ] Reference implementation (LogoutButton) reviewed

### Implementation
- [ ] Task 1: Translation keys added to en.json
- [ ] Task 2: ConfirmExitDialog updated
- [ ] Task 3: RemoveItemDialog updated
- [ ] Task 4: EmptySessionDialog updated
- [ ] Task 5: PDFExportDialog updated
- [ ] Task 6: Test files updated
- [ ] Task 7: All 5 non-English translations added

### Post-Implementation
- [ ] All TypeScript types compile without errors
- [ ] All unit tests pass
- [ ] No console warnings for missing translation keys
- [ ] Visual testing complete in all 6 languages
- [ ] Accessibility testing complete
- [ ] Code review completed

---

## File Summary

### Files to Create
| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/test-utils.ts` | Shared test utilities for translation mocks |

### Files to Modify
| File Path | Changes |
|-----------|---------|
| `/messages/en.json` | Add `workflow.dialogs` namespace |
| `/messages/fr.json` | Add `workflow.dialogs` namespace (French) |
| `/messages/es.json` | Add `workflow.dialogs` namespace (Spanish) |
| `/messages/de.json` | Add `workflow.dialogs` namespace (German) |
| `/messages/nl.json` | Add `workflow.dialogs` namespace (Dutch) |
| `/messages/it.json` | Add `workflow.dialogs` namespace (Italian) |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Add i18n support |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | Add i18n support |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Add i18n support |
| `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | Add i18n support |
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/ConfirmExitDialog.test.tsx` | Add translation mocks |
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/RemoveItemDialog.test.tsx` | Add translation mocks |
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/EmptySessionDialog.test.tsx` | Add translation mocks |
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/PDFExportDialog.test.tsx` | Add translation mocks |

---

## References

- **Overview Document:** `/docs/REQ-382-update-all-dialog-components-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **Reference Implementation:** `/src/components/LogoutButton.tsx`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for REQ-382 - Update All Dialog Components in Item Creation Workflow for Internationalization*
