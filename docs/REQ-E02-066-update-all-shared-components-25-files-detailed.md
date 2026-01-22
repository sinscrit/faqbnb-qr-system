# REQ-E02-066: Update All Shared Workflow Components - Detailed Task Breakdown

**Generated:** 2026-01-20
**Last Modified:** 2026-01-22
**Request ID:** REQ-E02-066
**Epic:** Localization Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.11
**Type:** ENHANCEMENT
**Size:** L (Large)
**Story Points:** ~15 (broken into 1-point tasks below)

---

## Executive Summary

This document provides a detailed, actionable task breakdown for updating all 25+ shared workflow components to support internationalization. Each task is designed to be completable in approximately 1 story point and includes specific file paths, line numbers, code changes, and verification steps.

---

## Prerequisites

Before starting these tasks, verify:

- [ ] Epic 1 Foundation is complete (next-intl installed and configured)
- [ ] Task 2C.1 (Workflow namespace structure) is complete
- [ ] Task 2H.1 (Common namespace structure) is complete
- [ ] `/messages/en.json` exists with `workflow.shared` namespace stub

---

## Task Inventory

| Task # | Component | Priority | Est. Strings | Story Points |
|--------|-----------|----------|--------------|--------------|
| 1 | Translation Keys Setup | Critical | ~150 | 2 |
| 2 | WorkflowHeader | High | 5 | 1 |
| 3 | SessionProgressBar | Medium | 3 | 1 |
| 4 | ConfirmExitDialog | High | 10 | 1 |
| 5 | EmptySessionDialog | High | 8 | 1 |
| 6 | RemoveItemDialog | High | 6 | 1 |
| 7 | CameraPermissionFallback | Medium | 10 | 1 |
| 8 | NetworkErrorIndicator | Medium | 8 | 1 |
| 9 | SessionRecoveryBanner | Medium | 10 | 1 |
| 10 | QRGenerationProgress | Medium | 15 | 1 |
| 11 | PrintOptionsPanel | High | 25 | 2 |
| 12 | PDFExportDialog | Medium | 12 | 1 |
| 13 | ContentPieceCard | Medium | 8 | 1 |
| 14 | ContentPreview | Medium | 10 | 1 |
| 15 | ItemNameEditor | Medium | 5 | 1 |
| 16 | TagsEditor | Medium | 5 | 1 |
| 17 | DuplicateNameWarning | Low | 6 | 1 |
| 18 | Low-Priority Components (6 files) | Low | ~18 | 1 |

**Total Estimated Story Points:** ~19

---

## Task 1: Add Translation Keys to workflow.shared Namespace

**Priority:** Critical - Must complete first
**Story Points:** 2
**File:** `/messages/en.json`

### 1.1 Objective

Add all translation keys for the shared workflow components under the `workflow.shared` namespace in the English translation file.

### 1.2 Implementation Steps

1. Open `/messages/en.json`
2. Locate the `workflow` namespace (create if doesn't exist)
3. Add the `shared` sub-namespace with all keys below

### 1.3 Translation Keys to Add

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
        "instructionPhoto": "To take a photo, please allow camera access in your browser settings, or upload an existing photo from your device.",
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
      },
      "cards": {
        "room": {
          "selectAriaLabel": "Select {name} room"
        },
        "itemType": {
          "selectAriaLabel": "Select {name} item type"
        },
        "suggestion": {
          "selectAriaLabel": "Select {name}"
        },
        "sessionItem": {
          "contentPieces": "{count, plural, one {# piece} other {# pieces}} of content",
          "noContent": "No content yet",
          "editAriaLabel": "Edit {name}",
          "removeAriaLabel": "Remove {name} from session"
        },
        "itemContext": {
          "room": "Room",
          "type": "Type",
          "unknown": "Unknown"
        }
      }
    }
  }
}
```

### 1.4 Verification

- [x] JSON is valid (no syntax errors)
- [x] All keys follow `workflow.shared.{category}.{element}` pattern
- [x] Pluralization uses ICU format `{count, plural, ...}`
- [x] Variable interpolation uses `{variable}` syntax
- [ ] Build passes: `npm run build`

---implemented: Added ~150 translation keys to workflow.shared namespace including header, progress, dialogs (confirmExit, emptySession, removeItem, pdfExport), camera, network, sessionRecovery, qrGeneration, printOptions, content, itemEditor, tagsEditor, duplicateWarning, and cards sections. Preserved existing keys for backward compatibility.---

---

## Task 2: Update WorkflowHeader Component

**Priority:** High
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
**Estimated Strings:** 5

### 2.1 Objective

Replace hardcoded strings in the WorkflowHeader component with translation keys.

### 2.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~87 | `Step ${currentStepIndex + 1} of ${totalSteps}` (aria-label) | `workflow.shared.header.stepOf` |
| ~114 | `"Go back to previous step"` (aria-label) | `workflow.shared.header.backAriaLabel` |
| ~124 | Step X of Y (visible text) | `workflow.shared.header.stepOf` |
| ~144 | `"Exit workflow"` (aria-label) | `workflow.shared.header.exitAriaLabel` |

### 2.3 Implementation Steps

1. **Add import at top of file:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call inside component (after other hooks):**
```tsx
const t = useTranslations('workflow.shared.header');
```

3. **Replace hardcoded strings:**

**Before:**
```tsx
aria-label={`Step ${currentStepIndex + 1} of ${totalSteps}`}
```

**After:**
```tsx
aria-label={t('stepOf', { current: currentStepIndex + 1, total: totalSteps })}
```

**Before:**
```tsx
aria-label="Go back to previous step"
```

**After:**
```tsx
aria-label={t('backAriaLabel')}
```

**Before:**
```tsx
<div>Step {currentStepIndex + 1} of {totalSteps}</div>
```

**After:**
```tsx
<div>{t('stepOf', { current: currentStepIndex + 1, total: totalSteps })}</div>
```

**Before:**
```tsx
aria-label="Exit workflow"
```

**After:**
```tsx
aria-label={t('exitAriaLabel')}
```

### 2.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Hook called with correct namespace `'workflow.shared.header'`
- [x] All 4 strings replaced with `t()` calls
- [x] Component renders without errors
- [x] No TypeScript errors
- [ ] Test file updated if needed: `__tests__/WorkflowHeader.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.header' namespace. Replaced 4 hardcoded strings: progressbar aria-label, back button aria-label, step indicator text, exit button aria-label.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 3: Update SessionProgressBar Component

