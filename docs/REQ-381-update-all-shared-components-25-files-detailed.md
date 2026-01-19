# Detailed Task Breakdown: REQ-381 - Update All Shared Components for Internationalization

**Document Created:** 2026-01-19 17:30:00 UTC
**Last Modified:** 2026-01-19 17:30:00 UTC
**Request Reference:** REQ-381 (docs/gen_requests_epic2.md)
**Overview Document:** REQ-381-update-all-shared-components-25-files-overview.md
**Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.11
**Size:** XL (Extra Large)
**Estimated Story Points:** 13

---

## Document Purpose

This detailed task breakdown document transforms the REQ-381 overview into granular, actionable 1-story-point tasks that an AI coding agent or junior developer can execute step-by-step. Each task is self-contained with explicit file paths, exact string extractions, and verification criteria.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] REQ-371 (workflow namespace structure) is complete
- [ ] `/messages/en.json` exists with base structure
- [ ] `useTranslations` hook is available from `next-intl`
- [ ] IntlProvider is configured in `app/layout.tsx`

---

## Task Groups Overview

| Group | Description | Tasks | Estimated Points |
|-------|-------------|-------|------------------|
| A | Translation Namespace Setup | A.1 | 1 |
| B | Dialog Components | B.1-B.4 | 4 |
| C | Form & Editor Components | C.1-C.3 | 3 |
| D | Status & Progress Components | D.1-D.5 | 5 |
| E | Card & Display Components | E.1-E.5 | 5 |
| F | Print & Export Components | F.1-F.2 | 3 |
| G | Utility Components | G.1-G.3 | 3 |
| H | Translation Generation | H.1 | 2 |
| I | Verification & Testing | I.1-I.2 | 2 |

**Total Estimated Points:** 28

---

## Group A: Translation Namespace Setup

### Task A.1: Create workflow.shared Namespace in en.json

**File:** `/messages/en.json`
**Type:** ADD
**Story Points:** 1

