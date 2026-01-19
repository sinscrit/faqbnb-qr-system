# REQ-371: Create Workflow Namespace Structure in Translation Files

**Document Type:** Implementation Overview
**Created:** 2026-01-19 16:45 UTC
**Last Modified:** 2026-01-19 16:45 UTC
**Request ID:** REQ-371
**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.1
**Size:** M (Medium)
**Priority:** P1 - High (Foundation for entire Sub-Epic 2C)

---

## 1. Summary

Create a comprehensive `workflow` namespace in all six translation files (`en.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `nl.json`) to support localization of the Item Creation Workflow. This namespace will provide a well-organized structure of translation keys covering all 86+ workflow components, including step titles, form labels, validation messages, dialog strings, and session feedback text.

The workflow namespace is a prerequisite for all subsequent localization tasks in Sub-Epic 2C (Tasks 2C.2 through 2C.14). Without this namespace structure, developers cannot implement translations in workflow components.

---

## 2. Technical Context

### 2.1 Current State

The Item Creation Workflow contains **~500 estimated hardcoded strings** across:
- 8 step components (RoomSelectionStep, ItemTypeStep, SpecificItemStep, PurposeStep, ContentTypeStep, MediaCaptureStep, ContentCreationStep, PreviewSaveStep)
- 2 post-workflow screens (NextActionStep, SessionSummaryStep)
- 5 adapter components (VideoCaptureAdapter, PhotoCaptureAdapter, FileUploadAdapter, TextEditorAdapter, UrlInputAdapter)
- 25+ shared components (dialogs, cards, editors, indicators)

The existing `messages/en.json` has the following namespaces established in Epic 1:
- `common` - Generic UI labels
- `auth` - Authentication strings
- `dashboard` - Dashboard labels
- `items` - Item management labels
- `errors` - Error messages
- `language` - Language selection labels

**No `workflow` namespace currently exists.**

### 2.2 Dependencies

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl package | ✅ Installed (Epic 1) | `package.json` |
| i18n config | ✅ Complete | `/src/lib/i18n/config.ts` |
| Translation files | ✅ Exist | `/messages/*.json` |
| useTranslations hook | ✅ Available | next-intl |

### 2.3 Workflow Component Inventory

The following files contain hardcoded strings that require translation keys:

**Step Components:**
| Component | File | Est. Strings |
|-----------|------|--------------|
| RoomSelectionStep | `/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | ~40 |
| ItemTypeStep | `.../steps/ItemTypeStep.tsx` | ~40 |
| SpecificItemStep | `.../steps/SpecificItemStep.tsx` | ~30 |
| PurposeStep | `.../steps/PurposeStep.tsx` | ~35 |
| ContentTypeStep | `.../steps/ContentTypeStep.tsx` | ~40 |
| MediaCaptureStep | `.../steps/MediaCaptureStep.tsx` | ~45 |
| ContentCreationStep | `.../steps/ContentCreationStep.tsx` | ~30 |
| PreviewSaveStep | `.../steps/PreviewSaveStep.tsx` | ~50 |
| SessionSummaryStep | `.../steps/SessionSummaryStep.tsx` | ~40 |
| NextActionStep | `.../steps/NextActionStep.tsx` | ~25 |

**Shared Components:**
| Component | File | Est. Strings |
|-----------|------|--------------|
| WorkflowHeader | `.../shared/WorkflowHeader.tsx` | ~10 |
| ConfirmExitDialog | `.../shared/ConfirmExitDialog.tsx` | ~15 |
| RemoveItemDialog | `.../shared/RemoveItemDialog.tsx` | ~10 |
| EmptySessionDialog | `.../shared/EmptySessionDialog.tsx` | ~10 |
| PrintOptionsPanel | `.../shared/PrintOptionsPanel.tsx` | ~30 |
| SessionRecoveryBanner | `.../shared/SessionRecoveryBanner.tsx` | ~15 |
| ItemNameEditor | `.../shared/ItemNameEditor.tsx` | ~8 |
| TagsEditor | `.../shared/TagsEditor.tsx` | ~12 |
| ContentPieceCard | `.../shared/ContentPieceCard.tsx` | ~10 |
| QRGenerationProgress | `.../shared/QRGenerationProgress.tsx` | ~12 |
| RoomCard | `.../shared/RoomCard.tsx` | ~5 |
| ItemTypeCard | `.../shared/ItemTypeCard.tsx` | ~5 |
| NetworkErrorIndicator | `.../shared/NetworkErrorIndicator.tsx` | ~8 |
| CameraPermissionFallback | `.../shared/CameraPermissionFallback.tsx` | ~12 |

**Constants with Labels:**
| File | Purpose | Est. Strings |
|------|---------|--------------|
| `utils/constants.ts` | ROOM_LABELS, ITEM_TYPE_LABELS, PURPOSE_LABELS, etc. | ~50 |
| `utils/accessibility.ts` | Screen reader announcements | ~15 |

---

## 3. Namespace Structure Design

The `workflow` namespace will be organized into logical subsections matching component organization and workflow flow:

```json
{
  "workflow": {
    "header": {
      // WorkflowHeader component strings
    },
    "steps": {
      "roomSelection": { /* Step 1 */ },
      "itemType": { /* Step 2 */ },
      "specificItem": { /* Step 3 */ },
      "purpose": { /* Step 4 */ },
      "contentType": { /* Step 5 */ },
      "mediaCapture": { /* Step 6 */ },
      "contentCreation": { /* Step 7 */ },
      "preview": { /* Step 8 */ },
      "nextAction": { /* Post-workflow */ },
      "sessionSummary": { /* Post-workflow */ }
    },
    "rooms": {
      // Room type labels (from ROOM_LABELS)
    },
    "itemTypes": {
      // Item type labels and descriptions (from ITEM_TYPE_LABELS, ITEM_TYPE_DESCRIPTIONS)
    },
    "purposes": {
      // Purpose labels and descriptions (from PURPOSE_LABELS, PURPOSE_DESCRIPTIONS)
    },
    "contentTypes": {
      // Content type labels and descriptions
    },
    "tags": {
      // Tag labels (from TAG_LABELS)
    },
    "forms": {
      // Form field labels, placeholders, hints
    },
    "validation": {
      // Workflow-specific validation messages
    },
    "dialogs": {
      "confirmExit": { /* Exit confirmation */ },
      "removeItem": { /* Item removal */ },
      "emptySession": { /* Empty session warning */ },
      "removeLastContent": { /* Last content removal */ }
    },
    "buttons": {
      // Navigation and action button labels
    },
    "messages": {
      "success": { /* Success messages */ },
      "error": { /* Error messages */ },
      "status": { /* Status updates */ }
    },
    "emptyStates": {
      // Empty state messages
    },
    "printOptions": {
      // Print configuration labels
    },
    "recovery": {
      // Session recovery banner strings
    },
    "accessibility": {
      // Screen reader announcements
    },
    "progress": {
      // Progress indicators
    }
  }
}
```

---

## 4. Implementation Tasks

### Task 4.1: Create Workflow Namespace Structure in en.json

Add the complete `workflow` namespace to `/messages/en.json` with all subsections and English string values.

**Detailed String Inventory:**

#### 4.1.1 Header Subsection
```json
"header": {
  "step": "Step {current} of {total}",
  "exit": "Exit",
  "back": "Back",
  "skipToContent": "Skip to main content"
}
```

#### 4.1.2 Steps Subsection
```json
"steps": {
  "roomSelection": {
    "title": "Select a Room",
    "subtitle": "Choose where this item is located in your property",
    "searchPlaceholder": "Search rooms...",
    "ariaLabel": "Select a room for your item",
    "helpText": "Use arrow keys to navigate between rooms. Press Enter or Space to select."
  },
  "itemType": {
    "title": "What type of item?",
    "subtitle": "Select the category that best describes your item",
    "ariaLabel": "Select the type of item"
  },
  "specificItem": {
    "title": "Name your item",
    "subtitle": "Enter a specific name for this item",
    "searchPlaceholder": "Search or type item name...",
    "suggestions": "Suggestions",
    "customName": "Use custom name"
  },
  "purpose": {
    "title": "What's the purpose?",
    "subtitle": "Select the main purpose for this content",
    "ariaLabel": "Select the purpose of this content"
  },
  "contentType": {
    "title": "How do you want to add content?",
    "subtitle": "Choose how to provide instructions"
  },
  "mediaCapture": {
    "title": "Capture Content",
    "takePhoto": "Take Photo",
    "recordVideo": "Record Video",
    "retake": "Retake",
    "useThis": "Use This",
    "cameraPermission": "Camera access is required",
    "cameraPermissionDescription": "Please allow camera access to capture photos or videos."
  },
  "contentCreation": {
    "title": "Add Content",
    "uploadingFile": "Uploading file...",
    "processingContent": "Processing content..."
  },
  "preview": {
    "title": "Preview & Save",
    "itemDetails": "Item Details",
    "content": "Content",
    "contentCount": "{count} content pieces",
    "maximumReached": "Maximum reached",
    "addMore": "Add More",
    "saving": "Saving...",
    "saveItem": "Save Item"
  },
  "nextAction": {
    "title": "What would you like to do next?",
    "subtitle": "You've just saved \"{itemName}\"",
    "editInstructions": "Edit Instructions",
    "addNewInstructions": "Add More Instructions",
    "createNewItem": "Create New Item",
    "done": "Done"
  },
  "sessionSummary": {
    "title": "Session Complete!",
    "subtitle": "You created {count, plural, =0 {no items} one {# item} other {# items}}",
    "newItems": "New Items",
    "existingItems": "Existing Items",
    "loadingExisting": "Loading existing items...",
    "noExistingItems": "No existing items",
    "printQRCodes": "Print QR Codes",
    "finishWithoutPrint": "Finish Without Printing"
  }
}
```

#### 4.1.3 Rooms Subsection
```json
"rooms": {
  "kitchen": "Kitchen",
  "laundry": "Laundry Room",
  "bedroom": "Bedroom",
  "bathroom": "Bathroom",
  "livingRoom": "Living Room",
  "garage": "Garage",
  "outdoor": "Outdoor/Patio",
  "general": "General/Whole Property",
  "other": "Other",
  "customInput": {
    "label": "Enter room name",
    "placeholder": "e.g., Home Office, Wine Cellar, Mudroom",
    "hint": "Maximum 50 characters"
  }
}
```

#### 4.1.4 Item Types Subsection
```json
"itemTypes": {
  "appliance": {
    "label": "Appliance",
    "description": "Washer, dryer, stove, refrigerator, etc."
  },
  "roomItem": {
    "label": "Room Item",
    "description": "Pantry, cabinets, closet, sink, etc."
  },
  "generalInfo": {
    "label": "General Info",
    "description": "Trash schedule, WiFi info, house rules, etc."
  }
}
```

#### 4.1.5 Purposes Subsection
```json
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
    "description": "Common issues and fixes"
  },
  "safetyInfo": {
    "label": "Safety Information",
    "description": "Safety warnings and precautions"
  },
  "maintenance": {
    "label": "Maintenance",
    "description": "Regular maintenance tasks"
  },
  "features": {
    "label": "Features & Tips",
    "description": "Special features and tips"
  },
  "other": {
    "label": "Other",
    "description": "General information"
  }
}
```

#### 4.1.6 Content Types Subsection
```json
"contentTypes": {
  "recordVideo": {
    "label": "Record Video",
    "subtitle": null
  },
  "takePhoto": {
    "label": "Take Photo",
    "subtitle": null
  },
  "writeText": {
    "label": "Write Text",
    "subtitle": null
  },
  "uploadFile": {
    "label": "Upload File",
    "subtitle": "Video, Image, PDF, Text"
  },
  "addLink": {
    "label": "Add Link",
    "subtitle": null
  },
  "labels": {
    "video": "Video",
    "photo": "Photo",
    "pdf": "PDF Document",
    "text": "Text Instructions",
    "url": "Link/URL"
  }
}
```

#### 4.1.7 Tags Subsection
```json
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
  "info": "Info",
  "editor": {
    "label": "Tags",
    "placeholder": "Add a tag...",
    "addTag": "Add tag",
    "removeTag": "Remove {tag}",
    "maxTagsReached": "Maximum {max} tags allowed"
  }
}
```

#### 4.1.8 Forms Subsection
```json
"forms": {
  "itemName": {
    "label": "Item Name",
    "placeholder": "Enter item name",
    "ariaLabel": "Item name input",
    "characterCount": "{count}/{max} characters"
  },
  "itemDescription": {
    "label": "Item Description",
    "placeholder": "Enter a brief description of this item (optional)",
    "hint": "Optional"
  },
  "articleTitle": {
    "label": "Guide/Article Title",
    "placeholder": "Enter guide/article title"
  },
  "room": {
    "label": "Room",
    "placeholder": "Select a room"
  },
  "itemType": {
    "label": "Item Type",
    "placeholder": "Select item type"
  },
  "url": {
    "label": "URL",
    "placeholder": "Enter URL (https://...)",
    "hint": "Enter a valid URL starting with http:// or https://"
  },
  "text": {
    "label": "Text Content",
    "placeholder": "Enter your instructions here..."
  }
}
```

#### 4.1.9 Validation Subsection
```json
"validation": {
  "itemNameRequired": "Item name is required",
  "itemNameTooShort": "Item name must be at least {min} characters",
  "itemNameTooLong": "Item name must be less than {max} characters",
  "contentRequired": "At least one content piece is required",
  "roomRequired": "Please select a room",
  "itemTypeRequired": "Please select an item type",
  "purposeRequired": "Please select a purpose",
  "urlInvalid": "Please enter a valid URL",
  "fileTooLarge": "File size exceeds {max}MB limit",
  "invalidFileType": "Invalid file type. Allowed: {types}",
  "duplicateName": "An item with this name already exists in this session"
}
```

#### 4.1.10 Dialogs Subsection
```json
"dialogs": {
  "confirmExit": {
    "title": "Exit Workflow?",
    "messageUnsavedAndItems": "You have unsaved changes and {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
    "messageUnsaved": "You have unsaved changes. Are you sure you want to exit?",
    "messageItems": "You have created {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
    "messageDefault": "Are you sure you want to exit the workflow?",
    "cancel": "Cancel",
    "exit": "Exit Workflow"
  },
  "removeItem": {
    "title": "Remove Item?",
    "message": "Are you sure you want to remove \"{itemName}\" from the session?"
  },
  "emptySession": {
    "title": "No Items Added",
    "message": "You haven't added any items yet. Add at least one item to continue."
  },
  "removeLastContent": {
    "title": "Remove Last Content?",
    "message": "This is the only piece of content. Removing it will leave this item empty. Are you sure you want to remove it?",
    "keep": "Keep",
    "remove": "Remove"
  }
}
```

#### 4.1.11 Buttons Subsection
```json
"buttons": {
  "continue": "Continue",
  "back": "Back",
  "next": "Next",
  "save": "Save",
  "saveItem": "Save Item",
  "cancel": "Cancel",
  "done": "Done",
  "finish": "Finish",
  "addMore": "Add More",
  "addContent": "Add Content",
  "retake": "Retake",
  "useThis": "Use This",
  "print": "Print",
  "generatePDF": "Generate PDF",
  "skip": "Skip",
  "goBack": "Go Back",
  "createAnother": "Create Another Item",
  "viewItems": "View Items",
  "dismiss": "Dismiss"
}
```

#### 4.1.12 Messages Subsection
```json
"messages": {
  "success": {
    "itemSaved": "Item Saved!",
    "itemSavedDescription": "Your item has been saved and is ready for your guests!",
    "qrCodeGenerated": "QR code generated successfully",
    "sessionComplete": "Session complete"
  },
  "error": {
    "saveFailed": "Failed to save item",
    "uploadFailed": "File upload failed. Please try again.",
    "cameraError": "Camera error. Please try again.",
    "networkError": "Network error. Please check your connection.",
    "generic": "Something went wrong. Please try again."
  },
  "status": {
    "loading": "Loading...",
    "saving": "Saving...",
    "uploading": "Uploading...",
    "processing": "Processing...",
    "generatingQR": "Generating QR code...",
    "preparingPrint": "Preparing for print..."
  }
}
```

#### 4.1.13 Empty States Subsection
```json
"emptyStates": {
  "noContent": {
    "title": "No content added yet",
    "action": "Add Content"
  },
  "noItems": {
    "title": "No items in session",
    "description": "Start by selecting a room to create your first item."
  },
  "noItemData": {
    "title": "No item data available",
    "description": "Please start a new item."
  }
}
```

#### 4.1.14 Print Options Subsection
```json
"printOptions": {
  "title": "Print Options",
  "selectItems": "Select items to print",
  "allItems": "All Items",
  "newOnly": "New Items Only",
  "selected": "Selected Items",
  "generatePDF": "Generate PDF",
  "printDirect": "Print Directly",
  "skipPrint": "Skip Printing",
  "processing": "Processing...",
  "qrCodesGenerated": "QR codes generated",
  "pdfReady": "PDF ready for download"
}
```

#### 4.1.15 Recovery Subsection
```json
"recovery": {
  "title": "Resume Previous Session?",
  "message": "We found {count, plural, one {# item} other {# items}} from a previous session.",
  "contentWarning": "{count, plural, one {# content piece needs} other {# content pieces need}} to be re-uploaded.",
  "continue": "Continue",
  "startFresh": "Start Fresh",
  "dismiss": "Dismiss"
}
```

#### 4.1.16 Accessibility Subsection
```json
"accessibility": {
  "stepAnnouncement": "Step {current} of {total}: {stepName}",
  "itemSelected": "{item} selected",
  "contentAdded": "Content added",
  "contentRemoved": "Content removed",
  "dragStart": "Picked up {type} content. Current position: {position} of {total}. Use arrow keys to move.",
  "dragOver": "Over position {position}",
  "dragEnd": "Dropped {type} content. New position: {position} of {total}",
  "dragCancel": "Drag cancelled. Content returned to original position.",
  "positionUnchanged": "Position unchanged."
}
```

#### 4.1.17 Progress Subsection
```json
"progress": {
  "step": "Step {current} of {total}",
  "percentage": "{percent}% complete",
  "itemsCreated": "{count, plural, =0 {No items} one {# item} other {# items}} created"
}
```

### Task 4.2: Copy Structure to Other Language Files

Copy the identical key structure from `en.json` to:
- `/messages/de.json` (German)
- `/messages/es.json` (Spanish)
- `/messages/fr.json` (French)
- `/messages/it.json` (Italian)
- `/messages/nl.json` (Dutch)

Initially, these files will contain English placeholders. Actual translations will be generated in a subsequent task (Task 2C.13).

### Task 4.3: Verify Namespace Consistency

Create a verification script or manual check to ensure:
1. All six files have identical key structures
2. No missing keys in any file
3. Pluralization patterns are correct (ICU format)
4. Variable interpolation placeholders are consistent

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Modify

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/messages/en.json` | MODIFY | Add `workflow` namespace with English strings |
| `/messages/de.json` | MODIFY | Add `workflow` namespace with English placeholders |
| `/messages/es.json` | MODIFY | Add `workflow` namespace with English placeholders |
| `/messages/fr.json` | MODIFY | Add `workflow` namespace with English placeholders |
| `/messages/it.json` | MODIFY | Add `workflow` namespace with English placeholders |
| `/messages/nl.json` | MODIFY | Add `workflow` namespace with English placeholders |

