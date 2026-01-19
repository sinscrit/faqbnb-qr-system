# REQ-339: Extract Button Labels Across All Components - Detailed Task Breakdown
*Generated: 2026-01-19 14:30:00 UTC*
*Last Modified: 2026-01-19 14:30:00 UTC*

## Reference
- **Request**: REQ-339 (Extract Button Labels Across All Components)
- **Overview Document**: docs/REQ-339-extract-button-labels-across-all-components-overview.md
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement (Internationalization)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2H - Common & Shared Components
- **Task ID**: 2H.2
- **Size**: M
- **Priority**: FIRST - Foundation for all other sub-epics

---

## Summary

This task extracts all hardcoded button labels from components throughout the application and replaces them with translation function calls using `t()` from next-intl. The goal is to enable button text to display in the user's selected language.

---

## Dependencies

### Required Prerequisites
| Dependency | Status | Description |
|------------|--------|-------------|
| Task 2H.1 | Must be complete | Common namespace structure must exist in `/messages/*.json` |
| Epic 1 | Must be complete | next-intl package installed, IntlProvider configured |
| `useTranslations` hook | Available | Import from `next-intl` |
| `getTranslations` function | Available | Import from `next-intl/server` for server components |

### Translation Keys Required (from Task 2H.1)
The following keys must exist in `/messages/en.json` before this task begins:
- `common.save`, `common.cancel`, `common.delete`, `common.edit`, `common.confirm`
- `common.close`, `common.back`, `common.next`, `common.submit`, `common.create`
- `common.yes`, `common.no`, `common.reset`, `common.clear`, `common.view`
- `common.download`, `common.copy`, `common.share`

---

## Task Breakdown

### Task 2H.2.1: Shared Modal/Dialog Button Extraction (Priority 1)
**Estimated Effort**: 1 story point
**Files to Modify**: 15 files
**Description**: Update buttons in shared, reusable modal and dialog components

#### Subtask 2H.2.1.1: Update ConfirmationModal.tsx
**File**: `/src/components/ConfirmationModal.tsx`
**Changes**:
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook at component start: `const t = useTranslations('common');`
3. Replace default prop `confirmText = 'Confirm'` with `confirmText ?? t('confirm')`
4. Replace default prop `cancelText = 'Cancel'` with `cancelText ?? t('cancel')`

**Before**:
```tsx
interface Props {
  confirmText?: string;
  cancelText?: string;
}
function ConfirmationModal({ confirmText = 'Confirm', cancelText = 'Cancel' }: Props) {
  // ...
}
```

**After**:
```tsx
import { useTranslations } from 'next-intl';

function ConfirmationModal({ confirmText, cancelText }: Props) {
  const t = useTranslations('common');
  const confirmLabel = confirmText ?? t('confirm');
  const cancelLabel = cancelText ?? t('cancel');
  // ...
}
```

**Verification**:
- [ ] Build succeeds without TypeScript errors
- [ ] Modal displays translated button text
- [ ] Custom button text override still works when props are provided

---

