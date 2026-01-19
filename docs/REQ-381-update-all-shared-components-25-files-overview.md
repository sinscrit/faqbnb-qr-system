# Implementation Overview: REQ-381 - Update All Shared Components in Item Creation Workflow for Internationalization

**Document Created:** 2026-01-19 16:45:00 UTC
**Last Modified:** 2026-01-19 16:45:00 UTC
**Request Reference:** REQ-381 (docs/gen_requests_epic2.md)
**Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.11
**Size:** XL (Extra Large)
**Priority:** P2 - Medium (part of larger workflow translation)

---

## 1. Executive Summary

This task involves updating all 25+ shared components within the Item Creation Workflow (`/src/components/ItemCreationWorkflow/components/shared/`) to support internationalization using next-intl. These components provide reusable UI elements used across all workflow steps including dialogs, cards, editors, and status indicators. Each component must have its hardcoded English strings replaced with translation function calls.

**Key Objectives:**
- Extract ~150 hardcoded UI strings from 25+ shared components
- Add `useTranslations` hook imports to all components
- Replace hardcoded text with translation function calls using `workflow.shared.*` namespace
- Ensure all aria-labels, tooltips, placeholders, and button text are translated
- Maintain component functionality and accessibility compliance

---

## 2. Current State Analysis

### 2.1 Shared Component Inventory (25 Files)

Based on codebase analysis, the following components require updates:

| Component | Path | Estimated Strings | String Categories |
|-----------|------|-------------------|-------------------|
| WorkflowHeader.tsx | `.../shared/` | ~4 | aria-labels, step indicator |
| ConfirmExitDialog.tsx | `.../shared/` | ~8 | dialog title, messages, buttons |
| ContentPieceCard.tsx | `.../shared/` | ~12 | type labels, aria-labels, actions |
| ContentPreview.tsx | `.../shared/` | ~5 | previews, empty states |
| DuplicateNameWarning.tsx | `.../shared/` | ~4 | warning messages |
| EmptySessionDialog.tsx | `.../shared/` | ~6 | dialog title, description, buttons |
| ItemContextDisplay.tsx | `.../shared/` | ~3 | labels, formatting |
| ItemNameEditor.tsx | `.../shared/` | ~5 | label, placeholder, hint |
| ItemTypeCard.tsx | `.../shared/` | ~2 | labels, aria-labels |
| NetworkErrorIndicator.tsx | `.../shared/` | ~6 | error messages, buttons |
| PDFExportDialog.tsx | `.../shared/` | ~15 | dialog options, labels, buttons |
| PrintOptionsPanel.tsx | `.../shared/` | ~30 | scope options, buttons, status messages |
| QRGenerationProgress.tsx | `.../shared/` | ~10 | progress messages, status labels |
| RemoveItemDialog.tsx | `.../shared/` | ~6 | dialog title, message, buttons |
| RoomCard.tsx | `.../shared/` | ~2 | labels, aria-labels |
| SessionItemCard.tsx | `.../shared/` | ~8 | labels, badges, status |
| SessionProgressBar.tsx | `.../shared/` | ~3 | progress labels |
| SessionRecoveryBanner.tsx | `.../shared/` | ~8 | messages, buttons |
| SortableContentPieceCard.tsx | `.../shared/` | ~3 | drag handle aria-label |
| SuggestionButton.tsx | `.../shared/` | ~2 | aria-labels |
| TagsEditor.tsx | `.../shared/` | ~5 | labels, button text, aria-labels |
| TruncatedText.tsx | `.../shared/` | ~2 | show more/less |
| CameraPermissionFallback.tsx | `.../shared/` | ~6 | permission messages, buttons |

**Total Estimated Strings:** ~150

### 2.2 String Categories Found

1. **Dialog Content:**
   - Titles: "Exit Workflow?", "No Items Added", "Remove Item?"
   - Descriptions: Context-dependent messages with variable interpolation
   - Button labels: "Cancel", "Exit Workflow", "Add Items", "Continue Session"

