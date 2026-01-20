# Detailed Task Breakdown: REQ-E02-056 - Create Workflow Namespace Structure

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-056
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.1
**Estimated Strings:** ~500
**Priority:** Critical - Foundation for Sub-Epic 2C

---

## Overview

This document provides the granular, step-by-step implementation tasks for creating the `workflow` namespace structure in the messages file. The workflow namespace will organize all translation keys for the multi-step item creation workflow (86+ files, ~500 strings).

**Objective:** Create a comprehensive, well-structured `workflow` namespace in `/messages/en.json` that organizes all translation keys needed for the item creation workflow components.

---

## Prerequisites

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation Complete | Required | next-intl configured, base messages structure exists |
| `/messages/en.json` exists | ✅ Verified | Contains common, auth, dashboard, items, errors, language namespaces |
| next-intl package installed | Required | Provides useTranslations, getTranslations |

---

## Implementation Tasks

### Task 1: Create Base Workflow Namespace Structure
**Priority:** P0 - Critical
**Story Points:** 1
**Estimated Time:** 15 minutes

**Description:**
Add the empty `workflow` namespace skeleton to `/messages/en.json` with all required top-level sub-sections. This establishes the organizational structure for all workflow translation keys.

**File to Modify:**
- `/messages/en.json`

**Changes Required:**
Add the following structure after the `language` namespace:

```json
"workflow": {
  "_comment": "Translation keys for the multi-step item creation workflow",
  "header": {},
  "navigation": {},
  "steps": {
    "roomSelection": {},
    "itemType": {},
    "specificItem": {},
    "purpose": {},
    "contentType": {},
    "mediaCapture": {},
    "contentCreation": {},
    "previewSave": {}
  },
  "postWorkflow": {
    "nextAction": {},
    "sessionSummary": {}
  },
  "dialogs": {
    "confirmExit": {},
    "removeItem": {},
    "emptySession": {},
    "pdfExport": {}
  },
  "shared": {
    "sessionRecovery": {},
    "printOptions": {},
    "qrGeneration": {},
    "camera": {},
    "network": {},
    "tags": {},
    "content": {},
    "itemContext": {}
  },
  "constants": {
    "rooms": {},
    "itemTypes": {},
    "purposes": {},
    "contentTypes": {},
    "tags": {}
  },
  "validation": {},
  "accessibility": {}
}
```

**Acceptance Criteria:**
- [ ] Workflow namespace added to en.json at root level (after `language`)
- [ ] All sub-sections created with empty objects
- [ ] JSON validates without syntax errors
- [ ] Build passes: `npm run build`

**Verification Command:**
```bash
cat messages/en.json | python -m json.tool > /dev/null && echo "JSON valid"
```

---

### Task 2: Add Header and Navigation Keys
**Priority:** P0 - Critical
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Add translation keys for the workflow header (progress indicator) and navigation controls (Back, Next, Exit, etc.).

**File to Modify:**
- `/messages/en.json`

**Keys to Add:**
```json
"header": {
  "stepOf": "Step {current} of {total}",
  "progressLabel": "Step {current} of {total}: {stepName}",
  "exitButton": "Exit",
  "exitAriaLabel": "Exit workflow"
},
"navigation": {
  "back": "Back",
  "next": "Next",
  "continue": "Continue",
  "exit": "Exit",
  "skip": "Skip",
  "done": "Done",
  "save": "Save",
  "cancel": "Cancel",
  "finish": "Finish",
  "goBackLabel": "Go back to previous step",
  "goNextLabel": "Proceed to next step",
  "exitWorkflowLabel": "Exit workflow",
  "savingLabel": "Saving your item"
}
```

**Acceptance Criteria:**
- [ ] `workflow.header` contains step progress keys with ICU placeholders
- [ ] `workflow.navigation` contains all navigation button labels
- [ ] All navigation keys include aria-label variants where needed
- [ ] JSON validates without syntax errors

---

### Task 3: Add Room Selection Step Keys
**Priority:** P1 - High
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Add translation keys for RoomSelectionStep (Step 1) including title, subtitle, search, custom room input, and accessibility labels.

**File to Modify:**
- `/messages/en.json`

**Reference Component:**
- `/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx`

**Keys to Add:**
```json
"steps": {
  "roomSelection": {
    "title": "Select a Room",
    "subtitle": "Choose where this item is located in your property",
    "searchPlaceholder": "Search rooms...",
    "noResults": "No rooms match your search",
    "customRoomLabel": "Custom Room",
    "customRoomPlaceholder": "e.g., Home Office, Wine Cellar, Mudroom",
    "customRoomHint": "Maximum 50 characters",
    "useCustomName": "Use custom room name",
    "popularRooms": "Popular Rooms",
    "allRooms": "All Rooms",
    "selectedRoom": "Selected: {roomName}",
    "ariaLabel": "Select a room for your item",
    "ariaHelp": "Use arrow keys to navigate between rooms. Press Enter or Space to select.",
    "ariaRoomSelected": "{roomName} selected",
    "ariaRoomOption": "{roomName}, room option"
  }
}
```