#### Subtask 2H.2.1.2: Update ConfirmDeleteDialog.tsx
**File**: `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace hardcoded "Delete" / "Delete Items" with translation keys
3. Replace hardcoded "Cancel" with `t('common.cancel')`
4. Replace "Deleting..." loading state with translation key

**Hardcoded Strings to Replace**:
| Line (approx.) | Current Text | Translation Key |
|----------------|--------------|-----------------|
| 62 | "Delete Item" / "Delete Items" | `items.deleteItem` / `items.deleteItems` |
| 84-88 | "Delete" / "Delete X Items" | `common.delete` with count interpolation |
| 252 | "Cancel" | `common.cancel` |
| 271 | "Deleting..." | `common.status.deleting` |

**Note**: May need to add `items.deleteItems` key: `"Delete {count, plural, one {# Item} other {# Items}}"`

**Verification**:
- [ ] Delete dialog shows translated buttons
- [ ] Pluralization works correctly for bulk delete
- [ ] Loading state shows translated text

---

#### Subtask 2H.2.1.3: Update ConfirmExitDialog.tsx
**File**: `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" button label with `t('common.cancel')`
3. Replace "Exit" button label with `t('common.exit')` (may need to add key)
4. Replace "Stay" button label with `t('common.stay')` (may need to add key)

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "exit": "Exit",
    "stay": "Stay"
  }
}
```

**Verification**:
- [ ] Exit confirmation dialog shows translated buttons
- [ ] Both "Stay" and "Exit" options display correctly

---

#### Subtask 2H.2.1.4: Update RemoveItemDialog.tsx
**File**: `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" with `t('common.cancel')`
3. Replace "Remove" with `t('common.remove')` (may need to add key)

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "remove": "Remove"
  }
}
```

**Verification**:
- [ ] Remove dialog shows translated buttons

---

#### Subtask 2H.2.1.5: Update EmptySessionDialog.tsx
**File**: `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "OK" button with `t('common.ok')` (may need to add key)
3. Replace "Cancel" button with `t('common.cancel')`

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "ok": "OK"
  }
}
```

**Verification**:
- [ ] Empty session dialog shows translated buttons

---

#### Subtask 2H.2.1.6: Update PDFExportDialog.tsx
**File**: `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" with `t('common.cancel')`
3. Replace "Export" with `t('common.export')` (may need to add key)
4. Replace "Download" with `t('common.download')`

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "export": "Export"
  }
}
```

**Verification**:
- [ ] PDF export dialog shows translated buttons

---

#### Subtask 2H.2.1.7: Update ItemViewModal.tsx
**File**: `/src/components/dashboard/ItemViewModal.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Edit Item" button with `t('items.editItem')`
3. Replace "Delete" button with `t('common.delete')`
4. Replace "Close" button with `t('common.close')`

**Verification**:
- [ ] Item view modal shows translated action buttons

---

#### Subtask 2H.2.1.8: Update DeleteItemDialog.tsx
**File**: `/src/components/dashboard/DeleteItemDialog.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" with `t('common.cancel')`
3. Replace "Delete" with `t('common.delete')`
4. Replace "Deleting..." with `t('common.status.deleting')`

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "status": {
      "deleting": "Deleting..."
    }
  }
}
```

**Verification**:
- [ ] Delete item dialog shows translated buttons and loading state

---

#### Subtask 2H.2.1.9: Update PropertyEditModal.tsx
**File**: `/src/components/SimpleDashboard/PropertyEditModal.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" with `t('common.cancel')`
3. Replace "Save Changes" with `t('common.saveChanges')` (may need to add key)
4. Replace "Saving..." with `t('common.status.saving')`

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "saveChanges": "Save Changes",
    "status": {
      "saving": "Saving..."
    }
  }
}
```

**Verification**:
- [ ] Property edit modal shows translated buttons

---

#### Subtask 2H.2.1.10: Update AddPropertyModal.tsx
**File**: `/src/components/SimpleDashboard/AddPropertyModal.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" with `t('common.cancel')`
3. Replace "Create" with `t('common.create')`
4. Replace "Creating..." with `t('common.status.creating')`

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "status": {
      "creating": "Creating..."
    }
  }
}
```

**Verification**:
- [ ] Add property modal shows translated buttons

---

#### Subtask 2H.2.1.11: Update AddContentModal.tsx
**File**: `/src/components/InstructionEditor/components/AddContentModal.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" with `t('common.cancel')`
3. Replace "Add" with `t('common.add')` (may need to add key)

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "add": "Add"
  }
}
```

**Verification**:
- [ ] Add content modal shows translated buttons

---

#### Subtask 2H.2.1.12: Update BulkTagDialog.tsx
**File**: `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" with `t('common.cancel')`
3. Replace "Apply" with `t('common.apply')` (may need to add key)

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "apply": "Apply"
  }
}
```

**Verification**:
- [ ] Bulk tag dialog shows translated buttons

---

#### Subtask 2H.2.1.13: Update BulkMoveDialog.tsx
**File**: `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" with `t('common.cancel')`
3. Replace "Move" with `t('common.move')` (may need to add key)

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "move": "Move"
  }
}
```

**Verification**:
- [ ] Bulk move dialog shows translated buttons

---