### 5.2 Files Read-Only (Reference)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Understand main orchestrator strings |
| `/src/components/ItemCreationWorkflow/components/steps/*.tsx` | Extract step-specific strings |
| `/src/components/ItemCreationWorkflow/components/shared/*.tsx` | Extract shared component strings |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Reference label constants |
| `/src/components/ItemCreationWorkflow/utils/accessibility.ts` | Reference accessibility strings |

### 5.3 Functions/Sections to Add

| File | Section | Description |
|------|---------|-------------|
| `en.json` | `workflow` | New top-level namespace object |
| `en.json` | `workflow.header` | Header component strings |
| `en.json` | `workflow.steps` | All step component strings |
| `en.json` | `workflow.rooms` | Room type labels |
| `en.json` | `workflow.itemTypes` | Item type labels and descriptions |
| `en.json` | `workflow.purposes` | Purpose labels and descriptions |
| `en.json` | `workflow.contentTypes` | Content type labels |
| `en.json` | `workflow.tags` | Tag labels and editor strings |
| `en.json` | `workflow.forms` | Form field labels and placeholders |
| `en.json` | `workflow.validation` | Validation error messages |
| `en.json` | `workflow.dialogs` | Dialog strings |
| `en.json` | `workflow.buttons` | Button labels |
| `en.json` | `workflow.messages` | Success/error/status messages |
| `en.json` | `workflow.emptyStates` | Empty state messages |
| `en.json` | `workflow.printOptions` | Print configuration strings |
| `en.json` | `workflow.recovery` | Session recovery strings |
| `en.json` | `workflow.accessibility` | Screen reader announcements |
| `en.json` | `workflow.progress` | Progress indicator strings |

