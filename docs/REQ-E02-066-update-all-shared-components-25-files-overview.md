# REQ-E02-066: Update All Shared Workflow Components - Implementation Breakdown

**Generated:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-066
**Epic:** Localization Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.11
**Type:** ENHANCEMENT
**Size:** L (Large)
**Estimated Strings:** ~150

---

## Overview

This task involves updating all 25+ shared components in the Item Creation Workflow to use internationalized strings via next-intl instead of hardcoded English text. These shared components are reused across multiple workflow steps and include dialogs, progress indicators, content cards, editors, and various utility components.

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation (next-intl setup) | Required | Must be complete before starting |
| Task 2H.1 (Common namespace) | Required | `common` namespace structure needed |
| Task 2C.1 (Workflow namespace) | Required | `workflow` namespace structure needed |

### Business Impact

- **User Impact:** Non-English users see consistent, translated text across all shared workflow components
- **Technical Impact:** Centralizes ~150 strings for 25+ components into translation files
- **Reusability:** These shared components support all workflow steps, making future enhancements automatically multilingual

---

## Current State Analysis

### Components Inventory (25 Files)

The shared components are located in:
`/src/components/ItemCreationWorkflow/components/shared/`

| # | Component File | Estimated Strings | Priority |
|---|----------------|-------------------|----------|
| 1 | WorkflowHeader.tsx | ~5 | High |
| 2 | SessionProgressBar.tsx | ~3 | Medium |
| 3 | ConfirmExitDialog.tsx | ~10 | High |
| 4 | EmptySessionDialog.tsx | ~8 | High |
| 5 | RemoveItemDialog.tsx | ~6 | High |
| 6 | CameraPermissionFallback.tsx | ~10 | Medium |
| 7 | NetworkErrorIndicator.tsx | ~8 | Medium |
| 8 | SessionRecoveryBanner.tsx | ~10 | Medium |
| 9 | QRGenerationProgress.tsx | ~15 | Medium |
| 10 | PrintOptionsPanel.tsx | ~25 | High |
| 11 | PDFExportDialog.tsx | ~12 | Medium |
| 12 | ContentPieceCard.tsx | ~8 | Medium |
| 13 | ContentPreview.tsx | ~10 | Medium |
| 14 | SortableContentPieceCard.tsx | ~2 | Low |
| 15 | ItemNameEditor.tsx | ~5 | Medium |
| 16 | TagsEditor.tsx | ~5 | Medium |
| 17 | DuplicateNameWarning.tsx | ~6 | Low |
| 18 | TruncatedText.tsx | ~0 | Skip |
| 19 | RoomCard.tsx | ~3 | Low |
| 20 | ItemTypeCard.tsx | ~3 | Low |
| 21 | SuggestionButton.tsx | ~2 | Low |
| 22 | SessionItemCard.tsx | ~5 | Low |
| 23 | ItemContextDisplay.tsx | ~3 | Low |
| **Total** | | **~150** | |

### Hardcoded String Categories

Based on component analysis, strings fall into these categories:

1. **Dialog Titles & Messages** (~40 strings)
   - "Exit Workflow?", "Remove Item?", "No Items Added"
   - Confirmation messages with variable interpolation

2. **Button Labels** (~25 strings)
   - "Cancel", "Exit Workflow", "Remove", "Add Items", "Try Again"
   - "Generate PDF", "Print Directly", "Done for Now"

3. **Status/Progress Messages** (~30 strings)
   - "X items created", "Generating QR code X of Y"
   - "Complete!", "Failed", "Pending", "Generating..."

4. **Error Messages** (~20 strings)
   - "Camera access not available", "Preview unavailable"
   - "PDF generation failed", "Unable to load preview"

5. **Form Labels & Hints** (~15 strings)
   - "Item Name", "Add Tag", "This name will appear on QR code label"

6. **Accessibility Labels** (~20 strings)
   - "Go back to previous step", "Exit workflow", "Drag to reorder"
   - "Close dialog", "Retry QR generation for {name}"

---

## Implementation Tasks

### Task 1: Add Translation Keys to `workflow.shared` Namespace

**File:** `/messages/en.json`

Add the following structure under the `workflow` namespace:

```json
{
  "workflow": {
    "shared": {
      "header": {
        "stepOf": "Step {current} of {total}",
        "backAriaLabel": "Go back to previous step",
        "exitAriaLabel": "Exit workflow"
      },
      "progress": {
        "itemsCreated": "{count, plural, =0 {No items} one {# item} other {# items}} created",
        "sessionProgress": "Session progress: {count} items created"
      },
      "dialogs": {
        "confirmExit": {
          "title": "Exit Workflow?",
          "messageWithUnsavedAndItems": "You have unsaved changes and {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
          "messageWithUnsaved": "You have unsaved changes. Are you sure you want to exit?",
          "messageWithItems": "You have created {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
          "messageDefault": "Are you sure you want to exit the workflow?",
          "cancel": "Cancel",
          "exit": "Exit Workflow"
        },
        "emptySession": {
          "title": "No Items Added",
          "message": "No items added yet. Add items or exit session?",
          "addItems": "Add Items",
          "exitSession": "Exit Session",
          "closeAriaLabel": "Close dialog"
        },
        "removeItem": {
          "title": "Remove Item?",
          "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone.",
          "cancel": "Cancel",
          "remove": "Remove"
        },
        "pdfExport": {
          "title": "Export QR Codes as PDF",
          "itemCount": "{count, plural, one {# item} other {# items}}",
          "description": "Configure PDF export settings for your QR codes and download them as a printable PDF document.",
          "generationFailed": "PDF generation failed",
          "cancel": "Cancel",
          "export": "Export PDF",
          "generating": "Generating..."
        }
      },
      "camera": {
        "notAvailable": "Camera access not available",
        "instructionVideo": "To record a video, please allow camera access in your browser settings, or upload an existing video from your device.",
        "instructionPhoto": "To record a photo, please allow camera access in your browser settings, or upload an existing photo from your device.",
        "uploadVideo": "Upload Video",
        "uploadPhoto": "Upload Photo",
        "tryAgain": "Try Camera Again",
        "tryAgainAriaLabel": "Try camera again",
        "helpLink": "How to enable camera access"
      },
      "network": {
        "previewUnavailable": "Preview unavailable",
        "defaultError": "Unable to load preview due to network connectivity issues.",
        "tryAgain": "Try Again",
        "retrying": "Retrying...",
        "proceedWithout": "Proceed Without Preview"
      },
      "sessionRecovery": {
        "title": "Your previous session has been restored",
        "itemCount": "{count, plural, one {# item} other {# items}}",
        "needsReUpload": "{count, plural, one {# piece needs} other {# pieces need}} re-upload",
        "continueSession": "Continue Session",
        "startFresh": "Start Fresh",
        "dismiss": "Dismiss notification"
      },
      "qrGeneration": {
        "ready": "Ready to generate",
        "complete": "Complete!",
        "completedWithFailures": "{completed} completed, {failed} failed",
        "failed": "Generation failed",
        "generatingOf": "Generating QR code {current} of {total}...",
        "completedOf": "{completed} of {total} completed",
        "pending": "Pending",
        "generating": "Generating...",
        "completed": "Completed",
        "failedStatus": "Failed",
        "retry": "Retry",
        "retryAriaLabel": "Retry QR generation for {name}",
        "retryFailed": "Retry Failed",
        "skipAndContinue": "Skip & Continue",
        "cancel": "Cancel",
        "cancelAriaLabel": "Cancel QR code generation",
        "statusAriaLabel": "QR code generation status",
        "progressAriaLabel": "QR code generation progress",
        "itemsFailed": "{count, plural, one {# item} other {# items}} failed to generate"
      },
      "printOptions": {
        "heading": "Which items would you like to print?",
        "scopeAll": "All Items",
        "scopeAllDesc": "Include new and existing items",
        "scopeNewOnly": "New Items Only",
        "scopeNewOnlyDesc": "Only items created in this session",
        "scopeSelected": "Select Items",
        "scopeSelectedDesc": "Choose specific items to print",
        "selectAll": "Select All",
        "deselectAll": "Deselect All",
        "selectedOf": "({selected} of {total} selected)",
        "newBadge": "New",
        "generatingQR": "Generating QR Codes",
        "generatingQRButton": "Generating QR Codes...",
        "generatingPDF": "Generating PDF...",
        "processing": "Processing...",
        "generatePDF": "Generate PDF",
        "printDirectly": "Print Directly",
        "doneForNow": "Done for Now",
        "errorRetryHint": "Please try again or skip for now.",
        "dismissError": "Dismiss error",
        "itemsSelected": "{count, plural, one {# item} other {# items}} selected for printing"
      },
      "content": {
        "types": {
          "video": "Video",
          "photo": "Photo",
          "pdf": "PDF",
          "text": "Text",
          "url": "Link"
        },
        "pageCount": "{count, plural, one {# page} other {# pages}}",
        "photoAlt": "Photo content",
        "itemPhotoAlt": "Item photo",
        "dragToReorder": "Drag to reorder",
        "retakeContent": "Retake content",
        "removeContent": "Remove content",
        "removeAriaLabel": "Remove {type} content",
        "loadingPreview": "Loading preview...",
        "contentPreviewAriaLabel": "{type} content preview"
      },
      "itemEditor": {
        "itemName": "Item Name",
        "placeholder": "Enter item name",
        "hint": "This name will appear on the QR code label"
      },
      "tagsEditor": {
        "addTag": "Add Tag",
        "removeTagAriaLabel": "Remove {tag} tag"
      },
      "duplicateWarning": {
        "exact": "Exact name already exists",
        "similar": "Similar name already used",
        "moreItems": "+{count} more..."
      }
    }
  }
}
```