**Description:**
Add the complete `workflow.shared` namespace to the English translation file with all keys needed for the 22 shared components.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Locate or create the `"workflow"` object
3. Add the `"shared"` namespace with the following structure:

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
          "message": "Are you sure you want to remove \"{itemName}\"? This action cannot be undone.",
          "cancelButton": "Cancel",
          "removeButton": "Remove"
        },
        "pdfExport": {
          "title": "Export QR Codes as PDF",
          "itemCount": "{count} {count, plural, one {item} other {items}}",
          "description": "Configure PDF export settings for your QR codes and download them as a printable PDF document.",
          "errorTitle": "PDF generation failed",
          "cancelButton": "Cancel",
          "exportButton": "Export PDF",
          "generating": "Generating...",
          "closeButton": "Close dialog"
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
          "ariaLabel": "Session progress: {count} items created",
          "itemsCreated": "{count} items created"
        }
      },
      "network": {
        "title": "Preview unavailable",
        "defaultMessage": "Unable to load preview due to network connectivity issues.",
        "retryButton": "Try Again",
        "retrying": "Retrying...",
        "proceedButton": "Proceed Without Preview"
      },
      "camera": {
        "title": "Camera access not available",
        "description": "To record a {contentType}, please allow camera access in your browser settings, or upload an existing {contentType} from your device.",
        "uploadVideo": "Upload Video",
        "uploadPhoto": "Upload Photo",
        "tryAgain": "Try Camera Again",
        "helpLink": "How to enable camera access"
      },
      "qrGeneration": {
        "title": "Generating QR Codes",
        "ariaLabel": "QR code generation progress",
        "status": {
          "ready": "Ready to generate",
          "complete": "Complete!",
          "completedWithFailed": "{completed} completed, {failed} failed",
          "failed": "Generation failed",
          "generating": "Generating QR code {current} of {total}...",
          "partial": "{completed} of {total} completed"
        },
        "itemStatus": {
          "pending": "Pending",
          "generating": "Generating...",
          "completed": "Completed",
          "failed": "Failed"
        },
        "retryButton": "Retry",
        "retryAriaLabel": "Retry QR generation for {itemName}",
        "retryFailed": "Retry Failed",
        "skipContinue": "Skip & Continue",
        "cancelButton": "Cancel",
        "cancelAriaLabel": "Cancel QR code generation",
        "failedMessage": "{count} {count, plural, one {item} other {items}} failed to generate"
      },
      "print": {
        "heading": "Which items would you like to print?",
        "selectAriaLabel": "Select items to print",
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
        "roomLabel": "Room: {room}",
        "generatePdfButton": "Generate PDF",
        "generatingQr": "Generating QR Codes...",
        "generatingPdf": "Generating PDF...",
        "processing": "Processing...",
        "printDirectButton": "Print Directly",
        "doneForNowButton": "Done for Now",
        "errorRetryHint": "Please try again or skip for now.",
        "dismissError": "Dismiss error",
        "selectedAnnouncement": "{count} items selected for printing"
      },
      "duplicateWarning": {
        "message": "An item with this name already exists"
      },
      "truncatedText": {
        "showMore": "Show more",
        "showLess": "Show less"
      }
    }
  }
}
```

**Verification Criteria:**
- [ ] JSON is valid (no syntax errors)
- [ ] All keys follow `workflow.shared.*` naming convention
- [ ] ICU message format used for pluralization
- [ ] Variable interpolation uses `{variableName}` syntax

---

## Group B: Dialog Components

### Task B.1: Update ConfirmExitDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 155 | `"Exit Workflow?"` | `workflow.shared.dialogs.confirmExit.title` |
| 68 | Dynamic message logic | Multiple keys (see below) |
| 181 | `"Cancel"` | `workflow.shared.dialogs.confirmExit.cancelButton` |
| 196 | `"Exit Workflow"` | `workflow.shared.dialogs.confirmExit.exitButton` |

**Implementation Steps:**

1. Add import at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook inside component (after `useFocusTrap`):
```typescript
const t = useTranslations('workflow.shared.dialogs.confirmExit');
```

3. Replace `getExitMessage` function to use translations:
```typescript
function useExitMessage(itemCount: number, hasUnsavedChanges: boolean) {
  const t = useTranslations('workflow.shared.dialogs.confirmExit');

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
```

4. Replace hardcoded strings:
   - Line 155: `Exit Workflow?` → `{t('title')}`
   - Line 161: `{getExitMessage(...)}` → `{exitMessage}` (from hook)
   - Line 181: `Cancel` → `{t('cancelButton')}`
   - Line 196: `Exit Workflow` → `{t('exitButton')}`

**Verification Criteria:**
- [ ] Component renders without errors
- [ ] All 4 message variants display correctly
- [ ] Pluralization works (1 item vs 2 items)
- [ ] No TypeScript errors
- [ ] Existing tests pass (may need mock updates)

---

### Task B.2: Update EmptySessionDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 131 | `"Close dialog"` (aria-label) | `workflow.shared.dialogs.emptySession.closeButton` |
| 150 | `"No Items Added"` | `workflow.shared.dialogs.emptySession.title` |
| 158 | `"No items added yet. Add items or exit session?"` | `workflow.shared.dialogs.emptySession.description` |
| 179 | `"Add Items"` | `workflow.shared.dialogs.emptySession.addItemsButton` |
| 198 | `"Exit Session"` | `workflow.shared.dialogs.emptySession.exitSessionButton` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook after `useFocusTrap`:
```typescript
const t = useTranslations('workflow.shared.dialogs.emptySession');
```

3. Replace strings:
   - `aria-label="Close dialog"` → `aria-label={t('closeButton')}`
   - `No Items Added` → `{t('title')}`
   - `No items added yet...` → `{t('description')}`
   - `Add Items` → `{t('addItemsButton')}`
   - `Exit Session` → `{t('exitSessionButton')}`

**Verification Criteria:**
- [ ] Component renders without errors
- [ ] All button labels display correctly
- [ ] Aria labels are translated
- [ ] Focus management still works
- [ ] Existing test `EmptySessionDialog.test.tsx` passes

---

### Task B.3: Update RemoveItemDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 123 | `"Remove Item?"` | `workflow.shared.dialogs.removeItem.title` |
| 129 | `"Are you sure you want to remove..."` | `workflow.shared.dialogs.removeItem.message` |
| 150 | `"Cancel"` | `workflow.shared.dialogs.removeItem.cancelButton` |
| 167 | `"Remove"` | `workflow.shared.dialogs.removeItem.removeButton` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook:
```typescript
const t = useTranslations('workflow.shared.dialogs.removeItem');
```

3. Replace strings:
   - `Remove Item?` → `{t('title')}`
   - Message with `displayName` → `{t('message', { itemName: displayName })}`
   - `Cancel` → `{t('cancelButton')}`
   - `Remove` → `{t('removeButton')}`

**Verification Criteria:**
- [ ] Component renders without errors
- [ ] Item name variable interpolation works
- [ ] Long item names still truncate correctly
- [ ] Test `RemoveItemDialog.test.tsx` passes

---

### Task B.4: Update PDFExportDialog.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 173 | `"Export QR Codes as PDF"` | `workflow.shared.dialogs.pdfExport.title` |
| 180 | `"{itemCount} item(s)"` | `workflow.shared.dialogs.pdfExport.itemCount` |
| 199 | `"Close dialog"` (aria-label) | `workflow.shared.dialogs.pdfExport.closeButton` |
| 207-208 | `"Configure PDF export..."` | `workflow.shared.dialogs.pdfExport.description` |
| 227 | `"PDF generation failed"` | `workflow.shared.dialogs.pdfExport.errorTitle` |
| 270 | `"Cancel"` | `workflow.shared.dialogs.pdfExport.cancelButton` |
| 294 | `"Generating..."` | `workflow.shared.dialogs.pdfExport.generating` |
| 299 | `"Export PDF"` | `workflow.shared.dialogs.pdfExport.exportButton` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook:
```typescript
const t = useTranslations('workflow.shared.dialogs.pdfExport');
```

3. Replace all strings with t() calls, using variable interpolation for `itemCount`

**Verification Criteria:**
- [ ] Component renders without errors
- [ ] Item count pluralization works
- [ ] Error state displays correctly
- [ ] Loading state shows translated text
- [ ] Test `PDFExportDialog.test.tsx` passes

---

## Group C: Form & Editor Components

### Task C.1: Update ItemNameEditor.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 69 | `"Item Name"` | `workflow.shared.itemName.label` |
| 48 | `"Enter item name"` (default placeholder) | `workflow.shared.itemName.placeholder` |
| 108 | `"This name will appear on the QR code label"` | `workflow.shared.itemName.hint` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook:
```typescript
const t = useTranslations('workflow.shared.itemName');
```

3. Update component to use translations:
   - Update default placeholder prop: `placeholder = t('placeholder')`
   - Replace label: `Item Name` → `{t('label')}`
   - Replace hint: `This name will appear...` → `{t('hint')}`

**Note:** The placeholder prop should still accept custom values from parent, but default to translated value.

**Verification Criteria:**
- [ ] Component renders without errors
- [ ] Default placeholder is translated
- [ ] Custom placeholder prop still works
- [ ] Character counter still functions
- [ ] Test `ItemNameEditor.test.tsx` passes

---

### Task C.2: Update TagsEditor.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 84 | `"Remove {label} tag"` (aria-label) | `workflow.shared.tags.removeAriaLabel` |
| 184-188 | `"Add Tag"` | `workflow.shared.tags.addButton` |
| 209 | `"Available tags"` (aria-label) | `workflow.shared.tags.availableLabel` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hooks at component level and pass to TagChip:
```typescript
const t = useTranslations('workflow.shared.tags');
```

3. Replace strings:
   - `aria-label={`Remove ${label} tag`}` → `aria-label={t('removeAriaLabel', { tag: label })}`
   - `Add Tag` → `{t('addButton')}`
   - `aria-label="Available tags"` → `aria-label={t('availableLabel')}`

**Verification Criteria:**
- [ ] Component renders without errors
- [ ] Tag removal aria-labels include tag name
- [ ] Dropdown opens and closes correctly
- [ ] No accessibility regressions

---

### Task C.3: Update DuplicateNameWarning.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
Identify all hardcoded strings in this component and replace with translation keys under `workflow.shared.duplicateWarning.*`

**Implementation Steps:**

1. Add import and hook
2. Replace any warning message strings

**Verification Criteria:**
- [ ] Warning message displays in correct language
- [ ] Component styling unchanged

---

## Group D: Status & Progress Components

### Task D.1: Update WorkflowHeader.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 87 | `"Step {currentStepIndex + 1} of {totalSteps}"` (aria-label) | `workflow.shared.header.stepIndicator` |
| 114 | `"Go back to previous step"` (aria-label) | `workflow.shared.header.backButton` |
| 124 | `"Step {currentStepIndex + 1} of {totalSteps}"` | `workflow.shared.header.stepIndicator` |
| 143 | `"Exit workflow"` (aria-label) | `workflow.shared.header.exitButton` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook:
```typescript
const t = useTranslations('workflow.shared.header');
```

3. Replace strings with interpolation:
   - Step indicator: `{t('stepIndicator', { current: currentStepIndex + 1, total: totalSteps })}`
   - Back button aria-label: `{t('backButton')}`
   - Exit button aria-label: `{t('exitButton')}`

**Verification Criteria:**
- [ ] Component renders without errors
- [ ] Step indicator shows correct numbers
- [ ] Progress bar still functions
- [ ] Aria labels translated
- [ ] Test `WorkflowHeader.test.tsx` passes

---

### Task D.2: Update SessionProgressBar.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 65 | `"Session progress: {itemsCreated} items created"` (aria-label) | `workflow.shared.session.progress.ariaLabel` |
| 80 | `"{itemsCreated} items created"` | `workflow.shared.session.progress.itemsCreated` |

**Implementation Steps:**

1. Add import and hook for `workflow.shared.session.progress`
2. Replace:
   - `aria-label` → `{t('ariaLabel', { count: itemsCreated })}`
   - Count text → `{t('itemsCreated', { count: itemsCreated })}`

**Verification Criteria:**
- [ ] Progress bar renders correctly
- [ ] Count text displays with proper pluralization
- [ ] Test `SessionProgressBar.test.tsx` passes

---

### Task D.3: Update SessionRecoveryBanner.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 148 | `"Your previous session has been restored"` | `workflow.shared.session.recovery.title` |
| 152 | `"{itemCount} item(s)"` | `workflow.shared.session.recovery.itemCount` |
| 156 | `"{contentNeedingReUpload} piece(s) need re-upload"` | `workflow.shared.session.recovery.needsReupload` |
| 174 | `"Dismiss notification"` (aria-label) | `workflow.shared.session.recovery.dismissButton` |
| 197 | `"Continue Session"` | `workflow.shared.session.recovery.continueButton` |
| 216 | `"Start Fresh"` | `workflow.shared.session.recovery.startFreshButton` |

**Implementation Steps:**

1. Add import and hook
2. Replace all strings with pluralization support for counts

**Verification Criteria:**
- [ ] Banner displays correctly
- [ ] Pluralization works (1 item vs 2 items, 1 piece vs 2 pieces)
- [ ] Auto-dismiss still functions
- [ ] Test `SessionRecoveryBanner.test.tsx` passes

---

### Task D.4: Update QRGenerationProgress.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 100 | `"Ready to generate"` | `workflow.shared.qrGeneration.status.ready` |
| 103 | `"Complete!"` | `workflow.shared.qrGeneration.status.complete` |
| 105 | `"{completed} completed, {failed} failed"` | `workflow.shared.qrGeneration.status.completedWithFailed` |
| 108 | `"Generation failed"` | `workflow.shared.qrGeneration.status.failed` |
| 110 | `"Generating QR code {n} of {total}..."` | `workflow.shared.qrGeneration.status.generating` |
| 112 | `"{completed} of {total} completed"` | `workflow.shared.qrGeneration.status.partial` |
| 126 | `"QR code generation progress"` (aria-label) | `workflow.shared.qrGeneration.ariaLabel` |
| 193-200 | Status labels: Pending, Generating..., Completed, Failed | `workflow.shared.qrGeneration.itemStatus.*` |
| 243 | `"Retry"` | `workflow.shared.qrGeneration.retryButton` |
| 241 | `"Retry QR generation for {item.name}"` (aria-label) | `workflow.shared.qrGeneration.retryAriaLabel` |
| 267 | Failed message | `workflow.shared.qrGeneration.failedMessage` |
| 303 | `"Retry Failed"` | `workflow.shared.qrGeneration.retryFailed` |
| 318 | `"Skip & Continue"` | `workflow.shared.qrGeneration.skipContinue` |
| 351 | `"Cancel"` | `workflow.shared.qrGeneration.cancelButton` |

**Implementation Steps:**

1. Add import at top
2. Add hook:
```typescript
const t = useTranslations('workflow.shared.qrGeneration');
```

3. Update ProgressBar sub-component to receive `t` function via props or use hook directly
4. Update ItemStatusRow sub-component similarly
5. Replace all hardcoded strings

**Verification Criteria:**
- [ ] All status messages display correctly
- [ ] Progress bar updates with translated messages
- [ ] Per-item retry works
- [ ] Cancel button works
- [ ] Test `QRGenerationProgress.test.tsx` passes

---

### Task D.5: Update NetworkErrorIndicator.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 77 | `"Preview unavailable"` | `workflow.shared.network.title` |
| 80 | `"Unable to load preview due to network..."` | `workflow.shared.network.defaultMessage` |
| 102-108 | `"Try Again"` / `"Retrying..."` | `workflow.shared.network.retryButton` / `workflow.shared.network.retrying` |
| 130 | `"Proceed Without Preview"` | `workflow.shared.network.proceedButton` |

**Implementation Steps:**

1. Add import and hook for `workflow.shared.network`
2. Replace title, message, and button labels
3. Handle conditional retry/retrying text

**Verification Criteria:**
- [ ] Error banner displays correctly
- [ ] Retry state toggles button text
- [ ] Proceed option works
- [ ] Test `NetworkErrorIndicator.test.tsx` passes

---

## Group E: Card & Display Components

### Task E.1: Update ContentPieceCard.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 61-65 | TYPE_CONFIG labels: Video, Photo, PDF, Text, Link | `workflow.shared.content.types.*` |
| 155 | `"Photo content"` (alt text) | `workflow.shared.content.photoAlt` |
| 173 | `"{pageCount} page(s)"` | `workflow.shared.content.pageCount` |
| 321 | `"Drag to reorder"` (aria-label) | `workflow.shared.content.dragHandle` |
| 349 | `"Retake content"` (aria-label) | `workflow.shared.content.retakeButton` |
| 367 | `"Remove content"` (aria-label) | `workflow.shared.content.removeButton` |

**Implementation Steps:**

1. Add import and hook
2. Modify TYPE_CONFIG to be a function that takes `t`:
```typescript
const getTypeConfig = (t: (key: string) => string) => ({
  video: { icon: Video, color: '...', label: t('types.video') },
  // etc.
});
```

3. Replace all aria-labels and alt text

**Verification Criteria:**
- [ ] All content type labels display correctly
- [ ] Page count pluralization works
- [ ] Aria labels translated
- [ ] Test `ContentPieceCard.test.tsx` passes

---

### Task E.2: Update SortableContentPieceCard.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx`
**Type:** MODIFY
**Story Points:** 1

**Description:**
This component wraps ContentPieceCard for drag-and-drop. Ensure translation context is passed through correctly.

**Strings to Extract:**
Identify any additional strings not covered by ContentPieceCard.

**Implementation Steps:**

1. Verify ContentPieceCard translations work when wrapped
2. Add any additional strings specific to sortable functionality

**Verification Criteria:**
- [ ] Drag and drop still works
- [ ] Translations from ContentPieceCard display
- [ ] Test `SortableContentPieceCard.test.tsx` passes

---

### Task E.3: Update ContentPreview.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
Identify all preview-related strings (empty states, loading messages, etc.)

**Implementation Steps:**

1. Add import and hook
2. Replace all user-visible strings

**Verification Criteria:**
- [ ] Preview displays correctly for all content types
- [ ] Test `ContentPreview.test.tsx` passes

---

### Task E.4: Update SessionItemCard.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
Identify all strings (item labels, status badges, actions)

**Implementation Steps:**

1. Add import and hook
2. Replace all user-visible strings

**Verification Criteria:**
- [ ] Card displays correctly
- [ ] Test `SessionItemCard.test.tsx` passes

---

### Task E.5: Update Card Components (RoomCard, ItemTypeCard, SuggestionButton)

**Files:**
- `/src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx`
- `/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx`
- `/src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx`

**Type:** MODIFY
**Story Points:** 1 (combined)

**Strings to Extract:**
Identify aria-labels and any visible text in these simple components.

**Implementation Steps:**

1. Add imports and hooks to each
2. Replace aria-labels and visible text

**Verification Criteria:**
- [ ] All three components render correctly
- [ ] Tests pass for each

---

## Group F: Print & Export Components

### Task F.1: Update PrintOptionsPanel.tsx (Major)

**File:** `/src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`
**Type:** MODIFY
**Story Points:** 2

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 205 | `"All Items"` | `workflow.shared.print.scopes.all.title` |
| 206 | `"Include new and existing items"` | `workflow.shared.print.scopes.all.description` |
| 210 | `"New Items Only"` | `workflow.shared.print.scopes.newOnly.title` |
| 211 | `"Only items created in this session"` | `workflow.shared.print.scopes.newOnly.description` |
| 216 | `"Select Items"` | `workflow.shared.print.scopes.selected.title` |
| 217 | `"Choose specific items to print"` | `workflow.shared.print.scopes.selected.description` |
| 719 | `"Which items would you like to print?"` | `workflow.shared.print.heading` |
| 762 | `"Select items to print"` (aria-label) | `workflow.shared.print.selectAriaLabel` |
| 786 | `"Select All"` / `"Deselect All"` | `workflow.shared.print.selectAll/deselectAll` |
| 788 | `"({selected} of {total} selected)"` | `workflow.shared.print.selectedCount` |
| 359 | `"New"` badge | `workflow.shared.print.newBadge` |
| 367 | `"Room: {roomLabel}"` (aria-label) | `workflow.shared.print.roomLabel` |
| 814 | `"Generating QR Codes"` | `workflow.shared.qrGeneration.title` |
| 832 | `"{selectedCount} items selected for printing"` | `workflow.shared.print.selectedAnnouncement` |
| 851 | `"Please try again or skip for now."` | `workflow.shared.print.errorRetryHint` |
| 864 | `"Dismiss error"` (aria-label) | `workflow.shared.print.dismissError` |
| 897 | `"Generating QR Codes..."` | `workflow.shared.print.generatingQr` |
| 902 | `"Generating PDF..."` | `workflow.shared.print.generatingPdf` |
| 907 | `"Processing..."` | `workflow.shared.print.processing` |
| 912 | `"Generate PDF"` | `workflow.shared.print.generatePdfButton` |
| 934 | `"Print Directly"` | `workflow.shared.print.printDirectButton` |
| 951 | `"Done for Now"` | `workflow.shared.print.doneForNowButton` |

**Implementation Steps:**

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook:
```typescript
const t = useTranslations('workflow.shared.print');
```

3. Update SCOPE_OPTIONS to use translations:
```typescript
// Convert to a hook or function
const useScopeOptions = () => {
  const t = useTranslations('workflow.shared.print.scopes');
  return [
    { value: 'all', title: t('all.title'), description: t('all.description'), ... },
    // etc.
  ];
};
```

4. Update sub-components (ScopeCard, SelectableItemRow) to receive translations

5. Replace all hardcoded strings throughout the component

**Verification Criteria:**
- [ ] All scope options display correctly
- [ ] Item selection list works
- [ ] All button states show correct text
- [ ] Live region announcements work
- [ ] Test `PrintOptionsPanel.test.tsx` passes

---

### Task F.2: Update ItemContextDisplay.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/ItemContextDisplay.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
Identify all context display labels and formatting strings.

**Implementation Steps:**

1. Add import and hook
2. Replace labels and formatting

**Verification Criteria:**
- [ ] Context displays correctly
- [ ] All labels translated

---

## Group G: Utility Components

### Task G.1: Update CameraPermissionFallback.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/CameraPermissionFallback.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 83 | `"Camera access not available"` | `workflow.shared.camera.title` |
| 88-89 | `"To record a {contentLabel}..."` | `workflow.shared.camera.description` |
| 109 | `"Upload Video"` / `"Upload Photo"` | `workflow.shared.camera.uploadVideo/uploadPhoto` |
| 128 | `"Try Camera Again"` | `workflow.shared.camera.tryAgain` |
| 145 | `"How to enable camera access"` | `workflow.shared.camera.helpLink` |

**Implementation Steps:**

1. Add import and hook for `workflow.shared.camera`
2. Replace all strings with variable interpolation for content type

**Verification Criteria:**
- [ ] Displays correctly for both video and photo modes
- [ ] Upload buttons show correct labels
- [ ] Help link still works
- [ ] Test `CameraPermissionFallback.test.tsx` passes

---

### Task G.2: Update TruncatedText.tsx

**File:** `/src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx`
**Type:** MODIFY
**Story Points:** 1

**Strings to Extract:**
This component is primarily a utility and may not have user-visible strings. Review for any show more/less text.

**Implementation Steps:**

1. Review component for any translatable strings
2. Add translations if needed

**Verification Criteria:**
- [ ] Tooltip functionality unchanged
- [ ] Test `TruncatedText.test.tsx` passes

---

### Task G.3: Verify Remaining Components

**Files to review:**
- Any other components in the shared folder not explicitly covered

**Type:** VERIFY
**Story Points:** 1

**Implementation Steps:**

1. List all files in shared folder
2. Verify each has been updated
3. Update any missed components

**Verification Criteria:**
- [ ] All 22+ shared components have useTranslations
- [ ] No hardcoded English strings remain

---

## Group H: Translation Generation

### Task H.1: Generate Translations for Non-English Languages

**Files:**
- `/messages/fr.json` (French)
- `/messages/es.json` (Spanish)
- `/messages/de.json` (German)
- `/messages/nl.json` (Dutch)
- `/messages/it.json` (Italian)

**Type:** ADD
**Story Points:** 2

**Implementation Steps:**

1. Copy `workflow.shared` namespace from `en.json`
2. Translate all keys to each target language
3. Ensure ICU message format is preserved (pluralization rules differ by language)
4. Verify JSON structure matches English exactly

**French Translation Example:**
```json
{
  "workflow": {
    "shared": {
      "header": {
        "stepIndicator": "Étape {current} sur {total}",
        "backButton": "Retourner à l'étape précédente",
        "exitButton": "Quitter le workflow"
      },
      "dialogs": {
        "confirmExit": {
          "title": "Quitter le workflow ?",
          "cancelButton": "Annuler",
          "exitButton": "Quitter"
        }
      }
    }
  }
}
```

**Verification Criteria:**
- [ ] All 5 language files have identical key structure
- [ ] JSON is valid in all files
- [ ] Pluralization rules appropriate for each language
- [ ] No missing keys compared to English

---

## Group I: Verification & Testing

### Task I.1: Run Existing Tests and Fix Failures

**Type:** VERIFY
**Story Points:** 1

**Implementation Steps:**

1. Run test suite: `npm run test -- --testPathPattern="shared"`
2. For each failing test:
   - Add translation mocks if needed
   - Update text assertions to match translation keys or mocked values
3. Ensure all tests pass

**Test Files to Verify:**
- `ContentPieceCard.test.tsx`
- `SortableContentPieceCard.test.tsx`
- `EmptySessionDialog.test.tsx`
- `PDFExportDialog.test.tsx`
- `ItemNameEditor.test.tsx`
- `ContentPreview.test.tsx`
- `QRGenerationProgress.test.tsx`
- `NetworkErrorIndicator.test.tsx`
- `ItemTypeCard.test.tsx`
- `ContentPreview.a11y.test.tsx`
- `CameraPermissionFallback.test.tsx`
- `TruncatedText.test.tsx`
- `ConfirmExitDialog.test.tsx`
- `PrintOptionsPanel.test.tsx`
- `RoomCard.test.tsx`
- `SessionRecoveryBanner.test.tsx`
- `SuggestionButton.test.tsx`
- `SessionProgressBar.test.tsx`
- `DuplicateNameWarning.test.tsx`
- `WorkflowHeader.test.tsx`
- `SessionItemCard.test.tsx`
- `RemoveItemDialog.test.tsx`

**Mock Setup Example:**
```typescript
// test-utils.tsx or setup file
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string, values?: Record<string, unknown>) => {
    // Return key for easy assertion or implement mock translations
    return key;
  },
}));
```

**Verification Criteria:**
- [ ] All existing tests pass
- [ ] No new test failures introduced
- [ ] Coverage maintained or improved

---

### Task I.2: Manual Visual Verification

**Type:** VERIFY
**Story Points:** 1

**Implementation Steps:**

1. Start development server: `npm run dev`
2. Navigate to Item Creation Workflow
3. For each language (en, fr, es, de, nl, it):
   - Change language setting
   - Walk through complete workflow
   - Verify all shared components display correctly
4. Check for:
   - Text overflow/truncation issues
   - Layout breaks with longer translations
   - Missing translations (showing keys instead)
   - Pluralization correctness

**Verification Checklist:**
- [ ] WorkflowHeader step indicator displays correctly
- [ ] ConfirmExitDialog shows all 4 message variants
- [ ] EmptySessionDialog buttons display correctly
- [ ] RemoveItemDialog shows item name
- [ ] PDFExportDialog all labels correct
- [ ] ContentPieceCard type labels correct
- [ ] ItemNameEditor label and hint correct
- [ ] TagsEditor add button and aria labels correct
- [ ] SessionRecoveryBanner pluralization works
- [ ] QRGenerationProgress all status messages correct
- [ ] NetworkErrorIndicator all buttons correct
- [ ] PrintOptionsPanel scope options and counts correct
- [ ] CameraPermissionFallback content type specific text correct
- [ ] No console warnings about missing translations

---

## Summary Checklist

### Files Modified (22 components + 6 translation files)

| File | Status |
|------|--------|
| `/messages/en.json` | ☐ |
| `/messages/fr.json` | ☐ |
| `/messages/es.json` | ☐ |
| `/messages/de.json` | ☐ |
| `/messages/nl.json` | ☐ |
| `/messages/it.json` | ☐ |
| `WorkflowHeader.tsx` | ☐ |
| `ConfirmExitDialog.tsx` | ☐ |
| `EmptySessionDialog.tsx` | ☐ |
| `RemoveItemDialog.tsx` | ☐ |
| `PDFExportDialog.tsx` | ☐ |
| `ContentPieceCard.tsx` | ☐ |
| `SortableContentPieceCard.tsx` | ☐ |
| `ContentPreview.tsx` | ☐ |
| `ItemNameEditor.tsx` | ☐ |
| `TagsEditor.tsx` | ☐ |
| `DuplicateNameWarning.tsx` | ☐ |
| `SessionProgressBar.tsx` | ☐ |
| `SessionRecoveryBanner.tsx` | ☐ |
| `QRGenerationProgress.tsx` | ☐ |
| `NetworkErrorIndicator.tsx` | ☐ |
| `PrintOptionsPanel.tsx` | ☐ |
| `SessionItemCard.tsx` | ☐ |
| `ItemContextDisplay.tsx` | ☐ |
| `RoomCard.tsx` | ☐ |
| `ItemTypeCard.tsx` | ☐ |
| `SuggestionButton.tsx` | ☐ |
| `CameraPermissionFallback.tsx` | ☐ |
| `TruncatedText.tsx` | ☐ |

### Acceptance Criteria from REQ-381

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
- [ ] Existing tests pass or updated

---

## References

- [REQ-381 Overview Document](./REQ-381-update-all-shared-components-25-files-overview.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C - Item Creation Workflow*
*Task 2C.11 - Update All Shared Components for Internationalization*