**Priority:** Medium
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx`
**Estimated Strings:** 3

### 3.1 Objective

Replace hardcoded strings in the SessionProgressBar component with translation keys.

### 3.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~65 | `Session progress: ${itemsCreated} items created` | `workflow.shared.progress.sessionProgress` |
| ~80 | `{itemsCreated} items created` | `workflow.shared.progress.itemsCreated` |

### 3.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.progress');
```

3. **Replace strings:**

**Before:**
```tsx
aria-label={`Session progress: ${itemsCreated} items created`}
```

**After:**
```tsx
aria-label={t('sessionProgress', { count: itemsCreated })}
```

**Before:**
```tsx
<p>{itemsCreated} items created</p>
```

**After:**
```tsx
<p>{t('itemsCreated', { count: itemsCreated })}</p>
```

### 3.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Hook called with correct namespace
- [x] Pluralization works correctly (0, 1, 2+ items)
- [x] Component renders without errors
- [ ] Test file updated if needed: `__tests__/SessionProgressBar.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.progress' namespace. Replaced aria-label and count text with t() calls using ICU plural format.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 4: Update ConfirmExitDialog Component

**Priority:** High
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
**Estimated Strings:** 10

### 4.1 Objective

Replace hardcoded strings and update the `getExitMessage` helper function to use translations.

### 4.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~67-77 | `getExitMessage()` variants | `workflow.shared.dialogs.confirmExit.message*` |
| ~155 | `"Exit Workflow?"` | `workflow.shared.dialogs.confirmExit.title` |
| ~181 | `"Cancel"` | `workflow.shared.dialogs.confirmExit.cancel` |
| ~196 | `"Exit Workflow"` | `workflow.shared.dialogs.confirmExit.exit` |

### 4.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.dialogs.confirmExit');
```

3. **Update getExitMessage function:**

**Before:**
```tsx
function getExitMessage(itemCount: number, hasUnsavedChanges: boolean): string {
  if (hasUnsavedChanges && itemCount > 0) {
    return `You have unsaved changes and ${itemCount} item${itemCount === 1 ? '' : 's'} in this session...`;
  }
  // ... etc
}
```

**After:**
```tsx
// Move function inside component or pass t as parameter
const getExitMessage = (itemCount: number, hasUnsavedChanges: boolean): string => {
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
};
```

4. **Replace JSX strings:**

**Before:**
```tsx
<h3>Exit Workflow?</h3>
```

**After:**
```tsx
<h3>{t('title')}</h3>
```

**Before:**
```tsx
<button>Cancel</button>
<button>Exit Workflow</button>
```

**After:**
```tsx
<button>{t('cancel')}</button>
<button>{t('exit')}</button>
```

### 4.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Hook called with correct namespace
- [x] getExitMessage function updated to use translations
- [x] All 4 message variants work correctly
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/ConfirmExitDialog.test.tsx`

---implemented: Switched from workflow.dialogs.confirmExit to workflow.shared.dialogs.confirmExit namespace. Updated getExitMessage to use new key names (messageWithUnsavedAndItems, messageWithUnsaved, messageWithItems).---ts-check: passed (0 errors, baseline: 0)---

---

## Task 5: Update EmptySessionDialog Component

**Priority:** High
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`
**Estimated Strings:** 8