**Acceptance Criteria:**
- [ ] All room selection UI strings captured
- [ ] Custom room input strings included
- [ ] Accessibility strings for screen readers included
- [ ] ICU placeholders used for dynamic content (roomName)

---

### Task 4: Add Item Type Step Keys
**Priority:** P1 - High
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Add translation keys for ItemTypeStep (Step 2) including title, subtitle, type options, and accessibility labels.

**File to Modify:**
- `/messages/en.json`

**Reference Component:**
- `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`

**Keys to Add:**
```json
"itemType": {
  "title": "What type of item?",
  "subtitle": "Select the category that best describes your item",
  "ariaLabel": "Select item type",
  "ariaHelp": "Use arrow keys to navigate. Press Enter or Space to select.",
  "ariaTypeSelected": "{typeName} selected",
  "ariaTypeOption": "{typeName}: {description}",
  "selectedType": "Selected: {typeName}"
}
```

**Acceptance Criteria:**
- [ ] Title and subtitle captured
- [ ] Accessibility strings included
- [ ] Dynamic content uses ICU placeholders

---

### Task 5: Add Specific Item Step Keys
**Priority:** P1 - High
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Add translation keys for SpecificItemStep (Step 3) including title, subtitle, search/input, suggestions, and validation.

**File to Modify:**
- `/messages/en.json`

**Reference Component:**
- `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

**Keys to Add:**
```json
"specificItem": {
  "title": "Which specific item?",
  "subtitle": "Choose or enter the exact item name",
  "searchPlaceholder": "Search or type item name...",
  "suggestions": "Suggestions",
  "recentItems": "Recent Items",
  "popularItems": "Popular Items",
  "customLabel": "Use custom name",
  "itemNameLabel": "Item Name",
  "itemNamePlaceholder": "Enter item name",
  "itemNameHint": "Be specific - e.g., \"Samsung Washer\" instead of \"Washer\"",
  "noSuggestions": "No suggestions found",
  "duplicateWarning": "An item with this name already exists in your session",
  "duplicateInProperty": "An item with this name already exists in this property",
  "maxLength": "Maximum {max} characters",
  "ariaLabel": "Enter or select specific item name",
  "ariaHelp": "Type to search or select from suggestions below",
  "ariaSuggestion": "{itemName}, suggested item"
}
```

**Acceptance Criteria:**
- [ ] Search and input strings captured
- [ ] Suggestion UI strings included
- [ ] Validation and warning messages included
- [ ] Accessibility strings included

---

### Task 6: Add Purpose Step Keys
**Priority:** P1 - High
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Add translation keys for PurposeStep (Step 4) including title, subtitle, and accessibility labels.

**File to Modify:**
- `/messages/en.json`

**Reference Component:**
- `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`

**Keys to Add:**
```json
"purpose": {
  "title": "What's the purpose of this content?",
  "subtitle": "Choose what you want to help guests with",
  "selectPurpose": "Select a purpose",
  "multiplePurposes": "You can select multiple purposes",
  "selectedCount": "{count, plural, one {# purpose selected} other {# purposes selected}}",
  "ariaLabel": "Select content purpose",
  "ariaHelp": "Use up and down arrow keys to navigate. Press Enter or Space to select.",
  "ariaPurposeSelected": "{purposeName} selected",
  "ariaPurposeOption": "{purposeName}: {description}"
}
```

**Acceptance Criteria:**
- [ ] Title and subtitle captured
- [ ] Purpose selection strings included
- [ ] Pluralization for selected count uses ICU format
- [ ] Accessibility strings included

---

### Task 7: Add Content Type Step Keys
**Priority:** P1 - High
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Add translation keys for ContentTypeStep (Step 5) including title, subtitle, content type options, and accessibility.

**File to Modify:**
- `/messages/en.json`

**Reference Component:**
- `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

**Keys to Add:**
```json
"contentType": {
  "title": "How do you want to add content?",
  "subtitle": "Choose how to provide instructions",
  "selectContentType": "Select content type",
  "recommendedFor": "Recommended for {purpose}",
  "ariaLabel": "Select content type",
  "ariaHelp": "Use arrow keys to navigate. Press Enter or Space to select.",
  "ariaContentTypeSelected": "{contentType} selected",
  "ariaContentTypeOption": "{contentType}: {description}"
}
```

**Acceptance Criteria:**
- [ ] Title and subtitle captured
- [ ] Content type selection strings included
- [ ] Accessibility strings included

---

### Task 8: Add Media Capture Step Keys
**Priority:** P1 - High
**Story Points:** 1
**Estimated Time:** 20 minutes

**Description:**
Add translation keys for MediaCaptureStep (Step 6) and all adapter components (Video, Photo, File Upload, Text Editor, URL Input).