2. **Labels and Badges:**
   - Content type labels: "Video", "Photo", "PDF", "Text", "Link"
   - Status badges: "New", "Generating", "Completed", "Failed"
   - Count displays: "{count} / {max}", "{count} items"

3. **Aria Labels (Accessibility):**
   - "Go back to previous step"
   - "Exit workflow"
   - "Drag to reorder"
   - "Remove content"
   - "Retake content"

4. **Form Elements:**
   - Labels: "Item Name", "Add Tag"
   - Placeholders: "Enter item name", "Search rooms..."
   - Hints: "This name will appear on the QR code label"

5. **Status and Progress Messages:**
   - "Generating QR Codes..."
   - "Your previous session has been restored"
   - "Preview unavailable"

6. **Dynamic Content with Variables:**
   - "Step {current} of {total}"
   - "{count} items selected for printing"
   - "You have {count} item(s) in this session"

---

## 3. Technical Approach

### 3.1 Translation Namespace Structure

Following the Epic 2 plan, translations will use the `workflow.shared` namespace:

```json
{
  "workflow": {
    "shared": {
      "header": {
        "stepIndicator": "Step {current} of {total}",
        "backButton": "Go back to previous step",
        "exitButton": "Exit workflow"
      },
      "dialogs": {
        "confirmExit": {
          "title": "Exit Workflow?",
          "messageWithUnsavedAndItems": "You have unsaved changes and {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
          "messageWithUnsaved": "You have unsaved changes. Are you sure you want to exit?",
          "messageWithItems": "You have created {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
          "messageDefault": "Are you sure you want to exit the workflow?",
          "cancelButton": "Cancel",
          "exitButton": "Exit Workflow"
        },
        "emptySession": {
          "title": "No Items Added",
          "description": "No items added yet. Add items or exit session?",
          "addItemsButton": "Add Items",
          "exitSessionButton": "Exit Session",
          "closeButton": "Close dialog"
        },
        "removeItem": {
          "title": "Remove Item?",
          "message": "Are you sure you want to remove this item from the session?",
          "cancelButton": "Cancel",
          "removeButton": "Remove"
        }
      },
      "content": {
        "types": {
          "video": "Video",
          "photo": "Photo",
          "pdf": "PDF",
          "text": "Text",
          "url": "Link"
        },
        "pageCount": "{count} {count, plural, one {page} other {pages}}",
        "photoAlt": "Photo content",
        "retakeButton": "Retake content",
        "removeButton": "Remove content",
        "dragHandle": "Drag to reorder"
      },
      "itemName": {
        "label": "Item Name",
        "placeholder": "Enter item name",
        "hint": "This name will appear on the QR code label"
      },
      "tags": {
        "addButton": "Add Tag",
        "removeAriaLabel": "Remove {tag} tag",
        "availableLabel": "Available tags"
      },
      "session": {
        "recovery": {
          "title": "Your previous session has been restored",
          "itemCount": "{count} {count, plural, one {item} other {items}}",
          "needsReupload": "{count} {count, plural, one {piece needs} other {pieces need}} re-upload",
          "continueButton": "Continue Session",
          "startFreshButton": "Start Fresh",
          "dismissButton": "Dismiss notification"
        },
        "progress": {
          "itemsSelected": "{count} items selected for printing"
        }
      },
      "network": {
        "previewUnavailable": "Preview unavailable",
        "errorMessage": "Unable to load preview due to network connectivity issues.",
        "retryButton": "Try Again",
        "retrying": "Retrying...",
        "proceedButton": "Proceed Without Preview"
      },
      "qrGeneration": {
        "title": "Generating QR Codes",
        "generatingPdf": "Generating PDF...",
        "processing": "Processing..."
      },
      "print": {
        "heading": "Which items would you like to print?",
        "scopes": {
          "all": {
            "title": "All Items",
            "description": "Include new and existing items"
          },
          "newOnly": {
            "title": "New Items Only",
            "description": "Only items created in this session"
          },
          "selected": {
            "title": "Select Items",
            "description": "Choose specific items to print"
          }
        },
        "selectAll": "Select All",
        "deselectAll": "Deselect All",
        "selectedCount": "({selected} of {total} selected)",
        "newBadge": "New",
        "generatePdfButton": "Generate PDF",
        "printDirectButton": "Print Directly",
        "doneForNowButton": "Done for Now",
        "errorRetryHint": "Please try again or skip for now."
      }
    }
  }
}
```