---

### Task 2: Update WorkflowHeader Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

**Current Hardcoded Strings:**
- Line 87: `Step ${currentStepIndex + 1} of ${totalSteps}` (aria-label)
- Line 114: "Go back to previous step" (aria-label)
- Line 124: `Step {currentStepIndex + 1} of {totalSteps}` (visible text)
- Line 144: "Exit workflow" (aria-label)

**Changes Required:**
```tsx
// Add import
import { useTranslations } from 'next-intl';

// In component body
const t = useTranslations('workflow.shared.header');

// Replace strings
aria-label={t('stepOf', { current: currentStepIndex + 1, total: totalSteps })}
aria-label={t('backAriaLabel')}
<div>{t('stepOf', { current: currentStepIndex + 1, total: totalSteps })}</div>
aria-label={t('exitAriaLabel')}
```

---

### Task 3: Update SessionProgressBar Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx`

**Current Hardcoded Strings:**
- Line 65: `Session progress: ${itemsCreated} items created` (aria-label)
- Line 80: `{itemsCreated} items created` (visible text)

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.progress');

aria-label={t('sessionProgress', { count: itemsCreated })}
<p>{t('itemsCreated', { count: itemsCreated })}</p>
```

---

### Task 4: Update ConfirmExitDialog Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

**Current Hardcoded Strings:**
- Lines 67-77: `getExitMessage()` function with 4 message variants
- Line 155: "Exit Workflow?"
- Line 181: "Cancel"
- Line 196: "Exit Workflow"

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.dialogs.confirmExit');

// Replace getExitMessage function
function getExitMessage(itemCount: number, hasUnsavedChanges: boolean, t: ReturnType<typeof useTranslations>): string {
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

// In JSX
<h3>{t('title')}</h3>
<button>{t('cancel')}</button>
<button>{t('exit')}</button>
```

---

### Task 5: Update EmptySessionDialog Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`

**Current Hardcoded Strings:**
- Line 131: "Close dialog" (aria-label)
- Line 150: "No Items Added"
- Line 158: "No items added yet. Add items or exit session?"
- Line 179: "Add Items"
- Line 198: "Exit Session"

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.dialogs.emptySession');

aria-label={t('closeAriaLabel')}
<h2>{t('title')}</h2>
<p>{t('message')}</p>
<button>{t('addItems')}</button>
<button>{t('exitSession')}</button>
```

---

### Task 6: Update RemoveItemDialog Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`

**Current Hardcoded Strings:**
- Line 123: "Remove Item?"
- Line 129: `Are you sure you want to remove "{displayName}"? This action cannot be undone.`
- Line 150: "Cancel"
- Line 167: "Remove"

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.dialogs.removeItem');

<h3>{t('title')}</h3>
<p>{t('message', { name: displayName })}</p>
<button>{t('cancel')}</button>
<button>{t('remove')}</button>
```

---

### Task 7: Update CameraPermissionFallback Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/CameraPermissionFallback.tsx`

**Current Hardcoded Strings:**
- Lines 36-44: CONTENT_TYPE_LABELS and CONTENT_TYPE_FILE_LABELS constants
- Line 83: "Camera access not available"
- Line 88-89: "To record a {contentLabel}, please allow camera access..."
- Line 109: uploadLabel (dynamic)
- Line 126: "Try camera again" (aria-label)
- Line 128: "Try Camera Again"
- Line 145: "How to enable camera access"

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.camera');

// Replace constants with translations
const uploadLabel = contentType === 'video' ? t('uploadVideo') : t('uploadPhoto');
const instruction = contentType === 'video' ? t('instructionVideo') : t('instructionPhoto');