**File to Modify:**
- `/messages/en.json`

**Reference Components:**
- `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx`
- `/src/components/ItemCreationWorkflow/components/steps/adapters/*.tsx`

**Keys to Add:**
```json
"mediaCapture": {
  "title": "Capture Content",
  "subtitle": "Add content for your item",
  "takePhoto": "Take Photo",
  "recordVideo": "Record Video",
  "startRecording": "Start Recording",
  "stopRecording": "Stop Recording",
  "pauseRecording": "Pause Recording",
  "resumeRecording": "Resume Recording",
  "retake": "Retake",
  "useThis": "Use This",
  "discard": "Discard",
  "uploading": "Uploading...",
  "processing": "Processing...",
  "saving": "Saving...",
  "video": {
    "title": "Record Video",
    "instructions": "Position your camera and press record",
    "recording": "Recording...",
    "recordingTime": "Recording: {duration}",
    "maxDuration": "Maximum duration: {duration}",
    "minDuration": "Minimum duration: {duration}",
    "tapToStart": "Tap to start recording",
    "tapToStop": "Tap to stop recording",
    "processing": "Processing video...",
    "previewTitle": "Video Preview",
    "playVideo": "Play video",
    "pauseVideo": "Pause video"
  },
  "photo": {
    "title": "Take Photo",
    "instructions": "Position your camera and press capture",
    "tapToCapture": "Tap to capture",
    "captured": "Photo captured",
    "previewTitle": "Photo Preview",
    "switchCamera": "Switch camera",
    "frontCamera": "Front camera",
    "backCamera": "Back camera"
  },
  "upload": {
    "title": "Upload File",
    "dragDrop": "Drag and drop files here",
    "or": "or",
    "browse": "Browse files",
    "browseFiles": "Browse files from your device",
    "supportedFormats": "Supported formats: {formats}",
    "maxSize": "Maximum file size: {size}MB",
    "uploading": "Uploading {progress}%",
    "uploadComplete": "Upload complete",
    "uploadFailed": "Upload failed. Please try again.",
    "selectFile": "Select a file",
    "selectedFile": "Selected: {fileName}",
    "removeFile": "Remove file",
    "multipleFiles": "{count, plural, one {# file selected} other {# files selected}}"
  },
  "text": {
    "title": "Write Instructions",
    "placeholder": "Write your instructions here...",
    "characterCount": "{count} / {max} characters",
    "formatting": "Formatting options",
    "bold": "Bold",
    "italic": "Italic",
    "list": "Bullet list",
    "numberedList": "Numbered list",
    "preview": "Preview",
    "edit": "Edit"
  },
  "url": {
    "title": "Add Link",
    "placeholder": "Paste URL here...",
    "urlLabel": "URL",
    "urlHint": "Enter a valid web address",
    "invalidUrl": "Please enter a valid URL",
    "fetchingPreview": "Fetching link preview...",
    "previewTitle": "Link Preview",
    "noPreview": "No preview available",
    "linkTitle": "Link title",
    "linkDescription": "Link description"
  }
}
```

**Acceptance Criteria:**
- [ ] Main media capture strings captured
- [ ] Video recording adapter strings included
- [ ] Photo capture adapter strings included
- [ ] File upload adapter strings included
- [ ] Text editor adapter strings included
- [ ] URL input adapter strings included
- [ ] All states (recording, processing, uploading) covered
- [ ] ICU pluralization for file counts

---

### Task 9: Add Content Creation Step Keys
**Priority:** P1 - High
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Add translation keys for ContentCreationStep (Step 7) if it differs from MediaCaptureStep.

**File to Modify:**
- `/messages/en.json`

**Keys to Add:**
```json
"contentCreation": {
  "title": "Create Content",
  "subtitle": "Add instructions or information for this item",
  "addContent": "Add Content",
  "editContent": "Edit Content",
  "contentAdded": "Content added successfully",
  "contentUpdated": "Content updated",
  "contentRemoved": "Content removed",
  "contentCount": "{count, plural, =0 {No content} one {# content piece} other {# content pieces}}",
  "reorderHint": "Drag to reorder content pieces"
}
```

**Acceptance Criteria:**
- [ ] Content creation specific strings captured
- [ ] Content count uses ICU pluralization

---

### Task 10: Add Preview/Save Step Keys
**Priority:** P1 - High
**Story Points:** 1
**Estimated Time:** 15 minutes

**Description:**
Add translation keys for PreviewSaveStep (Step 8) including item preview, editing fields, content management, and save actions.

**File to Modify:**
- `/messages/en.json`