#### Subtask 2H.2.1.14: Update DeleteMediaConfirmDialog.tsx
**File**: `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" with `t('common.cancel')`
3. Replace "Delete" with `t('common.delete')`

**Verification**:
- [ ] Delete media dialog shows translated buttons

---

#### Subtask 2H.2.1.15: Update AssetRemoveConfirmDialog.tsx
**File**: `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Cancel" with `t('common.cancel')`
3. Replace "Remove" with `t('common.remove')`

**Verification**:
- [ ] Asset remove dialog shows translated buttons

---

### Task 2H.2.2: Dashboard & Navigation Button Extraction (Priority 2)
**Estimated Effort**: 1 story point
**Files to Modify**: 5 files
**Description**: Update buttons in dashboard and navigation components

#### Subtask 2H.2.2.1: Update ActionButtons.tsx
**File**: `/src/components/SimpleDashboard/ActionButtons.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "New QR Code Item" with `t('items.createNew')`
3. Replace "View QR Code Items" with translation key
4. Replace "Print QR Code" with `t('items.printQrCode')`
5. Update aria-labels to use translations

**Keys to Add to en.json** (if not present):
```json
{
  "items": {
    "viewQrCodeItems": "View QR Code Items"
  }
}
```

**Verification**:
- [ ] Dashboard action buttons show translated text
- [ ] Aria-labels are translated for accessibility

---

#### Subtask 2H.2.2.2: Update DashboardLayout.tsx
**File**: `/src/components/DashboardLayout.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace navigation button labels with translation keys from `dashboard` namespace
3. Replace any action buttons with common translations

**Verification**:
- [ ] Dashboard layout navigation shows translated labels

---

#### Subtask 2H.2.2.3: Update RoleBasedNavigation.tsx
**File**: `/src/components/RoleBasedNavigation.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace navigation labels with translation keys

**Verification**:
- [ ] Role-based navigation shows translated labels

---

#### Subtask 2H.2.2.4: Update AuthGuard.tsx
**File**: `/src/components/AuthGuard.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace auth-related button labels with translations

**Verification**:
- [ ] Auth guard buttons show translated text

---

#### Subtask 2H.2.2.5: Update LogoutButton.tsx
**File**: `/src/components/LogoutButton.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Sign Out" with `t('auth.signOut')`
3. Replace loading state "Signing out..." with translation key

**Keys to Add to en.json** (if not present):
```json
{
  "auth": {
    "signingOut": "Signing out..."
  }
}
```

**Verification**:
- [ ] Logout button shows translated text
- [ ] Loading state shows translated text

---

### Task 2H.2.3: Property Management Button Extraction (Priority 3)
**Estimated Effort**: 0.5 story points
**Files to Modify**: 1-2 files
**Description**: Update buttons in property management components

#### Subtask 2H.2.3.1: Update PropertyForm.tsx
**File**: `/src/components/PropertyForm.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Save" button with `t('common.save')`
3. Replace "Cancel" button with `t('common.cancel')`
4. Replace any loading states with translation keys

**Verification**:
- [ ] Property form shows translated buttons

---

### Task 2H.2.4: Item Management Button Extraction (Priority 4)
**Estimated Effort**: 1 story point
**Files to Modify**: 8 files
**Description**: Update buttons in item management components

#### Subtask 2H.2.4.1: Update ItemsManagement.tsx
**File**: `/src/components/ItemsManagement.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace all hardcoded button labels
3. Replace "Delete Item", "Cancel", "Delete" buttons

**Verification**:
- [ ] Item management shows translated buttons

---

#### Subtask 2H.2.4.2: Update ItemRow.tsx
**File**: `/src/components/ItemManager/components/ItemRow.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace action button labels

**Verification**:
- [ ] Item row actions show translated text

---

#### Subtask 2H.2.4.3: Update BulkActionsBar.tsx
**File**: `/src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace bulk action button labels

**Verification**:
- [ ] Bulk actions bar shows translated buttons

---

#### Subtask 2H.2.4.4: Update ItemPreviewModal.tsx
**File**: `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace modal button labels

**Verification**:
- [ ] Item preview modal shows translated buttons

---

### Task 2H.2.5: Item Creation Workflow Button Extraction (Priority 5)
**Estimated Effort**: 1 story point
**Files to Modify**: 4-6 files
**Description**: Update buttons in item creation workflow components