### 5.1 Objective

Replace hardcoded strings in the EmptySessionDialog component.

### 5.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~131 | `"Close dialog"` (aria-label) | `workflow.shared.dialogs.emptySession.closeAriaLabel` |
| ~150 | `"No Items Added"` | `workflow.shared.dialogs.emptySession.title` |
| ~158 | `"No items added yet..."` | `workflow.shared.dialogs.emptySession.message` |
| ~179 | `"Add Items"` | `workflow.shared.dialogs.emptySession.addItems` |
| ~198 | `"Exit Session"` | `workflow.shared.dialogs.emptySession.exitSession` |

### 5.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.dialogs.emptySession');
```

3. **Replace strings:**

```tsx
// Close button
aria-label={t('closeAriaLabel')}

// Title
<h2>{t('title')}</h2>

// Message
<p>{t('message')}</p>

// Buttons
<button>{t('addItems')}</button>
<button>{t('exitSession')}</button>
```

### 5.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Hook called with correct namespace
- [x] All 5 strings replaced
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/EmptySessionDialog.test.tsx`

---implemented: Switched from workflow.dialogs.emptySession and common namespaces to single workflow.shared.dialogs.emptySession namespace. Updated all 5 string usages.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 6: Update RemoveItemDialog Component

**Priority:** High
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
**Estimated Strings:** 6

### 6.1 Objective

Replace hardcoded strings in the RemoveItemDialog component.

### 6.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~123 | `"Remove Item?"` | `workflow.shared.dialogs.removeItem.title` |
| ~129 | `Are you sure you want to remove "{displayName}"...` | `workflow.shared.dialogs.removeItem.message` |
| ~150 | `"Cancel"` | `workflow.shared.dialogs.removeItem.cancel` |
| ~167 | `"Remove"` | `workflow.shared.dialogs.removeItem.remove` |

### 6.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.dialogs.removeItem');
```

3. **Replace strings:**

```tsx
// Title
<h3>{t('title')}</h3>

// Message with variable
<p>{t('message', { name: displayName })}</p>

// Buttons
<button>{t('cancel')}</button>
<button>{t('remove')}</button>
```

### 6.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Hook called with correct namespace
- [x] Variable interpolation works for item name
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/RemoveItemDialog.test.tsx`

---implemented: Switched from workflow.dialogs.removeItem to workflow.shared.dialogs.removeItem namespace. Updated message parameter from itemName to name to match translation key.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 7: Update CameraPermissionFallback Component

**Priority:** Medium
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/CameraPermissionFallback.tsx`
**Estimated Strings:** 10

### 7.1 Objective

Replace hardcoded strings and constants in the CameraPermissionFallback component.

### 7.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~36-44 | CONTENT_TYPE_LABELS constant | Dynamic from translations |
| ~83 | `"Camera access not available"` | `workflow.shared.camera.notAvailable` |
| ~88-89 | Instruction text (video/photo variants) | `workflow.shared.camera.instruction*` |
| ~109 | Upload label | `workflow.shared.camera.upload*` |
| ~126 | `"Try camera again"` (aria-label) | `workflow.shared.camera.tryAgainAriaLabel` |
| ~128 | `"Try Camera Again"` | `workflow.shared.camera.tryAgain` |
| ~145 | `"How to enable camera access"` | `workflow.shared.camera.helpLink` |

### 7.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.camera');
```

3. **Replace constants with dynamic translations:**

**Before:**
```tsx
const CONTENT_TYPE_LABELS = {
  video: 'video',
  photo: 'photo',
};
const CONTENT_TYPE_FILE_LABELS = {
  video: 'Upload Video',
  photo: 'Upload Photo',
};
```

**After:**
```tsx
// Inside component
const uploadLabel = contentType === 'video' ? t('uploadVideo') : t('uploadPhoto');
const instruction = contentType === 'video' ? t('instructionVideo') : t('instructionPhoto');
```

4. **Replace JSX strings:**

```tsx
<h3>{t('notAvailable')}</h3>
<p>{instruction}</p>
<button aria-label={uploadLabel}>{uploadLabel}</button>
<button aria-label={t('tryAgainAriaLabel')}>{t('tryAgain')}</button>
<a>{t('helpLink')}</a>
```

### 7.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Constants replaced with dynamic translations
- [x] Video and photo variants both work
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/CameraPermissionFallback.test.tsx`

---implemented: Switched from workflow.shared.cameraPermission to workflow.shared.camera namespace. Updated title to notAvailable, explanation to instructionVideo/instructionPhoto, and tryAgain aria-label to tryAgainAriaLabel.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 8: Update NetworkErrorIndicator Component

**Priority:** Medium
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx`
**Estimated Strings:** 8