<h3>{t('notAvailable')}</h3>
<p>{instruction}</p>
<button aria-label={uploadLabel}>{uploadLabel}</button>
<button aria-label={t('tryAgainAriaLabel')}>{t('tryAgain')}</button>
<a>{t('helpLink')}</a>
```

---

### Task 8: Update NetworkErrorIndicator Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx`

**Current Hardcoded Strings:**
- Line 77: "Preview unavailable"
- Line 80: Default error message
- Line 102-103: "Retrying..." / "Try Again" (aria-label and text)
- Line 108: Button text
- Line 128-129: "Continue without preview" (aria-label)
- Line 130: "Proceed Without Preview"

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.network');

<h3>{t('previewUnavailable')}</h3>
<p>{errorMessage || t('defaultError')}</p>
aria-label={isRetrying ? t('retrying') : t('tryAgain')}
{isRetrying ? t('retrying') : t('tryAgain')}
<button aria-label={t('proceedWithout')}>{t('proceedWithout')}</button>
```

---

### Task 9: Update SessionRecoveryBanner Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`

**Current Hardcoded Strings:**
- Line 149: "Your previous session has been restored"
- Lines 152-158: Item count with pluralization and re-upload message
- Line 176: "Dismiss notification" (aria-label)
- Line 197: "Continue Session"
- Line 216: "Start Fresh"

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.sessionRecovery');

<h3>{t('title')}</h3>
<p>{t('itemCount', { count: itemCount })}</p>
<span>{t('needsReUpload', { count: contentNeedingReUpload })}</span>
aria-label={t('dismiss')}
<button>{t('continueSession')}</button>
<button>{t('startFresh')}</button>
```

---

### Task 10: Update QRGenerationProgress Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`

**Current Hardcoded Strings:**
- Lines 100-114: Status messages in ProgressBar
- Lines 192-200: Status labels (Pending, Generating..., Completed, Failed)
- Line 243: "Retry"
- Line 240: Retry aria-label
- Line 267: Error message with failed count
- Line 303: "Retry Failed"
- Line 318: "Skip & Continue"
- Line 350: "Cancel" and aria-label
- Line 404: aria-label for list

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.qrGeneration');

// ProgressBar status messages
statusMessage = t('ready');
statusMessage = t('complete');
statusMessage = t('completedWithFailures', { completed, failed });
statusMessage = t('failed');
statusMessage = t('generatingOf', { current: Math.min(stats.completed + 1, stats.total), total: stats.total });
statusMessage = t('completedOf', { completed: stats.completed, total: stats.total });

// Status labels
case 'pending': return t('pending');
case 'generating': return t('generating');
case 'completed': return t('completed');
case 'failed': return t('failedStatus');

// Buttons and labels
{t('retry')}
aria-label={t('retryAriaLabel', { name: item.name })}
{t('retryFailed')}
{t('skipAndContinue')}
{t('cancel')}
aria-label={t('cancelAriaLabel')}
aria-label={t('statusAriaLabel')}
aria-label={t('progressAriaLabel')}
```

---

### Task 11: Update PrintOptionsPanel Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`

**Current Hardcoded Strings:**
- Lines 203-221: SCOPE_OPTIONS array with title/description
- Line 719: "Which items would you like to print?"
- Lines 786-789: Select All / Deselect All with count
- Line 359: "New" badge
- Line 813-815: "Generating QR Codes"
- Lines 893-913: Button states (generating, processing)
- Line 935: "Print Directly"
- Line 951: "Done for Now"
- Lines 851-852: Error hints

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.printOptions');

// Replace SCOPE_OPTIONS to use translations
const SCOPE_OPTIONS = [
  { value: 'all', title: t('scopeAll'), description: t('scopeAllDesc'), ... },
  { value: 'new-only', title: t('scopeNewOnly'), description: t('scopeNewOnlyDesc'), ... },
  { value: 'selected', title: t('scopeSelected'), description: t('scopeSelectedDesc'), ... },
];

<h2>{t('heading')}</h2>
{isAllSelected ? t('deselectAll') : t('selectAll')}
{t('selectedOf', { selected: selectedCount, total: allItems.length })}
<span>{t('newBadge')}</span>
<h3>{t('generatingQR')}</h3>
// Button states
{t('generatingQRButton')}
{t('generatingPDF')}
{t('processing')}
{t('generatePDF')}
{t('printDirectly')}
{t('doneForNow')}
<p>{t('errorRetryHint')}</p>
aria-label={t('dismissError')}
```

---

### Task 12: Update PDFExportDialog Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`