#### Subtask 2H.2.5.1: Update ItemCreationWorkflow.tsx
**File**: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace workflow navigation buttons

**Verification**:
- [ ] Main workflow component shows translated buttons

---

#### Subtask 2H.2.5.2: Update WorkflowHeader.tsx
**File**: `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Back" with `t('common.back')`
3. Replace "Exit" with `t('common.exit')`

**Verification**:
- [ ] Workflow header shows translated buttons

---

#### Subtask 2H.2.5.3: Update SessionSummaryStep.tsx
**File**: `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace action button labels ("Done", "Create Another", etc.)

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "done": "Done",
    "createAnother": "Create Another"
  }
}
```

**Verification**:
- [ ] Session summary step shows translated buttons

---

#### Subtask 2H.2.5.4: Update StepNavigation.tsx
**File**: `/src/components/ItemCapture/components/shared/StepNavigation.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Back" with `t('common.back')`
3. Replace "Next" with `t('common.next')`
4. Replace "Done" with `t('common.done')`

**Verification**:
- [ ] Step navigation shows translated buttons

---

### Task 2H.2.6: Editor & Content Button Extraction (Priority 6)
**Estimated Effort**: 0.5 story points
**Files to Modify**: 2-3 files
**Description**: Update buttons in editor and content management components

#### Subtask 2H.2.6.1: Update InstructionEditor.tsx
**File**: `/src/components/InstructionEditor/InstructionEditor.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace editor action buttons

**Verification**:
- [ ] Instruction editor shows translated buttons

---

#### Subtask 2H.2.6.2: Update ContentEditSection.tsx
**File**: `/src/components/InstructionEditor/components/ContentEditSection.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace content edit buttons

**Verification**:
- [ ] Content edit section shows translated buttons

---

### Task 2H.2.7: Miscellaneous Button Extraction (Priority 7)
**Estimated Effort**: 1 story point
**Files to Modify**: 15+ files
**Description**: Update buttons in remaining miscellaneous components

#### Subtask 2H.2.7.1: Update ItemDisplay.tsx
**File**: `/src/components/ItemDisplay.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Back" button with `t('common.back')`

**Verification**:
- [ ] Item display shows translated button

---

#### Subtask 2H.2.7.2: Update ItemSelectionList.tsx
**File**: `/src/components/ItemSelectionList.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace button labels

**Verification**:
- [ ] Item selection list shows translated buttons

---

#### Subtask 2H.2.7.3: Update QRCodePrintPreview.tsx
**File**: `/src/components/QRCodePrintPreview.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Print" with `t('common.print')` (may need to add key)
3. Replace "Download" with `t('common.download')`
4. Replace "Close" with `t('common.close')`

**Keys to Add to en.json** (if not present):
```json
{
  "common": {
    "print": "Print"
  }
}
```

**Verification**:
- [ ] QR code print preview shows translated buttons

---

#### Subtask 2H.2.7.4: Update QRCodePrintManager.tsx
**File**: `/src/components/QRCodePrintManager.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace all print-related button labels

**Verification**:
- [ ] QR code print manager shows translated buttons

---

#### Subtask 2H.2.7.5: Update AccountSelector.tsx
**File**: `/src/components/AccountSelector.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace selection button labels

**Verification**:
- [ ] Account selector shows translated buttons

---

#### Subtask 2H.2.7.6: Update EmailPopup.tsx
**File**: `/src/components/EmailPopup.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Close" with `t('common.close')`
3. Replace "Submit" with `t('common.submit')`
4. Replace "Cancel" with `t('common.cancel')`

**Verification**:
- [ ] Email popup shows translated buttons

---

#### Subtask 2H.2.7.7: Update TimeRangeSelector.tsx
**File**: `/src/components/TimeRangeSelector.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace selection button labels

**Verification**:
- [ ] Time range selector shows translated buttons

---

#### Subtask 2H.2.7.8: Update AnalyticsExport.tsx
**File**: `/src/components/AnalyticsExport.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace "Export" with `t('common.export')`
3. Replace "Download" with `t('common.download')`

**Verification**:
- [ ] Analytics export shows translated buttons

---