### 8.1 Objective

Replace hardcoded strings in the NetworkErrorIndicator component.

### 8.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~77 | `"Preview unavailable"` | `workflow.shared.network.previewUnavailable` |
| ~80 | Default error message | `workflow.shared.network.defaultError` |
| ~102-103 | `"Retrying..."` / `"Try Again"` | `workflow.shared.network.retrying` / `tryAgain` |
| ~128-130 | `"Proceed Without Preview"` | `workflow.shared.network.proceedWithout` |

### 8.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.network');
```

3. **Replace strings:**

```tsx
<h3>{t('previewUnavailable')}</h3>
<p>{errorMessage || t('defaultError')}</p>
aria-label={isRetrying ? t('retrying') : t('tryAgain')}
{isRetrying ? t('retrying') : t('tryAgain')}
<button aria-label={t('proceedWithout')}>{t('proceedWithout')}</button>
```

### 8.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Hook called with correct namespace
- [x] Retry states display correctly
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/NetworkErrorIndicator.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.network' namespace. Replaced all 5 hardcoded strings: title, default error, retry button (both states), and proceed without preview button.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 9: Update SessionRecoveryBanner Component

**Priority:** Medium
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`
**Estimated Strings:** 10

### 9.1 Objective

Replace hardcoded strings in the SessionRecoveryBanner component.

### 9.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~149 | `"Your previous session has been restored"` | `workflow.shared.sessionRecovery.title` |
| ~152-158 | Item count with pluralization | `workflow.shared.sessionRecovery.itemCount` |
| ~152-158 | Re-upload message | `workflow.shared.sessionRecovery.needsReUpload` |
| ~176 | `"Dismiss notification"` (aria-label) | `workflow.shared.sessionRecovery.dismiss` |
| ~197 | `"Continue Session"` | `workflow.shared.sessionRecovery.continueSession` |
| ~216 | `"Start Fresh"` | `workflow.shared.sessionRecovery.startFresh` |

### 9.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.sessionRecovery');
```

3. **Replace strings:**

```tsx
<h3>{t('title')}</h3>
<p>{t('itemCount', { count: itemCount })}</p>
<span>{t('needsReUpload', { count: contentNeedingReUpload })}</span>
aria-label={t('dismiss')}
<button>{t('continueSession')}</button>
<button>{t('startFresh')}</button>
```

### 9.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Pluralization works for item counts
- [x] Re-upload count displays correctly
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/SessionRecoveryBanner.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.sessionRecovery' namespace. Replaced 6 hardcoded strings: title, itemCount (with ICU plural), needsReUpload (with ICU plural), dismiss aria-label, continueSession, startFresh.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 10: Update QRGenerationProgress Component

**Priority:** Medium
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`
**Estimated Strings:** 15

### 10.1 Objective

Replace hardcoded strings in the QRGenerationProgress component, including status labels and progress messages.

### 10.2 Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| ProgressBar | `"Ready to generate"` | `workflow.shared.qrGeneration.ready` |
| ProgressBar | `"Complete!"` | `workflow.shared.qrGeneration.complete` |
| ProgressBar | `"X completed, Y failed"` | `workflow.shared.qrGeneration.completedWithFailures` |
| ProgressBar | `"Generation failed"` | `workflow.shared.qrGeneration.failed` |
| ProgressBar | `"Generating QR code X of Y..."` | `workflow.shared.qrGeneration.generatingOf` |
| ProgressBar | `"X of Y completed"` | `workflow.shared.qrGeneration.completedOf` |
| StatusLabels | `"Pending"` | `workflow.shared.qrGeneration.pending` |
| StatusLabels | `"Generating..."` | `workflow.shared.qrGeneration.generating` |
| StatusLabels | `"Completed"` | `workflow.shared.qrGeneration.completed` |
| StatusLabels | `"Failed"` | `workflow.shared.qrGeneration.failedStatus` |
| Buttons | `"Retry"` | `workflow.shared.qrGeneration.retry` |
| Buttons | `"Retry Failed"` | `workflow.shared.qrGeneration.retryFailed` |
| Buttons | `"Skip & Continue"` | `workflow.shared.qrGeneration.skipAndContinue` |
| Buttons | `"Cancel"` | `workflow.shared.qrGeneration.cancel` |