---

## 6. Acceptance Criteria Verification

| Criterion | Implementation Task |
|-----------|---------------------|
| All six translation files contain workflow namespace | Task 4.1, 4.2 |
| Namespace includes steps subsection | Task 4.1.2 |
| Namespace includes progress subsection | Task 4.1.17 |
| Namespace includes rooms subsection | Task 4.1.3 |
| Namespace includes itemTypes subsection | Task 4.1.4 |
| Namespace includes purposes subsection | Task 4.1.5 |
| Namespace includes contentTypes subsection | Task 4.1.6 |
| Namespace includes forms subsection | Task 4.1.8 |
| Namespace includes validation subsection | Task 4.1.9 |
| Namespace includes dialogs subsection | Task 4.1.10 |
| Namespace includes buttons subsection | Task 4.1.11 |
| Namespace includes messages subsection | Task 4.1.12 |
| Namespace includes sessionSummary in steps | Task 4.1.2 (sessionSummary) |
| Namespace includes emptyStates subsection | Task 4.1.13 |
| Namespace includes printOptions subsection | Task 4.1.14 |
| Logical grouping matches component organization | All tasks |
| Consistent key naming patterns | All tasks |
| English translation file has actual values | Task 4.1 |
| Non-English files have matching placeholders | Task 4.2 |
| Identical key structures across files | Task 4.3 |
| Dynamic content insertion supported | Pluralization patterns in tasks |
| Namespace accommodates future expansion | Designed with extensibility |