#### Subtask 2H.2.7.9: Update PDFExportOptions.tsx
**File**: `/src/components/PDFExportOptions.tsx`
**Changes**:
1. Add `useTranslations` import
2. Replace export option buttons

**Verification**:
- [ ] PDF export options shows translated buttons

---

#### Subtask 2H.2.7.10: Update Analytics Components
**Files**:
- `/src/components/AnalyticsOverviewCards.tsx`
- `/src/components/AnalyticsManagement.tsx`
- `/src/components/UserDashboard.tsx`
- `/src/components/UserAnalyticsTable.tsx`
- `/src/components/ReactionButtons.tsx`
- `/src/components/ReactionAnalytics.tsx`

**Changes**:
1. Add `useTranslations` import to each
2. Replace button labels with translation keys

**Verification**:
- [ ] All analytics components show translated buttons

---

### Task 2H.2.8: Translation Key Additions
**Estimated Effort**: 0.5 story points
**Files to Modify**: 6 files (all language files)
**Description**: Add any missing translation keys identified during button extraction

#### Subtask 2H.2.8.1: Update /messages/en.json
**Changes**: Add any missing keys identified during extraction:
```json
{
  "common": {
    "add": "Add",
    "apply": "Apply",
    "continue": "Continue",
    "createAnother": "Create Another",
    "discard": "Discard",
    "done": "Done",
    "exit": "Exit",
    "export": "Export",
    "move": "Move",
    "ok": "OK",
    "print": "Print",
    "refresh": "Refresh",
    "remove": "Remove",
    "retry": "Retry",
    "saveChanges": "Save Changes",
    "showLess": "Show Less",
    "showMore": "Show More",
    "skip": "Skip",
    "stay": "Stay",
    "update": "Update",
    "viewAll": "View All",
    "status": {
      "canceling": "Canceling...",
      "creating": "Creating...",
      "deleting": "Deleting...",
      "loading": "Loading...",
      "processing": "Processing...",
      "saving": "Saving...",
      "submitting": "Submitting...",
      "updating": "Updating..."
    }
  }
}
```

**Verification**:
- [ ] All required keys exist in en.json

---

#### Subtask 2H.2.8.2: Update Other Language Files
**Files**:
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Changes**: Add translations for all new keys added to en.json

**French translations**:
```json
{
  "common": {
    "add": "Ajouter",
    "apply": "Appliquer",
    "continue": "Continuer",
    "done": "Termine",
    "exit": "Quitter",
    "export": "Exporter",
    "move": "Deplacer",
    "ok": "OK",
    "print": "Imprimer",
    "remove": "Supprimer",
    "saveChanges": "Enregistrer les modifications",
    "stay": "Rester",
    "status": {
      "deleting": "Suppression...",
      "saving": "Enregistrement..."
    }
  }
}
```

**Verification**:
- [ ] All keys exist in all 6 language files
- [ ] No duplicate keys

---

### Task 2H.2.9: Final Verification & Testing
**Estimated Effort**: 0.5 story points
**Description**: Comprehensive testing and verification of all button translations

#### Subtask 2H.2.9.1: Build Verification
**Steps**:
1. Run `npm run build` to verify no TypeScript errors
2. Check for any missing translation warnings
3. Verify no console errors related to translations

**Verification**:
- [ ] Application builds without TypeScript errors
- [ ] No missing translation warnings in browser console

---

#### Subtask 2H.2.9.2: Functional Verification
**Steps**:
1. Test all modified components in browser
2. Verify button labels display correctly in English
3. Verify button click handlers still function
4. Verify disabled states work correctly
5. Verify loading states display translated text

**Verification**:
- [ ] All buttons display correct text in English
- [ ] All button click handlers work correctly
- [ ] Button disabled states work correctly
- [ ] Loading states display translated text

---

#### Subtask 2H.2.9.3: Language Switching Verification
**Steps**:
1. Switch language to each supported language (fr, es, de, nl, it)
2. Verify all button labels update to selected language
3. Check for any text overflow or layout issues

**Verification**:
- [ ] Language switching updates all button labels
- [ ] Button text displays without truncation
- [ ] Button layouts remain consistent across languages
- [ ] No text overflow issues with longer translations

---

## New Translation Keys Summary

The following keys need to be added to `/messages/en.json` (and corresponding translations in other language files):