**Reference Component:**
- `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Keys to Add:**
```json
"previewSave": {
  "title": "Review & Save",
  "subtitle": "Review your item before saving",
  "itemNameLabel": "Item Name",
  "itemNamePlaceholder": "Enter item name",
  "itemNameRequired": "Item name is required",
  "descriptionLabel": "Description",
  "descriptionPlaceholder": "Add an optional description",
  "descriptionHint": "Help guests understand what this item is for",
  "tagsLabel": "Tags",
  "tagsPlaceholder": "Add tags to help organize",
  "addTag": "Add tag",
  "removeTag": "Remove tag \"{tagName}\"",
  "suggestedTags": "Suggested tags",
  "roomLabel": "Room",
  "editRoom": "Edit Room",
  "itemTypeLabel": "Item Type",
  "editItemType": "Edit Item Type",
  "purposeLabel": "Purpose",
  "editPurpose": "Edit Purpose",
  "contentLabel": "Content",
  "contentPieces": "{count, plural, =0 {No content} one {# piece of content} other {# pieces of content}}",
  "addMoreContent": "Add More Content",
  "reorderContent": "Reorder Content",
  "dragToReorder": "Drag to reorder",
  "removeContent": "Remove",
  "removeContentConfirm": "Remove this content?",
  "contentPreview": "Content Preview",
  "saveItem": "Save Item",
  "saving": "Saving...",
  "saveAndAddAnother": "Save & Add Another",
  "saveError": "Failed to save item. Please try again.",
  "saveSuccess": "Item saved successfully!",
  "unsavedChanges": "You have unsaved changes",
  "discardChanges": "Discard changes?",
  "ariaReorderContent": "Reorder content pieces using drag and drop",
  "ariaContentPiece": "Content piece {index} of {total}: {type}"
}
```

**Acceptance Criteria:**
- [ ] All preview fields captured
- [ ] Content management strings included
- [ ] Save action strings included
- [ ] Error and success states included
- [ ] ICU pluralization for content pieces

---

### Task 11: Add Post-Workflow Screen Keys
**Priority:** P1 - High
**Story Points:** 1
**Estimated Time:** 15 minutes

**Description:**
Add translation keys for next-action and session-summary screens that appear after item creation.

**File to Modify:**
- `/messages/en.json`

**Reference Components:**
- `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`

**Keys to Add:**
```json
"postWorkflow": {
  "nextAction": {
    "title": "What's Next?",
    "subtitle": "Item saved successfully!",
    "congratulations": "Great job!",
    "itemCreated": "Your item \"{itemName}\" has been created",
    "editInstructions": "Edit Instructions",
    "editDescription": "Review and modify the content you just added",
    "addNewInstructions": "Add New Instructions",
    "addNewDescription": "Add more content to this item",
    "createNewItem": "Create New Item",
    "createNewDescription": "Start fresh with a different item",
    "viewItem": "View Item",
    "viewItemDescription": "See how your item looks to guests",
    "done": "Done",
    "doneDescription": "Return to your dashboard",
    "printQRCode": "Print QR Code",
    "printQRCodeDescription": "Print a QR code label for this item"
  },
  "sessionSummary": {
    "title": "Session Complete!",
    "subtitle": "You created {count, plural, =0 {no items} one {# item} other {# items}} in this session",
    "newItems": "New Items",
    "newItemsCount": "{count, plural, one {# new item} other {# new items}}",
    "existingItems": "Existing Items Updated",
    "existingItemsCount": "{count, plural, one {# existing item} other {# existing items}}",
    "loadingItems": "Loading items...",
    "noItems": "No items in this session",
    "sessionDuration": "Session duration: {duration}",
    "printQRCodes": "Print QR Codes",
    "printAll": "Print All",
    "printSelected": "Print Selected",
    "printNewOnly": "Print New Items Only",
    "selectItemsToPrint": "Select items to print",
    "createAnother": "Create Another Item",
    "viewAllItems": "View All Items",
    "finishSession": "Finish Session",
    "finishWithoutPrint": "Finish Without Printing",
    "itemSummary": "{itemName} in {roomName}",
    "contentSummary": "{count, plural, one {# content piece} other {# content pieces}}"
  }
}
```

**Acceptance Criteria:**
- [ ] Next action screen strings captured
- [ ] Session summary strings captured
- [ ] Item and content counts use ICU pluralization
- [ ] All action buttons labeled

---

### Task 12: Add Dialog Keys
**Priority:** P1 - High
**Story Points:** 1
**Estimated Time:** 15 minutes

**Description:**
Add translation keys for all workflow dialogs (confirm exit, remove item, empty session, PDF export).

**File to Modify:**
- `/messages/en.json`

**Keys to Add:**
```json
"dialogs": {
  "confirmExit": {
    "title": "Exit Workflow?",
    "messageUnsavedAndItems": "You have unsaved changes and {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
    "messageUnsaved": "You have unsaved changes. Are you sure you want to exit?",
    "messageItems": "You have created {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
    "messageDefault": "Are you sure you want to exit the workflow?",
    "warningDataLoss": "Unsaved changes will be lost",
    "cancel": "Cancel",
    "stay": "Stay",
    "exit": "Exit Workflow",
    "exitAndSave": "Save & Exit"
  },
  "removeItem": {
    "title": "Remove Item?",
    "message": "Are you sure you want to remove \"{name}\" from this session?",
    "messageWithContent": "This item has {count, plural, one {# content piece} other {# content pieces}} that will also be removed.",
    "warning": "This action cannot be undone",
    "cancel": "Cancel",
    "remove": "Remove",
    "removing": "Removing..."
  },
  "emptySession": {
    "title": "No Items Added",
    "message": "You haven't added any items yet. Add at least one item to continue.",
    "messageExit": "You haven't added any items. Exit anyway?",
    "ok": "OK",
    "addItem": "Add Item",
    "exitAnyway": "Exit Anyway"
  },
  "pdfExport": {
    "title": "Export to PDF",
    "subtitle": "Generate printable QR codes",
    "selectItems": "Select items to include",
    "allItems": "All Items",
    "allItemsCount": "All Items ({count})",
    "newOnly": "New Items Only",
    "newOnlyCount": "New Items Only ({count})",
    "selectedItems": "Selected Items",
    "selectedItemsCount": "Selected Items ({count})",
    "noItemsSelected": "No items selected",
    "selectAtLeastOne": "Select at least one item",
    "options": "Options",
    "includeInstructions": "Include instructions",
    "includeQRCode": "Include QR code",
    "pageSize": "Page size",
    "orientation": "Orientation",
    "portrait": "Portrait",
    "landscape": "Landscape",
    "generating": "Generating PDF...",
    "generatingProgress": "Generating PDF... {progress}%",
    "download": "Download PDF",
    "print": "Print",
    "cancel": "Cancel",
    "error": "Failed to generate PDF. Please try again."
  }
}
```

**Acceptance Criteria:**
- [ ] Confirm exit dialog with all message variants
- [ ] Remove item dialog with content count warning
- [ ] Empty session dialog strings
- [ ] PDF export dialog with all options
- [ ] ICU pluralization for counts

---

### Task 13: Add Shared Component Keys
**Priority:** P1 - High
**Story Points:** 1
**Estimated Time:** 20 minutes

**Description:**
Add translation keys for shared workflow components (session recovery, print options, QR generation, camera, network, tags, content).

**File to Modify:**
- `/messages/en.json`

**Keys to Add:**
```json
"shared": {
  "sessionRecovery": {
    "title": "Resume Previous Session?",
    "message": "We found {count, plural, one {# item} other {# items}} from your last session.",
    "lastSaved": "Last saved: {time}",
    "contentWarning": "{count, plural, one {# piece of content needs} other {# pieces of content need}} to be re-uploaded.",
    "continue": "Continue Session",
    "startFresh": "Start Fresh",
    "dismiss": "Dismiss",
    "recovering": "Recovering session...",
    "recoveryFailed": "Failed to recover session"
  },
  "printOptions": {
    "title": "Print QR Codes",
    "subtitle": "Choose what to print",
    "scope": "Select items to print",
    "allItems": "All Items ({count})",
    "newOnly": "New Items Only ({count})",
    "selectItems": "Select Items",
    "selectedCount": "{count} selected",
    "labelSize": "Label Size",
    "small": "Small (1\" x 1\")",
    "medium": "Medium (2\" x 2\")",
    "large": "Large (3\" x 3\")",
    "custom": "Custom",
    "labelsPerPage": "Labels per page",
    "generatePDF": "Generate PDF",
    "printDirect": "Print Directly",
    "skip": "Skip Printing",
    "generating": "Generating...",
    "sending": "Sending to printer...",
    "printComplete": "Print complete",
    "printFailed": "Print failed"
  },
  "qrGeneration": {
    "title": "Generating QR Codes",
    "progress": "Processing {current} of {total}",
    "progressPercent": "{percent}% complete",
    "complete": "QR codes generated successfully",
    "failed": "Failed to generate QR codes",
    "retry": "Retry"
  },
  "camera": {
    "permissionRequired": "Camera Access Required",
    "permissionDescription": "Please allow camera access to capture photos or videos.",
    "grantPermission": "Grant Permission",
    "openSettings": "Open Settings",
    "permissionDenied": "Camera permission denied",
    "permissionDeniedDescription": "Camera permission denied. Please enable it in your browser settings.",
    "notSupported": "Camera not supported",
    "notSupportedDescription": "Your device does not support camera access.",
    "switchingCamera": "Switching camera...",
    "cameraError": "Camera error. Please try again."
  },
  "network": {
    "offline": "You appear to be offline",
    "offlineDescription": "Please check your connection and try again.",
    "retryConnection": "Retry Connection",
    "retry": "Retry",
    "slowConnection": "Slow connection detected",
    "slowConnectionDescription": "Uploads may take longer than expected.",
    "connectionRestored": "Connection restored"
  },
  "tags": {
    "label": "Tags",
    "addTag": "Add tag",
    "addTagPlaceholder": "Type to add tag...",
    "removeTag": "Remove tag",
    "removeTagNamed": "Remove tag \"{name}\"",
    "placeholder": "Type to add tags...",
    "noTags": "No tags",
    "suggestions": "Suggestions",
    "recentTags": "Recent tags",
    "popularTags": "Popular tags",
    "maxTags": "Maximum {max} tags",
    "tagAdded": "Tag added",
    "tagRemoved": "Tag removed",
    "duplicateTag": "Tag already exists"
  },
  "content": {
    "preview": "Preview",
    "edit": "Edit",
    "remove": "Remove",
    "reorder": "Reorder",
    "moveUp": "Move up",
    "moveDown": "Move down",
    "contentPiece": "Content piece {index}",
    "contentPieceOf": "Content piece {index} of {total}",
    "videoContent": "Video",
    "photoContent": "Photo",
    "pdfContent": "PDF Document",
    "textContent": "Text",
    "urlContent": "Link",
    "unknownContent": "Unknown content type",
    "noContent": "No content added yet",
    "addContent": "Add content"
  },
  "itemContext": {
    "room": "Room",
    "itemType": "Item Type",
    "itemName": "Item Name",
    "purpose": "Purpose",
    "changeRoom": "Change room",
    "changeItemType": "Change item type",
    "changePurpose": "Change purpose"
  }
}
```

**Acceptance Criteria:**
- [ ] Session recovery banner strings included
- [ ] Print options panel strings included
- [ ] QR generation progress strings included
- [ ] Camera permission strings included
- [ ] Network status strings included
- [ ] Tags editor strings included
- [ ] Content piece strings included
- [ ] Item context display strings included

---

### Task 14: Add Constants Translation Keys
**Priority:** P1 - High
**Story Points:** 1
**Estimated Time:** 20 minutes

**Description:**
Add translation keys for workflow constants (room types, item types, purposes, content types, tags).

**File to Modify:**
- `/messages/en.json`

**Reference File:**
- `/src/components/ItemCreationWorkflow/utils/constants.ts`

**Keys to Add:**
```json
"constants": {
  "rooms": {
    "kitchen": "Kitchen",
    "laundry": "Laundry Room",
    "bedroom": "Bedroom",
    "bathroom": "Bathroom",
    "livingRoom": "Living Room",
    "diningRoom": "Dining Room",
    "garage": "Garage",
    "basement": "Basement",
    "attic": "Attic",
    "outdoor": "Outdoor/Patio",
    "pool": "Pool Area",
    "gym": "Gym/Fitness Room",
    "office": "Home Office",
    "gameRoom": "Game Room",
    "mediaRoom": "Media Room",
    "general": "General/Whole Property",
    "other": "Other"
  },
  "itemTypes": {
    "appliance": {
      "label": "Appliance",
      "description": "Washer, dryer, stove, refrigerator, dishwasher, etc."
    },
    "roomItem": {
      "label": "Room Item",
      "description": "Pantry, cabinets, closet, sink, thermostat, etc."
    },
    "generalInfo": {
      "label": "General Info",
      "description": "Trash schedule, WiFi info, house rules, check-out instructions, etc."
    }
  },
  "purposes": {
    "howToUse": {
      "label": "How to Use",
      "description": "Operating instructions and controls"
    },
    "howToClean": {
      "label": "How to Clean",
      "description": "Cleaning and care instructions"
    },
    "troubleshooting": {
      "label": "Troubleshooting",
      "description": "Common issues and how to fix them"
    },
    "safetyInfo": {
      "label": "Safety Information",
      "description": "Safety warnings and precautions"
    },
    "maintenance": {
      "label": "Maintenance",
      "description": "Regular maintenance tasks and schedules"
    },
    "features": {
      "label": "Features & Tips",
      "description": "Special features, shortcuts, and tips"
    },
    "location": {
      "label": "Location Info",
      "description": "Where to find things or how to get there"
    },
    "other": {
      "label": "Other",
      "description": "General information not covered above"
    }
  },
  "contentTypes": {
    "recordVideo": {
      "label": "Record Video",
      "description": "Record a video demonstrating how to use the item"
    },
    "takePhoto": {
      "label": "Take Photo",
      "description": "Take a photo showing the item or instructions"
    },
    "writeText": {
      "label": "Write Text",
      "description": "Write text instructions or notes"
    },
    "uploadFile": {
      "label": "Upload File",
      "description": "Upload a video, image, PDF, or document"
    },
    "addLink": {
      "label": "Add Link",
      "description": "Add a link to external instructions or manual"
    }
  },
  "tags": {
    "kitchen": "Kitchen",
    "laundry": "Laundry",
    "bedroom": "Bedroom",
    "bathroom": "Bathroom",
    "livingRoom": "Living Room",
    "garage": "Garage",
    "outdoor": "Outdoor",
    "general": "General",
    "appliance": "Appliance",
    "roomItem": "Room Item",
    "instructions": "Instructions",
    "cleaning": "Cleaning",
    "troubleshooting": "Troubleshooting",
    "safety": "Safety",
    "maintenance": "Maintenance",
    "features": "Features",
    "tips": "Tips",
    "info": "Info",
    "important": "Important",
    "wifi": "WiFi",
    "emergency": "Emergency"
  }
}
```

**Acceptance Criteria:**
- [ ] All room types from constants captured
- [ ] Item types with labels and descriptions captured
- [ ] Purpose options with labels and descriptions captured
- [ ] Content type options with labels and descriptions captured
- [ ] Tag labels captured
- [ ] Structure matches constants.ts

---

### Task 15: Add Validation Message Keys
**Priority:** P2 - Medium
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Add translation keys for workflow-specific validation messages.

**File to Modify:**
- `/messages/en.json`

**Keys to Add:**
```json
"validation": {
  "roomRequired": "Please select a room",
  "itemTypeRequired": "Please select an item type",
  "itemNameRequired": "Item name is required",
  "itemNameTooShort": "Item name must be at least {min} characters",
  "itemNameTooLong": "Item name must be less than {max} characters",
  "itemNameInvalid": "Item name contains invalid characters",
  "contentRequired": "At least one content piece is required",
  "purposeRequired": "Please select a purpose",
  "contentTypeRequired": "Please select a content type",
  "invalidUrl": "Please enter a valid URL",
  "urlRequired": "URL is required",
  "fileTooLarge": "File size exceeds {max}MB limit",
  "invalidFileType": "Invalid file type. Allowed: {types}",
  "textTooShort": "Text must be at least {min} characters",
  "textTooLong": "Text must be less than {max} characters",
  "duplicateItemName": "An item with this name already exists",
  "duplicateItemInProperty": "An item with this name already exists in this property",
  "videoTooShort": "Video must be at least {min} seconds",
  "videoTooLong": "Video must be less than {max} seconds",
  "maxContentPieces": "Maximum {max} content pieces allowed",
  "maxTags": "Maximum {max} tags allowed",
  "tagTooLong": "Tag must be less than {max} characters",
  "customRoomRequired": "Please enter a room name",
  "customRoomTooLong": "Room name must be less than {max} characters"
}
```

**Acceptance Criteria:**
- [ ] All validation messages captured
- [ ] Validation messages use ICU placeholders for min/max values
- [ ] Messages are user-friendly and actionable

---

### Task 16: Add Accessibility Keys
**Priority:** P2 - Medium
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Add translation keys for screen reader announcements and accessibility labels.

**File to Modify:**
- `/messages/en.json`

**Keys to Add:**
```json
"accessibility": {
  "stepAnnouncement": "Step {current} of {total}: {stepName}",
  "stepComplete": "Step {stepName} complete",
  "stepError": "Error on step {stepName}",
  "roomSelectionScreen": "Room Selection",
  "itemTypeScreen": "Item Type Selection",
  "specificItemScreen": "Specific Item Selection",
  "purposeScreen": "Purpose Selection",
  "contentTypeScreen": "Content Type Selection",
  "mediaCaptureScreen": "Media Capture",
  "contentCreationScreen": "Content Creation",
  "previewSaveScreen": "Preview and Save",
  "nextActionScreen": "What's Next",
  "sessionSummaryScreen": "Session Summary",
  "skipToContent": "Skip to main content",
  "skipToNavigation": "Skip to navigation",
  "selectedItem": "{name} selected",
  "deselectedItem": "{name} deselected",
  "itemSaved": "Item saved successfully",
  "itemSaveFailed": "Failed to save item",
  "contentAdded": "Content added",
  "contentRemoved": "Content removed",
  "contentReordered": "Content reordered",
  "uploadStarted": "Upload started",
  "uploadComplete": "Upload complete",
  "uploadFailed": "Upload failed",
  "recordingStarted": "Recording started",
  "recordingStopped": "Recording stopped",
  "formError": "Form has {count, plural, one {# error} other {# errors}}. Please review and correct.",
  "requiredField": "{fieldName} is required",
  "optionalField": "{fieldName} is optional",
  "characterCount": "{current} of {max} characters",
  "loadingContent": "Loading content...",
  "contentLoaded": "Content loaded"
}
```

**Acceptance Criteria:**
- [ ] Step announcements for all workflow steps
- [ ] State change announcements (selected, saved, error)
- [ ] Action announcements (upload, recording)
- [ ] Form accessibility helpers
- [ ] ICU pluralization for counts

---

### Task 17: Verify JSON Structure and Build
**Priority:** P0 - Critical
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Validate the final JSON structure and ensure the application builds without errors.

**Verification Steps:**

1. **JSON Validation:**
```bash
cat messages/en.json | python -m json.tool > /dev/null && echo "JSON is valid"
```

2. **Check for Duplicate Keys:**
```bash
# Manual review or use a JSON linter
npm run lint
```

3. **Build Verification:**
```bash
npm run build
```

4. **Start Application:**
```bash
npm run dev
# Verify no i18n errors in console
```

**Acceptance Criteria:**
- [ ] JSON validates without syntax errors
- [ ] No duplicate keys in any namespace
- [ ] `npm run build` completes without errors
- [ ] Application starts without i18n errors
- [ ] No TypeScript errors related to translations

---

### Task 18: Document Namespace Structure
**Priority:** P3 - Low
**Story Points:** 0.5
**Estimated Time:** 10 minutes

**Description:**
Add inline documentation comments to the workflow namespace to help future developers understand the structure.

**File to Modify:**
- `/messages/en.json`

**Documentation Pattern:**
Use `_comment` keys at each major section:

```json
"workflow": {
  "_comment": "Translation keys for the multi-step item creation workflow (86+ files, ~500 strings)",
  "header": {
    "_comment": "WorkflowHeader component - progress indicator and exit button"
  },
  "navigation": {
    "_comment": "Navigation buttons used across all steps"
  },
  "steps": {
    "_comment": "Step-specific strings organized by step component",
    "roomSelection": {
      "_comment": "RoomSelectionStep.tsx - Step 1"
    }
    // ... etc
  }
}
```

**Acceptance Criteria:**
- [ ] Top-level workflow namespace has description
- [ ] Each major section has `_comment` explaining its purpose
- [ ] Step sections reference the component file
- [ ] Documentation helps developers locate strings

---

## Summary of Tasks

| Task | Description | Priority | Story Points |
|------|-------------|----------|--------------|
| 1 | Create Base Workflow Namespace Structure | P0 | 1 |
| 2 | Add Header and Navigation Keys | P0 | 0.5 |
| 3 | Add Room Selection Step Keys | P1 | 0.5 |
| 4 | Add Item Type Step Keys | P1 | 0.5 |
| 5 | Add Specific Item Step Keys | P1 | 0.5 |
| 6 | Add Purpose Step Keys | P1 | 0.5 |
| 7 | Add Content Type Step Keys | P1 | 0.5 |
| 8 | Add Media Capture Step Keys | P1 | 1 |
| 9 | Add Content Creation Step Keys | P1 | 0.5 |
| 10 | Add Preview/Save Step Keys | P1 | 1 |
| 11 | Add Post-Workflow Screen Keys | P1 | 1 |
| 12 | Add Dialog Keys | P1 | 1 |
| 13 | Add Shared Component Keys | P1 | 1 |
| 14 | Add Constants Translation Keys | P1 | 1 |
| 15 | Add Validation Message Keys | P2 | 0.5 |
| 16 | Add Accessibility Keys | P2 | 0.5 |
| 17 | Verify JSON Structure and Build | P0 | 0.5 |
| 18 | Document Namespace Structure | P3 | 0.5 |
| **Total** | | | **12** |

---

## Execution Order

Execute tasks in this order to minimize rework:

1. **Phase 1 - Foundation (Tasks 1-2):** Create base structure and navigation
2. **Phase 2 - Step Keys (Tasks 3-10):** Add all step-specific strings
3. **Phase 3 - Supporting Components (Tasks 11-14):** Add dialogs, shared, constants
4. **Phase 4 - Cross-Cutting (Tasks 15-16):** Add validation and accessibility
5. **Phase 5 - Verification (Tasks 17-18):** Validate and document

---

## Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `/messages/en.json` | Modified | Add workflow namespace with ~500 translation keys |

---

## Files Referenced (Read-Only)

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main component structure |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Existing labels to extract |
| `/src/components/ItemCreationWorkflow/components/steps/*.tsx` | Step component strings |
| `/src/components/ItemCreationWorkflow/components/shared/*.tsx` | Shared component strings |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/*.tsx` | Media adapter strings |

---

## Verification Checklist

Before marking this request complete:

- [ ] All 18 tasks completed
- [ ] JSON validates without syntax errors
- [ ] No duplicate keys exist
- [ ] `npm run build` passes
- [ ] Application starts without i18n errors
- [ ] Namespace structure follows established patterns
- [ ] ICU message format used for pluralization
- [ ] All step components have corresponding keys
- [ ] Shared components have corresponding keys
- [ ] Constants have corresponding keys
- [ ] Validation messages are comprehensive
- [ ] Accessibility strings are complete

---

## Next Steps After Completion

This task (2C.1) creates the foundation for:

- **Task 2C.2:** Update main ItemCreationWorkflow component to use translation keys
- **Task 2C.3:** Update RoomSelectionStep to use translation keys
- **Tasks 2C.4-2C.10:** Update remaining step components
- **Tasks 2C.11-2C.12:** Update shared and dialog components
- **Task 2C.13:** Generate translations for 5 non-English languages
- **Task 2C.14:** Test complete workflow in each language

---

## References

- [Overview Document](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-056)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
*Task 2C.1: Create Workflow Namespace Structure*
*Generated: 2026-01-20*