---

## 7. Dependencies and Blockers

### 7.1 Upstream Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation | ✅ Complete | next-intl installed, i18n config ready |
| Translation files exist | ✅ Complete | All 6 files present |

### 7.2 Downstream Dependents

| Task | Dependency |
|------|------------|
| Task 2C.2: Update main ItemCreationWorkflow | Requires workflow namespace |
| Task 2C.3: Update RoomSelectionStep | Requires workflow.steps.roomSelection, workflow.rooms |
| Task 2C.4: Update ItemTypeStep | Requires workflow.steps.itemType, workflow.itemTypes |
| Task 2C.5: Update SpecificItemStep | Requires workflow.steps.specificItem |
| Task 2C.6: Update PurposeStep | Requires workflow.steps.purpose, workflow.purposes |
| Task 2C.7: Update ContentTypeStep | Requires workflow.steps.contentType, workflow.contentTypes |
| Task 2C.8: Update MediaCaptureStep | Requires workflow.steps.mediaCapture |
| Task 2C.9: Update PreviewSaveStep | Requires workflow.steps.preview, workflow.forms |
| Task 2C.10: Update SessionSummaryStep | Requires workflow.steps.sessionSummary |
| Task 2C.11: Update shared components | Requires workflow.dialogs, workflow.buttons, etc. |
| Task 2C.12: Update dialog components | Requires workflow.dialogs |
| Task 2C.13: Generate non-English translations | Requires complete en.json namespace |