```json
{
  "common": {
    "add": "Add",
    "apply": "Apply",
    "continue": "Continue",
    "createAnother": "Create Another",
    "discard": "Discard",
    "done": "Done",
    "exit": "Exit",
    "export": "Export",
    "move": "Move",
    "ok": "OK",
    "print": "Print",
    "refresh": "Refresh",
    "remove": "Remove",
    "retry": "Retry",
    "saveChanges": "Save Changes",
    "showLess": "Show Less",
    "showMore": "Show More",
    "skip": "Skip",
    "stay": "Stay",
    "update": "Update",
    "viewAll": "View All",
    "status": {
      "canceling": "Canceling...",
      "creating": "Creating...",
      "deleting": "Deleting...",
      "loading": "Loading...",
      "processing": "Processing...",
      "saving": "Saving...",
      "submitting": "Submitting...",
      "updating": "Updating..."
    }
  },
  "auth": {
    "signingOut": "Signing out..."
  },
  "items": {
    "viewQrCodeItems": "View QR Code Items",
    "deleteItems": "Delete {count, plural, one {# Item} other {# Items}}"
  }
}
```

---

## Success Criteria

### Code Changes Verification
- [ ] All identified components have `useTranslations` import added
- [ ] No hardcoded English button labels remain in modified components
- [ ] All button labels use `t()` function with appropriate namespace
- [ ] Loading state labels are also translated
- [ ] Aria-labels on buttons are translated for accessibility
- [ ] Default prop values for button text use translations

### Translation File Verification
- [ ] All required keys exist in `/messages/en.json`
- [ ] All required keys exist in all 5 non-English language files
- [ ] No duplicate keys exist
- [ ] Key naming follows convention `{namespace}.{element}`

### Functional Verification
- [ ] Application builds without TypeScript errors
- [ ] No missing translation warnings in browser console
- [ ] All buttons display correct text in English
- [ ] Language switching updates all button labels
- [ ] Button click handlers still function correctly
- [ ] Button disabled states work correctly
- [ ] Loading states display translated text

### Visual Verification
- [ ] Button text displays without truncation
- [ ] Button layouts remain consistent across languages
- [ ] No text overflow issues with longer translations

---

## Estimated Total Effort

| Task | Story Points |
|------|--------------|
| 2H.2.1: Shared Modal/Dialog Buttons | 1 |
| 2H.2.2: Dashboard & Navigation Buttons | 1 |
| 2H.2.3: Property Management Buttons | 0.5 |
| 2H.2.4: Item Management Buttons | 1 |
| 2H.2.5: Item Creation Workflow Buttons | 1 |
| 2H.2.6: Editor & Content Buttons | 0.5 |
| 2H.2.7: Miscellaneous Buttons | 1 |
| 2H.2.8: Translation Key Additions | 0.5 |
| 2H.2.9: Final Verification & Testing | 0.5 |
| **Total** | **7 story points** |

---

## Risk Assessment

- **Risk Level**: Low to Medium
- **Rationale**:
  - Many files to modify but changes are mechanical and repetitive
  - Pattern is well-established in next-intl documentation
  - No logic changes to button functionality
  - Changes are localized to text rendering only
- **Mitigation**:
  - Test each component after modification
  - Run full build to catch TypeScript errors
  - Verify translations load correctly in browser
  - Review in all supported languages for text fit

---

## Notes

### Component Reusability Consideration
The `ConfirmationModal` component accepts `confirmText` and `cancelText` props, allowing parent components to override button labels. After this task:
- Default values will be translated
- Parent components can still pass custom labels (which should also be translation keys)
- When passing custom labels, pass the translated string: `confirmText={t('custom.key')}`

### Server Components
If any of the listed components are server components, use `getTranslations` from `next-intl/server` instead of `useTranslations`:
```tsx
import { getTranslations } from 'next-intl/server';

async function ServerComponent() {
  const t = await getTranslations('common');
  return <button>{t('save')}</button>;
}
```

### Testing Strategy
- Unit tests should mock `useTranslations` to return predictable values
- Integration tests should verify actual translations load
- Visual regression tests can catch layout issues with different languages

---

*Document generated for FAQBNB Localization Epic 2 - Task 2H.2*