**Current Hardcoded Strings:**
- Line 173: "Export QR Codes as PDF"
- Line 180: Item count text
- Line 206-208: Hidden description
- Line 227: "PDF generation failed"
- Line 270: "Cancel"
- Line 294: "Generating..."
- Line 299: "Export PDF"

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.dialogs.pdfExport');

<h2>{t('title')}</h2>
<span>{t('itemCount', { count: itemCount })}</span>
<p>{t('description')}</p>
<p>{t('generationFailed')}</p>
<button>{t('cancel')}</button>
<span>{t('generating')}</span>
<span>{t('export')}</span>
```

---

### Task 13: Update ContentPieceCard Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`

**Current Hardcoded Strings:**
- Lines 60-66: TYPE_CONFIG labels (Video, Photo, PDF, Text, Link)
- Line 152: "Photo content" (alt text)
- Lines 172-174: Page count with pluralization
- Line 321: "Drag to reorder" (aria-label)
- Line 349: "Retake content" (aria-label)
- Line 367: "Remove content" (aria-label)

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.content');

// Replace TYPE_CONFIG to use translations dynamically
const typeLabels = {
  video: t('types.video'),
  photo: t('types.photo'),
  pdf: t('types.pdf'),
  text: t('types.text'),
  url: t('types.url'),
};

alt={t('photoAlt')}
<span>{t('pageCount', { count: data.pageCount })}</span>
aria-label={t('dragToReorder')}
aria-label={t('retakeContent')}
aria-label={t('removeContent')}
```

---

### Task 14: Update ContentPreview Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`

**Current Hardcoded Strings:**
- Lines 73-79: TYPE_CONFIG labels
- Lines 215-218: Page count with pluralization
- Line 373: "Loading content preview" (aria-label)
- Line 385: "Loading preview..."
- Line 452: Content preview aria-label
- Line 483: Remove aria-label

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.content');

// Use translations for type labels
const TYPE_CONFIG_TRANSLATED = useMemo(() => ({
  video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: t('types.video') },
  // ... etc
}), [t]);

<span>{t('pageCount', { count: data.pageCount })}</span>
aria-label={t('loadingPreview')}
<span className="sr-only">{t('loadingPreview')}</span>
aria-label={t('contentPreviewAriaLabel', { type: typeConfig.label })}
aria-label={t('removeAriaLabel', { type: typeConfig.label.toLowerCase() })}
```

---

### Task 15: Update ItemNameEditor Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`

**Current Hardcoded Strings:**
- Line 47: "Enter item name" (default placeholder)
- Line 69: "Item Name" (label)
- Line 107: "This name will appear on the QR code label" (hint)

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.itemEditor');

placeholder = t('placeholder')
<span>{t('itemName')}</span>
<p>{t('hint')}</p>
```

---

### Task 16: Update TagsEditor Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx`

**Current Hardcoded Strings:**
- Line 84: `Remove ${label} tag` (aria-label)
- Line 184: "Add tag" (aria-label)
- Line 188: "Add Tag" (button text)

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.tagsEditor');

aria-label={t('removeTagAriaLabel', { tag: label })}
aria-label={t('addTag')}
<span>{t('addTag')}</span>
```

---

### Task 17: Update DuplicateNameWarning Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx`

**Current Hardcoded Strings:**
- Lines 37-40: MESSAGES constant
- Lines 98-100: "+X more..." text

**Changes Required:**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('workflow.shared.duplicateWarning');