---

## 8. Testing Strategy

### 8.1 Structural Verification

1. **JSON Validity**: All translation files must be valid JSON
2. **Key Consistency**: Run comparison script to verify identical keys across all 6 files
3. **ICU Format Validation**: Verify pluralization patterns are valid ICU MessageFormat

### 8.2 Manual Verification Checklist

- [ ] `en.json` contains `workflow` namespace with all subsections
- [ ] All subsection keys match the design specification
- [ ] Pluralization patterns use correct ICU format (`{count, plural, =0 {...} one {...} other {...}}`)
- [ ] Variable placeholders use consistent naming (`{itemName}`, `{count}`, etc.)
- [ ] All 6 language files have identical key structures
- [ ] No duplicate keys within the namespace

### 8.3 Runtime Verification (Post-Implementation)

After component updates (Tasks 2C.2-2C.12), verify:
- [ ] All workflow components render without missing translation warnings
- [ ] Pluralization displays correctly for various counts
- [ ] Variable interpolation works correctly

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing keys discovered later | Medium | Low | Design comprehensive namespace upfront; add keys as discovered |
| Key naming inconsistencies | Low | Medium | Follow established patterns from auth/dashboard namespaces |
| Invalid ICU format | Low | High | Validate syntax before committing; use linting tools |
| Large JSON file merge conflicts | Medium | Low | Coordinate with other Epic 2 tasks; commit atomically |

---

## 10. Effort Estimate

| Task | Estimate |
|------|----------|
| Design namespace structure | 30 min |
| Create en.json workflow namespace | 2 hours |
| Copy structure to 5 other language files | 30 min |
| Verification and testing | 30 min |
| **Total** | **~3.5 hours** |

---

## 11. References

- [Implementation Plan: Epic 2 Static UI Translation](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Epic 1 Foundation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [ItemCreationWorkflow Component](/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx)
- [Workflow Constants](/src/components/ItemCreationWorkflow/utils/constants.ts)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C Task 2C.1*