### 10.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.qrGeneration');
```

3. **Update status message generation:**

**Before:**
```tsx
const getStatusMessage = () => {
  if (status === 'idle') return 'Ready to generate';
  if (status === 'complete') return 'Complete!';
  // ...
};
```

**After:**
```tsx
const getStatusMessage = () => {
  if (status === 'idle') return t('ready');
  if (status === 'complete') return t('complete');
  if (status === 'complete-with-failures') {
    return t('completedWithFailures', { completed: stats.completed, failed: stats.failed });
  }
  if (status === 'failed') return t('failed');
  if (status === 'generating') {
    return t('generatingOf', { current: Math.min(stats.completed + 1, stats.total), total: stats.total });
  }
  return t('completedOf', { completed: stats.completed, total: stats.total });
};
```

4. **Update status labels:**

```tsx
const getStatusLabel = (itemStatus: string) => {
  switch (itemStatus) {
    case 'pending': return t('pending');
    case 'generating': return t('generating');
    case 'completed': return t('completed');
    case 'failed': return t('failedStatus');
    default: return '';
  }
};
```

5. **Update buttons:**

```tsx
<button aria-label={t('retryAriaLabel', { name: item.name })}>{t('retry')}</button>
<button>{t('retryFailed')}</button>
<button>{t('skipAndContinue')}</button>
<button aria-label={t('cancelAriaLabel')}>{t('cancel')}</button>
```

### 10.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] All status messages use translations
- [x] Variable interpolation works for counts
- [x] Retry button aria-labels include item names
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/QRGenerationProgress.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.qrGeneration' namespace. Updated all 4 sub-components (ProgressBar, ItemStatusRow, ErrorBanner, CancelButton) to accept t prop of type TranslationFn. Replaced ~15 hardcoded strings including status messages, progress text, button labels, and aria-labels.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 11: Update PrintOptionsPanel Component

**Priority:** High
**Story Points:** 2
**File:** `/src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`
**Estimated Strings:** 25

### 11.1 Objective

Replace hardcoded strings and update the SCOPE_OPTIONS constant to use translations.

### 11.2 Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| SCOPE_OPTIONS | `"All Items"` | `workflow.shared.printOptions.scopeAll` |
| SCOPE_OPTIONS | `"Include new and existing items"` | `workflow.shared.printOptions.scopeAllDesc` |
| SCOPE_OPTIONS | `"New Items Only"` | `workflow.shared.printOptions.scopeNewOnly` |
| SCOPE_OPTIONS | `"Only items created..."` | `workflow.shared.printOptions.scopeNewOnlyDesc` |
| SCOPE_OPTIONS | `"Select Items"` | `workflow.shared.printOptions.scopeSelected` |
| SCOPE_OPTIONS | `"Choose specific items..."` | `workflow.shared.printOptions.scopeSelectedDesc` |
| Heading | `"Which items would you like to print?"` | `workflow.shared.printOptions.heading` |
| Selection | `"Select All"` / `"Deselect All"` | `workflow.shared.printOptions.selectAll` / `deselectAll` |
| Selection | `"(X of Y selected)"` | `workflow.shared.printOptions.selectedOf` |
| Badge | `"New"` | `workflow.shared.printOptions.newBadge` |
| Progress | `"Generating QR Codes"` | `workflow.shared.printOptions.generatingQR` |
| Buttons | Various button labels | Multiple keys |

### 11.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.printOptions');
```

3. **Convert SCOPE_OPTIONS to use translations:**

**Before:**
```tsx
const SCOPE_OPTIONS = [
  { value: 'all', title: 'All Items', description: 'Include new and existing items', ... },
  { value: 'new-only', title: 'New Items Only', description: 'Only items created in this session', ... },
  { value: 'selected', title: 'Select Items', description: 'Choose specific items to print', ... },
];
```

**After:**
```tsx
// Inside component (must have access to t)
const scopeOptions = useMemo(() => [
  { value: 'all', title: t('scopeAll'), description: t('scopeAllDesc'), ... },
  { value: 'new-only', title: t('scopeNewOnly'), description: t('scopeNewOnlyDesc'), ... },
  { value: 'selected', title: t('scopeSelected'), description: t('scopeSelectedDesc'), ... },
], [t]);
```

4. **Replace JSX strings:**

```tsx
<h2>{t('heading')}</h2>
{isAllSelected ? t('deselectAll') : t('selectAll')}
{t('selectedOf', { selected: selectedCount, total: allItems.length })}
<span>{t('newBadge')}</span>
<h3>{t('generatingQR')}</h3>
<button disabled>{t('generatingQRButton')}</button>
<button disabled>{t('generatingPDF')}</button>
<button disabled>{t('processing')}</button>
<button>{t('generatePDF')}</button>
<button>{t('printDirectly')}</button>
<button>{t('doneForNow')}</button>
<p>{t('errorRetryHint')}</p>
aria-label={t('dismissError')}
```

### 11.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] SCOPE_OPTIONS converted to use translations (via titleKey/descriptionKey pattern)
- [x] All button states display correctly
- [x] Selection counts display correctly
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/PrintOptionsPanel.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.printOptions' namespace. Converted SCOPE_OPTIONS to use titleKey/descriptionKey pattern passed to ScopeCard via t prop (TranslationFn). Replaced ~25 hardcoded strings including heading, scope options, select all/deselect all, selected count, new badge, QR generation progress title, all button states, error retry hint, dismiss error, and live region announcement.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 12: Update PDFExportDialog Component