### 3.2 Component Update Pattern

Each component will follow this standard pattern:

```typescript
// Before
function EmptySessionDialog({ ... }: EmptySessionDialogProps) {
  return (
    <h2>No Items Added</h2>
    <p>No items added yet. Add items or exit session?</p>
    <button>Add Items</button>
  );
}

// After
import { useTranslations } from 'next-intl';

function EmptySessionDialog({ ... }: EmptySessionDialogProps) {
  const t = useTranslations('workflow.shared.dialogs.emptySession');

  return (
    <h2>{t('title')}</h2>
    <p>{t('description')}</p>
    <button>{t('addItemsButton')}</button>
  );
}
```

### 3.3 Handling Dynamic Content

For strings with variables and pluralization:

```typescript
// Before
<p>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>

// After (using ICU format)
<p>{t('itemCount', { count: itemCount })}</p>
// Translation: "{count} {count, plural, one {item} other {items}}"
```

### 3.4 Accessibility Labels

All aria-labels must be translated:

```typescript
// Before
<button aria-label="Go back to previous step">

// After
<button aria-label={t('backButton')}>
```

---

## 4. Implementation Tasks

### Task Breakdown

| Task | Description | Files | Priority |
|------|-------------|-------|----------|
| 4.1 | Create workflow.shared namespace in en.json | messages/en.json | High |
| 4.2 | Update WorkflowHeader.tsx | 1 file | High |
| 4.3 | Update ConfirmExitDialog.tsx | 1 file | High |
| 4.4 | Update EmptySessionDialog.tsx | 1 file | High |
| 4.5 | Update RemoveItemDialog.tsx | 1 file | High |
| 4.6 | Update ContentPieceCard.tsx | 1 file | High |
| 4.7 | Update SortableContentPieceCard.tsx | 1 file | Medium |
| 4.8 | Update ContentPreview.tsx | 1 file | Medium |
| 4.9 | Update ItemNameEditor.tsx | 1 file | High |
| 4.10 | Update TagsEditor.tsx | 1 file | High |
| 4.11 | Update SessionRecoveryBanner.tsx | 1 file | Medium |
| 4.12 | Update SessionProgressBar.tsx | 1 file | Medium |
| 4.13 | Update SessionItemCard.tsx | 1 file | Medium |
| 4.14 | Update NetworkErrorIndicator.tsx | 1 file | High |
| 4.15 | Update CameraPermissionFallback.tsx | 1 file | High |
| 4.16 | Update PrintOptionsPanel.tsx (largest) | 1 file | High |
| 4.17 | Update PDFExportDialog.tsx | 1 file | High |
| 4.18 | Update QRGenerationProgress.tsx | 1 file | High |
| 4.19 | Update ItemTypeCard.tsx | 1 file | Medium |
| 4.20 | Update RoomCard.tsx | 1 file | Medium |
| 4.21 | Update SuggestionButton.tsx | 1 file | Low |
| 4.22 | Update TruncatedText.tsx | 1 file | Low |
| 4.23 | Update ItemContextDisplay.tsx | 1 file | Medium |
| 4.24 | Update DuplicateNameWarning.tsx | 1 file | Medium |
| 4.25 | Generate translations for 5 non-English languages | 5 files | High |
| 4.26 | Verify all components render correctly | All | High |

---

## 5. Authorized Files and Functions for Modification

### 5.1 Translation Files