const message = matchType === 'exact' ? t('exact') : t('similar');
<li>{t('moreItems', { count: matchingNames.length - 3 })}</li>
```

---

### Task 18: Update Remaining Low-Priority Components

Update the following components with minimal string changes:

1. **RoomCard.tsx** - aria-labels only
2. **ItemTypeCard.tsx** - aria-labels only
3. **SuggestionButton.tsx** - aria-labels only
4. **SessionItemCard.tsx** - content labels and aria-labels
5. **ItemContextDisplay.tsx** - display labels
6. **SortableContentPieceCard.tsx** - inherits from ContentPieceCard

---

## Authorized Files and Functions for Modification

### Translation Files

| File Path | Action |
|-----------|--------|
| `/messages/en.json` | ADD `workflow.shared` namespace (~150 keys) |
| `/messages/fr.json` | ADD translations for `workflow.shared` |
| `/messages/es.json` | ADD translations for `workflow.shared` |
| `/messages/de.json` | ADD translations for `workflow.shared` |
| `/messages/nl.json` | ADD translations for `workflow.shared` |
| `/messages/it.json` | ADD translations for `workflow.shared` |

### Component Files

| File Path | Functions to Modify |
|-----------|---------------------|
| `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | `WorkflowHeader` |
| `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx` | `SessionProgressBar` |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | `ConfirmExitDialog`, `getExitMessage` |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | `EmptySessionDialog` |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | `RemoveItemDialog` |
| `/src/components/ItemCreationWorkflow/components/shared/CameraPermissionFallback.tsx` | `CameraPermissionFallback`, constants |
| `/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx` | `NetworkErrorIndicator` |
| `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | `SessionRecoveryBanner` |
| `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` | `QRGenerationProgress`, `ProgressBar`, `ItemStatusRow`, `ErrorBanner`, `CancelButton` |
| `/src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | `PrintOptionsPanel`, `ScopeCard`, `SelectableItemRow`, constants |
| `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | `PDFExportDialog` |
| `/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | `ContentPieceCard`, `TYPE_CONFIG` |
| `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | `ContentPreview`, `TYPE_CONFIG`, sub-components |
| `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | `ItemNameEditor` |
| `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` | `TagsEditor`, `TagChip` |
| `/src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx` | `DuplicateNameWarning`, `MESSAGES` |
| `/src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | `RoomCard` |
| `/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | `ItemTypeCard` |
| `/src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx` | `SuggestionButton` |
| `/src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx` | `SessionItemCard` |
| `/src/components/ItemCreationWorkflow/components/shared/ItemContextDisplay.tsx` | `ItemContextDisplay` |
| `/src/components/ItemCreationWorkflow/components/shared/SortableContentPieceCard.tsx` | `SortableContentPieceCard` |

---

## Verification Checklist

### Per-Component Verification

For each component, verify:

- [ ] Import `useTranslations` from 'next-intl'
- [ ] Hook called at top of component with correct namespace
- [ ] All hardcoded strings replaced with `t()` calls
- [ ] Pluralization uses ICU format where applicable
- [ ] Variable interpolation uses `{variable}` syntax
- [ ] Aria-labels are translated
- [ ] No string concatenation for translatable content
- [ ] Component renders correctly in English
- [ ] No TypeScript errors

### Integration Verification

- [ ] Build completes without errors: `npm run build`
- [ ] All translation keys exist in en.json
- [ ] All translation keys exist in other 5 language files
- [ ] No runtime warnings about missing translations
- [ ] Workflow functions correctly end-to-end
- [ ] Language switching displays translated content

### Visual Verification

- [ ] Dialogs display correctly (no text overflow)
- [ ] Progress indicators show proper pluralization
- [ ] Error messages display appropriately
- [ ] Print options panel maintains layout
- [ ] Content cards display type labels correctly

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| All button text uses translated strings | Tasks 2-17 |
| All label and field text uses translations | Tasks 2-17 |
| Progress indicators display translated status | Tasks 3, 9, 10, 11 |
| Navigation controls show translated text | Task 2 |
| Validation messages appear in selected language | Tasks 4, 5, 6, 17 |
| Tooltips and helper text display translations | Tasks 7, 15, 17 |
| Icon labels and accessibility text translated | All tasks |
| Error states show translated error messages | Tasks 7, 8, 10, 11, 12 |
| Loading states display translated text | Tasks 10, 11, 12, 14 |
| Confirmation dialogs present translated messages | Tasks 4, 5, 6, 12 |
| No hardcoded English strings remain | All tasks |
| Components render correctly in all languages | Verification |
| Translation keys follow naming conventions | Task 1 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys at runtime | Medium | Medium | Build-time validation, test coverage |
| Pluralization format errors | Low | Medium | ICU format testing, review |
| Layout breaks with longer translations | Medium | Low | Design with 40% expansion buffer |
| Performance impact from hook calls | Low | Low | Hooks are optimized, memoization where needed |
| Breaking existing tests | Medium | Medium | Update test expectations for translated strings |

---

## Notes

- All components are client components ('use client'), so they use `useTranslations` hook
- The `workflow.shared` namespace keeps translations organized and enables code-splitting
- Constants like `TYPE_CONFIG` may need to be memoized with the translation function
- Some aria-labels use variable interpolation for dynamic content (item names, counts)
- The `TruncatedText.tsx` component has no translatable strings (utility only)

---

*Document generated for FAQBNB Localization Epic 2 - Task 2C.11*