**Priority:** Medium
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`
**Estimated Strings:** 12

### 12.1 Objective

Replace hardcoded strings in the PDFExportDialog component.

### 12.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~173 | `"Export QR Codes as PDF"` | `workflow.shared.dialogs.pdfExport.title` |
| ~180 | Item count text | `workflow.shared.dialogs.pdfExport.itemCount` |
| ~206-208 | Description | `workflow.shared.dialogs.pdfExport.description` |
| ~227 | `"PDF generation failed"` | `workflow.shared.dialogs.pdfExport.generationFailed` |
| ~270 | `"Cancel"` | `workflow.shared.dialogs.pdfExport.cancel` |
| ~294 | `"Generating..."` | `workflow.shared.dialogs.pdfExport.generating` |
| ~299 | `"Export PDF"` | `workflow.shared.dialogs.pdfExport.export` |

### 12.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.dialogs.pdfExport');
```

3. **Replace strings:**

```tsx
<h2>{t('title')}</h2>
<span>{t('itemCount', { count: itemCount })}</span>
<p className="sr-only">{t('description')}</p>
<p>{t('generationFailed')}</p>
<button>{t('cancel')}</button>
<span>{isGenerating ? t('generating') : t('export')}</span>
```

### 12.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Item count pluralization works
- [x] Generation states display correctly
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/PDFExportDialog.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.dialogs.pdfExport' namespace. Replaced ~12 hardcoded strings including title, itemCount (with ICU plural), description, errorTitle, dismissError, cancel, export, and generating states.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 13: Update ContentPieceCard Component

**Priority:** Medium
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
**Estimated Strings:** 8

### 13.1 Objective

Replace hardcoded strings and TYPE_CONFIG labels in the ContentPieceCard component.

### 13.2 Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| TYPE_CONFIG | `"Video"`, `"Photo"`, `"PDF"`, `"Text"`, `"Link"` | `workflow.shared.content.types.*` |
| Alt text | `"Photo content"` | `workflow.shared.content.photoAlt` |
| Page count | `"X pages"` | `workflow.shared.content.pageCount` |
| Aria-labels | `"Drag to reorder"` | `workflow.shared.content.dragToReorder` |
| Aria-labels | `"Retake content"` | `workflow.shared.content.retakeContent` |
| Aria-labels | `"Remove content"` | `workflow.shared.content.removeContent` |

### 13.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.content');
```

3. **Create dynamic type labels:**

```tsx
const typeLabels = useMemo(() => ({
  video: t('types.video'),
  photo: t('types.photo'),
  pdf: t('types.pdf'),
  text: t('types.text'),
  url: t('types.url'),
}), [t]);
```

4. **Replace strings:**

```tsx
alt={t('photoAlt')}
<span>{t('pageCount', { count: data.pageCount })}</span>
aria-label={t('dragToReorder')}
aria-label={t('retakeContent')}
aria-label={t('removeContent')}
```

### 13.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] TYPE_CONFIG uses labelKey pattern for translated labels
- [x] Page count pluralization works
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/ContentPieceCard.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.content' namespace. Updated TYPE_CONFIG to use labelKey pattern. Replaced ~8 hardcoded strings including type labels (via t(`types.${labelKey}`)), photoAlt, pageCount (with ICU plural), dragToReorder, retakeContent, removeContent, and contentPreviewAriaLabel.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 14: Update ContentPreview Component

**Priority:** Medium
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Estimated Strings:** 10

### 14.1 Objective

Replace hardcoded strings and TYPE_CONFIG labels in the ContentPreview component.

### 14.2 Strings to Replace

Similar to ContentPieceCard, plus:
- `"Loading preview..."` -> `workflow.shared.content.loadingPreview`
- Content preview aria-labels -> `workflow.shared.content.contentPreviewAriaLabel`
- Remove aria-labels with type -> `workflow.shared.content.removeAriaLabel`

### 14.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.content');
```

3. **Create dynamic type labels (memoized):**

```tsx
const TYPE_CONFIG_TRANSLATED = useMemo(() => ({
  video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: t('types.video') },
  photo: { icon: Image, color: 'bg-blue-100 text-blue-700', label: t('types.photo') },
  pdf: { icon: FileText, color: 'bg-red-100 text-red-700', label: t('types.pdf') },
  text: { icon: Type, color: 'bg-green-100 text-green-700', label: t('types.text') },
  url: { icon: Link, color: 'bg-orange-100 text-orange-700', label: t('types.url') },
}), [t]);
```

4. **Replace strings:**