| File | Modification Type | Scope |
|------|------------------|-------|
| `/messages/en.json` | ADD | Add `workflow.shared` namespace with ~150 keys |
| `/messages/fr.json` | ADD | Add French translations for workflow.shared |
| `/messages/es.json` | ADD | Add Spanish translations for workflow.shared |
| `/messages/de.json` | ADD | Add German translations for workflow.shared |
| `/messages/nl.json` | ADD | Add Dutch translations for workflow.shared |
| `/messages/it.json` | ADD | Add Italian translations for workflow.shared |

### 5.2 Shared Components (25 Files)

All files in `/src/components/ItemCreationWorkflow/components/shared/`:

| File | Functions to Modify | Modification Type |
|------|---------------------|-------------------|
| `WorkflowHeader.tsx` | `WorkflowHeader` | ADD useTranslations, REPLACE strings |
| `ConfirmExitDialog.tsx` | `ConfirmExitDialog`, `getExitMessage` | ADD useTranslations, REPLACE strings |
| `ContentPieceCard.tsx` | `ContentPieceCard`, `TYPE_CONFIG` | ADD useTranslations, REPLACE labels |
| `ContentPreview.tsx` | `ContentPreview` | ADD useTranslations, REPLACE strings |
| `DuplicateNameWarning.tsx` | `DuplicateNameWarning` | ADD useTranslations, REPLACE strings |
| `EmptySessionDialog.tsx` | `EmptySessionDialog` | ADD useTranslations, REPLACE strings |
| `ItemContextDisplay.tsx` | `ItemContextDisplay` | ADD useTranslations, REPLACE strings |
| `ItemNameEditor.tsx` | `ItemNameEditor` | ADD useTranslations, REPLACE strings |
| `ItemTypeCard.tsx` | `ItemTypeCard` | ADD useTranslations, REPLACE strings |
| `NetworkErrorIndicator.tsx` | `NetworkErrorIndicator` | ADD useTranslations, REPLACE strings |
| `PDFExportDialog.tsx` | `PDFExportDialog` | ADD useTranslations, REPLACE strings |
| `PrintOptionsPanel.tsx` | `PrintOptionsPanel`, `SCOPE_OPTIONS`, `ScopeCard`, `SelectableItemRow` | ADD useTranslations, REPLACE strings |
| `QRGenerationProgress.tsx` | `QRGenerationProgress` | ADD useTranslations, REPLACE strings |
| `RemoveItemDialog.tsx` | `RemoveItemDialog` | ADD useTranslations, REPLACE strings |
| `RoomCard.tsx` | `RoomCard` | ADD useTranslations, REPLACE strings |
| `SessionItemCard.tsx` | `SessionItemCard` | ADD useTranslations, REPLACE strings |
| `SessionProgressBar.tsx` | `SessionProgressBar` | ADD useTranslations, REPLACE strings |
| `SessionRecoveryBanner.tsx` | `SessionRecoveryBanner` | ADD useTranslations, REPLACE strings |
| `SortableContentPieceCard.tsx` | `SortableContentPieceCard` | ADD useTranslations, REPLACE strings |
| `SuggestionButton.tsx` | `SuggestionButton` | ADD useTranslations, REPLACE strings |
| `TagsEditor.tsx` | `TagsEditor`, `TagChip` | ADD useTranslations, REPLACE strings |
| `TruncatedText.tsx` | `TruncatedText` | ADD useTranslations, REPLACE strings |
| `CameraPermissionFallback.tsx` | `CameraPermissionFallback` | ADD useTranslations, REPLACE strings |

### 5.3 Constants File (Reference Only)

| File | Usage | Modification Type |
|------|-------|-------------------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | `ROOM_LABELS`, `TAG_LABELS` | REVIEW - may need i18n integration |

---

## 6. Dependencies