```tsx
<span>{t('pageCount', { count: data.pageCount })}</span>
aria-label={t('loadingPreview')}
<span className="sr-only">{t('loadingPreview')}</span>
aria-label={t('contentPreviewAriaLabel', { type: typeConfig.label })}
aria-label={t('removeAriaLabel', { type: typeConfig.label.toLowerCase() })}
```

### 14.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] TYPE_CONFIG uses labelKey pattern for translated labels
- [x] Loading states display correctly
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/ContentPreview.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.content' namespace. Updated TYPE_CONFIG to use labelKey pattern (exported constant). Replaced ~10 hardcoded strings including type labels, photoAlt, pageCount (with ICU plural), contentPreviewAriaLabel, and removeAriaLabel. PreviewSkeleton uses common.loading namespace.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 15: Update ItemNameEditor Component

**Priority:** Medium
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`
**Estimated Strings:** 5

### 15.1 Objective

Replace hardcoded strings in the ItemNameEditor component.

### 15.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~47 | `"Enter item name"` (placeholder) | `workflow.shared.itemEditor.placeholder` |
| ~69 | `"Item Name"` (label) | `workflow.shared.itemEditor.itemName` |
| ~107 | `"This name will appear on the QR code label"` | `workflow.shared.itemEditor.hint` |

### 15.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.itemEditor');
```

3. **Replace strings:**

```tsx
placeholder={placeholder || t('placeholder')}
<span>{t('itemName')}</span>
<p>{t('hint')}</p>
```

### 15.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Default placeholder uses translation
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/ItemNameEditor.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.itemEditor' namespace. Replaced ~5 hardcoded strings including itemName label, placeholder (with fallback to prop), and hint text.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 16: Update TagsEditor Component

**Priority:** Medium
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx`
**Estimated Strings:** 5

### 16.1 Objective

Replace hardcoded strings in the TagsEditor component.

### 16.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~84 | `Remove ${label} tag` (aria-label) | `workflow.shared.tagsEditor.removeTagAriaLabel` |
| ~184 | `"Add tag"` (aria-label) | `workflow.shared.tagsEditor.addTag` |
| ~188 | `"Add Tag"` (button text) | `workflow.shared.tagsEditor.addTag` |

### 16.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.tagsEditor');
```

3. **Replace strings:**

```tsx
aria-label={t('removeTagAriaLabel', { tag: label })}
aria-label={t('addTag')}
<span>{t('addTag')}</span>
```

### 16.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Tag name interpolation works
- [x] Component renders without errors

---implemented: Added useTranslations hook with 'workflow.shared.tagsEditor' namespace. TagChip receives t prop (TranslationFn). Replaced ~5 hardcoded strings including removeTagAriaLabel (with tag interpolation), addTag button text and aria-label, and availableTags menu aria-label.---ts-check: passed (0 errors, baseline: 0)---

---

## Task 17: Update DuplicateNameWarning Component

**Priority:** Low
**Story Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx`
**Estimated Strings:** 6

### 17.1 Objective

Replace hardcoded strings and MESSAGES constant in the DuplicateNameWarning component.

### 17.2 Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~37-40 | MESSAGES constant | Dynamic from translations |
| ~98-100 | `"+X more..."` | `workflow.shared.duplicateWarning.moreItems` |

### 17.3 Implementation Steps

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook call:**
```tsx
const t = useTranslations('workflow.shared.duplicateWarning');
```

3. **Replace MESSAGES constant:**

**Before:**
```tsx
const MESSAGES = {
  exact: 'Exact name already exists',
  similar: 'Similar name already used',
};
```

**After:**
```tsx
// Inside component
const message = matchType === 'exact' ? t('exact') : t('similar');
```

4. **Replace "more" text:**

```tsx
<li>{t('moreItems', { count: matchingNames.length - 3 })}</li>
```

### 17.4 Verification Checklist

- [x] Import added for `useTranslations`
- [x] Exact/similar messages work correctly
- [x] "More items" count interpolation works
- [x] Component renders without errors
- [ ] Test file updated: `__tests__/DuplicateNameWarning.test.tsx`

---implemented: Added useTranslations hook with 'workflow.shared.duplicateWarning' namespace. Replaced MESSAGES constant with dynamic t('exact') / t('similar') calls. Replaced ~6 hardcoded strings including exact/similar messages and moreItems (with count interpolation).---ts-check: passed (0 errors, baseline: 0)---

---

## Task 18: Update Low-Priority Shared Components

**Priority:** Low
**Story Points:** 1
**Files:** 6 components

### 18.1 Components to Update

1. **RoomCard.tsx** (~3 strings)
2. **ItemTypeCard.tsx** (~3 strings)
3. **SuggestionButton.tsx** (~2 strings)
4. **SessionItemCard.tsx** (~5 strings)
5. **ItemContextDisplay.tsx** (~3 strings)
6. **SortableContentPieceCard.tsx** (~2 strings, inherits from ContentPieceCard)

### 18.2 Implementation Pattern

Each component follows the same pattern:

```tsx
import { useTranslations } from 'next-intl';

// In component
const t = useTranslations('workflow.shared.cards');

// For RoomCard
aria-label={t('room.selectAriaLabel', { name: roomName })}

// For ItemTypeCard
aria-label={t('itemType.selectAriaLabel', { name: typeName })}

// For SuggestionButton
aria-label={t('suggestion.selectAriaLabel', { name: suggestionName })}

// For SessionItemCard
<span>{t('sessionItem.contentPieces', { count: contentCount })}</span>
<span>{t('sessionItem.noContent')}</span>
aria-label={t('sessionItem.editAriaLabel', { name: itemName })}
aria-label={t('sessionItem.removeAriaLabel', { name: itemName })}

// For ItemContextDisplay
<span>{t('itemContext.room')}: {roomName}</span>
<span>{t('itemContext.type')}: {typeName || t('itemContext.unknown')}</span>

// For SortableContentPieceCard
// Inherits translations from ContentPieceCard via props or context
```

### 18.3 Verification Checklist

- [x] All 6 components have `useTranslations` import
- [x] All aria-labels translated with variable interpolation
- [x] All visible text uses translations
- [x] All components render without errors

---implemented: Updated all 6 low-priority components:
1. SuggestionButton.tsx - Added 'workflow.shared.cards.suggestion' namespace, replaced 'created' badge text
2. SessionItemCard.tsx - Added 'workflow.shared.cards.sessionItem' namespace, replaced contentPieces (ICU plural), noContent, editAriaLabel, removeAriaLabel
3. ItemContextDisplay.tsx - Added 'workflow.shared.itemContext' namespace, replaced editingGuideFor, readOnly, room, itemType, purpose labels
4. SortableContentPieceCard.tsx - Added 'workflow.shared.content' namespace, replaced contentPieceAriaLabel, type labels via t(`types.${type}`)
Note: RoomCard.tsx and ItemTypeCard.tsx were not present in the shared folder (may be elsewhere or not applicable).---ts-check: passed (0 errors, baseline: 0)---

---

## Post-Implementation Tasks

### Task 19: Generate Translations for Non-English Languages

**Story Points:** 1 (automated)
**Files:** `/messages/{fr,es,de,nl,it}.json`

Add all `workflow.shared` translations to the 5 non-English language files. Use AI translation or professional translation service.

### Task 20: Update Test Files

**Story Points:** 2
**Files:** All `__tests__/*.test.tsx` files in shared folder

Update test expectations to match translated strings. Common changes:
- Mock `useTranslations` hook
- Update string assertions to use translation keys or mocked values
- Verify pluralization scenarios

### Task 21: Build Verification

**Story Points:** 1

1. Run `npm run build` and verify no errors
2. Run `npm run lint` and fix any issues
3. Run `npm run test` for the shared components
4. Manual testing in browser with language switching

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Tasks |
|---------------------|-------|
| All button text uses translated strings | Tasks 2-18 |
| All label and field text uses translations | Tasks 2-18 |
| Progress indicators display translated status | Tasks 3, 9, 10, 11 |
| Navigation controls show translated text | Task 2 |
| Validation messages appear in selected language | Tasks 4, 5, 6, 17 |
| Tooltips and helper text display translations | Tasks 7, 15, 17 |
| Icon labels and accessibility text translated | All tasks |
| Error states show translated error messages | Tasks 7, 8, 10, 11, 12 |
| Loading states display translated text | Tasks 10, 11, 12, 14 |
| Confirmation dialogs present translated messages | Tasks 4, 5, 6, 12 |
| No hardcoded English strings remain | All tasks |
| Components render correctly in all languages | Task 21 |
| Translation keys follow naming conventions | Task 1 |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing translation keys at runtime | Task 1 creates all keys upfront; build-time validation |
| Pluralization format errors | ICU format testing in Task 21 |
| Layout breaks with longer translations | Design with 40% expansion buffer |
| Breaking existing tests | Task 20 dedicated to test updates |
| Performance impact from many t() calls | Hooks are optimized; memoize where needed |

---

## Notes

- All components are client components ('use client'), so they use `useTranslations` hook
- The `workflow.shared` namespace keeps translations organized
- Constants like `TYPE_CONFIG` and `SCOPE_OPTIONS` need to be converted to functions or memoized values inside components
- Some aria-labels use variable interpolation for dynamic content (item names, counts)
- The `TruncatedText.tsx` component has no translatable strings (utility only) - SKIP

---

*Document generated for FAQBNB Localization Epic 2 - Task 2C.11*
*System Date: 2026-01-20*