### 6.1 Required from Epic 1

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl package | Required | package.json |
| useTranslations hook | Required | next-intl |
| IntlProvider setup | Required | app/layout.tsx |
| Translation file structure | Required | /messages/*.json |

### 6.2 Task Dependencies

| This Task | Depends On | Reason |
|-----------|------------|--------|
| REQ-381 | Epic 1 complete | i18n foundation required |
| REQ-381 | REQ-371 (workflow namespace) | Namespace structure must exist |
| REQ-381 | None in 2C | Can proceed independently |

### 6.3 Dependent Tasks

| Task | Dependency Type | Impact |
|------|-----------------|--------|
| 2C.12 (Dialog components) | Related | Some dialogs may overlap |
| 2C.13 (Generate translations) | Sequential | Translations generated after extraction |
| 2C.14 (Test workflow) | Sequential | Testing after all updates |

---

## 7. Testing Requirements

### 7.1 Unit Tests

Each modified component should have its existing tests verified:
- All text assertions should still pass (may need translation mocking)
- Accessibility tests should validate translated aria-labels
- Snapshot tests may need updating

### 7.2 Integration Tests

- Verify all shared components render in all 6 languages
- Confirm no layout breaks with longer translated text
- Validate pluralization works correctly

### 7.3 Visual Regression

- Check button text doesn't overflow in German/French (longer text)
- Verify dialogs maintain proper layout
- Confirm progress indicators display correctly

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing strings during extraction | Medium | Low | Comprehensive code review, grep verification |
| Breaking existing tests | Medium | Medium | Update test assertions to use translations |
| Layout breaks in other languages | Medium | Low | Design review, text truncation handling |
| TYPE_CONFIG constants hardcoded | Low | Medium | Convert to translation keys or keep static |
| Dynamic message generation complexity | Medium | Medium | Use ICU message format properly |

---

## 9. Acceptance Criteria Verification

From REQ-381 requirements:

- [ ] All 25+ shared components identified and catalogued
- [ ] Each component imports useTranslations hook
- [ ] Appropriate namespaces selected (workflow.shared.*)
- [ ] All labels replaced with t() calls
- [ ] All button text replaced with t() calls
- [ ] All placeholders replaced with t() calls
- [ ] All validation messages replaced with t() calls
- [ ] All error messages replaced with t() calls
- [ ] All tooltips/aria-labels replaced with t() calls
- [ ] All empty state messages replaced
- [ ] All loading messages replaced
- [ ] All modal dialog content replaced
- [ ] All confirmation dialog content replaced
- [ ] Variable interpolation works correctly
- [ ] Components maintain existing functionality
- [ ] Components maintain existing styling
- [ ] Components maintain prop interfaces
- [ ] Translation keys follow naming conventions
- [ ] No hardcoded English strings remain
- [ ] Components handle missing keys gracefully
- [ ] Components display correctly in all 6 languages

---

## 10. Implementation Notes

### 10.1 Special Considerations

1. **PrintOptionsPanel.tsx** is the largest component (~30 strings) and contains nested helper components (ScopeCard, SelectableItemRow) that also need translation.

2. **ContentPieceCard.tsx** has TYPE_CONFIG with labels ("Video", "Photo", etc.) that should either:
   - Be translated via the t() function
   - Remain static if they're technical terms

3. **getExitMessage()** in ConfirmExitDialog.tsx returns dynamic messages based on state - this needs careful ICU format handling.

4. **Test files** in `__tests__/` subdirectory may need mock translations added.

### 10.2 Implementation Order

Recommended order for implementation:
1. Create namespace structure in en.json
2. Start with simpler components (ItemNameEditor, TagsEditor)
3. Move to dialog components (ConfirmExitDialog, EmptySessionDialog)
4. Handle complex components last (PrintOptionsPanel, PDFExportDialog)
5. Generate translations for other languages
6. Run verification tests

---

## 11. References

- [Plan-111-L10N-Epic2-Static-UI-Translation.md](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [REQ-371 Workflow Namespace Structure](./REQ-371-create-workflow-namespace-structure-overview.md)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C - Item Creation Workflow*
